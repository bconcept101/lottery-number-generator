# Mega Millions History Research

## Purpose

This file documents the research plan for collecting Mega Millions past winning number history for the Lottery Number Generator Website.

The goal is to identify reliable Mega Millions result sources before adding large historical data into the project database.

---

# Game

## Public Game Name

Mega Millions

## Internal Game Key

mega

---

# Current Website Use

The website currently generates random Mega Millions-style numbers.

Mega Millions generator format:

1. Five main numbers
2. One Mega Ball number

Display example:

`8-14-22-39-50 MB 12`

---

# Mega Millions Game Format

Mega Millions results should include:

1. Draw date
2. Five main numbers
3. Mega Ball number
4. Source
5. Verification status

---

# Mega Millions Number Rules

Mega Millions database records should follow these rules:

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24
5. Special ball label should be `MB`

---

# Preferred Source Direction

Use official or highly reliable sources first.

Preferred source order:

1. Official Mega Millions previous drawings page
2. Official state lottery downloadable files
3. Official government/open-data sources
4. Third-party sources only if needed and verified against official sources

---

# Source Option 1: Official Mega Millions Previous Drawings

## Source Name

Official Mega Millions Previous Drawings

## Source URL

```text
https://www.megamillions.com/winning-numbers/previous-drawings.aspx
