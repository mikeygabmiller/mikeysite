# Phone and speed QA, October 2026

Run 2026-10-06 on the live site, unattended. Every URL in `sitemap.xml` (43)
at 390x844 and 360x800, the homepage also at 375x667, in Chromium through
Playwright. Every non-GET request was aborted, so nothing was submitted, sent
or booked (the aborts were analytics beacons and the dashboard's `/px/e`
pixel). The scripts are in `reports/2026-10-phone-qa/`, with before and after
pictures.

## What the sweep found, page by page

Counts are per page at 390 / 360. "Before" is the live site this morning,
"after" is this branch served locally.

| Page(s) | Issue | Before | After |
|---|---|---|---|
| `/about/` | sideways scroll at 360 (price table 387px wide) | yes | **fixed** |
| `/` | footer button and copyright under the Call/Book bar | covered | **fixed** |
| `/mobile-auto-maintenance/` | whole footer unstyled, Call/Book bar shown as a bare link, price chips unstyled (an unclosed `@keyframes` brace dropped every rule after it) | broken | **fixed** |
| `/mobile-auto-maintenance/` | "On Weekend Slots." cut off at the right edge (418px line on a 390 screen) | cut off | **fixed** |
| `/` quote calculator, step 2 | Full Detail card text in a 77px column ("Full / Detail / Inside & out, / the / complete / works") | 77px | **109px** at 390, 95 at 360 |
| 19 pages | `<img>` without width/height | 298 | **0** |
| all pages | broken images | 0 | 0 |
| all pages | console errors (own code) | 0 | 0 |
| all pages | failed requests (own files) | 0 | 0 |
| all pages | images below the fold not lazy, or lazy above it | 0 | 0 |
| 30 pages | text under 12px | 349 hits | 349 (left, see below) |
| 17 pages | tap targets under 44px with a neighbour within 8px | 167 hits | 167 (left, see below) |

City pages with the sticky bar (Lake Stevens, Mill Creek, Duvall, Mukilteo,
Woodinville, Arlington) already had the bottom padding and were fine. The
sweep's own "covered" check flags the homepage after the fix because the
page's smooth scrolling stops it reaching the bottom; the screenshots at 390
and 360 show the footer clear.

## Quote calculator walk (homepage, 390 wide)

All nine sedan / SUV / van x Full / Interior / Exterior runs, cycling Pretty
Clean / Needs Work / War Zone and all add-ons or none. Every price matched the
price book:

| Run | Shows | Expected |
|---|---|---|
| Sedan, Full, clean, carpet shampoo + Rain-Ready extras | $389 | $369 + $20 |
| Sedan, Interior, needs work | $279 | $249 + $30 |
| Sedan, Exterior, war zone, polish + wax + RainX | $319 | $199 + $60 + $60 |
| SUV, Full, clean, Rain-Ready extras | $409 | $409 |
| SUV, Interior, needs work, carpet shampoo | $339 | $289 + $30 + $20 |
| SUV, Exterior, war zone | $299 | $239 + $60 |
| Van, Full, clean, carpet shampoo + Rain-Ready extras | $469 | $449 + $20 |
| Van, Interior, needs work | $359 | $329 + $30 |
| Van, Exterior, war zone, polish + wax + RainX | $399 | $279 + $60 + $60 |

- Rain-Ready: on any Full Detail the polish, wax and RainX show struck through
  at $30 / $20 / $10 and "Free", labelled "Rain-Ready, until Dec 31". The gold
  chip above the hero and the `#rain-ready` section ("87 days left") both show.
- "Pick my time" appeared (calendar answered). Three openings: Wed Oct 7, Thu
  Oct 8, Fri Oct 9, all 1:00 PM. Step 8 took name, phone, town (the twelve
  towns plus "other") and street, and showed "Wed, Oct 7 at 1:00 PM, Full
  Detail, Sedan / Compact, $389". Not submitted.
- "Text me this quote instead" opened the phone form with "Lock in $389".
  Not submitted.
- No overflow on any step at 390 or 360, no page errors.

## Speed

Lighthouse 12.3, mobile, median of 3 runs each, against a local
`python3 -m http.server` copy (so no CDN or compression; real numbers on
GitHub Pages will be a bit better).

| Page | Score | LCP | TBT | CLS | Bytes |
|---|---|---|---|---|---|
| `/` before | 66 | 3.6 s | 922 ms | 0.007 | 853 KB |
| `/` after | **71** | **3.3 s** | 731 ms | 0.007 | **717 KB** |
| `/everett/` before / after | 91 / 88 | 0.9 / 0.9 s | 295 / 396 ms | 0.093 / 0.093 | 320 / 320 KB |
| `/snohomish/` before / after | 87 / 87 | 0.9 / 0.9 s | 372 / 354 ms | 0.133 / 0.133 | 321 / 321 KB |
| `/services/` before / after | 92 / 93 | 0.9 / 0.9 s | 356 / 304 ms | 0.009 / 0.009 | 325 / 325 KB |
| `/blog/` before / after | 99 / 99 | 0.8 / 0.9 s | 100 / 132 ms | 0 / 0 | 301 / 301 KB |

