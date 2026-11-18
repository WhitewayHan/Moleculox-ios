# Moleculox — Itch için akıcılık sürümü

Kaynak: `WhitewayHan/Moleculox-ios`, `main` 11637bb5; önceki bölüm listesi düzeltmesi 8174e18 temel alındı. Çalışma dalı `perf/itch-animation-smoothness`. Kullanıcının seçtiği kapsam: animasyon/efekt akıcılığı ve hata düzeltmeleri; mevcut görünüm ve mekanikler korunacak. Arayüz yenilemesi, yeni oyun modu veya Godot/Unity taşıması bu paketin kapsamına alınmadı.

## Somut sorunlar ve değişiklikler

- **Düşük çizim sıklığı:** Hareketli atom/parlama, portal, döner oda ve benzeri dekoratif tahta öğeleri çoğu bölümde boşta kabul edilip mobilde yaklaşık 4 Hz çiziliyordu. Aynı çizimler normal modda 30 Hz, mevcut düşük performans tercihinde 20 Hz çiziliyor. Kayma hâlâ seçilen 60/120 Hz hedefini ve mevcut süre/easing kurallarını kullanır.
- **Efektin hareket sırasında durması:** Mobil kayma, önceki iniş/portal parçacıklarının çizimini tamamen kesiyordu. Efekt çizimi kayma sırasında da devam eder ve aktif parçacıklar ekranın VSync zamanlamasına bağlanır.
- **Efekt saatinin yanlış ilerlemesi:** Cadence deadline değeri geçen süre sanılıyordu. Her parçacık kendi doğum/son güncelleme zamanından ilerler; yeni doğmuş parçacığa önceki boşta bekleme süresi yüklenmez. Gecikmeli parçacık yalnız aktif kaldığı aralık kadar hareket eder. Gizlenme/geri dönüşte saatler yeniden bazlanır. Önceden mevcut 120 ms azami yakalama adımı, büyük bir foreground duraklaması sonrası sıçramayı sınırlamak için korunur.
- **Dokunma yaşam döngüsü:** İptal, pointer capture kaybı, pencere odağı kaybı, bölüm/eğitim değişimi ve askıya almada basış durumu/atom basılma efekti temizlenir. Parmak basılıyken atom silinmiş/değişmişse eski hareket iptal edilir. `move()` geçersiz atomu özel araçlara iletmeden önce reddeder. 18 px tap toleransı, yön kararı ve bariyer kuralları korunur.
- **Rövanş düğmesi:** Asenkron yanıt veya gecikmiş callback içinde ömrü biten `event.currentTarget` yerine gerçek düğme referansı kullanılır. Başarısız rövanş yanıtında ve mesaj cooldown bitiminde düğme yeniden etkinleşebilir.

Efektlerin renkleri, şekilleri, sayıları, mevcut DPR sınırları, kayma süreleri, bölüm verileri, ekonomi, Firebase proje kimliği ve kayıt anahtarları değiştirilmedi. Daha akıcı ara kareler ve doğru parçacık yaşı, zaman içinde farklı görüntüler oluşturur; hareketli sahnelerde her kare için eski sürümle piksel eşitliği beklenmez.

## Otomatik doğrulama

`tests/animation-cadence.test.mjs`, gerçek renderer/ana döngü kaynaklarını kontrollü Canvas ve ekran API'leriyle çalıştırır: 60/90/120/144 Hz zaman doğruluğu, dekoratif 30/20 Hz, menü 30 Hz, kayma+efekt eşzamanlılığı, 120 Hz tahta/60 Hz FX, yeni parçacık, gecikme, gizli sayfa, burst wake ve düşük hareket tercihi. 13 test geçti.

`tests/input-lifecycle.test.mjs`, gerçek giriş işleyicilerini çalıştırır: dört yön, eşikler, diyagonal eşitlik, boş başlangıç, eski seçim, ikinci parmak, iptal/capture kaybı/blur, bölüm/askıya alma, atom silinmesi/yeniden indeksleme, bariyer ve rövanş yolları. 12 test geçti.

Deterministik 10 saniyelik ana döngü karşılaştırması (gerçek tarayıcı FPS ölçümü değildir):

| Senaryo | Önce | Sonra |
| --- | ---: | ---: |
| Mobil dekoratif tahta çizimi | 40 | 300 |
| Menü efekt çizimi | 40 | 300 |
| 144 Hz ekran girdisinde FX simülasyonu | 11,667 sn | 10 sn |
| Mobil kayma sırasında efekt çizimi | 0 | 600 |

## Itch paketi ve yeniden üretim

```sh
bash scripts/restore-www.sh
npm run check
npm run itch:build
```

