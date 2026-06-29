# Automation Plan

## Purpose

This file explains the current and future automated update system for the Lottery Number Generator Website.

The website now has a working latest-results automation system that updates the homepage result cards through GitHub Actions.

The current automation updates the latest winning result display file:

latest-results.js

The future automation goal is to expand this system into a full backend results database using Supabase.

---

# Current Games

The automation system supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Automation Status

The project has a working latest-results automation system.

Current automation files:

1. latest-results.js
2. latest-results-display.js
3. scripts/update-latest-results.js
4. .github/workflows/update-latest-results.yml

Current status:

1. GitHub Actions workflow has been created
2. Daily schedule has been added
3. Manual workflow testing is available
4. Workflow has been tested successfully
5. Homepage latest-result cards are connected to latest-results.js
6. latest-results-display.js displays the data on the homepage
7. Pick 5 / Georgia Five Midday and Evening results display on separate lines
8. Powerball and Mega Millions latest-result sources have been updated away from outdated NY Open Data latest-result endpoints

---

# Current Automation Purpose

The current automation updates the latest winning results shown on the homepage.

The automation does not yet update a full historical database.

Current purpose:

1. Pull latest result data
2. Validate the result data
3. Update latest-results.js
4. Commit the updated file to GitHub when changes exist
5. Allow Cloudflare Pages to redeploy the updated website
6. Display the updated results on the homepage

---

# Current Automation Flow

The current automated process works like this:

1. GitHub Actions starts the workflow
2. GitHub checks out the repository
3. Node.js is prepared
4. The update script runs
5. The script reads the current latest-results.js
6. The script pulls result data from approved readable sources
7. The script validates dates, number counts, and number ranges
8. Each supported game is updated separately
9. If one game source fails, the script keeps the last valid saved result for that game
10. The script writes the updated data into latest-results.js
11. GitHub Actions commits the file only if changes exist
12. Cloudflare Pages redeploys after the GitHub commit
13. The homepage displays the updated latest results

---

# Current Workflow File

Current workflow file:

.github/workflows/update-latest-results.yml

Current workflow purpose:

1. Run the latest-results update process
2. Support daily scheduled updates
3. Support manual testing from the GitHub Actions tab
4. Commit updated result data only when latest-results.js changes

---

# Current Workflow Schedule

Current schedule:

0 16 * * *

This means the workflow runs daily at 16:00 UTC, which is around 12:00 PM Eastern Time during daylight saving time.

Important:

The Run workflow button is for manual testing only. Regular updates should happen automatically from the scheduled workflow.

---

# Current Update Script

Current script file:

scripts/update-latest-results.js

Current script purpose:

1. Pull latest Powerball result data
2. Pull latest Mega Millions result data
3. Pull latest Georgia Five Midday result data
4. Pull latest Georgia Five Evening result data
5. Pull latest Fantasy 5 result data
6. Validate all result data before writing
7. Update each game independently
8. Keep existing valid data if one source fails
9. Write clean homepage-ready data into latest-results.js

---

# Current Data Display Files

## latest-results.js

Purpose:

1. Stores latest result data
2. Gets updated by the automation script
3. Is loaded by the homepage
4. Is read by latest-results-display.js

## latest-results-display.js

Purpose:

1. Reads the latestResults object
2. Finds the matching homepage result fields by ID
3. Displays draw dates
4. Displays winning numbers
5. Displays Powerball number
6. Displays Mega Ball number
7. Displays Georgia game draw type
8. Displays last updated date
9. Formats Pick 5 Midday and Evening results on separate lines

---

# Current Data Sources

The current latest-results automation uses LotteryUSA readable latest-result pages for all four supported games.

These sources are used for homepage latest-result automation because they are currently providing the latest results in a readable format.

Official lottery websites remain the final verification authority.

---

# Powerball Current Source

Current automation source:

https://www.lotteryusa.com/powerball/

Source type:

Readable automation source

Current use:

1. Pull latest Powerball draw date
2. Pull five main numbers
3. Pull Powerball number
4. Validate main numbers from 1 to 69
5. Validate Powerball number from 1 to 26
6. Update homepage latest-result card

Official verification source:

https://www.powerball.com/

Important note:

LotteryUSA is used as the current readable automation source. The official Powerball website should be treated as the final authority for confirmation.

---

# Mega Millions Current Source

Current automation source:

https://www.lotteryusa.com/mega-millions/

Source type:

Readable automation source

Current use:

1. Pull latest Mega Millions draw date
2. Pull five main numbers
3. Pull Mega Ball number
4. Validate main numbers from 1 to 70
5. Validate Mega Ball number from 1 to 24
6. Update homepage latest-result card

