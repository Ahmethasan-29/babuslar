// Sea of Thieves haritası: oyundaki A–Z / 1–26 ızgarası çizilir, her yer wikideki koordinatının (ör. G-16) karesine konur.
const panel = document.getElementById("panel");
const search = document.getElementById("search");
const KINDS = Object.keys(SOT_TR.kinds).filter((k) => SOT.places.some((p) => p.kind === k));
const shown = new Set(KINDS);
const region = (p) => SOT_TR.regions[p.region] || SOT_TR.regions[""];
const kindName = (k) => L(...SOT_TR.kinds[k]);

// Izgara resmi (SVG): 26×26 kare, üstte harfler, solda sayılar.
function gridSvg() {
  const S = 100;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${26 * S} ${26 * S}"><rect width="100%" height="100%" fill="#0f3d4c"/>`;
  for (let i = 0; i <= 26; i++) s += `<line x1="${i * S}" y1="0" x2="${i * S}" y2="${26 * S}" stroke="#2a6475" stroke-width="2"/><line x1="0" y1="${i * S}" x2="${26 * S}" y2="${i * S}" stroke="#2a6475" stroke-width="2"/>`;
  for (let i = 0; i < 26; i++) {
    s += `<text x="${i * S + S / 2}" y="22" fill="#9cc7d3" font-size="20" font-family="sans-serif" text-anchor="middle">${String.fromCharCode(65 + i)}</text>`;
    s += `<text x="6" y="${i * S + 24}" fill="#9cc7d3" font-size="20" font-family="sans-serif">${i + 1}</text>`;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s + "</svg>")}`;
}

const markers = SOT.places.map((p) => ({ px: p.x, py: p.y, label: p.name, color: region(p).color, size: SOT_TR.kindSize[p.kind] || "pin", data: p }));

function show(m) {
  if (!m) {
    fillChildren(
      panel,
      el("h2", {}, "Sea of Thieves"),
      el("p", { class: "tile-sub" }, L("Haritayı sürükleyip tekerlekle yakınlaştır. Her yer oyundaki ızgara koordinatının karesinde durur; arama kutusuna koordinat da yazabilirsin (ör. G-16).", "Drag and zoom the map. Every place sits in its in-game grid square; you can also search by coordinate (e.g. G-16).")),
      el(
        "ul",
        { class: "mb-legend" },
        Object.entries(SOT_TR.regions)
          .filter(([r]) => SOT.places.some((p) => p.region === r))
          .map(([r, v]) => el("li", {}, el("span", { class: "mb-swatch", style: `--c:${v.color}` }, ""), `${r || L("Bölgesiz", "No region")}${!IS_EN && r ? ` — ${v.tr}` : ""} (${SOT.places.filter((p) => p.region === r).length})`))
      )
    );
    return;
  }
  const p = m.data;
  fillChildren(
    panel,
    el("h2", {}, p.name),
    el("div", { class: "tags" }, el("span", { class: "badge mb-fac", style: `--c:${region(p).color}` }, p.region || L("Bölgesiz", "No region")), el("span", { class: "badge" }, kindName(p.kind)), el("span", { class: "badge cp-iconic" }, p.grid)),
    p.image ? el("img", { class: "pz-town-img", src: p.image.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/500"), alt: "", loading: "lazy" }) : null,
    L(...SOT_TR.kindNote[p.kind]) ? el("p", { class: "tile-sub" }, L(...SOT_TR.kindNote[p.kind])) : null,
    p.note ? el("p", {}, p.note) : null,
    p.animals.length ? el("p", {}, el("strong", {}, L("Hayvanlar: ", "Animals: ")), p.animals.map((a) => (IS_EN ? a[0].toUpperCase() + a.slice(1) + "s" : SOT_TR.animals[a])).join(", ")) : null,
    p.features.length ? el("details", { class: "dd-uses" }, el("summary", {}, L("Adada neler var (wiki, İngilizce)", "What's on the island")), el("ul", {}, p.features.map((f) => el("li", { class: f.startsWith("—") ? "sub" : "" }, f.replace(/^— /, ""))))) : null,
    p.map ? el("details", { class: "dd-uses" }, el("summary", {}, L("Harita masasındaki görünümü", "As seen on the map table")), el("img", { class: "pz-town-img", src: p.map.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/500"), alt: "", loading: "lazy" })) : null
  );
}

const viewer = createMapViewer(document.getElementById("map"), { url: gridSvg(), width: 2600, height: 2600, alt: "Sea of Thieves", markers, onSelect: show });

function updateKinds() {
  document.getElementById("kinds").replaceChildren(
    ...KINDS.map((k) => el("button", { class: "chip", type: "button", "aria-pressed": String(shown.has(k)), onclick: () => (shown.has(k) ? shown.delete(k) : shown.add(k), updateKinds()) }, `${kindName(k)} (${SOT.places.filter((p) => p.kind === k).length})`))
  );
  viewer.filter((m) => shown.has(m.data.kind));
}

search.addEventListener("input", () => {
  const q = normalize(search.value.trim());
  if (q.length < 2) return;
  const grid = search.value.trim().toUpperCase().replace(/\s/g, "");
  const hit = markers.find((m) => m.data.grid === grid) || markers.find((m) => normalize(m.label) === q) || markers.find((m) => normalize(m.label).startsWith(q)) || markers.find((m) => normalize(m.label).includes(q));
  if (!hit) return;
  if (!shown.has(hit.data.kind)) (shown.add(hit.data.kind), updateKinds());
  viewer.select(hit, true);
});

updateKinds();
show(null);
