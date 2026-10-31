/**
 * Calpis Music Archive - Shared Favorites API (/api/favorites)
 *
 * Stores ONLY the list of hearted artist stable IDs (`ids`), `version`, and `updatedAt`.
 * Supports zero-cost Vercel Hobby storage backends automatically via environment variables:
 *   1. Vercel Global Config / Edge Config (`EDGE_CONFIG` + `VERCEL_API_TOKEN`) [Recommended: 100% inside Vercel, $0]
 *   2. Upstash Redis / Vercel Marketplace KV (`KV_REST_API_URL` + `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) [$0]
 *   3. GitHub Secret Gist (`GITHUB_GIST_ID` + `GITHUB_GIST_TOKEN`) [$0, no Vercel redeploy]
 *
 * Security & Reliability Features (No-Login Personal Site Mode):
 *   - Strict input validation against the archive's valid artist ID index (`_artists_index.js`)
 *   - Automatic deduplication and canonical sorting of artist IDs
 *   - Request body size limit (max 32 KB)
 *   - Custom intent headers (`X-Calpis-Client: archive-v1`) & Same-Origin / Sec-Fetch-Site verification
 *   - Per-IP and global sliding-window rate limiting
 *   - Optimistic concurrency control (`baseVersion`) returning 409 Conflict to prevent silent overwrites
 *   - No-op write skipping (0 writes consumed when submitted IDs match current server state)
 *   - Strict `Cache-Control: no-store` headers so browsers, SW, and CDNs never serve stale data
 */

const fs = require("fs");
const path = require("path");
const artistIndex = require("./_artists_index.js");

const MAX_BODY_BYTES = 32 * 1024; // 32 KB max payload
const MAX_IDS_COUNT = 1500;
const STORAGE_KEY = "calpis_favorites";

// Build fast lookup tables from _artists_index.js
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

// Also dynamically index any newly synced artists from data/artists_master.json if present on disk
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
        }
      }
    }
  }
} catch (_ignore) {}

/**
 * Resolves an artist identifier (`aid`, exact `name`, or `alias`) to its canonical `aid`.
 * Returns `null` if the identifier does not correspond to a real artist in the archive.
 */
function resolveIdentifierToAid(rawId) {
  if (typeof rawId !== "string") return null;
  const trimmed = rawId.trim();
  if (!trimmed || trimmed.length > 120) return null;
  if (VALID_AID_SET.has(trimmed)) return trimmed;
  if (NAME_TO_AID[trimmed]) return NAME_TO_AID[trimmed];
  if (ALIAS_TO_AID[trimmed]) return ALIAS_TO_AID[trimmed];
  const nk = normalizeKey(trimmed);
  if (NORM_TO_AID[nk]) return NORM_TO_AID[nk];
  return null;
}

// In-memory rate limiter & short-lived write consistency cache (per warm instance)
const ipReadWindows = new Map();
const ipWriteMinuteWindows = new Map();
const ipWriteHourWindows = new Map();
let globalWriteMinuteTimestamps = [];
let recentWriteCache = null; // { state, expiresAt }

function checkRateLimit(ip, isWrite) {
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

  // Write rate limits: max 6/min per IP, max 30/hour per IP, max 15/min globally
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
    return { ids: [], version: 0, updatedAt: null, lastRequestId: "" };
  }
  const rawIds = Array.isArray(raw.ids) ? raw.ids : [];
  const validIds = [];
  const seen = new Set();
  for (const item of rawIds) {
    const aid = resolveIdentifierToAid(item);
    if (aid && !seen.has(aid)) {
      seen.add(aid);
      validIds.push(aid);
    }
  }
  validIds.sort();
  const version = typeof raw.version === "number" && Number.isFinite(raw.version) && raw.version >= 0
    ? Math.floor(raw.version)
    : (validIds.length > 0 ? 1 : 0);
  return {
    ids: validIds,
    version,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    lastRequestId: typeof raw.lastRequestId === "string" ? raw.lastRequestId : ""
  };
}

/**
 * Storage Backend Detection & Operations
 */
