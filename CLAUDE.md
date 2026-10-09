# Working on mikeysdetailing.com

This is a static site: hand-written HTML per page, no build step, no framework.
Every page carries its own `<head>`, its own JSON-LD, and its own copy of the
nav, footer, quote calculator and FAQ. That's the thing to keep in mind before
you change any sentence — **there is almost certainly more than one copy of it.**

## The facts. Don't restate them from memory, and don't let them drift

These numbers appear on 30+ pages and in JSON-LD that Google reads separately
from the visible text. A customer reads one page and holds Mikey to it, so two
pages disagreeing is a promise he can't keep on one of them.

| Fact | The answer | Notes |
|---|---|---|
| Exterior detail | **$199–$279** | $199 sedan / $239 SUV-pickup / $279 van-3-row |
| Interior detail | **$249–$329** | $249 / $289 / $329 |
| Full detail | **$369–$449** | $369 / $409 / $449 |
| Size step | **+$40 SUV or pickup, +$80 van or 3-row** | condition (+$30 / +$60) and add-ons ride on top, outside the ranges |
| Ceramic coating | **from $500** | tiered, quoted |
| Clean Club | **$125 a visit** | members' price is locked in; kept at $125 on 2026-09-27 |
| Clean Club join | **$270 off the first Full Detail ($99 sedan / $139 SUV-pickup / $179 van-3-row); keep the next 3 club visits or pay back $90 each** | Mikey, 2026-10-04 (it launched 2026-10-03 at $150 off, keep 2, $75 each; those members keep their deal). Condition rides on top. Every 4 or 8 weeks at $125. Never more than $270 back, nothing owed before the first visit. Sold only on the call page (`/onbored/`), not on the public site |
| Paint correction | **from $400** | 1-Step $400+ / 2-Step $650+ / Multi-Stage $900+, quoted. One-step **6–8 hrs**, multi-stage **1–2 days** |
| Quote calculator takes | **60 seconds** | never 30, never 90 |
| Full detail takes | **3–5 hours** | never 3–4 |
| Basic interior takes | **about 90 minutes** | 2–4 hrs with extraction or pet hair |
| Exterior detail takes | **about 1–2 hours** | set 2026-10-05 to match the calendar's 2 hr plan (pages had said 1–1.5 and 1.5–2.5); Mikey to confirm |
| Clean Club visit takes | **unconfirmed** | Mikey wasn't sure (2026-10-05). Copy says a club visit takes less than a first detail, never a number |
| Cars detailed | **300+** | |
| Google rating | **5.0 across 39 reviews** | what the public profile shows (Muse read it 2026-10-08; the site had said 41). `site-stats.js` first, then every hard-coded copy; `check-site.py` finds them |
| Detailing since | **2021** | |
| Base / radius | **Snohomish, WA 98290**, ~25 miles | |
| Phone | **(425) 600-7897** | |
| When he works | **Mon–Fri one job at 1:00 PM; Sat 7:00 AM and 1:00 PM; never Sunday** | Mikey, 2026-09-29, while he's in school until noon. Copy says "weekday afternoons and Saturdays", not exact times, because it'll change. The real times live in the dashboard (Bookings → Settings → My start times) |
| Longest job times | **Exterior 2 hrs, Interior 3 hrs, Full Detail 4.5 hrs** | the booking calendar plans on these; not customer copy (customers get the ranges above) |
| Capacity | **no weekly number** | "12 cars a week" was retired 2026-09-29 (his real week holds about 7). Scarcity is the live "Next opening" line instead |
| Payment | after the work, never a deposit | a Clean Club card is saved with Stripe, not charged |
| **Customer provides** | **outdoor water spigot + power outlet** | using theirs is how he keeps prices low. He can bring water and power if there's truly none, "if absolutely necessary" (Mikey, 2026-10-05): copy may say so as the exception, always with that reason, never as the default and never with a price |
| Licensed / insured | **neither** | Mikey, 2026-10-05. Never claim or hint at either. `outreach/FLEET-EMAILS.md`: no dealership emails until he is |
| Old phone number | **(425) 232-1355** | his old number, still on Yelp and Yahoo (`outreach/DIRECTORIES.md`). Never use it |

Settled by Mikey on 2026-10-05:

- **The schema's hours.** His Google Business Profile says open 24 hours, 7
  days, so the schema's `openingHoursSpecification` (24/7) matches it. That's
  quotes and texts; appointments stay "weekday afternoons and Saturdays" in
  copy, as on the terms page and in `llms.txt`.
- **Licensed and insured.** He is neither. It appears nowhere on the site;
  keep it that way.

Still **unconfirmed**, ask Mikey before writing it:

- **What's in a Clean Club visit, and how long one takes** (see the call page
  section).

**Prices have their own file: `PRICING.md`.** It has the price book, what
old quotes and printed pieces are honored at, and the checklist for the next
change. `tools/check-site.py` holds the same book in `PRICE_BOOK` and fails on
any retired price, so a price change starts there.

