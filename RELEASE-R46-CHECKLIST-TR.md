# Moleculox R46 — Yayın Öncesi Konsol Kontrolü

Bu ZIP içindeki kod ve paket hazırlığı tamamlandı. Aşağıdaki maddeler Firebase,
Google Play Console, App Store Connect veya Codemagic hesabında yapılması gereken
harici işlemlerdir; ZIP içinden otomatik olarak etkinleştirilemez.

## Yayın yüklemesinden önce

- [ ] Firebase App Check'te Android uygulaması için **Play Integrity** kaydını aç.
- [ ] Firebase App Check'te iOS uygulaması için **App Attest** kaydını aç; DeviceCheck geri dönüşünü doğrula.
- [ ] İlk gerçek cihaz/TestFlight ve Internal Testing trafiğinde geçerli App Check isteklerini izle. Geçerli trafik görülmeden Firestore enforcement açma.
- [ ] `firestore-name-reports.rules` içindeki `playerNameReports` bloğunu mevcut tam Firestore rules dosyasına birleştir ve deploy et. Bu snippet tek başına tam rules dosyası değildir.
- [ ] Firestore TTL alanlarını doğrula: `duelRooms.expiresAt`, `duelMatchQueue.expiresAt`, `playerNameReports.expiresAt`.
- [ ] Firebase Console'da `playerNameReports` kuyruğunu inceleyecek moderasyon sorumlusunu ve inceleme sıklığını belirle.
- [ ] Android ZIP'ini Codemagic'te çalıştır; imzalı AAB ve `mapping.txt` çıktısını sakla.
- [ ] iOS ZIP'ini Codemagic'te çalıştır; imzalı IPA'yı TestFlight'a gönder.
- [ ] Gerçek Android cihazda Google + e-posta girişini, hesap silmeyi, sıralama rapor/engelle akışını ve portal içeren bir bölümü test et.
- [ ] Gerçek iPhone'da Apple + Google + e-posta girişini, hesap silmeyi, sıralama rapor/engelle akışını ve portal içeren bir bölümü test et.
- [ ] Play Data Safety ve App Store Privacy yanıtlarını güncel politika metniyle eşleştir; kullanıcı kimliği, herkese açık oyuncu adı/oyun verisi, moderasyon raporu, analiz ve app-attestation kullanımını beyanlarda kontrol et.
- [ ] Mağaza açıklamasındaki gizlilik, kullanım şartları, ad kuralları ve veri silme URL'lerinin HTTPS üzerinden açıldığını doğrula.

## Sürüm kimliği

- Uygulama sürümü: `8.5.79`
- Yayın: `R46`
- Build kimliği: `8.5.79-r46-ui-centered-ios`
- Android paket: `com.whitewaystudio.moleculox`
- iOS bundle: `com.whitewayhan.moleculox`
