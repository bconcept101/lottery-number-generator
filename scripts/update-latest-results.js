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
  resultDelayBufferMinutes: Number(process.env.RESULT_DELAY_BUFFER_MINUTES || 30),
  publishedResultsUrl:
    process.env.PUBLISHED_RESULTS_URL ||
    "https://lottery-number-generator-6ey.pages.dev/latest-results.js"
};

const SOURCES = {
  wsb: "https://www.wsbtv.com/lottery/",
  jackpocket: "https://lottery.jackpocket.com/en/lottery-results/georgia",
  lotteryNetPick5Midday: "https://www.lottery.net/georgia/five-midday/numbers",
  lotteryNetPick5Evening: "https://www.lottery.net/georgia/five-evening/numbers",
  lotteryNetFantasy5: "https://www.lottery.net/georgia/fantasy-5/numbers"
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

const GAME_RULES = {
  powerball: {
    label: "Powerball",
    mainCount: 5,
    mainMin: 1,
    mainMax: 69,
    extraMin: 1,
    extraMax: 26,
    drawDays: ["Monday", "Wednesday", "Saturday"],
    drawHour: 22,
    drawMinute: 59
  },
  mega: {
    label: "Mega Millions",
    mainCount: 5,
    mainMin: 1,
    mainMax: 70,
    extraMin: 1,
    extraMax: 24,
    drawDays: ["Tuesday", "Friday"],
    drawHour: 23,
    drawMinute: 0
  },
  pick5Midday: {
    label: "Georgia FIVE Midday",
    mainCount: 5,
    mainMin: 0,
    mainMax: 9,
    drawHour: 12,
    drawMinute: 29
  },
  pick5Evening: {
    label: "Georgia FIVE Evening",
    mainCount: 5,
    mainMin: 0,
    mainMax: 9,
    drawHour: 18,
    drawMinute: 59
  },
  fantasy5: {
    label: "Fantasy 5",
    mainCount: 5,
    mainMin: 1,
    mainMax: 42,
    drawHour: 23,
    drawMinute: 34
  }
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

function expectedWeeklyDateKey(rule, nowParts = getEasternNowParts()) {
  const readyMinute =
    rule.drawHour * 60 + rule.drawMinute + CONFIG.resultDelayBufferMinutes;

  for (let daysBack = 0; daysBack <= 7; daysBack += 1) {
    const candidate = addDays(nowParts.dateKey, -daysBack);
    const weekday = weekdayFromDateKey(candidate);

    if (!rule.drawDays.includes(weekday)) {
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
    powerball: expectedWeeklyDateKey(GAME_RULES.powerball, nowParts),
    mega: expectedWeeklyDateKey(GAME_RULES.mega, nowParts),
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
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&reg;|®/gi, "");
}

function htmlToLines(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|hr)\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|section|article|header|footer|main|h1|h2|h3|h4|h5|h6|li|ul|ol|tr|td|th|table|span|sup)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeLabel(value) {
  return String(value || "")
    .replace(/^#+\s*/, "")
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isWeekdayLine(line) {
  return /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$/i.test(
    String(line || "").trim()
  );
}

function cleanDateText(value) {
  return String(value || "")
    .replace(/\^\{?(st|nd|rd|th)\}?/gi, "$1")
    .replace(/\b(\d{1,2})\s+(st|nd|rd|th)\b/gi, "$1")
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateKeyFromText(value) {
  const text = cleanDateText(value);

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return dateKeyFromParts(
      Number(slashMatch[3]),
      Number(slashMatch[1]),
      Number(slashMatch[2])
    );
  }

  const longMatch = text.match(
    /^(?:(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+)?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})\s+(\d{4})$/i
  );

  if (!longMatch) {
    throw new Error(`Unable to parse date: ${value}`);
  }

  const month = MONTHS[longMatch[2].toLowerCase().replace(/\.$/, "")];

  return dateKeyFromParts(
    Number(longMatch[4]),
    month,
    Number(longMatch[3])
  );
}

function numberArrayFromLine(line) {
  const text = String(line || "").replace(/\s+/g, " ").trim();

  if (!/^\d{1,2}(?:\s+\d{1,2})*$/.test(text)) {
    return [];
  }

  return text.split(/\s+/).map(numberValue);
}

function singleNumberFromLine(line) {
  const text = String(line || "").trim();

  if (!/^\d{1,2}$/.test(text)) {
    return null;
  }

  return numberValue(text);
}

function isStopLine(line) {
  const text = normalizeText(line);

  return (
    text.includes("total payout") ||
    text.includes("current jackpot") ||
    text.includes("top prize") ||
    text.includes("next draw") ||
    text.includes("next top prize") ||
    text.includes("georgia payout") ||
    text.includes("national jackpot") ||
    text.includes("live drawings") ||
    text.includes("latest draw results") ||
    text.includes("match 4/5") ||
    text.includes("match 3/5") ||
    text.includes("prize payout") ||
    text.includes("show more results")
  );
}

function validateCandidate(candidate) {
  const rule = GAME_RULES[candidate.gameKey];

  if (!rule) {
    throw new Error(`No rule found for ${candidate.gameKey}`);
  }

  const numbers = candidate.mainNumbers || candidate.numbers || [];

  if (numbers.length !== rule.mainCount) {
    throw new Error(
      `${candidate.sourceName} ${candidate.gameKey} expected ${rule.mainCount} numbers but found ${numbers.length}`
    );
  }

  numbers.forEach((number) => {
    const value = numberValue(number);

    if (!Number.isInteger(value) || value < rule.mainMin || value > rule.mainMax) {
      throw new Error(
        `${candidate.sourceName} ${candidate.gameKey} invalid number ${number}`
      );
    }
  });

  if (rule.extraMin !== undefined) {
    const extra = numberValue(candidate.extraNumber);

    if (!Number.isInteger(extra) || extra < rule.extraMin || extra > rule.extraMax) {
      throw new Error(
        `${candidate.sourceName} ${candidate.gameKey} invalid extra number ${candidate.extraNumber}`
      );
    }
  }

  return candidate;
}

function makeCandidate({
  gameKey,
  dateKey,
  numbers,
  mainNumbers,
  extraNumber,
  multiplier,
  sourceName,
  sourceUrl,
  priority
}) {
  const candidate = {
    gameKey,
    dateKey,
    numbers: numbers ? numbers.map(numberValue) : undefined,
    mainNumbers: mainNumbers ? mainNumbers.map(numberValue) : undefined,
    extraNumber: extraNumber !== undefined && extraNumber !== null ? numberValue(extraNumber) : undefined,
    multiplier: multiplier ? String(multiplier).replace(/x$/i, "") : undefined,
    sourceName,
    sourceUrl,
    priority
  };

  return validateCandidate(candidate);
}

function candidateKey(candidate) {
  const numbers = candidate.mainNumbers || candidate.numbers || [];
  const extra = candidate.extraNumber !== undefined ? `|${candidate.extraNumber}` : "";

  return `${candidate.dateKey}|${numbers.join("-")}${extra}`;
}

function formatNumbers(numbers, leadingZero = true) {
  return numbers
    .map((number) => (leadingZero ? padTwo(numberValue(number)) : String(numberValue(number))))
    .join(" - ");
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "LotteryNumberGeneratorBot/3.0 (+https://lottery-number-generator-6ey.pages.dev/)",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
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

async function fetchSource(name, url) {
  let lastError = null;

  for (let attempt = 1; attempt <= CONFIG.sourceAttempts; attempt += 1) {
    try {
      const html = await fetchWithTimeout(url);

      if (!html || html.length < 500) {
        throw new Error("Source returned too little content");
      }

      console.log(`${name}: fetched ${url}`);
      return html;
    } catch (error) {
      lastError = error;
      console.log(`${name}: attempt ${attempt} failed - ${error.message}`);

      if (attempt < CONFIG.sourceAttempts) {
        await sleep(CONFIG.sourceRetryDelayMs);
      }
    }
  }

  throw lastError || new Error(`${name}: failed`);
}

function readResultsFromJsText(fileContent) {
  const sandbox = {};

  vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox, {
    timeout: 5000
  });

  return sandbox.result || { ...DEFAULT_RESULTS };
}

function readCurrentResults() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return { ...DEFAULT_RESULTS };
  }

  try {
    return readResultsFromJsText(fs.readFileSync(OUTPUT_FILE, "utf8"));
  } catch (error) {
    console.log(`Current latest-results.js could not be read: ${error.message}`);
    return { ...DEFAULT_RESULTS };
  }
}

async function readPublishedWebsiteResults() {
  try {
    const fileContent = await fetchWithTimeout(CONFIG.publishedResultsUrl);
    const results = readResultsFromJsText(fileContent);

    console.log(
      `Published website self-check: Pick5 Midday ${results.pick5?.middayDateKey || results.pick5?.meta?.middayDateKey || "unknown"}, ` +
      `Pick5 Evening ${results.pick5?.eveningDateKey || results.pick5?.meta?.eveningDateKey || "unknown"}, ` +
      `Fantasy5 ${results.fantasy5?.drawDateKey || results.fantasy5?.meta?.drawDateKey || "unknown"}`
    );

    return results;
  } catch (error) {
    console.log(`Published website self-check skipped: ${error.message}`);
    return null;
  }
}

function currentSingleDateKey(result) {
  if (!result) return null;
  if (result.drawDateKey) return result.drawDateKey;
  if (result.meta && result.meta.drawDateKey) return result.meta.drawDateKey;

  if (result.drawDate) {
    try {
      return dateKeyFromText(result.drawDate);
    } catch {
      return null;
    }
  }

  return null;
}

function currentPick5SubResult(currentPick5, type) {
  if (!currentPick5) {
    return null;
  }

  const dateKey =
    type === "midday"
      ? currentPick5.middayDateKey || currentPick5.meta?.middayDateKey
      : currentPick5.eveningDateKey || currentPick5.meta?.eveningDateKey;

  const regex =
    type === "midday"
      ? /Midday(?:\s*\([^)]+\))?\s*:\s*([0-9\s-]+)/i
      : /Evening(?:\s*\([^)]+\))?\s*:\s*([0-9\s-]+)/i;

  const match = String(currentPick5.winningNumbers || "").match(regex);
  const numbers = match ? match[1].match(/\d+/g)?.map(numberValue) : null;

  if (!dateKey || !numbers || numbers.length !== 5) {
    return null;
  }

  return {
    gameKey: type === "midday" ? "pick5Midday" : "pick5Evening",
    dateKey,
    numbers,
    sourceName: "Current Website Data",
    sourceUrl: CONFIG.publishedResultsUrl,
    priority: 99
  };
}

