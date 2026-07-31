# Moleculox iOS V8.5.45 — GitHub + Codemagic FINAL REVIEWED

Bu klasörün **içindeki dosyaları** GitHub deposunun köküne yükleyin. ZIP dosyasını tek dosya olarak GitHub’a koymayın.

## Bu final pakette hazır olanlar
- Çalışan Web V8.5.35 oyun içeriği `www/` içinde korunmuştur.
- Paket kimliği: `com.whitewayhan.moleculox`.
- Capacitor iOS 7.4.2 ve `@capacitor-firebase/authentication` 7.3.1.
- Native Firebase eklentisi hem `Capacitor.Plugins` hem `registerPlugin()` üzerinden güvenli biçimde bulunur.
- Google ve Apple çağrılarında `skipNativeAuth` açıkça uygulanır.
- E-posta, Google ve Apple girişleri tamamlanınca Firebase kullanıcı durumu beklemeden arayüze işlenir.
- Google, Apple ve e-posta/Firebase giriş akışları.
- `GoogleService-Info.plist` otomatik kopyalanır ve Xcode target resource olarak kaydedilir.
- Google `REVERSED_CLIENT_ID` URL scheme otomatik eklenir.
- Gerekli AppDelegate OAuth callback otomatik eklenir.
- Sign in with Apple entitlement bütün build yapılandırmalarına bağlanır.
- Uygulama ikonu bütün App Store boyutlarında otomatik üretilir.
- Web ölçülerini bozan native viewport müdahalesi kaldırılmıştır.
- Oyun HUD merkezi, sağ buton boyutları, Dr. E gerçek sağ-alt konumu ve Günlük Deney yazısı düzeltilmiştir.
- Son Claude paketi incelenmiş; web ölçülerini bozan viewport kodu, eski günlük deney metni ve auth gerilemeleri alınmamıştır.

## GitHub’a yükleme
`Moleculox-iOS-GITHUB-CODEMAGIC-READY` klasörünün kendisini değil, **klasörün içindeki tüm dosya ve klasörleri** GitHub deposunun köküne koyun.

## Codemagic
1. GitHub deposunu Codemagic’e bağlayın.
2. `codemagic.yaml` dosyasını taratın.
3. **Moleculox iOS App Store** workflow’unu başlatın.

Workflow sırasıyla bağımlılıkları kurar, JavaScript’i kontrol eder, iOS projesini üretir, Firebase/Apple yapılandırmasını uygular, imzalar ve IPA oluşturur. App Store Connect entegrasyonu bağlıysa TestFlight’a yayınlar.

## Apple/Firebase tarafında hâlâ zorunlu dış ayarlar
Kod doğru olsa bile aşağıdakiler konsollarda kapalıysa giriş çalışmaz:

- Firebase Console → Authentication → Sign-in method: **Google**, **Apple** ve **Email/Password** etkin olmalı.
- Apple Developer → Identifiers → `com.whitewayhan.moleculox`: **Sign in with Apple** açık olmalı.
- Codemagic → Teams → Integrations: App Store Connect API key bağlı olmalı.
- Apple capability sonradan açıldıysa Codemagic’in provisioning profile’ı yeniden oluşturması gerekebilir.

## Bildirim notu
Pakette ileride kullanılabilecek hatırlatma Cloud Function taslağı bulunur; ancak push-notification native eklentisi bu final build’de etkin değildir. Bu nedenle uygulama açılışta bildirim izni istemez ve bildirim eksikliği build’i etkilemez.
