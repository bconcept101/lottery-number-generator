const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE_NAME = "lottery_draws";
const BATCH_SIZE = 500;

const START_DATE = "1992-04-22";
const END_DATE = "2010-02-02";

const START_YEAR = 1992;
const END_YEAR = 2010;

const MONTHS = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12
};

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

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function dateKeyFromParts(year, month, day) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function weekdayFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC"
  }).format(date);
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, "-")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&reg;|®/gi, "");
}

function htmlToText(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validateRecord(record) {
  const mainNumbers = [
    record.number_1,
    record.number_2,
    record.number_3,
    record.number_4,
    record.number_5
  ];

  mainNumbers.forEach((number) => {
    if (!Number.isInteger(number) || number < 1 || number > 69) {
      throw new Error(
        `Invalid Powerball main number ${number} for ${record.draw_date}`
      );
    }
  });

  if (
    !Number.isInteger(record.extra_number) ||
    record.extra_number < 1 ||
    record.extra_number > 45
  ) {
    throw new Error(
      `Invalid historical Powerball number ${record.extra_number} for ${record.draw_date}`
    );
  }

  return record;
}

async function fetchYearArchive(year) {
  const url = `https://www.powerball.net/archive/${year}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "LotteryNumberGeneratorBot/1.0 (+https://lottery-number-generator-6ey.pages.dev/)",
      Accept: "text/html,application/xhtml+xml,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return {
    url,
    html: await response.text()
  };
}

function parseYearArchive(year, sourceUrl, html) {
  const text = htmlToText(html);
  const records = [];

  const pattern =
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/g;

  let match;

  while ((match = pattern.exec(text)) !== null) {
    const monthName = match[1];
    const day = Number(match[2]);
    const parsedYear = Number(match[3]);

    if (parsedYear !== year) {
      continue;
    }

    const drawDate = dateKeyFromParts(parsedYear, MONTHS[monthName], day);

    if (drawDate < START_DATE || drawDate > END_DATE) {
      continue;
    }

    const record = validateRecord({
      game_key: "powerball",
      game_name: "Powerball",
      draw_date: drawDate,
      draw_day: weekdayFromDateKey(drawDate),

      number_1: Number(match[4]),
      number_2: Number(match[5]),
      number_3: Number(match[6]),
      number_4: Number(match[7]),
      number_5: Number(match[8]),

      extra_number: Number(match[9]),
      extra_label: "Powerball Number",

      multiplier: null,

      source_name: "Powerball.net Archive Backfill",
      source_url: sourceUrl
    });

    records.push(record);
  }

  return records;
}

function dedupeRecords(records) {
  const map = new Map();

  records.forEach((record) => {
    const key = `${record.game_key}|${record.draw_date}`;
    map.set(key, record);
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

  const allRecords = [];

  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    const archive = await fetchYearArchive(year);
    const records = parseYearArchive(year, archive.url, archive.html);

    console.log(`${year}: parsed ${records.length} records`);
    allRecords.push(...records);
  }

  const records = dedupeRecords(allRecords);

  if (!records.length) {
    throw new Error("No Powerball archive backfill records found.");
  }

  console.log(`Powerball archive backfill records ready: ${records.length}`);
  console.log(`Oldest backfill draw: ${records[0].draw_date}`);
  console.log(`Newest backfill draw: ${records[records.length - 1].draw_date}`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch);

    console.log(
      `Uploaded ${Math.min(i + BATCH_SIZE, records.length)} of ${records.length}`
    );
  }

  console.log("Powerball archive backfill completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
