// Project Zomboid: Türkçe metinler. Meslek, özellik ve eşya adlarının Türkçesi çoğunlukla oyunun resmî çevirisinden
// (data.js içinde "tr"); resmî çeviride olmayan (Build 42 ile gelen) şeyler burada.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const PZ_TR = {
  // Resmî çeviride adı olmayan meslekler
  occupations: {
    Blacksmith: ["Demirci", "Taş fırın kurabilir ve metal işleyebilir."],
    "DIY Expert": ["Kendin Yap Ustası", ""],
    Firefighter: ["İtfaiyeci", ""],
    "Fishing Guide": ["Balıkçı Rehberi", ""],
    Rancher: ["Hayvan Çiftçisi", ""],
    Tailor: ["Terzi", ""],
    Welder: ["Kaynakçı", "Toplanan hurda metalleri kaynak yapıp eşya ve barikat yapabilir."],
    // Resmî çeviride adı olan ama açıklaması olmayanlar
    Unemployed: [null, "Boştaki özellik puanlarıyla karakterini kendin kur."],
    Burglar: [null, "Araçlara düz kontak yapabilir; pencere açarken kilidi kırma ihtimali düşük."],
    Electrician: [null, "Jeneratör kullanabilir."],
    Engineer: [null, "Tuzak ve patlayıcı yapabilir. Jeneratör kullanabilir."],
    Lumberjack: [null, "Ormanda biraz daha hızlı ilerler; ağaç keserken kasları daha az yorulur."],
    Mechanic: [null, "Kentucky yollarındaki bütün araç modellerinin bakımını ve tamirini bilir."],
    "Park Ranger": [null, "Ormanda çok daha hızlı ilerler."],
  },
  // Resmî çeviride olmayan beceri adları
  skills: {
    Agriculture: "Tarım",
    "Animal Care": "Hayvan Bakımı",
    Blacksmithing: "Demircilik",
    Butchering: "Kasaplık",
    Carving: "Oymacılık",
    Knapping: "Taş Yontma",
    Masonry: "Duvarcılık",
    Running: "Koşu",
    Welding: "Kaynakçılık",
  },
  // Resmî çeviride açıklaması olmayan özellikler: [Türkçe ad, açıklama]
  traits: {
    Artisan: ["Zanaatkâr", "Çömlek ve cam işlerinde daha iyi."],
    "Baseball Player": [null, "+1 Uzun Künt (Long Blunt). Beyzbol sopası oymayı bilir."],
    "Blacksmith Knowledge": ["Demircilik Bilgisi", "Örs kullanarak metal eşyalar yapabilir."],
    Brawler: [null, "+1 Balta, +1 Uzun Künt."],
    Crafty: ["Becerikli", "Üretim (crafting) becerilerinde daha hızlı XP kazanır."],
    "Former Scout": [null, "Ateşi daha hızlı yakar."],
    Gymnast: [null, "+1 Hafif Adım (Lightfooted), +1 Çeviklik (Nimble)."],
    Hiker: [null, "+1 Toplayıcılık (Foraging), +1 Tuzak Kurma."],
    Hunter: [null, "+1 Nişancılık, +1 Kasaplık, +1 Kısa Bıçak, +1 Gizlenme, +1 İz Sürme."],
    Inventive: ["Yaratıcı", "Eşyalardan tarif öğrenmek için daha düşük beceri seviyesi yeter."],
    "Keen Cook": ["Hevesli Aşçı", "Yemek tariflerini bilir."],
    Mason: ["Duvar Ustası", "Taş ve tuğla yapılarda daha iyi."],
    Outdoorsy: ["Doğa İnsanı", "Kötü hava koşullarından daha az etkilenir."],
    Runner: [null, "+1 Koşu (Sprinting)."],
    Sewer: [null, "+1 Terzilik."],
    "Target Shooter": ["Atıcı", "+1 Nişancılık."],
    Tinkerer: ["Kurcalayıcı", "+1 Bakım (Maintenance)."],
    "Vehicle Knowledge": ["Araç Bilgisi", "Yaygın araç modellerini ve tamirlerini bilir."],
    Whittler: ["Oymacı", "Tahta ve kemikten eşyalar oyabilir."],
    Bushcrafter: ["Doğada Hayatta Kalma Uzmanı", "Şifalı bitki bulup ilaç ve lapa yapabilir, basit taş ve kemik aletler üretebilir. Ateşi daha hızlı yakar."],
    "Fast Metabolism": ["Hızlı Metabolizma", "Kilo vermeye yatkın; düşük kiloyla başlar."],
    "High Weight": ["Yüksek Kilo", "Daha yavaş koşar, dayanıklılığı düşük, sakatlanmaya yatkın."],
    "Low Weight": ["Düşük Kilo", "Güçsüz, dayanıklılığı düşük, sakatlanmaya yatkın."],
    Puny: ["Cılız", "Yakın dövüş silahlarıyla çok az geri itme; çok az taşıma kapasitesi."],
    "Reluctant Fighter": ["Gönülsüz Dövüşçü", "Dövüş becerilerinde daha yavaş XP kazanır."],
    "Short of Breath": ["Nefessiz", "Dayanıklılığı daha hızlı biter."],
    "Slow Metabolism": ["Yavaş Metabolizma", "Kilo almaya yatkın; yüksek kiloyla başlar."],
    "Very High Weight": ["Çok Yüksek Kilo", "Daha yavaş koşar, dayanıklılığı çok düşük, sakatlanmaya yatkın."],
    "Very Low Weight": ["Çok Düşük Kilo", "Çok güçsüz, dayanıklılığı çok düşük, sakatlanmaya yatkın."],
    "Ax-pert": ["Balta Ustası", "Ağaç kesmede daha iyi, balta daha hızlı sallanır."],
    Burglar: ["Hırsız", "Araçlara düz kontak yapabilir; pencere kilidini kırma şansı düşük."],
  },
  weaponCats: {
    Axes: "Balta",
    "Long blunts": "Uzun künt",
    "Short blunts": "Kısa künt",
    "Long blades": "Uzun bıçak",
    "Short blades": "Kısa bıçak",
    Spears: "Mızrak",
    Improvised: "Doğaçlama",
    Handguns: "Tabanca",
    Shotguns: "Pompalı",
    Rifles: "Tüfek",
  },
  // Kasabalar: kısa Türkçe tanıtım (oyundaki tanıtım yazılarından ve PZwiki'den özetlenmiştir).
  towns: {
    Muldraugh: "Fort Knox'un yanındaki ordu kasabası. Başlangıç için en sık önerilen yer: küçük ve sakin, büyük bir kereste deposu, motel ve okulu var.",
    Riverside: "Ohio Nehri kıyısında renkli bir kasaba. Batıda eski evler, doğuda zengin mahalleler ve bir alışveriş bölgesi.",
    "Scenic Grove Mobile Home Park": "Riverside'ın güneyinde mola yeri ve karavan parkı; başlangıç noktası olarak seçilebilir.",
    Rosewood: "Küçük ve güvenli sayılan bir kasaba; meşhur Rosewood Eyalet Hapishanesi ve itfaiye istasyonu burada.",
    "West Point": "Klasik Amerikan kasabası: meydan, dükkânlar ve kalabalık sokaklar. Ganimet bol, zombi de bol.",
    "March Ridge": "Fort Knox askerlerinin ve ailelerinin yaşadığı düzenli, çitle çevrili yerleşim.",
    Brandenburg: "Ohio Nehri kıyısında, haritanın batısında büyük bir kasaba.",
    "Bright Valley Trailer Park": "Brandenburg yakınında karavan parkı.",
    Ekron: "200'den az nüfuslu, AMZ çelik fabrikası çevresinde kurulu küçük kasaba.",
    Irvington: "Irvington Speedway yarış pistiyle ünlü kasaba; haritanın güneybatısında.",
    "Valley Station": "Louisville'e kısa bir sürüş mesafesinde, nehir kenarında sakin kırsal yerleşim.",
    Louisville: "Haritanın en büyük şehri: gökdelenler, stadyum, devasa alışveriş merkezi. Çok zengin ganimet, çok yoğun zombi; yeni başlayanlara önerilmez.",
    "Exclusion Zone border": "Louisville'in güneyindeki askerî tahliye kampı ve karantina sınırı.",
    "Burnt town": "Karantina sınırının yanında yanmış yerleşim.",
    "Echo Creek": "Çiftçilerin yaşadığı sessiz kırsal kasaba; batıda.",
    "Dixie Mobile Park": "Muldraugh ile West Point arasındaki yol üstünde mola yeri ve karavan parkı.",
    "Doe Valley": "Haritanın kuzey-ortasını kaplayan geniş tarım arazisi.",
    "Fallas Lake": "Göl kıyısında çiftçi ve balıkçı kasabası; Rosewood ile Riverside arasında.",
    "Doe Valley Forest": "Doe Valley'deki orman alanı.",
    "Abandoned town": "Terk edilmiş yapılar; kayda değer ganimet yok.",
    "Abandoned settlement": "Terk edilmiş yerleşim.",
  },
  // Başlangıç noktası olarak seçilebilen kasabalar
  spawns: ["Muldraugh", "Riverside", "Rosewood", "West Point", "March Ridge", "Brandenburg", "Echo Creek", "Ekron", "Irvington", "Louisville", "Valley Station", "Scenic Grove Mobile Home Park", "Fallas Lake"],
};

// Meslek / özellik / beceri adının Türkçesi (resmî çeviri, yoksa buradaki).
const occTr = (o) => o.tr || PZ_TR.occupations[o.name]?.[0] || null;
const occDesc = (o) => (IS_EN ? o.desc : o.descTr || PZ_TR.occupations[o.name]?.[1] || o.desc);
const traitTr = (t) => t.tr || PZ_TR.traits[t.name]?.[0] || null;
const traitDesc = (t) => (IS_EN ? t.desc : t.descTr || PZ_TR.traits[t.name]?.[1] || t.desc);
const skillTr = (s) => s.tr || PZ_TR.skills[s.skill] || s.skill;
