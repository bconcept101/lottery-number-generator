Copy everything inside this box and paste it into **PROJECT-BLUEPRINT.md**.

````markdown
# Lottery Number Generator Website Blueprint

## Project Name

**Lottery Number Generator Website**

---

## Project Purpose

This website is an **educational and entertainment random number generator website**.

The purpose is to let users generate random lottery-style numbers for selected games and check whether the generated number set appears in a stored past-number database.

This website does **not** guarantee winning numbers, predict lottery results, or provide gambling advice.

---

## Games Included

The website will support:

1. **Powerball**
2. **Mega Millions**
3. **Pick 5 / Georgia Five**

---

## Main Features

The website will include:

1. Random number generator
2. Game selector
3. Generated number display
4. Past numbers database
5. Check if generated numbers already appeared in the database
6. Manual weekly or monthly past-number updates
7. Disclaimer section/page
8. Support section/page
9. About page later
10. Navigation menu later
11. Supabase database later
12. Optional custom domain later
13. Optional Linktree later

---

# Platform Setup

## Hosting

**Cloudflare Pages**

Cloudflare Pages is used to host the website.

Cloudflare automatically redeploys the website whenever new changes are committed to GitHub.

---

## Code Storage

**GitHub**

GitHub stores the website files and project planning files.

---

## Future Database

**Supabase**

Supabase will be added later when the project is ready for a real database.

At the beginning, the past-number database will stay inside `script.js`.

---

## Optional Link Hub

**Linktree**

Linktree may be used later as an optional link hub for the website, support page, disclaimer page, and future project links.

---

# Accounts Created

## Cloudflare

**Email:** bconcept101@gmail.com

## GitHub

**Username:** bconcept101

---

# GitHub Repository

## Repository Name

**lottery-number-generator**

## Full Repository

**bconcept101/lottery-number-generator**

## Visibility

**Public**

## README

A README file was created during repository setup.

---

# Cloudflare Pages Setup

Cloudflare Pages has been connected to the GitHub repository.

## Repository Connected

**bconcept101/lottery-number-generator**

## Cloudflare Pages Settings Used

**Project name:** lottery-number-generator  
**Production branch:** main  
**Framework preset:** None  
**Build command:** blank  
**Build output directory:** `/`

## Deployment Status

Cloudflare Pages deployment was successful.

## Main Website URL

**lottery-number-generator-6ey.pages.dev**

## Latest Known Deployment Status

The latest Cloudflare deployment showed a green checkmark and was marked successful.

---

# Files Created So Far

The following files are currently in the GitHub repository:

1. `README.md`
2. `index.html`
3. `style.css`
4. `script.js`
5. `PROJECT-BLUEPRINT.md`

---

# File Purpose

## README.md

Basic GitHub project description file.

Current purpose:

1. Shows the repository name
2. Shows a short project description

---

## index.html

Main website structure file.

Current purpose:

1. Shows the website title
2. Shows the website subtitle
3. Shows the game dropdown selector
4. Shows the Generate Numbers button
5. Shows the generated number result area
6. Shows the database check message area
7. Shows the Disclaimer section
8. Shows the Support section
9. Connects to `style.css`
10. Connects to `script.js`

---

## style.css

Main website design file.

Current purpose:

1. Controls page background
2. Controls text design
3. Controls page width
4. Controls card layout
5. Controls button styling
6. Controls dropdown styling
7. Controls generated result styling
8. Creates the clean white card layout
9. Helps make the website look better on screen

---

## script.js

Main website function file.

Current purpose:

1. Stores sample past numbers
2. Generates Powerball numbers
3. Generates Mega Millions numbers
4. Generates Pick 5 / Georgia Five numbers
5. Displays generated numbers on the page
6. Checks generated numbers against the sample database
7. Shows whether the generated number set was found in the sample database

---

## PROJECT-BLUEPRINT.md

Main project roadmap file.

Purpose:

1. Keeps the full project plan inside GitHub
2. Shows what has already been completed
3. Shows what still needs to be done
4. Helps continue the project later
5. Keeps the project organized
6. Gives step-by-step direction for future production

---

# Current Website Status

## Completed

1. Cloudflare account created
2. GitHub account created
3. GitHub repository created
4. README file added
5. Cloudflare Pages connected to GitHub
6. Cloudflare Pages deployed successfully
7. `index.html` created
8. `style.css` created
9. `script.js` created
10. Live website opened successfully
11. Homepage loaded successfully
12. Game dropdown appeared
13. Generate Numbers button appeared
14. Disclaimer section appeared
15. Support section appeared
16. Pick 5 / Georgia Five was tested and generated numbers successfully

---

## Still Needs Testing

1. Powerball generator
2. Mega Millions generator

---

# Current Live Website Layout

The current website includes:

1. Main title: **Lottery Number Generator**
2. Subtitle: **Educational and entertainment random number generator website.**
3. White card section with:
   - Choose a Game
   - Dropdown selector
   - Generate Numbers button
   - Generated result
   - Database check message
4. Disclaimer section
5. Support section

