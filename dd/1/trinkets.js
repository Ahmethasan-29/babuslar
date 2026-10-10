const list = document.getElementById("list");
const search = document.getElementById("search");
const rarities = document.getElementById("rarities");
const owners = document.getElementById("owners");
const count = document.getElementById("count");

let rarity = "all";
let owner = "all";

const OWNERS = [
  ["all", "Hepsi"],
  ["general", "Herkes için"],
  ["hero", "Kahramana özel"],
];

function chips(container, options, isActive, pick) {
  container.replaceChildren(
    ...options.map(([key, label]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(isActive(key)), onclick: () => (pick(key), update()) }, label)
    )
  );
}

function update() {
  const used = Object.keys(RARITY).filter((r) => DKD.trinkets.some((t) => t.rarity === r));
  chips(rarities, [["all", "Tüm nadirlikler"], ...used.map((r) => [r, IS_EN ? RARITY[r].en : RARITY[r].tr])], (k) => k === rarity, (k) => (rarity = k));
  chips(owners, OWNERS, (k) => k === owner, (k) => (owner = k));
  render();
}

function render() {
  const query = normalize(search.value.trim());
  const items = DKD.trinkets
    .filter(
      (t) =>
        (rarity === "all" || t.rarity === rarity) &&
        (owner === "all" || (owner === "hero" ? !!t.class : !t.class)) &&
        (!query || normalize(t.name).includes(query) || normalize(t.class).includes(query) || normalize(t.effect).includes(query))
    )
    .sort((a, b) => (RARITY[a.rarity]?.order || 9) - (RARITY[b.rarity]?.order || 9) || a.name.localeCompare(b.name, "en"));
  count.textContent = `${items.length} trinket`;
  if (!items.length) {
    showNotice(list, "Aramana uyan trinket bulunamadı.");
    return;
  }
  list.replaceChildren(...items.map((t) => trinketCard(t, true)));
}

search.addEventListener("input", render);
update();