**Changing one of these means changing it everywhere,** including the JSON-LD
`"text"` fields in FAQPage blocks and `llms.txt`. Grep the whole repo, don't
edit the page you're looking at.

## Voice

Mikey writes like a person who details cars, not like an agency describing one.
The test: could he say this out loud to someone in their driveway?

**This is the voice:**

> "I'd rather redo a car than have a review I have to explain."
> "No judgment at all — I've seen everything."
> "Stay in your PJs."
> "War Zone / Really rough"

**This is not, and it's the failure mode to watch for:**

> ~~"Three Steps. Zero Effort. One Jaw-Dropping Car."~~
> ~~"Open the Door and Grin"~~
> ~~"You run your hand down paint that feels like glass."~~

Rules that follow from that:

- **First person, always.** "I come to you", not "we come to you". It's one guy.
  Buttons say **"Get My Instant Quote"**, not "Get Your". Headings can stay
  second person — a heading describes what happens to the reader.
- **Don't narrate the customer's emotions.** Say what happens in the driveway.
  "We walk around it together and I fix anything you point at" beats "you'll be
  grinning ear to ear."
- **Concrete beats superlative.** "Sanding grit embeds in the lower panels over a
  winter" is worth more than "showroom shine."
- **No agency words:** seamless, elevate, unlock, transform, jaw-dropping,
  bumper-to-bumper-perfection. No "it's not just X, it's Y."
- **Never an em dash.** Not `&mdash;`, not the character, not in visible copy,
  meta tags, alt text, JSON-LD, code comments or JS strings. Mikey's call: a
  dash used as punctuation is the clearest tell that a machine wrote the
  sentence, and this site is one guy talking. Use what the sentence actually
  wants:

  | The dash was doing | Use instead |
  |---|---|
  | joining two whole sentences | a full stop. "Yes. I'm in Everett most weeks." |
  | an aside inside one sentence | a comma. "Bigger vehicles take more time, so I want your estimate accurate." |
  | introducing a list | a colon. "I bring the tools: extractor, polisher, product." (Not "water" or "power": the customer provides those unless there's truly none.) |
  | a true parenthetical | brackets. "I run a real trade (300+ cars, 5.0 stars) on this system." |
  | separating a title | the pipe. "Mobile Car Detailing Snohomish, WA \| See Your Price Now" |

  `tools/check-site.py` fails the build on any em dash in a served file, so a
  new one cannot reach the site without someone deliberately deleting a check.
  En dashes in number ranges are fine and are left alone: `$369–$449`,
  `3–5 hours`. Those read as ranges, not as punctuation.

## Say the guarantee four times, not thirteen

"You don't pay until you love it" is the strongest thing on the site and it was
on the homepage 13 times, which reads as protesting too much. It belongs in
exactly four places, where a customer actually hesitates:

1. the hero
2. the price reveal inside the quote calculator
3. the Love It Guarantee section
4. the final CTA

Anywhere else, use the slot for a fact that appears nowhere else — same detailer
every time, exact price not a range, door jambs and glass included.

Same discipline for scarcity: **one** claim, and it's the live **"Next opening:
Thu, Oct 1 at 1:00 PM"** line (`data-next-opening`, filled by `site-stats.js`
from his real calendar). No fixed weekly number: "12 cars a week" was retired
on 2026-09-29 because his real week holds about 7, and 7 reads as part-time.
Not "limited spots" or "a few a week" either. Write the element's fallback text
so it stands on its own when the calendar can't be reached.

## Online booking

Back on 2026-09-29, rebuilt so it can't cost a lead. The quote calculator shows
the price, then **"Pick my time"** (steps 7 and 8: three next openings, then
name, phone, town, street) or **"Text me this quote instead"** (the old phone
form). If the calendar doesn't answer, the price screen is just the phone form,
exactly as before.

- **The calendar lives in the dashboard repo** (`twillowdashbored`,
  `bkSlotAvailability` in `src/index.js`), not here. The site asks
  `/api/next-openings` and books through `/api/book`, the same engine his
  Bookings screen, his texts and his Google Calendar feed into.
- **A time is only offered if the job finishes before dark** at his longest
  time (sunset is computed, so it follows the season). Weekday Full Details
  drop out after the clocks go back on Nov 1 until his work lights are ready;
  that's a checkbox in Bookings → Settings.
- **Never same day.** Tomorrow's times close at 9 PM tonight.
- **Instant confirm only in the twelve towns.** They get his confirm text and
  both reminders at once. Anywhere else is a request he confirms himself.
- **A street without a house number is allowed.** His alert tells him to ask.
- Anything on his Google Calendar blocks a time. That's his off switch.

## The call page (`/onbored/`)

Built 2026-10-03 at Mikey's request. He texts it while he's on the phone with
someone who asked about a detail and walks them through it: their car, their
one-time price first, then the Clean Club tabs (every 8 or every 4 weeks).

- **Unlisted on purpose.** `noindex`, nothing links to it, and it is not in
  `sitemap.xml`, `llms.txt` or the About list. That's the one exception to "a
  new page goes in all three". `/onboard/` redirects to it with the query
  string, because that's how people type it after hearing it.
