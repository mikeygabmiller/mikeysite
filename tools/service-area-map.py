# -*- coding: utf-8 -*-
"""Generates the service-area map SVG used in the "Areas I Serve" section of index.html.

Run it whenever a town is added to or dropped from the service area:

    python3 tools/service-area-map.py

It writes tools/service-area-map.svg; paste that over the <svg class="sa-map"> block
inside <section id="service-area"> in index.html, and update the matching entry in the
TOWNS list in that section's script so the checker and the map agree.

Everything is projected from real lat/lon against the home base in Snohomish, so the
pins, the coverage outline and the mileage rings stay honest instead of hand-placed."""
import math

BASE_LL = (47.9129, -122.0982)          # home base, matches LocalBusiness geo in the schema
MI_PER_DEG = 69.05
COS = math.cos(math.radians(47.92))
LAT_T, LAT_B = 48.26, 47.64
LON_L, LON_R = -122.62, -121.70
W = 620
H = round(W * (LAT_T - LAT_B) / ((LON_R - LON_L) * COS))
PPM = (H / (LAT_T - LAT_B)) / MI_PER_DEG

def px(la, lo):
    return (round((lo - LON_L) / (LON_R - LON_L) * W, 1),
            round((LAT_T - la) / (LAT_T - LAT_B) * H, 1))
def miles(la, lo):
    return math.hypot((la - BASE_LL[0]) * MI_PER_DEG, (lo - BASE_LL[1]) * MI_PER_DEG * COS)

BASE = px(*BASE_LL)

# name, lat, lon, page, drive-time label, label anchor, dx, dy
CITY = [
 ("Arlington",     48.1987,-122.1251, None,            "~30 min", "start",  13,   4),
 ("Marysville",    48.0518,-122.1771, "/marysville/",  "~20 min", "end",   -13,   4),
 ("Granite Falls", 48.0832,-121.9676, None,            "~22 min", "start",  13,   4),
 ("Lake Stevens",  48.0151,-122.0637, "/lake-stevens/","~12 min", "start",  13,  -2),
 ("Everett",       47.9790,-122.2021, "/everett/",     "~15 min", "end",   -13,   0),
 ("Mukilteo",      47.9445,-122.3046, "/mukilteo/",    "~22 min", "end",   -13,   4),
 ("Snohomish",     47.9129,-122.0982, "/snohomish/",   "home",    "start",  15,   5),
 ("Mill Creek",    47.8601,-122.2043, "/mill-creek/",  "~15 min", "end",   -13,   4),
 ("Monroe",        47.8554,-121.9710, "/monroe/",      "~15 min", "start",  13,   4),
 ("Bothell",       47.7601,-122.2054, "/bothell/",     "~20 min", "end",   -13,   4),
 ("Woodinville",   47.7543,-122.1635, None,            "~20 min", "middle",  0,  26),
 ("Duvall",        47.7423,-121.9857, "/duvall/",      "~25 min", "start",  13,   4),
]
# "Ask me" towns — Mikey gets out to these sometimes but never promises them.
# This is the same list as tier 'ask' in the TOWNS array in index.html; the ones
# that fall inside the frame get a grey dot so the legend key means something.
# Lynnwood and Edmonds live here on purpose. He was asked directly and said no.
NEARBY = [
 ("Stanwood",         48.2415,-122.3496), ("Silvana",     48.2004,-122.2679),
 ("Camano Island",    48.1885,-122.4715), ("Sultan",      47.8623,-121.8162),
 ("Startup",          47.8657,-121.7418), ("Lynnwood",    47.8279,-122.3051),
 ("Edmonds",          47.8107,-122.3774), ("Brier",       47.7929,-122.2743),
 ("Mountlake Terrace",47.7887,-122.3087), ("Kenmore",     47.7573,-122.2440),
 ("Lake Forest Park", 47.7570,-122.2807), ("Shoreline",   47.7557,-122.3415),
 ("North Seattle",    47.6900,-122.3200), ("Kirkland",    47.6815,-122.2087),
 ("Redmond",          47.6740,-122.1215), ("Carnation",   47.6476,-121.9143),
]

