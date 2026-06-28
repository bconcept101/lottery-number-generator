function formatLatestResultValue(value, fallbackText) {
  if (value && value.trim() !== "") {
    return value;
  }

  return fallbackText;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function displayValue(element, value, fallbackText) {
  if (!element) {
    return;
  }

  element.textContent = formatLatestResultValue(value, fallbackText);
}

function displayWinningNumbers(element, value, fallbackText) {
  if (!element) {
    return;
  }

  const finalValue = formatLatestResultValue(value, fallbackText);

  clearElement(element);

  if (finalValue.includes(" | ")) {
    const parts = finalValue.split(" | ");

    parts.forEach((part, index) => {
      const line = document.createElement("span");
      line.textContent = part;
      line.style.display = "block";

      if (index > 0) {
        line.style.marginTop = "4px";
      }

      element.appendChild(line);
    });

    return;
  }

  element.textContent = finalValue;
}

function displayLatestResults() {
  if (typeof latestResults === "undefined") {
    return;
  }

  const resultCards = [
    {
      key: "powerball",
      drawDateId: "powerballDrawDate",
      winningNumbersId: "powerballWinningNumbers",
      extraNumberId: "powerballExtraNumber",
      lastUpdatedId: "powerballLastUpdated"
    },
    {
      key: "mega",
      drawDateId: "megaDrawDate",
      winningNumbersId: "megaWinningNumbers",
      extraNumberId: "megaExtraNumber",
      lastUpdatedId: "megaLastUpdated"
    },
    {
      key: "pick5",
      drawDateId: "pick5DrawDate",
      winningNumbersId: "pick5WinningNumbers",
      drawTypeId: "pick5DrawType",
      lastUpdatedId: "pick5LastUpdated"
    },
    {
      key: "fantasy5",
      drawDateId: "fantasy5DrawDate",
      winningNumbersId: "fantasy5WinningNumbers",
      drawTypeId: "fantasy5DrawType",
      lastUpdatedId: "fantasy5LastUpdated"
    }
  ];

  resultCards.forEach((card) => {
    const result = latestResults[card.key];

    if (!result) {
      return;
    }

    const drawDateElement = document.getElementById(card.drawDateId);
    const winningNumbersElement = document.getElementById(card.winningNumbersId);
    const extraNumberElement = document.getElementById(card.extraNumberId);
    const drawTypeElement = document.getElementById(card.drawTypeId);
    const lastUpdatedElement = document.getElementById(card.lastUpdatedId);

    displayValue(drawDateElement, result.drawDate, "Result date is being reviewed");
    displayWinningNumbers(winningNumbersElement, result.winningNumbers, "Winning numbers are being reviewed");
    displayValue(extraNumberElement, result.extraNumber, "Extra game number is being reviewed");
    displayValue(drawTypeElement, result.drawType, "Draw type is being reviewed");
    displayValue(lastUpdatedElement, result.lastUpdated, "Update time is being reviewed");
  });
}

document.addEventListener("DOMContentLoaded", displayLatestResults);
