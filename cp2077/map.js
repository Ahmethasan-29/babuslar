// Night City ve Badlands haritaları: Cyberpunk Wiki'nin şehir haritasındaki önemli yerler, oyunun uydu haritasında
// Badlands alt bölgeleri ve ikonik silahların yerleri.
const panel = document.getElementById("panel");
const search = document.getElementById("search");
const params = new URLSearchParams(location.search);
const GROUPS = Object.keys(CP_TR.groups);
const groups = new Set(GROUPS);
const groupOf = (cat) => CP_TR.placeGroups[cat] || "other";
const groupName = (g) => L(...CP_TR.groups[g].name);
const color = (g) => CP_TR.groups[g].color;
// Görevle ya da ödül olarak (zula) alınanlar ayrı renkte; gerisi dünyada saklı duran silahlar.
const weaponGroup = (w) => (w.quest || w.at.kind === "stash" ? "quest" : "iconic");
const mapOf = (w) => w.at.map || "city";

const MAPS = {
  city: { name: ["Night City", "Night City"], image: CP.map.image, width: CP.map.width, height: CP.map.height },
  badlands: { name: ["Badlands", "Badlands"], image: CP.badlands.image, width: CP.badlands.width, height: CP.badlands.height },
};
const iconics = CP.weapons.filter((w) => w.iconic && w.at);

// Aynı yerdeki silahlar üst üste binmesin: aynı noktadakiler küçük bir çember üzerinde dağıtılır.
function weaponMarkers(list) {
  const spots = {};
  for (const w of list) (spots[`${w.at.x},${w.at.y}`] ||= []).push(w);
  return Object.values(spots).flatMap((same) =>
    same.map((w, i) => {
      const a = (2 * Math.PI * i) / same.length;
      const r = same.length > 1 ? 0.3 + 0.08 * same.length : 0;
      const g = weaponGroup(w);
      return { px: w.at.x + r * Math.cos(a), py: w.at.y + r * Math.sin(a) * 0.76, label: w.name, color: color(g), size: `cpw ${g}${w.at.exact ? "" : " area"}`, data: { kind: "weapon", g, w } };
    })
  );
}

const MARKERS = {
  city: [
    ...CP.map.places.map((p) => ({ px: p.x, py: p.y, label: p.name, color: color(groupOf(p.cat)), size: "pin", data: { kind: "place", g: groupOf(p.cat), p } })),
    ...weaponMarkers(iconics.filter((w) => mapOf(w) === "city")),
  ],
  badlands: [
    // Alt bölge adları (resmin dışında kalan ortalar atlanır).
    ...CP.badlands.areas
      .filter((a) => a.x > 0 && a.x < 100 && a.y > 0 && a.y < 100)
      .map((a) => ({ px: a.x, py: a.y - 2.5, label: a.name, color: color("other"), size: "town", data: { kind: "area", g: "other", a } })),
    ...weaponMarkers(iconics.filter((w) => mapOf(w) === "badlands")),
  ],
};

let current = MAPS[params.get("harita")] ? params.get("harita") : "city";
let viewer;
const otherName = (g) => (current === "badlands" && g === "other" ? L("Bölge adları", "Area names") : groupName(g));

