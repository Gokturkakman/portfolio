/**
 * ============================================================================
 *  TEK KAYNAK / SINGLE SOURCE OF TRUTH
 * ============================================================================
 *  Sitedeki her metin, link ve proje burada. Tasarıma dokunmadan içeriği
 *  buradan değiştirebilirsin.
 *
 *  ⚠️  `TODO:` ile işaretli alanlar YER TUTUCU (placeholder). Gerçek bilgilerinle
 *      değiştir. Değiştirmediğin sürece site çalışır ama seni anlatmaz.
 * ============================================================================
 */

export type Lang = "tr" | "en";
export type Localized = Record<Lang, string>;

const t = (tr: string, en: string): Localized => ({ tr, en });

/* -------------------------------------------------------------------------- */
/*  KİMLİK                                                                     */
/* -------------------------------------------------------------------------- */

export const identity = {
  /** Hero'da parçacıklarla çizilen isim. Kısa tut — 2 kelime ideal. */
  name: "Göktürk Akman",
  /** Parçacık efekti için baş harfler (mobilde tam isim yerine bu kullanılır) */
  initials: "GA",
  role: t(
    // TODO: kendi ünvanın
    "Yapay Zekâ & Ürün Geliştirici",
    "AI & Product Engineer",
  ),
  /** Hero'nun altındaki tek cümlelik iddia. En önemli cümle — buna zaman ayır. */
  tagline: t(
    // TODO
    "Fikirden çalışan ürüne giden yolu kısaltan araçlar kuruyorum. Çoğunlukla LLM'lerle, her zaman detaya takıntılı.",
    "I build tools that shorten the road from idea to working product. Mostly with LLMs, always obsessed with the details.",
  ),
  location: t("İstanbul, Türkiye", "Istanbul, Türkiye"),
  /** Şu an ne yapıyorsun — navbar'daki canlı rozet */
  status: t(
    // TODO
    "Exposure AI'da ürün geliştiriyorum",
    "Building products at Exposure AI",
  ),
  email: "ozanakman@hotmail.com",
  /** İndirilebilir CV. public/ altına koy, yoksa null bırak (buton gizlenir). */
  resume: null as string | null, // örn: "/gokturk-akman-cv.pdf"
};

/* -------------------------------------------------------------------------- */
/*  LİNKLER                                                                    */
/* -------------------------------------------------------------------------- */

export type SocialKey =
  | "github"
  | "x"
  | "linkedin"
  | "youtube"
  | "instagram"
  | "email";

export type Social = {
  key: SocialKey;
  label: string;
  href: string;
  handle: string;
};

/**
 * Kullanmadığın satırı sil — site otomatik uyum sağlar.
 * TODO: hepsindeki kullanıcı adlarını kendi hesaplarınla değiştir.
 */
export const socials: Social[] = [
  {
    key: "github",
    label: "GitHub",
    href: "https://github.com/gokturkakman",
    handle: "@gokturkakman",
  },
  {
    key: "x",
    label: "X",
    href: "https://x.com/gokturkakman",
    handle: "@gokturkakman",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/gokturkakman",
    handle: "in/gokturkakman",
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@gokturkakman",
    handle: "@gokturkakman",
  },
  {
    key: "email",
    label: "E-posta",
    href: `mailto:${identity.email}`,
    handle: identity.email,
  },
];

/* -------------------------------------------------------------------------- */
/*  HAKKIMDA                                                                   */
/* -------------------------------------------------------------------------- */

export const about = {
  heading: t("Kısaca", "In short"),
  /** 2–3 paragraf. İlk cümle en önemlisi. */
  paragraphs: [
    t(
      // TODO
      "Yazılıma erken yaşta merakla başladım, sonra bu merak yapay zekâya kaydı. Bugün çoğunlukla dil modellerinin üstüne oturan ürünler kuruyorum: sohbet arayüzleri, ajanlar, otomasyonlar.",
      "I got into software early out of curiosity, and that curiosity drifted toward AI. These days I mostly build products on top of language models: chat interfaces, agents, automations.",
    ),
    t(
      // TODO
      "İşin ilgimi çeken kısmı modelin kendisi değil, etrafındaki her şey: bir aracın ne zaman çağrılacağı, hatanın kullanıcıya nasıl anlatılacağı, bir animasyonun kaç milisaniye süreceği. Ürünü ürün yapan şey orada saklı.",
      "The part that interests me isn't the model itself — it's everything around it: when a tool should fire, how an error gets explained to a person, how many milliseconds an animation should take. That's where a product becomes a product.",
    ),
    t(
      // TODO
      "Boş vaktimde küçük araçlar yazıyor, okuduklarımı not alıyor ve arada bir bunları paylaşıyorum.",
      "In my spare time I write small tools, take notes on what I read, and occasionally share them.",
    ),
  ],
  /** Sağdaki "hızlı bilgi" kartı — 4 satır ideal */
  facts: [
    { k: t("Konum", "Location"), v: identity.location },
    { k: t("Odak", "Focus"), v: t("LLM ürünleri, arayüz", "LLM products, interfaces") },
    { k: t("Diller", "Languages"), v: t("Türkçe, İngilizce", "Turkish, English") },
    { k: t("Şu an", "Currently"), v: t("Yeni projeler açığım", "Open to new projects") },
  ],
};

