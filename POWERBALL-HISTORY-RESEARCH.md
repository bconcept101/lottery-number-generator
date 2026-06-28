# Powerball History Research

## Purpose

This file documents the research plan for collecting Powerball past winning number history for the Lottery Number Generator Website.

The goal is to identify reliable Powerball result sources before adding large historical data into the project database.

---

# Game

## Public Game Name

Powerball

## Internal Game Key

powerball

---

# Current Website Use

The website currently generates random Powerball-style numbers.

Powerball generator format:

1. Five main numbers
2. One Powerball number

Display example:

`12-18-24-36-45 PB 7`

---

# Powerball Game Format

Powerball results should include:

1. Draw date
2. Five main numbers
3. Powerball number
4. Source
5. Verification status

---

# Powerball Number Rules

Powerball database records should follow these rules:

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26
5. Special ball label should be `PB`

---

# Preferred Source Direction

Use official or highly reliable sources first.

Preferred source order:

1. Official Powerball previous results page
2. Official state lottery downloadable files
3. Official government/open-data sources
4. Third-party sources only if needed and verified against official sources

---

# Source Option 1: Official Powerball Previous Results

## Source Name

Official Powerball Previous Results

## Source URL

```text
https://www.powerball.com/previous-results
