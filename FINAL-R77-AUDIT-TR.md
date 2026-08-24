# Moleculox iOS R77 Final Denetim Raporu

## Paket kimliği

- Platform: iPhone / App Store
- Bundle kimliği: `com.whitewayhan.moleculox`
- Korunan sürüm: `8.7.19`
- Hedef çıktı: Codemagic ile imzalı IPA

## Final düzeltmeleri

- Firebase ana menü presence yazımları 25 saniyelik pencere içinde birleştirildi; eşzamanlı istekler tek yazımı paylaşır.
- Çevrim içi oyuncu sayısı sorgusu 30 saniyeden 45 saniyeye alındı; görünmeyen menüde sorgu yapılmaz.
- Sayfa önbelleğinden/askıdan dönüşte presence zamanlayıcısı güvenli biçimde yeniden başlatılır.
- Online düello heartbeat'i uygulama arka plandayken veya çevrimdışıyken ağ isteği göndermez; görünür olduğunda hemen devam eder.
- Ana oyun döngüsü 60/90/120 Hz ekranlarda birikimli ritim kullanır. 90 Hz ekranlarda oluşabilen 45 FPS örüntüsü giderildi.
- Menü ve boş efekt durumunda ana döngü uyanmaları azaltıldı; aktif oyun ve parçacık efektleri yaklaşık 60 FPS hedefini korur.
- FX canvas yalnızca boyut/DPR gerçekten değiştiğinde yeniden ayrılır; boş ve kapalı efekt yüzeyi her karede tekrar temizlenmez.
- Yinelenen kampanya kartı ve reaksiyon efekti CSS blokları kaldırıldı. Görünür efekt, animasyon, renk veya çizim kaldırılmadı.
- Hatalı `reduce-motion` / `reduceMotion` seçicileri gerçek `mxReduceMotion` durumuna bağlandı; erişilebilirlik tercihi artık çekiç, hassas hamle ve hikâye geçişinde çalışır.
- Yazılım klavyesi açılıp kapanırken `keyboardOpen` yerleşim durumu odak olaylarına bağlandı; form alanlarında viewport sıçraması azaltıldı.
- iOS açılış arka planı oyun paletine (`#070b24`) eşitlendi; ilk karede beyaz parlama riski azaltıldı.
- Native pakete PWA service worker kopyalanmaz.
- Eski teşhis/ara sürüm raporları final kaynak kopyasından çıkarıldı.

## Doğrulanan alanlar

- Tüm JavaScript dosyaları sözdizimi kontrolünden geçti.
- JSON, YAML, plist, Python ve shell betikleri yapısal/sözdizimsel kontrolden geçti.
- 286 HTML kimliği ve 270 CSS keyframe için release denetimi geçti; yinelenen HTML kimliği veya tanımsız animasyon bulunmadı.
- 15 temsilî telefon genişliğinde ana CTA/sol buton rayı çakışma testi geçti.
- Kısa buton merkezleme, 8 dil altyapısı ve kritik UI metin regresyonları geçti.
- Hesap bağlamı, ilerleme kaydı, debounce ve bulut eşzamanlama yarış testleri geçti.
- 72 görsel/SVG ve 32 ses dosyası açılabilirlik/bütünlük kontrolünden geçti; eksik yerel referans, sıfır bayt veya işletim sistemi çöp dosyası bulunmadı.
- Otomatik performans korumasının görünür efektleri gizlemediği veya animasyonları kapatmadığı doğrulandı.
- Ana metin/ikincil metin ve temel vurgu renklerinin koyu ana zemin üzerindeki kontrastı kontrol edildi.

## Korunan görsel kararlar

- R77 onaylı “Moleküllerim / My Molecules” çelik mavisi görünümü ve iOS WebKit sabitlemesi korunmuştur.
- Oyun efektleri, parçacıklar, geçişler ve animasyonlar kaldırılmamıştır.
- Apple, Google ve e-posta girişleri iOS paketinde açıktır; Apple nonce köprüsü ve entitlement korunmuştur.

## Yayın öncesi dış ortam kontrolleri

Bu ZIP final kaynak paketidir. İmzalı IPA üretimi Xcode, App Store profili ve Codemagic sırları gerektirir. Üretim Firebase güvenlik kuralları/indeksleri bu kaynakta tam ruleset olarak bulunmadığı için konsolda doğrulanmalı; online düello iki gerçek cihazla son kez denenmelidir. Isınma ve pil tüketiminin kesin ölçümü de fiziksel iPhone'da uzun oturum profiliyle yapılmalıdır.
