const root = document.getElementById("champion");
const id = new URLSearchParams(location.search).get("id");

const STATS = [
  ["attack", "Saldırı"],
  ["defense", "Savunma"],
  ["magic", "Büyü"],
  ["difficulty", "Zorluk"],
];

const SPELL_KEYS = ["Q", "W", "E", "R"];

if (!id || !/^[A-Za-z0-9]+$/.test(id)) {
  showNotice(root, "Şampiyon bulunamadı. Listeden bir şampiyon seç.");
} else {
  ddData(`champion/${id}.json`)
    .then(({ version, data }) => render(version, data.data[id]))
    .catch(() => showNotice(root, "Şampiyon yüklenemedi. Bağlantını kontrol edip sayfayı yenile."));
}

function render(version, c) {
  if (!c) {
    showNotice(root, "Şampiyon bulunamadı.");
    return;
  }

  document.title = `${c.name} · League of Legends · Babuşlar`;

  const hero = el(
    "section",
    { class: "champ-hero" },
    el(
      "div",
      { class: "champ-hero-body" },
      el("h1", {}, c.name),
      el("p", { class: "title" }, c.title),
      el("div", { class: "tags" }, c.tags.map((t) => el("span", { class: "badge" }, ROLES[t] || t)))
    )
  );
  hero.style.backgroundImage = `url("${DD}/cdn/img/champion/splash/${c.id}_0.jpg")`;

  const stats = el(
    "section",
    { class: "section" },
    el("h2", {}, "Genel bakış"),
    el(
      "div",
      { class: "stats" },
      STATS.map(([key, label]) => {
        const value = c.info?.[key] ?? 0;
        return el(
          "div",
          {},
          el("div", { class: "stat-label" }, el("span", {}, label), el("span", {}, `${value}/10`)),
          el("div", { class: "bar" }, el("span", { style: `width:${value * 10}%` }))
        );
      })
    )
  );

  const passive = abilityCard({
    key: "Pasif",
    icon: ddImg(version, "passive", c.passive.image.full),
    name: c.passive.name,
    description: c.passive.description,
  });

  const spells = c.spells.map((s, i) =>
    abilityCard({
      key: SPELL_KEYS[i],
      icon: ddImg(version, "spell", s.image.full),
      name: s.name,
      description: s.description,
      meta: [
        s.cooldownBurn && s.cooldownBurn !== "0" ? `Bekleme süresi: ${s.cooldownBurn} sn` : null,
        s.costBurn && s.costBurn !== "0" ? `Bedel: ${s.costBurn}` : null,
        s.rangeBurn && s.rangeBurn !== "0" && s.rangeBurn !== "25000" ? `Menzil: ${s.rangeBurn}` : null,
      ],
    })
  );

  const abilities = el(
    "section",
    { class: "section" },
    el("h2", {}, "Pasif ve yetenekler"),
    el("div", { class: "abilities" }, passive, spells)
  );

  const tips = c.allytips?.length
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, "İpuçları"),
        el("ul", { class: "tips" }, c.allytips.map((tip) => el("li", {}, plainText(tip))))
      )
    : null;

  const lore = c.lore
    ? el("section", { class: "section" }, el("h2", {}, "Hikâyesi"), el("p", { class: "lore" }, plainText(c.lore)))
    : null;

  root.replaceChildren(hero, stats, abilities, tips || "", lore || "");
}

function abilityCard({ key, icon, name, description, meta = [] }) {
  const metaItems = meta.filter(Boolean);
  return el(
    "article",
    { class: "ability" },
    el(
      "div",
      { class: "ability-icon" },
      el("img", { src: icon, alt: "", width: 64, height: 64, loading: "lazy" }),
      el("span", { class: "ability-key" }, key)
    ),
    el(
      "div",
      {},
      el("h3", {}, name),
      metaItems.length ? el("div", { class: "meta" }, metaItems.map((m) => el("span", {}, m))) : null,
      el("p", { class: "desc" }, plainText(description))
    )
  );
}
