// Site dili: Türkçe (varsayılan) ya da İngilizce. Seçim tarayıcıda saklanır; ?lang=en / ?lang=tr ile de değiştirilebilir.
// İngilizcede sayfadaki Türkçe yazılar aşağıdaki sözlükle çevrilir. Oyun verileri (LoL, Valorant) zaten İngilizce
// olarak alınır (bkz. IS_EN), bu yüzden sözlükte yalnızca sitenin kendi yazıları bulunur.
const LANG_KEY = "babuslar-lang";

const SITE_LANG = (() => {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  try {
    if (fromUrl === "en" || fromUrl === "tr") localStorage.setItem(LANG_KEY, fromUrl);
    return (fromUrl || localStorage.getItem(LANG_KEY)) === "en" ? "en" : "tr";
  } catch {
    return fromUrl === "en" ? "en" : "tr";
  }
})();

const IS_EN = SITE_LANG === "en";
document.documentElement.lang = SITE_LANG;

// Türkçe → İngilizce. Anahtarlar sayfada göründüğü haliyle (baştaki/sondaki boşluklar hariç).
const EN = {
  // Genel
  "Ana sayfa": "Home",
  "Ana menü": "Main menu",
  "Oyunlar": "Games",
  "Oyunlarını": "Discover your",
  "keşfet": "games",
  "Yakında": "Coming soon",
  "Yeni oyunlar eklenecek.": "More games are on the way.",
  "Yükleniyor…": "Loading…",
  "Bağlantı hatası": "Connection error",
  "Kapat": "Close",
  "Tümü": "All",
  "Tüm roller": "All roles",
  "Filtre": "Filter",
  "Rol seç": "Choose a role",
  "Role göre filtrele": "Filter by role",
  "Kategoriye göre filtrele": "Filter by category",
  "Haritalar": "Maps",
  "Harita hakkında": "About the map",
  "İnfolar": "Callouts",
  "Reklamsız": "Ad-free",
  "YouTube'da aç": "Open on YouTube",
  "Yetenekler": "Abilities",
  "Pasif": "Passive",
  "Güç": "Power",
  "Şampiyonlar, rünler ve eşya dizilimleri; haritalar, infolar ve smoke videoları. Hepsi tek yerde, Türkçe.":
    "Champions, runes and item builds; maps, callouts and smoke videos. All in one place.",
  "Babuşlar: oyun karakterlerinin, yeteneklerinin ve eşyalarının ne işe yaradığını anlatan Türkçe rehber.":
    "Babuşlar: a guide to what game characters, abilities and items do.",
  "Şampiyonlar · Eşyalar": "Champions · Items",
  "Tüm şampiyonların pasifleri, Q/W/E/R yetenekleri ve eşyalar.": "Every champion's passive, Q/W/E/R abilities and items.",
  "Haritalar · İnfolar · Smoke videoları": "Maps · Callouts · Smoke videos",
  "9 rekabetçi harita: radar üzerinde infolar; A, B ve Orta için smoke, flash, molotof ve el bombası videoları.":
    "9 competitive maps: callouts on the radar; smoke, flash, molotov and HE grenade videos for A, B and Mid.",
  "Ajanlar · Haritalar · İnfolar": "Agents · Maps · Callouts",
  "Tüm ajanların yetenekleri ve rekabetçi haritalar: radar üzerinde infolar.": "Every agent's abilities and the competitive maps with callouts on the radar.",
  "Katiller · Survivor'lar · Perkler · Haritalar": "Killers · Survivors · Perks · Maps",
  "Katillerin güçleri, perkler ve oyun içi videoları; haritalarda jeneratör noktaları.": "Killer powers, perks with in-game videos and generator spots on every map.",

  // Telif notları
  "Babuşlar, Riot Games tarafından onaylanmamıştır ve Riot Games'in ya da League of Legends'ın yapımında veya yönetiminde resmi olarak yer alan kişilerin görüşlerini yansıtmaz.":
    "Babuşlar isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.",
  "League of Legends ve Riot Games, Riot Games, Inc.'in ticari markaları veya tescilli ticari markalarıdır.":
    "League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.",
  "Babuşlar, Valve Corporation ile bağlantılı değildir. Counter-Strike 2 ve harita görüntüleri Valve Corporation'a aittir.":
    "Babuşlar is not affiliated with Valve Corporation. Counter-Strike 2 and map images belong to Valve Corporation.",
  "Valorant, Riot Games, Inc.'in ticari markasıdır. Valorant verileri valorant-api.com'dan alınır.":
    "Valorant is a trademark of Riot Games, Inc. Valorant data comes from valorant-api.com.",
  "Babuşlar, Riot Games tarafından onaylanmamıştır. Valorant ve Riot Games, Riot Games, Inc.'in ticari markalarıdır. Veriler valorant-api.com'dan alınır.":
    "Babuşlar isn't endorsed by Riot Games. Valorant and Riot Games are trademarks of Riot Games, Inc. Data comes from valorant-api.com.",
  "Dead by Daylight, Behaviour Interactive Inc.'e aittir. DBD verileri dbd.tricky.lol ve Dead by Daylight Wiki'den alınır.":
    "Dead by Daylight belongs to Behaviour Interactive Inc. DBD data comes from dbd.tricky.lol and the Dead by Daylight Wiki.",
  "Babuşlar, Behaviour Interactive ile bağlantılı değildir. Dead by Daylight ve görselleri Behaviour Interactive Inc.'e aittir.":
    "Babuşlar is not affiliated with Behaviour Interactive. Dead by Daylight and its images belong to Behaviour Interactive Inc.",
  "Veriler dbd.tricky.lol'dan; görseller, harita şemaları ve perk animasyonları Dead by Daylight Wiki'den (CC BY-SA) alınır.":
    "Data from dbd.tricky.lol; images, map layouts and perk videos from the Dead by Daylight Wiki (CC BY-SA).",

  // League of Legends
  "Şampiyonlar": "Champions",
  "Eşyalar": "Items",
  "Şampiyon": "Champion",
  "Koridorunu seç, bir şampiyona tıklayarak yeteneklerini ve eşya dizilimini gör.": "Pick your lane and click a champion to see their abilities and item build.",
  "Sihirdar Vadisi'nde satın alınabilen eşyalar. Ayrıntılar için bir eşyaya tıkla.": "Items you can buy on Summoner's Rift. Click an item for details.",
  "League of Legends şampiyonları: pasifleri ve Q/W/E/R yetenekleri.": "League of Legends champions: passives and Q/W/E/R abilities.",
  "League of Legends eşyaları: ne işe yaradıkları, fiyatları ve yapımları.": "League of Legends items: what they do, prices and recipes.",
  "Şampiyon ara…": "Search champions…",
  "Şampiyon ara": "Search champions",
  "Eşya ara…": "Search items…",
  "Eşya ara": "Search items",
  "Koridora göre filtrele": "Filter by lane",
  "Tüm koridorlar": "All lanes",
  "Şampiyonlar yükleniyor…": "Loading champions…",
  "Şampiyon yükleniyor…": "Loading champion…",
  "Eşyalar yükleniyor…": "Loading items…",
  "← Tüm şampiyonlar": "← All champions",
  "Şampiyon bulunamadı. Listeden bir şampiyon seç.": "Champion not found. Pick one from the list.",
  "Şampiyon bulunamadı.": "Champion not found.",
  "Şampiyon yüklenemedi. Bağlantını kontrol edip sayfayı yenile.": "Couldn't load the champion. Check your connection and refresh.",
  "Şampiyonlar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.": "Couldn't load champions. Check your internet connection and refresh.",
  "Eşyalar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.": "Couldn't load items. Check your internet connection and refresh.",
  "Aramana uyan şampiyon bulunamadı.": "No champions match your search.",
  "Aramana uyan eşya bulunamadı.": "No items match your search.",
  "Suikastçı": "Assassin",
  "Dövüşçü": "Fighter",
  "Büyücü": "Mage",
  "Nişancı": "Marksman",
  "Destek": "Support",
  "Üst": "Top",
  "Orman": "Jungle",
  "Orta": "Mid",
  "Alt": "Bot",
  "Saldırı Gücü": "Attack Damage",
  "Yetenek Gücü": "Ability Power",
  "Saldırı Hızı": "Attack Speed",
  "Kritik Vuruş": "Critical Strike",
  "Can": "Health",
  "Zırh": "Armor",
  "Büyü Direnci": "Magic Resist",
  "Yetenek Hızı": "Ability Haste",
  "Botlar": "Boots",
  "Pasif ve yetenekler": "Passive and abilities",
  "İpuçları": "Tips",
  "Hikâyesi": "Lore",
  "Dizilim yükleniyor…": "Loading build…",
  "Bu şampiyon için henüz eşya dizilimi yok.": "There's no item build for this champion yet.",
  "Eşya dizilimi şu an yüklenemedi. Sayfayı daha sonra yenilemeyi dene.": "Couldn't load the item build right now. Try refreshing later.",
  "Koridor seç": "Choose a lane",
  "Bu şampiyonun sık oynandığı koridor": "A lane this champion is often played in",
  "Bu koridora özel": "Lane-specific",
  "Editör önerisi": "Editor's pick",
  "Riot önerisi": "Riot's recommendation",
  "Başlangıç": "Starting",
  "duruma göre": "situational",
  "Rünler": "Runes",
  "Rün seçeneği": "Rune option",
  "Yapımı": "Recipe",
  "Dönüştüğü eşyalar": "Builds into",

  // CS2
  "CS2 haritaları": "CS2 maps",
  "Bir harita seç; infoları radar üzerinde, smoke, molotof ve flash atışlarını videolu gör.": "Pick a map to see callouts on the radar and smoke, molotov and flash lineups with videos.",
  "CS2 haritaları: infolar (callout'lar) ve smoke, molotof, flash videoları.": "CS2 maps: callouts and smoke, molotov and flash videos.",
  "İnfolar · Smoke ve flash videoları": "Callouts · Smoke and flash videos",
  "Harita yükleniyor…": "Loading map…",
  "← Tüm haritalar": "← All maps",
  "Harita bulunamadı. Listeden bir harita seç.": "Map not found. Pick one from the list.",
  "A bölgesi": "A site",
  "B bölgesi": "B site",
  "Bölüm seç": "Choose a section",
  "Atış türü seç": "Choose a utility type",
  "Kat seç": "Choose a floor",
  "Üst kat": "Upper floor",
  "Alt kat": "Lower floor",
  "Molotof": "Molotov",
  "El bombası": "HE grenade",
  "Bu bölüm için henüz atış eklenmedi.": "No lineups have been added for this section yet.",
  "Fas temalı klasik harita. Orta (Mid) kontrolü iki bölgeyi de açar.": "A classic Moroccan-themed map. Controlling Mid opens up both sites.",
  "En bilinen harita. Uzun koridorlar ve net bölgeler; Long ve Tunnels kontrolü önemli.": "The best-known map. Long corridors and clear sites; Long and Tunnels control matter.",
  "Dar sokaklı İtalyan kasabası. Banana (B) ve Apartments (A) kontrolü belirleyicidir.": "An Italian town with narrow streets. Banana (B) and Apartments (A) control are decisive.",
  "İki katlı nükleer santral. A üst katta, B tam altında; Outside ve Ramp kontrolü belirleyici.": "A two-floor nuclear plant. A is upstairs and B right below it; Outside and Ramp control are decisive.",
  "Orman tapınağı. Mid'deki Donut ve Cave kontrolü iki bölgeyi de açar.": "A jungle temple. Controlling Donut and Cave in Mid opens up both sites.",
  "Mısır temalı harita. Kanal ve Mid kontrolü hızlı rotasyon sağlar.": "An Egyptian-themed map. Canal and Mid control allow fast rotations.",
  "Tren deposu. Vagonların arasındaki dar açılar ve Ivy kontrolü önemli.": "A train yard. Tight angles between the cars and Ivy control matter.",
  "Berlin'de kanal ve park. B'ye Monster ve Short'tan, A'ya Long ve Connector'dan girilir.": "A canal and park in Berlin. B is entered from Monster and Short, A from Long and Connector.",
  "Gökdelen inşaatı. İki kat; A Ramp ve Mid'deki Elevator kontrolü önemli.": "A skyscraper construction site. Two floors; A Ramp and Mid Elevator control matter.",
  // CS2 atış adları
  "A Ramp flash'ı": "A Ramp flash",
  "A bölgesi flash'ı": "A site flash",
  "A bölgesi molotofu": "A site molotov",
  "A bölgesi smoke (T doğuşundan)": "A site smoke (from T spawn)",
  "A cross smoke'ları": "A cross smokes",
  "A smoke'ları (CT ve Donut)": "A smokes (CT and Donut)",
  "Apartments flash'ı": "Apartments flash",
  "Arch + Library tek noktadan": "Arch + Library from one spot",
  "B Apps flash'ı": "B Apps flash",
  "B bölgesi flash'ı": "B site flash",
  "B bölgesi molotofu": "B site molotov",
  "B bölgesi smoke'ları": "B site smokes",
  "B flash'ları": "B flashes",
  "B girişi smoke'ları": "B entrance smokes",
  "B kutularına molotof": "Molotov onto the B boxes",
  "B rush smoke'ları": "B rush smokes",
  "B smoke'ları tek noktadan": "B smokes from one spot",
  "B smoke'ları": "B smokes",
  "Back Plat molotofu": "Back Plat molotov",
  "Banana flash'ı": "Banana flash",
  "Barrel molotofu": "Barrel molotov",
  "Camera smoke'ları": "Camera smokes",
  "Car molotofu": "Car molotov",
  "Cubby molotofu": "Cubby molotov",
  "Dark molotofu (Palace'tan)": "Dark molotov (from Palace)",
  "Derin CT smoke": "Deep CT smoke",
  "Derin Cave smoke": "Deep Cave smoke",
  "Derin Donut smoke": "Deep Donut smoke",
  "E-Box smoke'ları": "E-Box smokes",
  "Elbow smoke'ları": "Elbow smokes",
  "Garage ve Secret smoke'ları": "Garage and Secret smokes",
  "Heaven smoke'ları": "Heaven smokes",
  "Heaven ve A smoke'ları": "Heaven and A smokes",
  "Hut el bombası": "Hut HE grenade",
  "Hut molotofu": "Hut molotov",
  "Jungle molotofu": "Jungle molotov",
  "Long flash'ları": "Long flashes",
  "Long'dan Bank smoke": "Bank smoke from Long",
  "Long'dan Dumpster smoke": "Dumpster smoke from Long",
  "Mid / Restroom smoke'ları": "Mid / Restroom smokes",
  "Mid flash'ı": "Mid flash",
  "Mid smoke'ları": "Mid smokes",
  "Mid sol / sağ smoke'ları": "Mid left / right smokes",
  "Mid'e kendi flash'ın": "Self-flash into Mid",
  "Outside smoke duvarı": "Outside smoke wall",
  "Rail smoke'ları": "Rail smokes",
  "Ramp el bombası": "Ramp HE grenade",
  "Ramp flash'ı": "Ramp flash",
  "Sandwich molotofu": "Sandwich molotov",
  "Sağ taraf smoke": "Right side smoke",
  "Short (Cat) flash'ları": "Short (Cat) flashes",
  "Short smoke (tek noktadan)": "Short smoke (from one spot)",
  "Short smoke'ları": "Short smokes",
  "T doğuşundan Heaven smoke": "Heaven smoke from T spawn",
  "Top Mid'den Window, Short, Jungle, CT": "Window, Short, Jungle, CT from Top Mid",
  "Truck molotofu": "Truck molotov",
  "Vent ve üst Hut smoke'ları": "Vent and upper Hut smokes",
  "Window flash'ı": "Window flash",
  "Window molotofu ve el bombası": "Window molotov and HE grenade",

  // Valorant
  "Ajanlar": "Agents",
  "Bir ajana tıklayarak yeteneklerini gör.": "Click an agent to see their abilities.",
  "Ajan ara…": "Search agents…",
  "Ajan ara": "Search agents",
  "Ajanlar yükleniyor…": "Loading agents…",
  "Ajan yükleniyor…": "Loading agent…",
  "← Tüm ajanlar": "← All agents",
  "Ajan bulunamadı. Listeden bir ajan seç.": "Agent not found. Pick one from the list.",
  "Ajan yüklenemedi. Bağlantını kontrol edip sayfayı yenile.": "Couldn't load the agent. Check your connection and refresh.",
  "Ajanlar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.": "Couldn't load agents. Check your internet connection and refresh.",
  "Aramana uyan ajan bulunamadı.": "No agents match your search.",
  "Roller · Yetenekler": "Roles · Abilities",
  "Tüm ajanlar ve C, Q, E, X yetenekleri.": "Every agent and their C, Q, E, X abilities.",
  "Radar · İnfolar": "Radar · Callouts",
  "Rekabetçi haritalar ve infoları.": "Competitive maps and their callouts.",
  "Valorant haritaları": "Valorant maps",
  "Bir harita seç; infoları radar üzerinde gör.": "Pick a map to see its callouts on the radar.",
  "Haritalar yükleniyor…": "Loading maps…",
  "Haritalar yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.": "Couldn't load maps. Check your internet connection and refresh.",
  "Harita yüklenemedi. Bağlantını kontrol edip sayfayı yenile.": "Couldn't load the map. Check your connection and refresh.",
  "Orta (Mid)": "Mid",
  "Doğuş": "Spawns",
  "Valorant ajanları: rolleri ve yetenekleri (C, Q, E, X).": "Valorant agents: roles and abilities (C, Q, E, X).",
  "Valorant haritaları: radar üzerinde infolar (callout).": "Valorant maps: callouts on the radar.",
  "Valorant: ajanların yetenekleri ve haritaların infoları.": "Valorant: agent abilities and map callouts.",

  // Dead by Daylight
  "Katiller": "Killers",
  "Survivor'lar": "Survivors",
  "Perkler": "Perks",
  "Katil": "Killer",
  "Karakter ara…": "Search characters…",
  "Karakter ara": "Search characters",
  "Karakter yükleniyor…": "Loading character…",
  "← Tüm karakterler": "← All characters",
  "Karakter bulunamadı. Listeden bir karakter seç.": "Character not found. Pick one from the list.",
  "Aramana uyan karakter bulunamadı.": "No characters match your search.",
  "Bu karakterin perkleri henüz eklenmedi.": "This character's perks haven't been added yet.",
  "Güçler · Perkler": "Powers · Perks",
  "Oyun içi videolar": "In-game videos",
  "Tüm perkler; açıklamaları ve oyun içi videoları.": "Every perk, with descriptions and in-game videos.",
  "Üstten şemalar": "Top-down layouts",
  "Üstten şema": "Top-down layout",
  "Şema yok": "No layout",
  "Jeneratör noktaları": "Generator spots",
  "Sabit": "Fixed",
  "Olası": "Possible",
  "Bu harita için bilinen sabit bir jeneratör noktası yok.": "No fixed generator spot is known for this map.",
  "Her maçta 7 jeneratör çıkar. Burada yazanlar dışındaki jeneratörler, haritanın her maçta değişen bölümlerinde rastgele noktalarda çıkar.":
    "Every match has 7 generators. Apart from the ones listed here, they spawn at random spots in the parts of the map that change every match.",
  "Bir harita seç; üstten şemasını ve bilgilerini gör.": "Pick a map to see its top-down layout and details.",
  "Bu haritanın üstten şeması henüz yok.": "This map doesn't have a top-down layout yet.",
  "Haritanın bir kısmı her maçta rastgele oluşur. Ana bina, çıkış kapıları ve sabit yapılar şemadaki yerlerinde kalır.":
    "Part of the map is randomly generated every match. The main building, exit gates and fixed structures stay where the layout shows them.",
  "Perk ya da karakter ara…": "Search perks or characters…",
  "Perk ara": "Search perks",
  "Perk türü": "Perk type",
  "Katil perkleri": "Killer perks",
  "Survivor perkleri": "Survivor perks",
  "▶ Sadece videolu": "▶ With video only",
  "▶ Oyun içi videoyu izle": "▶ Watch in-game video",
  "Genel perk (herkes kullanabilir)": "General perk (anyone can use it)",
  "Aramana uyan perk bulunamadı.": "No perks match your search.",
  "Dead by Daylight: katiller, survivorlar, perkler ve haritalar.": "Dead by Daylight: killers, survivors, perks and maps.",
  "Dead by Daylight katilleri ve survivorları: güçleri ve perkleri.": "Dead by Daylight killers and survivors: powers and perks.",
  "Dead by Daylight perkleri: açıklamaları ve oyun içi videoları.": "Dead by Daylight perks: descriptions and in-game videos.",
  "Dead by Daylight haritaları ve üstten şemaları.": "Dead by Daylight maps and top-down layouts.",

  // Sayfa başlıklarındaki parçalar
  "Harita": "Map",
  "Ajan": "Agent",
  "Karakter": "Character",
  "Karakterler": "Characters",
};

