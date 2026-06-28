# Full History Import Plan

## Purpose

This file explains the plan for collecting, verifying, formatting, and importing full past winning number history for the Lottery Number Generator Website.

This plan is important because the website should eventually use a complete backend history database instead of relying only on temporary or partial history inside website files.

The full-history database will support two major goals:

1. Store verified past winning draw results for all supported games.
2. Allow generated number sets to be checked against past winning draw history before final numbers are shown to the visitor.

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

Once the full history database is built, the website should be able to:

1. Store past winning draw results
2. Store new daily winning results automatically
3. Prevent duplicate draw records
4. Check generated numbers against stored past winning results
5. Avoid showing generated number sets that already appeared as past winning draw combinations

---

# Important Rule

Generated numbers from the website should never be saved as official past winning numbers.

Only real past draw results should be added to the history database.

---

# Current Database Status

The website currently uses:

database.js

This file supports the current game structure and available past-result checking.

The website also uses:

latest-results.js

This file stores the latest winning results displayed on the homepage.

The current latest-results automation is working through GitHub Actions, but the full historical database system is still planned for future expansion.

---

# Current Automation Status

The website currently has a working latest-results automation system.

Current automation files:

1. latest-results.js
2. latest-results-display.js
3. scripts/update-latest-results.js
4. .github/workflows/update-latest-results.yml

Current automation purpose:

1. Pull latest result data
2. Validate the result data
3. Update latest-results.js
4. Display recent winning results on the homepage

This current automation does not yet store full historical draw records in a backend database.

---

# Future Backend Database Goal

The future backend database platform is planned to be:

Supabase

Supabase will eventually store full past winning result history for all supported games.

The future database should allow the website to:

1. Read full past winning draw history
2. Check generated numbers against stored results
3. Store newly updated daily draw results
4. Prevent duplicate result records
5. Keep the website organized and scalable

---

# Final System Goal

The final system should work like this:

1. Full historical draw results are collected for all four supported games.
2. The historical results are cleaned and verified.
3. The cleaned results are imported into the backend database.
4. The automated system checks for new draw results daily.
5. New verified results are saved into the backend database.
6. When a visitor generates numbers, the website checks those numbers against the history database.
7. If a generated number set already appeared as a past winning draw, the system avoids showing that set.
8. The visitor receives random number ideas that have been checked against the available stored winning history.

---

# Why We Should Not Add Random Partial History Too Early

Large random partial history should not be added too early because:

1. It can create incomplete history
2. It can mix verified and unverified results
3. It can create duplicate records
4. It can make the database harder to clean later
5. It can make automation harder to build
6. It can make generated-number checking less reliable
7. It can create confusion between real history and incomplete imported data

The better process is to research, collect, clean, verify, and import history properly.

---

# History Research Files

The project should include four history research files:

1. POWERBALL-HISTORY-RESEARCH.md
2. MEGA-MILLIONS-HISTORY-RESEARCH.md
3. PICK-5-GEORGIA-FIVE-HISTORY-RESEARCH.md
4. FANTASY-5-GEORGIA-FANTASY-5-HISTORY-RESEARCH.md

Purpose of these files:

1. Research the best history source for each game
2. Confirm official sources
3. Confirm possible full-history sources
4. Confirm available history range
5. Confirm validation rules
6. Confirm duplicate prevention rules
7. Prepare for clean import into the future database

---

# Source Priority Rule

Use sources in this order:

1. Official structured data source
2. Official lottery website result page
3. Official downloadable result file
4. Verified public data source
5. Readable third-party source only when no better source is available

If a third-party source is used, the data should be reviewed carefully before import.

Visitors should always be reminded to confirm final winning numbers, prize details, drawing schedules, and rules through the official lottery source.

---

# Full History Collection Plan

## Step 1: Research Each Game Separately

Each game should be researched individually.

For each game, collect:

1. Game name
2. Game key
3. Draw date
4. Draw time if needed
5. Draw type if needed
6. Winning numbers
7. Extra game number if needed
8. Source URL
9. Source type
10. Verification status

---

## Step 2: Confirm Available History Range

Each game may have a different available history range.

Before importing history, confirm:

1. Earliest available draw date
2. Latest available draw date
3. Whether the history is complete
4. Whether Midday and Evening draws are both available when needed
5. Whether data can be collected consistently

---

## Step 3: Clean the Data

Before importing, every result should be cleaned.

Cleaning should include:

1. Standard draw date format
2. Correct game key
3. Correct game name
4. Correct draw type
5. Correct number order
6. Correct number count
7. Correct source URL
8. Correct verification status

---

## Step 4: Validate the Data

Before import, every result should be validated.

Validation should confirm:

1. Draw date exists
2. Correct number count exists
3. Numbers are in the correct range
4. Extra game number is in the correct range when required
5. Draw type is correct when required
6. Duplicate records are removed
7. Source information is included

---

