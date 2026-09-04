#!/usr/bin/env python3
"""Push the numbers in site-stats.js into the raw HTML of every page.

Why this exists
---------------
site-stats.js rewrites review counts, ratings and car counts *in the browser*.
Google runs JavaScript, so Google sees the right numbers. Most AI crawlers
(GPTBot, PerplexityBot, ClaudeBot, …) do not — they only ever read the raw
HTML that ships from the server. So whatever number is baked into the file is
the number ChatGPT and Perplexity will quote about this business.

Keeping those two in sync by hand is the step that kept getting missed. Run
this after bumping a number in site-stats.js and it does the whole site:

    python3 tools/sync-stats.py            # apply
    python3 tools/sync-stats.py --check    # CI-style: fail if out of sync

It updates, everywhere:
  * elements marked data-md-reviews / data-md-rating / data-md-cars
  * bare "<N>+ reviews", "<N> Google reviews", "<N>+ five-star reviews" prose
  * <div class="stat-num">N+</div> under a "Reviews" label
  * aggregateRating.reviewCount and ratingValue in JSON-LD

It deliberately does NOT touch numbers that merely happen to equal the review
count — the quote calculator's data-value attributes, prices, CSS, and so on.
"""
import re, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"mockups", "systems"}


def read_stats():
    """Pull MD_STATS out of site-stats.js without executing any JavaScript."""
    js = (ROOT / "site-stats.js").read_text(encoding="utf-8")
    body = re.search(r"window\.MD_STATS\s*=\s*\{(.*?)\};", js, re.S)
    if not body:
        sys.exit("could not find window.MD_STATS in site-stats.js")
    out = {}
    for key in ("reviewCount", "rating", "carsDetailed"):
        m = re.search(rf"{key}\s*:\s*\"?([\d.]+)\"?", body.group(1))
        if not m:
            sys.exit(f"could not read {key} from site-stats.js")
        out[key] = m.group(1)
    return out


def sync(html, s):
    """Return (new_html, number_of_edits)."""
    reviews, rating, cars = s["reviewCount"], s["rating"], s["carsDetailed"]
    n = [0]

    def sub(pattern, repl, text, flags=0):
        text, k = re.subn(pattern, repl, text, flags=flags)
        n[0] += k
        return text

    # 1) data-md-* elements: the attribute holds the template, e.g. "{n}+".
    for attr, value in (("data-md-reviews", reviews),
                        ("data-md-rating", rating),
                        ("data-md-cars", cars)):
        def repl(m, value=value):
            tmpl = m.group("tmpl")
            inner = tmpl.replace("{n}", value) if "{n}" in tmpl else value
            return f"{m.group('open')}{inner}<"
        html = sub(
            rf'(?P<open><(?P<tag>span|strong|div|b)[^>]*{attr}="(?P<tmpl>[^"]*)"[^>]*>)[^<]*<',
            repl, html)

    # 2) Prose and meta text: "40+ five-star reviews", "40 Google reviews", …
    html = sub(r'\b\d+(\+?)(\s+(?:five-star|Google|5-star)\s+|\s+)reviews\b',
               lambda m: f"{reviews}{m.group(1)}{m.group(2)}reviews", html)

    # 3) Stat tiles whose label is "Reviews".
    html = sub(r'(<div class="stat-num">)\d+(\+?</div><div class="stat-label">Reviews)',
               lambda m: f"{m.group(1)}{reviews}{m.group(2)}", html)

    # 4) JSON-LD aggregateRating.
    html = sub(r'("reviewCount"\s*:\s*")\d+(")',
               lambda m: f"{m.group(1)}{reviews}{m.group(2)}", html)
    html = sub(r'("ratingValue"\s*:\s*")[\d.]+(")',
               lambda m: f"{m.group(1)}{rating}{m.group(2)}", html)

    return html, n[0]


def main():
    check = "--check" in sys.argv
    stats = read_stats()
    pages = [p for p in sorted(ROOT.rglob("*.html"))
             if p.relative_to(ROOT).parts[0] not in SKIP]

    stale, edits = [], 0
    for p in pages:
        old = p.read_text(encoding="utf-8")
        new, k = sync(old, stats)
        if new != old:
            stale.append(str(p.relative_to(ROOT)))
            edits += k
            if not check:
                p.write_text(new, encoding="utf-8")

    label = (f"reviews={stats['reviewCount']} rating={stats['rating']} "
             f"cars={stats['carsDetailed']}")
    if check:
        if stale:
            print(f"OUT OF SYNC ({label}) — {len(stale)} page(s):")
            for f in stale:
                print("  ✗", f)
            sys.exit(1)
        print(f"in sync ({label}) · {len(pages)} pages")
    else:
        print(f"synced to {label} · {len(pages)} pages checked · "
              f"{len(stale)} updated · {edits} value(s) rewritten")


if __name__ == "__main__":
    main()
