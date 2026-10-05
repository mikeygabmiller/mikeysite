# Car window decal

The decal for Mikey's own car: MIKEY'S, MOBILE DETAILING and the number, white
on clear so it reads on glass. Made 2026-10-05, when Mikey asked for a design
to put on his side windows with a Temu UV DTF sticker order, plus a cut file
and a hand-cut template for doing it himself in vinyl. Not served
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

**Mikey's car is a 2005 Honda Accord EX** (2026-10-05; sedan or coupe not
confirmed yet).

- **Sedan:** the back window has no wiper, but the third brake light sits
  inside the glass at the bottom middle, so the decal goes in a lower corner.
  The rear door glass rolls down; the small fixed glass behind it is too small
  for this decal.
- **Coupe:** no rear doors, so the back window, or the fixed window behind
  each door if 12 x 7 in of it is clear.
- The factory glass isn't privacy glass, so unless it's been tinted the decal
  sits on near-clear glass. White is still right (the inside of a car is
  darker than daylight) and the keyline helps. Measure 12 x 7 in of glass
  clear of the black dotted border first: nothing sticks well over the dots.
- The back glass leans back, so from straight behind the letters look shorter
  than they are. The car stopped right behind him is close enough; from far
  back it reads less far than the table above.

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

## Doing it yourself: cut vinyl

Mikey asked for a DIY way (2026-10-05). Cut vinyl is what sign shops letter
windows with, and it outlasts UV DTF: ORACAL 651 is rated up to 6 years
outdoors in white or black (4 in colours). It's one colour a sheet, so the DIY
decal is all white: same layout, MIKEY'S as plain letters (its white outline
in one colour would melt the letters together, and the sparkle is too fine to
weed), no keyline.

- **With a cutting machine:** `print-files/window-decal-cut.svg`, outlines
  traced from the render so no fonts are needed. Cricut Design Space opens it;
  so does Silhouette Studio Designer Edition (the free Basic edition can't open
  SVG). It's drawn black so it shows on screen; cut it from white. Check the
  width reads 11.28 in after upload; up to 11.5 in fits a 12 x 12 mat.
- **No machine:** `print-files/hand-cut-template.pdf`, the same letters 10 in
  wide on Letter paper turned sideways. Print at Actual size and check the
  10 in bar, tape it over the vinyl, and cut along the letters through the
  paper and the vinyl but not the backing. An hour or two with fresh blades.
  At 10 in the number reads to about 36 ft and MOBILE DETAILING about 23 ft.
- **What to buy:** white ORACAL 651 (a 12 in roll), clear transfer tape, a
  squeegee or an old card; for cutting by hand, a hobby knife with spare #11
  blades and a cutting mat or thick cardboard.
- **Not worth it:** inkjet printable vinyl (a home printer can't print white,
  and the ink fades in the sun) and window markers or paint pens (they look
  hand-done, and markers wash off).

Putting vinyl on is the hinge method, not the transfer steps above:

1. Strip the spot of glass the same way (step 1 above).
2. Lay the decal (backing, letters, transfer tape) where it goes and tape a
   strip of masking tape across its middle, so it hinges there.
3. Flip one half up, peel the backing off that half and cut it away, then
   squeegee that half down from the hinge out. Pull the hinge tape and do the
   other half the same way.
4. Peel the transfer tape back slowly, flat against itself. If a letter
   comes up with it, lay it back down and rub it.
5. Give it a couple of days before it gets washed.

## Rebuilding it

    cd print/tools && npm install && npm run decal
    WIDTH=10 npm run decal      # another width, in inches

One run writes all four files: the PNG, `preview.png`, the cut SVG and the
hand-cut template. The generator fails on a price, an offer, a review count,
"we", an em dash, a town he doesn't serve, a different phone number, ink in
the clear margin, or a template that spills onto a second page. Look at
`preview.png` and the template after any change.
