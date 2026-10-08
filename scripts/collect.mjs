// Riot API'den üst seviye dereceli maçları toplar ve sitenin okuduğu stats.json'u üretir.
// GitHub Actions'ta her gece çalışır (.github/workflows/lol-istatistik.yml).
//
// Ortam değişkenleri:
//   RIOT_API_KEY     Riot geliştirici anahtarı (GitHub Secrets'tan gelir)
//   STATE_DIR        state.json ve stats.json'un okunup yazılacağı klasör (varsayılan: veri)
//   PLATFORMS        Sunucular, virgülle (varsayılan: tr1,euw1)
//   TIME_BUDGET_MIN  En fazla kaç dakika maç toplanacak (varsayılan: 100)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { addMatch, buildOutput, itemInfo, prune, sortPatches } from "./aggregate.mjs";

// Kopyalarken karışan boşluk / satır sonu anahtarı geçersiz kılmasın.
const KEY = (process.env.RIOT_API_KEY || "").trim();
const STATE_DIR = process.env.STATE_DIR || "veri";
const PLATFORMS = (process.env.PLATFORMS || "tr1,euw1").split(",").map((p) => p.trim().toLowerCase());
const BUDGET_MS = Number(process.env.TIME_BUDGET_MIN || 100) * 60_000;

const ROUTING = { tr1: "europe", euw1: "europe", eun1: "europe", ru: "europe", na1: "americas", br1: "americas", kr: "asia", jp1: "asia" };
const TIERS = ["challenger", "grandmaster", "master"];
const LOOKBACK_SECONDS = 3 * 24 * 60 * 60; // son 3 günün maçları
const MATCHES_PER_PLAYER = 10;
const MIN_INTERVAL_MS = 1250; // kişisel anahtar sınırı: 2 dakikada 100 istek
const SAVE_EVERY = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const started = Date.now();
const timeLeft = () => BUDGET_MS - (Date.now() - started);

let lastRequest = 0;
async function riot(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();

    let r;
    try {
      r = await fetch(url, { headers: { "X-Riot-Token": KEY } });
      if (r.ok) return await r.json();
    } catch (error) {
      // Bağlantı kopması ("terminated", zaman aşımı vb.): bekleyip tekrar dene.
      console.log(`Bağlantı hatası (${error.message}), tekrar denenecek.`);
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (r.status === 429) {
      await sleep(Number(r.headers.get("retry-after") || 10) * 1000);
      continue;
    }
    if (r.status >= 500) {
      await sleep(5000);
      continue;
    }
    if (r.status === 404) return null;
    if (r.status === 401 || r.status === 403) {
      throw new Error("Riot anahtarı geçersiz ya da süresi dolmuş (HTTP " + r.status + "). GitHub Secrets'taki RIOT_API_KEY'i yenileyin.");
    }
    throw new Error(`HTTP ${r.status}: ${url}`);
  }
  // 5 denemede de alınamadıysa bu isteği atla; görev durmasın.
  return null;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function loadItemInfo() {
  const versions = await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json();
  const items = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/item.json`)).json();
  return itemInfo(items.data);
}

async function players() {
  const list = [];
  for (const platform of PLATFORMS) {
    for (const tier of TIERS) {
      const league = await riot(`https://${platform}.api.riotgames.com/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`);
      for (const entry of league?.entries || []) {
        if (entry.puuid) list.push({ platform, puuid: entry.puuid });
      }
    }
  }
  // Her gün farklı oyunculardan başlansın diye karıştır.
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

async function save(statePath, state, info) {
  // Yalnızca son iki yama saklanır.
  const keep = new Set(sortPatches(Object.keys(state.agg.patches)).slice(0, 2));
  for (const patch of Object.keys(state.agg.patches)) if (!keep.has(patch)) delete state.agg.patches[patch];
  for (const patch of Object.keys(state.seen)) if (!keep.has(patch)) delete state.seen[patch];

  prune(state.agg);
  await writeFile(statePath, JSON.stringify(state));
  await writeFile(join(STATE_DIR, "stats.json"), JSON.stringify(buildOutput(state.agg, { boots: info.boots })));
}

// Oyuncuların son maçlarını toplar; süre dolunca ya da oyuncular bitince durur.
async function collectMatches({ queue, state, seen, info, statePath, progress }) {
  const since = Math.floor(Date.now() / 1000) - LOOKBACK_SECONDS;

  for (const { platform, puuid } of queue) {
    if (timeLeft() <= 0) return;
    const region = ROUTING[platform] || "europe";
    const ids =
      (await riot(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&type=ranked&startTime=${since}&count=${MATCHES_PER_PLAYER}`
      )) || [];

    for (const id of ids) {
      if (timeLeft() <= 0) return;
      if (seen.has(id)) continue;
      seen.add(id);

      const match = await riot(`https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`);
      const timeline = match && (await riot(`https://${region}.api.riotgames.com/lol/match/v5/matches/${id}/timeline`));
      if (!match || !timeline) continue;

      const patch = addMatch(state.agg, match, timeline, info);
      if (!patch) continue;
      (state.seen[patch] ??= []).push(id);
      progress.added++;
      if (progress.added % SAVE_EVERY === 0) {
        await save(statePath, state, info);
        console.log(`${progress.added} maç eklendi, kaydedildi.`);
      }
    }
  }
}

async function main() {
  if (!KEY) {
    console.log("::warning::RIOT_API_KEY tanımlı değil; maç toplanmadı. Anahtarı GitHub Secrets'a ekleyin.");
    return;
  }

  await mkdir(STATE_DIR, { recursive: true });
  const statePath = join(STATE_DIR, "state.json");
  const state = await readJson(statePath, { agg: { patches: {} }, seen: {} });
  const seen = new Set(Object.values(state.seen).flat());
  const info = await loadItemInfo();

  const queue = await players();
  console.log(`${queue.length} oyuncu bulundu (${PLATFORMS.join(", ")}).`);

  // Beklenmedik bir hatada da o ana kadar toplanan maçlar kaydedilir.
  const progress = { added: 0 };
  try {
    await collectMatches({ queue, state, seen, info, statePath, progress });
  } finally {
    await save(statePath, state, info);
    const total = Object.values(state.agg.patches).reduce((sum, node) => sum + node.matches, 0);
    console.log(`Kaydedildi: bu çalışmada ${progress.added} maç eklendi, toplam ${total} maç.`);
  }
}
main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