function parseWsbPage(html) {
  const lines = htmlToLines(html);
  const candidates = [];

  const gameMap = [
    { gameKey: "pick5Midday", label: "Georgia FIVE Midday", needed: 5 },
    { gameKey: "pick5Evening", label: "Georgia FIVE Evening", needed: 5 },
    { gameKey: "fantasy5", label: "Fantasy 5 Night", needed: 5 },
    { gameKey: "mega", label: "Mega Millions", needed: 6 },
    { gameKey: "powerball", label: "Powerball", needed: 6 }
  ];

  for (const game of gameMap) {
    const index = lines.findIndex(
      (line) => normalizeLabel(line) === normalizeLabel(game.label)
    );

    if (index === -1) {
      console.log(`WSB-TV: ${game.label} block not found`);
      continue;
    }

    let dateKey = null;

    for (let i = Math.max(0, index - 5); i < index; i += 1) {
      try {
        dateKey = dateKeyFromText(lines[i]);
      } catch {
        continue;
      }
    }

    if (!dateKey) {
      console.log(`WSB-TV: ${game.label} date not found`);
      continue;
    }

    let numberLine = [];
    let multiplier = null;

    for (let i = index + 1; i < Math.min(lines.length, index + 25); i += 1) {
      const line = lines[i];

      if (isStopLine(line)) {
        break;
      }

      const powerPlayMatch = line.match(/Power\s*Play\s*:?\s*(\d{1,2})\s*x?/i);
      if (powerPlayMatch) {
        multiplier = powerPlayMatch[1];
        continue;
      }

      const parsedNumbers = numberArrayFromLine(line);
      if (parsedNumbers.length >= game.needed) {
        numberLine = parsedNumbers.slice(0, game.needed);
        break;
      }
    }

    if (numberLine.length !== game.needed) {
      console.log(`WSB-TV: ${game.label} numbers not found`);
      continue;
    }

    if (game.gameKey === "powerball" || game.gameKey === "mega") {
      candidates.push(
        makeCandidate({
          gameKey: game.gameKey,
          dateKey,
          mainNumbers: numberLine.slice(0, 5),
          extraNumber: numberLine[5],
          multiplier,
          sourceName: "WSB-TV",
          sourceUrl: SOURCES.wsb,
          priority: 1
        })
      );
    } else {
      candidates.push(
        makeCandidate({
          gameKey: game.gameKey,
          dateKey,
          numbers: numberLine,
          sourceName: "WSB-TV",
          sourceUrl: SOURCES.wsb,
          priority: 1
        })
      );
    }
  }

  return candidates;
}

