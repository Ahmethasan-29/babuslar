// Company of Heroes birlikleri (ortak sayfa): fraksiyona ve türe göre süzme, arama.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const CATS = Object.keys(COH_TR.cats).filter((c) => COH.units.some((u) => u.cat === c));
// Sıra: fraksiyonların sırası, sonra tür, sonra adam gücü.
const order = (u) => [COH.factions.findIndex((f) => f.id === u.faction), CATS.indexOf(u.cat), u.cost?.manpower || 0];
const UNITS = [...COH.units].sort((a, b) => { const x = order(a), y = order(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
let faction = COH.factions.some((f) => f.id === urlParam("fraksiyon")) ? urlParam("fraksiyon") : "all";
let cat = "all";

function card(u) {
  const infantry = u.cat === "infantry" || u.cat === "team_weapons";
  const facts = [
    u.size && infantry ? L(`En fazla ${u.size} asker`, `Up to ${u.size} men`) : null,
    u.time ? L(`Üretim ${u.time} sn`, `Build time ${u.time}s`) : null,
    u.buildings?.length ? u.buildings.map(T).join(", ") : null,
  ].filter(Boolean);
  return el(
    "article",
    { class: "build-card coh-unit", id: u.id },
    el(
      "div",
      { class: "coh-unit-head" },
      u.icon ? el("img", { class: "coh-icon", src: u.icon, alt: "", loading: "lazy" }) : null,
      el("div", {}, el("h3", {}, T(u.name)), el("p", { class: "tile-sub" }, el("span", { class: "coh-dot", style: `background:${factionOf(u.faction)?.color}` }), `${factionName(u.faction)} · ${catName(u.cat)}`))
    ),
    costChips(u.cost),
    facts.length ? el("p", { class: "coh-facts" }, facts.join(" · ")) : null,
    u.help ? el("p", { class: "coh-role" }, T(u.help)) : null,
    para(u.brief),
    u.extra ? el("details", { class: "dd-uses" }, el("summary", {}, L("Yükseltmeler", "Upgrades")), para(u.extra)) : null
  );
}

function render() {
  const inFaction = (u, f) => f === "all" || u.faction === f;
  document.getElementById("factions").replaceChildren(
    ...factionChips(faction, (f) => UNITS.filter((u) => inFaction(u, f)).length, (f) => ((faction = f), urlParam("fraksiyon", f), render()))
  );
  const pool = UNITS.filter((u) => inFaction(u, faction));
  document.getElementById("cats").replaceChildren(
    ...[["all", L("Hepsi", "All")], ...CATS.map((c) => [c, catName(c)])].map(([k, n]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(cat === k), onclick: () => ((cat = k), render()) }, `${n} (${k === "all" ? pool.length : pool.filter((u) => u.cat === k).length})`)
    )
  );
  const q = normalize(search.value.trim());
  const items = pool.filter((u) => (cat === "all" || u.cat === cat) && (!q || normalize(`${T(u.name)} ${u.name?.en || ""} ${factionName(u.faction)} ${catName(u.cat)} ${T(u.help)}`).includes(q)));
  count.textContent = L(`${items.length} birlik`, `${items.length} units`);
  if (!items.length) return showNotice(list, L("Aramana uyan birlik bulunamadı.", "No units match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
