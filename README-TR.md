# Moleculox iOS R82 — v8.7.25

Bu paket App Store/TestFlight için Codemagic kaynak paketidir.

- Bundle ID: `com.whitewayhan.moleculox`
- Girişler: **Apple + Google + e-posta**
- Sign in with Apple entitlement ve native nonce/Firebase bridge korunur.
- R81 web oyun içeriği, online arkadaş odası düzeltmesi, 8 dil ve güncel Dr. E sesleri dahildir.
- Codemagic workflow: `moleculox-ios-app-store`
- App Store version: `8.7.25`
- Build number Codemagic sırasında benzersiz üretilir.

## Codemagic
ZIP kökünü repository kökü olarak kullan. `codemagic.yaml`, `package.json`, `www/`, `scripts/`, `ios-config/` ve `resources/` aynı kökte kalmalıdır.

Apple girişi bu pakette özellikle açıktır. Android paketindeki Apple kapatma politikası bu pakete uygulanmamalıdır.

## R81 online dayanıklılık
- Aktif düello oturumu yeniden açılışta aynı Firebase UID + cihaz kimliğiyle güvenli biçimde devam ettirilebilir.
- Heartbeat, listener, Quick Match ve sonuç gönderimi için timeout/retry koruması vardır.
- Uygulama arka plandan dönerken önce heartbeat doğrulanır; stale presence tek başına maçı iptal etmez.
- 30 saniyelik disconnect grace korunur.

