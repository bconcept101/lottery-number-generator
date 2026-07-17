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
  "georgia-five-history-cleaned.json"
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

function validateRecord(record) {
  if (record.game !== "georgia_five") {
    throw new Error(`Invalid game value for ${record.draw_date}`);
  }

  if (!["midday", "evening"].includes(record.draw_period)) {
    throw new Error(`Invalid draw period for ${record.draw_date}`);
  }

  if (!Array.isArray(record.numbers) || record.numbers.length !== 5) {
    throw new Error(`Georgia FIVE draw must have 5 digits for ${record.draw_date}`);
  }

  record.numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 0 || number > 9) {
      throw new Error(`Invalid Georgia FIVE digit ${number} for ${record.draw_date}`);
    }
  });

  return record;
}

function toSupabaseRecord(record) {
  const gameKey =
    record.draw_period === "midday"
      ? "georgia_five_midday"
      : "georgia_five_evening";

  const gameName =
    record.draw_period === "midday"
      ? "Georgia FIVE Midday"
      : "Georgia FIVE Evening";

  const sourcePeriod =
    record.draw_period === "midday"
      ? "five-midday"
      : "five-evening";

  return {
    game_key: gameKey,
    game_name: gameName,
    draw_date: record.draw_date,
    draw_day: weekdayFromDateKey(record.draw_date),

    number_1: record.numbers[0],
    number_2: record.numbers[1],
    number_3: record.numbers[2],
    number_4: record.numbers[3],
    number_5: record.numbers[4],

    extra_number: null,
    extra_label: null,
    multiplier: null,

    source_name: "Lottery.net Georgia FIVE History",
    source_url: `https://www.lottery.net/georgia/${sourcePeriod}/numbers/${record.draw_date.slice(0, 4)}`
  };
}

function loadRecords() {
  if (!fs.existsSync(CLEANED_FILE)) {
    throw new Error(`Cleaned Georgia FIVE file not found: ${CLEANED_FILE}`);
  }

  const parsed = JSON.parse(fs.readFileSync(CLEANED_FILE, "utf8"));

  if (!Array.isArray(parsed)) {
    throw new Error("Cleaned Georgia FIVE file must contain an array.");
  }

  const map = new Map();

  parsed.forEach((record) => {
    const validated = validateRecord(record);
    const supabaseRecord = toSupabaseRecord(validated);
    const key = `${supabaseRecord.game_key}|${supabaseRecord.draw_date}`;
    map.set(key, supabaseRecord);
  });

  return Array.from(map.values()).sort((a, b) => {
    const keyA = `${a.game_key}|${a.draw_date}`;
    const keyB = `${b.game_key}|${b.draw_date}`;
    return keyA.localeCompare(keyB);
  });
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

  const records = loadRecords();

  console.log(`Georgia FIVE records ready: ${records.length}`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch);

    console.log(`Uploaded ${Math.min(i + BATCH_SIZE, records.length)} of ${records.length}`);
  }

  console.log("Georgia FIVE history import completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
