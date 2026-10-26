// Brotato silahları: sınıfa göre süzme ve seviye (I–IV) seçimi; değerler seçilen seviyeye göre gösterilir.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const CLASSES = [...new Set(BRO.weapons.flatMap((w) => w.classes))].sort();
let cls = "all";
let tier = 0;
const className = (c) => (IS_EN ? c : BRO_TR.classes[c] || c);
const icon = (x) => (x.icon ? el("img", { class: "bro-icon", src: x.icon, alt: "", loading: "lazy" }) : el("span", { class: "dd-noimg bro-icon" }));

function chips(id, items, current, set) {
  document.getElementById(id).replaceChildren(...items.map(([k, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(current === k), onclick: () => (set(k), render()) }, label)));
}

function card(w) {
  const t = Math.max(tier, (w.rarity || 1) - 1);
  const v = (arr) => (arr && arr[t]) || "–";
  return el(
    "article",
    { class: `build-card bro-card r${t + 1}` },
    el("div", { class: "bro-head" }, icon(w), el("div", {}, el("h3", {}, w.name), el("p", { class: "tile-sub" }, w.classes.map(className).join(" · "), w.dlc ? " · DLC" : ""))),
    t !== tier ? el("p", { class: "tile-sub" }, L(`Bu silah en düşük ${t + 1}. seviyede çıkar.`, `This weapon starts at tier ${t + 1}.`)) : null,
    el(
      "dl",
      { class: "cp-stats bro-stats" },
      [
        [L("Hasar", "Damage"), statIcons(v(w.damage))],
        [L("Saniyede hasar", "DPS"), statIcons(v(w.dps))],
        [L("Saldırı süresi", "Cooldown"), v(w.speed)],
        [L("Kritik", "Crit"), L(v(w.crit).replace("chance", "şans"), v(w.crit))],
        [L("Menzil", "Range"), v(w.range)],
        [L("Fiyat", "Price"), v(w.price)],
      ].map(([a, b]) => el("div", {}, el("dt", {}, a), el("dd", {}, b)))
    ),
    w.special ? el("p", { class: "bro-special" }, richText(trStats(w.special))) : null,
    w.unlock && w.unlock !== "Default" ? el("p", { class: "tile-sub" }, el("strong", {}, L("Açılır: ", "Unlock: ")), w.unlock) : null
  );
}

function render() {
  chips("f1", [["all", L("Hepsi", "All")], ...CLASSES.map((c) => [c, className(c)])], cls, (k) => (cls = k));
  chips("f2", BRO_TR.rarity.map((r, i) => [i, L(...r)]), tier, (k) => (tier = k));
  const q = normalize(search.value.trim());
  const items = BRO.weapons.filter((w) => (cls === "all" || w.classes.includes(cls)) && (!q || normalize(`${w.name} ${w.classes.join(" ")} ${w.classes.map(className).join(" ")}`).includes(q)));
  count.textContent = L(`${items.length} silah`, `${items.length} weapons`);
  if (!items.length) return showNotice(list, L("Aramana uyan silah bulunamadı.", "No weapons match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
