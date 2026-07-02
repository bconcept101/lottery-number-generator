function formatLatestResultValue(value, fallbackText) {
  if (value && String(value).trim() !== "") {
    return value;
  }

  return fallbackText;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function appendLine(element, text, addSpacing = false) {
  const line = document.createElement("span");
  line.textContent = text;
  line.style.display = "block";

  if (addSpacing) {
    line.style.marginTop = "4px";
  }

  element.appendChild(line);
}

function displayValue(element, value, fallbackText) {
  if (!element) {
    return;
  }

  element.textContent = formatLatestResultValue(value, fallbackText);
}

function displayMultiLineValue(element, value, fallbackText) {
  if (!element) {
    return;
  }

  const finalValue = formatLatestResultValue(value, fallbackText);

  clearElement(element);

  let parts = [finalValue];

  if (finalValue.includes(" | ")) {
    parts = finalValue.split(" | ");
  } else if (finalValue.includes("; ")) {
    parts = finalValue.split("; ");
  }

  parts.forEach((part, index) => {
    appendLine(element, part, index > 0);
  });
}

function displayPick5DrawDate(element, result) {
  if (!element) {
    return;
  }

  clearElement(element);

  if (result.middayDrawDateTime && result.eveningDrawDateTime) {
    appendLine(element, `Midday: ${result.middayDrawDateTime}`);
    appendLine(element, `Evening: ${result.eveningDrawDateTime}`, true);
    return;
  }

  displayMultiLineValue(
    element,
    result.drawDate,
    "Pick 5 draw dates are being reviewed"
  );
}

function displayPick5WinningNumbers(element, result) {
  if (!element) {
    return;
  }

  clearElement(element);

  if (result.middayWinningNumbers && result.eveningWinningNumbers) {
    appendLine(element, `Midday: ${result.middayWinningNumbers}`);
    appendLine(element, `Evening: ${result.eveningWinningNumbers}`, true);
    return;
  }

  displayMultiLineValue(
    element,
    result.winningNumbers,
    "Pick 5 winning numbers are being reviewed"
  );
}

function displayPick5DrawType(element, result) {
  if (!element) {
    return;
  }

  if (result.middayDrawTime && result.eveningDrawTime) {
    displayMultiLineValue(
      element,
      `Midday draw: ${result.middayDrawTime}; Evening draw: ${result.eveningDrawTime}`,
      "Draw type is being reviewed"
    );
    return;
  }

  displayMultiLineValue(
    element,
    result.drawType,
    "Draw type is being reviewed"
  );
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

    if (card.key === "pick5") {
      displayPick5DrawDate(drawDateElement, result);
      displayPick5WinningNumbers(winningNumbersElement, result);
      displayPick5DrawType(drawTypeElement, result);
      displayValue(lastUpdatedElement, result.lastUpdated, "Update time is being reviewed");
      return;
    }

    displayValue(drawDateElement, result.drawDate, "Result date is being reviewed");
    displayMultiLineValue(winningNumbersElement, result.winningNumbers, "Winning numbers are being reviewed");
    displayValue(extraNumberElement, result.extraNumber, "Extra game number is being reviewed");
    displayMultiLineValue(drawTypeElement, result.drawType, "Draw type is being reviewed");
    displayValue(lastUpdatedElement, result.lastUpdated, "Update time is being reviewed");
  });
}

document.addEventListener("DOMContentLoaded", displayLatestResults);
