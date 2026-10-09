// valorant-api.com: Valorant'ın oyun dosyalarından çıkarılan veriler (ajanlar, yetenekler, haritalar, infolar).
// İsimler İngilizce (oyundaki gibi); açıklamalar site dilinde (Türkçe ya da İngilizce) alınır.
const VAPI = "https://valorant-api.com/v1";

// Yetenek yuvalarının oyundaki varsayılan tuşları.
const SLOT_KEYS = { Ability1: "Q", Ability2: "E", Grenade: "C", Ultimate: "X", Passive: "Pasif" };
const SLOT_ORDER = ["Passive", "Grenade", "Ability1", "Ability2", "Ultimate"];

const vapiCache = new Map();

function vapi(path, lang) {
  const url = `${VAPI}/${path}${path.includes("?") ? "&" : "?"}language=${lang}`;
  if (!vapiCache.has(url)) vapiCache.set(url, fetchJson(url).then((r) => r.data));
  return vapiCache.get(url);
}

// Oynanabilir ajanlar: İngilizce isimler + Türkçe açıklamalar, rol ve yetenekler.
async function getAgents() {
  const [en, tr] = await Promise.all([
    vapi("agents?isPlayableCharacter=true", "en-US"),
    vapi("agents?isPlayableCharacter=true", IS_EN ? "en-US" : "tr-TR"),
  ]);
  const trById = new Map(tr.map((a) => [a.uuid, a]));
  return en
    .map((a) => {
      const t = trById.get(a.uuid) || a;
      const trAbilities = new Map((t.abilities || []).map((ab) => [ab.slot, ab]));
      return {
        id: a.uuid,
        name: a.displayName,
        description: t.description,
        role: t.role?.displayName || a.role?.displayName || "",
        roleIcon: a.role?.displayIcon,
        icon: a.displayIcon,
        portrait: a.fullPortrait,
        background: a.background,
        colors: a.backgroundGradientColors || [],
        abilities: (a.abilities || [])
          .filter((ab) => SLOT_KEYS[ab.slot])
          .sort((x, y) => SLOT_ORDER.indexOf(x.slot) - SLOT_ORDER.indexOf(y.slot))
          .map((ab) => {
            const trAb = trAbilities.get(ab.slot) || ab;
            return {
              key: SLOT_KEYS[ab.slot],
              name: ab.displayName,
              trName: titleCase(trAb.displayName),
              description: trAb.description,
              icon: ab.displayIcon || a.displayIcon,
            };
          }),
      };
    })
    .sort((x, y) => x.name.localeCompare(y.name, "en"));
}

// Rekabetçi haritalar: info noktası olanlar (Ölüm Kalım, Takım Ölüm Kalım ve eğitim haritaları elenir).
async function getMaps() {
  const maps = await vapi("maps", "en-US");
  return maps
    .filter((m) => m.xMultiplier && (m.callouts || []).length > 5)
    .map((m) => ({
      id: m.displayName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      name: m.displayName,
      sites: m.tacticalDescription || "",
      radar: m.displayIcon,
      photo: m.splash,
      // Oyun koordinatı radar görüntüsünde 0–1 arası orana çevrilir (x ve y oyunda yer değiştirir).
      callouts: m.callouts.map((c) => ({
        group: c.superRegionName,
        name: c.regionName,
        at: [c.location.y * m.xMultiplier + m.xScalarToAdd, c.location.x * m.yMultiplier + m.yScalarToAdd],
      })),
    }))
    .sort((x, y) => x.name.localeCompare(y.name, "en"));
}

// "KANKUŞ" → "Kankuş"
function titleCase(text) {
  return String(text || "")
    .toLocaleLowerCase("tr")
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase("tr"));
}
