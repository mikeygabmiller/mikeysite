#!/usr/bin/env python3
"""DTF gang sheet for the black work shirts (2026-10-08).

One sheet, 22 in wide, ready to upload to Tuxedo Print's "DTF Gang Sheet -
Upload a Print Ready File" (see ../README.md, "Ordering the transfers"). It
holds N DIRTY CAR? backs and N + 2 left chest logos on a transparent
background, so nothing prints but the designs.

The back is sized for the heat press it goes on: it has to sit half an inch
inside the plate on every side, because a back that hangs over the plate needs
two presses and that's where prints fail. The press Mikey uses (the EvCC Create
Space, 2026-10-08) is 10 x 10 in, so the default back is 8.8 x 9.0 in. A 15 x
15 press takes the full design (11.0 x 11.3 in, the 12 in PNG cropped to its
ink). The chest logo (3.9 x 1.1 in) fits any press as it is.

    python3 build-gang-sheet.py                  # 4 shirts, 10 x 10 press
    python3 build-gang-sheet.py 2 6              # 2 shirts and 6 shirts
    python3 build-gang-sheet.py --press 15 4     # 4 shirts, 15 x 15 press

Writes ../gang-sheet/gang-sheet-<N>-shirts-22x<L>-for-<P>in-press.png and a
small preview on black. The sheet length is the smallest size Tuxedo sells
that fits.
"""
import argparse
import math
import os
import sys

from PIL import Image

DPI = 300
HERE = os.path.dirname(os.path.abspath(__file__))
SHIRTS = os.path.dirname(HERE)
OUT = os.path.join(SHIRTS, 'gang-sheet')

WIDTH_IN = 22
LENGTHS_IN = [12, 24, 36, 48, 60, 72, 84, 96, 120, 144, 168, 192]  # Tuxedo's sizes
MARGIN_IN = 0.3   # clear border round the sheet
GAP_IN = 0.6      # between designs, room to cut them apart with scissors
PLATE_CLEAR_IN = 0.5  # how far inside the press plate a design stays
EXTRA_CHEST = 2   # one to practice on, one spare


def px(inches):
    return round(inches * DPI)


def ink(path):
    im = Image.open(path).convert('RGBA')
    return im.crop(im.getchannel('A').getbbox())


def fit_press(im, press_in):
    """Shrink (never enlarge) so the design sits inside the plate with clearance."""
    room = px(press_in - 2 * PLATE_CLEAR_IN)
    scale = min(1, room / im.width, room / im.height)
    if scale == 1:
        return im
    return im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)


def layout(n, back, chest):
    """Where everything goes: backs in a grid, chest logos beside them or below."""
    W, m, g = px(WIDTH_IN), px(MARGIN_IN), px(GAP_IN)
    inner = W - 2 * m
    spots = []

    cols = (inner + g) // (back.width + g)
    rows = math.ceil(n / cols)
    for i in range(n):
        spots.append((back, m + (i % cols) * (back.width + g), m + (i // cols) * (back.height + g)))
    backs_bottom = m + rows * back.height + (rows - 1) * g

    # chest logos: in the strip right of the backs if it's wide enough, then below
    strip_x = m + cols * (back.width + g)
    strip_cols = (W - m - strip_x + g) // (chest.width + g)
    below_cols = (inner + g) // (chest.width + g)
    y_strip, below_y, placed = m, backs_bottom + g, 0
    count = n + EXTRA_CHEST
    while placed < count and strip_cols and y_strip + chest.height <= backs_bottom:
        for c in range(min(strip_cols, count - placed)):
            spots.append((chest, strip_x + c * (chest.width + g), y_strip))
            placed += 1
        y_strip += chest.height + g
    while placed < count:
        for c in range(min(below_cols, count - placed)):
            spots.append((chest, m + c * (chest.width + g), below_y))
            placed += 1
        below_y += chest.height + g

    bottom = max(y + im.height for im, _, y in spots) + m
    return spots, bottom, count


def build(n, back, chest, press):
    spots, need, count = layout(n, back, chest)
    length = next((l for l in LENGTHS_IN if px(l) >= need), None)
    if length is None:
        sys.exit(f'{n} shirts need {need / DPI:.1f} in, longer than the biggest sheet')
    sheet = Image.new('RGBA', (px(WIDTH_IN), px(length)), (0, 0, 0, 0))
    for im, x, y in spots:
        sheet.paste(im, (x, y))

    os.makedirs(OUT, exist_ok=True)
    name = f'gang-sheet-{n}-shirts-22x{length}-for-{press:g}in-press'
    path = os.path.join(OUT, name + '.png')
    sheet.save(path, dpi=(DPI, DPI), optimize=True)

    preview = Image.new('RGBA', sheet.size, (0, 0, 0, 255))
    preview.alpha_composite(sheet)
    preview.thumbnail((660, 4000))
    preview.convert('RGB').save(os.path.join(OUT, name + '-preview.jpg'), quality=85)

    print(f'{name}.png  {n} backs ({back.width / DPI:.2f} x {back.height / DPI:.2f} in), '
          f'{count} chest logos ({chest.width / DPI:.2f} x {chest.height / DPI:.2f} in), '
          f'{os.path.getsize(path) / 1e6:.1f} MB')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('shirts', nargs='*', type=int, default=[4])
    ap.add_argument('--press', type=float, default=10, help='press plate, inches (short side)')
    args = ap.parse_args()
    back = fit_press(ink(os.path.join(SHIRTS, 'back-dirty-car-12in.png')), args.press)
    chest = fit_press(ink(os.path.join(SHIRTS, 'front-chest-4in.png')), args.press)
    for n in args.shirts:
        build(n, back, chest, args.press)


if __name__ == '__main__':
    main()
