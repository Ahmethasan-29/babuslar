const grid = document.getElementById("grid");
const search = document.getElementById("search");
const sidesBox = document.getElementById("sides");
const rolesBox = document.getElementById("roles");
const count = document.getElementById("count");

const params = new URLSearchParams(location.search);
let side = ["Attacker", "Defender"].includes(params.get("taraf")) ? params.get("taraf") : "all";
let role = "all";

// Rol çipleri: en az iki operatörde geçen roller, sıklığa göre.
const roleCounts = new Map();
for (const o of R6.operators) for (const r of o.roles) roleCounts.set(r, (roleCounts.get(r) || 0) + 1);
const ROLE_LIST = [...roleCounts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([r]) => r);

function chip(label, pressed, onclick) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label);
}

function update() {
  sidesBox.replaceChildren(
    ...[
      ["all", "Hepsi"],
      ["Attacker", sideLabel("Attacker")],
      ["Defender", sideLabel("Defender")],
    ].map(([k, label]) => chip(label, k === side, () => ((side = k), update())))
  );
  rolesBox.replaceChildren(
    chip("Tüm roller", role === "all", () => ((role = "all"), update())),
    ...ROLE_LIST.map((r) => chip(roleLabel(r), r === role, () => ((role = r), update())))
  );
  render();
}

function render() {
  const query = normalize(search.value.trim());
  const list = R6.operators.filter(
    (o) =>
      (side === "all" || o.side === side) &&
      (role === "all" || o.roles.includes(role)) &&
      (!query ||
        normalize(o.name).includes(query) ||
        normalize(o.ability?.name).includes(query) ||
        [...o.primary, ...o.secondary].some((w) => normalize(w.name).includes(query)))
  );
  count.textContent = `${list.length} operatör`;
  if (!list.length) {
    showNotice(grid, "Aramana uyan operatör bulunamadı.");
    return;
  }
  grid.replaceChildren(
    ...list.map((o) =>
      el(
        "a",
        { class: `tile r6-tile ${o.side === "Attacker" ? "atk" : "def"}`, href: `operator.html?id=${encodeURIComponent(o.id)}` },
        r6Img(o.icon, "", 72, "r6-icon"),
        el("span", { class: "tile-name" }, o.name),
        el("span", { class: "tile-sub" }, o.ability?.name || "")
      )
    )
  );
}

search.addEventListener("input", render);
update();
