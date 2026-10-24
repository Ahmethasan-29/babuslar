// CS2 paneli: "haritalar" (ad, açıklama, radar üzerinde infolar) ve "atislar" (smoke/flash/molotof videoları).
// İkisi de cs2/maps.js dosyasını düzenler.

const PATH = "cs2/maps.js";
const params = new URLSearchParams(location.search);
const PANEL = params.get("panel") === "atislar" ? "atislar" : "haritalar";

const SITES = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "Mid", label: "Orta" },
];
const TYPES = [
  { id: "smoke", label: "Smoke" },
  { id: "flash", label: "Flash" },
  { id: "molly", label: "Molotof" },
  { id: "he", label: "El bombası" },
];

const app = document.getElementById("app");
let source; // { text, sha } — depodaki son hali
let header; // dosyanın başındaki açıklama satırları
let maps;
let map;
const edited = new Set(); // değişen haritaların adları (kayıt başlığı için)
// Bilgisayardan seçilen, henüz yüklenmemiş videolar: "clips/dosya.mp4" → { file, url (önizleme), sent }
const uploads = new Map();

// Dosyayı base64'e çevirir (GitHub'a yüklemek için).
const fileBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error(`${file.name} okunamadı`));
    reader.readAsDataURL(file);
  });

const bar = saveBar({
  async onSave() {
    if (PANEL === "atislar") validateShots();
    else validateMaps();
    const what = PANEL === "haritalar" ? "harita bilgileri" : "atış videoları";
    const title = `CS2: ${what} güncellendi (${[...edited].join(", ")})`;
    // Yalnızca hâlâ kullanılan (bir atışta video, bir haritada radar/kapak), daha önce gönderilmemiş dosyalar
    // yüklenir (geri alınanlar atlanır).
    const used = new Set(
      maps.flatMap((m) => [...m.lineups.map((s) => s.clip), m.radar, m.photo, ...(m.levels || []).map((l) => l.radar)]).filter(Boolean)
    );
    const videos = [];
    for (const [clip, up] of uploads) if (used.has(clip) && !up.sent) videos.push({ path: `cs2/${clip}`, base64: await fileBase64(up.file), clip });
    // Kendi videosu olan atışlarda boş YouTube alanı dosyaya yazılmaz (ekrandaki veri değişmez).
    const clean = JSON.parse(JSON.stringify(maps));
    for (const m of clean) for (const s of m.lineups) if (s.clip && !s.yt?.[0]) delete s.yt;
    const pr = await Panel.publish([...videos, { path: PATH, text: serialize(clean), sha: source.sha }], title);
    for (const v of videos) uploads.get(v.clip).sent = true;
    // Kartlardaki "kaydedince yüklenecek" yazıları güncellensin.
    if (videos.length) setTimeout(render);
    source = await Panel.read(PATH);
    edited.clear();
    return pr;
  },
  snapshot: () => JSON.stringify(maps),
  restore(state) {
    maps = JSON.parse(state);
    map = maps.find((m) => m.id === map?.id) || maps[0];
    selected = null;
    render();
  },
});

function changed() {
  edited.add(map.name);
  bar.changed();
}

const serialize = (data = maps) => `${header}const CS2_MAPS = ${toJS(data)};\n`;

init();

async function init() {
  if (!(await Panel.guard())) return;
  try {
    source = await Panel.read(PATH);
    header = source.text.slice(0, source.text.indexOf("const CS2_MAPS")).replace(/\r/g, "");
    maps = evalData(source.text, "CS2_MAPS");
  } catch (e) {
    app.replaceChildren(el("p", { class: "form-error" }, `Harita dosyası okunamadı: ${e.message}`));
    return;
  }
  map = maps.find((m) => m.id === params.get("harita")) || maps[0];
  bar.loaded();
  render();
}

