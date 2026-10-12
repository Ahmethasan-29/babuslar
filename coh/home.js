// Company of Heroes oyun sayfası: birlikler, komutanlar ve haritalar kartları (olmayan bölüm gösterilmez).
const firstImage = (list, key) => list.find((x) => x[key])?.[key];
document.getElementById("cards").replaceChildren(
  ...[
    COH.units?.length && {
      href: "birlikler.html",
      title: L("Birlikler", "Units"),
      badge: L("Fiyat · Nüfus · Üretim binası", "Cost · Population · Production"),
      text: L(`${COH.units.length} birlik: fiyatı, nüfusu, hangi binada üretildiği ve neye karşı etkili olduğu.`, `${COH.units.length} units: cost, population, where they're built and what they counter.`),
      img: firstImage(COH.units.filter((u) => u.cat === "vehicles"), "icon"),
      icon: true,
    },
    COH.commanders?.length && {
      href: "komutanlar.html",
      title: commanderLabel(true),
      badge: L("Dallar · Yetenekler", "Branches · Abilities"),
      text: L(`${COH.commanders.length} ${commanderLabel(false).toLocaleLowerCase("tr")} ve açtığı yetenekler.`, `${COH.commanders.length} ${commanderLabel(true).toLowerCase()} and the abilities they unlock.`),
      img: firstImage(COH.commanders, "image") || firstImage(COH.commanders, "icon"),
    },
    COH.maps?.length && {
      href: "haritalar.html",
      title: L("Haritalar", "Maps"),
      badge: L("Oyuncu sayısı · Kaynak noktaları", "Players · Resource points"),
      text: L(`${COH.maps.length} çok oyunculu harita: kaç kişilik olduğu ve yakıt/mühimmat noktaları.`, `${COH.maps.length} multiplayer maps: player count and fuel/munitions points.`),
      img: firstImage(COH.maps, "image"),
    },
  ]
    .filter(Boolean)
    .map((s) =>
      el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: `card-img${s.icon ? " coh-card-icon" : ""}`, src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text))
    )
);
// Fraksiyonlar: her biri o fraksiyonun birliklerine gider.
document.getElementById("factions").replaceChildren(
  ...COH.factions.map((f) =>
    el(
      "a",
      { class: "chip", href: `birlikler.html?fraksiyon=${f.id}` },
      el("span", { class: "coh-dot", style: `background:${f.color}` }),
      `${T(f.name)}${f.side ? ` · ${L(...COH_TR.sides[f.side])}` : ""}`
    )
  )
);
