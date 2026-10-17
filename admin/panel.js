// Yönetim paneli ortak kodu: GitHub ile giriş, depodan dosya okuma ve değişiklikleri yayına alma.
// Site sabit dosyalardan oluştuğu için panel, değişiklikleri doğrudan GitHub deposuna yazar:
// her kayıt yeni bir dal + PR olur ve hemen birleştirilir; GitHub Pages birkaç dakikada yayına alır.

const REPO = "Ahmethasan-29/babuslar";
const API = "https://api.github.com";
const TOKEN_KEY = "babuslar-admin-token";

const Panel = {
  user: null,

  token() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },

  async api(path, { method = "GET", body } = {}) {
    const response = await fetch(API + path, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${Panel.token()}`,
        Accept: "application/vnd.github+json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `GitHub hatası (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  },

  // Anahtarın sahibi depoya yazabiliyor mu? Yazamıyorsa panel açılmaz.
  async login() {
    if (!Panel.token()) throw new Error("Giriş yapılmadı.");
    const user = await Panel.api("/user");
    const repo = await Panel.api(`/repos/${REPO}`);
    if (!repo.permissions?.push) throw new Error(`${user.login} hesabının bu sitede düzenleme yetkisi yok.`);
    Panel.user = user;
    return user;
  },

  // Panel sayfaları: giriş yoksa giriş sayfasına döner, varsa üst çubuğu doldurur.
  async guard() {
    try {
      await Panel.login();
    } catch {
      location.replace("./");
      return false;
    }
    const who = document.getElementById("who");
    if (who) {
      who.replaceChildren(
        el("img", { src: Panel.user.avatar_url, alt: "" }),
        el("span", {}, Panel.user.login),
        el("button", { type: "button", class: "chip", onclick: Panel.logout }, "Çıkış")
      );
    }
    return true;
  },

  logout() {
    Panel.setToken(null);
    location.href = "./";
  },

  // Dosyayı ana daldan, önbelleğe takılmadan okur.
  async read(path) {
    const file = await Panel.api(`/repos/${REPO}/contents/${path}?ref=main`);
    const bytes = Uint8Array.from(atob(file.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
    return { text: new TextDecoder().decode(bytes), sha: file.sha };
  },

  // files: [{ path, text, sha }] ya da video gibi ikili dosyalar için [{ path, base64 }]. sha, dosya okunduğundaki
  // sürüm; arada başkası değiştirdiyse kayıt durdurulur.
  async publish(files, title) {
    const main = await Panel.api(`/repos/${REPO}/git/ref/heads/main`);
    const branch = `panel-${Date.now().toString(36)}`;
    await Panel.api(`/repos/${REPO}/git/refs`, { method: "POST", body: { ref: `refs/heads/${branch}`, sha: main.object.sha } });
    try {
      for (const file of files) {
        const current = await Panel.api(`/repos/${REPO}/contents/${file.path}?ref=${branch}`).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
        if (current && file.sha && current.sha !== file.sha) {
          throw new Error(`${file.path} sen düzenlerken başka biri tarafından değiştirildi. Sayfayı yenileyip tekrar dene.`);
        }
        await Panel.api(`/repos/${REPO}/contents/${file.path}`, {
          method: "PUT",
          body: { message: title, content: file.base64 || toBase64(file.text), branch, ...(current ? { sha: current.sha } : {}) },
        });
      }
      const pr = await Panel.api(`/repos/${REPO}/pulls`, {
        method: "POST",
        body: { title, head: branch, base: "main", body: `Yönetim panelinden ${Panel.user.login} tarafından yapıldı.` },
      });
      await Panel.api(`/repos/${REPO}/pulls/${pr.number}/merge`, { method: "PUT", body: { merge_method: "merge" } });
      return pr;
    } finally {
      await Panel.api(`/repos/${REPO}/git/refs/heads/${branch}`, { method: "DELETE" }).catch(() => {});
    }
  },
};

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

// Veri dosyasını (ör. "const CS2_MAPS = [...]") çalıştırıp içindeki değeri döndürür.
function evalData(text, name) {
  return new Function(`${text}\nreturn ${name};`)();
}

// Değeri okunaklı JavaScript olarak yazar: küçük nesneler tek satırda, listeler satır satır.
function toJS(value, indent = "") {
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    if (isFlat(value)) return `[${value.map((v) => toJS(v)).join(", ")}]`;
    return `[\n${value.map((v) => `${indent}  ${toJS(v, indent + "  ")},`).join("\n")}\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (isFlat(value)) return `{ ${entries.map(([k, v]) => `${key(k)}: ${toJS(v)}`).join(", ")} }`;
    return `{\n${entries.map(([k, v]) => `${indent}  ${key(k)}: ${toJS(v, indent + "  ")},`).join("\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

// İçinde nesne listesi olmayan, kısa değerler tek satıra sığar.
function isFlat(value, depth = 0) {
  if (value === null || typeof value !== "object") return true;
  if (depth > 1) return false;
  if (Array.isArray(value) && value.some((v) => v && typeof v === "object" && !Array.isArray(v)) && depth === 0) return false;
  return Object.values(value).every((v) => isFlat(v, depth + 1)) && JSON.stringify(value).length < 220;
}

// Ortak araçlar (site common.js'deki el() ile aynı mantık; panel common.js'i yüklemez).
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "value") node.value = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const child of children.flat()) if (child != null) node.append(child);
  return node;
}

// Kaydet çubuğu: geri al / yinele, değişiklikleri at, kaydet. Sayfadan kaydetmeden çıkarken uyarır.
//   snapshot(): düzenlenen verinin o anki hali (metin); restore(metin): veriyi o hale döndürüp ekranı yeniden çizer.
// Geri al: Ctrl+Z, yinele: Ctrl+Y ya da Ctrl+Shift+Z. Peş peşe yazılan harfler ve sürükleme tek adım sayılır.
function saveBar({ onSave, snapshot, restore }) {
  const status = el("span", { class: "save-status" }, "Değişiklik yok");
  const undoButton = el("button", { type: "button", class: "chip", disabled: true, title: "Ctrl+Z", onclick: () => undo() }, "↶ Geri al");
  const redoButton = el("button", { type: "button", class: "chip", disabled: true, title: "Ctrl+Y", onclick: () => redo() }, "↷ Yinele");
  const discard = el("button", { type: "button", class: "chip", disabled: true, onclick: () => confirm("Kaydedilmemiş tüm değişiklikler silinsin mi?") && restoreTo(saved, true) }, "Değişiklikleri at");
  const button = el("button", { type: "button", class: "btn-primary", disabled: true }, "Kaydet ve yayınla");
  const bar = el("div", { class: "save-bar" }, status, el("div", { class: "save-actions" }, undoButton, redoButton, discard, button));

  let saved = null; // son kaydedilen (ya da yüklenen) hal
  let current = null; // geçmişteki son adım
  const past = [];
  const future = [];
  let timer = null;
  let busy = false;

  function update(message) {
    const dirty = current !== saved;
    bar.classList.toggle("dirty", dirty);
    undoButton.disabled = busy || (!past.length && !timer);
    redoButton.disabled = busy || !future.length;
    discard.disabled = busy || !dirty;
    button.disabled = busy || !dirty;
    if (message) status.replaceChildren(...[message].flat());
    else status.textContent = dirty ? "Kaydedilmemiş değişiklikler var" : "Değişiklik yok";
  }

  function commit() {
    clearTimeout(timer);
    timer = null;
    const now = snapshot();
    if (now === current) return;
    past.push(current);
    future.length = 0;
    current = now;
  }

  function restoreTo(state, clearHistory) {
    current = state;
    if (clearHistory) past.length = future.length = 0;
    restore(state);
    update();
  }

  function undo() {
    if (busy) return;
    if (timer) commit();
    if (!past.length) return;
    future.push(current);
    restoreTo(past.pop());
  }

  function redo() {
    if (busy || !future.length) return;
    past.push(current);
    restoreTo(future.pop());
  }

  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "z" && !e.shiftKey) undo();
    else if (key === "y" || (key === "z" && e.shiftKey)) redo();
    else return;
    e.preventDefault();
  });

  window.addEventListener("beforeunload", (e) => {
    if (current !== saved || timer) e.preventDefault();
  });

  button.addEventListener("click", async () => {
    if (timer) commit();
    busy = true;
    update("Kaydediliyor…");
    try {
      const pr = await onSave();
      saved = current;
      busy = false;
      update(["Yayına alındı (", el("a", { href: pr.html_url, target: "_blank", rel: "noopener" }, `PR #${pr.number}`), "). Site birkaç dakika içinde güncellenir."]);
    } catch (e) {
      busy = false;
      update(`Kaydedilemedi: ${e.message}`);
    }
  });

  return {
    node: bar,
    // Veri yüklendiğinde bir kez çağrılır.
    loaded() {
      saved = current = snapshot();
      update();
    },
    // Her düzenlemeden sonra çağrılır.
    changed() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        commit();
        update();
      }, 600);
      bar.classList.add("dirty");
      status.textContent = "Kaydedilmemiş değişiklikler var";
      undoButton.disabled = button.disabled = discard.disabled = busy;
    },
  };
}

// replaceChildren gibi, ama boş (null) öğeleri atlar (yoksa sayfada "null" yazar).
function fill(node, ...children) {
  node.replaceChildren(...children.flat().filter((c) => c != null));
}

// Sayfa açılırken beklenmeyen bir hata olursa "Yükleniyor…"da kalmasın; hata yazılsın.
// (Açıldıktan sonraki hatalarda ekrana dokunulmaz, kaydedilmemiş değişiklikler kaybolmasın.)
function showStartupError(message) {
  const app = document.getElementById("app");
  if (!app || app.textContent.trim() !== "Yükleniyor…") return;
  fill(app, el("p", { class: "form-error" }, `Panel açılamadı: ${message}`), el("p", { class: "hint" }, "Sayfayı Ctrl+F5 ile (telefonda yenileyerek) tekrar açmayı dene. Düzelmezse bu yazıyı bana gönder."));
}
window.addEventListener("error", (e) => showStartupError(e.message));
window.addEventListener("unhandledrejection", (e) => showStartupError(e.reason?.message || String(e.reason)));
