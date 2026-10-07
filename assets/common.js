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
