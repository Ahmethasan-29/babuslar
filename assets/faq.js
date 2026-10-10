// Sık sorulan sorular listesi (rehber sayfaları ortak kullanır).
// items: [{ q: "Soru", a: ["paragraf", ["madde", "madde"], ...], tags: "arama için ek kelimeler" }]
// Cevaptaki dizi elemanları madde listesi olur. İngilizce sitede, varsa q_en / a_en kullanılır.
function renderFaq(root, search, items) {
  const view = items.map((item) => {
    const q = IS_EN && item.q_en ? item.q_en : item.q;
    const a = IS_EN && item.a_en ? item.a_en : item.a;
    const body = a.map((part) => (Array.isArray(part) ? el("ul", {}, part.map((li) => el("li", {}, li))) : el("p", {}, part)));
    const node = el("details", { class: "mb-faq-item" }, el("summary", {}, q), el("div", { class: "mb-faq-body" }, body));
    return { node, text: normalize(`${q} ${a.flat().join(" ")} ${item.tags || ""}`) };
  });
  root.replaceChildren(...view.map((v) => v.node));
  if (location.hash) document.getElementById(location.hash.slice(1))?.setAttribute("open", "");
  search.addEventListener("input", () => {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    for (const v of view) {
      const hit = words.every((w) => v.text.includes(w));
      v.node.hidden = !hit;
      if (words.length) v.node.open = hit;
    }
  });
}
