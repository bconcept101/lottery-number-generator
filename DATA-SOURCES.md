# Data Sources Plan

## Purpose

This file documents the data sources used for the Lottery Number Generator Website.

The purpose of this file is to keep result sources organized, clearly labeled, and separated by use case.

This file covers:

1. Current live latest-results sources
2. Readable automation sources
3. Official verification sources
4. Structured history research sources
5. Source limitations
6. Future source improvement plans
7. Rules for preventing automation failure

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Important Source Rule

Only real past draw results should be used for result history or latest winning result display.

Generated numbers from the website should never be saved or treated as official past winning numbers.

---

# Source Priority Rule

Use sources in this order:

1. Official structured data source
2. Official lottery website result page
3. Readable automation source
4. Manual review only when needed

Important:

If a readable automation source is used, it must be clearly understood as a practical data source, not the final official authority.

Visitors should always be told to confirm final winning numbers, prize details, drawing schedules, and game rules through the official lottery source.

---

# Current Live Automation Sources

The current latest-results automation uses LotteryUSA readable latest-result pages for all four supported games.

Current live automation sources:

1. Powerball: https://www.lotteryusa.com/powerball/
2. Mega Millions: https://www.lotteryusa.com/mega-millions/
3. Pick 5 / Georgia Five Midday: https://www.lotteryusa.com/georgia/midday-georgia-five/
4. Pick 5 / Georgia Five Evening: https://www.lotteryusa.com/georgia/georgia-five/
5. Fantasy 5 / Georgia Fantasy 5: https://www.lotteryusa.com/georgia/fantasy-5/

This setup is currently being used because the previous NY Open Data latest-result endpoints for Powerball and Mega Millions were not showing the newest national results quickly enough for the homepage Latest Winning Results section.

---

# Current Automation File

Current automation script:

scripts/update-latest-results.js

Current workflow file:

.github/workflows/update-latest-results.yml

Current output file:

latest-results.js

Current display file:

latest-results-display.js

---

# Current Automation Schedule

The GitHub Actions workflow is scheduled to run daily.

Workflow schedule:

0 16 * * *

This means the workflow runs at 16:00 UTC, which is around 12:00 PM Eastern Time during daylight saving time.

The workflow can also be run manually for testing through GitHub Actions.

Manual testing should not be needed for regular daily updates after the automation is confirmed working.

---

# Powerball Current Source

Current live automation source:

https://www.lotteryusa.com/powerball/

Current use:

1. Pull latest Powerball draw date
2. Pull five main numbers
3. Pull Powerball number
4. Validate main numbers from 1 to 69
5. Validate Powerball number from 1 to 26
6. Update homepage latest-result card

Official verification source:

https://www.powerball.com/

Important:

LotteryUSA is used as the current readable automation source. The official Powerball website should be treated as the final authority for confirmation.

---

# Mega Millions Current Source

Current live automation source:

https://www.lotteryusa.com/mega-millions/

Current use:

1. Pull latest Mega Millions draw date
2. Pull five main numbers
3. Pull Mega Ball number
4. Validate main numbers from 1 to 70
5. Validate Mega Ball number from 1 to 24
6. Update homepage latest-result card

Official verification source:

https://www.megamillions.com/

Important:

LotteryUSA is used as the current readable automation source. The official Mega Millions website should be treated as the final authority for confirmation.

---

# Pick 5 / Georgia Five Current Sources

Current live automation sources:

Midday:

https://www.lotteryusa.com/georgia/midday-georgia-five/

Evening:

https://www.lotteryusa.com/georgia/georgia-five/

Current use:

1. Pull latest Midday result
2. Pull latest Evening result
3. Pull draw dates
4. Pull five digits for each draw
5. Validate digits from 0 to 9
6. Preserve exact digit order
7. Display Midday and Evening results separately on the homepage

Official verification source:

https://www.galottery.com/en-us/winning-numbers.html

Official game page:

https://www.galottery.com/en-us/games/draw-games/georgia-five.html

Important:

LotteryUSA is used as the current readable automation source. Georgia Lottery should be treated as the final authority for confirmation.

---

# Fantasy 5 / Georgia Fantasy 5 Current Source

Current live automation source:

https://www.lotteryusa.com/georgia/fantasy-5/

Current use:

1. Pull latest Fantasy 5 draw date
2. Pull five winning numbers
3. Validate numbers from 1 to 42
4. Update homepage latest-result card

Official verification source:

https://www.galottery.com/en-us/winning-numbers.html

Official game page:

https://www.galottery.com/en-us/games/draw-games/fantasy-five.html

Important:

LotteryUSA is used as the current readable automation source. Georgia Lottery should be treated as the final authority for confirmation.

---

# Structured Data Sources

Structured data sources are preferred when they are current, reliable, and updated quickly enough.

The previous latest-results automation used NY Open Data for Powerball and Mega Millions.

Previous Powerball structured source:

