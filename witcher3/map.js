// Witcher 3 bölge haritaları: witcher3map projesinin karolarından birleştirilen resimler ve işaretleri.
const panel = document.getElementById("panel");
const search = document.getElementById("search");
const params = new URLSearchParams(location.search);
let region = W3.regions.find((r) => r.id === params.get("bolge")) || W3.regions.find((r) => r.id === "velen");
const GROUPS = Object.keys(W3_TR.groups);
let groups = new Set(GROUPS);
let viewer;
let markers = [];

const cat = (c) => W3_TR.categories[c] || { name: W3.categories[c] || c, note: "", group: "power" };
const catName = (c) => L(cat(c).name, W3.categories[c] || c);
const groupName = (g) => L(W3_TR.groups[g].name, W3_EN.groups[g]);
const regionName = (r) => L(W3_TR.regions[r.id], r.name);

function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}

function show(m) {
  if (!m) {
    fillChildren(panel, 
      el("h2", {}, regionName(region)),
      el("p", { class: "tile-sub" }, L("Haritayı sürükleyip tekerlekle (telefonda iki parmakla) yakınlaştır. Bir işarete tıklayınca ne olduğu burada görünür.", "Drag the map and zoom with the wheel (pinch on phones). Click a marker to see what it is.")),
      el(
        "ul",
        { class: "mb-legend" },
        GROUPS.map((g) => el("li", {}, el("span", { class: "mb-swatch", style: `--c:${W3_TR.groups[g].color}` }, ""), `${groupName(g)} (${region.markers.filter((x) => cat(x.c).group === g).length})`))
      )
    );
    return;
  }
  const d = m.data;
  const info = cat(d.c);
  // İngilizce açıklamadaki "(lvl 6 Rotfiends)" gibi canavar bilgisi Türkçede de gösterilir.
  const extra = (d.d || "").match(/\(lvl[^)]*\)/g);
  fillChildren(panel, 
    el("h2", {}, d.l || catName(d.c)),
    el("div", { class: "tags" }, el("span", { class: "badge mb-fac", style: `--c:${W3_TR.groups[info.group].color}` }, catName(d.c))),
    IS_EN ? (d.d ? el("p", {}, d.d) : null) : info.note ? el("p", {}, info.note) : null,
    !IS_EN && extra ? el("p", {}, el("strong", {}, "Canavar: "), extra.join(", ")) : null,
    !IS_EN && d.d && d.d !== info.note ? el("details", { class: "dd-uses" }, el("summary", {}, "Haritadaki not (İngilizce)"), el("p", {}, d.d)) : null
  );
}

function draw() {
  document.getElementById("regions").replaceChildren(
    ...W3.regions.map((r) => chip(regionName(r), r === region, () => ((region = r), history.replaceState(null, "", `?bolge=${r.id}`), draw())))
  );
  markers = region.markers.map((d) => ({ px: d.x, py: d.y, label: d.l || catName(d.c), color: W3_TR.groups[cat(d.c).group].color, size: d.c === "signpost" ? "town" : "pin", data: d }));
  viewer = createMapViewer(document.getElementById("map"), {
    url: region.image,
    width: region.width,
    height: region.height,
    alt: regionName(region),
    markers,
    onSelect: show,
  });
  updateGroups();
  show(null);
}

function updateGroups() {
  document.getElementById("groups").replaceChildren(
    ...GROUPS.map((g) => {
      const b = chip(groupName(g), groups.has(g), () => {
        groups.has(g) ? groups.delete(g) : groups.add(g);
        updateGroups();
      });
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${W3_TR.groups[g].color}` }));
      return b;
    })
  );
  viewer.filter((m) => groups.has(cat(m.data.c).group));
}

search.addEventListener("input", () => {
  const q = normalize(search.value.trim());
  if (q.length < 2) return;
  const text = (m) => normalize(`${m.label} ${catName(m.data.c)} ${W3.categories[m.data.c] || ""}`);
  const hit = markers.find((m) => normalize(m.label) === q) || markers.find((m) => normalize(m.label).startsWith(q)) || markers.find((m) => text(m).includes(q));
  if (!hit) return;
  if (hit.node.hidden) {
    groups.add(cat(hit.data.c).group);
    updateGroups();
  }
  viewer.select(hit, true);
});

draw();
