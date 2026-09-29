# Moleculox iOS R383 — v8.7.215

Bu ZIP Codemagic için iOS kaynak paketidir; imzalı IPA değildir.

## R383 paketleme düzeltmesi
Whiteway Game Hub'ın aradığı www/js/game.js yeni pakette eksikti.
R376 dosya yapısına uygun olarak game.js, css/app.css ve sw.js eş kopyaları
kaynak ZIP'e eklendi. Restore işlemi bunları güncel dosyalardan tekrar üretir;
böylece R380 payload eski kodu geri getiremez. index.html oyunu yalnız bir kez
(game-r160.js üzerinden) yükler. R382 senkronizasyon değişiklikleri korunur.

## iOS imzalama düzeltmesi (29 Eylül)
Xcode 65 logu: Mevcut Apple "Moleculox App Store Profile" profilinde
App Attest yetkisi olmadığı için Archive duruyordu. Profil değiştirilmeden
App Attest entitlement ve erken native factory kurulumu kaldırıldı.
Sign in with Apple / Google / email kodları ve Firebase Authentication saklandı.

Cloud Firestore App Check konsolda UNENFORCED olduğundan, iOS'ta henüz kayıtlı
olmayan native App Check token isteme yolu beklemeye alındı; Firestore Security
Rules olduğu gibi çalışır. Gelecekte App Check zorunlu yapılmadan önce hem
Firebase iOS kaydı hem de imza yetkisi açılmalı ve bu davranış güncellenmelidir.

Bu değişiklik kesin olarak Xcode logundaki App Attest imzalama engelini hedefler;
canlı iOS bulut senkronizasyonu bu ortamda doğrulanmadı.

## Kullanım
ZIP'i kaynak deponun köküne aç; mevcut codemagic.yaml akışını çalıştır.
Akış payload dosyalarını açar, R383 dosyalarını uygular, testleri çalıştırır ve
8.7.215 IPA üretir. Güncellemeyi mevcut uygulamanın üzerine kur.

## Doğrulama sınırı
Yerelde JavaScript sözdizimi, dosya referansları, 11 otomatik JS testi ve native
proje yamalama testi çalıştırıldı. Üç sağlayıcının giriş -> bulut okuma ->
birleştirme -> aynı UID'ye yazma akışı sahte Firebase servisleriyle test edildi.
Gerçek Apple/Google giriş pencereleri, imzalı iOS derlemesi, gerçek cihaz ve
canlı Firebase senkronizasyonu bu ortamda test edilmedi.

Bu sürüm App Attest entitlement gerektirmez; Firebase'de App Check zorunlu
olursa tekrar yapılandırılması gerekir. ZIP sunucu kaydını veya Apple hesabını
değiştirmez. Canlı cihaz doğrulaması olmadan "senkronizasyon kesin çalışıyor" denmez.

TestFlight: mevcut Google hesabıyla giriş yapıp webdeki profili yükle, bir bölüm
ilerle, Senkronize Et'e bas ve webde güncellendiğini kontrol et. Aynı kontrolü
mail/Apple hesapları için kendi UID'leri içinde yap; uygulamayı kapatıp açınca
ilerlemenin korunduğunu doğrula. Farklı UID'ler otomatik birleştirilmez.

Kaynak: https://firebase.google.com/docs/app-check/ios/app-attest-provider
