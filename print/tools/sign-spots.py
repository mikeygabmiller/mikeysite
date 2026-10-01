# -*- coding: utf-8 -*-
"""Ranks every spot in the twelve towns where a yard sign earns its keep.

    pip install shapely rasterio numpy pillow     # once
    python3 print/tools/sign-spots.py
    python3 print/tools/sign-spot-check.py        # then look at the pins

Writes print/yard-signs/spots.json (every spot, ranked) and print/yard-signs/SPOTS.md
(the best spots per town, in plain words). Copy spots.json to the dashboard repo
as public/sign-spots.json: the Sign Crew app there reads it to suggest where
each sign goes.

What a "spot" is: one approach to one intersection. A sign goes on the right
side of that road as cars come up to the light or stop sign, so it faces the
people who are about to slow down. A four-way light has four approaches; the
list keeps the best two, because a corner with four of the same sign on it
reads as litter.

How a spot is scored, in plain words:

1. Cars. The 2023 federal traffic counts (FHWA HPMS, which WSDOT files for
   every arterial and collector in the state) give cars per day on the road
   the sign faces. Roads with no count (neighbourhood streets) get a
   conservative estimate by road type, and are flagged "e".
2. How long they have to read it. Cars stopped at a light or a stop sign read
   the whole thing. Cars rolling through at 45 mph get a glance. Weights:
   light or stop 1.0, the minor road at a junction 0.9, roundabout 0.65,
   free-flowing 0.45 at 25 mph down to 0.2 at 45 mph. Nothing is placed on a
   road posted 50 mph or more: nobody can read it and nobody should be
   standing on that shoulder.
3. Who lives nearby. People see the same corner every day, and repetition is
   what makes a sign stick. Census 2020 homes within a mile, weighted by the
   ACS income, home-ownership and two-car numbers for their block group (the
   same "fit" the door hanger zones use), move the score up to 20% either way.
4. How long it will stay up. WSDOT maintenance crews pull any non-traffic sign
   on state highway right of way, so a spot on SR 9, SR 527, US 2 and the rest
   keeps 60% of its score. Spots in front of shopping centres (managed
   property) keep 85%. The Mill Creek Community Association's neighbourhoods
   are left out entirely: the association keeps up its own common areas and
   entry landscaping, and a sign there gets pulled.
5. Distance from home base. Full marks inside 20 km of Snohomish, easing to
   85% at 40 km, because a lead in Arlington costs more drive than one in
   Lake Stevens.

Score 100 = the best spot in the area. The score is a square root of the raw
number, so 50 means a quarter of the best spot's reach, not half.

Where the pin goes, in plain words: on grass, on the right-hand verge, as
close to the road as the grass allows. The first version put every pin a
fixed distance back and a guessed distance sideways and never looked at the
ground, which put a top Snohomish spot on the deck of the Avenue D bridge.
Now every pin is checked against the 2023 NAIP aerial photos (USDA, 60 cm,
with infrared): healthy plants reflect infrared and pavement, roofs and water
don't, so the photo says grass or not grass for every half metre. The script
tries points from just past the curb out to 10 m, and back along the road over
the stretch where the cars in question are looking, and keeps the one closest
to the ideal spot that is:

  - growing (grass or planting, 3 m across, so a stake has ground to go in);
  - under 1 m tall (Meta's canopy-height map), so it's grass and not woods,
    with nothing over 1 m on the patch itself and no more than a third of the
    ground within 5 m under trees, so it's not a gap in the woods (a strip
    between street trees is fine), and under a third of it within 20 m, so
    it isn't a road through the woods;
  - off every mapped road, 6 m clear of any railway, 12 m clear of any
    bridge, overpass or deck, with nothing mapped between it and its road;
  - on a road that isn't itself a bridge where the cars wait.

An approach with no such point is dropped, not guessed. What the photo can't
say: a ditch, a fence, a hedge that blocks the view, or a lawn someone will
defend. Street View in the app, the crew's skips and Mikey's "hide this
corner" cover those.

Downloads are cached in print/tools/.cache (git-ignored). Delete it to refetch.
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request
from collections import defaultdict

try:
    from shapely.geometry import shape, Point, LineString, Polygon, MultiPolygon, mapping
    from shapely.ops import unary_union, transform
    from shapely.strtree import STRtree
except ImportError:
    sys.exit("needs shapely: pip install shapely")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, ".cache")
OUT_DIR = os.path.join(ROOT, "print", "yard-signs")
OUT_JSON = os.path.join(OUT_DIR, "spots.json")
OUT_MD = os.path.join(OUT_DIR, "SPOTS.md")

BASE = (47.9129, -122.0982)               # home base, same as the site schema
UA = {"User-Agent": "mikeysdetailing-sign-spots/1.0 (mikeysdetailing4u@gmail.com)"}

# ZIP -> the town it mails as. Only the twelve served towns, same list as
# hanger-zones.py. Lynnwood and Edmonds ZIPs are not in it on purpose.
SERVED_ZIPS = {
    "98290": "Snohomish", "98296": "Snohomish", "98258": "Lake Stevens",
    "98201": "Everett", "98203": "Everett", "98204": "Everett", "98208": "Everett",
    "98272": "Monroe", "98012": "Mill Creek", "98270": "Marysville",
    "98271": "Marysville", "98011": "Bothell", "98021": "Bothell",
    "98019": "Duvall", "98275": "Mukilteo", "98072": "Woodinville",
    "98077": "Woodinville", "98252": "Granite Falls", "98223": "Arlington",
}
TOWN_CENTRES = {                          # where the town's name sits on the map
    "Snohomish": (47.9129, -122.0982), "Lake Stevens": (48.0151, -122.0637),
    "Everett": (47.9790, -122.2021), "Monroe": (47.8554, -121.9709),
    "Mill Creek": (47.8601, -122.2043), "Marysville": (48.0518, -122.1771),
    "Bothell": (47.7623, -122.2054), "Duvall": (47.7423, -121.9857),
    "Mukilteo": (47.9445, -122.3046), "Woodinville": (47.7543, -122.1635),
    "Granite Falls": (48.0840, -121.9687), "Arlington": (48.1987, -122.1251),
}
COUNTIES = ("061", "033")                 # Snohomish, King (Duvall, Woodinville, south Bothell)

# The working box. The ZIPs run east into the Cascades (Granite Falls, Monroe,
# Arlington), where there is nothing to put a sign in front of, so the box
# stops at -121.85 and at 40 km from home base.
BBOX = (47.69, -122.37, 48.30, -121.85)   # south, west, north, east
MAX_KM = 40

TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer"
ACS = "https://api.censusreporter.org/1.0/data/show/latest"
HPMS = "https://geo.dot.gov/server/rest/services/Hosted/HPMS_FULL_WA_2023/FeatureServer/0/query"
OVERPASS = [
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

# The Mill Creek Community Association's divisions, from mcca.info (Residential
# Divisions), matched against the neighbourhood outlines in OpenStreetMap.
MCCA_DIVISIONS = [
    "Aspen", "Chatham Park", "Cottonwood", "Cypress", "Douglas Fir", "Evergreen", "Fairway",
    "Fairway Fountains", "Heatherstone", "Holly", "Huckleberry", "Juniper", "Laurel", "Magnolia",
    "Red Cedar", "Spring Tree", "Sunrise", "Sun Rose", "Sweetwater Ranch", "Swordfern", "Vine Maple",
    "Wildflower Park", "Willow", "Woodfern", "Winslow", "Amberleigh", "Belvedere", "Emerald Heights",
    "Fairwood Greens", "Pembrook", "The Pointe", "Country Club Estates", "Copper Tree", "Country Place",
    "Fairway Village", "Lakewood", "Mill Lane", "Mill Run", "Miller's Village", "St. Moritz",
    "Stratford Greens", "The Masters", "Trillium Court", "Parkwood", "The Laurels", "The Mill",
    "Station at Mill Creek", "Chatham Park West",
]
MCCA_BOX = (47.84, -122.23, 47.88, -122.18)   # the divisions all sit in here

# Road classes, best first. Arterials and collectors are what a junction needs
# at least one of; links are ramps and slip lanes, never a place to stand.
RANK = {"motorway": 9, "trunk": 8, "primary": 7, "secondary": 6, "tertiary": 5,
        "unclassified": 4, "residential": 3, "living_street": 2,
        "motorway_link": 1, "trunk_link": 1, "primary_link": 1, "secondary_link": 1, "tertiary_link": 1}
ARTERIAL = {"trunk", "primary", "secondary", "tertiary", "unclassified"}
NO_PLACE = {"motorway", "motorway_link", "trunk_link", "primary_link", "secondary_link", "tertiary_link"}
# Cars a day when a road has no federal count. Deliberately low: an estimate
# should never outrank a real count.
AADT_GUESS = {"trunk": 15000, "primary": 9000, "secondary": 5000, "tertiary": 2500,
              "unclassified": 1200, "residential": 450, "living_street": 120}
SPEED_GUESS = {"trunk": 50, "primary": 40, "secondary": 35, "tertiary": 35,
               "unclassified": 35, "residential": 25, "living_street": 20}
LANES_GUESS = {"trunk": 4, "primary": 4, "secondary": 2, "tertiary": 2,
               "unclassified": 2, "residential": 2, "living_street": 1}

CLUSTER_M = 35            # junction nodes closer than this are one intersection
SIGNAL_M = 45             # a light mapped this close to the junction controls it
LEG_M = 160               # how far out along each road we look
MATCH_M = 22              # a count segment this close, and parallel, is the same road
AUD_M = 1600              # "within a mile" for the neighbours who pass every day
MAX_PER_JUNCTION = 2
MIN_RAW = 1100            # below this many good looks a day it isn't worth a sign
# Cars that drive past without stopping give a sign a second at speed. On a
# country road that was 70% of the map (Three Lakes Road, 4,500 cars, score
# 28) and it buried the lights and stop signs. A passing-traffic spot has to
# be on a counted road this busy to make the list.
THRU_MIN_AADT = 10000

# Where along the road, per kind of spot: (closest to the corner, ideal,
# farthest), in metres back from the junction. A light's queue stacks up, so
# its range is long; at a stop sign the car that reads it is the one waiting.
PLACE_RANGE = {"sig": (12, 35, 90), "all": (4, 12, 35), "stop": (4, 12, 35), "minor": (4, 12, 35),
               "rab": (12, 25, 60), "thru": (15, 45, 100)}
LAT_MAX = 10.0            # at most this far past the curb, or drivers stop reading it as "on this road"
NDVI_GRASS = 0.25         # NAIP NDVI above this is growing (Oct 2023 grass reads 0.3 to 0.5;
                          # at 0.2 a parking-lot planter and thin grass under trees got through)
GRASS_SHARE = 0.85        # of the 3 m patch around the pin
OPEN_R = 5.0              # and within this many metres, no more than WOODS_SHARE of it under trees
WOODS_SHARE = 0.35        # taller than TREE_M: a gap in the woods is shade and brush (the first
TREE_M = 2                # check sheets had pins there), a strip between street trees is fine
# The canopy map is soft at a few metres (it missed whole crowns over some
# pins) but honest at twenty: a road through the woods reads a third or more
# trees within 20 m, a town verge rarely does. Measured on pins labelled by
# eye on the check sheets, then checked on fresh samples.
WOODS_R = 17.7            # half-side of a square the area of a 20 m circle
WOODS_R_SHARE = 0.33
BRIDGE_CLEAR = 12.0
NAIP_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
NAIP_SAS = "https://planetarycomputer.microsoft.com/api/sas/v1/token/naipeuwest/naip"
CHIP_HALF = 118.0         # metres either side of the junction: covers the farthest point tried
# Infrared says "growing", which is grass and trees alike, and the first run
# put pins in the woods. Meta's 1 m canopy-height map (public, from the same
# kind of aerial photo plus lidar) says how tall it is: under 1 m is grass,
# planting or low shrubs a stake goes into and a driver sees past. It's soft
# at a few metres, so 1 to 2 pins in 10 still sit by a shrub or small tree it
# misses; Mikey's Check tab in the crew app is where those get caught.
# (Washington DNR lidar hillshades were tried for those and didn't separate
# them from clear grass, so they aren't used.)
CHM = "https://dataforgood-fb-data.s3.amazonaws.com/forests/v1/alsgedi_global_v6_float/chm/{}.tif"
MAX_GROWTH_M = 1


# ---------------------------------------------------------------------------
# downloads
# ---------------------------------------------------------------------------
def fetch(url, data=None, name=None, tries=4, raw=False):
    """GET/POST with a disk cache keyed by name."""
    if name:
        path = os.path.join(CACHE, name)
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
    body = urllib.parse.urlencode(data).encode() if data else None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=body, headers=UA)
            with urllib.request.urlopen(req, timeout=240) as r:
                out = json.loads(r.read().decode())
            break
        except Exception as e:
            if i == tries - 1:
                raise
            print(f"  retry {url[:60]}... ({str(e)[:80]})")
            time.sleep(3 * (i + 1))
    if name:
        os.makedirs(CACHE, exist_ok=True)
        with open(path, "w") as f:
            json.dump(out, f)
    return out


def overpass(query, name):
    """Overpass with a disk cache, trying each public mirror in turn. The busy
    ones answer with an HTML error page instead of JSON, which counts as a miss."""
    path = os.path.join(CACHE, name)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    last = None
    for attempt in range(3):
        for url in OVERPASS:
            try:
                req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": query}).encode(), headers=UA)
                with urllib.request.urlopen(req, timeout=300) as r:
                    txt = r.read().decode()
                out = json.loads(txt)
                if "elements" not in out:
                    raise ValueError("no elements")
                if out.get("remark") and "error" in out["remark"].lower():
                    raise ValueError(out["remark"][:120])
                os.makedirs(CACHE, exist_ok=True)
                with open(path, "w") as f:
                    json.dump(out, f)
                return out
            except Exception as e:
                last = e
                print(f"  overpass miss on {url.split('/')[2]}: {str(e)[:90]}")
                time.sleep(4)
        time.sleep(20 * (attempt + 1))
    raise RuntimeError(f"overpass failed for {name}: {last}")


def tiger_query(layer, where, name, envelope=None, fields="*", geometry=True):
    feats, offset = [], 0
    while True:
        q = {"where": where, "outFields": fields, "returnGeometry": "true" if geometry else "false",
             "outSR": "4326", "f": "geojson", "resultOffset": offset, "resultRecordCount": 1000}
        if envelope:
            q.update({"geometry": ",".join(map(str, envelope)), "geometryType": "esriGeometryEnvelope",
                      "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"})
        page = fetch(f"{TIGER}/{layer}/query", q, f"{name}-{offset}.json")
        got = page.get("features", [])
        feats += got
        if len(got) < 1000 and not page.get("exceededTransferLimit") and not page.get("properties", {}).get("exceededTransferLimit"):
            break
        offset += len(got)
    return feats


def hpms_segments():
    """Every counted road segment in the box: cars a day, speed limit, lanes."""
    s, w, n, e = BBOX
    feats, offset = [], 0
    while True:
        q = {"where": "aadt>0", "geometry": f"{w},{s},{e},{n}", "geometryType": "esriGeometryEnvelope",
             "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outSR": "4326",
             "outFields": "routeid,f_system,aadt,aadt_date,speed_limit,through_lanes,route_number,facility_type",
             "returnGeometry": "true", "f": "json", "resultOffset": offset, "resultRecordCount": 2000}
        page = fetch(HPMS, q, f"hpms-2023-{offset}.json")
        got = page.get("features", [])
        feats += got
        if not page.get("exceededTransferLimit") or not got:
            break
        offset += len(got)
    return feats


# ---------------------------------------------------------------------------
# geometry in metres: a local flat projection is plenty for 60 km
# ---------------------------------------------------------------------------
LAT0, LON0 = 47.95, -122.10
KX = 111320 * math.cos(math.radians(LAT0))
KY = 110950


def xy(lat, lon):
    return ((lon - LON0) * KX, (lat - LAT0) * KY)


def ll(x, y):
    return (LAT0 + y / KY, LON0 + x / KX)


def to_m(geom):
    return transform(lambda lon, lat, z=None: ((lon - LON0) * KX, (lat - LAT0) * KY), geom)


def bearing(a, b):
    """Compass bearing in degrees from point a to b (x east, y north)."""
    return (math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])) + 360) % 360


def angdiff(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def along(pts, dist):
    """The point `dist` metres along a polyline, and the direction of travel there."""
    acc = 0.0
    for i in range(1, len(pts)):
        seg = math.dist(pts[i - 1], pts[i])
        if seg > 0 and acc + seg >= dist:
            f = (dist - acc) / seg
            p = (pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1]))
            return p, bearing(pts[i - 1], pts[i])
        acc += seg
    if len(pts) >= 2:
        return pts[-1], bearing(pts[-2], pts[-1])
    return pts[0], 0.0


def polylen(pts):
    return sum(math.dist(pts[i - 1], pts[i]) for i in range(1, len(pts)))


COMPASS = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"]
SHORT = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]


def b36(n):
    s, a = "", "0123456789abcdefghijklmnopqrstuvwxyz"
    while True:
        n, r = divmod(n, 36)
        s = a[r] + s
        if not n:
            return s


def mph(v):
    """OSM maxspeed '35 mph' -> 35. Anything unreadable -> None."""
    if not v:
        return None
    m = re.match(r"\s*(\d+)\s*(mph)?", str(v))
    if not m:
        return None
    n = int(m.group(1))
    return n if m.group(2) or n <= 70 else round(n * 0.621)


def lanes_of(tags):
    try:
        return max(1, int(str(tags.get("lanes", "")).split(";")[0]))
    except ValueError:
        return None


# ---------------------------------------------------------------------------
def main():
    print("ZIP areas...")
    zips = tiger_query(84, "ZCTA5 IN (%s)" % ",".join(f"'{z}'" for z in SERVED_ZIPS), "zcta", fields="ZCTA5")
    zip_shapes = [(f["properties"]["ZCTA5"], to_m(shape(f["geometry"]))) for f in zips]
    served = unary_union([s for _, s in zip_shapes])
    zip_tree = STRtree([s for _, s in zip_shapes])

    def town_at(p):
        for i in zip_tree.query(p):
            z, s = zip_shapes[int(i)]
            if s.contains(p):
                return SERVED_ZIPS[z]
        return None

    base_xy = xy(*BASE)

    print("Traffic counts (FHWA HPMS 2023)...")
    segs = []
    for f in hpms_segments():
        a = f["attributes"]
        paths = (f.get("geometry") or {}).get("paths") or []
        for path in paths:
            if len(path) < 2:
                continue
            pts = [xy(p[1], p[0]) for p in path]
            segs.append({"line": LineString(pts), "aadt": a.get("aadt") or 0, "speed": a.get("speed_limit"),
                         "lanes": a.get("through_lanes"), "route": str(a.get("routeid") or ""),
                         "fsys": a.get("f_system"), "year": str(a.get("aadt_date") or "")[:4]})
    seg_tree = STRtree([s["line"] for s in segs])
    print(f"  {len(segs)} counted segments")

    s, w, n, e = BBOX
    print("Lights, stop signs and roundabouts (OpenStreetMap)...")
    ctl = overpass(f"""[out:json][timeout:240];
