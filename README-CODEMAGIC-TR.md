# Moleculox iOS R376 · v8.7.208 · Codemagic

Bu paket eski R373 App Store / Capacitor iOS iskeletini korur ve güncel R376 oyun içeriğini taşır.

- 801 campaign bölümü
- PAR tabanlı yıldız sistemi
- 1 yıldız sınırından sonra tam 3 adet 0 yıldız hamlesi
- 3. ek hamlede çözülmezse aynı bölüm otomatik yeniden başlar; Continue yok
- 0 yıldız geçişi: 0 Yıldız, 0 MoleCoin, 0 RP; achievement/rank/post-Nobel ekonomik ödülü yok
- How to Play kuralı 11 dilde
- Science Legends 24 kart
- iPhone-only App Store hedefi
- Firebase cloud / leaderboard / App Check korunur
- Native giriş seçeneği yalnızca Sign in with Apple; Google ve e-posta giriş butonları iOS uygulamasında gösterilmez
- Sign in with Apple entitlement + deterministic nonce köprüsü korunur

Codemagic: `moleculox-ios-app-store` workflow. Kaynak doğrulama build başlamadan çalışır.

GAME HUB UYUMLULUK DÜZELTMESİ
- ZIP kökü doğrudan codemagic.yaml / www / scripts ile başlar; dış sarmalayıcı klasör yoktur.
- Whiteway Game Hub ön kontrolü için www/js/game.js, www/css/app.css ve www/sw.js kaynak alias'ları mevcuttur.
- Codemagic ilk adımda payload içindeki doğrulanmış R376 sürümünü restore eder; gerçek build www/js/game-r160.js ve app-r160.css ile yapılır.