/* -------------------------------------------------------------------------- */
/*  PROJELER                                                                   */
/* -------------------------------------------------------------------------- */

export type Project = {
  id: string;
  title: string;
  year: string;
  /** Kartta görünen tek satır */
  summary: Localized;
  /** Açılınca görünen detay */
  detail: Localized;
  tags: string[];
  href?: string;
  repo?: string;
  /** Kartın arkasındaki degrade — 2 hex rengi */
  accent: [string, string];
  featured?: boolean;
};

/** TODO: kendi projelerinle değiştir. 3–6 proje ideal. */
export const projects: Project[] = [
  {
    id: "chatbot",
    title: "Exposure Chatbot",
    year: "2026",
    summary: t(
      "Claude API üstüne kurulu, araç kullanabilen sohbet asistanı.",
      "A tool-using chat assistant built on the Claude API.",
    ),
    detail: t(
      "Streaming yanıtlar, kalıcı konuşma geçmişi ve araç çağırma döngüsü. Next.js route handler'ları üstünde çalışıyor; state Postgres'te tutuluyor.",
      "Streaming responses, persistent conversation history, and a tool-calling loop. Runs on Next.js route handlers with state in Postgres.",
    ),
    tags: ["Next.js", "Claude API", "Postgres", "TypeScript"],
    accent: ["#E8853A", "#F2C14E"],
    featured: true,
  },
  {
    id: "portfolio",
    title: "gokturk.dev",
    year: "2026",
    summary: t(
      "Sıfırdan yazılmış, parçacık hero'lu, kendi kendini anlatan portfolyo.",
      "A hand-built portfolio with a particle hero that explains itself.",
    ),
    detail: t(
      "Canvas 2D üstünde çalışan parçacık alanı, ⌘K komut paleti, iki dilli içerik ve beni tanıyan bir asistan. Hiçbir hazır tema kullanılmadı.",
      "A Canvas-2D particle field, a ⌘K command palette, bilingual content, and an assistant that knows me. No off-the-shelf theme.",
    ),
    tags: ["Next.js", "Canvas", "Framer Motion"],
    repo: "https://github.com/gokturkakman", // TODO
    accent: ["#2E7D6E", "#7FC9B4"],
    featured: true,
  },
  {
    id: "tool",
    title: "Sandbox",
    year: "2025",
    summary: t(
      "Denemelerimi topladığım küçük araçlar koleksiyonu.",
      "A small collection of experiments and utilities.",
    ),
    detail: t(
      "Bir şeyi öğrenmenin en hızlı yolu onu yapmak. Burada yarım kalmış deneyler de var, işe yarayanlar da.",
      "The fastest way to learn something is to build it. Some of these are half-finished experiments, some actually work.",
    ),
    tags: ["TypeScript", "Python"],
    accent: ["#8E5AC8", "#C8A2E8"],
  },
];

/* -------------------------------------------------------------------------- */
/*  YOLCULUK / TIMELINE                                                        */
/* -------------------------------------------------------------------------- */

export type Milestone = {
  period: string;
  title: Localized;
  org: string;
  body: Localized;
};

