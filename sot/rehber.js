// Sea of Thieves başlangıç rehberi.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "Oyuna ilk girince ne yapmalıyım?",
    tags: "başlangıç ilk yolculuk voyage karakol outpost",
    a: [
      "Bir karakolda (outpost) başlarsın, gemin iskelede bekler. İlk adımlar:",
      [
        "Karakolda dolaş: ticaret şirketlerinin temsilcileri, meyhane ve dükkânlar burada.",
        "Bir yolculuk (voyage) al: şirket temsilcilerinden ya da gemideki harita masasındaki yolculuk masasından (voyage table). Ekipte oylama yapılır.",
        "Gemiye çıkmadan karakoldaki fıçılardan tahta (plank), gülle ve muz topla; gemide de malzeme fıçıları var.",
        "Çapayı kaldır, yelkenleri indir ve harita masasından rotanı belirle.",
      ],
    ],
    q_en: "What should I do first?",
    a_en: [
      "You start at an outpost with your ship at the dock:",
      ["Look around: trading company reps, tavern and shops are here.", "Get a voyage from a company rep or the voyage table on your ship; the crew votes.", "Grab planks, cannonballs and bananas from the barrels before leaving; the ship has supply barrels too.", "Raise the anchor, drop the sails and plot your course on the map table."],
    ],
  },
  {
    q: "Gemim su alıyor, nasıl batmaktan kurtulurum?",
    tags: "delik batma su kova tahta plank bucket hasar onarım",
    a: [
      "Top ya da kaya çarpınca gövdede delik açılır ve gemi su alır:",
      ["Elinde tahta (plank) ile deliklere bakıp tamir et; alt kattaki delikler en tehlikelisi.", "Suyu kova ile alıp denize boşalt.", "Önce delikleri kapat, sonra suyu boşalt; yoksa su geri dolar.", "Kayalara çarpmamak için gece fener taşıyan bir ekip arkadaşını öne koy ya da yavaşla."],
    ],
    q_en: "My ship is taking water, how do I stop sinking?",
    a_en: ["Holes from cannons or rocks let water in:", ["Repair holes with planks; the lower deck ones matter most.", "Bail water out with the bucket.", "Patch holes first, then bail.", "Slow down near rocks, especially at night."]],
  },
  {
    q: "Hazine haritası nasıl okunur?",
    tags: "hazine x işareti treasure map kazma kürek riddle bilmece",
    a: [
      "X işaretli haritada adanın şekli ve X'in yeri çizilidir. Harita masasındaki ya da Harita sayfamızdaki ada şekilleriyle karşılaştırıp adayı bul, adada X'in yerine gidip kürekle kaz.",
      "Bilmece haritalarında (riddle map) adadaki yer tarifleri yazar: “X'e bak, şu kadar adım yürü” gibi. Bilmeceler yalnızca büyük adalarda olur.",
      "Pusulayı kullan: haritadaki yönler gerçek yönlerle aynıdır.",
    ],
    q_en: "How do I read a treasure map?",
    a_en: ["X marks the spot maps show the island's shape and the X. Match the shape on the map table (or our Map page), go to the X and dig.", "Riddle maps give directions on the island like 'face X and walk N paces'. They only point to large islands.", "Use your compass; map directions match the world."],
  },
  {
    q: "Ganimeti nereye satarım?",
    tags: "satış sell sandık kafatası skull chest altın gold şirket",
    a: ["Sandıklar Gold Hoarders'a, kafataslar Order of Souls'a, hayvan ve kargolar Merchant Alliance'a, balık ve et Hunter's Call'a satılır. Ayrıntılar Şirketler sayfasında."],
    q_en: "Where do I sell loot?",
    a_en: ["Chests to the Gold Hoarders, skulls to the Order of Souls, animals and cargo to the Merchant Alliance, fish and meat to the Hunter's Call. Details on the Companies page."],
  },
  {
    q: "Ölünce ne olur?",
    tags: "ölüm ferry of the damned yeniden doğma respawn",
    a: ["Ölünce Ferry of the Damned (lanetliler gemisi) adlı ruh gemisine gidersin; kısa bir bekleyişten sonra kapıdan geçip gemine geri dönersin. Üstündeki eşya yere düşer, ekibin alabilir.", "Gemi batarsa yeni bir gemi yakındaki bir karakolda ya da açık denizde doğar; batan gemideki ganimet suya dağılır."],
    q_en: "What happens when I die?",
    a_en: ["You go to the Ferry of the Damned and after a short wait return to your ship. Items you held drop.", "If the ship sinks, a new one spawns elsewhere and its loot floats away."],
  },
  {
    q: "Hangi silahları seçmeliyim?",
    tags: "silah weapon kılıç cutlass blunderbuss eye of reach flintlock tabanca",
    a: [
      "Aynı anda iki silah taşırsın; değiştirmek için gemideki silah sandığını (weapon chest) kullan. Yaygın seçimler:",
      [
        "Cutlass (kılıç): yakın dövüş, kombo vuruşlar ve atılma.",
        "Blunderbuss: yakından çok güçlü, düşmanı geri iter (gemiden düşürmek için iyi).",
        "Eye of Reach: uzun menzilli tüfek, gemiden gemiye atış için.",
        "Flintlock: orta menzil, hızlı ve güvenilir tabanca.",
        "Double Barrel Pistol: iki hızlı atış.",
      ],
      "Yeni başlayanlar için Cutlass + Blunderbuss ya da Eye of Reach + Blunderbuss sık tercih edilir.",
    ],
    q_en: "Which weapons should I pick?",
    a_en: [
      "You carry two at a time; swap at the ship's weapon chest:",
      ["Cutlass: melee combos and lunges.", "Blunderbuss: very strong up close, knocks enemies back.", "Eye of Reach: long-range rifle for ship-to-ship shots.", "Flintlock: reliable mid-range pistol.", "Double Barrel Pistol: two quick shots."],
      "Beginners often go Cutlass + Blunderbuss or Eye of Reach + Blunderbuss.",
    ],
  },
  {
    q: "Diğer oyunculardan nasıl korunurum? (PvP)",
    tags: "pvp düşman gemi ittifak alliance safer seas emissary",
    a: [
      "Denizde diğer gemiler düşman olabilir. Ganimeti çok biriktirmeden sık sık sat; ufukta yelken görürsen rotanı değiştir.",
      "İttifak (alliance) bayrağı kaldırarak başka gemilerle ittifak kurabilir, kazancı paylaşabilirsin.",
      "Emissary bayrağı daha çok kazandırır ama Reaper's Bones gemileri seni haritada görebilir.",
      "Sadece PvE istiyorsan Safer Seas modunu seçebilirsin: daha güvenli ama ödüller ve ilerleme sınırlıdır.",
    ],
    q_en: "How do I stay safe from other players?",
    a_en: ["Other ships can attack you. Sell often and change course if you see sails.", "Raise an alliance flag to team up with other ships and share profits.", "Emissary flags pay more but Reaper's Bones crews can see you.", "For PvE only, play Safer Seas: safer but with limited rewards and progression."],
  },
  {
    q: "Kraken ya da Megalodon saldırdı, ne yapmalıyım?",
    tags: "kraken megalodon köpekbalığı canavar deniz",
    a: [
      "Kraken: su kararır ve dokunaçlar gemiyi sarar. Dokunaçlara topla ve silahla vur; birkaç dokunaç gidince Kraken çekilir. Ya da tam yelkenle kaçmaya çalış.",
      "Megalodon: dev köpekbalığı. Gemiye çarpıp delik açar; deliği tamir ederken diğerleri topla ona ateş etsin.",
    ],
    q_en: "A Kraken or Megalodon attacked, what do I do?",
    a_en: ["Kraken: the water goes dark and tentacles grab the ship. Shoot the tentacles with cannons and guns, or sail away at full speed.", "Megalodon: a giant shark that rams the hull. Repair holes while others shoot it with cannons."],
  },
]);
