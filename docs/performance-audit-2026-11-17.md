# Moleculox iOS — mimari ve performans incelemesi

İnceleme tarihi: 17 Kasım 2026. Depo: `WhitewayHan/Moleculox-ios`.
Ana dal `main` (depoda `master` yok), commit `11637bb5adab4941cb9101ef5c260aef61c89c38`, v8.7.238 / R392.
Düzeltme dalı: `perf/defer-offscreen-level-cards`.

İlk inceleme, kaynak dosyaları değiştirilmeden tamamlandı ve kullanıcıya raporlandı. Arşiv yalnız `/tmp/moleculox-baseline` altında açıldı; 368 dosyanın manifest hash'leri ve depoda bulunan web dosyalarının arşivle byte eşitliği doğrulandı. Aşağıdaki kaynak satırları başlangıç commit'ine aittir.

## Oyun mimarisi

- Capacitor 7, iOS WKWebView içinde statik HTML/Canvas 2D oyununu çalıştırır (`capacitor.config.json`).
- `www/index.html:39,603–631`, etkin `app-r160.css`, veri/yerelleştirme modülleri, `movement-core.js`, `game-r160.js` ve Firebase modülünü yükler. `game.js` / `app.css` eş kopyalardır; aktif giriş noktaları değildir, fakat mevcut doğrulayıcı eşitliklerini zorunlu tutar.
- `game-r160.js` yaklaşık 2,6 MB'lık ortak bir IIFE'dir. Bölüm, atom, grid, hareket, geçmiş, menü, ses, HUD, hikâye ve ekonomi durumu aynı kapsamda tutulur. Bu bağlaşım mekanik değişikliklerinde geniş regresyon riski doğurur.
- Kampanya 801 bölüm; genişleme ve bilim içeriği ayrı dosyalardan asenkron yüklenir. İpucu araması `smart-hint-worker.js` üzerinden Worker'da yürür (`game-r160.js:12645–12669`). Firebase/native auth ve profil birleştirmesi ayrı modüllerdedir.
- Canvas çizimi statik tahta önbelleği (`16049`), atom sprite önbelleği (`15970`) ve biyoloji önbelleklerini kullanır. Tahta ve tam ekran FX ayrı katmanlardır. Aktif çizim 60/isteğe bağlı 120 Hz; mobil boşta yaklaşık 4 Hz; gizli sayfada ana döngü durur (`16888–16959`).
- Dağıtımda 43 parçalı gzip payload geri yüklenir. Orijinal restore `www` klasörünü tamamen değiştirir (`scripts/restore-web-payload.py:29–30`). Sadece CSS/JS düzenlemek, Codemagic'in ilk restore adımında düzeltmenin kaybolmasına yol açardı.

## Darboğazlar ve seçim

| Aday | Kanıt ve etki | Karar |
| --- | --- | --- |
| Bölüm listesindeki ekran dışı kartların yerleşimi | `buildLevels():6153–6181`, 801 kartı ve alt öğelerini eşzamanlı oluşturur. 393×852/DPR3, tüm bölümler açık: ilk dört ölçüm 211,7 / 310,6 / 194,3 / 161,2 ms. Medyan 203,0 ms. | İncelenen senaryolar arasında en büyük ölçülen ana iş parçacığı beklemesi. Seçildi. |
| Geç bölüm tahta çizimi | Bölüm 781, 200 doğrudan çizim çağrısı: medyan 0,2 ms, p95 1,0 ms. İlk/aykırı çağrı 34,5 ms. | Mevcut önbellekler etkili; ilk tercih değil. Bu ölçüm GPU/frame süresi veya cihaz FPS'i değildir. |
| Döner oda DOM geometrisi | `syncRotatingChamberDomTap():8231`, her tahta çiziminde layout okumaları yapar; bazı yazılar aradadır. | Profilde görünür fakat kart listesi kadar büyük ölçülmedi; değiştirilmedi. |
| Atom konumları/bağ eşleştirmesi | `renderBoard():16147,16273`, geçici diziler, küçük atom sayısı için O(n²) bağ kontrolü. | Ölçüm en yüksek etkiyi göstermedi; değiştirilmedi. |
| Worker arama maliyeti | Worker'da komşu durumların kopyalanması ve hedef ötelemeleri CPU/bellek adaylarıdır. | Arka plan işi; mekanik eşdeğerliği daha geniş doğrulama ister. Değiştirilmedi. |

İlk tarayıcı denemesinde yalnız geçici CSS ile süre 87,9 / 74,7 / 61,7 / 48,1 ms'ye indi (medyan 68,2 ms, yaklaşık %66 azalma); 801 kartın tüm x/y/genişlik/yükseklik değerleri ve 12065 px grid yüksekliği aynı kaldı. Nihai tekrarlı ölçüm ve görsel test sonuçları aşağıda ayrıca verilir. Bu bir keşif ölçümüdür; evrensel cihaz performansı iddiası değildir.

