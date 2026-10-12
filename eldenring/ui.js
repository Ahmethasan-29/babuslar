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

// Liste sayfası: #search, #groups, #count, #list öğelerini kullanır.
//   groups: [{ id, label, test(item) }]  (ilk düğme "Hepsi")
function listPage({ items, groups = [], text, card, noun }) {
  const list = document.getElementById("list");
  const search = document.getElementById("search");
  const count = document.getElementById("count");
  const groupBox = document.getElementById("groups");
  const params = new URLSearchParams(location.search);
  let group = groups.some((g) => g.id === params.get("grup")) ? params.get("grup") : "all";

  function render() {
    if (groupBox) groupBox.hidden = !groups.length;
    if (groupBox) {
      groupBox.replaceChildren(
        ...[{ id: "all", label: L("Hepsi", "All"), test: () => true }, ...groups].map((g) =>
          el("button", { class: "chip", type: "button", "aria-pressed": String(group === g.id), onclick: () => ((group = g.id), render()) }, `${g.label} (${items.filter(g.test).length})`)
        )
      );
    }
    const q = normalize(search.value.trim());
    const g = groups.find((x) => x.id === group);
    const shown = items.filter((x) => (!g || g.test(x)) && (!q || normalize(text(x)).includes(q)));
    count.textContent = `${shown.length} ${L(...noun)}`;
    if (!shown.length) return showNotice(list, L("Aramana uyan sonuç bulunamadı.", "Nothing matches your search."));
    list.replaceChildren(...shown.map(card));
  }
  search.addEventListener("input", render);
  render();
}
