// Paneldeki oyunlar ve bölümleri. Her bölüm bir veri dosyasındaki bir listeyi düzenler (admin/edit.html).
//   file: depodaki dosya; name: dosyadaki sabitin adı ("const NAME = ...")
//   kind: "data"    → betiklerin ürettiği tek satırlık JSON verisi (data.js)
//         "literal" → elle yazılmış JavaScript nesnesi (tr.js, gens.js…); dosyanın geri kalanına dokunulmaz
//         "json"    → .json dosyası
//   list: düzenlenen listenin sabit içindeki yolu ("perks.survivor"); boşsa sabitin kendisi
//   auto: dosya her hafta wikiden yeniden üretilir (scripts/guncelle.ps1). Paneldeki değişiklikler
//         ayrıca <klasör>/duzeltmeler.json'a yazılır ve her güncellemeden sonra yeniden uygulanır.
//   href: kendi özel paneli olan bölümler (CS2)

const dataSection = (file, name, list, label, auto = false) => ({ label, file, name, list, kind: "data", auto });
const literalSection = (file, name, list, label) => ({ label, file, name, list, kind: "literal" });

const bf = (dir, name, auto) => ({
  name,
  sections: [dataSection(`${dir}/data.js`, "BF", "weapons", "Silahlar", auto), dataSection(`${dir}/data.js`, "BF", "maps", "Haritalar", auto)],
});

