# Moleculox iOS V8.5.63 R18 — TestFlight Ses ve Yerleşim Paketi

Bu paket, gerçek TestFlight testinde görülen iOS sorunları için hazırlanmış tam GitHub + Codemagic kaynağıdır. Önceki Claude paketinin yerine kullanılmalıdır.

- Bundle ID: `com.whitewayhan.moleculox`
- Oyun / App Store sürümü: `8.5.63`
- Capacitor: `7.4.2`
- Firebase Authentication: Apple, Google ve e-posta
- Codemagic workflow: `moleculox-ios-app-store`
- Çıktı: imzalı `.ipa`

## R18 ile düzeltilenler

- Google, Apple ve e-posta girişlerinin yavaş misafir oturumu açılışına takılması önlendi.
- Native Google/Apple kimlik tokenının Firebase Web hesabına aktarım yolu güçlendirildi.
- E-posta girişindeki teknik `capacitor://localhost` hata ayrıntısı kullanıcıdan gizlendi.
- Ayarlar açılırken aktif oyun ekranı korunur; yanlışlıkla logo/intro ekranına dönüş engellenir.
- Native ayarlar penceresindeki ağır arka plan bulanıklığı kaldırıldı.
- Native kabukta gereksiz service-worker kayıt ve önbellek temizliği devre dışı bırakıldı.
- Oyun içi Dr. E ve konuşma balonu alt menünün ve iPhone safe-area alanının üstüne taşındı.
- Hesap penceresindeki başlık ile kapatma düğmesinin çakışması giderildi.


- Profesörün 25 ayrı ses dosyası tek yerel ses sprite dosyasında birleştirildi; iOS her replikte yeni medya kaynağı açmıyor.
- Replikler kısa bir kuyrukta sırayla çalıyor ve birbirini kesmiyor.
- Oyun içindeki Einstein Web sürümüne yakın orana küçültüldü ve ayakları sağ alt zemine sabitlendi.
- Oyun tahtası GOAL alanına yalnız birkaç piksel yaklaştırıldı.

## Kullanım

ZIP içindeki ana klasörün içeriğini iOS GitHub deposunun köküne aktarın. Codemagic'te `Moleculox iOS App Store` workflow'unu çalıştırın. Workflow iOS projesini üretir; Google Sign-In CocoaPods bağımlılığını, Firebase plist dosyasını ve Apple Sign-In entitlement dosyasını bağlar; ardından imzalı IPA oluşturur.

## Yeni TestFlight build'inde zorunlu testler

1. Google hesabı seçimi, Firebase bağlantısı ve uygulama yeniden açıldığında oturumun korunması.
2. Apple ile giriş ve aynı hesabın bulut kaydına erişmesi.
3. E-posta ile giriş, çıkış, yeniden giriş ve şifre sıfırlama.
4. Cloud Save, profil birleştirme ve sıralama durumunun giriş başarısından ayrı gösterilmesi.
5. Oyun içindeyken Ayarlar'ı açıp kapatınca aynı bölümde kalınması.
6. Dr. E ve konuşma balonunun 320×568, 375×667, 390×844 ve 393×852 ekranlarda alt menüye taşmaması.
7. Klavye açılıp kapandıktan sonra hesap penceresinin ve ekran ölçeğinin normale dönmesi.

Kaynak, yapılandırma ve render kontrolleri yapılmıştır. Gerçek Apple/Google/e-posta girişinin ve iOS çalışma davranışının kesin onayı yalnız yeni Codemagic build'i TestFlight üzerinden kurulunca verilebilir.
