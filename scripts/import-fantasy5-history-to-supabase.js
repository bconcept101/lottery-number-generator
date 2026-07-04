const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE_NAME = "lottery_draws";
const BATCH_SIZE = 500;

const CLEANED_FILE = path.join(
  __dirname,
  "..",
  "data",
  "cleaned",
  "fantasy5-history-cleaned.json"
);

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

function weekdayFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC"
  }).format(date);
}

function validateFantasy5Record(record) {
  if (record.game !== "fantasy5") {
    throw new Error(`Invalid game value for ${record.draw_date}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.draw_date)) {
    throw new Error(`Invalid draw date: ${record.draw_date}`);
  }

  if (!Array.isArray(record.numbers) || record.numbers.length !== 5) {
    throw new Error(`Fantasy 5 draw must have exactly 5 numbers for ${record.draw_date}`);
  }

  record.numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 42) {
      throw new Error(
        `Invalid Fantasy 5 number ${number} for ${record.draw_date}`
      );
    }
  });

  const uniqueNumbers = new Set(record.numbers);

  if (uniqueNumbers.size !== record.numbers.length) {
    throw new Error(`Duplicate Fantasy 5 number found for ${record.draw_date}`);
  }

  return record;
}

function toSupabaseRecord(record) {
  const numbers = record.numbers;

  return {
    game_key: "fantasy5",
    game_name: "Georgia Fantasy 5",
    draw_date: record.draw_date,
    draw_day: weekdayFromDateKey(record.draw_date),

    number_1: numbers[0],
    number_2: numbers[1],
    number_3: numbers[2],
    number_4: numbers[3],
    number_5: numbers[4],

    extra_number: null,
    extra_label: null,

    multiplier: null,

    source_name: "Lottery.net Georgia Fantasy 5 History",
    source_url: `https://www.lottery.net/georgia/fantasy-5/numbers/${record.draw_date.slice(0, 4)}`
  };
}

function loadCleanedRecords() {
  if (!fs.existsSync(CLEANED_FILE)) {
    throw new Error(`Cleaned Fantasy 5 file not found: ${CLEANED_FILE}`);
  }

  const parsed = JSON.parse(fs.readFileSync(CLEANED_FILE, "utf8"));

  if (!Array.isArray(parsed)) {
    throw new Error("Cleaned Fantasy 5 file must contain an array.");
  }

  const map = new Map();

  parsed.forEach((record) => {
    const validated = validateFantasy5Record(record);
    const supabaseRecord = toSupabaseRecord(validated);
    const key = `${supabaseRecord.game_key}|${supabaseRecord.draw_date}`;

    map.set(key, supabaseRecord);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.draw_date.localeCompare(b.draw_date)
  );
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

  const records = loadCleanedRecords();

  if (!records.length) {
    throw new Error("No Fantasy 5 records found to import.");
  }

  console.log(`Fantasy 5 records ready: ${records.length}`);
  console.log(`Oldest Fantasy 5 draw: ${records[0].draw_date}`);
  console.log(`Newest Fantasy 5 draw: ${records[records.length - 1].draw_date}`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch);

    console.log(
      `Uploaded ${Math.min(i + BATCH_SIZE, records.length)} of ${records.length}`
    );
  }

  console.log("Fantasy 5 history import completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
