# Supabase Schema Plan

## Purpose

This file defines the future Supabase database structure for the Lottery Number Generator Website.

The current website uses:

database.js

Later, the project should move full past winning result history into Supabase so results can be stored, managed, checked, and updated more professionally.

Supabase will support three main goals:

1. Store full past winning draw history for all supported games.
2. Allow the website generator to check generated numbers against stored past winning results.
3. Allow daily automation to save new verified draw results into the backend database.

---

# Current Games

The future Supabase database should support:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Future Database Platform

Planned database platform:

Supabase

Supabase will be used later to store real past winning number history.

---

# Main Database Goal

The database should store real past draw results only.

It should not store generated numbers from visitors as official winning results.

Generated numbers are only for educational and entertainment use.

---

# Main Table

Recommended table name:

lottery_results

This keeps all supported games inside one organized table while still allowing each game to be filtered by game key.

---

# Main Table Purpose

The lottery_results table should store:

1. Game name
2. Game key
3. Draw date
4. Draw time
5. Draw type
6. Winning numbers
7. Extra game number when required
8. Source information
9. Verification status
10. Update method
11. A searchable combination key for history checking
12. Created and updated timestamps

---

# Recommended Fields

## id

Type:

uuid

Purpose:

Unique record ID for each draw result.

---

## game_key

Type:

text

Purpose:

Stores the internal game key.

Allowed values:

1. powerball
2. mega
3. pick5
4. fantasy5

---

## game_name

Type:

text

Purpose:

Stores the public game name.

Examples:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

## draw_date

Type:

date

Purpose:

Stores the official draw date.

Example:

2026-06-27

---

## draw_time

Type:

text

Purpose:

Stores the draw time when available.

Examples:

1. 10:59 PM ET
2. 11:00 PM ET
3. 12:29 PM ET
4. 6:59 PM ET
5. 11:34 PM ET

---

## draw_type

Type:

text

Purpose:

Stores the draw type when needed.

Examples:

1. single
2. midday
3. evening
4. night

This is important for Georgia Five because Midday and Evening results happen on the same date and must be stored as separate records.

---

## main_numbers

Type:

jsonb

Purpose:

Stores the main winning numbers.

Examples:

Powerball:

[12, 18, 24, 36, 45]

Pick 5 / Georgia Five:

[7, 4, 9, 0, 2]

---

## special_ball

Type:

integer

Purpose:

Stores the Powerball number or Mega Ball number when the game uses an extra game number.

Examples:

1. Powerball number
2. Mega Ball number

For Pick 5 / Georgia Five and Fantasy 5 / Georgia Fantasy 5, this value should be null.

---

## special_ball_label

Type:

text

Purpose:

Stores the extra game number label.

Examples:

1. PB
2. MB

For games without an extra game number, this value should be null.

---

## combination_key

Type:

text

Purpose:

Stores a clean searchable version of the winning number combination.

This field will help the generator check whether a newly generated number set has already appeared in past winning history.

Examples:

Powerball:

12-18-24-36-45-PB-7

Mega Millions:

8-14-22-39-50-MB-12

Pick 5 / Georgia Five:

7-4-9-0-2

Fantasy 5 / Georgia Fantasy 5:

4-12-18-27-39

Important:

For Pick 5 / Georgia Five, number order must be preserved.

---

## source_url

Type:

text

Purpose:

Stores the source where the result was collected from.

---

## source_type

Type:

text

Purpose:

Stores the source category.

Examples:

1. official
2. structured
3. fallback
4. manual-review

---

## verified

Type:

boolean

Purpose:

Shows whether the result was verified from an approved source or reviewed process.

Recommended values:

1. true
2. false

---

## update_method

Type:

text

Purpose:

Shows how the result was added.

Examples:

1. manual
2. automated
3. import

---

## created_at

Type:

timestamp with time zone

Purpose:

Stores when the record was created.

---

## updated_at

Type:

timestamp with time zone

Purpose:

