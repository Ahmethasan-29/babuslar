const root = document.getElementById("map");
const params = new URLSearchParams(location.search);
const map = CS2_MAPS.find((m) => m.id === params.get("id"));

const SVG_NS = "http://www.w3.org/2000/svg";

// SVG öğesi oluşturur; koordinatlar 0–100 arası (radarın yüzdesi).
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) if (value != null) node.setAttribute(key, value);
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

const pct = ([x, y]) => [x * 100, y * 100];

const TABS = [
  { id: "info", label: "İnfolar" },
  { id: "A", label: "A taktiği" },
  { id: "B", label: "B taktiği" },
];

if (!map) {
  showNotice(root, "Harita bulunamadı. Listeden bir harita seç.");
} else {
  document.title = `${map.name} · CS2 · Babuşlar`;
  const initial = TABS.find((t) => t.id.toLowerCase() === (params.get("sekme") || "").toLowerCase())?.id || "info";
  render(initial);
}

function render(tab) {
  const tactic = map.tactics.find((t) => t.site === tab);

  const tabs = el(
    "div",
    { class: "chips lane-tabs", role: "group", "aria-label": "Bölüm seç" },
    TABS.map((t) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "aria-pressed": String(t.id === tab),
          onclick: () => {
            const url = new URL(location.href);
            url.searchParams.set("sekme", t.id.toLowerCase());
            history.replaceState(null, "", url);
            render(t.id);
          },
        },
        t.label
      )
    )
  );

  root.replaceChildren(
    el("h1", { class: "page-title" }, map.name),
    el("p", { class: "page-sub" }, map.summary),
    tabs,
    el("div", { class: "map-layout" }, radar(tactic), tactic ? tacticPanel(tactic) : calloutPanel())
  );
}

function radar(tactic) {
  const layer = svg("svg", { class: "radar-layer", viewBox: "0 0 100 100", "aria-hidden": "true" });

  // Ok uçları için işaretçi
  layer.append(
    svg(
      "defs",
      {},
      svg(
        "marker",
        { id: "ok", viewBox: "0 0 10 10", refX: 6, refY: 5, markerWidth: 4, markerHeight: 4, orient: "auto-start-reverse" },
        svg("path", { d: "M0,0 L10,5 L0,10 z", class: "route-head" })
      )
    )
  );

  if (tactic) {
    for (const route of tactic.routes) {
      layer.append(svg("polyline", { class: "route", points: route.map(pct).join(" "), "marker-end": "url(#ok)" }));
    }
    for (const at of tactic.smokes) layer.append(svg("circle", { class: "smoke", cx: pct(at)[0], cy: pct(at)[1], r: 3.2 }));
    for (const at of tactic.mollies) layer.append(svg("circle", { class: "molly", cx: pct(at)[0], cy: pct(at)[1], r: 2.4 }));
    for (const at of tactic.flashes) layer.append(svg("circle", { class: "flash", cx: pct(at)[0], cy: pct(at)[1], r: 1.4 }));
  }

  // İnfolar: taktik görünümünde soluk gösterilir.
  for (const c of map.callouts) {
    const [x, y] = pct(c.at);
    layer.append(
      svg(
        "g",
        { class: `callout${tactic ? " dim" : ""}`, "data-name": c.name },
        svg("title", {}, `${c.name}: ${c.desc}`),
        svg("circle", { cx: x, cy: y, r: 0.7 }),
        svg("text", { x, y: y - 1.4 }, c.name)
      )
    );
  }

  for (const [site, at] of Object.entries(map.sites)) {
    const [x, y] = pct(at);
    layer.append(svg("g", { class: "site" }, svg("circle", { cx: x, cy: y, r: 3 }), svg("text", { x, y: y + 1.2 }, site)));
  }
  for (const [side, at] of Object.entries(map.spawns)) {
    const [x, y] = pct(at);
    layer.append(svg("g", { class: `spawn ${side.toLowerCase()}` }, svg("rect", { x: x - 3, y: y - 1.8, width: 6, height: 3.6, rx: 1 }), svg("text", { x, y: y + 0.9 }, side)));
  }

  if (tactic) {
    const [x, y] = pct(tactic.plant);
    layer.append(svg("g", { class: "plant" }, svg("rect", { x: x - 2.4, y: y + 3.4, width: 4.8, height: 2.8, rx: 0.6 }), svg("text", { x, y: y + 5.4 }, "C4")));
  }

  return el(
    "div",
    { class: "radar" },
    el("img", { src: map.radar, alt: `${map.name} radar haritası`, width: 1024, height: 1024 }),
    layer
  );
}

function calloutPanel() {
  return el(
    "div",
    { class: "build-card map-panel" },
    el("h3", {}, "İnfolar"),
    el(
      "ul",
      { class: "callout-list" },
      map.callouts.map((c) =>
        el(
          "li",
          {
            tabindex: 0,
            onmouseenter: () => highlight(c.name, true),
            onmouseleave: () => highlight(c.name, false),
            onfocus: () => highlight(c.name, true),
            onblur: () => highlight(c.name, false),
          },
          el("strong", {}, c.name),
          el("span", {}, c.desc)
        )
      )
    )
  );
}

function highlight(name, on) {
  root.querySelector(`.callout[data-name="${CSS.escape(name)}"]`)?.classList.toggle("active", on);
}

function tacticPanel(tactic) {
  const legend = [
    ["smoke", "Smoke"],
    ["molly", "Molotof"],
    ["flash", "Flash"],
    ["route", "Giriş yolu"],
  ];
  return el(
    "div",
    { class: "build-card map-panel" },
    el("div", { class: "build-head" }, el("h3", {}, tactic.title)),
    el("ol", { class: "tactic-steps" }, tactic.steps.map((s) => el("li", {}, s))),
    el("div", { class: "legend" }, legend.map(([cls, label]) => el("span", {}, el("i", { class: `key ${cls}` }), label)))
  );
}
