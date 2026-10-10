// Warband bölüm seçimi.
const count = (type) => WB.places.filter((p) => p.type === type).length;
const [towns, castles, villages] = [count("town"), count("castle"), count("village")];
const sections = [
  {
    href: "harita.html",
    title: L("Harita", "Map"),
    badge: L("Şehirler · Kaleler · Köyler", "Towns · Castles · Villages"),
    text: L(
      `Calradia'nın yakınlaştırılabilir haritası: ${towns} şehir, ${castles} kale ve ${villages} köy; hangi krallığa ait oldukları ve bağlı köyleri.`,
      `A zoomable map of Calradia: ${towns} towns, ${castles} castles and ${villages} villages, their kingdoms and bound villages.`
    ),
    img: WB.map.url,
  },
  {
    href: "kralliklar.html",
    title: L("Krallıklar ve birlikler", "Factions and troops"),
    badge: L("Birlik ağaçları", "Troop trees"),
    text: L(`${WB.factions.length} krallık ve birliklerin hangi birliğe yükseldiği.`, `${WB.factions.length} kingdoms and how their troops upgrade.`),
  },
  {
    href: "yoldaslar.html",
    title: L("Yoldaşlar", "Companions"),
    badge: L("Dostlar · Düşmanlar · Takım kurma", "Friends · Rivals · Party builder"),
    text: L(
      `${WB.companions.length} yoldaş: becerileri, kimle anlaşıp kimle kavga ettikleri. Kavga etmeyen takımını kur.`,
      `${WB.companions.length} companions: their skills, who they like and who they hate. Build a party that won't quarrel.`
    ),
  },
  {
    href: "rehber.html",
    title: L("Başlangıç rehberi", "Beginner's guide"),
    badge: L("Sık sorulan sorular", "Frequently asked questions"),
    text: L("Para kazanma, lord olma, krallık kurma, evlilik, savaş komutları ve daha fazlası.", "Making money, becoming a lord, founding a kingdom, marriage, battle orders and more."),
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
