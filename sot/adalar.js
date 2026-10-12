// Sea of Thieves ada arama: her ada, karakol ve kale tek tek; ad, koordinat (G-16), bölge, hayvan, adadaki şeyler ya da
// bilmece haritasındaki cümleyle aranır. Bilmece eşleşirse cevabın ekran görüntüsü ve haritadaki yeri en üstte gösterilir.
const search = document.getElementById("search");
const list = document.getElementById("list");
const hits = document.getElementById("riddles");
const count = document.getElementById("count");
const params = new URLSearchParams(location.search);
const KINDS = Object.keys(SOT_TR.kinds).filter((k) => SOT.places.some((p) => p.kind === k));
const REGIONS = Object.keys(SOT_TR.regions).filter((r) => SOT.places.some((p) => p.region === r));
let kind = "all";
let region = "all";
let open = params.get("ada");

const region0 = (p) => SOT_TR.regions[p.region] || SOT_TR.regions[""];
const kindName = (k) => L(...SOT_TR.kinds[k]);
const big = (url, w) => (url ? url.replace(/\/revision\/latest.*$/, `/revision/latest/scale-to-width-down/${w}`) : null);
const animalName = (a) => (IS_EN ? a[0].toUpperCase() + a.slice(1) : SOT_TR.animals[a]);
// Aranacak metin: Türkçe karşılıklar da eklenir (ör. "tavuk", "kale", "karakol").
const haystack = (p) =>
  normalize(
    [p.name, p.grid, p.grid.replace("-", ""), p.region, region0(p).tr, kindName(p.kind), SOT_TR.kinds[p.kind].join(" "), p.animals.join(" "), p.animals.map((a) => SOT_TR.animals[a]).join(" "), p.note, p.features.join(" "), p.riddles.map((r) => `${r.clue} ${r.text}`).join(" ")].join(" ")
  );
// Sıra: önce büyük adalar, sonra küçük adalar, karakollar, seapost'lar, kaleler…
const ORDER = Object.keys(SOT_TR.kinds);
const index = [...SOT.places].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.name.localeCompare(b.name)).map((p) => ({ p, text: haystack(p) }));
const words = () => normalize(search.value.trim()).split(/\s+/).filter(Boolean);

function chips(id, items, current, set) {
  document.getElementById(id).replaceChildren(...items.map(([k, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(current === k), onclick: () => (set(k), render()) }, label)));
}

function riddleBlock(p, r) {
  return el(
    "div",
    { class: "sot-riddle" },
    el("p", { class: "sot-riddle-text" }, el("strong", {}, r.clue ? `${r.clue}: ` : ""), `“${r.text}”`),
    el(
      "div",
      { class: "sot-riddle-imgs" },
      r.image ? el("a", { href: r.image, target: "_blank", rel: "noopener" }, el("img", { src: big(r.image, 480), alt: L("Cevabın yeri", "Answer spot"), loading: "lazy" })) : null,
      r.map ? el("a", { href: r.map, target: "_blank", rel: "noopener" }, el("img", { src: big(r.map, 480), alt: L("Haritadaki yeri", "On the map"), loading: "lazy" })) : null
    )
  );
}

function detail(p) {
  return [
    el("div", { class: "sot-detail-imgs" }, p.image ? el("img", { src: big(p.image, 640), alt: "", loading: "lazy" }) : null, p.map ? el("img", { src: big(p.map, 640), alt: L("Harita masasındaki görünümü", "Map table view"), loading: "lazy" }) : null),
    L(...SOT_TR.kindNote[p.kind]) ? el("p", { class: "tile-sub" }, L(...SOT_TR.kindNote[p.kind])) : null,
    p.note ? el("p", {}, p.note) : null,
    p.features.length ? el("details", { class: "dd-uses", open: "" }, el("summary", {}, L("Adada neler var (wiki, İngilizce)", "What's on the island")), el("ul", {}, p.features.map((f) => el("li", { class: f.startsWith("—") ? "sub" : "" }, f.replace(/^— /, ""))))) : null,
    p.riddles.length ? el("details", { class: "dd-uses" }, el("summary", {}, L(`Bilmeceler ve cevapları (${p.riddles.length})`, `Riddles and answers (${p.riddles.length})`)), p.riddles.map((r) => riddleBlock(p, r))) : null,
    el("p", {}, el("a", { class: "chip", href: `harita.html?yer=${encodeURIComponent(p.name)}` }, L("Haritada göster", "Show on the map"))),
  ];
}

