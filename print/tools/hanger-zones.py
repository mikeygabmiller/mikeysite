# -*- coding: utf-8 -*-
"""Picks the door hanger zones: where 2,000 hangers earn the most per hour of walking.

    pip install shapely          # once
    python3 print/tools/hanger-zones.py

Writes print/door-hanger/zones.geojson (every zone, ranked) and rewrites the
generated tables in print/door-hanger/ROUTES.md between the ZONES markers.
Copy zones.geojson to the dashboard repo as public/hanger-zones.json so the
Door Hangers map there shows the same zones.

How a zone is picked, in plain words:

1. Only houses inside the twelve towns' ZIP codes (SERVED_ZIPS). Lynnwood and
   Edmonds ZIPs are not in the list on purpose.
2. Census 2020 blocks (a block is roughly one street's worth of houses) tell
   how many homes sit on how much land. Too spread out (acreage) is slow to
   walk. Too packed is apartments or townhomes, where renters can't offer a
   spigot and an outlet. Blocks outside 300 to 2,400 homes per square km are
   dropped.
3. Census ACS 5-year numbers for the block group around each block say who
   lives there: median household income, the share who own, the share with two
   or more cars. That's the "fit" of each door.
4. Neighbouring blocks are grouped into walkable zones of about 150 to 250
   doors, one session of hanging.
5. Each zone is scored on fit x doors, divided by the hours it costs you:
   walking it plus the round trip from home. Best zone = 100.

Downloads are cached in print/tools/.cache (git-ignored). Delete it to refetch.
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request

try:
    from shapely.geometry import shape, mapping, Point
    from shapely.ops import unary_union
    from shapely.strtree import STRtree
except ImportError:
    sys.exit("needs shapely: pip install shapely")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, ".cache")
OUT_GEO = os.path.join(ROOT, "print", "door-hanger", "zones.geojson")
OUT_MD = os.path.join(ROOT, "print", "door-hanger", "ROUTES.md")

BASE = (47.9129, -122.0982)               # home base, same as the site schema
UA = {"User-Agent": "mikeysdetailing-hanger-zones/1.0 (mikeysdetailing4u@gmail.com)"}

# ZIP -> the town it mails as. Only the twelve served towns.
SERVED_ZIPS = {
    "98290": "Snohomish", "98296": "Snohomish", "98258": "Lake Stevens",
    "98201": "Everett", "98203": "Everett", "98204": "Everett", "98208": "Everett",
    "98272": "Monroe", "98012": "Mill Creek", "98270": "Marysville",
    "98271": "Marysville", "98011": "Bothell", "98021": "Bothell",
    "98019": "Duvall", "98275": "Mukilteo", "98072": "Woodinville",
    "98077": "Woodinville", "98252": "Granite Falls", "98223": "Arlington",
}
COUNTIES = ("061", "033")                 # Snohomish, King (Duvall, Woodinville, south Bothell)

# What each city asks before hanging (checked 2026-09-27). Leaving a hanger
# without knocking may not count as soliciting, but these take the question off
# the table. Unincorporated Snohomish County code has no peddler chapter.
PERMITS = {
    "_county": "",
    "_city": "Call the city clerk first",
    "Mill Creek": "Free Peddler Information Form: cityclerk@millcreekwa.gov, 425-745-1891",
    "Woodinville": "Peddler's permit (6 months): woodinville.gov/185/Peddlers-License",
    "Mukilteo": "Canvasser-peddler license: City Clerk, 425-263-8005",
    "Lake Stevens": "Solicitor license with background check and badge: lakestevenswa.gov/404",
    "Snohomish": "Solicitor license with a $1,000 bond: snohomishwa.gov/395",
    "Bothell": "Call the City Clerk first (bothellwa.gov)",
}

# The 2,000 hangers arriving about Oct 19, the Rain-Ready offer ending Dec 31.
HANGERS = 2000
WAVE1_ZONES = 5                           # new doors, one zone a week
REDROP_ZONES = 2                          # the best two get a second drop 4 weeks later
FIRST_WEEK = "2026-10-19"

MIN_DENSITY, MAX_DENSITY = 300, 2400      # homes per km2, see step 2
ZONE_TARGET, ZONE_MAX, ZONE_MIN = 180, 260, 110
ZONE_RADIUS_M = 900                       # a zone stays walkable from one parked car
MAX_DRIVE_MIN = 40
KEEP_ZONES = 40                           # how many go on the map

TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer"
ACS = "https://api.censusreporter.org/1.0/data/show/latest"
OSRM = "https://router.project-osrm.org"
OVERPASS = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"


def fetch(url, data=None, name=None, tries=4):
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
            with urllib.request.urlopen(req, timeout=180) as r:
                out = json.loads(r.read().decode())
            break
        except Exception as e:
            if i == tries - 1:
                raise
            print(f"  retry {url[:60]}... ({e})")
            time.sleep(2 ** (i + 1))
    if name:
        os.makedirs(CACHE, exist_ok=True)
        with open(path, "w") as f:
            json.dump(out, f)
    return out


def tiger_query(layer, where, name, envelope=None, fields="*"):
    feats, offset = [], 0
    while True:
        q = {"where": where, "outFields": fields, "returnGeometry": "true",
             "outSR": "4326", "f": "geojson", "resultOffset": offset,
             "resultRecordCount": 1000}
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


def meters(a, b):
    """Rough metres between two (lat, lon)."""
    dy = (a[0] - b[0]) * 111_320
    dx = (a[1] - b[1]) * 111_320 * math.cos(math.radians(a[0]))
    return math.hypot(dx, dy)


def seconds_per_door(density):
    """Walk to the door and back, plus half the gap to the next house.
    Gross spacing from density; 1,000 homes/km2 comes out near 78 doors an hour."""
    spacing = math.sqrt(1e6 / density)
    return 18 + 0.9 * spacing


def main():
    print("ZIP areas...")
    zips = tiger_query(84, "ZCTA5 IN (%s)" % ",".join(f"'{z}'" for z in SERVED_ZIPS), "zcta", fields="ZCTA5")
    zip_shapes = [(f["properties"]["ZCTA5"], shape(f["geometry"])) for f in zips]
    served = unary_union([s for _, s in zip_shapes])
    minx, miny, maxx, maxy = served.bounds

    print("Census blocks...")
    blocks = tiger_query(10, "STATE='53' AND COUNTY IN ('061','033') AND HU100>0", "blocks",
                         envelope=(minx, miny, maxx, maxy),
                         fields="GEOID,HU100,POP100,AREALAND,CENTLAT,CENTLON")
    print(f"  {len(blocks)} blocks with homes")

    print("ACS by block group...")
    acs = {}
    for c in COUNTIES:
        d = fetch(ACS + "?" + urllib.parse.urlencode({"table_ids": "B19013,B25003,B25024,B25044",
                                                 "geo_ids": f"150|05000US53{c}"}), None, f"acs-{c}.json")
        for gid, x in d["data"].items():
            inc = x["B19013"]["estimate"]["B19013001"]
            t = x["B25003"]["estimate"]
            v = x["B25044"]["estimate"]
            u = x["B25024"]["estimate"]
            hh = t["B25003001"] or 0
            if not hh:
                continue
            two = sum(v.get(k) or 0 for k in ("B25044005", "B25044006", "B25044007",
                                               "B25044012", "B25044013", "B25044014"))
            acs[gid[7:]] = {"income": inc, "own": (t["B25003002"] or 0) / hh,
                            "cars2": two / max(v["B25044001"] or 1, 1),
                            "detached": (u["B25024002"] or 0) / max(u["B25024001"] or 1, 1)}

    # --- eligible blocks ---
    cells = []
    for f in blocks:
        p = f["properties"]
        hu, land = p["HU100"] or 0, (p["AREALAND"] or 0) / 1e6
        if hu < 6 or land <= 0:
            continue
        dens = hu / land
        if not (MIN_DENSITY <= dens <= MAX_DENSITY):
            continue
        pt = Point(float(p["CENTLON"]), float(p["CENTLAT"]))
        if not served.contains(pt):
            continue
        bg = acs.get(p["GEOID"][:12])
        if not bg or not bg["income"]:
            continue
        inc_ix = min(max(bg["income"] / 150_000, 0.35), 1.5)
        car_ix = min(max(bg["cars2"] / 0.75, 0.5), 1.2)
        fit = inc_ix * bg["own"] * car_ix          # relative value of one door here
        zipc = next((z for z, s in zip_shapes if s.contains(pt)), None)
        cells.append({"geoid": p["GEOID"], "hu": hu, "dens": dens, "fit": fit, "bg": bg,
                      "zip": zipc, "geom": shape(f["geometry"]), "pt": (pt.y, pt.x),
                      "sec": seconds_per_door(dens)})
    print(f"  {len(cells)} blocks pass the density and ZIP filters")

    # --- grow zones ---
    geoms = [c["geom"].buffer(0.0004) for c in cells]      # ~40 m, bridges streets between blocks
    tree = STRtree(geoms)
    order = sorted(range(len(cells)), key=lambda i: -cells[i]["fit"] * 3600 / cells[i]["sec"])
    taken = set()
    zones = []
    for seed in order:
        if seed in taken:
            continue
        members, doors = [seed], cells[seed]["hu"]
        taken.add(seed)
        frontier, seen = set(), {seed}
        grow_from = [seed]
        while doors < ZONE_TARGET:
            for m in grow_from:
                for j in tree.query(geoms[m]):
                    j = int(j)
                    if j in seen or j in taken:
                        continue
                    seen.add(j)
                    if geoms[m].intersects(geoms[j]) and meters(cells[seed]["pt"], cells[j]["pt"]) <= ZONE_RADIUS_M:
                        frontier.add(j)
            frontier = {j for j in frontier if j not in taken and doors + cells[j]["hu"] <= ZONE_MAX}
            if not frontier:
                break
            nxt = max(frontier, key=lambda j: cells[j]["fit"])
            frontier.discard(nxt)
            members.append(nxt)
            taken.add(nxt)
            doors += cells[nxt]["hu"]
            grow_from = [nxt]
        if doors < ZONE_MIN:
            for m in members[1:]:
                taken.discard(m)                # let a better seed use them
            continue
        zones.append(members)
    print(f"  {len(zones)} zones")

    # --- score (before drive time) and keep the best candidates ---
    def zone_stats(members):
        cs = [cells[i] for i in members]
        doors = sum(c["hu"] for c in cs)
        walk_h = sum(c["hu"] * c["sec"] for c in cs) / 3600
        value = sum(c["hu"] * c["fit"] for c in cs)
        wavg = lambda k: sum(c["hu"] * c["bg"][k] for c in cs) / doors
        geom = unary_union([c["geom"] for c in cs]).buffer(0.00015).buffer(-0.0001)
        return {"doors": doors, "walk_h": walk_h, "value": value, "geom": geom,
                "income": sum(c["hu"] * c["bg"]["income"] for c in cs) / doors,
                "own": wavg("own"), "cars2": wavg("cars2"),
                "zip": max(set(c["zip"] for c in cs), key=lambda z: sum(c["hu"] for c in cs if c["zip"] == z))}

    stats = [zone_stats(m) for m in zones]
    stats.sort(key=lambda s: -s["value"] / s["walk_h"])
    stats = stats[:KEEP_ZONES * 3]

    print("Drive times...")
    for i in range(0, len(stats), 80):
        chunk = stats[i:i + 80]
        pts = [chunk_s["geom"].representative_point() for chunk_s in chunk]
        coords = f"{BASE[1]},{BASE[0]};" + ";".join(f"{p.x:.5f},{p.y:.5f}" for p in pts)
        d = fetch(f"{OSRM}/table/v1/driving/{coords}?sources=0", None, f"osrm-table-{i}-{len(chunk)}-{hash(coords) & 0xffffff}.json")
        for s, sec in zip(chunk, d["durations"][0][1:]):
            s["drive_min"] = (sec or 99999) / 60
    stats = [s for s in stats if s["drive_min"] <= MAX_DRIVE_MIN]
    for s in stats:
        s["score_raw"] = s["value"] / (s["walk_h"] + 2 * s["drive_min"] / 60)
    stats.sort(key=lambda s: -s["score_raw"])
    stats = stats[:KEEP_ZONES]
    top = stats[0]["score_raw"]

    print("Place names, start spots, streets...")
    for n, s in enumerate(stats, 1):
        s["id"] = f"Z{n:02d}"
        s["rank"] = n
        s["score"] = round(100 * s["score_raw"] / top)
        rp = s["geom"].representative_point()
        near = fetch(f"{OSRM}/nearest/v1/driving/{rp.x:.5f},{rp.y:.5f}", None, f"osrm-near-{rp.x:.5f}-{rp.y:.5f}.json")
        w = near["waypoints"][0]
        s["start"] = {"lat": round(w["location"][1], 5), "lon": round(w["location"][0], 5), "street": w.get("name") or ""}
        place, incorporated = None, False
        for layer in (26, 28):   # incorporated place, then census designated place
            r = fetch(f"{TIGER}/{layer}/query", {"geometry": f"{rp.x},{rp.y}", "geometryType": "esriGeometryPoint",
                                                 "inSR": "4326", "spatialRel": "esriSpatialRelIntersects",
                                                 "outFields": "BASENAME", "returnGeometry": "false", "f": "json"},
                      f"place-{layer}-{rp.x:.4f}-{rp.y:.4f}.json")
            if r.get("features"):
                place = r["features"][0]["attributes"]["BASENAME"]
                incorporated = layer == 26
                break
        s["place"] = place or "Unincorporated"
        s["incorporated"] = incorporated
        s["permit"] = PERMITS.get(place, PERMITS["_city"]) if incorporated else PERMITS["_county"]
        s["town"] = SERVED_ZIPS[s["zip"]]

    bx = unary_union([s["geom"] for s in stats]).bounds
    q = (f"[out:json][timeout:120];(way[highway~\"^(residential|living_street|unclassified|tertiary)$\"]"
         f"({bx[1]},{bx[0]},{bx[3]},{bx[2]}););out tags center;")
    ways = fetch(OVERPASS, {"data": q}, "overpass-streets.json")["elements"]
    used_names = set()
    for s in stats:
        g = s["geom"].buffer(0.0003)
        names, private = {}, 0
        for w in ways:
            c = w.get("center")
            if not c or not g.contains(Point(c["lon"], c["lat"])):
                continue
            t = w.get("tags", {})
            if t.get("access") in ("private", "no"):
                private += 1
            if t.get("name"):
                names[t["name"]] = names.get(t["name"], 0) + 1
        s["streets"] = sorted(names, key=lambda k: -names[k])[:14]
        s["private_roads"] = private
        if not s["start"]["street"] and s["streets"]:
            s["start"]["street"] = s["streets"][0]
        # name it after its busiest street that no better zone already took
        pick = next((st for st in s["streets"] if (s["place"], st) not in used_names), None)
        if pick:
            used_names.add((s["place"], pick))
        s["name"] = f"{s['place']}, {pick}" if pick else f"{s['place']} ({s['id']})"

    plan(stats)
    write_geojson(stats)
    write_routes(stats)


def write_geojson(stats):
    feats = []
    for s in stats:
        geom = s["geom"].simplify(0.00008)
        feats.append({"type": "Feature", "geometry": round_geom(mapping(geom)), "properties": {
            "id": s["id"], "rank": s["rank"], "score": s["score"], "name": s["name"],
            "place": s["place"], "town": s["town"], "zip": s["zip"], "doors": s["doors"],
            "walk_min": round(s["walk_h"] * 60), "drive_min": round(s["drive_min"]),
            "doors_per_hr": round(s["doors"] / s["walk_h"]),
            "income": int(round(s["income"], -3)), "own": round(s["own"], 2), "cars2": round(s["cars2"], 2),
            "streets": s["streets"], "private_roads": s["private_roads"], "start": s["start"],
            "incorporated": s["incorporated"], "permit": s["permit"], "wave": s.get("wave", ""),
        }})
    out = {"type": "FeatureCollection", "generated": time.strftime("%Y-%m-%d"),
           "base": {"lat": BASE[0], "lon": BASE[1]},
           "source": "Census 2020 blocks + ACS 5-year block groups; OSRM drive times; OpenStreetMap street names",
           "features": feats}
    with open(OUT_GEO, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"wrote {os.path.relpath(OUT_GEO, ROOT)} ({len(feats)} zones)")


def plan(stats):
    """Wave 1 is the best zones that need no permit. Re-drops go to the best of them."""
    free = [s for s in stats if not s["permit"]]
    wave1 = free[:WAVE1_ZONES]
    for s in wave1:
        s["wave"] = "1"
    for s in wave1[:REDROP_ZONES]:
        s["wave"] = "1+2"
    import datetime as dt
    start = dt.date.fromisoformat(FIRST_WEEK)
    weeks = []
    for i, s in enumerate(wave1):
        weeks.append((start + dt.timedelta(weeks=i), s, "first drop"))
    for i, s in enumerate(wave1[:REDROP_ZONES]):
        weeks.append((start + dt.timedelta(weeks=WAVE1_ZONES + i), s, "second drop"))
    weeks.sort(key=lambda w: w[0])
    stats_plan.clear()
    stats_plan.extend(weeks)


stats_plan = []


def round_geom(g):
    def r(c):
        return [round(c[0], 5), round(c[1], 5)] if isinstance(c[0], (int, float)) else [r(x) for x in c]
    return {"type": g["type"], "coordinates": r(g["coordinates"])}


def maps_link(s):
    return f"https://www.google.com/maps/dir/?api=1&destination={s['start']['lat']},{s['start']['lon']}"


def write_routes(stats):
    zone_doors = sum(w[1]["doors"] for w in stats_plan)
    sched = ["| Week of | Zone | Drop | Doors | About | Park here |", "|---|---|---|---|---|---|"]
    for day, s, kind in stats_plan:
        sched.append(f"| {day.strftime('%b %-d')} | {s['id']} {s['name']} | {kind} | {s['doors']} | "
                     f"{round(s['walk_h'] * 60 / 30) / 2:g} hrs + {round(s['drive_min'])} min drive | "
                     f"[{s['start']['street'] or 'map'}]({maps_link(s)}) |")
    sched.append(f"| every week | around each job | same street + next one over | ~50 | while the car is drying | the customer's driveway |")
    around = HANGERS - zone_doors
    import datetime as dt
    weeks_n = max(1, round((dt.date(2026, 12, 31) - dt.date.fromisoformat(FIRST_WEEK)).days / 7))
    sched[-1] = sched[-1].replace("~50", f"~{round(around / weeks_n / 5) * 5}")
    sched_md = ("\n".join(sched) + f"\n\nZones take **{zone_doors:,}** of the {HANGERS:,} hangers. The other "
                f"**{around:,}** go around jobs, about {round(around / weeks_n / 5) * 5} a week. The re-drops default "
                "to the two best zones; if a different zone has brought in more quotes by then, re-drop that one instead.")
    rows = ["| # | Zone | Town (ZIP) | Doors | Walk | Drive | Median income | Own | Score | Permit | Park here |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    for s in stats:
        flag = " (private roads: check for gates)" if s["private_roads"] >= 2 else ""
        rows.append(f"| {s['id']} | {s['name']}{flag} | {s['town']} ({s['zip']}) | {s['doors']} | "
                    f"{round(s['walk_h'] * 60)} min | {round(s['drive_min'])} min | ${s['income'] / 1000:.0f}k | "
                    f"{s['own']:.0%} | {s['score']} | {s['permit'] or 'none'} | [{s['start']['street'] or 'map'}]({maps_link(s)}) |")
    streets = []
    for s in stats[:12]:
        streets.append(f"- **{s['id']} {s['name']}**: {', '.join(s['streets']) or 'see map'}")
    block = ("### The schedule\n\n" + sched_md + "\n\n### Every zone, ranked\n\n" + "\n".join(rows)
             + "\n\n### Streets in the top 12 zones\n\n" + "\n".join(streets))
    with open(OUT_MD) as f:
        md = f.read()
    md = re.sub(r"(<!-- ZONES:START -->\n).*?(<!-- ZONES:END -->)", lambda m: m.group(1) + block + "\n" + m.group(2), md, flags=re.S)
    with open(OUT_MD, "w") as f:
        f.write(md)
    print(f"updated {os.path.relpath(OUT_MD, ROOT)}")


if __name__ == "__main__":
    main()
