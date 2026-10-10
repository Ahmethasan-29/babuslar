// Witcher 3 canavarları ve zayıflıkları (The Witcher Wiki, Infobox Bestiary).
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const CLASSES = [...new Set(W3.monsters.map((m) => m.class).filter(Boolean))].sort();
let klass = "all";

document.getElementById("intro").textContent = L(
  "Savaştan önce kılıcına canavarın sınıfına uygun yağı (oil) sür; zayıf olduğu işareti (sign) ve bombayı kullan. Canavarın bestiary kaydı açıksa oyundaki ekranda da zayıflıklarını görebilirsin.",
  "Before a fight, apply the oil matching the monster's class and use the Signs and bombs it is weak to. Once its bestiary entry is unlocked, the game shows these too."
);

const className = (c) => (IS_EN ? c : W3_TR.classes[c] ? `${W3_TR.classes[c]} (${c})` : c);

function weakGroups(m) {
  const by = {};
  for (const w of m.weak) (by[weakKind(w)] ||= []).push(w);
  return Object.entries(by).map(([k, items]) => el("div", { class: `w3-weak ${k}` }, el("span", { class: "tile-sub" }, L(...WEAK_KINDS[k])), el("strong", {}, items.join(", "))));
}

function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}

function update() {
  document.getElementById("classes").replaceChildren(
    chip(L("Hepsi", "All"), klass === "all", () => ((klass = "all"), update())),
    ...CLASSES.map((c) => chip(IS_EN ? c : W3_TR.classes[c] || c, klass === c, () => ((klass = c), update())))
  );
  render();
}

function render() {
  const q = normalize(search.value.trim());
  const items = W3.monsters.filter(
    (m) => (klass === "all" || m.class === klass) && (!q || normalize(`${m.name} ${m.class} ${W3_TR.classes[m.class] || ""} ${m.weak.join(" ")} ${m.where}`).includes(q))
  );
  count.textContent = L(`${items.length} canavar`, `${items.length} monsters`);
  if (!items.length) {
    showNotice(list, L("Aramana uyan canavar bulunamadı.", "No monsters match your search."));
    return;
  }
  list.replaceChildren(
    ...items.map((m) =>
      el(
        "article",
        { class: "build-card w3-monster" },
        m.image ? el("img", { class: "w3-monster-img", src: m.image.replace(/\/revision\/latest$/, "/revision/latest/scale-to-width-down/160"), alt: "", loading: "lazy" }) : el("span", { class: "dd-noimg w3-monster-img" }),
        el(
          "div",
          {},
          el("h3", {}, m.name),
          m.class ? el("p", { class: "tile-sub" }, className(m.class)) : null,
          m.weak.length ? el("div", { class: "w3-weaks" }, weakGroups(m)) : el("p", { class: "tile-sub" }, L("Wikide zayıflığı yazılı değil.", "No weaknesses listed on the wiki.")),
          m.where ? el("p", { class: "tile-sub" }, el("strong", {}, L("Nerede: ", "Where: ")), m.where) : null,
          m.tactics.length ? el("details", { class: "dd-uses" }, el("summary", {}, L("Savaş taktikleri (wiki, İngilizce)", "Combat tactics (wiki)")), m.tactics.map((t) => el("p", {}, t))) : null
        )
      )
    )
  );
}

search.addEventListener("input", render);
update();
