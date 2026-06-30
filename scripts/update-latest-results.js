const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_FILE = path.join(PROJECT_ROOT, "latest-results.js");

const CONFIG = {
  timezone: "America/New_York",
  sourceAttempts: Number(process.env.RESULT_SOURCE_ATTEMPTS || 3),
  sourceRetryDelayMs: Number(process.env.RESULT_SOURCE_RETRY_DELAY_MS || 15000),
  fetchTimeoutMs: Number(process.env.RESULT_FETCH_TIMEOUT_MS || 30000),
  updateRounds: Number(process.env.RESULT_UPDATE_ROUNDS || 6),
  updateRoundDelayMs: Number(process.env.RESULT_UPDATE_ROUND_DELAY_MS || 300000),
  resultDelayBufferMinutes: Number(process.env.RESULT_DELAY_BUFFER_MINUTES || 30)
};

const SOURCES = {
  powerball: [
    "https://www.lotteryusa.com/georgia/powerball/",
    "https://www.lotteryusa.com/powerball/"
  ],
  mega: [
    "https://www.lotteryusa.com/georgia/mega-millions/",
    "https://www.lotteryusa.com/mega-millions/"
  ],
  georgiaFiveMidday: [
    "https://www.lotteryusa.com/georgia/midday-georgia-five/"
  ],
  georgiaFiveEvening: [
    "https://www.lotteryusa.com/georgia/georgia-five/"
  ],
  fantasyFive: [
    "https://www.lotteryusa.com/georgia/fantasy-5/"
  ]
};

const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const DRAW_DAYS = {
  powerball: new Set(["Monday", "Wednesday", "Saturday"]),
  mega: new Set(["Tuesday", "Friday"])
};

const DEFAULT_RESULTS = {
  powerball: {},
  mega: {},
  pick5: {},
  fantasy5: {}
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function toNumber(value) {
  return Number.parseInt(String(value), 10);
}

function compareDateKeys(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return String(a).localeCompare(String(b));
}

function addDaysToKey(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  return [
    date.getUTCFullYear(),
    padTwo(date.getUTCMonth() + 1),
    padTwo(date.getUTCDate())
  ].join("-");
}

function getWeekdayFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return WEEKDAYS[date.getUTCDay()];
}

function getEasternParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.timezone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(values.hour === "24" ? "0" : values.hour);

  return {
    weekday: values.weekday,
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour,
    minute: Number(values.minute),
    second: Number(values.second),
    dateKey: `${values.year}-${values.month}-${values.day}`,
    minuteOfDay: hour * 60 + Number(values.minute)
  };
}

function todayEasternDisplayDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: CONFIG.timezone
  }).format(new Date());
}

function expectedDailyResultDateKey(drawHour, drawMinute, nowParts = getEasternParts()) {
  const drawMinuteOfDay = drawHour * 60 + drawMinute;
  const readyMinuteOfDay = drawMinuteOfDay + CONFIG.resultDelayBufferMinutes;

  if (readyMinuteOfDay < 1440) {
    return nowParts.minuteOfDay >= readyMinuteOfDay
      ? nowParts.dateKey
      : addDaysToKey(nowParts.dateKey, -1);
  }

  const afterMidnightReadyMinute = readyMinuteOfDay - 1440;

  if (nowParts.minuteOfDay >= afterMidnightReadyMinute) {
    return addDaysToKey(nowParts.dateKey, -1);
  }

  return addDaysToKey(nowParts.dateKey, -2);
}

function expectedWeeklyResultDateKey(drawDays, drawHour, drawMinute, nowParts = getEasternParts()) {
  const readyMinuteOfDay = drawHour * 60 + drawMinute + CONFIG.resultDelayBufferMinutes;

  for (let daysBack = 0; daysBack <= 7; daysBack += 1) {
    const candidateKey = addDaysToKey(nowParts.dateKey, -daysBack);
    const candidateWeekday = getWeekdayFromDateKey(candidateKey);

    if (!drawDays.has(candidateWeekday)) {
      continue;
    }

    if (daysBack === 0 && nowParts.minuteOfDay < readyMinuteOfDay) {
      continue;
    }

    return candidateKey;
  }

  return null;
}

