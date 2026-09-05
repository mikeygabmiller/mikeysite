# mikeysdetailing.com

Static site for **Mikey's Mobile Detailing**, a one-man mobile car detailing
business in Snohomish, WA. Served by GitHub Pages straight from this repo — no
build step, no framework. The HTML in here is the HTML that ships.

## Read this before editing

**[`CLAUDE.md`](CLAUDE.md) holds the ground truth about the business** — what
Mikey brings to a job versus what the customer provides, pricing, the guarantee,
and exactly which towns he serves. Every one of those is a promise made to a real
customer on a live page, so check it there rather than guessing.

The two that get miswritten most often:

- **Mikey does not bring his own water or power.** He brings all the tools and
  products and runs them off the customer's outdoor spigot and power outlet.
- **Lynnwood and Edmonds are not in the service area**, even though they're
  nearby and appear on the map as "ask me" towns.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole homepage, one file. Sections are self-contained, each with its own scoped `<style>` and `<script>`. |
| `<city>/` | City landing pages (Snohomish, Everett, Monroe, Lake Stevens, Mill Creek, Duvall, Bothell, Marysville). |
| `services/` | Service detail pages. |
| `tools/` | Helper scripts, including `service-area-map.py`, which regenerates the service-area map SVG from real coordinates. |
| `worker/` | Cloudflare Worker that receives quote leads and sends the follow-up text. |
| `*.md` | Growth, SEO and business planning docs, plus the homepage section-order analysis. |

## Local preview

No tooling required — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Regenerating the service-area map

The map in the "Areas I Serve" section is an inline SVG with pins projected from
real latitude and longitude, so don't nudge coordinates by hand:

```sh
python3 tools/service-area-map.py
```

Paste the resulting `tools/service-area-map.svg` over the `<svg class="sa-map">`
block in `index.html`, and update the matching entry in that section's `TOWNS`
list so the checker and the map stay in agreement.
