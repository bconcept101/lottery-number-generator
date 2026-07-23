const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = String(process.env.SYNC_DRY_RUN || "").toLowerCase() === "true";

const PROJECT_ROOT = path.join(__dirname, "..");
const INPUT_FILE = path.join(PROJECT_ROOT, "latest-results.js");
const TABLE_NAME = "lottery_draws";

const GAME_RULES = Object.freeze({
  powerball: {
    mainMin: 1,
    mainMax: 69,
    uniqueMain: true,
    extraMin: 1,
    extraMax: 26,
    requiresExtra: true
  },
  mega_millions: {
    mainMin: 1,
    mainMax: 70,
    uniqueMain: true,
    extraMin: 1,
    extraMax: 24,
    requiresExtra: true
  },
  fantasy5: {
    mainMin: 1,
    mainMax: 42,
    uniqueMain: true,
    requiresExtra: false
  },
  georgia_five_midday: {
    mainMin: 0,
    mainMax: 9,
    uniqueMain: false,
    requiresExtra: false
  },
  georgia_five_evening: {
    mainMin: 0,
    mainMax: 9,
    uniqueMain: false,
    requiresExtra: false
  }
});

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

function cleanSupabaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");
}

function readLatestResults() {
  if (!fs.existsSync(INPUT_FILE)) throw new Error(`Missing file: ${INPUT_FILE}`);

  const fileContent = fs.readFileSync(INPUT_FILE, "utf8");
  const sandbox = {};
  vm.runInNewContext(`${fileContent}\nresult = latestResults;`, sandbox, {
    timeout: 5000
  });

  if (!sandbox.result || typeof sandbox.result !== "object") {
    throw new Error("latest-results.js did not provide a valid latestResults object.");
  }

  return sandbox.result;
}

function parseNumbers(value) {
  return String(value || "").match(/\d+/g)?.map(Number) || [];
}

function parseExtraNumber(value) {
  const numbers = parseNumbers(value);
  return numbers.length === 1 ? numbers[0] : null;
}

function cleanMultiplier(value) {
  if (value === undefined || value === null || value === "") return null;
  const numbers = parseNumbers(value);
  return numbers.length ? String(numbers[0]) : String(value).trim();
}

function weekdayFromDateKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC"
  }).format(date);
}

