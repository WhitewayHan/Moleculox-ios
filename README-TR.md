# Moleculox iOS R163 — v8.7.59

App Store / Codemagic IPA kaynak paketi.

- Bundle ID: `com.whitewayhan.moleculox`
- App Store marketing version: `8.7.59`
- Build number: Codemagic sırasında Unix timestamp; önceki build numarasını tekrar kullanma riski yoktur.
- “My Molecules”: eski/bozuk kayıt veya hatalı önizleme verisi olsa bile koleksiyon ekranını düşürmeyen R163 güvenli açılış katmanı; 9 dil doğrulaması.
- Çift dokunma yakınlaştırma: viewport + gesture/dblclick + CSS `touch-action` katmanlarıyla kapalıdır.
- Dönüş hatırlatması: `@capacitor/local-notifications` 7.0.7; önce oyun içi açıklama, ardından iOS bildirim izni. İzin verilirse yaklaşık 3. ve 10. gün için iki seyrek cihaz-içi hatırlatma planlanır; oyun tekrar açıldığında eski tarihler iptal edilip yeniden hesaplanır.
- Hatırlatma için FCM/APNs, push token, reklam takibi veya yeni kişisel veri toplama yoktur. Ayrı doğum tarihi/yaş verisi istenmez.
- 501 bölüm, 9 dil ve İtalyanca Dr. E sesi korunmuştur.
- Giriş: Apple + Google + e-posta.
- Firebase/sync/leaderboard/duel native köprüleri ve Apple nonce patch'i korunmuştur.
- iPhone-only hedef korunmuştur.
- Codemagic workflow: `moleculox-ios-app-store`.

Codemagic'te ZIP kökünü repository kökü olarak kullan.
