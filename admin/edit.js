// Ortak düzenleyici: games.js'deki bir bölümün listesini (karakterler, silahlar, Türkçe metinler…) düzenler.
// Solda kayıtların listesi ve arama, sağda seçili kaydın tüm alanları. Alanların türüne göre form kendiliğinden oluşur.

const params = new URLSearchParams(location.search);
const game = GAMES.find((g) => g.id === params.get("oyun")) || GAMES[Number(params.get("oyun"))];
const section = game?.sections[Number(params.get("bolum"))];
const app = document.getElementById("app");

let source; // { text, sha } — depodaki son hali
let root; // dosyadaki sabitin değeri (.json'da dosyanın tamamı)
let original; // yüklenen ya da son kaydedilen hal (JSON metni); duzeltmeler.json için karşılaştırılır
let selected = params.get("kayit"); // seçili kaydın anahtarı (listelerde sıra numarası)
let query = "";
const edited = new Set(); // değişen kayıtların adları (kayıt başlığı için)

// Alan adlarının Türkçesi; listede olmayanlar olduğu gibi gösterilir.
const LABELS = {
  id: "Kimlik (id)", name: "Ad", title: "Başlık", tr: "Türkçe", en: "İngilizce", desc: "Açıklama", descTr: "Türkçe açıklama",
  description: "Açıklama", intro: "Giriş", overview: "Genel bakış", bio: "Hikâye", quote: "Söz", note: "Not", notes: "Notlar",
  effect: "Etki", image: "Görsel", icon: "Simge", portrait: "Portre", photo: "Fotoğraf", type: "Tür", kind: "Tür", group: "Grup",
  class: "Sınıf", rarity: "Nadirlik", price: "Fiyat", cost: "Fiyat", stats: "Değerler", skills: "Beceriler", perks: "Perkler",
  power: "Güç", damage: "Hasar", unlock: "Açılma şartı", how: "Nasıl alınır", place: "Yer", region: "Bölge", map: "Harita",
  maps: "Haritalar", weapons: "Silahlar", tactics: "Taktik", weak: "Zayıf olduğu", where: "Bulunduğu yer", side: "Taraf",
  roles: "Roller", abilities: "Yetenekler", culture: "Kültür", tier: "Seviye", wage: "Maaş", up: "Yükseltmeler", color: "Renk",
  modes: "Modlar", date: "Tarih", terrain: "Arazi", magazine: "Şarjör", velocity: "Mermi hızı", ammo: "Mermi", rof: "Atış hızı",
  text: "Paragraflar", items: "Maddeler", links: "Bağlantılar", url: "Adres (bağlantı)", detail: "Kısa yazı", label: "Etiket",
  fire: "Atış modu", kit: "Sınıf", maker: "Üretici", source: "Kaynak", layouts: "Yerleşimler", realm: "Diyar", tags: "Etiketler",
};
const label = (key) => (typeof key === "number" ? `${key + 1}.` : LABELS[key] || key);

const fold = (s) => String(s).toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "");

const bar = saveBar({
  onSave,
  snapshot: () => JSON.stringify(root),
  restore(state) {
    root = JSON.parse(state);
    render();
  },
});

init();

async function init() {
  if (!section || !section.file) {
    app.replaceChildren(el("p", { class: "form-error" }, "Bölüm bulunamadı. ", el("a", { href: "./" }, "Panele dön")));
    return;
  }
  document.title = `${section.label} · ${game.name} · Panel`;
  if (!(await Panel.guard())) return;
  try {
    source = await Panel.read(section.file);
    root = parse(source.text);
    if (hasFunction(root)) throw new Error("bu veri program kodu içeriyor, panelden düzenlenemez");
  } catch (e) {
    app.replaceChildren(el("p", { class: "form-error" }, `${section.file} okunamadı: ${e.message}`));
    return;
  }
  original = JSON.stringify(root);
  bar.loaded();
  render();
}

// ---------------------------------------------------------------- Dosya okuma / yazma

function parse(text) {
  if (section.kind === "json") return JSON.parse(text);
  // Dosyanın tamamı çalıştırılır (sabit, aynı dosyadaki başka sabitlere başvurabilir). IS_EN sitede i18n.js'ten gelir.
  return new Function("IS_EN", `${text}\nreturn ${section.name};`)(false);
}

const hasFunction = (v) => typeof v === "function" || (v !== null && typeof v === "object" && Object.values(v).some(hasFunction));