function parseEdgeConfigEnv() {
  const connStr = (process.env.EDGE_CONFIG || "").trim();
  let configId = (process.env.EDGE_CONFIG_ID || process.env.GLOBAL_CONFIG_ID || "").trim();
  let readToken = (process.env.EDGE_CONFIG_TOKEN || "").trim();
  let readOrigin = "https://edge-config.vercel.com";

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

function parseUpstashEnv() {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/\/+$/, "");
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (url && token) {
    return { url, token };
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
  const edgeCfg = parseEdgeConfigEnv();
  if (edgeCfg) {
    return {
      name: "vercel-global-config",
      configured: Boolean(edgeCfg.configId && edgeCfg.apiToken),
      readOnlyConfigured: Boolean(edgeCfg.configId && edgeCfg.readToken && !edgeCfg.apiToken),
      config: edgeCfg
    };
  }
  const upstash = parseUpstashEnv();
  if (upstash) {
    return {
      name: "upstash-redis",
      configured: true,
      config: upstash
    };
  }
  const gist = parseGistEnv();
  if (gist) {
    return {
      name: "github-gist",
      configured: true,
      config: gist
    };
  }
  const host = String((req && req.headers && req.headers.host) || "");
  const isLocal = process.env.ALLOW_LOCAL_FILE_STORE === "1" || host.startsWith("localhost") || host.startsWith("127.0.0.1");
  return {
    name: isLocal ? "local-file" : "unconfigured",
    configured: isLocal,
    config: { filePath: process.env.LOCAL_FAV_STORE_PATH || "/tmp/calpis_favorites_local.json" }
  };
}

async function readFromBackend(backend, options = {}) {
  const strong = Boolean(options.strong);

  // If a write occurred very recently on this warm instance, return the guaranteed fresh state
  if (recentWriteCache && Date.now() < recentWriteCache.expiresAt) {
    return normalizeStateObject(recentWriteCache.state);
  }

  if (backend.name === "vercel-global-config") {
    const { configId, readToken, readOrigin, apiToken, teamId } = backend.config;
    const teamQuery = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";

    // When strong consistency is required (e.g., inside POST before saving or ?fresh=1) and apiToken is present,
    // query the Vercel REST API directly so the 1-10s Edge Config CDN propagation window never causes stale reads.
    if ((strong || !readToken) && apiToken) {
      const endpoints = [
        `https://api.vercel.com/v1/edge-config/${encodeURIComponent(configId)}/item/${STORAGE_KEY}${teamQuery}`,
        `https://api.vercel.com/v1/global-config/${encodeURIComponent(configId)}/item/${STORAGE_KEY}${teamQuery}`
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

    // Standard ultra-fast Global Config / Edge Config read endpoint (100,000 free reads/month on Hobby)
    if (readToken) {
      const readUrl = `${readOrigin}/${encodeURIComponent(configId)}/item/${STORAGE_KEY}`;
      const resp = await fetch(readUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${readToken}` },
        cache: "no-store"
      });
      if (resp.status === 404) {
        return normalizeStateObject(null);
      }
      if (!resp.ok) {
        throw new Error(`Global Config read failed with status ${resp.status}`);
      }
      const text = await resp.text();
      if (!text || text === "null") return normalizeStateObject(null);
      return normalizeStateObject(JSON.parse(text));
    }

    return normalizeStateObject(null);
  }

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

async function writeToBackend(backend, nextState) {
  if (backend.name === "vercel-global-config") {
    const { configId, apiToken, teamId } = backend.config;
    if (!apiToken) {
      const err = new Error("VERCEL_API_TOKEN が設定されていないため、サーバーへ書き込めません。VercelのEnvironment Variablesに VERCEL_API_TOKEN を設定してください。");
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
      `https://api.vercel.com/v1/edge-config/${encodeURIComponent(configId)}/items${teamQuery}`,
      `https://api.vercel.com/v1/global-config/${encodeURIComponent(configId)}/items${teamQuery}`
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

  if (backend.name === "upstash-redis") {
    const { url, token } = backend.config;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["SET", STORAGE_KEY, JSON.stringify(nextState)])
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Upstash Redis SET failed (HTTP ${resp.status}): ${txt.slice(0, 180)}`);
    }
    recentWriteCache = { state: nextState, expiresAt: Date.now() + 20000 };
    return;
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

  const err = new Error("サーバー保存先（Vercel Global Config / Edge Config または Upstash Redis）の環境変数が未設定です。");
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
  // 1. Custom intent headers (prevents simple form CSRF and casual bots)
  const clientHeader = req.headers["x-calpis-client"];
  const intentHeader = req.headers["x-calpis-edit-intent"];
  if (clientHeader !== "archive-v1" || intentHeader !== "1") {
    return { ok: false, status: 403, message: "不正なリクエストヘッダーです。" };
  }

  // 2. Sec-Fetch-Site check if sent by modern browsers
  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site" && secFetchSite !== "none") {
    return { ok: false, status: 403, message: "クロスサイトからの書き込みリクエストは拒否されました。" };
  }

  // 3. Origin vs Host check
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
      const err = new Error("リクエストサイズが上限（32KB）を超えています。");
      err.status = 413;
      throw err;
    }
    return req.body;
  }

  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_BODY_BYTES) {
      const err = new Error("リクエストサイズが上限（32KB）を超えています。");
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
        const err = new Error("リクエストサイズが上限（32KB）を超えています。");
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

  const clientIp = getClientIp(req);
  const isWrite = req.method === "POST";
  const rateCheck = checkRateLimit(clientIp, isWrite);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSec || 60));
    return res.status(429).json({
      ok: false,
      error: "rate_limited",
      message: rateCheck.message
    });
  }

  const backend = detectStorageBackend(req);

  // ==================== GET /api/favorites ====================
  if (req.method === "GET") {
    try {
      const wantFresh = Boolean(req.query && req.query.fresh === "1");
      const current = await readFromBackend(backend, { strong: wantFresh });
      return res.status(200).json({
        ok: true,
        configured: backend.configured,
        storageBackend: backend.name,
        ids: current.ids,
        version: current.version,
        updatedAt: current.updatedAt
      });
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
    const resolvedAid = resolveIdentifierToAid(rawItem);
    if (!resolvedAid) {
      invalidEntries.push(rawItem.slice(0, 60));
      continue;
    }
    if (!seenAids.has(resolvedAid)) {
      seenAids.add(resolvedAid);
      normalizedAids.push(resolvedAid);
    }
  }

  // In normal save mode, strictly reject any unknown or non-existent artist IDs
  if (action !== "migrate" && invalidEntries.length > 0) {
    return res.status(400).json({
      ok: false,
      error: "unknown_artist_id",
      message: `存在しないアーティスト識別子が含まれているため保存を拒否しました（${invalidEntries.length}件）。`,
      invalidSamples: invalidEntries.slice(0, 5)
    });
  }

  normalizedAids.sort();

  if (!backend.configured) {
    return res.status(503).json({
      ok: false,
      error: "storage_unconfigured",
      storageBackend: backend.name,
      message: backend.readOnlyConfigured
        ? "Vercelの環境変数 VERCEL_API_TOKEN が未設定のため書き込みできません。設定手順に沿って VERCEL_API_TOKEN を追加してください。"
        : "Vercelの共有保存先（Global Config / Edge Config または Upstash Redis）が未設定です。設定手順に沿って環境変数を設定してください。"
    });
  }

  try {
    // 1. Strongly-consistent read of current server state
    const current = await readFromBackend(backend, { strong: true });
    const clientRequestId = typeof body.clientRequestId === "string" ? body.clientRequestId.trim().slice(0, 80) : "";

    // 2. Idempotency check: if this exact clientRequestId already succeeded, return 200 without re-writing
    if (clientRequestId && current.lastRequestId && clientRequestId === current.lastRequestId) {
      return res.status(200).json({
        ok: true,
        unchanged: true,
        idempotentReplay: true,
        configured: true,
        storageBackend: backend.name,
        ids: current.ids,
        version: current.version,
        updatedAt: current.updatedAt
      });
    }

    // 3. No-op check: if the submitted set is identical to what's already stored on the server, skip writing!
    if (current.version > 0 && areSortedArraysEqual(normalizedAids, current.ids)) {
      return res.status(200).json({
        ok: true,
        unchanged: true,
        configured: true,
        storageBackend: backend.name,
        ids: current.ids,
        version: current.version,
        updatedAt: current.updatedAt
      });
    }

    // 4. Initial migration safety check: prevent overwriting if server already has data
    if (action === "migrate" && current.version > 0 && body.forceOverwrite !== true) {
      return res.status(409).json({
        ok: false,
        error: "already_initialized",
        message: "すでにサーバー上に共有ハート設定が保存されています。他の端末のデータで上書きしないよう移行を停止しました。",
        serverData: {
          ids: current.ids,
          version: current.version,
          updatedAt: current.updatedAt
        }
      });
    }

    // 5. Optimistic concurrency check: if server version moved ahead of baseVersion, return 409 Conflict
    if (current.version > 0 && baseVersion !== current.version && body.forceOverwrite !== true) {
      return res.status(409).json({
        ok: false,
        error: "conflict",
        message: "編集中に他の端末で「かるのオススメ」が更新されました。最新データを確認してください。",
        serverData: {
          ids: current.ids,
          version: current.version,
          updatedAt: current.updatedAt
        }
      });
    }

    // 6. Perform single batch write
    const nextState = {
      ids: normalizedAids,
      version: (current.version || 0) + 1,
      updatedAt: new Date().toISOString(),
      lastRequestId: clientRequestId
    };

    await writeToBackend(backend, nextState);

    return res.status(200).json({
      ok: true,
      unchanged: false,
      configured: true,
      storageBackend: backend.name,
      ids: nextState.ids,
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
