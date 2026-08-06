#!/usr/bin/env bash
# Builds the Chrome Web Store upload zip: runtime files only, manifest at root.
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUT="dist/accessiscroll-${VERSION}.zip"

mkdir -p dist
rm -f "$OUT"

zip -q "$OUT" \
  manifest.json \
  background.js \
  popup/popup.html popup/popup.css popup/popup.js \
  options/options.html options/options.js \
  icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png

echo "Built $OUT"
unzip -l "$OUT"
