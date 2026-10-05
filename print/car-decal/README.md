# Car window decal

The decal for Mikey's own car: MIKEY'S, MOBILE DETAILING and the number, white
on clear so it reads on glass. Made 2026-10-05, when Mikey asked for a design
to put on his side windows with a Temu UV DTF sticker order. Not served
(`_config.yml` excludes `print/`).

A decal is one more copy of the facts table in the repo's `CLAUDE.md`: the
phone number on it has to match everywhere else. Like the sign and the card it
carries **no prices, no offer and no review count**, because it stays on the
glass for years.

## The file

`print-files/window-decal-12in.png` is the upload. It's square, transparent,
3600 px (12 in at 300 dpi, still fine at 24 in for something read from feet
away). The design sits across the middle with clear above and below, because
the sticker maker's upload frame is square: nothing gets cropped, and clear
prints nothing.

- **Upload the PNG.** A JPEG or a screenshot has no clear background, so the
  clear part prints as a white or black box. In the maker's preview the space
  around the letters should show their background, not a box.
- **Pick the biggest size they offer.** The decal reads about as far as its
  letters are tall:

| Decal width | MOBILE DETAILING reads to | The number reads to |
|---|---|---|
| 12 in (the design is 11.3 x 6.4 in) | about 26 ft | about 41 ft |
| 8 in | about 17 ft | about 27 ft |
| 6 in | about 13 ft | about 20 ft |

Those are 20/40 eyes in the best case, from `print/tools/sign-legibility.py`'s
model run on these exact faces (18.3 ft per inch of letter height for the
words, 19.5 for the number). Glass reflects the sky, so real life is a bit
less. Across a street from a driveway is 30 to 50 ft, which is why under 8 in
isn't worth putting on a car.

## Why it looks like that

- **The yard sign's rules, not the logo's.** Someone reads it from the sidewalk
  while Mikey works in a driveway, or from the next lane. What it is and the
  number are big; MIKEY'S is the brand mark. The logo's own MOBILE DETAILING
  (letter-spaced, between thin red rules) is too small to read at a distance
  and its thin rules are the first thing a transfer loses, so the line is
  reset in Fira.
- **Fira Sans Extra Condensed 700, stretched tall**, the sign's face, because
  its 0, 6, 8 and 9 stay open at a distance. 700 rather than 800 because white
  on dark glass glows into the ground (the sign's number is 700 for the same
  reason).
- **White, with a thin black keyline.** Behind a car window is tint or the
  shadow inside the car, so white reads. The keyline (1 mm) keeps it readable
  on clear glass over light seats and vanishes on tint. MIKEY'S is the
  vector wordmark from `social/brand/logo-final/`: red, white outline, sparkle.
- **No truck.** At window size it would shrink the number for a picture that
  reads as a red blob from the street. A rear-window version with the truck is
  easy to add if Mikey wants one.
- **No QR and no website.** Nobody scans a car, and "Mikey's detailing" finds
  the website.

## Where it goes

On the **outside** of the glass (a printed transfer seen through the glass
from inside shows its white backing, and aftermarket tint is on the inside).

- **Never the front door windows.** RCW 46.37.410(2): no sign or nontransparent
  material on the windshield, side or rear windows "which obstructs the
  driver's clear view". Those are the windows he checks his mirrors through.
- **Best: the back window**, low, out of the rear wiper's path (a wiper blade
  over it ruins it). It doesn't roll down, and the car stopped behind him at a
  light has the longest look of anyone.
- **Rear door windows, low**, only if those windows stay up. Every time a
  window goes down, the rubber strip at the bottom of the window opening drags
  over the decal, and that's what lifts edges.

## The honest part about UV DTF

UV DTF (the Temu kind) is made for tumblers, bottles and phone cases. Its
sellers say 1 to 3 years on a car in the sun, hand washed, and that pressure
washing wears the adhesive. On a detailer's car a chipped decal is an ad
against him, so treat a UV DTF order as cheap and short-term. For years, the
same PNG goes to a vinyl printer as a **printed, laminated, contour-cut window
decal** (or white cut-vinyl lettering, which is one colour, so MIKEY'S would
come out white).

## Putting it on

1. **Strip that spot of glass.** Mikey's own glass likely has a sealant or
   RainX on it, and nothing sticks to that. Polish or IPA-wipe the spot until
   water sheets off instead of beading, then dry it.
2. Mild and dry: in the garage or on a mild day, not cold glass and not hot sun.
3. Peel the backing slowly, line it up, press from the middle out with a card
   in a microfibre, then rub every letter hard for a minute.
4. Peel the clear top film back slowly, low and flat against itself. If a
   letter starts lifting with it, lay it back down and rub again.
5. Nothing wet for 24 hours. After that, no pressure washer aimed at its
   edges and no ice scraper over it.

Order one more than the windows need: the first one is practice.

## Rebuilding it

    cd print/tools && npm install && npm run decal
    WIDTH=10 npm run decal      # another width, in inches

The generator fails on a price, an offer, a review count, "we", an em dash, a
town he doesn't serve, a different phone number, or ink in the clear margin.
Look at `preview.png` after any change.
