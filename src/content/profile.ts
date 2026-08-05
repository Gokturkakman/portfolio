/**
 * ============================================================================
 *  TEK KAYNAK / SINGLE SOURCE OF TRUTH
 * ============================================================================
 *  Sitedeki her metin, link ve proje burada. Tasarıma dokunmadan içeriği
 *  buradan değiştirebilirsin.
 *
 *  İçerik Göktürk_Akman_CV.docx'ten alındı (Mayıs 2026).
 *  `GÖZDEN GEÇİR:` ile işaretli yerler CV'de olmayan, benim yazdığım
 *  metinler: onayından geçmeli.
 * ============================================================================
 */

export type Lang = "tr" | "en";
export type Localized = Record<Lang, string>;

const t = (tr: string, en: string): Localized => ({ tr, en });

/* -------------------------------------------------------------------------- */
/*  KİMLİK                                                                     */
/* -------------------------------------------------------------------------- */

export const identity = {
  /** Hero'da parçacıklarla çizilen isim */
  name: "Göktürk Akman",
  initials: "GA",
  role: t("Hayat Boyu Öğrenici", "Lifelong Learner"),

  /** GÖZDEN GEÇİR: Hero'nun altındaki tek cümlelik iddia. Sitenin en önemli cümlesi. */
  tagline: t(
    "Her alanda yeni bir şey öğrenmeye çalışıyorum ve asıl keyfi o süreçten alıyorum. Robotik, roket, kod, tasarım: hepsi aynı merakın farklı halleri.",
    "I try to learn something new in every field, and the process itself is the part I enjoy. Robotics, rockets, code, design: different shapes of the same curiosity.",
  ),

  location: t("İstanbul, Türkiye", "Istanbul, Türkiye"),

  /** Navbar'daki canlı rozet */
  status: t(
    "Koç School'da IB Diploma adayı",
    "IB Diploma candidate at The Koç School",
  ),

  /**
   * CV'deki okul adresi. Kişisel bir adresi tercih edersen değiştir: * okul adresleri mezuniyetten sonra kapanıyor.
   */
  email: "gokturka2028@stu.koc.k12.tr",

  /**
   * CV'de telefon numaran var; siteye bilerek konmadı. Açık internete telefon
   * koymak spam ve istenmeyen arama demek. İstersen buraya ekleyebilirsin.
   */
  phone: null as string | null,

  /**
   * İndirilebilir CV. public/ altına koyup yolunu yaz (örn. "/gokturk-akman-cv.pdf").
   * NOT: Mevcut .docx içinde telefon numaran var: siteye koymadan önce
   * numarayı çıkarıp PDF'e çevirmen daha doğru olur.
   */
  resume: null as string | null,
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
  /** Marka adları (GitHub, LinkedIn…) için iki dilde de aynısını yaz */
  label: Localized;
  href: string;
  handle: string;
};

/**
 * Sıralama önemli: hero'da ilk dördü gösteriliyor, iletişim bölümünde hepsi.
 * Yeni hesap eklemek için diziye bir satır eklemen yeterli: hero, iletişim
 * ızgarası ve ⌘K paleti hepsi buradan besleniyor.
 */
export const socials: Social[] = [
  {
    key: "github",
    label: t("GitHub", "GitHub"),
    href: "https://github.com/Gokturkakman",
    handle: "@Gokturkakman",
  },
  {
    key: "linkedin",
    label: t("LinkedIn", "LinkedIn"),
    // Profil adresinde Türkçe karakter var (göktürk). Yüzde-kodlanmış hâli
    // yazılıyor: kodlanmamış URL bazı e-posta istemcilerinde ve eski
    // tarayıcılarda bozuluyor.
    href: "https://www.linkedin.com/in/g%C3%B6kt%C3%BCrk-akman-61537a356",
    handle: "in/göktürk-akman",
  },
  {
    key: "instagram",
    label: t("Instagram", "Instagram"),
    href: "https://www.instagram.com/gokturk.akman/",
    handle: "@gokturk.akman",
  },
  {
    key: "email",
    label: t("E-posta", "Email"),
    href: `mailto:${identity.email}`,
    handle: identity.email,
  },
];

