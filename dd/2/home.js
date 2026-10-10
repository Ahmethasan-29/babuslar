// Darkest Dungeon II bölüm seçimi.
const heroImg2 = (name) => DKD2.heroes.find((h) => h.name === name && h.image)?.image;
const sections = [
  { href: "kahramanlar.html", title: "Kahramanlar", badge: "Yollar · Beceriler", text: `${DKD2.heroes.length} kahraman: yolları ve becerileri.`, img: heroImg2("Highwayman") },
  { href: "trinketler.html", title: "Trinket'lar", badge: "Eşya etkileri", text: `${DKD2.trinkets.length} trinket; kahramana, bölgeye ve bossa göre.`, icons: DKD2.trinkets.filter((t) => t.image).slice(0, 4).map((t) => t.image) },
  { href: "esyalar.html", title: "Savaş eşyaları", badge: "Tür · Fiyat · Etki", text: `${DKD2.items.length} savaş eşyası, türlerine göre.`, icons: DKD2.items.filter((t) => t.image).slice(0, 4).map((t) => t.image) },
  { href: "bosslar.html", title: "Bosslar", badge: "İstatistikler · Davranış", text: `${DKD2.bosses.length} boss ve nasıl dövüştükleri.`, img: DKD2.bosses.find((b) => b.name === "Shambler")?.image },
];

document.getElementById("sections").replaceChildren(
  ...sections.map((s) =>
    el(
      "a",
      { class: "game-card", href: s.href },
      s.img ? el("img", { class: "card-img dd-card-img", src: s.img, alt: "" }) : null,
      s.icons ? el("div", { class: "dd-collage", "aria-hidden": "true" }, s.icons.map((src) => el("img", { src, alt: "" }))) : null,
      el("span", { class: "badge" }, s.badge),
      el("h2", {}, s.title),
      el("p", {}, s.text)
    )
  )
);
