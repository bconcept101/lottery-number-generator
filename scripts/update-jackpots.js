const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "jackpot-data.js");
const TIMEZONE = "America/New_York";

const SOURCES = {
  powerball:
    "https://www.texaslottery.com/export/sites/lottery/Games/Powerball/index.html",
  mega:
    "https://www.texaslottery.com/export/sites/lottery/Games/Mega_Millions/index.html",
  fantasy5:
    "https://www.galottery.com/en-us/games/draw-games/fantasy-five.html",
  fantasy5Backup:
    "https://www.lottonumbers.com/georgia-fantasy-5",
  fantasy5Extra:
    "https://www.lotteryusa.com/georgia/fantasy-5/"
};

function loadCurrent() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(OUTPUT, "utf8"), sandbox);
  return sandbox.window.PILOT_JACKPOTS;
}

async function getText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "PilotNumber-Jackpot-Updater/1.0 (+https://pilotnumber.com)"
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} from ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function plainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMillions(number, unit) {
  const clean = Number(String(number).replace(/,/g, ""));

  if (!Number.isFinite(clean) || clean <= 0) {
    throw new Error("Invalid jackpot amount");
  }

  const formatted = clean.toLocaleString("en-US", {
    maximumFractionDigits: 1
  });

  const unitName =
    unit[0].toUpperCase() + unit.slice(1).toLowerCase();

  return `$${formatted} ${unitName}`;
}

function parseNational(html) {
  const text = plainText(html);

  const match = text.match(
    /Current Est\.?\s*Annuitized Jackpot for [^:]+:\s*\$([\d,.]+)\s*(Million|Billion)\s+Est\.?\s*Cash Value:?\s*\$([\d,.]+)\s*(Million|Billion)/i
  );

  if (!match) {
    throw new Error("National jackpot fields were not found");
  }

  return {
    amount: formatMillions(match[1], match[2]),
    cashValue: formatMillions(match[3], match[4])
  };
}

function parseFantasy5(html) {
  const text = plainText(html);

  const match =
    text.match(
      /Fantasy\s*5[\s\S]{0,500}?(?:Next\s*)?(?:est(?:imated)?\.?\s*)?jackpot:?\s*\$([\d,]+)/i
    ) ||
    text.match(
      /(?:Next\s*)?(?:est(?:imated)?\.?\s*)?jackpot:?\s*\$([\d,]+)/i
    );

  if (!match) {
    throw new Error("Fantasy 5 jackpot field was not found");
  }

  const amount = Number(match[1].replace(/,/g, ""));

  if (
    !Number.isInteger(amount) ||
    amount < 125000 ||
    amount > 100000000
  ) {
    throw new Error("Fantasy 5 jackpot failed validation");
  }

  return {
    amount: `$${amount.toLocaleString("en-US")}`
  };
}

async function getFantasy5() {
  try {
    return parseFantasy5(await getText(SOURCES.fantasy5));
  } catch (officialError) {
    console.warn(
      `Fantasy 5 official source unavailable: ${officialError.message}`
    );

    try {
      return parseFantasy5(
        await getText(SOURCES.fantasy5Backup)
      );
    } catch (backupError) {
      console.warn(
        `Fantasy 5 backup source unavailable: ${backupError.message}`
      );

      return parseFantasy5(
        await getText(SOURCES.fantasy5Extra)
      );
    }
  }
}

function easternParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(date);

  return Object.fromEntries(
    parts.map((part) => [part.type, Number(part.value)])
  );
}

function nextDraw(days, hour, minute) {
  const now = easternParts();

  for (let add = 0; add < 8; add += 1) {
    const candidate = new Date(
      Date.UTC(now.year, now.month - 1, now.day + add, 12)
    );

    const weekday = candidate.getUTCDay();

    if (!days.includes(weekday)) {
      continue;
    }

    if (
      add === 0 &&
      now.hour * 60 + now.minute >= hour * 60 + minute
    ) {
      continue;
    }

    const date = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(candidate);

    const drawingTime = new Date(
      Date.UTC(2000, 0, 1, hour, minute)
    );

    const timeText = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    }).format(drawingTime);

    return `${date} · ${timeText} ET`;
  }

  throw new Error("Next drawing date could not be calculated");
}

function updatedAt() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date());
}

function serialize(data) {
  return `window.PILOT_JACKPOTS = ${JSON.stringify(
    data,
    null,
    2
  )};\n`;
}

async function main() {
  const current = loadCurrent();

  const results = await Promise.allSettled([
    getText(SOURCES.powerball).then(parseNational),
    getText(SOURCES.mega).then(parseNational),
    getFantasy5()
  ]);

  const [powerball, mega, fantasy5] = results;

  if (powerball.status === "fulfilled") {
    Object.assign(
      current.games.powerball,
      powerball.value
    );
  }

  if (mega.status === "fulfilled") {
    Object.assign(current.games.mega, mega.value);
  }

  if (fantasy5.status === "fulfilled") {
    Object.assign(
      current.games.fantasy5,
      fantasy5.value
    );
  }

  current.games.powerball.nextDrawing = nextDraw(
    [1, 3, 6],
    22,
    59
  );

  current.games.mega.nextDrawing = nextDraw(
    [2, 5],
    23,
    0
  );

  current.games.fantasy5.nextDrawing = nextDraw(
    [0, 1, 2, 3, 4, 5, 6],
    23,
    34
  );

  current.games.pick5.amount = "$10,000";
  current.games.pick5.nextDrawing =
    "Daily · 12:29 PM and 6:59 PM ET";

  const successful = results.filter(
    (result) => result.status === "fulfilled"
  ).length;

  if (successful > 0) {
    current.updatedAt = updatedAt();
  }

  const gameNames = [
    "powerball",
    "mega",
    "fantasy5"
  ];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `${gameNames[index]} preserved: ${result.reason.message}`
      );
    }
  });

  const temporary = `${OUTPUT}.tmp`;

  fs.writeFileSync(
    temporary,
    serialize(current),
    "utf8"
  );

  fs.renameSync(temporary, OUTPUT);

  console.log(
    `Jackpot data refreshed from ${successful} of 3 changing sources.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