const LANE_EN = { Üst: "Top", Orman: "Jungle", Orta: "Mid", Alt: "Bot", Destek: "Support" };

// Sayı ya da ad içeren yazılar.
const EN_PATTERNS = [
  [/^(\d+) şampiyon$/, "$1 champions"],
  [/^(\d+) eşya$/, "$1 items"],
  [/^(\d+) ajan$/, "$1 agents"],
  [/^(\d+) karakter$/, "$1 characters"],
  [/^(\d+) perk$/, "$1 perks"],
  [/^(\d+) info$/, "$1 callouts"],
  [/^(\d+) katil: güçleri ve perkleri\.$/, "$1 killers: powers and perks."],
  [/^(\d+) survivor ve perkleri\.$/, "$1 survivors and their perks."],
  [/^(\d+) harita ve üstten şemaları\.$/, "$1 maps and top-down layouts."],
  [/^Yama (.+)$/, "Patch $1"],
  [/^Bekleme süresi: (.+) sn$/, "Cooldown: $1 s"],
  [/^Bedel: (.+)$/, "Cost: $1"],
  [/^Menzil: (.+)$/, "Range: $1"],
  [/^Zorluk: (.+)$/, "Difficulty: $1"],
  [/^Zorluk$/, "Difficulty"],
  [/^(\d+) altın$/, "$1 gold"],
  [/^· Satış: (\d+) altın$/, "· Sells for: $1 gold"],
  [/^(.+) genelde (.+) koridorunda oynanır\.$/, (_, name, lanes) =>
    `${name} is usually played ${lanes.split(" ve ").map((l) => LANE_EN[l] || l).join(" and ")}.`],
  [/^([\d.,]+) maç · (.+) tercih$/, "$1 games · $2 pick rate"],
  [/^([\d.,]+) maç$/, "$1 games"],
  [/^(.+) kazanma$/, "$1 win rate"],
  [/^(.+) için$/, "for $1"],
  [/^(.+) ile$/, "with $1"],
  [/^Seçenek (\d+)$/, "Option $1"],
  [/^Şema (\d+)$/, "Layout $1"],
  [/^([A-Z]) bölgesi$/, "$1 site"],
  [/^([A-Z](?:, [A-Z])*) ve ([A-Z]) bölgeleri$/, "$1 and $2 sites"],
  [/^Türkçe: .*$/, ""],
  [/^(.+) videosunu oynat$/, (_, name) => `Play ${translateText(name)} video`],
  [/^(.+) radar haritası$/, "$1 radar map"],
  [/^(.+) üstten şeması$/, "$1 top-down layout"],
  [/^Bu bölgede henüz (.+) atışı yok\. Diğer türler için "Tümü"ne bak\.$/, (_, type) =>
    `No ${translateText(type.replace(/^./, (c) => c.toLocaleUpperCase("tr"))).toLowerCase()} lineups here yet. See "All" for other types.`],
];

