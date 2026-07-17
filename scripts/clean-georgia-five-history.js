const fs = require("fs");
const path = require("path");

const RAW_MIDDAY_FILE = path.join(__dirname, "..", "data", "raw", "georgia-five-midday-history.csv");
const RAW_EVENING_FILE = path.join(__dirname, "..", "data", "raw", "georgia-five-evening-history.csv");

const CLEANED_DIR = path.join(__dirname, "..", "data", "cleaned");
const CLEANED_FILE = path.join(CLEANED_DIR, "georgia-five-history-cleaned.json");
const REVIEW_FILE = path.join(__dirname, "..", "GEORGIA-FIVE-DUPLICATE-REVIEW.md");

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

function parseDigits(value) {
  if (!value) return [];

  return String(value)
    .replace(/"/g, "")
    .split(/[-,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readRawFile(filePath, expectedPeriod) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Raw file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf8").trim();

  if (!content) {
    throw new Error(`Raw file is empty: ${filePath}`);
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCSVLine(lines.shift()).map((item) => item.toLowerCase());

  const dateIndex = header.indexOf("date");
  const resultIndex = header.indexOf("result");
  const periodIndex = header.indexOf("draw_period");
  const sourceIndex = header.indexOf("source");

  if (dateIndex === -1 || resultIndex === -1 || periodIndex === -1 || sourceIndex === -1) {
    throw new Error("CSV must include date,result,draw_period,source header.");
  }

  return lines.map((line, index) => {
    const columns = parseCSVLine(line);

    return {
      row: index + 2,
      line,
      date: columns[dateIndex],
      result: columns[resultIndex],
      draw_period: columns[periodIndex] || expectedPeriod,
      source: columns[sourceIndex] || "unknown"
    };
  });
}

function main() {
  fs.mkdirSync(CLEANED_DIR, { recursive: true });

  const rawRows = [
    ...readRawFile(RAW_MIDDAY_FILE, "midday"),
    ...readRawFile(RAW_EVENING_FILE, "evening")
  ];

  const cleanedRecords = [];
  const rejectedRows = [];
  const duplicateKeys = [];
  const seenKeys = new Set();

  rawRows.forEach((row) => {
    const drawDate = normalizeDate(row.date);
    const drawPeriod = String(row.draw_period || "").toLowerCase().trim();
    const digits = parseDigits(row.result);

    const problems = [];

    if (!drawDate) {
      problems.push("Invalid date");
    }

    if (!["midday", "evening"].includes(drawPeriod)) {
      problems.push("Invalid draw period");
    }

    if (digits.length !== 5) {
      problems.push("Result must contain exactly 5 digits");
    }

    digits.forEach((digit) => {
      if (!/^\d$/.test(digit)) {
        problems.push(`Invalid digit: ${digit}`);
      }
    });

    const key = `${drawDate}|${drawPeriod}`;

    if (drawDate && seenKeys.has(key)) {
      problems.push("Duplicate draw date + draw period");
      duplicateKeys.push(key);
    }

    if (problems.length > 0) {
      rejectedRows.push({
        row: row.row,
        line: row.line,
        problems
      });
      return;
    }

    seenKeys.add(key);

    cleanedRecords.push({
      game: "georgia_five",
      draw_date: drawDate,
      draw_period: drawPeriod,
      numbers: digits.map(Number),
      result_text: digits.join("-"),
      source: row.source,
      verified: false
    });
  });

  cleanedRecords.sort((a, b) => {
    const dateCompare = a.draw_date.localeCompare(b.draw_date);
    if (dateCompare !== 0) return dateCompare;
    return a.draw_period.localeCompare(b.draw_period);
  });

  fs.writeFileSync(CLEANED_FILE, JSON.stringify(cleanedRecords, null, 2));

  const firstDate = cleanedRecords.length ? cleanedRecords[0].draw_date : "N/A";
  const lastDate = cleanedRecords.length ? cleanedRecords[cleanedRecords.length - 1].draw_date : "N/A";

  const review = `# Georgia FIVE Duplicate Review

## Summary

Game: Pick 5 / Georgia FIVE  
Cleaned records: ${cleanedRecords.length}  
Rejected rows: ${rejectedRows.length}  
Duplicate date + draw period rows: ${duplicateKeys.length}  
Date range: ${firstDate} through ${lastDate}

---

## Validation Rules

- Every row must have a valid date.
- Every row must have a draw period: midday or evening.
- Every result must have exactly 5 digits.
- Every digit must be 0 through 9.
- Repeated digits are allowed.
- Leading zeros are preserved in result_text.
- No duplicate date + draw period should exist.
- Output is sorted oldest to newest.

---

## Duplicate Date + Period Rows

${duplicateKeys.length ? duplicateKeys.map((key) => `- ${key}`).join("\n") : "No duplicate date + period rows found."}

---

## Rejected Rows

${
  rejectedRows.length
    ? rejectedRows
        .map((row) => `### Row ${row.row}

Original line:

\`\`\`csv
${row.line}
\`\`\`

Problems:

${row.problems.map((problem) => `- ${problem}`).join("\n")}
`)
        .join("\n")
    : "No rejected rows."
}
`;

  fs.writeFileSync(REVIEW_FILE, review);

  console.log("Georgia FIVE history cleaning complete.");
  console.log(`Cleaned records: ${cleanedRecords.length}`);
  console.log(`Rejected rows: ${rejectedRows.length}`);
  console.log(`Output: ${CLEANED_FILE}`);
  console.log(`Review: ${REVIEW_FILE}`);
}

main();
