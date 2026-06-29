# Powerball Raw Data Review

## Purpose

This file documents the first raw Powerball history data batch reviewed for the Lottery Number Generator Website.

The purpose of this review is to confirm what is inside the uploaded Powerball CSV file before any cleaning, formatting, duplicate checking, or future database import work begins.

This file does not import the data into the website yet.

---

# File Reviewed

Uploaded file name:

powerball.csv

Game:

Powerball

Use case:

First Powerball history batch

---

# Important Production Rule

Do not import the same Powerball draw twice.

Before any Powerball history record is added to a cleaned file, database file, or future Supabase table, duplicate checking must be performed.

Duplicate checking should include:

1. game_key
2. draw_date
3. combination_key

Primary Powerball duplicate rule:

powerball + draw_date

Secondary duplicate review:

powerball + combination_key

---

# Raw File Status

Raw file reviewed:

Yes

Raw file usable as first batch:

Yes

Raw file ready for direct import:

No

Reason:

The file needs to be cleaned, given proper field names, converted into the project’s standard format, and verified before import.

---

# Raw File Summary

Total records found:

1,965

Earliest draw date found:

February 3, 2010

Latest draw date found:

June 27, 2026

Duplicate draw dates found:

0

Duplicate exact winning-number combinations found:

0

Duplicate sorted winning-number combinations found:

0

Rows with missing draw dates:

0

Rows with missing winning numbers:

0

Rows with repeated main numbers in the same draw:

0

---

# Raw File Column Structure

The uploaded file does not include a clean header row.

The raw columns appear to follow this order:

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

# Recommended Clean Field Mapping

The raw file should be cleaned into these fields:

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

# Recommended Clean Values

Use these values for this Powerball batch:

game_key:

powerball

game_name:

Powerball

draw_type:

single

draw_time:

10:59 PM ET

special_ball_label:

PB

source_type:

downloadable

update_method:

import

verified:

false until sample verification is completed

---

# Raw Number Range Review

Main numbers found:

Minimum main number:

1

Maximum main number:

69

Powerball numbers found:

Minimum Powerball number:

1

Maximum Powerball number:

39

Important:

The Powerball number reaches 39 in this historical file because Powerball has used older game matrix rules in the past.

Do not reject older Powerball records only because the Powerball number is higher than the current Powerball range.

For current Powerball results, the Powerball number range is 1 to 26.

For historical results, the record should be preserved according to the rules used at the time of that draw.

---

# Date Review

The raw file stores dates as separate month, day, and year fields.

The cleaned file should convert those fields into this standard format:

YYYY-MM-DD

Example:

February 3, 2010 should become:

2010-02-03

June 27, 2026 should become:

2026-06-27

---

# Combination Key Rule

Each Powerball record should receive a combination key.

Powerball combination key format:

main-number-1-main-number-2-main-number-3-main-number-4-main-number-5-PB-powerball-number

Example:

3-28-59-16-30-PB-11

Important:

1. Do not include Power Play in the combination key.
2. Power Play is not part of the winning number combination.
3. Power Play should be stored separately.
4. Preserve the number order from the source file during the first cleaning step.
5. A separate sorted key may be created later only for additional comparison.

---

# Sample Last Record Found

Latest record found in the uploaded file:

Draw date:

2026-06-27

Main numbers:

3, 28, 59, 16, 30

Powerball number:

11

Power Play:

2

Clean combination key:

3-28-59-16-30-PB-11

---

# Sample First Record Found

Earliest record found in the uploaded file:

Draw date:

2010-02-03

Main numbers:

37, 52, 22, 36, 17

Powerball number:

24

Power Play:

2

Clean combination key:

37-52-22-36-17-PB-24

---

# Current Batch Limitation

This uploaded Powerball file is not complete all-time Powerball history.

The file starts at:

February 3, 2010

Powerball history existed before this date, so an additional source is needed for older Powerball history.

This uploaded file should be treated as:

First Powerball history batch

It should not be treated as:

Complete all-time Powerball history

---

# Older Powerball History Needed

A second Powerball history source is still needed for earlier records before February 3, 2010.

Older history research target:

1. Powerball records before February 3, 2010
2. Earliest available Powerball draw records
3. Source that reaches back to the original Powerball game period
4. Data that can be sample-verified before import
5. Data that can be checked against this uploaded batch to prevent duplicate records

---

# Duplicate Prevention Plan

Before combining this uploaded file with any older Powerball history source:

1. Clean the uploaded file first
2. Create draw_date for every row
3. Create combination_key for every row
4. Check for duplicate draw dates inside this file
5. Check for duplicate combination keys inside this file
6. Clean the older source separately
7. Compare older source draw dates against this file
8. Compare older source combination keys against this file
9. Remove duplicate records before import
10. Keep a log of any removed duplicate records

---

# Verification Plan

Before this batch is approved for import:

1. Select recent records from the file
2. Compare them with the official Powerball previous results page
3. Select older records from the file
4. Compare them with another reliable historical source when available
5. Confirm draw dates
6. Confirm five main numbers
7. Confirm Powerball number
8. Confirm Power Play when available
9. Confirm no duplicates were introduced during cleaning
10. Confirm the cleaned file matches the Supabase schema plan

---

# Cleaning Plan

The next cleaned file should be created from this raw file.

Possible future cleaned file name:

powerball-history-cleaned.json

Possible future duplicate log file name:

powerball-duplicate-review.md

Cleaning steps:

1. Read the raw CSV
2. Assign clean column names
3. Build draw_date from month, day, and year
4. Build main_numbers array
5. Store Powerball number as special_ball
6. Store PB as special_ball_label
7. Store Power Play separately
8. Build combination_key
9. Add source_url
10. Add source_type
11. Add verified status
12. Add update_method
13. Check duplicates
14. Export clean JSON only after validation

---

# Import Status

Import status:

Not imported

Reason:

The raw file must be cleaned and sample-verified first.

---

# Current Production Decision

This Powerball CSV file should be used as the first Powerball history batch.

It should not be the only Powerball history source.

The project still needs an older Powerball history source for records before February 3, 2010.

---

# Next Production Step

Create the Powerball cleaning plan and cleaned-data format before importing this batch.

Next recommended file:

POWERBALL-CLEANING-PLAN.md
