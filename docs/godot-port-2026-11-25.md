# Moleculox — Godot Web taşıması, 25 Kasım 2026

Çalışma dalı: `feat/godot-port`. Temel, daha önce üzerinde çalışılan `af91729` / `8.7.239-web-smooth1` sürümüdür. Ana dal değiştirilmedi. Bu çıktı gerçek Godot 4.6.3 Web oyunudur; eski HTML oyununu bir WebView içinde çalıştırmaz.

## Yapı ve içerik

- `Catalog`: özgün kaynaktan çıkarılan 801 kampanya bölümü, 832 günlük havuz girdisi, 11 dil, hikâyeler, Nobel ve 801 final sayfaları, moleküller, ses ve efekt tarifleri.
- `MoleculeRules` / `MovementGroups`: kayma, portallar, rift, bağlı/yapışkan atomlar, buz/ateş/zombi/şimşek/kırılganlık, rijit modüller, Fusion, basınç kapıları, hareketli duvarlar, dönüş alanları, replikatör, foton, sentezleyici, itici çekirdek ve döner odalar.
- `MoleculoxSession`: hamle geçmişi, geri alma, araçlar, ipucu araması ve çözüm oynatma, süre/puan/yıldız, Chain/Reactor ve günlük deney akışı.
- Yerel Godot ekranları: stüdyo/açılış, menü, oyuncular, bölüm listesi, hikâye, tahta/HUD, koleksiyon, eğitim, laboratuvar, ödüller, ayarlar, yerel ve çevrimiçi düello.
- `Progress` / `Economy`: özgün kayıt anahtarları, profil kimliği, şema geçişleri, yedek, atomik yazım, para muhasebesi ve ipucu iadesi.
- Bulut köprüsü: özgün Firebase modülleri korunur. Profil/bulut cevapları hesap ve profil değişimlerinde denetlenir; ödüller yalnızca gerçek sunucu cevabıyla doğrulanır. Masaüstü hesap işlemleri için ayrıca yerel Firebase adaptörü gerekir.

## Görünüm ve akıcılık

544 PNG/WebP dosyası kaynak dosyalarla byte düzeyinde aynı paketlendi. Atomlar, taşlar ve enzim çizimleri özgün Canvas çizimlerinden alınan dokuları kullanır. Efekt tarifleri GDScript'e taşındı; özgün 90/185/330 ms tamamlama sırası bağlandı. Profesör sesleri dil/olay, karıştırma sırası, bekleme ve ses düzeyi kurallarıyla taşındı.

Tarayıcıdaki özgün efekt/animasyon çalışmasının önce/sonra sonuçları [önceki rapordadır](itch-smoothness-2026-11-18.md). Orada mobil efekt boşlukları L1'de 183→33 ms, portal L40'ta 150→17 ms, L781'de 117→17 ms ölçülmüştü. Bunlar HTML sürümünün aynı senaryodaki ölçümleridir; Godot için FPS kazancı olarak sunulmaz.

Godot paketleme karşılaştırması:

| Ölçüm | İlk standart Godot kaynak paketi | Özgün görsel byte'larıyla paket |
|---|---:|---:|
| Kaynak ZIP boyutu | 365.526.300 byte | 118.958.790 byte |
| Azalma | — | %67,46 |
| Kaynak görseller | Godot lossless dönüştürmesi | 544/544 aynı byte |

Standart dönüştürme, küçük WebP dosyalarını büyük lossless dokulara çeviriyordu. Görselleri yeniden sıkıştırmadan özgün dosyaları Godot `ImageTexture` olarak okumak bu artışı kaldırdı. Kullanılmayan hikâye dokularının kalıcı olarak bellekte tutulmasını önlemek için ortak doku önbelleği zayıf referans kullanır. Bu ölçüm paket boyutudur; donanımdan bağımsız 60 FPS garantisi değildir.

## Hata düzeltmeleri

Rusça içerik paketinde, güncellenmiş hedeflerle uyuşmayan 44 molekül kaydının geometri/bağ alanları doğrulanmış kaynak hedefleriyle eşitlendi; Rusça metinler korundu. Değişiklik listesi `godot/data/contentCorrections.json` içindedir.