(node[highway~"^(traffic_signals|stop|give_way|mini_roundabout)$"]({s},{w},{n},{e});
 way[junction~"^(roundabout|circular)$"]({s},{w},{n},{e}););
out body geom;""", "osm-controls.json")["elements"]

    print("Roads (OpenStreetMap, in tiles)...")
    ways = {}
    lat_edges = [round(min(s + i * 0.1, n), 2) for i in range(int(math.ceil((n - s) / 0.1 - 1e-9)) + 1)]
    lon_edges = [round(min(w + i * 0.13, e), 2) for i in range(int(math.ceil((e - w) / 0.13 - 1e-9)) + 1)]
    for i in range(len(lat_edges) - 1):
        for j in range(len(lon_edges) - 1):
            ts, tn = lat_edges[i], lat_edges[i + 1]
            tw, te = lon_edges[j], lon_edges[j + 1]
            if tn <= ts or te <= tw:
                continue
            q = f"""[out:json][timeout:240];
way[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified)$"]({ts},{tw},{tn},{te})->.a;
.a out body geom;
node(w.a)->.an;
way(bn.an)[highway~"^(residential|living_street)$"]->.r;
.r out body geom;"""
            got = overpass(q, f"osm-roads-{ts}-{tw}.json")["elements"]
            for el in got:
                if el.get("type") == "way" and el.get("geometry"):
                    ways[el["id"]] = el
            print(f"  tile {ts},{tw}: {len(got)} ways ({len(ways)} total)")

    print("Railways (OpenStreetMap)...")
    rails = []
    for el in overpass(f"""[out:json][timeout:240];
