/**
 * Calpis Music Archive - Shared Favorites & Custom Songs API (/api/favorites) [v49]
 *
 * Stores and synchronizes:
 *   - `ids`: Array of recommended artist stable IDs (`["a_...", ...]`)
 *   - `songFavs`: Array of recommended songs (`["a_...\t曲名", ...]`)
 *   - `customSongs`: Array of manually added songs (`["a_...\t曲名", ...]`)
 *   - `version`: Optimistic concurrency integer
 *   - `updatedAt`: ISO timestamp
 *
 * Supported Zero-Cost Storage Backends (Auto-detected via Environment Variables):
 *   1. [Recommended #1] Upstash Redis (via Vercel Marketplace)
 *      - Env vars: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
 *      - Atomic Lua `EVAL` Check-And-Set + Cross-instance Redis rate limiting
 *   2. [Alternative #2] Vercel Global Config (formerly Edge Config)
 *      - Env vars: `GLOBAL_CONFIG` (or `EDGE_CONFIG`) + `VERCEL_API_TOKEN`
 *   3. [Alternative #3] GitHub Secret Gist (`GITHUB_GIST_ID` + `GITHUB_GIST_TOKEN`)
 */

const fs = require("fs");
const path = require("path");
const artistIndex = require("./_artists_index.js");

const MAX_BODY_BYTES = 64 * 1024; // 64 KB max payload
const MAX_IDS_COUNT = 1500;
const MAX_SONG_FAVS_COUNT = 5000;
const MAX_CUSTOM_SONGS_COUNT = 5000;
const STORAGE_KEY = "calpis_favorites";

const VALID_AID_SET = new Set(artistIndex.validAids || []);
const NAME_TO_AID = Object.assign({}, artistIndex.nameToAid || {});
const ALIAS_TO_AID = Object.assign({}, artistIndex.aliasToAid || {});
const NORM_TO_AID = Object.create(null);

function normalizeKey(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[\s\u3000]+/g, " ").toLowerCase();
}

for (const [name, aid] of Object.entries(NAME_TO_AID)) {
  NORM_TO_AID[normalizeKey(name)] = aid;
}
for (const [alias, aid] of Object.entries(ALIAS_TO_AID)) {
  const nk = normalizeKey(alias);
  if (!NORM_TO_AID[nk]) NORM_TO_AID[nk] = aid;
}

try {
  const masterPath = path.join(process.cwd(), "data", "artists_master.json");
  if (fs.existsSync(masterPath)) {
    const raw = fs.readFileSync(masterPath, "utf8");
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      for (const a of list) {
        if (a && typeof a.aid === "string" && a.aid.startsWith("a_")) {
          VALID_AID_SET.add(a.aid);
          if (typeof a.name === "string" && a.name.trim()) {
            NAME_TO_AID[a.name.trim()] = a.aid;
            NORM_TO_AID[normalizeKey(a.name)] = a.aid;
          }
          if (Array.isArray(a.al)) {
            for (const al of a.al) {
              if (typeof al === "string" && al.trim()) {
                const nk = normalizeKey(al);
                if (!NORM_TO_AID[nk]) NORM_TO_AID[nk] = a.aid;
              }
            }
          }
        }
      }
    }
  }
} catch (_ignore) {}

function resolveIdentifierToAid(rawId) {
  if (typeof rawId !== "string") return null;
  let trimmed = rawId.trim();
  if (!trimmed || trimmed.length > 120) return null;
  const tierMatch = trimmed.match(/^(.*?):([123])$/);
  if (tierMatch) {
    trimmed = tierMatch[1].trim();
  }
  if (VALID_AID_SET.has(trimmed)) return trimmed;
  if (NAME_TO_AID[trimmed]) return NAME_TO_AID[trimmed];
  if (ALIAS_TO_AID[trimmed]) return ALIAS_TO_AID[trimmed];
  const nk = normalizeKey(trimmed);
  if (NORM_TO_AID[nk]) return NORM_TO_AID[nk];
  if (/^a_[0-9a-f]{8}(?:_\d+)?$/.test(trimmed)) return trimmed;
  return null;
}

function resolveIdentifierWithTier(rawId) {
  if (typeof rawId !== "string") return null;
  const trimmed = rawId.trim();
  if (!trimmed || trimmed.length > 120) return null;
  let tier = 3;
  let baseRaw = trimmed;
  const tierMatch = trimmed.match(/^(.*?):([123])$/);
  if (tierMatch) {
    baseRaw = tierMatch[1].trim();
    tier = Number(tierMatch[2]) || 3;
  }
  const aid = resolveIdentifierToAid(baseRaw);
  if (!aid) return null;
  const formatted = tier === 1 ? `${aid}:1` : (tier === 2 ? `${aid}:2` : aid);
  return { aid, tier, formatted };
}

