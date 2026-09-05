# Working in this repo

## What this is, and what it isn't

This is **mikeysdetailing.com** — the public marketing site. Static HTML, no build
step, no framework, no npm at the root. It deploys through GitHub Pages (`CNAME`
pins the domain), so **whatever lands on `main` is what the world sees.** There are
no CI workflows; nothing catches a mistake after you merge.

The **dashboard** — the SMS/booking app Mikey actually works out of — is a different
repo, `twillowdashbored`, with its own rules. If the task is about threads, texts,
money entries or the ☰ admin UI, you are in the wrong repo.

Confusingly, `worker/` in *this* repo holds an older Cloudflare Worker for Twilio
SMS. It is deployed separately with `wrangler` and is **not** touched by a site
change. Leave it alone unless asked.

## Ship it: branch, gate, PR

1. Work on a feature branch off `main`.
2. **Run `python3 tools/check-site.py` and get a PASS.** This is the only gate the
   site has. See below.
3. Push, open a PR into `main`, squash merge.
4. Say plainly whether you verified the result, and how.

`tools/check-site.py` hardcodes `ROOT = /home/user/mikeysite`. If you are working
somewhere else, fix that line rather than skipping the gate.

## The gate is the whole safety net — treat a red one as red

`check-site.py` exits non-zero on: a page whose JSON-LD isn't a single `@graph`, a
`#business` or `#mikey` node that differs by even one byte between pages, a
`WebPage.url` that disagrees with the page's `<link rel="canonical">`, a broken
internal link, or a sitemap entry pointing at a page that doesn't exist. It warns
on a canonical URL missing from the sitemap.

If it fails, fix it — or prove the failure is pre-existing **by actually checking
out the base versions and re-running**, then name it in the PR body. Note that
`git stash` is a no-op once you've committed; use
`git checkout HEAD~1 -- <files>` to get a real before-picture.

`SKIP` in that script is the list of directories that live in the repo but are not
part of the published site. Parking a page means unlinking it *and* adding it to
`SKIP`, so a green gate keeps meaning something.

## A visual change isn't done until you've looked at it

The homepage is a single 5,000-line, 240KB `index.html` carrying dozens of
independently scoped style blocks. Reading CSS is not enough to know what renders. Chromium is
available; drive it and **measure**:

```js
const { chromium } = require('playwright-core');
// executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
// page.goto('file:///home/user/mikeysite/index.html')
```

Get real numbers out of `getBoundingClientRect()`, and check **412px, 800px and
1280px at minimum**. Layout bugs here are not reliably "mobile bugs": the services
grid is 3-up on desktop, which makes each card ~392px — narrower than a phone in
portrait. A bug reported on a phone is very often on the laptop too.

## Single sources of truth, and the places they leak

- **Pricing lives on the homepage.** City and service pages mirror it. Change a
  price in one place and the gate won't catch the drift — grep for the old number.
- **Counts live in `site-stats.js`** (`reviewCount`, `rating`, `carsDetailed`). It rewrites the
  visible numbers and the rating schema *in the browser*. But most AI crawlers
  (GPTBot, PerplexityBot, ClaudeBot) don't run JS — they only read raw HTML. So the
  numbers hard-coded in each page are what ChatGPT quotes. **Update both**, or the
  site starts lying to assistants. `site-stats.js` says this at the top; believe it.
- **JSON-LD is generated.** `tools/build-entity-graph.py` rewrites every page's
  schema into one linked entity graph. Don't hand-edit a `@graph` block; change the
  generator and re-run, or the byte-identical `#business` check will fail.

## Copy: how Mikey actually talks

He is one guy with a van, not a company. Headlines are **first person and concrete**.

- Say what a thing *is*: "Cars I detailed this month," not "Real Cars. Real Results."
- Avoid the tells: parallel two-beat constructions ("Real X. Real Y."), a three-beat
  hype tag ("...Period."), "Elevate," "Transform," "Unlock," em-dash-joined
  abstractions. If a line could sit on any detailer's site in any state, rewrite it.
- Specifics beat adjectives. "300+ cars across Snohomish County, not one refund"
  earns trust; "premium quality service" doesn't.
- **"You don't pay until you love it" is fixed.** It's the slogan, and it also lives
  in the meta description, the `LocalBusiness` schema `slogan` field, and the service
  cards. Never change it in only one place. Same for "The Love It Guarantee."

Headline taste is Mikey's call. Propose options rather than silently rewriting
several at once.

## Stop and ask about these

- **Prices, guarantee terms, or the service area.** These are promises to real
  customers, not copy.
- **Anything the SMS worker sends**, or its Twilio/Cloudflare secrets.
- **Removing a page that's in the sitemap.** Search traffic is the point of most of
  these 35 pages. Prefer parking (unlink + `SKIP`) over deleting, so it's one commit
  to bring back.
- **`robots.txt`, canonicals, redirects.** Easy to quietly de-index the business.

## House style

Match the block you're editing — the file is a stack of self-contained sections,
each with its own scoped `<style>`, and they don't share conventions. Write comments
that explain **why a decision was made** and what breaks without it, not what the
line does. When you fix a layout bug, say in the comment what actually collided and
at which widths, so the next person doesn't re-derive it.
