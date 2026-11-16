# Money pages rebuild: where it stands (2026-11-16, noon stop)

Handoff for the next session on the "huge and revolutionary" money-pages
goal. Not served (`reports/` is excluded).

## What the earlier session left

Session `session_01VBLgm628cFEcWxoCmAnVFs` (scheduled overnight run, Nov 10
to 11) **did build pages, but GitHub refused every push**: it was started
without this repository attached, so the git proxy answered 403 ("not in this
session's authorized repository set"). It committed locally on
`claude/night-03-exterior-page`, `claude/night-04-reports` and
`claude/night-05-paint-correction`, with generator scripts for interior,
exterior and paint correction, then packed the night-* branches into
`mikeysite-night.bundle` (1.5 MB, Nov 10 22:22 UTC) and sent it to Mikey as a
file in that session's chat. The paint correction branch was committed after
that bundle, so it is probably not in it. The container itself is gone.

To recover: download the bundle from that session's chat, attach it to a new
session, then `git fetch mikeysite-night.bundle 'refs/heads/*:refs/heads/*'`,
re-check every page against CLAUDE.md (main has moved a week since), and push.

## What the repo actually has

- **No interior, exterior or full-detail page exists.** No served path
  contains `interior`, `exterior` or `full`. The only standalone service pages
  are `ceramic-coating-snohomish-county/` (6,970 words, the standard to match,
  rebuilt 2026-11-07) and `paint-correction-snohomish-county/` (3,775 words,
  not yet rebuilt). So "rebuild interior first" is really "build the interior
  page for the first time", which makes it a new page: sitemap, `llms.txt`,
  About list, `PAGE_SERVICE` in `tools/build-entity-graph.py`, the site header
  script, `sitemap-lastmod.py`, then `check-site.py`.
- CLAUDE.md's SEO section mentions "two city interior pages" with no
  impressions. They don't exist as directories now; worth a grep of
  `_disabled/` and the scoreboard before assuming either way.
- Interior photos already in `images/`: `audi-etron-interior.webp`,
  `cadillac-escalade-interior.webp`, `volvo-interior.webp`,
  `backseat-before-after.webp`, and the calculator's condition shots
  `ba_1` (clean back seat), `ba_2` (food in leather), `ba_4` (cluttered
  cargo), each with a `-540` size. Caption them as his work, nothing more.

## Suggested order for the next session

1. **Interior page** at `/interior-detailing-snohomish-county/` (matches the
   two existing service slugs). Copy the ceramic page's structure and `.cc-*`
   CSS approach, not its words. Facts only from the CLAUDE.md table:
   $249 / $289 / $329, about 90 minutes basic, 2 to 4 hours with extraction
   or pet hair, customer provides spigot and outlet, payment after the work.
   Path into the quote: link to `/#booking` with the calculator's prefill if
   it supports interior (check `MikeyQQC.book({service:...})` in
   `index.html`); don't build a second calculator unless asked.
   Link it from the pet hair page and the smells/coffee blog posts, and back.
2. Exterior ($199 / $239 / $279, about 1 to 2 hours), then Full Detail
   ($369 / $409 / $449, 3 to 5 hours, Rain-Ready mention only through the
   existing calculator line, never a new offer piece).
3. Paint correction rebuilt to the ceramic standard.

Each one: before/after screenshots at 390 px and laptop width, sent to
Mikey (not a gate), then merge and confirm live, `sitemap-lastmod.py
--apply`, `indexnow.py`.

## Needs Mikey's yes before writing

- What exactly is in a basic interior vs. with extraction (the site has never
  listed it step by step; the calculator's add-ons are the only list).
- Whether any photo should be described beyond "my work" (car model names
  are fine, owners' details never).
- Nothing else here needs a new price, offer, town or claim.
