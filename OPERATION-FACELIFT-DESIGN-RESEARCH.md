# Operation Facelift Design Research

## Goal

Build Pilot Number into a modern 3D app-style number generator website.

## Design Direction

- Dark entertainment-style app shell
- 3D-looking number/game cards
- Strong hero section
- Generator inside a realistic control panel
- Cleaner wording with shorter contained sections
- Sticky top navigation
- Mobile-first app-style layout
- PWA setup after visual approval

## Technical Design Notes

- Use CSS perspective and transform for 3D depth.
- Use layered shadows for raised cards.
- Use radial and linear gradients for lighting.
- Use backdrop-filter for glass-style panels.
- Use separate preview files before changing the live homepage.

## Protected Areas

Do not touch:

- Generator logic
- Supabase
- Latest-results fallback wording
- Analytics
- Admin dashboard
- Imported history data

## Production Plan

1. Create facelift-preview.html.
2. Create facelift-preview.css.
3. Test preview page.
4. Review visual design.
5. Only after approval, move design to live index.html and style.css.
