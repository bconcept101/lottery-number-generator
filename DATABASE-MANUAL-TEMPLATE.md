# Database Manual Template

## Purpose

This file provides clean copy-and-paste templates for adding manual past winning number results to `database.js`.

This is the manual update system before Supabase and daily automation are added later.

---

# Important Rule

Only real past winning numbers should be added to the database.

Generated numbers from the website should never be saved as official past results.

---

# Current Database File

Manual results are currently stored in:

`database.js`

---

# Current Games

The database currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# General Entry Rules

Each entry should include:

1. Draw date
2. Main numbers
3. Special ball if the game has one
4. Special ball label if the game has one
5. Source
6. Verified status

---

# Powerball Template

Use this format for Powerball results:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [0, 0, 0, 0, 0],
  specialBall: 0,
  specialBallLabel: "PB",
  source: "Official source",
  verified: true
}
```

## Powerball Rules

1. Five main numbers
2. Main numbers from 1 to 69
3. No repeated main numbers
4. One Powerball number from 1 to 26
5. Special ball label should be `PB`

---

# Mega Millions Template

Use this format for Mega Millions results:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [0, 0, 0, 0, 0],
  specialBall: 0,
  specialBallLabel: "MB",
  source: "Official source",
  verified: true
}
```

## Mega Millions Rules

1. Five main numbers
2. Main numbers from 1 to 70
3. No repeated main numbers
4. One Mega Ball number from 1 to 24
5. Special ball label should be `MB`

---

# Pick 5 / Georgia Five Template

Use this format for Pick 5 / Georgia Five results:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [0, 0, 0, 0, 0],
  specialBall: null,
  specialBallLabel: null,
  source: "Official source",
  verified: true
}
```

## Pick 5 / Georgia Five Rules

1. Five digits
2. Digits from 0 to 9
3. Digits may repeat
4. Exact order matters
5. No special ball

---

# Fantasy 5 / Georgia Fantasy 5 Template

Use this format for Fantasy 5 / Georgia Fantasy 5 results:

```javascript
{
  drawDate: "YYYY-MM-DD",
  numbers: [0, 0, 0, 0, 0],
  specialBall: null,
  specialBallLabel: null,
  source: "Official source",
  verified: true
}
```

## Fantasy 5 / Georgia Fantasy 5 Rules

1. Five main numbers
2. Main numbers from 1 to 42
3. No repeated main numbers
4. No special ball

---

# Where To Add Results In database.js

## Powerball

Add Powerball results inside:

```javascript
powerball: [
  // Add Powerball results here
]
```

---

## Mega Millions

Add Mega Millions results inside:

```javascript
mega: [
  // Add Mega Millions results here
]
```

---

## Pick 5 / Georgia Five

Add Pick 5 / Georgia Five results inside:

```javascript
pick5: [
  // Add Pick 5 / Georgia Five results here
]
```

---

## Fantasy 5 / Georgia Fantasy 5

Add Fantasy 5 / Georgia Fantasy 5 results inside:

```javascript
fantasy5: [
  // Add Fantasy 5 / Georgia Fantasy 5 results here
]
```

---

# Example Powerball Entry

```javascript
{
  drawDate: "2026-06-27",
  numbers: [12, 18, 24, 36, 45],
  specialBall: 7,
  specialBallLabel: "PB",
  source: "Official source",
  verified: true
}
```

---

# Example Mega Millions Entry

```javascript
{
  drawDate: "2026-06-27",
  numbers: [8, 14, 22, 39, 50],
  specialBall: 12,
  specialBallLabel: "MB",
  source: "Official source",
  verified: true
}
```

---

# Example Pick 5 / Georgia Five Entry

```javascript
{
  drawDate: "2026-06-27",
  numbers: [7, 4, 9, 0, 2],
  specialBall: null,
  specialBallLabel: null,
  source: "Official source",
  verified: true
}
```

---

# Example Fantasy 5 / Georgia Fantasy 5 Entry

```javascript
{
  drawDate: "2026-06-27",
  numbers: [4, 12, 18, 27, 39],
  specialBall: null,
  specialBallLabel: null,
  source: "Official source",
  verified: true
}
```

---

# Manual Update Steps

1. Open official result source
2. Confirm the game
3. Confirm the draw date
4. Confirm the numbers
5. Copy the correct template
6. Replace the placeholder date and numbers
7. Add the result to the correct section in `database.js`
8. Check commas carefully
9. Commit the change to GitHub
10. Wait for Cloudflare Pages to redeploy
11. Test the live website

---

# Comma Rule

When adding multiple results, each result must be separated by a comma.

Example:

```javascript
{
  drawDate: "2026-06-27",
  numbers: [12, 18, 24, 36, 45],
  specialBall: 7,
  specialBallLabel: "PB",
  source: "Official source",
  verified: true
},
{
  drawDate: "2026-06-28",
  numbers: [3, 15, 27, 41, 62],
  specialBall: 19,
  specialBallLabel: "PB",
  source: "Official source",
  verified: true
}
```

Do not add an extra comma after the last item unless the code still works properly.

---

# Duplicate Check

Before adding a result, check if that draw date already exists inside the same game section.

Do not add the same result twice.

---

# Verified Status

Use:

```javascript
verified: true
```

only when the result came from an official or trusted source.

Use:

```javascript
verified: false
```

for sample data or unverified data.

---

# Source Field

Use the source field to identify where the result came from.

Examples:

```javascript
source: "Powerball official previous results"
```

```javascript
source: "Mega Millions official previous drawings"
```

```javascript
source: "Georgia Lottery official results"
```

---

# Future Automation Note

This manual template is temporary.

Later, the project goal is to use Supabase and a daily automated update system.

Until then, this template helps keep manual updates clean and consistent.
