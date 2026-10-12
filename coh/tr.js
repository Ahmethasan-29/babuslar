// Company of Heroes oyunlarının (coh1, coh2, coh3) ortak metinleri ve yardımcıları.
// Oyun verisi her oyunun data.js dosyasındaki COH sabitinde; adlar ve açıklamalar { tr, en } çiftleridir.
const L = (tr, en) => (IS_EN ? en : tr);
// { tr, en } ya da düz yazı → sitenin dilindeki metin.
const T = (x) => (x == null ? "" : typeof x === "string" ? x : (IS_EN ? x.en || x.tr : x.tr || x.en) || "");

const COH_TR = {
  cats: {
    infantry: ["Piyade", "Infantry"],
    team_weapons: ["Takım silahları", "Team weapons"],
    vehicles: ["Araçlar", "Vehicles"],
    emplacements: ["Mevziler", "Emplacements"],
  },
  // [Türkçe, İngilizce, kısaltma]
  resources: {
    manpower: ["Adam gücü", "Manpower", "MP"],
    munition: ["Mühimmat", "Munitions", "MU"],
    fuel: ["Yakıt", "Fuel", "FU"],
    popcap: ["Nüfus", "Population", "POP"],
  },
  sides: { allies: ["Müttefikler", "Allies"], axis: ["Mihver", "Axis"] },
  points: {
    fuel: ["Yakıt noktası", "Fuel points"],
    munitions: ["Mühimmat noktası", "Munitions points"],
    strategic: ["Stratejik nokta", "Strategic points"],
    victory: ["Zafer noktası", "Victory points"],
  },
};

const catName = (c) => L(...(COH_TR.cats[c] || [c, c]));
const factionOf = (id) => COH.factions.find((f) => f.id === id);
const factionName = (id) => T(factionOf(id)?.name) || id;
const commanderLabel = (plural) => T(plural ? COH.commander.plural : COH.commander);

// Fiyat etiketleri: "270 MP", "90 FU", "8 POP" (sıfır olanlar gösterilmez).
function costChips(cost) {
  if (!cost) return null;
  const chips = Object.entries(COH_TR.resources)
    .filter(([k]) => cost[k])
    .map(([k, [tr, en, short]]) => el("span", { class: `coh-cost ${k}`, title: L(tr, en) }, el("b", {}, cost[k]), ` ${short}`));
  return chips.length ? el("div", { class: "coh-costs" }, chips) : null;
}

// Satır sonları korunarak metin paragrafı.
const para = (x, cls) => (T(x) ? el("p", { class: cls || "coh-text" }, T(x)) : null);

// Adres çubuğundaki ?fraksiyon=… (sayfa yenilenince seçim kalsın).
function urlParam(name, value) {
  const url = new URL(location.href);
  if (value == null) return url.searchParams.get(name);
  if (value === "all") url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  history.replaceState(null, "", url);
}

// Fraksiyon düğmeleri (Hepsi + her fraksiyon, renkli nokta ile).
function factionChips(current, count, onPick) {
  return [
    el("button", { class: "chip", type: "button", "aria-pressed": String(current === "all"), onclick: () => onPick("all") }, `${L("Hepsi", "All")} (${count("all")})`),
    ...COH.factions.map((f) =>
      el(
        "button",
        { class: "chip", type: "button", "aria-pressed": String(current === f.id), onclick: () => onPick(f.id) },
        el("span", { class: "coh-dot", style: `background:${f.color}` }),
        `${T(f.name)} (${count(f.id)})`
      )
    ),
  ];
}