https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1

Previous Mega Millions structured source:

https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1

Current status:

These sources should not be used as the live homepage latest-result source unless they are confirmed to update quickly and consistently.

Possible future use:

1. Historical research
2. Backup comparison
3. Manual validation
4. Future full-history review

---

# Official Verification Sources

Official verification sources should be used when confirming final results, rules, schedules, and prize details.

Powerball official source:

https://www.powerball.com/

Mega Millions official source:

https://www.megamillions.com/

Georgia Lottery winning numbers:

https://www.galottery.com/en-us/winning-numbers.html

Georgia Five official game page:

https://www.galottery.com/en-us/games/draw-games/georgia-five.html

Fantasy 5 official game page:

https://www.galottery.com/en-us/games/draw-games/fantasy-five.html

---

# Current latest-results.js Data Format

The automation writes the latest results into:

latest-results.js

The file stores:

1. gameName
2. status
3. drawDate
4. winningNumbers
5. extraNumberLabel when needed
6. extraNumber when needed
7. drawType when needed
8. lastUpdated

Powerball uses:

1. drawDate
2. winningNumbers
3. Powerball Number
4. lastUpdated

Mega Millions uses:

1. drawDate
2. winningNumbers
3. Mega Ball Number
4. lastUpdated

Pick 5 / Georgia Five uses:

1. drawDate
2. Midday winning numbers
3. Evening winning numbers
4. drawType
5. lastUpdated

Fantasy 5 / Georgia Fantasy 5 uses:

1. drawDate
2. winningNumbers
3. drawType
4. lastUpdated

---

# Current Automation Safety Rules

The automation should follow these rules:

1. Update each game separately
2. Validate number counts before writing
3. Validate number ranges before writing
4. Keep the last valid saved result if one source fails
5. Do not write blank result data
6. Do not write public error messages into latest-results.js
7. Do not stop the full workflow because one game source fails
8. Commit latest-results.js only when changes exist
9. Keep public website wording clean and visitor-ready

---

# Game Validation Rules

## Powerball

Validation rules:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers expected
4. One Powerball number from 1 to 26

## Mega Millions

Validation rules:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers expected
4. One Mega Ball number from 1 to 24

## Pick 5 / Georgia Five

Validation rules:

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. Midday and Evening are separate draw results

## Fantasy 5 / Georgia Fantasy 5

Validation rules:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated main numbers expected
4. Night draw

---

# Source Limitation Notes

Readable website sources can change page layout.

If a readable source changes layout, the parser may fail.

The automation should handle source failure by keeping the last valid saved result instead of writing bad data.

If a source fails repeatedly, the source should be reviewed and replaced with a better source when available.

---

# Manual Review Rule

Manual review should be used when:

1. A source changes layout
2. A result appears delayed
3. A draw date does not match the official result
4. A number range validation fails
5. The automation skips a game repeatedly
6. A result source becomes unavailable

Manual review should confirm results against the official lottery source whenever possible.

---

# Future Full-History Source Direction

The latest-results source is separate from the full-history source plan.

Current latest-results automation is focused on the newest draw results displayed on the homepage.

Future full-history collection should be researched separately for each game.

History research files:

1. POWERBALL-HISTORY-RESEARCH.md
2. MEGA-MILLIONS-HISTORY-RESEARCH.md
3. PICK-5-GEORGIA-FIVE-HISTORY-RESEARCH.md
4. FANTASY-5-GEORGIA-FANTASY-5-HISTORY-RESEARCH.md

---

# Future Supabase Direction

The planned backend database platform is Supabase.

Future source flow:

1. Collect full verified history for all four games
2. Clean and validate historical records
3. Import verified history into Supabase
4. Run daily automation to pull new latest results
5. Validate each new result
6. Check Supabase for duplicate draw records
7. Save only new verified results
8. Allow the generator to check generated numbers against stored history before showing them to visitors

---

# Future Source Improvement Plan

Future improvements should include:

1. Search for official structured sources for each game
2. Prefer official APIs or downloadable result files when available
3. Keep readable sources as fallback options
4. Store source_url and source_type with every database record
5. Add update logs for backend automation
6. Add duplicate checking before saving new draw results
7. Add validation before public display
8. Keep the last valid result if a source fails

---

# Current Production Status

Current status:

1. Latest-results automation is working
2. Homepage latest-results cards are displaying correctly
3. Powerball uses LotteryUSA readable automation source
4. Mega Millions uses LotteryUSA readable automation source
5. Pick 5 / Georgia Five uses LotteryUSA readable automation sources
6. Fantasy 5 / Georgia Fantasy 5 uses LotteryUSA readable automation source
7. Official lottery websites remain the final verification sources
8. Future full-history collection will be handled separately from homepage latest-results display

---

# Next Production Step

After this file is saved, update AUTOMATION-PLAN.md so it matches the current latest-results automation source structure and the future Supabase backend direction.
