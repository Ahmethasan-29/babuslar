// Brotato: Türkçe metinler. Karakter, silah ve eşya adları oyundaki gibi İngilizce kalır.
// Efekt metinleri wikideki gibi İngilizcedir; yalnızca "sayı + stat adı" satırları (ör. "+5 Max HP") Türkçeye çevrilir.
// Site diline göre metin: L("Türkçe", "English").
const L = (tr, en) => (IS_EN ? en : tr);

const BRO_TR = {
  stats: {
    "Max HP": "Maks. Can",
    "HP Regeneration": "Can Yenilenmesi",
    "Life Steal": "Can Çalma",
    "% Life Steal": "% Can Çalma",
    Damage: "Hasar",
    "% Damage": "% Hasar",
    "Melee Damage": "Yakın Dövüş Hasarı",
    "Ranged Damage": "Menzilli Hasar",
    "Elemental Damage": "Element Hasarı",
    "Attack Speed": "Saldırı Hızı",
    "% Attack Speed": "% Saldırı Hızı",
    "Crit Chance": "Kritik Şansı",
    "% Crit Chance": "% Kritik Şansı",
    Engineering: "Mühendislik",
    Range: "Menzil",
    Armor: "Zırh",
    Dodge: "Kaçınma",
    "% Dodge": "% Kaçınma",
    Speed: "Hız",
    "% Speed": "% Hız",
    Luck: "Şans",
    Harvesting: "Hasat",
    Knockback: "Geri İtme",
    "XP Gain": "XP Kazancı",
    "% XP Gain": "% XP Kazancı",
    "pickup range": "toplama menzili",
    "% pickup range": "% toplama menzili",
    "% Enemy health": "% düşman canı",
    "% Enemy speed": "% düşman hızı",
    "% Enemies": "% düşman",
    Curse: "Lanet",
  },
  // ⟨MeleeDamage⟩ gibi stat simgeleri
  icons: {
    MeleeDamage: ["yakın dövüş", "melee"],
    RangedDamage: ["menzilli", "ranged"],
    ElementalDamage: ["element", "elemental"],
    Armor: ["zırh", "armor"],
    Engineering: ["mühendislik", "engineering"],
    Range: ["menzil", "range"],
    AttackSpeed: ["saldırı hızı", "attack speed"],
    Level: ["seviye", "level"],
    Luck: ["şans", "luck"],
    "Max HP": ["maks. can", "max HP"],
    MaxHP: ["maks. can", "max HP"],
    Speed: ["hız", "speed"],
    Dodge: ["kaçınma", "dodge"],
    Harvesting: ["hasat", "harvesting"],
    Curse: ["lanet", "curse"],
  },
  classes: {
    Blade: "Kesici",
    Blunt: "Künt",
    Elemental: "Element",
    Ethereal: "Hayalet",
    Explosive: "Patlayıcı",
    Gun: "Silah",
    Heavy: "Ağır",
    Legendary: "Efsanevi",
    Medical: "Tıbbi",
    Medieval: "Ortaçağ",
    Musical: "Müzik",
    Naval: "Denizci",
    Precise: "Hassas",
    Primitive: "İlkel",
    Support: "Destek",
    Tool: "Alet",
    Unarmed: "Silahsız",
  },
  rarity: [
    ["Seviye I (sıradan)", "Tier I (common)"],
    ["Seviye II (nadir)", "Tier II (rare)"],
    ["Seviye III (destansı)", "Tier III (epic)"],
    ["Seviye IV (efsanevi)", "Tier IV (legendary)"],
  ],
  rarityName: [
    ["Sıradan", "Common"],
    ["Nadir", "Rare"],
    ["Destansı", "Epic"],
    ["Efsanevi", "Legendary"],
  ],
  phrases: [
    [/when you level up/g, "seviye atladığında"],
    [/You start with/g, "Başlangıçta"],
    [/Unlocked by default/g, "Baştan açık"],
    [/^Default$/g, "Baştan açık"],
  ],
};

// "<b class=pos>+5</b> % Dodge" gibi satırları Türkçeye çevirir; karışık cümleleri olduğu gibi bırakır.
function trStats(html) {
  if (IS_EN || !html) return html;
  return html
    .split("<br>")
    .map((line) => {
      const plain = line.replace(/<[^>]+>/g, "").trim();
      const m = plain.match(/^([+\-]?\d+(?:\.\d+)?%?)\s*(.+?)$/);
      if (m && BRO_TR.stats[m[2]]) return line.replace(m[2], BRO_TR.stats[m[2]]);
      // Kalın yazılmış "+2 Melee Damage" parçaları da çevrilir ("… when you level up" gibi satırlarda).
      let out = line.replace(/(<b[^>]*>)([+\-]?\d+(?:\.\d+)?%?)\s+([^<]+)(<\/b>)/g, (all, a, n, s, b) => (BRO_TR.stats[s.trim()] ? `${a}${n} ${BRO_TR.stats[s.trim()]}${b}` : all));
      for (const [rx, tr] of BRO_TR.phrases) out = out.replace(rx, tr);
      return out;
    })
    .join("<br>");
}

// ⟨MeleeDamage⟩ → "yakın dövüş"; "45(100%⟨MeleeDamage⟩75%⟨Curse⟩)" → "45 (+100% yakın dövüş, +75% lanet)".
const iconName = (k) => L(...(BRO_TR.icons[k.replace(/\s+/g, "")] || BRO_TR.icons[k] || [k, k]));
function statIcons(text) {
  return (text || "")
    .replace(/\(((?:\+?\d+(?:\.\d+)?%⟨[^⟩]+⟩)+)\)/g, (_, inner) => ` (${[...inner.matchAll(/\+?(\d+(?:\.\d+)?%)⟨([^⟩]+)⟩/g)].map((m) => `+${m[1]} ${iconName(m[2])}`).join(", ")})`)
    .replace(/⟨([^⟩]+)⟩/g, (_, k) => ` ${iconName(k)}`);
}

// Wikiden gelen sade HTML'i (yalnızca <b class> ve <br>) güvenle düğümlere çevirir.
function richText(html) {
  const box = el("span", { class: "bro-rich" });
  for (const [i, line] of (html || "").split("<br>").entries()) {
    if (i) box.append(el("br"));
    for (const part of line.split(/(<b(?: class="[a-z0-9]+")?>.*?<\/b>)/)) {
      const m = part.match(/^<b(?: class="([a-z0-9]+)")?>(.*?)<\/b>$/);
      if (m) box.append(el("b", { class: m[1] || "" }, statIcons(m[2].replace(/<[^>]+>/g, ""))));
      else if (part) box.append(statIcons(part.replace(/<[^>]+>/g, "")));
    }
  }
  return box;
}
