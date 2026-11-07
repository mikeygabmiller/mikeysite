#!/usr/bin/env python3
"""Write the one site header (tools/site-header/header.html) into every page.

Mikey, 2026-11-07: one header on every page. Until then 41 pages (every city
page, every blog post, Services, the guides) had a text "Mikey's." with no
menu, three more had a two-row header, and only the homepage, About, Reviews,
Maintenance and the legal pages showed the truck logo with a menu.

Those nine keep their own #mikeyHeader (the homepage's links are in-page
anchors and its hero is sized around it). Every other served page gets this
one, between the two markers below. To change the header: edit
tools/site-header/header.html, run this with --apply, then check-site.py,
which fails on any page whose copy differs from the template.

  python3 tools/site-header.py           # report what would change
  python3 tools/site-header.py --apply   # write it

{{BOOK}} in the template becomes "#booking" on a page with its own quote
section (id="booking"), so Book Now stays on the page, and "/#booking"
everywhere else.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "tools" / "site-header" / "header.html"
START = "<!-- site-header: written by tools/site-header.py from tools/site-header/header.html. Edit that file and rerun; don't edit here. -->"
END = "<!-- /site-header -->"
# Not served (see _config.yml), or kept out on purpose: the call page is white
# with its own light logo and no way off it, by design.
SKIP_DIRS = {"mockups", "systems", "_disabled", "social", "print", "tools", "drafts",
             "outreach", "reports", "node_modules", "onbored", "onboard"}
# The old headers this replaces: the text logo, and the two-row status-pill one.
OLD = re.compile(r'<header\b[^>]*>(?:(?!</header>).)*?(?:class="logo">Mikey|class="status-pill")(?:(?!</header>).)*</header>', re.S)
BLOCK = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        if p.relative_to(ROOT).parts[0] in SKIP_DIRS:
            continue
        yield p


def render(src):
    book = "#booking" if 'id="booking"' in src else "/#booking"
    return START + "\n" + TEMPLATE.read_text(encoding="utf-8").replace("{{BOOK}}", book).rstrip("\n") + "\n" + END


def expected(src):
    """The page with its header block as the template writes it, or None if
    the page doesn't take this header (it has its own #mikeyHeader)."""
    if START in src:
        return BLOCK.sub(lambda m: render(src), src, count=1)
    if OLD.search(src):
        return OLD.sub(lambda m: render(src), src, count=1)
    return None


def main():
    apply = "--apply" in sys.argv
    changed = 0
    for p in pages():
        src = p.read_text(encoding="utf-8")
        new = expected(src)
        if new is None or new == src:
            continue
        changed += 1
        print(("wrote " if apply else "would change ") + str(p.relative_to(ROOT)))
        if apply:
            p.write_text(new, encoding="utf-8")
    print(f"{changed} page(s) {'changed' if apply else 'to change'}")


if __name__ == "__main__":
    main()
