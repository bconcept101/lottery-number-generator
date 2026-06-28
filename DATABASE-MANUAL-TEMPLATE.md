# Database Manual Template

## Purpose

This file provides clean manual templates for adding real past winning draw results to the Lottery Number Generator Website.

Manual entries may be used before the full Supabase backend database is created.

This file also documents the backup structure for manually correcting `latest-results.js` only if the automated latest-results workflow fails.

---

# Important Rule

Only real past winning draw results should be saved.

Generated numbers from the website should never be saved as official past results.

---

# Current Result Files

The project currently uses:

1. `database.js`
2. `latest-results.js`

---

# database.js Purpose

`database.js` stores available past winning draw history.

This file supports the generator structure and prepares the project for future full-history database checking.

---

# latest-results.js Purpose

`latest-results.js` stores the latest winning results displayed on the homepage.

This file is normally updated by GitHub Actions automation.

Manual editing should only be used as a backup if automation fails and the homepage result data needs correction.

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Game Keys

Use these game keys:

1. `powerball`
2. `mega`
3. `pick5`
4. `fantasy5`

---

# Source Rule

Use official or approved sources whenever possible.

Source priority:

1. Official structured data source
2. Official lottery website result page
3. Official downloadable result file
4. Verified public data source
5. Readable fallback source only when no better source is available

---

# General Manual Entry Rules

Each manual result should include:

1. Draw date
2. Draw type when needed
3. Main numbers
4. Special ball when required
5. Special ball label when required
6. Source
7. Verified status

---

# Powerball database.js Template

Use this format for Powerball results:

    {
      drawDate: "YYYY-MM-DD",
      numbers: [0, 0, 0, 0, 0],
      specialBall: 0,
      specialBallLabel: "PB",
      source: "Official or approved source",
      verified: true
    }

## Powerball Rules

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26
5. Special ball label should be `PB`

## Powerball Duplicate Check

Check duplicates by:

1. Game key
2. Draw date

---

# Mega Millions database.js Template

Use this format for Mega Millions results:

    {
      drawDate: "YYYY-MM-DD",
      numbers: [0, 0, 0, 0, 0],
      specialBall: 0,
      specialBallLabel: "MB",
      source: "Official or approved source",
      verified: true
    }

## Mega Millions Rules

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24
5. Special ball label should be `MB`

## Mega Millions Duplicate Check

Check duplicates by:

1. Game key
2. Draw date

---

# Pick 5 / Georgia Five database.js Template

Use this format for Pick 5 / Georgia Five results:

    {
      drawDate: "YYYY-MM-DD",
      drawType: "midday",
      numbers: [0, 0, 0, 0, 0],
      specialBall: null,
      specialBallLabel: null,
      source: "Official or approved source",
      verified: true
    }

Use `drawType: "evening"` for Evening results.

## Pick 5 / Georgia Five Rules

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. No special ball
6. Midday and Evening results are separate records

## Pick 5 / Georgia Five Duplicate Check

Check duplicates by:

1. Game key
2. Draw date
3. Draw type

A Midday result and Evening result on the same date are different records.

---

# Fantasy 5 / Georgia Fantasy 5 database.js Template

Use this format for Fantasy 5 / Georgia Fantasy 5 results:

    {
      drawDate: "YYYY-MM-DD",
      drawType: "night",
      numbers: [0, 0, 0, 0, 0],
      specialBall: null,
      specialBallLabel: null,
      source: "Official or approved source",
      verified: true
    }

## Fantasy 5 / Georgia Fantasy 5 Rules

1. Five main numbers
2. Main numbers from 1 to 42
3. No repeated main numbers
4. No special ball
5. Draw type should be `night`

## Fantasy 5 / Georgia Fantasy 5 Duplicate Check

Check duplicates by:

1. Game key
2. Draw date
3. Draw type

---

# Where To Add Results In database.js

## Powerball

Add Powerball results inside the Powerball section:

    powerball: [
      // Add Powerball results here
    ]

## Mega Millions

Add Mega Millions results inside the Mega Millions section:

    mega: [
      // Add Mega Millions results here
    ]

## Pick 5 / Georgia Five

Add Pick 5 / Georgia Five results inside the Pick 5 section:

    pick5: [
      // Add Pick 5 / Georgia Five results here
    ]

## Fantasy 5 / Georgia Fantasy 5

Add Fantasy 5 / Georgia Fantasy 5 results inside the Fantasy 5 section:

    fantasy5: [
      // Add Fantasy 5 / Georgia Fantasy 5 results here
    ]

---

# Example Powerball Entry

    {
      drawDate: "2026-06-27",
      numbers: [12, 18, 24, 36, 45],
      specialBall: 7,
      specialBallLabel: "PB",
      source: "Official or approved source",
      verified: true
    }

---

# Example Mega Millions Entry

    {
      drawDate: "2026-06-27",
      numbers: [8, 14, 22, 39, 50],
      specialBall: 12,
      specialBallLabel: "MB",
      source: "Official or approved source",
      verified: true
    }

---

# Example Pick 5 / Georgia Five Midday Entry

    {
      drawDate: "2026-06-27",
      drawType: "midday",
      numbers: [4, 2, 6, 9, 6],
      specialBall: null,
      specialBallLabel: null,
      source: "Official or approved source",
      verified: true
    }

---