function parseJackpocketPage(html) {
  const lines = htmlToLines(html);
  const candidates = [];

  const gameMap = [
    { gameKey: "pick5Midday", label: "Georgia FIVE Midday", needed: 5 },
    { gameKey: "pick5Evening", label: "Georgia FIVE Evening", needed: 5 },
    { gameKey: "fantasy5", label: "Fantasy 5", needed: 5 },
    { gameKey: "mega", label: "Mega Millions", needed: 6 },
    { gameKey: "powerball", label: "Powerball", needed: 6 }
  ];

  for (const game of gameMap) {
    const index = lines.findIndex(
      (line) => normalizeLabel(line) === normalizeLabel(game.label)
    );

    if (index === -1) {
      continue;
    }

    let dateKey = null;
    let dateIndex = -1;

    for (let i = index + 1; i < Math.min(lines.length, index + 8); i += 1) {
      try {
        dateKey = dateKeyFromText(lines[i]);
        dateIndex = i;
        break;
      } catch {
        continue;
      }
    }

    if (!dateKey) {
      continue;
    }

    const collectedNumbers = [];
    let multiplier = null;

    for (let i = dateIndex + 1; i < Math.min(lines.length, dateIndex + 30); i += 1) {
      const line = lines[i];

      if (isStopLine(line)) {
        break;
      }

      const powerPlayMatch = line.match(/Power\s*Play\s*:?\s*(\d{1,2})\s*x?/i);
      if (powerPlayMatch) {
        multiplier = powerPlayMatch[1];
        continue;
      }

      const single = singleNumberFromLine(line);
      if (single !== null) {
        collectedNumbers.push(single);
      }

      if (collectedNumbers.length === game.needed) {
        continue;
      }
    }

    if (collectedNumbers.length < game.needed) {
      continue;
    }

    const numbers = collectedNumbers.slice(0, game.needed);

    if (game.gameKey === "powerball" || game.gameKey === "mega") {
      candidates.push(
        makeCandidate({
          gameKey: game.gameKey,
          dateKey,
          mainNumbers: numbers.slice(0, 5),
          extraNumber: numbers[5],
          multiplier,
          sourceName: "Jackpocket",
          sourceUrl: SOURCES.jackpocket,
          priority: 2
        })
      );
    } else {
      candidates.push(
        makeCandidate({
          gameKey: game.gameKey,
          dateKey,
          numbers,
          sourceName: "Jackpocket",
          sourceUrl: SOURCES.jackpocket,
          priority: 2
        })
      );
    }
  }

  return candidates;
}

