const grid = document.getElementById("grid");
const search = document.getElementById("search");
const categories = document.getElementById("categories");
const count = document.getElementById("count");
const patch = document.getElementById("patch");

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

let items = [];
let allItems = {};
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
      .filter(([itemId, item]) => isRiftItem(itemId, item))
      .map(([itemId, item]) => ({ id: itemId, ...item }))
      .filter((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      })
      .sort((a, b) => a.gold.total - b.gold.total || a.name.localeCompare(b.name, "tr"));

    buildCategoryChips();
    render();
    openFromHash();
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
        { class: "tile", type: "button", onclick: () => openItemDialog(version, allItems, item.id) },
        el("img", { src: ddImg(version, "item", item.image.full), alt: "", loading: "lazy", width: 72, height: 72 }),
        el("span", { class: "tile-name" }, item.name),
        el("span", { class: "tile-sub gold" }, `${item.gold.total} altın`)
      )
    )
  );
}

// esyalar.html#3089 gibi bağlantılar eşyayı doğrudan açar.
function openFromHash() {
  const itemId = location.hash.slice(1);
  if (/^\d+$/.test(itemId)) openItemDialog(version, allItems, itemId);
}

window.addEventListener("hashchange", openFromHash);
search.addEventListener("input", render);
