# Where to hang: the route plan

2,000 hangers arrive around **October 19, 2026**. The Rain-Ready offer printed
on them ends **December 31**, so this plan uses them in about ten weeks: roughly
**190 a week, one 2.5 to 3.5 hour session plus what you hang around jobs.**

The map is in the dashboard: **Insights → Hangers**. It shows every zone
below, lets you log each drop, draws the streets you've walked, and counts
which quotes came from which zone. This file is the same plan on paper.

## Why these neighborhoods and not Mill Creek proper

Mikey's first thought was Mill Creek. The Census numbers say he's close, but
the best doors are just *east* of the city line:

| Area | Median income | Detached houses | Owners |
|---|---|---|---|
| **Mill Creek East** (unincorporated) | **$193k** | 85% | 83% |
| **Silver Firs** (unincorporated) | **$163k** | 90% | 89% |
| **Bothell East** (unincorporated, Snohomish Co.) | **$199k** | 65% | 59% |
| Mill Creek (the city) | $124k | 51% | 59% |

Half of Mill Creek city is apartments, condos and townhomes, and 41% of its
households rent. A renter usually can't offer a spigot and an outlet, and a
condo board won't let you work in the lot. The houses between 35th Ave SE and
Seattle Hill Road are newer, closer together, owned, and mostly have 2 or 3
cars out front. They mail as Mill Creek, Bothell or Snohomish, so they're inside
the twelve towns.

**Skipped on purpose:**
- **Acreage** (Clearview, Maltby, Cottage Lake). Richer on paper, but long
  driveways and gates cut you to 25 to 40 doors an hour against 65 to 90 here.
- **Lynnwood and Edmonds.** Not served.
- **Sammamish and Redmond.** Rich and within 40 minutes, but not one of the
  twelve towns.

## How a zone gets its score

`print/tools/hanger-zones.py` does this; rerun it any time.

1. **Only houses in the twelve towns' ZIP codes.**
2. **Walkable density.** Every Census 2020 block (about one street of houses)
   is kept only if it has 300 to 2,400 homes per square km. Below that is
   acreage; above it is apartments and townhomes.
3. **Who lives there.** From the Census ACS for the block group around it:
   median income, share who own, and share with 2+ cars.
4. **Zones of 150 to 250 doors** that you can walk from one parked car.
5. **Score** = how good the doors are × how many, divided by the hours it
   costs you, **including the round trip from home**. Best zone = 100.

Doors per hour is an estimate from how far apart the houses are (about 20
seconds at the door plus the walk to the next one). Your first session will
tell you your real pace; log it and the dashboard uses it.

**What the data can't see:** "No Soliciting" signs, HOA rules and gates. Zones
with private roads in OpenStreetMap are flagged in the table. When you see a
sign on a house, skip it. When you see one at the neighborhood entrance, skip
the neighborhood.

## Permits

Every zone in the schedule is in **unincorporated Snohomish County**. The
county code (Title 6) has no peddler or solicitor chapter, so there's nothing
to file there. The cities are different:

| City | What they ask for |
|---|---|
| Mill Creek | Free Peddler Information Form (cityclerk@millcreekwa.gov, 425-745-1891) |
| Woodinville | Peddler's permit, good for 6 months |
| Mukilteo | Canvasser-peddler license (City Clerk, 425-263-8005) |
| Lake Stevens | Solicitor license with a background check and badge |
| Snohomish (city) | Solicitor license with a $1,000 bond |
| Bothell (city) | Call the City Clerk before hanging |

Leaving a hanger without knocking may not count as soliciting in some of these
codes, but a phone call settles it. That's why the schedule starts where none
of this applies.

## Each session

1. Open **Insights → Hangers** in the dashboard and tap the zone, then **Navigate**. It
   drives you to the parking spot.
2. Tap **Start hanging**. Keep the dashboard open on screen: it draws the
   streets you walk (an iPhone stops GPS for a web app once the screen locks
   or you switch apps).
3. Doorknob or handle only, **never the mailbox**, and skip every "No
   Soliciting" sign.
4. Tap **Finish** and enter how many you hung. That's the log.
5. Around each job, hang 20 to 30 on the same street and the next one over,
   and log it as an around-the-job drop.

## Knowing what worked

Every quote from the website includes an address. The dashboard looks up
where it is and, if it's inside a zone you hung in the last 6 weeks, tags the
quote with that zone. Texts or calls that say "saw your door hanger" get tagged
by hand with one tap. At the end of each week, the Hangers page shows hangers
out, hours, quotes, jobs won and money per zone.

