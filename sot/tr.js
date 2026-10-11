// Sea of Thieves: Türkçe metinler. Ada, bölge, şirket ve eşya adları oyundaki gibi İngilizce kalır.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const SOT_TR = {
  regions: {
    "The Shores of Plenty": { color: "#6fdc8c", tr: "Bereketli Kıyılar (kuzeybatı)" },
    "The Ancient Isles": { color: "#ffd166", tr: "Kadim Adalar (güneybatı/orta)" },
    "The Wilds": { color: "#9b8cff", tr: "Vahşi Topraklar (kuzeydoğu)" },
    "The Devil's Roar": { color: "#ff6b6b", tr: "Şeytanın Kükreyişi (güneydoğu, volkanik)" },
    "The Devil's Shroud": { color: "#aaaaaa", tr: "Şeytanın Örtüsü (harita kenarı)" },
    "": { color: "#cfd8dc", tr: "Bölgesiz" },
  },
  kinds: {
    large: ["Büyük ada", "Large island"],
    small: ["Küçük ada", "Small island"],
    outpost: ["Karakol (outpost)", "Outpost"],
    seapost: ["Seapost (dükkân)", "Seapost"],
    fortress: ["Kale (fort)", "Fortress"],
    seafort: ["Deniz kalesi (sea fort)", "Sea fort"],
    shrine: ["Siren tapınağı (shrine)", "Siren shrine"],
    other: ["Özel yer", "Special place"],
  },
  // Harita işaretinin biçimi
  kindSize: { large: "town", small: "pin", outpost: "castle", seapost: "castle", fortress: "castle", seafort: "castle", shrine: "pin", other: "town" },
  kindNote: {
    large: ["Büyük adalarda mağaralar, eski yerleşim kalıntıları ve bilmece haritası (riddle map) hedefleri bulunur.", "Large islands have caves, old ruins and are the only riddle map targets."],
    small: ["Küçük ada: hızlı hazine aramaları ve dinlenme için.", "Small island: quick treasure digs and resupply."],
    outpost: ["Karakol: ticaret şirketlerinin temsilcileri burada; ganimet satılır, görev alınır, gemi onarım malzemesi (tahta, gülle, muz) alınır.", "Outpost: trading company reps are here; sell loot, take voyages and buy supplies (planks, cannonballs, bananas)."],
    seapost: ["Seapost: denizde küçük dükkân; balık ve et satılır, malzeme alınır.", "Seapost: a small shop at sea; sell fish and meat, buy supplies."],
    fortress: ["Kale (Skeleton Fort): iskelet dalgalarını temizleyince anahtarla hazine odası açılır.", "Skeleton fort: clear the waves to unlock the vault with the key."],
    seafort: ["Deniz kalesi: içindeki iskeletleri temizle, hazine odasının anahtarını bul.", "Sea fort: clear the skeletons inside and find the vault key."],
    shrine: ["Siren tapınağı: su altında; bulmacaları çözüp hazine toplanır (dalış gerekir).", "Siren shrine: underwater; solve puzzles and collect treasure (diving needed)."],
    other: ["", ""],
  },
  animals: { chicken: "Tavuk", pig: "Domuz", snake: "Yılan" },
};

