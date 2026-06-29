# Powerball Cleaning Plan

## Purpose

This file explains how the first Powerball raw history batch should be cleaned before it is used for any future import.

The uploaded file is useful as the first Powerball history batch, but it should not be imported directly.

The data must be cleaned, validated, checked for duplicates, and sample-verified before it is used inside a future backend database.

---

# File Being Cleaned

Raw file name:

powerball.csv

Game:

Powerball

Current use:

First Powerball history batch

Current status:

Raw file reviewed

Import status:

Not imported

---

# Important Production Rule

Do not import duplicate Powerball results.

Every Powerball record must be checked before it is added to any cleaned file, database file, or future Supabase table.

Duplicate checking must include:

1. game_key
2. draw_date
3. combination_key

Primary duplicate rule:

powerball + draw_date

Secondary duplicate review:

powerball + combination_key

---

# Raw File Summary

Total records reviewed:

1,965

Earliest draw date found:

February 3, 2010

Latest draw date found:

June 27, 2026

Duplicate draw dates found:

0

Duplicate exact winning-number combinations found:

0

Rows with missing draw dates:

0

Rows with missing winning numbers:

0

Rows with repeated main numbers in the same draw:

0

---

# Raw File Limitation

This file does not contain complete all-time Powerball history.

The file begins on:

February 3, 2010

Powerball history existed before this date.

This file should be treated as:

First Powerball history batch

It should not be treated as:

Complete Powerball history

Older Powerball records before February 3, 2010 still need to be researched, collected, verified, cleaned, and merged later without duplicates.

---

# Raw Column Structure

The raw file does not include a header row.

The raw columns appear in this order:

1. Game name
2. Draw month
3. Draw day
4. Draw year
5. Main number 1
6. Main number 2
7. Main number 3
8. Main number 4
9. Main number 5
10. Powerball number
11. Power Play

---

# Clean Output Goal

The cleaned Powerball records should follow the future Supabase-ready structure.

Each cleaned record should include:

1. game_key
2. game_name
3. draw_date
4. draw_time
5. draw_type
6. main_numbers
7. special_ball
8. special_ball_label
9. power_play
10. combination_key
11. source_url
12. source_type
13. verified
14. update_method

---

# Standard Clean Values

Use these values for every record in this first Powerball batch:

game_key:

powerball

game_name:

Powerball

draw_time:

10:59 PM ET

draw_type:

single

special_ball_label:

PB

source_type:

downloadable

update_method:

import

verified:

false

Important:

Set verified to false during the first cleaning step.

Change verified to true only after sample verification is completed.

---

# Date Cleaning Rule

The raw file stores the date as separate month, day, and year fields.

The cleaned file must convert those fields into:

YYYY-MM-DD

Example:

Raw month:

2

Raw day:

3

Raw year:

2010

Clean draw_date:

2010-02-03

---

# Number Cleaning Rule

Each cleaned record must store the five main numbers as an array.

Example:

main_numbers:

[37, 52, 22, 36, 17]

The Powerball number must be stored separately as:

special_ball

Example:

special_ball:

24

Power Play must be stored separately as:

power_play

Example:

power_play:

2

---

# Combination Key Rule

Each cleaned record must include a combination key.

Powerball combination key format:

main-number-1-main-number-2-main-number-3-main-number-4-main-number-5-PB-powerball-number

Example:

37-52-22-36-17-PB-24

Important:

1. Do not include Power Play in the combination key.
2. Power Play is not part of the winning number combination.
3. Preserve the source number order during the first cleaning step.
4. A sorted comparison key may be created later only for duplicate review.
5. The standard combination_key field should remain consistent.

---

# Historical Matrix Rule

Powerball has changed number ranges over time.

Current Powerball rules use:

1. Main numbers from 1 to 69
2. Powerball number from 1 to 26

Older Powerball records may follow older game matrix rules.

Cleaning rule:

Do not reject older valid historical records only because the Powerball number is higher than the current 1 to 26 range.

The uploaded file contains older Powerball numbers above the current range because historical rules were different.

Historical data should be preserved as drawn.

---

# Validation Checklist

Before a cleaned record is accepted, confirm:

1. Game name exists
2. Draw month exists
3. Draw day exists
4. Draw year exists
5. Draw date can be converted to YYYY-MM-DD
6. Five main numbers exist
7. Powerball number exists
8. Power Play value exists when available
9. Main numbers are valid integers
10. Powerball number is a valid integer
11. No main number repeats inside the same draw
12. combination_key can be created
13. draw_date is not duplicated inside the same batch
14. combination_key is not duplicated inside the same batch

---

# Cleaned Record Example

Example cleaned record:

{
  "game_key": "powerball",
  "game_name": "Powerball",
  "draw_date": "2010-02-03",
  "draw_time": "10:59 PM ET",
  "draw_type": "single",
  "main_numbers": [37, 52, 22, 36, 17],
  "special_ball": 24,
  "special_ball_label": "PB",
  "power_play": 2,
  "combination_key": "37-52-22-36-17-PB-24",
  "source_url": "https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/download.html",
  "source_type": "downloadable",
  "verified": false,
  "update_method": "import"
}

---

# Output Files To Create Later

The cleaning process should create these future files:

Raw preserved file:

powerball-history-raw.csv

Cleaned JSON file:

powerball-history-cleaned.json

Duplicate review file:

POWERBALL-DUPLICATE-REVIEW.md

Verification review file:

POWERBALL-SAMPLE-VERIFICATION.md

Important:

Do not edit the raw file directly.

Keep raw data and cleaned data separate.

---

# Duplicate Review Process

During cleaning, check:

1. Duplicate draw dates
2. Duplicate combination keys
3. Missing draw dates
4. Missing numbers
5. Repeated main numbers within the same draw
6. Invalid date formats
7. Invalid number values
8. Rows that cannot be cleaned safely

If duplicates are found:

1. Do not import the duplicate immediately
2. Record the duplicate in a duplicate review file
3. Keep the first clean record
4. Review the duplicate source before making a final decision

---

# Older History Merge Rule

When older Powerball history before February 3, 2010 is found, it must be cleaned separately first.

Before combining older history with this batch:

1. Clean the older source into the same format
2. Create draw_date for every older record
3. Create combination_key for every older record
4. Compare older records against this cleaned batch by draw_date
5. Compare older records against this cleaned batch by combination_key
6. Remove duplicate records before import
7. Document any removed duplicates

---

# Sample Verification Plan

Before this cleaned batch is approved:

1. Select recent records from the cleaned file
2. Compare them with the official Powerball previous results page
3. Select older records from the cleaned file
4. Compare them with another reliable historical source when available
5. Confirm draw dates
6. Confirm five main numbers
7. Confirm Powerball number
8. Confirm Power Play when available
9. Confirm no duplicates were introduced during cleaning
10. Confirm the cleaned records match the Supabase schema plan

---

# Import Approval Rule

Do not import the cleaned Powerball batch into Supabase until:

1. The cleaned file is created
2. The duplicate review is complete
3. The sample verification is complete
4. The source range is documented
5. The cleaned file matches the Supabase schema plan
6. Older Powerball history search is still documented as incomplete
7. The import process has duplicate protection

---

# Current Production Decision

This Powerball CSV file should be cleaned as the first Powerball history batch.

This batch should not be treated as complete all-time Powerball history.

The project still needs an older Powerball history source for records before February 3, 2010.

---

# Next Production Step

Create the Powerball cleaning script or cleaning workflow that converts powerball.csv into the clean project format while checking duplicates before any import.
