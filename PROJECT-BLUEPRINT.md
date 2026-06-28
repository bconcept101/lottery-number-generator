# Lottery Number Generator Website Blueprint

## Project Name

**Lottery Number Generator Website**

---

## Project Purpose

This website is an **educational and entertainment random number generator website**.

The website allows visitors to generate random lottery-style numbers for selected games, review regular draw schedule information, and view recent winning result information when updates are available.

This website does **not** guarantee winning numbers, predict lottery results, improve lottery odds, or provide gambling advice.

---

# Games Included

The website currently supports:

1. **Powerball**
2. **Mega Millions**
3. **Pick 5 / Georgia Five**
4. **Fantasy 5 / Georgia Fantasy 5**

---

# Main Website Features

The website currently includes:

1. Random number generator
2. Game selector
3. Option to generate 10, 15, or 20 number sets
4. Clean generated-number display
5. Homepage navigation menu
6. Home page
7. About page
8. Disclaimer page
9. Support page
10. Upcoming Draw Schedule section
11. Latest Winning Results section
12. PayPal support button
13. Responsive desktop, tablet, and mobile layout
14. Separate `style.css` file for design and layout
15. Separate `script.js` file for generator logic
16. Separate `database.js` file for game rules and past-result structure
17. Separate `latest-results.js` file for latest result display data
18. Separate `latest-results-display.js` file for showing latest results on the homepage
19. Separate `scripts/update-latest-results.js` file for automated result updates
20. GitHub Actions workflow for daily/manual latest-result updates
21. Cloudflare Pages deployment from GitHub

---

# Platform Setup

## Hosting Platform

**Cloudflare Pages**

Cloudflare Pages hosts the live website.

Cloudflare Pages is connected to the GitHub repository and redeploys the website when changes are committed to the main branch.

## Code Storage Platform

**GitHub**

GitHub stores:

1. Website files
2. Styling files
3. JavaScript logic files
4. Automation scripts
5. GitHub Actions workflow files
6. Project documentation and planning files

## Automation Platform

**GitHub Actions**

GitHub Actions is used to run the latest-results update process.

The automation can run:

1. On a daily schedule
2. Manually from the GitHub Actions tab

## Future Database Platform

**Supabase**

Supabase is still planned as a future database option for storing full past-result history.

Supabase is not required for the current live latest-results display system.

## Optional Link Hub

**Linktree**

Linktree may be used later as an optional link hub.

---

# Accounts Created

## Cloudflare

**Email:** bconcept101@gmail.com

## GitHub

**Username:** bconcept101

## PayPal

A PayPal support link has been created and connected to the website.

---

# GitHub Repository

## Repository Name

**lottery-number-generator**

## Full Repository

**bconcept101/lottery-number-generator**

## Visibility

**Public**

---

# Cloudflare Pages Setup

## Repository Connected

**bconcept101/lottery-number-generator**

## Cloudflare Pages Settings Used

**Project name:** lottery-number-generator  
**Production branch:** main  
**Framework preset:** None  
**Build command:** blank  
**Build output directory:** `/`

## Main Website URL

**lottery-number-generator-6ey.pages.dev**

---

# Website Structure

The website is built as a static website using HTML, CSS, and JavaScript.

The current structure is:

```text
lottery-number-generator/
│
├── index.html
├── about.html
├── disclaimer.html
├── support.html
│
├── style.css
├── script.js
├── database.js
├── latest-results.js
├── latest-results-display.js
├── result-sources.js
│
├── scripts/
│   └── update-latest-results.js
│
├── .github/
│   └── workflows/
│       └── update-latest-results.yml
│
├── README.md
├── PROJECT-BLUEPRINT.md
├── DATA-SOURCES.md
├── AUTOMATION-PLAN.md
├── SECURITY-CHECKLIST.md
├── SUPABASE-SCHEMA.md
├── DATABASE-MANUAL-TEMPLATE.md
├── FULL-HISTORY-IMPORT-PLAN.md
├── HISTORY-UPDATE-GUIDE.md
├── POWERBALL-HISTORY-RESEARCH.md
└── MEGA-MILLIONS-HISTORY-RESEARCH.md
