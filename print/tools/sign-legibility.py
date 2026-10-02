# -*- coding: utf-8 -*-
"""How far away can a driver read the yard sign? Scores every line of it in
feet, so a new draft can be judged on distance instead of on how big the type
looks.

    cd print/tools && npm run sign      # first: writes print/yard-signs/sign-type.json
    python3 sign-legibility.py          # needs: pip install numpy scipy pillow

Prints each line's reading distance and writes print/yard-signs/driver-view.png
(the sign through 20/40 eyes, Washington's licence minimum, at 40, 60, 80 and
100 ft, each drawn at the size it appears from there). Exits with an error if
the number or MOBILE CAR DETAILING reads under 65 ft, which is where the
5 in Anton number of the 2026-10-01 sign gave out.

How it works, in plain words. Taller type is not the same as type you can read
from farther. From far away the eye blurs everything a little, and what goes
first is the gap inside a letter: the hole in a 6, the waist of an 8, the
opening of a 9. Two digits become the same blob and the number is gone, however
tall it is. So each line is drawn, blurred the way an eye blurs it at a given
distance, and checked letter against letter (every digit against every other
digit for the number, every capital against every other capital for words):
the line is readable out to the distance where its most easily confused pair
can still be told apart. The yardstick comes from the US Sign Council: black
Helvetica capitals on a white sign read at 25 ft per inch of letter height
(USSC Sign Legibility Rules of Thumb, Table 1). Arimo Bold, drawn to
Helvetica's letter widths, is set to that, and every other font is measured on
the same scale. The ranking of fonts holds whether the eye is assumed sharper
or blurrier than 20/40. Black on yellow is treated as black on white: both are dark
type on a light ground, which is what reads best.

What it leaves out: real eyes also lose letters packed tight together, and
words read a little farther than random letters because the reader guesses
the rest. Both are reasons to trust the comparison between two designs more
than the exact feet.
"""
import json, os, sys

