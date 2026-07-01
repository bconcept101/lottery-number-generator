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

const DATE_LINE_REGEX =
  /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2}),?\s+(\d{4})$/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function numberValue(value) {
  return Number.parseInt(String(value), 10);
}

function dateKeyFromParts(year, month, day) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function compareDateKeys(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return String(a).localeCompare(String(b));
}

function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  return dateKeyFromParts(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

function weekdayFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return WEEKDAYS[date.getUTCDay()];
}

function getEasternNowParts(date = new Date()) {
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
    dateKey: `${values.year}-${values.month}-${values.day}`,
    minuteOfDay: hour * 60 + Number(values.minute)
  };
}

function expectedDailyDateKey(drawHour, drawMinute, nowParts = getEasternNowParts()) {
  const readyMinute =
    drawHour * 60 + drawMinute + CONFIG.resultDelayBufferMinutes;

  if (readyMinute < 1440) {
    return nowParts.minuteOfDay >= readyMinute
      ? nowParts.dateKey
      : addDays(nowParts.dateKey, -1);
  }

  const afterMidnightReady = readyMinute - 1440;

  return nowParts.minuteOfDay >= afterMidnightReady
    ? addDays(nowParts.dateKey, -1)
    : addDays(nowParts.dateKey, -2);
}

function expectedWeeklyDateKey(drawDays, drawHour, drawMinute, nowParts = getEasternNowParts()) {
  const readyMinute =
    drawHour * 60 + drawMinute + CONFIG.resultDelayBufferMinutes;

  for (let daysBack = 0; daysBack <= 7; daysBack += 1) {
    const candidate = addDays(nowParts.dateKey, -daysBack);
    const weekday = weekdayFromDateKey(candidate);

    if (!drawDays.includes(weekday)) {
      continue;
    }

    if (daysBack === 0 && nowParts.minuteOfDay < readyMinute) {
      continue;
    }

    return candidate;
  }

  return null;
}

function getExpectedKeys() {
  const nowParts = getEasternNowParts();

  return {
    powerball: expectedWeeklyDateKey(
      ["Monday", "Wednesday", "Saturday"],
      22,
      59,
      nowParts
    ),
    mega: expectedWeeklyDateKey(
      ["Tuesday", "Friday"],
      23,
      0,
      nowParts
    ),
    pick5Midday: expectedDailyDateKey(12, 29, nowParts),
    pick5Evening: expectedDailyDateKey(18, 59, nowParts),
    fantasy5: expectedDailyDateKey(23, 34, nowParts)
  };
}

function displayDateFromKey(dateKey, includeWeekday = true) {
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

function todayEasternDisplayDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: CONFIG.timezone
  }).format(new Date());
}

