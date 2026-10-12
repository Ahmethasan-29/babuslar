// Age of Empires II sayfaları: <body data-page="…"> hangi listenin gösterileceğini belirler.
// Adlar ve açıklamalar oyunun kendi Türkçe/İngilizce metinleri ({ tr, en }).
const L = (tr, en) => (IS_EN ? en : tr);
const T = (x) => (x == null ? "" : typeof x === "string" ? x : (IS_EN ? x.en || x.tr : x.tr || x.en) || "");
const PAGE = document.body.dataset.page;

const RES = { food: ["Yemek", "Food"], wood: ["Odun", "Wood"], gold: ["Altın", "Gold"], stone: ["Taş", "Stone"] };
const civName = (id) => T(AOE2.civs.find((c) => c.id === id)?.name) || id;
const ageName = (n) => T(AOE2.ages[n]);
const unitById = (id) => AOE2.units.find((u) => u.id === id);
const techById = (id) => AOE2.techs.find((t) => t.id === id);

function costChips(cost) {
  const parts = Object.entries(cost || {}).filter(([, v]) => v);
  return parts.length ? el("div", { class: "aoe-costs" }, parts.map(([k, v]) => el("span", { class: `aoe-cost ${k}`, title: L(...RES[k]) }, el("b", {}, v), ` ${L(...RES[k])}`))) : null;
}
function stats(list) {
  const items = list.filter(([, v]) => v !== undefined && v !== null && v !== "");
  return items.length ? el("dl", { class: "cp-stats aoe-stats" }, items.map(([k, v]) => el("div", {}, el("dt", {}, k), el("dd", {}, v)))) : null;
}
const sub = (x) => [ageName(x.age), T(x.building)].filter(Boolean).join(" · ");
const civsLine = (x) => (x.civs?.length ? el("p", { class: "aoe-civs" }, L("Yalnızca: ", "Only: "), x.civs.map(civName).sort((a, b) => a.localeCompare(b, "tr")).join(", ")) : null);
const icon = (src, cls = "aoe-icon") => el("img", { class: cls, src, alt: "", loading: "lazy" });

