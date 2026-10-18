# Saturn SL — Race Livery

A realistic visualization and buildable spec for putting a NASCAR-sourced race livery on a
**1996 Saturn SL**: slate-gray body, satin-black roof/hood/trunk (the steel panels where the
30-year-old clearcoat fails first), red vinyl accents on black only, white numbers, and
functional safety markings. The flaw fix and the design are the same job.

## Files

| File | What it is | Open in |
|---|---|---|
| **`saturn-livery-render.html`** | The visualization — realistic driver-side elevation + top plan, on studio stages, with palette, congruency rules, and the locked-in decisions. Start here. | Browser |
| **`saturn-livery-plan.html`** | Materials buy list (≈ **$242**), phased order of operations, and gut-checks. | Browser |
| **`saturn-livery-placement.html`** | Interactive placement map — 14 zones. Tap a number on the car or a card and they light up together. | Browser |
| **`livery-large-decals.svg`** | **Sign-shop** cut sheet (anything over 12″): door + roof + rear numbers, roundel, wordmark, red-band lengths. | Browser / vinyl cutter |
| **`livery-small-decals.svg`** | **Cricut** cut sheet (up to 11.5″): tow arrows, battery cut-off, marshal marks, stencil labels, contingency columns, spares. | Browser / Cricut |

## Palette

| Role | Color | Hex |
|---|---|---|
| Body — doors & fenders (polymer, stays gray) | Slate gray | `#6E7580` |
| Roof · hood · trunk · rockers — paint | Satin black | `#1B1B1B` |
| Accent bands + markings — vinyl, on black only | Race red | `#DC2626` |
| Door / roof numbers | White | `#F5F6F7` |

## Rules that keep it clean

1. **Red only on black** — never on bare gray (too close in luminance, goes muddy).
2. **Paint the big shapes, vinyl the small stuff** — vinyl over failing clear peels.
3. **Chunky bands only** — each red band ≈ ⅓ the height of its black carrier. No pinstripes.
4. **Rockers are painted, not lined** — save the bed-liner for arches & the pinch weld.
5. **Function over decoration** — the number and the safety marks are what make it read as a race car.

The number placeholder is **96** (the model year). Swap it anywhere for whatever you want to run.