const SERVER_SONG_RENAME_MAP = {
  "Emily To Juugono Yakusoku": "エミリーと15の約束",
  "Nouriueno Cracker": "脳裏上のクラッカー",
  "Haru Koizakura": "春、恋桜。",
  "わたしね": "わたしね、、",
  "kick 【歌ってみた】Alfakyun. - kick (Cover) [試唱]": "kick [試唱]",
  "Hanabami": "花喰み",
  "こゆび姫♡": "♡こゆび姫♡",
  "No one": "ダレモ",
  "刹那の誓い": "刹那の誓い (feat. 由崎司)",
  "Transparent Compass": "コンパスは透明",
  "空は高く風は歌う - Piano & Strings": "空は高く風は歌う",
  "空は高く風は歌う - Piano $ Strings": "空は高く風は歌う",
  "かけぬけ★青春スパーキング！": "Love♡Vacation",
  "Pattern of two hearts": "二人模様",
  "Rokudougokan sanpo": "六道伍感さんぽ",
  "What if": "碧いif",
  "Answer to Extreme": "極私的極彩色アンサー",
  "melt into the dark": "闇に溶けてく",
  "Nameless Name": "名もなき何もかも",
  "Against All Answers": "もう何もいらない未来",
  "Roses in Thorns": "荊の薔薇",
  "Meant to be": "蝶に結いた赤い糸",
  "Belle papillon": "飛べない蝶は夢を見る",
  "Fragile Violet": "薄采ディスプレイ",
  "Mirage of the mind": "蜃気楼ニ問フ",
  "Give Me Life": "命をくれよ",
  "I’ｍ here": "運命の華",
  "I'm here": "運命の華",
  "ツギハギスタッカートを": "ツギハギスタッカート",
  "Himawari": "向日葵",
  "Blue": "夜に藍",
  "OVER / Just Be Friends-piano.ver-": "OVER",
  "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌)": "エテルネル",
  "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル",
  "エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル",
  "エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌)": "エテルネル",
  "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌) / エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル"
};

/**
 * Normalizes a song entry (`"aid\tsongTitle"`, `"aid\tsongTitle||2"`, or `{ aid, song, tier }`) into canonical `"aid\tsongTitle"`.
 * Returns `null` if invalid or if the artist does not exist.
 */
function resolveSongEntry(rawEntry, preserveTierSuffix = false) {
  let rawArtist = "";
  let rawSong = "";
  let explicitTier = 0;

  if (typeof rawEntry === "string") {
    const tabIdx = rawEntry.indexOf("\t");
    if (tabIdx <= 0) return null;
    rawArtist = rawEntry.slice(0, tabIdx);
    rawSong = rawEntry.slice(tabIdx + 1);
  } else if (rawEntry && typeof rawEntry === "object") {
    rawArtist = String(rawEntry.aid || rawEntry.artist || "");
    rawSong = String(rawEntry.song || rawEntry.title || "");
    if (rawEntry.tier === 1 || rawEntry.tier === 2 || rawEntry.tier === 3) {
      explicitTier = rawEntry.tier;
    }
  } else {
    return null;
  }

  const aid = resolveIdentifierToAid(rawArtist);
  if (!aid) return null;

  let cleanSong = rawSong.replace(/[\r\n\t]+/g, " ").trim();
  let tier = explicitTier || 3;
  const tierMatch = cleanSong.match(/^(.*?)\|\|([123])$/);
  if (tierMatch) {
    cleanSong = tierMatch[1].trim();
    if (!explicitTier) tier = Number(tierMatch[2]) || 3;
  }
  if (!cleanSong || cleanSong.length > 180) return null;
  if (SERVER_SONG_RENAME_MAP[cleanSong]) {
    cleanSong = SERVER_SONG_RENAME_MAP[cleanSong];
  }

  const baseKey = `${aid}\t${cleanSong}`;
  if (!preserveTierSuffix) return baseKey;
  const formatted = tier === 1 ? `${baseKey}||1` : (tier === 2 ? `${baseKey}||2` : baseKey);
  return { baseKey, tier, formatted };
}

const REDIS_RATE_LIMIT_LUA = `
local k1 = KEYS[1]
local limit1 = tonumber(ARGV[1])
local win1 = tonumber(ARGV[2])
local c1 = redis.call("INCR", k1)
if c1 == 1 then redis.call("PEXPIRE", k1, win1) end
if c1 > limit1 then return {0, 1} end

if KEYS[2] and KEYS[2] ~= "" then
  local k2 = KEYS[2]
  local limit2 = tonumber(ARGV[3])
  local win2 = tonumber(ARGV[4])
  local c2 = redis.call("INCR", k2)
  if c2 == 1 then redis.call("PEXPIRE", k2, win2) end
  if c2 > limit2 then return {0, 2} end
end

if KEYS[3] and KEYS[3] ~= "" then
  local k3 = KEYS[3]
  local limit3 = tonumber(ARGV[5])
  local win3 = tonumber(ARGV[6])
  local c3 = redis.call("INCR", k3)
  if c3 == 1 then redis.call("PEXPIRE", k3, win3) end
  if c3 > limit3 then return {0, 3} end
end

return {1, 0}
`;

