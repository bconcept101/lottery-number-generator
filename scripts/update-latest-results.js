const fs = require("fs");
const path = require("path");

const SOURCES = {
  powerballOfficial: "https://www.powerball.com/previous-results",
  lotteryUsaPowerball: "https://www.lotteryusa.com/powerball/",
  lotteryUsaMega: "https://www.lotteryusa.com/mega-millions/",
  lotteryUsaGeorgiaFiveMidday: "https://www.lotteryusa.com/georgia/midday-georgia-five/",
  lotteryUsaGeorgiaFiveEvening: "https://www.lotteryusa.com/georgia/georgia-five/",
  lotteryUsaFantasyFive: "https://www.lotteryusa.com/georgia/fantasy-5/",
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LotteryNumberGeneratorBot/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch source: ${url}`);
  }

  return response.text();
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
  return numbers.map((number) => (useLeadingZero ? padTwo(number) : String(number))).join(" - ");
}

function dateKeyFromText(value) {
  const text = String(value || "").replace(",", "").replace(/\s+/g, " ").trim();

  const shortMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (shortMatch) {
    const month = shortMatch[1].padStart(2, "0");
    const day = shortMatch[2].padStart(2, "0");
    const year = shortMatch[3];
    return `${year}-${month}-${day}`;
  }

  const longMatch = text.match(/(?:sun|mon|tue|wed|thu|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)?\.?,?\s*([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
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

function parsePowerballOfficial(html) {
  const text = htmlToLines(html).join(" ");
  const match = text.match(/((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+Power Play/i);

  if (!match) {
    throw new Error("Unable to parse official Powerball result");
  }

  return {
    dateKey: dateKeyFromText(match[1]),
    numbers: [match[2], match[3], match[4], match[5], match[6], match[7]]
  };
}

function parseLotteryUsaLatest(html, expectedCount) {
  const lines = htmlToLines(html);
  const latestIndex = lines.findIndex((line) => normalizeText(line) === "latest numbers");

  if (latestIndex === -1) {
    throw new Error("Unable to find latest numbers section");
  }

  let dateText = null;
  let dateIndex = -1;

  for (let i = latestIndex; i < Math.min(lines.length, latestIndex + 30); i++) {
    if (/(sunday|monday|tuesday|wednesday|thursday|friday|saturday),/i.test(lines[i])) {
      dateText = lines[i];
      dateIndex = i;
      break;
    }
  }

  if (!dateText) {
    throw new Error("Unable to find latest result date");
  }

  const numbers = [];

  for (let i = dateIndex + 1; i < Math.min(lines.length, dateIndex + 30); i++) {
    const foundNumbers = getNumbersFromLine(lines[i]);

    if (foundNumbers.length === 1) {
      numbers.push(foundNumbers[0]);
    }

    if (numbers.length === expectedCount) {
      break;
    }
  }

  if (numbers.length !== expectedCount) {
    throw new Error("Unable to read latest result numbers");
  }

  return {
    dateKey: dateKeyFromText(dateText),
    numbers
  };
}

function compareResults(gameName, primaryResult, backupResult) {
  if (!backupResult) {
    return;
  }

  if (primaryResult.dateKey !== backupResult.dateKey) {
    throw new Error(`${gameName} verification failed: draw dates do not match`);
  }

  if (primaryResult.numbers.join(",") !== backupResult.numbers.join(",")) {
    throw new Error(`${gameName} verification failed: winning numbers do not match`);
  }
}

async function safeParseBackup(sourceName, parseFunction) {
  try {
    return await parseFunction();
  } catch (error) {
    console.log(`${sourceName} backup check skipped: ${error.message}`);
    return null;
  }
}

async function buildLatestResults() {
  const [
    powerballOfficialHtml,
    powerballLotteryUsaHtml,
    megaLotteryUsaHtml,
    georgiaFiveMiddayHtml,
    georgiaFiveEveningHtml,
    fantasyFiveHtml
  ] = await Promise.all([
    fetchText(SOURCES.powerballOfficial),
    fetchText(SOURCES.lotteryUsaPowerball),
    fetchText(SOURCES.lotteryUsaMega),
    fetchText(SOURCES.lotteryUsaGeorgiaFiveMidday),
    fetchText(SOURCES.lotteryUsaGeorgiaFiveEvening),
    fetchText(SOURCES.lotteryUsaFantasyFive)
  ]);

  const powerballOfficial = parsePowerballOfficial(powerballOfficialHtml);
  const powerballBackup = await safeParseBackup("Powerball LotteryUSA", async () =>
    parseLotteryUsaLatest(powerballLotteryUsaHtml, 6)
  );
  compareResults("Powerball", powerballOfficial, powerballBackup);

  const megaResult = parseLotteryUsaLatest(megaLotteryUsaHtml, 6);
  const georgiaFiveMidday = parseLotteryUsaLatest(georgiaFiveMiddayHtml, 5);
  const georgiaFiveEvening = parseLotteryUsaLatest(georgiaFiveEveningHtml, 5);
  const fantasyFive = parseLotteryUsaLatest(fantasyFiveHtml, 5);

  const lastUpdated = todayEasternDate();

  return {
    powerball: {
      gameName: "Powerball",
      status: "Latest result reviewed daily",
      drawDate: formatDateFromKey(powerballOfficial.dateKey),
      winningNumbers: formatNumbers(powerballOfficial.numbers.slice(0, 5), true),
      extraNumberLabel: "Powerball Number",
      extraNumber: padTwo(powerballOfficial.numbers[5]),
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
