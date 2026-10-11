// Brotato başlangıç rehberi.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "Oyunun amacı ne, bir koşu nasıl geçer?",
    tags: "başlangıç dalga wave koşu run boss",
    a: [
      "Patates karakterinle 20 dalga (wave) hayatta kalmaya çalışırsın. Silahlar kendiliğinden ateş eder; sen yalnızca hareket edersin.",
      "Her dalgadan sonra dükkâna girer, topladığın malzemeyle silah ve eşya alırsın. Son dalgada boss çıkar; onu yenince koşu kazanılır.",
    ],
    q_en: "What's the goal and how does a run work?",
    a_en: ["Survive 20 waves as your potato. Weapons fire on their own; you only move.", "After each wave you visit the shop and spend materials on weapons and items. The last wave has a boss; beat it to win."],
  },
  {
    q: "Malzeme (materials) ve hasat (harvesting) nedir?",
    tags: "malzeme materials para hasat harvesting çanta bag ağaç",
    a: [
      "Malzeme oyunun parası: düşmanlar düşürür, üstünden geçince toplanır.",
      "Dalga bitince yerde kalan malzeme kaybolmaz, çantada birikir; sonraki dalgada topladığın her malzemeye çantadan bir tane eklenir.",
      "Hasat (Harvesting) statı her dalga sonunda o kadar malzeme ve XP verir; erken alınırsa koşu boyunca çok kazandırır.",
      "Haritadaki ağaçları kırınca meyve (can) ve bazen sandık düşer.",
    ],
    q_en: "What are materials and harvesting?",
    a_en: [
      "Materials are the currency: enemies drop them and you pick them up by walking over them.",
      "Materials left at wave end go to a bag; next wave each pickup adds one from the bag.",
      "Harvesting gives that many materials and XP after every wave; taking it early pays off all run.",
      "Breaking trees drops fruit (healing) and sometimes crates.",
    ],
  },
  {
    q: "Dükkânda ne almalıyım? Kilit ne işe yarar?",
    tags: "dükkân shop kilit lock reroll yenile",
    a: [
      "Dükkânda 4 ürün çıkar. Beğendiğin ama parası yetmeyen ürünü kilit (lock) simgesiyle sonraki dükkâna saklayabilirsin.",
      "Yenile (reroll) yeni ürünler getirir ama her basışta fiyatı artar.",
      "Karakterinin sevdiği statlara (Karakterler sayfasında yazıyor) uygun eşyaları ve aynı sınıftan silahları seç.",
    ],
    q_en: "What should I buy? What does lock do?",
    a_en: ["The shop shows 4 offers. Lock one you want but can't afford to keep it for the next shop.", "Reroll shows new offers but costs more each time.", "Pick items that boost your character's wanted stats (see Characters) and weapons from the same class."],
  },
  {
    q: "Silahlar nasıl birleşir ve seviye atlar?",
    tags: "silah birleştirme combine seviye tier yuva slot set bonus sınıf",
    a: [
      "En fazla 6 silah taşırsın (bazı karakterlerde farklı). Aynı silahtan aynı seviyede iki tane varsa dükkânda birleştirip bir üst seviyeye (I → II → III → IV) çıkarabilirsin.",
      "Aynı sınıftan (Gun, Blade, Elemental…) birden çok silah taşımak o sınıfın set bonusunu verir.",
      "Silahların her seviyedeki değerlerini Silahlar sayfasında seviye seçerek karşılaştırabilirsin.",
    ],
    q_en: "How do weapons combine and level up?",
    a_en: ["You carry up to 6 weapons (some characters differ). Two identical weapons of the same tier can be combined in the shop into the next tier (I → II → III → IV).", "Carrying several weapons of the same class (Gun, Blade, Elemental…) gives that class's set bonus.", "Compare each tier's stats on the Weapons page."],
  },
  {
    q: "Seviye atlayınca hangi statı seçmeliyim?",
    tags: "seviye level up stat seçim xp",
    a: [
      "Dalga sonunda seviye atladıysan 4 stat yükseltmesinden birini seçersin.",
      [
        "Silahların hangi statla güçleniyorsa (yakın dövüş, menzilli, element, mühendislik) onu al.",
        "Maks. Can ve Zırh ölmemeni sağlar; ilk dalgalarda ihmal etme.",
        "Hasat erken alınırsa koşu boyunca çok malzeme getirir.",
      ],
    ],
    q_en: "Which stat should I pick on level up?",
    a_en: ["When you level up you pick one of 4 stat upgrades after the wave.", ["Take what your weapons scale with (melee, ranged, elemental, engineering).", "Max HP and Armor keep you alive; don't neglect them early.", "Harvesting taken early pays off with lots of materials."]],
  },
  {
    q: "Tehlike seviyeleri (Danger) ne demek?",
    tags: "tehlike danger zorluk difficulty",
    a: [
      "Tehlike 0'dan 5'e kadar zorluk seviyesidir. Bir karakterle bir tehlike seviyesini kazanınca o karakter için bir üst seviye açılır.",
      "Yüksek tehlikede düşmanlar daha güçlü ve daha kalabalıktır, elit düşmanlar ve ek bosslar çıkar.",
    ],
    q_en: "What are Danger levels?",
    a_en: ["Danger 0 to 5 is the difficulty. Winning a Danger level with a character unlocks the next one for that character.", "Higher Danger brings stronger and more numerous enemies, elites and extra bosses."],
  },
  {
    q: "Yeni karakterleri nasıl açarım?",
    tags: "karakter açma unlock",
    a: ["Her karakterin açılma koşulu var (belli bir karakterle kazanmak, belli bir seviyeye ulaşmak gibi). Karakterler sayfasında her kartın altında yazıyor."],
    q_en: "How do I unlock new characters?",
    a_en: ["Each character has an unlock condition (win with a certain character, reach a level and so on). It's listed on each card on the Characters page."],
  },
]);
