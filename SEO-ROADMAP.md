# Mikey's Mobile Detailing — SEO Roadmap

Goal: dominate local search in Snohomish County + north King County and turn that
into consistent, predictable leads. Updated 2026-05-30.

This is a 3-property ecosystem. SEO has to treat all three together:

| Property | What it is | Note |
|---|---|---|
| `mikeysdetailing.com` | Main site (30 pages, static, GitHub Pages) | Strong foundation |
| `mikeygabmiller.github.io/MyQqc/` | Quick-Quote booking app (linked from every page) | **Off-domain — see "Booking migration"** |
| `blog.mikeysdetailing.com` | Blog subdomain | Consider moving to `/blog/` to consolidate authority |

---

## ✅ Done (this round)

- **Fixed corrupted structured data**: Snohomish (flagship) had a truncated
  LocalBusiness schema; Lake Stevens & Duvall had GA4 pasted *inside* JSON-LD
  (breaking both the schema and analytics). All repaired.
- **Restored Duvall's hero "Get Quote" button** (it had been destroyed by a bad
  paste) and moved the booking iframe into a proper `#booking` section.
- **GA4 now fires on all 30 pages** (it was missing on 20 — we were blind to
  traffic/conversions on most of the site).
- **BreadcrumbList schema on all 27 sub-pages** (was homepage-only).
- **Added `image` to 17 location schemas** + fixed 2 schema `image` URLs that
  pointed at a non-existent file.
- **Two new city pages**: `/bothell/` (schema already claimed it) and
  `/marysville/` — unique local content, full schema, booking iframe, wired into
  sitemap + homepage + neighbor footers.

Verified: 30 pages, 0 JSON-LD errors, 0 broken internal links, sitemap in sync.

---

## 🔴 Tier 1 — Biggest lead drivers (off-site — YOU do these)

These move the needle more than anything in the code. ~70% of detailing leads
come from the Map Pack / Google Business Profile, not classic web search.

### 1. Google Business Profile (GBP)
- Primary category: **Car Detailing Service**. Add every relevant secondary.
- Add all services with descriptions + prices ($130–$340).
- **Upload geotagged photos weekly** (before/afters, you working in each city).
- Post a GBP update **1×/week** (offer, recent job, seasonal tip).
- Answer your own **Q&A** with your top FAQs.
- Set service area to every city you cover (now incl. Bothell, Marysville).

### 2. Review engine (you're at 5.0 / 38 — velocity matters)
- Target **1–2 new reviews/week**. Text the `g.page/r/CRCuKQ982VIZEBE` link the
  moment you finish, while the customer is looking at the clean car.
- Ask them to **mention city + service** ("interior detail in Lake Stevens").
- Update the count in `site-stats.js` (one number → updates the whole site).

### 3. Citations / NAP consistency
- Same Name/Address/Phone on Yelp, Apple Maps, Bing Places, Nextdoor, FB.
- Phone everywhere: **(425) 600-7897**. Get listed in local/auto directories.

---

## 🟡 Tier 2 — Booking migration (kills the github.io leak)

Every page links to `mikeygabmiller.github.io/MyQqc/`. That sends users + trust
signals to a different domain. Move it on-brand:

1. Host the quote app at **`book.mikeysdetailing.com`** (CNAME) or `/book/`.
2. Once live, find/replace all `https://mikeygabmiller.github.io/MyQqc/`
   references in this repo (≈65) with the new URL. (Claude can do this in one pass.)
3. Update the iframe `src` in the `#booking` sections too.

---

## 🟢 Tier 3 — Next city pages (queue — 1–2 per MONTH max)

Do NOT bulk-publish; Google flags mass doorway pages. Copy `/bothell/` as the
template, swap the data below, and rewrite the local prose so it's genuinely
unique (neighborhoods, roads, landmarks, local pain points).

| City | ZIP | Lat, Lng | County | Local hooks |
|---|---|---|---|---|
| Mukilteo | 98275 | 47.9445, -122.3046 | Snohomish | Ferry, Paine Field, Harbour Pointe, bluff homes |
| Lynnwood | 98036 | 47.8279, -122.3051 | Snohomish | Alderwood mall, I-5/405, Link light rail, apartments |
| Edmonds | 98020 | 47.8107, -122.3774 | Snohomish | Ferry, bowl/downtown, waterfront, salt air on paint |
| Arlington | 98223 | 48.1987, -122.1251 | Snohomish | Smokey Point, airport, trucks, rural acreage |
| Stanwood | 98292 | 48.2415, -122.3496 | Snohomish | Camano, farmland, boats/RVs, coastal grime |
| Woodinville | 98072 | 47.7543, -122.1635 | King | Wine country, estates, premium detailing demand |
| Granite Falls | 98252 | 48.0832, -121.9676 | Snohomish | Mountain Loop, trucks, mud/trail dirt |

Each page needs: unique AutoDetailing + FAQ + BreadcrumbList schema, GA4, the
`#booking` iframe, a real photo, inbound links from 2–3 neighbor footers + the
homepage city list, and a sitemap entry.

---

## 🔧 Manual fixes Claude couldn't do from the sandbox

- **Self-host the brand images.** OG image (`iili.io/qKtjLcx.jpg`) and logo
  (`i.ibb.co/...`) live on free third-party hosts that can vanish and break every
  page's social preview + logo. Download them, drop into `/images/`
  (e.g. `og-image.jpg` at 1200×630, `logo.jpg`), then swap the URLs sitewide.
- **Add real, varied photos** to the bare pages (`/services/`, `/snohomish/`,
  `/everett/` have few/no images) — geotag alt text with the city + service.

---

## 📊 Measure
- Verify **Google Search Console**, submit `sitemap.xml`, watch queries + CTR.
- In GA4, mark the quote-submission event as a **conversion** and track which
  pages/cities drive booked jobs. Double down on what converts.
