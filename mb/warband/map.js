// Calradia haritası: oyunun koordinatlarına göre yerleştirilmiş şehir, kale ve köy işaretleri.
const panel = document.getElementById("panel");
const search = document.getElementById("search");
const byId = Object.fromEntries(WB.places.map((p) => [p.id, p]));
const facName = (id) => (IS_EN ? WB.factions.find((f) => f.id === id)?.name : WB_TR.factions[id]) || "—";
const facColor = (id) => WB.factions.find((f) => f.id === id)?.color || "#999";
const typeName = wbType;

const markers = WB.places.map((p) => ({ px: p.px, py: p.py, label: p.name, color: facColor(p.faction), size: p.type, data: p }));
const viewer = createMapViewer(document.getElementById("map"), {
  url: WB.map.url,
  width: WB.map.width,
  height: WB.map.height,
  alt: L("Calradia haritası", "Map of Calradia"),
  markers,
  onSelect: show,
});

function placeLink(p) {
  return el("button", { class: "linklike", type: "button", onclick: () => viewer.select(markers.find((m) => m.data === p), true) }, p.name);
}

function show(m) {
  if (!m) {
    fillChildren(panel, 
      el("h2", {}, L("Bir yer seç", "Pick a place")),
      el(
        "p",
        { class: "tile-sub" },
        L(
          "Haritadaki bir işarete tıkla ya da yukarıdan ara. Büyük noktalar şehir, karolar kale, küçük noktalar köy; renk, oyun başındaki krallığı gösterir.",
          "Click a marker or search above. Large dots are towns, diamonds castles, small dots villages; the colour shows the kingdom at the start of the game."
        )
      ),
      el(
        "ul",
        { class: "mb-legend" },
        WB.factions.map((f) => el("li", {}, el("span", { class: "mb-swatch", style: `--c:${f.color}` }), facName(f.id)))
      )
    );
    return;
  }
  const p = m.data;
  const villages = WB.places.filter((v) => v.bound === p.id);
  const owner = byId[p.bound];
  fillChildren(panel, 
    el("h2", {}, p.name),
    el(
      "div",
      { class: "tags" },
      el("span", { class: "badge" }, typeName(p.type)),
      el("span", { class: "badge mb-fac", style: `--c:${facColor(p.faction)}` }, facName(p.faction))
    ),
    p.type === "village"
      ? el("p", {}, L("Bağlı olduğu yer: ", "Bound to: "), placeLink(owner), ` (${typeName(owner.type)})`)
      : el(
          "div",
          {},
          el("h3", { class: "dd-sub" }, villages.length ? L("Bağlı köyler", "Bound villages") : L("Bağlı köy yok", "No bound villages")),
          villages.length ? el("ul", { class: "mb-list" }, villages.map((v) => el("li", {}, placeLink(v)))) : null
        ),
    el("p", { class: "tile-sub" }, L("Krallık, oyun başındaki durumdur; savaşlarda yerleşimler el değiştirir.", "Kingdoms are as at the start of the game; settlements change hands in wars."))
  );
}

// Filtreler: tür (şehir/kale/köy) ve krallık.
let types = new Set(["town", "castle", "village"]);
let faction = "all";
function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}
function update() {
  document.getElementById("types").replaceChildren(
    ...["town", "castle", "village"].map((t) =>
      chip(`${typeName(t)} (${WB.places.filter((p) => p.type === t).length})`, types.has(t), () => {
        types.has(t) ? types.delete(t) : types.add(t);
        update();
      })
    )
  );
  document.getElementById("factions").replaceChildren(
    chip(L("Tüm krallıklar", "All kingdoms"), faction === "all", () => ((faction = "all"), update())),
    ...WB.factions.map((f) => {
      const b = chip(facName(f.id), faction === f.id, () => ((faction = f.id), update()));
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${f.color}` }));
      return b;
    })
  );
  viewer.filter((m) => types.has(m.data.type) && (faction === "all" || m.data.faction === faction));
}

search.addEventListener("input", () => {
  const q = normalize(search.value.trim());
  if (!q) return;
  const hit =
    markers.find((m) => normalize(m.label) === q) || markers.find((m) => normalize(m.label).startsWith(q)) || markers.find((m) => normalize(m.label).includes(q));
  if (!hit) return;
  if (hit.node.hidden) {
    types = new Set(["town", "castle", "village"]);
    faction = "all";
    update();
  }
  viewer.select(hit, true);
});

update();
show(null);