**Break-even:** the 2,000 cost about $240. One Full Detail ($369+) pays for
the whole run. Around **December 1**, look at quotes per 100 hangers by zone,
reorder if it's working, and aim the next batch at the zones that answered.
Reprints after December 31 use the `-no-offer` files.

<!-- ZONES:START -->
### The schedule

| Week of | Zone | Drop | Doors | About | Park here |
|---|---|---|---|---|---|
| Oct 19 | Z01 Mill Creek East, 35th Avenue Southeast | first drop | 246 | 3.5 hrs + 18 min drive | [184th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83089,-122.18234) |
| Oct 26 | Z02 Mill Creek East, 180th Street Southeast | first drop | 200 | 2.5 hrs + 18 min drive | [31st Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83289,-122.19073) |
| Nov 2 | Z04 Mill Creek East, 177th Place Southeast | first drop | 241 | 3 hrs + 18 min drive | [177th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83751,-122.18976) |
| Nov 9 | Z05 Mill Creek East, 181st Place Southeast | first drop | 225 | 3 hrs + 19 min drive | [28th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83197,-122.19475) |
| Nov 16 | Z06 Bothell East, 38th Avenue Southeast | first drop | 184 | 2.5 hrs + 21 min drive | [37th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.79407,-122.18393) |
| Nov 23 | Z01 Mill Creek East, 35th Avenue Southeast | second drop | 246 | 3.5 hrs + 18 min drive | [184th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83089,-122.18234) |
| Nov 30 | Z02 Mill Creek East, 180th Street Southeast | second drop | 200 | 2.5 hrs + 18 min drive | [31st Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83289,-122.19073) |
| every week | around each job | same street + next one over | ~45 | while the car is drying | the customer's driveway |

Zones take **1,542** of the 2,000 hangers. The other **458** go around jobs, about 45 a week. The re-drops default to the two best zones; if a different zone has brought in more quotes by then, re-drop that one instead.

### Every zone, ranked

