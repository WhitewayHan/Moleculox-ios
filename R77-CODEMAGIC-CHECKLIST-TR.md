# R77 iOS Codemagic kontrolü

1. Workflow: `moleculox-ios-app-store`
2. App Store Connect integration: `Moleculox`
3. Bundle ID: `com.whitewayhan.moleculox`
4. App Store signing profile Codemagic tarafından uygulanır.
5. GoogleService-Info.plist `ios-config/` içinden build'e alınır.
6. Apple Sign-In entitlement aktiftir.
7. Native Apple raw nonce patch, Google auth Pod'u ve Firebase App Check build sırasında doğrulanır.
8. Sürüm: 8.7.20; build number benzersiz oluşturulur.
