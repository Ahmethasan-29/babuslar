// Darkest Dungeon metinlerinin Türkçesi (Babuşlar için çevrildi). Kahraman, boss, beceri ve eşya adları
// ile oyun terimleri (Stun, Bleed, PROT…) oyundaki gibi İngilizce bırakıldı.
const DKD_TR = {
  heroes: {
    Abomination: {
      quote: "İşkence görmüş ve içine kapanık… Bu adam göründüğünden daha tehlikeli…",
      style: "Sayısız yıl boyunca dövülmüş, dağlanmış ve hapsedilmiş bu tedirgin serseri korkunç bir sır saklıyor. Damarlarında dolaşan Eldritch zehri ona tarifsiz bir güç verdi, ama ağır bir bedelle. Bedeni değiştikçe savaştaki rolü de değişir!",
    },
    Antiquarian: {
      quote: "Başkalarının gitmediği yerlerde arar, başkalarının görmediğini görür.",
      style: "Bir bilgin, araştırmacı ve hevesli bir arkeolog olan Antiquarian savaşa pek uygun değildir. Ama kendini korumakta ustadır: savaşta ortadan kaybolarak ya da bir dostundan onu korumasını isteyerek hayatta kalır. Doğrudan savaş kaçınılmazsa patlayıcı buhurdanlığıyla dostlarını iyileştirip canlandırabilir… ve saldırganları zehirleyebilir.",
    },
    Arbalest: {
      quote: "Ateş et, sar, yağmala: savaşın dans adımları!",
      style: "Kaçaklıktan askerliğe geçen Arbalest, arka safların en iyi savaşçısıdır. Düşmana bastırıcı ateş yağdırabilir, önemli hedefleri uzaktan vurabilir ve çok etkili ilk yardım yapabilir; o bir toplanma noktası, bir taret, karanlıkta bir işaret fişeğidir.",
    },
    "Bounty Hunter": {
      quote: "Avın heyecanı… Ödülün vaadi…",
      style: "Tek hedefi acımasızca bitiren ve kalabalığı kontrol eden bir uzman. Bounty Hunter için plan her şeydir: hedefleri Mark ile işaretleyip ek hasar ver ya da sersemlemiş bir düşmanı fırsat bilip bitir. Kancası, flaş bombaları ve güçlü aparkatıyla düşman dizilimini de altüst edebilir.",
    },
    Crusader: {
      quote: "Kutsal bir amaca bağlı güçlü bir kılıç kolu: gayretli bir savaşçı!",
      style: "Savaşta pişmiş ve sarsılmaz Crusader yüz kutsal savaşta ön safları tuttu. Ya haklı bir öfkeyle düşmanlara doğrudan saldırır ya da güçlü savunma güçlendirmeleri ve ara iyileştirmeleriyle yakın dövüşte destek rolü üstlenir.",
    },
    Duelist: {
      quote: "Kusursuzluk, meç'in ucunda kötücül bir parıltıyla parlar.",
      style: "Kılıç ustası Duelist, duruşlar arasında ölümcül bir hassasiyetle dans eder. Savunma duruşu her düşman saldırısını bir fırsata çevirir, saldırı duruşu ise yıkıcı darbe yağmurları indirir. En büyük silahları doğru zamanlama ve öngörüdür.",
    },
    Flagellant: {
      quote: "Bedeli ödeyecek dayanıklılığa sahip olanlar için Kan'da güç vardır.",
      style: "Flagellant, kilisenin içindeki aşırı bir hizbe aittir ve genelde korku, hayranlık ve tiksintiden oluşan zehirli bir karışımla karşılanır. Şehitlikten aldığı güç ne kadar etkiliyse o kadar da rahatsız edicidir: bir an iyileştiren bir pınar, sonraki an korkunç bir öfkenin kanalıdır. Tam gücüne ancak deliliğin… ya da ölümün eşiğinde ulaşır.",
    },
    "Grave Robber": {
      quote: "Keskin gözlüler için altın, bir hançer ucu gibi parlar.",
      style: "Grave Robber çok yönlü ve çevik bir savaşçıdır; saflar arasında kolayca ileri geri gider. Uyarmadan saldırır, gölgelere çekilip saldırısını uzaktan sürdürür. Fırlatma hançerleri ve zehirli okları yetmezse güçlenerek yakın dövüşe döner ve kazmasını savurur!",
    },
    Hellion: {
      quote: "Barbar öfke ve dinmeyen vahşet güçlü bir müttefik yapar.",
      style: "Vahşi, öngörülemez ve tamamen acımasız Hellion kan dökülmesinden zevk alır! Dev glaive'i ona savaşta etkileyici bir menzil verir, jilet gibi keskin ucu düşmanlarda kalıcı yaralar bırakır. Çok yönlü ve yılmaz; kılıcıyla arka sırayı da vurabilir. Ancak bazı becerileri onu tüketir ve yeniden savaşa atılmadan önce bir tur adrenalinini toplaması gerekebilir.",
    },
    Highwayman: {
      quote: "Yakalanmaz, sıyrılır, ısrarcıdır: bir haydut için doğru meziyetler.",
      style: "Bir haydut, bir kabadayı ve bir hırsız olan Highwayman, hançer ve çakmaklı tabancadaki ustalığını yıkıcı bir etkiye dönüştürmüştür. Uzaktan da yakından da düşmanlarını aynı etkinlikle bitirir. Saçma atışıyla alan hasarı ya da tek hedefe Bleed; Highwayman'in becerileri tamamen farklı yollarla hasar vermeye odaklanır.",
    },
    Houndmaster: {
      quote: "Bir kanun adamı ve sadık hayvanı: savaş ve kanla dövülmüş bir bağ.",
      style: "Sert ama alışılmadık derecede merhametli eski bir kanun adamı olan Houndmaster ve sadık kurt köpeği, düşmanları yere sermek ve masumları korumak için birlikte çalışır. Arka saflarda pusuya yatar, Bleed'li saldırılar, gıcırdayan dişler ve sersemletici darbelerle fırlarlar. Savaşın gidişatı değişirse zayıfları koruyup stresli dostları toparlayarak zor durumdaki takıma destek olurlar.",
    },
    Jester: {
      quote: "Sonunda bile… hâlâ gülüyor olacak.",
      style: "Savaş bir güç baladıdır: yavaş bir yükseliş ve görkemli bir final! Saldırıda Jester kanlı bir kakofoniyle oradan oraya sıçrar ve ön saflardaki görkemli sonu için yerini alır! Ya da geride kalıp düşmanlarını dehşete düşüren ürpertici melodiler çalar ve dostlarına güç verir.",
    },
    Leper: {
      quote: "Bu adam zorlukla varoluşun bir ve aynı şey olduğunu anlamış.",
      style: "Yıkılmış bir adam, bir savaşçı ve bir şair. Leper, dev kılıcını kaldırmadan önce kendini toplamak için bir tur verildiğinde en etkilidir. Savurduğunda ya hep ya hiçtir: ezici darbeler ve dev hasar ya da boşa giden bir ıslık. Tamamen kendi kendine yeter; travmalarla dolu hayatından güç alır ve bunu iyileşmeye, korunmaya ya da dinmeyen bir öfkeye dönüştürebilir.",
    },
    "Man-at-Arms": {
      quote: "Gençliğin ham gücü tükenmiş olabilir, ama gözleri yüz seferin sırrını saklıyor.",
      style: "Man-at-Arms savaşta pişmiş bir gazidir; emeğinin karşılığını eşit ölçüde peşini bırakmayan bir suçluluk ve soğukkanlı bir dayanıklılıkla almıştır. Sarsılmaz, buyurgan ve odaklı Man-at-Arms; topuzu, küçük kalkanı ve öfkeli savaş naralarıyla düşman hatlarını yarar.",
    },
    Musketeer: {
      quote: "Şampiyon bir nişancı: yeni türden bir meydan okumaya hevesli.",
      style: "Pek pratik deneyimi olmayan rekabetçi bir keskin nişancı olan Musketeer, düşmanlar uzakta kaldığında parlar. Şaşmaz gözü ve alışkın olduğu hızlı dolumu onu güvenilir bir hasar kaynağı yapar; duman perdesi, ilk yardımı ve skeet atışı da takıma destek sağlar.",
    },
    Occultist: {
      quote: "Uçurumla savaşmak için onu tanımak gerekir.",
      style: "Kadim ve yasak bilgiler üzerine ömür boyu süren araştırmalar Occultist'in zihnini boşluğun güçlerine açtı. Güçten düşüren lanetler ve akıl almaz destek becerileri onun uzmanlığıdır. Ancak boşluk öngörülemez bir güçtür; bu yüzden becerilerin etkisi çok değişkendir ve genellikle ışık ya da stres bedeli vardır.",
    },
    "Plague Doctor": {
      quote: "Kana bulanmış savaş alanından daha iyi bir laboratuvar olur mu?",
      style: "Geride durmayı seven bir doktor, araştırmacı ve simyacı; zehirli bulutlar ve veba dolu el bombaları gibi üst üste binen zamana yayılmış hasar yetenekleriyle düşmanlarını yavaşça eritir. Destek rolünde de aynı derecede etkilidir: düşmanları kör edip şaşırtır, hasar artıran tonikler ve Bleed ile Blight için ilaçlarla takımın hayatta kalmasını güçlendirir.",
    },
    Runaway: {
      quote: "",
      style: "Yalnız bir serseri olan Runaway, ateşi hem silah hem kalkan olarak kullanır. Yanıkları sürer ve yayılır, ona zarar verecek olanları tüketir. Çevik ve becerikli; gölgelere süzülmeden önce savaş alanını alevler içinde bırakır.",
    },
    Shieldbreaker: {
      quote: "Kıvrılır, salınır: son darbeden önce avını büyüler.",
      style: "Zarafet ve öfkeden bir kum fırtınası olan Shieldbreaker saflar arasında dans ederek olağanüstü güçte hassas darbeler indirir. Zırhları parçalar, düşman dizilimini bozar ve gittiği her yerde zehrin tadını bırakır; vicdan azabı duymayan bir savaşçıdır.",
    },
    Vestal: {
      quote: "Bir savaş rahibesi: dindar ve yılmaz!",
      style: "Savaşçı rahibe savaş şevkini iyileştirme yeteneklerine, kutsal yargılara ve göz kamaştırıcı ışık patlamalarına yönlendirir. Her takımın güçlü bir omurgası olan Vestal, güçlü bir topuz darbesi ve yakın mesafe lanetleriyle ön safta da kendini koruyabilir.",
    },
  },

  bosses: {
    Ancestor: "Ancestor (Ata), Darkest Dungeon'ın hem anlatıcısı hem de son bosslarından biridir.",
    Baron: "Baron, Courtyard'daki Morbid Entertainment görevinde çıkan bir bosstur. Bu görev yalnızca Veteran seviyede sunulduğu ve Baron Endless Harvest'ta çıkmadığı için Baron'un tek bir sürümü vardır. Öldürüldüğünde bir Blueprint ve bir set trinket'ı düşürür.",
    "Barrel O' Bombs": "Vvulf'un savaşta kullandığı uçucu bombalarla ağzına kadar dolu bir varil. Dengesiz patlayıcıların vurulduğunda erken patladığı bilinir…",
    "Brigand Matchman": "Ünlü \"Brigands Brigade\"in üyelerinden Brigand Matchman, saflarının belki en zayıfı ama aynı zamanda en ölümcüsüdür. Korkunç Brigand Cannon'ı (top) yalnızca o kullanabilir; en sağlıklı takımları bile kolayca yok edebilen gümbür gümbür ateş ve ölüm saçar.",
    "Brigand Pounder": "Brigand 8/12/16-Pounder, Weald'da çıkan bir bosstur.",
    "Brigand Vvulf": "Vvulf, Hamlet'in çevresindeki insan haydutların lideridir; kasabaya özel Wolves at the Door (Kapıdaki Kurtlar) olayında karşına çıkabilir.",
    Cauldron: "Cauldron (kazan), her zaman The Hag ile birlikte karşılaşılan bir düşmandır. Büyük ölçüde edilgendir ama bu karşılaşmanın kilit parçasıdır.",
    Countess: "Countess, Courtyard'da \"Bewitching Predator\" (seviye 6, Epic) görevinde dövüşülen üçüncü ve son bosstur. Böcek benzeri bir vampir kadın olan Countess, Crimson Curse'ün kaynağıdır: Ata'nın elinde öldürülmesinin ardından bozucu kanı Ata'nın oyunlarıyla Courtyard'ın konuklarına yayıldı. Onun hayata dönüşü The Crimson Court olaylarını başlatır.",
    Crocodilian: "Crocodilian, birçok Courtyard görevinde ve Endless Harvest'ta çıkan tehlikeli bir Bloodsucker mini-bosstur.",
    "Drowned Anchorman": "Drowned Crew'un çağırdığı boğulmuş çapa adamı; 1. sıradaki kahramanı demirlemeye çalışır.",
    "Drowned Crew": "Sodden/Sunken/Drowned Crew, Cove'da çıkan bir bosstur. Crew, batık bir gemiye zincirlenmiş üç ölümsüz kaçakçıdan oluşur. En bilinen hamleleri, 1. sıradaki kahramanı demirlemeye çalışan bir Drowned Anchorman çağırmaktır. Bir kahraman demirlendiğinde, dost ya da düşman her hareket Crew'u iyileştirir ve demirlenen kahramanın stresini artırır.",
    Flesh: "Flesh, Swine Prince'ten sonra çıkan Warrens'ın ikinci bossudur. Diğer bosslar gibi üç çeşidi vardır (Inchoate, Unstable ve Formless). Her tur değişen 4 parçası vardır ve her parçanın kendi becerileri ve istatistikleri vardır. Hangi biçimde olursa olsun her parça turda yalnızca bir hareket yapar. Hepsi aynı can çubuğunu paylaşır; yani canını 0'a indirene kadar dört parça da hayatta ve etkin kalır.",
    Fracture: "Fracture, The Color of Madness DLC'sindeki Farmstead'de bulunan bir bosstur ve The Sleeper dövüşünün ilk aşamasıdır. Endless koşusunda her zaman Miller'dan sonra ikinci boss olarak çıkar; sonra dalga gruplarının sonunda rastgele yeniden karşına çıkabilir.",
    "Garden Guardian": "Garden Guardian, Courtyard'daki diğer tüm bosslar yenildikten sonra açılan bir Courtyard bossudur.",
    "Gestating Heart": "Gestating Heart, Darkest Dungeon'ın son bossunun sondan bir önceki biçimidir. ELDRITCH olarak sınıflandırılır; daha da korkunç ve akıl almaz bir biçimi kuluçkaya yatırıyormuş gibi görünen kıvranan bir dehşet kütlesidir.",
    Hag: "Wizened Hag/Hag/Hag Witch, Weald'da çıkan Human (insan) türünde bir bosstur.",
    "Heart of Darkness": "Heart of Darkness, Darkest Dungeon'ın nihai bossudur. Ata dövüşünün son aşamasıdır; Ata'nın bedeni yaratığın bu dünyaya geçmesi için bir kap olmuştur. Heart of Darkness, Darkest Dungeon'ın çok ağızlı, çok gözlü ve dokunaçlı varlıklara dönüşmüş tarikatçılarının ve rahiplerinin taptığı varlıktır.",
    "Imperfect Reflection": "Ata'nın dövüşünün ilk aşamasında çağırdığı iki kopyadan biri.",
    "Mammoth Cyst": "Mammoth Cyst, Darkest Dungeon'ın üçüncü görevinde bulunan bir mini-boss türü düşmandır. Birçok kopyası vardır, ama görevi tamamlamak için yalnızca görev nesnesini koruyanın öldürülmesi gerekir.",
    Necromancer: "Necromancer, Ruins'te çıkan Unholy/Eldritch bir bosstur. Bir zamanlar Ata ile çalışan bir bilginler heyetinin üyesiydi; ama Ata onları uykularında öldürüp sonra yeniden diriltti. Necromancer artık Ruins'te yaşıyor ve ölüleri sonsuza dek diriltiyor.",
    "Perfect Reflection": "Ata'nın dövüşünün ilk aşamasında çağırdığı iki kopyadan biri.",
    Prophet: "Prophet, Ruins'te çıkan bir bosstur ve diğer bosslar gibi üç çeşidi vardır (Sonorous, Fulminating ve Gibbering).",
    Shambler: "Shambler, zifiri karanlıkta pusuya yatan tehlikeli bir Eldritch mini-bosstur; öldürüldüğünde Ancestral (kadim) trinket'lar düşürür.",
    "Shuffling Horror": "Shuffling Horror, Darkest Dungeon'daki dört bossun ilkidir. Darkest Dungeon'ın her yanını saran eldritch, etli uzantılarla kaplanmış bir Shambler'a benzer.",
    Siren: "Captivating, Alluring ve Beguiling Siren, Cove'un ilk bossudur. Her turda 2 hamlesi vardır.",
    "Swine Prince": "Swine Prince/King/God, Warrens'ta çıkan Beast (canavar) türünde bir bosstur.",
    "Templar Impaler": "Templar Impaler, Darkest Dungeon'ın ikinci görevinde sunakları koruyan bir mini-bosstur. Her turda 2 hamle yapar; bunlardan biri genellikle Revelation saldırısıdır. Diğer hamlesini kalan saldırılarından birine harcar, hepsi aynı derecede tehlikelidir.",
    "Templar Warlord": "Templar Warlord, Darkest Dungeon'ın ikinci görevinde sunakları koruyan bir mini-bosstur. Her turda 2 hamle yapar; bunlardan biri genellikle Revelation saldırısıdır. Diğer hamlesini kalan saldırılarından birine harcar.",
    "The Collector": "The Collector, envanter en az %79 doluyken (yani 13 yuva doluysa) zorluğa göre %3, %4 ya da %5 ihtimalle çıkan Eldritch/Human bir mini-bosstur. Highwayman, Man-at-Arms ve Vestal'in \"Collected\" sürümlerini çağırabilmesiyle bilinir; özellikle Collected Highwayman oyundaki en çok hasar veren boss olmayan düşmanlardan biridir. Yenildiğinde ya bir Puzzling Trapezohedron (3.500 altın değerinde) ya da üç eşsiz ve güçlü trinket'tan birini düşürür: Dismas' Head, Barristan's Head ya da Junia's Head.",
    "The Fanatic": "The Fanatic, The Crimson Court'ta Crimson Curse'e yakalanmış kahramanları avlayabilen gezgin bir bosstur.",
    "The Shrieker": "The Shrieker, Weald'da bulunan Eldritch/Beast türünde bir olay bossudur. Genellikle takımın tamamı öldüğü için belli sayıda trinket kaybedildiğinde çıkar. Hamlet'teki envanterden de trinket çalabilir.",
    "The Sleeper": "The Sleeper, The Color of Madness DLC'sindeki Farmstead'de bulunan bir bosstur. Fracture'ın ikinci aşamasıdır ve Miller'dan sonraki dalga grubunda kesin olarak karşına çıkar.",
    "Thing from the Stars": "Thing from the Stars, The Color of Madness DLC'sinden bir Eldritch mini-bosstur. Son derece tehlikeli bir rakiptir: her turda birden çok hamlesi vardır ve büyük stres hasarı ile Blight verebilir. En çok ikinci aşamasıyla bilinir: canı azaldığında doğrudan hasara karşı çok dayanıklı hale getiren ve saldırı gücünü büyük ölçüde artıran bir dizi güçlendirme kazanır.",
    Viscount: "Viscount, Courtyard'da Served Cold (seviye 5, Epic) görevinde dövüşülen Bloodsucker bossudur.",
    Wilbur: "Wilbur, Warrens'ta her zaman Swine Prince ile birlikte dövüşülen Beast türünde bir canavar bosstur.",
  },

  items: {
    Bust: { description: "Darkest Dungeon'daki dört miras eşyası para biriminden biri." },
    Crest: { description: "Darkest Dungeon'daki dört miras eşyası para biriminden biri." },
    Deed: { description: "Darkest Dungeon'daki dört miras eşyası para biriminden biri." },
    Portrait: { description: "Darkest Dungeon'daki dört miras eşyası para biriminden biri." },
    Blueprint: { description: "Bir zamanlar gelişen Hamlet'inin bölgelerinde (District) yeni binalar kurmak için kullanılan nadir bir miras eşyası. Bosslardan düşer; ayrıca 10. haftada bir tane hediye edilir." },
    "Aegis Scale": { effect: "1 Block Aegis verir.", description: "Uzak çöllerden gelen gizemli bir pul. Güçlü bir koruma." },
    Antivenom: { effect: "Blight'ı iyileştirir", description: "Blight'lara, zehirlere ve toksinlere karşı kullan." },
    Bandage: { effect: "Bleed'i iyileştirir", description: "Kanamayı durdurmak için kullan." },
    "Dog Treats": { effect: "Güçlendirme", description: "Houndmaster ile yola çıkınca envantere kendiliğinden konur. Savaşta yenince 3 tur boyunca: +%50 DMG, +15 ACC. Yalnızca Houndmaster kullanabilir." },
    Firewood: { effect: "Kamp kurar", description: "Kamp kurmak için kullan. Satın alınamaz; keşfedilen zindanın uzunluğuna göre verilir: Kısa 0, Orta 1, Uzun 2, Yorucu 4." },
    Food: { effect: "Biraz iyileştirir", description: "Can kazanmak ve açlığı gidermek için ye." },
    "Holy Water": { effect: "Direnç güçlendirmesi", description: "Kötülüğü temizlemek ve saflığı geri getirmek için kullan. Bir kahramana uygulanınca dirençlerini artırır." },
    Laudanum: { effect: "Horror'ı iyileştirir", description: "Zihni karanlığın dehşetine karşı dayanıklı kılan yatıştırıcı bir tentür." },
    "Medicinal Herbs": { effect: "Debuff'ları kaldırır", description: "Hastalıkları ve rahatsızlıkları iyileştirmek için kullan." },
    "Shard Dust": { description: "Başka bir dünyanın gücüne erişmek için kullan, ama diğer etkilerine dikkat et. [Virtuous iken kullanılamaz]" },
    Shovel: { effect: "Engelleri kaldırır", description: "Yoldaki her engeli kaldırır." },
    "Skeleton Key": { effect: "Yalnızca curio'larda", description: "Kasaları ve kapıları açmak için kullan." },
    "The Blood": { effect: "Crimson Curse'lü kahramanlara çeşitli güçlendirmeler verir ve lanet aşamasını değiştirebilir", description: "Çağrı dinmez, istek karşı konulmazdır. Bu susuzluğu yalnızca Kan dindirir." },
    Torch: { effect: "Light +25", description: "Işık seviyesini artırır." },
  },
};