## Step 5: Prepare Import Files

Possible future import files:

1. powerball-history.json
2. mega-millions-history.json
3. pick-5-georgia-five-history.json
4. fantasy-5-georgia-fantasy-5-history.json

These files should only be created after the history sources have been reviewed and the data structure is confirmed.

---

## Step 6: Import Into Supabase

After the data is cleaned and verified, it should be imported into Supabase.

The import should:

1. Add only verified records
2. Prevent duplicates
3. Store source information
4. Store verification status
5. Preserve draw dates and draw types
6. Preserve number order when order matters

---

## Step 7: Connect Website to Backend Database

After Supabase is ready, the website should be updated to read history from the backend database.

The generator should then check new random number sets against the full stored history before showing the final generated numbers.

---

# Game Data Requirements

## Powerball

Required data:

1. game_key
2. game_name
3. draw_date
4. main_numbers
5. powerball_number
6. source_url
7. source_type
8. verified

Game key:

powerball

Number rules:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26

Duplicate check:

1. game_key
2. draw_date

---

## Mega Millions

Required data:

1. game_key
2. game_name
3. draw_date
4. main_numbers
5. mega_ball_number
6. source_url
7. source_type
8. verified

Game key:

mega

Number rules:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24

Duplicate check:

1. game_key
2. draw_date

---

## Pick 5 / Georgia Five

Required data:

1. game_key
2. game_name
3. draw_date
4. draw_time
5. draw_type
6. numbers
7. source_url
8. source_type
9. verified

Game key:

pick5

Number rules:

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. Midday and Evening draws are separate records

Draw types:

1. midday
2. evening

Duplicate check:

1. game_key
2. draw_date
3. draw_type

Important:

A Midday result and an Evening result on the same date are different records.

---

## Fantasy 5 / Georgia Fantasy 5

Required data:

1. game_key
2. game_name
3. draw_date
4. draw_time
5. draw_type
6. numbers
7. source_url
8. source_type
9. verified

Game key:

fantasy5

Number rules:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated main numbers

Draw type:

night

Duplicate check:

1. game_key
2. draw_date
3. draw_type

---

# Suggested Backend Table

Future Supabase table name:

lottery_results

Suggested fields:

1. id
2. game_key
3. game_name
4. draw_date
5. draw_time
6. draw_type
7. main_numbers
8. special_ball
9. special_ball_label
10. source_url
11. source_type
12. verified
13. created_at
14. updated_at

---

# Suggested Unique Duplicate Rules

## Powerball

Unique rule:

game_key + draw_date

## Mega Millions

Unique rule:

game_key + draw_date

## Pick 5 / Georgia Five

Unique rule:

game_key + draw_date + draw_type

## Fantasy 5 / Georgia Fantasy 5

Unique rule:

game_key + draw_date + draw_type

---

# Future Daily Backend Automation

After full history is imported into Supabase, the automation should be expanded.

The future daily backend automation should:

1. Run daily when results are available
2. Pull latest draw results for all four games
3. Validate each result
4. Check the backend database for duplicates
5. Save only new verified results
6. Skip records that already exist
7. Keep update logs
8. Avoid writing bad or incomplete data
9. Keep the public website showing the last valid result if a source fails

---

# Future Generated Number Checking Process

When a visitor generates numbers, the final system should:

1. Generate a random number set for the selected game
2. Check that number set against the stored history database
3. Confirm whether that combination already appeared as a past winning draw
4. If the combination already exists, generate another set
5. Repeat the check until a fresh result is available
6. Show the final checked number set to the visitor

Important:

This does not predict winning numbers.

This only helps avoid showing a generated number set that already appeared in the available stored winning history.

---

# Import Validation Checklist

Before importing any full-history file, confirm:

1. File belongs to the correct game
2. Game key is correct
3. Draw dates are valid
4. Draw types are valid when required
5. Number counts are correct
6. Number ranges are correct
7. No duplicate records exist
8. Source URLs are included
9. Verification status is included
10. Data is clean and consistent

---

# Manual Review Checklist

Before approving a full-history import, review:

1. Source credibility
2. Available history range
3. Missing dates
4. Duplicate draw records
5. Formatting consistency
6. Number validation
7. Draw type accuracy
8. Source labels
9. Import test results
10. Website display behavior after import

---

# Current Production Status

Current status:

1. Website is live on Cloudflare Pages
2. Homepage is updated
3. About page is updated
4. Disclaimer page is updated
5. Support page is updated
6. Latest-results automation is working
7. GitHub Actions workflow has passed successfully
8. Mobile display has been tested successfully
9. Powerball history research file exists
10. Mega Millions history research file exists
11. Pick 5 / Georgia Five history research file exists
12. Fantasy 5 / Georgia Fantasy 5 history research file exists

---

# Next Production Step

After this plan is saved, continue reviewing remaining project planning files so they match the current completed website, automation, and future backend database direction.