way[railway~"^(rail|light_rail|tram|narrow_gauge|disused|abandoned)$"]({s},{w},{n},{e});
out geom;""", "osm-rail.json")["elements"]:
        g = el.get("geometry") or []
        if len(g) >= 2:
            rails.append(LineString([xy(q["lat"], q["lon"]) for q in g]))
    print(f"  {len(rails)} railway lines")

    print("Cemeteries (OpenStreetMap)...")
    graves = []
    for el in overpass(f"""[out:json][timeout:240];
(way[landuse=cemetery]({s},{w},{n},{e}); way[amenity=grave_yard]({s},{w},{n},{e}););
out geom;""", "osm-cemetery.json")["elements"]:
        g = el.get("geometry") or []
        if len(g) >= 4:
            try:
                graves.append(Polygon([xy(q["lat"], q["lon"]) for q in g]).buffer(3))
            except Exception:
                pass
    grave = unary_union(graves) if graves else None
    print(f"  {len(graves)} cemeteries")

    print("Shops, HOA neighbourhoods (OpenStreetMap)...")
    ctx = overpass(f"""[out:json][timeout:240];
(way[landuse~"^(retail|commercial)$"]({s},{w},{n},{e});
 way[landuse=residential][name]({MCCA_BOX[0]},{MCCA_BOX[1]},{MCCA_BOX[2]},{MCCA_BOX[3]}););
