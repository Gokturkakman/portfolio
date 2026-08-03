# Kişisel Website — Mimari Plan

**Göktürk Akman** · Ink & Ember

---

## 1. Görev ve karar özeti

Brief üç soru soruyordu. Cevaplar:

| Soru | Karar |
|---|---|
| Hangi linkler / projeler? | GitHub, X, LinkedIn, YouTube, e-posta + 3 proje kartı. Hepsi tek dosyadan (`src/content/profile.ts`) besleniyor. |
| Görsel olarak nasıl planladın? | "Ink & Ember" — sıcak isli-siyah zemin, kor turuncusu vurgu, editöryel serif başlıklar. Detay §3'te. |
| Seni anlatan özel öğe? | Dört tane: parçacık hero, "iki doğru bir yalan" mini oyunu, CV'ni bilen AI asistan, mikro-etkileşim paketi. |

---

## 2. Teknoloji seçimi ve gerekçesi

| Katman | Seçim | Neden |
|---|---|---|
| Çatı | Next.js 16 (App Router, Turbopack) | Asistan için sunucu tarafı route handler'a ihtiyaç var — API anahtarı tarayıcıya asla düşmemeli. Statik sayfa + tek dinamik uç nokta ideal eşleşme. |
| Dil | TypeScript | İçerik modeli (`Localized`, `Project`, `QuizItem`) tip güvenli; içerik düzenlerken yazım hatası derlemede yakalanıyor. |
| Stil | Tailwind v4 + CSS değişkenleri | Renk/hareket tokenları `:root` içinde tek yerde. Tema değişimi tek bir `data-theme` niteliğiyle oluyor, JS'te renk hesabı yok. |
| Animasyon | Framer Motion | Layout animasyonları (nav'daki aktif çizgi), giriş/çıkış (`AnimatePresence`) ve yükseklik geçişleri için. |
| Parçacıklar | **Ham Canvas 2D** (Three.js değil) | Bkz. §4 — bilinçli bir karar. |
| LLM | `@anthropic-ai/sdk`, `claude-opus-5` | Streaming yanıt, sistem promptu önbelleğe alınmış. Model `.env` ile değiştirilebilir. |

**Bilerek kullanılmayanlar:** hazır tema, UI kütüphanesi (shadcn vb.), state yöneticisi, i18n paketi. Sitenin tamamı ~10 bileşen; bir bağımlılığın maliyeti faydasından büyük olurdu.

---

## 3. Tasarım yönü — "Ink & Ember"

### Neden bu palet

Portfolyo sitelerinin varsayılanı hâline gelen iki tuzak var: **mavi-siyah üstüne neon cyan** ve **beyaz üstüne mor gradient**. İkisi de artık "şablon" gibi okunuyor. Bunun yerine:

- **Zemin:** `#080807` — mavi değil, *sıcak* isli siyah. Yanına konan turuncu doğal duruyor.
- **Vurgu:** kor turuncusu `#e8853a` + safran `#f2c14e`. Nadir, sıcak, dikkat çekiyor ama bağırmıyor.
- **Metin:** `#f4efe6` — saf beyaz değil, kâğıt beyazı. Koyu zeminde göz yormuyor.
- **Açık tema:** aynı palet "mürekkep üstü kâğıt" olarak yeniden okunuyor (`#f6f2ea` zemin, koyu kiremit vurgu). Bir renk şemasının negatifi değil, ayrı ayarlanmış ikinci bir tema.

### Tipografi

| Rol | Yazı tipi | Neden |
|---|---|---|
| Başlık | Instrument Serif | Editöryel, karakterli, ücretsiz. İtalik kesimi vurgu kelimeleri için kullanılıyor (*"biri **yalan**"*). |
| Gövde | Geist | Nötr, yüksek okunabilirlik, Türkçe diyakritikleri tam. |
| Meta | Geist Mono | Yıllar, etiketler, bölüm numaraları. Ölçülü bir "mühendislik" tonu katıyor. |

### Doku ve derinlik

Düz siyah zemin ucuz görünüyor. İki katman ekleniyor:
1. **Grain** — SVG `feTurbulence` ile üretilen, sabit konumlu, ~%5 opaklıkta gürültü.
2. **Kor ışığı** — hero'nun arkasında çok kısık radyal degrade.

> **Not:** Grain katmanında `mix-blend-mode` **bilerek** kullanılmıyor. Tam ekran sabit bir katmanda blend modu tüm sayfayı tek bir kompozisyon katmanına zorluyor; geliştirme sırasında bazı ortamlarda sayfanın hiç boyanmadığı görüldü. Düz opaklık aynı dokuyu risksiz veriyor.

---

## 4. Parçacık hero — neden Three.js değil

Brief "WebGL parçacık" diyordu; ham **Canvas 2D** tercih edildi.

**Nasıl çalışıyor** (`src/components/ParticleName.tsx`):

```
1. İsim, görünmeyen bir canvas'a çizilir
2. Piksel verisi 2px aralıkla taranır → dolu her piksel bir "hedef"
3. Parçacıklar ekran dışından doğar, sönümlü yayla hedeflerine oturur
4. İmleç yaklaşınca itilir, uzaklaşınca geri toplanır
5. Hızlı parçacıklar kor rengine kayar — hareket görünür olur
```

**Gerekçe:**

- Three.js bu efekt için ~150 kB gzip ek yük getirirdi; kazanç sıfır (sahne 2 boyutlu).
- ~3000 parçacık `fillRect` ile 60 fps'te kolayca çiziliyor.
- Canvas boyutu `devicePixelRatio` ile ölçekleniyor (retina'da net), üst sınır 2 (4K'da gereksiz piksel yok).

**Kenar durumları ele alındı:**

| Durum | Davranış |
|---|---|
| `prefers-reduced-motion` | Animasyon yok; parçacıklar doğrudan hedeflerinde statik çiziliyor. |
| Sekme arka planda | `visibilitychange` ile döngü duruyor — pil yakmıyor. |
| Ekran yeniden boyutlanıyor | 140 ms debounce ile yeniden kurulum; parçacıklar mevcut konumlarından devam ediyor. |
| Yazı tipi geç yükleniyor | `document.fonts.ready` sonrası yeniden örnekleme (metin ölçüsü değişiyor). |
| Tema değişiyor | `MutationObserver` renkleri tazeliyor. |
| Ekran okuyucu / JS kapalı | Canvas `aria-hidden`; yanında `sr-only` gerçek metin var. |

**Ayar notu:** İlk sürümde itme kuvveti çok yüksekti (`3400`) ve parçacıklar savrulup isim okunmaz hâle geliyordu. Kuvvet `210`'a düşürüldü ve kare başına ivmeye tavan (`MAX_IMPULSE`) kondu.

---

## 5. Sayfa mimarisi

```
src/
├─ app/
│  ├─ layout.tsx          Yazı tipleri, metadata, tema bootstrap script'i
│  ├─ page.tsx            Bölümlerin sırası
│  ├─ globals.css         Tasarım sistemi (tokenlar, yüzeyler, animasyonlar)
│  └─ api/chat/route.ts   Asistan — streaming, hız sınırı, hata yönetimi
│
├─ content/
│  └─ profile.ts          ★ TEK KAYNAK — tüm metin, link, proje, oyun içeriği
│
├─ lib/
│  ├─ app-state.tsx       Dil + tema + panel durumu, klavye kısayolları
│  └─ assistant-prompt.ts profile.ts → sistem promptu
│
└─ components/
   ├─ ParticleName.tsx    Hero parçacık alanı
   ├─ motion-primitives   Reveal, Magnetic, Cursor, ScrollProgress
   ├─ Nav / Section       İskele
   ├─ ChatDock            Asistan paneli
   ├─ CommandPalette      ⌘K
   └─ sections/           Hero, About, Work, Path, Play, Contact
```

### Neden tek içerik dosyası

Bir portfolyo sitesinin ömrü boyunca değişen şey **içeriktir**, tasarım değil. `profile.ts` bunu ayırıyor: yeni proje eklemek bir dizi elemanı eklemek demek; asistanın sistem promptu, komut paletindeki linkler ve hero'daki kayan şerit hepsi kendiliğinden güncelleniyor. İki yerde tutulan hiçbir bilgi yok.

### Dil desteği

`Localized = { tr: string; en: string }` tipi ve tek bir `tr()` çözücü. i18n kütüphanesi yok:
- Sözlük dosyası + anahtar yönetimi gerekmiyor; metin bağlamının yanında duruyor.
- Eksik çeviri **derleme hatası** — çalışma zamanında `undefined` gösterilemez.
- Dil değişimi anında; sayfa yenilenmiyor, URL değişmiyor.

---

## 6. Asistan ("Bana beni sor")

```
Tarayıcı                     Sunucu (Next route handler)      Anthropic
   │                                  │                           │
   ├── POST /api/chat ───────────────►│                           │
   │   {messages, lang}               ├─ hız sınırı (12/dk/IP)    │
   │                                  ├─ mesaj kırpma (24 × 1200) │
   │                                  ├─ profile.ts → sistem promptu
   │                                  ├─ messages.stream() ──────►│
   │◄─── text/plain akış ─────────────┤◄──── text_delta ──────────┤
   └─ token token ekrana yazılır      │                           │
```

**Kararlar:**

- **Anahtar yalnızca sunucuda.** `ANTHROPIC_API_KEY` hiçbir zaman istemciye gitmiyor.
- **Sistem promptu `profile.ts`'ten üretiliyor.** Elle tutulan ikinci bir "bio" kopyası yok — içerik güncellenince asistan da güncelleniyor.
- **`cache_control: ephemeral`** sistem promptunda: her istekte aynı olduğu için hem ucuzluyor hem ilk token daha hızlı geliyor.
- **`effort: "low"`** — kısa biyografik cevaplar için yeterli; gecikmeyi ve maliyeti düşürüyor.
- **Hız sınırı** basit, bellek içi bir sayaç. Tek sunucu örneği için yeterli; birden fazla örnekte Upstash gibi harici bir sayaç gerekir (kodda not düşüldü).
- **Prompt enjeksiyonuna karşı:** sistem promptu, ziyaretçi metnini talimat olarak kabul etmemesini açıkça söylüyor.
- **Anahtar yoksa** site tamamen çalışıyor; sadece sohbet penceresi "yapılandırılmamış" diyor. Demo hiçbir koşulda kırılmıyor.

---

## 7. Mini oyun — "İki doğru bir yalan"

Klasik bir hafıza/refleks oyunu yerine **seni anlatan** bir mekanik seçildi: her turda üç iddia, ikisi doğru biri yalan. Oyuncu yalanı bulmaya çalışıyor, her turun sonunda kısa bir açıklama çıkıyor.

Neden bu: brief "sana özel" diyordu. Snake herkeste aynı; bu oyun oynandıkça ziyaretçi seni gerçekten tanıyor. Doğru iddialar aynı zamanda asistanın sistem promptuna besleniyor — tek içerik iki işe yarıyor.

---

## 8. Erişilebilirlik ve performans

- `prefers-reduced-motion`: parçacıklar, reveal'lar, özel imleç ve marquee — hepsi kapanıyor, içerik yerinde kalıyor.
- Özel imleç yalnızca `(hover: hover) and (pointer: fine)` cihazlarda; dokunmatikte varsayılan davranış bozulmuyor.
- Odak halkası `:focus-visible` ile — klavye kullanıcısına görünür, fare kullanıcısını rahatsız etmiyor.
- Tema, React devreye girmeden `<head>` içindeki küçük bir script ile uygulanıyor → yanlış temada tek kare bile yanıp sönme yok.
- Tüm ikonlar `lucide-react`'ten ağaç sarsmalı; ~10 ikon geliyor.
- Sayfa statik üretiliyor; yalnızca `/api/chat` dinamik.

### Bir tuzak ve çözümü

Standart `initial={{opacity: 0}} + whileInView` deseninin sessiz bir hatası var: sayfa `#work` gibi bir bağlantıyla ortadan açılırsa ya da gözlemci geç kurulursa, ekranda olan bloklar **kalıcı olarak görünmez** kalabiliyor. Geliştirme sırasında bu birebir yaşandı.

`Reveal` bileşeni buna karşı tasarlandı: sunucuda ve ilk boyamada her şey görünür; bağlandıktan sonra blok hâlâ ekranın altındaysa animasyon kuruluyor, değilse hiç çalışmıyor. İçerik hiçbir senaryoda gizli kalamaz.

---

## 9. Kurulum

```bash
npm install
cp .env.example .env.local     # ANTHROPIC_API_KEY'i doldur
npm run dev
```

Yayına almak için: repoyu Vercel'e bağla, `ANTHROPIC_API_KEY` ortam değişkenini ekle.

---

## 10. Bilinçli olarak yapılmayanlar

| Yapılmadı | Neden |
|---|---|
| Blog / CMS | Brief istemiyordu. Ekleme noktası hazır: `content/` altına yeni bir dizi. |
| Sohbet geçmişinin kalıcılığı | Ziyaretçi oturumu geçici; veritabanı bu ölçekte gereksiz karmaşa. |
| Analitik | Gizlilik tercihi kullanıcıya ait. Vercel Analytics tek satırla eklenebilir. |
| Test paketi | Statik bir portfolyo için maliyet/fayda oranı düşük. Kritik mantık (parçacık örnekleme, hız sınırı) izole ve saf. |

---

## 11. Doğrulama durumu

| Alan | Durum |
|---|---|
| `tsc --noEmit` | ✅ hatasız |
| `next build` | ✅ başarılı |
| Hero + About görsel | ✅ tarayıcıda doğrulandı |
| Work / Path / Play / Contact | ✅ DOM ve hesaplanmış stil üzerinden doğrulandı |
| `/api/chat` anahtarsız (503) | ✅ doğrulandı |
| `/api/chat` canlı streaming | ⚠️ **doğrulanmadı** — makinede Anthropic anahtarı yok. Anahtar eklendikten sonra ilk çalıştırmada kontrol edilmeli. |
