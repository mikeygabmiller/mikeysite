#!/usr/bin/env bash
# Render every infographic in this folder to a 2400x3200 PNG (2x of the
# 1200x1600 canvas). Needs Chromium and the Outfit font installed locally.
#
#   ./render.sh                    # render all three
#   ./render.sh pricing            # render one
#   CHROME=/path/to/chrome ./render.sh
#
# Why it shoots 1750 tall and then crops: headless Chromium paints the last
# ~100px of the viewport as flat background when the window height equals the
# document height, which ate the footer. Giving it 150px of slack and trimming
# the overshoot with _crop.py is the reliable fix.
set -euo pipefail

CHROME="${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

W=1200; H=1600; SLACK=150

TARGETS=("$@")
if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=(pricing detail-vs-carwash how-long-it-takes)
fi

for name in "${TARGETS[@]}"; do
  echo "rendering $name..."
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 \
    --window-size=$W,$((H + SLACK)) \
    --virtual-time-budget=6000 \
    --screenshot="$DIR/$name.raw.png" \
    "file://$DIR/$name.html" 2>/dev/null
  python3 "$DIR/_crop.py" "$DIR/$name.raw.png" "$DIR/$name.png" 0 $((H * 2))
  rm -f "$DIR/$name.raw.png"
done

ls -l "$DIR"/*.png
