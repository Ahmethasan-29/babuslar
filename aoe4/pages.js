// Age of Empires IV sayfaları: <body data-page="…"> hangi listenin gösterileceğini belirler.
// Kaynakta Türkçe metin olmadığından adlar ve açıklamalar İngilizce, arayüz Türkçedir.
const L = (tr, en) => (IS_EN ? en : tr);
const PAGE = document.body.dataset.page;

const RES = { food: ["Yemek", "Food"], wood: ["Odun", "Wood"], gold: ["Altın", "Gold"], stone: ["Taş", "Stone"], oliveoil: ["Zeytinyağı", "Olive oil"], vizier: ["Vezir puanı", "Vizier point"] };
const AGES = { 1: ["I. Karanlık Çağ", "Dark Age (I)"], 2: ["II. Feodal Çağ", "Feudal Age (II)"], 3: ["III. Kale Çağı", "Castle Age (III)"], 4: ["IV. İmparatorluk Çağı", "Imperial Age (IV)"] };
const EXPANSIONS = { base: ["Ana oyun", "Base game"], "sultans-ascend": ["The Sultans Ascend", "The Sultans Ascend"], "dynasties-of-the-east": ["Dynasties of the East", "Dynasties of the East"], "knights-of-cross-and-rose": ["Knights of Cross and Rose", "Knights of Cross and Rose"], "yue-feis-legacy": ["Yue Fei's Legacy", "Yue Fei's Legacy"] };
const ageName = (n) => (AGES[n] ? L(...AGES[n]) : "");
const civName = (id) => AOE4.civs.find((c) => c.id === id)?.name || id;

function costChips(cost) {
  const parts = Object.entries(cost || {}).filter(([k, v]) => v && RES[k]);
  return parts.length ? el("div", { class: "aoe-costs" }, parts.map(([k, v]) => el("span", { class: `aoe-cost ${k}`, title: L(...RES[k]) }, el("b", {}, v), ` ${L(...RES[k])}`))) : null;
}
function stats(list) {
  const items = list.filter(([, v]) => v !== undefined && v !== null && v !== "");
  return items.length ? el("dl", { class: "cp-stats aoe-stats" }, items.map(([k, v]) => el("div", {}, el("dt", {}, k), el("dd", {}, v)))) : null;
}
const icon = (src, cls = "aoe-icon") => (src ? el("img", { class: cls, src, alt: "", loading: "lazy" }) : null);
const civsLine = (x) => (x.civs?.length && x.civs.length < AOE4.civs.length ? el("p", { class: "aoe-civs" }, L("Medeniyetler: ", "Civilizations: "), x.civs.map(civName).sort().join(", ")) : null);
// Medeniyet düğmeleri (o listede kaydı olanlar).
const civGroups = (items) => AOE4.civs.filter((c) => items.some((x) => x.civs.includes(c.id))).map((c) => ({ id: c.slug, label: c.name, test: (x) => x.civs.includes(c.id) }));
const sub = (x) => [ageName(x.age), (x.classes || []).join(", ")].filter(Boolean).join(" · ");

