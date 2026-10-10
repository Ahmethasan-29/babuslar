// Bannerlord bölüm seçimi.
const count = (type) => BL.places.filter((p) => p.type === type).length;
const [towns, castles, villages] = [count("town"), count("castle"), count("village")];
const sections = [
  {
    href: "harita.html",
    title: L("Harita ve yerleşimler", "Map and settlements"),
    badge: L("Şehirler · Kaleler · Köyler · Ürünler", "Towns · Castles · Villages · Products"),
    text: L(
      `Yakınlaştırılabilir Calradia haritası ve ${towns} şehir, ${castles} kale, ${villages} köy: hangi krallığa ait oldukları, köylerin ne ürettiği ve hangi şehirde hangi atölyenin işe yarayacağı.`,
      `A zoomable map of Calradia and ${towns} towns, ${castles} castles, ${villages} villages: their kingdoms, what each village produces and which workshop suits which town.`
    ),
    img: BL.map.url,
  },
  {
    href: "kralliklar.html",
    title: L("Krallıklar ve birlikler", "Factions and troops"),
    badge: L("Kültürler · Birlik ağaçları", "Cultures · Troop trees"),
    text: L(`${BL.kingdoms.length} krallık, ${BL.troops.length} birlik ve hangi birliğin neye yükseldiği.`, `${BL.kingdoms.length} kingdoms, ${BL.troops.length} troops and how they upgrade.`),
  },
  {
    href: "rehber.html",
    title: L("Başlangıç rehberi", "Beginner's guide"),
    badge: L("Sık sorulan sorular", "Frequently asked questions"),
    text: L("Para kazanma, klan kademesi, yoldaşlar, asker toplama, krallık kurma, evlilik ve daha fazlası.", "Making money, clan tiers, companions, recruiting, founding a kingdom, marriage and more."),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el(
      "a",
      { class: "game-card", href: s.href },
      s.img ? el("img", { class: "card-img", src: s.img.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/800"), alt: "" }) : null,
      el("span", { class: "badge" }, s.badge),
      el("h2", {}, s.title),
      el("p", {}, s.text)
    )
  )
);
