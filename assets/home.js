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
  "valorant/": "valo",
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
  "aoe2/": "aoe aoe2 age empires 2 ii",
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
const cards = [...document.querySelectorAll(".games .game-card")].map((card) => ({
  card,
  // Önce adda, sonra açıklamada geçenler üstte gösterilir.
  name: fold(`${card.querySelector("h2")?.textContent || ""} ${ALIASES[card.getAttribute("href")] || ""}`),
  text: fold(card.textContent),
}));

function runSearch() {
  const words = fold(search.value).split(" ").filter(Boolean);
  let shown = 0;
  for (const { card, name, text } of cards) {
    const soon = card.classList.contains("soon");
    const hit = !words.length || (!soon && words.every((w) => text.includes(w) || name.includes(w)));
    card.hidden = !hit;
    if (hit && !soon) shown++;
  }
  empty.hidden = !words.length || shown > 0;
}

search.addEventListener("input", runSearch);
// Enter: ilk bulunan oyuna git.
search.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const words = fold(search.value).split(" ").filter(Boolean);
  if (!words.length) return;
  const best =
    cards.find(({ card, name }) => !card.hidden && words.every((w) => name.includes(w))) ||
    cards.find(({ card }) => !card.hidden && !card.classList.contains("soon"));
  if (best) location.href = best.card.getAttribute("href");
});
