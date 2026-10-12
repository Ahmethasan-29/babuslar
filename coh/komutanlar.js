// Company of Heroes komutanları (ortak sayfa): CoH 3'te battlegroup'lar, CoH 2'de komutanlar, CoH 1'de doktrinler.
// Her komutanın dalları (branches) ve dallardaki yetenekleri/yükseltmeleri var. Yetenekte tier (sıra) ya da cp (komuta puanı) olabilir.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
let faction = COH.factions.some((f) => f.id === urlParam("fraksiyon")) ? urlParam("fraksiyon") : "all";

function ability(a) {
  const badge = a.cp ? L(`${a.cp} KP`, `${a.cp} CP`) : a.tier ? L(`${a.tier}. sıra`, `Tier ${a.tier}`) : null;
  const text = T(a.brief) || T(a.help);
  return el(
    "li",
    { class: "coh-ability" },
    a.icon ? el("img", { src: a.icon, alt: "", loading: "lazy" }) : el("span", { class: "coh-ability-noimg" }),
    el(
      "div",
      {},
      el("strong", {}, T(a.name)),
      badge ? el("span", { class: "coh-badge" }, badge) : null,
      text ? el("p", {}, text) : null,
      T(a.brief) && T(a.help) && T(a.help) !== T(a.brief) ? el("details", { class: "dd-uses" }, el("summary", {}, L("Ayrıntı", "Details")), el("p", {}, T(a.help))) : null
    )
  );
}

function card(c) {
  return el(
    "article",
    { class: "build-card coh-commander", id: c.id },
    c.image ? el("img", { class: "coh-banner", src: c.image, alt: "", loading: "lazy" }) : null,
    el(
      "div",
      { class: "coh-unit-head" },
      !c.image && c.icon ? el("img", { class: "coh-icon", src: c.icon, alt: "", loading: "lazy" }) : null,
      el("div", {}, el("h3", {}, T(c.name)), el("p", { class: "tile-sub" }, el("span", { class: "coh-dot", style: `background:${factionOf(c.faction)?.color}` }), factionName(c.faction)))
    ),
    para(c.brief),
    T(c.help) && T(c.help) !== T(c.brief) ? para(c.help) : null,
    (c.branches || []).map((b) =>
      el("section", { class: "coh-branch" }, T(b.name) ? el("h4", {}, T(b.name)) : null, el("ul", { class: "coh-abilities" }, (b.upgrades || []).map(ability)))
    )
  );
}

function render() {
  const inFaction = (c, f) => f === "all" || c.faction === f;
  document.getElementById("factions").replaceChildren(
    ...factionChips(faction, (f) => COH.commanders.filter((c) => inFaction(c, f)).length, (f) => ((faction = f), urlParam("fraksiyon", f), render()))
  );
  const q = normalize(search.value.trim());
  const text = (c) => [T(c.name), c.name?.en, T(c.brief), ...(c.branches || []).flatMap((b) => [T(b.name), ...(b.upgrades || []).map((a) => `${T(a.name)} ${a.name?.en || ""}`)])].join(" ");
  const items = COH.commanders.filter((c) => inFaction(c, faction) && (!q || normalize(text(c)).includes(q)));
  count.textContent = L(`${items.length} ${commanderLabel(false).toLocaleLowerCase("tr")}`, `${items.length} ${commanderLabel(true).toLowerCase()}`);
  if (!items.length) return showNotice(list, L("Aramana uyan sonuç bulunamadı.", "Nothing matches your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