---

# Current JavaScript Game Rules

## Powerball

The generator should create:

1. Five main numbers from 1 to 69
2. One Powerball number from 1 to 26

Format example:

`12-18-24-36-45 PB 7`

---

## Mega Millions

The generator should create:

1. Five main numbers from 1 to 70
2. One Mega Ball number from 1 to 25

Format example:

`8-14-22-39-50 MB 12`

---

## Pick 5 / Georgia Five

The generator should create:

1. Five digits from 0 to 9
2. Digits may repeat

Format example:

`7-0-5-3-5`

---

# Current Sample Database

The website currently uses a sample database inside `script.js`.

The database is not complete yet.

The current purpose of the sample database is only to test whether the checking feature works.

Example structure:

```javascript
const pastNumbers = {
  powerball: [],
  mega: [],
  pick5: []
};
```

Later, real past numbers will be added manually.

---

# Immediate Next Steps

## Step 1: Save This Blueprint

Create this file in GitHub:

`PROJECT-BLUEPRINT.md`

Paste this blueprint inside it.

Commit it to the main branch.

---

## Step 2: Test Remaining Games

Open the live website:

**lottery-number-generator-6ey.pages.dev**

Test:

1. Select **Powerball**
2. Click **Generate Numbers**
3. Confirm numbers appear
4. Select **Mega Millions**
5. Click **Generate Numbers**
6. Confirm numbers appear
7. Select **Pick 5 / Georgia Five**
8. Click **Generate Numbers**
9. Confirm numbers appear

---

## Step 3: Confirm Phase 1 Complete

Phase 1 is complete when:

1. Live website loads
2. Powerball works
3. Mega Millions works
4. Pick 5 / Georgia Five works
5. Database check message appears
6. No blank page appears
7. No broken design appears

---

# Production Phases

---

## Phase 1: Confirm Live Website

### Goal

Make sure the website works live on Cloudflare Pages.

### Steps

1. Go to Cloudflare Pages
2. Open the project:
   - `lottery-number-generator`
3. Open the main domain:
   - `lottery-number-generator-6ey.pages.dev`
4. Test Powerball
5. Test Mega Millions
6. Test Pick 5 / Georgia Five
7. Confirm generated numbers appear
8. Confirm database check message appears

### Completion Requirement

This phase is complete when all three games generate numbers correctly on the live website.

---

## Phase 2: Save Project Blueprint

### Goal

Keep the project blueprint inside the GitHub repository.

### File Name

`PROJECT-BLUEPRINT.md`

### Steps

1. Go to GitHub
2. Open:
   - `bconcept101/lottery-number-generator`
3. Click **Add file**
4. Click **Create new file**
5. Name the file:
   - `PROJECT-BLUEPRINT.md`
6. Paste this blueprint
7. Click **Commit changes...**
8. Commit directly to the main branch
9. Click **Commit changes**

### Completion Requirement

This phase is complete when `PROJECT-BLUEPRINT.md` appears in the GitHub file list.

---

## Phase 3: Improve Website Layout

### Goal

Make the website look more complete and professional.

### Planned Improvements

1. Add a stronger homepage heading
2. Add clearer instructions
3. Add a short explanation of each game
4. Improve spacing
5. Improve mobile layout
6. Add a footer
7. Add a simple navigation area
8. Improve disclaimer visibility
9. Improve support wording

### Files That May Be Updated

1. `index.html`
2. `style.css`

### Completion Requirement

This phase is complete when the homepage looks cleaner, more professional, and easier to understand.

---

## Phase 4: Improve Number Generator Logic

### Goal

Make sure each game follows the correct number format.

### Powerball Logic

Generate:

1. Five unique main numbers from 1 to 69
2. One Powerball number from 1 to 26

### Mega Millions Logic

Generate:

1. Five unique main numbers from 1 to 70
2. One Mega Ball number from 1 to 25

### Pick 5 / Georgia Five Logic

Generate:

1. Five digits from 0 to 9
2. Digits may repeat

### File That May Be Updated

`script.js`

### Completion Requirement

This phase is complete when every game generates correctly and displays in a clean format.

---

## Phase 5: Build Past Numbers Database

### Goal

Add historical number data so the website can check generated numbers against past results.

### Starting Method

Use a manual database inside `script.js`.

### Future Method

Move the database to Supabase.

### Manual Update Schedule

Past numbers may be updated:

1. Weekly
2. Monthly

### Database Categories

1. Powerball past numbers
2. Mega Millions past numbers
3. Pick 5 / Georgia Five past numbers

### Completion Requirement

This phase is complete when real past-number examples are added and the checking feature works.

---

## Phase 6: Add Disclaimer Page

### Goal

Create a full disclaimer page.

### File to Add Later

`disclaimer.html`

### Disclaimer Must Explain

1. The website is for educational and entertainment purposes only
2. The website does not guarantee winning numbers
3. The website does not predict future lottery results
4. Users are responsible for their own decisions
5. The website is not connected to official lottery organizations
6. The website should not be treated as financial advice

