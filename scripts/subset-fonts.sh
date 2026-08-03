#!/usr/bin/env bash
#
# Regenerate the subset WOFF2 faces served from public/fonts.
#
# WHY THIS EXISTS
# The full faces are large — Aguzzo alone was 127KB, and all four preloaded
# faces together were 324KB of high-priority bandwidth on `/`, more than the
# entire JS bundle. Every face on this site renders Latin text only, so the
# CJK/Cyrillic/Greek coverage in the shipped files was never used.
#
# Subsetting to basic Latin takes the preloaded set from 324KB to ~67KB with
# no visual change. The variable weight axis is PRESERVED, so design tokens
# like --font-weight-aguzzo-display stay live — pinning to a single instance
# would shave a few more KB but silently break those tokens.
#
# The full originals live in fonts-src/ (not served, not built). Re-run this
# script after replacing any of them.
#
# Requires: python3 -m pip install fonttools brotli
set -euo pipefail

cd "$(dirname "$0")/.."

# Basic Latin + punctuation the site copy and demos actually use.
UNICODES='U+0020-007E,U+00A0,U+00E3,U+2018,U+2019,U+201C,U+201D,U+2013,U+2014,U+2026,U+2192,U+2318'

WOFF2_FACES=(
  "aguzzo/AguzzoVF-TRIAL"
  "bagoss/Bagoss-w230s0w60"
  "bagoss/Bagoss-w320s0w60"
  "geist/Geist-Variable"
  "geist/GeistMono-Variable"
)

for face in "${WOFF2_FACES[@]}"; do
  src="fonts-src/${face}.woff2"
  out="public/fonts/${face}-subset.woff2"

  if [[ ! -f "$src" ]]; then
    echo "missing source: $src" >&2
    exit 1
  fi

  mkdir -p "$(dirname "$out")"
  python3 -m fontTools.subset "$src" \
    --unicodes="$UNICODES" \
    --flavor=woff2 \
    --layout-features='kern,liga,calt' \
    --output-file="$out"

  before=$(wc -c < "$src")
  after=$(wc -c < "$out")
  printf '%-34s %5dK -> %4dK\n' "$face" $((before / 1024)) $((after / 1024))
done

# SF Pro variable font (Apple system font) — TTF source copied from /Library/Fonts
# into fonts-src/sf-pro/. Covers Text + Display optical sizes via the opsz axis.
SF_PRO_FACE="sf-pro/SF-Pro"
src="fonts-src/${SF_PRO_FACE}.ttf"
out="public/fonts/${SF_PRO_FACE}-subset.woff2"

if [[ ! -f "$src" ]]; then
  echo "missing source: $src" >&2
  exit 1
fi

mkdir -p "$(dirname "$out")"
python3 -m fontTools.subset "$src" \
  --unicodes="$UNICODES" \
  --flavor=woff2 \
  --layout-features='kern,liga,calt' \
  --output-file="$out"

before=$(wc -c < "$src")
after=$(wc -c < "$out")
printf '%-34s %5dK -> %4dK\n' "$SF_PRO_FACE" $((before / 1024)) $((after / 1024))

echo
echo "Subset faces written to public/fonts. Filenames carry a -subset suffix,"
echo "so bump the suffix (or the path) if you ever need to bust the immutable"
echo "cache headers set in vercel.json."
