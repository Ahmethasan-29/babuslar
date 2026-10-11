// Brotato eşyaları: nadirliğe ve etikete göre süzme.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const TAGS = [...new Set(BRO.items.flatMap((i) => i.tags))].sort();
let rarity = "all";
let tag = "all";
const tagName = (t) => (IS_EN ? t : BRO_TR.stats[t] || BRO_TR.tags?.[t] || t);
const icon = (x) => (x.icon ? el("img", { class: "bro-icon", src: x.icon, alt: "", loading: "lazy" }) : el("span", { class: "dd-noimg bro-icon" }));

function chips(id, items, current, set) {
  document.getElementById(id).replaceChildren(...items.map(([k, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(current === k), onclick: () => (set(k), render()) }, label)));
}

function card(it) {
  return el(
    "article",
    { class: `build-card bro-card r${it.rarity || 1}` },
    el(
      "div",
      { class: "bro-head" },
      icon(it),
      el("div", {}, el("h3", {}, it.name), el("p", { class: "tile-sub" }, L(...BRO_TR.rarityName[(it.rarity || 1) - 1]), it.price ? ` · ${it.price} ${L("malzeme", "materials")}` : "", it.dlc ? " · DLC" : ""))
    ),
    el("p", { class: "bro-special" }, richText(trStats(it.stats))),
    it.limit || it.unique ? el("p", { class: "tile-sub" }, L(`En fazla ${it.limit || 1} tane alınabilir.`, `Limit: ${it.limit || 1}.`)) : null,
    it.tags.length ? el("div", { class: "tags" }, it.tags.map((t) => el("span", { class: "badge" }, tagName(t)))) : null,
    it.unlock ? el("p", { class: "tile-sub" }, el("strong", {}, L("Açılır: ", "Unlock: ")), it.unlock) : null
  );
}

function render() {
  chips("f1", [["all", L("Her nadirlik", "Any rarity")], ...BRO_TR.rarityName.map((r, i) => [i + 1, L(...r)])], rarity, (k) => (rarity = k));
  chips("f2", [["all", L("Her etiket", "Any tag")], ...TAGS.map((t) => [t, tagName(t)])], tag, (k) => (tag = k));
  const q = normalize(search.value.trim());
  const items = BRO.items.filter(
    (it) => (rarity === "all" || it.rarity === rarity) && (tag === "all" || it.tags.includes(tag)) && (!q || normalize(`${it.name} ${it.stats.replace(/<[^>]+>/g, " ")} ${it.tags.join(" ")}`).includes(q))
  );
  count.textContent = L(`${items.length} eşya`, `${items.length} items`);
  if (!items.length) return showNotice(list, L("Aramana uyan eşya bulunamadı.", "No items match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
