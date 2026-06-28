# Security Checklist

## Purpose

This file documents the security rules for the Lottery Number Generator Website.

The website is currently a static website hosted on Cloudflare Pages and stored in GitHub. It does not currently collect user accounts, passwords, personal information, or payment information directly on the website.

Payments and support contributions are handled through PayPal.

---

# Current Website Security Status

The current website is a basic static website.

Current files:

1. `index.html`
2. `style.css`
3. `script.js`
4. `database.js`
5. `about.html`
6. `disclaimer.html`
7. `support.html`

Current hosting:

1. Cloudflare Pages
2. GitHub repository connected to Cloudflare

Current payment support:

1. PayPal donation/support link
2. No payment details are collected directly on the website

---

# Important Security Rule

Never place private information inside public GitHub files.

Do not add:

1. Passwords
2. Private API keys
3. Supabase secret keys
4. Cloudflare API tokens
5. PayPal private account information
6. Bank information
7. Personal identification documents
8. Private admin links
9. Private access tokens
10. Recovery codes

---

# GitHub Security Checklist

## Required

1. Use a strong GitHub password
2. Turn on two-factor authentication
3. Save GitHub recovery codes somewhere safe
4. Do not share GitHub login information
5. Do not upload private keys or passwords
6. Review files before committing changes
7. Make sure only intended files are public
8. Watch for unknown commits or file changes

## Repository Rule

The repository may stay public, but secret information must never be added to it.

---

# Cloudflare Security Checklist

## Required

1. Use a strong Cloudflare password
2. Turn on two-factor authentication
3. Do not share Cloudflare login information
4. Do not create public API tokens unless needed
5. Do not expose Cloudflare private tokens in GitHub
6. Review deployments after each GitHub commit
7. Keep the project connected only to the correct GitHub repository

## Current Cloudflare Project

Project name:

`lottery-number-generator`

Main domain:

`lottery-number-generator-6ey.pages.dev`

---

# PayPal Security Checklist

## Required

1. Use a strong PayPal password
2. Turn on two-factor authentication
3. Confirm the PayPal support link is correct
4. Do not share PayPal login information
5. Do not place bank details on the website
6. Do not place PayPal private account details in GitHub
7. Review PayPal activity regularly
8. Keep the donation/support page wording honest and accurate

## Current PayPal Support Link

`https://www.paypal.com/donate/?hosted_button_id=RD35Y3ZGP22KS`

---

# Website Security Rules

The website should not collect private visitor information unless a proper privacy system is added later.

Do not add:

1. User login forms
2. Password forms
3. Credit card forms
4. Bank forms
5. Social Security number fields
6. Personal identification uploads
7. Private user data storage

If visitor forms are added later, a privacy policy and secure backend process must be created first.

---

# Payment Security Rule

The website should not process payments directly.

All support payments should continue going through trusted third-party platforms such as PayPal or another secure payment provider.

The website button should link visitors to the payment provider.

---

# Database Security Rules

The current database file is:

`database.js`

This file should only contain public lottery result information.

Do not store private data in `database.js`.

Allowed:

1. Game names
2. Draw dates
3. Winning numbers
4. Public result sources
5. Verified status

Not allowed:

1. User data
2. Payment data
3. Login data
4. Private API keys
5. Secret tokens

---

# Future Supabase Security Rules

When Supabase is added later:

1. Do not expose Supabase service role keys
2. Only use public anon keys when safe
3. Set proper table permissions
4. Use Row Level Security if needed
5. Keep private keys outside GitHub
6. Do not allow public users to edit the database directly
7. Only allow controlled update systems to write new results
8. Test database permissions before going live

---

# Future Automation Security Rules

When daily automatic updates are added later:

1. Use secure environment variables
2. Do not place API keys in public code
3. Use duplicate checking before inserts
4. Validate result data before saving
5. Log errors safely
6. Avoid saving bad or incomplete results
7. Limit write access to the database
8. Keep automation tokens private

---

# Daily Update Security Rule

The future daily update system should only save verified result data.

It should not save generated numbers from visitors.

Generated numbers are for entertainment and educational use only.

---

# Visitor Safety Wording

The website must clearly state:

1. It is for educational and entertainment purposes only
2. It does not guarantee winning numbers
3. It does not predict lottery results
4. It is not connected to official lottery organizations
5. It does not provide gambling advice
6. It does not provide financial advice

---

# Current Risk Level

## Low Risk

The current website is low risk because:

1. It is static
2. It does not collect visitor accounts
3. It does not collect passwords
4. It does not collect payment details
5. It does not directly process payments
6. It does not have a live database connected yet

## Main Risks

The main risks are:

1. GitHub account compromise
2. Cloudflare account compromise
3. PayPal account compromise
4. Accidental exposure of secret keys later
5. Bad database permissions when Supabase is added later

---

# Security Maintenance Checklist

Review regularly:

1. GitHub login security
2. Cloudflare login security
3. PayPal login security
4. Website files
5. Public links
6. Payment link
7. Database files
8. Future API keys
9. Future Supabase permissions
10. Future automation logs

---

# Production Rule

Before adding Supabase or automation, complete these security steps:

1. Confirm GitHub two-factor authentication
2. Confirm Cloudflare two-factor authentication
3. Confirm PayPal two-factor authentication
4. Confirm no secret keys are in GitHub
5. Confirm website pages still have clear disclaimers
6. Confirm the PayPal support button still links correctly

---

# Current Status

This file is a planning and security checklist file.

It does not control the website.

It should be updated whenever the project adds:

1. Supabase
2. Automation
3. Forms
4. Custom domain
5. New payment links
6. New APIs
7. New admin tools
