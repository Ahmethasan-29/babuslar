// Brotato bölüm seçimi.
const sections = [
  {
    href: "karakterler.html",
    title: L("Karakterler", "Characters"),
    badge: L("Özellikler · Başlangıç silahları", "Traits · Starting weapons"),
    text: L(`${BRO.characters.length} karakter: güçlü ve zayıf yanları, hangi silahlarla başladıkları ve nasıl açıldıkları.`, `${BRO.characters.length} characters: strengths, weaknesses, starting weapons and how to unlock them.`),
    img: BRO.characters.find((c) => c.name === "Brawler")?.icon,
  },
  {
    href: "silahlar.html",
    title: L("Silahlar", "Weapons"),
    badge: L("Seviye I–IV · Sınıflar", "Tiers I–IV · Classes"),
    text: L(`${BRO.weapons.length} silahın dört seviyedeki hasarı, saldırı hızı, kritiği, menzili ve fiyatı.`, `Damage, cooldown, crit, range and price of ${BRO.weapons.length} weapons at all four tiers.`),
    img: BRO.weapons.find((w) => w.name === "SMG")?.icon,
  },
  {
    href: "esyalar.html",
    title: L("Eşyalar", "Items"),
    badge: L("Nadirlik · Etiketler", "Rarity · Tags"),
    text: L(`${BRO.items.length} eşya: ne işe yaradıkları, fiyatları ve hangi statı etkiledikleri.`, `${BRO.items.length} items: what they do, their price and which stats they affect.`),
    img: BRO.items.find((i) => i.name === "Alien Eyes")?.icon,
  },
  {
    href: "rehber.html",
    title: L("Rehber", "Guide"),
    badge: L("Malzeme · Dükkân · Statlar", "Materials · Shop · Stats"),
    text: L("Yeni başlayanların soruları: malzeme, dükkân, kilitleme, statlar ve tehlike seviyeleri.", "Beginner questions: materials, the shop, locking, stats and danger levels."),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img bro-card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
  )
);