function parseLotteryNetGeorgiaPage(html, gameKey, sourceUrl) {
  const lines = htmlToLines(html);

  for (let i = 0; i < lines.length - 6; i += 1) {
    if (!isWeekdayLine(lines[i])) {
      continue;
    }

    let dateKey = null;

    try {
      dateKey = dateKeyFromText(`${lines[i]} ${lines[i + 1]}`);
    } catch {
      continue;
    }

    const numbers = [];

    for (let j = i + 2; j < Math.min(lines.length, i + 20); j += 1) {
      if (isWeekdayLine(lines[j]) || isStopLine(lines[j])) {
        break;
      }

      const single = singleNumberFromLine(lines[j]);
      if (single !== null) {
        numbers.push(single);
      }

      if (numbers.length === GAME_RULES[gameKey].mainCount) {
        break;
      }
    }

    if (numbers.length === GAME_RULES[gameKey].mainCount) {
      return makeCandidate({
        gameKey,
        dateKey,
        numbers,
        sourceName: "Lottery.net",
        sourceUrl,
        priority: 3
      });
    }
  }

  throw new Error(`Lottery.net ${gameKey} latest result not found`);
}

async function collectCandidates() {
  const candidates = {
    powerball: [],
    mega: [],
    pick5Midday: [],
    pick5Evening: [],
    fantasy5: []
  };

  try {
    const html = await fetchSource("WSB-TV", SOURCES.wsb);
    const parsed = parseWsbPage(html);

    parsed.forEach((candidate) => {
      candidates[candidate.gameKey].push(candidate);
    });

    console.log(`WSB-TV: parsed ${parsed.length} candidate results`);
  } catch (error) {
    console.log(`WSB-TV: skipped - ${error.message}`);
  }

  try {
    const html = await fetchSource("Jackpocket", SOURCES.jackpocket);
    const parsed = parseJackpocketPage(html);

    parsed.forEach((candidate) => {
      candidates[candidate.gameKey].push(candidate);
    });

    console.log(`Jackpocket: parsed ${parsed.length} candidate results`);
  } catch (error) {
    console.log(`Jackpocket: skipped - ${error.message}`);
  }

  const lotteryNetTasks = [
    ["pick5Midday", SOURCES.lotteryNetPick5Midday],
    ["pick5Evening", SOURCES.lotteryNetPick5Evening],
    ["fantasy5", SOURCES.lotteryNetFantasy5]
  ];

  for (const [gameKey, url] of lotteryNetTasks) {
    try {
      const html = await fetchSource(`Lottery.net ${gameKey}`, url);
      const candidate = parseLotteryNetGeorgiaPage(html, gameKey, url);
      candidates[gameKey].push(candidate);
      console.log(`Lottery.net: parsed ${gameKey}`);
    } catch (error) {
      console.log(`Lottery.net ${gameKey}: skipped - ${error.message}`);
    }
  }

  return candidates;
}

