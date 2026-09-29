#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
shopt -s nullglob
PARTS=(payload/www-r380-ios.tar.gz.part-*)
if [ "${#PARTS[@]}" -eq 0 ]; then
  echo "ERROR: R380 www payload parts missing." >&2
  exit 11
fi
TMP_ARCHIVE="$(mktemp -t moleculox-www-r380.XXXXXX.tar.gz)"
trap 'rm -f "$TMP_ARCHIVE"' EXIT
cat "${PARTS[@]}" > "$TMP_ARCHIVE"
rm -rf www
tar --no-same-owner -xzf "$TMP_ARCHIVE"
test -f www/index.html
test -f www/js/game-r160.js
test -f www/js/firebase.js
test -f www/css/app-r160.css
echo "R380 www payload restored successfully (${#PARTS[@]} parts)."

# R383 hotfix overlay. Do not ship the old R380 Firebase module restored from tar.
for rel in index.html js/firebase.js js/game-r160.js js/profile-rules-compat.js; do
  test -f "r383-overrides/$rel" || { echo "Missing R383 overlay: $rel" >&2; exit 16; }
  cp "r383-overrides/$rel" "www/$rel"
done
node --check www/js/firebase.js
node --check www/js/profile-rules-compat.js
echo "R383 iOS Firestore payload overlay applied."

# R383: Whiteway Game Hub inspects these paths before running the build.
# Copy AFTER applying the release overlay so aliases never contain old code.
cp www/js/game-r160.js www/js/game.js
cp www/css/app-r160.css www/css/app.css
cp www/sw-r160.js www/sw.js
cmp www/js/game-r160.js www/js/game.js
cmp www/css/app-r160.css www/css/app.css
cmp www/sw-r160.js www/sw.js
echo "R383 Game Hub compatibility files verified."
