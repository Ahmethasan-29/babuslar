const root = document.getElementById("map");
const id = new URLSearchParams(location.search).get("id");

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

// Panelde gruplar bu sırayla; doğuşlar en sonda.
const GROUP_ORDER = ["A", "B", "C", "Mid"];
const groupRank = (g) => (GROUP_ORDER.includes(g) ? GROUP_ORDER.indexOf(g) : GROUP_ORDER.length);

// Radardaki tam ad: "A" + "Main" → "A Main", "Attacker Side" + "Spawn" → "Attacker Spawn".
const fullName = (c) => `${c.group.replace(/ Side$/, "")} ${c.name}`;

getMaps()
  .then((maps) => {
    const map = maps.find((m) => m.id === id);
    if (!map) {
      showNotice(root, "Harita bulunamadı. Listeden bir harita seç.");
      return;
    }
    render(map);
  })
  .catch(() => showNotice(root, "Harita yüklenemedi. Bağlantını kontrol edip sayfayı yenile."));

function render(map) {
  document.title = `${map.name} · Valorant · Babuşlar`;

  const hero = el(
    "section",
    { class: "champ-hero map-hero" },
    el("div", { class: "champ-hero-body" }, el("h1", {}, map.name))
  );
  hero.style.backgroundImage = `url("${map.photo}")`;

  root.replaceChildren(hero, el("div", { class: "map-layout" }, radar(map), calloutPanel(map)));
}

function radar(map) {
  const layer = svg("svg", { class: "radar-layer", viewBox: "0 0 100 100", "aria-hidden": "true" });
  for (const c of map.callouts) {
    const [x, y] = c.at.map((v) => v * 100);
    const label = fullName(c);
    const spawn = c.name === "Spawn";
    layer.append(
      svg(
        "g",
        { class: spawn ? `callout spawn ${c.group.startsWith("Attacker") ? "t" : "ct"}` : "callout", "data-name": label },
        svg("title", {}, label),
        spawn ? svg("rect", { x: x - 5, y: y - 1.8, width: 10, height: 3.6, rx: 1 }) : svg("circle", { cx: x, cy: y, r: 0.7 }),
        svg("text", { x, y: spawn ? y + 0.9 : y - 1.4 }, spawn ? label.replace(" Spawn", "") : label)
      )
    );
  }
  return el("div", { class: "radar val-radar" }, el("img", { src: map.radar, alt: `${map.name} radar haritası`, width: 1024, height: 1024 }), layer);
}

function calloutPanel(map) {
  const groups = new Map();
  for (const c of [...map.callouts].sort((a, b) => groupRank(a.group) - groupRank(b.group) || a.name.localeCompare(b.name, "en"))) {
    const key = groupRank(c.group) < GROUP_ORDER.length ? c.group : "Doğuş";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }

  return el(
    "div",
    { class: "build-card map-panel val-panel" },
    el("h3", {}, "İnfolar"),
    [...groups].flatMap(([group, list]) => [
      el("h4", { class: "callout-group" }, group === "Mid" ? "Orta (Mid)" : group === "Doğuş" ? group : `${group} bölgesi`),
      el(
        "ul",
        { class: "callout-list" },
        list.map((c) => {
          const label = fullName(c);
          return el(
            "li",
            {
              tabindex: 0,
              onmouseenter: () => highlight(label, true),
              onmouseleave: () => highlight(label, false),
              onfocus: () => highlight(label, true),
              onblur: () => highlight(label, false),
            },
            label
          );
        })
      ),
    ])
  );
}

function highlight(name, on) {
  root.querySelector(`.callout[data-name="${CSS.escape(name)}"]`)?.classList.toggle("active", on);
}
