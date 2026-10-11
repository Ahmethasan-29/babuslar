// Project Zomboid başlangıç rehberi. Sayılar oyunun varsayılan (Apocalypse) ayarlarına göredir; sandbox ayarları değiştirebilir.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "İlk gün ne yapmalıyım?",
    tags: "başlangıç ilk gün day one",
    a: [
      "Acele etme ve sessiz ol. İlk saatlerde yapılacaklar:",
      [
        "Başladığın evi ara: mutfaktaki yiyecek ve içecekleri, aletleri (çekiç, tornavida), çantaları al.",
        "Kendine bir silah bul: tava, oklava, beyzbol sopası bile olur. İlk fırsatta balta ya da levye (crowbar) ara.",
        "Gece dışarı çıkma; pencerelerin perdelerini kapat, ışığı az kullan.",
        "Koşmak yerine yürü ya da eğilerek ilerle (Sneak): zombiler gürültü ve görüşle seni fark eder.",
        "Su musluktan akarken şişe, tencere, kova gibi her şeyi doldur; ileride su kesilecek.",
      ],
      "Kısa vadeli amaç: güvenli bir ev, birkaç günlük yiyecek-su ve sağlam bir silah.",
    ],
    q_en: "What should I do on day one?",
    a_en: [
      "Take it slow and stay quiet:",
      [
        "Loot your starting house: food and drink, tools (hammer, screwdriver), bags.",
        "Find a weapon: even a frying pan or baseball bat. Look for an axe or crowbar as soon as you can.",
        "Don't go out at night; close curtains and keep lights low.",
        "Walk or sneak instead of running: zombies notice you by noise and sight.",
        "While the tap still works, fill every bottle, pot and bucket; the water will shut off.",
      ],
      "Short-term goal: a safe house, a few days of food and water, and a solid weapon.",
    ],
  },
  {
    q: "Hangi kasabada başlamalıyım?",
    tags: "spawn başlangıç noktası muldraugh riverside rosewood louisville west point",
    a: [
      "Yeni başlayanlar için en kolayları Muldraugh, Rosewood ve Riverside: küçük, zombi sayısı makul, ganimet yeterli.",
      "West Point ve March Ridge daha kalabalık; Louisville haritanın en büyük şehri, ganimeti çok ama zombisi de çok, yeni başlayanlara önerilmez.",
      "Kasabaların yerini ve tanıtımlarını Harita sayfasında görebilirsin.",
    ],
    q_en: "Which town should I start in?",
    a_en: [
      "Easiest for beginners: Muldraugh, Rosewood and Riverside: small, manageable zombies, enough loot.",
      "West Point and March Ridge are busier; Louisville is the biggest city with the best loot and the most zombies, not for beginners.",
      "See where each town is on the Map page.",
    ],
  },
  {
    q: "Isırıldım ya da çizildim, ne olacak? (enfeksiyon)",
    tags: "ısırık bite scratch çizik yara enfeksiyon knox infection zombileşme",
    a: [
      "Varsayılan ayarlarda zombi yarası şu ihtimallerle Knox enfeksiyonu bulaştırır:",
      ["Çizik (scratch): %7", "Derin kesik (laceration): %25", "Isırık (bite): %100 — tedavisi yok."],
      "Enfeksiyon kapınca karakter birkaç gün içinde ölür ve zombiye dönüşür. Isırılmadıysan yarayı hemen temizle ve sar; normal yara enfeksiyonu (kirli yara) ayrı bir şeydir ve dezenfektanla geçer.",
      "Kalın giysiler (deri ceket, kot) ısırık ve çizik ihtimalini azaltır.",
    ],
    q_en: "I got bitten or scratched, what happens?",
    a_en: [
      "With default settings a zombie wound gives the Knox infection with these chances:",
      ["Scratch: 7%", "Laceration: 25%", "Bite: 100% — no cure."],
      "Once infected, the character dies within a few days and turns. Clean and bandage wounds right away; ordinary wound infection (dirty wound) is different and is treated with disinfectant.",
      "Thick clothes (leather jacket, jeans) reduce bite and scratch chances.",
    ],
  },
  {
    q: "Su ve elektrik ne zaman kesilir?",
    tags: "su elektrik kesinti water electricity shutoff jeneratör yağmur",
    a: [
      "Varsayılan ayarlarda ilk ay içinde rastgele bir günde önce biri, sonra öbürü kesilir. Hazırlık:",
      [
        "Kesilmeden önce bütün kapları suyla doldur.",
        "Yağmur suyu varili (rain collector barrel) kur; suyu içmeden önce kaynat.",
        "Elektrik gidince buzdolabındaki yiyecekler bozulmaya başlar: önce bozulacakları ye, konserve ve kuru gıda biriktir.",
        "Jeneratörle elektrik sağlayabilirsin (kullanmayı dergiden öğrenmek gerekir); kapalı alanda çalıştırma, zehirlenirsin.",
      ],
    ],
    q_en: "When do water and power shut off?",
    a_en: [
      "With default settings, on a random day within the first month. Prepare:",
      [
        "Fill every container while the water still runs.",
        "Build a rain collector barrel; boil water before drinking.",
        "When power goes, fridge food starts rotting: eat perishables first, stock canned and dry food.",
        "A generator can restore power (you need the magazine to use it); never run it indoors.",
      ],
    ],
  },
  {
    q: "Helikopter sesi duydum, ne yapmalıyım?",
    tags: "helikopter helicopter event gürültü sürü horde",
    a: [
      "İlk günlerde bir helikopter kasabanın üstünden geçer ve oyuncuyu takip eder; gürültüsü etraftaki zombileri peşinden sürükler.",
      "Helikopter geldiğinde açık alanda kalma: bir binaya gir, saklan ve gidene kadar bekle. Zombi sürüsü dağıldıktan sonra çık.",
    ],
    q_en: "I hear a helicopter, what should I do?",
    a_en: ["In the first days a helicopter flies over and follows the player; its noise drags nearby zombies along.", "Don't stay in the open: get inside, hide and wait until it leaves and the horde disperses."],
  },
  {
    q: "Becerileri nasıl hızlı geliştiririm?",
    tags: "beceri skill kitap book dergi magazine xp seviye",
    a: [
      "Beceri kitapları (skill book) okuduğun seviye aralığında kazandığın XP'yi katlar: önce kitabı oku, sonra beceriyi kullan.",
      "Dergiler (magazine) tarif öğretir: jeneratör kullanmak, tuzak, yemek tarifleri gibi.",
      "Okumak için ışık gerekir; gündüz ya da lamba yanında oku. Fast Reader özelliği okumayı hızlandırır.",
      "Meslek ve özelliklerden gelen başlangıç seviyesi o becerideki XP kazancını da artırır (Karakter sayfasına bak).",
    ],
    q_en: "How do I level skills faster?",
    a_en: [
      "Skill books multiply the XP you earn in their level range: read first, then practice.",
      "Magazines teach recipes: generators, traps, cooking and more.",
      "You need light to read; read in daylight or by a lamp. Fast Reader speeds it up.",
      "Starting levels from occupation and traits also boost XP gain in that skill (see the Character page).",
    ],
  },
  {
    q: "Hangi silahı kullanmalıyım?",
    tags: "silah weapon balta axe levye crowbar mızrak spear ateşli silah gun",
    a: [
      "Başta yakın dövüş silahları en iyisi: ateşli silahlar çok gürültülüdür ve uzak zombileri de çeker.",
      [
        "Balta (axe): yüksek hasar, ağaç da keser.",
        "Levye (crowbar) ve beyzbol sopası: dayanıklı, kolay bulunur.",
        "Mızrak: uzun menzil, kendin yapabilirsin ama çabuk kırılır.",
      ],
      "Silahlar kullandıkça yıpranır; yedek taşı. Silahları hasara, menzile ve dayanıklılığa göre Silahlar sayfasında karşılaştırabilirsin.",
    ],
    q_en: "Which weapon should I use?",
    a_en: [
      "Melee is best early: guns are very loud and draw distant zombies.",
      ["Axe: high damage, also chops trees.", "Crowbar and baseball bat: durable and common.", "Spear: long reach, craftable but breaks quickly."],
      "Weapons wear out; carry a spare. Compare damage, range and durability on the Weapons page.",
    ],
  },
  {
    q: "Yaralanınca nasıl tedavi ederim?",
    tags: "yara tedavi bandaj kırık cam kurşun kanama sağlık health",
    a: [
      "Sağlık panelinden (H tuşu) yaraya sağ tıkla:",
      [
        "Kanama: bandajla sar; kirlenen bandajı değiştir.",
        "Derin kesik ve ısırık dışı yaralar: dezenfektan (alkol) sür, sonra sar.",
        "Yarada cam ya da kurşun varsa önce cımbızla çıkar.",
        "Kırık: atel (splint) bağla ve dinlen; iyileşmesi uzun sürer.",
      ],
      "Yemek yemek, uyumak ve dinlenmek iyileşmeyi hızlandırır.",
    ],
    q_en: "How do I treat injuries?",
    a_en: [
      "Open the health panel (H) and right-click the wound:",
      ["Bleeding: bandage it; replace dirty bandages.", "Other wounds: disinfect, then bandage.", "Glass or bullets: remove them with tweezers first.", "Fracture: apply a splint and rest; it takes long to heal."],
      "Eating, sleeping and resting speed up healing.",
    ],
  },
  {
    q: "Araba nasıl çalıştırılır?",
    tags: "araba araç vehicle anahtar key düz kontak hotwire benzin",
    a: [
      "Anahtar bazen kontakta, bazen arabanın yakınındaki evlerde ya da zombilerin üstünde olur.",
      "Anahtar yoksa düz kontak (hotwire) gerekir: Burglar mesleği bunu bilir, ya da yeterli Elektrik ve Mekanik becerisi gerekir.",
      "Benzini benzin istasyonundan doldur (elektrik varken) ya da başka arabalardan hortumla çek. Araç sesi zombileri çeker.",
    ],
    q_en: "How do I start a car?",
    a_en: [
      "Keys are sometimes in the ignition, in nearby houses or on zombies.",
      "Without keys you must hotwire: the Burglar occupation can, or you need enough Electrical and Mechanics skill.",
      "Fill up at gas stations (while power is on) or siphon from other cars. Engine noise attracts zombies.",
    ],
  },
  {
    q: "Karakterim mutsuz ya da sıkılıyor, ne yapmalıyım?",
    tags: "mutsuz depresyon sıkılma boredom unhappy moodle ruh hali",
    a: [
      "Sıkılma ve mutsuzluk zamanla depresyona döner ve her şeyi yavaşlatır.",
      ["Dergi, çizgi roman ya da kitap oku.", "Sigara içen karakter için sigara mutsuzluğu azaltır.", "Sıcak ve güzel yemek (pişmiş, baharatlı) ruh halini düzeltir.", "Televizyon ve radyo da sıkılmayı azaltır."],
    ],
    q_en: "My character is bored or unhappy, what do I do?",
    a_en: ["Boredom and unhappiness turn into depression and slow everything down.", ["Read magazines, comics or books.", "Smokers feel better after a cigarette.", "Good hot food helps.", "TV and radio reduce boredom."]],
  },
]);
