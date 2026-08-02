# Moleculox V8.5.37 — Google Play Android

- Ana oyun: V8.5.35 FINALweb, bütün mekanikler ve görseller korunmuştur.
- Google girişi: Android tarayıcı redirect akışı kaldırıldı; native Google kimliği + Firebase ID token bağlantısı kullanılır.
- E-posta girişi: korunmuş ve zaman aşımı/kilitlenme koruması eklenmiştir.
- Paket adı: `com.whitewaystudio.moleculox` (mevcut Google Play uygulamasıyla aynı).
- Version name: `8.5.36`; versionCode: `30000 + Codemagic build number`.

## Tek zorunlu dosya

Firebase Console'da `com.whitewaystudio.moleculox` Android uygulamasını oluştur/seç, Google Play imza parmak izlerini ekle ve yeni `google-services.json` dosyasını `android-config/google-services.json` konumuna koy.

Sonra ZIP içeriğini GitHub ana dizinine yükleyip Codemagic'te **Moleculox V8.5.37 Google Play AAB** workflow'unu çalıştır.
