# Work shirts (black)

## Back: DIRTY CAR? (chosen 2026-09-28)

| File | Print size | Where |
|---|---|---|
| `back-dirty-car-12in.png` | 12 in wide x 12.1 in tall, 300 dpi, transparent | full back |
| `front-chest-4in.png` | 4 in wide | left chest |
| `mockup-dirty-car-front-back.png`, `back-dirty-car-preview-on-black.png` | preview only | |

Mikey's layout: DIRTY CAR? (Bebas Neue, white), "I'll clean it in your
driveway." (Outfit, slanted), the phone in gold, the Google G with five gold
stars and 5.0, then the logo. Generator: `source/build-dirty-car-shirt.cjs`.
The background is left transparent on purpose: on a black shirt the dark panels
are the shirt, and DTF would print them as a visible box. The G is in Google's
four colours, so this is a full-colour DTF/DTG print, not a two-ink screen print.
If the rating or the phone changes, this shirt is one more copy of the facts.

## Ordering the transfers (DTF) and pressing them

Worked out 2026-10-08, when Mikey asked where to get DTF fast and cheap for a
heat press he might get access to. DTF transfers are for fabric only; the car
decal is a different product (UV DTF or cut vinyl, `print/car-decal/`).

**The file is ready.** `gang-sheet/gang-sheet-4-shirts-22x48.png` is one 22 x
48 in sheet holding 4 DIRTY CAR? backs and 6 chest logos (one per shirt, one to
practice on, one spare), at real print size, 300 dpi, transparent, not
mirrored. Each shirt takes one foot of sheet because the backs are cropped to
their ink (11.0 x 11.3 in; the 12 in PNG has clear padding). Other counts:
`python3 source/build-gang-sheet.py 2 3 5` writes the 2, 3 and 5 shirt sheets
at 22x24, 22x36 and 22x60, the smallest size that fits.

**Printer: Tuxedo Print, Seattle** (tuxedoprint.com), product **DTF Gang Sheet
- Upload a Print Ready File**, size to match the file name. Prices are from its
cart on 2026-10-08, shipped to 98290:

| Sheet | Shirts | Price | With `first40` (40% off a first order, checked in the cart) |
|---|---|---|---|
| 22 x 24 | 2 | $12.99 | $7.79 |
| 22 x 36 | 3 | $18.99 | $11.39 |
| 22 x 48 | 4 | $24.99 | $14.99 |

Shipping: Standard $6.90, Priority Mail $13.51 (quoted to arrive the next
day). Free over $99. Orders in before **11 AM** ship the same day (Mon to
Fri), and Seattle pickup is free (weekdays 9 to 4, closed weekends; their
contact page has the address). No minimum, and they reprint free if a print is
bad.

Why them: closest (Seattle, so ground is a day), cheapest with the first-order
code, and a pickup option in a pinch. Four shirts, shipped to 98290, that day:

| Printer | Sheet | Sheet price | Shipping | Total |
|---|---|---|---|---|
| Tuxedo Print (Seattle) | 22x48 | $24.99 ($14.99 with `first40`) | $6.90 standard | $31.89 ($21.89) |
| DTF Dallas | 22x50 | $20.50 | $9.95 UPS Ground, 1 to 3 days | $30.45 |
| DTF West Coast | 22x50 | $22.50 | $10.00 2nd Day Air | $32.50 |
| Ninja Transfers | 5 ft | $49.99 | $6.99 ground, 5 to 7 days | $56.98 |

Dallas and West Coast sell in 10 in steps, so their sheet would need a 22x50
version of the file (change `LENGTHS_IN` in the script). Before tax.

**Shirts:** black, 100% cotton or a cotton/poly blend. Not 100% polyester or
"performance": black poly dye bleeds into the white ink.

**Press:** the back is 11.0 x 11.3 in, so it needs a platen at least 12 in on
its short side (15 x 15 is the common size). A 9 x 9 press or an EasyPress
does it in two overlapping presses, and that's where prints fail. Tuxedo's own
settings (their "How to Press DTF Transfers" page), which beat any general
chart because it's their film and glue:

1. Clean dry shirt. A 2 to 5 second press first if it's damp or creased.
2. Transfer **printed side down, clear film up.** (Their page says "film-side
   down", which is backwards.)
3. **280 to 295°F, 8 to 10 seconds, medium to firm pressure.**
4. Let it cool **5 to 10 seconds**, then peel the film slowly from a corner.
   If any of the print lifts with it, lay it back, press again, cool longer.
5. Parchment or a Teflon sheet over the print, press again **4 to 5 seconds**.
6. 24 hours before washing. Then inside out, cold, no bleach or softener,
   low dry or hang, never iron on the print.

**Placement** (the usual standard; try the shirt on before pressing):

- **Chest logo:** the wearer's left chest, which is on **your right** with the
  shirt face up on the press. Top edge about 3 in below the collar seam, inner
  edge about 3.5 to 4 in from the middle of the shirt.
- **Back:** centred, top edge about 3 in below the collar seam.
- Press the chest first. When you flip the shirt for the back, put parchment
  under the chest print so it doesn't stick to the bottom pad.

The back prints the phone and "5.0" stars: if the rating or the number
changes, the shirts are out of date, so order a few at a time.

## Alternate back: license plate


| File | Print size | Where |
|---|---|---|
| `back-plate-12in-FINAL.png` | 12 in wide x 13.3 in tall | full back |
| `front-chest-4in.png` | 4 in wide | left chest |
| `mockup-FINAL-front-back.png` | preview only | |
| `canva-back-12in.pdf`, `canva-chest-4in.pdf` | 12 x 13.28 in, 4 x 1.15 in | editable copies for Canva |

Back: the logo (the foam-wash truck and MIKEY'S wordmark since 2026-09-28), a redrawn Washington plate reading MIKEYS in a chrome frame
("SNOHOMISH COUNTY, WA" / "MIKEYSDETAILING.COM"), "I COME TO YOU.",
"You don't pay until you love it.", (425) 600-7897.
Print DTG or DTF (full color, shading); not a screen-print design.
`source/build-plate-shirt.cjs` is the generator (Playwright; fonts from @fontsource,
all OFL). `concepts/` holds the options that were not picked.

In the `canva-` back PDF the three lines under the plate are editable text; the
logo and plate come in as pictures (Canva's import scrambles the plate's text). They
sit on a black page so the white text shows while editing. Send the printer the
transparent PNGs, not a Canva export with that black page: DTF prints the black
as ink, a visible box on the shirt.

## First version (logo only, OLD logo)

`back-12in.png` still carries the logo retired on 2026-09-28. Use the final
design above. (`front-chest-4in.png` was rebuilt with the new logo on
2026-10-01 and is the chest file both backs use; checked 2026-10-08.)

Print files for black shirts, built from `../logo.svg`. Transparent PNG, 300 DPI.

| File | Print size | Where |
|---|---|---|
| `front-chest-4in.png` | 4 in wide | left chest |
| `back-12in.png` | 12 in wide | full back: logo, (425) 600-7897, mikeysdetailing.com |

The `-preview-on-black.png` files are for looking at, not for the printer.

Two ink colors plus white: red `#E31924` and white. The logo's white outline is
thickened in both files so it holds up at print size (the chest one most).
Text is Outfit, from `../../fonts/`.