## Mobil sürükleme sistemi

`game-r160.js:16964–17064`: sürekli parmak takibi yapan drag yerine, basış/bırakış arasındaki baskın yönden tek kaydırma üretilir. Atom seçimi Canvas iç pikselinden değil CSS ölçekli elips hit testinden hesaplanır. Dokunma toleransı 18 px, kalem 16 px, fare 13 px. Eşit diyagonal farkta dikey yön seçilir. Boş başlangıçta orta/bitiş noktasından seçim kurtarılır; önceki atom seçimine körlemesine dönülmez. Birincil pointer, pointer capture ve cancel temizliği vardır. Bariyer, çekiç, eğitim ve döner oda ayrı öncelik kuralları uygular. CSS `touch-action:none` sağlar (`app-r160.css:5782`).

Yaşam döngüsü riski: `lostpointercapture` işleyicisi yoktur; bölüm/suspend geçişinde `pd` açıkça sıfırlanmaz. Kaybolmuş bırakış ve değişen atom listesi eski indeks bırakabilir; `move():12148` üst indeks sınırı kontrolü yapmadan `atoms[i].frozen` okur. Bu yarış yeniden üretilmedi; kesin çökme olarak sunulmuyor.

## Çökme ve donma riskleri

- **Belirli JavaScript hata yolu:** Online rövanşın pointer işleyicisi (`10467`) `await` sonrasında `e.currentTarget.disabled=false` kullanır. Dispatch bitince `currentTarget` null olur. Başarısız cevapta TypeError/kapalı kalan düğme riski; EventTarget/Event ile null davranışı doğrulandı. Gerçek online maç/backend ile uçtan uca yeniden üretilmedi. Native crash kanıtı değildir.
- **Çizim döngüsü:** RAF kimliği `16889`'da temizlenip sonraki kare `16958`'de planlanır. Aradaki yakalanmayan çizim istisnası döngüyü açık bir wake gelene kadar durdurabilir. Context null/kayıp durumlarında toparlama yoktur (`8065,8069,16483`). Gerçek WKWebView context/bellek baskısı cihazda test edilmelidir.
- **Uzun oturum belleği:** Bölüm boyunca `hist` ve `moveLog` üst sınır olmadan büyür (`12159,12185`); karmaşık mekanikler tüm durum snapshot'larını tutar. Bölüm başlangıcında sıfırlanır (`11481`). OOM gözlenmedi.
- **Eksik restore:** Ham checkout'ta birçok referans dosyası yoktur. İlk `npm run check`, eksik `story-502-801-r282.js` nedeniyle durdu. Doğrulanmış tam baseline restore sonrasında mevcut 15 Node testi ve 1 native fixture testi geçti.

Bu riskler talep edilen tek performans değişikliğinin kapsamına alınmadı.

## Uygulanan tek performans düzeltmesi

```css
#lvGrid > .lvBtn { content-visibility: auto; }
```

Tarayıcı görünmeyen kartların iç layout/paint işini erteler. İlk CSS denemesi görünür kartların raster çıktısını değiştirdiği için tek başına kabul edilmedi. Küçük, ayrı bir DOM gözlemcisi, kaydırma alanına 200 px yaklaşan kartları `content-visibility:visible` yapar ve gözlemden çıkarır; klavye odağı da aynı geçişi eşzamanlı yapar. Böylece görünür kartlar orijinal çizim yolunu kullanır. Liste yeniden kurulduğunda eski gözlemler temizlenir; IntersectionObserver bulunmazsa tüm kartlar görünür bırakılır. 801 düğmenin oluşturulması, sırası, aria-label'ları, mevcut olay işleyicileri, kilit kuralları, kare boyutlandırması ve kaydırma korunur. Oyun IIFE'sinin orijinal byte'ları değişmez; gözlemci iki JS eş kopyasına dışarıdan eklenir. Hareket/fizik, bölüm verisi ve ekonomi değiştirilmez. Desteklemeyen WebKit sürümleri CSS özelliğini yok sayıp önceki davranışı kullanır. Fiziksel iPhone'da fayda miktarı henüz ölçülmedi.

Ek iki CSS eş kopyasında da bulunur. `scripts/web_bundle_patches.py`, değişmez payload doğrulandıktan sonra staging alanında yalnız kesin CSS ve DOM gözlemcisi eklerini uygular. Verifier, dört dosyada kesin ekleri zorunlu tutar ve ekler çıkarıldıktan sonra orijinal manifest hash'lerini kontrol eder. Binary payload/manifeste dokunulmadı. Dört hedef için birlikte ön doğrulama, idempotence ve bozulma testleri eklendi. Bu paketleme değişiklikleri aynı düzeltmenin release'e taşınması içindir.

## Doğrulama ve yeniden çalıştırma

```sh
bash scripts/restore-www.sh
npm run check
node tests/level-grid.browser.cjs
```