`WEB-BUNDLE-SHA256.json`, değişmez orijinal 368 dosyalık payload'ı doğrular. `WEB-OVERRIDES-SHA256.json`, iki CSS ve iki oyun JS eş kopyasının onaylanmış tam SHA256 değerlerini içerir. Restore önce bu dört kaynak dosyasını doğrulayıp belleğe alır; orijinal arşivi staging alanında ayrıca doğrular; yalnız onaylı dört dosyayı üstüne koyar. Kaynak veya payload bozulursa mevcut `www` silinmeden işlem durur. Binary payload değiştirilmedi.

`build-itch.py`, yalnız manifestteki dosyaları dışa aktarır; ZIP kökünde `index.html` bulunur. Çıktı kimliği `8.7.239-web-smooth1`, görünür sürüm `v8.7.239 · WEB · Smooth 1`; native shell kapalı, test/QA bayrakları kapalıdır. Mevcut hesap/ilerleme anahtarları korunur. Yalnız web çıktısında Service Worker kaydı, sürüme özel cache isimleri ve tam yerel offline manifest oluşturulur. Worker sadece kendi kapsamındaki aynı origin GET isteklerini işler; Firebase/auth trafiğini önbelleğe almaz. Worker kaydı desteklenmez/reddedilirse normal çevrimiçi oyun açılışı engellenmez.

ZIP'e iOS projesi, native konfigürasyon, payload parçaları, node_modules veya Git bilgisi alınmaz. `BUILD-INFO.json`, çıktı dosyalarının hash'lerini ve kaynak manifest digest'lerini içerir; ZIP yanında SHA256 dosyası oluşur.

Itch yükleme: proje türü HTML seçilir, ZIP açılmadan yüklenir ve “This file will be played in the browser” işaretlenir. Tam ekran düğmesi ve mobil uyumluluk etkinleştirilebilir. Başlangıç gömme alanı için 960×720 veya tam ekran uygundur; oyun pencereye uyarlanır.

## Ölçüm sınırları

Tarayıcı testleri mobil/masaüstü Chromium emülasyonudur. Fiziksel iPhone termal/bellek testi, native IPA derlemesi ve canlı Google/e-posta hesabıyla Itch giriş testi değildir. Gerçek hesaba/buluta test verisi yazılmadı. Nihai ZIP, iframe açılışı, hareket ve çevrimdışı shell kontrolleri ile gerçek tarayıcı önce/sonra ölçümleri aşağıdaki sonuç ekinde belirtilir.

## Gerçek tarayıcı önce/sonra sonucu

Chromium 156.0.8078.79, CPU yavaşlatması yok; sabit RNG tohumu 12345. Bölüm 1, gerçek portal geçişi içeren 40 ve geç kampanya döner oda bölümü 781; mobil ve masaüstü olarak altı sahne. Her sahnede boşta dekorasyon, üç gerçek sertifikalı hareket, efekt burst ve hareketle eşzamanlı burst incelendi. Girdi gerçek dokunma/fare olaylarıdır. Canvas metotlarını sarmalayan ölçüm, çizim çağrıları arasındaki süre ve JS gönderim maliyetini kaydeder; GPU'nun tamamlanma süresini doğrudan ölçmez.

| Mobil sahne | Boşta tahta çizimi aralığı medyanı önce → sonra | Kayma+efekt sırasında gözlenen en büyük FX çizim boşluğu önce → sonra |
| --- | ---: | ---: |
| Bölüm 1 | 250 → 33,3 ms | 183,3 → 33,3 ms |
| Bölüm 40 / portal | 250 → 33,3 ms | 149,9 → 16,8 ms |
| Bölüm 781 / döner oda | 250 → 33,3 ms | 116,7 → 16,8 ms |

Bir saniye nominal ömür verilen test parçacığının ölçülen duvar süresi, önceki sürümde 524,1–899,5 ms iken düzeltmede 1005,6–1038,1 ms oldu. Son kare aralığının büyüklüğüne bağlı küçük aşım, parçacığın bir sonraki çizimde kaldırılmasından kaynaklanır. Portalın gerçek transit animasyonu da ölçümde gözlendi.

24 sahne/aşama karşılaştırmasında bölüm kimliği, hamle sayısı, kazanma durumu ve atomların konum/element/donukluk durumu tamamen aynı kaldı. Masaüstünde ekran/çizim aralıkları yük durumuna göre 33–83 ms'ye çıkabildi; bazı tekil maksimumlar önceki örnekten daha kötüydü. Bu yüzden tüm cihazlarda sabit 60 FPS veya her karede hızlanma iddiası yoktur. Düzeltilen somut sorunlar, 4 Hz dekoratif örnekleme, kayma boyunca FX duraklaması ve parçacık saatindeki sapmadır. Dekorasyonun daha sık çizilmesi, özellikle normal modda eski 4 Hz politikasından daha fazla güç kullanabilir; düşük performans ve azaltılmış hareket tercihleri korunur.