const REDIS_ATOMIC_CAS_LUA = `
local key = KEYS[1]
local expectedBaseVer = tonumber(ARGV[1])
local newIdsJson = ARGV[2]
local newSongFavsJson = ARGV[3]
local newCustomSongsJson = ARGV[4]
local updatedAt = ARGV[5]
local clientReqId = ARGV[6]
local action = ARGV[7]
local forceOverwrite = ARGV[8] == "1"

local raw = redis.call("GET", key)
local curVer = 0
local curIdsJson = "[]"
local curSongFavsJson = "[]"
local curCustomSongsJson = "[]"
local curLastReqId = ""

if raw and raw ~= false and raw ~= "" then
  local ok, decoded = pcall(cjson.decode, raw)
  if ok and type(decoded) == "table" then
    curVer = tonumber(decoded.version) or 0
    if type(decoded.ids) == "table" and #decoded.ids > 0 then
      curIdsJson = cjson.encode(decoded.ids)
    end
    if type(decoded.songFavs) == "table" and #decoded.songFavs > 0 then
      curSongFavsJson = cjson.encode(decoded.songFavs)
    end
    if type(decoded.customSongs) == "table" and #decoded.customSongs > 0 then
      curCustomSongsJson = cjson.encode(decoded.customSongs)
    end
    curLastReqId = tostring(decoded.lastRequestId or "")
  end
end

-- 1. Idempotency check
if clientReqId ~= "" and curLastReqId ~= "" and clientReqId == curLastReqId then
  return {"IDEMPOTENT", raw}
end

-- 2. No-op check (if all 3 arrays are identical, skip write)
if curVer > 0 and curIdsJson == newIdsJson and curSongFavsJson == newSongFavsJson and curCustomSongsJson == newCustomSongsJson then
  return {"UNCHANGED", raw}
end

-- 3. Initial migration protection
if action == "migrate" and curVer > 0 and not forceOverwrite then
  return {"ALREADY_INITIALIZED", raw}
end

-- 4. Atomic Optimistic Concurrency Check
if curVer > 0 and expectedBaseVer ~= curVer and not forceOverwrite then
  return {"CONFLICT", raw}
end

-- 5. Atomic Write with incremented version
local curMessages = nil
if raw and raw ~= false and raw ~= "" then
  local okM, decM = pcall(cjson.decode, raw)
  if okM and type(decM) == "table" and type(decM.messages) == "table" and #decM.messages > 0 then
    curMessages = decM.messages
  end
end
local nextVer = curVer + 1
local nextObj = {
  ids = cjson.decode(newIdsJson),
  songFavs = cjson.decode(newSongFavsJson),
  customSongs = cjson.decode(newCustomSongsJson),
  messages = curMessages,
  version = nextVer,
  updatedAt = updatedAt,
  lastRequestId = clientReqId
}
local nextRaw = cjson.encode(nextObj)
redis.call("SET", key, nextRaw)
return {"SAVED", nextRaw}
`;

const ipReadWindows = new Map();
const ipWriteMinuteWindows = new Map();
const ipWriteHourWindows = new Map();
let globalWriteMinuteTimestamps = [];
let recentWriteCache = null;

function checkInMemoryRateLimit(ip, isWrite) {
  const now = Date.now();
  const cleanWindow = (arr, windowMs) => arr.filter(t => now - t < windowMs);

  if (!isWrite) {
    const prev = cleanWindow(ipReadWindows.get(ip) || [], 60 * 1000);
    if (prev.length >= 90) {
      return { allowed: false, retryAfterSec: 30, message: "読み込みリクエストが多すぎます。しばらく待ってから再読み込みしてください。" };
    }
    prev.push(now);
    ipReadWindows.set(ip, prev);
    return { allowed: true };
  }

  const minWin = cleanWindow(ipWriteMinuteWindows.get(ip) || [], 60 * 1000);
  const hrWin = cleanWindow(ipWriteHourWindows.get(ip) || [], 60 * 60 * 1000);
  globalWriteMinuteTimestamps = cleanWindow(globalWriteMinuteTimestamps, 60 * 1000);

  if (minWin.length >= 6 || globalWriteMinuteTimestamps.length >= 15) {
    return { allowed: false, retryAfterSec: 60, message: "短時間に保存操作が集中しています。1分ほど待ってから再度「完了して閉じる」を押してください。" };
  }
  if (hrWin.length >= 30) {
    return { allowed: false, retryAfterSec: 300, message: "1時間あたりの保存回数上限に達しました。しばらく時間を置いてから再度お試しください。" };
  }

  minWin.push(now);
  hrWin.push(now);
  globalWriteMinuteTimestamps.push(now);
  ipWriteMinuteWindows.set(ip, minWin);
  ipWriteHourWindows.set(ip, hrWin);
  return { allowed: true };
}

