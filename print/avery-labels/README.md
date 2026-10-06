# Avery 5821 labels

A sheet of eight 2.5 x 4 in labels (Avery 5821 TrueBlock shipping labels,
80 labels / 10 sheets a pack), each with the logo, "Call or text", the phone
number and the website. Made 2026-10-06 at Mikey's request, to have a shop
print them on packs he bought. Not served (`_config.yml` excludes `print/`).

A label is one more copy of the facts table in the repo's `CLAUDE.md`: the
phone number and website on it have to match everywhere else. Like the card
and the decal it carries **no prices, no offer and no review count**, because
a pack of labels outlives all three.

## The files (`print-files/`)

| File | What it's for |
|---|---|
| `avery-5821-PRINT-THIS.pdf` | the one that goes on the label sheets |
| `avery-5821-TEST-on-plain-paper.pdf` | same sheet with the label outlines drawn on, for one plain-paper test first |
| `one-label-4x2.5in-300dpi.png` | a single label, if the shop would rather use Avery Design & Print (avery.com/templates/5821) and fill all 8 there |

The same three files with `-BLACK` in the name are the black version (white
type, the logo made for dark backgrounds), from `DARK=1 npm run labels`.
`preview.png` and `preview-black.png` are the test sheets, for looking at.

**The black version and the paper edge.** It prints black past every label
edge so a page that lands off still has black there. But the outer edge of
each label is only 1/6 in from the paper's edge, and most printers can't
print that close, so expect a thin white sliver down the outside edge of
the left and right columns. The white version has no such problem.

## Printing it

1. **Actual size / 100%.** Not "Fit to page" or "Shrink to fit": that shrinks
   the page a few percent and the bottom row lands off its labels.
2. **One test on plain paper first** with the TEST file. Lay it on a label
   sheet, hold both up to a light: every label's type should sit inside its
   outline. Then print the PRINT-THIS file on the labels.
3. **Paper type: Labels** (or heavy paper) in the print dialog, one sheet at
   a time if the printer jams. 5821 is made for both inkjet and laser.
4. **Not at a post office.** USPS counters don't print customer files. The
   UPS Store, FedEx Office, Staples and Office Depot do; ask first whether
   they'll run label sheets you bring in, because some stores won't.

## Why it looks like that

- **Avery's own geometry.** Two columns of four, label 4 x 2.5 in, top margin
  0.5 in, 1/6 in between columns and at each side, no gap between rows,
  1/8 in corner radius. Measured from the template Avery publishes for 5821
  (their PDF `U-1496-01`), and the generator fails if a label moves.
- **White to the edge, everything 0.18 in inside.** A shop printer can land a
  page 1/16 in or more off. With no colour at the edges and the type well
  inside, a drift that size shows nothing.
- **The side-by-side logo across the top**, so the number underneath gets
  the full width: 27 pt Outfit 800, the business card's phone face.

## Changing it

Edit `print/tools/build-avery-labels.cjs`, then in `print/tools`:

    npm install && npm run labels && DARK=1 npm run labels

It fails on a price, an offer, the review count, an em dash, a business
"we", licensed/insured, a town he doesn't serve, the old phone number, a
label that isn't where Avery puts it, anything closer than 0.18 in to a label
edge, or a PDF that isn't one letter page. Look at `preview.png` anyway.
