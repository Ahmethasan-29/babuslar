// Bannerlord haritası: wikideki siyasi Calradia haritası (adlar resmin üzerinde yazılı) ve aranabilir yerleşim listesi.
const panel = document.getElementById("panel");
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const byName = Object.fromEntries(BL.places.map((p) => [p.name, p]));
const kColor = (k) => BL.kingdoms.find((x) => x.id === k)?.color || "#999";
const kName = (k) => (IS_EN ? k : BL_TR.kingdoms[k] || k);
const typeName = blType;
const product = (p) => (IS_EN || !BL_TR.products[p] ? p : `${p} (${BL_TR.products[p]})`);

// Harita resmi 5102 piksel genişliğinde; ekranda 3000 piksellik sürümü yeterince net.
createMapViewer(document.getElementById("map"), {
  url: BL.map.url.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/3000"),
  width: BL.map.width,
  height: BL.map.height,
  alt: L("Calradia siyasi haritası", "Political map of Calradia"),
});

function placeButton(name) {
  const p = byName[name];
  return p ? el("button", { class: "linklike", type: "button", onclick: () => show(p) }, name) : name;
}

// Şehre bağlı köylerin ürünlerinden atölye önerisi.
function workshopHint(villages) {
  const counts = {};
  for (const v of villages) {
    const w = v.produce && BL_TR.workshops[v.produce];
    if (w) counts[w] = (counts[w] || 0) + 1;
  }
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!items.length) return null;
  return el(
    "div",
    {},
    el("h3", { class: "dd-sub" }, L("Uygun atölyeler", "Suitable workshops")),
    el("ul", { class: "mb-legend" }, items.map(([w, n]) => el("li", {}, L(`${w} · ${n} köy hammadde veriyor`, `${w.replace(/ \(.*\)$/, "")} · ${n} supplying village${n > 1 ? "s" : ""}`)))),
    el("p", { class: "tile-sub" }, L("Atölye, hammaddesi şehre bol gelirse kâr eder. Yakındaki başka şehirlere bağlı köyler de bu şehre mal satabilir.", "A workshop profits when its raw material reaches the town in quantity. Villages bound to nearby towns may also sell here."))
  );
}

function show(p) {
  if (!p) {
    fillChildren(panel, 
      el("h2", {}, L("Bir yer seç", "Pick a place")),
      el("p", { class: "tile-sub" }, L("Haritayı fareyle sürükleyip tekerlekle yakınlaştır; adlar resmin üzerinde yazılı. Aşağıdaki listeden bir yerleşime tıklayınca bilgileri burada görünür.", "Drag the map and zoom with the wheel; names are written on the image. Click a settlement in the list below to see its details here.")),
      el("ul", { class: "mb-legend" }, BL.kingdoms.map((k) => el("li", {}, el("span", { class: "mb-swatch", style: `--c:${k.color}` }), kName(k.id))))
    );
    return;
  }
  const villages = p.villages.map((v) => byName[v]).filter(Boolean);
  fillChildren(panel, 
    el("h2", {}, p.name),
    el(
      "div",
      { class: "tags" },
      el("span", { class: "badge" }, typeName(p.type)),
      p.kingdom ? el("span", { class: "badge mb-fac", style: `--c:${kColor(p.kingdom)}` }, kName(p.kingdom)) : null,
      p.port ? el("span", { class: "badge" }, L("Liman", "Port")) : null
    ),
    ...(p.type === "village"
      ? [
          p.produce ? el("p", {}, el("strong", {}, L("Ürettiği: ", "Produces: ")), product(p.produce)) : null,
          p.bound ? el("p", {}, el("strong", {}, L("Bağlı olduğu yer: ", "Bound to: ")), placeButton(p.bound)) : null,
          p.produce && BL_TR.workshops[p.produce] ? el("p", { class: "tile-sub" }, L(`Bu ürünü işleyen atölye: ${BL_TR.workshops[p.produce]}`, `Workshop using it: ${BL_TR.workshops[p.produce].replace(/ \(.*\)$/, "")}`)) : null,
        ]
      : [
          el("h3", { class: "dd-sub" }, p.villages.length ? L("Bağlı köyler", "Bound villages") : L("Bağlı köy yok", "No bound villages")),
          p.villages.length ? el("ul", { class: "mb-legend" }, p.villages.map((v) => el("li", {}, placeButton(v), byName[v]?.produce ? ` · ${product(byName[v].produce)}` : ""))) : null,
          p.type === "town" ? workshopHint(villages) : null,
        ]),
    el("p", { class: "tile-sub" }, L("Krallık, oyun başındaki durumdur; savaşlarda yerleşimler el değiştirir.", "Kingdoms are as at the start of the game; settlements change hands in wars."))
  );
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Liste ve filtreler
let types = new Set(["town", "castle", "village"]);
let kingdom = "all";
function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}
function update() {
  document.getElementById("types").replaceChildren(
    ...["town", "castle", "village"].map((t) =>
      chip(`${typeName(t)} (${BL.places.filter((p) => p.type === t).length})`, types.has(t), () => {
        types.has(t) ? types.delete(t) : types.add(t);
        update();
      })
    )
  );
  document.getElementById("kingdoms").replaceChildren(
    chip(L("Tüm krallıklar", "All kingdoms"), kingdom === "all", () => ((kingdom = "all"), update())),
    ...BL.kingdoms.map((k) => {
      const b = chip(kName(k.id), kingdom === k.id, () => ((kingdom = k.id), update()));
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${k.color}` }));
      return b;
    })
  );
  render();
}
function render() {
  const q = normalize(search.value.trim());
  const items = BL.places.filter(
    (p) =>
      types.has(p.type) &&
      (kingdom === "all" || p.kingdom === kingdom) &&
      (!q || normalize(p.name).includes(q) || normalize(p.produce).includes(q) || normalize(BL_TR.products[p.produce]).includes(q) || normalize(p.bound).includes(q))
  );
  count.textContent = L(`${items.length} yerleşim`, `${items.length} settlements`);
  list.replaceChildren(
    ...items.slice(0, 400).map((p) =>
      el(
        "button",
        { class: "bl-place", type: "button", style: `--c:${kColor(p.kingdom)}`, onclick: () => show(p) },
        el("strong", {}, p.name),
        el("span", { class: "tile-sub" }, [typeName(p.type), p.produce ? product(p.produce) : null, p.bound ? `→ ${p.bound}` : null].filter(Boolean).join(" · "))
      )
    )
  );
}
search.addEventListener("input", render);
update();
show(null);
