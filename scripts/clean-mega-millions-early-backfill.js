const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

const INPUT_FILE = path.join(
  PROJECT_ROOT,
  "data",
  "raw",
  "mega-millions-early-backfill-1996-2002.html"
);

const CLEANED_DIR = path.join(PROJECT_ROOT, "data", "cleaned");

const OUTPUT_FILE = path.join(
  CLEANED_DIR,
  "mega-millions-early-backfill-cleaned.json"
);

const REVIEW_FILE = path.join(
  PROJECT_ROOT,
  "MEGA-MILLIONS-EARLY-BACKFILL-REVIEW.md"
);

const SOURCE_NAME = "LottoReport Mega Millions / Big Game Early Backfill";
const SOURCE_URL = "https://lottoreport.com/mmresults96.htm";

const MAIN_IMPORT_START_DATE = "2002-05-17";

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(td|tr|p|div|font|b|center|table)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function dateKeyFromShortDate(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);

  if (!match) {
    throw new Error(`Invalid short date: ${value}`);
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const shortYear = Number(match[3]);
  const year = shortYear >= 90 ? 1900 + shortYear : 2000 + shortYear;

  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function validateRecord(record) {
  if (!record.draw_date) {
    throw new Error("Missing draw date.");
  }

  if (!Array.isArray(record.numbers) || record.numbers.length !== 5) {
    throw new Error("Record must have exactly 5 main numbers.");
  }

  record.numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 75) {
      throw new Error(`Invalid main number: ${number}`);
    }
  });

  if (
    !Number.isInteger(record.extra_number) ||
    record.extra_number < 1 ||
    record.extra_number > 52
  ) {
    throw new Error(`Invalid Mega Ball / Bonus number: ${record.extra_number}`);
  }
}

function comboKey(record) {
  return `${record.numbers.join("-")}|${record.extra_number}`;
}

function parseEarlyBackfillHtml(html) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const parsedRows = [];
  const rejectedRows = [];

  rows.forEach((rowHtml, index) => {
    const rowNumber = index + 1;
    const text = stripHtml(rowHtml);

    const dateMatch = text.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b/);
    const numberMatch = text.match(
      /\b(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\s+Bonus\s+(\d{1,2})\b/i
    );

    if (!dateMatch && !numberMatch) {
      return;
    }

    try {
      if (!dateMatch) {
        throw new Error("Missing draw date.");
      }

      if (!numberMatch) {
        throw new Error("Missing winning numbers.");
      }

      const drawDate = dateKeyFromShortDate(dateMatch[0]);

      const mainNumbers = [
        Number(numberMatch[1]),
        Number(numberMatch[2]),
        Number(numberMatch[3]),
        Number(numberMatch[4]),
        Number(numberMatch[5])
      ].sort((a, b) => a - b);

      const megaBall = Number(numberMatch[6]);

      const record = {
        game: "mega_millions",
        draw_date: drawDate,
        numbers: mainNumbers,
        extra_number: megaBall,
        extra_number_name: "Mega Ball",
        multiplier: null,
        source: SOURCE_NAME,
        source_url: SOURCE_URL
      };

      validateRecord(record);
      parsedRows.push(record);
    } catch (error) {
      rejectedRows.push({
        rowNumber,
        reason: error.message,
        text
      });
    }
  });

  return {
    parsedRows,
    rejectedRows
  };
}

function cleanEarlyBackfill() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing input file: ${INPUT_FILE}`);
  }

  fs.mkdirSync(CLEANED_DIR, { recursive: true });

  const html = fs.readFileSync(INPUT_FILE, "utf8");
  const { parsedRows, rejectedRows } = parseEarlyBackfillHtml(html);

  const skippedOverlapRows = parsedRows.filter(
    (record) => record.draw_date >= MAIN_IMPORT_START_DATE
  );

  const backfillRows = parsedRows.filter(
    (record) => record.draw_date < MAIN_IMPORT_START_DATE
  );

  backfillRows.sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  const seenDates = new Map();
  const finalRecords = [];
  const duplicateDateRows = [];

  backfillRows.forEach((record) => {
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
    "# Mega Millions Early Backfill Review",
    "",
    "## Summary",
    "",
    `Parsed rows: ${parsedRows.length}`,
    `Cleaned backfill records: ${finalRecords.length}`,
    `Date range: ${oldestDate} through ${newestDate}`,
    `Skipped overlap rows from ${MAIN_IMPORT_START_DATE} forward: ${skippedOverlapRows.length}`,
    `Rejected invalid rows: ${rejectedRows.length}`,
    `Rejected duplicate draw-date rows: ${duplicateDateRows.length}`,
    `Repeated exact combinations: ${repeatedExactCombinations.length}`,
    "",
    "## Output file",
    "",
    "```text",
    "data/cleaned/mega-millions-early-backfill-cleaned.json",
    "```",
    "",
    "## Overlap handling",
    "",
    `Rows dated ${MAIN_IMPORT_START_DATE} or later were skipped because the New York Open Data Mega Millions file already starts on ${MAIN_IMPORT_START_DATE}.`,
    "",
    "## Duplicate draw dates",
    "",
    duplicateDateRows.length === 0
      ? "No duplicate draw dates found."
      : duplicateDateRows.map((entry) => `- ${entry.draw_date}`).join("\n"),
    "",
    "## Repeated exact combinations",
    "",
    repeatedExactCombinations.length === 0
      ? "No repeated exact combinations found."
      : repeatedExactCombinations
          .map((entry) => `- ${entry.combination}: ${entry.dates.join(", ")}`)
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

  console.log("Mega Millions early backfill cleaning complete.");
  console.log(`Parsed rows: ${parsedRows.length}`);
  console.log(`Cleaned backfill records: ${finalRecords.length}`);
  console.log(`Date range: ${oldestDate} through ${newestDate}`);
  console.log(`Skipped overlap rows from ${MAIN_IMPORT_START_DATE} forward: ${skippedOverlapRows.length}`);
  console.log(`Rejected invalid rows: ${rejectedRows.length}`);
  console.log(`Rejected duplicate draw-date rows: ${duplicateDateRows.length}`);
  console.log(`Repeated exact combinations: ${repeatedExactCombinations.length}`);
}

cleanEarlyBackfill();
