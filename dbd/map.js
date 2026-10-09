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

  // Üstten şema: sabit binaları, çıkış kapılarını ve parça yerleşimini gösterir (haritanın kalanı her maçta rastgele oluşur).
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
    : null;

  const description = (!IS_EN && typeof DBD_TR_MAPS !== "undefined" && DBD_TR_MAPS[map.name]) || map.description;

  const panel = el(
    "div",
    { class: "map-panel dbd-map-panel" },
    generatorCard(),
    el("div", { class: "build-card" }, el("h3", {}, "Harita hakkında"), richText(description))
  );

  root.replaceChildren(hero, layouts ? el("div", { class: "map-layout" }, layouts, panel) : panel);
}

// Bilinen jeneratör noktaları (gens.js). Sabit olanlar her maç oradadır, olası olanlar bazı maçlarda.
function generatorCard() {
  const gens = (typeof DBD_GENS !== "undefined" && DBD_GENS[map.name]) || [];
  const text = (g) => (IS_EN ? g.en : g.tr);
  return el(
    "div",
    { class: "build-card dbd-gens" },
    el("h3", {}, "Jeneratör noktaları"),
    gens.length
      ? el(
          "ul",
          { class: "gen-list" },
          gens.map((g) =>
            el("li", {}, el("span", { class: `gen-tag${g.sure ? " sure" : ""}` }, g.sure ? "Sabit" : "Olası"), el("span", {}, text(g)))
          )
        )
      : el("p", { class: "tile-sub" }, "Bu harita için bilinen sabit bir jeneratör noktası yok."),
    el(
      "p",
      { class: "tile-sub dbd-note" },
      "Her maçta 7 jeneratör çıkar. Burada yazanlar dışındaki jeneratörler, haritanın her maçta değişen bölümlerinde rastgele noktalarda çıkar."
    )
  );
}
