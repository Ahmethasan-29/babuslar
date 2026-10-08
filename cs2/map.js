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
  { id: "A", label: "A bölgesi" },
  { id: "B", label: "B bölgesi" },
  { id: "all", label: "Tüm harita" },
];

if (!map) {
  showNotice(root, "Harita bulunamadı. Listeden bir harita seç.");
} else {
  document.title = `${map.name} · CS2 · Babuşlar`;
  const initial = TABS.find((t) => t.id.toLowerCase() === (params.get("sekme") || "").toLowerCase())?.id || "info";
  render(initial);
}

function render(tab) {
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

  const content =
    tab === "info"
      ? el("div", { class: "map-layout" }, radar(), calloutPanel())
      : videoGrid(map.videos[tab] || []);

  root.replaceChildren(el("h1", { class: "page-title" }, map.name), el("p", { class: "page-sub" }, map.summary), tabs, content);
}

function radar() {
  const layer = svg("svg", { class: "radar-layer", viewBox: "0 0 100 100", "aria-hidden": "true" });

  for (const c of map.callouts) {
    const [x, y] = pct(c.at);
    layer.append(
      svg(
        "g",
        { class: "callout", "data-name": c.name },
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
    layer.append(
      svg("g", { class: `spawn ${side.toLowerCase()}` }, svg("rect", { x: x - 3, y: y - 1.8, width: 6, height: 3.6, rx: 1 }), svg("text", { x, y: y + 0.9 }, side))
    );
  }

  return el("div", { class: "radar" }, el("img", { src: map.radar, alt: `${map.name} radar haritası`, width: 1024, height: 1024 }), layer);
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

// Smoke / molotof / flash videoları. Video tıklanınca yüklenir; o zamana kadar YouTube'a bağlanılmaz.
function videoGrid(videos) {
  if (!videos.length) return el("p", { class: "notice" }, "Bu bölüm için henüz video eklenmedi.");
  return el(
    "div",
    { class: "video-grid" },
    videos.map((v) => {
      const frame = el(
        "button",
        { class: "video-thumb", type: "button", "aria-label": `${v.title} videosunu oynat` },
        el("img", { src: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, alt: "", loading: "lazy" }),
        el("span", { class: "play", "aria-hidden": "true" }, "▶")
      );
      frame.addEventListener("click", () =>
        frame.replaceWith(
          el("iframe", {
            class: "video-frame",
            src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`,
            title: v.title,
            allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
            allowfullscreen: "",
          })
        )
      );
      return el(
        "article",
        { class: "build-card video-card" },
        frame,
        el(
          "div",
          { class: "video-info" },
          el("h3", {}, v.title),
          el(
            "p",
            { class: "tile-sub" },
            v.channel,
            v.tr ? el("span", { class: "badge" }, "Türkçe") : null,
            " · ",
            el("a", { href: `https://www.youtube.com/watch?v=${v.id}`, target: "_blank", rel: "noopener" }, "YouTube'da aç")
          )
        )
      );
    })
  );
}
