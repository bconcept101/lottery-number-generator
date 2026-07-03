const fs = require("fs");
const path = require("path");

const RAW_FILE = path.join(__dirname, "..", "data", "raw", "fantasy5-history.csv");
const CLEANED_DIR = path.join(__dirname, "..", "data", "cleaned");
const CLEANED_FILE = path.join(CLEANED_DIR, "fantasy5-history-cleaned.json");
const REVIEW_FILE = path.join(__dirname, "..", "FANTASY5-DUPLICATE-REVIEW.md");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function normalizeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parseNumbers(value) {
  if (!value) return [];

  return value
    .replace(/"/g, "")
    .split(/[-,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number);
}

function parseJackpot(value) {
  if (!value) return null;

  const cleaned = value.replace(/[$,]/g, "").trim();

  if (!cleaned || cleaned.toLowerCase() === "n/a") {
    return null;
  }

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function main() {
  if (!fs.existsSync(RAW_FILE)) {
    throw new Error(`Raw file not found: ${RAW_FILE}`);
  }

  ensureDirectoryExists(CLEANED_DIR);

  const rawContent = fs.readFileSync(RAW_FILE, "utf8").trim();

  if (!rawContent) {
    throw new Error("Raw Fantasy 5 CSV file is empty.");
  }

  const lines = rawContent.split(/\r?\n/).filter(Boolean);
  const header = parseCSVLine(lines.shift()).map((item) => item.toLowerCase());

  const dateIndex = header.indexOf("date");
  const resultIndex = header.indexOf("result");
  const jackpotIndex = header.indexOf("jackpot");
  const sourceIndex = header.indexOf("source");

  if (dateIndex === -1 || resultIndex === -1 || sourceIndex === -1) {
    throw new Error("CSV must include date,result,jackpot,source header.");
  }

  const cleanedRecords = [];
  const rejectedRows = [];
  const duplicateDates = [];
  const seenDates = new Set();

  lines.forEach((line, index) => {
    const rowNumber = index + 2;
    const columns = parseCSVLine(line);

    const drawDate = normalizeDate(columns[dateIndex]);
    const numbers = parseNumbers(columns[resultIndex]);
    const jackpot = jackpotIndex === -1 ? null : parseJackpot(columns[jackpotIndex]);
    const source = columns[sourceIndex] || "unknown";

    const problems = [];

    if (!drawDate) {
      problems.push("Invalid date");
    }

    if (numbers.length !== 5) {
      problems.push("Result must contain exactly 5 numbers");
    }

    const outOfRangeNumbers = numbers.filter((number) => number < 1 || number > 42 || !Number.isInteger(number));

    if (outOfRangeNumbers.length > 0) {
      problems.push(`Numbers out of range 1-42: ${outOfRangeNumbers.join(", ")}`);
    }

    const uniqueNumbers = new Set(numbers);

    if (uniqueNumbers.size !== numbers.length) {
      problems.push("Duplicate number inside result");
    }

    if (drawDate && seenDates.has(drawDate)) {
      problems.push("Duplicate draw date");
      duplicateDates.push(drawDate);
    }

    if (problems.length > 0) {
      rejectedRows.push({
        row: rowNumber,
        line,
        problems
      });
      return;
    }

    seenDates.add(drawDate);

    cleanedRecords.push({
      game: "fantasy5",
      draw_date: drawDate,
      draw_period: "night",
      numbers,
      jackpot,
      source,
      verified: false
    });
  });

  cleanedRecords.sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  fs.writeFileSync(CLEANED_FILE, JSON.stringify(cleanedRecords, null, 2));

  const firstDate = cleanedRecords.length ? cleanedRecords[0].draw_date : "N/A";
  const lastDate = cleanedRecords.length ? cleanedRecords[cleanedRecords.length - 1].draw_date : "N/A";

  const review = `# Fantasy 5 Duplicate Review

## Summary

Game: Georgia Fantasy 5  
Cleaned records: ${cleanedRecords.length}  
Rejected rows: ${rejectedRows.length}  
Duplicate draw dates: ${duplicateDates.length}  
Date range: ${firstDate} through ${lastDate}

---

## Validation Rules

- Every row must have a valid date.
- Every result must have exactly 5 numbers.
- Every number must be between 1 and 42.
- No number should repeat inside the same draw.
- No duplicate draw date should exist.
- Output is sorted from oldest to newest.

---

## Duplicate Draw Dates

${duplicateDates.length ? duplicateDates.map((date) => `- ${date}`).join("\n") : "No duplicate draw dates found."}

---

## Rejected Rows

${
  rejectedRows.length
    ? rejectedRows
        .map((row) => {
          return `### Row ${row.row}

Original line:

\`\`\`csv
${row.line}
\`\`\`

Problems:

${row.problems.map((problem) => `- ${problem}`).join("\n")}
`;
        })
        .join("\n")
    : "No rejected rows."
}
`;
  fs.writeFileSync(REVIEW_FILE, review);

  console.log("Fantasy 5 history cleaning complete.");
  console.log(`Cleaned records: ${cleanedRecords.length}`);
  console.log(`Rejected rows: ${rejectedRows.length}`);
  console.log(`Output: ${CLEANED_FILE}`);
  console.log(`Review: ${REVIEW_FILE}`);
}

main();
