const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SOURCES = {
  powerballNyOpenData: "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1",
  megaNyOpenData: "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1",
  georgiaFiveMidday: "https://www.lotteryusa.com/georgia/midday-georgia-five/",
  georgiaFiveEvening: "https://www.lotteryusa.com/georgia/georgia-five/",
  fantasyFive: "https://www.lotteryusa.com/georgia/fantasy-5/"
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

function readCurrentLatestResults() {
  const filePath = path.join(__dirname, "..", "latest-results.js");

  if (!fs.existsSync(filePath)) {
    return {
      powerball: {},
      mega: {},
      pick5: {},
      fantasy5: {}
    };
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const sandbox = {};
    vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox);
    return sandbox.result || {};
  } catch (error) {
    console.log(`Existing latest-results.js could not be read: ${error.message}`);

    return {
      powerball: {},
      mega: {},
      pick5: {},
      fantasy5: {}
    };
  }
}

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

async function fetchJson(url, sourceName) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LotteryNumberGeneratorBot/1.0",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`${sourceName} could not be reached`);
  }

  return response.json();
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

function getNumbers(value) {
  return String(value || "").match(/\d+/g) || [];
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

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

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

function validateNumberRange(gameName, numbers, min, max) {
  numbers.forEach((number) => {
    const value = Number(number);

    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${gameName} has an invalid number: ${number}`);
    }
  });
}

function parseLotteryUsaLatest(html, expectedCount) {
  const lines = htmlToLines(html);
  const latestIndex = lines.findIndex((line) => normalizeText(line) === "latest numbers");

  if (latestIndex === -1) {
    throw new Error("Latest numbers section was not found");
  }

  let dateText = "";
  let dateIndex = -1;

  for (let i = latestIndex; i < Math.min(lines.length, latestIndex + 30); i++) {
    if (/(sunday|monday|tuesday|wednesday|thursday|friday|saturday),/i.test(lines[i])) {
      dateText = lines[i];
      dateIndex = i;
      break;
    }
  }

  if (!dateText) {
    throw new Error("Latest draw date was not found");
  }

  const numbers = [];

  for (let i = dateIndex + 1; i < Math.min(lines.length, dateIndex + 40); i++) {
    const foundNumbers = getNumbers(lines[i]);

    foundNumbers.forEach((number) => {
      if (numbers.length < expectedCount) {
        numbers.push(number);
      }
    });

    if (numbers.length === expectedCount) {
      break;
    }
  }

  if (numbers.length !== expectedCount) {
    throw new Error("Latest winning numbers were not found");
  }

  return {
    dateKey: dateKeyFromText(dateText),
    numbers
  };
}

function buildPowerballFromNyOpenData(row, lastUpdated) {
  const numbers = getNumbers(row.winning_numbers);

  if (numbers.length < 6) {
    throw new Error("Powerball numbers are incomplete");
  }

  const mainNumbers = numbers.slice(0, 5);
  const powerballNumber = numbers[5];

  validateNumberRange("Powerball main numbers", mainNumbers, 1, 69);
  validateNumberRange("Powerball number", [powerballNumber], 1, 26);

  return {
    gameName: "Powerball",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(dateKeyFromText(row.draw_date)),
    winningNumbers: formatNumbers(mainNumbers, true),
    extraNumberLabel: "Powerball Number",
    extraNumber: padTwo(powerballNumber),
    lastUpdated
  };
}

function buildMegaFromNyOpenData(row, lastUpdated) {
  const mainNumbers = getNumbers(row.winning_numbers).slice(0, 5);
  const megaBallNumber = row.mega_ball ? getNumbers(row.mega_ball)[0] : getNumbers(row.winning_numbers)[5];

  if (mainNumbers.length !== 5 || !megaBallNumber) {
    throw new Error("Mega Millions numbers are incomplete");
  }

  validateNumberRange("Mega Millions main numbers", mainNumbers, 1, 70);
  validateNumberRange("Mega Ball number", [megaBallNumber], 1, 24);

  return {
    gameName: "Mega Millions",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(dateKeyFromText(row.draw_date)),
    winningNumbers: formatNumbers(mainNumbers, true),
    extraNumberLabel: "Mega Ball Number",
    extraNumber: padTwo(megaBallNumber),
    lastUpdated
  };
}

function buildGeorgiaFive(middayResult, eveningResult, lastUpdated) {
  validateNumberRange("Georgia Five Midday numbers", middayResult.numbers, 0, 9);
  validateNumberRange("Georgia Five Evening numbers", eveningResult.numbers, 0, 9);

  return {
    gameName: "Pick 5 / Georgia Five",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(eveningResult.dateKey),
    winningNumbers: `Midday: ${formatNumbers(middayResult.numbers, false)} | Evening: ${formatNumbers(eveningResult.numbers, false)}`,
    drawType: "Midday and Evening",
    lastUpdated
  };
}

function buildFantasyFive(result, lastUpdated) {
  validateNumberRange("Fantasy 5 numbers", result.numbers, 1, 42);

  return {
    gameName: "Fantasy 5 / Georgia Fantasy 5",
    status: "Latest result reviewed daily",
    drawDate: formatDateFromKey(result.dateKey),
    winningNumbers: formatNumbers(result.numbers, true),
    drawType: "Night draw",
    lastUpdated
  };
}

async function updateGame(gameKey, currentResults, updateFunction) {
  try {
    const updatedGame = await updateFunction();
    console.log(`${updatedGame.gameName} updated successfully.`);
    return updatedGame;
  } catch (error) {
    console.log(`${gameKey} update skipped: ${error.message}`);
    return currentResults[gameKey] || {};
  }
}

async function buildLatestResults() {
  const currentResults = readCurrentLatestResults();
  const lastUpdated = todayEasternDate();

  const powerball = await updateGame("powerball", currentResults, async () => {
    const rows = await fetchJson(SOURCES.powerballNyOpenData, "NY Open Data Powerball");
    if (!Array.isArray(rows) || !rows[0]) {
      throw new Error("No Powerball rows returned");
    }

    return buildPowerballFromNyOpenData(rows[0], lastUpdated);
  });

  const mega = await updateGame("mega", currentResults, async () => {
    const rows = await fetchJson(SOURCES.megaNyOpenData, "NY Open Data Mega Millions");
    if (!Array.isArray(rows) || !rows[0]) {
      throw new Error("No Mega Millions rows returned");
    }

    return buildMegaFromNyOpenData(rows[0], lastUpdated);
  });

  const pick5 = await updateGame("pick5", currentResults, async () => {
    const [middayHtml, eveningHtml] = await Promise.all([
      fetchText(SOURCES.georgiaFiveMidday, "Georgia Five Midday"),
      fetchText(SOURCES.georgiaFiveEvening, "Georgia Five Evening")
    ]);

    const middayResult = parseLotteryUsaLatest(middayHtml, 5);
    const eveningResult = parseLotteryUsaLatest(eveningHtml, 5);

    return buildGeorgiaFive(middayResult, eveningResult, lastUpdated);
  });

  const fantasy5 = await updateGame("fantasy5", currentResults, async () => {
    const fantasyHtml = await fetchText(SOURCES.fantasyFive, "Fantasy 5");
    const fantasyResult = parseLotteryUsaLatest(fantasyHtml, 5);

    return buildFantasyFive(fantasyResult, lastUpdated);
  });

  return {
    powerball,
    mega,
    pick5,
    fantasy5
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
    console.log("latest-results.js update process completed.");
  })
  .catch((error) => {
    console.error("Latest results update process failed.");
    console.error(error.message);
    process.exit(1);
  });
