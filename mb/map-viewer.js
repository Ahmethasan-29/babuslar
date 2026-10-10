// Yakınlaştırılıp kaydırılabilen dünya haritası (Mount & Blade bölümleri ortak kullanır).
// Fare tekerleği / iki parmak ile yakınlaşır, sürükleyerek kaydırılır; işaretler (markers) resimle birlikte hareket eder.
// markers: [{ px, py (resim üzerindeki % konum), label, color, size: "town" | "castle" | "village", data }]
function createMapViewer(root, { url, width, height, alt, markers = [], onSelect }) {
  const img = el("img", { class: "mbmap-img", src: url, alt: alt || "", draggable: "false" });
  const layer = el("div", { class: "mbmap-layer" });
  const inner = el("div", { class: "mbmap-inner", style: `aspect-ratio: ${width} / ${height}` }, img, layer);
  const stage = el("div", { class: "mbmap-stage" }, inner);
  const zoomIn = el("button", { class: "chip", type: "button", "aria-label": "Yakınlaştır" }, "+");
  const zoomOut = el("button", { class: "chip", type: "button", "aria-label": "Uzaklaştır" }, "−");
  const reset = el("button", { class: "chip", type: "button" }, "Sığdır");
  const tools = el("div", { class: "mbmap-tools" }, zoomIn, zoomOut, reset);
  root.replaceChildren(stage, tools);

  let scale = 1;
  let tx = 0;
  let ty = 0;
  const MAX = 8;

  // Sahne boyutuna göre sınırlar: resim kenarı sahnenin içine kaçmaz.
  function clamp() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const iw = inner.offsetWidth * scale;
    const ih = inner.offsetHeight * scale;
    tx = iw <= w ? (w - iw) / 2 : Math.min(0, Math.max(w - iw, tx));
    ty = ih <= h ? (h - ih) / 2 : Math.min(0, Math.max(h - ih, ty));
  }
  function apply() {
    clamp();
    inner.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    // İşaretler yakınlaştıkça büyümesin: ters ölçek.
    layer.style.setProperty("--inv", String(1 / scale));
    stage.classList.toggle("zoomed", scale > 1.6);
  }
  function zoomAt(factor, cx, cy) {
    const next = Math.min(MAX, Math.max(1, scale * factor));
    const k = next / scale;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    scale = next;
    apply();
  }
  const center = () => [stage.clientWidth / 2, stage.clientHeight / 2];

  zoomIn.addEventListener("click", () => zoomAt(1.6, ...center()));
  zoomOut.addEventListener("click", () => zoomAt(1 / 1.6, ...center()));
  reset.addEventListener("click", () => ((scale = 1), (tx = 0), (ty = 0), apply()));
  stage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 1.25 : 0.8, event.clientX - r.left, event.clientY - r.top);
    },
    { passive: false }
  );

  // Sürükleme ve iki parmakla yakınlaştırma (pointer olayları).
  const pointers = new Map();
  let pinch = null;
  let moved = false;
  stage.addEventListener("pointerdown", (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    stage.setPointerCapture(event.pointerId);
    moved = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  });
  stage.addEventListener("pointermove", (event) => {
    const prev = pointers.get(event.pointerId);
    if (!prev) return;
    const cur = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, cur);
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = stage.getBoundingClientRect();
      zoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      pinch.d = d;
      moved = true;
      return;
    }
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    tx += dx;
    ty += dy;
    apply();
  });
  const end = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  // Sürükleme bittiğinde işarete "tıklandı" sayılmasın.
  stage.addEventListener("click", (event) => moved && event.stopPropagation(), true);

  // İşaretler
  const nodes = markers.map((m) => {
    const node = el(
      "button",
      { class: `mbmap-marker ${m.size || ""}`, type: "button", style: `left:${m.px}%;top:${m.py}%;--c:${m.color || "#fff"}`, title: m.label, "aria-label": m.label },
      el("span", { class: "dot" }),
      m.size === "village" ? null : el("span", { class: "name" }, m.label)
    );
    node.addEventListener("click", () => select(m));
    m.node = node;
    return node;
  });
  layer.replaceChildren(...nodes);

  function select(m, focus) {
    for (const n of nodes) n.classList.remove("active");
    if (m) m.node.classList.add("active");
    if (m && focus) {
      // İşareti ortala ve yakınlaş.
      scale = Math.max(scale, 3);
      tx = stage.clientWidth / 2 - (m.px / 100) * inner.offsetWidth * scale;
      ty = stage.clientHeight / 2 - (m.py / 100) * inner.offsetHeight * scale;
      apply();
    }
    if (onSelect) onSelect(m);
  }
  function filter(test) {
    for (const m of markers) m.node.hidden = !test(m);
  }

  // Sahne yüksekliği resmin oranına uyar (boş şerit kalmasın), ama ekranın %72sini geçmez.
  function size() {
    stage.style.height = `${Math.round(Math.min(window.innerHeight * 0.72, 760, (stage.clientWidth * height) / width))}px`;
    apply();
  }
  new ResizeObserver(size).observe(stage);
  img.addEventListener("load", apply);
  size();
  return { select, filter };
}
