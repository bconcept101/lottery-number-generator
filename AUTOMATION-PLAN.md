# Automation Plan

## Purpose

This file explains the current and future automated update system for the Lottery Number Generator Website.

The website now has a working latest-results automation system that updates the homepage result cards through GitHub Actions.

The current automation updates the latest winning result display file:

`latest-results.js`

The future automation goal is to expand this system into a full past-results database using Supabase.

---

# Current Games

The automation system supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Automation Status

The project now has a working latest-results automation system.

Current automation files:

1. `latest-results.js`
2. `latest-results-display.js`
3. `scripts/update-latest-results.js`
4. `.github/workflows/update-latest-results.yml`

Current status:

1. GitHub Actions workflow has been created
2. Manual workflow run has been tested
3. Workflow completed successfully
4. Homepage latest-result cards are connected to `latest-results.js`
5. `latest-results-display.js` displays the data on the homepage
6. Pick 5 / Georgia Five Midday and Evening results display on separate lines

---

# Current Automation Purpose

The current automation updates the latest winning results shown on the homepage.

The automation does not yet update a full historical database.

Current purpose:

1. Pull latest result data
2. Validate the result data
3. Update `latest-results.js`
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
5. The script reads the current `latest-results.js`
6. The script pulls result data from approved sources
7. The script validates dates, number counts, and number ranges
8. Each supported game is updated separately
9. If one game source fails, the script keeps the last valid saved result for that game
10. The script writes the updated data into `latest-results.js`
11. GitHub Actions commits the file only if changes exist
12. Cloudflare Pages redeploys after the GitHub commit
13. The homepage displays the updated latest results

---

# Current Workflow File

Current workflow file:

`.github/workflows/update-latest-results.yml`

Current workflow purpose:

1. Run the latest-results update process
2. Support daily scheduled updates
3. Support manual testing from the GitHub Actions tab
4. Commit updated result data only when `latest-results.js` changes

---

# Current Update Script

Current script file:

`scripts/update-latest-results.js`

Current script purpose:

1. Pull latest Powerball result data
2. Pull latest Mega Millions result data
3. Pull latest Georgia Five result data
4. Pull latest Fantasy 5 result data
5. Validate all result data before writing
6. Update each game independently
7. Keep existing valid data if one source fails
8. Write clean homepage-ready data into `latest-results.js`

---

# Current Data Display Files

## latest-results.js

Purpose:

1. Stores latest result data
2. Gets updated by the automation script
3. Is loaded by the homepage
4. Is read by `latest-results-display.js`

## latest-results-display.js

Purpose:

1. Reads the `latestResults` object
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

Important note:

LotteryUSA is not treated as the final official authority. It is used as a practical readable source until a stable official structured Georgia source is confirmed.

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

Important note:

LotteryUSA is not treated as the final official authority. It is used as a practical readable source until a stable official structured Georgia source is confirmed.

---

# Validation Rules

## Powerball

Expected format:

1. Five main numbers
2. Main numbers from 1 to 69
3. One Powerball number from 1 to 26

---

## Mega Millions

Expected format:

1. Five main numbers
2. Main numbers from 1 to 70
3. One Mega Ball number from 1 to 24

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

---

# Failure Prevention Rules

The automation must follow these rules:

1. Do not let one failed game source break the entire update
2. Update each game separately
3. Keep the last valid saved result if a source fails
4. Never write blank data into `latest-results.js`
5. Never write error messages into public website result cards
6. Validate result data before writing
7. Commit only when `latest-results.js` changes
8. Log errors only inside GitHub Actions
9. Keep the public website showing the last valid result
10. Prefer structured data sources whenever available

---

# Why the Automation Was Updated

Earlier automation attempts failed because the script tried to scrape regular website pages too strictly.

Problems found:

1. Some pages changed layout
2. Some pages loaded content differently
3. Some source data did not match at the same time
4. Strict source comparison caused workflow failures
5. One failed source could stop the entire update process

The current automation was improved by:

1. Using structured JSON for Powerball
2. Using structured JSON for Mega Millions
3. Updating each game independently
4. Keeping previous valid data if one game fails
5. Avoiding public error messages
6. Writing only clean data to `latest-results.js`

---

# Scheduled Update Timing

The planned update time is around:

`12:00 noon`

This timing is not guaranteed.

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
2. Click `Actions`
3. Click `Update Latest Lottery Results`
4. Click `Run workflow`
5. Keep branch as `main`
6. Run the workflow
7. Confirm the workflow completes with success
8. Check `latest-results.js`
9. Check the live homepage after Cloudflare redeploys

---

# Manual Backup Plan

If automatic updates fail, results can still be corrected manually.

Manual backup process:

1. Check the official result source
2. Confirm the game name
3. Confirm the draw date
4. Confirm the winning numbers
5. Confirm the number range
6. Update `latest-results.js`
7. Commit the file to GitHub
8. Wait for Cloudflare Pages to redeploy
9. Test the live homepage

---

# Current Website Files Used by Automation

The current live automation system uses:

1. `index.html`
2. `latest-results.js`
3. `latest-results-display.js`
4. `scripts/update-latest-results.js`
5. `.github/workflows/update-latest-results.yml`

---

# Future Database Platform

The planned future database platform is:

`Supabase`

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
9. Allow the website to check generated numbers against full history
10. Allow future automation to insert new verified draw results

---

# Possible Supabase Table

Possible table name:

`lottery_results`

Possible fields:

1. `id`
2. `game_key`
3. `game_name`
4. `draw_date`
5. `draw_time`
6. `main_numbers`
7. `special_ball`
8. `special_ball_label`
9. `source_url`
10. `source_type`
11. `verified`
12. `created_at`
13. `updated_at`

---

# Game Keys

The system should use these game keys:

## Powerball

`powerball`

## Mega Millions

`mega`

## Pick 5 / Georgia Five

`pick5`

## Fantasy 5 / Georgia Fantasy 5

`fantasy5`

---

# Future Duplicate Checking Rule

Before saving a full historical result into Supabase, the system should check:

1. Game key
2. Draw date
3. Draw time if needed

If the same game, draw date, and draw time already exist, the system should not insert a duplicate result.

---

# Future Automation Flow With Supabase

The future full-history automation should work like this:

1. Scheduled system runs daily
2. System checks all supported games
3. System pulls latest results from approved sources
4. System validates each result
5. System checks Supabase for duplicate draw dates
6. If the result already exists, it skips the result
7. If the result is new, it saves the result
8. System logs the update activity
9. Website reads updated result history from Supabase
10. Generator checks generated numbers against the full stored history

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

1. `index.html`
2. `style.css`
3. `script.js`
4. `database.js`
5. `latest-results.js`
6. `latest-results-display.js`

Current automation files:

1. `scripts/update-latest-results.js`
2. `.github/workflows/update-latest-results.yml`

Current status:

1. Homepage latest-results cards are working
2. GitHub Actions workflow passed successfully
3. Mobile display has been tested successfully
4. About page has final visitor-ready wording
5. Disclaimer page has final visitor-ready wording
6. Support page has final visitor-ready wording

---

# Next Production Step

Update:

`HISTORY-UPDATE-GUIDE.md`

Purpose:

1. Match the current latest-results automation
2. Remove outdated manual-only language
3. Document when manual updates are still needed
4. Keep future full-history update planning organized