function render() {
  const url = (panel, id) => `cs2.html?panel=${panel}&harita=${id}`;
  const top = el(
    "div",
    {},
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), " / ", el("a", { href: "./?oyun=cs2" }, "Counter-Strike 2"), " / ", PANEL === "haritalar" ? "Haritalar ve infolar" : "Atış videoları"),
    el(
      "div",
      { class: "chips" },
      el("a", { class: "chip", href: url("haritalar", map.id), "aria-pressed": String(PANEL === "haritalar") }, "Haritalar ve infolar"),
      el("a", { class: "chip", href: url("atislar", map.id), "aria-pressed": String(PANEL === "atislar") }, "Atış videoları")
    ),
    el(
      "div",
      { class: "editor-top chips", role: "group", "aria-label": "Harita seç" },
      maps.map((m) =>
        el(
          "button",
          {
            type: "button",
            class: "chip",
            "aria-pressed": String(m === map),
            onclick: () => {
              map = m;
              radarZoom = 1;
              history.replaceState(null, "", url(PANEL, m.id));
              render();
            },
          },
          m.name
        )
      ),
      PANEL === "haritalar" ? el("button", { type: "button", class: "chip", onclick: addMap }, "+ Yeni harita") : null
    )
  );
  app.replaceChildren(top, PANEL === "haritalar" ? mapEditor() : shotEditor(), bar.node);
}

// Sitedeki dosya yolu ("radar/x.png") ya da henüz yüklenmemiş, bilgisayardan seçilmiş dosyanın önizlemesi.
const assetSrc = (rel) => uploads.get(rel)?.url || `../cs2/${rel}`;

const slugify = (t) =>
  t.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Yeni harita: adı sorulur; radar ve kapak resmi sonra bilgisayardan seçilir.
function addMap() {
  const name = prompt("Yeni haritanın adı (ör. Cache):")?.trim();
  if (!name) return;
  const id = slugify(name);
  if (!id) return alert("Geçerli bir ad yaz.");
  if (maps.some((m) => m.id === id)) return alert(`${name} zaten listede.`);
  map = {
    id,
    name,
    radar: "",
    photo: "",
    summary: "",
    spawns: { T: [0.5, 0.9], CT: [0.5, 0.1] },
    sites: { A: [0.3, 0.3], B: [0.7, 0.3] },
    callouts: [],
    lineups: [],
  };
  maps.push(map);
  activeLevel = "upper";
  selected = null;
  changed();
  history.replaceState(null, "", `cs2.html?panel=haritalar&harita=${id}`);
  render();
}

// Kaydetmeden önce: her haritanın adı, radarı ve kapak resmi olmalı.
function validateMaps() {
  const bad = maps.find((m) => !m.name.trim() || !m.radar || !m.photo || (m.levels || []).some((l) => !l.radar));
  if (!bad) return;
  map = bad;
  render();
  throw new Error(`${bad.name || "Adsız harita"}: harita adı, radar resmi ve kapak resmi gerekli.`);
}

// Radar ya da kapak resmi seçme düğmesi. Dosya kaydedince cs2/<klasör>/ altına yüklenir.
function imagePicker({ label, current, folder, base, onPick }) {
  const MAX_MB = 8;
  const input = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp", hidden: true });
  input.addEventListener("change", () => {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) return alert("PNG, JPG ya da WebP resim seç.");
    if (file.size > MAX_MB * 1048576) return alert(`Resim çok büyük (${(file.size / 1048576).toFixed(1)} MB). En fazla ${MAX_MB} MB olabilir.`);
    // Aynı adla değiştirilen resim tarayıcı önbelleğinde eski haliyle kalmasın diye ada zaman eklenir.
    const ext = file.name.split(".").pop().toLowerCase().replace("jpeg", "jpg");
    const rel = `${folder}/${base}-${Date.now().toString(36)}.${ext}`;
    uploads.set(rel, { file, url: URL.createObjectURL(file), sent: false });
    onPick(rel);
    changed();
    render();
  });
  const pending = current && uploads.get(current) && !uploads.get(current).sent;
  return el(
    "div",
    { class: "field" },
    el("span", {}, label),
    el(
      "div",
      { class: "image-pick" },
      current ? el("img", { class: "thumb", src: assetSrc(current), alt: "" }) : el("span", { class: "hint" }, "Henüz resim yok."),
      el("button", { type: "button", class: "chip", onclick: () => input.click() }, current ? "Değiştir" : "Bilgisayardan seç"),
      input
    ),
    pending ? el("span", { class: "hint" }, "Kaydedince yüklenecek.") : null
  );
}

// ---------------------------------------------------------------- Haritalar ve infolar

let activeLevel = "upper";
let radarZoom = 1; // radar düzenleyicisinin yakınlaştırması (harita değişince sıfırlanır)
let selected = null; // seçili info (nesne)