function decodeHtml(value) {
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
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|hr)\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|section|article|header|footer|main|h1|h2|h3|h4|h5|h6|li|ul|ol|tr|td|th|table|span)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalize(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function dateKeyFromLine(line) {
  const match = String(line || "")
    .replace(/\s+/g, " ")
    .trim()
    .match(DATE_LINE_REGEX);

  if (!match) {
    throw new Error(`Unable to parse date line: ${line}`);
  }

  const month = MONTHS[match[2].toLowerCase().replace(/\.$/, "")];

  return dateKeyFromParts(Number(match[4]), month, Number(match[3]));
}

function findLatestSection(lines) {
  const latestIndex = lines.findIndex(
    (line) => normalize(line) === "latest numbers"
  );

  if (latestIndex === -1) {
    throw new Error("Latest numbers section was not found");
  }

  for (let i = latestIndex + 1; i < Math.min(lines.length, latestIndex + 80); i += 1) {
    const line = lines[i].replace(/\s+/g, " ").trim();

    if (DATE_LINE_REGEX.test(line)) {
      return {
        dateIndex: i,
        dateKey: dateKeyFromLine(line)
      };
    }
  }

  throw new Error("Latest draw date was not found");
}

function parseDailyGame(html, expectedCount) {
  const lines = htmlToLines(html);
  const latest = findLatestSection(lines);
  const numbers = [];

  for (let i = latest.dateIndex + 1; i < Math.min(lines.length, latest.dateIndex + 80); i += 1) {
    const line = lines[i].replace(/\s+/g, " ").trim();

    if (DATE_LINE_REGEX.test(line) || /see more numbers/i.test(line)) {
      break;
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

function parseBallGame(html, expectedMainCount, specialLabel) {
  const lines = htmlToLines(html);
  const latest = findLatestSection(lines);
  const mainNumbers = [];
  let extraNumber = null;
  let multiplier = null;

  const specialRegex = new RegExp(
    `^${specialLabel}\\s*:?\\s*(\\d{1,2})$`,
    "i"
  );

  for (let i = latest.dateIndex + 1; i < Math.min(lines.length, latest.dateIndex + 100); i += 1) {
    const line = lines[i].replace(/\s+/g, " ").trim();

    if (DATE_LINE_REGEX.test(line) || /see more numbers/i.test(line)) {
      break;
    }

    const specialMatch = line.match(specialRegex);

    if (specialMatch) {
      extraNumber = specialMatch[1];
      continue;
    }

    const powerPlayMatch = line.match(/^Power\s*Play\s*:?\s*(\d{1,2})$/i);

    if (powerPlayMatch) {
      multiplier = powerPlayMatch[1];
      continue;
    }

    if (/^\d{1,2}$/.test(line) && mainNumbers.length < expectedMainCount) {
      mainNumbers.push(line);
    }
  }

  if (mainNumbers.length !== expectedMainCount) {
    throw new Error(
      `Expected ${expectedMainCount} main numbers but found ${mainNumbers.length}`
    );
  }

  if (!extraNumber) {
    throw new Error(`${specialLabel} number was not found`);
  }

  return {
    dateKey: latest.dateKey,
    mainNumbers,
    extraNumber,
    multiplier
  };
}

function validateNumbers(gameName, numbers, min, max, expectedCount) {
  if (numbers.length !== expectedCount) {
    throw new Error(`${gameName} expected ${expectedCount} numbers`);
  }

  numbers.forEach((number) => {
    const value = numberValue(number);

    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${gameName} invalid number: ${number}`);
    }
  });
}

function formatNumbers(numbers, leadingZero = true) {
  return numbers
    .map((number) => leadingZero ? padTwo(number) : String(numberValue(number)))
    .join(" - ");
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LotteryNumberGeneratorBot/2.1 (+https://lottery-number-generator-6ey.pages.dev/)",
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

async function fetchSource(name, urls) {
  let lastError = null;

  for (const url of urls) {
    for (let attempt = 1; attempt <= CONFIG.sourceAttempts; attempt += 1) {
      try {
        const html = await fetchWithTimeout(url);

        if (!html || html.length < 500) {
          throw new Error("Source returned too little content");
        }

        console.log(`${name}: fetched ${url}`);
        return { html, url };
      } catch (error) {
        lastError = error;
        console.log(`${name}: ${url} attempt ${attempt} failed: ${error.message}`);

        if (attempt < CONFIG.sourceAttempts) {
          await sleep(CONFIG.sourceRetryDelayMs);
        }
      }
    }
  }

  throw lastError || new Error(`${name}: all sources failed`);
}

function readCurrentResults() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {
      powerball: {},
      mega: {},
      pick5: {},
      fantasy5: {}
    };
  }

  try {
    const fileContent = fs.readFileSync(OUTPUT_FILE, "utf8");
    const sandbox = {};

    vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox, {
      timeout: 5000
    });

    return sandbox.result || {
      powerball: {},
      mega: {},
      pick5: {},
      fantasy5: {}
    };
  } catch (error) {
    console.log(`Current latest-results.js could not be read: ${error.message}`);

    return {
      powerball: {},
      mega: {},
      pick5: {},
      fantasy5: {}
    };
  }
}

function currentDateKey(result) {
  if (!result) {
    return null;
  }

  if (result.drawDateKey) {
    return result.drawDateKey;
  }

  if (result.meta && result.meta.drawDateKey) {
    return result.meta.drawDateKey;
  }

  if (!result.drawDate) {
    return null;
  }

  const match = String(result.drawDate).match(
    /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i
  );

  if (!match) {
    return null;
  }

  return dateKeyFromParts(
    Number(match[4]),
    MONTHS[match[2].toLowerCase()],
    Number(match[3])
  );
}

function keepNewer(current, candidate, label) {
  const currentKey = currentDateKey(current);
  const candidateKey = candidate.drawDateKey;

  if (compareDateKeys(candidateKey, currentKey) < 0) {
    console.log(
      `${label}: fetched older result ${candidateKey}; keeping current ${currentKey}`
    );
    return current;
  }

  return candidate;
}

function buildPowerball(parsed, lastUpdated, sourceUrl) {
  validateNumbers("Powerball main numbers", parsed.mainNumbers, 1, 69, 5);
  validateNumbers("Powerball number", [parsed.extraNumber], 1, 26, 1);

  const result = {
    gameName: "Powerball",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(parsed.dateKey),
    drawDateKey: parsed.dateKey,
    winningNumbers: formatNumbers(parsed.mainNumbers, true),
    extraNumberLabel: "Powerball Number",
    extraNumber: padTwo(parsed.extraNumber),
    lastUpdated,
    meta: {
      source: "LotteryUSA",
      sourceUrl,
      drawDateKey: parsed.dateKey,
      updatedAt: new Date().toISOString()
    }
  };

  if (parsed.multiplier) {
    result.multiplierLabel = "Power Play";
    result.multiplier = `${parsed.multiplier}x`;
  }

  return result;
}

function buildMega(parsed, lastUpdated, sourceUrl) {
  validateNumbers("Mega Millions main numbers", parsed.mainNumbers, 1, 70, 5);
  validateNumbers("Mega Ball number", [parsed.extraNumber], 1, 24, 1);

  return {
    gameName: "Mega Millions",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(parsed.dateKey),
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
  validateNumbers("Georgia Five Midday numbers", midday.numbers, 0, 9, 5);
  validateNumbers("Georgia Five Evening numbers", evening.numbers, 0, 9, 5);

  const sameDate = midday.dateKey === evening.dateKey;

  return {
    gameName: "Pick 5 / Georgia Five",
    status: "Latest result reviewed daily",
    drawDate: sameDate
      ? displayDateFromKey(midday.dateKey)
      : `Midday: ${displayDateFromKey(midday.dateKey)}; Evening: ${displayDateFromKey(evening.dateKey)}`,
    middayDateKey: midday.dateKey,
    eveningDateKey: evening.dateKey,
    winningNumbers: sameDate
      ? `Midday: ${formatNumbers(midday.numbers, false)} | Evening: ${formatNumbers(evening.numbers, false)}`
      : `Midday (${displayDateFromKey(midday.dateKey, false)}): ${formatNumbers(midday.numbers, false)} | Evening (${displayDateFromKey(evening.dateKey, false)}): ${formatNumbers(evening.numbers, false)}`,
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
  validateNumbers("Fantasy 5 numbers", parsed.numbers, 1, 42, 5);

  return {
    gameName: "Fantasy 5 / Georgia Fantasy 5",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(parsed.dateKey),
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

function dateReady(label, actualKey, expectedKey) {
  if (!expectedKey || compareDateKeys(actualKey, expectedKey) >= 0) {
    return {
      ready: true,
      message: `${label}: current ${actualKey}`
    };
  }

  return {
    ready: false,
    message: `${label}: source has ${actualKey}; expected ${expectedKey}`
  };
}

async function runRound(currentResults) {
  const lastUpdated = todayEasternDisplayDate();
  const expected = getExpectedKeys();
  const nextResults = { ...currentResults };
  const statuses = [];

  try {
    const source = await fetchSource("Powerball", SOURCES.powerball);
    const parsed = parseBallGame(source.html, 5, "PB");
    const candidate = buildPowerball(parsed, lastUpdated, source.url);

    nextResults.powerball = keepNewer(
      currentResults.powerball,
      candidate,
      "Powerball"
    );

    statuses.push(
      dateReady("Powerball", candidate.drawDateKey, expected.powerball)
    );

    console.log(
      `Powerball: ${candidate.drawDate} ${candidate.winningNumbers} PB ${candidate.extraNumber}`
    );
  } catch (error) {
    statuses.push({
      ready: false,
      message: `Powerball: ${error.message}`
    });

    console.log(`Powerball: preserved current result - ${error.message}`);
  }

  try {
    const source = await fetchSource("Mega Millions", SOURCES.mega);
    const parsed = parseBallGame(source.html, 5, "MB");
    const candidate = buildMega(parsed, lastUpdated, source.url);

    nextResults.mega = keepNewer(
      currentResults.mega,
      candidate,
      "Mega Millions"
    );

    statuses.push(
      dateReady("Mega Millions", candidate.drawDateKey, expected.mega)
    );

    console.log(
      `Mega Millions: ${candidate.drawDate} ${candidate.winningNumbers} MB ${candidate.extraNumber}`
    );
  } catch (error) {
    statuses.push({
      ready: false,
      message: `Mega Millions: ${error.message}`
    });

    console.log(`Mega Millions: preserved current result - ${error.message}`);
  }

  try {
    const [middaySource, eveningSource] = await Promise.all([
      fetchSource("Georgia Five Midday", SOURCES.georgiaFiveMidday),
      fetchSource("Georgia Five Evening", SOURCES.georgiaFiveEvening)
    ]);

    const midday = parseDailyGame(middaySource.html, 5);
    const evening = parseDailyGame(eveningSource.html, 5);

    const candidate = buildPick5(midday, evening, lastUpdated, {
      midday: middaySource.url,
      evening: eveningSource.url
    });

    nextResults.pick5 = candidate;

    statuses.push(
      dateReady("Georgia Five Midday", midday.dateKey, expected.pick5Midday)
    );

    statuses.push(
      dateReady("Georgia Five Evening", evening.dateKey, expected.pick5Evening)
    );

    console.log(`Georgia Five: ${candidate.winningNumbers}`);
  } catch (error) {
    statuses.push({
      ready: false,
      message: `Georgia Five: ${error.message}`
    });

    console.log(`Georgia Five: preserved current result - ${error.message}`);
  }

  try {
    const source = await fetchSource("Fantasy 5", SOURCES.fantasyFive);
    const parsed = parseDailyGame(source.html, 5);
    const candidate = buildFantasy5(parsed, lastUpdated, source.url);

    nextResults.fantasy5 = keepNewer(
      currentResults.fantasy5,
      candidate,
      "Fantasy 5"
    );

    statuses.push(
      dateReady("Fantasy 5", candidate.drawDateKey, expected.fantasy5)
    );

    console.log(`Fantasy 5: ${candidate.drawDate} ${candidate.winningNumbers}`);
  } catch (error) {
    statuses.push({
      ready: false,
      message: `Fantasy 5: ${error.message}`
    });

    console.log(`Fantasy 5: preserved current result - ${error.message}`);
  }

  return {
    nextResults,
    statuses
  };
}

function writeResults(latestResults) {
  const ordered = {
    powerball: latestResults.powerball || {},
    mega: latestResults.mega || {},
    pick5: latestResults.pick5 || {},
    fantasy5: latestResults.fantasy5 || {}
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    `const latestResults = ${JSON.stringify(ordered, null, 2)};\n`,
    "utf8"
  );
}

async function main() {
  let currentResults = readCurrentResults();
  let finalStatuses = [];

  console.log(`Starting latest-results updater at ${new Date().toISOString()}`);

  for (let round = 1; round <= CONFIG.updateRounds; round += 1) {
    console.log(`Starting latest-results update round ${round} of ${CONFIG.updateRounds}.`);

    const roundResult = await runRound(currentResults);
    currentResults = roundResult.nextResults;
    finalStatuses = roundResult.statuses;

    const allReady = finalStatuses.every((status) => status.ready);

    if (allReady) {
      console.log("All expected results are current.");
      break;
    }

    finalStatuses.forEach((status) => console.log(status.message));

    if (round < CONFIG.updateRounds) {
      console.log(
        `Waiting ${Math.round(CONFIG.updateRoundDelayMs / 1000)} seconds before retrying.`
      );

      await sleep(CONFIG.updateRoundDelayMs);
    }
  }

  writeResults(currentResults);

  console.log("latest-results.js update process completed.");

  finalStatuses.forEach((status) => {
    console.log(`- ${status.message}`);
  });
}

main().catch((error) => {
  console.error("Latest results update process failed.");
  console.error(error);
  process.exit(1);
});