- **The deal** (Mikey, 2026-10-04): joining makes the first visit a Full
  Detail at $270 off, $99 for a clean sedan, whatever they called about (a club
  keeps a car up, and you can't keep up one that was never reset), then $125 a
  visit every 4 or 8 weeks. They keep their next 3 club visits or pay back $90
  for each one skipped, never more than $270, and nothing is owed if they
  cancel before the first visit. It launched the day before at $150 off, keep
  2, $75 each; anyone who signed that keeps it, because each sign-up stores its
  own numbers. It's a contract people sign: don't change a word of it without
  him.
- **The dashboard worker prices it and owns the words.** `CLUB` and
  `clubTerms()` in `twillowdashbored/src/index.js` work out the price and
  return the seven lines of terms for that exact car; the page shows them and
  the worker stores the same lines against the name they type. Change a word
  there and bump `CLUB.terms`. The page's own `PRICE` and `CLUB` are for
  display only, but they're one more copy of the price book, so a price change
  lands there too.
- **The card is Stripe's.** Saved on Stripe's hosted page in setup mode
  (nothing charged), switched on by `STRIPE_SECRET_KEY` on the `texting`
  Worker. Until that's set, sign-ups still book and his alert says the card is
  missing. Nothing ever charges a card on its own: a payback is Mikey, in
  Stripe, after the text the terms promise. Tools → Clean Club in a
  conversation works out what they'd owe.
- **White, not the site's black** (Mikey, 2026-10-04: the dark version threw
  him off on a phone). Black type on white, and the brand red only on what to
  tap and what they save, so "tap the red button" always has one answer. Its
  logo is `/images/logo-header-light.png` (black MOBILE DETAILING); the dark
  site's logo has white lettering that vanishes on white. On the price screen
  the main button is pinned to the bottom of the phone, because the club card
  runs taller than one screen.
- **Rain-Ready shows here too**, because a club first visit is a Full Detail.
  It has its own copy of `RR_END` (see Offers and countdowns).
- **What a club visit includes is unconfirmed.** The page and the terms say "an
  upkeep detail, inside and out", which is all the site has ever said. Ask
  Mikey before listing what's in one.
- Times come from the same `/api/next-openings` as the homepage, so everything
  in Online booking applies as-is. The phone script is `outreach/CALL-SCRIPT.md`.

## The service area

Base is **Snohomish, WA 98290** (`47.9129, -122.0982`). Mikey is in these twelve
towns most weeks — they're the pins on the homepage map and the `tier: 'yes'`
entries in the `TOWNS` list inside the `#service-area` section:

> Snohomish · Lake Stevens · Everett · Monroe · Mill Creek · Marysville ·
> Bothell · Duvall · Mukilteo · Woodinville · Granite Falls · Arlington

- **Lynnwood and Edmonds are NOT served.** They sit in the "ask me" tier on
  purpose. Don't add them to the served list, to `areaServed`, or to any "towns
  I serve" copy without Mikey saying so — he was asked directly and said no.
- "Ask me" towns are ones he sometimes reaches. Never promise them.
- **No travel fee anywhere in the area**, and the price is the same in every town.

