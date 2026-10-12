// Company of Heroes haritaları (ortak sayfa): oyuncu sayısına göre süzme, arama.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const SIZES = [...new Set(COH.maps.map((m) => m.players).filter(Boolean))].sort((a, b) => a - b);
let size = "all";
// Görseldeki numaralar doğuş noktaları, renkli işaretler kaynak ve zafer noktalarıdır.

function card(m) {
  const points = m.points ? Object.entries(COH_TR.points).filter(([k]) => m.points[k]).map(([k, [tr, en]]) => el("span", { class: `coh-point ${k}` }, el("b", {}, m.points[k]), ` ${L(tr, en)}`)) : [];
  return el(
    "article",
    { class: "build-card coh-map", id: m.id },
    m.image
      ? el("a", { href: m.full || m.image, target: "_blank", rel: "noopener", title: L("Büyük haritayı aç", "Open the large map") }, el("img", { class: "coh-map-img", src: m.image, alt: T(m.name), loading: "lazy" }))
      : null,
    el("h3", {}, T(m.name).replace(/^\(\d+\)\s*/, "")),
    el(
      "p",
      { class: "tile-sub" },
      [m.players ? L(`${m.players} oyunculu`, `${m.players} players`) : null, m.layout, m.community ? L(`Topluluk haritası${m.author ? ` (${m.author})` : ""}`, `Community map${m.author ? ` (${m.author})` : ""}`) : null].filter(Boolean).join(" · ")
    ),
    points.length ? el("div", { class: "coh-points" }, points) : null,
    T(m.desc) ? el("details", { class: "dd-uses" }, el("summary", {}, L("Hikâyesi", "Background")), para(m.desc)) : null
  );
}

function render() {
  document.getElementById("sizes").replaceChildren(
    ...[["all", L("Hepsi", "All")], ...SIZES.map((s) => [s, L(`${s} oyunculu`, `${s} players`)])].map(([k, n]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(size === k), onclick: () => ((size = k), render()) }, `${n} (${k === "all" ? COH.maps.length : COH.maps.filter((m) => m.players === k).length})`)
    )
  );
  const q = normalize(search.value.trim());
  const items = COH.maps.filter((m) => (size === "all" || m.players === size) && (!q || normalize(`${T(m.name)} ${m.name?.en || ""} ${m.author || ""}`).includes(q)));
  count.textContent = L(`${items.length} harita`, `${items.length} maps`);
  if (!items.length) return showNotice(list, L("Aramana uyan harita bulunamadı.", "No maps match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
