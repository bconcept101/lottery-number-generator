# Mega Millions Early Backfill Review

## Summary

Parsed rows: 586
Cleaned backfill records: 520
Date range: 1996-09-06 through 2002-05-14
Skipped overlap rows from 2002-05-17 forward: 66
Rejected invalid rows: 0
Rejected duplicate draw-date rows: 0
Repeated exact combinations: 0

## Output file

```text
data/cleaned/mega-millions-early-backfill-cleaned.json
```

## Overlap handling

Rows dated 2002-05-17 or later were skipped because the New York Open Data Mega Millions file already starts on 2002-05-17.

## Duplicate draw dates

No duplicate draw dates found.

## Repeated exact combinations

No repeated exact combinations found.

## Rejected rows

No invalid rows rejected.
