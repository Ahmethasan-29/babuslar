// Mount & Blade II: Bannerlord: Türkçe etiketler. Oyun terimleri (birlik, ürün, atölye adları) İngilizce kalır;
// yanlarına Türkçe karşılıkları yazılır.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const BL_TR = {
  kingdoms: {
    Vlandia: "Vlandia",
    Sturgia: "Sturgia",
    Battania: "Battania",
    Khuzait: "Khuzait Hanlığı",
    Aserai: "Aserai Sultanlığı",
    "Northern Empire": "Kuzey İmparatorluğu",
    "Western Empire": "Batı İmparatorluğu",
    "Southern Empire": "Güney İmparatorluğu",
  },
  // Kültürler ve kısa tanıtım (birlik ağaçları kültüre göredir; üç imparatorluk aynı Imperial birliklerini kullanır).
  cultures: {
    Vlandia: { name: "Vlandia", note: "Batıdaki feodal krallık. Ağır süvarisi (Vlandian Knight, Banner Knight) ve crossbow'lu nişancıları çok güçlüdür. Kral: Derthert." },
    Sturgia: { name: "Sturgia", note: "Kuzeyin soğuk ormanlarında. Sağlam piyadesi (Heroic Line Breaker, Heavy Axeman) ve Druzhinnik süvarileri öne çıkar. Kral: Raganvad." },
    Battania: { name: "Battania", note: "Ormanlık dağlarda yaşayan klanlar. Okçuları (Battanian Fian Champion) oyunun en iyileri arasındadır; piyadesi hızlı ve saldırgandır. Kral: Caladog." },
    Khuzait: { name: "Khuzait", note: "Doğu bozkırlarının atlı halkı. Atlı okçuları ve mızraklı süvarileri sayesinde ovada çok tehlikelidir. Han: Monchug." },
    Aserai: { name: "Aserai", note: "Güneydeki çöl sultanlığı. Dengeli bir ordu; Mamluke süvarileri (Aserai Mamluke Heavy Cavalry) ve sağlam piyadesi vardır, ticarette güçlüdür. Sultan: Unqid." },
    Empire: {
      name: "İmparatorluk (Kuzey, Batı, Güney)",
      note: "Calradia İmparatorluğu, imparatorun ölümünden sonra üçe bölündü: Kuzey (Lucon), Batı (Garios) ve Güney (Rhagaea). Üçü de aynı Imperial birliklerini kullanır: Legionary piyadesi ve Cataphract ağır süvarisi çok güçlüdür.",
    },
  },
  types: { town: "Şehir", castle: "Kale", village: "Köy" },
  kinds: { infantry: "Piyade", ranged: "Nişancı", cavalry: "Süvari", horsearcher: "Atlı nişancı" },
  products: {
    Grain: "tahıl",
    Wheat: "buğday",
    Fish: "balık",
    Sheep: "koyun (yün)",
    Cows: "inek",
    Olives: "zeytin",
    Hardwood: "kereste",
    "Iron Ore": "demir cevheri",
    Flax: "keten",
    Clay: "kil",
    Horses: "at",
    Furs: "kürk",
    "Silver Ore": "gümüş cevheri",
    Dates: "hurma",
    Grapes: "üzüm",
    Salt: "tuz",
    Hogs: "domuz",
    "Desert Horses": "çöl atı",
    "Raw Silk": "ham ipek",
    "Midland Palfreys": "binek atı",
    "Steppe Horses": "bozkır atı",
    "Saddle Horses": "binek atı",
    Cotton: "pamuk",
    "Battanian Ponies": "Battania midillisi",
  },
  // Hammaddeyi işleyen atölye (wiki: Workshop). Atölye, şehre o hammaddeyi satan köyler çoksa kâr eder.
  workshops: {
    Grain: "Brewery (bira)",
    Wheat: "Brewery (bira)",
    Grapes: "Wine Press (şarap)",
    Olives: "Olive Press (zeytinyağı)",
    Flax: "Linen Weavery (keten kumaş)",
    "Raw Silk": "Velvet Weavery (kadife)",
    Clay: "Pottery Shop (çömlek)",
    Sheep: "Wool Weavery (yün kumaş)",
    Hardwood: "Wood Workshop (yay, ok, kalkan)",
    "Iron Ore": "Smithy (silah, zırh, alet)",
    "Silver Ore": "Silversmith (mücevher)",
  },
  skills: {
    "One Handed": "Tek el",
    "Two Handed": "Çift el",
    Polearm: "Mızrak",
    Bow: "Yay",
    Crossbow: "Arbalet",
    Throwing: "Fırlatma",
    Riding: "Binicilik",
    Athletics: "Atletizm",
  },
};

// İngilizce etiketler (site İngilizceyken).
const BL_EN = {
  types: { town: "Town", castle: "Castle", village: "Village" },
  kinds: { infantry: "Infantry", ranged: "Ranged", cavalry: "Cavalry", horsearcher: "Horse archer" },
};
const blType = (t) => L(BL_TR.types[t], BL_EN.types[t]);
const blKind = (k) => L(BL_TR.kinds[k], BL_EN.kinds[k]);
BL_EN.cultures = {
  Vlandia: "The feudal kingdom of the west. Its heavy cavalry (Vlandian Knight, Banner Knight) and crossbowmen are very strong. King: Derthert.",
  Sturgia: "In the cold northern forests. Known for tough infantry (Heroic Line Breaker, Heavy Axeman) and Druzhinnik cavalry. King: Raganvad.",
  Battania: "Highland forest clans. Their archers (Battanian Fian Champion) are among the best; their infantry is fast and aggressive. King: Caladog.",
  Khuzait: "Mounted people of the eastern steppe. Horse archers and lancers make them deadly in open fields. Khan: Monchug.",
  Aserai: "The desert sultanate of the south. A balanced army with Mamluke cavalry (Aserai Mamluke Heavy Cavalry) and solid infantry; strong in trade. Sultan: Unqid.",
  Empire: "The Calradic Empire split in three after the emperor's death: Northern (Lucon), Western (Garios) and Southern (Rhagaea). All use the same Imperial troops: Legionary infantry and Cataphract heavy cavalry are very strong.",
};
