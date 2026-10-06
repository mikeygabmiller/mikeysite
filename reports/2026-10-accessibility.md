# Accessibility pass, October 2026 (WCAG 2.1 AA)

Run 2026-10-06 on every URL in `sitemap.xml`, plus `/onbored/` and `/404.html`
(45 pages), at 390 x 844 in Chromium. Every non-GET request was aborted, so
nothing was booked, texted or sent.

## What I ran

- **axe-core 4.x** on every page (`2026-10-accessibility/axe.cjs`), tags
  wcag2a, wcag2aa, wcag21a, wcag21aa and best-practice.
- **Keyboard walk of the homepage quote calculator** (`tab.cjs`): Tab from the
  top of the page, then through every step with Enter and Space only, typing
  a car and a town, to the price screen and out the other side.
- **The forms you only see after a tap** (`forms.cjs`): the "Text me this quote
  instead" form, the booking form (steps 7 and 8) and every screen of the call
  page, shown with CSS and checked for labels and names.

Run them from a folder with `axe-core` and `playwright` installed, with the
site served on `localhost:8099` (`python3 -m http.server 8099`).

## Before and after (axe, all 45 pages)

| Finding | Impact | Before | After |
|---|---|---|---|
| Form field without a label | critical | 1 | 0 |
| Link or control whose name doesn't match its visible text | serious | 2 | 0 |
| Links inside a picture (`role="img"`) | serious | 1 | 0 |
| Grey text too faint | serious | 14 | 3 (see below) |
| Brand red too faint on black | serious | 493 | 493 (Mikey's call) |
| Red link in grey text, no underline | serious | 2 | 2 (brand red) |
| No skip link | (manual check) | 40 pages | 0 |
| `region`, `landmark-one-main` | moderate | 291 | 1 page (the call page, left alone) |
| `heading-order` | moderate | 28 | 28 (Mikey's call) |

## Keyboard walk

- First Tab on the homepage lands on **Skip to main content**.
- Every calculator control is reachable: vehicle, Full Detail, Interior,
  Exterior, Back, Continue, the three condition choices, car, town, notes,
  add-ons, "See my quote", then "Pick my time", "Text me this quote instead"
  and "Edit my details".
- Picking a choice moves focus into the next step, so nobody is left on a
  hidden button.
- Every stop inside the calculator has a visible focus ring. No trap: Tab
  carries on out of the calculator to the Rain-Ready section.
- The map pins and the "Check my area" box looked like they had no focus ring
  to the script, but they do: the pin grows a red ring and the box's border
  turns red. No change needed.
- Steps 7 and 8 (picking a time) need the live calendar, which a local copy
  can't reach, so those were checked for labels and names but not walked.

## What I fixed

1. **Skip link on 40 pages** that had none (every sitemap page that didn't
   already have one, plus the 404). It's the first thing Tab
   reaches and jumps to the page's main heading. The call page has no menu to
   skip, so it doesn't get one.
2. **Polish Test**: the copy-the-code box had no label. It's now "Code to put
   the Polish Test on your site". Its faintest grey went from `#6d7681` to
   `#7a838e` (4.3:1 to 5.2:1).
3. **Google reviews card** (homepage, maintenance page): its hidden label said
   "Read my reviews on Google" while the card shows "Google Reviews 5.0 ... Read
   all 41 reviews on Google", so a voice-control user saying what they see
   couldn't click it. The card's own text is now its name.
4. **Service-area map**: it was marked as a picture while holding twelve
   buttons, so screen readers skipped the buttons. It's a group now. The
   Snohomish pin read "Snohomish, home base from home base"; it now reads
   "Snohomish, home base. Show details." Both changes are in
   `tools/service-area-map.py` too, and the homepage matches its output.
5. **Footer button** "Book Your Detail Today" on the homepage, About and
   maintenance pages showed grey `#ccc` on red (3.7:1) because the footer link
   rule beat the button's white. It's white again (5.9:1). Wording untouched.
6. **Footer copyright line** on `services/interior.html` and
   `services/exterior.html`: grey `#555` to `#8a8a8a` (2.7:1 to 5.7:1).
7. **Alt text** on the homepage, services and maintenance galleries said
   things like "Vehicle after mobile detailing in Snohomish County". I looked
   at each photo and wrote what's in it: "Green Audi R8 with bronze wheels on a
   gravel driveway after a full detail". On the maintenance page the photos
   are detailing photos that were labelled as maintenance work ("Car after a
   full maintenance service"); they now just describe the car.

No price, offer, town, guarantee wording or Clean Club word changed. Nothing
on the call page changed: it passed labels, names and focus as it was.

## What's left, and why

**For Mikey to decide:**

- **The brand red on black fails contrast, 493 times on 44 pages.** `#c8102e`
  on the site's blacks is 2.9 to 3.4:1. Body text needs 4.5:1; big headings
  (24px+, or 19px+ bold) need 3:1, and those mostly pass. What fails is small
  red text: the "Mikey's Mobile Detailing" eyebrows, prices in tables, red
  links like "Back to home", the phone number in the header, the Next opening
  line. I didn't touch it (brand colour). Two ways out: a lighter red only for
  small text on black (`#ff4d5e` clears 4.5:1 on every black the site uses, 5.3 to 6.1:1), keeping
  `#c8102e` for buttons and big headings; or white text with a red underline
  for small links. Your call.
- **Red "See Monroe page" and "See Mukilteo page" links** on
  `/mobile-car-detailing-near-me/` sit in grey text with no underline, so
  they're told apart by colour alone. An underline would fix it without
  touching the red.
- **Two links on `/how-long-does-car-detailing-take/` are browser-default
  blue** (`#0000ee`, 2:1 on black): "headlight restoration" and "odor
  removal", the links to the two blog posts. They're missing the page's link colour. That's a link colour choice,
  so I left it.
- **`services/interior.html` shows "[ IMAGE SLOT, replace with interior shot
  ]"** to visitors, in very faint grey. That's a missing photo, not a
  contrast problem: it needs a real interior photo or the box taken out.
- **Plates in two gallery photos.** The black Lexus (`unnamed (3).webp`) and
  the grey Honda Pilot (`unnamed (5).webp`) may show readable plates at full
  size. The social posts blur plates; the site's photos don't. Worth a look.

## Second pass, same day: a `<main>` on every page

26 pages had no `<main>`, so screen readers had no "main content" to jump
to and axe flagged everything on them as outside a landmark. Each one now
wraps everything between the header and the footer in `<main
id="main-content">`, and its skip link points there. The parked Granite Falls
page got the same, plus the skip link it was missing, so it's ready when it
goes up in November.

- **Three skip links pointed home.** `paint-correction-snohomish-county`,
  `pet-hair-removal-car-detailing` and `mobile-car-detailing-near-me` had
  "Skip to main content" linking to `/`, so pressing it left the page. They
  now jump to the content.
- **Nothing anyone can see changed.** None of these pages has a CSS rule
  that targets `main`, and none uses `body >` selectors. I screenshotted all
  27 pages full length, before and after, at 390 x 844 (phone, touch) and
  1280 x 800: **54 of 54 identical, pixel for pixel**
  (`2026-10-accessibility/shots.cjs`, `cmp.py`). Animations were frozen and
  outside requests (Google Fonts, analytics) blocked in both runs, so the
  comparison is of the page itself. Two runs of the unchanged site differ by
  one 6 px strip in the phone header of the paint correction page (something
  in it moves on its own), so that's the noise floor; the after run matched
  the first before run exactly.
- axe on those 27 pages after the change: no `landmark-one-main` and no
  `region`.
- **Left alone:** the call page (`/onbored/`) still has no `<main>`. The rule
  for that page is labels, names and focus only. It's one screen with no
  menu, so nothing is lost; adding it is Mikey's call.

**Still not done:**

- `heading-order` on 25 pages: a heading level skipped (an h4 after an h2).
  Changing heading levels changes how they look, so it wants a look at each.
