# History Update Guide

## Purpose

This guide explains how winning number history and latest result information should be updated for the Lottery Number Generator Website.

The website currently has two result-related systems:

1. `database.js` stores available past winning draw history used by the generator structure.
2. `latest-results.js` stores the latest winning results displayed on the homepage.

The current latest-results display is already connected to an automated GitHub Actions workflow. The full historical database system is still planned for future expansion.

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Website Files Used for Results

## database.js

Purpose:

1. Stores available past winning draw history structure
2. Keeps game database information separate from generator logic
3. Supports duplicate checking against available past winning draw history
4. Prepares the project for future full-history database expansion

## latest-results.js

Purpose:

1. Stores the latest winning results shown on the homepage
2. Gets updated by the automated workflow
3. Is read by `latest-results-display.js`
4. Keeps the homepage Latest Winning Results cards updated

## latest-results-display.js

Purpose:

1. Reads the data from `latest-results.js`
2. Displays latest result information on the homepage
3. Places draw dates, winning numbers, extra game numbers, draw types, and last updated dates into the correct result cards
4. Formats Pick 5 / Georgia Five Midday and Evening results on separate lines

## script.js

Purpose:

1. Controls the number generator
2. Reads the selected game
3. Generates random number sets
4. Displays generated numbers
5. Supports checking generated numbers against available past winning draw history

---

# Current Automation Files

The current latest-results automation uses:

1. `scripts/update-latest-results.js`
2. `.github/workflows/update-latest-results.yml`

---

# Current Automation Status

The latest-results automation is working.

Current completed status:

1. GitHub Actions workflow created
2. Update script created
3. Latest result cards connected to `latest-results.js`
4. Homepage displays updated latest results
5. Pick 5 / Georgia Five Midday and Evening results display correctly
6. Workflow has been tested successfully

---

# Current Latest Results Update Method

The current latest results are updated through GitHub Actions.

The process works like this:

1. GitHub Actions runs the workflow
2. Node.js runs `scripts/update-latest-results.js`
3. The script reads current data from `latest-results.js`
4. The script pulls new result data from approved sources
5. The script validates the data
6. Each game is updated separately
7. If one game source fails, the script keeps the last valid saved result for that game
8. The script writes updated data into `latest-results.js`
9. GitHub commits the file only if the data changed
10. Cloudflare Pages redeploys the updated website
11. The homepage displays the newest saved result data

---

# Current Latest Result Sources

## Powerball

Current automation source:

`https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1`

Source type:

Structured JSON dataset

Current use:

1. Pull latest draw date
2. Pull five main numbers
3. Pull Powerball number
4. Validate number count
5. Validate number range

---

## Mega Millions

Current automation source:

`https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1`

Source type:

Structured JSON dataset

Current use:

1. Pull latest draw date
2. Pull five main numbers
3. Pull Mega Ball number
4. Validate number count
5. Validate number range

---

## Pick 5 / Georgia Five

Current automation sources:

`https://www.lotteryusa.com/georgia/midday-georgia-five/`

`https://www.lotteryusa.com/georgia/georgia-five/`

Source type:

Readable fallback source

Current use:

1. Pull latest Midday result
2. Pull latest Evening result
3. Validate five digits
4. Validate digits from 0 to 9
5. Format Midday and Evening results for homepage display

Important:

LotteryUSA is not treated as the final official authority. It is used as a readable source until a stable official structured Georgia source is confirmed.

---

## Fantasy 5 / Georgia Fantasy 5

Current automation source:

`https://www.lotteryusa.com/georgia/fantasy-5/`

Source type:

Readable fallback source

Current use:

1. Pull latest Fantasy 5 result
2. Validate five numbers
3. Validate numbers from 1 to 42
4. Format result for homepage display

Important:

LotteryUSA is not treated as the final official authority. It is used as a readable source until a stable official structured Georgia source is confirmed.

---

# Manual Update Rule

Generated numbers from the website should never be saved as official past winning numbers.

Only real past draw results should be added to result history or latest result display files.

---

# Manual Backup Process for latest-results.js

Use this only if the automated workflow fails and the homepage result information must be corrected manually.

Manual backup steps:

1. Check the official or approved result source
2. Confirm the game name
3. Confirm the draw date
4. Confirm the winning numbers
5. Confirm the Powerball number or Mega Ball number if required
6. Confirm the draw type for Georgia games
7. Update `latest-results.js`
8. Commit the change to GitHub
9. Wait for Cloudflare Pages to redeploy
10. Test the live homepage

Important:

Do not write error messages, pending text, or internal production notes into public result cards.

---

# Manual Update Process for database.js

Use this only for carefully reviewed past winning draw history.

