# Moleculox — GitHub + Codemagic iOS paketi

Bu klasörün **içindeki dosyaları** GitHub deposunun köküne yükleyin. ZIP dosyasını tek dosya olarak GitHub'a koymayın.

## Pakette hazır olanlar
- Güncel web oyunu (V8.5.35 — 6 dil, 1133/1133 bölüm bağımsız motorla doğrulanmış, AAA tamamlama efektleri) `www/` içinde.
- Paket kimliği: `com.whitewayhan.moleculox`.
- 1024×1024, alfa kanalsız App Store ikonu: `resources/AppIcon-1024.png`.
- Capacitor iOS 7.4.2.
- Native `@capacitor-firebase/authentication` Apple giriş paketi.
- Native `@capacitor/push-notifications` paketi (bildirim hatırlatmaları için).
- Sign in with Apple **ve** push notification entitlement/capability dosyaları — ikisi de hazır.
- **GoogleService-Info.plist zaten `ios-config/` içinde** — bu adım tamamlandı, ekstra bir şey yapmanıza gerek yok.
- AppDelegate içinde Firebase başlatma düzeltmesi.
- `codemagic.yaml`: iOS projesini otomatik üretir, senkronize eder, IPA oluşturur, **App Store Connect entegrasyonu bağlıysa doğrudan TestFlight'a yükler.**

## Apple tarafında zorunlu dış ayarlar (bunlar GitHub/Codemagic dışında, sizin yapmanız gereken adımlar)
- **Firebase Console > Authentication > Sign-in method**'da Apple sağlayıcısı etkin olmalı (Google/e-posta açık olması yetmez, ayrı ayrı açılır).
- **Apple Developer (developer.apple.com) > Certificates, Identifiers & Profiles > Identifiers**'da `com.whitewayhan.moleculox` App ID'sinde "Sign In with Apple" **ve** "Push Notifications" capability'lerinin ikisi de işaretli olmalı.
- **Codemagic > Teams > Integrations > App Store Connect**'te bir API key bağlı olmalı (otomatik TestFlight yüklemesi ve imzalama profilleri için).

Bu üç dış ayardan biri eksikse: proje/kod tarafı doğru olsa bile Apple girişi çalışmaz veya build imzalanamaz. Kod tarafında kontrol edilebilecek her şey bu pakette zaten doğru.

## Push bildirimleri (isteğe bağlı — eksik bırakırsanız uygulama hatasız çalışmaya devam eder)
Oyun artık 2+ gündür oynamayan oyunculara kendi dillerinde hatırlatma gönderebiliyor. Bu **tamamen isteğe bağlı bir katman**: aşağıdaki adımlar yapılmazsa uygulama sessizce bildirim istemeden çalışır, hiçbir hata vermez. Tam çalışması için:

1. **Apple Developer > Certificates, Identifiers & Profiles > Keys**'den bir "Apple Push Notifications service (APNs)" key oluşturun, indirin.
2. **Firebase Console > Project Settings > Cloud Messaging**'de bu APNs key'i yükleyin.
3. Bu pakette `functions-pushReminders/pushReminders.js` dosyası var — bunu Firebase projenizin `functions/` klasörüne kopyalayıp `functions/index.js` içinden dışa aktarın, sonra:
   ```
   firebase deploy --only functions:sendInactivityReminders
   ```
4. Firestore güvenlik kurallarınıza ekleyin:
   ```
   match /pushTokens/{uid} {
     allow read, write: if request.auth != null && request.auth.uid == uid;
   }
   ```

Bu 4 adım **Codemagic/Xcode build'inin dışında**, doğrudan Firebase Console ve komut satırından yapılan ayrı bir kurulum — iOS uygulamasının kendisini etkilemez, sadece hatırlatma bildirimlerinin gerçekten gönderilmesini sağlar.

## Codemagic
GitHub deposunu Codemagic'e bağlayın, `codemagic.yaml` taratın ve **Moleculox iOS App Store** workflow'unu başlatın.
