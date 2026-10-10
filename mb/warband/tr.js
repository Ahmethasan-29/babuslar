// Mount & Blade: Warband: Türkçe etiketler. Oyun terimleri (beceri adları, birlik adları) İngilizce kalır;
// yanlarına parantez içinde Türkçe karşılıkları yazılır.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const WB_TR = {
  factions: {
    kingdom_1: "Swadia Krallığı",
    kingdom_2: "Vaegir Krallığı",
    kingdom_3: "Khergit Hanlığı",
    kingdom_4: "Nord Krallığı",
    kingdom_5: "Rhodok Krallığı",
    kingdom_6: "Sarranid Sultanlığı",
  },
  // Krallıkların öne çıkan yanı (birlik ağaçlarından): kısa, oyuncuların bildiği özetler.
  factionNotes: {
    kingdom_1: "Oyunun en güçlü ağır süvarisi Swadian Knight burada. Crossbow'lu piyadeleri de sağlam; ova savaşlarında çok etkili.",
    kingdom_2: "Dengeli bir ordu: Vaegir Marksman oyunun en iyi okçularından, Vaegir Guard sağlam piyade, Vaegir Knight iyi süvari.",
    kingdom_3: "Neredeyse tamamen atlı bir ordu: hızlı Khergit Horse Archer ve Lancer'lar. Kuşatmada zayıflar.",
    kingdom_4: "Piyade krallığı: Nord Huscarl oyunun en iyi piyadesi. Süvarisi yok; kuşatmada çok güçlü.",
    kingdom_5: "Piyade ve crossbow krallığı: Rhodok Sharpshooter çok güçlü nişancı, Rhodok Sergeant mızraklı sağlam piyade. Süvarisi yok.",
    kingdom_6: "Her türden birlik var: Sarranid Mamluke iyi ağır süvari, Sarranid Guard sağlam piyade, okçuları orta seviye.",
  },
  types: { town: "Şehir", castle: "Kale", village: "Köy" },
  kinds: { infantry: "Piyade", ranged: "Nişancı", cavalry: "Süvari", horsearcher: "Atlı nişancı" },
  skills: {
    Tracking: "iz sürme",
    Pathfinding: "yol bulma, haritada hız",
    "Power Strike": "güçlü vuruş",
    "Weapon Master": "silah ustalığı",
    Riding: "binicilik",
    Engineer: "kuşatma mühendisliği",
    Trade: "ticaret",
    "Power Draw": "yayla güçlü atış",
    "Horse Archery": "at üstünde okçuluk",
    Ironflesh: "fazladan can",
    Spotting: "uzağı görme",
    Athletics: "yaya hız",
    "Wound Treatment": "yaraların hızlı iyileşmesi",
    Surgery: "ölecek askerin kurtulması",
    "First Aid": "savaş sonrası can",
    "Power Throw": "fırlatma silahları",
    Trainer: "askerlere günlük tecrübe",
  },
  objections: {
    "Failing Quests": "Görevlerde başarısız olmak",
    Retreating: "Savaştan kaçmak",
    "Heavy Casualties": "Ağır kayıp vermek",
    Hunger: "Ordunun aç kalması",
    "Not Being Paid": "Maaşların ödenmemesi",
    "Killing Local Merchant": "Yerel tüccarı öldürme görevini yapmak",
    "Returning Serfs": "Kaçak köylüleri geri getirme görevini yapmak",
  },
};

// İngilizce etiketler (site İngilizceyken).
const WB_EN = {
  types: { town: "Town", castle: "Castle", village: "Village" },
  kinds: { infantry: "Infantry", ranged: "Ranged", cavalry: "Cavalry", horsearcher: "Horse archer" },
};
const wbType = (t) => L(WB_TR.types[t], WB_EN.types[t]);
const wbKind = (k) => L(WB_TR.kinds[k], WB_EN.kinds[k]);
WB_EN.factionNotes = {
  kingdom_1: "Home of the game's strongest heavy cavalry, the Swadian Knight. Solid crossbow infantry too; very strong in open-field battles.",
  kingdom_2: "A balanced army: the Vaegir Marksman is one of the best archers in the game, Vaegir Guards are solid infantry, Vaegir Knights good cavalry.",
  kingdom_3: "An almost entirely mounted army: fast Khergit Horse Archers and Lancers. Weak in sieges.",
  kingdom_4: "An infantry kingdom: the Nord Huscarl is the best infantry in the game. No cavalry; very strong in sieges.",
  kingdom_5: "Infantry and crossbows: the Rhodok Sharpshooter is a superb marksman, the Rhodok Sergeant solid spear infantry. No cavalry.",
  kingdom_6: "A bit of everything: the Sarranid Mamluke is good heavy cavalry, Sarranid Guards solid infantry, archers are average.",
};
