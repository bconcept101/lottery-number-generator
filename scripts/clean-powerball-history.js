const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "..", "data", "raw", "powerball.csv");
const CLEANED_OUTPUT_FILE = path.join(__dirname, "..", "data", "cleaned", "powerball-history-cleaned.json");
const REVIEW_OUTPUT_FILE = path.join(__dirname, "..", "POWERBALL-DUPLICATE-REVIEW.md");

const SOURCE_URL = "https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/download.html";

function ensureDirectory(filePath) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    const nextCharacter = line[i + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      i++;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());

  return values;
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Raw Powerball CSV file was not found at: ${filePath}`);
  }

  return fs
    .readFileSync(filePath, "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
}

function toInteger(value, fieldName, rowNumber) {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new Error(`Row ${rowNumber}: ${fieldName} is not a valid integer.`);
  }

  return number;
}

function buildDate(year, month, day, rowNumber) {
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Row ${rowNumber}: invalid draw date.`);
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function buildCombinationKey(mainNumbers, powerballNumber) {
  return `${mainNumbers.join("-")}-PB-${powerballNumber}`;
}

function buildSortedCombinationKey(mainNumbers, powerballNumber) {
  return `${[...mainNumbers].sort((a, b) => a - b).join("-")}-PB-${powerballNumber}`;
}

function validateMainNumbers(mainNumbers, rowNumber) {
  if (mainNumbers.length !== 5) {
    throw new Error(`Row ${rowNumber}: Powerball must have exactly five main numbers.`);
  }

  const uniqueNumbers = new Set(mainNumbers);

  if (uniqueNumbers.size !== mainNumbers.length) {
    throw new Error(`Row ${rowNumber}: repeated main number found.`);
  }

  mainNumbers.forEach((number) => {
    if (number < 1 || number > 69) {
      throw new Error(`Row ${rowNumber}: main number ${number} is outside the expected historical range.`);
    }
  });
}

function validatePowerballNumber(powerballNumber, rowNumber) {
  if (powerballNumber < 1 || powerballNumber > 42) {
    throw new Error(`Row ${rowNumber}: Powerball number ${powerballNumber} is outside the expected historical range.`);
  }
}

function cleanPowerballRows(rows) {
  const cleanedRecords = [];
  const rejectedRows = [];
  const duplicateDrawDates = [];
  const duplicateCombinationKeys = [];
  const duplicateSortedCombinationKeys = [];

  const seenDrawDates = new Map();
  const seenCombinationKeys = new Map();
  const seenSortedCombinationKeys = new Map();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    try {
      if (row.length < 11) {
        throw new Error(`Row ${rowNumber}: expected 11 columns but found ${row.length}.`);
      }

      const gameName = row[0];
      const month = toInteger(row[1], "draw month", rowNumber);
      const day = toInteger(row[2], "draw day", rowNumber);
      const year = toInteger(row[3], "draw year", rowNumber);

      const mainNumbers = [
        toInteger(row[4], "main number 1", rowNumber),
        toInteger(row[5], "main number 2", rowNumber),
        toInteger(row[6], "main number 3", rowNumber),
        toInteger(row[7], "main number 4", rowNumber),
        toInteger(row[8], "main number 5", rowNumber)
      ];

      const powerballNumber = toInteger(row[9], "Powerball number", rowNumber);
      const powerPlay = row[10] === "" ? null : toInteger(row[10], "Power Play", rowNumber);

      if (gameName.toLowerCase() !== "powerball") {
        throw new Error(`Row ${rowNumber}: game name is not Powerball.`);
      }

      validateMainNumbers(mainNumbers, rowNumber);
      validatePowerballNumber(powerballNumber, rowNumber);

      const drawDate = buildDate(year, month, day, rowNumber);
      const combinationKey = buildCombinationKey(mainNumbers, powerballNumber);
      const sortedCombinationKey = buildSortedCombinationKey(mainNumbers, powerballNumber);

      if (seenDrawDates.has(drawDate)) {
        duplicateDrawDates.push({
          draw_date: drawDate,
          first_row: seenDrawDates.get(drawDate),
          duplicate_row: rowNumber
        });
        return;
      }

      if (seenCombinationKeys.has(combinationKey)) {
        duplicateCombinationKeys.push({
          combination_key: combinationKey,
          first_row: seenCombinationKeys.get(combinationKey),
          duplicate_row: rowNumber
        });
        return;
      }

      if (seenSortedCombinationKeys.has(sortedCombinationKey)) {
        duplicateSortedCombinationKeys.push({
          sorted_combination_key: sortedCombinationKey,
          first_row: seenSortedCombinationKeys.get(sortedCombinationKey),
          duplicate_row: rowNumber
        });
      }

      seenDrawDates.set(drawDate, rowNumber);
      seenCombinationKeys.set(combinationKey, rowNumber);
      seenSortedCombinationKeys.set(sortedCombinationKey, rowNumber);

      cleanedRecords.push({
        game_key: "powerball",
        game_name: "Powerball",
        draw_date: drawDate,
        draw_time: "10:59 PM ET",
        draw_type: "single",
        main_numbers: mainNumbers,
        special_ball: powerballNumber,
        special_ball_label: "PB",
        power_play: powerPlay,
        combination_key: combinationKey,
        source_url: SOURCE_URL,
        source_type: "downloadable",
        verified: false,
        update_method: "import"
      });
    } catch (error) {
      rejectedRows.push({
        row: rowNumber,
        reason: error.message,
        raw: row
      });
    }
  });

  cleanedRecords.sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  return {
    cleanedRecords,
    rejectedRows,
    duplicateDrawDates,
    duplicateCombinationKeys,
    duplicateSortedCombinationKeys
  };
}