async function checkRateLimit(backend, ip, isWrite) {
  if (backend && backend.name === "upstash-redis") {
    try {
      const { url, token } = backend.config;
      const safeIp = String(ip || "unknown").replace(/[^a-zA-Z0-9.:_-]/g, "_").slice(0, 64);
      const cmd = isWrite
        ? [
            "EVAL",
            REDIS_RATE_LIMIT_LUA,
            3,
            `calpis_rl:w:m:${safeIp}`,
            `calpis_rl:w:h:${safeIp}`,
            `calpis_rl:w:g`,
            6, 60000,
            30, 3600000,
            15, 60000
          ]
        : [
            "EVAL",
            REDIS_RATE_LIMIT_LUA,
            1,
            `calpis_rl:r:m:${safeIp}`,
            90, 60000
          ];
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cmd),
        cache: "no-store"
      });
      if (resp.ok) {
        const data = await resp.json();
        const resArr = data && data.result;
        if (Array.isArray(resArr) && resArr[0] === 0) {
          const reason = resArr[1];
          return {
            allowed: false,
            retryAfterSec: reason === 2 ? 300 : 60,
            message: isWrite
              ? "短時間に保存操作が集中しています。しばらく待ってから再度「完了して閉じる」を押してください。"
              : "読み込みリクエストが多すぎます。しばらく待ってから再読み込みしてください。"
          };
        }
        if (Array.isArray(resArr) && resArr[0] === 1) {
          return { allowed: true };
        }
      }
    } catch (_e) {}
  }
  return checkInMemoryRateLimit(ip, isWrite);
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  const xrip = req.headers["x-real-ip"];
  if (typeof xrip === "string" && xrip.trim()) {
    return xrip.trim();
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function setNoCacheHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function normalizeStateObject(raw) {
  if (!raw || typeof raw !== "object") {
    return { ids: [], songFavs: [], customSongs: [], messages: [], version: 0, updatedAt: null, lastRequestId: "" };
  }
  const rawIds = Array.isArray(raw.ids) ? raw.ids : [];
  const validIds = [];
  const seenIds = new Set();
  for (const item of rawIds) {
    const res = resolveIdentifierWithTier(item);
    if (res && !seenIds.has(res.aid)) {
      seenIds.add(res.aid);
      validIds.push(res.formatted);
    }
  }
  // Preserve custom artist order & heart tier

  const rawSongFavs = Array.isArray(raw.songFavs) ? raw.songFavs : [];
  const validSongFavs = [];
  const seenSongFavs = new Set();
  for (const item of rawSongFavs) {
    const res = resolveSongEntry(item, true);
    if (res && !seenSongFavs.has(res.baseKey)) {
      seenSongFavs.add(res.baseKey);
      validSongFavs.push(res.formatted);
    }
  }
  // Preserve custom song order

  const rawCustomSongs = Array.isArray(raw.customSongs) ? raw.customSongs : [];
  const validCustomSongs = [];
  const seenCustomSongs = new Set();
  for (const item of rawCustomSongs) {
    const key = resolveSongEntry(item);
    if (key && !seenCustomSongs.has(key)) {
      seenCustomSongs.add(key);
      validCustomSongs.push(key);
    }
  }
  validCustomSongs.sort();

  const hasAnyData = validIds.length > 0 || validSongFavs.length > 0 || validCustomSongs.length > 0;
  const version = typeof raw.version === "number" && Number.isFinite(raw.version) && raw.version >= 0
    ? Math.floor(raw.version)
    : (hasAnyData ? 1 : 0);

  const rawMessages = Array.isArray(raw.messages) ? raw.messages : [];
  const validMessages = [];
  const seenMsgIds = new Set();
  for (const m of rawMessages) {
    if (m && typeof m === "object" && typeof m.text === "string" && m.text.trim()) {
      const mid = typeof m.id === "string" && m.id.trim() ? m.id.trim().slice(0, 64) : `msg_${validMessages.length}`;
      if (!seenMsgIds.has(mid)) {
        seenMsgIds.add(mid);
        validMessages.push({
          id: mid,
          text: m.text.trim().slice(0, 1500),
          createdAt: typeof m.createdAt === "string" ? m.createdAt : null
        });
      }
    }
    if (validMessages.length >= 200) break;
  }

  return {
    ids: validIds,
    songFavs: validSongFavs,
    customSongs: validCustomSongs,
    messages: validMessages,
    version,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    lastRequestId: typeof raw.lastRequestId === "string" ? raw.lastRequestId : ""
  };
}

function parseUpstashEnv() {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/\/+$/, "");
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (url && token) {
    return { url, token };
  }
  return null;
}

function parseGlobalConfigEnv() {
  const connStr = (process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG || "").trim();
  let configId = (process.env.GLOBAL_CONFIG_ID || process.env.EDGE_CONFIG_ID || "").trim();
  let readToken = (process.env.GLOBAL_CONFIG_TOKEN || process.env.EDGE_CONFIG_TOKEN || "").trim();
  let readOrigin = "https://global-config.vercel.com";

  if (connStr) {
    try {
      const u = new URL(connStr);
      readOrigin = u.origin;
      const seg = u.pathname.replace(/^\/+/, "").split("/")[0];
      if (seg && seg.startsWith("ecfg_")) {
        configId = seg;
      }
      const tok = u.searchParams.get("token");
      if (tok) readToken = tok;
    } catch (_e) {}
  }

  const apiToken = (process.env.VERCEL_API_TOKEN || "").trim();
  const teamId = (process.env.VERCEL_TEAM_ID || "").trim();

  if (configId && (readToken || apiToken)) {
    return { configId, readToken, readOrigin, apiToken, teamId };
  }
  return null;
}

function parseGistEnv() {
  const gistId = (process.env.GITHUB_GIST_ID || "").trim();
  const gistToken = (process.env.GITHUB_GIST_TOKEN || "").trim();
  if (gistId && gistToken) {
    return { gistId, gistToken };
  }
  return null;
}

function detectStorageBackend(req) {
  const upstash = parseUpstashEnv();
  if (upstash) {
    return {
      name: "upstash-redis",
      configured: true,
      atomicCas: true,
      config: upstash
    };
  }
  const globalCfg = parseGlobalConfigEnv();
  if (globalCfg) {
    return {
      name: "vercel-global-config",
      configured: Boolean(globalCfg.configId && globalCfg.apiToken),
      readOnlyConfigured: Boolean(globalCfg.configId && globalCfg.readToken && !globalCfg.apiToken),
      atomicCas: false,
      config: globalCfg
    };
  }
  const gist = parseGistEnv();
  if (gist) {
    return {
      name: "github-gist",
      configured: true,
      atomicCas: false,
      config: gist
    };
  }
  const host = String((req && req.headers && req.headers.host) || "");
  const isLocal = process.env.ALLOW_LOCAL_FILE_STORE === "1" || host.startsWith("localhost") || host.startsWith("127.0.0.1");
  return {
    name: isLocal ? "local-file" : "unconfigured",
    configured: isLocal,
    atomicCas: isLocal,
    config: { filePath: process.env.LOCAL_FAV_STORE_PATH || "/tmp/calpis_favorites_local.json" }
  };
}