Tarayıcı testi için Node `playwright` paketi, Python Pillow ve Chromium gerekir; bu ortamda hazır bulundular. Harici Firebase istekleri testte engellenir; bulut yazımı yapılmaz. Test API'si sadece HTTP route yanıtına eklenir, üretim kodunda test kancası yoktur. Chrome testi iOS Safari/WKWebView ölçümü değildir; Xcode/IPA ve gerçek Apple/Google oturum açma çalıştırılmadı.

- Baseline (tam restore): kaynak/bundle doğrulaması + 15 Node + 1 native fixture başarılı.
- Düzeltme: kaynak/bundle doğrulaması + 21 Node (6 gözlemci testi dahil) + 1 native fixture + 7 paketleme testi başarılı.
- Gerçek payload iki kez geri yüklenerek dosya hash'lerinin aynı kaldığı doğrulanır; 368 dosya, yalnız iki CSS ve iki JS eş kopyasında kesin ekler.
- Nihai tarayıcı ölçümleri ve çıktılar: aşağıdaki sonuç eki.


## Nihai önce/sonra sonuçları

Chromium 156.0.8078.79, Node 24.22.1; 393×852 CSS px, DPR 3; CDP ile 4× CPU yavaşlatması. Tüm 801 bölüm açık. İki ısınma koşusundan sonra her sürüm için 12 ölçüm; baseline/candidate sırası dönüşümlü. Aynı içerik, kayıt ve tarayıcı ayarları kullanıldı. Ana sürüm, bağımsız orijinal dizinden sunuldu; JS/CSS SHA256 değerleri orijinal manifest ile ayrıca doğrulandı. Varsayılan test komutu da tanımlı ekleri çıkarıp orijinal hash'leri doğrulayarak aynı baseline'ı üretir.

| Ölçüt (medyan) | Önce | Sonra | Azalma |
| --- | ---: | ---: | ---: |
| Yeniden kurma + zorunlu yerleşim sonrası iki rAF callback'ine kadar | 2170,80 ms | 681,35 ms | %68,61 |
| `scrollHeight` okumasıyla zorlanan style/layout bölümü | 974,55 ms | 74,95 ms | %92,31 |
| CDP LayoutDuration farkı | 750,234 ms | 81,9995 ms | %89,07 |
| CDP TaskDuration farkı | 2191,8145 ms | 778,0035 ms | %64,50 |

İki rAF ölçütünün p95'i 3126,4 → 943,8 ms. Bu ölçüt DOM yeniden kurulması, yerleşim, gözlemci işi ve sonraki iki animasyon callback'ine kadar geçen duvar süresidir; saf paint süresi veya FPS değildir. Sayılar CPU yavaşlatmalı laboratuvar senaryosuna aittir; gerçek iPhone kazancı diye yorumlanmamalıdır. İlk keşif koşularındaki yavaşlatmasız, yalnız CSS içeren deneme ile doğrudan kıyaslanmaz.

Tarayıcı regresyonları:

- 320×852, 393×852, 430×852, 852×393 yatay ve 393×852 büyük yazı; her biri yeni oyuncu ve 801 bölüm açık durumunda test edildi.
- 8010 kart karşılaştırmasında x/y/genişlik/yükseklik, kaydırma yüksekliği ve erişilebilir düğme adları birebir aynı. Klavye ile son karta odaklanma ve görüntüye kaydırma geçti.
- Başlangıç/orta/son listeler için 30 görüntü çifti, 60 PNG. 23 çift byte düzeyinde aynı. Kalanlarda rozet kenarlarındaki raster farkı: en çok %0,2217 piksel, ortalama kanal hatası en çok 0,005012/255, tek kanal farkı en çok 32/255. Test sınırları sırasıyla %0,5, 0,015/255 ve 32/255; geometri/ad eşitliğine tolerans uygulanmadı. Tüm görüntüler için bit düzeyinde eşitlik iddia edilmiyor.
- İlk ve 801. bölüm doğru açıldı; kilitli kart açılmadı; 30 px liste sürüklemesi tıklama oluşturmadı.
- Gerçek CDP dokunma girdileriyle yukarı/sağ/aşağı/sol, dokunma ve iptal sonrasında atomlar/hamleler/seçim/kazanma durumu baseline ile aynı. Yukarı başka atomda, sol ve aşağı duvarda durma ayrıca doğrulandı. Liste sürükleme eşiği kontrolü sentetik PointerEvent kullanır.
- Sıfır JavaScript çalışma zamanı istisnası. Harici Firebase istekleri engellendi; gerçek hesap veya bulut verisi değiştirilmedi.

Ham 24 ölçüm, özetler, ortam, kaynak hash'leri ve etkileşim durumları: [performance-results.json](performance-results.json). Çalıştırma logları ve PNG'ler çalışma alanında `../moleculox-audit-results/` altındadır. Xcode/IPA derlemesi, fiziksel iPhone termal/bellek profili ve canlı çok oyunculu maç bu Linux ortamında çalıştırılmadı.
