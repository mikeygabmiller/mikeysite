# -*- coding: utf-8 -*-
"""Look at the pins. Draws every chosen spot on the 2023 aerial photo so a
person can see, in a minute a town, whether the pin is on grass beside the
right road, facing the cars it says it faces.

    python3 print/tools/sign-spots.py          # first: it caches the photo index
    python3 print/tools/sign-spot-check.py     # top 16 per town
    python3 print/tools/sign-spot-check.py 40  # top 40 per town
    python3 print/tools/sign-spot-check.py id u6b59S u6pfnW   # just these
    python3 print/tools/sign-spot-check.py random 24          # a fair sample

Writes print/yard-signs/check/<town>.jpg (git-ignored). Each tile is 60 m
across, north up. The yellow ring is the pin; the arrow is the way the cars
are driving when they see the sign; the number is the score.

The pins are only as good as this look. Run it after every change to
sign-spots.py and page through the sheets before the list goes to the crew.
"""
import json, math, os, sys, time, urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

try:
    import numpy as np
    import rasterio
    from rasterio.windows import from_bounds
    from rasterio.warp import transform as rtransform
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("needs rasterio, numpy and pillow: pip install rasterio numpy pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SPOTS = os.path.join(ROOT, "print", "yard-signs", "spots.json")
ITEMS = os.path.join(HERE, ".cache", "naip-items.json")
OUT = os.path.join(ROOT, "print", "yard-signs", "check")
SAS = "https://planetarycomputer.microsoft.com/api/sas/v1/token/naipeuwest/naip"
HALF, PX = 30.0, 300

_tok = {"t": "", "at": 0}


def token():
    if time.time() - _tok["at"] > 1800:
        _tok["t"] = json.load(urllib.request.urlopen(SAS, timeout=60))["token"]
        _tok["at"] = time.time()
    return _tok["t"]


def tiles(spots, items):
    epsg = items[0]["epsg"]
    xs, ys = rtransform("EPSG:4326", f"EPSG:{epsg}", [s["lon"] for s in spots], [s["lat"] for s in spots])
    todo = defaultdict(list)
    for s, ux, uy in zip(spots, xs, ys):
        best, bm = None, -1e9
        for it in items:
            b = it["bbox"]
            m = min(ux - HALF - b[0], b[2] - ux - HALF, uy - HALF - b[1], b[3] - uy - HALF)
            if m > bm:
                best, bm = it, m
        todo[best["href"]].append((s, ux, uy))
    out = {}

    def one(href):
        got = {}
        env = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_MULTIRANGE="YES", GDAL_HTTP_MAX_RETRY="4")
        with rasterio.Env(**env), rasterio.open(href + "?" + token()) as ds:
            for s, ux, uy in todo[href]:
                w = from_bounds(ux - HALF, uy - HALF, ux + HALF, uy + HALF, ds.transform)
                a = ds.read([1, 2, 3], window=w, boundless=True, fill_value=0, out_shape=(3, PX, PX))
                got[s["id"]] = Image.fromarray(np.moveaxis(a, 0, -1).astype(np.uint8))
        return got

    with ThreadPoolExecutor(8) as ex:
        for g in ex.map(one, list(todo)):
            out.update(g)
    return out


def tile(img, s):
    im = img.copy()
    d = ImageDraw.Draw(im)
    c = PX / 2
    d.ellipse((c - 9, c - 9, c + 9, c + 9), outline=(255, 230, 0), width=3)
    h = math.radians(s["head"])
    L = 55
    x0, y0 = c - math.sin(h) * L, c + math.cos(h) * L         # where the cars come from
    x1, y1 = c - math.sin(h) * 16, c + math.cos(h) * 16
    d.line((x0, y0, x1, y1), fill=(0, 200, 255), width=4)
    for sgn in (-1, 1):
        a = h + sgn * 2.6
        d.line((x1, y1, x1 + math.sin(a) * 12, y1 - math.cos(a) * 12), fill=(0, 200, 255), width=4)
    lab = f"{s['score']} {s['ctrl']} {s['road'][:18]} @ {(s['cross'] or '')[:14]}"
    d.rectangle((0, PX - 20, PX, PX), fill=(0, 0, 0))
    d.text((4, PX - 17), lab, fill=(255, 255, 255))
    d.text((4, 3), s["id"], fill=(255, 255, 255))
    return im


def main():
    if not os.path.exists(ITEMS):
        sys.exit("run sign-spots.py first: it caches the photo index this reads")
    items = json.load(open(ITEMS))
    j = json.load(open(SPOTS))
    ix = {k: i for i, k in enumerate(j["cols"])}
    spots = [{k: r[i] for k, i in ix.items()} for r in j["spots"]]
    args = sys.argv[1:]
    if args and args[0] == "random":
        import random
        random.seed(int(args[2]) if len(args) > 2 else 1)
        groups = {"random": random.sample(spots, min(len(spots), int(args[1]) if len(args) > 1 else 24))}
    elif args and args[0] == "id":
        want = set(args[1:])
        groups = {"picked": [s for s in spots if s["id"] in want]}
    else:
        n = int(args[0]) if args else 16
        groups = defaultdict(list)
        for s in sorted(spots, key=lambda s: -s["score"]):
            if len(groups[s["town"]]) < n:
                groups[s["town"]].append(s)
    allsp = [s for g in groups.values() for s in g]
    print(f"reading {len(allsp)} photo tiles...")
    imgs = tiles(allsp, items)
    os.makedirs(OUT, exist_ok=True)
    for name, g in groups.items():
        cols = 4
        rows = (len(g) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * PX, rows * PX), (40, 40, 40))
        for i, s in enumerate(g):
            if s["id"] in imgs:
                sheet.paste(tile(imgs[s["id"]], s), ((i % cols) * PX, (i // cols) * PX))
        path = os.path.join(OUT, name.lower().replace(" ", "-") + ".jpg")
        sheet.save(path, quality=85)
        print("wrote", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    main()
