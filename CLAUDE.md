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
| Exterior detail | **$160–$240** | price scales with vehicle size |
| Interior detail | **$200–$280** | |
| Full detail | **$299–$379** | $299 sedan / $339 SUV / $379 truck-XL |
| Ceramic coating | **from $500** | tiered, quoted |
| Paint correction | **quoted** | one-step **6–8 hrs**, multi-stage **1–2 days** |
| Quote calculator takes | **60 seconds** | never 30, never 90 |
| Full detail takes | **3–5 hours** | never 3–4 |
| Basic interior takes | **about 90 minutes** | 2–4 hrs with extraction or pet hair |
| Cars detailed | **300+** | |
| Google rating | **5.0 across 40 reviews** | |
| Detailing since | **2021** | |
| Base / radius | **Snohomish, WA 98290**, ~25 miles | |
| Phone | **(425) 600-7897** | |
| Booking capacity | **12 cars a week** | one number, everywhere |
| Payment | after the work, never a deposit | |
| **Customer must provide** | **outdoor water spigot + power outlet** | no tank, no generator — do not write that he can bring his own |

Two facts are **unconfirmed** — ask Mikey before writing either:

- **Which days he works.** The schema on every page says 7 days, the terms page
  says 7 days 8am–8pm, and the Fri–Mon offer needs Sunday and Monday. Twelve
  pages used to claim Wednesday–Saturday. Copy currently avoids naming days.
- **Licensed and insured.** It appears nowhere on the site. It's a strong trust
  signal for a stranger in a driveway, but don't assert it until he confirms.

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
  | introducing a list | a colon. "I bring everything: water, power, extraction." |
  | a true parenthetical | brackets. "I run a real trade (300+ cars, 5.0 stars) on this system." |
  | separating a title | the pipe. "Mobile Car Detailing Snohomish, WA \| See Your Price Now" |

  `tools/check-site.py` fails the build on any em dash in a served file, so a
  new one cannot reach the site without someone deliberately deleting a check.
  En dashes in number ranges are fine and are left alone: `$299–$379`,
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

Same discipline for scarcity: **one** claim, **12 cars a week**. Not "limited
spots" plus "a few a week" plus "two or three a day" (which is 14–21 and
contradicts the others).

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

Three places have to agree when the area changes: the `TOWNS` list, the
`areaServed` array in the homepage JSON-LD, and the map SVG. The map is
generated — run `python3 tools/service-area-map.py` and paste the result over
the `<svg class="sa-map">` block rather than nudging pin coordinates by hand.

## Offers and countdowns

The free-exterior offer really does open Friday and close Monday, and the timer
in `index.html` really does track it, including an off-state Tue–Thu. Keep it
honest: **don't write copy that implies a one-off deadline** for something that
runs every week — the second visit makes a real deadline look fake. Name the
window instead.

## City pages

Eight of them, plus service pages nested under some cities. They share process
steps, FAQ answers, pricing and footers — that's correct and it's what keeps the
facts consistent. What must be **unique** per city is the intro prose and the
neighborhood sections.

The failure mode is mad-libs: taking Snohomish's paragraphs and swapping SR-9 for
US-2. Write from something only true of that city — Stevens Pass ski traffic and
sanding grit on US-2 through Monroe; salt film off Port Gardner and Boeing shift
schedules in Everett; HOA rules in Mill Creek; gravel roads in Duvall.

Keep city pages **900+ words**. Everett is the biggest market and was the
shortest page on the site.

## SEO copy

- **Meta descriptions under 155 characters.** Google cuts past that. Front-load
  city, service and price so they survive the trim. Fifteen were over; the
  longest was 260.
- Titles follow `Mobile Detailing <City>, WA | Mikey's Mobile Detailing`.
- FAQ answers exist **twice** on most pages: once visible, once inside a
  JSON-LD `FAQPage` block. Edit both or the schema starts lying.

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
- **The Rain-Ready offer (B07) is a promise to customers.** Don't widen it,
  extend its window, or add a new offer without Mikey saying so.

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
It currently reports 2 pre-existing failures, both in `polish-test/`; anything
beyond those two is yours.

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
