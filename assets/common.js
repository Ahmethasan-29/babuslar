// Riot Games'in Data Dragon servisi: League of Legends verilerini Türkçe olarak sağlar.
const DD = "https://ddragon.leagueoflegends.com";
const LANG = "tr_TR";

const ROLES = {
  Assassin: "Suikastçı",
  Fighter: "Dövüşçü",
  Mage: "Büyücü",
  Marksman: "Nişancı",
  Support: "Destek",
  Tank: "Tank",
};

// Community Dragon: oyunun kendi dosyalarından çıkarılan veriler (önerilen eşyalar, koridorlar).
const CDRAGON = "https://raw.communitydragon.org/latest";

const LANES = [
  { id: "TOP", slug: "ust", label: "Üst" },
  { id: "JUNGLE", slug: "orman", label: "Orman" },
  { id: "MIDDLE", slug: "orta", label: "Orta" },
  { id: "BOTTOM", slug: "alt", label: "Alt" },
  { id: "UTILITY", slug: "destek", label: "Destek" },
];

const CLIENT_DATA = `${CDRAGON}/plugins/rcp-be-lol-game-data/global`;

let versionPromise;
let runeRecsPromise;
let lanesPromise;

function fetchJson(url) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Veri alınamadı: ${url}`);
    return r.json();
  });
}

// Riot'un istemcide önerdiği rünler ve sihirdar büyüleri (koridora göre):
// Map("103" => [{ position: "MIDDLE", perkIds: [...], summonerSpellIds: [...] }, ...])
function getRuneRecommendations() {
  if (!runeRecsPromise) {
    runeRecsPromise = fetchJson(`${CLIENT_DATA}/default/v1/champion-rune-recommendations.json`).then((list) => {
      const map = new Map();
      for (const entry of list) {
        map.set(
          String(entry.championId),
          (entry.runeRecommendations || []).filter((rec) => rec.mapId === 11 && rec.position && rec.position !== "NONE")
        );
      }
      return map;
    });
  }
  return runeRecsPromise;
}

// Her şampiyonun sık oynandığı koridorlar: Map("103" => ["MIDDLE"], ...)
function getChampionLanes() {
  if (!lanesPromise) {
    lanesPromise = getRuneRecommendations().then((recs) => {
      const map = new Map();
      for (const [championId, list] of recs) {
        const found = new Set(list.map((rec) => rec.position));
        map.set(championId, LANES.map((l) => l.id).filter((id) => found.has(id)));
      }
      return map;
    });
  }
  return lanesPromise;
}

// İstemci ikon yolunu ("/lol-game-data/assets/v1/perk-images/...") indirilebilir adrese çevirir.
function clientAsset(path) {
  return `${CLIENT_DATA}/default/${String(path || "").replace(/^\/lol-game-data\/assets\//i, "").toLowerCase()}`;
}

// En güncel yama numarasını getirir (ör. "15.19.1").
function getVersion() {
  if (!versionPromise) {
    versionPromise = fetch(`${DD}/api/versions.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Yama sürümü alınamadı");
        return r.json();
      })
      .then((versions) => versions[0]);
  }
  return versionPromise;
}

async function ddData(path) {
  const version = await getVersion();
  const r = await fetch(`${DD}/cdn/${version}/data/${LANG}/${path}`);
  if (!r.ok) throw new Error(`Veri alınamadı: ${path}`);
  return { version, data: await r.json() };
}

function ddImg(version, kind, file) {
  return `${DD}/cdn/${version}/img/${kind}/${file}`;
}

// Riot açıklamalarındaki etiketleri (<br>, <magicDamage> vb.) temizleyip düz metne çevirir.
// DOMParser betik çalıştırmadığı için dış kaynaktan gelen metin güvenle işlenir.
function plainText(html) {
  const prepared = String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "\n• ");
  const doc = new DOMParser().parseFromString(prepared, "text/html");
  return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
}

// Kısa yoldan DOM öğesi oluşturur: el("a", { href: "#" }, "metin")
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

function showNotice(container, message) {
  container.replaceChildren(el("p", { class: "notice" }, message));
}

function normalize(text) {
  return String(text || "").toLocaleLowerCase("tr");
}

// Sihirdar Vadisi'nde gerçekten satın alınabilen eşya mı? 6 haneli kimlikler (Arena vb.) ve kaldırılmış eşyalar elenir.
function isRiftItem(itemId, item) {
  return (
    Number(itemId) < 10000 &&
    !!item &&
    !!item.maps?.["11"] &&
    !!item.gold?.purchasable &&
    item.inStore !== false &&
    !item.hideFromAll &&
    !item.requiredChampion &&
    !item.requiredAlly
  );
}

// Eşya ayrıntı penceresi: Eşyalar ve şampiyon sayfalarında ortak, sayfadan ayrılmadan açılır.
let itemDialog;

function openItemDialog(version, items, itemId) {
  const item = items[itemId];
  if (!item) return;

  if (!itemDialog) {
    itemDialog = el(
      "dialog",
      { "aria-labelledby": "item-title" },
      el("button", { class: "close", type: "button", "aria-label": "Kapat", onclick: () => itemDialog.close() }, "×"),
      el("div", { class: "dialog-body" })
    );
    itemDialog.addEventListener("click", (event) => {
      if (event.target === itemDialog) itemDialog.close();
    });
    document.body.append(itemDialog);
  }

  const link = (id) =>
    isRiftItem(id, items[id])
      ? el(
          "button",
          { type: "button", onclick: () => openItemDialog(version, items, id) },
          el("img", { src: ddImg(version, "item", items[id].image.full), alt: "" }),
          el("span", {}, items[id].name)
        )
      : null;

  const from = (item.from || []).map(link).filter(Boolean);
  const into = (item.into || []).map(link).filter(Boolean);
  const body = itemDialog.querySelector(".dialog-body");

  body.replaceChildren(
    ...[
      el(
        "div",
        { class: "dialog-head" },
        el("img", { src: ddImg(version, "item", item.image.full), alt: "", width: 64, height: 64 }),
        el(
          "div",
          {},
          el("h2", { id: "item-title" }, item.name),
          el("span", { class: "gold" }, `${item.gold.total} altın`),
          item.gold.sell ? el("span", { class: "tile-sub" }, ` · Satış: ${item.gold.sell} altın`) : null
        )
      ),
      item.plaintext ? el("p", { class: "page-sub", style: "margin-bottom:12px" }, item.plaintext) : null,
      el("p", { class: "desc" }, plainText(item.description)),
      from.length ? el("h3", {}, "Yapımı") : null,
      from.length ? el("div", { class: "recipe" }, from) : null,
      into.length ? el("h3", {}, "Dönüştüğü eşyalar") : null,
      into.length ? el("div", { class: "recipe" }, into) : null,
    ].filter(Boolean)
  );

  if (!itemDialog.open) itemDialog.showModal();
  body.scrollTop = 0;
}
// Gece toplanan maç istatistikleri ("istatistik" dalı). Henüz yoksa null döner ve site Riot önerilerini kullanır.
// Yerelde denerken depo kökündeki stats.local.json okunur (git'e eklenmez).
const STATS_URL =
  location.hostname === "localhost"
    ? new URL("../stats.local.json", document.currentScript?.src || location.href).href
    : "https://raw.githubusercontent.com/Ahmethasan-29/babuslar/istatistik/stats.json";

let statsPromise;

function getStats() {
  if (!statsPromise) statsPromise = fetchJson(STATS_URL).catch(() => null);
  return statsPromise;
}

function formatPercent(part, total) {
  return `%${((part / total) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}`;
}