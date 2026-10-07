// Riot maç verisinden şampiyon / koridor / temel rün istatistikleri çıkarır.
// Saf fonksiyonlar: hem Node'da (GitHub Actions) hem tarayıcıda (test) çalışır.

export const LANES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const RANKED_SOLO = 420;
export const MIN_GAME_SECONDS = 15 * 60; // erken teslim / remake maçları sayılmaz
export const STARTER_WINDOW_MS = 90_000; // ilk 90 saniyede alınanlar başlangıç eşyasıdır
export const SLOTS = 6;
const COUNTER_LIMIT = 10; // her sayaçta en sık 10 değer saklanır

// Data Dragon item.json "data" nesnesinden: tamamlanmış eşyalar, botlar, tılsımlar.
export function itemInfo(items) {
  const purchasable = (id) => {
    const it = items[id];
    return Number(id) < 10000 && !!it && !!it.maps?.["11"] && !!it.gold?.purchasable && it.inStore !== false && !it.hideFromAll;
  };
  const finals = new Set();
  const boots = new Set();
  const trinkets = new Set();
  for (const [id, it] of Object.entries(items)) {
    if (it.tags?.includes("Trinket")) trinkets.add(Number(id));
    if (!purchasable(id) || it.tags?.includes("Consumable") || it.tags?.includes("Trinket")) continue;
    const upgrades = (it.into || []).filter(purchasable);
    if (it.tags?.includes("Boots")) {
      if ((it.depth || 1) >= 2) {
        finals.add(Number(id));
        boots.add(Number(id));
      }
    } else if (!upgrades.length && (it.gold?.total || 0) >= 900) {
      finals.add(Number(id));
    }
  }
  return { finals, boots, trinkets };
}

export function patchOf(gameVersion) {
  return String(gameVersion || "").split(".").slice(0, 2).join(".");
}

// Zaman çizelgesinden oyuncu başına satın alma listesi (geri alınanlar düşülür).
function purchases(timeline) {
  const byPlayer = new Map();
  for (const frame of timeline?.info?.frames || []) {
    for (const e of frame.events || []) {
      if (e.type === "ITEM_PURCHASED") {
        if (!byPlayer.has(e.participantId)) byPlayer.set(e.participantId, []);
        byPlayer.get(e.participantId).push({ id: e.itemId, t: e.timestamp });
      } else if (e.type === "ITEM_UNDO" && e.beforeId) {
        const list = byPlayer.get(e.participantId) || [];
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].id === e.beforeId) {
            list.splice(i, 1);
            break;
          }
        }
      }
    }
  }
  return byPlayer;
}

const inc = (counter, key) => {
  counter[key] = (counter[key] || 0) + 1;
};

// Bir maçı toplama ekler. Eklendiyse yamayı, sayılmadıysa null döndürür.
export function addMatch(agg, match, timeline, info) {
  const m = match?.info;
  if (!m || m.queueId !== RANKED_SOLO || (m.gameDuration || 0) < MIN_GAME_SECONDS) return null;

  const patch = patchOf(m.gameVersion);
  const node = (agg.patches[patch] ??= { matches: 0, champions: {} });
  node.matches++;
  const bought = purchases(timeline);

  for (const p of m.participants || []) {
    const lane = p.teamPosition;
    const [primary, secondary] = p.perks?.styles || [];
    if (!LANES.includes(lane) || !primary?.selections?.length || !secondary) continue;

    const keystone = primary.selections[0].perk;
    const shards = p.perks.statPerks || {};
    const page = [
      ...primary.selections.map((s) => s.perk),
      ...secondary.selections.map((s) => s.perk),
      shards.offense,
      shards.flex,
      shards.defense,
    ];
    const list = bought.get(p.participantId) || [];
    const starter = list
      .filter((x) => x.t <= STARTER_WINDOW_MS && !info.trinkets.has(x.id))
      .map((x) => x.id)
      .sort((a, b) => a - b);
    const build = [...new Set(list.filter((x) => info.finals.has(x.id)).map((x) => x.id))].slice(0, SLOTS);

    const champ = (node.champions[p.championId] ??= {});
    const laneNode = (champ[lane] ??= {});
    const k = (laneNode[keystone] ??= { g: 0, w: 0, pages: {}, spells: {}, starters: {}, slots: [] });
    k.g++;
    if (p.win) k.w++;
    inc(k.pages, `${primary.style}|${secondary.style}|${page.join(",")}`);
    inc(k.spells, [p.summoner1Id, p.summoner2Id].sort((a, b) => a - b).join(","));
    if (starter.length) inc(k.starters, starter.join(","));
    build.forEach((id, i) => inc((k.slots[i] ??= {}), id));
  }
  return patch;
}

