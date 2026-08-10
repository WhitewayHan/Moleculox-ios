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
