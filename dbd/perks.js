// Tüm perkler: karakterlerin kişisel perkleri + herkesin kullanabildiği genel perkler.
const grid = document.getElementById("perks");
const search = document.getElementById("search");
const roles = document.getElementById("roles");
const filters = document.getElementById("filters");
const count = document.getElementById("count");

const PERKS = [
  ...DBD.killers.flatMap((c) => c.perks.map((p) => ({ ...p, role: "killer", owner: c }))),
  ...DBD.survivors.flatMap((c) => c.perks.map((p) => ({ ...p, role: "survivor", owner: c }))),
  ...DBD.perks.killer.map((p) => ({ ...p, role: "killer", owner: null })),
  ...DBD.perks.survivor.map((p) => ({ ...p, role: "survivor", owner: null })),
].sort((a, b) => a.name.localeCompare(b.name, "en"));

const params = new URLSearchParams(location.search);
let role = params.get("rol") === "survivor" ? "survivor" : "killer";
let onlyVideo = params.has("video");

function chips(container, options, isActive, onPick) {
  container.replaceChildren(
    ...options.map(([key, label]) =>
      el("button", { class: "chip", type: "button", "aria-pressed": String(isActive(key)), onclick: () => onPick(key) }, label)
    )
  );
}

function update() {
  const url = new URL(location.href);
  url.searchParams.set("rol", role === "killer" ? "katil" : "survivor");
  if (onlyVideo) url.searchParams.set("video", "");
  else url.searchParams.delete("video");
  history.replaceState(null, "", url);

  chips(roles, [["killer", "Katil perkleri"], ["survivor", "Survivor perkleri"]], (k) => k === role, (k) => ((role = k), update()));
  chips(filters, [["video", "▶ Sadece videolu"]], () => onlyVideo, () => ((onlyVideo = !onlyVideo), update()));
  render();
}

function render() {
  const query = normalize(search.value.trim());
  const list = PERKS.filter(
    (p) =>
      p.role === role &&
      (!onlyVideo || p.video) &&
      (!query || normalize(p.name).includes(query) || normalize(p.owner?.name).includes(query))
  );
  count.textContent = `${list.length} perk`;
  if (!list.length) {
    showNotice(grid, "Aramana uyan perk bulunamadı.");
    return;
  }
  grid.replaceChildren(...list.map((p) => perkCard(p, true)));
}

search.addEventListener("input", render);
update();
