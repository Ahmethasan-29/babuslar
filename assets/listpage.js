// Ortak liste sayfası (Elden Ring, Age of Empires…): arama kutusu, grup düğmeleri ve kartlar.
// Sayfada L() tanımlı olmalı (oyunun ui.js/tr.js dosyası).
// Liste sayfası: #search, #groups, #count, #list öğelerini kullanır.
//   groups: [{ id, label, test(item) }]  (ilk düğme "Hepsi")
function listPage({ items, groups = [], text, card, noun }) {
  const list = document.getElementById("list");
  const search = document.getElementById("search");
  const count = document.getElementById("count");
  const groupBox = document.getElementById("groups");
  const params = new URLSearchParams(location.search);
  let group = groups.some((g) => g.id === params.get("grup")) ? params.get("grup") : "all";

  function render() {
    if (groupBox) groupBox.hidden = !groups.length;
    if (groupBox) {
      groupBox.replaceChildren(
        ...[{ id: "all", label: L("Hepsi", "All"), test: () => true }, ...groups].map((g) =>
          el("button", { class: "chip", type: "button", "aria-pressed": String(group === g.id), onclick: () => ((group = g.id), render()) }, `${g.label} (${items.filter(g.test).length})`)
        )
      );
    }
    const q = normalize(search.value.trim());
    const g = groups.find((x) => x.id === group);
    const shown = items.filter((x) => (!g || g.test(x)) && (!q || normalize(text(x)).includes(q)));
    count.textContent = `${shown.length} ${L(...noun)}`;
    if (!shown.length) return showNotice(list, L("Aramana uyan sonuç bulunamadı.", "Nothing matches your search."));
    list.replaceChildren(...shown.map(card));
  }
  search.addEventListener("input", render);
  render();
}