function mapEditor() {
  if (!map.levels) activeLevel = "upper";
  const onLevel = (c) => !map.levels || (c.level || "upper") === activeLevel;
  const level = map.levels?.find((l) => l.id === activeLevel);

  const radarFile = level ? level.radar : map.radar;
  const radar = el(
    "div",
    { class: "radar-edit" },
    radarFile
      ? el("img", { src: assetSrc(radarFile), alt: `${map.name} radarı` })
      : el("div", { class: "radar-empty" }, "Önce sağdan bu haritanın radar resmini seç.")
  );
  const rows = el("div", { class: "rows" });

  const pins = new Map();
  function drawPins() {
    for (const p of pins.values()) p.remove();
    pins.clear();
    for (const c of map.callouts.filter(onLevel)) {
      const pin = el("div", { class: `pin${c === selected ? " active" : ""}`, style: `left:${c.at[0] * 100}%;top:${c.at[1] * 100}%` }, c.name || "?");
      pin.callout = c;
      pins.set(c, pin);
      radar.append(pin);
    }
  }

  // Bomba bölgeleri (A, B) ve doğuşlar (T, CT): sitedeki gibi ayrı işaretler, sürüklenerek taşınır.
  // Bölge konumu [x, y] ya da alt kattaysa [x, y, "lower"]; doğuşlar üst kattadır.
  function drawMarkers() {
    const add = (holder, key, kind) => {
      const at = holder[key];
      if (map.levels && (at[2] || "upper") !== activeLevel) return;
      const node = el("div", { class: `marker ${kind}`, style: `left:${at[0] * 100}%;top:${at[1] * 100}%`, title: kind === "site" ? `${key} bölgesi` : `${key} doğuşu` }, key);
      node.target = { holder, key };
      radar.append(node);
    };
    for (const key of Object.keys(map.sites || {})) add(map.sites, key, "site");
    for (const key of Object.keys(map.spawns || {})) add(map.spawns, key, `spawn ${key.toLowerCase()}`);
  }

  function drawRows() {
    rows.replaceChildren(
      ...map.callouts.filter(onLevel).map((c) => {
        const input = el("input", { class: "input", value: c.name, "aria-label": "İnfo adı" });
        input.addEventListener("focus", () => select(c));
        input.addEventListener("input", () => {
          c.name = input.value;
          pins.get(c).textContent = c.name || "?";
          changed();
        });
        const row = el(
          "div",
          { class: `row${c === selected ? " active" : ""}` },
          input,
          el(
            "button",
            {
              type: "button",
              class: "icon-btn",
              title: "Sil",
              "aria-label": `${c.name} infosunu sil`,
              onclick: () => {
                map.callouts.splice(map.callouts.indexOf(c), 1);
                if (selected === c) selected = null;
                changed();
                drawPins();
                drawRows();
              },
            },
            "✕"
          )
        );
        row.callout = c;
        return row;
      })
    );
  }

  function select(c) {
    selected = c;
    for (const [callout, pin] of pins) pin.classList.toggle("active", callout === c);
    for (const row of rows.children) row.classList.toggle("active", row.callout === c);
  }

  // Radar: boş yere tıklamak yeni info ekler, infoyu sürüklemek taşır.
  const pos = (e) => {
    const r = radar.getBoundingClientRect();
    const clamp = (v) => Math.min(1, Math.max(0, Math.round(v * 1000) / 1000));
    return [clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height)];
  };
  let dragging = null;
  let draggingMarker = null;
  // Yakınlaştırma: radar sabit boyutlu bir pencerenin içinde büyür (yazılar aynı boyutta kalır).
  // Fare tekerleği imlecin olduğu yere yakınlaştırır; sağ ya da orta tuşla sürükleyince harita kayar.
  const view = el("div", { class: "radar-zoom" }, radar);
  const zoomLabel = el("span", { class: "zoom-level" });
  const setZoom = (z, cx, cy) => {
    const old = radarZoom;
    radarZoom = Math.min(6, Math.max(1, Math.round(z * 100) / 100));
    const vr = view.getBoundingClientRect();
    // İmlecin (yoksa ortanın) altındaki nokta yerinde kalsın
    const px = (cx ?? vr.left + vr.width / 2) - vr.left;
    const py = (cy ?? vr.top + vr.height / 2) - vr.top;
    const fx = (view.scrollLeft + px) / (vr.width * old);
    const fy = (view.scrollTop + py) / (radar.offsetHeight || vr.width * old);
    radar.style.width = `${radarZoom * 100}%`;
    view.scrollLeft = fx * vr.width * radarZoom - px;
    view.scrollTop = fy * radar.offsetHeight - py;
    zoomLabel.textContent = `${Math.round(radarZoom * 100)}%`;
  };
  view.addEventListener("wheel", (e) => {
    if (!radarFile) return;
    e.preventDefault();
    setZoom(radarZoom * (e.deltaY < 0 ? 1.25 : 0.8), e.clientX, e.clientY);
  }, { passive: false });
  view.addEventListener("contextmenu", (e) => e.preventDefault());
  let panning = null;
  view.addEventListener("pointerdown", (e) => {
    if (e.button !== 1 && e.button !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    panning = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop };
    view.setPointerCapture(e.pointerId);
    view.classList.add("panning");
  }, true);
  view.addEventListener("pointermove", (e) => {
    if (!panning) return;
    view.scrollLeft = panning.l - (e.clientX - panning.x);
    view.scrollTop = panning.t - (e.clientY - panning.y);
  });
  view.addEventListener("pointerup", () => { panning = null; view.classList.remove("panning"); });
  const zoomBar = el(
    "div",
    { class: "chips zoom-bar" },
    el("button", { type: "button", class: "chip", title: "Uzaklaştır", onclick: () => setZoom(radarZoom / 1.5) }, "−"),
    zoomLabel,
    el("button", { type: "button", class: "chip", title: "Yakınlaştır", onclick: () => setZoom(radarZoom * 1.5) }, "+"),
    el("button", { type: "button", class: "chip", onclick: () => setZoom(1) }, "Sığdır")
  );
  requestAnimationFrame(() => setZoom(radarZoom));

  radar.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (!radarFile) return;
    if (e.target.target) {
      draggingMarker = e.target;
      radar.setPointerCapture(e.pointerId);
      return;
    }
    let c = e.target.callout;
    if (!c) {
      c = { name: "Yeni info", at: pos(e), ...(map.levels && activeLevel !== "upper" ? { level: activeLevel } : {}) };
      map.callouts.push(c);
      changed();
      drawPins();
      drawRows();
      select(c);
      const input = [...rows.children].find((row) => row.callout === c)?.querySelector("input");
      input?.focus();
      input?.select();
      return;
    }
    select(c);
    dragging = c;
    radar.setPointerCapture(e.pointerId);
  });
  radar.addEventListener("pointermove", (e) => {
    if (draggingMarker) {
      const { holder, key } = draggingMarker.target;
      const [x, y] = pos(e);
      holder[key] = holder[key][2] ? [x, y, holder[key][2]] : [x, y];
      draggingMarker.style.left = `${x * 100}%`;
      draggingMarker.style.top = `${y * 100}%`;
      changed();
      return;
    }
    if (!dragging) return;
    dragging.at = pos(e);
    const pin = pins.get(dragging);
    pin.style.left = `${dragging.at[0] * 100}%`;
    pin.style.top = `${dragging.at[1] * 100}%`;
    changed();
  });
  radar.addEventListener("pointerup", () => (dragging = draggingMarker = null));

  drawMarkers();
  drawPins();
  drawRows();

  const name = el("input", { class: "input", value: map.name });
  name.addEventListener("input", () => {
    map.name = name.value;
    changed();
  });
  const summary = el("textarea", {}, map.summary || "");
  summary.addEventListener("input", () => {
    map.summary = summary.value;
    changed();
  });

  return el(
    "div",
    { class: "editor-grid" },
    el(
      "div",
      {},
      map.levels
        ? el(
            "div",
            { class: "chips", style: "margin-bottom:10px" },
            map.levels.map((l) =>
              el(
                "button",
                {
                  type: "button",
                  class: "chip",
                  "aria-pressed": String(l.id === activeLevel),
                  onclick: () => {
                    activeLevel = l.id;
                    selected = null;
                    render();
                  },
                },
                l.label
              )
            )
          )
        : null,
      zoomBar,
      view,
      el("p", { class: "hint" }, "Radarda boş bir yere tıkla: oraya yeni info eklenir. İnfoları, bomba bölgelerini (A, B) ve doğuşları (T, CT) sürükleyerek taşıyabilirsin; bunlar için ayrıca info eklemene gerek yok. Yakınlaştırmak için fare tekerleğini ya da + düğmesini kullan; yakınken haritayı sağ tuşla sürükleyerek kaydır.")
    ),
    el(
      "div",
      {},
      el("label", { class: "field" }, el("span", {}, "Harita adı"), name),
      el("label", { class: "field" }, el("span", {}, "Kısa açıklama"), summary),
      el("div", { class: "field" }, el("span", {}, `İnfolar${map.levels ? ` (${level.label})` : ""}`), rows),
      el(
        "details",
        { class: "sub map-files", open: !map.radar || !map.photo ? true : null },
        el("summary", {}, "Resimler, katlar ve harita silme"),
        imagePicker({
          label: map.levels ? "Üst kat radarı" : "Radar resmi (kare, üstten görünüm)",
          current: map.radar,
          folder: "radar",
          base: map.id,
          onPick: (rel) => {
            map.radar = rel;
            const upper = map.levels?.find((l) => l.id === "upper");
            if (upper) upper.radar = rel;
          },
        }),
        map.levels
          ? imagePicker({
              label: "Alt kat radarı",
              current: map.levels.find((l) => l.id === "lower")?.radar,
              folder: "radar",
              base: `${map.id}_lower`,
              onPick: (rel) => (map.levels.find((l) => l.id === "lower").radar = rel),
            })
          : null,
        imagePicker({ label: "Kapak resmi (harita kartında ve başlıkta görünür)", current: map.photo, folder: "img/maps", base: map.id, onPick: (rel) => (map.photo = rel) }),
        el(
          "div",
          { class: "chips" },
          map.levels
            ? el("button", { type: "button", class: "chip", onclick: removeLower }, "Alt katı kaldır")
            : el("button", { type: "button", class: "chip", onclick: addLower }, "Alt kat ekle"),
          el("button", { type: "button", class: "chip danger", onclick: removeMap }, "Haritayı sil")
        ),
        el("p", { class: "hint" }, "Alt kat: Nuke ve Vertigo gibi iki katlı haritalar için. Eklenince radarın üstünde Üst kat / Alt kat seçimi çıkar.")
      )
    )
  );
}