function serialize() {
  const text = source.text.replace(/\r\n/g, "\n");
  if (section.kind === "json") {
    return `{\n${Object.entries(root).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n")}\n}\n`;
  }
  const decl = `const ${section.name} = `;
  const at = text.indexOf(decl);
  const [start, end] = literalSpan(text, at + decl.length);
  // Betiklerin ürettiği veri tek satır JSON olarak kalır; elle yazılmış dosyalar okunaklı yazılır.
  const value = section.kind === "data" ? JSON.stringify(root) : toJS(root);
  return text.slice(0, start) + value + text.slice(end);
}

// Sabitin değerinin ({...} ya da [...]) dosyadaki başı ve sonu. Yazılar, şablonlar ve yorumlar atlanır.
function literalSpan(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === "\\") i++;
    } else if (c === "`") {
      for (i++; i < text.length && text[i] !== "`"; i++) if (text[i] === "\\") i++;
    } else if (c === "/" && text[i + 1] === "/") {
      i = text.indexOf("\n", i);
      if (i < 0) break;
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i) + 1;
    } else if ("{[(".includes(c)) depth++;
    else if ("}])".includes(c) && --depth === 0) return [start, i + 1];
  }
  throw new Error(`${section.name} dosyada bulunamadı`);
}

const listIn = (value) => (section.list ? section.list.split(".").reduce((o, k) => o[k], value) : value);
const list = () => listIn(root);
const isArray = () => Array.isArray(list());
const keyOf = (item) => String(item?.id ?? item?.name ?? "");

// Otomatik güncellenen dosyalarda değişen kayıtlar duzeltmeler.json'a da yazılır (scripts/duzeltmeler.mjs yeniden uygular).
async function patchFile() {
  const path = `${section.file.slice(0, section.file.lastIndexOf("/"))}/duzeltmeler.json`;
  let patches = {};
  let sha;
  try {
    const file = await Panel.read(path);
    patches = JSON.parse(file.text);
    sha = file.sha;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const before = new Map(listIn(JSON.parse(original)).map((x) => [keyOf(x), JSON.stringify(x)]));
  const after = new Map(list().map((x) => [keyOf(x), x]));
  const p = (patches[section.list] ||= {});
  p.set ||= {};
  p.remove ||= [];
  for (const [k, item] of after) {
    if (before.get(k) === JSON.stringify(item)) continue;
    p.set[k] = item;
    p.remove = p.remove.filter((r) => r !== k);
  }
  for (const k of before.keys()) {
    if (after.has(k)) continue;
    delete p.set[k];
    if (!p.remove.includes(k)) p.remove.push(k);
  }
  return { path, text: `${JSON.stringify(patches, null, 2)}\n`, sha };
}

async function onSave() {
  if (isArray()) {
    const keys = list().map(keyOf);
    const dup = keys.find((k, i) => k && keys.indexOf(k) !== i);
    if (section.auto && dup) throw new Error(`"${dup}" adında iki kayıt var; adlar farklı olmalı`);
  }
  const files = [{ path: section.file, text: serialize(), sha: source.sha }];
  if (section.auto) files.push(await patchFile());
  const names = [...edited];
  const title = `${game.name}: ${section.label} güncellendi (${names.slice(0, 4).join(", ")}${names.length > 4 ? "…" : ""})`;
  const pr = await Panel.publish(files, title);
  source = await Panel.read(section.file);
  original = JSON.stringify(root);
  edited.clear();
  return pr;
}

// ---------------------------------------------------------------- Ekran

function entries() {
  const l = list();
  return isArray() ? l.map((value, i) => ({ key: String(i), value, title: itemTitle(value, i) })) : Object.entries(l).map(([key, value]) => ({ key, value, title: key }));
}

function itemTitle(value, i) {
  if (value === null || typeof value !== "object") return String(value).slice(0, 60) || `${i + 1}.`;
  // Ad bir dizi ([Türkçe, İngilizce]) ya da { tr, en } olabilir; boşsa sıra numarası.
  const text = (t) => (Array.isArray(t) ? t[0] : t && typeof t === "object" ? t.tr || t.en : t);
  const t = [value.name, value.title, value.label, value.id, value.tr].map(text).find((x) => x);
  if (!t && "title" in value) return "Başlıksız (sayfanın üstündeki yazı)";
  return t ? String(t) : `${i + 1}.`;
}

function render() {
  const all = entries();
  if (!all.some((e) => e.key === selected)) selected = all[0]?.key ?? null;
  history.replaceState(null, "", `edit.html?oyun=${params.get("oyun")}&bolum=${params.get("bolum")}${selected != null ? `&kayit=${encodeURIComponent(selected)}` : ""}`);

  const top = el(
    "div",
    {},
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), ` / ${game.name} / ${section.label}`),
    el(
      "div",
      { class: "chips" },
      game.sections.map((s) => el("a", { class: "chip", href: s.href, "aria-pressed": String(s === section) }, s.label))
    ),
    section.auto
      ? el("p", { class: "hint" }, "Bu veri her hafta wikiden yenilenir. Burada yaptığın değişiklikler ayrıca kaydedilir ve her güncellemeden sonra yeniden uygulanır.")
      : null
  );

  const items = el("div", { class: "item-list" });
  const search = el("input", { class: "input", type: "search", placeholder: `${all.length} kayıt içinde ara…`, value: query, "aria-label": "Kayıt ara" });
  function drawList() {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const shown = words.length ? entries().filter((e) => words.every((w) => fold(e.title).includes(w) || fold(JSON.stringify(e.value)).includes(w))) : entries();
    fill(items, 
      ...shown.slice(0, 400).map((e) =>
        el(
          "button",
          {
            type: "button",
            class: `item-btn${e.key === selected ? " active" : ""}`,
            "data-key": e.key,
            onclick: () => {
              selected = e.key;
              render();
            },
          },
          e.title
        )
      ),
      shown.length > 400 ? el("p", { class: "hint" }, `İlk 400 kayıt gösteriliyor; aramayı daralt.`) : null,
      shown.length ? null : el("p", { class: "hint" }, "Aramana uyan kayıt yok.")
    );
  }
  search.addEventListener("input", () => {
    query = search.value;
    drawList();
  });
  drawList();

  const add = el("button", { type: "button", class: "chip", onclick: addItem }, "+ Yeni kayıt");

  fill(app, 
    top,
    el(
      "div",
      { class: "editor-grid list-grid" },
      el("div", { class: "list-col" }, search, items, add),
      el("div", { class: "form-col" }, selected != null ? itemForm(all.find((e) => e.key === selected)) : el("p", { class: "hint" }, "Kayıt yok."))
    ),
    bar.node
  );
  // Seçili kaydı listede görünür yap.
  items.querySelector(".item-btn.active")?.scrollIntoView({ block: "nearest" });
}