# Example Pick 5 / Georgia Five Evening Entry

    {
      drawDate: "2026-06-27",
      drawType: "evening",
      numbers: [2, 5, 3, 5, 7],
      specialBall: null,
      specialBallLabel: null,
      source: "Official or approved source",
      verified: true
    }

---

# Example Fantasy 5 / Georgia Fantasy 5 Entry

    {
      drawDate: "2026-06-27",
      drawType: "night",
      numbers: [1, 4, 20, 23, 24],
      specialBall: null,
      specialBallLabel: null,
      source: "Official or approved source",
      verified: true
    }

---

# Manual Update Steps for database.js

Use these steps only for carefully reviewed past winning draw history:

1. Open the official or approved result source
2. Confirm the game
3. Confirm the draw date
4. Confirm the draw type when required
5. Confirm the numbers
6. Confirm the special ball when required
7. Confirm the result does not already exist
8. Add the result to the correct game section in `database.js`
9. Check commas carefully
10. Commit the change to GitHub
11. Wait for Cloudflare Pages to redeploy
12. Test the live website

---

# Comma Rule

When adding multiple results, each result must be separated by a comma.

Example:

    {
      drawDate: "2026-06-27",
      numbers: [12, 18, 24, 36, 45],
      specialBall: 7,
      specialBallLabel: "PB",
      source: "Official or approved source",
      verified: true
    },
    {
      drawDate: "2026-06-28",
      numbers: [3, 15, 27, 41, 62],
      specialBall: 19,
      specialBallLabel: "PB",
      source: "Official or approved source",
      verified: true
    }

Do not add an extra comma after the last item unless the code structure safely allows it.

---

# Verified Status Rule

Use:

    verified: true

Only when the result came from an official or approved source.

Use:

    verified: false

Only when the result has not been verified.

Unverified data should not be used for full-history imports.

---

# Source Field Rule

Use the source field to identify where the result came from.

Examples:

    source: "Powerball official previous results"

    source: "Mega Millions official previous drawings"

    source: "Georgia Lottery official results"

    source: "Approved structured result source"

---

# latest-results.js Manual Backup Template

Use this only if the automated latest-results workflow fails and homepage results must be corrected manually.

The live homepage reads latest result data from `latest-results.js`.

Manual latest-results backup structure:

    const latestResults = {
      "powerball": {
        "gameName": "Powerball",
        "status": "Latest result reviewed daily",
        "drawDate": "Saturday, June 27, 2026",
        "winningNumbers": "03 - 16 - 28 - 30 - 59",
        "extraNumberLabel": "Powerball Number",
        "extraNumber": "11",
        "lastUpdated": "June 28, 2026"
      },
      "mega": {
        "gameName": "Mega Millions",
        "status": "Latest result reviewed daily",
        "drawDate": "Friday, June 26, 2026",
        "winningNumbers": "05 - 13 - 30 - 33 - 52",
        "extraNumberLabel": "Mega Ball Number",
        "extraNumber": "06",
        "lastUpdated": "June 28, 2026"
      },
      "pick5": {
        "gameName": "Pick 5 / Georgia Five",
        "status": "Latest result reviewed daily",
        "drawDate": "Saturday, June 27, 2026",
        "winningNumbers": "Midday: 4 - 2 - 6 - 9 - 6 | Evening: 2 - 5 - 3 - 5 - 7",
        "drawType": "Midday and Evening",
        "lastUpdated": "June 28, 2026"
      },
      "fantasy5": {
        "gameName": "Fantasy 5 / Georgia Fantasy 5",
        "status": "Latest result reviewed daily",
        "drawDate": "Saturday, June 27, 2026",
        "winningNumbers": "01 - 04 - 20 - 23 - 24",
        "drawType": "Night draw",
        "lastUpdated": "June 28, 2026"
      }
    };

---

# Manual Update Steps for latest-results.js

Use these steps only if automation fails:

1. Check the official or approved latest result source
2. Confirm the game name
3. Confirm the draw date
4. Confirm the winning numbers
5. Confirm the Powerball or Mega Ball number when required
6. Confirm the Georgia draw type when required
7. Update only the affected game in `latest-results.js`
8. Do not erase valid data for the other games
9. Commit the change to GitHub
10. Wait for Cloudflare Pages to redeploy
11. Test the homepage Latest Winning Results section

---

# Manual latest-results.js Safety Rules

When manually editing `latest-results.js`:

1. Do not write internal errors into public result cards
2. Do not write blank winning numbers
3. Do not remove valid saved results because one source failed
4. Do not change game keys
5. Do not change homepage element IDs
6. Keep Pick 5 Midday and Evening separated with the `|` divider so the display script can place them on separate lines

---

# Future Supabase Import Direction

The manual database templates are not the final long-term system.

Future direction:

1. Collect full history for all four games
2. Clean and verify the data
3. Import verified results into Supabase
4. Store each draw as a database row
5. Run daily automation to save new results
6. Check generated numbers against stored history before showing them to visitors

---

# Future Supabase Fields

Future Supabase records should include:

1. game_key
2. game_name
3. draw_date
4. draw_time
5. draw_type
6. main_numbers
7. special_ball
8. special_ball_label
9. combination_key
10. source_url
11. source_type
12. verified
13. update_method
14. created_at
15. updated_at

---

# Current Status

This file is a manual support template.

It supports the current project structure while preparing the website for the future backend database system.