function validateDate(gameKey, value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    throw new Error(`Invalid draw date for ${gameKey}: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12));
  const normalized = parsed.toISOString().slice(0, 10);

  if (normalized !== value) {
    throw new Error(`Invalid calendar date for ${gameKey}: ${value}`);
  }

  const easternToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  if (value > easternToday) {
    throw new Error(`Future draw date rejected for ${gameKey}: ${value}`);
  }

  return value;
}

function validateSources(gameKey, sourceNames, sourceUrls, consensusCount) {
  const names = Array.isArray(sourceNames) ? sourceNames.filter(Boolean) : [];
  const urls = Array.isArray(sourceUrls) ? sourceUrls.filter(Boolean) : [];

  if (!names.length || !urls.length) {
    throw new Error(`Missing source evidence for ${gameKey}`);
  }

  urls.forEach((url) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`Invalid source URL for ${gameKey}: ${url}`);
    }

    if (parsed.protocol !== "https:") {
      throw new Error(`Non-HTTPS source URL rejected for ${gameKey}: ${url}`);
    }
  });

  if (!Number.isInteger(Number(consensusCount)) || Number(consensusCount) < 1) {
    throw new Error(`Invalid source consensus for ${gameKey}`);
  }

  return {
    sourceName: names.join(", "),
    sourceUrl: urls[0]
  };
}

function validateNumbers(gameKey, drawDate, numbers, extraNumber) {
  const rules = GAME_RULES[gameKey];
  if (!rules) throw new Error(`Unsupported game key: ${gameKey}`);

  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error(`${gameKey} must have exactly 5 main numbers for ${drawDate}`);
  }

  numbers.forEach((number) => {
    if (!Number.isInteger(number) || number < rules.mainMin || number > rules.mainMax) {
      throw new Error(`Invalid ${gameKey} main number ${number} for ${drawDate}`);
    }
  });

  if (rules.uniqueMain && new Set(numbers).size !== numbers.length) {
    throw new Error(`Duplicate main number rejected for ${gameKey} on ${drawDate}`);
  }

  if (rules.requiresExtra) {
    if (!Number.isInteger(extraNumber) || extraNumber < rules.extraMin || extraNumber > rules.extraMax) {
      throw new Error(`Invalid extra number for ${gameKey} on ${drawDate}: ${extraNumber}`);
    }
  } else if (extraNumber !== null) {
    throw new Error(`Unexpected extra number for ${gameKey} on ${drawDate}`);
  }
}

function makeRecord({ gameKey, gameName, drawDate, numbers, extraNumber = null,
  extraLabel = null, multiplier = null, sourceNames, sourceUrls, consensusCount }) {
  const safeDate = validateDate(gameKey, drawDate);
  validateNumbers(gameKey, safeDate, numbers, extraNumber);
  const sources = validateSources(gameKey, sourceNames, sourceUrls, consensusCount);

  return {
    game_key: gameKey,
    game_name: gameName,
    draw_date: safeDate,
    draw_day: weekdayFromDateKey(safeDate),
    number_1: numbers[0],
    number_2: numbers[1],
    number_3: numbers[2],
    number_4: numbers[3],
    number_5: numbers[4],
    extra_number: extraNumber,
    extra_label: extraLabel,
    multiplier,
    source_name: sources.sourceName,
    source_url: sources.sourceUrl
  };
}

function buildRecords(latestResults) {
  const records = [];

  if (latestResults.powerball?.drawDateKey) {
    const meta = latestResults.powerball.meta || {};
    records.push(makeRecord({
      gameKey: "powerball",
      gameName: "Powerball",
      drawDate: latestResults.powerball.drawDateKey,
      numbers: parseNumbers(latestResults.powerball.winningNumbers),
      extraNumber: parseExtraNumber(latestResults.powerball.extraNumber),
      extraLabel: latestResults.powerball.extraNumberLabel || "Powerball Number",
      multiplier: cleanMultiplier(latestResults.powerball.multiplier),
      sourceNames: meta.sourceNames || [meta.source].filter(Boolean),
      sourceUrls: meta.sourceUrls,
      consensusCount: meta.consensusCount
    }));
  }

  if (latestResults.mega?.drawDateKey) {
    const meta = latestResults.mega.meta || {};
    records.push(makeRecord({
      gameKey: "mega_millions",
      gameName: "Mega Millions",
      drawDate: latestResults.mega.drawDateKey,
      numbers: parseNumbers(latestResults.mega.winningNumbers),
      extraNumber: parseExtraNumber(latestResults.mega.extraNumber),
      extraLabel: latestResults.mega.extraNumberLabel || "Mega Ball Number",
      multiplier: cleanMultiplier(latestResults.mega.multiplier),
      sourceNames: meta.sourceNames || [meta.source].filter(Boolean),
      sourceUrls: meta.sourceUrls,
      consensusCount: meta.consensusCount
    }));
  }

  const pick5 = latestResults.pick5;
  const pick5Meta = pick5?.meta || {};

  if (pick5?.middayDateKey) {
    records.push(makeRecord({
      gameKey: "georgia_five_midday",
      gameName: "Georgia FIVE Midday",
      drawDate: pick5.middayDateKey,
      numbers: parseNumbers(pick5.middayWinningNumbers),
      sourceNames: pick5Meta.middaySourceNames,
      sourceUrls: pick5Meta.middaySourceUrls,
      consensusCount: pick5Meta.middayConsensusCount
    }));
  }

  if (pick5?.eveningDateKey) {
    records.push(makeRecord({
      gameKey: "georgia_five_evening",
      gameName: "Georgia FIVE Evening",
      drawDate: pick5.eveningDateKey,
      numbers: parseNumbers(pick5.eveningWinningNumbers),
      sourceNames: pick5Meta.eveningSourceNames,
      sourceUrls: pick5Meta.eveningSourceUrls,
      consensusCount: pick5Meta.eveningConsensusCount
    }));
  }

  if (latestResults.fantasy5?.drawDateKey) {
    const meta = latestResults.fantasy5.meta || {};
    records.push(makeRecord({
      gameKey: "fantasy5",
      gameName: "Georgia Fantasy 5",
      drawDate: latestResults.fantasy5.drawDateKey,
      numbers: parseNumbers(latestResults.fantasy5.winningNumbers),
      sourceNames: meta.sourceNames || [meta.source].filter(Boolean),
      sourceUrls: meta.sourceUrls,
      consensusCount: meta.consensusCount
    }));
  }

  const uniqueKeys = new Set();
  records.forEach((record) => {
    const key = `${record.game_key}|${record.draw_date}`;
    if (uniqueKeys.has(key)) throw new Error(`Duplicate result key prepared: ${key}`);
    uniqueKeys.add(key);
  });

  return records;
}

function resultSignature(record) {
  return [record.number_1, record.number_2, record.number_3, record.number_4,
    record.number_5, record.extra_number ?? ""].join("|");
}

async function fetchExistingRecord(record) {
  const baseUrl = cleanSupabaseUrl(SUPABASE_URL);
  const query = new URLSearchParams({
    game_key: `eq.${record.game_key}`,
    draw_date: `eq.${record.draw_date}`,
    select: "game_key,draw_date,number_1,number_2,number_3,number_4,number_5,extra_number"
  });
  const response = await fetch(`${baseUrl}/rest/v1/${TABLE_NAME}?${query}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase preflight read failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  if (rows.length > 1) throw new Error(`Duplicate database rows found for ${record.game_key} ${record.draw_date}`);
  return rows[0] || null;
}

async function protectExistingHistory(records) {
  const missing = [];

  for (const record of records) {
    const existing = await fetchExistingRecord(record);
    if (!existing) {
      missing.push(record);
      continue;
    }

    if (resultSignature(existing) !== resultSignature(record)) {
      throw new Error(`Protected historical result conflict for ${record.game_key} ${record.draw_date}`);
    }

    console.log(`Already verified in Supabase: ${record.game_key} ${record.draw_date}`);
  }

  return missing;
}

async function insertMissingRecords(records) {
  if (!records.length) return;
  const baseUrl = cleanSupabaseUrl(SUPABASE_URL);
  const response = await fetch(
    `${baseUrl}/rest/v1/${TABLE_NAME}?on_conflict=game_key,draw_date`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal"
      },
      body: JSON.stringify(records)
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase latest-results insert failed: ${response.status} ${await response.text()}`);
  }
}

async function verifyRecords(records) {
  for (const record of records) {
    const stored = await fetchExistingRecord(record);
    if (!stored || resultSignature(stored) !== resultSignature(record)) {
      throw new Error(`Post-insert verification failed for ${record.game_key} ${record.draw_date}`);
    }
    console.log(`Verified in Supabase: ${record.game_key} ${record.draw_date}`);
  }
}

async function main() {
  const records = buildRecords(readLatestResults());
  if (!records.length) throw new Error("No latest results found to sync.");

  console.log(`Validated latest-result records: ${records.length}`);

  if (DRY_RUN) {
    records.forEach((record) => console.log(`DRY RUN: ${record.game_key} ${record.draw_date}`));
    console.log("Dry run completed. Supabase was not contacted or changed.");
    return;
  }

  requireEnv("SUPABASE_URL", SUPABASE_URL);
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

  const missing = await protectExistingHistory(records);
  console.log(`New records ready to insert: ${missing.length}`);
  await insertMissingRecords(missing);
  await verifyRecords(records);
  console.log("Latest results safely synchronized and verified.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { buildRecords, validateDate, validateNumbers };
