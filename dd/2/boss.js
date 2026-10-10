const root = document.getElementById("boss");
const boss = DKD2.bosses.find((b) => b.id === new URLSearchParams(location.search).get("id"));

// Bossun biçimleri (ör. Librarian ve Librarian (Ignited)); her biçimin can, hız ve dirençleri ayrı.
let form = 0;
const RES = { stun: "Stun", move: "Move", blight: "Blight", bleed: "Bleed", burn: "Burn", debuff: "Debuff" };

if (!boss) {
  showNotice(root, "Boss bulunamadı. Listeden bir boss seç.");
} else {
  document.title = `${boss.name} · Darkest Dungeon II · Babuşlar`;
  render();
}

function render() {
  const v = boss.variants[form] || boss.variants[0];
  const head = el(
    "section",
    { class: "dd-hero-head" },
    ddImg((v && v.image) || boss.image, boss.name, 220, "dd-portrait"),
    el(
      "div",
      { class: "dd-hero-info" },
      el("h1", {}, boss.name),
      boss.region ? el("span", { class: "badge" }, boss.region) : null,
      boss.quote ? el("p", { class: "dd-quote" }, `“${ddText2("bosses", boss.name, "quote", boss.quote)}”`) : null,
      boss.intro ? el("p", { class: "dd-intro" }, ddText2("bosses", boss.name, "intro", boss.intro)) : null,
      boss.variants.length > 1
        ? el(
            "div",
            { class: "chips", role: "group", "aria-label": "Biçim" },
            boss.variants.map((x, i) => el("button", { class: "chip", type: "button", "aria-pressed": String(i === form), onclick: () => ((form = i), render()) }, x.name))
          )
        : null,
      v
        ? el(
            "div",
            { class: "dd-stats" },
            stat("Can (HP)", v.hp),
            stat("SPD", v.spd),
            stat("Tur sayısı", v.turns),
            stat("Boyut", v.size),
            v.deathArmor && v.deathArmor !== "0" ? stat("Ölüm zırhı", v.deathArmor) : null
          )
        : null,
      v ? el("h3", { class: "dd-sub" }, "Dirençler") : null,
      v ? el("div", { class: "dd-res" }, Object.entries(RES).map(([k, label]) => (v.res[k] ? el("span", { class: `dd-res-item fx-${k}` }, `${label} %${v.res[k]}`) : null))) : null
    )
  );

  const behavior = ddText2("bosses", boss.name, "behavior", boss.behavior);
  const how = behavior
    ? el("section", { class: "section" }, el("h2", {}, "Nasıl dövüşür?"), el("div", { class: "build-card dd-behavior" }, behavior.split("\n").filter(Boolean).map(behaviorLine)))
    : null;

  root.replaceChildren(...[head, how].filter(Boolean));
}

function stat(label, value) {
  if (value == null || value === "") return null;
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, String(value)));
}

// Wikideki alt başlıklar ("=== The Blood Thickens ===") başlık olarak, diğer satırlar paragraf olarak gösterilir.
function behaviorLine(line) {
  const heading = line.match(/^=+\s*(.+?)\s*=+$/);
  return heading ? el("h3", {}, heading[1]) : el("p", {}, line);
}
