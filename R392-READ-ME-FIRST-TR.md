# Moleculox R392 / v8.7.238 — iOS ÜÇ GİRİŞ ONARIMI

Kaynak baz: R391 v8.7.237 iOS. Oyun, 801 bölüm, görseller, ses, senkronizasyon ve Apple giriş kodu korundu.

- Account & Players ekranında konuk için Apple, Google, E-posta ile giriş ve yeni e-posta kaydı görünür.
- iOS'ta üç seçeneği güvence altına alan render sonrası koruma eklendi; butonlara eski gerçek bağlantı işleyicileri bağlanır.
- iPhone küçük ekranlarında hesap menüsü gerektiğinde kaydırılabilir.
- Hesap ekranının altında `v8.7.238 · R392 · Apple / Google / Email` ibaresi görünür. Yeni IPA'da bu yoksa eski derleme yüklüdür.
- Apple nonce/auth, Google native token, e-posta ve mevcut hesap UID/ilerleme sistemi değiştirilmedi.
- Kod kaynak paketidir; App Store IPA değildir. Codemagic üzerinden IPA derlenip fiziksel iPhone'da gerçek oturum açma testleri yapılmalıdır.
- Codemagic önce `scripts/restore-www.sh` ile 368 tam web varlığını geri yükler ve SHA256 doğrular.

Kontrol listesi: uygulamayı güncelle, hesabı aç, Apple/Google/e-posta seçeneklerini gözle doğrula; üç yöntemle ayrı ayrı oturum aç; Cloud & Ranking Status panelinden senkronizasyonu doğrula. Eski hesaptaki ilerlemeyi silme.