Boş tarayıcı kayıtlarının JSON hata üretmesi, bağ imzalarının `Set` içeriği kaybedilerek aktarılması, ilk tahta arka planının boş kalması, bölüm adında `{0}` görünmesi ve eski hikâye kayıtlarının indeks farkı giderildi. Tarayıcı geçici belleğine yazmak tek başına kalıcı kayıt başarısı sayılmaz.

## Doğrulama

| Test | Sonuç |
|---|---|
| JavaScript'e karşı yerel kurallar | 70.204 kontrol, 0 fark; 801/801 tam çözüm hedefte |
| Oyuna özgü ek kurallar | 19 kontrol, 0 hata |
| Oturum / UTC günlük / Chain / Reactor / yerel düello | 2.427 kontrol, 0 hata |
| Tahta çizimi | 1.250 kampanya/mod tahtası ve 801 ilk hareket yolu |
| Ses | 4.296 kontrol, 0 hata; 11 dil ve 484 MP3 kesiti |
| Özgün ilk 501 efekt tarifi | 15.063 parçacık, 3.006 bağ; 0 fark |
| Efekt çizimi | 9 imza şekli, 13 parçacık ailesi |
| Ana ekran→hikâye→zafer→kayıt / geri alma / modlar | 29 kontrol, 0 hata |
| Kayıt, ekonomi, bulut köprüsü, hesap eşleme, çevrimiçi düello | Yerel/mok testleri geçti; canlı hesap yazımı yapılmadı |

Çalıştırılan ana komutlar:

```sh
python3 scripts/verify-godot-content.py
node scripts/test-godot-rules.mjs
node scripts/test-godot-session.mjs
godot --headless --path godot --script res://tests/test_main_flow.gd
godot --headless --path godot --script res://tests/test_all_boards.gd
godot --headless --path godot --script res://tests/test_audio_fidelity.gd
godot --headless --path godot --script res://tests/test_fx_fidelity.gd
godot --headless --path godot --script res://tests/test_fx_bonds.gd
node --test godot/tests/test_cloud_adapter.mjs
FULL=1 INTERACTIVE=1 OFFLINE=1 node tests/godot.browser.cjs
python3 scripts/build-godot-web.py
```

Chrome mobil dokunma testinde paket `/html/12345/` altından, ayrı originli iframe'de ve COOP/COEP olmadan açıldı. İptal edilen dokunma sonrasında üç gerçek sürükleme L1'i 3 yıldız/3 hamleyle tamamladı; `cur=1` kaydedildi. Yeniden yükleme kaydı korudu. Tüm oyun dosyaları isteğe bağlı çevrimdışı önbelleğe indirildi; HTTP sunucusu kapatıldıktan sonra gerçek Godot oyunu tekrar açıldı ve ilerleme korundu. Harici Firebase erişimi testte bilerek engellendi; gerçek hesap/giriş ve canlı rakip akışı bu tarayıcı testinde doğrulanmış sayılmaz.

## Itch paketi ve sınırlar

Yüklenecek dosya `Moleculox-Godot-Itch.zip` olmalıdır. `index.html` ZIP'in kökündedir. Godot editör projesi ZIP'i HTML oyun yüklemesi için uygun değildir. Itch'te proje türü HTML ve dosya için “This file will be played in the browser” seçilmelidir. Çıktı tek iş parçacıklı Compatibility/WebGL2 kullanır; SharedArrayBuffer/COOP/COEP gerektirmez.

Yeni Godot paketi tarayıcıda test edildi; kullanıcının canlı itch sayfasına yüklenmedi. Önceki Smooth ZIP'in kullanıcının sayfasındaki hatasının kesin nedeni, aynı paketin çalıştırıldığı sayfa/hata bilgisi olmadan doğrulanmadı. Yeni paketin başarısı, o eski hatanın nedenini kanıtlamaz.

Bu bir Godot Web test sürümüdür. İçerik ve hareket kuralları geniş biçimde doğrulandı; her ekranın piksel düzeyinde eşitliği, bütün avatar mikro animasyonları, gerçek iPhone/Safari performansı ve canlı Firebase düellosu için ayrıca cihaz/hesap doğrulaması gerekir. Hareketle değişen bazı temas sesleri genel örneği kullanır; tüm element çiftlerinin ses parametreleri için birebirlik iddiası yoktur.
