// The Witcher 3: Türkçe metinler. Yer, canavar, yağ, işaret (sign) ve bomba adları oyundaki gibi İngilizce kalır.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const W3_TR = {
  regions: {
    white_orchard: "White Orchard",
    velen: "Velen ve Novigrad",
    skellige: "Skellige Adaları",
    kaer_morhen: "Kaer Morhen",
    toussaint: "Toussaint (Blood and Wine)",
  },
  // Harita işaret türleri: ad, kısa açıklama ve renk grubu.
  categories: {
    signpost: { name: "Tabela (hızlı yolculuk)", note: "Keşfedilen tabelalar arasında hızlı yolculuk yapabilirsin.", group: "travel" },
    harbor: { name: "Liman", note: "Tekneyle ya da hızlı yolculukla ulaşılabilen liman.", group: "travel" },
    entrance: { name: "Mağara girişi", note: "Mağara ya da yer altı girişi.", group: "travel" },
    pop: { name: "Güç yeri (Place of Power)", note: "Etkinleştirince kalıcı 1 yetenek puanı ve kısa süreli işaret (sign) güçlendirmesi verir.", group: "power" },
    monsternest: { name: "Canavar yuvası", note: "Grapeshot ya da Dancing Star bombasıyla yok edilir; yok edince bölge temizlenir.", group: "danger" },
    monsterden: { name: "Canavar ini", note: "Canavarların yaşadığı tehlikeli bölge.", group: "danger" },
    banditcamp: { name: "Haydut kampı", note: "Haydutlar temizlenince çoğu zaman bir hazine ya da tüccar açılır.", group: "danger" },
    guarded: { name: "Korunan hazine", note: "Güçlü bir canavarın koruduğu değerli sandık.", group: "treasure" },
    hidden: { name: "Gizli hazine", note: "Witcher duyularıyla (Witcher Senses) bulunan saklı hazine.", group: "treasure" },
    smugglers: { name: "Kaçakçı zulası", note: "Su altında ya da kıyıda saklanmış kaçakçı sandığı.", group: "treasure" },
    spoils: { name: "Savaş ganimeti", note: "Savaş alanında yağmalanabilecek eşyalar.", group: "treasure" },
    abandoned: { name: "Terk edilmiş yer", note: "Canavarları temizleyince köylüler geri döner ve yeni tüccarlar açılabilir.", group: "danger" },
    pid: { name: "Zor durumdaki kişi", note: "Yardım bekleyen biri; çoğu zaman küçük bir görev ya da ödül.", group: "quest" },
    kid: { name: "Zor durumdaki şövalye", note: "Toussaint'te yardım bekleyen bir şövalye.", group: "quest" },
    notice: { name: "İlan panosu", note: "Canavar sözleşmeleri (contract) ve yan görevler buradan alınır.", group: "quest" },
    poi: { name: "Önemli yer", note: "Özel eşya, witcher okulu çizimi ya da ilginç bir yer.", group: "power" },
    blacksmith: { name: "Demirci", note: "Silah yapar ve onarır; usta demirciler daha iyi çizimleri yapabilir.", group: "service" },
    armourer: { name: "Zırhçı", note: "Zırh yapar ve onarır; usta zırhçılar daha iyi çizimleri yapabilir.", group: "service" },
    armourerstable: { name: "Zırhçı tezgâhı", note: "Zırhını kısa süre güçlendirir.", group: "service" },
    grindstone: { name: "Bileği taşı", note: "Kılıcını kısa süre güçlendirir.", group: "service" },
    alchemy: { name: "Simya malzemecisi", note: "Simya malzemeleri satar.", group: "service" },
    herbalist: { name: "Aktar (herbalist)", note: "Bitki ve simya malzemeleri satar.", group: "service" },
    shopkeeper: { name: "Tüccar", note: "Çeşitli eşyalar alır ve satar.", group: "service" },
    innkeep: { name: "Hancı", note: "Yiyecek, içecek ve çoğu zaman Gwent kartları satar.", group: "service" },
    gwent: { name: "Gwent oyuncusu", note: "Gwent oynayıp yeni kartlar kazanabilirsin.", group: "service" },
    barber: { name: "Berber", note: "Saç ve sakal modelini değiştirebilirsin.", group: "service" },
    brothel: { name: "Genelev", note: "", group: "service" },
    hansebase: { name: "Hanse üssü", note: "Toussaint'te bir haydut grubunun üssü.", group: "danger" },
    signalfire: { name: "İşaret ateşi", note: "", group: "travel" },
    sidequests: { name: "Yan görev", note: "", group: "quest" },
    contracts: { name: "Sözleşme", note: "Canavar avı sözleşmesi.", group: "quest" },
    vineyardinfestation: { name: "Bağ istilası", note: "Toussaint bağlarını basan canavarlar.", group: "danger" },
  },
  groups: {
    travel: { name: "Yolculuk", color: "#f2e6c9" },
    danger: { name: "Tehlike", color: "#e05252" },
    treasure: { name: "Hazine", color: "#f3c969" },
    power: { name: "Güç ve önemli yerler", color: "#5fd0c0" },
    quest: { name: "Görev ve insanlar", color: "#c98ad6" },
    service: { name: "Tüccar ve hizmetler", color: "#5b9bd5" },
  },
  classes: {
    Necrophage: "Leş yiyenler",
    Insectoid: "Böcekler",
    Hybrid: "Melezler",
    Draconid: "Ejderhamsılar",
    "Cursed One": "Lanetliler",
    Relict: "Kadim yaratıklar",
    Ogroid: "Devler (ogroid)",
    Specter: "Hayaletler",
    Elementa: "Elementler",
    Vampire: "Vampirler",
    Beast: "Hayvanlar",
    Griffin: "Grifonlar",
  },
};

const W3_EN = {
  groups: { travel: "Travel", danger: "Danger", treasure: "Treasure", power: "Power and points of interest", quest: "Quests and people", service: "Merchants and services" },
};

// Zayıflık türü: yağ, işaret (sign), bomba, iksir ya da kılıç.
const SIGNS = ["Aard", "Igni", "Yrden", "Quen", "Axii"];
const BOMBS = ["Grapeshot", "Moon Dust", "Devil's Puffball", "Dimeritium bomb", "Northern wind", "Samum", "Dancing Star", "Dragon's Dream"];
const POTIONS = ["Golden Oriole", "Black Blood", "White Honey", "Reinald's Philter"];
function weakKind(w) {
  if (/oil$/i.test(w)) return "oil";
  if (SIGNS.includes(w)) return "sign";
  if (BOMBS.some((b) => b.toLowerCase() === w.toLowerCase())) return "bomb";
  if (POTIONS.includes(w)) return "potion";
  if (/sword/i.test(w)) return "sword";
  return "other";
}
const WEAK_KINDS = {
  oil: ["Yağ", "Oil"],
  sign: ["İşaret (sign)", "Sign"],
  bomb: ["Bomba", "Bomb"],
  potion: ["İksir", "Potion"],
  sword: ["Kılıç", "Sword"],
  other: ["Diğer", "Other"],
};