out tags geom;""", "osm-context.json")["elements"]

    # --- the HOA we are sure of -------------------------------------------
    def norm(nm):
        return nm.lower().replace(" at mill creek", "").strip()
    div_names = {norm(d) for d in MCCA_DIVISIONS}
    def is_mcca(name):
        return norm(name) in div_names
    mcca_polys, commercial = [], []
    for el in ctx:
        g = el.get("geometry")
        if not g or len(g) < 4:
            continue
        pts = [xy(p["lat"], p["lon"]) for p in g]
        try:
            poly = Polygon(pts).buffer(0)
        except Exception:
            continue
        t = el.get("tags", {})
        if t.get("landuse") in ("retail", "commercial"):
            commercial.append(poly)
        elif t.get("name") and is_mcca(t["name"]):
            mcca_polys.append(poly)
    # Close the gaps between neighbouring divisions (streets, the golf course's
    # edges) without pushing the outline far past them: out 120 m, back 95 m.
    mcca = unary_union(mcca_polys).buffer(120).buffer(-95) if mcca_polys else None
    com_tree = STRtree(commercial) if commercial else None
    print(f"  MCCA: {len(mcca_polys)} divisions matched; {len(commercial)} shopping/commercial areas")

    # --- households and who they are ---------------------------------------
    print("Census blocks and ACS...")
    minx, miny, maxx, maxy = w, s, e, n
    blocks = tiger_query(10, "STATE='53' AND COUNTY IN ('061','033') AND HU100>0", "signs-blocks",
                         envelope=(minx, miny, maxx, maxy), fields="GEOID,HU100,CENTLAT,CENTLON", geometry=False)
    acs = {}
    for c in COUNTIES:
        d = fetch(ACS + "?" + urllib.parse.urlencode({"table_ids": "B19013,B25003,B25024,B25044",
                                                 "geo_ids": f"150|05000US53{c}"}), None, f"acs-{c}.json")
        for gid, x in d["data"].items():
            inc = x["B19013"]["estimate"]["B19013001"]
            t = x["B25003"]["estimate"]
            v = x["B25044"]["estimate"]
            hh = t["B25003001"] or 0
            if not hh or not inc:
                continue
            two = sum(v.get(k) or 0 for k in ("B25044005", "B25044006", "B25044007",
                                               "B25044012", "B25044013", "B25044014"))
            acs[gid[7:]] = {"income": inc, "own": (t["B25003002"] or 0) / hh,
                            "cars2": two / max(v["B25044001"] or 1, 1)}
    GRID = AUD_M
    homes = defaultdict(list)
    for f in blocks:
        p = f["properties"]
        bg = acs.get(p["GEOID"][:12])
        if not bg:
            continue
        inc_ix = min(max(bg["income"] / 150_000, 0.35), 1.5)
        car_ix = min(max(bg["cars2"] / 0.75, 0.5), 1.2)
        fit = inc_ix * bg["own"] * car_ix
        bx, by = xy(float(p["CENTLAT"]), float(p["CENTLON"]))
        homes[(int(bx // GRID), int(by // GRID))].append((bx, by, (p["HU100"] or 0) * fit))
    print(f"  {len(blocks)} blocks, {len(acs)} block groups")

    def audience(pt):
        gx, gy = int(pt[0] // GRID), int(pt[1] // GRID)
        tot = 0.0
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for bx, by, v in homes.get((gx + dx, gy + dy), ()):
                    if (bx - pt[0]) ** 2 + (by - pt[1]) ** 2 <= AUD_M * AUD_M:
                        tot += v
        return tot

    # --- junctions ---------------------------------------------------------
    print("Finding intersections...")
    node_xy, node_ways = {}, defaultdict(list)
    for wid, el in ways.items():
        hw = el["tags"].get("highway")
        if hw not in RANK:
            continue
        for k, (nid, g) in enumerate(zip(el["nodes"], el["geometry"])):
            node_xy[nid] = xy(g["lat"], g["lon"])
            node_ways[nid].append((wid, k))
    signals, stops, allway, giveway = set(), set(), set(), set()
    for el in ctl:
        if el["type"] != "node":
            continue
        hw = el.get("tags", {}).get("highway")
        if hw == "traffic_signals":
            signals.add(el["id"])
        elif hw == "stop":
            stops.add(el["id"])
            if str(el["tags"].get("stop", "")).lower() == "all":
                allway.add(el["id"])
        elif hw in ("give_way", "mini_roundabout"):
            giveway.add(el["id"])
        if el["id"] not in node_xy:
            node_xy[el["id"]] = xy(el["lat"], el["lon"])
    signal_pts = [node_xy[i] for i in signals]
    sig_grid = defaultdict(list)
    for p in signal_pts:
        sig_grid[(int(p[0] // 100), int(p[1] // 100))].append(p)

    def near_signal(p, r=SIGNAL_M):
        gx, gy = int(p[0] // 100), int(p[1] // 100)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for q in sig_grid.get((gx + dx, gy + dy), ()):
                    if math.dist(p, q) <= r:
                        return True
        return False

    # Roundabouts first: the whole ring is one junction.
    clusters, used = [], set()
    for el in ctl:
        if el["type"] == "way" and el.get("nodes"):
            ring = [nid for nid in el["nodes"] if nid in node_ways]
            if len(ring) >= 3:
                clusters.append({"nodes": set(ring), "rab": True})
                used.update(ring)

    cand, lone_signals = [], []
    for nid, lst in node_ways.items():
        if nid in used:
            continue
        wset = {wid for wid, _ in lst}
        if len(wset) < 2:
            continue
        classes = {ways[wid]["tags"].get("highway") for wid in wset}
        if not classes & ARTERIAL:
            continue                        # ramp merges, freeway nodes, neighbourhood corners
        if classes <= {"motorway", "motorway_link"}:
            continue
        cand.append(nid)
    # A light on one road with no side street we fetched: a signalised store
    # entrance or a crossing. Cars stop there too, so it gets its own junction.
    for nid in signals:
        lst = node_ways.get(nid)
        if nid in used or not lst or len({wid for wid, _ in lst}) != 1:
            continue
        if ways[lst[0][0]]["tags"].get("highway") in ARTERIAL:
            lone_signals.append(nid)
    # union-find by distance
    parent = {x: x for x in cand}
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    grid = defaultdict(list)
    for nid in cand:
        p = node_xy[nid]
        grid[(int(p[0] // CLUSTER_M), int(p[1] // CLUSTER_M))].append(nid)
    for nid in cand:
        p = node_xy[nid]
        gx, gy = int(p[0] // CLUSTER_M), int(p[1] // CLUSTER_M)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for m in grid.get((gx + dx, gy + dy), ()):
                    if m != nid and math.dist(p, node_xy[m]) <= CLUSTER_M:
                        ra, rb = find(nid), find(m)
                        if ra != rb:
                            parent[ra] = rb
    groups = defaultdict(set)
    for nid in cand:
        groups[find(nid)].add(nid)
    clusters += [{"nodes": g, "rab": False} for g in groups.values()]
    near_cand = defaultdict(list)
    for nid in cand:
        p = node_xy[nid]
        near_cand[(int(p[0] // 100), int(p[1] // 100))].append(p)
    for nid in lone_signals:
        p = node_xy[nid]
        gx, gy = int(p[0] // 100), int(p[1] // 100)
        if any(math.dist(p, q) <= SIGNAL_M for dx in (-1, 0, 1) for dy in (-1, 0, 1) for q in near_cand.get((gx + dx, gy + dy), ())):
            continue
        clusters.append({"nodes": {nid}, "rab": False})
    print(f"  {len(clusters)} intersections ({sum(1 for c in clusters if c['rab'])} roundabouts)")

    # --- arms of each junction -----------------------------------------------
    def legs_of(cl):
        legs = []
        for nid in cl["nodes"]:
            for wid, k in node_ways[nid]:
                el = ways[wid]
                t = el["tags"]
                if cl["rab"] and t.get("junction") in ("roundabout", "circular"):
                    continue
                nodes = el["nodes"]
                ow = str(t.get("oneway", "")).lower()
                oneway = 1 if ow in ("yes", "true", "1") or t.get("junction") == "roundabout" else (-1 if ow == "-1" else 0)
                for step in (1, -1):
                    pts, ids, dist, internal = [node_xy[nid]], [nid], 0.0, False
                    i = k + step
                    while 0 <= i < len(nodes):
                        m = nodes[i]
                        if m in cl["nodes"]:
                            internal = True
                            break
                        q = node_xy.get(m)
                        if q is None:
                            break
                        dist += math.dist(pts[-1], q)
                        pts.append(q)
                        ids.append(m)
                        if dist >= LEG_M:
                            break
                        i += step
                    if internal or len(pts) < 2 or dist < 8:
                        continue
                    # walking in node order (step 1) runs WITH a oneway's traffic, so
                    # that leg carries cars away from the junction
                    inbound = oneway == 0 or (oneway == 1 and step == -1) or (oneway == -1 and step == 1)
                    legs.append({"way": wid, "tags": t, "pts": pts, "ids": ids, "len": dist,
                                 "inbound": inbound, "oneway": oneway != 0,
                                 "brg": bearing(pts[0], along(pts, min(30, dist))[0])})
        return legs

    def arms_of(legs):
        arms = []
        for lg in sorted(legs, key=lambda x: -RANK.get(x["tags"].get("highway"), 0)):
            nm = lg["tags"].get("name") or lg["tags"].get("ref") or ""
            for a in arms:
                if angdiff(a["brg"], lg["brg"]) <= 32 and (a["name"] == nm or not nm or not a["name"]):
                    a["legs"].append(lg)
                    break
            else:
                arms.append({"brg": lg["brg"], "name": nm, "legs": [lg]})
        return arms

    def match_count(pts, brg):
        """Cars a day on this road: the biggest parallel count segment near it."""
        best = None
        L = polylen(pts)
        for d in (25, 55, 95):
            if d > L:
                d = L * 0.7
            p, _ = along(pts, d)
            P = Point(p)
            for i in seg_tree.query(P.buffer(MATCH_M)):
                sg = segs[int(i)]
                line = sg["line"]
                if line.distance(P) > MATCH_M:
                    continue
                at = line.project(P)
                a0 = line.interpolate(max(0, at - 6))
                a1 = line.interpolate(min(line.length, at + 6))
                sb = bearing((a0.x, a0.y), (a1.x, a1.y))
                if min(angdiff(sb, brg), angdiff(sb, (brg + 180) % 360)) > 32:
                    continue
                if best is None or sg["aadt"] > best["aadt"]:
                    best = sg
        return best

    ATT_THRU = {25: 0.45, 30: 0.4, 35: 0.35, 40: 0.28, 45: 0.2}

    def w_thru(speed):
        for lim in sorted(ATT_THRU):
            if speed <= lim:
                return ATT_THRU[lim]
        return 0.1

    def depart_f(speed):
        return 1.0 if speed <= 35 else 0.7 if speed <= 45 else 0.4

    spots = []
    skipped = defaultdict(int)
    for ci, cl in enumerate(clusters):
        pts = [node_xy[x] for x in cl["nodes"]]
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        centre = (cx, cy)
        if math.dist(centre, base_xy) > MAX_KM * 1000:
            continue
        if not served.contains(Point(centre)):
            continue
        legs = legs_of(cl)
        arms = arms_of(legs)
        signal = not cl["rab"] and (any(x in signals for x in cl["nodes"]) or near_signal(centre))
        roundabout = cl["rab"]
        # Two arms is a road that changes name or tags, not a corner, unless a
        # light stops the cars there.
        if len(arms) < 2 or (len(arms) == 2 and not signal):
            continue
        max_rank = max(RANK.get(l["tags"].get("highway"), 0) for l in legs)
        # stop signs on each arm within 40 m of the junction
        arm_stop, arm_all = [], False
        for a in arms:
            st = False
            for lg in a["legs"]:
                acc = 0.0
                for idx in range(1, len(lg["ids"])):
                    acc += math.dist(lg["pts"][idx - 1], lg["pts"][idx])
                    if acc > 40:
                        break
                    if lg["ids"][idx] in stops:
                        st = True
                        if lg["ids"][idx] in allway:
                            arm_all = True
                if lg["ids"][0] in stops:
                    st = True
            arm_stop.append(st)
        all_way = arm_all or (sum(arm_stop) >= 3 and sum(arm_stop) == len(arms))
        aud = audience(centre)
        for a, st in zip(arms, arm_stop):
            inb = [lg for lg in a["legs"] if lg["inbound"]]
            if not inb:
                continue
            lg = max(inb, key=lambda x: (RANK.get(x["tags"].get("highway"), 0), x["len"]))
            t = lg["tags"]
            hw = t.get("highway")
            if hw in NO_PLACE:
                skipped["ramp or freeway"] += 1
                continue
            if str(t.get("access", "")).lower() in ("private", "no"):
                skipped["private road"] += 1
                continue
            rank = RANK.get(hw, 0)
            cnt = match_count(lg["pts"], a["brg"])
            aadt = cnt["aadt"] if cnt else AADT_GUESS.get(hw, 300)
            speed = (cnt["speed"] if cnt and cnt["speed"] else None) or mph(t.get("maxspeed")) or SPEED_GUESS.get(hw, 30)
            if speed >= 50:
                skipped["50 mph or faster"] += 1
                continue
            if roundabout:
                ctrl, w_in = "rab", 0.65
            elif signal:
                ctrl, w_in = "sig", 1.0
            elif all_way:
                ctrl, w_in = "all", 1.0
            elif st:
                ctrl, w_in = "stop", 1.0
            elif rank < max_rank:
                ctrl, w_in = "minor", 0.9
            else:
                ctrl, w_in = "thru", w_thru(speed)
            two_way = not lg["oneway"]
            value = aadt / 2 * w_in + (aadt / 2 * 0.25 * depart_f(speed) if two_way else 0)
            if ctrl in ("minor", "stop"):
                # the corner of a side street is also in plain view of the main road
                others = [x for x in legs if x is not lg and RANK.get(x["tags"].get("highway"), 0) > rank]
                if others:
                    big = max(others, key=lambda x: RANK.get(x["tags"].get("highway"), 0))
                    c2 = match_count(big["pts"], big["brg"])
                    a2 = c2["aadt"] if c2 else AADT_GUESS.get(big["tags"].get("highway"), 300)
                    s2 = (c2["speed"] if c2 and c2["speed"] else None) or SPEED_GUESS.get(big["tags"].get("highway"), 35)
                    value += a2 * 0.12 * depart_f(s2)
            # where the sign goes: back from the corner, right side, on the verge
            back = {"sig": 35, "all": 14, "stop": 14, "minor": 14, "rab": 25, "thru": 45}[ctrl]
            back = min(back, lg["len"] * 0.8)
            p, trav_out = along(lg["pts"], back)
            heading = (trav_out + 180) % 360            # the way cars travel toward the corner
            lanes = (cnt["lanes"] if cnt and cnt["lanes"] and not lg["oneway"] else None) or lanes_of(t) or \
                (1 if lg["oneway"] else LANES_GUESS.get(hw, 2))
            off = lanes * 3.4 / 2 + 2.5 + (1.5 if ctrl == "sig" else 0)
            hr = math.radians(heading)
            px, py = p[0] + math.cos(hr) * off, p[1] - math.sin(hr) * off   # right-hand normal of travel
            P = Point(px, py)
            town = town_at(P)
            if not town:
                skipped["outside the twelve towns"] += 1
                continue
            if mcca is not None and mcca.contains(P):
                skipped["Mill Creek Community Association"] += 1
                continue
            flags = ""
            risk = 1.0
            ref = str(t.get("ref", ""))
            state = bool(re.match(r"^(SR|WA|US|I)[ -]?\d", ref)) or bool(cnt and re.match(r"^\d{3}[a-z]?$", cnt["route"]))
            if state:
                flags += "s"
                risk *= 0.6
            if com_tree is not None:
                for i in com_tree.query(P.buffer(30)):
                    if commercial[int(i)].distance(P) <= 30:
                        flags += "c"
                        risk *= 0.85
                        break
            if speed >= 45:
                flags += "f"
            if not cnt:
                flags += "e"
            dkm = math.dist(centre, base_xy) / 1000
            distf = 1.0 if dkm <= 20 else max(0.85, 1.0 - 0.15 * (dkm - 20) / 20)
            cross = ""
            for other in sorted(arms, key=lambda x: -max(RANK.get(l["tags"].get("highway"), 0) for l in x["legs"])):
                if other is a:
                    continue
                if other["name"] and other["name"] != a["name"]:
                    cross = other["name"]
                    break
            spots.append({
                "cl": ci, "nid": min(cl["nodes"]), "xy": (px, py), "centre": centre, "value": value, "aud": aud,
                "risk": risk, "distf": distf, "ctrl": ctrl, "aadt": int(aadt), "speed": int(speed),
                "head": heading, "road": a["name"] or t.get("highway", "road").replace("_", " "),
                "cross": cross, "town": town, "flags": flags, "dkm": dkm, "out": a["brg"],
                "year": cnt["year"] if cnt else "",
                "leg": lg["pts"], "legway": lg["way"], "half": lanes * 3.4 / 2,
                "legbridge": str(t.get("bridge", "no")).lower() not in ("no", "") or
                             str(t.get("tunnel", "no")).lower() not in ("no", ""),
            })

    print(f"  {len(spots)} placeable approaches before scoring; skipped: {dict(skipped)}")

    # --- score ----------------------------------------------------------------
    auds = sorted(x["aud"] for x in spots)
    a90 = auds[int(len(auds) * 0.9)] if auds else 1
    for x in spots:
        audf = 0.8 + 0.4 * min(1.0, x["aud"] / a90)
        x["raw"] = x["value"] * audf * x["risk"] * x["distf"]
        x["audf"] = audf
    raws = sorted(x["raw"] for x in spots)
    # Near the very top rather than the maximum, so one freak count can't
    # squash everything else, but few enough ties at 100 that the order means something.
    top = raws[int(len(raws) * 0.998)] if raws else 1
    for x in spots:
        x["score"] = max(1, min(100, round(100 * math.sqrt(x["raw"] / top))))
    # --- on the ground ------------------------------------------------------
    worth = [x for x in spots if x["raw"] >= MIN_RAW and
             (x["ctrl"] != "thru" or (x["aadt"] >= THRU_MIN_AADT and "e" not in x["flags"]))]
    placed = ground_place(worth, ways, rails)
    kept = []
    for x in placed:
        P = Point(x["xy"])
        town = town_at(P)
        if not town or (mcca is not None and mcca.contains(P)):
            continue
        # A cemetery lawn is grass by the road, and the worst place for an ad.
        if grave is not None and grave.contains(P):
            continue
        x["town"] = town
        kept.append(x)
    spots = kept

    # best two approaches per junction, and only the ones worth a sign
    by_cl = defaultdict(list)
    for x in spots:
        by_cl[x["cl"]].append(x)
    keep = []
    for cl, xs in by_cl.items():
        xs.sort(key=lambda x: -x["raw"])
        keep += xs[:MAX_PER_JUNCTION]
    keep.sort(key=lambda x: -x["raw"])
    # junction numbers in rank order, so jx 0 is the best corner in the area
    jmap = {}
    for x in keep:
        jmap.setdefault(x["cl"], len(jmap))
    seen_ids = set()
    for x in keep:
        dirn = SHORT[int(((x["out"] + 22.5) % 360) // 45)]
        sid = f"{b36(x['nid'])}{dirn}"
        k = 2
        while sid in seen_ids:
            sid = f"{b36(x['nid'])}{dirn}{k}"
            k += 1
        seen_ids.add(sid)
        x["id"] = sid
        x["jx"] = jmap[x["cl"]]
    print(f"  kept {len(keep)} spots at {len(jmap)} intersections")

    pin_features(keep)
    write_json(keep)
    write_md(keep)


# ---------------------------------------------------------------------------
# the ground: NAIP 2023 infrared, read a window at a time from the public
# cloud copy (Microsoft Planetary Computer). About a second a junction, cached.
# ---------------------------------------------------------------------------
def naip_items():
    s, w, n, e = BBOX
    path = os.path.join(CACHE, "naip-items.json")
    if os.path.exists(path):
        return json.load(open(path))
    out, url, body = [], NAIP_STAC, {"collections": ["naip"], "bbox": [w, s, e, n],
                                     "datetime": "2023-01-01T00:00:00Z/2023-12-31T23:59:59Z", "limit": 200}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=dict(UA, **{"Content-Type": "application/json"}))
    d = json.load(urllib.request.urlopen(req, timeout=120))
    for f in d["features"]:
        pr = f["properties"]
        out.append({"href": f["assets"]["image"]["href"], "bbox": pr.get("proj:bbox"), "epsg": pr.get("proj:epsg"),
                    "date": pr.get("datetime", "")[:10]})
    if not out or any(not x["bbox"] or not x["epsg"] for x in out):
        sys.exit("NAIP search came back without footprints; can't check the ground")
    os.makedirs(CACHE, exist_ok=True)
    json.dump(out, open(path, "w"))
    return out


class Ground:
    """NDVI around one junction, in UTM metres, with a summed-area table so a
    patch's grass share is four lookups."""
    def __init__(self, nd, chm, x0, y0, res):
        import numpy as np
        self.np, self.x0, self.y0, self.res = np, x0, y0, res
        self.h, self.w = nd.shape
        g = ((nd >= NDVI_GRASS) & (chm <= MAX_GROWTH_M)).astype(np.int32)
        self.sl = np.pad((chm <= MAX_GROWTH_M).astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
        tall = (chm > TREE_M).astype(np.int32)
        self.st = np.pad(tall.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
        ok = (nd > -1.5).astype(np.int32)                  # -2 marks "no picture here"
        self.sg = np.pad(g.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
        self.nd, self.chm = nd, chm                         # kept for the pin measurements (see pin_features)
        self.so = np.pad(ok.cumsum(0).cumsum(1), ((1, 0), (1, 0)))

    def grass(self, ux, uy, r=1.0):
        c = int((ux - self.x0) / self.res)
        rr = int((self.y0 - uy) / self.res)
        k = max(1, int(round(r / self.res)))
        a, b, c0, c1 = rr - k, rr + k + 1, c - k, c + k + 1
        if a < 0 or c0 < 0 or b > self.h or c1 > self.w:
            return 0.0
        n = (b - a) * (c1 - c0)
        ok = self.so[b, c1] - self.so[a, c1] - self.so[b, c0] + self.so[a, c0]
        if ok < n:
            return 0.0
        k2 = max(1, int(round(OPEN_R / self.res)))
        a2, b2, d0, d1 = max(0, rr - k2), min(self.h, rr + k2 + 1), max(0, c - k2), min(self.w, c + k2 + 1)
        n2 = (b2 - a2) * (d1 - d0)
        # nothing taller than knee height where the stake goes
        if self.sl[b, c1] - self.sl[a, c1] - self.sl[b, c0] + self.sl[a, c0] < n:
            return 0.0
        if self.st[b2, d1] - self.st[a2, d1] - self.st[b2, d0] + self.st[a2, d0] > WOODS_SHARE * n2:
            return 0.0
        k3 = int(round(WOODS_R / self.res))
        a3, b3, e0, e1 = max(0, rr - k3), min(self.h, rr + k3 + 1), max(0, c - k3), min(self.w, c + k3 + 1)
        n3 = (b3 - a3) * (e1 - e0)
        if self.st[b3, e1] - self.st[a3, e1] - self.st[b3, e0] + self.st[a3, e0] >= WOODS_R_SHARE * n3:
            return 0.0
        return (self.sg[b, c1] - self.sg[a, c1] - self.sg[b, c0] + self.sg[a, c0]) / n


def ground_chips(centres):
    """{cluster: Ground} for every junction centre (lat, lon), from cache or NAIP."""
    import numpy as np
    try:
        import rasterio
        from rasterio.windows import from_bounds
        from rasterio.warp import transform as rtransform
    except ImportError:
        sys.exit("needs rasterio and numpy: pip install rasterio numpy")
    from concurrent.futures import ThreadPoolExecutor
    items = naip_items()
    epsg = items[0]["epsg"]
    keys = list(centres)
    xs, ys = rtransform("EPSG:4326", f"EPSG:{epsg}", [centres[k][1] for k in keys], [centres[k][0] for k in keys])
    utm = {k: (xs[i], ys[i]) for i, k in enumerate(keys)}
    cdir = os.path.join(CACHE, "naip")
    os.makedirs(cdir, exist_ok=True)
    out, todo = {}, defaultdict(list)
    for k in keys:
        ux, uy = utm[k]
        f = os.path.join(cdir, f"{int(ux)}_{int(uy)}.npz")
        if os.path.exists(f):
            z = np.load(f)
            out[k] = (z["nd"].astype(np.float32) / 100, float(z["x0"]), float(z["y0"]), float(z["res"]))
            continue
        # the photo that holds this window with the most room to spare
        best, bm = None, -1e9
        for it in items:
            if it["epsg"] != epsg:
                continue
            b = it["bbox"]
            m = min(ux - CHIP_HALF - b[0], b[2] - ux - CHIP_HALF, uy - CHIP_HALF - b[1], b[3] - uy - CHIP_HALF)
            if m > bm:
                best, bm = it, m
        todo[best["href"]].append((k, ux, uy, f))
    if todo:
        print(f"  reading {sum(len(v) for v in todo.values())} photo windows from {len(todo)} NAIP tiles...")
        token = {"t": "", "at": 0}
        def sas():
            if time.time() - token["at"] > 1800:
                token["t"] = json.load(urllib.request.urlopen(NAIP_SAS, timeout=60))["token"]
                token["at"] = time.time()
            return token["t"]
        def one_tile(href):
            env = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_MULTIRANGE="YES",
                       GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES", GDAL_HTTP_MAX_RETRY="4", GDAL_HTTP_RETRY_DELAY="2")
            got = {}
            for attempt in range(3):
                try:
                    with rasterio.Env(**env), rasterio.open(href + "?" + sas()) as ds:
                        for k, ux, uy, f in todo[href]:
                            if k in got:
                                continue
                            win = from_bounds(ux - CHIP_HALF, uy - CHIP_HALF, ux + CHIP_HALF, uy + CHIP_HALF, ds.transform)
                            a = ds.read([1, 4], window=win, boundless=True, fill_value=0).astype(np.float32)
                            r, nir = a[0], a[1]
                            nd = np.where((r + nir) > 0, (nir - r) / np.maximum(r + nir, 1), -2.0)
                            x0, y0 = ux - CHIP_HALF, uy + CHIP_HALF
                            res = (2 * CHIP_HALF) / nd.shape[1]
                            np.savez_compressed(f, nd=np.round(nd * 100).astype(np.int8), x0=x0, y0=y0, res=res)
                            got[k] = (nd, x0, y0, res)
                    return got
                except Exception as e:
                    print(f"  retry NAIP tile ({str(e)[:80]})")
                    time.sleep(5 * (attempt + 1))
            raise SystemExit("NAIP tile kept failing: " + href)
        with ThreadPoolExecutor(8) as ex:
            for got in ex.map(one_tile, list(todo)):
                out.update(got)
    # How tall it is, on the same grid as the photo.
    from rasterio.warp import reproject, Resampling
    from rasterio.transform import from_origin
    hdir = os.path.join(CACHE, "chm")
    os.makedirs(hdir, exist_ok=True)
    def qkey(lat, lon, z=9):
        n = 2 ** z
        x = int((lon + 180) / 360 * n)
        y = int((1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n)
        return "".join(str(((x >> (i - 1)) & 1) + 2 * ((y >> (i - 1)) & 1)) for i in range(z, 0, -1))
    heights, need = {}, defaultdict(list)
    for k in keys:
        ux, uy = utm[k]
        f = os.path.join(hdir, f"{int(ux)}_{int(uy)}.npz")
        if os.path.exists(f):
            heights[k] = np.load(f)["h"]
        else:
            need[qkey(*centres[k])].append((k, f))
    if need:
        print(f"  reading tree heights for {sum(len(v) for v in need.values())} junctions...")
        def one_q(q):
            got = {}
            env = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_MAX_RETRY="4", GDAL_HTTP_RETRY_DELAY="2")
            with rasterio.Env(**env), rasterio.open(CHM.format(q)) as ds:
                for k, f in need[q]:
                    nd, x0, y0, res = out[k]
                    dst = np.zeros(nd.shape, np.float32)
                    lat, lon = centres[k]
                    mx, my = rtransform("EPSG:4326", ds.crs, [lon], [lat])
                    pad = CHIP_HALF * 1.6 / math.cos(math.radians(lat))
                    win = from_bounds(mx[0] - pad, my[0] - pad, mx[0] + pad, my[0] + pad, ds.transform)
                    src = ds.read(1, window=win, boundless=True, fill_value=0).astype(np.float32)
                    reproject(src, dst, src_transform=ds.window_transform(win), src_crs=ds.crs,
                              dst_transform=from_origin(x0, y0, res, res), dst_crs=f"EPSG:{epsg}",
                              resampling=Resampling.max)
                    h = np.clip(np.round(dst), 0, 120).astype(np.uint8)
                    np.savez_compressed(f, h=h)
                    got[k] = h
            return got
        with ThreadPoolExecutor(8) as ex:
            for got in ex.map(one_q, list(need)):
                heights.update(got)
    return {k: Ground(v[0], heights[k].astype(np.float32), v[1], v[2], v[3]) for k, v in out.items()}, epsg


def ground_place(worth, ways, rails):
    """Move each pin onto grass it can stand in, or drop it. Returns the kept spots."""
    from rasterio.warp import transform as rtransform
    print("Checking the ground under every pin (NAIP 2023 infrared)...")
    by_cl = defaultdict(list)
    for x in worth:
        by_cl[x["cl"]].append(x)
    centres = {cl: ll(*xs[0]["centre"]) for cl, xs in by_cl.items()}
    chips, epsg = ground_chips(centres)
    return place_all(by_cl, chips, epsg, ways, rails)


def place_all(by_cl, chips, epsg, ways, rails):
    from rasterio.warp import transform as rtransform
    # every mapped road and bridge near a junction, with how wide it is
    lines, meta = [], []
    for wid, el in ways.items():
        t = el["tags"]
        pts = [xy(g["lat"], g["lon"]) for g in el["geometry"]]
        if len(pts) < 2:
            continue
        lines.append(LineString(pts))
        lanes = lanes_of(t) or (1 if str(t.get("oneway", "")).lower() in ("yes", "true", "1") else LANES_GUESS.get(t.get("highway"), 2))
        br = str(t.get("bridge", "no")).lower() not in ("no", "") or str(t.get("tunnel", "no")).lower() not in ("no", "")
        meta.append((wid, lanes * 3.4 / 2, br))
    # Railways: a sign by the tracks is on the railroad's land, and one past
    # them is across the tracks from its road. 6 m clear.
    for r in rails:
        lines.append(r)
        meta.append((None, 1.5 + 4.5, False))
    tree = STRtree(lines)
    why = defaultdict(int)
    kept = []
    # (the grass test below is "growing and under 1 m": see MAX_GROWTH_M)
    # candidate points for one approach, then one batch of UTM conversions
    for cl, xs in by_cl.items():
        g = chips.get(cl)
        for x in xs:
            near = [int(i) for i in tree.query(LineString(x["leg"]).buffer(LAT_MAX + x["half"] + BRIDGE_CLEAR + 15))]
            if x["legbridge"]:
                why["the road there is a bridge"] += 1
                continue
            lo, ideal, hi = PLACE_RANGE[x["ctrl"]]
            leg = x["leg"]
            L = polylen(leg)
            hi = min(hi, L - 1)
            cands = []
            d = lo
            while d <= hi:
                p, trav_out = along(leg, d)
                head = (trav_out + 180) % 360
                hr = math.radians(head)
                nx, ny = math.cos(hr), -math.sin(hr)
                side = x["half"] + 0.5
                while side <= x["half"] + LAT_MAX:
                    cands.append((d, side, p[0] + nx * side, p[1] + ny * side, head, nx, ny))
                    side += 1.0
                d += 2.0
            if not cands or g is None:
                why["no photo"] += 1
                continue
            lls = [ll(c[2], c[3]) for c in cands]
            ux, uy = rtransform("EPSG:4326", f"EPSG:{epsg}", [q[1] for q in lls], [q[0] for q in lls])
            best, bcost = None, 1e9
            first_side = {}
            for i, (d, side, px, py, head, nx, ny) in enumerate(cands):
                if d in first_side and first_side[d] is not None:
                    continue                                # already found the grass nearest the road here
                if g.grass(ux[i], uy[i], 1.0) < GRASS_SHARE:
                    continue
                P = Point(px, py)
                # the stretch from the kerb to the pin: nothing mapped may cross it
                reach = LineString([(px - nx * (side - x["half"]), py - ny * (side - x["half"])), (px, py)]) \
                    if side - x["half"] > 0.6 else None
                clear = True
                for j in near:
                    wid, hw, br = meta[j]
                    if reach is not None and wid != x["legway"] and lines[j].intersects(reach):
                        clear = False
                        break
                    dist = lines[j].distance(P)
                    if br and dist < BRIDGE_CLEAR:
                        clear = False
                        break
                    if dist < hw + 1.0:
                        clear = False
                        break
                if not clear:
                    continue
                first_side[d] = side
                cost = abs(d - ideal) / ideal + 0.06 * (side - x["half"])
                if cost < bcost:
                    best, bcost = (d, side, px, py, head, ux[i], uy[i]), cost
            if best is None:
                why["no open grass beside the road"] += 1
                continue
            d, side, px, py, head, pux, puy = best
            x["utm"], x["g"] = (pux, puy), g
            x["xy"], x["back"], x["side"], x["head"] = (px, py), d, side - x["half"], head
            kept.append(x)
    print(f"  {len(kept)} of {sum(len(v) for v in by_cl.values())} approaches have grass to stand a sign in; dropped: {dict(why)}")
    return kept


# ---------------------------------------------------------------------------
# What the ground looks like at each pin, for the crew app to learn from.
# Mikey marks pins Good or Bad in the app's Check tab and the crew's field
# results count too; the app fits a small model on these numbers to guess at
# the pins nobody has looked at yet. Each is scaled to 0-255 so the list stays
# small. Change the set and FX_VERSION together: the app drops a model that was
# learned on a different set.
# ---------------------------------------------------------------------------
FX_VERSION = "fx1"
FX = [  # name, what it is, range mapped to 0-255
    ("ndvi_pin", "infrared greenness on the 3 m patch", (-0.2, 0.8)),
    ("ndvi_6m", "infrared greenness within 6 m", (-0.2, 0.8)),
    ("ndvi_sd", "how patchy the greenness is within 6 m", (0, 0.4)),
    ("nir_pin", "infrared brightness on the patch", (0, 255)),
    ("vis_pin", "visible brightness on the patch", (0, 255)),
    ("nir_tex", "infrared texture within 6 m (tree crowns are lumpy)", (0, 80)),
    ("vis_tex", "visible texture within 6 m", (0, 80)),
    ("shade_6m", "share in deep shadow within 6 m", (0, 1)),
    ("green_red", "green over red on the patch", (0.6, 1.8)),
    ("tall_pin", "tallest growth on the patch, m", (0, 30)),
    ("tall_3m", "share under trees within 3 m", (0, 1)),
    ("tall_5m", "share under trees within 5 m", (0, 1)),
    ("tall_10m", "share under trees within 10 m", (0, 1)),
    ("tall_20m", "share under trees within 20 m", (0, 1)),
    ("grass_3m", "share that is open grass within 3 m", (0, 1)),
    ("grass_10m", "share that is open grass within 10 m", (0, 1)),
    ("paved_10m", "share that is pavement or roof within 10 m", (0, 1)),
]


def pin_features(keep):
    """Measures FX at every kept pin: the photo's own four bands from NAIP
    (a 30 m window, cached), the rest from the junction's cached grids."""
    import numpy as np
    import rasterio
    from rasterio.windows import from_bounds
    from concurrent.futures import ThreadPoolExecutor
    print("Measuring the ground at each pin (for the app's learner)...")
    items = naip_items()
    fdir = os.path.join(CACHE, "pins")
    os.makedirs(fdir, exist_ok=True)
    todo = defaultdict(list)
    bands = {}
    for x in keep:
        ux, uy = x["utm"]
        f = os.path.join(fdir, f"{int(round(ux))}_{int(round(uy))}.npy")
        x["pinf"] = f
        if os.path.exists(f):
            continue
        best, bm = None, -1e9
        for it in items:
            b = it["bbox"]
            m = min(ux - 20 - b[0], b[2] - ux - 20, uy - 20 - b[1], b[3] - uy - 20)
            if m > bm:
                best, bm = it, m
        todo[best["href"]].append(x)
    if todo:
        token = json.load(urllib.request.urlopen(NAIP_SAS, timeout=60))["token"]
        def one(href):
            env = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_MULTIRANGE="YES", GDAL_HTTP_MAX_RETRY="4")
            with rasterio.Env(**env), rasterio.open(href + "?" + token) as ds:
                for x in todo[href]:
                    ux, uy = x["utm"]
                    a = ds.read(window=from_bounds(ux - 15, uy - 15, ux + 15, uy + 15, ds.transform),
                                out_shape=(4, 51, 51), boundless=True, fill_value=0)
                    np.save(x["pinf"], a.astype(np.uint8))
        with ThreadPoolExecutor(8) as ex:
            list(ex.map(one, list(todo)))
    for x in keep:
        a = np.load(x["pinf"]).astype(np.float32)         # R, G, B, NIR; 51 px over 30 m
        r, gr, bl, nir = a
        c = 25
        nd = (nir - r) / np.maximum(nir + r, 1)
        vis = (r + gr + bl) / 3
        def win(arr, m):                                   # m metres either side
            k = max(1, int(round(m / (30 / 51))))
            return arr[c - k:c + k + 1, c - k:c + k + 1]
        g = x["g"]
        ux, uy = x["utm"]
        col = int((ux - g.x0) / g.res)
        row = int((g.y0 - uy) / g.res)
        def gw(arr, m):
            k = max(1, int(round(m / g.res)))
            return arr[max(0, row - k):row + k + 1, max(0, col - k):col + k + 1]
        tall = g.chm > TREE_M
        grass = (g.nd >= NDVI_GRASS) & (g.chm <= MAX_GROWTH_M)
        paved = (g.nd < 0.1) & (g.nd > -1.5)
        v = {
            "ndvi_pin": win(nd, 1.5).mean(), "ndvi_6m": win(nd, 6).mean(), "ndvi_sd": win(nd, 6).std(),
            "nir_pin": win(nir, 1.5).mean(), "vis_pin": win(vis, 1.5).mean(),
            "nir_tex": win(nir, 6).std(), "vis_tex": win(vis, 6).std(),
            "shade_6m": (win(vis, 6) < 55).mean(),
            "green_red": (win(gr, 1.5).mean() + 1) / (win(r, 1.5).mean() + 1),
            "tall_pin": gw(g.chm, 1.5).max(), "tall_3m": gw(tall, 3).mean(), "tall_5m": gw(tall, 5).mean(),
            "tall_10m": gw(tall, 10).mean(), "tall_20m": gw(tall, 20).mean(),
            "grass_3m": gw(grass, 3).mean(), "grass_10m": gw(grass, 10).mean(), "paved_10m": gw(paved, 10).mean(),
        }
        x["fx"] = [int(round(255 * min(1, max(0, (float(v[n]) - lo) / (hi - lo))))) for n, _, (lo, hi) in FX]


def write_json(keep):
    # flags: s state highway, c shopping frontage, f 45 mph, e traffic estimated
    cols = ["id", "lat", "lon", "score", "ctrl", "aadt", "spd", "head", "road", "cross", "town", "flags", "jx", "back", "side", "fx"]
    rows = []
    for x in keep:
        lat, lon = ll(*x["xy"])
        rows.append([x["id"], round(lat, 5), round(lon, 5), x["score"], x["ctrl"], int(round(x["aadt"], -2)) or x["aadt"],
                     x["speed"], int(round(x["head"])) % 360, x["road"], x["cross"], x["town"],
                     x["flags"], x["jx"],
                     int(round(x["back"])), round(x["side"], 1), x["fx"]])
    towns = []
    for t, (lat, lon) in TOWN_CENTRES.items():
        towns.append([t, lat, lon, sum(1 for x in keep if x["town"] == t)])
    years = sorted({x["year"] for x in keep if x["year"]})
    out = {
        "v": 1, "generated": time.strftime("%Y-%m-%d"),
        "source": ("Traffic: FHWA HPMS " + (years[-1] if years else "2023") + " counts (WSDOT). Lights, stop signs, "
                   "roads: OpenStreetMap. Homes and fit: Census 2020 blocks, ACS 5-year block groups. "
                   "Built by print/tools/sign-spots.py in the website repo."),
        "base": {"lat": BASE[0], "lon": BASE[1]},
        "towns": towns,
        "cols": cols,
        "fxv": FX_VERSION, "fx": [[n, d] for n, d, _ in FX],
        "spots": rows,
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_JSON, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {os.path.relpath(OUT_JSON, ROOT)} ({len(rows)} spots, {os.path.getsize(OUT_JSON) // 1024} KB)")


CTRL_WORDS = {"sig": "light", "all": "all-way stop", "stop": "stop sign", "minor": "side-street corner",
              "rab": "roundabout", "thru": "passing traffic"}


def write_md(keep):
    lines = ["# Yard sign spots, ranked", "",
             "Generated by `python3 print/tools/sign-spots.py` on " + time.strftime("%Y-%m-%d") +
             ". Do not edit by hand: change the script and run it again. The Sign Crew app in the dashboard "
             "reads the same list (`public/sign-spots.json`).", "",
             "**Score** 100 = the best spot in the area. **Cars/day** is the federal count for that road "
             "(both directions); \"est.\" means the road has no count and the number is a conservative guess. "
             "**Faces** is the direction the cars are driving when they see it.", ""]
    summary = ["| Town | Spots | Score 50+ | Score 25+ | Lights | Top spot |", "|---|---|---|---|---|---|"]
    for t in TOWN_CENTRES:
        xs = [x for x in keep if x["town"] == t]
        if not xs:
            summary.append(f"| {t} | 0 | 0 | 0 | 0 | |")
            continue
        b = xs[0]
        summary.append(f"| {t} | {len(xs)} | {sum(1 for x in xs if x['score'] >= 50)} | "
                       f"{sum(1 for x in xs if x['score'] >= 25)} | {sum(1 for x in xs if x['ctrl'] == 'sig')} | "
                       f"{b['road']} & {b['cross'] or 'a light'} ({b['score']}) |")
    lines += ["## By town", ""] + summary + [""]
    flag_words = {"s": "state highway (WSDOT pulls signs)", "c": "shopping centre frontage", "f": "45 mph road",
                  "e": "traffic estimated"}
    for t in TOWN_CENTRES:
        xs = [x for x in keep if x["town"] == t][:15]
        if not xs:
            continue
        lines += [f"## {t}", "", "| # | Where | Faces | At | Cars/day | Score | Watch for | Map |", "|---|---|---|---|---|---|---|---|"]
        for i, x in enumerate(xs, 1):
            lat, lon = ll(*x["xy"])
            faces = COMPASS[int(((x["head"] + 22.5) % 360) // 45)]
            watch = "; ".join(flag_words[c] for c in x["flags"] if c in flag_words)
            cars = f"{x['aadt']:,}" + (" est." if "e" in x["flags"] else "")
            lines.append(f"| {i} | {x['road']} at {x['cross'] or 'the corner'} | {faces}bound | "
                         f"{CTRL_WORDS[x['ctrl']]} | {cars} | {x['score']} | {watch} | "
                         f"[pin](https://www.google.com/maps/search/?api=1&query={lat:.5f},{lon:.5f}) |")
        lines.append("")
    with open(OUT_MD, "w") as f:
        f.write("\n".join(lines))
    print(f"wrote {os.path.relpath(OUT_MD, ROOT)}")


if __name__ == "__main__":
    main()
