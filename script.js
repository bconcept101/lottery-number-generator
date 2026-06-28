function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUniqueRandomNumbers(count, min, max) {
  let numbers = [];

  while (numbers.length < count) {
    const number = getRandomNumber(min, max);

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
}

function getRandomNumbersWithRepeats(count, min, max) {
  let numbers = [];

  for (let i = 0; i < count; i++) {
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
    game: game,
    displayName: rules.displayName,
    numbers: mainNumbers,
    specialBall: specialBall,
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

function numbersMatch(firstNumbers, secondNumbers) {
  if (firstNumbers.length !== secondNumbers.length) {
    return false;
  }

  for (let i = 0; i < firstNumbers.length; i++) {
    if (firstNumbers[i] !== secondNumbers[i]) {
      return false;
    }
  }

  return true;
}

function checkPastNumberMatch(game, generatedSet) {
  const gameHistory = pastNumbers[game];

  if (!gameHistory || gameHistory.length === 0) {
    return false;
  }

  return gameHistory.some((pastResult) => {
    const mainNumbersMatch = numbersMatch(pastResult.numbers, generatedSet.numbers);
    const specialBallMatch = pastResult.specialBall === generatedSet.specialBall;

    return mainNumbersMatch && specialBallMatch;
  });
}

function generateNumbers() {
  const game = document.getElementById("gameSelect").value;
  const numberCount = Number(document.getElementById("numberCount").value);
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = "";

  for (let i = 1; i <= numberCount; i++) {
    const numberSet = createNumberSet(game);
    const foundInPastDatabase = checkPastNumberMatch(game, numberSet);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    if (foundInPastDatabase) {
      resultItem.classList.add("matched-result");
    }

    resultItem.innerHTML = `
      <div class="result-index">${i}</div>
      <div class="result-number">${numberSet.display}</div>
    `;

    resultBox.appendChild(resultItem);
  }
}
