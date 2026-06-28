# Data Sources Plan

## Purpose

This file documents the data sources used for the Lottery Number Generator Website.

The purpose of this file is to keep result sources organized, clearly labeled, and separated by use case.

This file covers:

1. Current live latest-results sources
2. Structured data sources
3. Readable fallback sources
4. Manual verification sources
5. Source limitations
6. Future source improvement plans
7. Rules for preventing automation failure

---

# Current Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Important Source Rule

Only real past draw results should be used for result history or latest winning result display.

Generated numbers from the website should never be saved or treated as official past winning numbers.

---

# Source Priority Rule

Use sources in this order:

1. Structured official or government-published data source
2. Official lottery website result page
3. Readable fallback source
4. Manual review only when needed

Important:

If a readable fallback source is used, it must be clearly understood as a practical data source, not the final official authority.

Visitors should always be told to confirm final winning numbers, prize details, drawing schedules, and game rules through the official lottery source.

---

# Current Live Automation Sources

The current latest-results automation uses:

1. NY Open Data structured JSON for Powerball
2. NY Open Data structured JSON for Mega Millions
3. LotteryUSA readable result pages for Georgia Five
4. LotteryUSA readable result page for Fantasy 5

This setup was chosen because structured JSON is more stable than scraping regular website pages.

---

# Structured Data Sources

## Powerball Structured Source

Current automation source:

```text
https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1
