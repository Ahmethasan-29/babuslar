// Project Zomboid silahları (PZwiki "Weapon" ve "Firearm" tabloları): türe göre süzme, arama ve sıralama.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const CATS = [...new Set(PZ.weapons.map((w) => w.cat))];
const FIREARM = new Set(["Handguns", "Shotguns", "Rifles"]);
let cat = "all";
let sort = "dmg";
const SORTS = {
  dmg: [["Hasar", "Damage"], (w) => w.dmg[1] || 0],
  range: [["Menzil", "Range"], (w) => w.range || 0],
  speed: [["Hız", "Speed"], (w) => w.speed || 0],
  cond: [["Dayanıklılık", "Durability"], (w) => w.cond || 0],
  name: [["Ad", "Name"], null],
};
const catName = (c) => (IS_EN ? c : PZ_TR.weaponCats[c] || c);
const fmt = (n) => (n == null ? "–" : Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

function chips(id, items, current, set) {
  document.getElementById(id).replaceChildren(...items.map(([k, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(current === k), onclick: () => (set(k), render()) }, label)));
}

function stat(label, value) {
  return el("div", {}, el("dt", {}, label), el("dd", {}, value));
}

function card(w) {
  const fire = FIREARM.has(w.cat);
  return el(
    "article",
    { class: "build-card pz-weapon" },
    el(
      "div",
      { class: "pz-weapon-head" },
      w.icon ? el("img", { class: "pz-icon big", src: w.icon, alt: "", loading: "lazy" }) : null,
      el("div", {}, el("h3", {}, w.name), el("p", { class: "tile-sub" }, [!IS_EN && w.tr && w.tr !== w.name ? w.tr : null, catName(w.cat), w.hands].filter(Boolean).join(" · ")))
    ),
    el(
      "dl",
      { class: "cp-stats pz-stats" },
      stat(L("Hasar", "Damage"), `${fmt(w.dmg[0])}–${fmt(w.dmg[1])}`),
      stat(L("Menzil", "Range"), fmt(w.range)),
      fire ? stat(L("Mermi", "Ammo"), w.ammo || "–") : stat(L("Hız", "Speed"), fmt(w.speed)),
      fire ? stat(L("Şarjör", "Magazine"), w.cap || "–") : stat(L("Dayanıklılık", "Condition"), fmt(w.cond)),
      stat(L("Kritik", "Crit"), w.crit == null ? "–" : `%${fmt(w.crit)}`),
      fire ? stat(L("Ses menzili", "Noise"), fmt(w.noise)) : stat(L("Ağırlık", "Weight"), fmt(w.weight))
    )
  );
}

function render() {
  chips("cats", [["all", L("Hepsi", "All")], ...CATS.map((c) => [c, catName(c)])], cat, (k) => (cat = k));
  chips("sorts", Object.entries(SORTS).map(([k, [n]]) => [k, L(...n)]), sort, (k) => (sort = k));
  const q = normalize(search.value.trim());
  const items = PZ.weapons.filter((w) => (cat === "all" || w.cat === cat) && (!q || normalize(`${w.name} ${w.tr || ""} ${w.cat} ${catName(w.cat)} ${w.ammo || ""}`).includes(q)));
  const key = SORTS[sort][1];
  items.sort((a, b) => (key ? key(b) - key(a) : 0) || a.name.localeCompare(b.name));
  count.textContent = L(`${items.length} silah`, `${items.length} weapons`);
  if (!items.length) {
    showNotice(list, L("Aramana uyan silah bulunamadı.", "No weapons match your search."));
    return;
  }
  list.replaceChildren(...items.map(card));
}

search.addEventListener("input", render);
render();