| # | Zone | Town (ZIP) | Doors | Walk | Drive | Median income | Own | Score | Permit | Park here |
|---|---|---|---|---|---|---|---|---|---|---|
| Z01 | Mill Creek East, 35th Avenue Southeast | Mill Creek (98012) | 246 | 209 min | 18 min | $247k | 99% | 100 | none | [184th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83089,-122.18234) |
| Z02 | Mill Creek East, 180th Street Southeast | Mill Creek (98012) | 200 | 141 min | 18 min | $211k | 94% | 97 | none | [31st Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83289,-122.19073) |
| Z03 | Woodinville, 130th Avenue Northeast | Woodinville (98072) | 180 | 132 min | 22 min | $239k | 98% | 90 | Peddler's permit (6 months): woodinville.gov/185/Peddlers-License | [130th Avenue Northeast](https://www.google.com/maps/dir/?api=1&destination=47.7733,-122.16669) |
| Z04 | Mill Creek East, 177th Place Southeast | Mill Creek (98012) | 241 | 194 min | 18 min | $231k | 94% | 88 | none | [177th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83751,-122.18976) |
| Z05 | Mill Creek East, 181st Place Southeast | Mill Creek (98012) | 225 | 191 min | 19 min | $214k | 94% | 86 | none | [28th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83197,-122.19475) |
| Z06 | Bothell East, 38th Avenue Southeast | Bothell (98021) | 184 | 139 min | 21 min | $250k | 89% | 86 | none | [37th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.79407,-122.18393) |
| Z07 | Bothell East, 37th Avenue Southeast | Bothell (98021) | 248 | 205 min | 22 min | $250k | 89% | 85 | none | [37th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.79857,-122.18467) |
| Z08 | Mill Creek East, 31st Drive Southeast | Mill Creek (98012) | 197 | 161 min | 18 min | $231k | 94% | 84 | none | [171st Place Southeast](https://www.google.com/maps/dir/?api=1&destination=47.84239,-122.18807) |
| Z09 | Silver Firs, Puget Park Drive | Snohomish (98296) | 184 | 173 min | 11 min | $217k | 100% | 84 | none | [152nd Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.85923,-122.13934) |
| Z10 | Mill Creek, 35th Avenue Southeast | Mill Creek (98012) | 237 | 192 min | 17 min | $214k | 95% | 83 | Free Peddler Information Form: cityclerk@millcreekwa.gov, 425-745-1891 | [35th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.8555,-122.18701) |
| Z11 | Mill Creek East, 40th Avenue Southeast | Mill Creek (98012) | 180 | 141 min | 18 min | $227k | 100% | 83 | none | [40th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.84797,-122.17939) |
| Z12 | Mukilteo, 130th Place Southwest | Mukilteo (98275) | 259 | 236 min | 29 min | $243k | 96% | 82 | Canvasser-peddler license: City Clerk, 425-263-8005 | [Harbour Heights Drive](https://www.google.com/maps/dir/?api=1&destination=47.87987,-122.29496) |
| Z13 | Mukilteo, 45th Place West | Mukilteo (98275) | 243 | 225 min | 26 min | $250k | 92% | 81 | Canvasser-peddler license: City Clerk, 425-263-8005 | [45th Place West](https://www.google.com/maps/dir/?api=1&destination=47.9322,-122.29589) |
| Z14 | Mukilteo, 46th Place West | Mukilteo (98275) | 192 | 168 min | 26 min | $250k | 92% | 81 | Canvasser-peddler license: City Clerk, 425-263-8005 | [46th Place West](https://www.google.com/maps/dir/?api=1&destination=47.92465,-122.29672) |
| Z15 | Woodinville, 145th Place Northeast | Woodinville (98072) | 177 | 162 min | 25 min | $230k | 95% | 80 | Peddler's permit (6 months): woodinville.gov/185/Peddlers-License | [Northeast 177th Drive](https://www.google.com/maps/dir/?api=1&destination=47.75628,-122.13697) |
| Z16 | Silver Firs, 158th Street Southeast | Snohomish (98296) | 182 | 177 min | 13 min | $217k | 100% | 80 | none | [60th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.85571,-122.15103) |
| Z17 | Bothell East, 43rd Drive Southeast | Bothell (98021) | 211 | 155 min | 21 min | $250k | 85% | 79 | none | [223rd Place Southeast](https://www.google.com/maps/dir/?api=1&destination=47.7951,-122.17469) |
| Z18 | Mill Creek East, 43rd Drive Southeast | Mill Creek (98012) | 231 | 154 min | 19 min | $214k | 80% | 78 | none | [43rd Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.82881,-122.17462) |
| Z19 | Woodinville, 136th Avenue Northeast | Woodinville (98072) | 230 | 214 min | 22 min | $239k | 98% | 78 | Peddler's permit (6 months): woodinville.gov/185/Peddlers-License | [136th Avenue Northeast](https://www.google.com/maps/dir/?api=1&destination=47.7726,-122.1617) |
| Z20 | Mill Creek East, 36th Drive Southeast | Mill Creek (98012) | 231 | 234 min | 18 min | $235k | 100% | 78 | none | [160th Place Southeast](https://www.google.com/maps/dir/?api=1&destination=47.85234,-122.18086) |
| Z21 | Bothell East, 219th Street Southeast | Bothell (98021) | 202 | 155 min | 22 min | $250k | 86% | 77 | none | [220th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.79801,-122.17854) |
| Z22 | Lake Stevens, 9th Place Northeast | Lake Stevens (98258) | 230 | 175 min | 13 min | $173k | 97% | 77 | Solicitor license with background check and badge: lakestevenswa.gov/404 | [87th Avenue Northeast](https://www.google.com/maps/dir/?api=1&destination=48.00512,-122.11415) |
| Z23 | Bothell East, 44th Drive Southeast | Bothell (98021) | 238 | 178 min | 21 min | $250k | 86% | 77 | none | [44th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.7847,-122.17405) |
| Z24 | Mill Creek East, Sunset Road | Mill Creek (98012) | 183 | 130 min | 18 min | $250k | 85% | 76 | none | [Sunset Road](https://www.google.com/maps/dir/?api=1&destination=47.84048,-122.17636) |
| Z25 | Mill Creek East, 41st Avenue Southeast | Mill Creek (98012) | 181 | 137 min | 18 min | $240k | 91% | 76 | none | [42nd Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.84812,-122.17642) |
| Z26 | Woodinville, 146th Avenue Northeast | Woodinville (98072) | 244 | 264 min | 22 min | $230k | 95% | 76 | Peddler's permit (6 months): woodinville.gov/185/Peddlers-License | [Northeast 185th Street](https://www.google.com/maps/dir/?api=1&destination=47.76163,-122.14021) |
| Z27 | Bothell, 39th Avenue Southeast | Bothell (98021) | 189 | 170 min | 21 min | $238k | 97% | 74 | Call the City Clerk first (bothellwa.gov) | [39th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.81011,-122.18924) |
| Z28 | Mill Creek East, 39th Drive Southeast | Mill Creek (98012) | 145 | 99 min | 17 min | $250k | 83% | 74 | none | [177th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83744,-122.17915) |
| Z29 | Silver Firs, 67th Drive Southeast | Snohomish (98296) | 182 | 157 min | 14 min | $237k | 74% | 73 | none | [68th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.88115,-122.14157) |
| Z30 | Mill Creek, 148th Street Southeast | Mill Creek (98012) | 185 | 166 min | 18 min | $182k | 97% | 73 | Free Peddler Information Form: cityclerk@millcreekwa.gov, 425-745-1891 | [31st Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.86544,-122.1902) |
| Z31 | Mill Creek East, 40th Drive Southeast | Mill Creek (98012) | 190 | 171 min | 16 min | $249k | 88% | 72 | none | [180th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83529,-122.17441) |
| Z32 | Silver Firs, 69th Drive Southeast | Snohomish (98296) | 257 | 227 min | 12 min | $205k | 98% | 71 | none | [69th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.86734,-122.14057) |
| Z33 | Bothell, 106th Avenue Northeast | Bothell (98011) | 185 | 159 min | 27 min | $225k | 92% | 71 | Call the City Clerk first (bothellwa.gov) | [Northeast 151st Street](https://www.google.com/maps/dir/?api=1&destination=47.73691,-122.1997) |
| Z34 | Mill Creek, 29th Avenue Southeast | Mill Creek (98012) | 224 | 187 min | 19 min | $196k | 92% | 71 | Free Peddler Information Form: cityclerk@millcreekwa.gov, 425-745-1891 | [29th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.85402,-122.19233) |
| Z35 | Silver Firs, 78th Avenue Southeast | Snohomish (98296) | 247 | 224 min | 9 min | $205k | 98% | 71 | none | [78th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.86048,-122.12764) |
| Z36 | Mill Creek East, 44th Drive Southeast | Mill Creek (98012) | 190 | 139 min | 18 min | $214k | 80% | 71 | none | [184th Street Southeast](https://www.google.com/maps/dir/?api=1&destination=47.83078,-122.17524) |
| Z37 | Bothell, Northeast 203rd Place | Woodinville (98072) | 237 | 194 min | 23 min | $216k | 88% | 71 | Call the City Clerk first (bothellwa.gov) | [Northeast 197th Place](https://www.google.com/maps/dir/?api=1&destination=47.77065,-122.17009) |
| Z38 | Silver Firs, 67th Avenue Southeast | Snohomish (98296) | 231 | 199 min | 12 min | $199k | 84% | 70 | none | [69th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.87394,-122.14514) |
| Z39 | Bothell East, 226th Place Southeast | Bothell (98021) | 144 | 116 min | 20 min | $250k | 86% | 70 | none | [39th Avenue Southeast](https://www.google.com/maps/dir/?api=1&destination=47.79207,-122.1812) |
| Z40 | Mill Creek, 29th Drive Southeast | Mill Creek (98012) | 188 | 177 min | 20 min | $182k | 97% | 69 | Free Peddler Information Form: cityclerk@millcreekwa.gov, 425-745-1891 | [29th Drive Southeast](https://www.google.com/maps/dir/?api=1&destination=47.85931,-122.19282) |

### Streets in the top 12 zones

- **Z01 Mill Creek East, 35th Avenue Southeast**: 35th Avenue Southeast, 35th Drive Southeast, 183rd Place Southeast, 180th Street Southeast, 38th Drive Southeast, 39th Avenue Southeast, 36th Avenue Southeast, 188th Street Southeast, 184th Place Southeast, 36th Drive Southeast, 182nd Place Southeast, 183rd Street Southeast, 39th Drive Southeast, 40th Avenue Southeast
- **Z02 Mill Creek East, 180th Street Southeast**: 180th Street Southeast, 180th Place Southeast, 29th Avenue Southeast, 30th Avenue Southeast, 32nd Avenue Southeast, 181st Place Southeast, 181st Street Southeast, 182nd Street Southeast, 26th Drive Southeast, 25th Drive Southeast, 28th Drive Southeast, 31st Avenue Southeast, 183rd Place Southeast, 182nd Place Southeast
- **Z03 Woodinville, 130th Avenue Northeast**: 130th Avenue Northeast, Northeast 203rd Court, Northeast 202nd Court, Northeast 201st Court, 128th Place Northeast, Northeast 204th Place, 129th Avenue Northeast, Northeast 200th Place, 132nd Avenue Northeast, Northeast 202nd Place, 131st Place Northeast, Northeast 203rd Street, 129th Place Northeast, 130th Court Northeast
- **Z04 Mill Creek East, 177th Place Southeast**: 180th Street Southeast, 177th Place Southeast, 34th Drive Southeast, 179th Street Southeast, 176th Place Southeast, 32nd Drive Southeast, 35th Avenue Southeast, 32nd Avenue Southeast, 176th Street Southeast, 178th Street Southeast, 175th Place Southeast, 175th Street Southeast, 33rd Drive Southeast, 177th Street Southeast
- **Z05 Mill Creek East, 181st Place Southeast**: 35th Avenue Southeast, 181st Place Southeast, 31st Avenue Southeast, 26th Drive Southeast, 182nd Place Southeast, 185th Place Southeast, 183rd Place Southeast, 180th Street Southeast, 32nd Avenue Southeast, 181st Street Southeast, 182nd Street Southeast, 183rd Street Southeast, 27th Drive Southeast, 33rd Avenue Southeast
- **Z06 Bothell East, 38th Avenue Southeast**: 38th Avenue Southeast, 226th Place Southeast, 35th Drive Southeast, 37th Avenue Southeast, 35th Avenue Southeast, 222nd Place Southeast, 221st Place Southeast, 40th Avenue Southeast, 224th Street Southeast, 36th Avenue Southeast, 223rd Place Southeast, 226th Street Southeast, 225th Place Southeast, 36th Drive Southeast
- **Z07 Bothell East, 37th Avenue Southeast**: 37th Avenue Southeast, 217th Place Southeast, 35th Avenue Southeast, 38th Drive Southeast, 38th Avenue Southeast, 215th Place Southeast, 214th Place Southeast, 220th Street Southeast, 216th Place Southeast, 224th Street Southeast, 223rd Place Southeast, 37th Drive Southeast, 219th Street Southeast, 36th Drive Southeast
- **Z08 Mill Creek East, 31st Drive Southeast**: 35th Avenue Southeast, 31st Drive Southeast, 34th Drive Southeast, 175th Place Southeast, 175th Street Southeast, 33rd Drive Southeast, 174th Place Southeast, 172nd Place Southeast, 32nd Avenue Southeast, 171st Place Southeast, 170th Place Southeast, 172nd Street Southeast, 34th Avenue Southeast
- **Z09 Silver Firs, Puget Park Drive**: Puget Park Drive, 72nd Drive Southeast, Snohomish Cascade Drive, 156th Street Southeast, 150th Place Southeast, 67th Drive Southeast, 68th Avenue Southeast, 67th Avenue Southeast, 155th Place Southeast, 70th Avenue Southeast, 152nd Street Southeast, 66th Avenue Southeast, 154th Place Southeast, 65th Place Southeast
- **Z10 Mill Creek, 35th Avenue Southeast**: 35th Avenue Southeast, 157th Place Southeast, 36th Drive Southeast, 159th Place Southeast, 34th Avenue Southeast, 156th Place Southeast, 156th Street Southeast, 34th Drive Southeast, 155th Place Southeast, 153rd Place Southeast, 33rd Avenue Southeast, 33rd Drive Southeast, 35th Drive Southeast, 160th Place Southeast
- **Z11 Mill Creek East, 40th Avenue Southeast**: 40th Avenue Southeast, 163rd Place Southeast, 167th Place Southeast, 164th Place Southeast, 166th Street Southeast, Sunset Road, 169th Street Southeast, 161st Street Southeast, 40th Drive Southeast, 41st Avenue Southeast, 166th Place Southeast, 38th Avenue Southeast, 39th Avenue Southeast, 168th Place Southeast
- **Z12 Mukilteo, 130th Place Southwest**: 130th Place Southwest, 47th Place West, Pacific Place, 46th Place West, 50th Place West, 45th Avenue West, 49th Avenue West, 45th Court West, 131st Place Southwest, 42nd Avenue West, 43rd Avenue West, 42nd Place West, 42nd Court West, 136th Place Southwest
<!-- ZONES:END -->