function getExpectedResultKeys() {
  const nowParts = getEasternParts();

  return {
    powerball: expectedWeeklyResultDateKey(DRAW_DAYS.powerball, 22, 59, nowParts),
    mega: expectedWeeklyResultDateKey(DRAW_DAYS.mega, 23, 0, nowParts),
    pick5Midday: expectedDailyResultDateKey(12, 29, nowParts),
    pick5Evening: expectedDailyResultDateKey(18, 59, nowParts),
    fantasy5: expectedDailyResultDateKey(23, 34, nowParts)
  };
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, "-")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"');
}

function htmlToLines(html) {
  const text = decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|hr)\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|main|h1|h2|h3|h4|h5|h6|li|ul|ol|tr|td|th|table|span)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[•*]/g, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return text;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isDateLine(line) {
  return /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s+/i.test(line)
    && /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)\b/i.test(line)
    && /\b\d{4}\b/.test(line);
}

function dateKeyFromText(value) {
  const text = String(value || "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (slashMatch) {
    return `${slashMatch[3]}-${padTwo(slashMatch[1])}-${padTwo(slashMatch[2])}`;
  }

  const longMatch = text.match(
    /\b(?:Sun|Sunday|Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday)?\.?\s*(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)\s+(\d{1,2})\s+(\d{4})\b/i
  );

  if (!longMatch) {
    throw new Error(`Unable to read date from: ${value}`);
  }

  const month = MONTHS[longMatch[1].toLowerCase()];
  if (!month) {
    throw new Error(`Unable to read month from: ${value}`);
  }

  return `${longMatch[3]}-${padTwo(month)}-${padTwo(longMatch[2])}`;
}

function formatDateFromKey(dateKey, includeWeekday = true) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    weekday: includeWeekday ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatNumbers(numbers, useLeadingZero = true) {
  return numbers
    .map((number) => (useLeadingZero ? padTwo(number) : String(toNumber(number))))
    .join(" - ");
}

function validateNumberRange(gameName, numbers, min, max, expectedCount) {
  if (numbers.length !== expectedCount) {
    throw new Error(`${gameName} expected ${expectedCount} numbers but found ${numbers.length}`);
  }

  numbers.forEach((number) => {
    const value = toNumber(number);
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${gameName} has invalid number: ${number}`);
    }
  });
}

function extractLatestBlock(lines) {
  const latestIndex = lines.findIndex((line) => normalizeText(line) === "latest numbers");
  if (latestIndex === -1) {
    throw new Error("Latest numbers section was not found");
  }

  let dateIndex = -1;
  for (let i = latestIndex + 1; i < Math.min(lines.length, latestIndex + 80); i += 1) {
    if (isDateLine(lines[i])) {
      dateIndex = i;
      break;
    }
  }

  if (dateIndex === -1) {
    throw new Error("Latest draw date was not found");
  }

  const block = [];
  for (let i = dateIndex + 1; i < Math.min(lines.length, dateIndex + 120); i += 1) {
    if (isDateLine(lines[i])) {
      break;
    }
    if (/see more numbers/i.test(lines[i])) {
      break;
    }
    block.push(lines[i]);
  }

  return {
    dateKey: dateKeyFromText(lines[dateIndex]),
    dateLine: lines[dateIndex],
    block
  };
}

function parseLotteryUsaDailyGame(html, expectedCount) {
  const latest = extractLatestBlock(htmlToLines(html));
  const numbers = [];

  for (const line of latest.block) {
    if (/^(top prize|est\. jackpot|estimated jackpot|jackpot|cash value|prize|prizes)$/i.test(line)) {
      continue;
    }

    if (/^\$/.test(line)) {
      continue;
    }

    if (/^\d{1,2}$/.test(line)) {
      numbers.push(line);
    }

    if (numbers.length === expectedCount) {
      break;
    }
  }

  if (numbers.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} numbers but found ${numbers.length}`);
  }

  return {
    dateKey: latest.dateKey,
    numbers
  };
}

