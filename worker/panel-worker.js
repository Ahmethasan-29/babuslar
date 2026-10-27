// Babuşlar yönetim paneli için Cloudflare Worker: kullanıcı adı/şifre ile giriş ve GitHub'a aracılık.
// GitHub anahtarı yalnızca burada (GITHUB_TOKEN gizli değişkeni) durur; panel kullanıcıları onu hiç görmez.
//
// Kurulum (Cloudflare panelinde):
//   - Bu dosyanın tamamı Worker koduna yapıştırılır.
//   - KV ad alanı oluşturulup Worker'a USERS adıyla bağlanır (Bindings → KV namespace).
//   - Settings → Variables and Secrets → Secret: GITHUB_TOKEN = depoya yazabilen fine-grained anahtar
//     (yalnızca babuslar deposu; Contents + Pull requests: Read and write).
//
// KV'de tutulanlar:
//   owner          site sahibinin kullanıcı adı
//   user:<ad>      { name, display, salt, hash, owner }   şifre PBKDF2-SHA256 ile özetlenir
//   session:<kod>  <ad>                                   30 gün geçerli giriş
//   fail:<ad>      başarısız giriş sayısı (15 dk)

const REPO = "Ahmethasan-29/babuslar";
const OWNER = "Ahmethasan-29"; // GitHub'daki depo sahibi; ilk kurulumu ve şifre sıfırlamayı yalnızca o yapabilir
const ORIGINS = ["https://ahmethasan-29.github.io", "http://localhost", "http://127.0.0.1"];
const SESSION_TTL = 60 * 60 * 24 * 30;
const MAX_FAILS = 10;
const ITERATIONS = 100000; // Workers'ta PBKDF2 için izin verilen en yüksek değer

// Panelin GitHub'da kullanabileceği yollar (hepsi babuslar deposunun içinde). Depo ayarları, üyeler, Actions vb. kapalı.
const GITHUB_PATHS = [
  /^\/repos\/[^/]+\/[^/]+\/contents\//,
  /^\/repos\/[^/]+\/[^/]+\/git\/(ref|refs|blobs|trees|commits)(\/|$)/,
  /^\/repos\/[^/]+\/[^/]+\/pulls(\/\d+\/merge)?$/,
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ORIGINS.some((o) => origin === o || origin.startsWith(o + ":")) ? origin : ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    try {
      const response = await route(request, env);
      for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
      return response;
    } catch (e) {
      return json({ message: e.message || "Sunucu hatası" }, e.status || 500, cors);
    }
  },
};

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === "/" && method === "GET") return json({ ok: true, setup: !(await env.USERS.get("owner")), github: !!env.GITHUB_TOKEN });
  if (path === "/login" && method === "POST") return login(await body(request), env);
  if (path === "/setup" && method === "POST") return setup(await body(request), env);

  const me = await session(request, env);
  if (path === "/me" && method === "GET") return json(publicUser(me));
  if (path === "/logout" && method === "POST") {
    await env.USERS.delete(`session:${bearer(request)}`);
    return json({ ok: true });
  }
  if (path === "/password" && method === "POST") {
    const { old, password } = await body(request);
    if (!(await verify(me, old))) fail(403, "Şu anki şifre yanlış.");
    await savePassword(env, me, password);
    return json({ ok: true });
  }

  // Kullanıcı yönetimi: yalnızca site sahibi.
  if (path === "/users") {
    if (!me.owner) fail(403, "Kullanıcıları yalnızca site sahibi yönetebilir.");
    if (method === "GET") {
      const users = [];
      let cursor;
      do {
        const page = await env.USERS.list({ prefix: "user:", cursor });
        for (const key of page.keys) users.push(publicUser(JSON.parse(await env.USERS.get(key.name))));
        cursor = page.list_complete ? null : page.cursor;
      } while (cursor);
      return json(users.sort((a, b) => Number(b.owner) - Number(a.owner) || a.login.localeCompare(b.login)));
    }
    // Görünen adla gelirse yeni kullanıcı ekler; yalnızca şifreyle gelirse var olanın şifresini sıfırlar.
    if (method === "POST") {
      const { username, password, display } = await body(request);
      const name = cleanName(username);
      const existing = await env.USERS.get(`user:${name}`);
      let user;
      if (display != null) {
        if (existing) fail(409, `"${name}" kullanıcı adı zaten var.`);
        user = { name, display: String(display).trim().slice(0, 40) || name, owner: false };
      } else {
        if (!existing) fail(404, "Böyle bir kullanıcı yok.");
        user = JSON.parse(existing);
        if (user.owner) fail(403, "Site sahibinin şifresi Hesabım'dan ya da ilk kurulum ekranından değişir.");
      }
      await savePassword(env, user, password);
      return json(publicUser(user));
    }
  }
  const remove = path.match(/^\/users\/([^/]+)$/);
  if (remove && method === "DELETE") {
    if (!me.owner) fail(403, "Kullanıcıları yalnızca site sahibi yönetebilir.");
    const name = cleanName(decodeURIComponent(remove[1]));
    if (name === me.name) fail(400, "Kendi hesabını silemezsin.");
    await env.USERS.delete(`user:${name}`);
    return json({ ok: true });
  }

  if (path.startsWith("/gh/")) return github(request, env, path.slice(3) + url.search, me);

  fail(404, "Bulunamadı.");
}

