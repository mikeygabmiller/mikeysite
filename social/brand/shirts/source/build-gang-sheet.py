#!/usr/bin/env python3
"""DTF gang sheet for the black work shirts (2026-10-08).

One sheet, 22 in wide, ready to upload to Tuxedo Print's "DTF Gang Sheet -
Upload a Print Ready File" (see ../README.md, "Ordering the transfers"). It
holds N DIRTY CAR? backs down the left and the left chest logos down the right,
at their real print size (300 dpi, nothing resized), on a transparent
background so nothing prints but the designs.

The back PNG carries about half an inch of clear padding on every side, so it's
cropped to its ink first: that's what lets each shirt fit in one foot of sheet.

    python3 build-gang-sheet.py        # 2, 3 and 4 shirts
    python3 build-gang-sheet.py 6      # just 6

Writes ../gang-sheet/gang-sheet-<N>-shirts-22x<L>.png and a small preview on
black. The sheet length is the smallest size Tuxedo sells that fits.
"""
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
EXTRA_CHEST = 2   # one to practice on, one spare


def px(inches):
    return round(inches * DPI)


def ink(path):
    im = Image.open(path).convert('RGBA')
    return im.crop(im.getchannel('A').getbbox())


def build(n, back, chest):
    m, g = px(MARGIN_IN), px(GAP_IN)
    need = 2 * m + n * back.height + (n - 1) * g
    length = next((l for l in LENGTHS_IN if px(l) >= need), None)
    if length is None:
        sys.exit(f'{n} shirts need {need / DPI:.1f} in, longer than the biggest sheet')
    sheet = Image.new('RGBA', (px(WIDTH_IN), px(length)), (0, 0, 0, 0))

    for i in range(n):
        sheet.paste(back, (m, m + i * (back.height + g)))

    # chest logos in two columns in the strip right of the backs
    left = m + back.width + g
    if left + 2 * chest.width + g > sheet.width - m:
        sys.exit('two chest logos no longer fit beside the back')
    count = n + EXTRA_CHEST
    for i in range(count):
        col, row = i % 2, i // 2
        y = m + row * (chest.height + g)
        if y + chest.height > sheet.height - m:
            sys.exit(f'{count} chest logos do not fit on 22x{length}')
        sheet.paste(chest, (left + col * (chest.width + g), y))

    os.makedirs(OUT, exist_ok=True)
    name = f'gang-sheet-{n}-shirts-22x{length}'
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
    back = ink(os.path.join(SHIRTS, 'back-dirty-car-12in.png'))
    chest = ink(os.path.join(SHIRTS, 'front-chest-4in.png'))
    for n in [int(a) for a in sys.argv[1:]] or [2, 3, 4]:
        build(n, back, chest)


if __name__ == '__main__':
    main()