function selectTrustedCandidate(gameKey, candidates, currentCandidate = null) {
  const validCandidates = candidates
    .filter(Boolean)
    .sort((a, b) => {
      const dateCompare = compareDateKeys(b.dateKey, a.dateKey);
      if (dateCompare !== 0) return dateCompare;
      return a.priority - b.priority;
    });

  if (validCandidates.length === 0) {
    return currentCandidate;
  }

  const newestDate = validCandidates[0].dateKey;
  const newestCandidates = validCandidates.filter(
    (candidate) => candidate.dateKey === newestDate
  );

  const groups = new Map();

  newestCandidates.forEach((candidate) => {
    const key = candidateKey(candidate);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(candidate);
  });

  const rankedGroups = Array.from(groups.values()).sort((a, b) => {
    if (b.length !== a.length) {
      return b.length - a.length;
    }

    const bestPriorityA = Math.min(...a.map((candidate) => candidate.priority));
    const bestPriorityB = Math.min(...b.map((candidate) => candidate.priority));

    return bestPriorityA - bestPriorityB;
  });

  const selectedGroup = rankedGroups[0].sort((a, b) => a.priority - b.priority);
  const selected = {
    ...selectedGroup[0],
    sourceNames: selectedGroup.map((candidate) => candidate.sourceName),
    sourceUrls: selectedGroup.map((candidate) => candidate.sourceUrl),
    consensusCount: selectedGroup.length,
    candidateCount: newestCandidates.length
  };

  if (currentCandidate && compareDateKeys(selected.dateKey, currentCandidate.dateKey) < 0) {
    console.log(
      `${gameKey}: selected result ${selected.dateKey} is older than current ${currentCandidate.dateKey}; preserving current`
    );

    return currentCandidate;
  }

  const disagreementCount = newestCandidates.length - selectedGroup.length;
  if (disagreementCount > 0) {
    console.log(
      `${gameKey}: warning - ${disagreementCount} same-date source disagreement(s); using ${selected.sourceName}`
    );
  }

  console.log(
    `${gameKey}: trusted ${selected.dateKey} from ${selected.sourceNames.join(", ")}`
  );

  return selected;
}