const GAMES = [
  { name: "Site", sections: [literalSection("assets/hakkimda.js", "HAKKIMDA", "", "Hakkımda sayfası")] },
  {
    name: "Counter-Strike 2",
    sections: [
      { label: "Haritalar ve infolar", href: "cs2.html?panel=haritalar" },
      { label: "Atış videoları", href: "cs2.html?panel=atislar" },
    ],
  },
  {
    name: "League of Legends",
    sections: [{ label: "Editör eşya dizilimleri", file: "lol/editor-builds.json", list: "", kind: "json" }],
  },
  { name: "Valorant", sections: [literalSection("valorant/videos.js", "ABILITY_VIDEOS", "", "Yetenek videoları")] },
  {
    name: "Dead by Daylight",
    sections: [
      dataSection("dbd/data.js", "DBD", "killers", "Katiller", true),
      dataSection("dbd/data.js", "DBD", "survivors", "Survivor'lar", true),
      dataSection("dbd/data.js", "DBD", "perks.survivor", "Genel survivor perkleri", true),
      dataSection("dbd/data.js", "DBD", "perks.killer", "Genel katil perkleri", true),
      dataSection("dbd/data.js", "DBD", "maps", "Haritalar", true),
      literalSection("dbd/tr.js", "DBD_TR_PERKS", "", "Türkçe perk metinleri"),
      literalSection("dbd/tr.js", "DBD_TR_KILLERS", "", "Türkçe katil metinleri"),
      literalSection("dbd/tr.js", "DBD_TR_SURVIVORS", "", "Türkçe survivor metinleri"),
      literalSection("dbd/tr.js", "DBD_TR_MAPS", "", "Türkçe harita metinleri"),
      literalSection("dbd/gens.js", "DBD_GENS", "", "Jeneratör yerleri"),
    ],
  },
  {
    name: "Darkest Dungeon",
    sections: [
      dataSection("dd/1/data.js", "DKD", "heroes", "Kahramanlar"),
      dataSection("dd/1/data.js", "DKD", "bosses", "Bosslar"),
      dataSection("dd/1/data.js", "DKD", "trinkets", "Trinketler"),
      dataSection("dd/1/data.js", "DKD", "items", "Eşyalar"),
      literalSection("dd/1/tr.js", "DKD_TR", "heroes", "Türkçe kahraman metinleri"),
      literalSection("dd/1/tr.js", "DKD_TR", "bosses", "Türkçe boss metinleri"),
      literalSection("dd/1/tr.js", "DKD_TR", "items", "Türkçe eşya metinleri"),
    ],
  },
  {
    name: "Darkest Dungeon II",
    sections: [
      dataSection("dd/2/data.js", "DKD2", "heroes", "Kahramanlar", true),
      dataSection("dd/2/data.js", "DKD2", "bosses", "Bosslar", true),
      dataSection("dd/2/data.js", "DKD2", "trinkets", "Trinketler", true),
      dataSection("dd/2/data.js", "DKD2", "items", "Eşyalar", true),
      literalSection("dd/2/tr.js", "DKD2_TR", "heroes", "Türkçe kahraman metinleri"),
      literalSection("dd/2/tr.js", "DKD2_TR", "bosses", "Türkçe boss metinleri"),
      literalSection("dd/2/tr.js", "DKD2_TR", "paths", "Türkçe yol (path) metinleri"),
    ],
  },
  {
    name: "Rainbow Six Siege",
    sections: [
      dataSection("r6/data.js", "R6", "operators", "Operatörler", true),
      dataSection("r6/data.js", "R6", "weapons", "Silahlar", true),
      dataSection("r6/data.js", "R6", "maps", "Haritalar", true),
      literalSection("r6/tr.js", "R6_TR", "abilities", "Türkçe yetenek metinleri"),
      literalSection("r6/tr.js", "R6_TR", "maps", "Türkçe harita metinleri"),
      literalSection("r6/tr.js", "R6_TR", "roles", "Rol adları"),
      literalSection("r6/tr.js", "R6_TR", "weaponTypes", "Silah türü adları"),
    ],
  },
  {
    name: "Mount & Blade II: Bannerlord",
    sections: [
      dataSection("mb/bannerlord/data.js", "BL", "places", "Yerleşimler", true),
      dataSection("mb/bannerlord/data.js", "BL", "troops", "Birlikler", true),
      dataSection("mb/bannerlord/data.js", "BL", "kingdoms", "Krallıklar", true),
      literalSection("mb/bannerlord/tr.js", "BL_TR", "cultures", "Türkçe kültür metinleri"),
      literalSection("mb/bannerlord/tr.js", "BL_TR", "products", "Ürün adları"),
      literalSection("mb/bannerlord/tr.js", "BL_TR", "workshops", "Atölye adları"),
      literalSection("mb/bannerlord/tr.js", "BL_TR", "skills", "Beceri adları"),
    ],
  },
  {
    name: "Mount & Blade: Warband",
    sections: [
      dataSection("mb/warband/data.js", "WB", "places", "Yerleşimler"),
      dataSection("mb/warband/data.js", "WB", "troops", "Birlikler"),
      dataSection("mb/warband/data.js", "WB", "companions", "Yoldaşlar"),
      dataSection("mb/warband/data.js", "WB", "factions", "Fraksiyonlar"),
      literalSection("mb/warband/tr.js", "WB_TR", "factionNotes", "Türkçe fraksiyon notları"),
      literalSection("mb/warband/tr.js", "WB_TR", "objections", "Yoldaş şikâyetleri"),
      literalSection("mb/warband/tr.js", "WB_TR", "skills", "Beceri adları"),
    ],
  },
  {
    name: "The Witcher 3",
    sections: [
      dataSection("witcher3/data.js", "W3", "monsters", "Canavarlar"),
      dataSection("witcher3/data.js", "W3", "regions", "Bölgeler ve harita işaretleri"),
      literalSection("witcher3/tr.js", "W3_TR", "categories", "İşaret türleri"),
      literalSection("witcher3/tr.js", "W3_TR", "classes", "Canavar sınıfları"),
    ],
  },
  {
    name: "Cyberpunk 2077",
    sections: [
      dataSection("cp2077/data.js", "CP", "weapons", "Silahlar"),
      dataSection("cp2077/data.js", "CP", "map.places", "Night City yerleri"),
      literalSection("cp2077/tr.js", "CP_TR", "effect", "İkonik silah etkileri (Türkçe)"),
      literalSection("cp2077/tr.js", "CP_TR", "how", "İkonik silah nasıl alınır (Türkçe)"),
      literalSection("cp2077/tr.js", "CP_TR", "types", "Silah türü adları"),
      literalSection("cp2077/tr.js", "CP_TR", "placeCats", "Yer türü adları"),
    ],
  },
  {
    name: "Project Zomboid",
    sections: [
      dataSection("pz/data.js", "PZ", "occupations", "Meslekler", true),
      dataSection("pz/data.js", "PZ", "traits", "Özellikler", true),
      dataSection("pz/data.js", "PZ", "weapons", "Silahlar", true),
      dataSection("pz/data.js", "PZ", "towns", "Kasabalar", true),
      literalSection("pz/tr.js", "PZ_TR", "occupations", "Türkçe meslek metinleri"),
      literalSection("pz/tr.js", "PZ_TR", "traits", "Türkçe özellik metinleri"),
      literalSection("pz/tr.js", "PZ_TR", "towns", "Türkçe kasaba metinleri"),
    ],
  },
  {
    name: "Sea of Thieves",
    sections: [
      dataSection("sot/data.js", "SOT", "places", "Adalar ve yerler", true),
      literalSection("sot/tr.js", "SOT_COMPANIES", "", "Ticaret şirketleri"),
      literalSection("sot/tr.js", "SOT_SHIPS", "", "Gemiler"),
      literalSection("sot/tr.js", "SOT_TR", "regions", "Bölgeler"),
      literalSection("sot/tr.js", "SOT_TR", "kinds", "Yer türleri"),
    ],
  },
  {
    name: "Brotato",
    sections: [
      dataSection("brotato/data.js", "BRO", "characters", "Karakterler", true),
      dataSection("brotato/data.js", "BRO", "weapons", "Silahlar", true),
      dataSection("brotato/data.js", "BRO", "items", "Eşyalar", true),
      literalSection("brotato/tr.js", "BRO_TR", "stats", "Değer adları"),
      literalSection("brotato/tr.js", "BRO_TR", "classes", "Silah sınıfı adları"),
    ],
  },
  bf("bf1", "Battlefield 1"),
  bf("bf2", "Battlefield 2"),
  bf("bf3", "Battlefield 3"),
  bf("bf4", "Battlefield 4"),
  bf("bfv", "Battlefield V"),
  bf("bf6", "Battlefield 6", true),
  { name: "Battlefield (ortak)", sections: [literalSection("bf/tr.js", "BF_TR", "groups", "Silah grubu adları")] },
];

