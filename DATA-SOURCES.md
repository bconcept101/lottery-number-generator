# Data Sources Plan

## Purpose

This file documents the result sources that may be used for manual history updates now and future daily automated updates later.

The goal is to keep the Lottery Number Generator Website organized before moving into Supabase and automation.

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Important Rule

Only real past draw results should be added to the database.

Generated numbers from the website should never be saved as official past winning numbers.

---

# Preferred Source Rule

Use official lottery sources first whenever possible.

If a third-party source is ever used, the result should be checked against an official source before being treated as verified.

---

# Source List

## Powerball

Preferred source:

`https://www.powerball.com/previous-results`

Purpose:

1. Check past Powerball results
2. Confirm draw dates
3. Confirm five main numbers
4. Confirm Powerball number

Database key:

`powerball`

---

## Mega Millions

Preferred source:

`https://www.megamillions.com/winning-numbers/previous-drawings.aspx`

Purpose:

1. Check past Mega Millions results
2. Confirm draw dates
3. Confirm five main numbers
4. Confirm Mega Ball number

Database key:

`mega`

---

## Pick 5 / Georgia Five

Preferred source:

`https://www.galottery.com/en-us/games/draw-games/georgia-five.html`

Additional Georgia Lottery results page:

`https://www.galottery.com/en-us/winning-numbers.html`

Purpose:

1. Check Georgia Five results
2. Confirm draw dates
3. Confirm midday or evening draw if needed
4. Confirm five digits
5. Confirm digits in exact order

Database key:

`pick5`

---

## Fantasy 5 / Georgia Fantasy 5

Preferred source:

`https://www.galottery.com/en-us/games/draw-games/fantasy-five.html`

Additional Georgia Lottery results page:

`https://www.galottery.com/en-us/winning-numbers.html`

Purpose:

1. Check Georgia Fantasy 5 results
2. Confirm draw dates
3. Confirm five main numbers
4. Confirm numbers are from 1 to 42

Database key:

`fantasy5`

---

# Manual Update Plan

Manual updates should follow this process:

1. Open the source page
2. Confirm the game
3. Confirm the draw date
4. Confirm the winning numbers
5. Format the result for `database.js`
6. Add the result under the correct game key
7. Mark the result as verified if it came from an official source
8. Commit the update to GitHub
9. Wait for Cloudflare Pages to redeploy
10. Test the live website

---

# Future Automated Update Plan

The long-term goal is daily automatic updates.

The future system should:

1. Run daily around the selected update time
2. Check all supported games
3. Pull the latest available result data
4. Validate the result format
5. Check whether the draw date already exists
6. Save only new results
7. Avoid duplicates
8. Store results in Supabase
9. Log update activity
10. Keep the website connected to the updated database

---

# Future Automation Tools

Possible future tools:

1. Supabase
2. Cloudflare Worker
3. Cloudflare scheduled trigger
4. Official result pages or official result feed if available
5. Duplicate checking logic
6. Error handling and update logs

---

# Future Supabase Table Idea

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
10. `verified`
11. `created_at`
12. `updated_at`

---

# Update Timing Note

The website may state that past winning number history may be updated daily around 12:00 noon.

This timing should not be guaranteed because results may be delayed by:

1. Result availability
2. Source website delays
3. System maintenance
4. Automation errors
5. Manual review needs

---

# Production Status

This file is a planning file.

It does not control the website yet.

The website currently still uses:

`database.js`

Later, the project may move from `database.js` to Supabase.
