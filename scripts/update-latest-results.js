const LOTTERY_DATE_TEXT_REGEX =
  /(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2},?\s+\d{4}/i;

function lotteryHtmlToSearchText(html) {
  return decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|hr)\s*\/?\s*>/gi, " ")
    .replace(/<\/(li|td|th|tr|p|div|span|h1|h2|h3|h4|h5|h6|section|article|main|header|footer)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[•*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findLatestLotteryUsaDraw(html) {
  const text = lotteryHtmlToSearchText(html);
  const latestIndex = text.search(/\bLatest numbers\b/i);

  if (latestIndex === -1) {
    throw new Error("Latest numbers section was not found");
  }

  const latestText = text.slice(latestIndex, latestIndex + 6000);
  const dateMatch = latestText.match(LOTTERY_DATE_TEXT_REGEX);

  if (!dateMatch) {
    throw new Error(`Latest draw date was not found. Source snippet: ${latestText.slice(0, 350)}`);
  }

  const dateText = dateMatch[0];
  const afterDate = latestText.slice(dateMatch.index + dateText.length);
  const nextDateMatch = afterDate.match(LOTTERY_DATE_TEXT_REGEX);

  return {
    dateKey: dateKeyFromText(dateText),
    dateText,
    drawText: afterDate.slice(0, nextDateMatch ? nextDateMatch.index : 1500)
  };
}

function removePrizeText(text) {
  return String(text || "")
    .replace(/\$[\d,]+(?:\.\d+)?(?:\s*(?:Million|Billion|Thousand))?/gi, " ")
    .replace(/\bCash\s+value\s*:?\s*/gi, " ")
    .replace(/\b(?:Top\s+prize|Est\.?\s+jackpot|Estimated\s+jackpot|Jackpot|Prize|Prizes)\b[\s\S]*$/i, " ");
}

function collectStandaloneNumbers(text) {
  return Array.from(removePrizeText(text).matchAll(/\b\d{1,2}\b/g)).map((match) => match[0]);
}

function parseLotteryUsaDailyGame(html, expectedCount) {
  const latest = findLatestLotteryUsaDraw(html);
  const numberText = latest.drawText.split(/\b(?:Top\s+prize|Est\.?\s+jackpot|Estimated\s+jackpot|Jackpot)\b/i)[0];
  const numbers = collectStandaloneNumbers(numberText).slice(0, expectedCount);

  if (numbers.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} numbers but found ${numbers.length}. Source snippet: ${latest.drawText.slice(0, 350)}`
    );
  }

  return {
    dateKey: latest.dateKey,
    numbers
  };
}

function parseLotteryUsaBallGame(html, expectedMainCount, specialLabelRegex) {
  const latest = findLatestLotteryUsaDraw(html);
  const specialMatch = latest.drawText.match(specialLabelRegex);
  const powerPlayMatch = latest.drawText.match(/Power\s*Play\s*:?\s*(\d+)/i);

  if (!specialMatch) {
    throw new Error(`Special ball number was not found. Source snippet: ${latest.drawText.slice(0, 350)}`);
  }

  const mainNumberText = latest.drawText.split(/\b(?:PB|MB)\s*:/i)[0];
  const mainNumbers = collectStandaloneNumbers(mainNumberText).slice(0, expectedMainCount);

  if (mainNumbers.length !== expectedMainCount) {
    throw new Error(
      `Expected ${expectedMainCount} main numbers but found ${mainNumbers.length}. Source snippet: ${latest.drawText.slice(0, 350)}`
    );
  }

  return {
    dateKey: latest.dateKey,
    mainNumbers,
    extraNumber: specialMatch[1],
    multiplier: powerPlayMatch ? powerPlayMatch[1] : null
  };
}
