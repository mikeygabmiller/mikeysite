# Work shirts (black)

## Final design (chosen)

| File | Print size | Where |
|---|---|---|
| `back-plate-12in-FINAL.png` | 12 in wide x 13.4 in tall | full back |
| `front-chest-4in.png` | 4 in wide | left chest |
| `mockup-FINAL-front-back.png` | preview only | |
| `canva-back-12in.pdf`, `canva-chest-4in.pdf` | 12 x 13.39 in, 4 x 1.22 in | editable copies for Canva |

Back: logo, a redrawn Washington plate reading MIKEYS in a chrome frame
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

## First version (logo only)

Print files for black shirts, built from `../logo.svg`. Transparent PNG, 300 DPI.

| File | Print size | Where |
|---|---|---|
| `front-chest-4in.png` | 4 in wide | left chest |
| `back-12in.png` | 12 in wide | full back: logo, (425) 600-7897, mikeysdetailing.com |

The `-preview-on-black.png` files are for looking at, not for the printer.

Two ink colors plus white: red `#E31924` and white. The logo's white outline is
thickened in both files so it holds up at print size (the chest one most).
Text is Outfit, from `../../fonts/`.
