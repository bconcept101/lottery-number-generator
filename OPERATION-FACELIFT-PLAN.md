# Operation Facelift Plan

## Goal

Upgrade Pilot Number into a modern app-style website.

## Main Upgrade Areas

- Modern 3D-looking cards and tiles
- Cleaner page layout
- Better wording containment
- Sticky top navigation
- Mobile-friendly app-style experience
- PWA app setup later

## Do Not Touch

- Supabase
- Generator logic
- Lottery history data
- Latest-results fallback wording
- Analytics
- Admin dashboard

## First Frontend Targets

- index.html
- style.css or main CSS file
- script.js only if needed for menu/app behavior
- manifest.json later
- service-worker.js later

## Production Rule

Make small visual upgrades first.

Do not change lottery number logic.

Do not change latest results logic.

Test live site after each upgrade.