Everett, Snohomish and the blog weren't touched; their TBT moves are run to
run noise from Google Analytics and Clarity. Lighthouse doesn't scroll, so the
photo savings below the fold don't show in its byte count. Scrolled all the
way down, a city page with the before/after strip now loads about 380 KB less
(646 KB of photos down to 266 KB) and `/services/` about 230 KB less.

## What I fixed

1. **`/about/` sideways scroll at 360.** Price table cells get 8px side
   padding under 400px instead of 14px.
2. **Footer under the sticky bar** (homepage and maintenance page). The footer
   sits outside `<main>`, so `main`'s padding didn't help; `body` gets the
   bar's 76px, the same rule the city pages already use.
3. **Maintenance page CSS.** `@keyframes mhSweep` was missing its `}`, so the
   browser threw away everything after it in that style block: the footer
   styling, the sticky bar, the hero price chips. One brace. Full-page before/after at 390: nothing else on the page changed
   beyond moving down to make room for the restored price chips.
4. **"On Weekend Slots." cut off** on the maintenance offer. It wraps on
   phones now; desktop and tablet unchanged.
5. **Quote card squeeze.** On phones the card sat inside three paddings
   (20 + 16 + 26px each side). It now sits on the page's 20px gutter with 18px
   inside, the same 18px the existing under-380px rule already used. Every
   step at 390 and 360 was screenshotted before and after.
6. **Image dimensions.** 137 `<img>` tags got their real width/height. Every
   image's rendered box was compared before and after on all 19 pages at 390
   and 1280: zero changes.
7. **Header logo** is now `/images/logo-header.webp`, 405x116 (3x the 38px
   phone header), 19 KB against the 59 KB PNG. Compared at 2x zoom, no visible
   difference. The PNG stays (it's the image fallback and the brand source).
8. **`truck-foam.webp`** 1000 to 720 wide (it never shows wider than 360):
   181 KB to 98 KB.
9. **Before/after photos on `/services/` and six city pages** load 540w JPEG
   and 360w WebP copies (`ba_N-540.jpg`, `focus-*-360.webp`), still 2x what
   those pages show. The homepage keeps the full-size files because it shows
   them up to 516px wide.

Already right, nothing to do: below-the-fold images were all lazy and nothing
above the fold was; Google Fonts load without blocking the first paint
(`media="print"` swap); the homepage logo already had `fetchpriority="high"`,
and the hero is a CSS gradient with no image to prioritise.

## What's left, and why

- **Homepage LCP 3.3 s.** It's the headline, which starts at `opacity:0` and
  fades in over 0.8 s after a 0.1 s delay, on a 348 KB page whose style and
  layout take about 1.5 s on a throttled phone. The biggest single win would
  be showing the headline without the fade. That's a look change, so it's
  Mikey's call. Trimming the page itself (it carries every section's CSS
  inline) is a bigger job than a QA pass.
- **TBT** is mostly Google Analytics (`gtag`, about 650 ms) and Clarity
  (about 375 ms). Both are his measurement; not touched.
- **City page CLS 0.09 to 0.13** (Snohomish, Everett and the pages built like
  them). Before Outfit arrives, the fallback font is wider and the
  "5.0 / 41+ Reviews / 300+ Cars" line wraps to two lines, then snaps back to
  one, moving the whole hero up 20px. The fix is a size-matched fallback font
  (`@font-face` with `size-adjust` over a local Arial). It doesn't change the
  final look, but it touches the font stack on every page of that template,
  so I left it for a session that can check it on a real iPhone and Android.
