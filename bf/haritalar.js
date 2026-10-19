// Battlefield haritaları (ortak sayfa): oyunun data.js dosyasındaki BF.maps; ana oyun / DLC'ye göre süzme.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const GROUPS = [...new Set(BF.maps.map((m) => m.group))];
let group = "all";
const mapGroup = (g) => (g === BF.game || /^base/i.test(g) ? L("Ana oyun", "Base game") : g);
// Wikideki "All", "All, including …" gibi mod yazıları Türkçeleştirilir (mod adları oyundaki gibi kalır).
const modeName = (x) =>
  IS_EN
    ? x
    : x
        .replace(/^All( Gametypes)?$/i, "Tüm modlar")
        .replace(/^All;\s*/i, "Tüm modlar: ")
        .replace(/^All,? including /i, "Tüm modlar, ayrıca ")
        .replace(/^All base (game )?modes,?\s*(and )?/i, "Tüm temel modlar, ")
        .replace(/,? and /g, " ve ");

function card(m) {
  return el(
    "article",
    { class: "build-card bf-card bf-map" },
    m.image ? el("img", { class: "bf-map-img", src: thumb(m.image, 600), alt: "", loading: "lazy" }) : null,
    el("h3", {}, m.name),
    el("p", { class: "tile-sub" }, [mapGroup(m.group), m.place, m.date].filter(Boolean).join(" · ")),
    m.terrain ? el("p", { class: "tile-sub" }, el("strong", {}, L("Arazi: ", "Terrain: ")), m.terrain) : null,
    m.modes.length ? el("div", { class: "tags" }, m.modes.map((x) => el("span", { class: "badge" }, modeName(x)))) : null,
    m.desc ? el("details", { class: "dd-uses" }, el("summary", {}, L("Tanıtım (İngilizce)", "Description")), el("p", {}, m.desc)) : null
  );
}

function render() {
  document.getElementById("groups").replaceChildren(
    ...[["all", L("Hepsi", "All")], ...GROUPS.map((g) => [g, mapGroup(g)])].map(([k, n]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(group === k), onclick: () => ((group = k), render()) }, `${n} (${k === "all" ? BF.maps.length : BF.maps.filter((m) => m.group === k).length})`)
    )
  );
  const q = normalize(search.value.trim());
  const items = BF.maps.filter((m) => (group === "all" || m.group === group) && (!q || normalize(`${m.name} ${m.place} ${m.group} ${m.modes.join(" ")}`).includes(q)));
  count.textContent = L(`${items.length} harita`, `${items.length} maps`);
  if (!items.length) return showNotice(list, L("Aramana uyan harita bulunamadı.", "No maps match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