const PAGES = {
  medeniyetler: () =>
    listPage({
      items: AOE4.civs,
      noun: ["medeniyet", "civilizations"],
      text: (c) => `${c.name} ${c.classes} ${c.bonuses.join(" ")}`,
      card: (c) =>
        el(
          "article",
          { class: "build-card aoe-civ", id: c.slug },
          el("div", { class: "aoe-head" }, icon(c.emblem, "aoe-emblem"), el("div", {}, el("h3", {}, c.name), el("p", { class: "tile-sub" }, [c.classes, ...c.expansion.map((e) => (EXPANSIONS[e] ? L(...EXPANSIONS[e]) : e))].filter(Boolean).join(" · ")))),
          c.desc ? el("p", { class: "coh-text" }, c.desc) : null,
          c.bonuses.length ? el("ul", { class: "aoe-bonuses" }, el("li", { class: "head" }, L("Medeniyet bonusları", "Civilization bonuses")), c.bonuses.map((b) => el("li", {}, b))) : null,
          c.features.length ? el("details", { class: "dd-uses" }, el("summary", {}, L("Özellikler", "Features")), c.features.map((f) => el("p", {}, el("b", {}, f.title), ": ", f.desc))) : null,
          el("p", {}, el("a", { href: `birlikler.html?grup=${c.slug}` }, L("Birlikleri →", "Units →")), " · ", el("a", { href: `teknolojiler.html?grup=${c.slug}` }, L("Teknolojileri →", "Technologies →")))
        ),
    }),

  birlikler: () =>
    listPage({
      items: AOE4.units,
      groups: [{ id: "unique", label: L("Özel birlikler", "Unique units"), test: (u) => u.unique }, ...civGroups(AOE4.units)],
      noun: ["birlik", "units"],
      text: (u) => `${u.name} ${(u.classes || []).join(" ")} ${u.civs.map(civName).join(" ")}`,
      card: (u) =>
        el(
          "article",
          { class: "build-card aoe-card", id: u.id },
          el("div", { class: "aoe-head" }, icon(u.icon), el("div", {}, el("h3", {}, u.name), el("p", { class: "tile-sub" }, sub(u)))),
          costChips(u.cost),
          stats([
            [L("Can", "HP"), u.hp],
            [L("Hasar", "Damage"), u.weapon?.damage],
            [L("Saldırı hızı", "Attack speed"), u.weapon?.speed ? `${u.weapon.speed} sn` : null],
            [L("Menzil", "Range"), u.weapon?.range],
            [L("Yakın zırh", "Melee armor"), u.armor?.melee],
            [L("Menzilli zırh", "Ranged armor"), u.armor?.ranged],
            [L("Hız", "Speed"), u.speed],
            [L("Nüfus", "Population"), u.cost?.popcap],
            [L("Üretim süresi", "Train time"), u.cost?.time ? `${u.cost.time} sn` : null],
          ]),
          u.built?.length ? el("p", { class: "coh-facts" }, L("Üretildiği yer: ", "Produced at: "), u.built.join(", ")) : null,
          civsLine(u),
          u.desc ? el("p", { class: "coh-text" }, u.desc) : null
        ),
    }),

  teknolojiler: () =>
    listPage({
      items: AOE4.techs,
      groups: [{ id: "unique", label: L("Özel teknolojiler", "Unique technologies"), test: (t) => t.unique }, ...civGroups(AOE4.techs)],
      noun: ["teknoloji", "technologies"],
      text: (t) => `${t.name} ${t.desc} ${(t.classes || []).join(" ")} ${t.civs.map(civName).join(" ")}`,
      card: (t) =>
        el(
          "article",
          { class: "build-card aoe-card", id: t.id },
          el("div", { class: "aoe-head" }, icon(t.icon), el("div", {}, el("h3", {}, t.name), el("p", { class: "tile-sub" }, sub(t)))),
          costChips(t.cost),
          t.cost?.time ? el("p", { class: "coh-facts" }, L(`Araştırma ${t.cost.time} sn`, `Research ${t.cost.time}s`), t.built?.length ? ` · ${t.built.join(", ")}` : "") : null,
          civsLine(t),
          t.desc ? el("p", { class: "coh-text" }, t.desc) : null
        ),
    }),

  home: () => {
    const ot = AOE4.civs.find((c) => c.slug === "ottomans");
    document.getElementById("cards").replaceChildren(
      ...[
        { href: "medeniyetler.html", title: L("Medeniyetler", "Civilizations"), badge: L("Bonuslar · Özellikler", "Bonuses · Features"), text: L(`${AOE4.civs.length} medeniyet: bonusları ve kendine özgü mekanikleri.`, `${AOE4.civs.length} civilizations: bonuses and unique mechanics.`), img: ot?.emblem },
        { href: "birlikler.html", title: L("Birlikler", "Units"), badge: L("Maliyet · Can · Hasar · Zırh", "Cost · HP · Damage · Armor"), text: L(`${AOE4.units.length} birlik: maliyeti, değerleri ve hangi medeniyette olduğu.`, `${AOE4.units.length} units: cost, stats and civilizations.`), img: AOE4.units.find((u) => u.id === "janissary")?.icon },
        { href: "teknolojiler.html", title: L("Teknolojiler", "Technologies"), badge: L("Maliyet · Çağ · Etki", "Cost · Age · Effect"), text: L(`${AOE4.techs.length} teknoloji: etkisi, maliyeti ve çağı.`, `${AOE4.techs.length} technologies: effect, cost and age.`), img: AOE4.techs.find((t) => t.unique)?.icon },
      ].map((s) => el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img er-card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text)))
    );
  },
};
PAGES[PAGE]?.();
