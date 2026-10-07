#!/usr/bin/env python3
"""
Set each <lastmod> in sitemap.xml to the day its page last changed.

Why: on 2026-10-07, 31 of the 43 URLs still said 2026-08-01, though the
2026-10-05 fact audit had changed their prices, durations and FAQs. lastmod is
how Google and Bing decide what to recrawl first, and a stale one leaves the
old copy in their index: the October scoreboard found AI answers quoting
prices the site had retired weeks before.

The date is the last commit that touched the page's file. A page with
uncommitted changes counts as today (UTC, the same clock the commits use), so
running this before you commit dates your edit correctly.

    python3 tools/sitemap-lastmod.py           # show what would change
    python3 tools/sitemap-lastmod.py --apply   # write sitemap.xml

It needs real history. Session clones are shallow, and in a shallow clone
every page older than the clone reads as the clone's first commit, so this
refuses to run there: `git fetch --unshallow origin main` first.
check-site.py uses expected() below and only judges the pages it can date.
"""
import re, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://mikeysdetailing.com/"
URL = re.compile(r"(<loc>" + re.escape(SITE) + r"([^<]*)</loc>\s*<lastmod>)([^<]*)(</lastmod>)")


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True).stdout.strip()


def page_file(path):
    return ROOT / (path + "index.html" if path == "" or path.endswith("/") else path)


def expected(sitemap):
    """{path: (current lastmod, the date it should be or None if unknown)}"""
    today = datetime.now(timezone.utc).date().isoformat()
    shallow_file = ROOT / ".git" / "shallow"
    boundary = set(shallow_file.read_text().split()) if shallow_file.exists() else set()
    out = {}
    for m in URL.finditer(sitemap):
        path, current = m.group(2), m.group(3)
        f = page_file(path)
        rel = str(f.relative_to(ROOT))
        if not f.exists():
            out[path] = (current, None)
        elif git("status", "--porcelain", "--", rel):
            out[path] = (current, today)
        else:
            sha, _, day = git("log", "-1", "--format=%H %cs", "--", rel).partition(" ")
            # In a shallow clone, a page last touched before the clone's first
            # commit shows that commit instead. Its real date is unknown.
            out[path] = (current, None if (not sha or sha in boundary) else day)
    return out


def main(apply):
    if git("rev-parse", "--is-shallow-repository") == "true":
        sys.exit("shallow clone: run `git fetch --unshallow origin main` first, or every older page dates to the clone")
    sm = ROOT / "sitemap.xml"
    text = sm.read_text(encoding="utf-8")
    want = expected(text)
    changes = [(p, cur, new) for p, (cur, new) in want.items() if new and new != cur]
    for p, cur, new in changes:
        print(f"{'set' if apply else 'would set'} /{p}: {cur} -> {new}")
    if apply and changes:
        text = URL.sub(lambda m: m.group(1) + (want[m.group(2)][1] or m.group(3)) + m.group(4), text)
        sm.write_text(text, encoding="utf-8")
    missing = [p for p, (_, new) in want.items() if new is None and not page_file(p).exists()]
    for p in missing:
        print(f"no file for /{p}")
    print(f"\n{len(changes)} of {len(want)} dates {'changed' if apply else 'to change'}")


if __name__ == "__main__":
    main(apply="--apply" in sys.argv)
