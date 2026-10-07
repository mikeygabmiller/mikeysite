#!/usr/bin/env python3
"""
Tell Bing (and the other IndexNow engines) which pages changed, so they
recrawl them now instead of whenever they get round to it.

Why: Bing's index is what ChatGPT search and Copilot read, and the October
scoreboard found AI answers still quoting prices the site retired weeks
earlier. IndexNow is the documented way to say "this URL changed, come get
it" (https://www.indexnow.org/documentation). Google doesn't take part; it
reads sitemap.xml's lastmod instead (tools/sitemap-lastmod.py).

The key is the 32-character .txt file at the site root. It isn't a secret:
the engines fetch it from the live site to check a submission came from
whoever controls the domain, which is why this script checks it's live first.

    python3 tools/indexnow.py                     # every URL in sitemap.xml
    python3 tools/indexnow.py /everett/ /blog/    # just these

Run it after a merge is live on mikeysdetailing.com, not before: an engine
that recrawls early gets the old page.
"""
import json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = "mikeysdetailing.com"
SITE = f"https://{HOST}/"
ENDPOINT = "https://api.indexnow.org/indexnow"


def key():
    found = [p for p in ROOT.glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}\.txt", p.name)]
    if len(found) != 1:
        sys.exit(f"expected one IndexNow key file at the site root, found {[p.name for p in found]}")
    return found[0].stem


def urls(args):
    if args:
        return [SITE + a.lstrip("/") if not a.startswith("http") else a for a in args]
    return re.findall(r"<loc>([^<]+)</loc>", (ROOT / "sitemap.xml").read_text(encoding="utf-8"))


def main(args):
    k = key()
    location = f"{SITE}{k}.txt"
    try:
        live = urllib.request.urlopen(location, timeout=20).read().decode().strip()
    except Exception as e:
        sys.exit(f"the key file isn't live yet ({location}: {e}); merge and wait for the deploy first")
    if live != k:
        sys.exit(f"{location} doesn't hold the key")
    batch = urls(args)
    body = json.dumps({"host": HOST, "key": k, "keyLocation": location, "urlList": batch}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            status = r.status
    except urllib.error.HTTPError as e:
        status = e.code
    meaning = {200: "accepted", 202: "accepted, key check pending", 400: "bad request",
               403: "key not valid for this host", 422: "a URL isn't on this host",
               429: "too many requests, try later"}.get(status, "unexpected")
    print(f"IndexNow: {len(batch)} URL(s), HTTP {status} ({meaning})")
    sys.exit(0 if status in (200, 202) else 1)


if __name__ == "__main__":
    main(sys.argv[1:])
