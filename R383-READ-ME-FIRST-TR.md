# Moleculox iOS R383 — v8.7.215

Bu ZIP Codemagic için iOS kaynak paketidir; imzalı IPA değildir.

## R383 paketleme düzeltmesi
Whiteway Game Hub'ın aradığı www/js/game.js yeni pakette eksikti.
R376 dosya yapısına uygun olarak game.js, css/app.css ve sw.js eş kopyaları
kaynak ZIP'e eklendi. Restore işlemi bunları güncel dosyalardan tekrar üretir;
böylece R380 payload eski kodu geri getiremez. index.html oyunu yalnız bir kez
(game-r160.js üzerinden) yükler. R382 senkronizasyon değişiklikleri korunur.

## Korunan senkronizasyon düzeltmesi
R381, App Attest kullanan @capacitor-firebase/app-check 7.3.1 eklentisini
çalıştırıyor, ancak App.entitlements içinde App Attest üretim yetkisi yoktu.
App Check sağlayıcısı da FirebaseApp.configure çağrısından sonra, WebView'den
kuruluyordu. R383 üretim yetkisini ekler ve sağlayıcıyı Firebase başlamadan kurar.
Bu eksiklikler giriş başarılıyken bulutun reddedilmesini açıklayabilir; mevcut
canlı hatanın tek nedeni oldukları cihaz/log olmadan kesinleştirilmemiştir.

- Google, Apple ve mail aynı mevcut Firebase JS oturumunu kullanmaya devam eder.
- iOS Firestore bağlantısı long polling kullanır; akış bağlantısına bağımlılık azalır.
- App Attest token alma hatası artık ayrı app-check/token aşamasıyla gösterilir.
- Mevcut oyun, bölümler, yerel kayıt anahtarları ve hesap UID'leri korunur.
- Firebase rules değiştirilmedi; bulut belgeleri silinmedi.
- Codemagic restore-www ve IPA kontrolü R383 dosyalarını doğrular.

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

App Attest'in Firebase'de iOS uygulaması için kayıtlı olması ve imza profilinin
App Attest yetkisini desteklemesi gerekir. ZIP sunucu kaydını veya Apple hesabını
değiştirmez. Bu nedenle canlı cihaz doğrulaması olmadan “kesin çalışıyor” denmez.

TestFlight: mevcut Google hesabıyla giriş yapıp webdeki profili yükle, bir bölüm
ilerle, Senkronize Et'e bas ve webde güncellendiğini kontrol et. Aynı kontrolü
mail/Apple hesapları için kendi UID'leri içinde yap; uygulamayı kapatıp açınca
ilerlemenin korunduğunu doğrula. Farklı UID'ler otomatik birleştirilmez.

Kaynak: https://firebase.google.com/docs/app-check/ios/app-attest-provider