# coverage zone: convex walk of the served cities, pushed out ~2.5 mi, then smoothed
HULL = ["Arlington","Granite Falls","Monroe","Duvall","Woodinville","Bothell","Mill Creek","Mukilteo","Marysville"]
lookup = {c[0]: px(c[1], c[2]) for c in CITY}
PAD = 34.0
pts = []
for n in HULL:
    x, y = lookup[n]
    dx, dy = x - BASE[0], y - BASE[1]
    L = math.hypot(dx, dy) or 1
    pts.append((round(x + dx/L*PAD, 1), round(y + dy/L*PAD, 1)))

def catmull(p, t=0.55):
    n = len(p); out = ["M %s %s" % p[0]]
    for i in range(n):
        p0, p1, p2, p3 = p[(i-1)%n], p[i], p[(i+1)%n], p[(i+2)%n]
        out.append("C %s %s %s %s %s %s" % (
            round(p1[0]+(p2[0]-p0[0])/6*t,1), round(p1[1]+(p2[1]-p0[1])/6*t,1),
            round(p2[0]-(p3[0]-p1[0])/6*t,1), round(p2[1]-(p3[1]-p1[1])/6*t,1),
            p2[0], p2[1]))
    return " ".join(out) + " Z"

def line(ll): return " ".join("%s,%s" % px(a,b) for a,b in ll)

# --- label placement -------------------------------------------------------
# Labels used to be hand-nudged, which held until a town moved and two names sat
# on top of each other on a phone. These metrics are measured off the rendered
# SVG at 430px, where the CSS bumps the type up — place for the worst case and
# the desktop size is clean for free.
CH   = {"pin": 11.81, "home": 14.68, "ask": 11.93, "road": 9.63}
LINE = {"pin": 22.1,  "home": 23.5,  "ask": 20.4,  "road": 17.2}
PAD  = 1.5

def box(text, kind, x, y, anchor):
    """Screen box for a label drawn at (x, y) with the given anchor. y is a baseline."""
    w = len(text) * CH[kind]
    h = LINE[kind]
    left = x if anchor == "start" else x - w if anchor == "end" else x - w / 2
    return (left - PAD, y - h * 0.78 - PAD, left + w + PAD, y + h * 0.22 + PAD)

def hits(b, placed):
    if b[0] < 2 or b[1] < 2 or b[2] > W - 2 or b[3] > H - 2:
        return True
    return any(b[0] < o[2] and o[0] < b[2] and b[1] < o[3] and o[1] < b[3] for o in placed)

# In preference order. The first entry of each list is where the label sat before
# this became automatic, so a layout that already works does not get reshuffled.
def offsets(kind, first=None):
    base = [(13, 4, "start"), (-13, 4, "end"), (13, -3, "start"), (-13, -3, "end"),
            (13, 12, "start"), (-13, 12, "end"), (0, -14, "middle"), (0, 25, "middle")]
    if first:
        base = [first] + [o for o in base if o != first]
    return base

def place(text, kind, x, y, placed, first=None):
    """Return (dx, dy, anchor) for a label near (x, y), or None if nothing fits."""
    for dx, dy, anc in offsets(kind, first):
        b = box(text, kind, x + dx, y + dy, anc)
        if not hits(b, placed):
            placed.append(b)
            return dx, dy, anc
    return None


COAST = [(48.28,-122.385),(48.23,-122.37),(48.19,-122.355),(48.12,-122.32),(48.05,-122.295),
 (48.00,-122.245),(47.975,-122.222),(47.955,-122.268),(47.945,-122.309),(47.90,-122.339),
 (47.85,-122.360),(47.81,-122.385),(47.76,-122.399),(47.70,-122.404),(47.62,-122.418)]
