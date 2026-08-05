# Göktürk Akman: Kişisel Website

Sıfırdan yazılmış kişisel site. Parçacıklarla çizilen hero, iki dil, iki tema,
⌘K komut paleti, "iki doğru bir yalan" mini oyunu ve CV'yi bilen, Gemini
üstünde çalışan bir AI asistan.

Mimari kararlar ve gerekçeleri: **[plan.md](./plan.md)**

---

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000`

Asistanın çalışması için `.env.local` içine bir Gemini API anahtarı gerekiyor
([aistudio.google.com/apikey](https://aistudio.google.com/apikey), ücretsiz,
kredi kartı istemiyor). **Anahtar olmadan da site tam çalışır**: sadece
sohbet penceresi "yapılandırılmamış" der.

---

## İçeriği düzenlemek

Sitedeki her metin, link ve proje tek dosyada:

```
src/content/profile.ts
```

`TODO:` ile işaretli alanlar yer tutucudur: kendi bilgilerinle değiştir.
Tasarım dosyalarına dokunman gerekmez. Bir proje eklediğinde asistanın bilgisi,
komut paletindeki linkler ve hero'daki kayan şerit kendiliğinden güncellenir.

| Ne değiştirmek istiyorsun | Nereye bakacaksın |
|---|---|
| İsim, ünvan, tanıtım cümlesi | `identity` |
| GitHub / X / LinkedIn / YouTube | `socials` |
| Projeler | `projects` |
| İş geçmişi | `timeline` |
| Yetenekler | `stack` |
| Mini oyundaki iddialar | `quiz` |
| Asistanın ekstra bildikleri | `assistantNotes` |
| Arayüz metinleri (TR/EN) | `ui` |

Renkleri değiştirmek için: `src/app/globals.css` içindeki `:root` blokları.

---

## Klavye

| Kısayol | Ne yapar |
|---|---|
| `⌘K` / `Ctrl+K` | Komut paleti |
| `⌘J` / `Ctrl+J` | Asistanı aç/kapat |
| `Esc` | Paneli kapat |

---

## Yayına alma

**Canlı:** https://portfolio-goektuerk-s-projects.vercel.app
**Repo:** https://github.com/Gokturkakman/portfolio

Site şu an Vercel'de yayında, `vercel --prod` ile Vercel CLI üzerinden
deploy edildi. Vercel projesi henüz GitHub'a bağlı değil, yani `main`'e
her push otomatik deploy tetiklemiyor; değişiklik sonrası elle çalıştır:

```bash
vercel --prod
```

GitHub push'unu otomatik deploy'a bağlamak istersen:
[vercel.com/goektuerk-s-projects/portfolio/settings/git](https://vercel.com/goektuerk-s-projects/portfolio/settings/git)
üzerinden GitHub uygulamasını yetkilendirip repoyu bağla (bu adım tarayıcı
onayı istiyor, CLI'dan yapılamıyor).

**Ortam değişkeni:** `GEMINI_API_KEY`, Vercel proje ayarlarında henüz yok.
Asistanın canlı sitede çalışması için ekle:
[vercel.com/goektuerk-s-projects/portfolio/settings/environment-variables](https://vercel.com/goektuerk-s-projects/portfolio/settings/environment-variables)
sonra `vercel --prod` ile yeniden deploy et.

---

## Komutlar

```bash
npm run dev     # geliştirme
npm run build   # üretim derlemesi
npm start       # üretim sunucusu
npm run lint    # eslint
```

---

## Yığın

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · Canvas 2D · Gemini API