async function login({ username, password }, env) {
  const name = cleanName(username);
  const failKey = `fail:${name}`;
  const fails = Number(await env.USERS.get(failKey)) || 0;
  if (fails >= MAX_FAILS) fail(429, "Çok fazla hatalı deneme. 15 dakika sonra tekrar dene.");
  const raw = await env.USERS.get(`user:${name}`);
  const user = raw && JSON.parse(raw);
  if (!user || !(await verify(user, password))) {
    await env.USERS.put(failKey, String(fails + 1), { expirationTtl: 900 });
    fail(401, "Kullanıcı adı ya da şifre yanlış.");
  }
  await env.USERS.delete(failKey);
  const token = randomHex(32);
  await env.USERS.put(`session:${token}`, name, { expirationTtl: SESSION_TTL });
  return json({ token, user: publicUser(user) });
}

// Site sahibi hesabını açar (ya da şifresini sıfırlar). Kimlik, GitHub anahtarıyla kanıtlanır.
async function setup({ githubToken, username, password }, env) {
  if (!githubToken) fail(400, "GitHub anahtarı gerekli.");
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "User-Agent": "babuslar-panel" },
  });
  const who = await response.json().catch(() => ({}));
  if (!response.ok) fail(401, "GitHub anahtarı geçersiz.");
  if (String(who.login).toLowerCase() !== OWNER.toLowerCase()) fail(403, `Kurulumu yalnızca ${OWNER} yapabilir.`);

  // Sahip kullanıcı adını kendisi seçer; ad değişirse eski sahip hesabı silinir.
  const name = cleanName(username);
  const previous = await env.USERS.get("owner");
  const raw = await env.USERS.get(`user:${name}`);
  const user = raw ? JSON.parse(raw) : { name, display: String(username).trim().slice(0, 40) };
  if (raw && !user.owner) fail(409, `"${name}" kullanıcı adı başka birinde. Başka bir ad seç.`);
  user.owner = true;
  await savePassword(env, user, password);
  if (previous && previous !== name) await env.USERS.delete(`user:${previous}`);
  await env.USERS.put("owner", name);
  return json(publicUser(user));
}

async function session(request, env) {
  const token = bearer(request);
  const name = token && (await env.USERS.get(`session:${token}`));
  const raw = name && (await env.USERS.get(`user:${name}`));
  if (!raw) fail(401, "Oturum kapanmış. Tekrar giriş yap.");
  return JSON.parse(raw);
}

async function github(request, env, path, me) {
  if (!path.startsWith(`/repos/${REPO}/`) || !GITHUB_PATHS.some((re) => re.test(path))) fail(403, "Bu işleme izin yok.");
  const init = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "babuslar-panel",
    },
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    let payload = await request.text();
    // PR açıklamasına işi yapan panel kullanıcısı yazılır (panel ne gönderirse göndersin).
    if (request.method === "POST" && /\/pulls$/.test(path)) {
      const data = JSON.parse(payload || "{}");
      data.body = `Yönetim panelinden ${me.display || me.name} (${me.name}) tarafından yapıldı.`;
      payload = JSON.stringify(data);
    }
    init.headers["Content-Type"] = "application/json";
    init.body = payload;
  }
  const response = await fetch("https://api.github.com" + path, init);
  return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") || "application/json", "Cache-Control": "no-store" } });
}

async function savePassword(env, user, password) {
  if (typeof password !== "string" || password.length < 8) fail(400, "Şifre en az 8 karakter olmalı.");
  user.salt = randomHex(16);
  user.hash = await hash(password, user.salt);
  await env.USERS.put(`user:${user.name}`, JSON.stringify(user));
}

async function verify(user, password) {
  if (!user?.hash || typeof password !== "string") return false;
  const actual = await hash(password, user.salt);
  // Sabit süreli karşılaştırma.
  let diff = actual.length ^ user.hash.length;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ user.hash.charCodeAt(i);
  return diff === 0;
}

async function hash(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hexBytes(salt), iterations: ITERATIONS }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Kullanıcı adı: küçük harf, harf/rakam/-/_ (Türkçe karakterler sadeleşir: "Şükrü" → "sukru").
function cleanName(value) {
  const name = String(value || "")
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (!/^[a-z0-9_-]{2,32}$/.test(name)) fail(400, "Kullanıcı adı 2-32 karakter olmalı; harf, rakam, - ve _ kullanılabilir.");
  return name;
}

const publicUser = (u) => ({ login: u.name, name: u.display || u.name, owner: !!u.owner });
const bearer = (request) => (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "") || null;
const randomHex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const hexBytes = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));

async function body(request) {
  try {
    return await request.json();
  } catch {
    fail(400, "Geçersiz istek.");
  }
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}
