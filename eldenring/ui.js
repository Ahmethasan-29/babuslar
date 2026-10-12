// Elden Ring sayfalarının ortak kodu: Türkçe etiketler ve liste sayfası (arama + grup düğmeleri + kartlar).
// Oyunun Türkçesi olmadığından eşya adları ve açıklamalar İngilizce kalır; arayüz Türkçedir.
const L = (tr, en) => (IS_EN ? en : tr);

const ER_TR = {
  // Saldırı / savunma türleri
  damage: {
    Phy: ["Fiziksel", "Physical"],
    Mag: ["Büyü", "Magic"],
    Fire: ["Ateş", "Fire"],
    Ligt: ["Yıldırım", "Lightning"],
    Holy: ["Kutsal", "Holy"],
    Crit: ["Kritik", "Critical"],
    Boost: ["Denge (guard boost)", "Guard boost"],
  },
  // Silah ve büyü gereksinimleri
  attrs: {
    Str: ["Güç", "Strength"],
    Dex: ["Çeviklik", "Dexterity"],
    Int: ["Zekâ", "Intelligence"],
    Fai: ["İnanç", "Faith"],
    Arc: ["Gizem (Arcane)", "Arcane"],
    Intelligence: ["Zekâ", "Intelligence"],
    Faith: ["İnanç", "Faith"],
    Arcane: ["Gizem (Arcane)", "Arcane"],
  },
  // Başlangıç sınıflarının değerleri
  classStats: {
    level: ["Seviye", "Level"],
    vigor: ["Can (Vigor)", "Vigor"],
    mind: ["Zihin (Mind)", "Mind"],
    endurance: ["Dayanıklılık", "Endurance"],
    strength: ["Güç", "Strength"],
    dexterity: ["Çeviklik", "Dexterity"],
    intelligence: ["Zekâ", "Intelligence"],
    faith: ["İnanç", "Faith"],
    arcane: ["Gizem (Arcane)", "Arcane"],
  },
  // Silah türleri (bilinmeyen tür olduğu gibi gösterilir)
  categories: {
    Dagger: "Hançer", "Straight Sword": "Düz kılıç", Greatsword: "Büyük kılıç", "Colossal Sword": "Dev kılıç", "Thrusting Sword": "Saplama kılıcı",
    "Heavy Thrusting Sword": "Ağır saplama kılıcı", "Curved Sword": "Eğri kılıç", "Curved Greatsword": "Büyük eğri kılıç", Katana: "Katana",
    Twinblade: "Çift ağızlı kılıç", Axe: "Balta", Greataxe: "Büyük balta", Hammer: "Çekiç", Flail: "Topuz zinciri", "Great Hammer": "Büyük çekiç",
    "Colossal Weapon": "Dev silah", Spear: "Mızrak", "Great Spear": "Büyük mızrak", Halberd: "Teber", Reaper: "Tırpan", Whip: "Kırbaç",
    Fist: "Yumruk silahı", Claw: "Pençe", "Light Bow": "Hafif yay", Bow: "Yay", Greatbow: "Büyük yay", Crossbow: "Arbalet", Ballista: "Balista",
    "Glintstone Staff": "Asa", "Sacred Seal": "Kutsal mühür", Torch: "Meşale", "Small Shield": "Küçük kalkan", "Medium Shield": "Orta kalkan",
    Greatshield: "Büyük kalkan", "Warhammer": "Savaş çekici",
  },
};
const pairText = (map, key) => (map[key] ? L(...map[key]) : key);
const catName = (c) => (IS_EN || !ER_TR.categories[c] ? c : ER_TR.categories[c]);

// { Phy: 113, Mag: 0 } → küçük değer satırları
function statList(obj, labels, title) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return null;
  return el(
    "div",
    { class: "er-stats" },
    title ? el("span", { class: "er-stats-title" }, title) : null,
    entries.map(([k, v]) => el("span", { class: "er-stat" }, `${pairText(labels, k)} `, el("b", {}, v)))
  );
}

const erImg = (src, cls = "er-img") => (src ? el("img", { class: cls, src, alt: "", loading: "lazy" }) : el("div", { class: `${cls} dd-noimg` }));
const descBox = (text, summary) => (text ? el("details", { class: "dd-uses" }, el("summary", {}, summary || L("Oyundaki açıklama (İngilizce)", "In-game description")), el("p", {}, text)) : null);