function itemForm(entry) {
  const l = list();
  const holder = l;
  const key = isArray() ? Number(entry.key) : entry.key;
  const heading = el("h2", {}, entry.title);
  const touch = () => {
    edited.add(itemTitle(holder[key], key));
    bar.changed();
    const fresh = isArray() ? itemTitle(holder[key], key) : entry.key;
    heading.textContent = fresh;
    const button = document.querySelector(`.item-btn[data-key="${CSS.escape(entry.key)}"]`);
    if (button) button.textContent = fresh;
  };
  const remove = el(
    "button",
    {
      type: "button",
      class: "icon-btn",
      onclick: () => {
        if (!confirm(`"${entry.title}" silinsin mi?`)) return;
        edited.add(entry.title);
        if (isArray()) l.splice(key, 1);
        else delete l[key];
        selected = null;
        bar.changed();
        render();
      },
    },
    "Kaydı sil"
  );
  return el(
    "div",
    {},
    el("div", { class: "form-head" }, heading, remove),
    isArray() ? null : el("p", { class: "hint" }, "Anahtar: ", el("code", {}, entry.key)),
    field(holder, key, touch, 0, "")
  );
}

// Değerin türüne göre alan: yazı, sayı, evet/hayır, liste ya da alt alanlar.
function field(holder, key, touch, depth, title) {
  const v = holder[key];
  const name = title ?? label(key);
  if (v === null || typeof v !== "object") return simpleField(holder, key, touch, name);
  if (Array.isArray(v) && v.every((x) => x === null || typeof x !== "object")) return simpleList(holder, key, touch, name);
  if (Array.isArray(v)) return objectList(holder, key, touch, depth, name);
  // Nesne: alt alanlar (en üst düzeyde çerçevesiz).
  const children = Object.keys(v).map((k) => field(v, k, touch, depth + 1));
  return depth === 0 && name === "" ? el("div", {}, children) : el("fieldset", { class: "group" }, el("legend", {}, name), children);
}

const IMAGE = /\.(png|jpe?g|webp|gif|svg)(\/|\?|$)|\/revision\/latest/i;

