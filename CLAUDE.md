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

## Deploying

There's a `CNAME` (`mikeysdetailing.com`) and no CI workflow, Netlify or Vercel
config in the repo, so this is served straight from the branch — confirm which
one with Mikey before assuming a merge publishes.

`sitemap.xml`, `robots.txt` and `llms.txt` are maintained by hand. A new page
means adding it to all three, and `llms.txt` restates the prices and durations,
so a fact change lands there too.