function addLower() {
  map.levels = [
    { id: "upper", label: "Üst kat", radar: map.radar },
    { id: "lower", label: "Alt kat", radar: "" },
  ];
  changed();
  render();
}

function removeLower() {
  const lower = map.callouts.filter((c) => c.level === "lower").length;
  if (!confirm(`Alt kat kaldırılsın mı?${lower ? ` Alt kattaki ${lower} info da silinir.` : ""}`)) return;
  map.callouts = map.callouts.filter((c) => c.level !== "lower");
  for (const holder of [map.sites, map.spawns]) for (const key of Object.keys(holder || {})) holder[key] = holder[key].slice(0, 2);
  delete map.levels;
  activeLevel = "upper";
  selected = null;
  changed();
  render();
}

function removeMap() {
  if (maps.length === 1) return alert("Son harita silinemez.");
  if (!confirm(`${map.name} sitedeki harita listesinden kaldırılsın mı? İnfoları ve ${map.lineups.length} atışı da silinir. (Kaydetmeden önce "Geri al" ile vazgeçebilirsin.)`)) return;
  edited.add(`${map.name} silindi`);
  maps.splice(maps.indexOf(map), 1);
  map = maps[0];
  selected = null;
  bar.changed();
  history.replaceState(null, "", `cs2.html?panel=haritalar&harita=${map.id}`);
  render();
}

