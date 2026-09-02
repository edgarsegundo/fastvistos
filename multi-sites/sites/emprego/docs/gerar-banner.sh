#!/usr/bin/env bash
# Gera banner-1440x448.jpg a partir de banner-1440x448.html (Chrome headless + sips).
set -euo pipefail
cd "$(dirname "$0")"
Q="${1:-90}"   # qualidade JPEG (0-100)
TMP=$(mktemp -d)

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1440,448 \
  --virtual-time-budget=6000 \
  --screenshot="$TMP/shot.png" "file://$PWD/banner-1440x448.html" 2>/dev/null

# captura em 2x (2880x896) e reduz p/ 1440x448 → texto mais nítido
sips -z 448 1440 "$TMP/shot.png" >/dev/null
cp "$TMP/shot.png" banner-1440x448.jpg
sips -s format jpeg -s formatOptions "$Q" banner-1440x448.jpg >/dev/null
rm -rf "$TMP"

echo "OK: $(pwd)/banner-1440x448.jpg  ($(du -k banner-1440x448.jpg | cut -f1) KB)"
