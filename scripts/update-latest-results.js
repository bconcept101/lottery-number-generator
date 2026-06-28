const fs = require("fs");
const path = require("path");

const SOURCES = {
  powerballOfficial: "https://www.powerball.com/previous-results",
  wsbLottery: "https://www.wsbtv.com/lottery/"
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

async function fetchText(url, sourceName) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LotteryNumberGeneratorBot/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`${sourceName} could not be reached`);
  }

  return response.text();
}

async function fetchOptionalText(url, sourceName) {
  try {
    return await fetchText(url, sourceName);
  } catch (error) {
    console.log(`${sourceName} skipped: ${error.message}`);
    return null;
  }
}

function htmlToLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]+>/g, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function getNumbersFromLine(line) {
  return String(line || "").match(/\d+/g) || [];
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function formatNumbers(numbers, useLeadingZero = true) {
  return numbers
    .map((number) => (useLeadingZero ? padTwo(number) : String(number)))
    .join(" - ");
}

function dateKeyFromText(value) {
  const text = String(value || "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const shortMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (shortMatch) {
    const month = shortMatch[1].padStart(2, "0");
    const day = shortMatch[2].padStart(2, "0");
    const year = shortMatch[3];
    return `${year}-${month}-${day}`;
  }

  const longMatch = text.match(
    /(?:sun|mon|tue|wed|thu|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)?\.?\s*(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+(\d{1,2})\s+(\d{4})/i
  );

  if (longMatch) {
    const monthName = longMatch[1].toLowerCase();
    const month = MONTHS[monthName];

    if (!month) {
      throw new Error(`Unable to read month from date: ${value}`);
    }

    const day = longMatch[2].padStart(2, "0");
    const year = longMatch[3];

    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  }

  throw new Error(`Unable to read date: ${value}`);
}

function formatDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function todayEasternDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(new Date());
}

function findDateBeforeGame(lines, gameIndex) {
  for (let i = gameIndex - 1; i >= Math.max(0, gameIndex - 8); i--) {
    try {
      return dateKeyFromText(lines[i]);
    } catch {
      continue;
    }
  }

  throw new Error("Unable to find draw date");
}

function findNumbersAfterGame(lines, gameIndex, expectedCount) {
  for (let i = gameIndex + 1; i < Math.min(lines.length, gameIndex + 12); i++) {
    const numbers = getNumbersFromLine(lines[i]);

    if (numbers.length === expectedCount) {
      return numbers;
    }
  }

  throw new Error("Unable to find winning numbers");
}

function parseWsbGame(lines, gameName, expectedCount) {
  const target = normalizeText(gameName);

  for (let i = 0; i < lines.length; i++) {
    if (normalizeText(lines[i]) !== target) {
      continue;
    }

    return {
      source: "WSB-TV Lottery Results",
      dateKey: findDateBeforeGame(lines, i),
      numbers: findNumbersAfterGame(lines, i, expectedCount)
    };
  }

  throw new Error(`Unable to find ${gameName}`);
}

function parsePowerballOfficial(html) {
  const text = htmlToLines(html).join(" ");
  const match = text.match(
    /((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+Power Play/i
  );

  if (!match) {
    throw new Error("Unable to read official Powerball result");
  }

  return {
    source: "Official Powerball Previous Results",
    dateKey: dateKeyFromText(match[1]),
    numbers: [match[2], match[3], match[4], match[5], match[6], match[7]]
  };
}

function validateNumberRange(gameName, numbers, min, max) {
  numbers.forEach((number) => {
    const value = Number(number);

    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${gameName} has an invalid number: ${number}`);
    }
  });
}

function validatePowerball(result) {
  if (!result || result.numbers.length !== 6) {
    throw new Error("Powerball result is incomplete");
  }

  validateNumberRange("Powerball main numbers", result.numbers.slice(0, 5), 1, 69);
  validateNumberRange("Powerball number", result.numbers.slice(5), 1, 26);
}

function validateMegaMillions(result) {
  if (!result || result.numbers.length !== 6) {
    throw new Error("Mega Millions result is incomplete");
  }

  validateNumberRange("Mega Millions main numbers", result.numbers.slice(0, 5), 1, 70);
  validateNumberRange("Mega Ball number", result.numbers.slice(5), 1, 24);
}

function validateGeorgiaFive(result) {
  if (!result || result.numbers.length !== 5) {
    throw new Error("Georgia Five result is incomplete");
  }

  validateNumberRange("Georgia Five numbers", result.numbers, 0, 9);
}

function validateFantasyFive(result) {
  if (!result || result.numbers.length !== 5) {
    throw new Error("Fantasy 5 result is incomplete");
  }

  validateNumberRange("Fantasy 5 numbers", result.numbers, 1, 42);
}

function resultsMatch(firstResult, secondResult) {
  if (!firstResult || !secondResult) {
    return false;
  }

  return (
    firstResult.dateKey === secondResult.dateKey &&
    firstResult.numbers.join(",") === secondResult.numbers.join(",")
  );
}

async function buildLatestResults() {
  const wsbHtml = await fetchText(SOURCES.wsbLottery, "WSB-TV Lottery Results");
  const wsbLines = htmlToLines(wsbHtml);

  const wsbPowerball = parseWsbGame(wsbLines, "Powerball", 6);
  validatePowerball(wsbPowerball);

  const powerballOfficialHtml = await fetchOptionalText(
    SOURCES.powerballOfficial,
    "Official Powerball Previous Results"
  );

  let powerballResult = wsbPowerball;

  if (powerballOfficialHtml) {
    try {
      const officialPowerball = parsePowerballOfficial(powerballOfficialHtml);
      validatePowerball(officialPowerball);

      if (!resultsMatch(officialPowerball, wsbPowerball)) {
        console.log("Powerball backup result does not match official source. Official Powerball result was used.");
      }

      powerballResult = officialPowerball;
    } catch (error) {
      console.log(`Official Powerball source skipped: ${error.message}`);
    }
  }

  const megaResult = parseWsbGame(wsbLines, "Mega Millions", 6);
  validateMegaMillions(megaResult);

  const georgiaFiveMidday = parseWsbGame(wsbLines, "Georgia FIVE Midday", 5);
  validateGeorgiaFive(georgiaFiveMidday);

  const georgiaFiveEvening = parseWsbGame(wsbLines, "Georgia FIVE Evening", 5);
  validateGeorgiaFive(georgiaFiveEvening);

  const fantasyFive = parseWsbGame(wsbLines, "Fantasy 5 Night", 5);
  validateFantasyFive(fantasyFive);

  const lastUpdated = todayEasternDate();

  return {
    powerball: {
      gameName: "Powerball",
      status: "Latest result reviewed daily",
      drawDate: formatDateFromKey(powerballResult.dateKey),
      winningNumbers: formatNumbers(powerballResult.numbers.slice(0, 5), true),
      extraNumberLabel: "Powerball Number",
      extraNumber: padTwo(powerballResult.numbers[5]),
      lastUpdated
    },

    mega: {
      gameName: "Mega Millions",
      status: "Latest result reviewed daily",
      drawDate: formatDateFromKey(megaResult.dateKey),
      winningNumbers: formatNumbers(megaResult.numbers.slice(0, 5), true),
      extraNumberLabel: "Mega Ball Number",
      extraNumber: padTwo(megaResult.numbers[5]),
      lastUpdated
    },

    pick5: {
      gameName: "Pick 5 / Georgia Five",
      status: "Latest result reviewed daily",
      drawDate: formatDateFromKey(georgiaFiveEvening.dateKey),
      winningNumbers: `Midday: ${formatNumbers(georgiaFiveMidday.numbers, false)} | Evening: ${formatNumbers(georgiaFiveEvening.numbers, false)}`,
      drawType: "Midday and Evening",
      lastUpdated
    },

    fantasy5: {
      gameName: "Fantasy 5 / Georgia Fantasy 5",
      status: "Latest result reviewed daily",
      drawDate: formatDateFromKey(fantasyFive.dateKey),
      winningNumbers: formatNumbers(fantasyFive.numbers, true),
      drawType: "Night draw",
      lastUpdated
    }
  };
}

function writeLatestResultsFile(latestResults) {
  const outputPath = path.join(__dirname, "..", "latest-results.js");
  const output = `const latestResults = ${JSON.stringify(latestResults, null, 2)};\n`;

  fs.writeFileSync(outputPath, output, "utf8");
}

buildLatestResults()
  .then((latestResults) => {
    writeLatestResultsFile(latestResults);
    console.log("latest-results.js updated successfully.");
  })
  .catch((error) => {
    console.error("Latest results update failed.");
    console.error(error.message);
    process.exit(1);
  });