Four places have to agree when the area changes: the `TOWNS` list, `CITIES`
in `tools/build-entity-graph.py` (it writes `areaServed`, each town with its
own county, into every page's JSON-LD; rerun it with `--apply`), the map SVG,
and a city page for each `TOWNS` entry with a `p:`. `check-site.py` fails if
`TOWNS` and `CITIES` name different towns. The map is
generated — run `python3 tools/service-area-map.py` and paste the result over
the `<svg class="sa-map">` block rather than nudging pin coordinates by hand.

## Offers and countdowns

**The live offer is the Rain-Ready Full Detail,** on the homepage since
2026-09-28 at Mikey's request. It's the door hanger's version: book a Full
Detail by **December 31, 2026** and exterior polish, ceramic wax and RainX come
free (worth $508, from $369). It's the **booking** date that counts: a job
booked by Dec 31 can be done as late as **January 31, 2027** (Mikey,
2026-09-29), because weekday Full Details don't fit before dark in November and
December and there aren't enough Saturdays to go round. It lives in three places in `index.html`, and
all three switch off on their own at midnight Pacific going into January 1:

1. the gold chip above the hero headline (`.mh-rr`)
2. the `#rain-ready` section after Before & After, with its value stack
3. the quote calculator: `RR_END` / `RR_FREE`, which put the three extras on
   any Full Detail at $0 and label them "(free, Rain-Ready)" in the text and
   email Mikey gets

The section's script holds its own copy of the end date. Change one, change
both. The call page (`onbored/index.html`) has a third copy, `RR_END`, for
the extras it shows on a Clean Club first visit: same date, same switch-off.
Don't widen it, extend the window or swap the extras without Mikey; it's
the same promise the hangers and postcards make. After January 1 take the
dormant code out rather than leaving it.

**The maintenance page has its own offer** (`/mobile-auto-maintenance/`): a
free 30-point inspection with an oil change booked into a Friday-through-Monday
slot. Mikey kept it on 2026-10-05. It names its window, which is the rule
below, and since he never works Sunday there are no Sunday slots to take.

The old free-exterior Fri-Mon offer is parked whole in
`_disabled/free-exterior-offer.html`. Keep the rule it taught: **don't write
copy that implies a one-off deadline** for something that runs every week, the
second visit makes a real deadline look fake. Name the window instead.

## City pages

Eleven of them (every served town but Granite Falls), plus service pages nested under some cities. They share process
steps, FAQ answers, pricing and footers — that's correct and it's what keeps the
facts consistent. What must be **unique** per city is the intro prose and the
neighborhood sections.

The failure mode is mad-libs: taking Snohomish's paragraphs and swapping SR-9 for
US-2. Write from something only true of that city — Stevens Pass ski traffic and
sanding grit on US-2 through Monroe; salt film off Port Gardner and Boeing shift
schedules in Everett; HOA rules in Mill Creek; gravel roads in Duvall.

Keep city pages **900+ words**. Everett is the biggest market and was the
shortest page on the site.

**Granite Falls is written and parked** at `_disabled/granite-falls/index.html`
(2026-10-02), because the growth plan paces city pages at 1 to 2 a month and
Woodinville and Arlington went live that day. Put it up in November: move it
to `granite-falls/index.html`, set `p:'/granite-falls/'` on its `TOWNS` entry,
turn its homepage chip into a link, add it to the About list, the Lake Stevens
and Arlington footers, `sitemap.xml` and `llms.txt`, add it to `PAGE_SERVICE`
in `tools/build-entity-graph.py` and run that with `--apply` (it writes the
page's Service node), re-read it against the facts table, then run
`check-site.py`.

## The blog (`/blog/`)

Moved onto the site on 2026-10-05 (Mikey: "go ahead"). `blog.mikeysdetailing.com`
was a one-off Netlify deploy from April 2026 (project `mikeysqqc`) that still
quoted $130/$160/$260, a 2–4 hour full detail, a 30-second quote and "I bring
water, power", and AI answers were repeating it. Five posts moved, rewritten
against the facts table: coffee stains, pet hair, how often to detail, smells,
headlights. The other five redirect to the pages that already cover them
(ceramic coating, mobile detailing vs a car wash, and the Monroe, Lake Stevens
and Everett posts to those city pages), because a second page on the same topic
competes with the first in search.

- **The redirects** are `tools/blog-redirect/_redirects`, deployed to the
  Netlify project `mikeysqqc` by dragging the folder onto its Deploys page.
  That's Mikey's step; until it's done the old blog keeps its wrong prices.
  Check it with `curl -sI https://blog.mikeysdetailing.com/`: a 301 to
  `https://mikeysdetailing.com/blog/` means it's done.
- A post is one more copy of the facts table, and check-site reads it like any
  other page. A new post goes in the `/blog/` index, `sitemap.xml` and
  `llms.txt`, with a `BlogPosting` node like the others (the generator keeps it).
- **Headlight restoration and odor removal have no published price.** The posts
  say "text me a photo" and he quotes it. The old blog's $75 and $80–120 were
  never in the price book; don't print a price until Mikey sets one.
- These moved; they weren't new pages. New posts follow GROWTH-PLAN.md's pace
  of one new page a month.
- **Fixed 2026-10-08 (Mikey's yes):** `blog.mikeysdetailing.com` now 301s
  every old post to its new home (deployed to `mikeysqqc` through the Netlify
  connector), `mikeysquote.netlify.app` 301s to `/#booking`, and MyQqc's
  `index.html` is the redirect page. History below.
- **Still live on 2026-10-07:** the redirect hadn't been deployed, and two
  copies of the old quote widget (Interior $160+, Full $260+) were up too:
  `mikeysquote.netlify.app` and `mikeygabmiller.github.io/MyQqc/`.
  `tools/old-quote-redirect/` is their fix, and `reports/2026-10-07-aeo.md`
  has the steps, with the GBP Services entry that still said "from $200".
  A session's Netlify deploy needs Mikey's explicit yes (the safety check
  stops it otherwise). Still up on 2026-10-08, and Search Console had its
  Lake Stevens post on page one (76 impressions at 10.0) with the old prices.
  The redirect file covers all ten old posts (checked against the live blog
  that day). Of the 16 Netlify projects a name search finds, only `mikeysqqc`,
  `mikeysquote` and `mikeyscrm` serve anything; the rest return 404.
  `mikerealsite` still lists mikeysdetailing.com as its domain, but the
  domain points at GitHub Pages, so it serves nothing. Leave it alone.

## SEO copy

- **Meta descriptions under 155 characters.** Google cuts past that. Front-load
  city, service and price so they survive the trim. Fifteen were over; the
  longest was 260.
- Titles follow `Mobile Detailing <City>, WA | Mikey's Mobile Detailing`.
  Everett and Bothell are testing `Mobile Car Detailing <City>, WA` since
  2026-10-05 (`reports/2026-10-scoreboard.md`): roll it out to the other city
  pages if they move by the November pull, put it back if they don't.
- **Search Console's real numbers** start in `reports/2026-10-scoreboard.md`
  (pulled by hand 2026-10-07; Windsor's free plan allows one source and
  Google Ads holds it, so GBP, GA4 and Search Console are read by hand). It has the
  title test's before-picture, the position 5–15 watch list, and six pages
  live since May with no impressions in three months (near-me, pet hair, vs
  car wash, two city interior pages, Monroe ceramic). Read URL Inspection's
  status for those before rewriting them. Semrush got the small towns wrong;
  use Search Console for rankings.
- **The FAQ schema is built from the visible FAQ** (since 2026-10-07, when 23
  pages had drifted and some hidden answers were wrong: 8 towns, "25-50% more"
  for an SUV). `tools/build-entity-graph.py` reads the questions a reader can
  see (the answer-first box, `.faq-item`, `details.faq2-item`, or `h3` pairs
  under a "Common Questions" `h2`) and writes the `FAQPage` from them. Edit the
  visible answer and rerun it with `--apply`; `check-site.py` fails until you
  do. There's no such thing as a schema-only question: most AI crawlers strip
  `<script>` and never see it. Put it on the page or leave it out.
- **An answer names who's answering.** Every answer-first box says Mikey's
  Mobile Detailing and the place in the same paragraph as the answer, because
  an engine lifts the paragraph, not the page. The October panel: his pages
  shaped answers to two question prompts that never said his name.
- A page's JSON-LD `WebPage` name and description are its `<title>` and meta
  description, byte for byte. After changing either, run
  `python3 tools/build-entity-graph.py --apply`, or `check-site.py` fails (15
  pages had drifted on 2026-10-05).

## The logo

Picked by Mikey on 2026-09-28: a red 4x4 with MIKEY'S across the grille and
soap foam at the tyres, over MIKEY'S (Racing Sans One, red, white outline) and
MOBILE DETAILING (Barlow Condensed) between red rules. No curved type.
Everything lives in `social/brand/logo-final/` with a README saying which file
goes where. The generators read `social/brand/logo.svg` (dark backgrounds),
`logo-light.svg` (cream or white, the hanger and postcard backs) and
`logo-icon.svg`; the site serves its copies from `/images/`. The truck is
built from the full-size Canva image in `logo-final/source/`: at 300 dpi the
side-by-side logo is sharp to ~12 in wide, the stacked one to ~5 in. Its
grille is still close to a real Bronco's: redraw it before a big print run.

## Instagram and Facebook posts

They live in `social/`, which is not served (`_config.yml` excludes it). Read
`social/PLAYBOOK.md` before making or changing a post: it has the weekly
rhythm, the caption shape, the photo privacy rules and the Rain-Ready offer.

- **Posts follow this file.** Same facts table, same voice, no em dashes. A
  post is one more copy of the facts, so a fact change lands there too:
  `social/tools/posts.cjs`, then re-render.
- **Edit copy in `social/tools/posts.cjs`**, never in `social/CAPTIONS.md`,
  which the renderer rewrites. `npm run render` in `social/tools`.
- **No readable plates, house numbers, faces or names** in any photo. New
  photos get blur boxes in `social/tools/prep-photos.cjs`; look at the output.
- **Give before you ask.** Most posts are tips, techniques, myths or Mikey's
  own stories, useful to someone who never books. At most one post in four
  asks for anything. Never invent a story; stories come from his answers.
- **Only the twelve served towns** on the map or in copy. The renderer strips
  the "ask me" tier from the map for that reason.
- **Automated posting is live** (built 2026-10-09; "What's built" in
  `social/AUTOPOST-PLAN.md` has the ids). The Make scenario "Social
  publisher" posts Instagram (`@mikeysdetailing_sno`) and the Facebook Page at
  6:30 PM Pacific from `social/queue.json`, which `social/tools/queue.cjs`
  writes. **Nothing posts unless its id is in `APPROVED` there,** and offers
  wait for Mikey's yes. The Facebook connections expire 2026-12-08. Nextdoor
  has no API for a small business, so it stays a paste.
- **The Rain-Ready offer (B07) is a promise to customers.** Don't widen it,
  extend its window, or add a new offer without Mikey saying so.

## Fleet and dealership emails

Cold emails to businesses with vans, lots and fleets live in
`outreach/FLEET-EMAILS.md` (not served). They restate the facts table, so a
fact change lands there too. Same voice, no em dashes, only the twelve towns,
and nothing about being insured until Mikey confirms it.

## Directory listings

`outreach/DIRECTORIES.md` (not served) is the kit for the 15 directories in
GROWTH-PLAN.md SG6: the canonical name, phone, URL and twelve towns, what
each existing listing gets wrong, and paste-ready copy fitted to each site's
character limits. It restates prices and towns, so a fact change lands there
too, and then on every listing. No street address ever goes on a listing or
in that file (the repo is public on GitHub). Mikey submits them himself.

## Google Business Profile posts

`outreach/GBP-POSTS.md` (not served) holds the weekly GBP posts. The first
eight (Mondays 8:00 AM Pacific, Oct 12 to Nov 30, 2026) were **scheduled on his
profile on 2026-10-07** with GBP's own "Schedule this post" switch, entered by
Muse (a browser agent) with Mikey signing in himself. Don't schedule them again.

- A scheduled post is one more copy of the facts table, and it doesn't update
  itself: a fact change means editing or deleting the posts on his profile,
  not only the file.
- The next batch starts Monday Dec 7. Write it in that file first, checked
  against this one, then schedule. Nothing that goes up after Dec 31, 2026
  mentions Rain-Ready.
- No phone number in post text (Google may reject the post); the Call now
  button uses the profile's number. Photos only from `social/photos/`, wide.
- Whoever posts signs in only with Mikey typing his own password. No saved
  Google password in a bot, and no cloud browser logging into that account
  on its own: GBP is where most of his leads come from.

## Door hangers

The print files live in `print/door-hanger/` (not served, `_config.yml`
excludes `print/`). Read its `README.md` before changing anything: it has the
ordering steps, the distribution rules and why each section is there.

- **A hanger is one more copy of the facts table.** Prices, 60 seconds, 300+,
  5.0 across 39, the phone, the twelve towns, spigot and outlet: a fact change
  lands there too. Edit `print/tools/build-door-hanger.cjs`, then
  `npm run hanger` (and `OFFER=0 npm run hanger`) in `print/tools`.
- **It prints the Rain-Ready offer** with its own terms: book a Full Detail by
  **December 31, 2026** and mention the hanger (no code word). Mikey set that
  window; don't widen it or extend it without him. Reprints after that date
  use the `-no-offer` version.
- **Where to hang them** is `print/door-hanger/ROUTES.md`, generated by
  `python3 print/tools/hanger-zones.py` (Census blocks and incomes, only the
  twelve towns' ZIPs). It also writes `zones.geojson`; copy that to the
  dashboard repo as `public/hanger-zones.json` so the Hangers map matches.
- The generator exits with an error if copy spills out of the safe area,
  picks up an em dash or a banned claim, or the QR code stops decoding. Look
  at the previews anyway.

## Yard signs

`print/yard-signs/` (not served) is the plan and the source of truth: read its
`README.md` before changing anything about signs. It covers what to print, the
honest cost math, where signs go, the crew link, pay, and lead tracking.

- **The spot list** is `print/yard-signs/spots.json`, made by
  `python3 print/tools/sign-spots.py` (FHWA HPMS traffic counts, OpenStreetMap
  lights and stop signs, Census households). Every pin is placed on grass
  checked against the NAIP infrared photo and Meta's canopy-height map, off
  roads, rails, bridges and cemeteries; an approach with no such spot is
  dropped. About 1 to 2 pins in 10 still sit against a shrub or small tree the
  data can't see; Mikey's **Check** tab in the crew app (Good / Bad on the
  satellite photo, best spots first) is how those get caught, and the app
  learns from those marks (plus the crew's field results) using the 17 ground
  measurements each pin carries (`fx`). Change that set only with a new
  `FX_VERSION` in `sign-spots.py`.
  **Look at the pins after every change:** `python3 print/tools/sign-spot-check.py`
  draws them on the aerial photo. Copy the list to the dashboard repo as
  `public/sign-spots.json` after every run, same as the hanger zones.
- **The crew app** lives in the dashboard repo (`public/signs.html`, routes
  `/api/crew/*` and `/api/signs` in `src/index.js`). Helpers join from a link
  Mikey makes in Insights → Yard signs.
- **A sign is one more copy of the facts table:** the phone number, first
  person if any line ever speaks. No prices and no offer on a sign: 1,000 printed signs
  can't follow a price change, and the Rain-Ready offer stays on the hangers and
  postcards.
- **The roadside sign has no QR and no website** (Mikey's wording, 2026-10-02:
  MIKEY'S small in red / MOBILE CAR / DETAILING / 425-600-7897, no red band
  and no slogan line). Since 2026-10-02 it's black on **safety yellow** in Fira
  Sans Extra Condensed, chosen for distance: the words and the number read to
  about 68 and 82 ft (number 4.23 in tall, Mikey wanted it bigger; since
  2026-10-03 it's yellow Fira 700 on a black strip across the bottom), against
  46 and 64 ft for the old white sign with its 5 in Anton number. Judge a new draft on `python3 print/tools/sign-legibility.py`
  (feet a 20/40 driver can read it from), not on how tall the type looks.
  If a QR ever goes on a sign, it is
  `https://mikeysdetailing.com/?utm_source=yardsign#booking`; the dashboard tags
  a quote or booking from that visit **sign** and credits it. Don't change the
  `utm_source` without changing the dashboard.
- **Scaling it so Mikey only orders and pays** is `print/yard-signs/SCALE.md`
  (2026-10-09): one captain, a pickup bin, the calendar as the ceiling, the
  city-code and L&I checks that come before phase 2, and what the crew app
  still needs.
- **Only the twelve towns.** The Mill Creek Community Association's divisions
  are excluded as an HOA that pulls signs; don't add other HOAs to the script
  without Mikey or the crew's removal data saying so.

## Business card

`print/business-card/` (not served) holds the die-cut card: 3.5 x 2 in, cut
to the truck's outline so the roof and mirrors stick up out of the top edge.
Read its `README.md` first. Copy lives in `print/tools/build-business-card.cjs`
(`npm run card`), which also generates the cut line from the logo truck, so
never hand-edit `dieline*.svg`. Same rules as the sign: it's one more copy of
the facts table, and it carries **no prices, no offer and no review count**,
because a kept card outlives all three. Most cards go to strangers, so the
back is for reaching him: the phone, the twelve towns and a QR to the quote
calculator, nothing smaller than 7 pt (Mikey, 2026-10-01: not a glovebox cheat
sheet, and no "300+ cars" on the front). `RESEARCH.md` beside it has what
printers and the few real studies say goes on a card; read it before adding
anything to the back.

## Car window decal

`print/car-decal/` (not served) holds the decal for Mikey's own car (2026-10-05,
for a Temu UV DTF order): MIKEY'S, MOBILE DETAILING, `425-600-7897` and
`mikeysdetailing.com` (added at Mikey's request), white with a thin black
keyline on a square transparent PNG. Read its `README.md`
first. Copy lives in `print/tools/build-car-decal.cjs` (`npm run decal`), which
also writes the DIY versions: a one-colour cut SVG for a Cricut and a hand-cut
template on Letter paper. The back window gets that cut SVG and the rear
door windows a simpler one, MOBILE DETAILING over the number only, from
`build-side-decal.cjs` (`npm run side-decal`), which also writes
`one-sheet-cut.svg` with all three. Order that sheet from CarStickers in white
(2026-10-07: $30.87 shipped, against about $54 at Signs.com with its $25
shipping minimum). Same rules as the sign: one more copy of the facts
table, **no prices, no offer, no review count**. It goes on the outside of the glass and **never on the front
door windows** (RCW 46.37.410(2): nothing on a window that blocks the driver's
view). UV DTF is a short-term product on a car; the README says so and what
lasts longer.

## Air freshener

`print/air-freshener/` (not served) holds the paper hang-tag freshener Mikey
hands a customer at the walk-around, cut to the logo truck in two shapes until
he picks one: **A** (the truck alone) and **B** (the truck over MIKEY'S /
MOBILE DETAILING, recommended because it says what he does). Read its
`README.md` first. Copy lives in `print/tools/build-air-freshener.cjs`
(`npm run freshener`), which also makes the cut lines, so never hand-edit
`dieline*.svg`. Same rules as the card: one more copy of the facts table, no
prices, no offer, no review count. No name line either (Mikey questioned it on
2026-10-05; the logo already says MIKEY'S). The back is the phone, the twelve
towns and a QR with `utm_source=freshener`. Never a tree shape: Car-Freshner
owns it.

## Gift cards

Sold and tracked in the dashboard (Work → Get Paid → Gift cards, or Tools →
Sell a gift card in a conversation): each card gets a number like `ABCD-EFGH`
and a printable page at `/g/<token>` on the dashboard's domain. The printed
5 x 7 card is `print/gift-card/` (`npm run gift` in `print/tools`); it has
blanks for the number, never a printed one. Read its `README.md` first.

- **The terms are Washington law** (RCW 19.240.020): no expiration date, no
  fees, the unused value stays on the card, under $5 is cash on request. Never
  write "expires", "valid for", "non-refundable" or a fee on anything that
  sells a gift card.
- **A gift card is not an offer.** It's face value, no discount, so it doesn't
  need Mikey's yes the way a new offer does. A "buy $100, get $20" bonus would
  be an offer: ask him.
- **Not on the website yet.** Putting "gift cards available" on the site (a
  homepage line, a page, a FAQ) is Mikey's call; ask before adding it.

## EDDM postcard

`print/postcard/` (not served) holds the 6.5" x 9" Every Door Direct Mail
card, and its `README.md` has the printer, the routes, the drop dates and the
ROI math. Same rules as the hanger: it's one more copy of the facts table,
copy lives in `print/tools/build-postcard.cjs` (`npm run postcard`), and it
prints the Rain-Ready offer with the hanger's terms (book a Full Detail by
**December 31, 2026**, mention the postcard). Mikey approved the offer on the
postcard on 2026-09-27; don't reprint it after that date with the offer on.
The generator also fails if anything touches the white mail zone or the EDDM
indicia leaves the corner USPS allows.

## Ordering print

When Mikey says "order the hangers" (or signs, or postcards), read
`print/ORDERING.md` first: it has each product's printer, menu path, options,
files and pre-payment checks. Orders run only in his own browser (Claude in
Chrome or the desktop app), never from a cloud session.

- **Never handle the card.** It's saved on the printer account or in Chrome.
  Don't type, read out, store or ask for a card number, CVV or password, and
  never put an address or card detail in this repo.
- **Stop at the final page** with the total (tax and shipping in) and click
  Place Order only after he says yes to that total. One yes, one order.
- Small batch first on anything new, and log every order at the bottom of
  `ORDERING.md`.

## Shipping

**Mikey wants work merged and live in the same session, not left sitting in a
draft PR.** Unless he says otherwise, finish the job: open the PR, mark it ready,
merge it, and confirm the change is actually serving on mikeysdetailing.com
before reporting done. Don't stop at "pushed" and wait to be asked.

That only works if the checks below are genuinely run first — merging fast and
verifying nothing is how a wrong price or a town he doesn't serve ends up in
front of a customer. Fast is the default; careless isn't.

**Run `python3 tools/check-site.py` before you merge.** It's the gate: it parses
every JSON-LD block, checks that the `#business` node is identical on every page,
and follows every internal link. It's what catches the drift this repo is prone
to — one edit that landed on the page you were looking at and nowhere else. On
2026-09-10 it caught Duvall and Woodinville filed under the wrong county in
schema on 35 pages, which no amount of reading the visible copy would have
surfaced. It also fails on any em dash in a served file, per the Voice section.
Since 2026-10-05 it passes clean, so any failure is yours. That day it also
learned the drift an audit had found by reading: a duration that isn't the
facts table's, a deposit, a retired claim (scarcity, a 24-48 hr turnaround, a
club schedule other than every 4 or 8 weeks), a business "we" or an agency
word, a "Get Your" button, a meta description over 155, a city page under 900
words, the guarantee in a fifth place on the homepage, a served-town list that
disagrees with the generator, and any page a rerun of
`tools/build-entity-graph.py` would change. When a rule is wrong rather than
the copy, fix the rule and say why in its comment; don't delete it.

**Deploying is automatic.** GitHub Pages serves `main` (confirmed 2026-09-10:
a merge to `main` was live at `mikeysdetailing.com` within a couple of minutes,
no workflow file involved). `CNAME` holds the domain. To verify a deploy, poll
the live URL for something the change added rather than trusting the merge:

```sh
until curl -s https://mikeysdetailing.com/ | grep -q 'id="service-area"'; do sleep 15; done
```

If `main` has moved while you were working, merge it into your branch rather than
rebasing, and read what landed — copy edits on this site are often deliberate
(the guarantee-frequency rule below came from one), so resolve in favour of
keeping both intentions rather than taking your own side wholesale.

`sitemap.xml`, `robots.txt` and `llms.txt` are maintained by hand. A new page
means adding it to all three, and `llms.txt` restates the prices and durations,
so a fact change lands there too.

**Sitemap dates and recrawls** (2026-10-07). Each `<lastmod>` is the day its
page last changed: run `python3 tools/sitemap-lastmod.py --apply` after editing
pages (session clones are shallow, so `git fetch --unshallow origin main`
first). `check-site.py` fails on a date older than its page. Once a merge is
live, run `python3 tools/indexnow.py /changed/ /pages/` (no arguments sends the
whole sitemap) so Bing, which ChatGPT search and Copilot read, recrawls them.
The 32-character `.txt` at the site root is its key: public by design, don't
delete it.

## The dashboard (its own repo, its own live branch)

Mikey's texting dashboard (texts, calls, bookings, reminders, Clean Club
sign-ups) is not in this repo. It's `mikeygabmiller/twillowdashbored`, a
Cloudflare Worker live at `https://texting.mikeysdetailingsnohomish.workers.dev`.
Saved here at Mikey's request (2026-10-06), because every session that starts
in this repo had to rediscover how it goes live.

- **It isn't attached to this environment.** Add it with `add_repo` (push
  access) and clone it. The clone lands on GitHub's default branch, `main`,
  which is **stale**: about 5,000 lines of worker against 24,000+ live, with
  none of the booking, club or helper code. Never work from it or merge into it.
- **Only `claude/qqc-submission-auto-text-cspjc3` goes live.** Cloudflare deploys
  that branch and nothing else; any other branch is just a preview. A shallow
  clone has to fetch it by name:
  `git fetch --depth 60 origin +refs/heads/claude/qqc-submission-auto-text-cspjc3:refs/remotes/origin/claude/qqc-submission-auto-text-cspjc3`,
  then branch off `origin/claude/qqc-submission-auto-text-cspjc3`, open the PR
  into it, and squash merge.
- **Read its `CLAUDE.md` and `DEPLOY.md` on that branch first.** They hold the
  rules: bump `BUILD` (`src/index.js`) and `APP_BUILD` (`public/index.html`) to
  the same value, `npm ci` then `npm run test:all` (every suite, about 4
  minutes), and what to stop and ask Mikey about (anything that texts customers
  on its own, rewriting stored data, keys and billing, the deploy wiring).
- **Live means `/api/version` says so.** It has to return the build you just
  set (reachable from these sandboxes as of 2026-10-06). Then tell Mikey to
  fully close and reopen the dashboard app on his phone, or it keeps showing
  the old version.
- **The red "Workers Builds: matins" check fails on every PR there.** It's a
  different Worker (the `matins/` folder), not the dashboard, and fails the
  instant it starts. The dashboard posts no PR check; it deploys on merge.
