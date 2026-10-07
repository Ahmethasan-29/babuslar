const root = document.getElementById("champion");
const id = new URLSearchParams(location.search).get("id");

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
      el(
        "div",
        { class: "tags" },
        c.tags.map((t) => el("span", { class: "badge" }, ROLES[t] || t)),
        difficultyBadge(c.info?.difficulty ?? 0)
      )
    )
  );
  hero.style.backgroundImage = `url("${DD}/cdn/img/champion/splash/${c.id}_0.jpg")`;

  const builds = el(
    "section",
    { class: "section", id: "dizilim" },
    el("div", { class: "build-root" }, el("p", { class: "notice" }, "Dizilim yükleniyor…"))
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

  root.replaceChildren(hero, builds, abilities, tips || "", lore || "");
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
    const [bin, items, lanes, runes] = await Promise.all([
      fetch(`${CDRAGON}/game/data/characters/${slug}/${slug}.bin.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
      ddData("item.json").then(({ data }) => data.data),
      getChampionLanes().catch(() => new Map()),
      loadRuneData(c).catch(() => null),
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

    renderBuilds({ version, c, container, byPosition, items, popular, source, runes, lane: initial, runeIndex: 0 });
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
            renderBuilds({ ...state, lane: l.id, runeIndex: 0 });
          },
        },
        l.label,
        popular.includes(l.id) ? el("span", { class: "pop", title: "Bu şampiyonun sık oynandığı koridor" }, "★") : null
      )
    )
  );

  const popularLabels = popular.map((id) => LANES.find((l) => l.id === id).label);
  const note =
    popular.length && !popular.includes(lane)
      ? el("p", { class: "build-note" }, `${c.name} genelde ${popularLabels.join(" ve ")} koridorunda oynanır.`)
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

  const starterRows = starters.map((set, i) =>
    el(
      "div",
      { class: "build-row" },
      el("span", { class: "build-label" }, starters.length > 1 ? `Başlangıç ${i + 1}` : "Başlangıç"),
      el(
        "div",
        { class: "build-items" },
        [...new Set(set)].map((id) => itemChip(version, items, id, false, set.filter((x) => x === id).length))
      )
    )
  );

  const itemsCard = el(
    "div",
    { class: "build-card" },
    el(
      "div",
      { class: "build-head" },
      el("h3", {}, "Eşyalar"),
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
            el("img", { src: ddImg(version, "item", items[id].image.full), alt: "", width: 48, height: 48, loading: "lazy" }),
            el("span", {}, items[id].name)
          )
        )
      )
    ),
    el("div", { class: "build-rows" }, starterRows, rows)
  );

  container.replaceChildren(
    ...[tabs, note, el("div", { class: "build-grid" }, ...[runeCard(state), itemsCard].filter(Boolean))].filter(Boolean)
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

// Zorluk: 10 üzerinden puan ve küçük bir gösterge (ör. "Zorluk ●●●○○ 6/10")
function difficultyBadge(value) {
  const filled = Math.round(value / 2);
  return el(
    "span",
    { class: "badge difficulty", title: `Zorluk: ${value}/10` },
    "Zorluk ",
    el("span", { class: "dots", "aria-hidden": "true" }, "●".repeat(filled) + "○".repeat(5 - filled)),
    ` ${value}/10`
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

// --- Rünler ve sihirdar büyüleri ---

let runeAssetsPromise;

// Türkçe rün isimleri/açıklamaları, rün ağaçları ve sihirdar büyüleri (bir kez yüklenir).
function getRuneAssets() {
  if (!runeAssetsPromise) {
    runeAssetsPromise = Promise.all([
      fetchJson(`${CLIENT_DATA}/tr_tr/v1/perks.json`),
      fetchJson(`${CLIENT_DATA}/tr_tr/v1/perkstyles.json`),
      ddData("summoner.json").then(({ data }) => data.data),
    ]).then(([perks, styles, spells]) => ({
      perks: new Map(perks.map((p) => [p.id, p])),
      styles: new Map(styles.styles.map((s) => [s.id, s])),
      spells: new Map(Object.values(spells).map((s) => [Number(s.key), s])),
    }));
  }
  return runeAssetsPromise;
}

async function loadRuneData(c) {
  const [recs, assets] = await Promise.all([getRuneRecommendations(), getRuneAssets()]);
  return { list: recs.get(String(c.key)) || [], ...assets };
}

const SMITE = 11;
const FLASH = 4;
const IGNITE = 14;

function runeCard(state) {
  const { runes, lane, version } = state;
  if (!runes || !runes.list.length) return null;

  // Seçilen koridorun önerisi yoksa şampiyonun en sık oynandığı koridorun rünleri gösterilir.
  let options = runes.list.filter((rec) => rec.position === lane);
  const fallback = !options.length;
  if (fallback) options = runes.list.filter((rec) => rec.position === runes.list[0].position);

  const index = Math.min(state.runeIndex || 0, options.length - 1);
  const rec = options[index];

  // Ormana uygun olmayan büyüleri koridora göre düzelt: ormanda Çarp şart, diğer koridorlarda gereksiz.
  let spellIds = [...(rec.summonerSpellIds || [])];
  if (fallback && lane === "JUNGLE") spellIds = [FLASH, SMITE];
  else if (fallback) spellIds = spellIds.map((id) => (id === SMITE ? IGNITE : id));

  const perk = (id) => runes.perks.get(id);
  const [keystoneId, ...rest] = rec.perkIds || [];

  const treeHead = (style) =>
    style
      ? el(
          "div",
          { class: "tree-head" },
          el("img", { src: clientAsset(style.iconPath), alt: "", width: 28, height: 28, loading: "lazy" }),
          el("span", {}, style.name)
        )
      : null;

  const runeRow = (id, keystone = false) => {
    const p = perk(id);
    if (!p) return null;
    // Açıklama yalnızca üzerine gelince (title) görünür.
    return el(
      "div",
      { class: `rune${keystone ? " keystone" : ""}`, title: plainText(p.shortDesc || p.name) },
      el("img", { src: clientAsset(p.iconPath), alt: "", width: keystone ? 44 : 30, height: keystone ? 44 : 30, loading: "lazy" }),
      el("span", {}, p.name)
    );
  };

  const shards = rest.slice(5, 8).map(perk).filter(Boolean);
  const spells = spellIds.map((id) => runes.spells.get(id)).filter(Boolean);

  const variants =
    options.length > 1
      ? el(
          "div",
          { class: "chips rune-variants", role: "group", "aria-label": "Rün seçeneği" },
          options.map((option, i) => {
            const key = perk(option.perkIds?.[0]);
            return el(
              "button",
              {
                class: "chip",
                type: "button",
                "aria-pressed": String(i === index),
                onclick: () => renderBuilds({ ...state, runeIndex: i }),
              },
              key ? el("img", { src: clientAsset(key.iconPath), alt: "", width: 20, height: 20 }) : null,
              key ? `${i + 1}. ${key.name}` : `Seçenek ${i + 1}`
            );
          })
        )
      : null;

  return el(
    "div",
    { class: "build-card" },
    el(
      "div",
      { class: "build-head" },
      el("h3", {}, "Rünler"),
      el(
        "div",
        { class: "spell-list" },
        spells.map((s) =>
          el(
            "span",
            { class: "spell", title: `${s.name}: ${plainText(s.description)}` },
            el("img", { src: ddImg(version, "spell", s.image.full), alt: s.name, width: 28, height: 28 }),
            s.name
          )
        )
      )
    ),
    variants,
    el(
      "div",
      { class: "rune-grid" },
      el(
        "div",
        { class: "rune-tree" },
        treeHead(runes.styles.get(rec.primaryPerkStyleId)),
        runeRow(keystoneId, true),
        rest.slice(0, 3).map((id) => runeRow(id))
      ),
      el(
        "div",
        { class: "rune-tree" },
        treeHead(runes.styles.get(rec.secondaryPerkStyleId)),
        rest.slice(3, 5).map((id) => runeRow(id)),
        shards.length
          ? el(
              "div",
              { class: "shards" },
              shards.map((s) =>
                el(
                  "span",
                  { class: "shard", title: plainText(s.shortDesc || s.name) },
                  el("img", { src: clientAsset(s.iconPath), alt: "", width: 20, height: 20 }),
                  s.name
                )
              )
            )
          : null
      )
    )
  );
}