Stores when the record was last updated.

---

# Suggested SQL Table

    create table lottery_results (
      id uuid primary key default gen_random_uuid(),
      game_key text not null,
      game_name text not null,
      draw_date date not null,
      draw_time text,
      draw_type text default 'single',
      main_numbers jsonb not null,
      special_ball integer,
      special_ball_label text,
      combination_key text not null,
      source_url text,
      source_type text,
      verified boolean default false,
      update_method text default 'manual',
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

---

# Suggested Field Checks

## Game Key Check

    alter table lottery_results
    add constraint lottery_results_game_key_check
    check (game_key in ('powerball', 'mega', 'pick5', 'fantasy5'));

## Draw Type Check

    alter table lottery_results
    add constraint lottery_results_draw_type_check
    check (draw_type in ('single', 'midday', 'evening', 'night'));

## Source Type Check

    alter table lottery_results
    add constraint lottery_results_source_type_check
    check (source_type in ('official', 'structured', 'fallback', 'manual-review'));

## Update Method Check

    alter table lottery_results
    add constraint lottery_results_update_method_check
    check (update_method in ('manual', 'automated', 'import'));

---

# Duplicate Prevention

The database should prevent duplicate draw records.

Duplicate prevention should use:

1. game_key
2. draw_date
3. draw_type

This allows Georgia Five Midday and Evening results to exist on the same date without creating a conflict.

---

# Suggested Unique Rule

    create unique index unique_lottery_draw
    on lottery_results (game_key, draw_date, coalesce(draw_type, 'single'));

---

# Generated Number Match Index

The generator will need to check generated numbers against past winning combinations.

Suggested index:

    create index lottery_results_combination_lookup
    on lottery_results (game_key, combination_key);

Purpose:

1. Make past-result checking faster
2. Allow the generator to compare new generated numbers against stored winning combinations
3. Help avoid showing a generated number set that already appeared as a past winning draw

---

# Game Format Rules

## Powerball

Expected data:

1. game_key: powerball
2. game_name: Powerball
3. draw_type: single
4. Five main numbers
5. Main numbers from 1 to 69
6. No repeated main numbers
7. special_ball_label: PB
8. Powerball number from 1 to 26

Example:

    {
      "game_key": "powerball",
      "game_name": "Powerball",
      "draw_date": "2026-06-27",
      "draw_time": "10:59 PM ET",
      "draw_type": "single",
      "main_numbers": [12, 18, 24, 36, 45],
      "special_ball": 7,
      "special_ball_label": "PB",
      "combination_key": "12-18-24-36-45-PB-7",
      "source_type": "structured",
      "verified": true,
      "update_method": "automated"
    }

---

## Mega Millions

Expected data:

1. game_key: mega
2. game_name: Mega Millions
3. draw_type: single
4. Five main numbers
5. Main numbers from 1 to 70
6. No repeated main numbers
7. special_ball_label: MB
8. Mega Ball number from 1 to 24

Example:

    {
      "game_key": "mega",
      "game_name": "Mega Millions",
      "draw_date": "2026-06-27",
      "draw_time": "11:00 PM ET",
      "draw_type": "single",
      "main_numbers": [8, 14, 22, 39, 50],
      "special_ball": 12,
      "special_ball_label": "MB",
      "combination_key": "8-14-22-39-50-MB-12",
      "source_type": "structured",
      "verified": true,
      "update_method": "automated"
    }

---

## Pick 5 / Georgia Five

Expected data:

1. game_key: pick5
2. game_name: Pick 5 / Georgia Five
3. Five digits from 0 to 9
4. Digits may repeat
5. Exact order matters
6. No special ball
7. Midday and Evening records stored separately

Example Midday:

    {
      "game_key": "pick5",
      "game_name": "Pick 5 / Georgia Five",
      "draw_date": "2026-06-27",
      "draw_time": "12:29 PM ET",
      "draw_type": "midday",
      "main_numbers": [4, 2, 6, 9, 6],
      "special_ball": null,
      "special_ball_label": null,
      "combination_key": "4-2-6-9-6",
      "source_type": "fallback",
      "verified": true,
      "update_method": "automated"
    }

Example Evening:

    {
      "game_key": "pick5",
      "game_name": "Pick 5 / Georgia Five",
      "draw_date": "2026-06-27",
      "draw_time": "6:59 PM ET",
      "draw_type": "evening",
      "main_numbers": [2, 5, 3, 5, 7],
      "special_ball": null,
      "special_ball_label": null,
      "combination_key": "2-5-3-5-7",
      "source_type": "fallback",
      "verified": true,
      "update_method": "automated"
    }

---

## Fantasy 5 / Georgia Fantasy 5

Expected data:

1. game_key: fantasy5
2. game_name: Fantasy 5 / Georgia Fantasy 5
3. draw_type: night
4. Five main numbers
5. Numbers from 1 to 42
6. No repeated main numbers
7. No special ball

Example:

    {
      "game_key": "fantasy5",
      "game_name": "Fantasy 5 / Georgia Fantasy 5",
      "draw_date": "2026-06-27",
      "draw_time": "11:34 PM ET",
      "draw_type": "night",
      "main_numbers": [1, 4, 20, 23, 24],
      "special_ball": null,
      "special_ball_label": null,
      "combination_key": "1-4-20-23-24",
      "source_type": "fallback",
      "verified": true,
      "update_method": "automated"
    }

---

# Website Read Plan Later

Later, the website should be able to read from Supabase.

Future website flow:

1. Visitor selects a game.
2. Visitor chooses how many number sets to generate.
3. Website generates a random number set.
4. Website builds a combination key for that number set.
5. Website checks Supabase for a matching game_key and combination_key.
6. If the number set already appeared as a past winning draw, the website generates another set.
7. If the number set does not appear in stored history, the website shows it to the visitor.

Important:

This does not predict lottery results or guarantee winning numbers. It only helps avoid showing generated number sets that already appeared in the available stored winning history.

---

# Automation Write Plan Later

Later, the automation system should be able to write to Supabase.

Future automation flow:

1. Daily scheduled update runs.
2. System checks approved result sources.
3. System formats new results.
4. System builds the combination key.
5. System validates number counts and number ranges.
6. System checks for duplicate draw records.
7. System inserts only new results.
8. System logs update activity.
9. Website reads updated result history from Supabase.

---

# Suggested Insert Process

Before inserting a new result:

1. Confirm game_key.
2. Confirm game_name.
3. Confirm draw_date.
4. Confirm draw_type.
5. Confirm main_numbers.
6. Confirm special_ball when required.
7. Build combination_key.
8. Confirm source_url.
9. Confirm source_type.
10. Confirm verified status.
11. Check for duplicate draw record.
12. Insert only if the record is new.

---

# Security Rules

Do not place Supabase secret keys inside public GitHub files.

Do not place Supabase service role keys inside browser JavaScript.

Do not allow public visitors to write directly to the database.

Only approved update systems should be allowed to insert or update official past results.

---

# Future Row Level Security Notes

When Supabase is created later:

1. Public visitors may need read-only access.
2. Public visitors should not have write access.
3. Insert access should be restricted.
4. Update access should be restricted.
5. Delete access should be restricted.
6. Automation keys should stay private.
7. Service role keys should never be exposed in website code.

---

# Current Status

This is a planning file only.

It does not control the live website yet.

The live website currently uses:

1. index.html
2. style.css
3. script.js
4. database.js
5. latest-results.js
6. latest-results-display.js

The current latest-results automation is working through:

1. scripts/update-latest-results.js
2. .github/workflows/update-latest-results.yml

---

# Next Step After This File

After this file is saved, the next production step is:

DATABASE-MANUAL-TEMPLATE.md

That file should be updated to match the current four-game structure, latest-results backup format, and future Supabase import direction.
