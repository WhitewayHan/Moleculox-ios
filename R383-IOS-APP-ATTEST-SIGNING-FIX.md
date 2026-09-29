# R383 v8.7.215 – iOS signing hotfix

Exact Codemagic App.log error: `Provisioning profile "Moleculox App Store Profile" doesn't include the App Attest capability` and the `com.apple.developer.devicecheck.appattest-environment` entitlement.

- Removed unsupported entitlement. Kept `com.apple.developer.applesignin` for Sign in with Apple.
- Removed native AppAttestProvider factory from AppDelegate patcher; kept FirebaseCore, Google OAuth callback, Info.plist registration, existing bundle identifier and distribution profile.
- Native App Check bridging is disabled because Cloud Firestore App Check is **Unenforced** in provided Firebase screenshot. Firestore security rules remain in force. The App Check plugin package is retained but is not initialized on iOS by the web module.
- R383 game, collections, Legends, Firebase profile normalization and iOS version (8.7.215) unchanged.
- Reenable native App Check only after registering the iOS app for App Check, enabling suitable Apple signing entitlements and independently testing tokens.
- Local ZIP, JS and native patch-fixture tests are not a signed Xcode build or live Firebase synchronization test.
