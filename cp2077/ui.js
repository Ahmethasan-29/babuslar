// Cyberpunk 2077 sayfalarının ortak parçaları: silah değerleri, ikonik silah klibi ve silah ayrıntısı.

const typeName = (t) => (IS_EN ? t : CP_TR.types[t] ? `${CP_TR.types[t]}` : t);
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));
const duration = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Silahın küçük resmi: fandom'un küçültülmüş sürümü (asıl resimler büyük).
const thumb = (url, w) => (url ? url.replace(/\/revision\/latest.*$/, `/revision/latest/scale-to-width-down/${w}`) : null);

function statList(w) {
  const rows = Object.entries(w.stats || {}).filter(([k]) => CP_TR.stats[k]);
  if (!rows.length) return null;
  return el(
    "dl",
    { class: "cp-stats" },
    rows.map(([k, v]) => el("div", {}, el("dt", {}, L(...CP_TR.stats[k])), el("dd", {}, k === "headshot_damage_multiplier" || k === "armor_penetration" ? L(`%${fmt(v)}`, `${fmt(v)}%`) : fmt(v))))
  );
}

// Kliple birlikte oynatılan YouTube bölümü: önce kapak resmi, tıklayınca oynatıcı.
function clipPlayer(w) {
  if (!w.yt) return null;
  const [id, start, end] = w.yt;
  const frame = el(
    "button",
    { class: "video-thumb", type: "button", "aria-label": L(`${w.name} videosunu oynat`, `Play the ${w.name} video`) },
    el("img", { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: "", loading: "lazy" }),
    el("span", { class: "video-name" }, L("Nerede, nasıl alınır", "Where and how to get it")),
    el("span", { class: "play", "aria-hidden": "true" }, "▶"),
    el("span", { class: "video-time" }, duration(end - start))
  );
  frame.addEventListener("click", () =>
    frame.replaceWith(
      el("iframe", {
        class: "video-frame",
        src: `https://www.youtube-nocookie.com/embed/${id}?start=${start}&end=${end}&autoplay=1&rel=0&modestbranding=1`,
        title: w.name,
        allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
        allowfullscreen: "",
        // Sayfa wiki resimleri için yönlendiren adres göndermiyor; YouTube oynatıcısı ise onsuz açılmıyor (Hata 153).
        referrerpolicy: "strict-origin-when-cross-origin",
      })
    )
  );
  return el(
    "div",
    { class: "cp-clip" },
    frame,
    el("p", { class: "tile-sub" }, "Big Dan Gaming · ", el("a", { href: `https://www.youtube.com/watch?v=${id}&t=${start}s`, target: "_blank", rel: "noopener" }, L("YouTube'da aç", "Open on YouTube")))
  );
}

// İkonik silahın nasıl alındığı: Türkçe özet varsa o, yoksa wikideki İngilizce satırlar.
function howTo(w) {
  const tr = !IS_EN && CP_TR.how[w.id];
  const lines = tr ? [].concat(tr) : w.how || [];
  if (!lines.length) return null;
  return el(
    "div",
    { class: "cp-how" },
    el("h4", {}, L("Nasıl alınır", "How to get it")),
    el("ul", {}, lines.map((x) => el("li", {}, x))),
    tr && w.how?.length ? el("details", { class: "dd-uses" }, el("summary", {}, "Wikideki not (İngilizce)"), el("ul", {}, w.how.map((x) => el("li", {}, x)))) : null
  );
}

// Silahın alındığı görev: "Ana görev: The Heist", "NCPD (organize suç): Vice Control" gibi.
const QUEST_PREFIX = /^(Gig|Suspected Organized Crime Activity|Increased Criminal Activity|SOS: Merc Needed):\s*/;
function questLabel(q) {
  const m = q.name.match(QUEST_PREFIX);
  const kind = (m && m[1]) || q.type;
  const name = q.name.replace(QUEST_PREFIX, "");
  const t = CP_TR.questTypes[kind];
  return `${t ? L(t[0], t[1]) : kind || L("Görev", "Quest")}: ${name}`;
}

// Haritadaki işaretin ne anlama geldiği.
function placeNote(w) {
  if (!w.at) {
    return w.quest
      ? el("p", { class: "tile-sub" }, L("Haritada yok: görev haritanın dışında (Badlands) geçiyor; yeri videoda.", "Not on the map: the quest takes place outside it (Badlands); the spot is in the video."))
      : null;
  }
  const area = w.at.exact ? "" : L(" (bölge)", " (district)");
  const notes = {
    world: [`${w.at.place}${area}`, `${w.at.place}${area}`],
    quest: [`${w.at.place}${area} — görevin geçtiği yer, tam yeri videoda`, `${w.at.place}${area} — where the quest takes place; exact spot in the video`],
    stash: ["V'nin dairesindeki zula (stash), Megabuilding H10", "V's apartment stash, Megabuilding H10"],
    airdrop: ["Dogtown'daki airdrop'lar", "Airdrops in Dogtown"],
    vendor: [`${w.at.place} — satıcıdan satın alınır`, `${w.at.place} — bought from a vendor`],
  };
  const [tr, en] = notes[w.at.kind] || notes.world;
  return el("p", { class: "tile-sub" }, el("strong", {}, L("Haritada: ", "On the map: ")), L(tr, en), w.at.kind === "world" && !w.at.exact ? L(" — tam yeri videoda", " — exact spot in the video") : "", w.at.map === "badlands" ? L(" (Badlands haritası)", " (Badlands map)") : "");
}

function weaponDetail(w, { mapLink = false, listLink = false } = {}) {
  return [
    w.image ? el("img", { class: "cp-weapon-img big", src: thumb(w.image, 400), alt: "", loading: "lazy" }) : null,
    el("h2", {}, w.name),
    el(
      "div",
      { class: "tags" },
      w.iconic ? el("span", { class: "badge cp-iconic" }, L("İkonik", "Iconic")) : null,
      w.type ? el("span", { class: "badge" }, typeName(w.type)) : null,
      w.tech ? el("span", { class: "badge" }, IS_EN ? w.tech : CP_TR.tech[w.tech] || w.tech) : null,
      w.maker ? el("span", { class: "badge" }, w.maker) : null
    ),
    w.quest ? el("p", { class: "cp-quest" }, questLabel(w.quest)) : null,
    w.effect ? el("p", { class: "cp-effect" }, el("strong", {}, L("İkonik etkisi: ", "Iconic effect: ")), (!IS_EN && CP_TR.effect[w.id]) || w.effect) : null,
    clipPlayer(w),
    howTo(w),
    placeNote(w),
    w.spot ? el("details", { class: "dd-uses" }, el("summary", {}, L("Yerinin ekran görüntüsü", "Screenshot of the spot")), el("img", { class: "cp-spot", src: thumb(w.spot, 800), alt: "", loading: "lazy" })) : null,
    statList(w),
    mapLink && w.at ? el("p", {}, el("a", { class: "chip", href: `harita.html?silah=${w.id}` }, L("Haritada göster", "Show on the map"))) : null,
    listLink ? el("p", {}, el("a", { class: "chip", href: `silahlar.html?silah=${w.id}` }, L("Silahlar sayfasında aç", "Open in weapons"))) : null,
  ];
}
