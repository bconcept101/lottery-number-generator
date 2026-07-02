const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

const EARLY_FILE = path.join(
  PROJECT_ROOT,
  "data",
  "cleaned",
  "mega-millions-early-backfill-cleaned.json"
);

const MAIN_FILE = path.join(
  PROJECT_ROOT,
  "data",
  "cleaned",
  "mega-millions-history-cleaned.json"
);

const OUTPUT_FILE = path.join(
  PROJECT_ROOT,
  "data",
  "cleaned",
  "mega-millions-history-complete.json"
);

const REVIEW_FILE = path.join(
  PROJECT_ROOT,
  "MEGA-MILLIONS-COMPLETE-HISTORY-REVIEW.md"
);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid draw date: ${value}`);
  }
}

function validateRecord(record) {
  validateDate(record.draw_date);

  if (record.game !== "mega_millions") {
    throw new Error(`Invalid game value on ${record.draw_date}`);
  }

  if (!Array.isArray(record.numbers) || record.numbers.length !== 5) {
    throw new Error(`Invalid main numbers on ${record.draw_date}`);
  }

  record.numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 75) {
      throw new Error(`Invalid main number on ${record.draw_date}: ${number}`);
    }
  });

  if (
    !Number.isInteger(record.extra_number) ||
    record.extra_number < 1 ||
    record.extra_number > 52
  ) {
    throw new Error(
      `Invalid Mega Ball / Bonus number on ${record.draw_date}: ${record.extra_number}`
    );
  }
}

function normalizeRecord(record) {
  const normalized = {
    game: "mega_millions",
    draw_date: record.draw_date,
    numbers: [...record.numbers].sort((a, b) => a - b),
    extra_number: record.extra_number,
    extra_number_name: "Mega Ball",
    multiplier: record.multiplier || null,
    source: record.source || null,
    source_url: record.source_url || null
  };

  validateRecord(normalized);

  return normalized;
}

function comboKey(record) {
  return `${record.numbers.join("-")}|${record.extra_number}`;
}

function combineMegaMillionsHistory() {
  const earlyRecords = readJson(EARLY_FILE).map(normalizeRecord);
  const mainRecords = readJson(MAIN_FILE).map(normalizeRecord);

  const combinedRawRecords = [
    ...earlyRecords,
    ...mainRecords
  ];

  combinedRawRecords.sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  const seenDates = new Map();
  const finalRecords = [];
  const duplicateDateRows = [];

  combinedRawRecords.forEach((record) => {
    const existing = seenDates.get(record.draw_date);

    if (existing) {
      duplicateDateRows.push({
        draw_date: record.draw_date,
        kept: existing,
        duplicate: record
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
    "# Mega Millions Complete History Review",
    "",
    "## Summary",
    "",
    `Early backfill records: ${earlyRecords.length}`,
    `Main history records: ${mainRecords.length}`,
    `Combined raw records: ${combinedRawRecords.length}`,
    `Final complete records: ${finalRecords.length}`,
    `Date range: ${oldestDate} through ${newestDate}`,
    `Duplicate draw-date rows removed: ${duplicateDateRows.length}`,
    `Repeated exact combinations: ${repeatedExactCombinations.length}`,
    "",
    "## Output file",
    "",
    "```text",
    "data/cleaned/mega-millions-history-complete.json",
    "```",
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
    ""
  ].join("\n");

  fs.writeFileSync(REVIEW_FILE, review, "utf8");

  console.log("Mega Millions complete history combine complete.");
  console.log(`Early backfill records: ${earlyRecords.length}`);
  console.log(`Main history records: ${mainRecords.length}`);
  console.log(`Combined raw records: ${combinedRawRecords.length}`);
  console.log(`Final complete records: ${finalRecords.length}`);
  console.log(`Date range: ${oldestDate} through ${newestDate}`);
  console.log(`Duplicate draw-date rows removed: ${duplicateDateRows.length}`);
  console.log(`Repeated exact combinations: ${repeatedExactCombinations.length}`);
}

combineMegaMillionsHistory();
