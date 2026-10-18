# Infographics

Three on-brand posters built from the numbers already published on the site, so
they can't quietly drift from what a customer is quoted.

| File | What it answers | Source of the numbers |
|---|---|---|
| `pricing.png` | What a detail costs here, by package, vehicle size and add-on | `/car-detailing-cost-snohomish-county/`, homepage quote calculator |
| `detail-vs-carwash.png` | Drive-thru wash vs. mobile detail, and which one you need today | `/mobile-detailing-vs-car-wash/` |
| `how-long-it-takes.png` | How long each service takes and how the day goes | `/how-long-does-car-detailing-take/`, homepage How It Works |

Each is **2400 × 3200** (a 1200 × 1600 canvas at 2x) — sharp on retina, and the
3:4 ratio drops straight into an Instagram or Facebook portrait post, a GBP
photo, or a printed one-pager.

## Editing

The `.png` is generated, never hand-edited. Change the `.html`, re-render:

```bash
./render.sh                 # all three
./render.sh pricing         # just one
```

`render.sh` needs Chromium and the **Outfit** font installed locally (the HTML
also links Google Fonts, so the pages look right when opened in a browser).
It shoots 150px taller than the canvas and trims the overshoot with `_crop.py`,
because headless Chromium paints the last ~100px as flat background when the
window height exactly matches the document.

**If a price changes on the site, change it here too** — the whole point of
these is that they agree with the quote calculator.

## Design

`_brand.css` holds everything shared: the palette lifted from `index.html`, the
masthead, the range-bar chart, tiles, chips and the footer. Two notes worth
keeping:

- **Chart fills use `--mark` (#C8102E) and `--mark-2` (#B58A37), not the brand
  gold.** Brand gold #C9A24B is too light to sit as a fill beside the red on a
  dark surface; #B58A37 clears colorblind separation against it (deutan ΔE 12.2,
  normal-vision ΔE 21.9). Gold stays #C9A24B wherever it's type or a hairline.
- **Color never carries rank.** Every bar in a chart is one hue on one axis;
  "Most Popular" is a text badge. In the comparison table, each column is named
  in words above its swatch, so nothing depends on telling red from gold.

`.stack` hands leftover vertical space out evenly between sections, so a poster
that gains or loses a line re-balances itself instead of leaving a hole above
the footer.

## Using them on the site

```html
<img src="/images/infographics/pricing.png"
     alt="Mobile detailing prices in Snohomish County: exterior $160-240, interior $200-280, full detail $299-379"
     width="1200" height="1600" loading="lazy">
```

Write the alt text out in full like that — the numbers in the image are
invisible to Google and to a screen reader otherwise.