function show(m) {
  if (!m) {
    const markers = MARKERS[current];
    fillChildren(
      panel,
      el("h2", {}, L(...MAPS[current].name)),
      el(
        "p",
        { class: "tile-sub" },
        L(
          "Haritayı sürükleyip tekerlekle (telefonda iki parmakla) yakınlaştır. Pembe işaretler haritada saklı ikonik silahlar, mor elmaslar görev ödülü ikonikler (işaret görevin geçtiği yerde). Tıklayınca hangi görevden ve nasıl alındığını gösteren kısa video açılır. Halkalı işaretler yalnızca bölgeyi gösterir, tam yeri videoda.",
          "Drag the map and zoom with the wheel (pinch on phones). Pink markers are iconic weapons hidden in the world, purple diamonds are quest rewards (placed where the quest happens). Click one for the quest and a short video showing how to get it. Ringed markers only show the district; the exact spot is in the video."
        )
      ),
      el(
        "ul",
        { class: "mb-legend" },
        GROUPS.filter((g) => markers.some((x) => x.data.g === g)).map((g) =>
          el("li", {}, el("span", { class: "mb-swatch", style: `--c:${color(g)}` }, ""), `${otherName(g)} (${markers.filter((x) => x.data.g === g).length})`)
        )
      ),
      current === "badlands"
        ? el("p", { class: "tile-sub" }, L("Badlands haritası oyunun uydu görüntüsü (NC Zoning Board). Şehirdeki silahlar Night City haritasında.", "The Badlands map is the game's satellite view (NC Zoning Board). Weapons in the city are on the Night City map."))
        : el("p", { class: "tile-sub" }, L("Badlands'teki silahlar (Overwatch, Stinger…) için yukarıdan Badlands haritasını seç.", "For weapons in the Badlands (Overwatch, Stinger…) pick the Badlands map above."))
    );
    return;
  }
  if (m.data.kind === "weapon") {
    fillChildren(panel, ...weaponDetail(m.data.w, { listLink: true }));
    return;
  }
  if (m.data.kind === "area") {
    fillChildren(panel, el("h2", {}, m.data.a.name), el("p", { class: "tile-sub" }, "Badlands"), hereList(iconics.filter((w) => mapOf(w) === "badlands" && w.at.place === m.data.a.name)));
    return;
  }
  const p = m.data.p;
  fillChildren(
    panel,
    el("h2", {}, p.name),
    el("div", { class: "tags" }, el("span", { class: "badge mb-fac", style: `--c:${color(m.data.g)}` }, IS_EN ? p.cat : CP_TR.placeCats[p.cat] || p.cat)),
    p.sub || p.district ? el("p", { class: "tile-sub" }, [p.sub, p.district].filter(Boolean).join(", ")) : null,
    hereList(iconics.filter((w) => mapOf(w) === "city" && w.at.exact && w.at.place === p.name))
  );
}

function hereList(list) {
  if (!list.length) return null;
  return el(
    "div",
    {},
    el("h4", {}, L("Buradaki ikonik silahlar", "Iconic weapons here")),
    el("ul", { class: "mb-list" }, list.map((w) => el("li", {}, el("button", { class: "linklike", type: "button", onclick: () => viewer.select(MARKERS[current].find((x) => x.data.w === w), true) }, w.name))))
  );
}

function draw() {
  document.getElementById("maps").replaceChildren(
    ...Object.entries(MAPS).map(([id, m]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(id === current), onclick: () => id !== current && ((current = id), history.replaceState(null, "", `?harita=${id}`), draw()) }, L(...m.name))
    )
  );
  viewer = createMapViewer(document.getElementById("map"), { url: MAPS[current].image, width: MAPS[current].width, height: MAPS[current].height, alt: L(...MAPS[current].name), markers: MARKERS[current], onSelect: show });
  updateGroups();
  show(null);
}

function updateGroups() {
  document.getElementById("groups").replaceChildren(
    ...GROUPS.filter((g) => MARKERS[current].some((x) => x.data.g === g)).map((g) => {
      const b = el("button", { class: "chip", type: "button", "aria-pressed": String(groups.has(g)), onclick: () => (groups.has(g) ? groups.delete(g) : groups.add(g), updateGroups()) }, otherName(g));
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${color(g)}` }));
      return b;
    })
  );
  viewer.filter((m) => groups.has(m.data.g));
}

// Aranan ya da bağlantıyla gelen işaret: gerekirse önce doğru harita açılır; sahne boyutlandıktan sonra ortalanır
// (hemen yapılırsa konum kayar).
function focus(find) {
  if (!MARKERS[current].some(find)) {
    const id = Object.keys(MARKERS).find((k) => MARKERS[k].some(find));
    if (!id) return;
    current = id;
    history.replaceState(null, "", `?harita=${id}`);
    draw();
  }
  const hit = MARKERS[current].find(find);
  if (hit.node.hidden) {
    groups.add(hit.data.g);
    updateGroups();
  }
  requestAnimationFrame(() => setTimeout(() => viewer.select(hit, true), 100));
}

search.addEventListener("input", () => {
  const q = normalize(search.value.trim());
  if (q.length < 2) return;
  const all = Object.values(MARKERS).flat();
  const hit = all.find((m) => normalize(m.label) === q) || all.find((m) => normalize(m.label).startsWith(q)) || all.find((m) => normalize(m.label).includes(q));
  if (hit) focus((m) => m === hit);
});

const wanted = params.get("silah");
const target = wanted && iconics.find((w) => w.id === wanted);
if (target) current = mapOf(target);
draw();
if (target) focus((m) => m.data.w === target);
