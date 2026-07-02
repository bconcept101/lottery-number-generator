const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

const INPUT_FILE = path.join(
  PROJECT_ROOT,
  "data",
  "raw",
  "mega-millions.csv"
);

const CLEANED_DIR = path.join(PROJECT_ROOT, "data", "cleaned");

const OUTPUT_FILE = path.join(
  CLEANED_DIR,
  "mega-millions-history-cleaned.json"
);

const REVIEW_FILE = path.join(
  PROJECT_ROOT,
  "MEGA-MILLIONS-DUPLICATE-REVIEW.md"
);

const SOURCE_NAME = "New York Open Data Mega Millions Beginning 2002";
const SOURCE_URL =
  "https://data.ny.gov/Government-Finance/Lottery-Mega-Millions-Winning-Numbers-Beginning-20/5xaw-6ayf";

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }

      row.push(field);

      if (row.some((entry) => String(entry).trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);

  if (row.some((entry) => String(entry).trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function findColumn(headers, possibleNames) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedPossibleNames = possibleNames.map(normalizeHeader);

  const index = normalizedHeaders.findIndex((header) =>
    normalizedPossibleNames.includes(header)
  );

  return index;
}

function dateKeyFromText(value) {
  const text = String(value || "").trim();

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[3]}-${padTwo(slashMatch[1])}-${padTwo(slashMatch[2])}`;
  }

  const dashMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dashMatch) {
    return `${dashMatch[1]}-${padTwo(dashMatch[2])}-${padTwo(dashMatch[3])}`;
  }

  const parsedDate = new Date(text);
  if (!Number.isNaN(parsedDate.getTime())) {
    return `${parsedDate.getUTCFullYear()}-${padTwo(
      parsedDate.getUTCMonth() + 1
    )}-${padTwo(parsedDate.getUTCDate())}`;
  }

  throw new Error(`Invalid draw date: ${value}`);
}

function numbersFromText(value) {
  return Array.from(String(value || "").matchAll(/\d+/g)).map((match) =>
    Number.parseInt(match[0], 10)
  );
}

function validateMainNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error(`Expected 5 main numbers but found ${numbers.length}`);
  }

  numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 75) {
      throw new Error(`Invalid main number: ${number}`);
    }
  });
}

function validateMegaBall(number) {
  if (!Number.isInteger(number) || number < 1 || number > 52) {
    throw new Error(`Invalid Mega Ball: ${number}`);
  }
}

function comboKey(record) {
  return `${record.numbers.join("-")}|${record.extra_number}`;
}

function cleanHistory() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing input file: ${INPUT_FILE}`);
  }

  fs.mkdirSync(CLEANED_DIR, { recursive: true });

  const rawText = fs.readFileSync(INPUT_FILE, "utf8");
  const rows = parseCsv(rawText);

  if (rows.length < 2) {
    throw new Error("CSV file does not contain enough rows.");
  }

  const headers = rows[0];

  const drawDateIndex = findColumn(headers, [
    "Draw Date",
    "DrawDate",
    "Date"
  ]);

  const winningNumbersIndex = findColumn(headers, [
    "Winning Numbers",
    "WinningNumbers",
    "Numbers"
  ]);

  const megaBallIndex = findColumn(headers, [
    "Mega Ball",
    "MegaBall",
    "Megaball"
  ]);

  const multiplierIndex = findColumn(headers, [
    "Multiplier",
    "Megaplier"
  ]);

  if (drawDateIndex === -1) {
    throw new Error("Could not find Draw Date column.");
  }

  if (winningNumbersIndex === -1) {
    throw new Error("Could not find Winning Numbers column.");
  }

  const cleanedRecords = [];
  const rejectedRows = [];

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;

    try {
      const drawDate = dateKeyFromText(row[drawDateIndex]);
      const parsedNumbers = numbersFromText(row[winningNumbersIndex]);

      let mainNumbers = parsedNumbers.slice(0, 5);
      let megaBall =
        megaBallIndex >= 0
          ? numbersFromText(row[megaBallIndex])[0]
          : parsedNumbers[5];

      mainNumbers = mainNumbers
        .map((number) => Number.parseInt(number, 10))
        .sort((a, b) => a - b);

      megaBall = Number.parseInt(megaBall, 10);

      validateMainNumbers(mainNumbers);
      validateMegaBall(megaBall);

      const multiplier =
        multiplierIndex >= 0
          ? String(row[multiplierIndex] || "").trim()
          : "";

      cleanedRecords.push({
        game: "mega_millions",
        draw_date: drawDate,
        numbers: mainNumbers,
        extra_number: megaBall,
        extra_number_name: "Mega Ball",
        multiplier: multiplier || null,
        source: SOURCE_NAME,
        source_url: SOURCE_URL
      });
    } catch (error) {
      rejectedRows.push({
        rowNumber,
        reason: error.message,
        raw: row
      });
    }
  });

  cleanedRecords.sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  const seenDates = new Map();
  const finalRecords = [];
  const duplicateDateRows = [];

  cleanedRecords.forEach((record) => {
    if (seenDates.has(record.draw_date)) {
      duplicateDateRows.push({
        draw_date: record.draw_date,
        kept: seenDates.get(record.draw_date),
        rejected: record
      });
      return;
    }

    seenDates.set(record.draw_date, record);
    finalRecords.push(record);
  });

  const comboMap = new Map();

  finalRecords.forEach((record) => {
    const key = comboKey(record);

    if (!comboMap.has(key)) {
      comboMap.set(key, []);
    }

    comboMap.get(key).push(record.draw_date);
  });

  const repeatedExactCombinations = Array.from(comboMap.entries())
    .filter(([, dates]) => dates.length > 1)
    .map(([combination, dates]) => ({
      combination,
      dates
    }));

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(finalRecords, null, 2),
    "utf8"
  );

  const oldestDate = finalRecords[0]?.draw_date || "none";
  const newestDate = finalRecords[finalRecords.length - 1]?.draw_date || "none";

  const review = [
    "# Mega Millions Duplicate Review",
    "",
    "## Summary",
    "",
    `Cleaned records: ${finalRecords.length}`,
    `Date range: ${oldestDate} through ${newestDate}`,
    `Rejected invalid rows: ${rejectedRows.length}`,
    `Rejected duplicate draw-date rows: ${duplicateDateRows.length}`,
    `Repeated exact combinations: ${repeatedExactCombinations.length}`,
    "",
    "## Output file",
    "",
    "```text",
    "data/cleaned/mega-millions-history-cleaned.json",
    "```",
    "",
    "## Duplicate draw dates",
    "",
    duplicateDateRows.length === 0
      ? "No duplicate draw dates found."
      : duplicateDateRows
          .map((entry) => `- ${entry.draw_date}`)
          .join("\n"),
    "",
    "## Repeated exact combinations",
    "",
    repeatedExactCombinations.length === 0
      ? "No repeated exact combinations found."
      : repeatedExactCombinations
          .map(
            (entry) =>
              `- ${entry.combination}: ${entry.dates.join(", ")}`
          )
          .join("\n"),
    "",
    "## Rejected rows",
    "",
    rejectedRows.length === 0
      ? "No invalid rows rejected."
      : rejectedRows
          .slice(0, 100)
          .map((entry) => `- Row ${entry.rowNumber}: ${entry.reason}`)
          .join("\n"),
    ""
  ].join("\n");

  fs.writeFileSync(REVIEW_FILE, review, "utf8");

  console.log("Mega Millions history cleaning complete.");
  console.log(`Cleaned records: ${finalRecords.length}`);
  console.log(`Date range: ${oldestDate} through ${newestDate}`);
  console.log(`Rejected invalid rows: ${rejectedRows.length}`);
  console.log(`Rejected duplicate draw-date rows: ${duplicateDateRows.length}`);
  console.log(`Repeated exact combinations: ${repeatedExactCombinations.length}`);
}

cleanHistory();
