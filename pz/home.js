// Project Zomboid bölüm seçimi.
const sections = [
  {
    href: "karakter.html",
    title: L("Karakter planlayıcı", "Character planner"),
    badge: L("Meslekler · Özellikler · Puan", "Occupations · Traits · Points"),
    text: L(
      `${PZ.occupations.length} meslek ve ${PZ.traits.filter((t) => t.kind !== "occupation").length} özellik: puanları, verdikleri beceriler. Seç, kalan puanı ve başlangıç becerilerini gör.`,
      `${PZ.occupations.length} occupations and ${PZ.traits.filter((t) => t.kind !== "occupation").length} traits with their points and skills. Pick them and see your points left and starting skills.`
    ),
    img: PZ.occupations.find((o) => o.name === "Burglar")?.icon,
  },
  {
    href: "silahlar.html",
    title: L("Silahlar", "Weapons"),
    badge: L("Hasar · Menzil · Hız · Dayanıklılık", "Damage · Range · Speed · Durability"),
    text: L(`${PZ.weapons.length} silah: baltalar, sopalar, bıçaklar, mızraklar ve ateşli silahlar. Hasara, menzile ya da dayanıklılığa göre sırala.`, `${PZ.weapons.length} weapons: axes, blunts, blades, spears and firearms. Sort by damage, range or durability.`),
  },
  {
    href: "harita.html",
    title: L("Knox Country haritası", "Knox Country map"),
    badge: L("Kasabalar · Başlangıç noktaları", "Towns · Starting points"),
    text: L(`${PZ.towns.length} yer oyun içi koordinatlarıyla: hangi kasabada başlanır, nerede ne var, turist haritaları.`, `${PZ.towns.length} places at their in-game coordinates: starting towns, what's where and tourist maps.`),
    img: PZ.towns.find((t) => t.name === "Muldraugh")?.map,
  },
  {
    href: "rehber.html",
    title: L("Rehber", "Guide"),
    badge: L("İlk gün · Enfeksiyon · Su ve elektrik", "First day · Infection · Water & power"),
    text: L("Yeni başlayanların en çok sorduğu sorular: ilk gün ne yapılır, ısırık ne demek, su ve elektrik ne zaman gider.", "The questions new players ask most: what to do on day one, what a bite means, when water and power go out."),
  },
];
document.getElementById("cards").replaceChildren(
  ...sections.map((s) =>
    el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
  )
);
