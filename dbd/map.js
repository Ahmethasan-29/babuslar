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

  // DBD haritalarının bir kısmı her maçta rastgele oluşur. Üstten şema (schema) sabit binaları, çıkış kapılarını ve parça
  // yerleşimini gösterir; harita planı (outline) kapalı haritalarda kat planı, açık haritalarda dış sınır ve büyüklüktür.
  const outline = map.layoutKind === "outline";
  const layouts = map.layouts.length
    ? el(
        "div",
        { class: "dbd-layouts" },
        map.layouts.map((src, i) =>
          el(
            "figure",
            { class: `radar dbd-layout${outline ? " dbd-outline" : ""}` },
            el("img", { src, alt: `${map.name} ${outline ? "harita planı" : "üstten şeması"}`, width: 688, height: 688 }),
            map.layouts.length > 1 ? el("figcaption", {}, layoutCaption(src, i)) : null
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
        el(
          "p",
          { class: "tile-sub dbd-note" },
          outline
            ? "Bu görsel wikideki harita planıdır: kapalı haritalarda katları ve odaları, açık haritalarda yalnızca dış sınırı ve büyüklüğü gösterir. Açık haritaların içi her maçta rastgele oluşur."
            : "Haritanın bir kısmı her maçta rastgele oluşur. Ana bina, çıkış kapıları ve sabit yapılar şemadaki yerlerinde kalır."
        )
      )
    )
  );
}

// Birden çok görseli olan haritalarda etiket: kat, bölüm ya da çeşit.
function layoutCaption(src, i) {
  if (/_up\.png|UpperFloor/i.test(src)) return "Üst kat";
  if (/_down\.png|LowerFloor/i.test(src)) return "Alt kat";
  if (/Surface/i.test(src)) return "Yüzey";
  if (/Dungeon/i.test(src)) return "Zindan";
  if (/IIOutline/.test(src)) return "II. çeşit";
  if (/Outline/.test(src)) return "I. çeşit";
  return `Şema ${i + 1}`;
}
