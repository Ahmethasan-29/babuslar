// Sea of Thieves bölüm seçimi.
const count = (k) => SOT.places.filter((p) => p.kind === k).length;
const sections = [
  {
    href: "adalar.html",
    title: L("Adalar ve bilmeceler", "Islands & riddles"),
    badge: L("Ara · Resimler · Bilmece cevapları", "Search · Pictures · Riddle answers"),
    text: L(
      `${SOT.places.length} yer tek tek: adını, koordinatını ya da bilmece cümlesini yaz, adayı resmiyle bul. ${SOT.places.reduce((n, p) => n + p.riddles.length, 0)} bilmecenin cevabı resimli.`,
      `${SOT.places.length} places one by one: type a name, coordinate or riddle line and find the island with pictures. ${SOT.places.reduce((n, p) => n + p.riddles.length, 0)} riddle answers with screenshots.`
    ),
    img: SOT.places.find((p) => p.name === "Shark Bait Cove")?.image?.replace(/\/revision\/latest.*$/, "/revision/latest/scale-to-width-down/600"),
  },
  {
    href: "harita.html",
    title: L("Harita", "Map"),
    badge: L("Adalar · Karakollar · Kaleler · Koordinatlar", "Islands · Outposts · Forts · Coordinates"),
    text: L(
      `${SOT.places.length} yer ızgara koordinatıyla: ${count("large") + count("small")} ada, ${count("outpost")} karakol, ${count("seapost")} seapost, ${count("fortress") + count("seafort")} kale. Koordinatla ara (ör. G-16).`,
      `${SOT.places.length} places by grid coordinate: ${count("large") + count("small")} islands, ${count("outpost")} outposts, ${count("seapost")} seaposts, ${count("fortress") + count("seafort")} forts. Search by coordinate (e.g. G-16).`
    ),
    img: SOT.places.find((p) => p.name === "Cannon Cove")?.image?.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/600"),
  },
  {
    href: "sirketler.html",
    title: L("Şirketler ve gemiler", "Companies & ships"),
    badge: L("Hangi ganimet kime satılır", "Who buys what"),
    text: L(`${SOT_COMPANIES.length} ticaret şirketi: kime ne satılır, nerede bulunur. Sloop, Brigantine ve Galleon karşılaştırması.`, `${SOT_COMPANIES.length} trading companies: who buys what and where. Sloop, Brigantine and Galleon compared.`),
  },
  {
    href: "rehber.html",
    title: L("Rehber", "Guide"),
    badge: L("İlk yolculuk · Gemi · Savaş", "First voyage · Ship · Combat"),
    text: L("Yeni başlayanların soruları: ilk ne yapılır, gemi nasıl batmaz, hazine nasıl bulunur, silahlar.", "Beginner questions: what to do first, keeping the ship afloat, finding treasure, weapons."),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
  )
);