WHIDBEY = [(47.905,-122.381),(47.975,-122.353),(48.04,-122.399),(48.11,-122.478),(48.19,-122.545),(48.28,-122.60)]
ROADS = [
 ("I-5", 1, [(48.28,-122.19),(48.15,-122.188),(48.05,-122.181),(47.99,-122.202),(47.92,-122.232),
             (47.86,-122.263),(47.82,-122.290),(47.75,-122.313),(47.68,-122.325),(47.62,-122.33)]),
 ("US-2",1, [(47.978,-122.218),(47.945,-122.163),(47.921,-122.102),(47.874,-122.021),(47.856,-121.971),
             (47.860,-121.870),(47.862,-121.816),(47.856,-121.700),(47.852,-121.58)]),
 ("SR-9",0, [(48.28,-122.145),(48.199,-122.125),(48.08,-122.098),(48.012,-122.091),(47.921,-122.093),
             (47.862,-122.099),(47.800,-122.112),(47.757,-122.132)]),
 ("",    0, [(47.856,-121.978),(47.812,-122.060),(47.757,-122.145),(47.756,-122.205),(47.735,-122.29)]),
 ("",    0, [(47.757,-122.207),(47.820,-122.212),(47.860,-122.208),(47.925,-122.213),(47.975,-122.212)]),
 ("",    0, [(48.013,-122.063),(48.055,-122.005),(48.083,-121.968)]),
 ("",    0, [(47.856,-121.971),(47.800,-121.979),(47.742,-121.986),(47.66,-121.95)]),
]

out = []
A = out.append
A('<svg class="sa-map" viewBox="0 0 %d %d" role="img" aria-labelledby="sa-map-t sa-map-d" preserveAspectRatio="xMidYMid meet">' % (W, H))
A('  <title id="sa-map-t">Mikey\'s Mobile Detailing service area map</title>')
A('  <desc id="sa-map-d">A map of Snohomish County showing the towns Mikey drives to. The full list is written out below the map.</desc>')
A('  <defs>')
A('    <radialGradient id="saGlow" cx="50%" cy="50%"><stop offset="0%" stop-color="#C8102E" stop-opacity=".16"/><stop offset="60%" stop-color="#C8102E" stop-opacity=".05"/><stop offset="100%" stop-color="#C8102E" stop-opacity="0"/></radialGradient>')
A('    <linearGradient id="saWater" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#101a20"/><stop offset="100%" stop-color="#0c1418"/></linearGradient>')
A('    <linearGradient id="saZone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8102E" stop-opacity=".13"/><stop offset="100%" stop-color="#C9A24B" stop-opacity=".09"/></linearGradient>')
A('    <filter id="saSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>')
A('  </defs>')
A('  <rect width="%d" height="%d" fill="#0f0f10"/>' % (W, H))
A('  <g class="sa-water">')
A('    <polygon points="%s %d,%d %d,%d" fill="url(#saWater)"/>' % (line(COAST), 0, H, 0, 0))
A('    <polyline points="%s" fill="none" stroke="#1b2c36" stroke-width="1.5"/>' % line(COAST))
A('    <text class="sa-water-lbl" x="58" y="%d" transform="rotate(-72 58 %d)">PUGET SOUND</text>' % (round(H*.62), round(H*.62)))
A('  </g>')
A('  <g class="sa-zone">')
A('    <circle cx="%s" cy="%s" r="%s" fill="url(#saGlow)" filter="url(#saSoft)"/>' % (BASE[0], BASE[1], round(20*PPM,1)))
A('    <path class="sa-zone-outer" d="%s"/>' % catmull(pts))
A('    <circle class="sa-zone-core" cx="%s" cy="%s" r="%s"/>' % (BASE[0], BASE[1], round(10*PPM, 1)))
A('  </g>')
PLACED = []
PLACED.append((0, round(H*.62) - 75, 78, round(H*.62) + 75))          # PUGET SOUND, rotated
PLACED.append((22, H - 48, 30 + 5*PPM + 8 + 7*CH["road"], H - 12))     # the scale bar

A('  <g class="sa-roads">')
for nm, major, ll in ROADS:
    A('    <polyline points="%s" class="%s"/>' % (line(ll), "sa-rd sa-rd--major" if major else "sa-rd"))
for nm, la, lo in (("I-5", 47.752, -122.313), ("US-2", 47.855, -121.780), ("SR-9", 47.800, -122.112)):
    x, y = px(la, lo)
    lx, ly = round(x + 7, 1), round(y - 6, 1)
    PLACED.append(box(nm, "road", lx, ly, "start"))
    A('    <text class="sa-rd-lbl" x="%s" y="%s">%s</text>' % (lx, ly, nm))
