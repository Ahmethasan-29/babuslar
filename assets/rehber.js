// Ortak oyun rehberi şablonu (Risk of Rain, Bloons TD, Megabonk, ETS2, Hearts of Iron, World of Tanks, Total War…).
// Her oyunun klasöründe yalnızca data.js (const REHBER = {...}) ve scripts/rehber-lib.ps1'in yazdığı HTML sayfaları bulunur;
// sayfaların tüm içeriği bu dosyada, REHBER verisinden çizilir.
//
// REHBER = {
//   game: "Risk of Rain 2",                  oyunun adı
//   intro: [tr, en],                         ana sayfadaki kısa tanıtım (isteğe bağlı)
//   sections: [{
//     id: "esyalar",                         sayfa dosyası: esyalar.html
//     title: [tr, en], noun: [tr, en],       başlık ve sayaçtaki ad ("246 eşya")
//     badge: [tr, en], text: [tr, en],       ana sayfadaki kartın etiketi ve açıklaması
//     cover: "url",                          ana sayfadaki kartın resmi (yoksa ilk resimli öğe)
//     image: "icon" | "wide" | "portrait",   kartlardaki resim biçimi
//     groups: [{ id, label: [tr, en], color }]   filtre düğmeleri; öğenin "group" alanıyla eşleşir (sırası korunur)
//     tags: [{ id, label: [tr, en] }]        ikinci filtre satırı; öğenin "tags" dizisiyle eşleşir (isteğe bağlı)
//     items: [{
//       id, name, image, group, tags: [],
//       sub: "metin" | [tr, en],             adın altındaki küçük satır
//       desc: "metin",                       açıklama; [[d|vurgu]] biçimi renkli vurgu olur (d, h, u, s, w, k)
//       quote: "metin",                      küçük italik satır (oyun içi kısa açıklama)
//       stats: [[etiket, değer], …],         etiket metin ya da [tr, en]
//       lists: [{ title: [tr, en], items: [metin, …] }],   açılır listeler
//       more: "metin" | [tr, en],            "Ayrıntılar" altında uzun metin
//     }]
//   }],
//   guide: [{ title: [tr, en], text: [tr, en] }],   ana sayfadaki rehber maddeleri (isteğe bağlı)
//   links: [{ label: [tr, en], href }],             ana sayfadaki "ayrıca bak" bağlantıları (isteğe bağlı)
//   footer: [[tr, en], …],                          alt bilgideki satırlar (hak sahibi, veri kaynağı)
// }

const L = (tr, en) => (IS_EN ? en : tr);
const tx = (v) => (Array.isArray(v) ? L(v[0], v[1] ?? v[0]) : v ?? "");
const SECTION_ID = document.body.dataset.section || "home";
const SECTION = REHBER.sections.find((s) => s.id === SECTION_ID);

// "[[d|%15]] saldırı hızı" → vurgulu metin parçaları (innerHTML kullanılmaz).
function richText(text) {
  const parts = [];
  const rx = /\[\[([a-z]+)\|([^\]]*)\]\]/g;
  let last = 0;
  let m;
  while ((m = rx.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(el("span", { class: `rh-hl rh-${m[1]}` }, m[2]));
    last = rx.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
const plain = (text) => String(text || "").replace(/\[\[[a-z]+\|([^\]]*)\]\]/g, "$1");

function navLinks() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.replaceChildren(
    el("a", { href: "../" }, L("Ana sayfa", "Home")),
    el("a", { href: "./", "aria-current": SECTION ? null : "page" }, REHBER.game),
    ...REHBER.sections.map((s) => el("a", { href: `${s.id}.html`, "aria-current": s === SECTION ? "page" : null }, tx(s.title)))
  );
}

function itemImage(item, style) {
  if (!item.image) return style === "icon" ? el("div", { class: "rh-img rh-noimg" }) : null;
  return el("img", { class: `rh-img rh-${style || "icon"}`, referrerpolicy: "no-referrer", loading: "lazy", src: item.image, alt: "" });
}

function itemCard(item, section) {
  const group = section.groups?.find((g) => g.id === item.group);
  const style = section.image || "icon";
  const head = el(
    "div",
    { class: "rh-head" },
    style === "icon" ? itemImage(item, style) : null,
    el(
      "div",
      {},
      el("h3", {}, item.name),
      item.sub || group ? el("p", { class: "tile-sub" }, [group ? el("span", { class: "rh-group" }, tx(group.label)) : null, item.sub ? tx(item.sub) : null].filter(Boolean).flatMap((x, i) => (i ? [" · ", x] : [x]))) : null
    )
  );
  return el(
    "article",
    { class: "build-card rh-card", id: item.id, style: group?.color ? `--rh-color:${group.color}` : null },
    style !== "icon" ? itemImage(item, style) : null,
    head,
    item.quote && item.quote !== plain(tx(item.desc)) ? el("p", { class: "rh-quote" }, item.quote) : null,
    item.desc ? el("p", { class: "rh-desc" }, richText(tx(item.desc))) : null,
    item.stats?.length
      ? el("dl", { class: "rh-stats" }, item.stats.map(([k, v]) => el("div", {}, el("dt", {}, tx(k)), el("dd", {}, richText(String(tx(v)))))))
      : null,
    (item.lists || []).filter((l) => l.items?.length).map((l) => el("details", { class: "dd-uses" }, el("summary", {}, `${tx(l.title)} (${l.items.length})`), el("ul", {}, l.items.map((x) => el("li", {}, richText(tx(x))))))),
    item.more ? el("details", { class: "dd-uses" }, el("summary", {}, L("Ayrıntılar", "Details")), el("p", {}, richText(tx(item.more)))) : null
  );
}

