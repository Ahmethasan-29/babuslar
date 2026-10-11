// Sea of Thieves ticaret şirketleri (hangi ganimet kime satılır) ve gemiler.
document.getElementById("intro").textContent = L(
  "Topladığın ganimeti doğru şirkete satarsan hem altın hem itibar (reputation) kazanırsın. Karakolların yerleri Harita sayfasında.",
  "Sell loot to the right company for gold and reputation. Outpost locations are on the Map page."
);
document.getElementById("list").replaceChildren(
  ...SOT_COMPANIES.map((c) =>
    el(
      "article",
      { class: "build-card sot-company", style: `--c:${c.color}` },
      el("h3", {}, c.name),
      el("p", {}, L(c.tr, c.en)),
      el("p", { class: "tile-sub" }, el("strong", {}, L("Satın aldıkları: ", "Buys: "))),
      el("ul", {}, (IS_EN ? c.buys_en : c.buys).map((b) => el("li", {}, b))),
      el("p", { class: "tile-sub" }, el("strong", {}, L("Nerede: ", "Where: ")), L(...c.where))
    )
  )
);
document.getElementById("ships-title").textContent = L("Gemiler", "Ships");
document.getElementById("ships").replaceChildren(
  ...SOT_SHIPS.map((s) =>
    el(
      "article",
      { class: "build-card" },
      el("h3", {}, s.name),
      el("p", {}, L(s.tr, s.en)),
      el("dl", { class: "cp-stats pz-stats" }, [
        el("div", {}, el("dt", {}, L("Ekip", "Crew")), el("dd", {}, s.crew)),
        el("div", {}, el("dt", {}, L("Direk", "Masts")), el("dd", {}, String(s.masts))),
        el("div", {}, el("dt", {}, L("Top", "Cannons")), el("dd", {}, String(s.cannons))),
      ])
    )
  )
);
