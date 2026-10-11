// Project Zomboid karakter planlayıcı: meslek ve özellik seçince kalan puan ve başlangıç becerileri hesaplanır.
// Puanlar PZwiki'deki gibi: olumlu özellikler puan harcar (eksi), olumsuzlar puan kazandırır (artı); toplam 0'ın altına inemez.
const params = new URLSearchParams(location.search);
const occs = PZ.occupations;
const traits = PZ.traits.filter((t) => t.kind !== "occupation");
const occTraits = PZ.traits.filter((t) => t.kind === "occupation");
let occ = occs.find((o) => o.name === params.get("meslek")) || occs.find((o) => /Unemployed/.test(o.name)) || occs[0];
const picked = new Set((params.get("ozellik") || "").split(",").filter((n) => traits.some((t) => t.name === n)));
let kind = "all";

document.getElementById("intro").textContent = L(
  "Bir meslek seç, sonra özelliklere tıklayarak ekle ya da çıkar. Olumlu özellikler puan harcar, olumsuzlar puan kazandırır; kalan puan sıfırın altına inemez. Aşağıda başlangıç becerilerin toplanır.",
  "Pick an occupation, then click traits to add or remove them. Positive traits cost points, negative traits give points; you can't go below zero. Your starting skills add up below."
);

const name = (en, tr) => (IS_EN || !tr || tr === en ? en : `${en} (${tr})`);
const pts = (n) => (n == null ? "" : n > 0 ? `+${n}` : String(n));
const icon = (url) => (url ? el("img", { class: "pz-icon", src: url, alt: "", loading: "lazy" }) : null);

// Özellik etkisindeki "+1 Long Blunt" gibi satırlar → beceri bonusu.
function traitSkills(t) {
  return [...(t.effect || "").matchAll(/^\+(\d+)\s+([A-Za-z][A-Za-z ]+?)\s*$/gm)].map((m) => ({ skill: m[2], n: +m[1] }));
}

function save() {
  const q = new URLSearchParams();
  q.set("meslek", occ.name);
  if (picked.size) q.set("ozellik", [...picked].join(","));
  history.replaceState(null, "", `?${q}`);
}

function renderBuild() {
  const chosen = traits.filter((t) => picked.has(t.name));
  const left = (occ.points || 0) + chosen.reduce((s, t) => s + (t.points || 0), 0);
  const skills = {};
  for (const s of occ.skills) skills[s.skill] = { tr: skillTr(s), n: (skills[s.skill]?.n || 0) + s.n };
  for (const t of chosen) for (const s of traitSkills(t)) skills[s.skill] = { tr: PZ_TR.skills[s.skill] || occs.flatMap((o) => o.skills).find((x) => x.skill === s.skill)?.tr || s.skill, n: (skills[s.skill]?.n || 0) + s.n };
  fillChildren(
    document.getElementById("build"),
    el(
      "div",
      { class: "pz-build-head" },
      icon(occ.icon),
      el("div", {}, el("span", { class: "tile-sub" }, L("Meslek", "Occupation")), el("strong", {}, name(occ.name, occTr(occ)))),
      el("div", { class: `pz-left ${left < 0 ? "bad" : ""}` }, el("span", { class: "tile-sub" }, L("Kalan puan", "Points left")), el("strong", {}, String(left)))
    ),
    left < 0 ? el("p", { class: "pz-warn" }, L("Puan eksiye düştü: olumsuz bir özellik ekle ya da olumlu birini çıkar.", "You're below zero: add a negative trait or remove a positive one.")) : null,
    chosen.length
      ? el(
          "div",
          { class: "pz-chosen" },
          chosen.map((t) => el("button", { class: `chip pz-${t.kind}`, type: "button", title: L("Çıkar", "Remove"), onclick: () => toggle(t) }, `${t.name} ${pts(t.points)} ✕`))
        )
      : el("p", { class: "tile-sub" }, L("Henüz özellik seçmedin.", "No traits picked yet.")),
    Object.keys(skills).length
      ? el(
          "div",
          { class: "pz-skills" },
          el("span", { class: "tile-sub" }, L("Başlangıç becerileri", "Starting skills")),
          el("div", { class: "tags" }, Object.entries(skills).sort((a, b) => b[1].n - a[1].n).map(([en, s]) => el("span", { class: "badge" }, `+${s.n} ${IS_EN ? en : s.tr}`)))
        )
      : null
  );
}

function toggle(t) {
  picked.has(t.name) ? picked.delete(t.name) : picked.add(t.name);
  save();
  renderBuild();
  renderTraits();
}

function renderOccs() {
  fillChildren(
    document.getElementById("occs"),
    ...occs.map((o) => {
      const own = occTraits.filter((t) => (t.occ || "").split(", ").includes(o.name));
      return el(
        "button",
        {
          class: `pz-occ ${o === occ ? "on" : ""}`,
          type: "button",
          "aria-pressed": String(o === occ),
          onclick: () => {
            occ = o;
            save();
            renderOccs();
            renderBuild();
          },
        },
        el("span", { class: "pz-occ-top" }, icon(o.icon), el("strong", {}, name(o.name, occTr(o))), el("span", { class: `pz-pts ${o.points < 0 ? "neg" : "pos"}` }, pts(o.points))),
        o.skills.length ? el("span", { class: "tile-sub" }, o.skills.map((s) => `+${s.n} ${IS_EN ? s.skill : skillTr(s)}`).join(" · ")) : null,
        o.traits.length ? el("span", { class: "tile-sub pz-occ-traits" }, L("Gelen özellik: ", "Comes with: "), o.traits.join(", ")) : null,
        occDesc(o) ? el("span", { class: "tile-sub" }, occDesc(o)) : null,
        own.length && !IS_EN ? el("span", { class: "tile-sub" }, own.map((t) => traitDesc(t)).join(" ")) : null
      );
    })
  );
}

function renderTraits() {
  const q = normalize(document.getElementById("search").value.trim());
  const KINDS = { all: ["Hepsi", "All"], positive: ["Olumlu", "Positive"], negative: ["Olumsuz", "Negative"] };
  document.getElementById("kinds").replaceChildren(
    ...Object.entries(KINDS).map(([k, n]) => el("button", { class: "chip", type: "button", "aria-pressed": String(kind === k), onclick: () => ((kind = k), renderTraits()) }, L(...n)))
  );
  const list = traits.filter((t) => (kind === "all" || t.kind === kind) && (!q || normalize(`${t.name} ${traitTr(t) || ""} ${t.desc} ${traitDesc(t)} ${t.effect}`).includes(q)));
  fillChildren(
    document.getElementById("traits"),
    ...list.map((t) =>
      el(
        "button",
        { class: `pz-trait pz-${t.kind} ${picked.has(t.name) ? "on" : ""}`, type: "button", "aria-pressed": String(picked.has(t.name)), onclick: () => toggle(t) },
        el("span", { class: "pz-occ-top" }, icon(t.icon), el("strong", {}, name(t.name, traitTr(t))), t.points != null ? el("span", { class: `pz-pts ${t.points < 0 ? "neg" : "pos"}` }, pts(t.points)) : null),
        el("span", { class: "tile-sub" }, traitDesc(t)),
        t.effect && t.effect !== t.desc ? el("span", { class: "tile-sub pz-effect" }, t.effect.replace(/\n/g, " · ")) : null
      )
    )
  );
}

document.getElementById("search").addEventListener("input", renderTraits);
renderOccs();
renderBuild();
renderTraits();
