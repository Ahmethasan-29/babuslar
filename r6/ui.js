// Rainbow Six Siege sayfalarının ortak yardımcıları. Veri: data.js (const R6), Türkçe metinler: tr.js (const R6_TR).

const findOperator = (id) => R6.operators.find((o) => o.id === id);
const findWeapon = (id) => R6.weapons.find((w) => w.id === id);

// Etiketler: Türkçede tr.js'teki karşılığı, İngilizcede wikideki adı.
function trLabel(group, value) {
  if (IS_EN || !value) return value;
  return R6_TR[group]?.[value] || value;
}
const sideLabel = (side) => trLabel("sides", side);
const typeLabel = (type) => trLabel("weaponTypes", type);
const roleLabel = (role) => trLabel("roles", role);

// Wiki resmi; açılmazsa boş bir kutu kalır.
function r6Img(src, alt, size, cls) {
  if (!src) return el("span", { class: `dd-noimg ${cls || ""}`, style: `width:${size}px;height:${size}px` });
  const img = el("img", { class: cls || "", src, alt: alt || "", loading: "lazy", width: size, height: size });
  img.addEventListener("error", () => img.replaceWith(el("span", { class: `dd-noimg ${cls || ""}`, style: `width:${size}px;height:${size}px` })));
  return img;
}

// Zırh / hız göstergesi: 3 nokta.
function r6Dots(n) {
  return el("span", { class: "r6-dots", "aria-label": `${n}/3` }, [1, 2, 3].map((i) => el("i", { class: i <= n ? "on" : "" })));
}

// Wikiden gelen açıklama satırları: "• " ile başlayanlar madde listesi, diğerleri paragraf.
function r6Lines(lines) {
  const out = [];
  let list = null;
  for (const line of lines || []) {
    if (line.startsWith("• ")) {
      if (!list) out.push((list = el("ul", { class: "r6-list" })));
      list.append(el("li", {}, line.slice(2)));
    } else {
      list = null;
      out.push(el("p", {}, line));
    }
  }
  return el("div", { class: "r6-desc" }, out);
}

// YouTube videosu: önce kapak resmi, tıklanınca oynatıcı yüklenir (oynatıcının kendi tam ekran düğmesi vardır).
function r6Video(id, title) {
  if (!id) return null;
  const thumb = el(
    "button",
    { class: "video-thumb", type: "button", "aria-label": `${title} videosunu oynat` },
    el("img", { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: "", loading: "lazy" }),
    el("span", { class: "play", "aria-hidden": "true" }, "▶")
  );
  thumb.addEventListener("click", () =>
    thumb.replaceWith(
      el("iframe", {
        class: "video-frame",
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
        title,
        allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
        allowfullscreen: "",
        referrerpolicy: "strict-origin-when-cross-origin",
      })
    )
  );
  return el(
    "div",
    { class: "r6-video" },
    thumb
  );
}

// Kat planı başlığı: "Club House - First Floor" → "1. kat" (Türkçe), İngilizcede wikideki hâli (önek atılır).
function floorName(caption, index, total) {
  // Tek resim varsa (ör. District) kat değil, haritanın genel görünümüdür.
  if (total === 1) return "Genel görünüm";
  const c = String(caption || "").replace(/^.*\s-\s/, "").trim();
  if (IS_EN) return c || `Floor ${index + 1}`;
  const s = c.toLowerCase();
  if (!s) return `Plan ${index + 1}`;
  if (/basement|bottom/.test(s)) return "Bodrum";
  if (/roof/.test(s)) return "Çatı";
  if (/exterior/.test(s)) return "Dış alan";
  if (/ground/.test(s)) return s.includes("2") ? "Zemin (2)" : "Zemin";
  const n = s.match(/(\d)|(first)|(second)|(third)/);
  if (n) return `${n[1] || (n[2] ? 1 : n[3] ? 2 : 3)}. kat`;
  return c;
}

// Operatör simgesi (SVG) + adı: silah ve harita sayfalarında kullanılır.
function operatorChip(o) {
  return el("a", { class: "r6-op-chip", href: `operator.html?id=${encodeURIComponent(o.id)}`, title: o.name }, r6Img(o.icon, "", 22, "r6-op-chip-img"), o.name);
}

// Fandom görselleri çok büyük olabilir (2000+ px); sayfada küçültülmüş sürümü istenir.
function thumb(url, width) {
  return url ? url.replace(/\/revision\/latest$/, `/revision/latest/scale-to-width-down/${width}`) : url;
}
