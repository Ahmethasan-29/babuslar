const root = document.getElementById("boss");
const boss = DKD.bosses.find((b) => b.id === new URLSearchParams(location.search).get("id"));

// Zorluk: Apprentice / Veteran / Champion; can, hız ve saldırı değerleri seviyeye göre değişir.
let level = 0;
const LEVELS = ["Apprentice (seviye 1)", "Veteran (seviye 3)", "Champion (seviye 5)"];

const RES = { stun: "Stun", blight: "Blight", bleed: "Bleed", debuff: "Debuff", move: "Move" };

if (!boss) {
  showNotice(root, "Boss bulunamadı. Listeden bir boss seç.");
} else {
  document.title = `${boss.name} · Darkest Dungeon · Babuşlar`;
  render();
}

function render() {
  const v = boss.variants[level] || boss.variants[0];
  const abil = boss.abilities[level] || boss.abilities[0];

  const head = el(
    "section",
    { class: "dd-hero-head" },
    ddImg(boss.image, boss.name, 220, "dd-portrait"),
    el(
      "div",
      { class: "dd-hero-info" },
      el("h1", {}, boss.name),
      boss.type ? el("span", { class: "badge" }, boss.type) : null,
      boss.intro ? el("p", { class: "dd-intro" }, ddText("bosses", boss.name, null, boss.intro)) : null,
      boss.variants.length > 1
        ? el(
            "div",
            { class: "chips", role: "group", "aria-label": "Zorluk" },
            boss.variants.map((x, i) =>
              el("button", { class: "chip", type: "button", "aria-pressed": String(i === level), onclick: () => ((level = i), render()) }, LEVELS[i] || x.name || `Seviye ${i + 1}`)
            )
          )
        : null,
      v ? el("div", { class: "dd-stats" }, stat("Can (HP)", v.hp), stat("DODGE", v.dodge), stat("PROT", v.prot), stat("SPD", v.spd), stat("Boyut", boss.size)) : null,
      el("h3", { class: "dd-sub" }, "Dirençler"),
      el(
        "div",
        { class: "dd-res" },
        Object.entries(RES).map(([k, label]) => (boss.res[k] ? el("span", { class: `dd-res-item fx-${k}` }, `${label} %${boss.res[k]}`) : null))
      )
    )
  );

  const attacks =
    abil && abil.attacks.length
      ? el("section", { class: "section" }, el("h2", {}, "Saldırılar"), el("div", { class: "dd-skills" }, abil.attacks.map(attackCard)))
      : null;

  root.replaceChildren(...[head, attacks].filter(Boolean));
}

function attackCard(a) {
  const type = a.type === "Melee" ? "Yakın dövüş" : a.type === "Ranged" ? "Menzilli" : a.type;
  return el(
    "article",
    { class: "ability dd-skill dd-attack" },
    el(
      "div",
      {},
      el("h3", {}, a.name),
      el(
        "div",
        { class: "dd-skill-meta" },
        type ? el("span", { class: "badge" }, type) : null,
        a.rank ? el("span", { class: "dd-rank-label" }, "Konum", rankDots(a.rank.replace(/,/g, ""), "target")) : null,
        a.target ? el("span", { class: "dd-rank-label" }, "Hedef", rankDots(a.target, "rank")) : null
      ),
      el(
        "div",
        { class: "meta" },
        a.damage && a.damage !== "0" ? el("span", {}, "Hasar: ", el("b", {}, a.damage)) : null,
        a.accuracy ? el("span", {}, "İsabet: ", el("b", {}, a.accuracy)) : null,
        a.crit && a.crit !== "0" ? el("span", {}, "Kritik: ", el("b", {}, `%${a.crit}`)) : null
      ),
      a.effect ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Hedefe: "), ddRich(a.effect)) : null,
      a.self ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Kendine: "), ddRich(a.self)) : null
    )
  );
}

function stat(label, value) {
  if (value == null || value === "") return null;
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, String(value)));
}