function parseLotteryUsaBallGame(html, expectedMainCount, specialLabelRegex) {
  const latest = extractLatestBlock(htmlToLines(html));
  const mainNumbers = [];
  let extraNumber = null;
  let multiplier = null;

  for (const line of latest.block) {
    const specialMatch = line.match(specialLabelRegex);
    if (specialMatch) {
      extraNumber = specialMatch[1];
      continue;
    }

    const powerPlayMatch = line.match(/Power\s*Play\s*:\s*(\d+)/i);
    if (powerPlayMatch) {
      multiplier = powerPlayMatch[1];
      continue;
    }

    if (/^(est\. jackpot|estimated jackpot|jackpot|cash value|prize|prizes)$/i.test(line)) {
      continue;
    }

    if (/^\$/.test(line)) {
      continue;
    }

    if (/^\d{1,2}$/.test(line) && mainNumbers.length < expectedMainCount) {
      mainNumbers.push(line);
    }
  }

  if (mainNumbers.length !== expectedMainCount) {
    throw new Error(`Expected ${expectedMainCount} main numbers but found ${mainNumbers.length}`);
  }

  if (!extraNumber) {
    throw new Error("Special ball number was not found");
  }

  return {
    dateKey: latest.dateKey,
    mainNumbers,
    extraNumber,
    multiplier
  };
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LotteryNumberGeneratorBot/2.0 (+https://lottery-number-generator-6ey.pages.dev/)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSource(sourceName, urls) {
  const errors = [];

  for (const url of urls) {
    for (let attempt = 1; attempt <= CONFIG.sourceAttempts; attempt += 1) {
      try {
        const html = await fetchWithTimeout(url);
        if (!html || html.length < 500) {
          throw new Error("Source returned too little content");
        }
        console.log(`${sourceName}: fetched from ${url}`);
        return { html, url };
      } catch (error) {
        errors.push(`${url} attempt ${attempt}: ${error.message}`);
        console.log(`${sourceName}: ${url} attempt ${attempt} failed: ${error.message}`);
        if (attempt < CONFIG.sourceAttempts) {
          await sleep(CONFIG.sourceRetryDelayMs);
        }
      }
    }
  }

  throw new Error(errors.join(" | "));
}

function readCurrentLatestResults() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return { ...DEFAULT_RESULTS };
  }

  try {
    const fileContent = fs.readFileSync(OUTPUT_FILE, "utf8");
    const sandbox = {};
    vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox, {
      timeout: 5000
    });
    return sandbox.result || { ...DEFAULT_RESULTS };
  } catch (error) {
    console.log(`Existing latest-results.js could not be read: ${error.message}`);
    return { ...DEFAULT_RESULTS };
  }
}

function existingDateKey(game) {
  if (!game) {
    return null;
  }

  if (game.drawDateKey) {
    return game.drawDateKey;
  }

  if (game.meta && game.meta.drawDateKey) {
    return game.meta.drawDateKey;
  }

  if (game.drawDate) {
    try {
      return dateKeyFromText(game.drawDate);
    } catch (error) {
      return null;
    }
  }

  return null;
}

function existingPick5DateKeys(game) {
  if (!game) {
    return { middayDateKey: null, eveningDateKey: null };
  }

  const fromMeta = game.meta || {};

  return {
    middayDateKey: game.middayDateKey || fromMeta.middayDateKey || readDateAfterLabel(game.drawDate, "Midday"),
    eveningDateKey: game.eveningDateKey || fromMeta.eveningDateKey || readDateAfterLabel(game.drawDate, "Evening")
  };
}