- **Text under 12px** (349 hits): mostly deliberate small labels. The
  biggest groups are the 11px stat labels ("Rating", "Reviews", "Cars
  Detailed") on 24 pages, the 10px Before/After tags on the city pages, the
  9px "Guaranteed" seal, the homepage how-it-works chips (10px) and the SEO
  line above the homepage hero (11.2px). Changing type sizes is a design
  change, not a bug fix.
- **Small tap targets** (167 hits): footer link lists (18px tall, stacked
  2px apart) on the homepage, `/about/` and the maintenance page; the header
  logo and phone link on the 11 article pages (28px and 24px tall); the
  homepage town buttons (32px) and map pins (28px). Fixing them means more
  spacing in footers and headers. Worth doing as its own change.
- **Copy I noticed and didn't touch** (the brief said no copy changes):
  - `/about/`: "Every quote is exact before I show up. the calculator on the
    homepage..." (lower-case "the" after a full stop).
  - Footer buttons say "Book Your Detail Today" (homepage) and "Book Your
    Service Today" (maintenance page). CLAUDE.md's voice rule is first-person
    buttons ("Get My", not "Get Your"); `check-site.py` only catches "Get
    Your".
  - "41+ Reviews" (city page heroes) and "41+ five-star reviews" (maintenance
    page). The facts table says 41.
  - The homepage footer's blurb lists seven towns "and nearby areas";
    Mukilteo, Woodinville, Granite Falls, Arlington and Marysville aren't
    named (Marysville is in the link list).

## Second pass (2026-10-06, homepage only)

Goal: LCP under 2.5 s without changing what anyone sees. Lighthouse 12.3,
mobile, median of 5 runs each, before = `main` at `2cd874b`, after = this
branch. Measured two ways, because the plain `python3 -m http.server` sends
the 349 KB homepage uncompressed and GitHub Pages gzips it (94 KB):

| Homepage | Score | FCP | LCP | TBT | CLS | Bytes |
|---|---|---|---|---|---|---|
| plain server, before | 67 | 2.4 s | 3.4 s | 723 ms | 0.007 | 717 KB |
| plain server, after | **72** | 2.5 s | 3.3 s | **431 ms** | 0.007 | **647 KB** |
| gzip (like GitHub Pages), before | 79 | 1.2 s | 2.9 s | 736 ms | 0.007 | 454 KB |
| gzip (like GitHub Pages), after | **86** | 1.2 s | **2.1 s** | **519 ms** | 0.007 | **383 KB** |

LCP runs, gzip: before 2.19 / 2.86 / 3.39 / 2.12 / 2.88 s, after 2.11 / 2.17 /
1.91 / 2.13 / 2.17 s. The after runs are also much steadier. On the plain
server LCP can't get under 2.5 s from here: its FCP floor is the 2.4 s it
takes to download 349 KB uncompressed on Lighthouse's simulated phone line.

### What changed

**Off-screen sections skip rendering until you scroll near them**
(`content-visibility:auto`). Style and layout of this long page were about
1.3 s of a throttled phone's main thread, and most of it was sections nobody
had scrolled to. Everything from Before & After down to the footer now waits
until it's close to the screen; the hero, the calculator and the trust strip
render as before. The LCP element is the hero headline (`.mh-headline`), which
fades in; with less layout work in the way, it appears sooner. Below-the-fold
photos inside skipped sections also stop being fetched up front (71 KB).

**It only does that on a fresh visit with no `#` in the address.** The first
version broke jump links: `/#qanda` landed 143 px off on a phone and 1,336 px
off at 1280, because the browser placed the section using estimated heights.
So a tiny script in `<head>` turns it on only for a normal visit (not back,
forward, reload or a `#` link), and turns it off the moment a `#` link on the
page is tapped. Checked: direct links to `#rain-ready`, `#allservices` and
`#qanda`, and tapping the page's links to six sections, land at exactly the
same spot as on `main` (80 px from the top) at 390 and 1280.

### Checked

- Quote calculator walked at 390 with every non-GET request aborted: all 9
  size/service/condition combinations priced right, Rain-Ready extras free on
  Full Details, "Pick my time" to step 8 (not tapped), "Text me this quote
  instead" form shown (not submitted). No page errors. Only GETs reached the
  calendar.
- "Next opening: Wed, Oct 7 at 1:00 PM" filled from the live calendar.
- Screen-by-screen screenshots of the whole page at 390 and 1280, scrolled
  top to bottom, against `main`: same page height (17,527 / 12,835 px), and
  the only differences are text landing up to 1 px lower, because each
  skipped section now snaps to whole pixels. `speed2-top-390.jpg` and
  `speed2-about-390.jpg` (before left, after right).
- Nothing fixed or sticky lives inside a skipped section (containment would
  pin it to the section instead of the screen). The comment in the CSS says
  to check that before adding a section.
- `check-site.py` passes.

### Looked at and left alone

- **Preload / fetchpriority for the LCP element:** it's text, not an image.
  The logo already has `fetchpriority="high"`.
- **Render-blocking CSS and fonts:** none. All CSS is inline, Google Fonts
  load with `media="print"` swap and `display=swap`, with preconnect.
  Preloading the font files themselves would mean hard-coding Google's
  versioned woff2 URLs, which change without notice.
- **defer/async:** GA, Clarity and `site-stats.js` already are; the rest is
  inline, and moving the calculator's script out of `index.html` is a
  restructure, not a speed tweak.
- **Header logo srcset:** Lighthouse says 13 KB could be saved by serving a
  smaller logo to lower-density screens. Small, and it's the first thing on
  the page, so I didn't swap it in a pass that promised no visible change.
- **The headline fade** is still the biggest LCP cost (it's why LCP sits
  about 0.9 s after FCP). Same as the first pass: showing it without the fade
  is a look change, so it's Mikey's call.