Official verification source:

https://www.megamillions.com/

Important note:

LotteryUSA is used as the current readable automation source. The official Mega Millions website should be treated as the final authority for confirmation.

---

# Pick 5 / Georgia Five Current Sources

Current automation sources:

https://www.lotteryusa.com/georgia/midday-georgia-five/

https://www.lotteryusa.com/georgia/georgia-five/

Source type:

Readable automation source

Current use:

1. Pull latest Midday result
2. Pull latest Evening result
3. Pull draw dates
4. Pull five digits for each draw
5. Validate digits from 0 to 9
6. Preserve exact digit order
7. Format Midday and Evening results for homepage display

Official verification source:

https://www.galottery.com/en-us/winning-numbers.html

Official game page:

https://www.galottery.com/en-us/games/draw-games/georgia-five.html

Important note:

LotteryUSA is used as the current readable automation source. Georgia Lottery should be treated as the final authority for confirmation.

---

# Fantasy 5 / Georgia Fantasy 5 Current Source

Current automation source:

https://www.lotteryusa.com/georgia/fantasy-5/

Source type:

Readable automation source

Current use:

1. Pull latest Fantasy 5 result
2. Pull draw date
3. Pull five winning numbers
4. Validate numbers from 1 to 42
5. Update homepage latest-result card

Official verification source:

https://www.galottery.com/en-us/winning-numbers.html

Official game page:

https://www.galottery.com/en-us/games/draw-games/fantasy-five.html

Important note:

LotteryUSA is used as the current readable automation source. Georgia Lottery should be treated as the final authority for confirmation.

---

# Previous Structured Data Sources

Earlier automation used NY Open Data structured JSON sources for Powerball and Mega Millions.

Previous Powerball structured source:

https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1

Previous Mega Millions structured source:

https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1

Current status:

These sources are not being used for the live homepage latest-results automation because they were not updating quickly enough for the newest national results.

Possible future use:

1. Historical research
2. Backup comparison
3. Manual validation
4. Future full-history review

---

# Validation Rules

## Powerball

Expected format:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers expected
4. One Powerball number from 1 to 26

---

## Mega Millions

Expected format:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers expected
4. One Mega Ball number from 1 to 24

---

## Pick 5 / Georgia Five

Expected format:

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. Midday and Evening results are handled separately

---

## Fantasy 5 / Georgia Fantasy 5

Expected format:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated main numbers expected
4. Night draw

---

# Failure Prevention Rules

The automation must follow these rules:

1. Do not let one failed game source break the entire update
2. Update each game separately
3. Keep the last valid saved result if a source fails
4. Never write blank data into latest-results.js
5. Never write error messages into public website result cards
6. Validate result data before writing
7. Commit only when latest-results.js changes
8. Log errors only inside GitHub Actions
9. Keep the public website showing the last valid result
10. Replace a source when it stops updating reliably

---

# Why the Automation Was Updated

Earlier automation used NY Open Data for Powerball and Mega Millions latest homepage results.

Problem found:

1. The NY Open Data endpoints were not showing the newest national Powerball and Mega Millions results quickly enough.
2. Powerball and Mega Millions could appear outdated on the homepage.
3. Georgia games also needed stronger readable-page parsing because some date text was split across page lines.

The current automation was improved by:

1. Using LotteryUSA readable latest-result pages for all four games
2. Updating each game independently
3. Improving Georgia date parsing
4. Improving date parsing for ISO-style dates
5. Keeping previous valid data if one game fails
6. Avoiding public error messages
7. Writing only clean data to latest-results.js

---

# Scheduled Update Timing

The current scheduled update time is:

16:00 UTC daily

This is around:

12:00 noon Eastern Time during daylight saving time

This timing is not guaranteed to match every official result posting time.

Updates may vary because of:

1. Result availability
2. Source website delays
3. System maintenance
4. Internet or API issues
5. Verification needs
6. Automation source issues

---

# Manual Workflow Testing

Manual test process:

1. Open GitHub repository
2. Click Actions
3. Click Update Latest Lottery Results
4. Click Run workflow
5. Keep branch as main
6. Run the workflow
7. Confirm the workflow completes with success
8. Confirm all four games updated or kept valid saved data
9. Check latest-results.js
10. Check the live homepage after Cloudflare redeploys

Important:

Manual testing is only for confirming changes. Daily production updates should run from the schedule.

---

# Manual Backup Plan

If automatic updates fail, results can still be corrected manually.

Manual backup process:

1. Check the official or approved result source
2. Confirm the game name
3. Confirm the draw date
4. Confirm the winning numbers
5. Confirm the number range
6. Update latest-results.js
7. Commit the file to GitHub
8. Wait for Cloudflare Pages to redeploy
9. Test the live homepage

---

# Current Website Files Used by Automation

The current live automation system uses:

1. index.html
2. latest-results.js
3. latest-results-display.js
4. scripts/update-latest-results.js
5. .github/workflows/update-latest-results.yml

---

# Future Database Platform

The planned future database platform is:

Supabase

Supabase will be used later for full historical result storage.

Supabase is not required for the current homepage latest-results display system.

---

# Future Supabase Goal

The future Supabase system should:

1. Store full past winning result history
2. Store Powerball history
3. Store Mega Millions history
4. Store Pick 5 / Georgia Five history
5. Store Fantasy 5 / Georgia Fantasy 5 history
6. Prevent duplicate draw records
7. Store source information
8. Store verification status
9. Store combination keys for generated-number checking
10. Allow the website to check generated numbers against full history
11. Allow future automation to insert new verified draw results daily

---

# Possible Supabase Table

Possible table name:

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
10. combination_key
11. source_url
12. source_type
13. verified
14. update_method
15. created_at
16. updated_at

---

# Game Keys

The system should use these game keys:

Powerball:

powerball

Mega Millions:

mega

Pick 5 / Georgia Five:

pick5

Fantasy 5 / Georgia Fantasy 5:

fantasy5

---

# Future Duplicate Checking Rule

Before saving a full historical result into Supabase, the system should check:

1. Game key
2. Draw date
3. Draw type when needed

Duplicate rules:

1. Powerball: game_key + draw_date
2. Mega Millions: game_key + draw_date
3. Pick 5 / Georgia Five: game_key + draw_date + draw_type
4. Fantasy 5 / Georgia Fantasy 5: game_key + draw_date + draw_type

If the same game, draw date, and draw type already exist, the system should not insert a duplicate result.

---

# Future Automation Flow With Supabase

The future full-history automation should work like this:

1. Scheduled system runs daily
2. System checks all supported games
3. System pulls latest results from approved sources
4. System validates each result
5. System builds a combination key
6. System checks Supabase for duplicate draw records
7. If the result already exists, it skips the result
8. If the result is new, it saves the result
9. System logs the update activity
10. Website reads updated result history from Supabase
11. Generator checks generated numbers against the full stored history before showing final number ideas

---

# Future Generated Number Checking Process

The final generator should work like this:

1. Visitor selects a game
2. Website generates a random number set
3. Website builds a combination key for the generated set
4. Website checks Supabase for a matching game_key and combination_key
5. If the combination already appeared as a past winning draw, the website generates another set
6. If the combination is not found in stored history, the website displays the number set

Important:

This does not predict lottery results or guarantee winning numbers. It only helps avoid showing generated number sets that already appeared in the available stored winning history.

---

# Future Automation Tools

Possible future tools:

1. GitHub Actions
2. Supabase
3. Cloudflare Worker
4. Cloudflare scheduled trigger
5. Official structured data sources
6. Official result API if available
7. Duplicate checking logic
8. Error handling
9. Update logs

---

# Security Rules

Before adding Supabase or private API keys:

1. Do not store private keys in GitHub public files
2. Do not place Supabase service role keys in browser JavaScript
3. Use environment variables for private credentials
4. Keep public browser files limited to safe public data
5. Enable two-factor authentication on GitHub
6. Enable two-factor authentication on Cloudflare
7. Enable two-factor authentication on PayPal

---

# Production Status

This file is now an active planning and documentation file.

The current latest-results automation is working.

Current live website files:

1. index.html
2. style.css
3. script.js
4. database.js
5. latest-results.js
6. latest-results-display.js

Current automation files:

1. scripts/update-latest-results.js
2. .github/workflows/update-latest-results.yml

Current status:

1. Homepage latest-results cards are working
2. Powerball latest result is displaying correctly
3. Mega Millions latest result is displaying correctly
4. Pick 5 / Georgia Five latest results are displaying correctly
5. Fantasy 5 / Georgia Fantasy 5 latest result is displaying correctly
6. GitHub Actions workflow is scheduled daily
7. GitHub Actions workflow can be tested manually
8. Mobile display has been tested successfully
9. About page has final visitor-ready wording
10. Disclaimer page has final visitor-ready wording
11. Support page has final visitor-ready wording

---

# Next Production Step

Update HISTORY-UPDATE-GUIDE.md so it matches the current latest-results automation source structure, removes outdated NY Open Data latest-result language, and keeps the future full-history Supabase update plan organized.
