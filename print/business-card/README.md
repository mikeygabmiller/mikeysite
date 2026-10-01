# Business card (die-cut)

A 3.5 x 2 in card that isn't a rectangle: the truck's roof and mirrors stick up
out of the top edge, cut to the truck's outline. It still fits a wallet slot
and a card holder, because the whole shape stays inside the standard 3.5 x 2
box. Not served (`_config.yml` excludes `print/`).

![front and back, as cut](mockup.png)

## Why it's built this way

Most of these go to strangers, so the card's job is to get Mikey a text.

- **The shape is the logo.** A plain rectangle with a truck printed on it looks
  like every other card. A card shaped like the truck gets noticed and gets
  kept, and people show it to each other. It's the one thing a custom die gets
  you, so the design uses it as the main idea and doesn't stop at rounded
  corners.
- **The back is how to reach him.** The phone number big, the site, and a QR
  straight to the quote calculator. Plus the twelve towns, so a stranger can
  tell at a glance that he comes to them.
- **The bump on the back says 5.0 on Google.** On the front it's the truck. On
  the back the same shape is solid red with the rating in it.

Changed on 2026-10-01 at Mikey's call. The first version's back was a glovebox
cheat sheet with a "Next detail ____" line, which only made sense for handing
over after a job. "300+ cars" also came off the front because it didn't say
anything to the person holding it.

## What's on it, and what's left off on purpose

Front: the truck, MIKEY'S / MOBILE DETAILING, "I come to you.", Snohomish
County, WA, "Text or call" (425) 600-7897, mikeysdetailing.com.

Back: "Text or call" (425) 600-7897, mikeysdetailing.com, "I come to you in"
and the twelve towns, a QR to the quote calculator ("See your price in 60
seconds"), 5.0 on Google.

Left off, and the generator fails if they come back:

| Left off | Why |
|---|---|
| Prices | 500 cards sit in wallets and drawers for years and can't follow a price change. Same rule as the yard sign. |
| The Rain-Ready offer | It ends December 31, 2026. These cards last longer than that. |
| "41 reviews" | The count will grow; the card won't. "5.0 on Google" stays true. |
| Licensed / insured | Still unconfirmed (CLAUDE.md). |
| Lynnwood, Edmonds | He doesn't serve them. Only the twelve towns. |

The QR goes to `https://mikeysdetailing.com/?utm_source=card&utm_medium=print#booking`.
In Google Analytics that shows up as **card / print**, apart from the hangers,
postcards and signs.

## The files

Rebuild with `cd print/tools && npm install && npm run card`.

| File | What it is |
|---|---|
| `print-files/3.5x2/front.pdf` | front art, 3.75 x 2.25 in (3.5 x 2 trim + 0.125 in bleed) |
| `print-files/3.5x2/back.pdf` | back art, same size. **Drawn as seen from the back**, so the truck bump is at the top right |
| `print-files/3.5x2/dieline.pdf` | the cut line alone, as a magenta 0.5 pt stroke, positioned on the same 3.75 x 2.25 page as the front |
| `print-files/3.5x2/dieline-front.svg`, `dieline-back.svg` | the same cut line as vector SVG (one closed path), for a printer that wants vector |
| `proof-front.png`, `proof-back.png` | the art with the cut line drawn on. Compare these with the printer's proof |
| `preview-*.png`, `mockup.png` | what the cut card looks like |

How the cut line is made: the truck from the logo is grown by 0.06 in, merged
with the rounded card body, and smoothed so no inside corner is tighter than
0.08 in (steel rule dies can't follow sharp inside corners, and the soap bubbles
would be impossible to cut). Move or resize the truck in the generator and the
cut line follows; nobody redraws it by hand.

The generator fails if:

- any of the copy rules above is broken, or an em dash shows up
- any type sits within 0.1 in of the cut (cutting drifts about 1/32 in)
- a contact line or the town list runs past its column
- the rating spills off the red bump onto the cream
- the QR stops decoding to the right link

The front is black all the way into the bleed, and the back is cream, with red
only behind the bump, so a cut that drifts slightly shows nothing.

## Ordering

Short version in `print/ORDERING.md`. What to ask for:

- **Custom die-cut business cards**, 3.5 x 2 in, full color both sides, with
  the dieline above as the custom shape. Some printers only offer preset shapes
  (rounded corners, leaf, circle). That isn't this. It has to be a printer that
  takes **your own die line**.
- **Stock: 16 pt or thicker,** matte or soft-touch. Thick is what makes a card
  feel worth keeping.
- **Check the proof:** the cut line follows the truck's roof and mirrors, the
  back's red bump is at the **top right** (it's the mirror image of the front),
  and nothing important is near the edge.
- **First run:** 500 is a fine first order for cards (Mikey's number,
  2026-10-01). A custom die usually adds a one-time setup charge; reorders on
  the same die are cheaper. Ask whether they keep the die on file.

## Before printing: one thing Mikey should decide

**The grille.** `social/brand/logo-final/README.md` says the truck's grille is
still very close to a real Ford Bronco's and should be redrawn before a large
print run. On this card the truck is the whole shape, so it's the most visible
place the grille will ever be. 500 cards is a small run, so this is his call,
but he should make it knowing that.
