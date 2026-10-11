// Battlefield silahları (ortak sayfa): oyunun data.js dosyasındaki BF.weapons; gruba göre süzme ve arama.
const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const WEAPONS = BF.weapons.filter((w) => !HIDDEN_GROUP.test(w.group));
const GROUPS = [...new Set(WEAPONS.map((w) => w.group))];
let group = "all";

function stat(label, value) {
  return value ? el("div", {}, el("dt", {}, label), el("dd", {}, value)) : null;
}

function card(w) {
  return el(
    "article",
    { class: "build-card bf-card" },
    w.image ? el("img", { class: "bf-img", src: thumb(w.image, 360), alt: "", loading: "lazy" }) : el("div", { class: "bf-img dd-noimg" }),
    el("h3", {}, w.name),
    el("p", { class: "tile-sub" }, [groupName(w.group), w.kit && w.kit !== w.group ? w.kit : null].filter(Boolean).join(" · ")),
    el(
      "dl",
      { class: "cp-stats bf-stats" },
      stat(L("Hasar", "Damage"), w.damage),
      stat(L("Atış hızı", "Fire rate"), w.rof),
      stat(L("Şarjör", "Magazine"), w.magazine),
      stat(L("Mermi hızı", "Velocity"), w.velocity),
      stat(L("Atış modu", "Fire mode"), w.fire),
      stat(L("Mühimmat", "Ammo"), w.ammo),
      stat(L("Açılır", "Unlock"), w.unlock)
    ),
    w.desc ? el("details", { class: "dd-uses" }, el("summary", {}, L("Oyundaki açıklama (İngilizce)", "In-game description")), el("p", {}, w.desc)) : null
  );
}

function render() {
  document.getElementById("groups").replaceChildren(
    ...[["all", L("Hepsi", "All")], ...GROUPS.map((g) => [g, groupName(g)])].map(([k, n]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(group === k), onclick: () => ((group = k), render()) }, `${n} (${k === "all" ? WEAPONS.length : WEAPONS.filter((w) => w.group === k).length})`)
    )
  );
  const q = normalize(search.value.trim());
  const items = WEAPONS.filter((w) => (group === "all" || w.group === group) && (!q || normalize(`${w.name} ${w.group} ${groupName(w.group)} ${w.kit} ${w.ammo}`).includes(q)));
  count.textContent = L(`${items.length} silah`, `${items.length} weapons`);
  if (!items.length) return showNotice(list, L("Aramana uyan silah bulunamadı.", "No weapons match your search."));
  list.replaceChildren(...items.map(card));
}
search.addEventListener("input", render);
render();
