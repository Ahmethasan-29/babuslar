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

const bar = saveBar({
  async onSave() {
    if (PANEL === "atislar") validateShots();
    const what = PANEL === "haritalar" ? "harita bilgileri" : "atış videoları";
    const title = `CS2: ${what} güncellendi (${[...edited].join(", ")})`;
    const pr = await Panel.publish([{ path: PATH, text: serialize(), sha: source.sha }], title);
    source = await Panel.read(PATH);
    edited.clear();
    return pr;
  },
  snapshot: () => JSON.stringify(maps),
  restore(state) {
    maps = JSON.parse(state);
    map = maps.find((m) => m.id === map.id) || maps[0];
    selected = null;
    render();
  },
});

function changed() {
  edited.add(map.name);
  bar.changed();
}

const serialize = () => `${header}const CS2_MAPS = ${toJS(maps)};\n`;

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
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), " / Counter-Strike 2 / ", PANEL === "haritalar" ? "Haritalar ve infolar" : "Atış videoları"),
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
              history.replaceState(null, "", url(PANEL, m.id));
              render();
            },
          },
          m.name
        )
      )
    )
  );
  app.replaceChildren(top, PANEL === "haritalar" ? mapEditor() : shotEditor(), bar.node);
}

// ---------------------------------------------------------------- Haritalar ve infolar

let activeLevel = "upper";
let selected = null; // seçili info (nesne)

function mapEditor() {
  if (!map.levels) activeLevel = "upper";
  const onLevel = (c) => !map.levels || (c.level || "upper") === activeLevel;
  const level = map.levels?.find((l) => l.id === activeLevel);

  const radar = el("div", { class: "radar-edit" }, el("img", { src: `../cs2/${level ? level.radar : map.radar}`, alt: `${map.name} radarı` }));
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
  radar.addEventListener("pointerdown", (e) => {
    e.preventDefault();
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
      radar,
      el("p", { class: "hint" }, "Radarda boş bir yere tıkla: oraya yeni info eklenir. İnfoları, bomba bölgelerini (A, B) ve doğuşları (T, CT) sürükleyerek taşıyabilirsin; bunlar için ayrıca info eklemene gerek yok.")
    ),
    el(
      "div",
      {},
      el("label", { class: "field" }, el("span", {}, "Harita adı"), name),
      el("label", { class: "field" }, el("span", {}, "Kısa açıklama"), summary),
      el("div", { class: "field" }, el("span", {}, `İnfolar${map.levels ? ` (${level.label})` : ""}`), rows)
    )
  );
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
      s.clip
        ? el("p", { class: "hint", style: "grid-column:1/-1;margin:0" }, `Bu atış kendi kaydımızı kullanıyor (${s.clip}); YouTube bağlantısı yalnızca yedek.`)
        : null,
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
    el("p", { class: "hint" }, `${map.name}: ${map.lineups.length} atış, ${visible().length} tanesi gösteriliyor. Süreleri 1:23 ya da saniye olarak yazabilirsin; YouTube bağlantısında ?t= varsa başlangıç kendiliğinden dolar.`),
    list,
    el("div", { style: "margin-top:14px" }, add)
  );
}