function sectionPage(section) {
  document.title = `${tx(section.title)} · ${REHBER.game} · Babuşlar`;
  document.getElementById("title").textContent = tx(section.title);
  const search = document.getElementById("search");
  search.placeholder = L("Ara…", "Search…");
  search.setAttribute("aria-label", search.placeholder);

  const params = new URLSearchParams(location.search);
  const has = (list, id) => (list || []).some((g) => g.id === id);
  let group = has(section.groups, params.get("grup")) ? params.get("grup") : "all";
  let tag = has(section.tags, params.get("etiket")) ? params.get("etiket") : "all";
  const groupBox = document.getElementById("groups");
  const tagBox = document.getElementById("tags");
  const list = document.getElementById("list");
  const count = document.getElementById("count");
  const items = section.items;
  const textOf = (x) => [x.name, plain(tx(x.desc)), x.quote, tx(x.sub), ...(x.tags || []), ...(x.stats || []).map(([, v]) => tx(v))].join(" ");

  const chips = (box, defs, current, set, test) => {
    const used = (defs || []).filter((d) => items.some((x) => test(x, d.id)));
    box.hidden = used.length < 2;
    box.replaceChildren(
      ...[{ id: "all", label: ["Hepsi", "All"] }, ...used].map((d) =>
        el(
          "button",
          { class: "chip", type: "button", "aria-pressed": String(current === d.id), style: d.color ? `--rh-color:${d.color}` : null, onclick: () => (set(d.id), render()) },
          d.color ? el("span", { class: "rh-dot", "aria-hidden": "true" }) : null,
          `${tx(d.label)} (${d.id === "all" ? items.length : items.filter((x) => test(x, d.id)).length})`
        )
      )
    );
  };
  const inGroup = (x, id) => x.group === id;
  const inTag = (x, id) => (x.tags || []).includes(id);

  function render() {
    chips(groupBox, section.groups, group, (v) => (group = v), inGroup);
    chips(tagBox, section.tags, tag, (v) => (tag = v), inTag);
    const q = normalize(search.value.trim());
    const shown = items.filter((x) => (group === "all" || inGroup(x, group)) && (tag === "all" || inTag(x, tag)) && (!q || normalize(textOf(x)).includes(q)));
    count.textContent = `${shown.length} ${tx(section.noun)}`;
    if (!shown.length) return showNotice(list, L("Aramana uyan sonuç bulunamadı.", "Nothing matches your search."));
    list.className = `bf-grid rh-grid rh-grid-${section.image || "icon"}`;
    list.replaceChildren(...shown.map((x) => itemCard(x, section)));
  }
  search.addEventListener("input", render);
  render();
  // Bağlantıyla gelinen öğe (ör. esyalar.html#Behemoth) görünür olsun.
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

function homePage() {
  document.getElementById("title").textContent = REHBER.game;
  const intro = document.getElementById("intro");
  if (REHBER.intro) intro.textContent = tx(REHBER.intro);
  else intro.remove();
  document.getElementById("cards").replaceChildren(
    ...REHBER.sections.map((s) => {
      const img = s.cover || s.items.find((x) => x.image)?.image;
      return el(
        "a",
        { class: "game-card", href: `${s.id}.html` },
        img ? el("img", { class: `card-img${s.image === "icon" ? " rh-card-icon" : ""}`, src: img, alt: "", referrerpolicy: "no-referrer" }) : null,
        s.badge ? el("span", { class: "badge" }, tx(s.badge)) : null,
        el("h2", {}, tx(s.title)),
        el("p", {}, s.text ? tx(s.text).replace("{n}", s.items.length) : `${s.items.length} ${tx(s.noun)}`)
      );
    })
  );
  const guide = document.getElementById("guide");
  if (!REHBER.guide?.length) return guide.remove();
  guide.replaceChildren(
    el("h2", { class: "page-title", style: "font-size:1.5rem" }, L("Rehber", "Guide")),
    el("div", { class: "rh-guide" }, REHBER.guide.map((g) => el("article", { class: "build-card" }, el("h3", {}, tx(g.title)), el("p", {}, richText(tx(g.text)))))),
    REHBER.links?.length ? el("p", { class: "rh-links" }, REHBER.links.map((l) => el("a", { href: l.href }, tx(l.label)))) : null
  );
}

// Alt bilgi: hak sahibi ve veri kaynakları (REHBER.footer: [[tr, en], …]).
document.getElementById("footer")?.replaceChildren(...(REHBER.footer || []).map((line) => el("p", {}, tx(line))));

navLinks();
if (SECTION) sectionPage(SECTION);
else homePage();
