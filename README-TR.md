# Moleculox iOS v8.5.79 R46 — App Store Yayın Paketi

- Bundle ID: `com.whitewayhan.moleculox`
- Workflow: `moleculox-ios-app-store`
- Apple, Google ve e-posta girişi korunmuştur.
- Portal çizim hatası ve sonuç ekranı CSS paketleme hatası düzeltilmiştir.
- Genel sıralamalarda ad filtresi, raporlama ve cihazda engelleme vardır.
- Native Firebase App Check hazırlığı iOS 14+ için App Attest kullanır.

ZIP içeriğini depo köküne yükleyip Codemagic workflow'unu çalıştırın. Firebase,
TestFlight ve App Store Connect tarafındaki son adımlar için
`RELEASE-R46-CHECKLIST-TR.md` dosyasını tamamlayın.

## Önceki doğrulama notları

# Moleculox iOS V8.5.78 R38 — Yerel Web Dosyası Önbellek Kimliği Düzeltmesi

R38, TestFlight güncellemesinde `index.html` dosyasının yeni R37 kaynaklarını hâlâ R24/R25 sorgu kimlikleriyle istemesi nedeniyle iPhone WKWebView'in eski JavaScript'i çalıştırabilmesini düzeltir.

1. CSS ve bütün çalışma-zamanı JavaScript dosyaları tek ve benzersiz `8.5.78-r38-native-cache-bust` kimliğiyle yüklenir.
2. `game.js`, `firebase.js` ve `sync-core.js` artık eski R24 önbellek girdileriyle karışamaz.
3. R37'deki hesap bağlamı, manuel senkron ve sıralama ayrıştırma düzeltmeleri aynen korunur.
4. `scripts/verify-native-cache-version.js`, paket sürümü, TestFlight sürümü, native build kimliği, servis çalışanı ve tüm HTML kaynak URL'lerinin aynı R38 sürümünde olduğunu zorunlu kılar.

TestFlight doğrulamasında uygulama içindeki **Hakkında** ekranı `v8.5.78` göstermelidir. Daha eski bir sürüm görünüyorsa yeni build çalışmıyordur.

# Moleculox iOS V8.5.77 R37 — Son Hesap Bağlamı Yarış Düzeltmesi

R37, R36 üzerinde bağımsız çalışma-zamanı testinde bulunan son iki Apple→Google hesap geçişi yarışını kapatır:

1. **Şimdi Senkronize Et** akışı her asenkron adımdan sonra aynı hesap ve oyuncu bağlamını yeniden doğrular; eski işlem yeni hesabın sıralamasına veya durum göstergesine devam edemez.
2. **Sahipsiz sıralama temizliği** profil listesini, filtreleri ve silme hedeflerini tek bir değişmez Firebase UID/auth-generation bağlamına sabitler.

`npm run check` artık gerçek Promise zamanlamasıyla normal senkronu ve Apple→Google geçişini çalıştıran `scripts/verify-root-sync-runtime.js` testini de içerir. R37 doğrulamasında 7/7 çalışma-zamanı senaryosu geçmiştir.

Codemagic iş akışı: `moleculox-ios-app-store`

Gerçek Firebase üretim yazısının son doğrulaması için yeni 8.5.77 build'ini TestFlight üzerinden fiziksel iPhone'a kurun.

# Moleculox iOS V8.5.70 R29 — İlerleme Kaydı Yarış Durumu Düzeltmesi

Bu paket R28 iPhone-only App Store yapısını korur ve hızlı arka arkaya bölüm bitirme / uygulamadan çıkma sırasında eski bulut yanıtının daha yeni yerel ilerlemeyi geri almasını engeller.

Codemagic iş akışı: `moleculox-ios-app-store`

Yükleme sonrası App Store Connect'te aynı 8.5.70 sürüm etiketi altında **en yeni ve daha yüksek zaman damgalı build numarasını** seçin.

# Moleculox iOS V8.5.70 R28 — iPhone-Only App Store Final

Bu paket App Store gönderimi için yalnız iPhone hedefler. R25 oyun içeriği ve R27 gerçek Moleculox ikon sistemi aynen korunmuştur.

Codemagic sırası:
1. iOS projesini üretir.
2. Gerçek 1024×1024 Moleculox ikonunu üretip doğrular.
3. Tüm App target yapılandırmalarında `TARGETED_DEVICE_FAMILY = 1` olduğunu doğrular.
4. İmzalı IPA üretip App Store Connect'e yollar.

Yeni build App Store Connect'te seçildiğinde 13 inç iPad ekran görüntüsü zorunluluğu kalkmalıdır. Eski iPad destekli build seçili kalırsa uyarı devam eder; yeni R28 build seçilmelidir.
