// Hakkımda sayfasının yazıları. Yönetim panelinden (Site / Hakkımda) düzenlenir; panel yalnızca HAKKIMDA'yı yeniden yazar.
// Her yazı { tr, en } çiftidir. Başlığı boş bölüm, sayfanın üstündeki tanıtım yazısıdır.
//   text:  paragraflar
//   items: etiketli maddeler ({ label, text })
//   links: bağlantı kartları ({ name, detail, url }); e-posta için url "mailto:adres"
const HAKKIMDA = [
  {
    title: { tr: "", en: "" },
    text: [
      {
        tr: "21 yaşında bir Bilgisayar Programcılığı öğrencisiyim. Babuşlar, oyun tutkumla okulda öğrendiklerimi bir araya getirdiğim kişisel projem.",
        en: "I'm a 21-year-old Computer Programming student. Babuşlar is my personal project, where my love of games meets what I learn at school.",
      },
    ],
    items: [],
    links: [],
  },
  {
    title: { tr: "Babuşlar nedir?", en: "What is Babuşlar?" },
    text: [
      {
        tr: "Oyun oynarken aklıma takılan şeyleri hep farklı sitelerde, çoğu zaman İngilizce aramak zorunda kalıyordum. Babuşlar'ı, bu bilgileri tek yerde ve Türkçe toplamak için kurdum.",
        en: "Whenever I had a question while playing, I had to look it up on different sites, usually in English. I built Babuşlar to gather that information in one place, in Turkish.",
      },
      {
        tr: "Karakterlerin yetenekleri, eşyalar, haritalar, infolar ve lineup videoları; her oyun için o oyunda gerçekten işe yarayan bilgiler. Reklam yok, üyelik yok.",
        en: "Character abilities, items, maps, callouts and lineup videos: for every game, the information that actually helps in that game. No ads, no sign-up.",
      },
    ],
    items: [],
    links: [],
  },
  {
    title: { tr: "Veriler ne kadar güncel?", en: "How up to date is the data?" },
    text: [],
    items: [
      {
        label: { tr: "Anında", en: "Instant" },
        text: {
          tr: "League of Legends ve Valorant: veriler sayfa her açıldığında resmi kaynaklardan çekilir, yeni yama geldiği gün site de güncellenir. LoL eşya dizilimleri her gece maç istatistiklerinden yeniden hesaplanır.",
          en: "League of Legends and Valorant: data is loaded from official sources every time a page opens, so the site is updated the day a new patch comes out. LoL item builds are recalculated every night from match statistics.",
        },
      },
      {
        label: { tr: "Haftalık", en: "Weekly" },
        text: {
          tr: "Hâlâ yama alan oyunlar (Dead by Daylight, Rainbow Six Siege, Battlefield 6, Project Zomboid, Sea of Thieves, Brotato, Bannerlord, Darkest Dungeon II, Company of Heroes 3) her hafta otomatik olarak yenilenir.",
          en: "Games that still get patches (Dead by Daylight, Rainbow Six Siege, Battlefield 6, Project Zomboid, Sea of Thieves, Brotato, Bannerlord, Darkest Dungeon II, Company of Heroes 3) are refreshed automatically every week.",
        },
      },
      {
        label: { tr: "Sabit", en: "Fixed" },
        text: {
          tr: "Artık güncelleme almayan oyunların (Witcher 3, Darkest Dungeon, Warband, eski Battlefield'lar) bilgileri değişmez.",
          en: "Games that no longer get updates (Witcher 3, Darkest Dungeon, Warband, older Battlefields) keep fixed data.",
        },
      },
    ],
    links: [],
  },
  {
    title: { tr: "Bağlantılar", en: "Links" },
    text: [{ tr: "Öneri, hata bildirimi ya da sadece selam vermek için:", en: "For suggestions, bug reports or just to say hi:" }],
    items: [],
    links: [
      { name: { tr: "X (Twitter)", en: "X (Twitter)" }, detail: "@Noise_ozy_29", url: "https://x.com/Noise_ozy_29" },
      { name: { tr: "Instagram", en: "Instagram" }, detail: "@ahmethasnoz", url: "https://www.instagram.com/ahmethasnoz/" },
      { name: { tr: "E-posta", en: "Email" }, detail: "ahmet.bfgv@gmail.com", url: "mailto:ahmet.bfgv@gmail.com" },
    ],
  },
  {
    title: { tr: "Kaynaklar", en: "Sources" },
    text: [
      {
        tr: "Veriler Riot Games (Data Dragon), valorant-api.com, dbd.tricky.lol ve oyunların topluluk wikilerinden (CC BY-SA) alınır. Oyunların ve görsellerin hakları sahiplerine aittir; ayrıntılar ana sayfanın altında yazar.",
        en: "Data comes from Riot Games (Data Dragon), valorant-api.com, dbd.tricky.lol and the games' community wikis (CC BY-SA). Games and images belong to their owners; details are at the bottom of the home page.",
      },
    ],
    items: [],
    links: [],
  },
];

// Sayfayı çizer (yalnızca hakkimda.html'de; panel bu dosyayı okurken çalışmaz).
function renderAbout(root) {
  const t = (pair) => (typeof IS_EN !== "undefined" && IS_EN ? pair?.en || pair?.tr : pair?.tr) || "";
  const node = (tag, attrs, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    for (const c of children.flat()) if (c != null && c !== "") n.append(c);
    return n;
  };
  const sections = HAKKIMDA.map((s) => {
    const paragraphs = (s.text || []).map((p) => node("p", {}, t(p)));
    const items = s.items?.length
      ? node("ul", { class: "about-list" }, s.items.map((i) => node("li", {}, node("b", {}, t(i.label)), node("span", {}, t(i.text)))))
      : null;
    const links = s.links?.length
      ? node(
          "div",
          { class: "about-links" },
          s.links.map((l) =>
            node("a", { class: "about-link", href: l.url, ...(/^https?:/.test(l.url) ? { target: "_blank", rel: "noopener" } : {}) }, node("b", {}, t(l.name)), node("span", {}, l.detail || ""))
          )
        )
      : null;
    // Başlığı olmayan bölüm: sayfanın üstündeki tanıtım yazısı.
    if (!t(s.title)) return (s.text || []).map((p) => node("p", { class: "page-sub" }, t(p)));
    return node("section", { class: "about-card" }, node("h2", {}, t(s.title)), paragraphs, items, links);
  });
  root.replaceChildren(node("h1", { class: "page-title" }, IS_EN ? "About" : "Hakkımda"), ...sections.flat());
}

if (typeof document !== "undefined" && document.getElementById("about")) renderAbout(document.getElementById("about"));
