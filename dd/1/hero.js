const root = document.getElementById("hero");
const hero = DKD.heroes.find((h) => h.id === new URLSearchParams(location.search).get("id"));

// Beceri seviyesi (1–5): oyunda Demirci/Lonca'da yükseltilir. Tüm beceri kartları aynı seviyeyi gösterir.
let skillLevel = 1;

const RES_LABELS = {
  stun: "Stun",
  blight: "Blight",
  disease: "Disease",
  deathblow: "Death Blow",
  move: "Move",
  bleed: "Bleed",
  debuff: "Debuff",
  trap: "Trap",
};

if (!hero) {
  showNotice(root, "Kahraman bulunamadı. Listeden bir kahraman seç.");
} else {
  document.title = `${hero.name} · Darkest Dungeon · Babuşlar`;
  render();
}

function render() {
  const s = hero.stats;
  const head = el(
    "section",
    { class: "dd-hero-head" },
    ddImg(hero.image, hero.name, 220, "dd-portrait"),
    el(
      "div",
      { class: "dd-hero-info" },
      el("h1", {}, hero.name),
      hero.religious ? el("span", { class: "badge" }, "Dindar") : null,
      // Ata'nın sözü ve Lonca'nın savaş tarzı açıklaması (oyunun kendi metinleri); yoksa wiki girişi.
      hero.quote ? el("p", { class: "dd-quote" }, `“${ddText("heroes", hero.name, "quote", hero.quote)}”`) : null,
      hero.style
        ? el("p", { class: "dd-intro" }, ddText("heroes", hero.name, "style", hero.style))
        : hero.intro
          ? el("p", { class: "dd-intro" }, hero.intro.split("\n")[0])
          : null,
      el(
        "div",
        { class: "dd-stats" },
        stat("Can (HP)", `${s.hp}${s.hpPerRank ? ` (+${s.hpPerRank}/seviye)` : ""}`),
        stat("DODGE", `${s.dodge}${s.dodgePerRank ? ` (+${s.dodgePerRank}/seviye)` : ""}`),
        stat("PROT", s.prot),
        stat("SPD", s.spd),
        stat("ACC", s.acc),
        stat("CRIT", `%${s.crit}`),
        stat("DMG", s.dmg),
        hero.critBonus ? stat("Kritik bonusu", hero.critBonus) : null
      ),
      el("h3", { class: "dd-sub" }, "Dirençler"),
      el(
        "div",
        { class: "dd-res" },
        Object.entries(RES_LABELS).map(([k, label]) => (hero.res[k] ? el("span", { class: `dd-res-item fx-${k}` }, `${label} %${hero.res[k]}`) : null))
      )
    )
  );

  const skills = el(
    "section",
    { class: "section" },
    el("div", { class: "dd-section-head" }, el("h2", {}, "Savaş becerileri"), levelChips()),
    el("div", { class: "dd-skills" }, hero.skills.map(skillCard))
  );

  const camp = hero.camp.length
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, "Kamp becerileri"),
        el("div", { class: "dd-skills" }, hero.camp.map(campCard))
      )
    : null;

  const own = DKD.trinkets.filter((t) => t.class === hero.name);
  const trinkets = own.length
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, `${hero.name} trinket'ları`),
        el("div", { class: "dd-trinkets" }, own.map((t) => trinketCard(t)))
      )
    : null;

  root.replaceChildren(...[head, skills, camp, trinkets].filter(Boolean));
}

function stat(label, value) {
  if (value == null || value === "") return null;
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, String(value)));
}

function levelChips() {
  return el(
    "div",
    { class: "chips", role: "group", "aria-label": "Beceri seviyesi" },
    [1, 2, 3, 4, 5].map((n) =>
      el(
        "button",
        { class: "chip", type: "button", "aria-pressed": String(n === skillLevel), onclick: () => ((skillLevel = n), render()) },
        `Seviye ${n}`
      )
    )
  );
}

function skillCard(sk) {
  const lv = sk.levels[skillLevel - 1] || sk.levels[0];
  const kind = sk.kind === "yes" ? "İyileştirme" : sk.kind === "buff" ? "Destek" : sk.range === "ranged" ? "Menzilli" : sk.range === "melee" ? "Yakın dövüş" : null;
  const rows = [
    lv.value ? row(sk.kind === "yes" ? "İyileştirme" : "Hasar etkisi", lv.value) : null,
    lv.accuracy ? row("İsabet", lv.accuracy) : null,
    lv.crit ? row("Kritik", lv.crit) : null,
    sk.limit ? row("Sınır", sk.limit) : null,
  ].filter(Boolean);
  return el(
    "article",
    { class: "ability dd-skill" },
    ddImg(sk.icon, "", 56, "dd-skill-icon"),
    el(
      "div",
      {},
      el("h3", {}, sk.name),
      el(
        "div",
        { class: "dd-skill-meta" },
        kind ? el("span", { class: "badge" }, kind) : null,
        el("span", { class: "dd-rank-label" }, "Konum", rankDots(sk.rank, "rank")),
        sk.target && sk.target !== "self" ? el("span", { class: "dd-rank-label" }, "Hedef", rankDots(sk.target, "target")) : el("span", { class: "tile-sub" }, "Hedef: kendisi")
      ),
      rows.length ? el("div", { class: "meta" }, rows) : null,
      lv.effect ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Hedefe: "), ddRich(lv.effect)) : null,
      lv.self ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Kendine: "), ddRich(lv.self)) : null
    )
  );
}

function row(label, value) {
  return el("span", {}, `${label}: `, el("b", {}, value));
}

function campCard(c) {
  return el(
    "article",
    { class: "ability dd-skill" },
    ddImg(c.icon, "", 56, "dd-skill-icon"),
    el(
      "div",
      {},
      el("h3", {}, c.name),
      el("div", { class: "meta" }, c.time ? row("Süre", c.time) : null, c.target ? el("span", {}, "Hedef: ", ddRich(c.target)) : null),
      c.description ? el("div", { class: "dd-effect" }, ddRich(c.description)) : null
    )
  );
}