function translateText(text) {
  const key = text.trim();
  if (!key) return text;
  let out = EN[key];
  if (out === undefined) {
    for (const [re, rep] of EN_PATTERNS) {
      if (re.test(key)) {
        out = key.replace(re, rep);
        break;
      }
    }
  }
  // "Büyücü · Suikastçı" gibi parçalı yazılar: her parça ayrı çevrilir.
  if (out === undefined && key.includes(" · ")) {
    const parts = key.split(" · ");
    const translated = parts.map(translateText);
    if (translated.some((p, i) => p !== parts[i])) out = translated.join(" · ");
  }
  if (out === undefined) return text;
  // Baştaki ve sondaki boşluklar korunur (ör. "Yama 15.19.1" yanındaki rozet).
  return text.replace(key, out);
}

// "Ajanlar · Valorant · Babuşlar" → "Agents · Valorant · Babuşlar"
const translateTitle = (title) => title.split(" · ").map(translateText).join(" · ");

const I18N_ATTRS = ["placeholder", "aria-label", "title", "alt"];

function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentNode;
    if (!parent || /^(SCRIPT|STYLE)$/.test(parent.nodeName)) return;
    const next = parent.nodeName === "TITLE" ? translateTitle(root.data) : translateText(root.data);
    if (next !== root.data) root.data = next;
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  for (const attr of I18N_ATTRS) {
    const value = root.getAttribute(attr);
    if (value) {
      const next = translateText(value);
      if (next !== value) root.setAttribute(attr, next);
    }
  }
  if (root.nodeName === "META" && root.getAttribute("name") === "description") {
    root.setAttribute("content", translateText(root.getAttribute("content") || ""));
  }
  for (const child of root.childNodes) translateTree(child);
}

// Dil düğmesi: üst menünün sonunda. Tıklanınca seçim saklanır ve sayfa yeni dille yeniden yüklenir.
function addLanguageToggle() {
  const nav = document.querySelector(".site-header .nav");
  if (!nav || nav.querySelector(".lang-toggle")) return;
  const next = IS_EN ? "tr" : "en";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "lang-toggle";
  button.textContent = next.toUpperCase();
  button.title = IS_EN ? "Türkçe" : "English";
  button.setAttribute("aria-label", IS_EN ? "Türkçeye geç" : "Switch to English");
  button.addEventListener("click", () => {
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    location.replace(url);
  });
  nav.append(button);
}

document.addEventListener("DOMContentLoaded", () => {
  addLanguageToggle();
  if (!IS_EN) return;
  translateTree(document.documentElement);
  // Sonradan eklenen yazılar (betiklerin oluşturduğu kartlar, listeler) da çevrilir.
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData") translateTree(m.target);
      else if (m.type === "attributes") translateTree(m.target);
      else m.addedNodes.forEach(translateTree);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
});
