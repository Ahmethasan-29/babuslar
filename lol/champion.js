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
const BUILD_SIZE = 6;

// Temel rün → uyduğu eşya özellikleri (Data Dragon eşya etiketleri).
const KEYSTONE_PROFILES = {
  8005: ["CriticalStrike", "AttackSpeed", "ArmorPenetration", "Damage"], // Saldırıya Devam
  8008: ["AttackSpeed", "OnHit", "LifeSteal"], // Ölümcül Tempo
  8021: ["CriticalStrike", "LifeSteal", "NonbootsMovement", "Health"], // Ayağı Çabuk
  8010: ["Health", "LifeSteal", "SpellVamp", "AbilityHaste", "CooldownReduction"], // Yenilmez
  8112: ["MagicPenetration", "ArmorPenetration", "SpellDamage", "Damage"], // Elektrik Ver
  8128: ["MagicPenetration", "ArmorPenetration", "SpellDamage", "Damage"], // Kara Hasat
  9923: ["AttackSpeed", "ArmorPenetration", "OnHit"], // Keskin Sağanak
  8369: ["MagicPenetration", "ArmorPenetration", "CriticalStrike"], // İlk Vuruş
  8214: ["Mana", "ManaRegen", "AbilityHaste", "CooldownReduction", "Aura"], // Aery'yi Çağır
  8229: ["Mana", "AbilityHaste", "CooldownReduction", "SpellDamage"], // Sihirli Yıldız
  8230: ["AbilityHaste", "CooldownReduction", "NonbootsMovement", "Health"], // Yıldırım Yağmacısı'nın Cinneti
  8992: ["SpellDamage", "MagicPenetration", "Health"], // Ölümateşi Dokunuşu
  8437: ["Health", "HealthRegen", "Armor", "SpellBlock"], // Hortlağın Pençesi
  8439: ["Armor", "SpellBlock", "MagicResist", "Health", "Tenacity"], // Artçı Şok
  8351: ["Aura", "Active", "Slow", "Health", "ManaRegen"], // Buzul Takviyesi
  8465: ["Aura", "ManaRegen", "Health", "Armor"], // Muhafız
  8360: ["AbilityHaste", "CooldownReduction", "Mana"], // Dizginsiz Büyü Kitabı
};

const DORAN_BY_ROLE = { Marksman: "1055", Fighter: "1055", Assassin: "1055", Mage: "1056", Support: "1056", Tank: "1054" };

const LANE_STARTERS = {
  JUNGLE: [["1101", "2003"], ["1102", "2003"], ["1103", "2003"]],
  UTILITY: [["3865", "2003", "2003"]],
};