function readDateAfterLabel(text, label) {
  if (!text) {
    return null;
  }

  const pattern = new RegExp(`${label}:\\s*([^;|]+)`, "i");
  const match = String(text).match(pattern);
  if (!match) {
    return null;
  }

  try {
    return dateKeyFromText(match[1]);
  } catch (error) {
    return null;
  }
}

function chooseNewerSingleResult(gameKey, currentResults, candidate) {
  const current = currentResults[gameKey] || {};
  const currentDateKey = existingDateKey(current);

  if (compareDateKeys(candidate.drawDateKey, currentDateKey) < 0) {
    return {
      result: current,
      changed: false,
      warning: `${candidate.gameName}: fetched result ${candidate.drawDateKey} is older than current ${currentDateKey}`
    };
  }

  const changed = JSON.stringify(current) !== JSON.stringify(candidate);
  return { result: candidate, changed, warning: null };
}

function chooseNewerPick5Result(currentResults, candidate) {
  const current = currentResults.pick5 || {};
  const currentKeys = existingPick5DateKeys(current);

  const middayOlder = compareDateKeys(candidate.middayDateKey, currentKeys.middayDateKey) < 0;
  const eveningOlder = compareDateKeys(candidate.eveningDateKey, currentKeys.eveningDateKey) < 0;

  if (middayOlder || eveningOlder) {
    return {
      result: current,
      changed: false,
      warning: `Pick 5 / Georgia Five: fetched dates are older than current dates`
    };
  }

  const changed = JSON.stringify(current) !== JSON.stringify(candidate);
  return { result: candidate, changed, warning: null };
}

function buildPowerball(parsed, lastUpdated, sourceUrl) {
  validateNumberRange("Powerball main numbers", parsed.mainNumbers, 1, 69, 5);
  validateNumberRange("Powerball number", [parsed.extraNumber], 1, 26, 1);

  return {
    gameName: "Powerball",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(parsed.dateKey),
    drawDateKey: parsed.dateKey,
    winningNumbers: formatNumbers(parsed.mainNumbers, true),
    extraNumberLabel: "Powerball Number",
    extraNumber: padTwo(parsed.extraNumber),
    multiplierLabel: parsed.multiplier ? "Power Play" : undefined,
    multiplier: parsed.multiplier ? `${parsed.multiplier}x` : undefined,
    lastUpdated,
    meta: {
      source: "LotteryUSA",
      sourceUrl,
      drawDateKey: parsed.dateKey,
      updatedAt: new Date().toISOString()
    }
  };
}

function buildMega(parsed, lastUpdated, sourceUrl) {
  validateNumberRange("Mega Millions main numbers", parsed.mainNumbers, 1, 70, 5);
  validateNumberRange("Mega Ball number", [parsed.extraNumber], 1, 24, 1);

  return {
    gameName: "Mega Millions",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(parsed.dateKey),
    drawDateKey: parsed.dateKey,
    winningNumbers: formatNumbers(parsed.mainNumbers, true),
    extraNumberLabel: "Mega Ball Number",
    extraNumber: padTwo(parsed.extraNumber),
    lastUpdated,
    meta: {
      source: "LotteryUSA",
      sourceUrl,
      drawDateKey: parsed.dateKey,
      updatedAt: new Date().toISOString()
    }
  };
}