### Completion Requirement

This phase is complete when the disclaimer page exists and is linked from the homepage.

---

## Phase 7: Add Support Page

### Goal

Create a support page for users.

### File to Add Later

`support.html`

### Support Page May Include

1. General support message
2. Contact email later
3. Website update information
4. Past-number update notice
5. Basic FAQ later

### Completion Requirement

This phase is complete when the support page exists and is linked from the homepage.

---

## Phase 8: Add About Page

### Goal

Create a simple page explaining the website.

### File to Add Later

`about.html`

### About Page Should Explain

1. What the website does
2. Why it was created
3. What games are supported
4. That it is for educational and entertainment use
5. That it does not guarantee winning numbers

### Completion Requirement

This phase is complete when the about page exists and is linked from the homepage.

---

## Phase 9: Add Navigation Menu

### Goal

Allow users to move between pages.

### Pages to Link

1. Home
2. About
3. Disclaimer
4. Support

### Files That May Be Updated

1. `index.html`
2. `about.html`
3. `disclaimer.html`
4. `support.html`
5. `style.css`

### Completion Requirement

This phase is complete when all pages are connected through navigation links.

---

## Phase 10: Supabase Database Setup Later

### Goal

Move past-number storage from JavaScript into a real database.

### Database Platform

**Supabase**

### Possible Tables

1. `powerball_numbers`
2. `mega_millions_numbers`
3. `pick5_numbers`

### Possible Fields

1. `id`
2. `game_name`
3. `draw_date`
4. `numbers`
5. `special_ball`
6. `created_at`

### Completion Requirement

This phase is complete when the website can read past numbers from Supabase.

---

## Phase 11: Manual Update Workflow

### Goal

Create a simple process for updating past numbers.

### Manual Update Option 1

Update numbers directly inside `script.js`.

### Manual Update Option 2

Update numbers inside Supabase later.

### Weekly or Monthly Process

1. Collect new past numbers
2. Add them to the database
3. Save changes
4. Commit changes to GitHub if using file update
5. Wait for Cloudflare to redeploy automatically
6. Open the live website
7. Test the generator
8. Confirm the database check still works

### Completion Requirement

This phase is complete when there is a repeatable update process.

---

## Phase 12: Custom Domain Later

### Goal

Connect a custom domain to the website.

### Platform

Cloudflare Pages

### Current Status

A custom domain is not needed right now.

### Completion Requirement

This phase is complete when a purchased domain is connected to Cloudflare Pages.

---

## Phase 13: Optional Linktree Later

### Goal

Create a simple link hub for the project.

### Linktree May Include

1. Website link
2. Support page
3. Disclaimer page
4. About page
5. Future social links

### Completion Requirement

This phase is complete when Linktree is created and connected to the website.

---

## Phase 14: Final Testing

### Goal

Make sure everything works before sharing the website.

### Testing Checklist

1. Homepage loads
2. Powerball generator works
3. Mega Millions generator works
4. Pick 5 / Georgia Five generator works
5. Past-number check works
6. Disclaimer page works
7. Support page works
8. About page works
9. Navigation works
10. Mobile view looks good
11. Cloudflare deployment is successful
12. GitHub files are updated

### Completion Requirement

This phase is complete when the website works correctly on desktop and mobile.

---

## Phase 15: Long-Term Maintenance

### Goal

Keep the website updated and working.

### Maintenance Tasks

1. Update past numbers weekly or monthly
2. Test after each update
3. Keep disclaimer visible
4. Keep support page updated
5. Improve design over time
6. Add Supabase when needed
7. Add custom domain when ready
8. Keep this blueprint updated

---

# Project Rules

1. Keep the website educational and entertainment-focused.
2. Do not claim the website can predict winning numbers.
3. Do not claim the website can guarantee wins.
4. Keep the disclaimer clear and visible.
5. Make one major change at a time.
6. Test the live website after each GitHub update.
7. Use GitHub as the main file storage.
8. Use Cloudflare Pages as the live hosting platform.
9. Add Supabase later only after the basic website works.
10. Keep instructions simple and step-by-step.
11. Update this blueprint after major progress.
12. Do not add custom domain until the basic site is ready.
13. Do not add payment or support donation tools until the disclaimer and support structure are clear.

---

# How to Continue This Project Later

When returning to the project, use this instruction:

**Continue the Lottery Number Generator Website project from PROJECT-BLUEPRINT.md.**

The project should continue from the latest completed phase.

If needed, open this file in GitHub and use it as the roadmap.

---

# Current Project Position

## Current Phase

The project is currently around:

1. **Phase 1: Confirm Live Website**
2. **Phase 2: Save Project Blueprint**

## Next Immediate Action

Save this file as:

`PROJECT-BLUEPRINT.md`

Then commit it to the main branch.

## After Saving This Blueprint

Return to the live website and finish testing:

1. Powerball
2. Mega Millions
3. Pick 5 / Georgia Five

After testing is complete, move to:

**Phase 3: Improve Website Layout**
````

After you paste it, click **Commit changes...**.