function createDuplicateReview(results) {
  const earliestDate = results.cleanedRecords[0]?.draw_date || "Not available";
  const latestDate = results.cleanedRecords[results.cleanedRecords.length - 1]?.draw_date || "Not available";

  const lines = [];

  lines.push("# Powerball Duplicate Review");
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This file documents duplicate and cleaning review results for the first Powerball raw history batch.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Cleaning Summary");
  lines.push("");
  lines.push(`Cleaned records created: ${results.cleanedRecords.length}`);
  lines.push("");
  lines.push(`Earliest cleaned draw date: ${earliestDate}`);
  lines.push("");
  lines.push(`Latest cleaned draw date: ${latestDate}`);
  lines.push("");
  lines.push(`Rejected rows: ${results.rejectedRows.length}`);
  lines.push("");
  lines.push(`Duplicate draw dates removed: ${results.duplicateDrawDates.length}`);
  lines.push("");
  lines.push(`Duplicate exact combination keys removed: ${results.duplicateCombinationKeys.length}`);
  lines.push("");
  lines.push(`Duplicate sorted combination keys found for review: ${results.duplicateSortedCombinationKeys.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Duplicate Rule Used");
  lines.push("");
  lines.push("Primary duplicate rule:");
  lines.push("");
  lines.push("powerball + draw_date");
  lines.push("");
  lines.push("Secondary duplicate review:");
  lines.push("");
  lines.push("powerball + combination_key");
  lines.push("");
  lines.push("Sorted combination review:");
  lines.push("");
  lines.push("powerball + sorted main numbers + Powerball number");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Important Status");
  lines.push("");
  lines.push("The cleaned file is not imported yet.");
  lines.push("");
  lines.push("The cleaned records are marked verified: false until sample verification is completed.");
  lines.push("");
  lines.push("Older Powerball history before February 3, 2010 is still needed and must be cleaned separately before it is merged.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Rejected Rows");
  lines.push("");

  if (results.rejectedRows.length === 0) {
    lines.push("No rejected rows found.");
  } else {
    results.rejectedRows.forEach((item) => {
      lines.push(`- Row ${item.row}: ${item.reason}`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Duplicate Draw Dates Removed");
  lines.push("");

  if (results.duplicateDrawDates.length === 0) {
    lines.push("No duplicate draw dates found.");
  } else {
    results.duplicateDrawDates.forEach((item) => {
      lines.push(`- ${item.draw_date}: first row ${item.first_row}, duplicate row ${item.duplicate_row}`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Duplicate Exact Combination Keys Removed");
  lines.push("");

  if (results.duplicateCombinationKeys.length === 0) {
    lines.push("No duplicate exact combination keys found.");
  } else {
    results.duplicateCombinationKeys.forEach((item) => {
      lines.push(`- ${item.combination_key}: first row ${item.first_row}, duplicate row ${item.duplicate_row}`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Duplicate Sorted Combination Keys For Review");
  lines.push("");

  if (results.duplicateSortedCombinationKeys.length === 0) {
    lines.push("No duplicate sorted combination keys found.");
  } else {
    results.duplicateSortedCombinationKeys.forEach((item) => {
      lines.push(`- ${item.sorted_combination_key}: first row ${item.first_row}, duplicate row ${item.duplicate_row}`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("# Next Step");
  lines.push("");
  lines.push("Create POWERBALL-SAMPLE-VERIFICATION.md after sample records are checked against official or reliable Powerball history sources.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const rows = readCsv(INPUT_FILE);
  const results = cleanPowerballRows(rows);

  ensureDirectory(CLEANED_OUTPUT_FILE);

  fs.writeFileSync(CLEANED_OUTPUT_FILE, JSON.stringify(results.cleanedRecords, null, 2), "utf8");
  fs.writeFileSync(REVIEW_OUTPUT_FILE, createDuplicateReview(results), "utf8");

  console.log("Powerball cleaning completed.");
  console.log(`Cleaned records created: ${results.cleanedRecords.length}`);
  console.log(`Rejected rows: ${results.rejectedRows.length}`);
  console.log(`Duplicate draw dates removed: ${results.duplicateDrawDates.length}`);
  console.log(`Duplicate exact combination keys removed: ${results.duplicateCombinationKeys.length}`);
  console.log(`Duplicate sorted combination keys found for review: ${results.duplicateSortedCombinationKeys.length}`);
  console.log(`Cleaned output file: ${CLEANED_OUTPUT_FILE}`);
  console.log(`Duplicate review file: ${REVIEW_OUTPUT_FILE}`);
}

main();