Kompakt sonuçlar ve 24 durum eşitliği: [animation-results.json](animation-results.json). Ham çizim/rAF zaman dizileri: çalışma alanında `../moleculox-smooth-results/animation-before.json` ve `animation-after.json`.

`npm run check`: **46 Node testi + 1 native patch fixture + 7 override/restore testi + 5 ZIP build testi geçti**. Native fixture, Xcode/IPA veya fiziksel cihaz testi değildir.

Üretilen ZIP: `Moleculox-Itch-Smooth.zip`, 88.775.154 byte (~84,66 MiB), 369 dosya. SHA256: `98b6613f56a612b4f8af1773e1d5b3e378a56991cc99c0bc9a7ea5d12029195b`. Gerçek arşivin tüm üyeleri ve `BUILD-INFO.json` dosya hash'leri doğrulandı. Türkçe Itch yükleme yönergesi ZIP'in yanında ayrı dosyadır.

### Gömülü tarayıcı depolaması

Gerçek ZIP, `localhost` üst sayfa → `127.0.0.1` oyun iframe'i biçiminde farklı site bağlamında açıldığında bu test tarayıcısı üçüncü taraf depolama iznini reddetti. Service Worker API'si güvenli bağlama rağmen `NotSupportedError: The user denied permission to use Service Worker` döndürdü; Storage Access isteği, oyun sitesi önce üst seviyede kullanılmadığı için reddedildi. Sandbox kısıtlaması eklenmemişti. Oyun açılışı ve dokunma çalıştı, fakat bu bağlamda yerel kayıt başarılı sayılmadı; mevcut kayıt uyarısı gösterildi. Testte tarayıcı gizlilik ayarları değiştirilerek kısıt aşılmadı.

Bu nedenle Itch'te her tarayıcı/gizlilik ayarında kayıt veya çevrimdışı çalışma garantisi verilmez. Oyun kökenine depolama izni verilmesi veya doğrudan o kökende açılması gerekebilir. ZIP, izin yokken oyunu açmaya devam eder ve kaydedemediğini gizlemez. Canlı Itch sunucusuna yükleme bu çalışma kapsamında yapılmadı.


### Gerçek ZIP üzerinde tamamlanan son kontroller

- Doğrudan açılış ve aynı site içindeki farklı origin/port iframe'inde normal arayüz kullanıldı; üretim yanıtlarına test API'si eklenmedi.
- Başlangıç → konuk → 801 kart → bölüm 1 → gerçek dokunma/kaydırma/iptal akışı geçti.
- İlk bölüm üç gerçek hamleyle kazanıldı. Kayıtta `cur=1`, `stars[0]=3`, `bestMoves[0]=3` doğrulandı.
- Sürüme özel Service Worker etkinleşti; isteğe bağlı medya paketi **321/321 dosya, 0 hata** ile önbelleklendi.
- Ağ emülasyonuna ek olarak gerçek yerel HTTP sunucusu kapatıldı. Oyun tekrar yüklendi; aynı ilerleme korundu, bölüm 2 açık kaldı ve bölüm 1 yeniden oynanabildi. Sıfır kırık görsel ve sıfır JavaScript çalışma zamanı istisnası.
- Farklı site/üçüncü taraf depolaması kısıtlı iframe'de oyun oynanabildi ve kayıt uyarısı görüldü; kayıt/çevrimdışı başarı iddiası yapılmadı. Bu beklenen kısıt ayrı test olarak tutuldu.

Sonuçlar: [itch-browser-smoke.json](itch-browser-smoke.json). Bu, gerçek Itch sunucusuna yapılmış bir yükleme veya canlı hesap girişi testi değildir.

Tarayıcı kontrollerini yeniden çalıştırma (Playwright/Chromium gereken isteğe bağlı testler):

```sh
VARIANT=before node tests/animation.browser.cjs
VARIANT=after node tests/animation.browser.cjs
MODE=first-party WEB_ROOT=/workspace/artifacts/Moleculox-Itch-Smooth node tests/animation.browser.cjs
MODE=smoke WEB_ROOT=/workspace/artifacts/Moleculox-Itch-Smooth node tests/animation.browser.cjs
MODE=restricted WEB_ROOT=/workspace/artifacts/Moleculox-Itch-Smooth node tests/animation.browser.cjs
```

Gerçek payload restore işlemi de son onaylı kaynaklarla çalıştırıldı; 368 dosya ve dört override hash'i doğrulandı. Düzeltmeler geri yüklemede kaybolmadı. Her restore, daha önce onaylanmamış bir kaynak değişikliğini korumak yerine işlemi durdurur; geliştirmede kasıtlı kaynak düzenlemelerinden sonra override manifesti inceleme ile güncellenmelidir.