function buildPowerball(candidate, lastUpdated) {
  return {
    gameName: "Powerball",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(candidate.dateKey),
    drawDateKey: candidate.dateKey,
    winningNumbers: formatNumbers(candidate.mainNumbers, true),
    extraNumberLabel: "Powerball Number",
    extraNumber: padTwo(candidate.extraNumber),
    multiplierLabel: candidate.multiplier ? "Power Play" : undefined,
    multiplier: candidate.multiplier ? `${candidate.multiplier}x` : undefined,
    lastUpdated,
    meta: cleanObject({
      source: candidate.sourceName,
      sourceNames: candidate.sourceNames || [candidate.sourceName],
      sourceUrls: candidate.sourceUrls || [candidate.sourceUrl],
      drawDateKey: candidate.dateKey,
      consensusCount: candidate.consensusCount || 1,
      candidateCount: candidate.candidateCount || 1
    })
  };
}

function buildMega(candidate, lastUpdated) {
  return {
    gameName: "Mega Millions",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(candidate.dateKey),
    drawDateKey: candidate.dateKey,
    winningNumbers: formatNumbers(candidate.mainNumbers, true),
    extraNumberLabel: "Mega Ball Number",
    extraNumber: padTwo(candidate.extraNumber),
    lastUpdated,
    meta: {
      source: candidate.sourceName,
      sourceNames: candidate.sourceNames || [candidate.sourceName],
      sourceUrls: candidate.sourceUrls || [candidate.sourceUrl],
      drawDateKey: candidate.dateKey,
      consensusCount: candidate.consensusCount || 1,
      candidateCount: candidate.candidateCount || 1
    }
  };
}

function buildPick5(midday, evening, lastUpdated) {
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
      source: "Multi-source validation",
      middaySourceNames: midday.sourceNames || [midday.sourceName],
      middaySourceUrls: midday.sourceUrls || [midday.sourceUrl],
      eveningSourceNames: evening.sourceNames || [evening.sourceName],
      eveningSourceUrls: evening.sourceUrls || [evening.sourceUrl],
      middayDateKey: midday.dateKey,
      eveningDateKey: evening.dateKey,
      middayConsensusCount: midday.consensusCount || 1,
      eveningConsensusCount: evening.consensusCount || 1
    }
  };
}

function buildFantasy5(candidate, lastUpdated) {
  return {
    gameName: "Fantasy 5 / Georgia Fantasy 5",
    status: "Latest result reviewed daily",
    drawDate: displayDateFromKey(candidate.dateKey),
    drawDateKey: candidate.dateKey,
    winningNumbers: formatNumbers(candidate.numbers, true),
    drawType: "Night draw",
    lastUpdated,
    meta: {
      source: candidate.sourceName,
      sourceNames: candidate.sourceNames || [candidate.sourceName],
      sourceUrls: candidate.sourceUrls || [candidate.sourceUrl],
      drawDateKey: candidate.dateKey,
      consensusCount: candidate.consensusCount || 1,
      candidateCount: candidate.candidateCount || 1
    }
  };
}

function cleanObject(value) {
  if (Array.isArray(value)) {
    return value.map(cleanObject);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, cleanObject(entryValue)])
    );
  }

  return value;
}

