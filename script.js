const pastNumbers = {
  powerball: [
    "12-18-24-36-45 PB 7",
    "3-15-27-41-62 PB 19"
  ],
  mega: [
    "8-14-22-39-50 MB 12",
    "5-17-31-44-66 MB 20"
  ],
  pick5: [
    "1-2-3-4-5",
    "7-4-9-0-2"
  ]
};

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
    return `${mainNumbers.join("-")} PB ${powerball}`;
  }

  if (game === "mega") {
    const mainNumbers = getRandomNumbers(5, 70);
    const megaBall = Math.floor(Math.random() * 25) + 1;
    return `${mainNumbers.join("-")} MB ${megaBall}`;
  }

  if (game === "pick5") {
    const digits = getRandomDigits(5);
    return digits.join("-");
  }
}

function generateNumbers() {
  const game = document.getElementById("gameSelect").value;
  const numberCount = Number(document.getElementById("numberCount").value);
  const resultBox = document.getElementById("result");

  resultBox.innerHTML = "";

  for (let i = 1; i <= numberCount; i++) {
    const numberSet = createNumberSet(game);
    const foundInDatabase = pastNumbers[game].includes(numberSet);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    resultItem.innerHTML = `
      <div class="result-number">${i}. ${numberSet}</div>
      <div class="result-status">
        ${foundInDatabase 
          ? "Found in the sample past-number database."
          : "Not found in the sample past-number database."}
      </div>
    `;

    resultBox.appendChild(resultItem);
  }
}