// Kart görselleri (sitenin ana sayfasındakilerle aynı) ve adreslerde kullanılan kısa adlar.
const WIKIA = "https://static.wikia.nocookie.net";
const GAME_INFO = {
  Site: { id: "site" },
  "Counter-Strike 2": { id: "cs2", image: "../cs2/img/hero.jpg" },
  "League of Legends": { id: "lol", image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg" },
  Valorant: { id: "valorant", image: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png", top: true },
  "Dead by Daylight": { id: "dbd", image: `${WIKIA}/deadbydaylight_gamepedia_en/images/8/81/K01_TheTrapper_Portrait.png/revision/latest/scale-to-width-down/400`, top: true },
  "Darkest Dungeon": { id: "dd1", image: "https://darkestdungeon.wiki.gg/images/Crusader.png", top: true },
  "Darkest Dungeon II": { id: "dd2", image: "https://darkestdungeon.wiki.gg/images/Hwm_wiki.png", top: true },
  "Rainbow Six Siege": { id: "r6", image: `${WIKIA}/rainbowsix/images/4/42/Ash_-_Full_Body.png/revision/latest/scale-to-width-down/400`, top: true },
  "Mount & Blade II: Bannerlord": { id: "bannerlord", image: `${WIKIA}/mountandblade/images/d/d6/Bannerlord_Calradia_Political_map.png/revision/latest/scale-to-width-down/800` },
  "Mount & Blade: Warband": { id: "warband", image: `${WIKIA}/mountandblade/images/8/88/WarbandWorldMap.jpg/revision/latest/scale-to-width-down/800` },
  "The Witcher 3": { id: "witcher3", image: "../witcher3/maps/velen-small.jpg" },
  "Cyberpunk 2077": { id: "cp2077", image: `${WIKIA}/cyberpunk/images/4/42/Night_City_Map_2076_CEMK.jpg/revision/latest/scale-to-width-down/800` },
  "Project Zomboid": { id: "pz", image: "https://pzwiki.net/w/images/1/18/Muldraughmap.png" },
  "Sea of Thieves": { id: "sot", image: `${WIKIA}/seaofthieves_gamepedia/images/6/60/PlunderValley_Map.png/revision/latest/scale-to-width-down/800` },
  Brotato: { id: "brotato", image: "https://brotato.wiki.spellsandguns.com/images/f/fa/Brawler.png", top: true },
  "Battlefield 1": { id: "bf1", image: `${WIKIA}/battlefield/images/6/69/BF1_Amiens_Icon.png/revision/latest/scale-to-width-down/800` },
  "Battlefield 2": { id: "bf2", image: `${WIKIA}/battlefield/images/5/57/BF2_Dalian_Plant.png/revision/latest/scale-to-width-down/800` },
  "Battlefield 3": { id: "bf3", image: `${WIKIA}/battlefield/images/d/db/Caspian-border-promo.jpg/revision/latest/scale-to-width-down/800` },
  "Battlefield 4": { id: "bf4", image: `${WIKIA}/battlefield/images/7/73/Dawnbreaker.jpg/revision/latest/scale-to-width-down/800` },
  "Battlefield V": { id: "bfv", image: `${WIKIA}/battlefield/images/9/96/Battlefield_V_Aerodrome_Article_Header.png/revision/latest/scale-to-width-down/800` },
  "Battlefield 6": { id: "bf6", image: `${WIKIA}/battlefield/images/0/0d/Battlefield_6_Empire_State.jpg/revision/latest/scale-to-width-down/800` },
  "Battlefield (ortak)": { id: "bf", image: `${WIKIA}/battlefield/images/6/69/BF1_Amiens_Icon.png/revision/latest/scale-to-width-down/800` },
};

// Bölüm adresi: edit.html?oyun=<kısa ad>&bolum=<sıra>
for (const game of GAMES) {
  Object.assign(game, GAME_INFO[game.name]);
  game.sections.forEach((section, s) => {
    section.href = section.href || `edit.html?oyun=${game.id}&bolum=${s}`;
  });
}
