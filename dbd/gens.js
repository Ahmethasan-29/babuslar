// Haritalardaki bilinen jeneratör noktaları (Dead by Daylight Wiki'deki harita sayfalarından).
// Her maçta 7 jeneratör, haritadaki olası noktalardan rastgele seçilerek çıkar; burada yalnızca wikide yazan
// sabit (sure: true, her maç orada) ve olası (sure: false, bazı maçlarda orada) noktalar var.
// Listede olmayan haritalar için wikide sabit nokta bilgisi yoktur.
const DBD_GENS = {
  "Blood Lodge": [{ sure: true, tr: "Lodge (kulübe): verandada", en: "The Lodge: on the porch" }],
  "Gas Heaven": [{ sure: true, tr: "Benzin istasyonu: garajın içinde; tamir edilince garaj kapısı açılır", en: "The Gas Station: inside the garage; repairing it opens the garage door" }],
  "Wretched Shop": [{ sure: true, tr: "Garaj: içeride", en: "The Garage: inside" }],
  "Grim Pantry": [
    { sure: true, tr: "Pantry: üst katta", en: "The Pantry: on the upper floor" },
    { sure: true, tr: "Cursed Cabin: üst katta; jeneratör tamir edilene kadar binaya yalnızca yandaki merdivenden çıkılır", en: "The Cursed Cabin: on the upper floor; until it is repaired the building is only reachable by the side staircase" },
  ],
  "The Pale Rose": [
    { sure: true, tr: "Pale Rose (gemi): üst katta", en: "The Pale Rose: on the upper floor" },
    { sure: false, tr: "Shrimp Boat (karides teknesi)", en: "The Shrimp Boat" },
  ],
  "Fractured Cowshed": [{ sure: true, tr: "Ahır (Barn): içeride", en: "The Barn: inside" }],
  "Rancid Abattoir": [{ sure: false, tr: "Mezbaha (Slaughterhouse)", en: "The Slaughterhouse" }],
  "The Thompson House": [{ sure: true, tr: "Çiftlik evi: üst katta", en: "The Farmhouse: on the upper floor" }],
  "Torment Creek": [{ sure: true, tr: "Silo: içeride", en: "The Silo: inside" }],
  "Disturbed Ward": [{ sure: true, tr: "Shock Therapy Centre (ana bina): ikinci katta", en: "The Shock Therapy Centre: on the second floor" }],
  "Father Campbell's Chapel": [
    { sure: true, tr: "Şapel: üst katta", en: "The Chapel: on the upper floor" },
    { sure: false, tr: "Clown'ın karavanı", en: "The Clown's Caravan" },
  ],
  "Nostromo Wreckage": [
    { sure: true, tr: "Gemi: yemekhanede (Mess Hall)", en: "The Nostromo: in the Mess Hall" },
    { sure: true, tr: "Gemi: sol kanadın en arkasında", en: "The Nostromo: at the very back of the left wing" },
    { sure: false, tr: "Gemi: sağ kanat koridorunun ortasında, sağ duvarın yanında (pencere ya da atlama noktasının yanı)", en: "The Nostromo: halfway down the right wing hallway, by the right wall next to a window or drop" },
  ],
  "Toba Landing": [
    { sure: true, tr: "Base (uzay gemisi): en üst güvertede (3. kat)", en: "The Base: on the top deck (third floor)" },
    { sure: true, tr: "Alien Flower (dev çiçek)", en: "The Alien Flower" },
    { sure: true, tr: "Space Rover (uzay aracı)", en: "The Space Rover" },
  ],
  "Eyrie of Crows": [{ sure: true, tr: "Eyrie (anıt mezar)", en: "The Eyrie" }],
  "The Game": [{ sure: true, tr: "Banyo (Bathroom); ayrıca tüm jeneratörler sürgülü kapılara bağlıdır, kapalı bir kapının yakınında bitmemiş bir jeneratör vardır", en: "The Bathroom; all Generators are also linked to sliding doors, so a closed door means an unfinished Generator is nearby" }],
  "Dead Dawg Saloon": [
    { sure: true, tr: "Saloon: üst verandada", en: "The Saloon: on its upper porch" },
    { sure: true, tr: "Darağacı (Gallows): asılı adamın yanında; tamir edilince iki yanındaki kapaklar açılır ve Survivor'lar aşağı düşer", en: "The Gallows: next to the hanged man; when repaired, trapdoors on both sides open and drop Survivors" },
    { sure: true, tr: "Yapı (structure): ya yola doğru ya da arkadaki ahşap kulübenin yanında", en: "The structure: either towards the path or near the wooden shack at the back" },
  ],
  "Lampkin Lane": [{ sure: false, tr: "Myers'ın evi: ikinci katta", en: "Myers' House: on the second floor" }],
  "The Underground Complex": [
    { sure: true, tr: "Isolation Room (sorgu odalarının yanında)", en: "The Isolation Room beside the Interrogation Rooms" },
    { sure: false, tr: "Rift Lab: üst katta", en: "The Rift Lab: on the upper floor" },
  ],
  "Mount Ormond Resort": [{ sure: true, tr: "Chalet (dağ evi)", en: "The Chalet" }],
  "Raccoon City Police Station East Wing": [{ sure: true, tr: "Ana salon: ya aşağıda ön masanın yanında ya da merdivenin yarısında heykelin dibinde", en: "Main Hall: either down near the front desk or half-way up at the foot of the statue" }],
  "Raccoon City Police Station West Wing": [{ sure: true, tr: "Ana salon: ya aşağıda ön masanın yanında ya da merdivenin yarısında heykelin dibinde", en: "Main Hall: either down near the front desk or half-way up at the foot of the statue" }],
  "Mother's Dwelling": [{ sure: true, tr: "Av kulübesi (Hunting Cabin): ikinci kat balkonunda", en: "The Hunting Cabin: on the second floor balcony" }],
  "The Temple of Purgation": [{ sure: true, tr: "Tapınak: içeride; tamir edilince tapınaktaki yapılar ve kapılar açılır", en: "The Temple: inside; repairing it activates structures and doors in the Temple" }],
  "Midwich Elementary School": [
    { sure: true, tr: "Avlu (Courtyard)", en: "The Courtyard" },
    { sure: false, tr: "Kimya laboratuvarı (duvarda periyodik tablo olan oda)", en: "The Chemistry Laboratory (periodic table on the wall)" },
    { sure: false, tr: "Müzik odası (piyanolu oda)", en: "The Music Room (with the piano)" },
  ],
  "Badham Preschool I": [{ sure: true, tr: "Anaokulu binası (Kindergarten)", en: "The Kindergarten" }],
  "The Shattered Square": [
    { sure: true, tr: "Toplantı salonu (Gathering Hall): üst katta", en: "The Gathering Hall: on the upper floor" },
    { sure: false, tr: "Pazar yeri (Marketplace): yanında", en: "Next to the Marketplace" },
    { sure: false, tr: "Darağacı (Gallows): yanında", en: "Next to the Gallows" },
  ],
  "Coal Tower": [{ sure: true, tr: "Depo (Warehouse): üst katta", en: "The Warehouse: on the upper floor" }],
  "Groaning Storehouse": [{ sure: false, tr: "Depo (Storehouse)", en: "The Storehouse" }],
  "Ironworks of Misery": [{ sure: true, tr: "Dökümhane (Foundry): alt katta", en: "The Foundry: on the lower floor" }],
  "Garden of Joy": [
    { sure: true, tr: "Malikâne: üst katta (her maç)", en: "The Mansion: on the upper floor (every match)" },
    { sure: false, tr: "Otopark", en: "The Parking Lot" },
    { sure: false, tr: "Çardak (Gazebo)", en: "The Gazebo" },
    { sure: false, tr: "Sera (Greenhouse)", en: "The Greenhouse" },
    { sure: false, tr: "Ağaç ev (Treehouse)", en: "The Treehouse" },
    { sure: false, tr: "Tren vagonu (Train Car)", en: "The Train Car" },
  ],
  "Greenville Square": [
    { sure: true, tr: "Sinema (Theatre): makine dairesinde; tamir edilince projektör kısa bir film oynatır", en: "The Theatre: in the projection room; repairing it makes the projector play a short film" },
    { sure: false, tr: "Hacı heykeli (Pilgrim Statue): heykelin yanında", en: "The Pilgrim Statue: next to the statue" },
  ],
  "Family Residence": [{ sure: true, tr: "Aile evi: içeride", en: "The Family Residence: inside" }],
  "Sanctum of Wrath": [{ sure: true, tr: "Tapınak (Shrine)", en: "The Shrine" }],
};
for (const n of ["II", "III", "IV", "V"]) DBD_GENS[`Badham Preschool ${n}`] = DBD_GENS["Badham Preschool I"];
