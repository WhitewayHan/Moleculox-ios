# Moleculox iOS R77 — v8.7.20

Bu paket App Store/TestFlight için Codemagic kaynak paketidir.

- Bundle ID: `com.whitewayhan.moleculox`
- Girişler: **Apple + Google + e-posta**
- Sign in with Apple entitlement ve native nonce/Firebase bridge korunur.
- R77 web oyun içeriği, online arkadaş odası düzeltmesi, 8 dil ve güncel Dr. E sesleri dahildir.
- Codemagic workflow: `moleculox-ios-app-store`
- App Store version: `8.7.20`
- Build number Codemagic sırasında benzersiz üretilir.

## Codemagic
ZIP kökünü repository kökü olarak kullan. `codemagic.yaml`, `package.json`, `www/`, `scripts/`, `ios-config/` ve `resources/` aynı kökte kalmalıdır.

Apple girişi bu pakette özellikle açıktır. Android paketindeki Apple kapatma politikası bu pakete uygulanmamalıdır.
