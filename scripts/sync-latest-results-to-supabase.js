const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PROJECT_ROOT = path.join(__dirname, "..");
const INPUT_FILE = path.join(PROJECT_ROOT, "latest-results.js");

const TABLE_NAME = "lottery_draws";

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

function readLatestResults() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing file: ${INPUT_FILE}`);
  }

  const fileContent = fs.readFileSync(INPUT_FILE, "utf8");
  const sandbox = {};

  vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox, {
    timeout: 5000
  });

  return sandbox.result;
}

function parseNumbers(value) {
  return String(value || "")
    .match(/\d+/g)
    ?.map((number) => Number(number)) || [];
}

function parseExtraNumber(value) {
  const numbers = parseNumbers(value);
  return numbers.length ? numbers[0] : null;
}

function cleanMultiplier(value) {
  if (!value) return null;

  const numbers = parseNumbers(value);
  return numbers.length ? String(numbers[0]) : String(value);
}

function sourceName(meta, fallback) {
  if (meta?.sourceNames?.length) {
    return meta.sourceNames.join(", ");
  }

  if (meta?.source) {
    return meta.source;
  }

  return fallback;
}

function sourceUrl(meta) {
  if (meta?.sourceUrls?.length) {
    return meta.sourceUrls[0];
  }

  return null;
}

function makeRecord({
  gameKey,
  gameName,
  drawDate,
  numbers,
  extraNumber = null,
  extraLabel = null,
  multiplier = null,
  sourceNameValue,
  sourceUrlValue
}) {
  if (!drawDate) {
    throw new Error(`Missing draw date for ${gameKey}`);
  }

  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error(`Invalid numbers for ${gameKey} on ${drawDate}`);
  }

  return {
    game_key: gameKey,
    game_name: gameName,
    draw_date: drawDate,
    draw_day: null,

    number_1: numbers[0],
    number_2: numbers[1],
    number_3: numbers[2],
    number_4: numbers[3],
    number_5: numbers[4],

    extra_number: extraNumber,
    extra_label: extraLabel,
    multiplier,

    source_name: sourceNameValue,
    source_url: sourceUrlValue
  };
}

function buildRecords(latestResults) {
  const records = [];

  if (latestResults.powerball?.drawDateKey) {
    records.push(
      makeRecord({
        gameKey: "powerball",
        gameName: "Powerball",
        drawDate: latestResults.powerball.drawDateKey,
        numbers: parseNumbers(latestResults.powerball.winningNumbers),
        extraNumber: parseExtraNumber(latestResults.powerball.extraNumber),
        extraLabel: latestResults.powerball.extraNumberLabel || "Powerball Number",
        multiplier: cleanMultiplier(latestResults.powerball.multiplier),
        sourceNameValue: sourceName(latestResults.powerball.meta, "Latest Results Sync"),
        sourceUrlValue: sourceUrl(latestResults.powerball.meta)
      })
    );
  }

  if (latestResults.mega?.drawDateKey) {
    records.push(
      makeRecord({
        gameKey: "mega_millions",
        gameName: "Mega Millions",
        drawDate: latestResults.mega.drawDateKey,
        numbers: parseNumbers(latestResults.mega.winningNumbers),
        extraNumber: parseExtraNumber(latestResults.mega.extraNumber),
        extraLabel: latestResults.mega.extraNumberLabel || "Mega Ball Number",
        multiplier: null,
        sourceNameValue: sourceName(latestResults.mega.meta, "Latest Results Sync"),
        sourceUrlValue: sourceUrl(latestResults.mega.meta)
      })
    );
  }

  if (latestResults.pick5?.middayDateKey) {
    const middayMatch = String(latestResults.pick5.winningNumbers || "").match(
      /Midday(?:\s*\([^)]+\))?\s*:\s*([0-9\s-]+)/i
    );

    records.push(
      makeRecord({
        gameKey: "georgia_five_midday",
        gameName: "Georgia Five Midday",
        drawDate: latestResults.pick5.middayDateKey,
        numbers: parseNumbers(middayMatch ? middayMatch[1] : ""),
        sourceNameValue: sourceName(latestResults.pick5.meta, "Latest Results Sync"),
        sourceUrlValue: latestResults.pick5.meta?.middaySourceUrls?.[0] || null
      })
    );
  }

  if (latestResults.pick5?.eveningDateKey) {
    const eveningMatch = String(latestResults.pick5.winningNumbers || "").match(
      /Evening(?:\s*\([^)]+\))?\s*:\s*([0-9\s-]+)/i
    );

    records.push(
      makeRecord({
        gameKey: "georgia_five_evening",
        gameName: "Georgia Five Evening",
        drawDate: latestResults.pick5.eveningDateKey,
        numbers: parseNumbers(eveningMatch ? eveningMatch[1] : ""),
        sourceNameValue: sourceName(latestResults.pick5.meta, "Latest Results Sync"),
        sourceUrlValue: latestResults.pick5.meta?.eveningSourceUrls?.[0] || null
      })
    );
  }

  if (latestResults.fantasy5?.drawDateKey) {
    records.push(
      makeRecord({
        gameKey: "fantasy5",
        gameName: "Fantasy 5",
        drawDate: latestResults.fantasy5.drawDateKey,
        numbers: parseNumbers(latestResults.fantasy5.winningNumbers),
        sourceNameValue: sourceName(latestResults.fantasy5.meta, "Latest Results Sync"),
        sourceUrlValue: sourceUrl(latestResults.fantasy5.meta)
      })
    );
  }

  return records;
}

async function uploadRecords(records) {
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
    throw new Error(`Supabase latest-results sync failed: ${response.status} ${text}`);
  }
}

async function main() {
  requireEnv("SUPABASE_URL", SUPABASE_URL);
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

  const latestResults = readLatestResults();
  const records = buildRecords(latestResults);

  if (!records.length) {
    throw new Error("No latest results found to sync.");
  }

  console.log(`Latest result records ready for Supabase sync: ${records.length}`);

  await uploadRecords(records);

  records.forEach((record) => {
    console.log(`${record.game_key}: ${record.draw_date}`);
  });

  console.log("Latest results synced to Supabase successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
