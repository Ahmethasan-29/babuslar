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

let versionPromise;

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
