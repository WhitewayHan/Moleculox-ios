# MOLECULOX R380/8.7.212 — IOS — Itch R379 source parity

Shared game baseline: Moleculox-R379-v8.7.211-ITCH.zip
Native baseline: Moleculox-R379-v8.7.211-iOS-CODEMAGIC.zip

- Copied all 345 itch.io web files, including game logic, 801-level campaign assets, Legends, Molecules, Daily Molecoin UI and Firebase bridge.
- Retained native-specific Android/iOS Edward positioning and iOS boot artwork geometry.
- iOS: retained the native Sign in with Apple implementation; enabled Google, email/password and safe account linking in the same account screen.
- Android: retained native Google login + email/password, no Apple button.
- In native Cloud Status, link Google and add email/password buttons appear if a provider is not yet linked; they never silently switch accounts.
- All index JS/CSS URLs use the fresh 8.7.212 cache revision.
- iOS Codemagic MARKETING_VERSION/IPA verification and Android versionName/versionCode are bumped.
- Repacked the actual www used by restore-www.sh; no stale R378 payload is used.

IMPORTANT: ZIP checks, JS syntax and desktop-simulated layout/auth UI do not substitute for actual TestFlight/Google Play builds, real Google/Apple logins, or live Firestore rules. Cloud permission-denied must also be fixed in Firebase Console and verified with a real user session.
