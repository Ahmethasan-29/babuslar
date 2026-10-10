// Darkest Dungeon bölüm seçimi: Kahramanlar, Trinket'lar, Bosslar, Eşyalar.
const heroImg = (name) => DKD.heroes.find((h) => h.name === name && h.image)?.image;
const bossImg = (name) => DKD.bosses.find((b) => b.name === name && b.image)?.image;

const sections = [
  { href: "kahramanlar.html", title: "Kahramanlar", badge: "İstatistikler · Beceriler", text: `${DKD.heroes.length} kahraman: savaş ve kamp becerileri.`, img: heroImg("Crusader") },
  { href: "trinketler.html", title: "Trinket'lar", badge: "Eşya etkileri", text: `${DKD.trinkets.length} trinket; nadirliğe ve kahramana göre.`, icons: DKD.trinkets.filter((t) => t.image && t.rarity === "v").slice(0, 4).map((t) => t.image) },
  { href: "bosslar.html", title: "Bosslar", badge: "İstatistikler · Saldırılar", text: `${DKD.bosses.length} boss ve saldırıları.`, img: bossImg("Necromancer") },
  { href: "esyalar.html", title: "Eşyalar", badge: "Erzak · Miras eşyaları", text: "Meşale, yiyecek, kürek ve diğer erzaklar; miras eşyaları.", icons: DKD.items.filter((i) => i.image).slice(0, 4).map((i) => i.image) },
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
