// Yoldaşlar: her yoldaş bir kişiyle iyi anlaşır, iki kişiyle anlaşamaz. Takımına aldıklarını seç, kavgaları gör.
const list = document.getElementById("list");
const party = document.getElementById("party");
const byId = Object.fromEntries(WB.companions.map((c) => [c.id, c]));
const chosen = new Set();

document.getElementById("intro").textContent = L(
  "Yoldaşları tavernalarda bulursun. Her yoldaş bir kişiyle iyi anlaşır, iki kişiyle anlaşamaz; anlaşamayanları uzun süre birlikte tutarsan biri orduyu bırakıp gidebilir. “Soylu” yazanlara kendi krallığında toprak verip lord yapabilirsin. Aşağıdan yoldaş seçerek takımında kavga olup olmadığını kontrol et.",
  "Companions are found in taverns. Each likes one companion and dislikes two; keep rivals together too long and one may leave. Those marked “Noble” can be given land in your own kingdom. Pick companions below to check your party for quarrels."
);

const skill = (s) => (IS_EN || !WB_TR.skills[s] ? s : `${s} (${WB_TR.skills[s]})`);
const objection = (o) => {
  if (IS_EN) return o;
  const em = o.match(/^(\S+) as Emissary$/);
  if (em) return `${em[1]} elçi olarak gönderilirse`;
  return WB_TR.objections[o] || o;
};
const nameLink = (id) => el("a", { href: `#${id}` }, byId[id].name);
const clash = (a, b) => byId[a].enemies.includes(b) || byId[b].enemies.includes(a);

function checkParty() {
  const ids = [...chosen];
  const fights = [];
  const friends = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (clash(ids[i], ids[j])) fights.push([ids[i], ids[j]]);
      if (byId[ids[i]].friend === ids[j] || byId[ids[j]].friend === ids[i]) friends.push([ids[i], ids[j]]);
    }
  }
  party.replaceChildren(
    el("h2", {}, L("Takımım", "My party")),
    ids.length
      ? el(
          "div",
          { class: "r6-users" },
          ids.map((id) => el("button", { class: "r6-op-chip", type: "button", title: L("Takımdan çıkar", "Remove from party"), onclick: () => toggle(id) }, byId[id].name, " ×"))
        )
      : el("p", { class: "tile-sub" }, L("Henüz yoldaş seçmedin. Kartlardaki “Takıma ekle” düğmesini kullan.", "No companions picked yet. Use “Add to party” on the cards.")),
    fights.length
      ? el("div", { class: "mb-warn" }, el("strong", {}, L("Kavga edecekler:", "Will quarrel:")), el("ul", {}, fights.map(([a, b]) => el("li", {}, nameLink(a), " ✕ ", nameLink(b)))))
      : ids.length > 1
        ? el("p", { class: "mb-ok" }, L("✓ Bu takımda kavga eden yok.", "✓ Nobody in this party quarrels."))
        : null,
    friends.length ? el("p", { class: "tile-sub" }, L("İyi anlaşanlar: ", "Get along: "), friends.map(([a, b]) => `${byId[a].name} + ${byId[b].name}`).join(", ")) : null,
    el("div", { class: "chips" }, el("button", { class: "chip", type: "button", onclick: suggest }, L("Kavgasız örnek takım öner", "Suggest a quarrel-free party")), ids.length ? el("button", { class: "chip", type: "button", onclick: () => (chosen.clear(), checkParty()) }, L("Temizle", "Clear")) : null)
  );
  for (const card of list.children) card.querySelector(".mb-add").textContent = chosen.has(card.id) ? L("Takımdan çıkar", "Remove from party") : L("Takıma ekle", "Add to party");
}

function toggle(id) {
  chosen.has(id) ? chosen.delete(id) : chosen.add(id);
  checkParty();
}

// Kavga etmeyen en kalabalık takım: 16 yoldaşta tüm olasılıklar denenebilir (2^16 = 65 536).
function suggest() {
  const ids = WB.companions.map((c) => c.id);
  let best = [];
  for (let mask = 1; mask < 1 << ids.length; mask++) {
    const set = ids.filter((_, i) => mask & (1 << i));
    if (set.length <= best.length) continue;
    if (set.every((a, i) => set.slice(i + 1).every((b) => !clash(a, b)))) best = set;
  }
  chosen.clear();
  best.forEach((id) => chosen.add(id));
  checkParty();
  party.scrollIntoView({ behavior: "smooth" });
}

list.replaceChildren(
  ...WB.companions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) =>
      el(
        "article",
        { class: "build-card mb-companion", id: c.id },
        c.image ? el("img", { class: "mb-face", src: c.image.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/120"), alt: "", loading: "lazy" }) : null,
        el(
          "div",
          {},
          el("h3", {}, c.name, c.noble ? el("span", { class: "badge mb-noble" }, L("Soylu", "Noble")) : null),
          el("p", { class: "tile-sub" }, L(`Başlangıç seviyesi ${c.level} · İşe alma: ${c.cost ? `${c.cost} dinar` : "ücretsiz"}`, `Starting level ${c.level} · Hiring: ${c.cost ? `${c.cost} denars` : "free"}`)),
          el("p", {}, el("strong", {}, L("Öne çıkan beceriler: ", "Main skills: ")), c.skills.map(skill).join(", ")),
          el("p", {}, el("strong", { class: "mb-good" }, L("İyi anlaşır: ", "Likes: ")), nameLink(c.friend)),
          el("p", {}, el("strong", { class: "mb-bad" }, L("Kavga eder: ", "Dislikes: ")), c.enemies.flatMap((e, i) => (i ? [", ", nameLink(e)] : [nameLink(e)]))),
          el("p", {}, el("strong", {}, L("Hoşlanmadıkları: ", "Objects to: ")), c.objections.map(objection).join(", ")),
          el("button", { class: "chip mb-add", type: "button", onclick: () => toggle(c.id) }, L("Takıma ekle", "Add to party"))
        )
      )
    )
);
checkParty();
