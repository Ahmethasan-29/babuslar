const root = document.getElementById("operator");
const o = findOperator(new URLSearchParams(location.search).get("id"));

if (!o) showNotice(root, "Operatör bulunamadı. Listeden bir operatör seç.");
else render();

function stat(label, value) {
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, value));
}

function weaponRow(w) {
  const data = findWeapon(w.id);
  const stats = data
    ? [data.damage ? `Hasar ${data.damage}` : null, data.rof ? `${data.rof} RPM` : null, data.capacity ? `Şarjör ${data.capacity}` : null].filter(Boolean).join(" · ")
    : "";
  return el(
    "a",
    { class: "r6-weapon-row", href: `silahlar.html?ara=${encodeURIComponent(w.name)}` },
    r6Img(thumb(data?.image, 240), "", 96, "r6-weapon-img"),
    el("div", {}, el("strong", {}, w.name), el("span", { class: "tile-sub" }, typeLabel(w.type)), stats ? el("span", { class: "tile-sub" }, stats) : null)
  );
}

function render() {
  document.title = `${o.name} · Rainbow Six Siege · Babuşlar`;

  const head = el(
    "section",
    { class: "dd-hero-head r6-hero" },
    o.image ? r6Img(thumb(o.image, 480), o.name, 220, "dd-portrait r6-portrait") : null,
    el(
      "div",
      { class: "dd-hero-info" },
      el("div", { class: "r6-title" }, r6Img(o.icon, "", 48, "r6-icon"), el("h1", {}, o.name)),
      el(
        "div",
        { class: "tags" },
        el("span", { class: `badge r6-side ${o.side === "Attacker" ? "atk" : "def"}` }, sideLabel(o.side)),
        o.roles.map((r) => el("span", { class: "badge" }, roleLabel(r)))
      ),
      o.quote ? el("p", { class: "dd-quote" }, `“${o.quote}”`) : null,
      el(
        "div",
        { class: "dd-stats" },
        el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, "Zırh"), r6Dots(o.armor)),
        el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, "Hız"), r6Dots(o.speed)),
        o.realname ? stat("Gerçek adı", o.realname) : null,
        o.birthplace ? stat("Doğum yeri", o.birthplace) : null,
        o.org ? stat("Birlik", o.org) : null
      )
    )
  );

  const tr = IS_EN ? null : R6_TR.abilities[o.id];
  const ability = el(
    "section",
    { class: "section" },
    el("h2", {}, "Özel yetenek"),
    el(
      "article",
      { class: "ability r6-ability" },
      el("div", { class: "ability-icon" }, o.ability.icon ? r6Img(thumb(o.ability.icon, 128), "", 64) : null),
      el(
        "div",
        {},
        el("h3", {}, o.ability.name, o.ability.count ? el("span", { class: "tile-sub r6-count" }, ` ×${o.ability.count}`) : null),
        o.ability.device ? el("p", { class: "tile-sub r6-device" }, o.ability.device) : null,
        tr ? el("p", { class: "desc" }, tr) : null,
        tr
          ? el("details", { class: "dd-uses r6-more" }, el("summary", {}, "Wikideki ayrıntılar (İngilizce)"), r6Lines(o.description))
          : r6Lines(o.description)
      )
    )
  );

  const video = o.video
    ? el("section", { class: "section" }, el("h2", {}, "Oyun içi video"), el("div", { class: "r6-video-wrap" }, r6Video(o.video, o.name)))
    : null;

  const loadout = el(
    "section",
    { class: "section" },
    el("h2", {}, "Ekipman"),
    el(
      "div",
      { class: "r6-loadout" },
      el("div", { class: "build-card" }, el("h3", {}, "Ana silah"), el("div", { class: "r6-weapon-list" }, o.primary.map(weaponRow))),
      el("div", { class: "build-card" }, el("h3", {}, "Yan silah"), el("div", { class: "r6-weapon-list" }, o.secondary.map(weaponRow))),
      o.gadgets.length
        ? el(
            "div",
            { class: "build-card" },
            el("h3", {}, "Gadget (birini seçer)"),
            el("ul", { class: "r6-gadgets" }, o.gadgets.map((g) => el("li", {}, g.name, g.count ? el("span", { class: "tile-sub" }, ` ×${g.count}`) : null)))
          )
        : null
    )
  );

  root.replaceChildren(...[head, ability, video, loadout].filter(Boolean));
}
