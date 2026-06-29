# Powerball History Research

## Purpose

This file documents the Powerball full-history research plan for the Lottery Number Generator Website.

The goal is to identify the best source for collecting, verifying, formatting, and later importing Powerball past winning draw results into the future backend database.

The Powerball history data will eventually help the website check generated Powerball number sets against stored past winning draw combinations before showing final number ideas to visitors.

---

# Game Name

Powerball

Website display name:

Powerball

Database key:

powerball

---

# Current Website Use

The website currently uses Powerball in two ways:

1. The generator creates random Powerball-style number sets.
2. The homepage displays the latest Powerball result.

The current homepage latest-result automation is separate from the full-history import process.

---

# Current Homepage Latest Result Source

Current latest-result automation source:

https://www.lotteryusa.com/powerball/

Current use:

1. Pull latest draw date
2. Pull five main numbers
3. Pull Powerball number
4. Validate current number ranges
5. Update latest-results.js
6. Display the result on the homepage

Important:

LotteryUSA is currently used as the readable automation source for the homepage latest-result card.

The official Powerball website remains the final verification authority.

---

# Official Verification Source

Official Powerball previous results page:

https://www.powerball.com/previous-results

Official Powerball homepage:

https://www.powerball.com/

Official source use:

1. Confirm latest winning numbers
2. Confirm previous draw results
3. Confirm draw schedule
4. Confirm current game rules
5. Confirm current number format
6. Review sample records from imported history files

Important:

The official Powerball website should be treated as the final authority when confirming Powerball results.

---

# Current Powerball Game Format

Current Powerball format:

1. Five white ball numbers
2. White ball numbers from 1 to 69
3. One red Powerball number
4. Powerball number from 1 to 26
5. Drawings are held Monday, Wednesday, and Saturday
6. Regular draw time is 10:59 PM ET

Important:

These are the current game rules.

Older Powerball history may include records from previous game matrix periods. Historical records should be preserved as recorded and should not be rejected only because an older draw used a previous Powerball number range.

---

# Main Full-History Source Candidate

Primary full-history import candidate:

Texas Lottery Powerball downloadable winning numbers file

Source:

https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/download.html

Reason this source is useful:

1. It provides a downloadable file.
2. It includes current and past Powerball winning numbers.
3. It covers Powerball drawings held since Texas began participating on February 3, 2010.
4. It is easier to clean and import than manually scraping a webpage.
5. It includes one row per drawing.
6. It includes draw date fields, winning numbers, Powerball number, and Power Play when available.

Important:

This source starts from February 3, 2010.

It should not be described as complete all-time Powerball history from the original launch of the Powerball game.

---

# Secondary Structured Source Candidate

Secondary structured source candidate:

NY Open Data Powerball winning numbers dataset

Source:

https://data.ny.gov/resource/d6yy-54nr.json

Dataset page:

https://catalog.data.gov/dataset/lottery-powerball-winning-numbers-beginning-2010

Reason this source is useful:

1. It is a structured public dataset.
2. It includes Powerball winning numbers beginning in 2010.
3. It can be downloaded in structured formats such as JSON and CSV.
4. It can help with cross-checking history records.
5. It can support research and comparison.

Important:

This source should not currently be used as the live homepage latest-result source because it was not updating quickly enough for the newest national Powerball result.

It may still be useful for historical research and comparison.

---

# Readable Fallback Source Candidate

Readable fallback source:

LotteryUSA Powerball history pages

Source:

https://www.lotteryusa.com/powerball/

Possible use:

1. Latest-result automation
2. Manual comparison
3. Sample result checking
4. Backup review

Important:

LotteryUSA is not the official authority.

Use it as a practical readable source only, not as the final verification source for imported history.

---

# Recommended Powerball History Source Strategy

Recommended strategy:

1. Use the Texas Lottery downloadable Powerball file as the first full-history collection candidate.
2. Use NY Open Data as a structured comparison source.
3. Use the official Powerball previous results page for sample verification.
4. Use LotteryUSA only as a readable backup and latest-result automation source.
5. Do not import Powerball history into the backend database until sample records have been reviewed.

---

# Powerball History Scope

Initial history scope:

February 3, 2010 to the latest available draw in the selected source.

Reason:

The Texas Lottery downloadable file states that it includes Powerball drawings since Texas began participating in game drawings on February 3, 2010.

Important:

This is a strong starting range for the first production import.

It is not necessarily full all-time Powerball history.

---

# Required Data Fields

Each Powerball history record should include:

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
15. created_at
16. updated_at

---

# Recommended Field Values

Use these values:

game_key:

powerball

game_name:

