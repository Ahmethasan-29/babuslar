// Bannerlord başlangıç rehberi. Klan kademesi, atölye ve krallık kurma kuralları Mount & Blade Wiki'den doğrulanmıştır.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "Oyunda amaç ne, ana görevi yapmak zorunda mıyım?",
    tags: "main quest neretzes dragon banner",
    a: [
      "Bannerlord'da Calradia'da kendi klanını büyütürsün. Ana görev (Neretzes' Folly ile başlar, Dragon Banner'ı toplamaya gider) seni kendi krallığını kurmaya ya da bir krallığı desteklemeye yönlendirir, ama zorunlu değildir; istersen görmezden gelip serbest oynayabilirsin.",
      "Genel gidiş:",
      [
        "Haydut avla, turnuvalara katıl, para ve ün (renown) kazan.",
        "Yoldaş topla, ordunu büyüt, klan kademeni (clan tier) yükselt.",
        "Bir krallığa paralı asker, sonra vassal olarak katıl; kale ve şehir al.",
        "İstersen kendi krallığını kur.",
      ],
    ],
    q_en: "What is the goal? Do I have to do the main quest?",
    a_en: [
      "You grow your own clan in Calradia. The main quest (starting with Neretzes' Folly and leading to the Dragon Banner) pushes you towards founding or backing a kingdom, but it is optional; you can ignore it and play freely.",
      "A typical path:",
      ["Hunt bandits, join tournaments, earn money and renown.", "Recruit companions, grow your army, raise your clan tier.", "Join a kingdom as a mercenary, then as a vassal; get castles and towns.", "Found your own kingdom if you like."],
    ],
  },
  {
    q: "Klan kademesi (clan tier) ne işe yarar, nasıl yükselir?",
    tags: "renown ün tier",
    a: [
      "Klan kademesi ün (renown) topladıkça yükselir: savaş kazanmak, turnuva ve görevler ün verir. Her kademe yeni haklar açar:",
      [
        "Kademe 1 (50 ün): bir krallığa paralı asker olabilirsin; 2 atölye.",
        "Kademe 2 (150 ün): vassal olabilirsin; 2 ordu (party), 4 yoldaş, 3 atölye.",
        "Kademe 3 (350 ün): 3 ordu, 5 yoldaş, 4 atölye.",
        "Kademe 4 (900 ün): kendi krallığını kurabilirsin (ana görev üzerinden); 4 ordu, 7 yoldaş, 5 atölye.",
        "Kademe 5 (2350 ün) ve 6 (6150 ün): daha çok yoldaş ve atölye.",
      ],
      "Her kademede ordu boyutun da +15 artar.",
    ],
    q_en: "What does clan tier do and how do I raise it?",
    a_en: [
      "Clan tier rises with renown from battles, tournaments and quests. Each tier unlocks more:",
      [
        "Tier 1 (50 renown): join a kingdom as a mercenary; 2 workshops.",
        "Tier 2 (150): become a vassal; 2 parties, 4 companions, 3 workshops.",
        "Tier 3 (350): 3 parties, 5 companions, 4 workshops.",
        "Tier 4 (900): found your own kingdom (through the main quest); 4 parties, 7 companions, 5 workshops.",
        "Tier 5 (2350) and 6 (6150): more companions and workshops.",
      ],
      "Each tier also adds +15 party size.",
    ],
  },
  {
    q: "Başta nasıl para kazanırım?",
    tags: "dinar para atölye kervan smithing",
    a: [
      [
        "Looter ve haydut gruplarını yen, ganimetleri sat; esirleri tavernadaki Ransom Broker'a sat.",
        "Turnuvalara katıl ve kendine bahis yap; ödül olarak değerli eşyalar da kazanırsın.",
        "Demircilikte (Smithing) silah dövüp satmak çok kazandırır: eşyaları eritince yeni parçalar açılır ve daha pahalı silahlar yapabilirsin.",
        "Atölye (workshop) aç: şehirde bir atölye çalışanıyla konuşup satın alırsın. Atölyenin hammaddesini o şehre satan köy ne kadar çoksa o kadar kâr eder. Harita sayfasında bir şehre tıklayınca bağlı köylerin ürünlerine göre uygun atölyeleri görebilirsin.",
        "Kervan (caravan) kur: şehirde bir tüccarla konuşup bir yoldaşını kervan başına verirsin; şehirden şehre ticaret yapıp para getirir, ama haydutlara yakalanabilir.",
        "Ticaret: bir malı ucuz olduğu yerden alıp pahalı olduğu yerde sat; fiyatlar arz ve talebe göre değişir.",
      ],
    ],
    q_en: "How do I make money early on?",
    a_en: [
      [
        "Defeat looters and bandits, sell the loot, and sell prisoners to the Ransom Broker in taverns.",
        "Join tournaments and bet on yourself.",
        "Smithing: forge and sell weapons; smelting items unlocks new parts for pricier weapons.",
        "Open a workshop by talking to a shop worker in a town. It profits when nearby villages supply its raw material; click a town on the Map page to see which workshops fit.",
        "Start a caravan with a merchant and put a companion in charge; it trades between towns but can be raided.",
        "Trade goods from where they are cheap to where they are expensive; prices follow supply and demand.",
      ],
    ],
  },
  {
    q: "Asker nereden toplanır?",
    tags: "recruit notable köy ilişki",
    a: [
      "Köy ve şehirlerdeki önemli kişiler (notable) sana asker verir. Onlarla ilişkin ne kadar iyiyse o kadar çok asker seçeneği açılır. Görevlerini yaparak ilişkini artırabilirsin.",
      "Her kişi kendi kültürünün askerlerini verir (ör. Vlandia köyünde Vlandian Recruit). Soylu (noble) birlikler nadiren ve genelde ilişkin iyi olan kişilerden çıkar.",
      "Askerler savaşta tecrübe kazanınca ordu ekranından yükseltilir. Birlik ağaçlarını Krallıklar sayfasında görebilirsin.",
    ],
    q_en: "Where do I recruit troops?",
    a_en: [
      "Notables in villages and towns provide recruits; better relations unlock more slots. Do their quests to raise relations.",
      "Each notable gives troops of their culture. Noble troops are rare and usually come from notables who like you.",
      "Troops gain experience in battle and are upgraded in the Party screen. See troop trees on the Factions page.",
    ],
  },
  {
    q: "Yoldaşları nereden bulurum, ne işe yararlar?",
    tags: "companion wanderer rol scout surgeon quartermaster engineer",
    a: [
      "Yoldaşlar (wanderer) şehir tavernalarında bulunur; para karşılığı katılırlar. Kaç yoldaş alabileceğini klan kademen belirler.",
      "Ordunda dört rol vardır ve her birine bir yoldaş atayabilirsin:",
      [
        "Scout (gözcü): Scouting becerisiyle haritada daha uzağı görürsün.",
        "Surgeon (cerrah): Medicine becerisiyle yaralılar daha hızlı iyileşir.",
        "Engineer (mühendis): Engineering becerisiyle kuşatma aletleri daha hızlı yapılır.",
        "Quartermaster (levazımcı): Steward becerisiyle ordu sınırın artar.",
      ],
      "Yoldaşlarına ayrıca kendi ordularını kurdurabilir, kervanların ya da şehirlerinin başına koyabilirsin.",
    ],
    q_en: "Where do I find companions and what are they for?",
    a_en: [
      "Wanderers are found in town taverns and join for a fee. Your clan tier sets how many you can have.",
      "Your party has four roles, each can be given to a companion:",
      ["Scout: Scouting lets you see farther on the map.", "Surgeon: Medicine heals the wounded faster.", "Engineer: Engineering builds siege engines faster.", "Quartermaster: Steward raises your party size limit."],
      "Companions can also lead their own parties, caravans or govern your towns.",
    ],
  },
  {
    q: "Beceriler nasıl yükselir?",
    tags: "skill focus attribute perk",
    a: [
      "Bannerlord'da beceriler kullandıkça yükselir: kılıçla vurdukça One Handed, at sürdükçe Riding, ticaret yaptıkça Trade artar.",
      "Seviye atladıkça Focus ve Attribute puanı kazanırsın. Bir beceriye Focus vermek ve bağlı olduğu Attribute'u artırmak o becerinin daha hızlı yükselmesini sağlar (öğrenme sınırını artırır).",
      "Beceri belli seviyelere gelince perk seçersin; perkler birliklerine ya da sana kalıcı bonus verir.",
    ],
    q_en: "How do skills level up?",
    a_en: [
      "Skills rise by use: hitting with swords raises One Handed, riding raises Riding, trading raises Trade.",
      "Levels give Focus and Attribute points. Focus in a skill and its attribute make it learn faster (they raise the learning limit).",
      "At certain skill levels you choose perks that give lasting bonuses.",
    ],
  },
  {
    q: "Nasıl paralı asker ya da vassal olurum?",
    tags: "mercenary vassal lord fief",
    a: [
      "Klan kademen 1 olunca bir krallığın lordlarıyla konuşup paralı asker (mercenary) olabilirsin: savaştıkça ün ve para kazanırsın ama toprak alamazsın.",
      "Kademe 2'de kralla konuşup vassal olabilirsin. Vassallar fethedilen kale ve şehirlere aday olur; krallıktaki oylamalarla toprak dağıtılır. Kazandığın etki puanı (influence) oylamalarda ve politikalarda kullanılır.",
    ],
    q_en: "How do I become a mercenary or vassal?",
    a_en: [
      "At clan tier 1, talk to a kingdom's lords to become a mercenary: you earn money and renown but no land.",
      "At tier 2, talk to the ruler to become a vassal. Vassals can receive conquered castles and towns through kingdom votes; influence is spent on votes and policies.",
    ],
  },
  {
    q: "Kendi krallığımı nasıl kurarım?",
    tags: "krallık kingdom istiana arzagos dragon banner",
    a: [
      "Ana görevde Dragon Banner'ın parçalarını topladıktan sonra Istiana (İmparatorluk yanlısı) ya da Arzagos (İmparatorluk karşıtı) sana kendi krallığını kurma görevi verir. Istiana'nın görevi için şartlar:",
      ["Klan kademesi 4", "En az 100 asker", "Hiçbir krallığa bağlı olmayan bağımsız bir klan olmak", "En az bir yerleşime (kale ya da şehir) sahip olmak"],
      "Şartları sağlayınca onunla tekrar konuşursun. Krallık kurduktan sonra diğer krallıklar seninle savaşabilir; güçlü bir ordu ve sadık klanlar lazım.",
    ],
    q_en: "How do I found my own kingdom?",
    a_en: [
      "After collecting the Dragon Banner pieces in the main quest, Istiana (pro-Empire) or Arzagos (anti-Empire) gives you a quest to found your kingdom. Istiana's requirements:",
      ["Clan tier 4", "At least 100 troops", "Be an independent clan", "Own a settlement (castle or town)"],
      "Then talk to them again. Expect wars afterwards; you need a strong army and loyal clans.",
    ],
  },
  {
    q: "Nasıl evlenirim?",
    tags: "evlilik romance marriage",
    a: [
      "Soylu ailelerin evli olmayan üyeleriyle konuşup kur yapabilirsin (romance). Konuşmalarda ikna denemeleri yaparsın; başarılı olursan ailenin başıyla çeyiz/başlık pazarlığı yapılır ve evlenirsin.",
      "Evlilik klanına yeni bir üye kazandırır; eşin de ordu yönetebilir ve çocuklarınız ileride klanın parçası olur.",
    ],
    q_en: "How do I get married?",
    a_en: [
      "Talk to unmarried members of noble clans and pursue a romance through persuasion checks. If it works, you barter with the clan leader and marry.",
      "Your spouse joins your clan and can lead parties; your children later join the clan too.",
    ],
  },
  {
    q: "Savaşta askerlerime nasıl emir veririm?",
    tags: "komut tuş klavye f1 formation",
    a: [
      "Sayı tuşlarıyla bölük seçersin (1 piyade, 2 nişancılar, 3 süvari, 4 atlı nişancılar). Sonra F tuşlarıyla emir verirsin:",
      ["F1 → F1: Gösterdiğin yere git ve orada dur.", "F1 → F2: Beni takip et.", "F1 → F3: Hücum.", "Diziliş emirleri (kalkan duvarı, dağınık düzen…) ayrı bir F menüsündedir."],
      "Savaştan önce açılan dizilim ekranında bölüklerini yerleştirebilirsin; okçuları yüksek bir yere, piyadeyi önlerine koymak iyi bir başlangıçtır.",
    ],
    q_en: "How do I give orders in battle?",
    a_en: [
      "Select formations with number keys (1 infantry, 2 ranged, 3 cavalry, 4 horse archers), then use the F keys:",
      ["F1 → F1: Move to the marked spot and hold.", "F1 → F2: Follow me.", "F1 → F3: Charge.", "Formation orders (shield wall, loose…) are in a separate F menu."],
      "Use the deployment screen before battle; archers on high ground with infantry in front is a good start.",
    ],
  },
]);