A('  </g>')
A('  <g class="sa-pins">')
CITY_LABEL = {}
for n, la, lo, page, drive, anc, dx, dy in CITY:
    x, y = px(la, lo)
    kind = "home" if n == "Snohomish" else "pin"
    spot = place(n, kind, x, y, PLACED, first=(dx, dy, anc))
    if spot is None:                      # never silently drop a town Mikey serves
        spot = (dx, dy, anc)
        PLACED.append(box(n, kind, x + dx, y + dy, anc))
    CITY_LABEL[n] = spot
    if n == "Snohomish":                  # HOME BASE sits on its own line underneath
        PLACED.append(box("HOME BASE", "pin", x + spot[0], y + spot[1] + 16, spot[2]))

for n, la, lo, page, drive, anc0, dx0, dy0 in CITY:
    x, y = px(la, lo)
    dx, dy, anc = CITY_LABEL[n]
    home = " sa-pin--home" if n == "Snohomish" else ""
    slug = n.lower().replace(" ", "-")
    A('    <g class="sa-pin%s" data-city="%s" tabindex="0" role="button" aria-label="%s, %s from home base. Show details." transform="translate(%s %s)">' % (home, n, n, ("home base" if drive=="home" else drive), x, y))
    A('      <circle class="sa-hit" r="24"/>')
    A('      <circle class="sa-ring" r="13"/>')
    A('      <circle class="sa-dot" r="%s"/>' % ("7.5" if home else "5.5"))
    A('      <text class="sa-lbl" x="%s" y="%s" text-anchor="%s">%s</text>' % (dx, dy, anc, n))
    if home:
        A('      <text class="sa-sublbl" x="%s" y="%s" text-anchor="%s">HOME BASE</text>' % (dx, dy + 16, anc))
    A('    </g>')
A('  </g>')

# "Ask me" towns last: they get whatever room is left, and a dot with no label
# beats two names printed on top of each other.
A('  <g class="sa-nearby">')
DROPPED = []
for n, la, lo in NEARBY:
    x, y = px(la, lo)
    if not (8 < x < W - 8 and 8 < y < H - 8):     # same inset the checker uses
        DROPPED.append((n, "outside the frame"))
        continue
    A('    <g class="sa-near" data-city="%s">' % n)
    A('      <circle cx="%s" cy="%s" r="3.5"/>' % (x, y))
    spot = place(n, "ask", x, y, PLACED)
    if spot:
        A('      <text x="%s" y="%s" text-anchor="%s">%s</text>'
          % (round(x + spot[0], 1), round(y + spot[1], 1), spot[2], n))
    else:
        DROPPED.append((n, "dot only, no room for the label"))
    A('    </g>')
A('  </g>')

sx, sy = 30, H - 26
A('  <g class="sa-scale"><line x1="%s" y1="%s" x2="%s" y2="%s"/><line x1="%s" y1="%s" x2="%s" y2="%s"/><line x1="%s" y1="%s" x2="%s" y2="%s"/><text x="%s" y="%s">5 miles</text></g>'
  % (sx, sy, round(sx+5*PPM,1), sy, sx, sy-4, sx, sy+4, round(sx+5*PPM,1), sy-4, round(sx+5*PPM,1), sy+4, round(sx+5*PPM+8,1), sy+4))
# Filled in by the checker script in index.html: when someone asks about a place
# that isn't a pin, this is where their marker goes — at its real spot if it's on
# the map, or clamped to the edge with an arrow pointing off it if it isn't.
A('  <g class="sa-you" aria-hidden="true"></g>')
A('</svg>')

import os
DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'service-area-map.svg')
open(DEST, 'w').write("\n".join(out))
print("wrote", DEST, "- paste it over the <svg class=\"sa-map\"> block in index.html")
print("viewBox %d x %d  |  px/mi %.2f  |  base %s" % (W, H, PPM, BASE))
print("rings: 10mi=%.1f  20mi=%.1f" % (10*PPM, 20*PPM))
for n, la, lo, pg, dr, a, dx, dy in CITY:
    moved = "" if CITY_LABEL[n] == (dx, dy, a) else "  <- label moved to avoid a collision"
    print("  %-14s %5.1f mi  %s%s" % (n, miles(la, lo), px(la, lo), moved))
if DROPPED:
    print("ask-me towns not fully drawn:")
    for n, why in DROPPED:
        print("  %-18s %s" % (n, why))
