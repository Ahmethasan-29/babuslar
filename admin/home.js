// Panel giriş sayfası: giriş yoksa anahtar formu, varsa oyun kategorileri.

// Oyunlar ve bölümleri games.js'te tanımlı.

const app = document.getElementById("app");

start();

async function start() {
  if (!Panel.token()) return showLogin();
  try {
    await Panel.login();
  } catch (e) {
    return showLogin(e.status === 401 ? "Anahtar geçersiz ya da süresi dolmuş. Yeni bir anahtarla giriş yap." : e.message);
  }
  await Panel.guard();
  showGames();
}

function showLogin(error) {
  const input = el("input", { type: "password", class: "search", placeholder: "github_pat_…", autocomplete: "off", "aria-label": "GitHub erişim anahtarı" });
  const message = el("p", { class: "form-error" }, error || "");
  const form = el(
    "form",
    { class: "login-card" },
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, "Panele yalnızca bu sitenin GitHub deposunda düzenleme yetkisi olanlar girebilir."),
    el(
      "ol",
      { class: "login-steps" },
      el("li", {}, el("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener" }, "GitHub'da yeni bir erişim anahtarı (fine-grained token) oluştur"), "."),
      el("li", {}, "Repository access: ", el("b", {}, "Only select repositories → babuslar"), "."),
      el("li", {}, "Permissions: ", el("b", {}, "Contents"), " ve ", el("b", {}, "Pull requests"), " için ", el("b", {}, "Read and write"), "."),
      el("li", {}, "Oluşan anahtarı aşağıya yapıştır. Anahtar yalnızca bu tarayıcıda saklanır.")
    ),
    input,
    el("button", { type: "submit", class: "btn-primary" }, "Giriş yap"),
    message
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Panel.setToken(input.value.trim());
    message.textContent = "Kontrol ediliyor…";
    try {
      await Panel.login();
      location.reload();
    } catch (err) {
      Panel.setToken(null);
      message.textContent = err.status === 401 ? "Anahtar geçersiz." : err.message;
    }
  });
  app.replaceChildren(form);
}

// Oyunun görseli ve adı (sitedeki oyun kartları gibi). Wiki görselleri yabancı sitelere referer ile verilmez.
const banner = (game, big) =>
  el(
    "div",
    { class: `admin-banner${game.top ? " top" : ""}${game.image ? "" : " plain"}${big ? " big" : ""}` },
    game.image ? el("img", { src: game.image, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }) : null,
    el(big ? "h1" : "h2", {}, game.name === "Site" ? "Site (ana sayfa, Hakkımda)" : game.name),
    el("small", {}, `${game.sections.length} bölüm`)
  );

// Ana sayfa yalnızca oyun kartlarını gösterir; bölümler oyuna tıklayınca açılır (index.html?oyun=<kısa ad>).
// Tek bölümlü oyunlar doğrudan o bölüme gider.

function showGame(game) {
  document.title = `${game.name} · Yönetim paneli · Babuşlar`;
  fill(
    app,
    el("div", { class: "crumbs" }, el("a", { href: "./" }, "Panel"), ` / ${game.name}`),
    el("div", { class: "admin-game single" }, banner(game, true)),
    el("p", { class: "page-sub" }, "Düzenlemek istediğin bölümü seç."),
    el("div", { class: "admin-sections grid" }, game.sections.map((s) => el("a", { class: "admin-section", href: s.href }, s.label)))
  );
}

// Arama: büyük/küçük harf ve Türkçe karakter farkı gözetmez ("sampiyon" = "Şampiyon").
const fold = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// Kartta yazmayan ama aranabilecek kısa adlar.
const ALIASES = { cs2: "cs csgo counter", lol: "league sampiyon esya build", dbd: "dead", dd1: "dd", dd2: "dd", r6: "rainbow siege", bannerlord: "mb mount blade", warband: "mb mount blade", witcher3: "w3 witcher", cp2077: "cp cyberpunk", pz: "zomboid", sot: "sea thieves", site: "hakkımda ana sayfa", bf: "battlefield bf" };

// Ana sayfa yalnızca oyun kartlarını gösterir; bölümler oyuna tıklayınca açılır (index.html?oyun=<kısa ad>).
// Tek bölümlü oyunlar doğrudan o bölüme gider. Arama kutusu oyunları süzer ve eşleşen bölümleri doğrudan listeler.
function showGames() {
  const game = GAMES.find((g) => g.id === new URLSearchParams(location.search).get("oyun"));
  if (game) return showGame(game);

  const cards = GAMES.map((g) => ({
    g,
    text: fold(`${g.name} ${g.id} ${ALIASES[g.id] || ""}`),
    node: el("a", { class: "admin-game", href: g.sections.length === 1 ? g.sections[0].href : `?oyun=${g.id}` }, banner(g)),
  }));
  const sections = GAMES.flatMap((g) => g.sections.map((s) => ({ g, s, text: fold(`${s.label} ${g.name} ${g.id} ${ALIASES[g.id] || ""}`) })));

  const results = el("div", { class: "search-results" });
  const empty = el("p", { class: "hint" }, "Aramana uyan oyun ya da bölüm yok.");
  const search = el("input", { class: "search admin-search", type: "search", placeholder: "Oyun ya da bölüm ara… (ör. perk, silah, harita, dbd)", autocomplete: "off", "aria-label": "Panelde ara" });

  function run() {
    const words = fold(search.value).split(/\s+/).filter(Boolean);
    // Her aranan kelime, bir kelimenin başıyla eşleşmeli ("mb" Mount & Blade'i bulur, Zomboid'i değil).
    const match = (text) => words.every((w) => text.split(/[^a-z0-9]+/).some((t) => t.startsWith(w)));
    for (const c of cards) c.node.hidden = words.length > 0 && !match(c.text) && !sections.some((x) => x.g === c.g && match(x.text));
    const hits = words.length ? sections.filter((x) => match(x.text)) : [];
    fill(
      results,
      hits.length
        ? [
            el("h2", { class: "results-title" }, `Bölümler (${hits.length})`),
            el("div", { class: "admin-sections grid" }, hits.slice(0, 60).map((x) => el("a", { class: "admin-section", href: x.s.href }, x.s.label, el("small", {}, x.g.name)))),
          ]
        : null,
      words.length && !hits.length && cards.every((c) => c.node.hidden) ? empty : null
    );
  }
  search.addEventListener("input", run);
  // Enter: tek sonuç varsa doğrudan oraya git.
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = results.querySelector("a.admin-section") || cards.find((c) => !c.node.hidden)?.node;
    if (first) location.href = first.getAttribute("href");
  });

  fill(
    app,
    el("h1", { class: "page-title" }, "Yönetim paneli"),
    el("p", { class: "page-sub" }, `Hoş geldin ${Panel.user.name || Panel.user.login}. Düzenlemek istediğin oyunu seç ya da ara.`),
    search,
    results,
    el("div", { class: "admin-games" }, cards.map((c) => c.node))
  );
  search.focus();
}
