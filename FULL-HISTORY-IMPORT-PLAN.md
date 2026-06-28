# Full History Import Plan

## Purpose

This file explains the plan for collecting, verifying, formatting, and importing full past winning number history for the Lottery Number Generator Website.

This step is important before adding large amounts of past results to the website database.

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Main Goal

The goal is to build a complete and organized past-results database for all supported games.

The database should eventually include as much verified history as possible for each game.

---

# Important Rule

Generated numbers from the website should never be saved as official past winning numbers.

Only real past draw results should be added to the database.

---

# Current Database Status

The website currently uses:

`database.js`

This file is only the temporary manual database structure.

For full historical data, the better long-term plan is:

1. Collect full history
2. Clean and verify the data
3. Format the data
4. Import it into Supabase later
5. Connect the website to Supabase
6. Use automation to update new results daily

---

# Why We Should Not Add Random Partial History Yet

We should not add random partial history into the live database too early because:

1. It can create incomplete history
2. It can mix verified and unverified results
3. It can make the database harder to clean later
4. It can create duplicate results
5. It can make automation harder later
6. It can confuse the purpose of the database

The better process is to collect and organize the history properly first.

---

# Full History Collection Plan

## Step 1: Research Each Game Separately

Each game should be researched individually.

Games:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

For each game, collect:

1. Game name
2. Draw date
3. Draw time if needed
4. Winning numbers
5. Special ball if needed
6. Source URL
7. Verification status

---

## Step 2: Find the Best Source for Each Game

Preferred source order:

1. Official lottery website
2. Official downloadable result file
3. Official state lottery result page
4. Verified public data source
5. Third-party source only if official history is not available

If a third-party source is used, the data should be checked against an official source when possible.

---

## Step 3: Decide How Far Back to Collect

Goal:

Collect history as far back as reasonably possible.

Each game may have a different available history range.

The final history range should be documented before import.

---

# Game Data Requirements

## Powerball

Required data:

1. Draw date
2. Five main numbers
3. Powerball number
4. Source
5. Verified status

Format:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [0, 0, 0, 0, 0],
  specialBall: 0,
  specialBallLabel: "PB",
  source: "Source name",
  verified: true
}