function dateReady(label, actualKey, expectedKey) {
  if (!actualKey) {
    return {
      ready: false,
      message: `${label}: no selected result`
    };
  }

  if (!expectedKey || compareDateKeys(actualKey, expectedKey) >= 0) {
    return {
      ready: true,
      message: `${label}: current ${actualKey}`
    };
  }

  return {
    ready: false,
    message: `${label}: selected ${actualKey}; expected ${expectedKey}`
  };
}

function writeResults(latestResults) {
  const ordered = {
    powerball: cleanObject(latestResults.powerball || {}),
    mega: cleanObject(latestResults.mega || {}),
    pick5: cleanObject(latestResults.pick5 || {}),
    fantasy5: cleanObject(latestResults.fantasy5 || {})
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    `const latestResults = ${JSON.stringify(ordered, null, 2)};\n`,
    "utf8"
  );
}

function currentSingleCandidate(gameKey, currentResult) {
  const dateKey = currentSingleDateKey(currentResult);

  if (!dateKey) {
    return null;
  }

  return {
    gameKey,
    dateKey,
    sourceName: "Current Website Data",
    sourceUrl: CONFIG.publishedResultsUrl,
    priority: 99
  };
}

async function runRound(currentResults) {
  const lastUpdated = todayEasternDisplayDate();
  const expected = getExpectedKeys();
  const candidates = await collectCandidates();

  const trustedPowerball = selectTrustedCandidate(
    "powerball",
    candidates.powerball,
    currentSingleCandidate("powerball", currentResults.powerball)
  );

  const trustedMega = selectTrustedCandidate(
    "mega",
    candidates.mega,
    currentSingleCandidate("mega", currentResults.mega)
  );

  const trustedPick5Midday = selectTrustedCandidate(
    "pick5Midday",
    candidates.pick5Midday,
    currentPick5SubResult(currentResults.pick5, "midday")
  );

  const trustedPick5Evening = selectTrustedCandidate(
    "pick5Evening",
    candidates.pick5Evening,
    currentPick5SubResult(currentResults.pick5, "evening")
  );

  const trustedFantasy5 = selectTrustedCandidate(
    "fantasy5",
    candidates.fantasy5,
    currentSingleCandidate("fantasy5", currentResults.fantasy5)
  );

  const nextResults = { ...currentResults };

  if (trustedPowerball && trustedPowerball.mainNumbers && trustedPowerball.extraNumber !== undefined) {
    nextResults.powerball = buildPowerball(trustedPowerball, lastUpdated);
  }

  if (trustedMega && trustedMega.mainNumbers && trustedMega.extraNumber !== undefined) {
    nextResults.mega = buildMega(trustedMega, lastUpdated);
  }

  if (trustedPick5Midday && trustedPick5Evening && trustedPick5Midday.numbers && trustedPick5Evening.numbers) {
    nextResults.pick5 = buildPick5(trustedPick5Midday, trustedPick5Evening, lastUpdated);
  }

  if (trustedFantasy5 && trustedFantasy5.numbers) {
    nextResults.fantasy5 = buildFantasy5(trustedFantasy5, lastUpdated);
  }

  const statuses = [
    dateReady("Powerball", trustedPowerball?.dateKey, expected.powerball),
    dateReady("Mega Millions", trustedMega?.dateKey, expected.mega),
    dateReady("Georgia FIVE Midday", trustedPick5Midday?.dateKey, expected.pick5Midday),
    dateReady("Georgia FIVE Evening", trustedPick5Evening?.dateKey, expected.pick5Evening),
    dateReady("Fantasy 5", trustedFantasy5?.dateKey, expected.fantasy5)
  ];

  statuses.forEach((status) => console.log(status.message));

  return {
    nextResults,
    statuses
  };
}

async function main() {
  let currentResults = readCurrentResults();
  let finalStatuses = [];

  console.log(`Starting latest-results updater at ${new Date().toISOString()}`);
  await readPublishedWebsiteResults();

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
