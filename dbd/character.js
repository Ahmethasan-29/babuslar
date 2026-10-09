const root = document.getElementById("character");
const c = findCharacter(new URLSearchParams(location.search).get("id"));

if (!c) {
  showNotice(root, "Karakter bulunamadı. Listeden bir karakter seç.");
} else {
  render();
}

function render() {
  document.title = `${c.name} · Dead by Daylight · Babuşlar`;
  document.getElementById("back").href = `karakterler.html?rol=${c.role === "killer" ? "katil" : "survivor"}`;
  for (const link of document.querySelectorAll(".nav a")) {
    const r = new URL(link.href).searchParams.get("rol");
    if (r) (r === "katil") === (c.role === "killer") ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
  }

  const hero = el(
    "section",
    { class: "champ-hero dbd-hero" },
    c.portrait ? el("img", { class: "dbd-portrait", src: c.portrait, alt: "" }) : null,
    el(
      "div",
      { class: "champ-hero-body" },
      el("h1", {}, c.name),
      el("div", { class: "tags" }, el("span", { class: "badge" }, c.role === "killer" ? "Katil" : "Survivor")),
      c.bio ? el("div", { class: "agent-desc" }, richText(killerText(c, "bio") || c.bio)) : null
    )
  );

  const power = c.power
    ? el(
        "section",
        { class: "section" },
        el("h2", {}, "Güç"),
        el(
          "article",
          { class: "ability" },
          el("div", { class: "ability-icon" }, c.power.icon ? el("img", { src: c.power.icon, alt: "", width: 64, height: 64 }) : null),
          el("div", {}, el("h3", {}, c.power.name), el("div", { class: "desc" }, richText(killerText(c, "power") || c.power.description)))
        )
      )
    : null;

  const perks = el(
    "section",
    { class: "section" },
    el("h2", {}, "Perkler"),
    c.perks.length
      ? el("div", { class: "abilities dbd-perks" }, c.perks.map((p) => perkCard(p)))
      : el("p", { class: "notice" }, "Bu karakterin perkleri henüz eklenmedi.")
  );

  root.replaceChildren(...[hero, power, perks].filter(Boolean));
}


// Katilin tanıtım yazısı ya da güç açıklaması site dilinde (Türkçe çeviri yoksa null).
function killerText(c, field) {
  if (IS_EN || c.role !== "killer" || typeof DBD_TR_KILLERS === "undefined") return null;
  return DBD_TR_KILLERS[c.name]?.[field] || null;
}
