const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const INPUT_FILE = path.join(
  __dirname,
  "..",
  "data",
  "cleaned",
  "powerball-history-cleaned.json"
);

const TABLE_NAME = "lottery_draws";
const BATCH_SIZE = 500;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function padDate(value) {
  if (!value) return null;

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid draw date: ${value}`);
  }

  return date.toISOString().slice(0, 10);
}

function getField(record, names) {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null && record[name] !== "") {
      return record[name];
    }
  }

  return null;
}

function parseNumbers(value) {
  if (Array.isArray(value)) {
    return value.map(Number);
  }

  if (typeof value === "string") {
    return value.match(/\d+/g)?.map(Number) || [];
  }

  return [];
}

function normalizeRecord(record) {
  const drawDate = padDate(
    getField(record, [
      "draw_date",
      "drawDate",
      "date",
      "Date",
      "Draw Date"
    ])
  );

  const mainNumbers = parseNumbers(
    getField(record, [
      "main_numbers",
      "mainNumbers",
      "winning_numbers",
      "winningNumbers",
      "numbers",
      "Numbers"
    ])
  );

  const extraNumber = Number(
    getField(record, [
      "extra_number",
      "extraNumber",
      "powerball",
      "powerballNumber",
      "Powerball",
      "Powerball Number"
    ])
  );

  if (!drawDate) {
    throw new Error(`Missing draw date: ${JSON.stringify(record)}`);
  }

  if (mainNumbers.length !== 5) {
    throw new Error(`Invalid Powerball numbers for ${drawDate}`);
  }

  if (!Number.isInteger(extraNumber)) {
    throw new Error(`Invalid Powerball extra number for ${drawDate}`);
  }

  return {
    game_key: "powerball",
    game_name: "Powerball",
    draw_date: drawDate,
    draw_day: getField(record, ["draw_day", "drawDay", "weekday", "day"]) || null,

    number_1: mainNumbers[0],
    number_2: mainNumbers[1],
    number_3: mainNumbers[2],
    number_4: mainNumbers[3],
    number_5: mainNumbers[4],

    extra_number: extraNumber,
    extra_label: "Powerball Number",

    multiplier:
      getField(record, [
        "multiplier",
        "powerPlay",
        "power_play",
        "Power Play"
      ]) || null,

    source_name:
      getField(record, ["source_name", "sourceName", "source"]) ||
      "Cleaned Powerball History",

    source_url:
      getField(record, ["source_url", "sourceUrl", "url"]) ||
      null
  };
}

async function uploadBatch(records) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?on_conflict=game_key,draw_date`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify(records)
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${text}`);
  }
}

async function main() {
  requireEnv("SUPABASE_URL", SUPABASE_URL);
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const records = Array.isArray(raw) ? raw : raw.records || raw.data || [];

  if (!records.length) {
    throw new Error("No Powerball history records found.");
  }

  const normalized = records.map(normalizeRecord);

  console.log(`Powerball records ready for import: ${normalized.length}`);

  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch);
    console.log(`Uploaded ${Math.min(i + BATCH_SIZE, normalized.length)} of ${normalized.length}`);
  }

  console.log("Powerball history import completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
