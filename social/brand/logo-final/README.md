# Mikey's Mobile Detailing logo (final, 2026-09-28)

Truck with MIKEY'S on the grille and soap foam, over MIKEY'S in Racing Sans One
(red, white outline) and MOBILE DETAILING in Barlow Condensed between red rules.
Red is `#E31924`. No curved type.

## Which file goes where

| Use | File |
|---|---|
| Shirts, door hangers, postcard, stickers, rig decal | `print-pdf/stacked-dark.pdf` (black shirt) or `stacked-light.pdf` (white paper) |
| Canva, Word, anything that takes a picture | `transparent-png/stacked-dark.png` / `stacked-light.png` |
| Website header, email, business card | `transparent-png/horizontal-dark.png` / `horizontal-light.png` |
| Space too small for the truck | `transparent-png/wordmark-dark.png` / `wordmark-light.png` |
| Instagram, Facebook, Google profile picture | `web/profile-picture-logo-1080.png` (or `profile-picture-truck-1080.png`) |
| Browser tab / phone home screen | `web/favicon-32.png`, `web/apple-touch-icon-180.png`, `web/icon-512.png` |
| Email signature | `web/email-signature-400.png` |
| Places that reject transparency | `jpg/` (dark ones on black, light ones on white) |
| Designers and printers who ask for vector | `svg/` |

"dark" = for dark backgrounds (white MOBILE DETAILING). "light" = for white
backgrounds (black MOBILE DETAILING).

## The truck source

`source/truck-full.jpg` is the full-size (1264px) Canva image; `source/truck-cutout.png`
is it with the black background removed. Everything here is built from that,
so at 300 dpi it stays sharp up to about 12 inches wide for the side-by-side
logo and about 5 inches for the stacked one (the truck itself is ~4 inches). To rebuild, from a folder with
Playwright, opentype.js and the @fontsource fonts installed:

    node cutout.cjs truck-full.jpg ready/truck.png 1 && node ready.cjs && node export.cjs <out dir>

## Where it's in use (rolled out 2026-09-28)

- Website: header `/images/logo-header.webp` (a 405x116 copy of `logo-header.png`, which stays as the source and the image fallback), schema logo `/images/logo-square.png`,
  link preview `/images/og-image.jpg`, tab icon `/favicon.ico`.
- `social/brand/logo.svg` (dark backgrounds), `logo-light.svg` (cream/white) and
  `logo-icon.svg` (truck) are what the door hanger, postcard and post renderers
  read. The old ones are kept in `social/brand/old-logo-2025/`.

## Where else

- Shirts carry it too (`shirts/`, back and chest print files and the Canva copies).

## Not yet done

- The grille is still very close to a real Ford Bronco grille. Before a large
  print run, have the truck redrawn with a different grille pattern.
