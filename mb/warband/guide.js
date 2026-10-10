// Warband başlangıç rehberi: oyuna yeni başlayanların en çok sorduğu sorular.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "Oyunda amaç ne, ne yapmalıyım?",
    a: [
      "Warband'de tek bir hikâye yok; Calradia'da kendi yolunu çizersin. Altı krallık (Swadia, Vaegir, Khergit, Nord, Rhodok, Sarranid) sürekli birbiriyle savaşır.",
      "Genel gidiş şöyledir:",
      [
        "Küçük bir orduyla haydut (looter, bandit) avlayıp para ve tecrübe topla.",
        "Ordunu büyüt, yoldaş topla, ün (renown) kazan.",
        "Bir krallığa paralı asker ya da vassal (lord) olarak katıl, toprak al.",
        "İstersen kendi krallığını kur ve Calradia'yı fethet.",
      ],
    ],
    q_en: "What is the goal, what should I do?",
    a_en: [
      "Warband has no fixed story; you carve your own path in Calradia. Six kingdoms (Swadia, Vaegirs, Khergits, Nords, Rhodoks, Sarranids) are constantly at war.",
      "A typical path:",
      [
        "Hunt looters and bandits with a small party for money and experience.",
        "Grow your army, recruit companions, gain renown.",
        "Join a kingdom as a mercenary or vassal and get land.",
        "If you like, found your own kingdom and conquer Calradia.",
      ],
    ],
  },
  {
    q: "Başta nasıl para kazanırım?",
    tags: "dinar altın ekonomi",
    a: [
      [
        "Looter ve haydut grupları yen, düşen eşyaları şehirde sat.",
        "Yakaladığın esirleri tavernalardaki Ransom Broker'a sat; esir başına iyi para verir.",
        "Turnuvalara katıl ve her turda kendine bahis yap; kazanırsan büyük para ve ün gelir.",
        "Şehirlerdeki arenada dövüşerek küçük paralar ve tecrübe kazan.",
        "Para birikince bir şehirde Guild Master ile konuşup atölye (enterprise) aç; her hafta gelir getirir. Dyeworks (boyahane) çoğu şehirde en kârlısıdır, ama kâr şehre göre değişir; açmadan önce gösterilen tahmini kâra bak.",
        "Köylerde ucuz olan ürünleri (tahıl, tuz, keten…) pahalı olduğu şehirde satarak ticaret yapabilirsin.",
      ],
    ],
    q_en: "How do I make money early on?",
    a_en: [
      [
        "Defeat looters and bandits and sell their loot in towns.",
        "Sell captured prisoners to the Ransom Broker in taverns.",
        "Join tournaments and bet on yourself each round.",
        "Fight in town arenas for small rewards and experience.",
        "Once you have money, talk to a Guild Master and open a workshop (enterprise) for weekly income. Dyeworks are often the most profitable, but it depends on the town; check the estimated profit first.",
        "Trade goods that are cheap in villages and expensive in towns.",
      ],
    ],
  },
  {
    q: "Asker nereden toplanır, ordum neden büyümüyor?",
    tags: "birlik recruit ordu boyutu party size leadership",
    a: [
      "Askerleri köylerden toplarsın (köyde “Recruit Volunteers”). Köyle ilişkin iyiyse daha çok gönüllü çıkar; köylere yardım eden görevler ilişkiyi artırır. Tavernalarda paralı askerler de bulunur.",
      "Ordunun en fazla kaç kişi olabileceğini Leadership becerisi, Charisma ve ünün (renown) belirler. Leadership'e puan vermek ordu sınırını en hızlı büyüten yoldur; ayrıca maaşları azaltır ve moral verir.",
      "Askerler savaşta tecrübe kazanınca ordu ekranından (Party) para karşılığı yükseltilir. Hangi birliğin neye yükseldiğini Krallıklar sayfasında görebilirsin.",
    ],
    q_en: "Where do I recruit troops, why can't my army grow?",
    a_en: [
      "Recruit volunteers in villages. Better relations with a village give more volunteers; helping villages raises relations. Taverns also have mercenaries.",
      "Your maximum party size depends on Leadership, Charisma and renown. Leadership is the fastest way to raise it, and it also lowers wages and raises morale.",
      "Troops gain experience in battle and are upgraded for money in the Party screen. See the Factions page for each troop tree.",
    ],
  },
  {
    q: "Yoldaşlar neden ordudan ayrılıyor?",
    tags: "companion hero kavga",
    a: [
      "Her yoldaş bir kişiyle iyi anlaşır, iki kişiyle anlaşamaz. Anlaşamayanları birlikte tutarsan zamanla şikâyet eder ve sonunda ayrılabilir. Ayrıca ağır kayıp, açlık, ödenmeyen maaş ya da başarısız görevler gibi davranışlardan hoşlanmazlar.",
      "Yoldaşlar sayfasındaki takım kurucuyla kavga etmeyecek bir grup seçebilirsin.",
    ],
    q_en: "Why do my companions leave?",
    a_en: [
      "Each companion likes one companion and dislikes two. Keeping rivals together causes complaints and they may eventually leave. They also dislike things like heavy losses, hunger, unpaid wages or failed quests.",
      "Use the party builder on the Companions page to pick a group that won't fight.",
    ],
  },
  {
    q: "Hangi becerilere puan vermeliyim? Yoldaşların becerileri işe yarıyor mu?",
    tags: "skill beceri party surgery trainer",
    a: [
      "Surgery, Wound Treatment, First Aid, Pathfinding, Tracking, Spotting, Engineer ve Tactics gibi ordu becerilerinde (party skill) ordudaki en yüksek kişinin seviyesi kullanılır. Bu yüzden bu becerileri birer yoldaşa verip kendi puanlarını savaş ve liderliğe harcamak çok verimlidir.",
      "Leadership ve Prisoner Management ise yalnızca senin (oyuncunun) seviyene bakar.",
      "Trainer (eğitmenlik) herkes için ayrı çalışır: becerisi olan her kahraman, ordudaki daha düşük seviyeli askerlere her gün tecrübe verir.",
      "Surgery özellikle değerlidir: savaşta düşen askerlerinin ölmek yerine yaralı kalma şansını artırır. Jeremus bu iş için en iyi yoldaştır.",
    ],
    q_en: "Which skills should I raise? Do companion skills matter?",
    a_en: [
      "For party skills such as Surgery, Wound Treatment, First Aid, Pathfinding, Tracking, Spotting, Engineer and Tactics, the best value in your party is used. Give these to companions and spend your own points on combat and leadership.",
      "Leadership and Prisoner Management only use your own level.",
      "Trainer works for every hero separately: each one gives daily experience to lower-level troops.",
      "Surgery is especially valuable: it raises the chance that downed troops are wounded instead of killed. Jeremus is the best companion for it.",
    ],
  },
  {
    q: "Nasıl lord (vassal) olur, toprak alırım?",
    tags: "vassal fief toprak kral",
    a: [
      "Önce bir krallığa paralı asker (mercenary) olabilirsin: savaşan bir krallığın lordlarıyla konuşunca teklif gelir. Paralı asker olarak savaştıkça ün ve kralla ilişki artar.",
      "Yeterince ün kazanınca kral seni vassal yapmayı teklif eder ya da sen kralla konuşup bağlılık yemini edebilirsin. Vassal olunca sana bir köy verilir; kale ve şehir fethettikçe başka topraklar da isteyebilirsin.",
      "Topraklarından vergi gelir ve oradan asker toplayabilirsin. Lordlarla ilişkilerin kral seçimlerinde ve toprak dağıtımında önemlidir.",
    ],
    q_en: "How do I become a vassal and get land?",
    a_en: [
      "First you can become a mercenary for a kingdom at war; its lords will offer a contract. Fighting as a mercenary raises renown and your relation with the king.",
      "With enough renown the king offers vassalage, or you can ask him to swear allegiance. You receive a village, and you can request castles and towns as they are conquered.",
      "Fiefs give tax income and recruits. Your relations with other lords matter when land is handed out.",
    ],
  },
  {
    q: "Kendi krallığımı nasıl kurarım?",
    tags: "krallık kral right to rule pretender",
    a: [
      "Hiçbir krallığa bağlı değilken bir kale ya da şehri ele geçirip kendi adına tutarsan kendi krallığını kurmuş olursun. Bundan sonra tüm krallıklar sana karşı savaşabilir, o yüzden önce güçlü bir ordu ve iyi bir savunma lazım.",
      "Right to Rule (yönetme hakkı) değerin düşükse lordlar sana katılmak istemez. Yoldaşlarını elçi (emissary) olarak göndererek bu değeri artırabilirsin.",
      "Diğer yol: tavernalarda tahta hak iddia eden birini (pretender) bulup ona yardım etmek; kazanırsan onun krallığında güçlü bir lord olursun.",
      "Kendi krallığında “Soylu” yazan yoldaşlarına toprak verip onları lord yapabilirsin.",
    ],
    q_en: "How do I found my own kingdom?",
    a_en: [
      "While not sworn to anyone, capture a castle or town and keep it for yourself. Expect wars with every kingdom, so prepare a strong army first.",
      "If your Right to Rule is low, lords won't join you. Send companions as emissaries to raise it.",
      "Alternatively, find a pretender in a tavern and help them claim the throne.",
      "In your own kingdom you can grant land to companions marked “Noble” and make them lords.",
    ],
  },
  {
    q: "Nasıl evlenirim?",
    tags: "evlilik lady kadın şiir",
    a: [
      "Kale ve şehirlerde yaşayan hanımlara (lady) kur yapabilirsin. Ziyaret edip konuşur, tavernalarda gezen ozanlardan öğrendiğin şiirleri okursun; ilişki yeterince iyi olunca evlilik teklif edebilirsin. Hanımın babası ya da velisi olan lordun izni de gerekir ve yeterli ünün olmalı.",
      "Daha hızlı yol: bir lordla ilişkin iyiyse kızıyla ya da kız kardeşiyle evlenmek için doğrudan ondan izin isteyebilirsin.",
      "Kadın karakterle oynuyorsan lordlar sana kur yapabilir.",
    ],
    q_en: "How do I get married?",
    a_en: [
      "Court ladies living in castles and towns: visit them and recite poems learned from travelling poets in taverns. With a good relation you can propose; her father or guardian must approve, and you need enough renown.",
      "Faster: if a lord likes you, ask him directly for the hand of his daughter or sister.",
      "Playing a female character, lords may court you.",
    ],
  },
  {
    q: "Savaşta askerlerime nasıl emir veririm?",
    tags: "komut tuş klavye f1 f2 f3",
    a: [
      "Sayı tuşlarıyla grup seçersin (1 piyade, 2 nişancılar, 3 süvari; 0 herkes). Sonra F tuşlarıyla emir verirsin:",
      [
        "F1 → F1: Bu konumu tut (baktığın yere giderler).",
        "F1 → F2: Beni takip et.",
        "F1 → F3: Hücum.",
        "F1 → F4: Olduğun yerde dur.",
        "F3 menüsünde ateş emirleri vardır (serbest ateş ya da ateşi kes).",
      ],
      "İyi bir başlangıç: piyadeyi ve okçuları bir tepeye yerleştir (F1 → F1), süvariyle düşmanın yanına dolan.",
    ],
    q_en: "How do I give orders in battle?",
    a_en: [
      "Pick a group with number keys (1 infantry, 2 archers, 3 cavalry; 0 everyone), then give orders with the F keys:",
      ["F1 → F1: Hold this position.", "F1 → F2: Follow me.", "F1 → F3: Charge.", "F1 → F4: Stand ground.", "The F3 menu has firing orders (fire at will / hold fire)."],
      "A good start: put infantry and archers on a hill (F1 → F1) and flank with cavalry.",
    ],
  },
  {
    q: "Ordumun morali neden düşüyor?",
    tags: "moral yemek food",
    a: [
      [
        "Yiyecek çeşidi moral verir: ordunun envanterinde farklı yiyecekler (ekmek, et, peynir…) taşı.",
        "Kazanılan savaşlar moral verir, kaçmak ve ağır kayıplar düşürür.",
        "Leadership becerisi morali artırır; ordu kalabalıklaştıkça moral düşer.",
        "Yiyecek biterse moral hızla çöker ve askerler kaçar.",
      ],
    ],
    q_en: "Why is my party morale dropping?",
    a_en: [
      [
        "Food variety raises morale: carry different foods (bread, meat, cheese…).",
        "Victories raise morale; retreating and heavy losses lower it.",
        "Leadership raises morale; very large parties lower it.",
        "Running out of food crashes morale and troops desert.",
      ],
    ],
  },
  {
    q: "Kale ya da şehir nasıl kuşatılır?",
    tags: "kuşatma siege engineer",
    a: [
      "Kalenin yanına gelip kuşatma başlatırsın. Saldırı için merdiven ya da kuşatma kulesi hazırlanır; bu birkaç gün sürer ve Engineer becerisi süreyi kısaltır. İstersen beklemeye devam ederek savunanları aç bırakabilirsin.",
      "Kuşatmada piyade ve nişancılar çok önemlidir; süvari surlarda pek işe yaramaz. Nord ve Rhodok piyadeleri kuşatmada çok iyidir.",
    ],
    q_en: "How do I besiege a castle or town?",
    a_en: [
      "Start a siege next to it. Ladders or a siege tower are built over a few days; the Engineer skill shortens this. You can also wait to starve the defenders.",
      "Infantry and ranged troops matter most in sieges; cavalry is weak on walls. Nord and Rhodok infantry excel here.",
    ],
  },
  {
    q: "Esirleri ne yapmalıyım?",
    tags: "prisoner esir ransom",
    a: [
      "Esirleri tavernalardaki Ransom Broker'a satabilirsin. Kaç esir taşıyabileceğini Prisoner Management becerin belirler.",
      "Esirleri ordu ekranından kendi birliğine katmaya da ikna edebilirsin, ama yeni katılanların morali düşük olur.",
      "Yakaladığın lordları ancak ateşkes ya da fidye ile bırakabilirsin; onları serbest bırakmak ilişkini artırır.",
    ],
    q_en: "What should I do with prisoners?",
    a_en: [
      "Sell them to the Ransom Broker in taverns. Prisoner Management sets how many you can hold.",
      "You can also persuade prisoners to join you in the Party screen, but they start with low morale.",
      "Captured lords can be ransomed or released; releasing them improves your relation.",
    ],
  },
]);