async function loadBuilds(version, c, container) {
  const slug = c.id.toLowerCase();
  try {
    const [bin, items, lanes, runes, allStats] = await Promise.all([
      fetch(`${CDRAGON}/game/data/characters/${slug}/${slug}.bin.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
      ddData("item.json").then(({ data }) => data.data),
      getChampionLanes().catch(() => new Map()),
      loadRuneData(c).catch(() => null),
      getStats(),
    ]);
    // Bu şampiyonun maç istatistikleri: { MIDDLE: { g, w, keystones: [...] }, ... }
    const stats = allStats?.champions?.[c.key] || null;

    // Önce Riot'un oyun içi önerisi; yoksa Babuşlar editör dizilimi.
    // Riot'un bazı eski önerileri kaldırılmış eşyalardan oluşur; 4'ten az geçerli eşyası kalanlar kullanılmaz.
    let byPosition = Object.fromEntries(
      Object.entries(summonersRiftBuilds(bin)).filter(
        ([, build]) =>
          new Set((build.mRecItemRanges || []).flatMap((range) => itemIds(range.items)).filter((id) => isRiftItem(id, items[id])))
            .size >= 4
      )
    );
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

    // Sık oynanan koridorlar: istatistik varsa maçların en az %10'unun oynandığı koridorlar, yoksa Riot'un listesi.
    const statGames = stats ? Object.values(stats).reduce((sum, lane) => sum + lane.g, 0) : 0;
    const popular = stats
      ? Object.entries(stats)
          .filter(([, lane]) => lane.g / statGames >= 0.1)
          .sort((a, b) => b[1].g - a[1].g)
          .map(([lane]) => lane)
      : lanes.get(String(c.key)) || [];
    const requested = LANES.find((l) => l.slug === new URLSearchParams(location.search).get("koridor"));
    const initial = requested?.id || popular[0] || "MIDDLE";

    renderBuilds({ version, c, container, byPosition, items, popular, source, runes, stats, lane: initial, runeIndex: 0 });
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
        const key = (ctx.mPosition || "default").toLowerCase();
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

  // Yalnızca Sihirdar Vadisi'nde satın alınabilen eşyalar (Riot'un eski önerilerindeki kaldırılmış eşyalar elenir).
  const valid = (ids) => ids.filter((id) => isRiftItem(id, items[id]));

  // Başlangıç: tek bir set. Koridora uygun değilse ya da geçersizse role göre Doran eşyası.
  const starterSets =
    !specific && LANE_STARTERS[lane]
      ? LANE_STARTERS[lane]
      : (build.StartingItemBundles || []).map((bundle) => itemIds(bundle.items));
  const starter =
    starterSets.map(valid).find((set) => set.length) || [DORAN_BY_ROLE[c.tags[0]] || "1055", "2003"];

  // Seçili temel rüne uyan eşya özellikleri; her basamakta Riot'un alternatiflerinden en uygunu seçilir.
  const keystone = selectedRune(state)?.rec.perkIds?.[0];
  const keystoneName = state.runes?.perks.get(keystone)?.name;
  const profile = KEYSTONE_PROFILES[keystone] || [];
  const score = (id) => profile.filter((tag) => items[id].tags?.includes(tag)).length;
  // Eşit puanda Riot'un sırası korunur (sort kararlıdır).
  const byFit = (range) => [...range].sort((a, b) => score(b) - score(a));

  // Eşya sırası: her basamaktan rüne en uygun eşya; 6'ya tamamlamak için "duruma göre" listesinden eklenir.
  const ranges = (build.mRecItemRanges || []).map((range) => valid(itemIds(range.items))).filter((r) => r.length);
  const situationalIndex = ranges.length > 2 ? ranges.length - 1 : -1;
  const sequence = [];
  ranges.forEach((range, i) => {
    if (i === situationalIndex) return;
    const pick = byFit(range).find((id) => !sequence.includes(id));
    if (pick) sequence.push(pick);
  });
  for (const id of byFit(ranges[situationalIndex] || [])) {
    if (sequence.length >= BUILD_SIZE) break;
    if (!sequence.includes(id)) sequence.push(id);
  }

  // Maç istatistiği varsa: bu temel rünü alan oyuncuların gerçekten aldığı başlangıç ve eşya sırası.
  const stat = selectedRune(state)?.rec.stat;
  const statItems = stat ? valid(stat.items.map(String)) : [];
  const fromStats = statItems.length >= 3;
  if (fromStats) {
    const statStarter = valid(stat.starter.map(String));
    if (statStarter.length) starter.splice(0, starter.length, ...statStarter);
    sequence.splice(0, sequence.length, ...statItems);
  }

  const badges = fromStats
    ? [
        el("span", { class: "badge" }, `${keystoneName} ile`),
        el("span", { class: "badge" }, `${stat.g.toLocaleString("tr-TR")} maç`),
        el("span", { class: "badge" }, `${formatPercent(stat.w, stat.g)} kazanma`),
      ]
    : [
        keystoneName && profile.length ? el("span", { class: "badge" }, `${keystoneName} için`) : null,
        specific ? el("span", { class: "badge" }, "Bu koridora özel") : null,
        el("span", { class: "badge" }, source === "editor" ? "Editör önerisi" : "Riot önerisi"),
      ];

  const itemsCard = el(
    "div",
    { class: "build-card" },
    el("div", { class: "build-head" }, el("h3", {}, "Eşyalar"), badges),
    el(
      "div",
      { class: "build-row starter-row" },
      el("span", { class: "build-label" }, "Başlangıç"),
      el(
        "div",
        { class: "build-items" },
        [...new Set(starter)].map((id) => itemChip(version, items, id, starter.filter((x) => x === id).length))
      )
    ),
    el(
      "ol",
      { class: "sequence" },
      sequence.slice(0, BUILD_SIZE).map((id) =>
        el(
          "li",
          {},
          el(
            "button",
            { type: "button", title: items[id].name, onclick: () => openItemDialog(version, items, id) },
            el("img", { src: ddImg(version, "item", items[id].image.full), alt: "", width: 48, height: 48, loading: "lazy" }),
            el("span", {}, items[id].name)
          )
        )
      )
    )
  );

  container.replaceChildren(
    ...[tabs, note, el("div", { class: "build-grid" }, ...[runeCard(state), itemsCard].filter(Boolean))].filter(Boolean)
  );
}

// Eşyaya tıklayınca sayfadan ayrılmadan ayrıntı penceresi açılır.
function itemChip(version, items, id, amount = 1) {
  const item = items[id];
  return el(
    "button",
    { class: "item-chip", type: "button", title: item.name, onclick: () => openItemDialog(version, items, id) },
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
      fetchJson(`${CLIENT_DATA}/${CLIENT_LANG}/v1/perks.json`),
      fetchJson(`${CLIENT_DATA}/${CLIENT_LANG}/v1/perkstyles.json`),
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

// Seçili koridor ve rün seçeneğine göre rün sayfası. Koridorun önerisi yoksa
// şampiyonun en sık oynandığı koridorun rünleri kullanılır.
function selectedRune(state) {
  const { runes, lane, stats } = state;

  // Önce maç istatistiği: bu koridorda en çok oynanan temel rünler, her birinin rün sayfası ve büyüleriyle.
  const laneStats = stats?.[lane];
  if (runes && laneStats?.keystones?.length) {
    const options = laneStats.keystones.map((k) => ({
      primaryPerkStyleId: k.primary,
      secondaryPerkStyleId: k.secondary,
      perkIds: k.perkIds,
      summonerSpellIds: k.spells,
      stat: k,
      laneGames: laneStats.g,
    }));
    const index = Math.min(state.runeIndex || 0, options.length - 1);
    return { options, fallback: false, index, rec: options[index] };
  }

  if (!runes || !runes.list.length) return null;
  let options = runes.list.filter((rec) => rec.position === lane);
  const fallback = !options.length;
  if (fallback) options = runes.list.filter((rec) => rec.position === runes.list[0].position);
  const index = Math.min(state.runeIndex || 0, options.length - 1);
  return { options, fallback, index, rec: options[index] };
}

function runeCard(state) {
  const { runes, lane, version } = state;
  const selected = selectedRune(state);
  if (!selected) return null;
  const { options, fallback, index, rec } = selected;

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
    options.length > 1 || options[0]?.stat
      ? el(
          "div",
          { class: "chips rune-variants", role: "group", "aria-label": "Rün seçeneği" },
          options.map((option, i) => {
            const key = perk(option.perkIds?.[0]);
            const name = key ? key.name : `Seçenek ${i + 1}`;
            // İstatistikte: kazanma oranı etikette, maç sayısı ve tercih oranı üzerine gelince.
            const { stat } = option;
            return el(
              "button",
              {
                class: "chip",
                type: "button",
                "aria-pressed": String(i === index),
                title: stat ? `${stat.g.toLocaleString("tr-TR")} maç · ${formatPercent(stat.g, option.laneGames)} tercih` : null,
                onclick: () => renderBuilds({ ...state, runeIndex: i }),
              },
              key ? el("img", { src: clientAsset(key.iconPath), alt: "", width: 20, height: 20 }) : null,
              stat ? `${name} · ${formatPercent(stat.w, stat.g)}` : `${i + 1}. ${name}`
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