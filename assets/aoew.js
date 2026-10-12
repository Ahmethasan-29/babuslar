// Age of Empires I / III ve Age of Mythology sayfası (ortak): her medeniyet ya da ana tanrı bir kart.
// Veri: <klasör>/data.js içindeki AOEW (Age of Empires Wiki'den). Metinler İngilizce, arayüz Türkçe.
const L = (tr, en) => (IS_EN ? en : tr);

// Wiki bölüm başlıklarının Türkçesi
const SECTION_TR = {
  "Civilization bonuses": "Medeniyet bonusları",
  "Team bonus": "Takım bonusu",
  "Missing technologies": "Eksik teknolojiler",
  "Missing units": "Eksik birlikler",
  "Unique units": "Özel birlikler",
  "Unique unit": "Özel birlik",
  "Unique building": "Özel bina",
  "Unique buildings": "Özel binalar",
  "Unique technologies": "Özel teknolojiler",
  "Royal Guard units": "Muhafız birlikleri",
  Politicians: "Politikacılar",
  Revolutions: "Devrimler",
  "God power": "Tanrı gücü",
  "Myth technology": "Mit teknolojisi",
  Heroes: "Kahramanlar",
  Bonuses: "Bonuslar",
  "Home City Cards": "Ana şehir kartları",
};
// Kutudaki alan adlarının İngilizcesi (Türkçeleri veride)
const keyEn = (k) => k.replace(/([a-z])([A-Z])/g, "$1 $2");
const sectionTitle = (t) => (IS_EN ? t : SECTION_TR[t] || t);
// İlk bölüm (bonuslar) açık, diğerleri kapalı gelir.
const OPEN = /bonus|God power/i;

function card(c) {
  return el(
    "article",
    { class: "build-card aoe-civ", id: c.id },
    el("div", { class: "aoe-head" }, c.image ? el("img", { class: "aoe-emblem", src: c.image, alt: "", loading: "lazy" }) : null, el("div", {}, el("h3", {}, c.name))),
    c.intro ? el("p", { class: "coh-text" }, c.intro.split("\n")[0]) : null,
    c.info?.length
      ? el("dl", { class: "aoew-info" }, c.info.map((i) => el("div", {}, el("dt", {}, IS_EN ? keyEn(i.key) : i.label), el("dd", {}, i.value))))
      : null,
    (c.sections || []).map((s) =>
      el("details", { class: "dd-uses aoew-section", open: OPEN.test(s.title) || null }, el("summary", {}, sectionTitle(s.title)), el("ul", {}, s.items.map((x) => el("li", {}, x))))
    )
  );
}

// Age of Mythology'de tanrılar medeniyete göre gruplanır.
const civOf = (c) => c.info?.find((i) => i.key === "Civilization")?.value.split("\n")[0];
const groupNames = [...new Set(AOEW.civs.map(civOf).filter(Boolean))].sort();
listPage({
  items: AOEW.civs,
  groups: groupNames.map((g) => ({ id: g, label: g, test: (c) => civOf(c) === g })),
  noun: groupNames.length ? ["tanrı", "gods"] : ["medeniyet", "civilizations"],
  text: (c) => `${c.name} ${c.intro} ${(c.info || []).map((i) => i.value).join(" ")} ${(c.sections || []).flatMap((s) => s.items).join(" ")}`,
  card,
});
