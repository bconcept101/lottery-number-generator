const SUPABASE_GAME_KEYS = {
  powerball: ["powerball"],
  mega: ["mega_millions"],
  pick5: ["georgia_five_midday", "georgia_five_evening"],
  fantasy5: ["fantasy5"]
};

const HISTORY_CACHE_TTL_MS = 5 * 60 * 1000;
const HISTORY_PAGE_SIZE = 1000;
const MAX_GENERATION_ATTEMPTS = 3000;

const historyCache = {};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUniqueRandomNumbers(count, min, max) {
  const numbers = [];

  while (numbers.length < count) {
    const number = getRandomNumber(min, max);

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
}

function getRandomNumbersWithRepeats(count, min, max) {
  const numbers = [];

  for (let i = 0; i < count; i += 1) {
    numbers.push(getRandomNumber(min, max));
  }

  return numbers;
}

function createNumberSet(game) {
  const rules = gameDatabaseSettings[game];

  let mainNumbers = [];

  if (rules.allowMainRepeats) {
    mainNumbers = getRandomNumbersWithRepeats(
      rules.mainNumbersRequired,
      rules.mainNumberMin,
      rules.mainNumberMax
    );
  } else {
    mainNumbers = getUniqueRandomNumbers(
      rules.mainNumbersRequired,
      rules.mainNumberMin,
      rules.mainNumberMax
    );
  }

  let specialBall = null;

  if (rules.hasSpecialBall) {
    specialBall = getRandomNumber(rules.specialBallMin, rules.specialBallMax);
  }

  return {
    game,
    displayName: rules.displayName,
    numbers: mainNumbers,
    specialBall,
    specialBallLabel: rules.specialBallLabel,
    display: formatNumberSet(mainNumbers, specialBall, rules.specialBallLabel)
  };
}

function formatNumberSet(numbers, specialBall, specialBallLabel) {
  if (specialBall !== null && specialBallLabel !== null) {
    return `${numbers.join("-")} ${specialBallLabel} ${specialBall}`;
  }

  return numbers.join("-");
}

function getSupabaseConfig() {
  if (typeof SUPABASE_PUBLIC_CONFIG === "undefined") {
    throw new Error("Supabase public config is missing.");
  }

  if (!SUPABASE_PUBLIC_CONFIG.url || !SUPABASE_PUBLIC_CONFIG.publishableKey) {
    throw new Error("Supabase public config is incomplete.");
  }

  return {
    url: String(SUPABASE_PUBLIC_CONFIG.url)
      .trim()
      .replace(/\/rest\/v1\/?$/i, "")
      .replace(/\/+$/g, ""),
    publishableKey: SUPABASE_PUBLIC_CONFIG.publishableKey
  };
}

function normalizeMainNumbers(game, numbers) {
  const rules = gameDatabaseSettings[game];

  if (rules.allowMainRepeats) {
    return numbers.map(Number);
  }

  return numbers.map(Number).sort((a, b) => a - b);
}

function createHistoryKey(game, numbers, specialBall) {
  const normalizedNumbers = normalizeMainNumbers(game, numbers);

  if (specialBall !== null && specialBall !== undefined) {
    return `${normalizedNumbers.join("-")}|${Number(specialBall)}`;
  }

  return normalizedNumbers.join("-");
}

function createHistoryKeyFromRow(game, row) {
  const numbers = [
    Number(row.number_1),
    Number(row.number_2),
    Number(row.number_3),
    Number(row.number_4),
    Number(row.number_5)
  ];

  const rules = gameDatabaseSettings[game];
  const specialBall = rules.hasSpecialBall ? Number(row.extra_number) : null;

  return createHistoryKey(game, numbers, specialBall);
}

async function fetchSupabaseHistoryRows(game) {
  const config = getSupabaseConfig();
  const gameKeys = SUPABASE_GAME_KEYS[game];

  if (!gameKeys || gameKeys.length === 0) {
    throw new Error(`No Supabase game mapping found for ${game}.`);
  }

  const allRows = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams();

    params.set(
      "select",
      "game_key,draw_date,number_1,number_2,number_3,number_4,number_5,extra_number"
    );

    if (gameKeys.length === 1) {
      params.set("game_key", `eq.${gameKeys[0]}`);
    } else {
      params.set("game_key", `in.(${gameKeys.join(",")})`);
    }

    params.set("limit", String(HISTORY_PAGE_SIZE));
    params.set("offset", String(offset));

    const response = await fetch(
      `${config.url}/rest/v1/lottery_draws?${params.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: config.publishableKey,
          Authorization: `Bearer ${config.publishableKey}`
        }
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase history check failed: ${response.status} ${message}`);
    }

    const rows = await response.json();
    allRows.push(...rows);

    if (rows.length < HISTORY_PAGE_SIZE) {
      break;
    }

    offset += HISTORY_PAGE_SIZE;
  }

  return allRows;
}

async function loadHistorySet(game) {
  const cached = historyCache[game];

  if (cached && Date.now() - cached.loadedAt < HISTORY_CACHE_TTL_MS) {
    return cached.historySet;
  }

  const rows = await fetchSupabaseHistoryRows(game);
  const historySet = new Set();

  rows.forEach((row) => {
    historySet.add(createHistoryKeyFromRow(game, row));
  });

  historyCache[game] = {
    loadedAt: Date.now(),
    historySet
  };

  return historySet;
}

function isPastWinningCombination(game, generatedSet, historySet) {
  const key = createHistoryKey(
    game,
    generatedSet.numbers,
    generatedSet.specialBall
  );

  return historySet.has(key);
}

function setGenerateButtonDisabled(disabled) {
  const button =
    document.querySelector("button[onclick='generateNumbers()']") ||
    document.querySelector("button[onclick='generateNumbers();']");

  if (button) {
    button.disabled = disabled;
  }
}

function showStatus(message) {
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = `
    <div class="result-item">
      <div class="result-number">${message}</div>
    </div>
  `;
}

function showError(message) {
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = `
    <div class="result-item matched-result">
      <div class="result-number">${message}</div>
    </div>
  `;
}

async function generateNumbers() {
  const game = document.getElementById("gameSelect").value;
  const numberCount = Number(document.getElementById("numberCount").value);
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = "";
  setGenerateButtonDisabled(true);
  showStatus("Checking number history...");

  try {
    const historySet = await loadHistorySet(game);
    const approvedSets = [];
    const generatedKeys = new Set();

    let attempts = 0;

    while (approvedSets.length < numberCount && attempts < MAX_GENERATION_ATTEMPTS) {
      attempts += 1;

      const numberSet = createNumberSet(game);

      const generatedKey = createHistoryKey(
        game,
        numberSet.numbers,
        numberSet.specialBall
      );

      if (generatedKeys.has(generatedKey)) {
        continue;
      }

      if (isPastWinningCombination(game, numberSet, historySet)) {
        continue;
      }

      generatedKeys.add(generatedKey);
      approvedSets.push(numberSet);
    }

    if (approvedSets.length < numberCount) {
      throw new Error("The generator could not produce enough unique sets after checking history.");
    }

    resultBox.innerHTML = "";

    approvedSets.forEach((numberSet, index) => {
      const resultItem = document.createElement("div");
      resultItem.className = "result-item";

      resultItem.innerHTML = `
        <div class="result-index">${index + 1}</div>
        <div class="result-number">${numberSet.display}</div>
      `;

      resultBox.appendChild(resultItem);
    });
  } catch (error) {
    showError("Number history check is temporarily unavailable. Please try again later.");
    console.error(error);
  } finally {
    setGenerateButtonDisabled(false);
  }
}
