const root = document.getElementById("map");
const m = R6.maps.find((x) => x.id === new URLSearchParams(location.search).get("id"));

if (!m) showNotice(root, "Harita bulunamadı. Listeden bir harita seç.");
else render();

// Hedef listesi (bomba, bölge, rehine); wikide liste yoksa açıkça yazılır.
function objectiveList(items) {
  return items.length ? el("ul", { class: "r6-objectives" }, items.map((x) => el("li", {}, x))) : el("p", { class: "tile-sub" }, "Wikide bu harita için liste yok.");
}

function render() {
  document.title = `${m.name} · Rainbow Six Siege · Babuşlar`;
  const summary = IS_EN ? m.quote || m.overview[0] || "" : R6_TR.maps[m.id] || "";

  const hero = el(
    "section",
    { class: "champ-hero map-hero r6-map-hero" },
    // Arka plan CSS ile değil <img> ile: wiki, CSS isteklerine resim yerine boş yer tutucu döndürüyor.
    m.image ? el("img", { class: "r6-map-hero-img", src: thumb(m.image, 1100), alt: "" }) : null,
    el("div", { class: "champ-hero-body" }, el("h1", {}, m.name), m.place ? el("p", { class: "title" }, m.place) : null, summary ? el("p", { class: "map-summary" }, summary) : null)
  );

  // Kat planları: çiplerle kat seçilir; plan site içinde büyük pencerede açılır (wikiye gitmez).
  let floorSection;
  if (m.floors.length) {
    let current = 0;
    const chips = el("div", { class: "chips", role: "group", "aria-label": "Kat seç" });
    const view = el("div", { class: "r6-floor" });
    const show = () => {
      chips.replaceChildren(...m.floors.map((f, i) => el("button", { class: "chip", type: "button", "aria-pressed": String(i === current), onclick: () => ((current = i), show()) }, floorName(f.caption, i, m.floors.length))));
      const f = m.floors[current];
      view.replaceChildren(
        el("button", { class: "r6-floor-open", type: "button", title: "Büyüt", onclick: () => openPlan(f, current) }, el("img", { src: thumb(f.url, 1600), alt: `${m.name} · ${floorName(f.caption, current, m.floors.length)}` })),
        el("button", { class: "chip r6-floor-zoom", type: "button", onclick: () => openPlan(f, current) }, "⛶ Planı büyüt")
      );
    };
    show();
    floorSection = el("section", { class: "section" }, el("h2", {}, "Kat planları"), chips, view);
  } else {
    floorSection = el("section", { class: "section" }, el("h2", {}, "Kat planları"), el("p", { class: "notice" }, "Bu haritanın kat planları wikide henüz yok."));
  }

  const objectives = el(
    "section",
    { class: "section" },
    el("h2", {}, "Hedef odalar"),
    el(
      "div",
      { class: "r6-loadout" },
      el("div", { class: "build-card" }, el("h3", {}, "Bomba yerleri"), objectiveList(m.bomb)),
      m.secure.length ? el("div", { class: "build-card" }, el("h3", {}, "Secure Area"), objectiveList(m.secure)) : null,
      m.hostage.length ? el("div", { class: "build-card" }, el("h3", {}, "Hostage"), objectiveList(m.hostage)) : null
    )
  );

  root.replaceChildren(hero, objectives, floorSection);
}

// Kat planı penceresi: sitede kalır. Resme tıklayınca gerçek boyutuna yakınlaşır, kaydırarak gezilir.
let planDialog;
function openPlan(f, index) {
  if (!planDialog) {
    planDialog = el(
      "dialog",
      { class: "video-dialog r6-plan-dialog", "aria-label": "Kat planı" },
      el("button", { class: "close", type: "button", "aria-label": "Kapat", onclick: () => planDialog.close() }, "×"),
      el("h2", { class: "video-dialog-title" }),
      el("p", { class: "tile-sub r6-plan-hint" }, "Yakınlaştırmak için resme tıkla."),
      el("div", { class: "r6-plan-scroll" }, el("img", { alt: "" }))
    );
    const box = planDialog.querySelector(".r6-plan-scroll");
    box.querySelector("img").addEventListener("click", () => box.classList.toggle("zoomed"));
    planDialog.addEventListener("click", (event) => {
      if (event.target === planDialog) planDialog.close();
    });
    document.body.append(planDialog);
  }
  const name = `${m.name} · ${floorName(f.caption, index, m.floors.length)}`;
  planDialog.querySelector(".video-dialog-title").textContent = name;
  planDialog.querySelector(".r6-plan-scroll").classList.remove("zoomed");
  const img = planDialog.querySelector("img");
  img.src = f.url;
  img.alt = name;
  planDialog.showModal();
}
