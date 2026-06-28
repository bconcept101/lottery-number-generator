# History Update Guide

## Purpose

This guide explains how past winning numbers should be updated for the Lottery Number Generator Website.

The current website uses a manual database file named:

`database.js`

This manual system is temporary. It is being used as the foundation before the project moves to a future automated database update system.

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Database File

The current database file is:

`database.js`

This file stores past-number data separately from the generator logic.

The generator logic is stored in:

`script.js`

This keeps the website more organized.

---

# Current Update Method

The current update method is manual.

That means past winning numbers must be collected, formatted, added to `database.js`, committed to GitHub, and then deployed automatically by Cloudflare Pages.

---

# Future Update Goal

The long-term goal is to build a system that updates the database automatically on a daily basis.

Future system goal:

1. Check for new results daily
2. Pull latest results for all supported games
3. Compare new results against existing database records
4. Avoid duplicate entries
5. Add only new results
6. Store results in a real database
7. Keep the website updated without manually editing `database.js`

---

# Future Automated System Plan

The future automated update system may use:

1. Supabase for database storage
2. Cloudflare Worker for scheduled updates
3. Daily scheduled task
4. Reliable lottery result source
5. Duplicate checking before saving
6. Separate table for each game or one organized results table

---

# Future Automated Update Flow

The future system should work like this:

1. Scheduled update runs once per day
2. System checks official or reliable result sources
3. System pulls latest results for:
   - Powerball
   - Mega Millions
   - Pick 5 / Georgia Five
   - Fantasy 5 / Georgia Fantasy 5
4. System formats the results
5. System checks if each result already exists
6. If the result is new, it saves it to the database
7. Website reads the updated database
8. Visitors see the latest available history

---

# Important Database Rule

Generated numbers should never be saved as official past winning numbers.

The database should only store real past draw results.

The generator should only create random number sets for users.

---

# Manual Update Process For Now

Until the automatic system is built, updates should be done manually.

Manual update steps:

1. Collect past winning numbers from reliable sources
2. Confirm the game name
3. Confirm the draw date
4. Confirm the main numbers
5. Confirm the special ball if the game has one
6. Add the result to `database.js`
7. Commit the change to GitHub
8. Wait for Cloudflare Pages to redeploy
9. Test the live website

---

# Database Entry Format

## Powerball Format

Powerball entries should include:

1. Draw date
2. Five main numbers
3. Powerball number

Example:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [12, 18, 24, 36, 45],
  powerball: 7
}
