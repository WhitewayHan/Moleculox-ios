#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Apple Sign-In nonce is generated only by the native plugin. The validator ensures
# the official rawNonce -> SHA-256 Apple request -> returned rawNonce flow is intact.
python3 scripts/patch-apple-nonce.py

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

python3 scripts/patch-podfile.py

# `npx cap add ios` creates a Podfile.lock before the Google auth subspec is added.
# That lock can pin GTMSessionFetcher 4.x, while GoogleSignIn 7.x needs a compatible
# 3.x release. Resolve the complete Podfile from scratch and refresh specs.
rm -f ios/App/Podfile.lock
(
  cd ios/App
  pod install --repo-update
)

# Native dependencies are already installed above; only refresh web assets/config.
npx cap copy ios

python3 scripts/patch-ios.py

echo "iOS project prepared successfully."
