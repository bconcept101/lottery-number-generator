function getRandomNumbers(count, max) {
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
    digits.push(Math.floor(Math.random() * 10));
  }

  return digits;
}

function createNumberSet(game) {
  if (game === "powerball") {
    const mainNumbers = getRandomNumbers(5, 69);
    const powerball = Math.floor(Math.random() * 26) + 1;

    return {
      display: `${mainNumbers.join("-")} PB ${powerball}`,
      numbers: mainNumbers,
      specialBall: powerball
    };
  }

  if (game === "mega") {
    const mainNumbers = getRandomNumbers(5, 70);
    const megaBall = Math.floor(Math.random() * 25) + 1;

    return {
      display: `${mainNumbers.join("-")} MB ${megaBall}`,
      numbers: mainNumbers,
      specialBall: megaBall
    };
  }

  if (game === "pick5") {
    const digits = getRandomDigits(5);

    return {
      display: digits.join("-"),
      numbers: digits,
      specialBall: null
    };
  }
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