Powerball

draw_type:

single

special_ball_label:

PB

source_type options:

official
structured
downloadable
readable-backup
manual-review

update_method options:

manual
import
automated

---

# Combination Key Format

The Powerball combination key should include:

1. Five main numbers
2. Powerball label
3. Powerball number

Example:

12-18-24-36-45-PB-7

Formatting rule:

1. Keep main numbers in the official recorded order if the source provides them that way.
2. Use the same formatting every time.
3. Do not include Power Play inside the combination key.
4. Power Play is not part of the winning number combination.
5. Store Power Play separately when available.

---

# Current Number Validation Rules

For current Powerball results:

1. Five main numbers are required.
2. Main numbers must be from 1 to 69.
3. Main numbers should not repeat in the same draw.
4. One Powerball number is required.
5. Powerball number must be from 1 to 26.

---

# Historical Validation Rule

Powerball has had game matrix changes over time.

Because of that, older historical records may not always match the current 1 to 69 main number and 1 to 26 Powerball format.

Historical import should follow these rules:

1. Preserve official historical records as they were drawn.
2. Do not reject older records only because they belong to an older game matrix.
3. Store a ruleset note later if needed.
4. Validate that each record has five main numbers and one Powerball number.
5. Validate that number values are reasonable for the source period.
6. Confirm questionable records against the official Powerball previous results page when possible.

---

# Duplicate Prevention Rule

Powerball duplicate records should be checked by:

1. game_key
2. draw_date

Duplicate key example:

powerball + 2026-06-27

If a Powerball record with the same game key and draw date already exists, it should not be imported again.

---

# Import File Direction

Possible future clean import file:

powerball-history.json

Possible raw source file:

powerball-history-raw.csv

Possible cleaned source file:

powerball-history-cleaned.json

Important:

Keep raw collected data separate from cleaned import data.

Do not edit the raw source copy directly.

---

# Sample Record Format

Example future cleaned record:

{
  "game_key": "powerball",
  "game_name": "Powerball",
  "draw_date": "2026-06-27",
  "draw_time": "10:59 PM ET",
  "draw_type": "single",
  "main_numbers": [3, 16, 28, 30, 59],
  "special_ball": 11,
  "special_ball_label": "PB",
  "power_play": "2x",
  "combination_key": "3-16-28-30-59-PB-11",
  "source_url": "https://www.powerball.com/previous-results",
  "source_type": "official",
  "verified": true,
  "update_method": "import"
}

---

# Cleaning Checklist

Before Powerball history is imported:

1. Confirm every row has a draw date.
2. Confirm every row has five main numbers.
3. Confirm every row has one Powerball number.
4. Confirm draw dates are formatted as YYYY-MM-DD.
5. Confirm number values are clean integers.
6. Confirm Power Play is stored separately when available.
7. Confirm source_url is included.
8. Confirm source_type is included.
9. Confirm combination_key is created.
10. Confirm duplicate records are removed.

---

# Sample Verification Checklist

Before approving the Powerball source for import:

1. Select at least 10 recent records from the downloadable source.
2. Compare those records against the official Powerball previous results page.
3. Select at least 10 older records from different years.
4. Compare those records against another structured or official source when available.
5. Confirm the source date range.
6. Confirm no rows are missing required fields.
7. Confirm the cleaned data preserves the original draw results.
8. Confirm the duplicate prevention rule works.

---

# Import Approval Rule

Do not import Powerball history into Supabase until:

1. The source file is downloaded or collected.
2. The source fields are reviewed.
3. The date range is confirmed.
4. Sample records are verified.
5. A cleaned file is created.
6. Duplicate checking is tested.
7. The import format matches the Supabase schema plan.

---

# Future Supabase Direction

Future Supabase table:

lottery_results

Powerball records should use:

game_key = powerball

draw_type = single

special_ball_label = PB

Duplicate rule:

game_key + draw_date

The generator should later check generated Powerball number sets against stored Powerball combination keys before showing final number ideas to visitors.

---

# Current Status

Status:

Powerball history research source direction documented.

Current conclusion:

1. Official Powerball pages should be used for verification.
2. Texas Lottery downloadable Powerball data is the strongest first full-history collection candidate.
3. NY Open Data is useful for structured comparison and historical research.
4. LotteryUSA is useful for current homepage latest-result automation and readable backup.
5. Powerball full-history import should begin with source download, sample verification, cleaning, and duplicate checking.

---

# Next Production Step

Begin the Powerball history source collection step by downloading or reviewing the Texas Lottery Powerball downloadable file, then confirm the raw fields before creating the cleaned Powerball import file.
