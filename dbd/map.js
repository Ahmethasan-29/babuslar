const root = document.getElementById("map");
const map = DBD.maps.find((m) => m.id === new URLSearchParams(location.search).get("id"));

if (!map) {
  showNotice(root, "Harita bulunamadı. Listeden bir harita seç.");
} else {
  document.title = `${map.name} · Dead by Daylight · Babuşlar`;

  const hero = el(
    "section",
    { class: "champ-hero map-hero" },
    el("div", { class: "champ-hero-body" }, el("h1", {}, map.name), el("p", { class: "map-summary" }, map.realm))
  );
  if (map.image) hero.style.backgroundImage = `url("${map.image}")`;

  // DBD haritalarının bir kısmı her maçta rastgele oluşur; şema sabit binaları, çıkış kapılarını ve parça yerleşimini gösterir.
  const layouts = map.layouts.length
    ? el(
        "div",
        { class: "dbd-layouts" },
        map.layouts.map((src, i) =>
          el(
            "figure",
            { class: "radar dbd-layout" },
            el("img", { src, alt: `${map.name} üstten şeması`, width: 688, height: 688 }),
            map.layouts.length > 1 ? el("figcaption", {}, /_up\.png/i.test(src) ? "Üst kat" : /_down\.png/i.test(src) ? "Alt kat" : `Şema ${i + 1}`) : null
          )
        )
      )
    : el("p", { class: "notice" }, "Bu haritanın üstten şeması henüz yok.");

  root.replaceChildren(
    hero,
    el(
      "div",
      { class: "map-layout" },
      layouts,
      el(
        "div",
        { class: "build-card map-panel" },
        el("h3", {}, "Harita hakkında"),
        richText((!IS_EN && typeof DBD_TR_MAPS !== "undefined" && DBD_TR_MAPS[map.name]) || map.description),
        el("p", { class: "tile-sub dbd-note" }, "Haritanın bir kısmı her maçta rastgele oluşur. Ana bina, çıkış kapıları ve sabit yapılar şemadaki yerlerinde kalır.")
      )
    )
  );
}
