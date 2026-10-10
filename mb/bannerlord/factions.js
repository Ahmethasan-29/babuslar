// Kültürler, krallıklar ve birlik ağaçları (wikideki "Upgrades To" bilgisinden).
const root = document.getElementById("culture");
const tabs = document.getElementById("tabs");
const troops = Object.fromEntries(BL.troops.map((t) => [t.id, t]));
const CULTURES = Object.keys(BL_TR.cultures);
const kName = (k) => (IS_EN ? k : BL_TR.kingdoms[k] || k);
const cName = (c) => (IS_EN ? (c === "Empire" ? "Empire (Northern, Western, Southern)" : c) : BL_TR.cultures[c].name);
const kingdomsOf = (c) => (c === "Empire" ? ["Northern Empire", "Western Empire", "Southern Empire"] : [c]);
let current = CULTURES.includes(new URLSearchParams(location.search).get("k")) ? new URLSearchParams(location.search).get("k") : CULTURES[0];

// En yüksek iki beceri: birliğin neyde iyi olduğunu hızlıca gösterir.
function topSkills(t) {
  return Object.entries(t.skills || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${IS_EN ? k : BL_TR.skills[k] || k} ${v}`)
    .join(" · ");
}

function node(id, seen = new Set()) {
  const t = troops[id];
  if (!t || seen.has(id)) return null;
  seen.add(id);
  const meta = [t.kind ? blKind(t.kind) : null, t.tier ? `${L("kademe", "tier")} ${t.tier}` : null, t.wage ? L(`${t.wage} dinar/gün`, `${t.wage} denars/day`) : null].filter(Boolean).join(" · ");
  return el(
    "li",
    {},
    el(
      "div",
      { class: `mb-troop bl-troop ${t.kind || ""}` },
      t.image ? el("img", { src: t.image.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/96"), alt: "", loading: "lazy" }) : null,
      el("div", {}, el("strong", {}, t.name, t.noble ? el("span", { class: "badge mb-noble" }, L("Soylu", "Noble")) : null), el("span", { class: "tile-sub" }, meta), topSkills(t) ? el("span", { class: "tile-sub" }, topSkills(t)) : null)
    ),
    t.up.length ? el("ul", {}, t.up.map((u) => node(u, seen))) : null
  );
}

function render() {
  tabs.replaceChildren(...CULTURES.map((c) => el("button", { class: "chip", type: "button", "aria-pressed": String(c === current), onclick: () => ((current = c), render()) }, cName(c))));
  const own = BL.troops.filter((t) => t.culture === current);
  const targets = new Set(own.flatMap((t) => t.up));
  // Kökler: başka birlikten yükseltilmeyenler. Köylü (Peasant) en başa, soylu hat (Noble) sona.
  const roots = own.filter((t) => !targets.has(t.id)).sort((a, b) => (a.noble - b.noble) || ((a.tier || 0) - (b.tier || 0)));
  const fiefs = (type) => BL.places.filter((p) => kingdomsOf(current).includes(p.kingdom) && p.type === type).length;
  root.replaceChildren(
    el(
      "section",
      { class: "build-card mb-faction", style: `--c:${BL.kingdoms.find((k) => k.id === kingdomsOf(current)[0])?.color}` },
      el("h2", {}, cName(current)),
      el("p", {}, L(BL_TR.cultures[current].note, BL_EN.cultures[current])),
      el(
        "p",
        { class: "tile-sub" },
        kingdomsOf(current).map((k) => kName(k)).join(", "),
        L(`: başlangıçta ${fiefs("town")} şehir, ${fiefs("castle")} kale, ${fiefs("village")} köy. `, `: at the start ${fiefs("town")} towns, ${fiefs("castle")} castles, ${fiefs("village")} villages. `),
        el("a", { href: "harita.html" }, L("Haritada gör", "See on the map"))
      )
    ),
    el(
      "section",
      { class: "section" },
      el("h2", {}, L("Birlik ağacı", "Troop tree")),
      el(
        "p",
        { class: "tile-sub" },
        L(
          "Askerler köy ve şehirlerdeki önemli kişilerden (notable) toplanır; onlarla ilişkin iyiyse daha çok ve daha iyi asker verirler. “Soylu” hat, nadiren çıkan ve soylu ailelerden gelen güçlü birliklerdir. Birlikler savaşta tecrübe kazanınca ordu ekranından yükseltilir.",
          "Troops are recruited from notables in villages and towns; better relations give more and better recruits. The “Noble” line is rare, strong troops from noble families. Troops are upgraded in the Party screen once they gain experience."
        )
      ),
      el("ul", { class: "mb-tree" }, roots.map((t) => node(t.id)))
    )
  );
}
render();
