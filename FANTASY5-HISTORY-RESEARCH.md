# Georgia Fantasy 5 History Research

## Production Status

Status: Started
Game: Georgia Fantasy 5
Project: Lottery Number Generator Website
Purpose: Build a clean historical database for Georgia Fantasy 5 results.

---

## Game Name

Official game name:

**Fantasy 5**

Website display name:

**Georgia Fantasy 5**

Internal database name:

```text
fantasy5
```

---

## Game Format

Georgia Fantasy 5 is a daily draw game.

Each result contains:

```text
5 numbers
```

Current number range:

```text
1 through 42
```

Example result:

```text
3, 9, 19, 27, 41
```

---

## History Collection Goal

The goal is to collect Fantasy 5 historical draw results and clean them into one verified JSON file for the website database.

Raw file:

```text
data/raw/fantasy5-history.csv
```

Cleaned file:

```text
data/cleaned/fantasy5-history-cleaned.json
```

Review file:

```text
FANTASY5-DUPLICATE-REVIEW.md
```

---

## Primary Collection Source

Primary source for collecting raw history:

**LotteryUSA Georgia Fantasy 5 yearly results page**

Reason:

* Easy to view yearly results
* Easier to copy/export data
* Shows draw date, winning numbers, and jackpot information

---

## Official Validation Source

Official validation source:

**Georgia Lottery Fantasy 5 page**

Reason:

* Confirms official game name
* Confirms number format
* Confirms game rules
* Official lottery records should always control if there is a conflict

---

## Raw CSV Format

The raw CSV file should use this header:

```csv
date,result,jackpot,source
```

Example row:

```csv
2026-06-30,"3,9,19,27,41",125000,lotteryusa
```

---

## Clean JSON Format

Each cleaned record should look like this:

```json
{
  "game": "fantasy5",
  "draw_date": "2026-06-30",
  "draw_period": "night",
  "numbers": [3, 9, 19, 27, 41],
  "jackpot": 125000,
  "source": "lotteryusa",
  "verified": false
}
```

---

## Validation Rules

The cleaning script must check:

1. Every row must have a valid date.
2. Every result must have exactly 5 numbers.
3. Every number must be between 1 and 42.
4. No number should repeat inside the same draw.
5. No duplicate draw date should exist.
6. Output must be sorted from oldest to newest.
7. Rejected rows must be listed in the duplicate review file.

---

## Production Notes

Fantasy 5 should stay separate from Georgia FIVE / Pick 5.

Fantasy 5 uses regular lottery numbers.

Georgia FIVE / Pick 5 uses digits and has Midday and Evening draws.

Do not mix both games in the same history file.
