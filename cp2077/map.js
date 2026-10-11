// Night City haritası: Cyberpunk Wiki'nin etkileşimli haritasındaki önemli yerler ve ikonik silahların yerleri.
const panel = document.getElementById("panel");
const search = document.getElementById("search");
const params = new URLSearchParams(location.search);
const GROUPS = Object.keys(CP_TR.groups);
const groups = new Set(GROUPS);
const groupOf = (cat) => CP_TR.placeGroups[cat] || "other";
const groupName = (g) => L(...CP_TR.groups[g].name);
const color = (g) => CP_TR.groups[g].color;

const iconics = CP.weapons.filter((w) => w.iconic && w.at);
// Aynı yerdeki silahlar üst üste binmesin: aynı noktadakiler küçük bir çember üzerinde dağıtılır.
const spots = {};
for (const w of iconics) (spots[`${w.at.x},${w.at.y}`] ||= []).push(w);

const markers = [
  ...CP.map.places.map((p) => ({ px: p.x, py: p.y, label: p.name, color: color(groupOf(p.cat)), size: "pin", data: { kind: "place", g: groupOf(p.cat), p } })),
  ...Object.values(spots).flatMap((list) =>
    list.map((w, i) => {
      const a = (2 * Math.PI * i) / list.length;
      const r = list.length > 1 ? 0.3 + 0.08 * list.length : 0;
      return { px: w.at.x + r * Math.cos(a), py: w.at.y + r * Math.sin(a) * 0.76, label: w.name, color: color("iconic"), size: w.at.exact ? "cpw" : "cpw area", data: { kind: "weapon", g: "iconic", w } };
    })
  ),
];

function show(m) {
  if (!m) {
    fillChildren(
      panel,
      el("h2", {}, "Night City"),
      el(
        "p",
        { class: "tile-sub" },
        L(
          "Haritayı sürükleyip tekerlekle (telefonda iki parmakla) yakınlaştır. Pembe işaretler ikonik silahlar: tıklayınca nerede ve nasıl alındığını gösteren kısa video açılır. Halkalı işaretler yalnızca bölgeyi gösterir, tam yeri videoda.",
          "Drag the map and zoom with the wheel (pinch on phones). Pink markers are iconic weapons: click one for a short video showing where and how to get it. Ringed markers only show the district; the exact spot is in the video."
        )
      ),
      el(
        "ul",
        { class: "mb-legend" },
        GROUPS.map((g) => el("li", {}, el("span", { class: "mb-swatch", style: `--c:${color(g)}` }, ""), `${groupName(g)} (${markers.filter((x) => x.data.g === g).length})`))
      ),
      el("p", { class: "tile-sub" }, L(`Haritada yeri olmayan ikonik silahlar (görev ödülleri vb.) Silahlar sayfasında.`, "Iconic weapons without a spot on the map (quest rewards etc.) are on the Weapons page."))
    );
    return;
  }
  if (m.data.kind === "weapon") {
    fillChildren(panel, ...weaponDetail(m.data.w, { listLink: true }));
    return;
  }
  const p = m.data.p;
  const here = iconics.filter((w) => w.at.exact && w.at.place === p.name);
  fillChildren(
    panel,
    el("h2", {}, p.name),
    el("div", { class: "tags" }, el("span", { class: "badge mb-fac", style: `--c:${color(m.data.g)}` }, IS_EN ? p.cat : CP_TR.placeCats[p.cat] || p.cat)),
    p.sub || p.district ? el("p", { class: "tile-sub" }, [p.sub, p.district].filter(Boolean).join(", ")) : null,
    here.length
      ? el(
          "div",
          {},
          el("h4", {}, L("Buradaki ikonik silahlar", "Iconic weapons here")),
          el("ul", { class: "mb-list" }, here.map((w) => el("li", {}, el("button", { class: "linklike", type: "button", onclick: () => viewer.select(markers.find((x) => x.data.w === w), true) }, w.name))))
        )
      : null
  );
}

const viewer = createMapViewer(document.getElementById("map"), {
  url: CP.map.image,
  width: CP.map.width,
  height: CP.map.height,
  alt: "Night City",
  markers,
  onSelect: show,
});

function updateGroups() {
  document.getElementById("groups").replaceChildren(
    ...GROUPS.map((g) => {
      const b = el("button", { class: "chip", type: "button", "aria-pressed": String(groups.has(g)), onclick: () => (groups.has(g) ? groups.delete(g) : groups.add(g), updateGroups()) }, groupName(g));
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${color(g)}` }));
      return b;
    })
  );
  viewer.filter((m) => groups.has(m.data.g));
}

function focus(hit) {
  if (!hit) return;
  if (hit.node.hidden) {
    groups.add(hit.data.g);
    updateGroups();
  }
  viewer.select(hit, true);
}

search.addEventListener("input", () => {
  const q = normalize(search.value.trim());
  if (q.length < 2) return;
  focus(markers.find((m) => normalize(m.label) === q) || markers.find((m) => normalize(m.label).startsWith(q)) || markers.find((m) => normalize(m.label).includes(q)));
});

updateGroups();
show(null);
const wanted = params.get("silah");
// Bağlantıyla gelen silah: harita sahnesi boyutlandıktan sonra ortalanır (hemen yapılırsa konum kayar).
if (wanted) requestAnimationFrame(() => setTimeout(() => focus(markers.find((m) => m.data.w?.id === wanted)), 100));
