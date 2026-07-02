const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const INPUT_FILE = path.join(
  __dirname,
  "..",
  "data",
  "cleaned",
  "mega-millions-history-complete.json"
);

const TABLE_NAME = "lottery_draws";
const BATCH_SIZE = 500;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function cleanSupabaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");
}

function padDate(value) {
  if (!value) {
    return null;
  }

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

function getDrawDay(drawDate) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const date = new Date(`${drawDate}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return days[date.getUTCDay()];
}

function getField(record, names) {
  for (const name of names) {
    if (
      record[name] !== undefined &&
      record[name] !== null &&
      record[name] !== ""
    ) {
      return record[name];
    }
  }

  return null;
}

function parseNumbers(value) {
  if (Array.isArray(value)) {
    return value.map((number) => Number(number));
  }

  if (typeof value === "string") {
    return value.match(/\d+/g)?.map((number) => Number(number)) || [];
  }

  return [];
}

function parseInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number)) {
    return null;
  }

  return number;
}

function validateMainNumbers(drawDate, numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error(`Invalid Mega Millions main numbers count for ${drawDate}`);
  }

  numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 75) {
      throw new Error(
        `Invalid Mega Millions main number ${number} for ${drawDate}`
      );
    }
  });
}

function validateMegaBallNumber(drawDate, number) {
  if (!Number.isInteger(number) || number < 1 || number > 52) {
    throw new Error(
      `Invalid Mega Millions extra number for ${drawDate}: ${number}`
    );
  }
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

  if (!drawDate) {
    throw new Error(`Missing draw date: ${JSON.stringify(record)}`);
  }

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

  const extraNumber = parseInteger(
    getField(record, [
      "extra_number",
      "extraNumber",
      "mega_ball",
      "megaBall",
      "megaball",
      "Mega Ball",
      "bonus",
      "Bonus"
    ])
  );

  validateMainNumbers(drawDate, mainNumbers);
  validateMegaBallNumber(drawDate, extraNumber);

  const multiplierValue = getField(record, [
    "multiplier",
    "megaplier",
    "Megaplier"
  ]);

  return {
    game_key: "mega_millions",
    game_name: "Mega Millions",
    draw_date: drawDate,
    draw_day:
      getField(record, ["draw_day", "drawDay", "weekday", "day"]) ||
      getDrawDay(drawDate),
    number_1: mainNumbers[0],
    number_2: mainNumbers[1],
    number_3: mainNumbers[2],
    number_4: mainNumbers[3],
    number_5: mainNumbers[4],
    extra_number: extraNumber,
    extra_label:
      getField(record, [
        "extra_number_name",
        "special_ball_label",
        "extra_label",
        "extraLabel"
      ]) || "Mega Ball",
    multiplier:
      multiplierValue !== null && multiplierValue !== undefined
        ? String(multiplierValue)
        : null,
    source_name:
      getField(record, [
        "source_name",
        "sourceName",
        "source",
        "source_type"
      ]) || "Mega Millions Complete History",
    source_url: getField(record, ["source_url", "sourceUrl", "url"]) || null
  };
}

async function uploadBatch(records) {
  const baseUrl = cleanSupabaseUrl(SUPABASE_URL);

  const response = await fetch(
    `${baseUrl}/rest/v1/${TABLE_NAME}?on_conflict=game_key,draw_date`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
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
    throw new Error("No Mega Millions history records found.");
  }

  const normalized = records.map(normalizeRecord);

  console.log(`Mega Millions records ready for import: ${normalized.length}`);

  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);

    await uploadBatch(batch);

    console.log(
      `Uploaded ${Math.min(i + BATCH_SIZE, normalized.length)} of ${
        normalized.length
      }`
    );
  }

  console.log("Mega Millions history import completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