Manual update steps:

1. Collect past winning numbers from reliable sources
2. Confirm the game name
3. Confirm the draw date
4. Confirm the draw type if needed
5. Confirm the main numbers
6. Confirm the extra game number if the game has one
7. Confirm the result does not already exist
8. Add the result to the correct game section in `database.js`
9. Commit the change to GitHub
10. Wait for Cloudflare Pages to redeploy
11. Test the live website

Important:

Do not add random partial history batches. Full history should be researched, cleaned, verified, and planned before large imports.

---

# Game Validation Rules

## Powerball

Expected format:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26

Example structure:

drawDate: YYYY-MM-DD  
numbers: [12, 18, 24, 36, 45]  
powerball: 7

---

## Mega Millions

Expected format:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24

Example structure:

drawDate: YYYY-MM-DD  
numbers: [8, 14, 22, 39, 50]  
megaBall: 12

---

## Pick 5 / Georgia Five

Expected format:

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. Midday and Evening draws should be treated separately

Example Midday structure:

drawDate: YYYY-MM-DD  
drawType: midday  
numbers: [4, 2, 6, 9, 6]

Example Evening structure:

drawDate: YYYY-MM-DD  
drawType: evening  
numbers: [2, 5, 3, 5, 7]

---

## Fantasy 5 / Georgia Fantasy 5

Expected format:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated main numbers

Example structure:

drawDate: YYYY-MM-DD  
drawType: night  
numbers: [1, 4, 20, 23, 24]

---

# Duplicate Checking Rules

## Powerball

Check duplicates by:

1. game key
2. draw date

Database key:

powerball

---

## Mega Millions

Check duplicates by:

1. game key
2. draw date

Database key:

mega

---

## Pick 5 / Georgia Five

Check duplicates by:

1. game key
2. draw date
3. draw type

Database key:

pick5

Important:

Midday and Evening results on the same date are separate records.

---

## Fantasy 5 / Georgia Fantasy 5

Check duplicates by:

1. game key
2. draw date
3. draw type if used

Database key:

fantasy5

---

# Automation Failure Prevention Rules

The current automation should follow these rules:

1. Use structured data when available
2. Update each game separately
3. Do not let one failed game source break the full workflow
4. Keep existing valid data if a source fails
5. Never write blank result data to `latest-results.js`
6. Never show internal errors on public website pages
7. Validate number counts before writing
8. Validate number ranges before writing
9. Commit only when `latest-results.js` changes
10. Log source issues only inside GitHub Actions

---

# Current History Research Files

The project should include four history research files:

1. `POWERBALL-HISTORY-RESEARCH.md`
2. `MEGA-MILLIONS-HISTORY-RESEARCH.md`
3. `PICK-5-GEORGIA-FIVE-HISTORY-RESEARCH.md`
4. `FANTASY-5-GEORGIA-FANTASY-5-HISTORY-RESEARCH.md`

Purpose of these files:

1. Research available history sources for each game
2. Document official sources
3. Document possible full-history sources
4. Document validation rules
5. Document duplicate prevention rules
6. Prepare for future clean data import
7. Avoid adding random partial history too early

---

# Future Full-History Update Goal

The long-term goal is to collect and store full past winning result history for all supported games.

Future history should include:

1. Powerball history
2. Mega Millions history
3. Pick 5 / Georgia Five history
4. Fantasy 5 / Georgia Fantasy 5 history

The full-history system should eventually move into Supabase.

---

# Future Supabase Direction

The planned future database platform is:

Supabase

Possible future table name:

lottery_results

Possible fields:

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

# Future Supabase Update Flow

The future full-history update system should work like this:

1. Scheduled update runs daily
2. System checks approved sources
3. System pulls latest results for all supported games
4. System validates each result
5. System checks Supabase for duplicates
6. New results are saved
7. Existing results are skipped
8. Website reads updated history from Supabase
9. Generator checks generated numbers against full stored history

---

# Future Automation Tools

Possible future tools:

1. GitHub Actions
2. Supabase
3. Cloudflare Worker
4. Cloudflare scheduled trigger
5. Official structured data source
6. Official result API if available
7. Duplicate checking logic
8. Update logs
9. Error handling

---

# Current Production Status

Current status:

1. Website is live on Cloudflare Pages
2. Homepage is updated
3. About page is updated
4. Disclaimer page is updated
5. Support page is updated
6. Styling is updated in `style.css`
7. Latest Results section is working
8. GitHub Actions automation is working
9. Mobile version has been tested successfully
10. History research files are being completed for all four supported games

---

# Next Production Step

After this guide is saved, the next production step is to review and update any remaining planning documents so they match the current completed website and automation system.
