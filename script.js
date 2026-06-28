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

function generateNumbers() {
  const game = document.getElementById("gameSelect").value;
  const resultBox = document.getElementById("result");
  const historyBox = document.getElementById("historyCheck");

  let finalNumbers = "";

  if (game === "powerball") {
    const mainNumbers = getRandomNumbers(5, 69);
    const powerball = Math.floor(Math.random() * 26) + 1;
    finalNumbers = `${mainNumbers.join("-")} PB ${powerball}`;
  }

  if (game === "mega") {
    const mainNumbers = getRandomNumbers(5, 70);
    const megaBall = Math.floor(Math.random() * 25) + 1;
    finalNumbers = `${mainNumbers.join("-")} MB ${megaBall}`;
  }

  if (game === "pick5") {
    const digits = getRandomDigits(5);
    finalNumbers = digits.join("-");
  }

  resultBox.textContent = finalNumbers;

  if (pastNumbers[game].includes(finalNumbers)) {
    historyBox.textContent = "This number set already appeared in the sample database.";
  } else {
    historyBox.textContent = "This number set was not found in the sample database.";
  }
}
