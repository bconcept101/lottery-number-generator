# Fantasy 5 / Georgia Fantasy 5 History Research

## File Purpose

This file documents the history research plan for Fantasy 5 / Georgia Fantasy 5.

The goal is to identify reliable sources for collecting past Fantasy 5 results before adding large history data to the website or importing results into a future database.

---

# Game Name

Fantasy 5 / Georgia Fantasy 5

Website display name: Fantasy 5 / Georgia Fantasy 5

Database key: fantasy5

---

# Game Type

Fantasy 5 / Georgia Fantasy 5 is a five-number draw game.

The game uses:

1. Five main numbers
2. Numbers from 1 to 42
3. No repeated numbers in the same draw
4. Daily night draw

---

# Official Game Rules Source

Primary official game page:

https://www.galottery.com/en-us/games/draw-games/fantasy-five.html

Official Georgia Lottery winning numbers page:

https://www.galottery.com/en-us/winning-numbers.html

Official source should be used to confirm:

1. Game name
2. Number range
3. Draw schedule
4. Draw time
5. Latest official results when needed

---

# Current Latest Result Source

Current automation source for latest Fantasy 5 / Georgia Fantasy 5 results:

https://www.lotteryusa.com/georgia/fantasy-5/

Current use:

1. Pull latest Fantasy 5 result
2. Read draw date
3. Read five winning numbers
4. Validate number count
5. Validate numbers from 1 to 42
6. Format the result for homepage display

Important:

LotteryUSA is not treated as the final official authority. It is used as a readable source until a stable official structured Georgia source is confirmed.

---

# Possible Full History Source

Possible history source:

https://www.lotterypost.com/results/ga/fantasy5/past

Research purpose:

1. Review available Fantasy 5 historical results
2. Confirm earliest available draw date
3. Confirm whether results are complete
4. Confirm whether data can be collected consistently
5. Prepare a clean future import plan

Important:

Lottery Post is not the official Georgia Lottery source. Any large history import should be reviewed carefully before being treated as final verified data.

---

# Required Data Fields

Each Fantasy 5 / Georgia Fantasy 5 history record should include:

1. game_key
2. game_name
3. draw_date
4. draw_time
5. draw_type
6. numbers
7. source_url
8. source_type
9. verified
10. created_at
11. updated_at

---

# Draw Type Value

Use this draw type value:

night

---

# Example Data Format

Example Fantasy 5 result:

{
  "game_key": "fantasy5",
  "game_name": "Fantasy 5 / Georgia Fantasy 5",
  "draw_date": "2026-06-27",
  "draw_time": "11:34 PM ET",
  "draw_type": "night",
  "numbers": [1, 4, 20, 23, 24],
  "source_url": "https://www.galottery.com/en-us/winning-numbers.html",
  "source_type": "official",
  "verified": true
}

---

# Validation Rules

Before any Fantasy 5 / Georgia Fantasy 5 result is saved, confirm:

1. The result has exactly five numbers
2. Each number is from 1 to 42
3. No number repeats in the same draw
4. The draw date is valid
5. The draw type is night
6. The result does not already exist in the database
7. Source information is included

---

# Duplicate Prevention Rule

A duplicate should be checked using:

1. game_key
2. draw_date
3. draw_type

Example duplicate key:

fantasy5 + 2026-06-27 + night

If that record already exists, the result should not be added again.

---

# History Collection Plan

## Step 1: Confirm Official Rules

Use the official Georgia Lottery Fantasy 5 page to confirm:

1. Game name
2. Number format
3. Number range
4. Draw schedule
5. Draw time

---

## Step 2: Confirm Latest Results

Use the official Georgia Lottery winning numbers page to confirm recent results when needed.

---

## Step 3: Research Full History Range

Use available history sources to confirm how far back Fantasy 5 / Georgia Fantasy 5 history can be collected.

Possible source:

https://www.lotterypost.com/results/ga/fantasy5/past

Expected research direction:

1. Confirm earliest available draw date
2. Confirm latest available draw date
3. Confirm whether the results are complete
4. Confirm whether results can be collected consistently
5. Confirm whether each result includes five valid numbers

---

## Step 4: Create Clean History File

Possible future file:

fantasy-5-georgia-fantasy-5-history.json

This file should only be created after the history source has been reviewed and the data format is confirmed.

---

## Step 5: Verify Before Import

Before importing Fantasy 5 / Georgia Fantasy 5 history into a future database:

1. Check for missing dates
2. Check for duplicate records
3. Confirm all results have five numbers
4. Confirm all numbers are from 1 to 42
5. Confirm no repeated numbers appear in the same result
6. Confirm source information is included
7. Confirm the data is clean and consistent

---

# Future Supabase Direction

Future Supabase table:

lottery_results

Fantasy 5 / Georgia Fantasy 5 should use:

game_key = fantasy5

Each draw result should be stored as a separate row.

---

# Current Status

Status:

Research file created

Current conclusion:

1. Fantasy 5 official game rules are available from Georgia Lottery
2. Official winning numbers can be checked through Georgia Lottery
3. LotteryUSA is currently used for latest-result automation as a readable source
4. Lottery Post may be useful for full historical Fantasy 5 research
5. Full history should not be imported until the source is reviewed and cleaned

---

# Next Step

After this file is saved, the project should continue by updating HISTORY-UPDATE-GUIDE.md so it matches the current working automation and the new four-game research structure.
