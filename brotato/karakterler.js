// Brotato karakterleri: özellikleri, başlangıç silahları ve açılma koşulları.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const weaponByName = Object.fromEntries(BRO.weapons.map((w) => [w.name.toLowerCase(), w]));
let dlc = "all";

function card(c) {
  return el(
    "article",
    { class: "build-card bro-card bro-char" },
    el("div", { class: "bro-head" }, c.icon ? el("img", { class: "bro-icon big", src: c.icon, alt: "", loading: "lazy" }) : null, el("div", {}, el("h3", {}, c.name), c.dlc ? el("span", { class: "badge" }, "DLC") : null)),
    el("p", { class: "bro-special" }, richText(trStats(c.stats))),
    c.wants ? el("p", { class: "tile-sub" }, el("strong", {}, L("Sevdiği statlar: ", "Wanted stats: ")), c.wants.split(/,\s*/).map((s) => (IS_EN ? s : BRO_TR.stats[s] || BRO_TR.tags[s] || s)).join(", ")) : null,
    c.weapons.length
      ? el(
          "div",
          { class: "bro-weps" },
          el("span", { class: "tile-sub" }, L("Başlangıç silahları", "Starting weapons")),
          el(
            "div",
            {},
            c.weapons.map((n) => {
              const w = weaponByName[n.toLowerCase()];
              return w?.icon ? el("img", { class: "bro-mini", src: w.icon, alt: n, title: n, loading: "lazy" }) : el("span", { class: "badge" }, n);
            })
          )
        )
      : null,
    el("p", { class: "tile-sub" }, el("strong", {}, L("Nasıl açılır: ", "Unlock: ")), IS_EN ? c.unlock : c.unlock.replace("Unlocked by default", "Baştan açık"), c.unlocks ? L(` · Açtığı: ${c.unlocks}`, ` · Unlocks: ${c.unlocks}`) : "")
  );
}

function render() {
  document.getElementById("f1").replaceChildren(
    ...[
      ["all", L("Hepsi", "All")],
      ["base", L("Ana oyun", "Base game")],
      ["dlc", "DLC"],
    ].map(([k, n]) => el("button", { class: "chip", type: "button", "aria-pressed": String(dlc === k), onclick: () => ((dlc = k), render()) }, n))
  );
  const q = normalize(search.value.trim());
  const items = BRO.characters.filter((c) => (dlc === "all" || (dlc === "dlc") === c.dlc) && (!q || normalize(`${c.name} ${c.stats.replace(/<[^>]+>/g, " ")} ${c.wants} ${c.weapons.join(" ")}`).includes(q)));
  count.textContent = L(`${items.length} karakter`, `${items.length} characters`);
  if (!items.length) return showNotice(list, L("Aramana uyan karakter bulunamadı.", "No characters match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
