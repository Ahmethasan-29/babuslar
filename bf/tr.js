// Battlefield oyunlarının ortak Türkçe metinleri. Silah ve harita adları oyundaki gibi İngilizce kalır.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const BF_TR = {
  // Silah grupları (wikinin gezinme şablonlarındaki adlar)
  groups: {
    Assault: "Taarruz",
    Medic: "Sıhhiye",
    Support: "Destek",
    Scout: "Keşif",
    Recon: "Keşif",
    Engineer: "İstihkâm",
    "Special Forces": "Özel kuvvetler",
    Sniper: "Keskin nişancı",
    "Anti-Tank": "Tanksavar",
    "Spec Ops": "Özel harekât",
    "All Kits": "Tüm sınıflar",
    "All kits": "Tüm sınıflar",
    "All Classes": "Tüm sınıflar",
    "Elite Kits": "Elit sınıflar",
    "Assault Rifles": "Piyade tüfekleri",
    Carbines: "Karabinalar",
    "Submachine Guns": "Hafif makineli",
    "Light Machine Guns": "Hafif makineli tüfekler",
    "Machine Guns": "Makineli tüfekler",
    "Designated Marksman Rifles": "Nişancı tüfekleri",
    "Marksman Rifles": "Nişancı tüfekleri",
    "Sniper Rifles": "Keskin nişancı tüfekleri",
    "Bolt-Action Rifles": "Sürgülü tüfekler",
    Shotguns: "Pompalılar",
    Sidearms: "Tabancalar",
    Pistols: "Tabancalar",
    Handguns: "Tabancalar",
    "Personal Defense Weapons": "Kişisel savunma silahları",
    "Battle Rifles": "Muharebe tüfekleri",
    "Self-Loading Rifles": "Yarı otomatik tüfekler",
    "Semi-Automatic Rifles": "Yarı otomatik tüfekler",
    Melee: "Yakın dövüş",
    Gadgets: "Ekipmanlar",
    Grenades: "El bombaları",
    Explosives: "Patlayıcılar",
    Launchers: "Roketatarlar",
    "Rocket Launchers": "Roketatarlar",
    "Battle Pickup": "Sahada bulunan silahlar",
    "Battle Pickups": "Sahada bulunan silahlar",
    "Melee Weapons": "Yakın dövüş silahları",
    Others: "Diğer",
  },
};
// "Assault Kit" → "Taarruz sınıfı"
const groupName = (g) => {
  if (IS_EN) return g;
  if (BF_TR.groups[g]) return BF_TR.groups[g];
  const kit = g.match(/^(.+?) (?:Kit|Class)$/i);
  if (kit) {
    const base = Object.entries(BF_TR.groups).find(([k]) => k.toLowerCase() === kit[1].toLowerCase());
    if (base) return `${base[1]} sınıfı`;
  }
  return g;
};
// Oyundan çıkarılmış ya da kullanılmayan silahlar listede gösterilmez.
const HIDDEN_GROUP = /^cut |unused|removed|cancelled/i;
const thumb = (url, w) => (url ? url.replace(/\/revision\/latest.*$/, `/revision/latest/scale-to-width-down/${w}`) : null);
