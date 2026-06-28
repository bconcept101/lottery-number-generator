# Supabase Schema Plan

## Purpose

This file defines the future Supabase database structure for the Lottery Number Generator Website.

The current website uses:

`database.js`

Later, the project may move to Supabase so past winning numbers can be stored, managed, checked, and updated more professionally.

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

`Supabase`

Supabase will be used later to store real past winning number history.

---

# Main Database Goal

The database should store real past draw results only.

It should not store generated numbers from visitors.

Generated numbers are only for educational and entertainment use.

---

# Recommended Table Structure

Use one main table:

`lottery_results`

This keeps the database easier to manage because all games can be stored in one organized table.

---

# Table Name

```sql
lottery_results
```

---

# Fields

## id

Type:

```sql
uuid
```

Purpose:

Unique record ID for each result.

---

## game_key

Type:

```sql
text
```

Purpose:

Stores the internal game key.

Allowed values:

```text
powerball
mega
pick5
fantasy5
```

---

## game_name

Type:

```sql
text
```

Purpose:

Stores the public game name.

Examples:

```text
Powerball
Mega Millions
Pick 5 / Georgia Five
Fantasy 5 / Georgia Fantasy 5
```

---

## draw_date

Type:

```sql
date
```

Purpose:

Stores the official draw date.

Example:

```text
2026-06-27
```

---

## draw_time

Type:

```sql
text
```

Purpose:

Stores draw time if needed.

Examples:

```text
Midday
Evening
Night
```

This is especially useful for games that may have more than one draw per day.

---

## main_numbers

Type:

```sql
jsonb
```

Purpose:

Stores the main winning numbers.

Examples:

```json
[12, 18, 24, 36, 45]
```

```json
[7, 4, 9, 0, 2]
```

---

## special_ball

Type:

```sql
integer
```

Purpose:

Stores Powerball or Mega Ball when the game uses a special ball.

Examples:

```text
7
12
```

For games without a special ball, this value can be empty.

---

## special_ball_label

Type:

```sql
text
```

Purpose:

Stores the special ball label.

Examples:

```text
PB
MB
```

For games without a special ball, this value can be empty.

---

## source_url

Type:

```sql
text
```

Purpose:

Stores the source where the result was collected from.

---

## verified

Type:

```sql
boolean
```

Purpose:

Shows whether the result was verified from a trusted source.

Recommended values:

```text
true
false
```

---

## update_method

Type:

```sql
text
```

Purpose:

Shows how the result was added.

Examples:

```text
manual
automated
```

---

## created_at

Type:

```sql
timestamp
```

Purpose:

Stores when the record was created.

---

## updated_at

Type:

```sql
timestamp
```

Purpose:

Stores when the record was last updated.

---

# Suggested SQL Table

```sql
create table lottery_results (
  id uuid primary key default gen_random_uuid(),
  game_key text not null,
  game_name text not null,
  draw_date date not null,
  draw_time text,
  main_numbers jsonb not null,
  special_ball integer,
  special_ball_label text,
  source_url text,
  verified boolean default false,
  update_method text default 'manual',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

---

# Duplicate Prevention

The database should prevent duplicate results.

Recommended duplicate check fields:

1. `game_key`
2. `draw_date`
3. `draw_time`

This means the same game should not have the same draw date and draw time entered twice.

---

# Suggested Unique Rule

```sql
create unique index unique_lottery_draw
on lottery_results (game_key, draw_date, coalesce(draw_time, ''));
```

---

# Game Format Rules

## Powerball

Expected data:

1. `game_key`: `powerball`
2. `game_name`: `Powerball`
3. Five main numbers
4. Special ball label: `PB`
5. Powerball number

Example:

```json
{
  "game_key": "powerball",
  "game_name": "Powerball",
  "draw_date": "2026-06-27",
  "draw_time": null,
  "main_numbers": [12, 18, 24, 36, 45],
  "special_ball": 7,
  "special_ball_label": "PB",
  "verified": true,
  "update_method": "manual"
}
```

---

## Mega Millions

Expected data:

1. `game_key`: `mega`
2. `game_name`: `Mega Millions`
3. Five main numbers
4. Special ball label: `MB`
5. Mega Ball number

Example:

```json
{
  "game_key": "mega",
  "game_name": "Mega Millions",
  "draw_date": "2026-06-27",
  "draw_time": null,
  "main_numbers": [8, 14, 22, 39, 50],
  "special_ball": 12,
  "special_ball_label": "MB",
  "verified": true,
  "update_method": "manual"
}
```

---

## Pick 5 / Georgia Five

Expected data:

1. `game_key`: `pick5`
2. `game_name`: `Pick 5 / Georgia Five`
3. Five digits from 0 to 9
4. Digits may repeat
5. Exact order matters
6. No special ball

Example:

```json
{
  "game_key": "pick5",
  "game_name": "Pick 5 / Georgia Five",
  "draw_date": "2026-06-27",
  "draw_time": "Evening",
  "main_numbers": [7, 4, 9, 0, 2],
  "special_ball": null,
  "special_ball_label": null,
  "verified": true,
  "update_method": "manual"
}
```

---

## Fantasy 5 / Georgia Fantasy 5

Expected data:

1. `game_key`: `fantasy5`
2. `game_name`: `Fantasy 5 / Georgia Fantasy 5`
3. Five main numbers
4. No special ball

Example:

```json
{
  "game_key": "fantasy5",
  "game_name": "Fantasy 5 / Georgia Fantasy 5",
  "draw_date": "2026-06-27",
  "draw_time": null,
  "main_numbers": [4, 12, 18, 27, 39],
  "special_ball": null,
  "special_ball_label": null,
  "verified": true,
  "update_method": "manual"
}
```

---

# Website Read Plan Later

Later, the website should be able to read from Supabase.

Possible website flow:

1. Visitor selects a game
2. Visitor generates numbers
3. Website checks Supabase for matching past results
4. Website displays generated numbers
5. Website may show whether a number set matched a past result

---

# Automation Write Plan Later

Later, the automation system should be able to write to Supabase.

Possible automation flow:

1. Daily scheduled update runs
2. System checks approved result sources
3. System formats new results
4. System checks for duplicates
5. System inserts only new results
6. System logs update activity

---

# Security Rules

Do not place Supabase secret keys inside GitHub.

Do not allow public visitors to write directly to the database.

Only approved update systems should be allowed to insert or update official past results.

---

# Future Row Level Security Notes

When Supabase is created later:

1. Public visitors may need read-only access
2. Public visitors should not have write access
3. Insert and update access should be restricted
4. Automation keys should stay private
5. Service role keys should never be exposed in website code

---

# Current Status

This is a planning file only.

It does not control the live website yet.

The live website currently uses:

1. `index.html`
2. `style.css`
3. `script.js`
4. `database.js`

---

# Next Step After This File

After this file is saved, the next production step is:

`DATABASE-MANUAL-TEMPLATE.md`

That file will give a clean copy-and-paste template for adding manual results before Supabase is created.
