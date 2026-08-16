# Mikey's Detailing — Transparent Acrylic Business Card

One-sided design for a clear acrylic card (Temu / DD DISPLAY style),
print area 8.55cm × 5.4cm (3.37" × 2.13").

## What to upload
Upload **`mikeys-card-PRINT-transparent.png`** — it has a transparent
background, so the clear (unprinted) areas become the acrylic itself.
Black + brand red ink reads well on clear acrylic.

## Files
- `card.html` — the source design (HTML/CSS + inline SVG emblem)
- `render.mjs` — Playwright/Chromium renderer (~600 DPI output)
- `fonts/Outfit.ttf` — wordmark font (same family as the website)
- `mikeys-card-PRINT-transparent.png` — **upload this one** (2020×1276, transparent)
- `mikeys-card-preview-light.png` — preview on a light surface
- `mikeys-card-preview-dark.png` — preview on a dark surface

## Re-render after edits
```
node render.mjs
```
(Uses the bundled Chromium at /opt/pw-browsers.)

## Brand info baked in
- Mikey's Mobile Detailing — Snohomish County, WA
- (425) 600-7897 · mikeysdetailing.com · book@mikeysdetailing.com
- 5.0 ★ · 38 Google reviews
- Colors: red #C8102E, gold #C9A24B, ink #0a0a0a
