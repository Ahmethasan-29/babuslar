// Elden Ring sayfaları: <body data-page="…"> hangi listenin gösterileceğini belirler.
const PAGE = document.body.dataset.page;
const groupsOf = (items, field, name = (v) => v) =>
  [...new Set(items.map((x) => x[field]).filter(Boolean))].sort((a, b) => name(a).localeCompare(name(b), "tr")).map((v) => ({ id: v, label: name(v), test: (x) => x[field] === v }));

const PAGES = {
  bosslar: () =>
    listPage({
      items: ER.bosses,
      groups: groupsOf(ER.bosses, "region"),
      noun: ["boss", "bosses"],
      text: (b) => `${b.name} ${b.region} ${b.location} ${(b.drops || []).join(" ")}`,
      card: (b) =>
        el(
          "article",
          { class: "build-card er-card", id: b.id },
          erImg(b.image),
          el("h3", {}, b.name),
          el("p", { class: "tile-sub" }, [b.region, b.location].filter(Boolean).join(" · ")),
          b.hp ? el("p", { class: "er-line" }, L("Can: ", "HP: "), el("b", {}, b.hp)) : null,
          b.drops?.length ? el("div", { class: "er-drops" }, el("span", { class: "er-stats-title" }, L("Düşürdükleri", "Drops")), el("ul", {}, b.drops.map((d) => el("li", {}, d)))) : null,
          descBox(b.desc)
        ),
    }),

  silahlar: () =>
    listPage({
      items: ER.weapons,
      groups: [
        { id: "weapon", label: L("Silahlar", "Weapons"), test: (w) => w.kind === "weapon" },
        { id: "shield", label: L("Kalkanlar", "Shields"), test: (w) => w.kind === "shield" },
        ...groupsOf(ER.weapons, "category", catName),
      ],
      noun: ["silah", "armaments"],
      text: (w) => `${w.name} ${w.category} ${catName(w.category)}`,
      card: (w) =>
        el(
          "article",
          { class: "build-card er-card", id: w.id },
          erImg(w.image),
          el("h3", {}, w.name),
          el("p", { class: "tile-sub" }, [catName(w.category), w.weight ? L(`${w.weight} ağırlık`, `${w.weight} weight`) : null].filter(Boolean).join(" · ")),
          statList(w.attack, ER_TR.damage, L("Saldırı", "Attack")),
          statList(w.scaling, ER_TR.attrs, L("Ölçekleme", "Scaling")),
          statList(w.requires, ER_TR.attrs, L("Gereksinim", "Requires")),
          w.kind === "shield" ? statList(w.guard, ER_TR.damage, L("Koruma", "Guard")) : null,
          descBox(w.desc)
        ),
    }),

  buyuler: () =>
    listPage({
      items: ER.spells,
      groups: [
        { id: "sorcery", label: L("Sorcery (Zekâ)", "Sorceries"), test: (s) => s.type === "sorcery" },
        { id: "incantation", label: L("Incantation (İnanç)", "Incantations"), test: (s) => s.type === "incantation" },
      ],
      noun: ["büyü", "spells"],
      text: (s) => `${s.name} ${s.effect}`,
      card: (s) =>
        el(
          "article",
          { class: "build-card er-card", id: s.id },
          erImg(s.image),
          el("h3", {}, s.name),
          el("p", { class: "tile-sub" }, [s.type === "sorcery" ? "Sorcery" : "Incantation", s.fp ? `${s.fp} FP` : null, s.slots ? L(`${s.slots} yuva`, `${s.slots} slot${s.slots > 1 ? "s" : ""}`) : null].filter(Boolean).join(" · ")),
          s.effect ? el("p", { class: "er-effect" }, s.effect) : null,
          statList(s.requires, ER_TR.attrs, L("Gereksinim", "Requires")),
          descBox(s.desc)
        ),
    }),

  tilsimlar: () =>
    listPage({
      items: ER.talismans,
      noun: ["tılsım", "talismans"],
      text: (t) => `${t.name} ${t.effect}`,
      card: (t) => el("article", { class: "build-card er-card", id: t.id }, erImg(t.image), el("h3", {}, t.name), t.effect ? el("p", { class: "er-effect" }, t.effect) : null, descBox(t.desc)),
    }),

  kuller: () => {
    const items = [...ER.spirits.map((s) => ({ ...s, kind: "spirit" })), ...ER.ashes.map((a) => ({ ...a, kind: "ash" }))];
    listPage({
      items,
      groups: [
        { id: "spirit", label: L("Ruh külleri (Spirit Ashes)", "Spirit Ashes"), test: (x) => x.kind === "spirit" },
        { id: "ash", label: L("Savaş külleri (Ashes of War)", "Ashes of War"), test: (x) => x.kind === "ash" },
        ...groupsOf(ER.ashes, "affinity", (a) => L(`Yakınlık: ${a}`, `Affinity: ${a}`)),
      ],
      noun: ["kül", "ashes"],
      text: (x) => `${x.name} ${x.effect || ""} ${x.skill || ""} ${x.affinity || ""}`,
      card: (x) =>
        el(
          "article",
          { class: "build-card er-card", id: x.id },
          erImg(x.image),
          el("h3", {}, x.name),
          x.kind === "spirit"
            ? el("p", { class: "tile-sub" }, [L("Ruh külü", "Spirit ash"), x.fp ? `${x.fp} FP` : null, x.hp ? `${x.hp} HP` : null].filter(Boolean).join(" · "))
            : el("p", { class: "tile-sub" }, [L("Savaş külü", "Ash of War"), x.affinity ? L(`Yakınlık: ${x.affinity}`, `Affinity: ${x.affinity}`) : null].filter(Boolean).join(" · ")),
          x.effect ? el("p", { class: "er-effect" }, x.effect) : null,
          x.skill ? el("p", { class: "er-effect" }, L("Yetenek: ", "Skill: "), el("b", {}, x.skill)) : null,
          descBox(x.desc)
        ),
    });
  },

  siniflar: () =>
    listPage({
      items: ER.classes,
      noun: ["sınıf", "classes"],
      text: (c) => c.name,
      card: (c) =>
        el(
          "article",
          { class: "build-card er-card er-class", id: c.id },
          erImg(c.image),
          el("h3", {}, c.name),
          c.desc ? el("p", { class: "er-effect" }, c.desc) : null,
          el(
            "dl",
            { class: "cp-stats er-class-stats" },
            Object.entries(c.stats).map(([k, v]) => el("div", {}, el("dt", {}, pairText(ER_TR.classStats, k)), el("dd", {}, v)))
          )
        ),
    }),

  home: () => {
    const pick = (list) => list.find((x) => x.image)?.image;
    document.getElementById("cards").replaceChildren(
      ...[
        { href: "bosslar.html", title: L("Bosslar", "Bosses"), badge: L("Bölge · Can · Ödüller", "Region · HP · Drops"), text: L(`${ER.bosses.length} boss: nerede olduğu, canı ve düşürdükleri.`, `${ER.bosses.length} bosses: where they are, HP and drops.`), img: ER.bosses.find((b) => /Malenia/.test(b.name))?.image || pick(ER.bosses) },
        { href: "silahlar.html", title: L("Silahlar ve kalkanlar", "Weapons and shields"), badge: L("Saldırı · Ölçekleme · Gereksinim", "Attack · Scaling · Requirements"), text: L(`${ER.weapons.length} silah ve kalkan: saldırı gücü, ölçekleme ve gereken değerler.`, `${ER.weapons.length} weapons and shields: attack, scaling and requirements.`), img: ER.weapons.find((w) => /Moonveil/.test(w.name))?.image || pick(ER.weapons) },
        { href: "buyuler.html", title: L("Büyüler", "Spells"), badge: "Sorcery · Incantation", text: L(`${ER.spells.length} büyü: FP bedeli, yuva sayısı ve gereken zekâ/inanç.`, `${ER.spells.length} spells: FP cost, slots and requirements.`), img: pick(ER.spells) },
        { href: "tilsimlar.html", title: L("Tılsımlar", "Talismans"), badge: L("Etkiler", "Effects"), text: L(`${ER.talismans.length} tılsım ve etkileri.`, `${ER.talismans.length} talismans and their effects.`), img: pick(ER.talismans) },
        { href: "kuller.html", title: L("Ruh ve savaş külleri", "Spirit ashes and Ashes of War"), badge: L("Çağırma · Yetenek", "Summons · Skills"), text: L(`${ER.spirits.length} ruh külü ve ${ER.ashes.length} savaş külü.`, `${ER.spirits.length} spirit ashes and ${ER.ashes.length} Ashes of War.`), img: pick(ER.spirits) },
        { href: "siniflar.html", title: L("Başlangıç sınıfları", "Starting classes"), badge: L("Başlangıç değerleri", "Starting stats"), text: L("Sınıfların başlangıç seviyesi ve değerleri: hangisiyle başlamalı?", "Starting level and stats of each class."), img: pick(ER.classes) },
      ].map((s) => el("a", { class: "game-card", href: s.href }, s.img ? el("img", { class: s.href === "bosslar.html" ? "card-img" : "card-img er-card-img", src: s.img, alt: "" }) : null, el("span", { class: "badge" }, s.badge), el("h2", {}, s.title), el("p", {}, s.text)))
    );
  },
};
PAGES[PAGE]?.();
