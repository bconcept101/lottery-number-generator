const gameRules = {
  powerball: {
    mainCount: 5,
    mainMax: 69,
    specialMax: 26,
    specialLabel: "PB",
    allowMainRepeats: false
  },

  mega: {
    mainCount: 5,
    mainMax: 70,
    specialMax: 24,
    specialLabel: "MB",
    allowMainRepeats: false
  },

  pick5: {
    mainCount: 5,
    mainMax: 9,
    specialMax: null,
    specialLabel: null,
    allowMainRepeats: true
  },

  fantasy5: {
    mainCount: 5,
    mainMax: 42,
    specialMax: null,
    specialLabel: null,
    allowMainRepeats: false
  }
};

function getUniqueRandomNumbers(count, max) {
  let numbers = [];

  while (numbers.length < count) {
    let number = Math.floor(Math.random() * max) + 1;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
}

function getRandomDigits(count) {
  let digits = [];

  for (let i = 0; i < count; i++) {
    let digit = Math.floor(Math.random() * 10);
    digits.push(digit);
  }

  return digits;
}

function createNumberSet(game) {
  const rules = gameRules[game];

  if (game === "pick5") {
    const digits = getRandomDigits(rules.mainCount);

    return {
      display: digits.join("-"),
      numbers: digits,
      specialBall: null
    };
  }

  const mainNumbers = getUniqueRandomNumbers(rules.mainCount, rules.mainMax);

  if (rules.specialMax) {
    const specialBall = Math.floor(Math.random() * rules.specialMax) + 1;

    return {
      display: `${mainNumbers.join("-")} ${rules.specialLabel} ${specialBall}`,
      numbers: mainNumbers,
      specialBall: specialBall
    };
  }

  return {
    display: mainNumbers.join("-"),
    numbers: mainNumbers,
    specialBall: null
  };
}

function generateNumbers() {
  const game = document.getElementById("gameSelect").value;
  const numberCount = Number(document.getElementById("numberCount").value);
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = "";

  for (let i = 1; i <= numberCount; i++) {
    const numberSet = createNumberSet(game);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    resultItem.innerHTML = `
      <div class="result-index">${i}</div>
      <div class="result-number">${numberSet.display}</div>
    `;

    resultBox.appendChild(resultItem);
  }
}
