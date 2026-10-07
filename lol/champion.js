const root = document.getElementById("champion");
const id = new URLSearchParams(location.search).get("id");

const STATS = [
  ["attack", "Saldırı"],
  ["defense", "Savunma"],
  ["magic", "Büyü"],
  ["difficulty", "Zorluk"],
];

const SPELL_KEYS = ["Q", "W", "E", "R"];

if (!id || !/^[A-Za-z0-9]+$/.test(id)) {
  showNotice(root, "Şampiyon bulunamadı. Listeden bir şampiyon seç.");
} else {
  ddData(`champion/${id}.json`)
    .then(({ version, data }) => render(version, data.data[id]))
    .catch(() => showNotice(root, "Şampiyon yüklenemedi. Bağlantını kontrol edip sayfayı yenile."));
}

function render(version, c) {
  if (!c) {
    showNotice(root, "Şampiyon bulunamadı.");
    return;
  }

  document.title = `${c.name} · League of Legends · Babuşlar`;

  const hero = el(
    "section",
    { class: "champ-hero" },
    el(
      "div",
      { class: "champ-hero-body" },
      el("h1", {}, c.name),
      el("p", { class: "title" }, c.title),
      el("div", { class: "tags" }, c.tags.map((t) => el("span", { class: "badge" }, ROLES[t] || t)))
    )
  );
  hero.style.backgroundImage = `url("${DD}/cdn/img/champion/splash/${c.id}_0.jpg")`;

  const stats = el(
    "section",
    { class: "section" },
    el("h2", {}, "Genel bakış"),
    el(
      "div",
      { class: "stats" },
      STATS.map(([key, label]) => {
        const value = c.info?.[key] ?? 0;
        return el(
          "div",
          {},
          el("div", { class: "stat-label" }, el("span", {}, label), el("span", {}, `${value}/10`)),
          el("div", { class: "bar" }, el("span", { style: `width:${value * 10}%` }))
        );
      })
    )
  );

  const builds = el(
    "section",
    { class: "section", id: "dizilim" },
    el("h2", {}, "Eşya dizilimi"),
    el("p", { class: "page-sub" }, "Koridorunu seç; alınacak eşyaları sırasıyla gör."),
    el("div", { class: "build-root" }, el("p", { class: "notice" }, "Eşya dizilimi yükleniyor…"))
  );

  const passive = abilityCard({
    key: "Pasif",
    icon: ddImg(version, "passive", c.passive.image.full),
    name: c.passive.name,
    description: c.passive.description,
  });

  const spells = c.spells.map((s, i) =>
    abilityCard({
      key: SPELL_KEYS[i],
      icon: ddImg(version, "spell", s.image.full),
      name: s.name,
      description: s.description,
      meta: [
        s.cooldownBurn && s.cooldownBurn !== "0" ? `Bekleme süresi: ${s.cooldownBurn} sn` : null,
        s.costBurn && s.costBurn !== "0" ? `Bedel: ${s.costBurn}` : null,
        s.rangeBurn && s.rangeBurn !== "0" && s.rangeBurn !== "25000" ? `Menzil: ${s.rangeBurn}` : null,
      ],
    })
  );

  const abilities = el(
    "section",
    { class: "section" },
    el("h2", {}, "Pasif ve yetenekler"),
    el("div", { class: "abilities" }, passive, spells)
  );

  const tips = c.allytips?.length
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, "İpuçları"),
        el("ul", { class: "tips" }, c.allytips.map((tip) => el("li", {}, plainText(tip))))
      )
    : null;

  const lore = c.lore
    ? el("section", { class: "section" }, el("h2", {}, "Hikâyesi"), el("p", { class: "lore" }, plainText(c.lore)))
    : null;

  root.replaceChildren(hero, stats, builds, abilities, tips || "", lore || "");
  loadBuilds(version, c, builds.querySelector(".build-root"));
}

// --- Eşya dizilimi ---

const BIN_POSITION = { TOP: "top", JUNGLE: "jungle", MIDDLE: "middle", BOTTOM: "bottom", UTILITY: "utility" };

