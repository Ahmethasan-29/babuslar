// Krallıklar ve birlik ağaçları (oyunun upgrade tanımlarından).
const root = document.getElementById("faction");
const tabs = document.getElementById("tabs");
const troops = Object.fromEntries(WB.troops.map((t) => [t.id, t]));
const facName = (f) => (IS_EN ? f.name : WB_TR.factions[f.id]);
let current = WB.factions.find((f) => f.id === new URLSearchParams(location.search).get("k")) || WB.factions[0];

// Ağaç: her birlik, yükselebileceği birliklerle birlikte iç içe gösterilir.
function node(id) {
  const t = troops[id];
  return el(
    "li",
    {},
    el("div", { class: `mb-troop ${t.kind}` }, el("strong", {}, t.name), el("span", { class: "tile-sub" }, `${wbKind(t.kind)} · ${L("seviye", "level")} ${t.level}`)),
    t.up.length ? el("ul", {}, t.up.map(node)) : null
  );
}

function render() {
  tabs.replaceChildren(
    ...WB.factions.map((f) => {
      const b = el("button", { class: "chip", type: "button", "aria-pressed": String(f === current), onclick: () => ((current = f), render()) }, facName(f));
      b.prepend(el("span", { class: "mb-swatch", style: `--c:${f.color}` }));
      return b;
    })
  );
  const own = (type) => WB.places.filter((p) => p.faction === current.id && p.type === type).length;
  fillChildren(root, 
    el(
      "section",
      { class: "build-card mb-faction", style: `--c:${current.color}` },
      el("h2", {}, facName(current)),
      el("p", {}, L(WB_TR.factionNotes[current.id], WB_EN.factionNotes[current.id])),
      el("p", { class: "tile-sub" }, L(`Başlangıçta ${own("town")} şehir, ${own("castle")} kale ve ${own("village")} köy. `, `At the start: ${own("town")} towns, ${own("castle")} castles and ${own("village")} villages. `), el("a", { href: "harita.html" }, L("Haritada gör", "See on the map")))
    ),
    el(
      "section",
      { class: "section" },
      el("h2", {}, L("Birlik ağacı", "Troop tree")),
      el(
        "p",
        { class: "tile-sub" },
        L(
          "Birlikler krallığın köylerinden toplanır; savaşta tecrübe kazanınca para karşılığı bir üst birliğe yükseltilir. İki dal varsa hangisine yükselteceğini sen seçersin.",
          "Troops are recruited in the kingdom's villages and upgraded for money once they gain experience. Where the tree splits, you choose the branch."
        )
      ),
      el("ul", { class: "mb-tree" }, current.roots.map(node))
    )
  );
}
render();
