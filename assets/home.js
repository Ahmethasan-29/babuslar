// Ana sayfa: üst menüdeki "Oyunlar" açılır menüsü ve oyun arama kutusu.

// --- Oyunlar menüsü
const menuButton = document.querySelector(".nav-menu-btn");
const menuPanel = document.getElementById("games-menu");

function setMenu(open) {
  menuPanel.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => setMenu(menuPanel.hidden));
document.addEventListener("click", (e) => {
  if (!menuPanel.hidden && !e.target.closest(".nav-menu")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menuPanel.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});

// --- Oyun arama
// Kısaltmalar: kartta yazmayan ama oyuncuların aradığı adlar.
const ALIASES = {
  "lol/": "lol league",
  "cs2/": "cs cs2 csgo counter strike",
  "dbd/": "dbd dead by daylight",
  "dd/": "dd dd1 dd2 darkest dungeon",
  "r6/": "r6 rainbow six siege",
  "mb/bannerlord/": "mb mb2 mount blade bannerlord",
  "mb/warband/": "mb mount blade warband",
  "witcher3/": "witcher w3 wild hunt",
  "cp2077/": "cp cp2077 cyberpunk",
  "pz/": "pz zomboid",
  "sot/": "sot sea of thieves",
  "bf1/": "bf bf1 battlefield 1",
  "bf2/": "bf bf2 battlefield 2",
  "bf3/": "bf bf3 battlefield 3",
  "bf4/": "bf bf4 battlefield 4",
  "bfv/": "bf bf5 bfv battlefield v 5",
  "bf6/": "bf bf6 battlefield 6",
  "coh1/": "coh coh1 company heroes 1",
  "coh2/": "coh coh2 company heroes 2",
  "coh3/": "coh coh3 company heroes 3",
  "eldenring/": "er elden ring souls",
  "aoe1/": "aoe aoe1 age empires 1 definitive return rome",
  "aoe2/": "aoe aoe2 age empires 2 ii",
  "aoe3/": "aoe aoe3 age empires 3 iii",
  "aom/": "aom age mythology retold tanri",
  "aoe4/": "aoe aoe4 age empires 4 iv",
  "ror1/": "ror risk rain 1 2013",
  "rorr/": "ror risk rain returns remake",
  "ror2/": "ror ror2 risk rain 2",
  "btd6/": "btd btd6 bloons tower defense balon",
  "megabonk/": "megabonk bonk",
  "ets2/": "ets ets2 euro truck simulator tir kamyon",
};

// Büyük/küçük harf ve Türkçe karakter farkı gözetmez ("sampiyon" = "Şampiyon").
const fold = (s) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const search = document.getElementById("game-search");
const empty = document.getElementById("search-empty");

// Bir oyun kartının aranacak metinleri. Önce adda, sonra açıklamada geçenler öne alınır.
const entry = (card) => ({
  card,
  href: card.getAttribute("href"),
  name: fold(`${card.querySelector("h2")?.textContent || ""} ${ALIASES[card.getAttribute("href")] || ""}`),
  text: fold(card.textContent),
});

// Ana sayfadaki kartlar: tek oyun kartları ve seri kartları (içinde birden çok oyun).
const cards = [...document.querySelectorAll(".games > .game-card")].map((card) => {
  if (!card.classList.contains("series")) return entry(card);
  const head = card.querySelector(".series-head");
  const kids = [...card.querySelectorAll(".series-games > .game-card")].map(entry);
  // title: yalnızca serinin adı ("Battlefield serisi"); açıklamada geçen oyun adları hepsini açmasın.
  return { card, head, kids, title: fold(head.querySelector("h2").textContent) };
});

// Seri kartını açar/kapatır: açıkken tüm satıra yayılır ve oyunları gösterir.
function setOpen(series, open) {
  series.card.classList.toggle("open", open);
  series.head.setAttribute("aria-expanded", String(open));
  series.card.querySelector(".series-games").hidden = !open;
}
for (const c of cards) if (c.kids) c.head.addEventListener("click", () => setOpen(c, !c.card.classList.contains("open")));

function runSearch() {
  const words = fold(search.value).split(" ").filter(Boolean);
  const match = (x) => words.every((w) => x.text.includes(w) || x.name.includes(w));
  let shown = 0;
  for (const c of cards) {
    const soon = c.card.classList.contains("soon");
    if (!c.kids) {
      const hit = !words.length || (!soon && match(c));
      c.card.hidden = !hit;
      if (hit && !soon) shown++;
      continue;
    }
    // Seri: arama yoksa kapalı ve tüm oyunlar görünür; varsa yalnızca eşleşen oyunlar açık gösterilir
    // (serinin kendi adı eşleşiyorsa — "battlefield" — hepsi).
    const seriesHit = words.length && words.every((w) => c.title.includes(w));
    const kidHits = c.kids.filter((k) => !words.length || seriesHit || match(k));
    for (const k of c.kids) k.card.hidden = !kidHits.includes(k);
    c.card.hidden = words.length > 0 && !kidHits.length;
    setOpen(c, words.length > 0 && kidHits.length > 0);
    shown += kidHits.length;
  }
  empty.hidden = !words.length || shown > 0;
}

search.addEventListener("input", runSearch);
// Enter: ilk bulunan oyuna git (adı eşleşen öne).
search.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const words = fold(search.value).split(" ").filter(Boolean);
  if (!words.length) return;
  const games = cards.flatMap((c) => (c.kids ? (c.card.hidden ? [] : c.kids) : [c])).filter((g) => g.href && !g.card.hidden);
  const best = games.find((g) => words.every((w) => g.name.includes(w))) || games[0];
  if (best) location.href = best.href;
});
