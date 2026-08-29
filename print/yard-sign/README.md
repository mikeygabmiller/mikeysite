# Yard sign — 24x18, 2-color

Reorder artwork for the outdoor yard signs (replaces order 2505522482).

## Upload these

- `mikeys-yard-sign-24x18.pdf` — vector, exact 24x18in. Use this if the printer accepts PDF.
- `mikeys-yard-sign-24x18.png` — 3600x2700 (150 DPI) fallback.

## Print spec (unchanged from the last order, so pricing stays the same)

| | |
|---|---|
| Size | 24x18 in, square/rectangle |
| Sides | Single sided |
| Imprint | 2 colors — black + red |
| Grommets | None |
| Frame | None |

Red is **C22 M100 Y100 K19** — the same build as the previous order, so new
signs match the ones already out.

## Layout safety

The printer allows up to 1in of trim drift. All black text sits inside
1.26-22.76in horizontally and 1.11-16.87in vertically, so nothing can be
clipped. The red bar is deliberately full bleed: trim shaves it evenly instead
of leaving one white margin visibly fatter than the other.

## Fonts

Matched to the existing sign rather than guessed — rendered candidates were
scored by pixel overlap against the old proof.

- Headline: **Alfa Slab One** (0.985 IoU against the old artwork)
- Everything else: **Anton**

Both are SIL Open Font License, bundled in `fonts/`.

## Regenerating

`sign.html` is the source; type is fitted to the live width by script, so
edits reflow instead of needing manual resizing.

```
python3 render.py sign.html out    # writes out.pdf + out.png
```

Needs `playwright` (Chromium). Change the phone number, the review count, or
the service line in `sign.html` and re-run.
