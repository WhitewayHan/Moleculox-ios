## R171 / v8.7.67 — GOAL Sinyalleri

HEDEF normal oyunda tamamen statik. Çözüm bir hamle uzaktaysa iki kısa altın sinyal verir ve altın kalır. Doğrulanmış çıkmazda tahta sabit kırmızı olur; Einstein uyarır fakat oyun otomatik yeniden başlamaz. Nasıl Oynanır 9 dilde açıklanmıştır.

# Moleculox iOS R171 — v8.7.67

App Store / Codemagic IPA kaynak paketi.

- Bundle ID: `com.whitewayhan.moleculox`
- App Store marketing version: `8.7.73`
- Build number: Codemagic sırasında Unix timestamp; önceki build numarasını tekrar kullanma riski yoktur.
- “My Molecules”: eski/bozuk kayıt veya hatalı önizleme verisi olsa bile koleksiyon ekranını düşürmeyen R171 güvenli açılış katmanı; 9 dil doğrulaması.
- Çift dokunma yakınlaştırma: viewport + gesture/dblclick + CSS `touch-action` katmanlarıyla kapalıdır.
- 501 bölüm, 9 dil ve İtalyanca Dr. E sesi korunmuştur.
- Giriş: Apple + Google + e-posta.
- Firebase/sync/leaderboard/duel native köprüleri ve Apple nonce patch'i korunmuştur.
- iPhone-only hedef korunmuştur.
- Codemagic workflow: `moleculox-ios-app-store`.

Codemagic'te ZIP kökünü repository kökü olarak kullan.
- Nano Barrier artık stoklanmaz/bedava envanter kullanmaz; onaylı yerleştirme başına 300 MoleCoin harcanır.
- İpucu satın alma ekranlarında Moleculox’un kendi sarı MoleCoin simgesi kullanılır.
- Bildirim/hatırlatma özelliği yoktur; uygulama bildirim izni istemez.
