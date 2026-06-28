# Lottery Number Generator Website

The Lottery Number Generator Website is an educational and entertainment website that creates random lottery-style number ideas for supported games.

The website is designed to generate number sets, display recent winning results, and prepare for a future backend history database that can check generated numbers against past winning draw history.

---

# Live Website

Cloudflare Pages hosts the live website.

Website:

https://lottery-number-generator-6ey.pages.dev/

---

# Supported Games

The website currently supports:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five
4. Fantasy 5 / Georgia Fantasy 5

---

# Current Website Features

The website currently includes:

1. Random number generation by game
2. 10, 15, or 20 generated number sets
3. Game-specific number formats
4. Homepage draw schedule section
5. Homepage latest winning results section
6. About page
7. Disclaimer page
8. Support page
9. Mobile-friendly layout
10. GitHub Actions latest-results automation
11. Cloudflare Pages deployment

---

# Current Result System

The website currently uses two result-related files:

1. `database.js`
2. `latest-results.js`

`database.js` stores available past winning draw history structure.

`latest-results.js` stores the latest winning results shown on the homepage.

---

# Latest Results Automation

The latest-results section is updated through GitHub Actions.

Current automation files:

1. `scripts/update-latest-results.js`
2. `.github/workflows/update-latest-results.yml`
3. `latest-results.js`
4. `latest-results-display.js`

The automation process:

1. Runs through GitHub Actions
2. Pulls latest results from approved sources
3. Validates the result data
4. Updates `latest-results.js`
5. Commits changes when new data is found
6. Triggers Cloudflare Pages deployment
7. Updates the homepage latest-results cards

---

# History Research Files

The project includes history research planning for all supported games:

1. `POWERBALL-HISTORY-RESEARCH.md`
2. `MEGA-MILLIONS-HISTORY-RESEARCH.md`
3. `PICK-5-GEORGIA-FIVE-HISTORY-RESEARCH.md`
4. `FANTASY-5-GEORGIA-FANTASY-5-HISTORY-RESEARCH.md`

These files document source research, validation rules, duplicate prevention rules, and future full-history import planning.

---

# Future Backend Database Goal

The long-term plan is to move full past winning result history into Supabase.

The future backend system should:

1. Store full verified draw history
2. Automatically save new daily results
3. Prevent duplicate draw records
4. Allow generated numbers to be checked against stored past winning combinations
5. Avoid showing generated number sets that already appeared as past winning draws

---

# Important Disclaimer

This website is for educational and entertainment purposes only.

The number generator does not predict lottery results, guarantee winning numbers, or provide gambling advice.

Visitors should always confirm official winning numbers, prize details, drawing schedules, and game rules through the official lottery source.

---

# Current Project Status

Current completed status:

1. Website is live on Cloudflare Pages
2. GitHub repository is connected to Cloudflare Pages
3. Homepage is updated
4. About page is updated
5. Disclaimer page is updated
6. Support page is updated
7. Latest results display is working
8. GitHub Actions latest-results automation is working
9. Mobile display has been tested
10. Planning files are being updated for future full-history database expansion