const top = (counter, limit = COUNTER_LIMIT) =>
  Object.entries(counter || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

// Dosya boyutu büyümesin diye sayaçlarda yalnızca en sık değerler tutulur.
export function prune(agg) {
  for (const node of Object.values(agg.patches)) {
    for (const champ of Object.values(node.champions)) {
      for (const lane of Object.values(champ)) {
        for (const k of Object.values(lane)) {
          k.pages = Object.fromEntries(top(k.pages));
          k.spells = Object.fromEntries(top(k.spells));
          k.starters = Object.fromEntries(top(k.starters));
          k.slots = k.slots.map((slot) => Object.fromEntries(top(slot || {})));
        }
      }
    }
  }
}

const versionKey = (patch) => patch.split(".").map(Number);
export function sortPatches(patches) {
  return [...patches].sort((a, b) => {
    const [a1, a2] = versionKey(a);
    const [b1, b2] = versionKey(b);
    return b1 - a1 || b2 - a2;
  });
}

const merge = (target, source) => {
  for (const [key, n] of Object.entries(source || {})) target[key] = (target[key] || 0) + n;
  return target;
};

// Sitenin okuduğu özet: son iki yama birleştirilir, az oynanan temel rünler elenir.
export function buildOutput(agg, { boots = new Set(), minGames = 10, keystonesPerLane = 3, now = new Date() } = {}) {
  const patches = sortPatches(Object.keys(agg.patches)).slice(0, 2);
  const combined = {};
  let matches = 0;

  for (const patch of patches) {
    const node = agg.patches[patch];
    matches += node.matches;
    for (const [champId, lanes] of Object.entries(node.champions)) {
      for (const [lane, keystones] of Object.entries(lanes)) {
        for (const [keystone, k] of Object.entries(keystones)) {
          const t = (((combined[champId] ??= {})[lane] ??= {})[keystone] ??= { g: 0, w: 0, pages: {}, spells: {}, starters: {}, slots: [] });
          t.g += k.g;
          t.w += k.w;
          merge(t.pages, k.pages);
          merge(t.spells, k.spells);
          merge(t.starters, k.starters);
          k.slots.forEach((slot, i) => merge((t.slots[i] ??= {}), slot));
        }
      }
    }
  }

  const champions = {};
  for (const [champId, lanes] of Object.entries(combined)) {
    for (const [lane, keystones] of Object.entries(lanes)) {
      const all = Object.entries(keystones);
      const laneGames = all.reduce((sum, [, k]) => sum + k.g, 0);
      const laneWins = all.reduce((sum, [, k]) => sum + k.w, 0);
      const best = all
        .filter(([, k]) => k.g >= minGames)
        .sort((a, b) => b[1].g - a[1].g)
        .slice(0, keystonesPerLane)
        .map(([keystone, k]) => {
          const [pageKey] = top(k.pages, 1)[0] || [];
          const [primary, secondary, perks] = String(pageKey || "").split("|");
          const spells = (top(k.spells, 1)[0]?.[0] || "").split(",").map(Number).filter(Boolean);
          // Sıçra (4) her zaman önde gösterilir.
          spells.sort((a, b) => (a === 4 ? -1 : b === 4 ? 1 : 0));
          // Her sırada en sık alınan eşya; aynı eşya ya da ikinci bir bot tekrar seçilmez.
          const items = [];
          k.slots.forEach((slot) => {
            const hasBoots = items.some((id) => boots.has(id));
            const pick = top(slot)
              .map(([id]) => Number(id))
              .find((id) => !items.includes(id) && !(hasBoots && boots.has(id)));
            if (pick) items.push(pick);
          });
          return {
            keystone: Number(keystone),
            g: k.g,
            w: k.w,
            primary: Number(primary),
            secondary: Number(secondary),
            perkIds: String(perks || "").split(",").map(Number).filter(Boolean),
            spells,
            starter: (top(k.starters, 1)[0]?.[0] || "").split(",").map(Number).filter(Boolean),
            items,
          };
        });
      if (best.length) (champions[champId] ??= {})[lane] = { g: laneGames, w: laneWins, keystones: best };
    }
  }

  return { updated: now.toISOString(), patches, matches, champions };
}
