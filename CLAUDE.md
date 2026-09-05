# Mikey's Mobile Detailing — working notes

Static site for a one-man mobile detailing business in Snohomish, WA. Deployed
from this repo (GitHub Pages, see `CNAME`). No build step: the HTML you edit is
the HTML that ships.

## Ground truth about the business

**Everything on this site is a promise to a real customer. Do not invent, soften,
or "improve" any of these facts. If a change would touch one and it isn't listed
here, ask Mikey first.**

### What Mikey brings, and what the customer provides

- Mikey brings the **tools and products**: pressure washer, extractor, vapor
  steamer, polishers, vacuums, lights, chemicals.
- **He does NOT bring his own water or power.** The customer must provide an
  outdoor **water spigot** and a **power outlet** he can reach.
- Never write "I bring my own water and power", "water, power, everything", or
  any phrasing that implies a self-contained rig. The correct framing is: *he
  brings the whole setup and runs it off your spigot and outlet.*
- He can detail while the customer is out, as long as those two are reachable.

### Money

- Exterior detail from **$160**, interior from **$200**, full detail from **$299**.
- **No travel fee anywhere in the service area.** Same price in every town.
- Customer pays **after** the job, only if happy. Full refund otherwise.

### Where he goes

Base: **Snohomish, WA 98290** — `47.9129, -122.0982`.

Served every week (these are the pins on the homepage service-area map, and the
`tier: 'yes'` entries in that section's `TOWNS` list):

> Snohomish · Lake Stevens · Everett · Monroe · Mill Creek · Marysville ·
> Bothell · Duvall · Mukilteo · Woodinville · Granite Falls · Arlington

- **Lynnwood and Edmonds are NOT served.** They are deliberately in the "ask me"
  tier. Do not add them to the served list, `areaServed`, or any "towns I serve"
  copy without Mikey saying so.
- "Ask me" towns are ones he sometimes reaches — never promise them.

### Contact and proof

- Phone / text: **(425) 600-7897** · Email: **book@mikeysdetailing.com**
- **5.0** on Google from **40** reviews · **300+** cars detailed.
- Review counts are injected at runtime via `data-md-reviews="{n}"`; leave those
  attributes alone.

## Layout of the repo

- `index.html` — the entire homepage, one file. Each section carries its own
  scoped `<style>` and `<script>`; follow that convention rather than adding
  shared stylesheets.
- `<city>/index.html` — city landing pages. Each needs unique local prose, full
  `@graph` schema, and a sitemap entry. **Cap: 1–2 new city pages per month** —
  bulk-published near-duplicate city pages get flagged as doorway spam. See
  `GROWTH-PLAN.md`.
- `tools/` — helper scripts. `service-area-map.py` regenerates the service-area
  map SVG from real lat/lon; run it instead of hand-editing pin coordinates.
- `GROWTH-PLAN.md`, `SEO-ROADMAP.md`, `BUSINESS-PLAN.md`,
  `SECTION-ORDER-ANALYSIS.md` — strategy documents. The section-order analysis
  explains why the homepage sections sit in the order they do; read it before
  moving one.

## House style for copy

Mikey's voice is first-person, plain, and specific — an owner-operator talking,
not a brand. Short declaratives. Concrete details over adjectives.

Things to avoid, because they read as machine-written:

- The "Not X. Y." flip ("You don't drive anywhere. I do.").
- Em-dash-heavy triads and manufactured symmetry.
- Empty intensifiers: *seamless, premium experience, elevate, unlock, transform*.
- Claiming a benefit that isn't verifiably true — see the ground-truth list above.

## Before you ship

- The homepage has exactly one JSON-LD `@graph` block. It must still parse, and
  on-page FAQ copy must match the FAQ schema wording.
- No duplicate element `id`s — the quote calculator and the service-area checker
  both query by id.
- Check the page at 390px, 820px and 1280px, and confirm no new horizontal
  overflow (the page has a deliberately overflowing photo-gallery track; compare
  `document.documentElement.scrollWidth` against a clean baseline, not zero).
