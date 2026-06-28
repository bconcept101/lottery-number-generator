function formatLatestResultValue(value, fallbackText) {
  if (value && value.trim() !== "") {
    return value;
  }

  return fallbackText;
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

    if (drawDateElement) {
      drawDateElement.textContent = formatLatestResultValue(
        result.drawDate,
        "Result date is being reviewed"
      );
    }

    if (winningNumbersElement) {
      winningNumbersElement.textContent = formatLatestResultValue(
        result.winningNumbers,
        "Winning numbers are being reviewed"
      );
    }

    if (extraNumberElement) {
      extraNumberElement.textContent = formatLatestResultValue(
        result.extraNumber,
        "Extra game number is being reviewed"
      );
    }

    if (drawTypeElement) {
      drawTypeElement.textContent = formatLatestResultValue(
        result.drawType,
        "Draw type is being reviewed"
      );
    }

    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = formatLatestResultValue(
        result.lastUpdated,
        "Update time is being reviewed"
      );
    }
  });
}

document.addEventListener("DOMContentLoaded", displayLatestResults);