// ---------------------------------------------------------------- Atış videoları

let siteFilter = "all";
let typeFilter = "all";

// "1:23" ya da "83" → 83
function parseTime(text) {
  const t = String(text).trim();
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(\d+):([0-5]?\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
}
const showTime = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

// YouTube bağlantısından video kimliği ve (varsa) başlangıç saniyesi.
function parseYouTube(text) {
  const t = text.trim();
  if (/^[\w-]{11}$/.test(t)) return { id: t };
  try {
    const u = new URL(t);
    const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1, 12) : u.searchParams.get("v") || u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    const start = u.searchParams.get("t") || u.searchParams.get("start");
    return /^[\w-]{11}$/.test(id || "") ? { id, start: start ? parseInt(start, 10) : undefined } : null;
  } catch {
    return null;
  }
}

const shotProblem = (s) =>
  !s.name.trim() ? "adı boş" : s.clip ? null : !/^[\w-]{11}$/.test(s.yt[0]) ? "YouTube bağlantısı geçersiz" : !(s.yt[2] > s.yt[1]) ? "bitiş süresi başlangıçtan sonra olmalı" : null;

function validateShots() {
  const problems = [];
  for (const m of maps) for (const s of m.lineups) if (shotProblem(s)) problems.push(`${m.name} / ${s.name || "adsız atış"}: ${shotProblem(s)}`);
  if (problems.length) throw new Error(problems.join("; "));
}

