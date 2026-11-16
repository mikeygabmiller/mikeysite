# Money pages rebuild: where it stands (2026-11-16, noon stop)

Handoff for the next session on the "huge and revolutionary" money-pages
goal. Not served (`reports/` is excluded).

## What happened

The overnight session `session_01VBLgm628cFEcWxoCmAnVFs` (Nov 10 to 11) built
an interior, exterior and paint correction rebuild but was started without
this repository attached, so GitHub refused every push (403). Its container
is gone. It sent Mikey a `mikeysite-night.bundle` file in that chat (interior,
exterior, reports; probably not paint correction).

On 2026-11-16 the interior work was rebuilt from that session's own log
(every file it wrote is recorded there) on top of current `main`, re-checked
and shipped: `tools/page-gen/lib.py`, `tools/page-gen/interior.py`, the
`images/job-*.webp` photos, and `MikeyQQC.start` in `index.html`
(`/?quote=interior&size=suv#booking`).

## What's next, in order

1. **Exterior** (`services/exterior.html`, $199 / $239 / $279, about 1 to 2
   hours). The old session's `exterior.py` is in its log (Nov 10, 13:05 UTC,
   a Bash heredoc) and in the bundle. Write `tools/page-gen/exterior.py` on
   the same `lib.py`; exterior photos come from `social/photos/` the same way.
2. **Full Detail**: there is no page of its own yet (`/services/` covers it).
   A new page means sitemap, `llms.txt`, About list, `PAGE_SERVICE`.
   Rain-Ready only through the calculator's own line.
3. **Paint correction** (`paint-correction-snohomish-county/`): the old
   session's `paint.py` is in its log (Nov 10, 22:23 UTC).
4. The old session's two research reports (competitor sites, products) are in
   its log as Write calls and in the bundle, if Mikey wants them in `reports/`.

Each one: tests (`deeplink` for all three services, the Rain-Ready
switch-off test), before/after at 390 px and laptop, merge, confirm live,
`sitemap-lastmod.py --apply`, `indexnow.py`.

## Needs Mikey's yes before writing

- What exactly is in a basic interior vs. with extraction (the site has never
  listed it step by step; the calculator's add-ons are the only list).
- Whether any photo should be described beyond "my work" (car model names
  are fine, owners' details never).
- Nothing else here needs a new price, offer, town or claim.