// Ticaret şirketleri ve ne satın aldıkları.
const SOT_COMPANIES = [
  {
    name: "Gold Hoarders",
    color: "#ffd166",
    tr: "Hazine avcıları. X işaretli haritalar ve bilmece haritalarıyla gömülü hazine sandıkları aratır.",
    en: "Treasure hunters. Send you after buried chests with X-marks-the-spot and riddle maps.",
    buys: ["Hazine sandıkları (chest)", "Değerli taşlar ve süs eşyaları (gem, trinket)"],
    buys_en: ["Treasure chests", "Gems and trinkets"],
    where: ["Her karakolda (outpost)", "At every outpost"],
  },
  {
    name: "Order of Souls",
    color: "#c9a0ff",
    tr: "Ruh tacirleri. Lanetli iskelet kaptanlarını avlatır, kafataslarını satın alırlar.",
    en: "Mystics who send you to hunt cursed skeleton captains and buy their skulls.",
    buys: ["İskelet kafatasları (skull)"],
    buys_en: ["Skeleton skulls"],
    where: ["Her karakolda", "At every outpost"],
  },
  {
    name: "Merchant Alliance",
    color: "#6fdc8c",
    tr: "Tüccarlar. Hayvan yakalama ve kargo teslimat görevleri verir; zamanında teslim etmek önemli.",
    en: "Traders who give animal-catching and cargo delivery jobs; deliver on time.",
    buys: ["Tavuk, domuz, yılan (kafeste)", "Kargo kasaları (ipek, çay, şeker, baharat…)", "Ticaret ürünleri"],
    buys_en: ["Chickens, pigs, snakes (in cages)", "Cargo crates (silk, tea, sugar, spice…)", "Trade goods"],
    where: ["Her karakolda", "At every outpost"],
  },
  {
    name: "Reaper's Bones",
    color: "#ff6b6b",
    tr: "Korsan avcısı şirket. Emissary bayrakları ve diğer gemilerden çalınan ganimet için en iyi fiyatı verir.",
    en: "The pirate-hunting company. Best prices for emissary flags and loot stolen from other ships.",
    buys: ["Emissary bayrakları", "Reaper's Chest ve Reaper's Bounty", "Her türlü ganimet (çoğu zaman daha düşük fiyata)"],
    buys_en: ["Emissary flags", "Reaper's Chests and Bounties", "Any loot (often at lower prices)"],
    where: ["The Reaper's Hideout (I-12)", "The Reaper's Hideout (I-12)"],
  },
  {
    name: "Hunter's Call",
    color: "#4fc3f7",
    tr: "Balıkçılar ve avcılar. Balık, hayvan eti ve deniz canavarı eti alırlar.",
    en: "Fishers and hunters. Buy fish, meat and sea creature meat.",
    buys: ["Pişmiş ya da çiğ balık", "Hayvan ve köpekbalığı eti", "Kraken ve Megalodon eti"],
    buys_en: ["Fish", "Animal and shark meat", "Kraken and Megalodon meat"],
    where: ["Karakollar ve seapost'lar", "Outposts and seaposts"],
  },
  {
    name: "Athena's Fortune",
    color: "#7ef0d1",
    tr: "Efsane korsanların şirketi. Diğer şirketlerde yeterli seviyeye ulaşınca açılır; büyük ödüllü efsane yolculukları verir.",
    en: "The Pirate Legends' company. Unlocks after enough reputation elsewhere; gives big-reward legendary voyages.",
    buys: ["Chest of Legends ve Athena ganimeti"],
    buys_en: ["Chest of Legends and Athena loot"],
    where: ["Karakollardaki Athena temsilcisi", "Athena rep at outposts"],
  },
  {
    name: "Bilge Rats",
    color: "#ffb74d",
    tr: "Dedikodu ve etkinlik şirketi. Mevsim etkinlikleri ve Tall Tale (hikâye) görevleriyle ilgilidir.",
    en: "The gossip and events company, tied to seasonal events and Tall Tales.",
    buys: ["Etkinliklere özel ganimet"],
    buys_en: ["Event loot"],
    where: ["Karakollardaki meyhaneler", "Taverns at outposts"],
  },
];

const SOT_SHIPS = [
  { name: "Sloop", crew: "1–2", masts: 1, cannons: 2, tr: "Küçük, hızlı dönen ve tek başına ya da iki kişi oynamak için ideal gemi.", en: "Small, nimble ship for solo or duo crews." },
  { name: "Brigantine", crew: "2–3", masts: 2, cannons: 4, tr: "Orta boy; rüzgârla çok hızlı, üç kişilik ekipler için.", en: "Mid-size and very fast downwind, for crews of three." },
  { name: "Galleon", crew: "3–4", masts: 3, cannons: 8, tr: "En büyük gemi: en çok top, ama yavaş döner ve dört kişi gerektirir.", en: "The biggest ship: most cannons, but slow to turn and needs four." },
];
