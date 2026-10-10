const list = document.getElementById("list");
const search = document.getElementById("search");
const groupsBox = document.getElementById("groups");
const count = document.getElementById("count");

// Trinket'lar wikideki gruplara göre: kahramana özel, genel ("Varying", "Miscellaneous"…), bölge ve boss ganimetleri.
const heroNames = new Set(DKD2.heroes.map((h) => h.name));
const bossNames = new Set(DKD2.bosses.map((b) => b.name));
const kindOf = (g) => (heroNames.has(g) ? "hero" : bossNames.has(g) ? "boss" : "general");
const KINDS = [
  ["all", "Hepsi"],
  ["general", "Genel ve bölge"],
  ["hero", "Kahramana özel"],
  ["boss", "Boss ganimeti"],
];
let kind = "all";

function update() {
  groupsBox.replaceChildren(
    ...KINDS.map(([k, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(k === kind), onclick: () => ((kind = k), update()) }, label))
  );
  render();
}

function render() {
  const query = normalize(search.value.trim());
  const items = DKD2.trinkets.filter(
    (t) => (kind === "all" || kindOf(t.group) === kind) && (!query || normalize(t.name).includes(query) || normalize(t.group).includes(query) || normalize(t.effect).includes(query))
  );
  count.textContent = `${items.length} trinket`;
  if (!items.length) {
    showNotice(list, "Aramana uyan trinket bulunamadı.");
    return;
  }
  list.replaceChildren(
    ...items.map((t) => {
      const owner = heroNames.has(t.group) ? DKD2.heroes.find((h) => h.name === t.group) : null;
      const tag = owner
        ? el("a", { class: "perk-owner", href: `kahraman.html?id=${encodeURIComponent(owner.id)}` }, owner.name)
        : el("span", { class: "perk-owner" }, t.group);
      return itemCard2(t, tag);
    })
  );
}

search.addEventListener("input", render);
update();
