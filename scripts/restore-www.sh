#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
shopt -s nullglob
PARTS=(payload/www-r376.tar.gz.part-*)
if [ "${#PARTS[@]}" -eq 0 ]; then
  echo "ERROR: R376 www payload parts missing." >&2
  exit 11
fi
TMP_ARCHIVE="$(mktemp -t moleculox-www-r376.XXXXXX.tar.gz)"
trap 'rm -f "$TMP_ARCHIVE"' EXIT
cat "${PARTS[@]}" > "$TMP_ARCHIVE"
rm -rf www
tar -xzf "$TMP_ARCHIVE"
test -f www/index.html
test -f www/js/game-r160.js
test -f www/js/firebase.js
test -f www/css/app-r160.css
echo "R376 www payload restored successfully (${#PARTS[@]} parts)."
