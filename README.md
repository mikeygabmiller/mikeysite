# 4 SEO Pages — Deploy Notes

## What's in here

- `lake-stevens/index.html` → `/lake-stevens/` route
- `mill-creek/index.html` → `/mill-creek/` route
- `duvall/index.html` → `/duvall/` route
- `services/full-detail/index.html` → `/services/full-detail/` route
- `sitemap.xml` → root
- `robots.txt` → root

## Deploy (Netlify drag-drop)

When you're ready: zip the folder, drag into Netlify deploy. Each `index.html` in its own folder = clean URLs (no `.html` in the path).

If using GitHub: commit folder structure as-is, point Netlify at the repo, set publish directory to root.

## What's already set up for SEO

- LocalBusiness / AutoDetailing schema (city-specific, with geo coords)
- FAQ schema (rich snippets in Google)
- Service schema on full-detail page
- Canonical URLs
- OpenGraph tags (Facebook/LinkedIn previews)
- Internal linking between all 4 pages + footer
- Mobile responsive
- Single sticky header
- Real local content (neighborhoods, landmarks, drive-time references)

## Stuff YOU need to swap before going live

1. **Phone number** — schema has empty telephone field. Add yours.
2. **Logo** — currently text "Mikey's." Drop your logo image if you have one.
3. **OG image** — schema references `og-image.jpg` at root. Drop one in (1200x630px ideal).
4. **Real photos** — every page has 0 images. Adding a hero photo + before/afters per city = huge engagement boost. Tag images with city in alt text (e.g., `alt="Mobile detailing in Lake Stevens WA"`).
5. **Add Monroe page** — footer links to `/monroe/` but you'll need to drop your existing Monroe page in that folder.
6. **Submit sitemap** — once live, paste `https://mikeysdetailing.com/sitemap.xml` into Google Search Console.

## Why these 4 pages

- **Location pages** rank for "mobile detailing [city]" — high-intent local searches.
- **Full detail page** captures highest-ticket searches AND links to all locations (passes SEO juice).
- Each page targets a different query cluster, so they don't cannibalize each other.

## Adding more cities later

Copy any location folder, rename it, swap the city name + neighborhoods + lat/long + FAQ. ~30 min per page. Don't add more than 1-2 per month or Google might think you're spamming.