// Bina grupları (yalnızca listede bulunanlar), sonra özel/bölgesel.
function buildingGroups(items) {
  const names = [...new Set(items.map((x) => T(x.building)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
  return names.map((n) => ({ id: n, label: n, test: (x) => T(x.building) === n }));
}

const PAGES = {
  medeniyetler: () =>
    listPage({
      items: AOE2.civs,
      noun: ["medeniyet", "civilizations"],
      text: (c) => `${T(c.name)} ${c.name.en} ${T(c.bonuses)} ${c.uniqueUnits.map((id) => T(unitById(id)?.name)).join(" ")}`,
      card: (c) => {
        const [kind, ...rest] = T(c.bonuses).split("\n").filter((l) => l.trim());
        return el(
          "article",
          { class: "build-card aoe-civ", id: c.id },
          el("div", { class: "aoe-head" }, icon(c.emblem, "aoe-emblem"), el("div", {}, el("h3", {}, T(c.name)), kind ? el("p", { class: "tile-sub" }, kind) : null)),
          // "Özgün Birim:" gibi iki noktayla biten satırlar başlıktır.
          el("ul", { class: "aoe-bonuses" }, rest.map((l) => (/:\s*$/.test(l) ? el("li", { class: "head" }, l) : el("li", {}, l.replace(/^•\s*/, ""))))),
          c.uniqueUnits.length
            ? el("div", { class: "aoe-uniques" }, el("span", { class: "er-stats-title" }, L("Özel birlikler", "Unique units")), c.uniqueUnits.map(unitById).filter(Boolean).map((u) => el("a", { class: "aoe-chip", href: `birlikler.html#${u.id}` }, icon(u.image, "aoe-mini"), T(u.name))))
            : null,
          c.uniqueTechs.length
            ? el("div", { class: "aoe-uniques" }, el("span", { class: "er-stats-title" }, L("Özel teknolojiler", "Unique technologies")), c.uniqueTechs.map(techById).filter(Boolean).map((t) => el("a", { class: "aoe-chip", href: `teknolojiler.html#${t.id}`, title: T(t.help) }, icon(t.image, "aoe-mini"), `${T(t.name)} (${ageName(t.age)})`)))
            : null
        );
      },
    }),

  birlikler: () =>
    listPage({
      items: AOE2.units,
      groups: [{ id: "unique", label: L("Özel birlikler", "Unique units"), test: (u) => u.unique }, { id: "regional", label: L("Bölgesel birlikler", "Regional units"), test: (u) => u.regional }, ...buildingGroups(AOE2.units)],
      noun: ["birlik", "units"],
      text: (u) => `${T(u.name)} ${u.name.en} ${T(u.building)} ${(u.civs || []).map(civName).join(" ")}`,
      card: (u) =>
        el(
          "article",
          { class: "build-card aoe-card", id: u.id },
          el("div", { class: "aoe-head" }, icon(u.image), el("div", {}, el("h3", {}, T(u.name)), el("p", { class: "tile-sub" }, sub(u)))),
          costChips(u.cost),
          stats([
            [L("Can", "HP"), u.hp],
            [L("Saldırı", "Attack"), u.attack],
            [L("Yakın zırh", "Melee armor"), u.melee],
            [L("Delici zırh", "Pierce armor"), u.pierce],
            [L("Menzil", "Range"), u.range || null],
            [L("Hız", "Speed"), u.speed],
            [L("Görüş", "Line of sight"), u.los],
            [L("Üretim süresi", "Train time"), u.time ? `${u.time} sn` : null],
          ]),
          civsLine(u),
          T(u.help) ? el("p", { class: "coh-text" }, T(u.help)) : null
        ),
    }),

  teknolojiler: () =>
    listPage({
      items: AOE2.techs,
      groups: [{ id: "unique", label: L("Özel teknolojiler", "Unique technologies"), test: (t) => t.unique }, ...buildingGroups(AOE2.techs)],
      noun: ["teknoloji", "technologies"],
      text: (t) => `${T(t.name)} ${t.name.en} ${T(t.building)} ${T(t.help)} ${(t.civs || []).map(civName).join(" ")}`,
      card: (t) =>
        el(
          "article",
          { class: "build-card aoe-card", id: t.id },
          el("div", { class: "aoe-head" }, icon(t.image), el("div", {}, el("h3", {}, T(t.name)), el("p", { class: "tile-sub" }, sub(t)))),
          costChips(t.cost),
          t.time ? el("p", { class: "coh-facts" }, L(`Araştırma ${t.time} sn`, `Research ${t.time}s`)) : null,
          civsLine(t),
          T(t.help) ? el("p", { class: "coh-text" }, T(t.help)) : null
        ),
    }),

  home: () => {
    const turks = AOE2.civs.find((c) => c.id === "Turks");
    document.getElementById("cards").replaceChildren(
      ...[
        { href: "medeniyetler.html", title: L("Medeniyetler", "Civilizations"), badge: L("Bonuslar · Özel birlikler", "Bonuses · Unique units"), text: L(`${AOE2.civs.length} medeniyetin bonusları, özel birlikleri ve teknolojileri.`, `${AOE2.civs.length} civilizations: bonuses, unique units and technologies.`), img: turks?.emblem },
        { href: "birlikler.html", title: L("Birlikler", "Units"), badge: L("Maliyet · Can · Saldırı · Zırh", "Cost · HP · Attack · Armor"), text: L(`${AOE2.units.length} birlik: maliyeti, değerleri ve neye karşı güçlü olduğu.`, `${AOE2.units.length} units: cost, stats and counters.`), img: unitById(46)?.image },
        { href: "teknolojiler.html", title: L("Teknolojiler", "Technologies"), badge: L("Maliyet · Çağ · Bina", "Cost · Age · Building"), text: L(`${AOE2.techs.length} teknoloji: ne işe yaradığı, maliyeti ve hangi binada araştırıldığı.`, `${AOE2.techs.length} technologies: effect, cost and where to research.`), img: AOE2.techs.find((t) => t.unique)?.image },
      ].map((s) => el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: "card-img er-card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text)))
    );
  },
};
PAGES[PAGE]?.();
