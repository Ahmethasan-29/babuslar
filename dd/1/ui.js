// Darkest Dungeon sayfalarında ortak yardımcılar. Veri: data.js (scripts/dd-data.ps1 ile oluşturulur).

const RARITY = {
  c: { tr: "Sıradan", en: "Common", order: 1 },
  u: { tr: "Nadir olmayan", en: "Uncommon", order: 2 },
  r: { tr: "Nadir", en: "Rare", order: 3 },
  v: { tr: "Çok nadir", en: "Very Rare", order: 4 },
  a: { tr: "Kadim", en: "Ancestral", order: 5 },
  t: { tr: "Ganimet", en: "Trophy", order: 6 },
  cc: { tr: "Crimson Court", en: "Crimson Court", order: 7 },
  com: { tr: "Color of Madness", en: "Color of Madness", order: 8 },
};

// Wikiden gelen kısa HTML (kalın yazı, etki renkleri, satır sonu) güvenli biçimde gösterilir.
const DD_TAGS = new Set(["B", "I", "BR", "SPAN", "UL", "LI"]);

function ddRich(html) {
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
  const copy = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const children = [...node.childNodes].map(copy).flat(Infinity).filter(Boolean);
    if (!DD_TAGS.has(node.tagName)) return children;
    const out = document.createElement(node.tagName.toLowerCase());
    // Etki rengi sınıfı (stun, bleed, blight…) korunur; başka öznitelik alınmaz.
    if (node.tagName === "SPAN" && /^[a-z]+$/.test(node.className)) out.className = `fx-${node.className}`;
    out.append(...children);
    return out;
  };
  const wrap = el("span", { class: "dd-rich" });
  wrap.append(...[...doc.body.childNodes].map(copy).flat(Infinity).filter(Boolean));
  return wrap;
}

// Konum göstergesi: "1234" gibi bir sıra değeri dört kutuyla gösterilir (dolu = kullanılabilir).
// Kahraman konumları sağdan sola (4-3-2-1), hedefler soldan sağa (1-2-3-4) çizilir; oyundaki gibi.
function rankDots(value, kind) {
  const v = String(value || "");
  if (!v || v === "self") return null;
  const order = kind === "rank" ? [4, 3, 2, 1] : [1, 2, 3, 4];
  const linked = v.includes("+");
  return el(
    "span",
    { class: `dd-ranks ${kind}${linked ? " linked" : ""}`, title: kind === "rank" ? "Kullanılabildiği konum" : "Hedef" },
    order.map((n) => el("i", { class: v.includes(String(n)) ? "on" : "" }))
  );
}

const SET_LABELS = { crimson: "Crimson Court", color: "Color of Madness", trophy: "Boss ganimeti", farmstead: "Farmstead" };

// Trinket kartı: görsel, ad, nadirlik, kime ait olduğu ve etkileri.
function trinketCard(t, withOwner = false) {
  const rarity = RARITY[t.rarity];
  return el(
    "article",
    { class: `dd-trinket rarity-${t.rarity || "x"}` },
    ddImg(t.image, "", 64, "dd-trinket-img"),
    el(
      "div",
      {},
      el("h3", {}, t.name),
      el(
        "div",
        { class: "dd-trinket-tags" },
        rarity ? el("span", { class: `dd-rarity r-${t.rarity}` }, IS_EN ? rarity.en : rarity.tr) : null,
        SET_LABELS[t.set] ? el("span", { class: "tile-sub" }, SET_LABELS[t.set]) : null,
        withOwner && t.class ? el("a", { class: "perk-owner", href: heroLink(t.class) }, t.class) : null
      ),
      t.effect ? el("div", { class: "dd-effect" }, ddRich(t.effect)) : null,
      t.notes ? el("div", { class: "dd-effect tile-sub" }, ddRich(t.notes)) : null
    )
  );
}

function heroLink(name) {
  const h = DKD.heroes.find((x) => x.name === name);
  return h ? `kahraman.html?id=${encodeURIComponent(h.id)}` : "kahramanlar.html";
}

// Görsel yoksa ya da açılmazsa (wikide eksik dosya) aynı boyutta boş bir kutu gösterilir.
function ddImg(src, alt, size, cls = "") {
  const blank = () => el("span", { class: `dd-noimg ${cls}`, style: `width:${size}px;height:${size}px` });
  if (!src) return blank();
  const img = el("img", { src, alt, width: size, height: size, loading: "lazy", class: cls });
  img.addEventListener("error", () => img.replaceWith(blank()), { once: true });
  return img;
}

// Türkçe metin (tr.js) varsa onu, yoksa wikideki İngilizce metni döndürür.
function ddText(group, name, field, fallback) {
  if (IS_EN || typeof DKD_TR === "undefined") return fallback;
  const entry = DKD_TR[group]?.[name];
  const value = field ? entry?.[field] : entry;
  return value || fallback;
}
