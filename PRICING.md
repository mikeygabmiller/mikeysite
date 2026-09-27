# Pricing

The one place that says what Mikey charges, why, and how to change it without
leaving an old number somewhere a customer can find it. Not served
(`_config.yml` excludes it).

## The price book (since 2026-09-27)

| Service | Sedan / compact | SUV / pickup | Van / 3-row |
|---|---|---|---|
| Exterior Detail | **$199** | $239 | $279 |
| Interior Detail | **$249** | $289 | $329 |
| Full Detail | **$369** | $409 | $449 |

A quote is **base + size step + condition + add-ons**:

- **Size step:** +$0 sedan, **+$40** SUV or pickup, **+$80** van or 3-row.
  These are the calculator's own three buttons ("SUV / Truck: crossover /
  pickup" and "Van / XL: minivan / 3-row"), so the pages use the same split.
- **Condition:** +$0 Pretty Clean, +$30 Needs Work, +$60 War Zone.
- **Add-ons:** carpet shampoo $20, exterior polish $30, ceramic wax $20,
  RainX $10.

The published ranges ($199–$279, $249–$329, $369–$449) are base plus size
only. Condition and add-ons sit on top, which is why the pages say "depending
on vehicle size and condition". Full Detail is $79 less than booking Interior
and Exterior separately, and the calculator says so.

### Where the numbers live

| Place | What |
|---|---|
| `index.html`, `var PRICE` and the `data-role="vehicle"` buttons | the quote calculator, the thing that actually quotes |
| `index.html`, `#allservices` `SVC` / `SIZE` | the "what do you need?" chooser's ballpark |
| every page's JSON-LD | `priceRange`, the `#business` OfferCatalog, per-page `Service` offers |
| every page's visible copy | pills, FAQ answers (and their JSON-LD twins), meta descriptions |
| `llms.txt` | what AI assistants quote |
| `tools/check-site.py`, `PRICE_BOOK` | the gate that checks all of the above |
| `tools/build-entity-graph.py` | the schema generator, kept in step so a rerun can't bring old prices back |
| `social/tools/posts.cjs`, `render.cjs` | posts (they say "from $369", never per-size) |
| `print/tools/build-door-hanger.cjs`, `build-postcard.cjs` | print pieces |
| `outreach/FLEET-EMAILS.md` | fleet emails and the fleet-price floor math |

## Why the prices went up (2026-09-27)

Mikey's call: he's booking more than he can clean and is about to spend real
money on advertising. The goal is **fewer cars, each paying more**, not more
cars.

- The average job went up about 23%. At that, he could lose 1 booking in 5
  and still earn the same for fewer hours. Since the week was already full,
  he's more likely to lose none and just fill the slots with people happy to
  pay it.
- Prices went up **before** the ads and the postcard, so nobody is paid for
  at the old price and then sees a new one when they come back.
- An ad that costs $50 per booked job was 17% of a $299 detail and is 14% of
  a $369 one.

The same change fixed a mismatch that had been on hold since 2026-09-25: the
calculator charged +$20 / +$40 for size while the pages promised +$40 / +$80,
and the homepage chooser quoted a $130 / $160 / $260 ballpark, below even
the old prices. A truck owner read "$379" on a city page and got $319 from the
calculator. Now all three agree.

**When to look again:** if the week is still full most weeks three months
after the ads start, that's the signal for the next raise. If it drops below
about 8 cars a week, don't cut prices; look at the ads and the quote-to-book
rate first.

## Old prices that are still honored

A customer holding something with an old price on it gets that price:

- **Door hangers printed before 2026-09-27** say "Full detail from $299" and
  the old from-prices. Honor them through **December 31, 2026**, the end of
  the Rain-Ready window already printed on them. The print files in
  `print/door-hanger/print-files/` are rebuilt at the new prices, so any new
  order is right.
- **Quotes texted before 2026-09-27.** The auto-text says "That price is held
  for 30 days", so honor it until 30 days after the text (the last ones run
  out about October 27).
- **Rain-Ready post (B07).** If it went up saying "from $299" before the
  re-render, honor $299 for anyone who books from it, through its window.

## The other price lists

Decided by Mikey on 2026-09-27 unless marked open:

- **Paint correction: from $400.** 1-Step $400+, 2-Step $650+, Multi-Stage
  $900+ (up to about $1,200), quoted per car. The Snohomish, Lake Stevens and
  Mill Creek pages used to sell a "Polish" tier at $300+ with different
  tiers; they now match `paint-correction-snohomish-county/`. Worth knowing: a
  one-step takes 6–8 hours, so $400 earns $50–$67 an hour, less than a Full
  Detail. That's the next number to look at.
- **Clean Club: $125 a visit, kept.** Members were promised a locked price,
  and recurring visits are guaranteed income. It is now 63% of an exterior
  detail (was 78%), so it's the cheapest slot on the calendar; if the week is
  still over-full after the raise, this is where to look.
- **Interior packages** on the Lake Stevens and Mill Creek interior pages:
  Refresh $249+, Standard $289+, **Deep Clean $399+** (set above a sedan Full
  Detail on purpose: it's the heaviest interior job). The **truck page**:
  Exterior $239+, Interior $289+, Full $409+ (the SUV / pickup tier).
- **Open: ceramic coating, from $500.** Tiered and quoted per car. Probably
  low for a 5.0-rated detailer; set it once the hours and product cost per
  tier are written down.
- **Pet hair removal:** $50–$80 as an add-on, $120–$220 on its own. Unchanged.
- **Mobile auto maintenance** ($59–$149) is a separate price list. Unchanged.

## Outside the repo (Mikey does these)

The site can't change these, and AI search drops a business whose prices
disagree across sources:

- [ ] Google Business Profile: every service's price
- [ ] Facebook page services and any pinned post with a price
- [ ] Yelp, Nextdoor, or any directory listing that shows a price
- [ ] Saved text replies or templates on the phone
- [ ] Anything already ordered at the printer with the old prices

## Changing prices next time

1. Decide the book: base prices, size step, and whether condition moves.
2. Change `PRICE_BOOK` / `SIZE_STEPS` in `tools/check-site.py`, and add every
   price that is going away to `RETIRED`. Run it: it now fails everywhere the
   old prices are, which is the to-do list.
3. Change the calculator (`var PRICE`, the vehicle `data-value`s, the service
   cards' `data-value`s, the "Save $X" line), the `#allservices` chooser, then
   every page, `llms.txt`, and `tools/build-entity-graph.py`.
4. Change the facts table in `CLAUDE.md` and the book at the top of this file.
5. `npm run render` in `social/tools`; `npm run hanger`, `OFFER=0 npm run
   hanger` and `npm run postcard` in `print/tools`. Look at the previews.
6. Update `outreach/FLEET-EMAILS.md`, including the per-hour floor math.
7. `python3 tools/check-site.py` passes (apart from the known `polish-test/`
   pair), merge, and confirm the live site shows the new numbers.
8. Write down here what is honored at the old price and until when.
9. Do the "outside the repo" list the same day.

## History

| Date | Exterior | Interior | Full | Size step | Why |
|---|---|---|---|---|---|
| to 2026-09-27 | $160–$240 | $200–$280 | $299–$379 | pages +$40/+$80, calculator +$20/+$40 | launch prices |
| 2026-09-27 | $199–$279 | $249–$329 | $369–$449 | +$40/+$80 everywhere | booked full, going all in on ads |
| 2026-09-27 | same | same | same | same | paint correction unified at from $400; Deep Clean to $399+; Clean Club kept at $125 |
