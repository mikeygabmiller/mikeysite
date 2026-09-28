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

These two still carry the logo retired on 2026-09-28. Use the final design above.

Print files for black shirts, built from `../logo.svg`. Transparent PNG, 300 DPI.

| File | Print size | Where |
|---|---|---|
| `front-chest-4in.png` | 4 in wide | left chest |
| `back-12in.png` | 12 in wide | full back: logo, (425) 600-7897, mikeysdetailing.com |

The `-preview-on-black.png` files are for looking at, not for the printer.

Two ink colors plus white: red `#E31924` and white. The logo's white outline is
thickened in both files so it holds up at print size (the chest one most).
Text is Outfit, from `../../fonts/`.
