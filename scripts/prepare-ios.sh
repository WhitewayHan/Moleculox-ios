#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d ios/App ]; then
  npx cap add ios
fi

# Firebase iOS configuration can be committed at ios-config/GoogleService-Info.plist
# or provided to Codemagic as a base64 secret named GOOGLE_SERVICE_INFO_PLIST_BASE64.
if [ -n "${GOOGLE_SERVICE_INFO_PLIST_BASE64:-}" ]; then
  printf '%s' "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 --decode > ios/App/App/GoogleService-Info.plist
elif [ -f ios-config/GoogleService-Info.plist ]; then
  cp ios-config/GoogleService-Info.plist ios/App/App/GoogleService-Info.plist
elif [ ! -f ios/App/App/GoogleService-Info.plist ]; then
  echo "ERROR: GoogleService-Info.plist missing. Put it in ios-config/ or add GOOGLE_SERVICE_INFO_PLIST_BASE64 in Codemagic." >&2
  exit 20
fi

npx cap sync ios

python3 scripts/patch-ios.py

echo "iOS project prepared successfully."
