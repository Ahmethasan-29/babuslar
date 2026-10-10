// Witcher 3 bölüm seçimi.
const markerCount = W3.regions.reduce((n, r) => n + r.markers.length, 0);
const sections = [
  {
    href: "harita.html",
    title: L("Harita", "Map"),
    badge: L("Tabelalar · Güç yerleri · Hazineler · Tüccarlar", "Signposts · Places of Power · Treasure · Merchants"),
    text: L(
      `${W3.regions.length} bölgenin yakınlaştırılabilir haritası ve ${markerCount} işaret: hızlı yolculuk tabelaları, güç yerleri, canavar yuvaları, hazineler, demirciler ve Gwent oyuncuları.`,
      `Zoomable maps of ${W3.regions.length} regions with ${markerCount} markers: signposts, Places of Power, monster nests, treasure, smiths and Gwent players.`
    ),
    img: "maps/velen-small.jpg",
  },
  {
    href: "canavarlar.html",
    title: L("Canavarlar", "Monsters"),
    badge: L("Zayıflıklar · Yağ · İşaret · Bomba", "Weaknesses · Oils · Signs · Bombs"),
    text: L(`${W3.monsters.length} canavar: hangi yağa, işarete (sign) ve bombaya zayıf oldukları, nerede bulundukları.`, `${W3.monsters.length} monsters: which oils, Signs and bombs they are weak to and where they live.`),
  },
  {
    href: "rehber.html",
    title: L("Rehber", "Guide"),
    badge: L("Sonlar · Kararlar · Sık sorulanlar", "Endings · Choices · FAQ"),
    text: L("Ciri'nin sonunu belirleyen kararlar, savaşın kazananı, romantizm, kaçırılabilecek şeyler ve başlangıç ipuçları.", "Choices that decide Ciri's ending, who wins the war, romance, missable content and beginner tips."),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
  )
);