async function readFromBackend(backend, options = {}) {
  const strong = Boolean(options.strong);

  if (backend.name === "upstash-redis") {
    const { url, token } = backend.config;
    const resp = await fetch(`${url}/get/${STORAGE_KEY}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!resp.ok) {
      throw new Error(`Upstash Redis GET failed with status ${resp.status}`);
    }
    const data = await resp.json();
    if (!data || data.result === null || data.result === undefined) {
      return normalizeStateObject(null);
    }
    const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    return normalizeStateObject(parsed);
  }

  if (recentWriteCache && Date.now() < recentWriteCache.expiresAt) {
    return normalizeStateObject(recentWriteCache.state);
  }

  if (backend.name === "vercel-global-config") {
    const { configId, readToken, readOrigin, apiToken, teamId } = backend.config;
    const teamQuery = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";

    if ((strong || !readToken) && apiToken) {
      const endpoints = [
        `https://api.vercel.com/v1/global-config/${encodeURIComponent(configId)}/item/${STORAGE_KEY}${teamQuery}`,
        `https://api.vercel.com/v1/edge-config/${encodeURIComponent(configId)}/item/${STORAGE_KEY}${teamQuery}`
      ];
      for (const ep of endpoints) {
        const resp = await fetch(ep, {
          method: "GET",
          headers: { Authorization: `Bearer ${apiToken}` },
          cache: "no-store"
        });
        if (resp.status === 404) {
          return normalizeStateObject(null);
        }
        if (resp.ok) {
          const text = await resp.text();
          if (!text || text === "null") return normalizeStateObject(null);
          return normalizeStateObject(JSON.parse(text));
        }
      }
    }

    if (readToken) {
      const origins = [readOrigin];
      if (!origins.includes("https://global-config.vercel.com")) origins.push("https://global-config.vercel.com");
      if (!origins.includes("https://edge-config.vercel.com")) origins.push("https://edge-config.vercel.com");

      for (const orig of origins) {
        const readUrl = `${orig}/${encodeURIComponent(configId)}/item/${STORAGE_KEY}`;
        const resp = await fetch(readUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${readToken}` },
          cache: "no-store"
        });
        if (resp.status === 404) {
          return normalizeStateObject(null);
        }
        if (resp.ok) {
          const text = await resp.text();
          if (!text || text === "null") return normalizeStateObject(null);
          return normalizeStateObject(JSON.parse(text));
        }
      }
      throw new Error("Global Config read failed");
    }

    return normalizeStateObject(null);
  }

  if (backend.name === "github-gist") {
    const { gistId, gistToken } = backend.config;
    const resp = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${gistToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "CalpisMusicArchive/1.0"
      },
      cache: "no-store"
    });
    if (!resp.ok) {
      throw new Error(`GitHub Gist GET failed with status ${resp.status}`);
    }
    const gist = await resp.json();
    const fileObj = gist && gist.files && gist.files["calpis_favorites.json"];
    if (!fileObj || !fileObj.content) {
      return normalizeStateObject(null);
    }
    return normalizeStateObject(JSON.parse(fileObj.content));
  }

  if (backend.name === "local-file") {
    const fp = backend.config.filePath;
    if (!fs.existsSync(fp)) return normalizeStateObject(null);
    try {
      return normalizeStateObject(JSON.parse(fs.readFileSync(fp, "utf8")));
    } catch (_e) {
      return normalizeStateObject(null);
    }
  }

  return normalizeStateObject(null);
}

async function atomicCasUpstashWrite(backend, params) {
  const { url, token } = backend.config;
  const { normalizedAids, normalizedSongFavs, normalizedCustomSongs, baseVersion, updatedAt, clientRequestId, action, forceOverwrite } = params;

  const evalCmd = [
    "EVAL",
    REDIS_ATOMIC_CAS_LUA,
    1,
    STORAGE_KEY,
    String(baseVersion),
    JSON.stringify(normalizedAids),
    JSON.stringify(normalizedSongFavs),
    JSON.stringify(normalizedCustomSongs),
    updatedAt,
    clientRequestId,
    action,
    forceOverwrite ? "1" : "0"
  ];

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(evalCmd),
    cache: "no-store"
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Upstash Redis EVAL failed (HTTP ${resp.status}): ${txt.slice(0, 180)}`);
  }

  const data = await resp.json();
  const resArr = data && data.result;
  if (!Array.isArray(resArr) || resArr.length < 2) {
    throw new Error("Unexpected response format from Upstash Redis EVAL");
  }

  const statusTag = resArr[0];
  const stateJson = resArr[1];
  const stateObj = normalizeStateObject(stateJson ? JSON.parse(stateJson) : null);

  return { statusTag, stateObj };
}

async function writeToNonAtomicBackend(backend, nextState) {
  if (backend.name === "vercel-global-config") {
    const { configId, apiToken, teamId } = backend.config;
    if (!apiToken) {
      const err = new Error("VERCEL_API_TOKEN が設定されていないため、サーバーへ書き込めません。");
      err.code = "missing_write_token";
      throw err;
    }
    const teamQuery = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    const patchBody = JSON.stringify({
      items: [
        {
          operation: "upsert",
          key: STORAGE_KEY,
          value: nextState
        }
      ]
    });

    const endpoints = [
      `https://api.vercel.com/v1/global-config/${encodeURIComponent(configId)}/items${teamQuery}`,
      `https://api.vercel.com/v1/edge-config/${encodeURIComponent(configId)}/items${teamQuery}`
    ];

    let lastStatus = 0;
    let lastText = "";
    for (const ep of endpoints) {
      const resp = await fetch(ep, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: patchBody
      });
      lastStatus = resp.status;
      if (resp.ok) {
        recentWriteCache = { state: nextState, expiresAt: Date.now() + 20000 };
        return;
      }
      lastText = await resp.text().catch(() => "");
      if (resp.status !== 404) break;
    }
    throw new Error(`Global Config update failed (HTTP ${lastStatus}): ${lastText.slice(0, 180)}`);
  }

  if (backend.name === "github-gist") {
    const { gistId, gistToken } = backend.config;
    const resp = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${gistToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "CalpisMusicArchive/1.0"
      },
      body: JSON.stringify({
        files: {
          "calpis_favorites.json": {
            content: JSON.stringify(nextState, null, 2)
          }
        }
      })
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`GitHub Gist PATCH failed (HTTP ${resp.status}): ${txt.slice(0, 180)}`);
    }
    recentWriteCache = { state: nextState, expiresAt: Date.now() + 20000 };
    return;
  }

  if (backend.name === "local-file") {
    const fp = backend.config.filePath;
    fs.writeFileSync(fp, JSON.stringify(nextState, null, 2), "utf8");
    recentWriteCache = { state: nextState, expiresAt: Date.now() + 20000 };
    return;
  }

  const err = new Error("サーバー保存先（Upstash Redis または Vercel Global Config）の環境変数が未設定です。");
  err.code = "storage_unconfigured";
  throw err;
}

function areSortedArraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function verifyWriteRequestSecurity(req) {
  const clientHeader = req.headers["x-calpis-client"];
  const intentHeader = req.headers["x-calpis-edit-intent"];
  if (clientHeader !== "archive-v1" || intentHeader !== "1") {
    return { ok: false, status: 403, message: "不正なリクエストヘッダーです。" };
  }

  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site" && secFetchSite !== "none") {
    return { ok: false, status: 403, message: "クロスサイトからの書き込みリクエストは拒否されました。" };
  }

  const origin = req.headers["origin"];
  const host = req.headers["host"];
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return { ok: false, status: 403, message: "許可されていないオリジンからのリクエストです。" };
      }
    } catch (_e) {
      return { ok: false, status: 403, message: "不正なOriginヘッダーです。" };
    }
  }

  return { ok: true };
}

async function parseJsonBodyWithLimit(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    const rawStr = JSON.stringify(req.body);
    if (Buffer.byteLength(rawStr, "utf8") > MAX_BODY_BYTES) {
      const err = new Error("リクエストサイズが上限（64KB）を超えています。");
      err.status = 413;
      throw err;
    }
    return req.body;
  }

  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_BODY_BYTES) {
      const err = new Error("リクエストサイズが上限（64KB）を超えています。");
      err.status = 413;
      throw err;
    }
    return JSON.parse(req.body);
  }

  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    const chunks = [];
    req.on("data", chunk => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        const err = new Error("リクエストサイズが上限（64KB）を超えています。");
        err.status = 413;
        req.destroy();
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_e) {
        const err = new Error("JSONの形式が不正です。");
        err.status = 400;
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  setNoCacheHeaders(res);

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({
      ok: false,
      error: "method_not_allowed",
      message: "許可されていないHTTPメソッドです。"
    });
  }

  const backend = detectStorageBackend(req);
  const clientIp = getClientIp(req);
  const isWrite = req.method === "POST";
  const rateCheck = await checkRateLimit(backend, clientIp, isWrite);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSec || 60));
    return res.status(429).json({
      ok: false,
      error: "rate_limited",
      message: rateCheck.message
    });
  }

  // ==================== GET /api/favorites ====================
  if (req.method === "GET") {
    try {
      const wantFresh = Boolean(req.query && req.query.fresh === "1");
      const current = await readFromBackend(backend, { strong: wantFresh });
      const wantMessages = Boolean(req.query && req.query.messages === "1");
      const payload = {
        ok: true,
        configured: backend.configured,
        storageBackend: backend.name,
        atomicCas: Boolean(backend.atomicCas),
        ids: current.ids,
        songFavs: current.songFavs,
        customSongs: current.customSongs,
        version: current.version,
        updatedAt: current.updatedAt
      };
      if (wantMessages) {
        payload.messages = Array.isArray(current.messages) ? current.messages : [];
      }
      return res.status(200).json(payload);
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: "read_failed",
        configured: backend.configured,
        storageBackend: backend.name,
        message: "共有データの取得に失敗しました。",
        detail: err && err.message ? String(err.message) : "Unknown error"
      });
    }
  }

  // ==================== POST /api/favorites ====================
  const secCheck = verifyWriteRequestSecurity(req);
  if (!secCheck.ok) {
    return res.status(secCheck.status).json({
      ok: false,
      error: "forbidden",
      message: secCheck.message
    });
  }

  let body;
  try {
    body = await parseJsonBodyWithLimit(req);
  } catch (err) {
    return res.status(err.status || 400).json({
      ok: false,
      error: err.status === 413 ? "payload_too_large" : "invalid_json",
      message: err.message || "リクエストボディが不正です。"
    });
  }

  if (body && typeof body === "object" && (body.action === "send_message" || body.action === "delete_message")) {
    if (!backend.configured) {
      return res.status(503).json({
        ok: false,
        error: "storage_unconfigured",
        message: "サーバー保存先が未設定です。"
      });
    }
    try {
      const current = await readFromBackend(backend, { strong: true });
      const curMessages = Array.isArray(current.messages) ? [...current.messages] : [];
      let nextMessages = curMessages;

      if (body.action === "send_message") {
        const rawText = typeof body.message === "string" ? body.message.trim() : "";
        if (!rawText) {
          return res.status(400).json({ ok: false, error: "empty_message", message: "メッセージを入力してください。" });
        }
        if (rawText.length > 1500) {
          return res.status(400).json({ ok: false, error: "message_too_long", message: "メッセージは1,500文字以内で入力してください。" });
        }
        const msgObj = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          text: rawText,
          createdAt: new Date().toISOString()
        };
        nextMessages = [msgObj, ...curMessages].slice(0, 200);
      } else if (body.action === "delete_message") {
        const targetId = typeof body.messageId === "string" ? body.messageId.trim() : "";
        if (targetId === "ALL") {
          nextMessages = [];
        } else {
          nextMessages = curMessages.filter(m => m && m.id !== targetId);
        }
      }

      const nextState = {
        ids: current.ids || [],
        songFavs: current.songFavs || [],
        customSongs: current.customSongs || [],
        messages: nextMessages,
        version: current.version || 1,
        updatedAt: current.updatedAt || new Date().toISOString(),
        lastRequestId: current.lastRequestId || ""
      };

      if (backend.name === "upstash-redis") {
        const { url, token } = backend.config;
        const resp = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(["SET", STORAGE_KEY, JSON.stringify(nextState)]),
          cache: "no-store"
        });
        if (!resp.ok) {
          throw new Error(`Upstash Redis SET failed (${resp.status})`);
        }
      } else {
        await writeToNonAtomicBackend(backend, nextState);
      }

      return res.status(200).json({
        ok: true,
        action: body.action,
        messages: body.action === "delete_message" ? nextMessages : undefined
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: "message_op_failed",
        message: "メッセージ処理中にエラーが発生しました。"
      });
    }
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.ids)) {
    return res.status(400).json({
      ok: false,
      error: "invalid_payload",
      message: "ids 配列が必要です。"
    });
  }

  if (body.ids.length > MAX_IDS_COUNT) {
    return res.status(400).json({
      ok: false,
      error: "too_many_ids",
      message: `登録可能な名義数の上限（${MAX_IDS_COUNT}件）を超えています。`
    });
  }

  const rawSongFavs = Array.isArray(body.songFavs) ? body.songFavs : [];
  const rawCustomSongs = Array.isArray(body.customSongs) ? body.customSongs : [];

  if (rawSongFavs.length > MAX_SONG_FAVS_COUNT || rawCustomSongs.length > MAX_CUSTOM_SONGS_COUNT) {
    return res.status(400).json({
      ok: false,
      error: "too_many_songs",
      message: "楽曲設定数の上限を超えています。"
    });
  }

  const action = body.action === "migrate" ? "migrate" : "save";
  const baseVersion = typeof body.baseVersion === "number" && Number.isFinite(body.baseVersion) && body.baseVersion >= 0
    ? Math.floor(body.baseVersion)
    : null;

  if (baseVersion === null) {
    return res.status(400).json({
      ok: false,
      error: "invalid_base_version",
      message: "baseVersion（0以上の整数）が必要です。"
    });
  }

  const normalizedAids = [];
  const seenAids = new Set();
  const invalidEntries = [];

  for (const rawItem of body.ids) {
    if (typeof rawItem !== "string") {
      invalidEntries.push(String(rawItem));
      continue;
    }
    const res = resolveIdentifierWithTier(rawItem);
    if (!res) {
      invalidEntries.push(rawItem.slice(0, 60));
      continue;
    }
    if (!seenAids.has(res.aid)) {
      seenAids.add(res.aid);
      normalizedAids.push(res.formatted);
    }
  }

  if (action !== "migrate" && invalidEntries.length > 0) {
    return res.status(400).json({
      ok: false,
      error: "unknown_artist_id",
      message: `存在しないアーティスト識別子が含まれているため保存を拒否しました（${invalidEntries.length}件）。`,
      invalidSamples: invalidEntries.slice(0, 5)
    });
  }

  // Preserve custom artist order & heart tier

  const normalizedSongFavs = [];
  const seenSongFavs = new Set();
  for (const item of rawSongFavs) {
    const res = resolveSongEntry(item, true);
    if (!res) {
      if (action !== "migrate") {
        return res.status(400).json({
          ok: false,
          error: "invalid_song_fav",
          message: "不正なオススメ楽曲データが含まれています。"
        });
      }
      continue;
    }
    if (!seenSongFavs.has(res.baseKey)) {
      seenSongFavs.add(res.baseKey);
      normalizedSongFavs.push(res.formatted);
    }
  }
  // Preserve custom song order

  const normalizedCustomSongs = [];
  const seenCustomSongs = new Set();
  for (const item of rawCustomSongs) {
    const key = resolveSongEntry(item);
    if (!key) {
      if (action !== "migrate") {
        return res.status(400).json({
          ok: false,
          error: "invalid_custom_song",
          message: "不正な手動追加楽曲データが含まれています。"
        });
      }
      continue;
    }
    if (!seenCustomSongs.has(key)) {
      seenCustomSongs.add(key);
      normalizedCustomSongs.push(key);
    }
  }
  normalizedCustomSongs.sort();

  if (!backend.configured) {
    return res.status(503).json({
      ok: false,
      error: "storage_unconfigured",
      storageBackend: backend.name,
      message: backend.readOnlyConfigured
        ? "Vercelの環境変数 VERCEL_API_TOKEN が未設定のため書き込みできません。"
        : "Vercelの共有保存先（Upstash Redis または Global Config）が未設定です。設定手順書に沿って接続してください。"
    });
  }

  const clientRequestId = typeof body.clientRequestId === "string" ? body.clientRequestId.trim().slice(0, 80) : "";
  const forceOverwrite = body.forceOverwrite === true;
  const nowIso = new Date().toISOString();

  try {
    // Path A: Upstash Redis -> 100% Atomic Lua Check-And-Set (`EVAL`)
    if (backend.name === "upstash-redis") {
      const { statusTag, stateObj } = await atomicCasUpstashWrite(backend, {
        normalizedAids,
        normalizedSongFavs,
        normalizedCustomSongs,
        baseVersion,
        updatedAt: nowIso,
        clientRequestId,
        action,
        forceOverwrite
      });

      if (statusTag === "IDEMPOTENT" || statusTag === "UNCHANGED") {
        return res.status(200).json({
          ok: true,
          unchanged: true,
          idempotentReplay: statusTag === "IDEMPOTENT",
          configured: true,
          storageBackend: backend.name,
          atomicCas: true,
          ids: stateObj.ids,
          songFavs: stateObj.songFavs,
          customSongs: stateObj.customSongs,
          version: stateObj.version,
          updatedAt: stateObj.updatedAt
        });
      }

      if (statusTag === "ALREADY_INITIALIZED") {
        return res.status(409).json({
          ok: false,
          error: "already_initialized",
          message: "すでにサーバー上に共有ハート設定が保存されています。他の端末のデータで上書きしないよう移行を停止しました。",
          serverData: {
            ids: stateObj.ids,
            songFavs: stateObj.songFavs,
            customSongs: stateObj.customSongs,
            version: stateObj.version,
            updatedAt: stateObj.updatedAt
          }
        });
      }

      if (statusTag === "CONFLICT") {
        return res.status(409).json({
          ok: false,
          error: "conflict",
          message: "編集中に他の端末で設定が更新されました。最新データを確認してください。",
          serverData: {
            ids: stateObj.ids,
            songFavs: stateObj.songFavs,
            customSongs: stateObj.customSongs,
            version: stateObj.version,
            updatedAt: stateObj.updatedAt
          }
        });
      }

      return res.status(200).json({
        ok: true,
        unchanged: false,
        configured: true,
        storageBackend: backend.name,
        atomicCas: true,
        ids: stateObj.ids,
        songFavs: stateObj.songFavs,
        customSongs: stateObj.customSongs,
        version: stateObj.version,
        updatedAt: stateObj.updatedAt,
        ignoredUnknownCount: invalidEntries.length
      });
    }

    // Path B: Non-Redis backends (Global Config / Gist / Local File)
    const current = await readFromBackend(backend, { strong: true });

    if (clientRequestId && current.lastRequestId && clientRequestId === current.lastRequestId) {
      return res.status(200).json({
        ok: true,
        unchanged: true,
        idempotentReplay: true,
        configured: true,
        storageBackend: backend.name,
        atomicCas: Boolean(backend.atomicCas),
        ids: current.ids,
        songFavs: current.songFavs,
        customSongs: current.customSongs,
        version: current.version,
        updatedAt: current.updatedAt
      });
    }

    if (
      current.version > 0 &&
      areSortedArraysEqual(normalizedAids, current.ids) &&
      areSortedArraysEqual(normalizedSongFavs, current.songFavs) &&
      areSortedArraysEqual(normalizedCustomSongs, current.customSongs)
    ) {
      return res.status(200).json({
        ok: true,
        unchanged: true,
        configured: true,
        storageBackend: backend.name,
        atomicCas: Boolean(backend.atomicCas),
        ids: current.ids,
        songFavs: current.songFavs,
        customSongs: current.customSongs,
        version: current.version,
        updatedAt: current.updatedAt
      });
    }

    if (action === "migrate" && current.version > 0 && !forceOverwrite) {
      return res.status(409).json({
        ok: false,
        error: "already_initialized",
        message: "すでにサーバー上に共有ハート設定が保存されています。他の端末のデータで上書きしないよう移行を停止しました。",
        serverData: {
          ids: current.ids,
          songFavs: current.songFavs,
          customSongs: current.customSongs,
          version: current.version,
          updatedAt: current.updatedAt
        }
      });
    }

    if (current.version > 0 && baseVersion !== current.version && !forceOverwrite) {
      return res.status(409).json({
        ok: false,
        error: "conflict",
        message: "編集中に他の端末で設定が更新されました。最新データを確認してください。",
        serverData: {
          ids: current.ids,
          songFavs: current.songFavs,
          customSongs: current.customSongs,
          version: current.version,
          updatedAt: current.updatedAt
        }
      });
    }

    const nextState = {
      ids: normalizedAids,
      songFavs: normalizedSongFavs,
      customSongs: normalizedCustomSongs,
      version: (current.version || 0) + 1,
      updatedAt: nowIso,
      lastRequestId: clientRequestId
    };

    await writeToNonAtomicBackend(backend, nextState);

    return res.status(200).json({
      ok: true,
      unchanged: false,
      configured: true,
      storageBackend: backend.name,
      atomicCas: Boolean(backend.atomicCas),
      ids: nextState.ids,
      songFavs: nextState.songFavs,
      customSongs: nextState.customSongs,
      version: nextState.version,
      updatedAt: nextState.updatedAt,
      ignoredUnknownCount: invalidEntries.length
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.code || "write_failed",
      configured: backend.configured,
      storageBackend: backend.name,
      message: err && err.message ? String(err.message) : "サーバーへの保存中にエラーが発生しました。"
    });
  }
};