function buildPick5(midday, evening, lastUpdated, sourceUrls) {
  validateNumberRange("Georgia Five Midday numbers", midday.numbers, 0, 9, 5);
  validateNumberRange("Georgia Five Evening numbers", evening.numbers, 0, 9, 5);

  const sameDate = midday.dateKey === evening.dateKey;

  return {
    gameName: "Pick 5 / Georgia Five",
    status: "Latest result reviewed daily",
    drawDate: sameDate
      ? formatDateFromKey(midday.dateKey)
      : `Midday: ${formatDateFromKey(midday.dateKey)}; Evening: ${formatDateFromKey(evening.dateKey)}`,
    middayDateKey: midday.dateKey,
    eveningDateKey: evening.dateKey,
    winningNumbers: sameDate
      ? `Midday: ${formatNumbers(midday.numbers, false)} | Evening: ${formatNumbers(evening.numbers, false)}`
      : `Midday (${formatDateFromKey(midday.dateKey, false)}): ${formatNumbers(midday.numbers, false)} | Evening (${formatDateFromKey(evening.dateKey, false)}): ${formatNumbers(evening.numbers, false)}`,
    drawType: "Midday and Evening",
    lastUpdated,
    meta: {
      source: "LotteryUSA",
      middaySourceUrl: sourceUrls.midday,
      eveningSourceUrl: sourceUrls.evening,
      middayDateKey: midday.dateKey,
      eveningDateKey: evening.dateKey,
      updatedAt: new Date().toISOString()
    }
  };
}

function buildFantasy5(parsed, lastUpdated, sourceUrl) {
  validateNumberRange("Fantasy 5 numbers", parsed.numbers, 1, 42, 5);

  return {
    gameName: "Fantasy 5 / Georgia Fantasy 5",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(parsed.dateKey),
    drawDateKey: parsed.dateKey,
    winningNumbers: formatNumbers(parsed.numbers, true),
    drawType: "Night draw",
    lastUpdated,
    meta: {
      source: "LotteryUSA",
      sourceUrl,
      drawDateKey: parsed.dateKey,
      updatedAt: new Date().toISOString()
    }
  };
}

function removeUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefined(entryValue)])
    );
  }

  return value;
}

function expectedStatus(name, actualDateKey, expectedDateKey) {
  if (!expectedDateKey) {
    return { ready: true, message: `${name}: no expected date check needed` };
  }

  if (compareDateKeys(actualDateKey, expectedDateKey) >= 0) {
    return { ready: true, message: `${name}: current for expected date ${expectedDateKey}` };
  }

  return {
    ready: false,
    message: `${name}: source has ${actualDateKey}; expected ${expectedDateKey}`
  };
}

async function updatePowerball(currentResults, lastUpdated, expectedKeys) {
  const source = await fetchSource("Powerball", SOURCES.powerball);
  const parsed = parseLotteryUsaBallGame(source.html, 5, /PB\s*:\s*(\d{1,2})/i);
  const candidate = removeUndefined(buildPowerball(parsed, lastUpdated, source.url));
  const selected = chooseNewerSingleResult("powerball", currentResults, candidate);
  const status = expectedStatus("Powerball", candidate.drawDateKey, expectedKeys.powerball);

  return { key: "powerball", ...selected, ready: status.ready, message: status.message };
}

async function updateMega(currentResults, lastUpdated, expectedKeys) {
  const source = await fetchSource("Mega Millions", SOURCES.mega);
  const parsed = parseLotteryUsaBallGame(source.html, 5, /MB\s*:\s*(\d{1,2})/i);
  const candidate = removeUndefined(buildMega(parsed, lastUpdated, source.url));
  const selected = chooseNewerSingleResult("mega", currentResults, candidate);
  const status = expectedStatus("Mega Millions", candidate.drawDateKey, expectedKeys.mega);

  return { key: "mega", ...selected, ready: status.ready, message: status.message };
}

async function updatePick5(currentResults, lastUpdated, expectedKeys) {
  const [middaySource, eveningSource] = await Promise.all([
    fetchSource("Georgia Five Midday", SOURCES.georgiaFiveMidday),
    fetchSource("Georgia Five Evening", SOURCES.georgiaFiveEvening)
  ]);

  const midday = parseLotteryUsaDailyGame(middaySource.html, 5);
  const evening = parseLotteryUsaDailyGame(eveningSource.html, 5);
  const candidate = removeUndefined(buildPick5(midday, evening, lastUpdated, {
    midday: middaySource.url,
    evening: eveningSource.url
  }));
  const selected = chooseNewerPick5Result(currentResults, candidate);
  const middayStatus = expectedStatus("Georgia Five Midday", candidate.middayDateKey, expectedKeys.pick5Midday);
  const eveningStatus = expectedStatus("Georgia Five Evening", candidate.eveningDateKey, expectedKeys.pick5Evening);

  return {
    key: "pick5",
    ...selected,
    ready: middayStatus.ready && eveningStatus.ready,
    message: `${middayStatus.message}; ${eveningStatus.message}`
  };
}