/** TODO: kendi geçmişinle değiştir */
export const timeline: Milestone[] = [
  {
    period: "2026 —",
    title: t("Ürün Geliştirici", "Product Engineer"),
    org: "Exposure AI",
    body: t(
      "LLM tabanlı ürünler: sohbet arayüzleri, ajan altyapıları, iç araçlar.",
      "LLM-based products: chat interfaces, agent infrastructure, internal tooling.",
    ),
  },
  {
    period: "2024 — 2026",
    title: t("Serbest Geliştirici", "Freelance Developer"),
    org: t("Bağımsız", "Independent").tr,
    body: t(
      "Web uygulamaları ve otomasyonlar. Küçük ekiplerle, uçtan uca.",
      "Web applications and automations. Small teams, end to end.",
    ),
  },
  {
    period: "2022 — 2024",
    title: t("Başlangıç", "Getting started"),
    org: t("Kendi kendine", "Self-taught").tr,
    body: t(
      "İlk satır koddan ilk yayınlanan projeye. Çoğu gece, çoğu deneme yanılma.",
      "From the first line of code to the first shipped project. Mostly at night, mostly trial and error.",
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  YETENEKLER                                                                 */
/* -------------------------------------------------------------------------- */

export const stack: { group: Localized; items: string[] }[] = [
  {
    group: t("Dil & Çatı", "Languages & Frameworks"),
    items: ["TypeScript", "React", "Next.js", "Python", "Node.js"],
  },
  {
    group: t("Yapay Zekâ", "AI"),
    items: ["Claude API", "Tool use", "RAG", "Streaming", "Prompt design"],
  },
  {
    group: t("Arayüz", "Interface"),
    items: ["Tailwind", "Framer Motion", "Canvas", "Erişilebilirlik"],
  },
  {
    group: t("Altyapı", "Infrastructure"),
    items: ["Postgres", "Vercel", "Docker", "Git"],
  },
];

/* -------------------------------------------------------------------------- */
/*  MİNİ OYUN — "Beni ne kadar tanıyorsun?"                                   */
/* -------------------------------------------------------------------------- */

export type QuizItem = {
  /** Üç iddia; ikisi doğru, biri yalan. Oyuncu YALANI bulmaya çalışır. */
  claims: Localized[];
  /** Yalan olanın indeksi (0, 1 veya 2) */
  lieIndex: 0 | 1 | 2;
  /** Cevap sonrası gösterilen açıklama */
  reveal: Localized;
};

/** TODO: kendi hakkındaki gerçekler + bir yalanla değiştir. Bu bölüm seni anlatıyor. */
export const quiz: QuizItem[] = [
  {
    claims: [
      t("İlk kodumu bir oyun hilesi yazmak için yazdım.", "I wrote my first code to cheat at a video game."),
      t("Klavyemi yılda en az iki kez değiştiriyorum.", "I swap my keyboard at least twice a year."),
      t("Hiç gece 3'ten sonra kod yazmadım.", "I have never written code after 3 AM."),
    ],
    lieIndex: 2,
    reveal: t(
      "Gece 3 benim en verimli saatim. Bu siteyi bile çoğunlukla o saatlerde yazdım.",
      "3 AM is my most productive hour. Most of this site was written around then.",
    ),
  },
  {
    claims: [
      t("Bir projeyi bitirmeden üçüncüsüne başlamam.", "I never start a third project before finishing one."),
      t("Tasarımı koddan önce kafamda bitiriyorum.", "I finish the design in my head before writing code."),
      t("Kahvesiz sabah toplantısına girmem.", "I don't take morning meetings without coffee."),
    ],
    lieIndex: 0,
    reveal: t(
      "Şu an açık en az dört projem var. Bu bir itiraf, savunma değil.",
      "I have at least four projects open right now. That's a confession, not a defense.",
    ),
  },
  {
    claims: [
      t("En sevdiğim hata mesajı: 'undefined is not a function'.", "My favorite error message is 'undefined is not a function'."),
      t("Bir animasyonu 40ms için 20 kez tekrar ayarladım.", "I re-tuned one animation 20 times over 40 milliseconds."),
      t("Tab yerine boşluk kullanıyorum.", "I use spaces, not tabs."),
    ],
    lieIndex: 0,
    reveal: t(
      "O mesajı hiç sevmedim. Ama 40ms hikâyesi tamamen gerçek.",
      "I have never loved that message. But the 40ms story is entirely true.",
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  ASİSTAN İÇİN BAĞLAM                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Chatbot'un sana dair bildiği her şey. Yukarıdaki verilerden otomatik
 * üretiliyor + aşağıdaki serbest notlar ekleniyor.
 * TODO: buraya modelin bilmesini istediğin ekstra detayları yaz.
 */
export const assistantNotes = `
- Göktürk kendini "ürün geliştirici" olarak tanımlar, "full-stack" demeyi sevmez.
- LLM ürünlerinde en çok araç kullanımı (tool use) ve akış (streaming) tarafıyla ilgilenir.
- Detaycıdır: animasyon süreleri, boşluklar ve mikro etkileşimler üzerinde uzun düşünür.
- Yeni iş / işbirliği tekliflerine açıktır; en hızlı ulaşma yolu e-posta.
`.trim();

/* -------------------------------------------------------------------------- */
/*  ARAYÜZ METİNLERİ                                                           */
/* -------------------------------------------------------------------------- */

export const ui = {
  nav: {
    about: t("Hakkımda", "About"),
    work: t("İşler", "Work"),
    path: t("Yolculuk", "Path"),
    play: t("Oyun", "Play"),
    contact: t("İletişim", "Contact"),
  },
  hero: {
    scroll: t("kaydır", "scroll"),
    cta: t("İşlere bak", "See the work"),
    ctaAlt: t("Bana beni sor", "Ask me about me"),
    hint: t("İmlecini üstünde gezdir", "Move your cursor across it"),
  },
  sections: {
    about: t("Hakkımda", "About"),
    work: t("Seçilmiş İşler", "Selected Work"),
    workSub: t(
      "Bitirdiklerim, yarım bıraktıklarım ve ikisinin arasındakiler.",
      "Things I finished, things I didn't, and things in between.",
    ),
    stack: t("Kullandıklarım", "What I use"),
    path: t("Yolculuk", "The Path"),
    play: t("Beni ne kadar tanıyorsun?", "How well do you know me?"),
    playSub: t(
      "Her turda üç iddia var. İkisi doğru, biri yalan. Yalanı bul.",
      "Three claims per round. Two are true, one is a lie. Find the lie.",
    ),
    contact: t("Konuşalım", "Let's talk"),
    contactSub: t(
      "Bir fikrin, bir teklifin ya da sadece bir sorun varsa yaz.",
      "If you have an idea, an offer, or just a question — write.",
    ),
  },
  game: {
    start: t("Başla", "Start"),
    restart: t("Tekrar oyna", "Play again"),
    round: t("Tur", "Round"),
    correct: t("Doğru bildin.", "You got it."),
    wrong: t("Bu doğruydu aslında.", "That one was actually true."),
    score: t("Skor", "Score"),
    perfect: t("Kusursuz. Beni fena okumuşsun.", "Flawless. You read me well."),
    good: t("Fena değil. Yarısını biliyorsun.", "Not bad. You know half of me."),
    bad: t("Tanışalım o zaman.", "Let's get acquainted, then."),
  },
  chat: {
    title: t("Bana beni sor", "Ask me about me"),
    subtitle: t(
      "Göktürk'ü tanıyan bir asistan. Deneyimi, projeleri, çalışma şekli — ne merak ediyorsan.",
      "An assistant that knows Göktürk. Experience, projects, how he works — whatever you're curious about.",
    ),
    placeholder: t("Bir şey sor…", "Ask something…"),
    send: t("Gönder", "Send"),
    clear: t("Temizle", "Clear"),
    thinking: t("düşünüyor", "thinking"),
    error: t(
      "Bir şeyler ters gitti. Birazdan tekrar dene.",
      "Something went wrong. Try again in a moment.",
    ),
    suggestions: [
      t("Hangi projelerde çalıştı?", "What projects has he worked on?"),
      t("Nasıl bir geliştirici?", "What kind of developer is he?"),
      t("Onunla nasıl iletişime geçerim?", "How do I get in touch?"),
      t("En güçlü olduğu alan ne?", "What is he strongest at?"),
    ],
    disclaimer: t(
      "Bu bir yapay zekâ. Yanılabilir — önemli şeyleri doğrudan sor.",
      "This is an AI. It can be wrong — ask him directly for anything important.",
    ),
  },
  palette: {
    placeholder: t("Komut ya da bölüm ara…", "Search commands or sections…"),
    sections: t("Bölümler", "Sections"),
    links: t("Linkler", "Links"),
    actions: t("Eylemler", "Actions"),
    empty: t("Sonuç yok.", "No results."),
    openChat: t("Asistanı aç", "Open the assistant"),
    toggleTheme: t("Temayı değiştir", "Toggle theme"),
    toggleLang: t("Dili değiştir", "Switch language"),
    copyEmail: t("E-postayı kopyala", "Copy email"),
    copied: t("Kopyalandı", "Copied"),
  },
  footer: {
    built: t("Sıfırdan yazıldı", "Built from scratch"),
    with: t("ile", "with"),
    rights: t("Tüm hakları saklıdır.", "All rights reserved."),
    top: t("Başa dön", "Back to top"),
  },
  a11y: {
    theme: t("Tema değiştir", "Toggle theme"),
    lang: t("Dil değiştir", "Toggle language"),
    menu: t("Menü", "Menu"),
    close: t("Kapat", "Close"),
  },
};