// Riot'un genel dizilimi bu koridorlara uygun başlangıç eşyası içermediğinde kullanılır.
const LANE_STARTERS = {
  JUNGLE: [["1101", "2003"], ["1102", "2003"], ["1103", "2003"]],
  UTILITY: [["3865", "2003", "2003"]],
};

async function loadBuilds(version, c, container) {
  const slug = c.id.toLowerCase();
  try {
    const [bin, items, lanes] = await Promise.all([
      fetch(`${CDRAGON}/game/data/characters/${slug}/${slug}.bin.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
      ddData("item.json").then(({ data }) => data.data),
      getChampionLanes().catch(() => new Map()),
    ]);

    // Önce Riot'un oyun içi önerisi; yoksa Babuşlar editör dizilimi.
    let byPosition = summonersRiftBuilds(bin);
    let source = "riot";
    if (!Object.keys(byPosition).length) {
      const editor = await fetch("editor-builds.json").then((r) => (r.ok ? r.json() : {}));
      const entry = editor[c.id];
      if (!entry) {
        showNotice(container, "Bu şampiyon için henüz eşya dizilimi yok.");
        return;
      }
      byPosition = {
        default: {
          StartingItemBundles: entry.start.map((items) => ({ items })),
          mRecItemRanges: entry.ranges.map((items) => ({ items })),
        },
      };
      source = "editor";
    }

    const popular = lanes.get(String(c.key)) || [];
    const requested = LANES.find((l) => l.slug === new URLSearchParams(location.search).get("koridor"));
    const initial = requested?.id || popular[0] || "MIDDLE";

    renderBuilds({ version, c, container, byPosition, items, popular, source, lane: initial });
  } catch {
    showNotice(container, "Eşya dizilimi şu an yüklenemedi. Sayfayı daha sonra yenilemeyi dene.");
  }
}

// Oyun dosyasındaki önerileri Sihirdar Vadisi için koridora göre ayırır: { default, utility, ... }
function summonersRiftBuilds(bin) {
  const result = {};
  for (const entry of Object.values(bin)) {
    if (entry?.__type !== "ItemRecommendationOverrideSet") continue;
    for (const override of entry.mOverrides || []) {
      for (const ctx of override.mOverrideContexts || []) {
        if (ctx.mMapID !== 11 || ctx.mModeNameStringId !== "CLASSIC") continue;
        const key = ctx.mPosition || "default";
        if (!result[key]) result[key] = override;
      }
    }
  }
  return result;
}

function itemIds(list) {
  return (list || []).map((ref) => String(ref).split("/").pop());
}

function renderBuilds(state) {
  const { version, c, container, byPosition, items, popular, source, lane } = state;
  const specific = byPosition[BIN_POSITION[lane]];
  const build = specific || byPosition.default || Object.values(byPosition)[0];
  const known = (ids) => ids.filter((id) => items[id]);

  const tabs = el(
    "div",
    { class: "chips lane-tabs", role: "group", "aria-label": "Koridor seç" },
    LANES.map((l) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "aria-pressed": String(l.id === lane),
          onclick: () => {
            const url = new URL(location.href);
            url.searchParams.set("koridor", l.slug);
            history.replaceState(null, "", url);
            renderBuilds({ ...state, lane: l.id });
          },
        },
        l.label,
        popular.includes(l.id) ? el("span", { class: "pop", title: "Bu şampiyonun sık oynandığı koridor" }, "★") : null
      )
    )
  );

  const laneLabel = LANES.find((l) => l.id === lane).label;
  const popularLabels = popular.map((id) => LANES.find((l) => l.id === id).label);
  const note =
    popular.length && !popular.includes(lane)
      ? el(
          "p",
          { class: "build-note" },
          `${c.name} genelde ${popularLabels.join(" ve ")} koridorunda oynanır. ${laneLabel} koridoru için aşağıdaki genel dizilimi kullanabilirsin.`
        )
      : null;

  // Başlangıç eşyaları
  const starterSets =
    !specific && LANE_STARTERS[lane]
      ? LANE_STARTERS[lane]
      : (build.StartingItemBundles || []).map((bundle) => itemIds(bundle.items));
  const starters = starterSets.map(known).filter((set) => set.length);

  // Eşya basamakları: son geniş liste "duruma göre" alınacak eşyalardır.
  const ranges = (build.mRecItemRanges || []).map((range) => known(itemIds(range.items))).filter((r) => r.length);
  const situationalIndex = ranges.length > 2 ? ranges.length - 1 : -1;

  const quick = [];
  ranges.forEach((range, i) => {
    if (i === situationalIndex) return;
    const pick = range.find((id) => !quick.includes(id));
    if (pick) quick.push(pick);
  });

  let coreNo = 0;
  const rows = ranges.map((range, i) => {
    let label;
    if (i === situationalIndex) label = "Duruma göre";
    else if (range.every((id) => items[id].tags?.includes("Boots"))) label = "Bot";
    else label = `${++coreNo}. eşya`;
    return el(
      "div",
      { class: "build-row" },
      el("span", { class: "build-label" }, label),
      el("div", { class: "build-items" }, range.map((id, n) => itemChip(version, items, id, n === 0 && i !== situationalIndex)))
    );
  });

  container.replaceChildren(
    ...[
      tabs,
      note,
      el(
        "div",
        { class: "build-card" },
        el(
          "div",
          { class: "build-head" },
          el("h3", {}, `${laneLabel} · Önerilen sıra`),
          specific ? el("span", { class: "badge" }, "Bu koridora özel") : null,
          el("span", { class: "badge" }, source === "editor" ? "Editör önerisi" : "Riot önerisi")
        ),
        el(
          "ol",
          { class: "sequence" },
          quick.map((id) =>
            el(
              "li",
              {},
              el(
                "a",
                { href: `esyalar.html#${id}`, title: items[id].name },
                el("img", { src: ddImg(version, "item", items[id].image.full), alt: "", width: 56, height: 56, loading: "lazy" }),
                el("span", {}, items[id].name)
              )
            )
          )
        )
      ),
      starters.length
        ? el(
            "div",
            { class: "build-card" },
            el("h3", {}, "Başlangıç eşyaları"),
            el(
              "div",
              { class: "starter-sets" },
              starters.map((set, i) =>
                el(
                  "div",
                  { class: "starter-set" },
                  el("span", { class: "build-label" }, starters.length > 1 ? `Seçenek ${i + 1}` : "Başlangıç"),
                  el(
                    "div",
                    { class: "build-items" },
                    [...new Set(set)].map((id) => itemChip(version, items, id, false, set.filter((x) => x === id).length))
                  )
                )
              )
            )
          )
        : null,
      el(
        "div",
        { class: "build-card" },
        el("h3", {}, "Seçenekler"),
        el("p", { class: "tile-sub", style: "margin:0 0 12px" }, "Her basamakta ilk eşya en çok önerilendir; rakiplerine göre diğerlerini seçebilirsin."),
        rows
      ),
      el(
        "p",
        { class: "tile-sub" },
        source === "editor"
          ? "Kaynak: Babuşlar editör dizilimi. Riot bu şampiyon için oyun dosyalarında hazır öneri yayınlamıyor."
          : "Kaynak: League of Legends istemcisindeki önerilen eşyalar (Community Dragon)."
      ),
    ].filter(Boolean)
  );
}

function itemChip(version, items, id, highlight = false, amount = 1) {
  const item = items[id];
  return el(
    "a",
    { class: `item-chip${highlight ? " top" : ""}`, href: `esyalar.html#${id}`, title: plainText(item.plaintext || item.name) },
    el("img", { src: ddImg(version, "item", item.image.full), alt: "", width: 32, height: 32, loading: "lazy" }),
    el("span", {}, amount > 1 ? `${item.name} ×${amount}` : item.name)
  );
}

function abilityCard({ key, icon, name, description, meta = [] }) {
  const metaItems = meta.filter(Boolean);
  return el(
    "article",
    { class: "ability" },
    el(
      "div",
      { class: "ability-icon" },
      el("img", { src: icon, alt: "", width: 64, height: 64, loading: "lazy" }),
      el("span", { class: "ability-key" }, key)
    ),
    el(
      "div",
      {},
      el("h3", {}, name),
      metaItems.length ? el("div", { class: "meta" }, metaItems.map((m) => el("span", {}, m))) : null,
      el("p", { class: "desc" }, plainText(description))
    )
  );
}