async function updateFantasy5(currentResults, lastUpdated, expectedKeys) {
  const source = await fetchSource("Fantasy 5", SOURCES.fantasyFive);
  const parsed = parseLotteryUsaDailyGame(source.html, 5);
  const candidate = removeUndefined(buildFantasy5(parsed, lastUpdated, source.url));
  const selected = chooseNewerSingleResult("fantasy5", currentResults, candidate);
  const status = expectedStatus("Fantasy 5", candidate.drawDateKey, expectedKeys.fantasy5);

  return { key: "fantasy5", ...selected, ready: status.ready, message: status.message };
}

async function runUpdateRound(currentResults) {
  const lastUpdated = todayEasternDisplayDate();
  const expectedKeys = getExpectedResultKeys();
  const nextResults = { ...DEFAULT_RESULTS, ...currentResults };
  const report = [];

  const updateTasks = [
    updatePowerball,
    updateMega,
    updatePick5,
    updateFantasy5
  ];

  for (const updateTask of updateTasks) {
    try {
      const update = await updateTask(currentResults, lastUpdated, expectedKeys);
      nextResults[update.key] = update.result;
      report.push({
        key: update.key,
        ready: update.ready,
        changed: update.changed,
        message: update.warning || update.message
      });
      console.log(`${update.key}: ${update.warning || update.message}`);
    } catch (error) {
      const fallbackKey = updateTask.name
        .replace("update", "")
        .replace("Powerball", "powerball")
        .replace("Mega", "mega")
        .replace("Pick5", "pick5")
        .replace("Fantasy5", "fantasy5");

      report.push({
        key: fallbackKey,
        ready: false,
        changed: false,
        message: error.message
      });
      console.log(`${fallbackKey}: update skipped and current result preserved: ${error.message}`);
    }
  }

  return { results: nextResults, report };
}

function shouldRunAnotherRound(report) {
  return report.some((entry) => entry.ready === false);
}

function writeLatestResultsFile(latestResults) {
  const output = `const latestResults = ${JSON.stringify(latestResults, null, 2)};\n`;
  const tempFile = `${OUTPUT_FILE}.tmp`;

  fs.writeFileSync(tempFile, output, "utf8");
  fs.renameSync(tempFile, OUTPUT_FILE);
}

async function main() {
  let currentResults = readCurrentLatestResults();
  let finalReport = [];

  for (let round = 1; round <= CONFIG.updateRounds; round += 1) {
    console.log(`Starting latest-results update round ${round} of ${CONFIG.updateRounds}.`);

    const update = await runUpdateRound(currentResults);
    currentResults = update.results;
    finalReport = update.report;

    if (!shouldRunAnotherRound(update.report)) {
      console.log("All expected latest results are available.");
      break;
    }

    if (round < CONFIG.updateRounds) {
      console.log(`Some expected results are not available yet. Waiting ${CONFIG.updateRoundDelayMs / 1000} seconds before retrying.`);
      await sleep(CONFIG.updateRoundDelayMs);
    }
  }

  writeLatestResultsFile(currentResults);

  console.log("latest-results.js update process completed.");
  console.log("Final update report:");
  finalReport.forEach((entry) => {
    console.log(`- ${entry.key}: ${entry.message}`);
  });
}

main().catch((error) => {
  console.error("Latest results update process failed.");
  console.error(error);
  process.exit(1);
});