function card(p) {
  const isOpen = open === p.name;
  return el(
    "article",
    { class: `build-card sot-island${isOpen ? " open" : ""}`, id: `ada-${p.grid}-${p.kind}`, style: `--c:${region0(p).color}` },
    el(
      "button",
      {
        class: "sot-island-head",
        type: "button",
        "aria-expanded": String(isOpen),
        onclick: () => {
          open = isOpen ? null : p.name;
          history.replaceState(null, "", open ? `?ada=${encodeURIComponent(open)}` : location.pathname);
          render();
        },
      },
      p.map || p.image ? el("img", { class: "sot-island-img", src: big(p.map || p.image, 360), alt: "", loading: "lazy" }) : el("span", { class: "sot-island-img dd-noimg" }),
      el(
        "span",
        { class: "sot-island-text" },
        el("strong", {}, p.name),
        el("span", { class: "tags" }, el("span", { class: "badge cp-iconic" }, p.grid), el("span", { class: "badge" }, kindName(p.kind))),
        el("span", { class: "tile-sub" }, p.region || L("Bölgesiz", "No region")),
        p.animals.length || p.riddles.length ? el("span", { class: "tile-sub" }, [p.animals.map(animalName).join(", "), p.riddles.length ? L(`${p.riddles.length} bilmece`, `${p.riddles.length} riddles`) : ""].filter(Boolean).join(" · ")) : null
      )
    ),
    isOpen ? el("div", { class: "sot-island-body" }, detail(p)) : null
  );
}

function render() {
  chips("kinds", [["all", L("Her tür", "Every type")], ...KINDS.map((k) => [k, kindName(k)])], kind, (k) => (kind = k));
  chips("regions", [["all", L("Her bölge", "Every region")], ...REGIONS.map((r) => [r, r || L("Bölgesiz", "No region")])], region, (r) => (region = r));
  const w = words();
  const grid = search.value.trim().toUpperCase().replace(/\s/g, "");
  let items = index.filter(({ p, text }) => (kind === "all" || p.kind === kind) && (region === "all" || p.region === region) && w.every((x) => text.includes(x))).map((x) => x.p);
  // Koordinat yazıldıysa tam eşleşen önce.
  if (/^[A-Z]-?\d{1,2}$/.test(grid)) items = items.filter((p) => p.grid === grid.replace(/^([A-Z])(\d)/, "$1-$2")).concat(items.filter((p) => p.grid !== grid.replace(/^([A-Z])(\d)/, "$1-$2")));
  // Bilmece eşleşmeleri: en az iki kelime ya da bir kelime 4+ harf yazılınca.
  const riddleHits = w.length && (w.length > 1 || w[0].length >= 4) ? SOT.places.flatMap((p) => p.riddles.filter((r) => w.every((x) => normalize(`${r.clue} ${r.text}`).includes(x))).map((r) => ({ p, r }))).slice(0, 6) : [];
  hits.replaceChildren(
    ...(riddleHits.length
      ? [
          el("h2", { class: "pz-h" }, L("Bilmece eşleşmeleri", "Matching riddles")),
          ...riddleHits.map(({ p, r }) => el("article", { class: "build-card sot-riddle-hit" }, el("h3", {}, `${p.name} `, el("span", { class: "badge cp-iconic" }, p.grid)), riddleBlock(p, r))),
        ]
      : [])
  );
  count.textContent = L(`${items.length} yer`, `${items.length} places`);
  if (!items.length) return showNotice(list, L("Aramana uyan yer bulunamadı. Ada adını, koordinatı (ör. G-16) ya da bilmece cümlesinden birkaç kelime yaz.", "Nothing found. Type an island name, a coordinate (e.g. G-16) or a few words of a riddle."));
  list.replaceChildren(...items.map(card));
}

search.addEventListener("input", render);
if (params.get("q")) search.value = params.get("q");
render();
if (open) document.getElementById(`ada-${SOT.places.find((p) => p.name === open)?.grid}-${SOT.places.find((p) => p.name === open)?.kind}`)?.scrollIntoView({ block: "start" });