function simpleField(holder, key, touch, name) {
  const v = holder[key];
  let input;
  if (typeof v === "boolean") {
    input = el("input", { type: "checkbox", checked: v });
    input.addEventListener("change", () => {
      holder[key] = input.checked;
      touch();
    });
    return el("label", { class: "field check" }, input, el("span", {}, name));
  }
  if (typeof v === "number") {
    input = el("input", { class: "input", type: "number", step: "any", value: String(v) });
    input.addEventListener("input", () => {
      holder[key] = input.value === "" ? null : Number(input.value);
      touch();
    });
  } else {
    const text = v ?? "";
    const long = text.length > 70 || text.includes("\n") || text.includes("<");
    input = long ? el("textarea", { rows: Math.min(10, Math.ceil(text.length / 70) + 1) }, text) : el("input", { class: "input", value: text, placeholder: v === null ? "(boş)" : "" });
    input.addEventListener("input", () => {
      holder[key] = input.value === "" && v === null ? null : input.value;
      touch();
      if (preview) preview.src = input.value;
    });
  }
  const preview = typeof v === "string" && IMAGE.test(v) ? el("img", { class: "thumb", src: v, alt: "", referrerpolicy: "no-referrer", loading: "lazy" }) : null;
  return el("label", { class: "field" }, el("span", {}, name), preview, input);
}

// Yazı/sayı listesi: her öğe bir satır, sona ekle.
function simpleList(holder, key, touch, name) {
  const arr = holder[key];
  const box = el("div", { class: "rows" });
  function draw() {
    fill(box, 
      ...arr.map((x, i) => {
        const input = el("input", { class: "input", value: x ?? "", type: typeof x === "number" ? "number" : "text", step: "any", "aria-label": `${name} ${i + 1}` });
        input.addEventListener("input", () => {
          arr[i] = typeof x === "number" ? Number(input.value) : input.value;
          touch();
        });
        return el(
          "div",
          { class: "row" },
          input,
          el("button", { type: "button", class: "icon-btn", title: "Sil", onclick: () => (arr.splice(i, 1), touch(), draw()) }, "✕")
        );
      }),
      el("button", { type: "button", class: "chip", onclick: () => (arr.push(typeof arr[0] === "number" ? 0 : ""), touch(), draw()) }, "+ Ekle")
    );
  }
  draw();
  return el("div", { class: "field" }, el("span", {}, name), box);
}

// Nesne listesi: her öğe açılır kapanır bir kutu (içerik açılınca oluşturulur).
function objectList(holder, key, touch, depth, name) {
  const arr = holder[key];
  const box = el("div", { class: "rows" });
  function draw() {
    fill(box, 
      ...arr.map((x, i) => {
        const details = el(
          "details",
          { class: "sub" },
          el(
            "summary",
            {},
            el("span", {}, itemTitle(x, i)),
            el("button", { type: "button", class: "icon-btn", title: "Sil", onclick: (e) => (e.preventDefault(), confirm("Bu öğe silinsin mi?") && (arr.splice(i, 1), touch(), draw())) }, "✕")
          )
        );
        details.addEventListener("toggle", () => {
          if (details.open && details.children.length === 1) details.append(field(arr, i, touch, depth + 1, ""));
        });
        return details;
      }),
      el("button", { type: "button", class: "chip", onclick: () => (arr.push(blank(arr[0])), touch(), draw(), box.lastElementChild.previousElementSibling?.setAttribute("open", "")) }, "+ Ekle")
    );
  }
  draw();
  return el("div", { class: "field" }, el("span", {}, `${name} (${arr.length})`), box);
}

// Yeni öğe için boş kalıp: ilk öğeyle aynı alanlar, değerler boş.
function blank(x) {
  if (Array.isArray(x)) return [];
  if (x === null || x === undefined) return "";
  if (typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, blank(v)]));
  return typeof x === "number" ? 0 : typeof x === "boolean" ? false : "";
}

function addItem() {
  const l = list();
  if (isArray()) {
    const item = blank(l[0] ?? {});
    if (item && typeof item === "object") {
      if ("name" in item) item.name = "Yeni kayıt";
      if ("id" in item) item.id = `yeni-${Date.now().toString(36)}`;
    }
    l.push(item);
    selected = String(l.length - 1);
  } else {
    const key = prompt("Yeni kaydın anahtarı (adı):")?.trim();
    if (!key) return;
    if (key in l) return alert("Bu anahtar zaten var.");
    l[key] = blank(Object.values(l)[0] ?? "");
    selected = key;
  }
  edited.add(selected);
  query = "";
  bar.changed();
  render();
}