try:
    import numpy as np
    from scipy.ndimage import gaussian_filter
    from scipy.optimize import brentq
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("needs numpy, scipy and pillow: pip install numpy scipy pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SIGNS = os.path.join(ROOT, "print", "yard-signs")
FONTS = os.path.join(HERE, "node_modules", "@fontsource")
ARCMIN = 10800 / np.pi                 # arcminutes per radian
EYE = 0.85                             # eye blur, arcmin: 2 arcmin to tell two lines apart (20/40)
CAP = 60                               # px per inch of capital height in the working drawings
SS = 4                                 # supersampling
REF_LI = 25.0                          # USSC: black Helvetica capitals on white, ft per inch
FLOOR_FT = 65                          # the old sign's number gave out at about 64 ft
AZ, DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789"
_fonts = {}


def font(pkg, weight, px):
    key = (pkg, weight, px)
    if key not in _fonts:
        path = os.path.join(FONTS, pkg, "files", f"{pkg}-latin-{weight}-normal.woff")
        if not os.path.exists(path):
            sys.exit(f"missing {path}: run npm install in print/tools")
        _fonts[key] = ImageFont.truetype(path, px)
    return _fonts[key]


def glyph(pkg, weight, stretch, cap_ref, ch):
    """One glyph at CAP px of capital height (after the stretch), centred in a cell."""
    probe = font(pkg, weight, 400)
    size = 400 * (CAP / stretch) / -probe.getbbox(cap_ref, anchor="ls")[1]
    f = font(pkg, weight, max(1, round(size * SS)))
    cell = CAP * SS * 2.2
    img = Image.new("L", (int(cell), int(cell)), 0)
    ImageDraw.Draw(img).text((cell / 2, cell / 2 + CAP / stretch * SS / 2), ch, font=f, fill=255, anchor="ms")
    img = img.resize((int(cell) // SS, int(cell * stretch) // SS), Image.LANCZOS)
    return np.asarray(img, dtype=np.float64) / 255


def weakest_pair(pkg, weight, stretch, cap_ref, alphabet, dists):
    """For each distance (ft per inch of capital height): how different the two
    most alike glyphs still look through the eye's blur, and which pair it is.
    Uses Parseval: the blurred difference's energy is its spectrum times the
    blur's, so each glyph is transformed once."""
    imgs = [glyph(pkg, weight, stretch, cap_ref, c) for c in alphabet]
    h = max(i.shape[0] for i in imgs)
    w = max(i.shape[1] for i in imgs)
    spec = [np.fft.rfft2(np.pad(i, ((0, h - i.shape[0]), (0, w - i.shape[1])))) for i in imgs]
    f2 = np.fft.fftfreq(h)[:, None] ** 2 + np.fft.rfftfreq(w)[None, :] ** 2
    half = np.full(f2.shape, 2.0)
    half[:, 0] = 1
    if w % 2 == 0:
        half[:, -1] = 1
    pairs = [(a, b) for a in range(len(alphabet)) for b in range(a + 1, len(alphabet))]
    power = np.stack([np.abs(spec[a] - spec[b]) ** 2 for a, b in pairs])
    out, which = [], []
    for d in dists:
        arcmin_per_px = (1 / (12 * d)) * ARCMIN / CAP
        blur = np.exp(-4 * np.pi ** 2 * (EYE / arcmin_per_px) ** 2 * f2) * half
        e = np.sqrt((power * blur).sum(axis=(1, 2)) / (h * w)) * arcmin_per_px
        j = int(np.argmin(e))
        out.append(e[j])
        which.append(alphabet[pairs[j][0]] + "/" + alphabet[pairs[j][1]])
    return np.array(out), which


DISTS = np.geomspace(6, 90, 160)


def li(curve, k):
    """Feet per inch of capital height at which the weakest pair drops to k."""
    ok = curve >= k
    if not ok[0]:
        return float(DISTS[0])
    if ok.all():
        return float(DISTS[-1])
    j = int(np.argmin(ok)) - 1
    t = (curve[j] - k) / (curve[j] - curve[j + 1])
    return float(np.exp(np.log(DISTS[j]) + t * np.log(DISTS[j + 1] / DISTS[j])))


def driver_view(preview, out, board_w_in=24.0):
    """The sign through 20/40 eyes at a few distances, each at its apparent size."""
    img = Image.open(preview).convert("RGB")
    a = np.asarray(img, dtype=np.float64) / 255
    px_per_in = img.width / board_w_in
    feet = [40, 60, 80, 100]
    views = []
    for d in feet:
        arcmin_per_px = (1 / px_per_in) / (12 * d) * ARCMIN
        b = np.stack([gaussian_filter(a[..., c], EYE / arcmin_per_px) for c in range(3)], -1)
        v = Image.fromarray((np.clip(b, 0, 1) * 255).astype(np.uint8))
        w = int(400 * 40 / d)
        views.append(v.resize((w, int(w * img.height / img.width)), Image.LANCZOS))
    cell = views[0].width + 30
    sheet = Image.new("RGB", (cell * len(views) + 30, views[0].height + 80), (95, 143, 62))
    d = ImageDraw.Draw(sheet)
    label = font("arimo", 700, 26)
    for i, (v, ft) in enumerate(zip(views, feet)):
        x = 30 + i * cell
        sheet.paste(v, (x, 60 + views[0].height - v.height))
        d.text((x, 16), f"{ft} ft", fill="white", font=label)
    sheet.save(out)


def main():
    spec_path = os.path.join(SIGNS, "sign-type.json")
    if not os.path.exists(spec_path):
        sys.exit("no sign-type.json: run npm run sign in print/tools first")
    sign = json.load(open(spec_path))
    ref, _ = weakest_pair("arimo", 700, 1.0, "H", AZ, DISTS)
    k = brentq(lambda k: li(ref, k) - REF_LI, ref.min() * 1.0001, ref.max() * 0.9999)
    print(f"  yardstick: Arimo Bold capitals = {REF_LI:.0f} ft per inch (USSC, black Helvetica caps on white)\n")
    print(f"  {'line':14} {'type':38} {'letters':>7}  {'ft per in':>9}  {'reads to':>8}  first to blur")
    feet = {}
    for ln in sign["lines"]:
        alphabet = DIGITS if ln["capRef"] == "8" else AZ
        curve, which = weakest_pair(ln["pkg"], ln["weight"], ln["stretch"], ln["capRef"], alphabet, DISTS)
        per_in = li(curve, k)
        ft = per_in * ln["cap_in"]
        feet[ln["id"]] = ft
        j = min(len(DISTS) - 1, int(np.searchsorted(DISTS, per_in)))
        kind = f'{ln["pkg"]} {ln["weight"]}' + (f' x{ln["stretch"]} tall' if ln["stretch"] != 1 else "")
        print(f'  {ln["text"]:14} {kind:38} {ln["cap_in"]:6.2f}in  {per_in:9.1f}  {ft:6.0f} ft  {which[j]}')
    words = min(v for key, v in feet.items() if key.startswith("what"))
    print(f"\n  the whole message (what it is and the number) reads to about {min(words, feet['phone']):.0f} ft")
    driver_view(os.path.join(SIGNS, "preview.png"), os.path.join(SIGNS, "driver-view.png"))
    print("  wrote print/yard-signs/driver-view.png")
    bad = [f"{name} reads to only {ft:.0f} ft (floor {FLOOR_FT})" for name, ft in (("the number", feet["phone"]), ("MOBILE CAR DETAILING", words)) if ft < FLOOR_FT]
    for b in bad:
        print("  FAIL", b, file=sys.stderr)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
