# Car window decal

The decal for Mikey's own car: MIKEY'S, MOBILE DETAILING, the number and the
website, white on clear so it reads on glass. Made 2026-10-05, when Mikey asked for a design
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

| Decal width | MOBILE DETAILING reads to | The number reads to | The website reads to |
|---|---|---|---|
| 12 in (the design is 11.3 x 8.2 in) | about 26 ft | about 41 ft | about 17 ft |
| 8 in | about 17 ft | about 27 ft | about 11 ft |
| 6 in | about 13 ft | about 20 ft | about 8 ft |

Those are 20/40 eyes in the best case, from `print/tools/sign-legibility.py`'s
model run on these exact faces (18.3 ft per inch of letter height for the
words, 19.5 for the number, 23.2 per inch of x-height for the website's
lower case). Glass reflects the sky, so real life is a bit
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
- **No QR:** nobody scans a car. **The website went on at Mikey's request**
  (2026-10-05). A parked car gets read by people walking past, and the site
  gives them a price without a phone call. It's the smallest line, three
  quarters of the width and lower case like the business card, so it sits
  under the number instead of competing with it. It added 1.8 in to the
  height.

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
  each door if 12 x 9 in of it is clear.
- The factory glass isn't privacy glass, so unless it's been tinted the decal
  sits on near-clear glass. White is still right (the inside of a car is
  darker than daylight) and the keyline helps. Measure 12 x 9 in of glass
  clear of the black dotted border first: nothing sticks well over the dots.
- The back glass leans back, so from straight behind the letters look shorter
  than they are. The car stopped right behind him is close enough; from far
  back it reads less far than the table above.

## The side windows

Mikey wanted something simple on the side glass too (2026-10-07), after
putting the cut file above in a Signs.com cart for the back window.
`print-files/side-window-cut.svg` is that: MOBILE DETAILING over the number,
each line the full width, white cut vinyl. MIKEY'S and the website stay on the
back window, because on a short strip of side glass they'd shrink the number.
It's 13 in wide by 5 in tall, sized to the 13.2 x 5.5 in the first plan gave
for the rear door glass, so measure that glass before ordering.

| Width | MOBILE DETAILING reads to | The number reads to |
|---|---|---|
| 13 in (5 in tall) | about 30 ft | about 47 ft |

- **Rear door glass only, never the front door windows** (the law above, and
  they're the windows he checks his mirrors through).
- **The rear windows roll down,** and the rubber strip at the bottom of the
  window opening drags over whatever goes down past it. Roll one all the way
  down first: any glass still showing above the door never passes the strip,
  so a decal there lasts. If less than 5 in shows, keep those windows up (the
  window lock button on the driver's door stops the back switches).
- **Ordering: all three on one sheet.** `print-files/one-sheet-cut.svg` is
  the back window decal and both side decals stacked, 1 in apart, 13 x 20.2
  in. Signs.com prices cut lettering by the design's overall size with a base
  charge on every item, so on 2026-10-07 (2 day production) one sheet was
  $28.38 against $42.15 as separate items ($16.19 back, $25.96 for two
  sides). Upload it as vinyl lettering, 13 in wide (the height comes out
  about 20.2 in), white, standard (it goes on the outside), quantity 1, then
  cut the three apart with scissors along the gaps before putting them on.
  It's drawn black only so it shows on screen.
- Another width: `cd print/tools && WIDTH=12 npm run side-decal`. It writes the
  SVG, the one sheet and `preview-side.png`, and fails on the same things the main decal
  does: a price, an offer, a review count, "we", an em dash, a different phone
  number, or ink touching the edge.

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
- **No machine:** `print-files/hand-cut-template.pdf`. Page 1 is the same
  letters on Letter paper turned sideways, as wide as fits inside a home
  printer's margins (9 in with the website line); page 2 is the steps. Print
  at Actual size and check the bar, tape it over the vinyl, and cut along the
  letters through the paper and the vinyl but not the backing. Two hours or
  so with fresh blades. At 9 in the number reads to about 33 ft, MOBILE
  DETAILING about 21 ft, the website about 13 ft.
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
the clear margin, a different website, a website line that grows past
MOBILE DETAILING, or a template page that runs off the paper. Look at
`preview.png` and the template after any change.