/* -------------------------------------------------------------------------- */
/*  HAKKIMDA                                                                   */
/* -------------------------------------------------------------------------- */

export const about = {
  heading: t("Kısaca", "In short"),

  /** GÖZDEN GEÇİR: CV'deki gerçeklerden yazıldı, ama ses tonu benim. */
  paragraphs: [
    t(
      "İstanbul'da Koç School'da okuyorum, IB Diploma adayıyım. Fizik, matematik ve işletmeyi ileri seviyede alıyorum. Ama bir konuyu gerçekten öğrendiğimi, ancak onu kendim yapmaya çalıştığımda hissediyorum.",
      "I study at The Koç School in Istanbul as an IB Diploma candidate. I take physics, maths and business at higher level. But I only feel like I have actually learned something once I have tried to build it myself.",
    ),
    t(
      "O yüzden fırsat buldukça yeni bir alana giriyorum. Cambridge'de hidrolikle çalışan bir biyonik kol prototipi yaptım, Arduino ile çizgi izleyen bir robot programladım. TEKNOFEST'te roket takımındaydım, FRC'de robotik takımının kaptanıyım, üçüncü sınıftan beri BİLSEM'de dijital tasarım okuyorum. Şu an bir arkadaşımla sosyal ağ uygulaması geliştiriyorum.",
      "So whenever I get the chance, I step into a new field. At Cambridge I built a hydraulic bionic arm prototype and programmed a line-tracking robot with Arduino. I was on the rocket team at TEKNOFEST, I captain my school's FRC robotics team, and I have studied digital design at BİLSEM since third grade. Right now I am building a social networking app with a friend.",
    ),
    t(
      "Hepsinin ortak noktası sonuç değil, süreç. Yeni bir konuya sıfırdan başlamanın, bir yerde takılıp orada debelenmenin ve sonunda işin nasıl yürüdüğünü anlamanın keyfi bende hep aynı. Kendimi tek bir alanla tanımlamamamın sebebi de bu; şu an en çok vaktimi biyomedikal mühendislik, robotik ve yapay zekâya ayırıyorum.",
      "What they have in common is not the result, it is the process. Starting a new subject from zero, getting stuck somewhere and wrestling with it, and finally seeing how the thing actually works: that part feels the same every time. It is also why I do not define myself by one field. Right now most of my time goes to biomedical engineering, robotics and AI.",
    ),
  ],

  facts: [
    { k: t("Okul", "School"), v: t("Koç School · IB DP", "The Koç School · IB DP") },
    {
      k: t("İleri seviye", "Higher level"),
      v: t("Fizik, Matematik, İşletme", "Physics, Maths, Business"),
    },
    { k: t("Diller", "Languages"), v: t("Türkçe, İngilizce (C1)", "Turkish, English (C1)") },
    {
      k: t("İlgi alanları", "Interests"),
      v: t("Biyomedikal, robotik, YZ", "Biomedical, robotics, AI"),
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  PROJELER                                                                   */
/* -------------------------------------------------------------------------- */

export type Project = {
  id: string;
  title: Localized;
  year: string;
  summary: Localized;
  detail: Localized;
  tags: Localized[];
  href?: string;
  repo?: string;
  /** Kartın arkasındaki degrade: 2 hex rengi */
  accent: [string, string];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "social-app",
    title: t("Sosyal Ağ Uygulaması", "Social Networking App"),
    year: "2026→",
    summary: t(
      "Alman Lisesi'nden bir arkadaşımla kurduğum, fikirden koda kadar birlikte götürdüğümüz uygulama.",
      "An app I co-founded with a student from Alman Lisesi, carried from idea to code together.",
    ),
    detail: t(
      "Kurucu ortak ve geliştirici olarak ürün tasarımından yazılım mimarisine kadar tüm süreçte yer alıyorum. İki farklı okuldan çalışmak, işi bölmeyi ve yazılı iletişimi ciddiye almayı öğretti.",
      "As co-founder and developer I'm involved across the whole cycle, from product design to software architecture. Working across two different schools taught me to split work properly and take written communication seriously.",
    ),
    tags: [t("JavaScript", "JavaScript"), t("Ürün tasarımı", "Product design"), t("Yazılım mimarisi", "Architecture")],
    accent: ["#E8853A", "#F2C14E"],
    featured: true,
  },
  {
    id: "bionic-arm",
    title: t("Biyonik Kol Prototipi", "Bionic Arm Prototype"),
    year: "2024",
    summary: t(
      "Kas hareketini hidrolik bir sistemle taklit eden protez kol prototipi.",
      "A prosthetic arm prototype simulating muscle movement with a hydraulic system.",
    ),
    detail: t(
      "Cambridge Üniversitesi yaz programının 'Science and the Future' başlığı altında tasarlandı ve sunuldu. Gerçek protez teknolojilerinden yola çıkıp, kas kasılmasını basınçla taklit eden bir mekanizma kurduk. Programa Exceptional Merit bursuyla ($3.500) katıldım.",
      "Designed and presented on the 'Science and the Future' track of the Cambridge University summer program. Starting from real prosthetic technology, we built a mechanism that mimics muscle contraction using pressure. I attended on an Exceptional Merit Scholarship ($3,500).",
    ),
    tags: [t("Biyomedikal", "Biomedical"), t("Hidrolik", "Hydraulics"), t("Prototipleme", "Prototyping")],
    accent: ["#2E7D6E", "#7FC9B4"],
    featured: true,
  },
  {
    id: "line-robot",
    title: t("Çizgi İzleyen Robot", "Line-Tracking Robot"),
    year: "2024",
    summary: t(
      "IR sensörler ve mantık tabanlı navigasyonla kendi başına yol bulan robot.",
      "An autonomous robot navigating by IR sensors and logic-based routing.",
    ),
    detail: t(
      "Cambridge robotik parkurunda C++ ve Arduino ile programlandı. IR sensörler, motor sürücüleri ve navigasyon algoritmasını birleştirmek, 'çalışıyor' ile 'her seferinde çalışıyor' arasındaki farkı öğretti.",
      "Programmed in C++ with Arduino on the Cambridge robotics track. Wiring together IR sensors, motor drivers and a navigation algorithm taught me the difference between 'it works' and 'it works every time'.",
    ),
    tags: [t("C++", "C++"), t("Arduino", "Arduino"), t("Sensörler", "Sensors")],
    accent: ["#8E5AC8", "#C8A2E8"],
  },
  {
    id: "frc",
    title: t("FRC Yarışma Robotu", "FRC Competition Robot"),
    year: "2024-2026",
    summary: t(
      "Koç School takımında mekanik lider ve kaptan; BİLSEM takımında sürücü.",
      "Mechanical lead and captain at The Koç School; driver on the BİLSEM team.",
    ),
    detail: t(
      "CRESCENDO (2024, Boğaziçi Bölgesel) ve REEFSCAPE (2025, Haliç) sezonlarında yarıştım. Mekanik tasarım ve üretim stratejisini yönetmenin yanı sıra yazılım, elektrik ve mekanik alt takımları arasındaki koordinasyondan sorumluyum. İşin zor kısmı robot değil, üç takımı aynı takvimde tutmak.",
      "Competed in the CRESCENDO (2024, Bosphorus Regional) and REEFSCAPE (2025, Haliç) seasons. Alongside leading mechanical design and fabrication strategy, I coordinate between the programming, electrical and mechanical sub-teams. The hard part is not the robot, it is keeping three teams on one schedule.",
    ),
    tags: [t("FRC", "FRC"), t("Mekanik tasarım", "Mechanical design"), t("Takım liderliği", "Team leadership")],
    accent: ["#C25F14", "#F2A765"],
  },
  {
    id: "teknofest",
    title: t("TEKNOFEST Roketi", "TEKNOFEST Rocket"),
    year: "2024",
    summary: t(
      "A1 lise kategorisi: en az 4.000 ft irtifa hedefiyle tasarım, üretim ve fırlatma.",
      "A1 high-school category: design, build and launch targeting a 4,000 ft minimum altitude.",
    ),
    detail: t(
      "Takım üyesi olarak projenin tasarımdan fırlatmaya kadar tüm yaşam döngüsüne katkı verdim. Bir şeyin tek bir denemede çalışmak zorunda olması, kâğıt üstündeki hesabı ciddiye almayı öğretiyor.",
      "As a team member I contributed across the full project lifecycle, from design to launch. When something has to work on the first try, you start taking the paper calculations seriously.",
    ),
    tags: [t("Roketçilik", "Rocketry"), t("Takım projesi", "Team project")],
    accent: ["#4A6FA5", "#8FB3DC"],
  },
];

/* -------------------------------------------------------------------------- */
/*  YOLCULUK / TIMELINE                                                        */
/* -------------------------------------------------------------------------- */

export type Milestone = {
  period: Localized;
  title: Localized;
  org: Localized;
  body: Localized;
};

export const timeline: Milestone[] = [
  {
    period: t("2023'ten beri", "Since 2023"),
    title: t("IB Diploma Adayı", "IB Diploma Candidate"),
    org: t("The Koç School", "The Koç School"),
    body: t(
      "İleri seviye: Fizik, Matematik, İşletme. Ortalama 95/100, aralıksız Akademik Yüksek Onur.",
      "Higher level: Physics, Maths, Business Management. 95/100 average, uninterrupted Academic High Honors.",
    ),
  },
  {
    period: t("Yaz 2025", "Summer 2025"),
    title: t("Lise Yaz Programı", "High School Summer Program"),
    org: t("Sabancı Üniversitesi", "Sabancı University"),
    body: t(
      "Kuantum fiziği, çip ve sensör teknolojileri, makine öğrenmesi ve üretken yapay zekâ.",
      "Quantum physics, chip and sensor technologies, machine learning and generative AI.",
    ),
  },
  {
    period: t("Ocak-Şubat 2025", "January-February 2025"),
    title: t("Matematiksel Yaratıcılık Kampı", "Mathematical Creativity Camp"),
    org: t("Nesin Matematik Köyü", "Nesin Mathematics Village"),
    body: t(
      "Haftada 35 saat, yatılı. Açık uçlu problemler ve çok farklı geçmişlerden gelen insanlarla çalışmak.",
      "35 hours a week, residential. Open-ended problems, and working with people from very different backgrounds.",
    ),
  },
  {
    period: t("Haziran-Ağustos 2024", "June-August 2024"),
    title: t("Yaz Programı, Exceptional Merit Bursu", "Summer Program, Exceptional Merit Scholarship"),
    org: t("Cambridge Üniversitesi", "Cambridge University"),
    body: t(
      "Yapay zekâ, biyonik mühendislik, hassas tıp ve iklim değişikliği. Biyonik kol ve çizgi izleyen robot burada çıktı.",
      "AI, bionic engineering, precision medicine and climate change. The bionic arm and the line-tracking robot came out of this.",
    ),
  },
  {
    period: t("3. sınıftan beri", "Since 3rd grade"),
    title: t("Dijital Tasarım ve Görsel Sanatlar", "Digital Design and Visual Arts"),
    org: t("BİLSEM (Bilim ve Sanat Merkezi)", "BİLSEM (Science and Arts Center)"),
    body: t(
      "En uzun süredir devam eden şey. Tasarım tarafımın çoğu buradan geliyor.",
      "The longest-running thing I do. Most of my design instinct comes from here.",
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  YETENEKLER                                                                 */
/* -------------------------------------------------------------------------- */

export const stack: { group: Localized; items: Localized[] }[] = [
  {
    group: t("Programlama", "Programming"),
    items: [t("Python", "Python"), t("C++ (Arduino)", "C++ (Arduino)"), t("JavaScript", "JavaScript")],
  },
  {
    group: t("Donanım", "Hardware"),
    items: [t("Arduino", "Arduino"), t("VEX", "VEX"), t("FRC", "FRC"), t("IR sensörler", "IR sensors"), t("Motor sürücüleri", "Motor drivers")],
  },
  {
    group: t("Tasarım", "Design"),
    items: [t("Dijital tasarım", "Digital design"), t("Görsel sanatlar", "Visual arts"), t("AutoDesk", "AutoDesk")],
  },
  {
    group: t("Araştırma", "Research"),
    items: [t("Literatür taraması", "Literature review"), t("Deney dokümantasyonu", "Experiment documentation"), t("Veri kaydı", "Data recording")],
  },
];

/* -------------------------------------------------------------------------- */
/*  TOPLUMSAL KATKI                                                            */
/* -------------------------------------------------------------------------- */

export const service: {
  period: Localized;
  title: Localized;
  org: Localized;
  body: Localized;
}[] = [
  {
    period: t("2024'ten beri", "Since 2024"),
    title: t("Mentor", "Mentor"),
    org: t("LGS Arkadaşım", "LGS Arkadaşım Initiative"),
    body: t(
      "Maddi imkânı kısıtlı, başarılı öğrencilere LGS yılı boyunca mentorluk. Kişiye özel çalışma planı, akademik ve moral destek, ilerleme takibi.",
      "Mentoring high-achieving students from low-income backgrounds through their LGS exam year: personalised study plans, academic and emotional support, progress tracking.",
    ),
  },
  {
    period: t("Aralık 2024-Ocak 2025", "December 2024-January 2025"),
    title: t("Gönüllü", "Volunteer"),
    org: t("KAÇUV (Kanserli Çocuklara Umut Vakfı)", "KAÇUV (Hope Foundation for Children with Cancer)"),
    body: t(
      "Maraton etkinliklerinde farkındalık ve bağış topladım, kampanyayı sosyal medyada yaydım.",
      "Raised awareness and donations at city marathon events, and amplified the campaign on social media.",
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  MİNİ OYUN: "Beni ne kadar tanıyorsun?"                                   */
/* -------------------------------------------------------------------------- */

export type QuizItem = {
  /** Üç iddia; ikisi doğru, biri yalan. Oyuncu YALANI bulmaya çalışır. */
  claims: Localized[];
  lieIndex: 0 | 1 | 2;
  reveal: Localized;
};

/**
 * Doğru iddialar CV'den geliyor. Yalanlar (robotu altı yaşında tek başına
 * yapmak, roketin 10.000 fite çıkması, yüzmede Türkiye şampiyonluğu)
 * Göktürk tarafından "bunların hiçbiri bende doğru değil" diye onaylandı: * oyunun çalışması için tam olarak gereken şey bu.
 */
export const quiz: QuizItem[] = [
  {
    claims: [
      t(
        "Cambridge'de kas hareketini hidrolikle taklit eden bir biyonik kol yaptım.",
        "At Cambridge I built a bionic arm that mimics muscle movement with hydraulics.",
      ),
      t(
        "Üçüncü sınıftan beri BİLSEM'de dijital tasarım okuyorum.",
        "I've studied digital design at BİLSEM since third grade.",
      ),
      t(
        "İlk robotumu altı yaşımda tek başıma yaptım.",
        "I built my first robot on my own at the age of six.",
      ),
    ],
    lieIndex: 2,
    reveal: t(
      "İlk ciddi robotum FRC takımıyla oldu. Öncesinde bol bol söküp taktım ama tek başıma değil; robotik benim için hep takım işi.",
      "My first serious robot came with the FRC team. Before that I took plenty of things apart, but never alone; robotics has always been teamwork for me.",
    ),
  },
  {
    claims: [
      t(
        "TEKNOFEST'te fırlattığımız roket 10.000 fitin üzerine çıktı.",
        "Our TEKNOFEST rocket climbed past 10,000 feet.",
      ),
      t(
        "Roket projesinde tasarımdan fırlatmaya kadar her aşamada yer aldım.",
        "I was involved at every stage of the rocket project, from design to launch.",
      ),
      t(
        "FRC'de bir takımda kaptan, başka bir takımda sürücüyüm.",
        "In FRC I'm a captain on one team and a driver on another.",
      ),
    ],
    lieIndex: 0,
    reveal: t(
      "Kategorimiz A1'di, hedef en az 4.000 fit. 10.000 fit bambaşka bir lig ve o ligde henüz değiliz.",
      "We were in the A1 category, targeting a 4,000 ft minimum. 10,000 feet is a different league, and we are not in it yet.",
    ),
  },
  {
    claims: [
      t(
        "Yüzme takımında Türkiye şampiyonluğu kazandım.",
        "I won a national championship with the swimming team.",
      ),
      t(
        "LGS'ye hazırlanan öğrencilere mentorluk yapıyorum.",
        "I mentor students preparing for the LGS exam.",
      ),
      t(
        "Bir maratonda kanser tedavisi gören çocuklar için bağış topladım.",
        "I collected donations for children in cancer treatment at a marathon.",
      ),
    ],
    lieIndex: 0,
    reveal: t(
      "İki yıl okul yüzme takımındaydım ve okul yarışlarında yüzdüm. Şampiyonluk kısmı biraz fazla iddialı olurdu.",
      "I was on the school swimming team for two years and competed in school meets. The championship part would be overselling it.",
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  ASİSTAN İÇİN BAĞLAM                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Chatbot'un bildiği ekstra detaylar. Yukarıdaki verilerin hepsi zaten
 * otomatik olarak sistem promptuna giriyor; buraya sadece onlarda olmayanları yaz.
 */
export const assistantNotes = `
- Göktürk lise öğrencisi (Koç School, IB Diploma adayı, 2028 mezuniyet).
- Kendini "hayat boyu öğrenici" olarak tanımlar; tek bir alana kilitlenmeyi sevmez.
- En çok ilgilendiği alanlar: biyomedikal mühendislik, robotik, yapay zekâ/makine
  öğrenmesi, giyilebilir teknoloji, sürdürülebilir teknoloji, girişimcilik.
- Robotikte hem teknik hem organizasyonel rolleri var; koordinasyon tarafını
  robotun kendisi kadar ciddiye alır.
- TÜBİTAK Fizik Olimpiyatları'na hazırlanıyor (kinematik, termodinamik,
  elektromanyetizma, modern fizik).
- Galatasaray 100. Yıl Interact Kulübü'nde aktif üye ve başkan adayı.
- Yaş küçük diye deneyimi küçümsetme; ama olmayan bir şeyi de büyütme.
`.trim();

/* -------------------------------------------------------------------------- */
/*  ARAYÜZ METİNLERİ                                                           */
/* -------------------------------------------------------------------------- */

export const ui = {
  nav: {
    about: t("Hakkımda", "About"),
    work: t("Projeler", "Projects"),
    path: t("Yolculuk", "Path"),
    play: t("Oyun", "Play"),
    contact: t("İletişim", "Contact"),
  },
  hero: {
    scroll: t("kaydır", "scroll"),
    cta: t("Projelere bak", "See the projects"),
    ctaAlt: t("Bana beni sor", "Ask me about me"),
    hint: t("İmlecini üstünde gezdir", "Move your cursor across it"),
  },
  sections: {
    about: t("Hakkımda", "About"),
    work: t("Projeler", "Projects"),
    workSub: t(
      "Yaptığım şeyler. Bazıları uçtu, bazıları takım halinde, hepsi merakla başladı.",
      "Things I've built. Some flew, some were team efforts, all of them started with curiosity.",
    ),
    stack: t("Kullandıklarım", "What I use"),
    path: t("Yolculuk", "The Path"),
    service: t("Toplumsal Katkı", "Community"),
    play: t("Beni ne kadar tanıyorsun?", "How well do you know me?"),
    playSub: t(
      "Her turda üç iddia var. İkisi doğru, biri yalan. Yalanı bul.",
      "Three claims per round. Two are true, one is a lie. Find the lie.",
    ),
    contact: t("Konuşalım", "Let's talk"),
    contactSub: t(
      "Bir fikrin, bir projen ya da sadece bir sorun varsa yaz.",
      "If you have an idea, a project, or just a question, write.",
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
      "Göktürk'ü tanıyan bir asistan. Projeleri, okuduğu şeyler, çalışma şekli: ne merak ediyorsan.",
      "An assistant that knows Göktürk. His projects, what he studies, how he works: whatever you are curious about.",
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
      t("Robotikte ne yapıyor?", "What does he do in robotics?"),
      t("Neyle ilgileniyor?", "What is he interested in?"),
      t("Onunla nasıl iletişime geçerim?", "How do I get in touch?"),
    ],
    disclaimer: t(
      "Bu bir yapay zekâ. Yanılabilir, önemli şeyleri doğrudan sor.",
      "This is an AI. It can be wrong, so ask him directly for anything important.",
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
