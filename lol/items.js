const grid = document.getElementById("grid");
const search = document.getElementById("search");
const categories = document.getElementById("categories");
const count = document.getElementById("count");
const patch = document.getElementById("patch");
const dialog = document.getElementById("item-dialog");
const dialogBody = document.getElementById("item-body");

const CATEGORIES = [
  ["all", "Tümü"],
  ["Damage", "Saldırı Gücü"],
  ["SpellDamage", "Yetenek Gücü"],
  ["AttackSpeed", "Saldırı Hızı"],
  ["CriticalStrike", "Kritik Vuruş"],
  ["Health", "Can"],
  ["Armor", "Zırh"],
  ["SpellBlock", "Büyü Direnci"],
  ["Mana", "Mana"],
  ["AbilityHaste", "Yetenek Hızı"],
  ["Boots", "Botlar"],
];

const SUMMONERS_RIFT = "11";

let items = [];
let allItems = {};
let validIds = new Set();
let version = "";
let activeCategory = "all";

ddData("item.json")
  .then(({ version: v, data }) => {
    version = v;
    patch.textContent = `Yama ${v}`;
    allItems = data.data;

    // Sihirdar Vadisi'nde satın alınabilen eşyaları al, aynı isimli kopyaları ele.
    const seen = new Set();
    items = Object.entries(data.data)
      .map(([itemId, item]) => ({ id: itemId, ...item }))
      .filter(
        (item) =>
          item.maps?.[SUMMONERS_RIFT] &&
          item.gold?.purchasable &&
          item.inStore !== false &&
          !item.hideFromAll &&
          !item.requiredChampion &&
          !item.requiredAlly
      )
      .filter((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      })
      .sort((a, b) => a.gold.total - b.gold.total || a.name.localeCompare(b.name, "tr"));

    validIds = new Set(items.map((item) => item.id));
    buildCategoryChips();
    render();
  })
  .catch(() => {
    patch.textContent = "Bağlantı hatası";
    showNotice(grid, "Eşyalar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.");
  });

function buildCategoryChips() {
  categories.replaceChildren(
    ...CATEGORIES.map(([key, label]) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "data-category": key,
          "aria-pressed": String(key === activeCategory),
          onclick: () => {
            activeCategory = key;
            for (const chip of categories.children) {
              chip.setAttribute("aria-pressed", String(chip.dataset.category === activeCategory));
            }
            render();
          },
        },
        label
      )
    )
  );
}

function render() {
  const query = normalize(search.value.trim());
  const list = items.filter(
    (item) =>
      (activeCategory === "all" || item.tags?.includes(activeCategory)) &&
      (!query || normalize(item.name).includes(query) || normalize(item.plaintext).includes(query))
  );

  count.textContent = `${list.length} eşya`;

  if (!list.length) {
    showNotice(grid, "Aramana uyan eşya bulunamadı.");
    return;
  }

  grid.replaceChildren(
    ...list.map((item) =>
      el(
        "button",
        { class: "tile", type: "button", onclick: () => openItem(item.id) },
        el("img", { src: ddImg(version, "item", item.image.full), alt: "", loading: "lazy", width: 72, height: 72 }),
        el("span", { class: "tile-name" }, item.name),
        el("span", { class: "tile-sub gold" }, `${item.gold.total} altın`)
      )
    )
  );
}

function itemButton(itemId) {
  const item = allItems[itemId];
  if (!item) return null;
  return el(
    "button",
    { type: "button", onclick: () => openItem(itemId) },
    el("img", { src: ddImg(version, "item", item.image.full), alt: "" }),
    el("span", {}, item.name)
  );
}

function openItem(itemId) {
  const item = allItems[itemId];
  if (!item) return;

  const from = (item.from || []).map(itemButton).filter(Boolean);
  const into = (item.into || []).filter((x) => validIds.has(x)).map(itemButton).filter(Boolean);

  const sections = [
    el(
      "div",
      { class: "dialog-head" },
      el("img", { src: ddImg(version, "item", item.image.full), alt: "", width: 64, height: 64 }),
      el(
        "div",
        {},
        el("h2", { id: "item-title" }, item.name),
        el("span", { class: "gold" }, `${item.gold.total} altın`),
        item.gold.sell ? el("span", { class: "tile-sub" }, ` · Satış: ${item.gold.sell} altın`) : null
      )
    ),
    item.plaintext ? el("p", { class: "page-sub", style: "margin-bottom:12px" }, item.plaintext) : null,
    el("p", { class: "desc" }, plainText(item.description)),
    from.length ? el("h3", {}, "Yapımı") : null,
    from.length ? el("div", { class: "recipe" }, from) : null,
    into.length ? el("h3", {}, "Dönüştüğü eşyalar") : null,
    into.length ? el("div", { class: "recipe" }, into) : null,
  ];
  dialogBody.replaceChildren(...sections.filter(Boolean));

  if (!dialog.open) dialog.showModal();
  dialogBody.scrollTop = 0;
}

search.addEventListener("input", render);
document.getElementById("item-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
