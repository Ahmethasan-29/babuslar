const root = document.getElementById("hero");
const hero = DKD2.heroes.find((h) => h.id === new URLSearchParams(location.search).get("id"));

// Seçili yol (Path) ve beceri hali (normal / yükseltilmiş). Yol seçilince o yola özel beceri sürümleri gösterilir.
let path = "";
let upgraded = false;

const RES2 = { stun: "Stun", move: "Move", blight: "Blight", bleed: "Bleed", burn: "Burn", disease: "Disease", debuff: "Debuff", deathblow: "Death Blow" };
const TAGS = { melee: "Yakın dövüş", ranged: "Menzilli", heal: "İyileştirme", buff: "Destek", support: "Destek", move: "Hareket", stealth: "Gizlilik" };

if (!hero) {
  showNotice(root, "Kahraman bulunamadı. Listeden bir kahraman seç.");
} else {
  document.title = `${hero.name} · Darkest Dungeon II · Babuşlar`;
  render();
}

function render() {
  const head = el(
    "section",
    { class: "dd-hero-head" },
    ddImg(hero.image, hero.name, 220, "dd-portrait"),
    el(
      "div",
      { class: "dd-hero-info" },
      el("h1", {}, hero.name),
      hero.tags.length ? el("div", { class: "tags" }, hero.tags.map((t) => el("span", { class: "badge" }, t))) : null,
      hero.quote ? el("p", { class: "dd-quote" }, `“${ddText2("heroes", hero.name, "quote", hero.quote)}”`) : null,
      hero.description ? el("p", { class: "dd-intro" }, ddText2("heroes", hero.name, "description", hero.description)) : null,
      hero.stats ? el("div", { class: "dd-stats" }, stat("Can (HP)", hero.stats.hp), stat("SPD", hero.stats.spd)) : null,
      hero.res ? el("h3", { class: "dd-sub" }, "Dirençler") : null,
      hero.res
        ? el("div", { class: "dd-res" }, Object.entries(RES2).map(([k, label]) => (hero.res[k] ? el("span", { class: `dd-res-item fx-${k}` }, `${label} %${hero.res[k]}`) : null)))
        : null
    )
  );

  const selected = hero.paths.find((p) => p.name === (path || "Wanderer")) || hero.paths[0];
  const pathSection = hero.paths.length
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, "Yollar"),
        el(
          "div",
          { class: "chips", role: "group", "aria-label": "Yol" },
          hero.paths.map((p) =>
            el(
              "button",
              { class: "chip", type: "button", "aria-pressed": String((path || "Wanderer") === p.name), onclick: () => ((path = p.name === "Wanderer" ? "" : p.name), render()) },
              p.name
            )
          )
        ),
        selected
          ? el(
              "div",
              { class: "build-card dd-path" },
              selected.motto ? el("p", { class: "dd-quote" }, `“${selected.motto}”`) : null,
              selected.text ? el("div", { class: "dd-effect" }, ddRich(ddText2("paths", `${hero.name}/${selected.name}`, null, selected.text))) : null
            )
          : null
      )
    : null;

  const skills = el(
    "section",
    { class: "section" },
    el(
      "div",
      { class: "dd-section-head" },
      el("h2", {}, "Beceriler"),
      el(
        "div",
        { class: "chips", role: "group", "aria-label": "Beceri hali" },
        [
          [false, "Normal"],
          [true, "Yükseltilmiş"],
        ].map(([up, label]) => el("button", { class: "chip", type: "button", "aria-pressed": String(upgraded === up), onclick: () => ((upgraded = up), render()) }, label))
      )
    ),
    el("div", { class: "dd-skills" }, skillsForPath().map(skillCard))
  );

  root.replaceChildren(...[head, pathSection, skills].filter(Boolean));
}

// Her beceri için seçili yolun sürümü; yoksa yolsuz (Wanderer) sürümü.
function skillsForPath() {
  const names = [...new Set(hero.skills.map((s) => s.name))];
  return names.map((n) => hero.skills.find((s) => s.name === n && s.path === path) || hero.skills.find((s) => s.name === n && !s.path) || hero.skills.find((s) => s.name === n));
}

function skillCard(s) {
  const dmg = upgraded && s.damageUp ? s.damageUp : s.damage;
  const crit = upgraded && s.critUp ? s.critUp : s.crit;
  const heal = upgraded && s.healUp ? s.healUp : s.heal;
  const effect = upgraded && s.effectUp ? s.effectUp : s.effect;
  const self = upgraded && s.selfUp ? s.selfUp : s.self;
  const tags = String(s.tags || "").split(/[,\s]+/).filter(Boolean);
  return el(
    "article",
    { class: "ability dd-skill" },
    ddImg(s.icon, "", 56, "dd-skill-icon"),
    el(
      "div",
      {},
      el("h3", {}, s.name, s.path ? el("span", { class: "tile-sub" }, ` · ${s.path}`) : null),
      el(
        "div",
        { class: "dd-skill-meta" },
        tags.map((t) => el("span", { class: "badge" }, TAGS[t] || t)),
        s.rank ? el("span", { class: "dd-rank-label" }, "Konum", rankDots2(s.rank, "rank")) : null,
        s.target ? el("span", { class: "dd-rank-label" }, "Hedef", rankDots2(s.target, "target")) : null
      ),
      el(
        "div",
        { class: "meta" },
        dmg ? el("span", {}, "Hasar: ", el("b", {}, dmg)) : null,
        crit ? el("span", {}, "Kritik: ", el("b", {}, `%${crit}`)) : null,
        heal ? el("span", {}, "İyileştirme: ", el("b", {}, heal)) : null,
        s.cooldown ? el("span", {}, "Bekleme: ", el("b", {}, s.cooldown)) : null,
        s.uses ? el("span", {}, "Kullanım: ", el("b", {}, s.uses)) : null
      ),
      effect ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Hedefe: "), ddRich(effect)) : null,
      self ? el("div", { class: "dd-effect" }, el("span", { class: "tile-sub" }, "Kendine: "), ddRich(self)) : null
    )
  );
}

function stat(label, value) {
  if (value == null || value === "") return null;
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, String(value)));
}
