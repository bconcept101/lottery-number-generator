# Automation Plan

## Purpose

This file explains the future daily automatic update system for the Lottery Number Generator Website.

The goal is to eventually update the past winning number database automatically for all supported games.

---

# Current Games

The automation system should support:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Status

The website currently uses:

`database.js`

This is a manual JavaScript database file.

The future goal is to move past winning number storage into:

`Supabase`

After Supabase is added, an automated system can update the database on a daily schedule.

---

# Future Automation Goal

The future system should:

1. Run daily
2. Check for new lottery results
3. Pull the latest available winning numbers
4. Format the results correctly
5. Check for duplicate draw dates
6. Save only new results
7. Skip results that already exist
8. Log update activity
9. Keep the live website connected to the latest database records

---

# Planned Daily Update Time

The planned update time is:

`12:00 noon`

This time is not guaranteed.

Updates may be delayed because of:

1. Result availability
2. Source website delays
3. System maintenance
4. Internet or API issues
5. Manual review needs
6. Automation errors

---

# Important Rule

Generated numbers from the website should never be saved as official past winning numbers.

Only real past draw results should be added to the database.

---

# Future Automation Tools

The future automated system may use:

1. Supabase
2. Cloudflare Worker
3. Cloudflare scheduled trigger
4. Official lottery result sources
5. Duplicate checking logic
6. Update logs
7. Error handling

---

# Future Automation Flow

The future automation should work like this:

1. Cloudflare Worker runs around 12:00 noon
2. Worker checks all supported games
3. Worker pulls latest results from approved sources
4. Worker formats each result
5. Worker checks Supabase for the draw date
6. If the result already exists, it skips it
7. If the result is new, it saves it
8. Worker logs whether the update was successful
9. Website reads the updated data from Supabase

---

# Future Database Platform

The planned future database platform is:

`Supabase`

Supabase will store real past winning results.

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
10. `verified`
11. `created_at`
12. `updated_at`

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

# Duplicate Checking Rule

Before saving a result, the system should check:

1. Game key
2. Draw date
3. Draw time if needed

If the same game and draw date already exist, the system should not insert a duplicate result.

---

# Validation Rules

## Powerball

Expected format:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26

---

## Mega Millions

Expected format:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24

---

## Pick 5 / Georgia Five

Expected format:

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters

---

## Fantasy 5 / Georgia Fantasy 5

Expected format:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated main numbers

---

# Error Handling Plan

If the automation fails, the system should:

1. Stop safely
2. Avoid saving bad data
3. Log the error
4. Try again on the next scheduled update
5. Allow manual correction if needed

---

# Manual Backup Plan

If automatic updates fail, results can still be added manually.

Manual backup process:

1. Check official result source
2. Confirm draw date
3. Confirm numbers
4. Add result manually
5. Commit update if still using `database.js`
6. Or insert result manually into Supabase later
7. Test website after update

---

# Production Order Before Automation

Before automatic updates are built, complete these steps:

1. Keep the current website stable
2. Keep `database.js` organized
3. Add real sample history manually
4. Create Supabase account later
5. Build Supabase table structure
6. Connect website to Supabase
7. Test reading data from Supabase
8. Build scheduled Cloudflare Worker
9. Test automation safely
10. Turn on daily update process

---

# Current Status

This file is a planning document.

It does not control the live website yet.

The live website still runs from:

1. `index.html`
2. `style.css`
3. `script.js`
4. `database.js`

---

# Next Step After This File

After this automation plan is saved, the next production step is to create:

`SUPABASE-SCHEMA.md`

That file will define the future database structure before the Supabase account is created.
