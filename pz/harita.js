// Knox Country kasaba haritası: kasabalar PZwiki'deki oyun içi koordinatlarına (kare/tile) göre çizilir.
// Oyunda x doğuya, y güneye doğru artar; SVG ile aynı yön.
const panel = document.getElementById("panel");
const towns = PZ.towns;
const PAD = 900;
const minX = Math.min(...towns.map((t) => t.x)) - PAD;
const maxX = Math.max(...towns.map((t) => t.x)) + PAD;
const minY = Math.min(...towns.map((t) => t.y)) - PAD;
const maxY = Math.max(...towns.map((t) => t.y)) + PAD;
const SVG = "http://www.w3.org/2000/svg";
const isSpawn = (t) => PZ_TR.spawns.includes(t.name);
const isTown = (t) => /town|city/i.test(t.type);

function svg(tag, attrs, ...kids) {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...kids);
  return n;
}

function show(t) {
  for (const g of root.querySelectorAll(".pz-town")) g.classList.toggle("on", g.dataset.name === t?.name);
  if (!t) {
    fillChildren(
      panel,
      el("h2", {}, "Knox Country"),
      el("p", { class: "tile-sub" }, L("Kasabalar oyundaki koordinatlarına göre yerleştirildi (kuzey yukarıda). Bir kasabaya tıklayınca tanıtımı, resmi ve varsa turist haritası açılır.", "Towns are placed by their in-game coordinates (north is up). Click a town for its description, picture and tourist map if there is one.")),
      el("ul", { class: "mb-legend" }, el("li", {}, el("span", { class: "mb-swatch", style: "--c:#ff5c8a" }, ""), L("Başlangıç noktası seçilebilen kasaba", "Selectable starting town")), el("li", {}, el("span", { class: "mb-swatch", style: "--c:#b0a4c4" }, ""), L("Diğer yerler", "Other places")))
    );
    return;
  }
  fillChildren(
    panel,
    el("h2", {}, t.name),
    el("div", { class: "tags" }, isSpawn(t) ? el("span", { class: "badge cp-iconic" }, L("Başlangıç noktası", "Starting town")) : null, t.type ? el("span", { class: "badge" }, t.type) : null),
    t.image ? el("img", { class: "pz-town-img", src: t.image, alt: "", loading: "lazy" }) : null,
    !IS_EN && PZ_TR.towns[t.name] ? el("p", {}, PZ_TR.towns[t.name]) : null,
    t.quote ? el(IS_EN ? "p" : "details", { class: IS_EN ? "" : "dd-uses" }, IS_EN ? t.quote : [el("summary", {}, "Oyundaki tanıtım (İngilizce)"), el("p", {}, t.quote)]) : IS_EN && t.intro ? el("p", {}, t.intro) : null,
    t.pop && !/unknown/i.test(t.pop) ? el("p", { class: "tile-sub" }, L("Nüfus: ", "Population: "), t.pop) : null,
    el("p", { class: "tile-sub" }, L("Koordinat: ", "Coordinates: "), `${t.x} × ${t.y}`),
    t.map ? el("details", { class: "dd-uses", open: "" }, el("summary", {}, L("Turist haritası", "Tourist map")), el("a", { href: t.map, target: "_blank", rel: "noopener" }, el("img", { class: "pz-town-img", src: t.map, alt: "", loading: "lazy" }))) : null
  );
}

const root = svg("svg", { viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`, class: "pz-svg", role: "img", "aria-label": "Knox Country" });
// Arka plan ızgarası: her 1000 kare.
for (let x = Math.ceil(minX / 1000) * 1000; x < maxX; x += 1000) root.append(svg("line", { x1: x, y1: minY, x2: x, y2: maxY, class: "pz-grid" }));
for (let y = Math.ceil(minY / 1000) * 1000; y < maxY; y += 1000) root.append(svg("line", { x1: minX, y1: y, x2: maxX, y2: y, class: "pz-grid" }));
for (const t of [...towns].sort((a, b) => isTown(a) - isTown(b))) {
  const r = isTown(t) ? 170 : 110;
  const g = svg(
    "g",
    { class: `pz-town ${isSpawn(t) ? "spawn" : ""} ${isTown(t) ? "big" : ""}`, tabindex: "0", role: "button", "data-name": t.name },
    svg("circle", { cx: t.x, cy: t.y, r }),
    svg("text", { x: t.x, y: t.y - r - 70, "text-anchor": "middle" }, t.name)
  );
  g.addEventListener("click", () => show(t));
  g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), show(t)));
  root.append(g);
}
document.getElementById("map").replaceChildren(root);
show(towns.find((t) => t.name === new URLSearchParams(location.search).get("kasaba")) || null);
