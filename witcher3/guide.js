// Witcher 3 rehberi. Hikâye kararları The Witcher Wiki'deki "The Witcher 3 decision checklist" sayfasına göre yazılmıştır.
renderFaq(document.getElementById("faq"), document.getElementById("search"), [
  {
    q: "Ciri'nin sonunu ne belirler? (iyi son nasıl alınır)",
    tags: "ending son ciri witcher empress spoiler",
    a: [
      "Oyunun sonunda Ciri'ye ne olacağını beş karar belirler. Her biri olumlu ya da olumsuz sayılır; Ciri'nin hayatta kalması için en az 3 olumlu karar gerekir:",
      [
        "Kaer Morhen'de (Blood on the Battlefield) Ciri'yi neşelendirirken kartopu savaşı yap: olumlu. İçki içmeyi seçmek olumsuz.",
        "Ciri'yi Emhyr'e götürdüysen Emhyr'in verdiği parayı reddet: olumlu. Parayı almak olumsuz.",
        "Lodge of Sorceresses (büyücü kadınlar) toplantısına Ciri'nin yalnız gitmesine izin ver: olumlu. Onunla gitmek olumsuz.",
        "Avallac'h'ın laboratuvarında Ciri öfkelenince ona “kır geç” de (Tell Ciri to go for it): olumlu. Sakinleşmesini söylemek olumsuz.",
        "Ciri, Skjall'ın mezarına gitmek istediğinde onunla git: olumlu. “Vakit yok” demek olumsuz.",
      ],
      "Ciri hayatta kalırsa iki son vardır: Ciri'yi Emhyr'e götürdüysen ve Nilfgaard savaşı kazandıysa imparatoriçe olur; Emhyr'e götürmediysen witcher olur.",
    ],
    q_en: "What decides Ciri's ending?",
    a_en: [
      "Five choices decide Ciri's fate. Each counts as positive or negative; Ciri needs at least 3 positives to survive:",
      [
        "At Kaer Morhen (Blood on the Battlefield), cheer her up with a snowball fight: positive. Drinking: negative.",
        "If you took Ciri to Emhyr, refuse his payment: positive. Taking it: negative.",
        "Let Ciri go alone to meet the Lodge of Sorceresses: positive. Going with her: negative.",
        "In Avallac'h's lab, tell Ciri to go for it when she gets angry: positive. Telling her to calm down: negative.",
        "Go with Ciri to Skjall's grave: positive. Saying there's no time: negative.",
      ],
      "If she survives: she becomes Empress if you took her to Emhyr and Nilfgaard wins the war; otherwise she becomes a witcher.",
    ],
  },
  {
    q: "Savaşı kim kazanır, Kuzey'in kaderi nasıl belirlenir?",
    tags: "radovid dijkstra emhyr nilfgaard temeria roche reason of state",
    a: [
      "Savaşın sonucu Roche'un suikast görevlerine ve Dijkstra'ya karşı tavrına bağlıdır:",
      [
        "Act I'deki üç suikast görevini (A Deadly Plot, An Eye for an Eye, Redania's Most Wanted) tamamlamazsan Radovid kazanır, Emhyr öldürülür ve Temeria yok olur.",
        "Act III'te Dijkstra'yla dövüşürsen (Blindingly Obvious) ya da Reason of State görevini yapmazsan yine Radovid kazanır.",
        "Reason of State'te Dijkstra'nın Roche, Ves ve Thaler'i öldürmesine izin verirsen Dijkstra Kuzey'i yönetir ve savaşı kazanır.",
        "Roche, Ves ve Thaler'i Dijkstra'ya karşı korursan Nilfgaard kazanır ve Temeria, Nilfgaard'a bağlı bir devlet olur. Ciri'nin imparatoriçe sonu için bu yol gerekir.",
      ],
      "Ayrıca Now or Never görevinde büyücüleri Novigrad'dan kaçırmazsan A Deadly Plot kapanır ve Radovid kazanır.",
    ],
    q_en: "Who wins the war and how is the North decided?",
    a_en: [
      "The outcome depends on Roche's assassination quests and how you deal with Dijkstra:",
      [
        "If you don't finish the three Act I quests (A Deadly Plot, An Eye for an Eye, Redania's Most Wanted), Radovid wins, Emhyr is killed and Temeria is gone.",
        "If you fight Dijkstra in Blindingly Obvious or skip Reason of State, Radovid also wins.",
        "In Reason of State, letting Dijkstra kill Roche, Ves and Thaler makes Dijkstra rule the North and win.",
        "Defending Roche, Ves and Thaler makes Nilfgaard win; Temeria becomes a vassal state. Ciri's Empress ending needs this path.",
      ],
      "Also, abandoning the mages in Now or Never locks out A Deadly Plot, so Radovid wins.",
    ],
  },
  {
    q: "Yennefer mi Triss mi? İkisiyle birden olursam ne olur?",
    tags: "romance romantizm aşk yennefer triss",
    a: [
      "Yennefer'i seçmek için The Last Wish görevinde ona hâlâ onu sevdiğini söylemelisin. Triss'i seçmek için Now or Never görevinin sonunda, Triss giderken ona kalmasını ve onu sevdiğini söylemelisin.",
      "İkisine de “seni seviyorum” dersen It Takes Three to Tango görevi tetiklenir ve ikisini de kaybedersin. Yani yalnız birini seç.",
      "Büyücüleri Novigrad'dan kaçırmana yardım etmezsen (Now or Never) Triss'le romantizm kapanır.",
    ],
    q_en: "Yennefer or Triss? What if I romance both?",
    a_en: [
      "For Yennefer, tell her you still love her in The Last Wish. For Triss, ask her to stay and say you love her as she leaves at the end of Now or Never.",
      "Telling both you love them triggers It Takes Three to Tango and you lose both. Pick one.",
      "If you don't help smuggle the mages out of Novigrad (Now or Never), Triss's romance is locked out.",
    ],
  },
  {
    q: "Kaçırılabilecek görevler neler? (geri dönüşü olmayan nokta)",
    tags: "missable point of no return isle of mists skellige keira",
    a: [
      "Geralt Isle of Mists'e (Sis Adası) gittiğinde bazı görevler kapanır ya da başarısız olur. Oraya gitmeden önce şunları bitir:",
      [
        "Skellige'de Possession (Cerys) ve The Lord of Undvik (Hjalmar); ikisi de bitince King's Gambit açılır ve Skellige'nin yeni yöneticisini sen seçersin. Act III'e kadar yapılmazsa başarısız olur.",
        "Keira Metz'in görevleri: hepsini bitirip son konuşmada onu Kaer Morhen'e gönderirsen Kaer Morhen savaşında Lambert'i kurtarır.",
        "Roche'un üç suikast görevi (savaşın sonucunu belirler).",
      ],
      "Kaer Morhen savaşı öncesi müttefik toplamak için de yan görevleri bitirmek iyi olur.",
    ],
    q_en: "What can I miss? (point of no return)",
    a_en: [
      "Some quests close or fail when Geralt heads to the Isle of Mists. Finish these first:",
      [
        "In Skellige: Possession (Cerys) and The Lord of Undvik (Hjalmar); both unlock King's Gambit, where you pick Skellige's ruler. They fail if not done before Act III.",
        "Keira Metz's quests: finish them and send her to Kaer Morhen and she saves Lambert in the battle.",
        "Roche's three assassination quests (they decide the war).",
      ],
      "Finishing side quests also brings more allies to the Battle of Kaer Morhen.",
    ],
  },
  {
    q: "Kanlı Baron (Bloody Baron) görevinde ne seçmeliyim?",
    tags: "baron whispering hillock spirit anna crones orphans",
    a: [
      "Whispering Hillock'taki ruhu öldürürsen Downwarren köyü güvende kalır ama bataklıktaki yetimleri Crones alır; Anna aklını yitirir ama yaşar, Baron onu tedavi için uzaklara götürür.",
      "Ruhu serbest bırakırsan (Ealdorman'la konuştuktan sonra) yetimler kurtulur ve Novigrad'da Marabella'ya emanet edilir, ama ruh Downwarren'ı basıp köylülerin çoğunu öldürür; Anna lanetlenir ve laneti kaldırınca ölür, Baron da kendini öldürür.",
      "Kesin bir doğru yok: oyunun en zor ahlaki seçimlerinden biridir.",
    ],
    q_en: "What should I choose in the Bloody Baron quest?",
    a_en: [
      "Killing the spirit of the Whispering Hillock keeps Downwarren safe, but the Crones take the bog orphans; Anna loses her mind but lives, and the Baron takes her away for help.",
      "Freeing the spirit (after talking to the Ealdorman) saves the orphans, who end up with Marabella in Novigrad, but the spirit attacks Downwarren; Anna is cursed and dies when it is lifted, and the Baron kills himself.",
      "There is no clean answer; it is one of the game's hardest choices.",
    ],
  },
  {
    q: "Canavarlarla nasıl savaşırım? Yağ, işaret ve bomba ne işe yarar?",
    tags: "oil sign bomb combat savaş quen igni",
    a: [
      [
        "Yağlar (oil) kılıca sürülür ve belli bir canavar sınıfına (Necrophage, Specter…) fazladan hasar verir. Canavarlar sayfasında hangi yağın işe yaradığını görebilirsin.",
        "Canavarlara gümüş (silver), insanlara ve hayvanlara çelik (steel) kılıç kullan.",
        "İşaretler (sign): Quen kalkan, Igni ateş, Aard itme, Yrden tuzak, Axii zihin kontrolü. Quen başta en güvenli savunmadır.",
        "Bombalar canavar yuvalarını yok eder (Grapeshot, Dancing Star) ve bazı canavarlara karşı çok etkilidir (ör. hayaletlere Moon Dust).",
        "İksirleri (potion) ve bombaları meditasyon yaparak yeniden doldurursun; envanterinde güçlü bir alkol (ör. Dwarven spirit) olmalı.",
      ],
    ],
    q_en: "How do I fight monsters? What do oils, Signs and bombs do?",
    a_en: [
      [
        "Oils go on your sword and deal extra damage to one monster class (Necrophage, Specter…). See the Monsters page.",
        "Use the silver sword on monsters, steel on humans and animals.",
        "Signs: Quen shields, Igni burns, Aard pushes, Yrden traps, Axii controls minds. Quen is the safest early defence.",
        "Bombs destroy monster nests (Grapeshot, Dancing Star) and are strong against some monsters (e.g. Moon Dust vs specters).",
        "Potions and bombs refill when you meditate, as long as you carry strong alcohol (e.g. Dwarven spirit).",
      ],
    ],
  },
  {
    q: "Yetenek puanı nasıl kazanılır?",
    tags: "ability point skill place of power level",
    a: [
      "Her seviye atladığında 1 yetenek puanı kazanırsın. Ayrıca haritadaki her Güç yerini (Place of Power) ilk kez etkinleştirdiğinde 1 puan daha alırsın; Harita sayfasında hepsini görebilirsin.",
      "Yetenekleri kuşanmak için mutagen yuvaları ve yetenek yuvaları vardır; aynı renkteki mutagen, yanındaki yeteneklerin bonusunu artırır.",
    ],
    q_en: "How do I get ability points?",
    a_en: [
      "You get 1 point per level, plus 1 the first time you use each Place of Power; they are all on the Map page.",
      "Abilities go into slots next to mutagen slots; a mutagen of the same colour boosts the abilities next to it.",
    ],
  },
  {
    q: "Gwent kartlarını nereden bulurum?",
    tags: "gwent kart",
    a: [
      "Gwent oyuncularıyla oynayarak (çoğu tüccar ve hancı) yeni kartlar kazanır ya da satın alırsın. Harita sayfasında “Tüccar ve hizmetler” grubundaki Gwent oyuncularını görebilirsin. Bazı oyuncular hikâye ilerledikçe kaybolabilir, o yüzden kartlarını erken topla.",
    ],
    q_en: "Where do I find Gwent cards?",
    a_en: [
      "Play Gwent players (many merchants and innkeepers) to win or buy cards; they are in the “Merchants and services” group on the Map page. Some players disappear as the story progresses, so collect early.",
    ],
  },
]);