function shotEditor() {
  const list = el("div", { class: "shots" });
  const visible = () => map.lineups.filter((s) => (siteFilter === "all" || s.site === siteFilter) && (typeFilter === "all" || s.type === typeFilter));

  const filter = (items, current, set) =>
    el(
      "div",
      { class: "chips" },
      [{ id: "all", label: "Tümü" }, ...items].map((item) =>
        el(
          "button",
          {
            type: "button",
            class: "chip",
            "aria-pressed": String(item.id === current),
            onclick: () => {
              set(item.id);
              render();
            },
          },
          item.label
        )
      )
    );

  // Kendi videosu: bilgisayardan seçilir, kaydedince cs2/clips/ klasörüne yüklenir ve YouTube yerine oynar.
  function clipRow(s, onChange) {
    const MAX_MB = 95; // GitHub tek dosyada 100 MB üstünü kabul etmez
    const status = el("span", { class: "clip-status" });
    const fileInput = el("input", { type: "file", accept: "video/mp4,video/webm", hidden: true });
    const pick = el("button", { type: "button", class: "chip", onclick: () => fileInput.click() });
    const remove = el("button", { type: "button", class: "chip", onclick: () => {
      if (!confirm("Bu atıştaki kendi videon kaldırılsın mı? Atış YouTube bağlantısını kullanır.")) return;
      delete s.clip;
      changed();
      draw();
      onChange();
    } }, "Videoyu kaldır");
    function draw() {
      const up = s.clip && uploads.get(s.clip);
      status.textContent = !s.clip
        ? "Kendi videon yok; YouTube bağlantısı kullanılıyor."
        : up && !up.sent
          ? `Seçildi: ${up.file.name} (${(up.file.size / 1048576).toFixed(1)} MB) — kaydedince yüklenecek.`
          : `Kendi videosu: ${s.clip}`;
      pick.textContent = s.clip ? "Başka video seç" : "Bilgisayardan video seç";
      remove.hidden = !s.clip;
    }
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      fileInput.value = "";
      if (!file) return;
      if (!/\.(mp4|webm)$/i.test(file.name)) return alert("Yalnızca MP4 ya da WebM video seçebilirsin.");
      if (file.size > MAX_MB * 1048576) return alert(`Video çok büyük (${(file.size / 1048576).toFixed(1)} MB). En fazla ${MAX_MB} MB olabilir (GitHub 100 MB üstü dosyayı kabul etmiyor). Videoyu kısaltırsan ya da 720p'ye düşürürsen küçülür.`);
      // Dosya adı: harita-bölge-atış-adı-zaman.mp4 (Türkçe karakterler sadeleştirilir).
      const slug = (t) => t.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const ext = file.name.split(".").pop().toLowerCase();
      const clip = `clips/${[map.id, s.site, slug(s.name) || "atis"].map(slug).join("-")}-${Date.now().toString(36)}.${ext}`;
      uploads.set(clip, { file, url: URL.createObjectURL(file), sent: false });
      s.clip = clip;
      changed();
      draw();
      onChange();
    });
    draw();
    return el("div", { class: "clip-row" }, el("span", { class: "clip-label" }, "Kendi videon:"), pick, remove, fileInput, status);
  }

  function card(s) {
    const select = (items, value, onchange) =>
      el("select", { onchange: (e) => onchange(e.target.value) }, items.map((i) => el("option", { value: i.id, selected: i.id === value }, i.label)));
    const input = (value, placeholder, oninput, label) => {
      const node = el("input", { class: "input", value, placeholder, "aria-label": label });
      node.addEventListener("input", () => oninput(node.value, node));
      return node;
    };
    const mark = () => node.classList.toggle("bad", !!shotProblem(s));

    const video = input(s.yt?.[0] ? `https://youtu.be/${s.yt[0]}` : "", "YouTube bağlantısı", (v, n) => {
      const yt = parseYouTube(v);
      s.yt = s.yt || ["", 0, 0];
      s.yt[0] = yt ? yt.id : "";
      if (yt?.start != null && !s.yt[1]) {
        s.yt[1] = yt.start;
        start.value = showTime(yt.start);
      }
      n.classList.toggle("bad", !yt);
      mark();
      changed();
    }, "YouTube bağlantısı");
    const time = (i, label) =>
      input(showTime(s.yt?.[i]), label === "Başlangıç" ? "0:00" : "0:15", (v, n) => {
        const sec = parseTime(v);
        n.classList.toggle("bad", !Number.isFinite(sec));
        if (Number.isFinite(sec)) {
          s.yt = s.yt || ["", 0, 0];
          s.yt[i] = sec;
        }
        mark();
        changed();
      }, label);
    const start = time(1, "Başlangıç");
    const end = time(2, "Bitiş");

    let preview = null;
    const node = el(
      "div",
      { class: "shot" },
      select(SITES, s.site, (v) => {
        s.site = v;
        changed();
      }),
      select(TYPES, s.type, (v) => {
        s.type = v;
        changed();
      }),
      input(s.name, "Atışın adı (ör. Window smoke)", (v) => {
        s.name = v;
        mark();
        changed();
      }, "Atışın adı"),
      el(
        "div",
        { class: "actions" },
        el(
          "button",
          {
            type: "button",
            class: "icon-btn",
            onclick: () => {
              if (preview) {
                preview.remove();
                preview = null;
                return;
              }
              // Kendi videosu varsa o (yeni seçildiyse bilgisayardaki dosya), yoksa YouTube parçası.
              if (s.clip) {
                preview = el("video", { class: "preview", src: uploads.get(s.clip)?.url || `../cs2/${s.clip}`, controls: true, autoplay: true, muted: true, playsinline: true });
                node.append(preview);
                return;
              }
              if (!s.yt?.[0]) return;
              preview = el("iframe", {
                class: "preview",
                src: `https://www.youtube-nocookie.com/embed/${s.yt[0]}?start=${s.yt[1]}&end=${s.yt[2]}&autoplay=1&rel=0`,
                allow: "autoplay; encrypted-media; fullscreen",
                referrerpolicy: "strict-origin-when-cross-origin",
              });
              node.append(preview);
            },
          },
          "Önizle"
        ),
        el(
          "button",
          {
            type: "button",
            class: "icon-btn",
            onclick: () => {
              if (!confirm(`"${s.name || "Adsız atış"}" silinsin mi?`)) return;
              map.lineups.splice(map.lineups.indexOf(s), 1);
              changed();
              render();
            },
          },
          "Sil"
        )
      ),
      clipRow(s, () => {
        mark();
        if (preview) (preview.remove(), (preview = null));
      }),
      el("div", { class: "wide" }, video, start, end, input(s.by || "", "Kaynak (kanal adı)", (v) => {
        s.by = v || undefined;
        changed();
      }, "Kaynak"))
    );
    mark();
    return node;
  }

  list.replaceChildren(...visible().map(card));

  const add = el(
    "button",
    {
      type: "button",
      class: "btn-primary",
      onclick: () => {
        const s = {
          site: siteFilter === "all" ? "A" : siteFilter,
          type: typeFilter === "all" ? "smoke" : typeFilter,
          name: "",
          yt: ["", 0, 0],
          by: undefined,
        };
        map.lineups.push(s);
        changed();
        const node = card(s);
        list.append(node);
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        node.querySelector("input")?.focus();
      },
    },
    "+ Yeni atış ekle"
  );

  return el(
    "div",
    {},
    el("div", { class: "editor-top" }, filter(SITES, siteFilter, (v) => (siteFilter = v)), filter(TYPES, typeFilter, (v) => (typeFilter = v))),
    el("p", { class: "hint" }, `${map.name}: ${map.lineups.length} atış, ${visible().length} tanesi gösteriliyor. Süreleri 1:23 ya da saniye olarak yazabilirsin; YouTube bağlantısında ?t= varsa başlangıç kendiliğinden dolar. Kendi çektiğin videoyu da "Bilgisayardan video seç" ile ekleyebilirsin (MP4/WebM, en fazla 95 MB); o zaman YouTube bağlantısı gerekmez.`),
    list,
    el("div", { style: "margin-top:14px" }, add)
  );
}
