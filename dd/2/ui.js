// Darkest Dungeon II'ye özel yardımcılar. Genel olanlar (ddRich, ddImg) ../1/ui.js'ten gelir. Veri: data.js (const DKD2).

// Konum göstergesi. Wiki DD2'de konumları "..oo" gibi yazar: "o" = seçili, "." = değil, "-" = iki hedef birbirine bağlı.
// Kahramanın kullandığı konumlar oyundaki gibi 4-3-2-1, düşman hedefleri 1-2-3-4 sırasıyla yazılmıştır.
function rankDots2(value, kind) {
  const v = String(value || "");
  if (!/[o.]/.test(v)) return null;
  const dots = [];
  let link = false;
  for (const ch of v) {
    if (ch === "-") {
      link = true;
      continue;
    }
    if (ch !== "o" && ch !== ".") continue;
    dots.push(el("i", { class: `${ch === "o" ? "on" : ""}${link ? " link" : ""}` }));
    link = false;
  }
  return el("span", { class: `dd-ranks ${kind === "rank" ? "rank" : "target"}`, title: kind === "rank" ? "Kullanılabildiği konum" : "Hedef" }, dots);
}

// Türkçe metin (tr.js) varsa onu, yoksa wikideki İngilizce metni döndürür.
function ddText2(group, name, field, fallback) {
  if (IS_EN || typeof DKD2_TR === "undefined") return fallback;
  const entry = DKD2_TR[group]?.[name];
  const value = field ? entry?.[field] : entry;
  return value || fallback;
}

// Trinket ya da savaş eşyası kartı.
function itemCard2(t, extra) {
  return el(
    "article",
    { class: "dd-trinket rarity-x" },
    ddImg(t.image, "", 64, "dd-trinket-img"),
    el(
      "div",
      {},
      el("h3", {}, t.name),
      el(
        "div",
        { class: "dd-trinket-tags" },
        t.rarity ? el("span", { class: "dd-rarity" }, t.rarity) : null,
        t.cost ? el("span", { class: "tile-sub gold" }, t.cost) : null,
        t.stack ? el("span", { class: "tile-sub" }, `Yığın: ${t.stack}`) : null,
        t.target ? el("span", { class: "tile-sub" }, t.target) : null,
        extra || null
      ),
      t.effect ? el("div", { class: "dd-effect" }, ddRich(t.effect)) : null
    )
  );
}
