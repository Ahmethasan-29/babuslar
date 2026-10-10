const list = document.getElementById("list");
const search = document.getElementById("search");
const typesBox = document.getElementById("types");
const sortBox = document.getElementById("sort");
const count = document.getElementById("count");

const params = new URLSearchParams(location.search);
if (params.get("ara")) search.value = params.get("ara");

const TYPES = [...new Set(R6.weapons.map((w) => w.type).filter(Boolean))];
const SORTS = [
  ["name", "Ada göre"],
  ["damage", "Hasara göre"],
  ["rof", "Atış hızına göre"],
];
let type = "all";
let sort = "name";

function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}

function update() {
  typesBox.replaceChildren(chip("Hepsi", type === "all", () => ((type = "all"), update())), ...TYPES.map((t) => chip(typeLabel(t), t === type, () => ((type = t), update()))));
  sortBox.replaceChildren(...SORTS.map(([k, label]) => chip(label, k === sort, () => ((sort = k), update()))));
  render();
}

function statCell(label, value) {
  return el("div", { class: "dd-stat" }, el("span", { class: "tile-sub" }, label), el("strong", {}, value ?? "—"));
}

function render() {
  const query = normalize(search.value.trim());
  const items = R6.weapons
    .filter(
      (w) =>
        (type === "all" || w.type === type) &&
        (!query || normalize(w.name).includes(query) || w.users.some((id) => normalize(findOperator(id)?.name).includes(query)))
    )
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : (b[sort] || 0) - (a[sort] || 0)));
  count.textContent = `${items.length} silah`;
  if (!items.length) {
    showNotice(list, "Aramana uyan silah bulunamadı.");
    return;
  }
  list.replaceChildren(
    ...items.map((w) =>
      el(
        "article",
        { class: "r6-weapon" },
        r6Img(thumb(w.image, 320), "", 160, "r6-weapon-img"),
        el(
          "div",
          { class: "r6-weapon-body" },
          el("h3", {}, w.name),
          el("span", { class: "tile-sub" }, `${typeLabel(w.type)} · ${w.slot === "primary" ? "Ana silah" : "Yan silah"}`),
          el("div", { class: "r6-stats" }, statCell("Hasar", w.damage), statCell("Atış hızı (RPM)", w.rof), statCell("Şarjör", w.capacity), statCell("Hareketlilik", w.mobility)),
          el("div", { class: "r6-users" }, w.users.map((id) => findOperator(id)).filter(Boolean).map(operatorChip))
        )
      )
    )
  );
}

search.addEventListener("input", render);
update();
