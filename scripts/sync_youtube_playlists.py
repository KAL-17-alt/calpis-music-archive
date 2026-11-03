#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automatic YouTube Playlist -> Gemini API -> Archive Updater (v2.0 Safe Baseline & Review Edition)

Key Features:
1. Explicit One-Time Baseline Initialization (`--init` or `SYNC_MODE=init`):
   - Records all current playlist video IDs into `data/processed_videos.json` and marks `data/sync_state.json` as initialized.
   - Calls Gemini API 0 times and modifies 0 existing artists, songs, or pending items.
   - Blocks accidental re-initialization once initialized (unless `--force-reinit` is explicitly passed).
2. State Corruption & Uninitialized Safeguards:
   - Never treats existing playlist videos as new if `sync_state.json` is uninitialized or if `processed_videos.json` is missing, empty, or corrupted.
3. Gemini API v1beta Integration (`gemini-3.5-flash-lite` primary + ordered fallback):
   - Uses `x-goog-api-key` header and redacts secrets from all logs.
   - Distinguishes HTTP 404 (auto-fallback), 429 transient RPM vs daily quota exhaustion (safe stop), and 503/5xx (exponential backoff).
   - Supports `--verify-gemini` (`SYNC_MODE=verify_gemini`) to test `generateContent` with a minimal 1-request probe.
4. Numeric Confidence (0.0 - 1.0), Composer/Vocalist Grounding Guardrails, & Category Preservation:
   - Auto-registers only when `confidence >= 0.85`, matched to an existing artist, and grounded in video metadata without ambiguity.
   - Preserves existing artist `cat` (never flips `cat=2` to `cat=1` upon adding 1 cover song) and existing profile fields.
   - Atomic file writes prevent partial JSON corruption; failed videos are left unprocessed so they are retried next run.
"""
import argparse
import hashlib
import json
import os
import random
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_JSON_PATH = os.path.join(BASE_DIR, "data", "artists_master.json")
PROCESSED_JSON_PATH = os.path.join(BASE_DIR, "data", "processed_videos.json")
SYNC_STATE_JSON_PATH = os.path.join(BASE_DIR, "data", "sync_state.json")
MUGEN2_STATE_JSON_PATH = os.path.join(BASE_DIR, "data", "mugen2_state.json")
PENDING_JSON_PATH = os.path.join(BASE_DIR, "data", "pending_review.json")
PENDING_MD_PATH = os.path.join(BASE_DIR, "PENDING_REVIEW.md")
SYNC_LOG_JSON_PATH = os.path.join(BASE_DIR, "data", "auto_sync_log.json")
DATA_JS_PATH = os.path.join(BASE_DIR, "data.js")
STANDALONE_HTML_PATH = os.path.join(BASE_DIR, "calpis-music-archive.html")

DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"
FALLBACK_GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
]
AUTO_APPROVE_CONFIDENCE = 0.85
MIN_EXPECTED_ARTISTS = 1000


def redact_secrets(text: str, extra_secrets: list[str] | None = None) -> str:
    """Removes any API keys or secret tokens from log/error strings."""
    if not text:
        return ""
    out = str(text)
    for env_key in ("YOUTUBE_API_KEY", "GEMINI_API_KEY"):
        val = os.environ.get(env_key, "").strip()
        if val and len(val) >= 4:
            out = out.replace(val, "***REDACTED***")
    if extra_secrets:
        for s in extra_secrets:
            if s and len(s) >= 4:
                out = out.replace(s, "***REDACTED***")
    # Scrub Google API keys (AIza...) and query key parameters
    out = re.sub(r"AIza[0-9A-Za-z_\-]{20,}", "AIza***REDACTED***", out)
    out = re.sub(r"([?&]key=)[^&\s\"']+", r"\1***REDACTED***", out, flags=re.IGNORECASE)
    return out


def safe_print(msg: str, extra_secrets: list[str] | None = None) -> None:
    print(redact_secrets(msg, extra_secrets), flush=True)


def normalize_model_name(model_name: str) -> str:
    m = (model_name or "").strip()
    if m.startswith("models/"):
        m = m[len("models/"):]
    return m or DEFAULT_GEMINI_MODEL


def get_candidate_models(preferred_model: str | None = None) -> list[str]:
    pref = normalize_model_name(preferred_model or os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL))
    candidates = [pref]
    for m in FALLBACK_GEMINI_MODELS:
        nm = normalize_model_name(m)
        if nm and nm not in candidates:
            candidates.append(nm)
    return candidates


def parse_playlist_ids(raw: str) -> list[str]:
    if not raw:
        return []
    parts = re.split(r"[,\s]+", raw.strip())
    seen = []
    for p in parts:
        cl = p.strip()
        if cl and cl not in seen:
            seen.append(cl)
    return seen


def atomic_write_text(path: str, content: str) -> None:
    """Writes text atomically via a temporary file in the same directory."""
    parent = os.path.dirname(os.path.abspath(path))
    os.makedirs(parent, exist_ok=True)
    tmp_path = f"{path}.tmp.{os.getpid()}"
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


def atomic_write_json(path: str, data) -> None:
    """Serializes JSON, validates round-trip parsing, and writes atomically."""
    serialized = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    json.loads(serialized)
    atomic_write_text(path, serialized)


def load_json_strict(path: str):
    """Loads JSON from path, raising ValueError on missing or malformed content."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read().strip()
    if not raw:
        raise ValueError(f"File is empty: {path}")
    return json.loads(raw)


def load_sync_state(path: str) -> tuple[dict, bool]:
    """
    Returns (state_dict, is_corrupted).
    If the file does not exist, returns default uninitialized state with is_corrupted=False.
    If the file exists but cannot be parsed as a dict, returns is_corrupted=True.
    """
    default_state = {
        "schemaVersion": 2,
        "initialized": False,
        "initializedAt": None,
        "baselineVideoCount": 0,
        "playlistIds": [],
        "lastSyncAt": None,
    }
    if not os.path.exists(path):
        return default_state, False
    try:
        data = load_json_strict(path)
        if not isinstance(data, dict):
            return default_state, True
        merged = dict(default_state)
        merged.update(data)
        return merged, False
    except Exception as e:
        safe_print(f"[ERROR] Failed to read sync_state.json: {e}")
        return default_state, True


def load_processed_videos(path: str) -> tuple[list[str], bool]:
    """
    Returns (video_id_list, is_corrupted_or_missing).
    """
    if not os.path.exists(path):
        return [], True
    try:
        data = load_json_strict(path)
        if not isinstance(data, list):
            return [], True
        cleaned = [str(x).strip() for x in data if isinstance(x, str) and str(x).strip()]
        return cleaned, False
    except Exception as e:
        safe_print(f"[ERROR] Failed to read processed_videos.json: {e}")
        return [], True


def http_get_json(url: str, headers: dict | None = None, timeout: int = 30) -> dict:
    req_headers = {"User-Agent": "CalpisMusicArchiveSync/2.0"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_json(url: str, payload: dict, headers: dict | None = None, timeout: int = 60) -> dict:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req_headers = {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "CalpisMusicArchiveSync/2.0",
    }
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=body, headers=req_headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_http_error_detail(err: urllib.error.HTTPError, extra_secrets: list[str] | None = None) -> tuple[int, str, str]:
    """Returns (http_code, status_str, sanitized_error_message)."""
    code = getattr(err, "code", 0) or 0
    raw_body = ""
    try:
        raw_body = err.read().decode("utf-8", errors="replace")
    except Exception:
        raw_body = str(err)
    status_str = ""
    msg_str = raw_body[:500]
    try:
        parsed = json.loads(raw_body)
        if isinstance(parsed, dict) and isinstance(parsed.get("error"), dict):
            err_obj = parsed["error"]
            status_str = str(err_obj.get("status") or "")
            msg_str = str(err_obj.get("message") or msg_str)
            details = err_obj.get("details")
            if details:
                msg_str += f" | details={json.dumps(details, ensure_ascii=False)[:300]}"
    except Exception:
        pass
    return code, redact_secrets(status_str, extra_secrets), redact_secrets(msg_str, extra_secrets)


def is_daily_quota_exhausted(err_msg: str) -> bool:
    low = (err_msg or "").lower()
    keywords = [
        "perday",
        "per_day",
        "requests per day",
        "daily",
        "free_tier",
        "freetier",
        "limit: 0",
        "quota exceeded for metric",
        "billing",
    ]
    if "perminute" in low or "per_minute" in low or "requests per minute" in low:
        if "perday" not in low and "limit: 0" not in low:
            return False
    return any(k in low for k in keywords)


class GeminiFatalError(Exception):
    """Raised when Gemini API cannot proceed (e.g. daily quota exhausted or all models failed)."""
    pass


def call_gemini_generate_content(
    payload: dict,
    api_key: str,
    candidate_models: list[str],
    working_model_cache: dict,
    max_retries_per_model: int = 3,
    backoff_base: float = 2.0,
) -> tuple[dict, str]:
    """
    Calls Gemini `v1beta/models/{model}:generateContent` using `x-goog-api-key` header.
    - If a working model is already cached in `working_model_cache["model"]`, tries it first.
    - On HTTP 404 (or model not supported for generateContent), immediately falls back to the next candidate model.
    - On HTTP 429 (transient RPM/TPM) or HTTP 500/502/503/504, retries with exponential backoff.
    - On HTTP 429 daily free-tier quota exhaustion, stops retrying that model immediately and raises GeminiFatalError if no fallback is desired/available.
    Returns (response_dict, model_used).
    """
    if not api_key:
        raise GeminiFatalError("GEMINI_API_KEY is empty.")

    models_to_try = list(candidate_models)
    cached = working_model_cache.get("model")
    if cached and cached in models_to_try:
        models_to_try.remove(cached)
        models_to_try.insert(0, cached)

    headers = {"x-goog-api-key": api_key}
    last_error_summary = "No models attempted"

    for model_name in models_to_try:
        norm_model = normalize_model_name(model_name)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{norm_model}:generateContent"

        for attempt in range(max_retries_per_model):
            try:
                resp = http_post_json(url, payload, headers=headers, timeout=60)
                working_model_cache["model"] = norm_model
                return resp, norm_model
            except urllib.error.HTTPError as he:
                code, status_str, safe_msg = extract_http_error_detail(he, [api_key])
                last_error_summary = f"HTTP {code} ({status_str}) on model '{norm_model}': {safe_msg}"

                if code == 404 or (code == 400 and "not found" in safe_msg.lower()) or (code == 400 and "not supported" in safe_msg.lower()):
                    safe_print(
                        f"[GEMINI 404] Model '{norm_model}' is unavailable or not supported for generateContent "
                        f"(HTTP {code} {status_str}: {safe_msg}). Trying next candidate model..."
                    )
                    break  # Move immediately to next fallback model

                if code in (401, 403):
                    safe_print(f"[GEMINI AUTH ERROR] HTTP {code} ({status_str}) on '{norm_model}': {safe_msg}")
                    raise GeminiFatalError(last_error_summary)

                if code == 429:
                    if is_daily_quota_exhausted(safe_msg):
                        safe_print(
                            f"[GEMINI QUOTA] Daily free-tier quota or limit=0 reached on model '{norm_model}' "
                            f"(HTTP 429 {status_str}: {safe_msg}). Stopping safely without excessive retries."
                        )
                        raise GeminiFatalError(last_error_summary)
                    if attempt + 1 < max_retries_per_model:
                        wait_sec = backoff_base * (2 ** attempt) + random.uniform(0.1, 0.5)
                        safe_print(
                            f"[GEMINI 429] Transient rate limit on '{norm_model}' (attempt {attempt + 1}/{max_retries_per_model}). "
                            f"Retrying in {wait_sec:.1f}s... Detail: {safe_msg}"
                        )
                        time.sleep(wait_sec)
                        continue
                    else:
                        safe_print(f"[GEMINI 429] Rate limit retries exhausted on '{norm_model}'. Stopping safely.")
                        raise GeminiFatalError(last_error_summary)

                if code in (500, 502, 503, 504):
                    if attempt + 1 < max_retries_per_model:
                        wait_sec = backoff_base * (2 ** attempt) + random.uniform(0.1, 0.5)
                        safe_print(
                            f"[GEMINI {code}] Transient server error on '{norm_model}' (attempt {attempt + 1}/{max_retries_per_model}). "
                            f"Retrying in {wait_sec:.1f}s... Detail: {safe_msg}"
                        )
                        time.sleep(wait_sec)
                        continue
                    else:
                        safe_print(f"[GEMINI {code}] Server error retries exhausted on '{norm_model}'.")
                        raise GeminiFatalError(last_error_summary)

                # Other HTTP errors (e.g. 400 Bad Request)
                safe_print(f"[GEMINI ERROR] HTTP {code} ({status_str}) on '{norm_model}': {safe_msg}")
                raise GeminiFatalError(last_error_summary)

            except urllib.error.URLError as ue:
                safe_msg = redact_secrets(str(ue), [api_key])
                last_error_summary = f"Network/URL error on '{norm_model}': {safe_msg}"
                if attempt + 1 < max_retries_per_model:
                    wait_sec = backoff_base * (2 ** attempt)
                    safe_print(f"[GEMINI NET] {last_error_summary}. Retrying in {wait_sec:.1f}s...")
                    time.sleep(wait_sec)
                    continue
                raise GeminiFatalError(last_error_summary)

    raise GeminiFatalError(f"All candidate Gemini models failed. Last error: {last_error_summary}")


def verify_gemini_connection(api_key: str, preferred_model: str | None = None) -> tuple[bool, str]:
    """
    Sends a minimal 1-request `generateContent` call to verify that the API key and model
    actually work for inference (since `models.list` alone can return 200 for restricted 2.5 models).
    """
    candidates = get_candidate_models(preferred_model)
    safe_print(f"[VERIFY GEMINI] Testing generateContent inference. Candidate models: {candidates}")
    payload = {
        "contents": [{"parts": [{"text": 'Return JSON: {"ok": True}'}]}],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 32,
            "responseMimeType": "application/json",
        },
    }
    cache = {}
    try:
        resp, used_model = call_gemini_generate_content(
            payload=payload,
            api_key=api_key,
            candidate_models=candidates,
            working_model_cache=cache,
            max_retries_per_model=2,
            backoff_base=1.5,
        )
        text = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
        safe_print(f"[VERIFY GEMINI] SUCCESS! Active model: '{used_model}' | Sample response: {text[:80]}")
        return True, used_model
    except Exception as e:
        safe_print(f"[VERIFY GEMINI] FAILED: {e}", [api_key])
        return False, ""


def fetch_playlist_video_ids(playlist_id: str, api_key: str) -> list[str]:
    video_ids = []
    seen = set()
    page_token = ""
    while True:
        params = {
            "part": "contentDetails",
            "playlistId": playlist_id,
            "maxResults": "50",
            "key": api_key,
        }
        if page_token:
            params["pageToken"] = page_token
        url = "https://www.googleapis.com/youtube/v3/playlistItems?" + urllib.parse.urlencode(params)
        try:
            data = http_get_json(url)
        except urllib.error.HTTPError as he:
            code, status_str, safe_msg = extract_http_error_detail(he, [api_key])
            raise RuntimeError(f"YouTube playlistItems API HTTP {code} ({status_str}) for playlist '{playlist_id}': {safe_msg}")
        for item in data.get("items", []):
            vid = ((item.get("contentDetails") or {}).get("videoId") or "").strip()
            if vid and vid not in seen:
                seen.add(vid)
                video_ids.append(vid)
        page_token = data.get("nextPageToken", "")
        if not page_token:
            break
    return video_ids


def fetch_videos_metadata(video_ids: list[str], api_key: str) -> list[dict]:
    results = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i : i + 50]
        params = {
            "part": "snippet",
            "id": ",".join(chunk),
            "key": api_key,
        }
        url = "https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(params)
        try:
            data = http_get_json(url)
        except urllib.error.HTTPError as he:
            code, status_str, safe_msg = extract_http_error_detail(he, [api_key])
            raise RuntimeError(f"YouTube videos API HTTP {code} ({status_str}): {safe_msg}")
        for item in data.get("items", []):
            sn = item.get("snippet") or {}
            results.append({
                "videoId": item.get("id"),
                "title": sn.get("title", ""),
                "description": (sn.get("description") or "")[:600],
                "channelId": sn.get("channelId", ""),
                "channelTitle": sn.get("channelTitle", ""),
                "thumbnail": ((sn.get("thumbnails") or {}).get("high") or (sn.get("thumbnails") or {}).get("default") or {}).get("url", ""),
            })
    return results


def fetch_channel_info(channel_id: str, api_key: str) -> dict:
    if not channel_id or not api_key:
        return {}
    params = {
        "part": "snippet,statistics",
        "id": channel_id,
        "key": api_key,
    }
    url = "https://www.googleapis.com/youtube/v3/channels?" + urllib.parse.urlencode(params)
    try:
        data = http_get_json(url)
        items = data.get("items") or []
        if not items:
            return {}
        ch = items[0]
        sn = ch.get("snippet") or {}
        st = ch.get("statistics") or {}
        avatar = ((sn.get("thumbnails") or {}).get("high") or (sn.get("thumbnails") or {}).get("default") or {}).get("url", "")
        sub_count = int(st["subscriberCount"]) if st.get("subscriberCount") is not None and not st.get("hiddenSubscriberCount") else None
        return {
            "channelId": channel_id,
            "channelTitle": sn.get("title", ""),
            "avatar": avatar,
            "sub": sub_count,
        }
    except Exception:
        return {}


def kana_to_row(kana_char: str) -> str:
    if not kana_char:
        return ""
    c = kana_char[0]
    rows = [
        ("あ", "あいうえおぁぃぅぇぉヴ"),
        ("か", "かきくけこがぎぐげご"),
        ("さ", "さしすせそざじずぜぞ"),
        ("た", "たちつてとだぢづでどっ"),
        ("な", "なにぬねの"),
        ("は", "はひふへほばびぶべぼぱぴぷぺぽ"),
        ("ま", "まみむめも"),
        ("や", "やゆよゃゅょ"),
        ("ら", "らりるれろ"),
        ("わ", "わをんゎ"),
    ]
    for r, chars in rows:
        if c in chars:
            return r
    return ""


def sub_to_bucket(sub: int | None) -> str:
    if sub is None:
        return "unknown"
    if sub < 1000:
        return "under1k"
    if sub < 10000:
        return "1kTo10k"
    if sub < 100000:
        return "10kTo100k"
    if sub < 1000000:
        return "100kTo1M"
    return "over1M"


def normalize_text_key(s: str) -> str:
    """Normalizes song or artist names for duplicate/matching checks."""
    if not s:
        return ""
    norm = unicodedata.normalize("NFKC", str(s)).lower().strip()
    norm = re.sub(r"\s+", " ", norm)
    return norm


def parse_confidence(val) -> float:
    """
    Converts confidence value to float in [0.0, 1.0].
    Maintains backward compatibility with legacy string values ("high", "medium", "low").
    """
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return max(0.0, min(1.0, float(val)))
    s = str(val).strip().lower()
    if s == "high":
        return 0.90
    if s in ("medium", "mid"):
        return 0.65
    if s == "low":
        return 0.30
    try:
        return max(0.0, min(1.0, float(s)))
    except ValueError:
        return 0.0


def get_visible_songs_for_artist(artist: dict) -> list[str]:
    raw_songs = artist.get("songs") if isinstance(artist.get("songs"), list) else []
    hidden_list = artist.get("mugen2HiddenSongs") if isinstance(artist.get("mugen2HiddenSongs"), list) else []
    if not hidden_list:
        return list(raw_songs)
    hidden_norm = {normalize_text_key(h) for h in hidden_list if h}
    return [s for s in raw_songs if normalize_text_key(s) not in hidden_norm]


def unhide_song_on_artist(target_artist: dict, song_title: str) -> bool:
    hidden_list = target_artist.get("mugen2HiddenSongs")
    if not isinstance(hidden_list, list) or not hidden_list:
        return False
    target_norm = normalize_text_key(song_title)
    new_hidden = [h for h in hidden_list if normalize_text_key(h) != target_norm]
    if len(new_hidden) != len(hidden_list):
        if new_hidden:
            target_artist["mugen2HiddenSongs"] = new_hidden
        else:
            target_artist.pop("mugen2HiddenSongs", None)
        target_artist["count"] = len(get_visible_songs_for_artist(target_artist))
        return True
    return False


def hide_song_on_artist(target_artist: dict, song_title: str) -> bool:
    raw_songs = target_artist.get("songs") if isinstance(target_artist.get("songs"), list) else []
    target_norm = normalize_text_key(song_title)
    canonical_title = None
    for s in raw_songs:
        if normalize_text_key(s) == target_norm:
            canonical_title = s
            break
    if not canonical_title:
        return False
    hidden_list = target_artist.setdefault("mugen2HiddenSongs", [])
    hidden_norm = {normalize_text_key(h) for h in hidden_list if h}
    if target_norm in hidden_norm:
        return False
    hidden_list.append(canonical_title)
    target_artist["count"] = len(get_visible_songs_for_artist(target_artist))
    return True


def find_canonical_song_in_artist(target_artist: dict, song_title: str) -> str | None:
    raw_songs = target_artist.get("songs") if isinstance(target_artist.get("songs"), list) else []
    target_norm = normalize_text_key(song_title)
    for s in raw_songs:
        if normalize_text_key(s) == target_norm:
            return s
    return None


def add_song_to_existing_artist(target_artist: dict, song_title: str, song_type: str, vid: str) -> bool:
    """
    Adds a song to an existing artist WITHOUT overwriting `cat`, `role`, `profileBio`, or other existing attributes.
    If the song was previously hidden by Mugen2 deletion, un-hides it automatically.
    Returns True if the song was newly added or un-hidden, False if it was already visible.
    """
    song_title_clean = (song_title or "").strip()
    if not song_title_clean:
        return False

    if not isinstance(target_artist.get("songs"), list):
        target_artist["songs"] = []
    existing_songs = target_artist["songs"]
    existing_songs_norm = {normalize_text_key(s) for s in existing_songs}
    if normalize_text_key(song_title_clean) in existing_songs_norm:
        was_unhidden = unhide_song_on_artist(target_artist, song_title_clean)
        return was_unhidden

    target_artist["songs"].append(song_title_clean)
    target_artist["count"] = len(get_visible_songs_for_artist(target_artist))

    # IMPORTANT: Never change existing artist's `cat` or `role` just because a single cover song was added.
    # (`cat == 1` requires confirmed >=3 cover songs on the artist's channel; existing classifications are preserved.)

    top_songs = target_artist.setdefault("topSongs", [])
    top_links = target_artist.setdefault("topLinks", [])
    top_types = target_artist.setdefault("topTypes", [])
    if len(top_songs) < 5 and normalize_text_key(song_title_clean) not in {normalize_text_key(x) for x in top_songs}:
        top_songs.append(song_title_clean)
        top_links.append(vid or "")
        top_types.append("cover" if song_type == "cover" else "orig")

    return True



# =========================================================================
# V67: ADVANCED MASTER ARTIST MATCHING, COLLAB SPLITTING & GROUNDING ENGINE
# =========================================================================
CONFIRMED_V67_PENDING_RESOLUTIONS = [
    {
        "videoId": "AUyhNumi-6U",
        "songTitle": "徒、花吹雪",
        "songType": "orig",
        "targets": [{"aid": "a_d1be502e", "name": "るる"}],
    },
    {
        "videoId": "Vwma-WCXOWk",
        "songTitle": "ALL IN",
        "songType": "cover",
        "targets": [
            {"aid": "a_c35ccf35", "name": "羊羊"},
            {"aid": "a_833fb012", "name": "あかつきるき"},
        ],
    },
    {
        "videoId": "dk2sChUDVSI",
        "songTitle": "ワタシイロ",
        "songType": "orig",
        "targets": [{"aid": "a_85cc0d70", "name": "伊藤美来"}],
    },
    {
        "videoId": "pJtFWEIpWac",
        "songTitle": "あなたみたいに",
        "songType": "orig",
        "targets": [{"aid": "a_35851722", "name": "NELKE"}],
    },
    {
        "videoId": "YwyA-5yfRbs",
        "songTitle": "III",
        "songType": "cover",
        "targets": [
            {"aid": "a_b5ac7fba", "name": "明透"},
            {"aid": "a_55aed341", "name": "琶舞"},
        ],
    },
]



_HIRA_TO_ROMA = {
    "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
    "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
    "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
    "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
    "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
    "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
    "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
    "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
    "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
    "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
    "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
    "ふぁ": "fa", "ふぃ": "fi", "ふぇ": "fe", "ふぉ": "fo",
    "てぃ": "ti", "でぃ": "di", "うぃ": "wi", "うぇ": "we", "うぉ": "wo",
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "o", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o",
    "ゃ": "ya", "ゅ": "yu", "ょ": "yo",
}

def _hira_to_romaji_variants(hira_str: str) -> set[str]:
    s = unicodedata.normalize("NFKC", str(hira_str or "")).strip()
    if not s or not re.match(r"^[ぁ-んー\s]+$", s):
        return set()
    res = ""
    i = 0
    n = len(s)
    while i < n:
        if s[i] == "っ":
            nxt = ""
            if i + 2 < n and s[i+1:i+3] in _HIRA_TO_ROMA:
                nxt = _HIRA_TO_ROMA[s[i+1:i+3]]
            elif i + 1 < n and s[i+1] in _HIRA_TO_ROMA:
                nxt = _HIRA_TO_ROMA[s[i+1]]
            if nxt:
                res += nxt[0]
            i += 1
            continue
        if s[i] == "ー":
            i += 1
            continue
        if i + 1 < n and s[i:i+2] in _HIRA_TO_ROMA:
            res += _HIRA_TO_ROMA[s[i:i+2]]
            i += 2
            continue
        if s[i] in _HIRA_TO_ROMA:
            res += _HIRA_TO_ROMA[s[i]]
            i += 1
            continue
        res += s[i]
        i += 1
    out = {res}
    # Long vowel contractions common in English Topic channels (e.g. itou -> ito, yuuki -> yuki, oohashi -> ohashi)
    for v in list(out):
        out.add(v.replace("ou", "o").replace("uu", "u").replace("oo", "o"))
    # Also generate Given-Family reversed order for 4..8 mora readings when split at common surname boundaries
    # or check if hira_str has 2 parts
    for m_len in range(2, len(s) - 1):
        p1 = s[:m_len]
        p2 = s[m_len:]
        if p1.startswith("っ") or p2.startswith("っ") or p1.startswith("ん") or p2.startswith("ん"):
            continue
        r1_set = set()
        r2_set = set()
        # simple conversion of p1, p2
        for idx_p, part in ((1, p1), (2, p2)):
            acc = ""
            j = 0
            while j < len(part):
                if j + 1 < len(part) and part[j:j+2] in _HIRA_TO_ROMA:
                    acc += _HIRA_TO_ROMA[part[j:j+2]]
                    j += 2
                elif part[j] in _HIRA_TO_ROMA:
                    acc += _HIRA_TO_ROMA[part[j]]
                    j += 1
                else:
                    acc += part[j]
                    j += 1
            variants_p = {acc, acc.replace("ou", "o").replace("uu", "u").replace("oo", "o")}
            if idx_p == 1:
                r1_set = variants_p
            else:
                r2_set = variants_p
        for a1 in r1_set:
            for a2 in r2_set:
                out.add(a2 + a1)
    return {x for x in out if len(x) >= 3}

def normalize_artist_lookup_key(s: str) -> str:
    """Normalizes an artist name/alias for case-, width-, and whitespace/delimiter-insensitive matching."""
    if not s:
        return ""
    norm = unicodedata.normalize("NFKC", str(s)).lower().strip()
    # Strip trailing "- topic" from YouTube auto-generated Topic channel names
    norm = re.sub(r"\s*-\s*topic\s*$", "", norm, flags=re.IGNORECASE)
    norm = re.sub(r"[\s\u3000\-_・.／/()（）【】「」『』]+", "", norm)
    return norm


def is_short_or_ambiguous_name(norm_key: str) -> bool:
    """Returns True if the normalized key is very short (e.g. <=2 kana/ascii chars like 'るる', 'れい', 'm') and requires channel/context grounding."""
    if not norm_key:
        return True
    if len(norm_key) <= 1:
        return True
    if len(norm_key) == 2 and re.match(r"^[ぁ-んァ-ヶーa-z0-9]{2}$", norm_key):
        return True
    return False


def extract_channel_identifiers(url_or_str: str) -> tuple[set[str], set[str]]:
    """Extracts YouTube channel IDs (UC...) and @handles from a URL or alias string."""
    cids = set()
    handles = set()
    s = str(url_or_str or "").strip()
    if not s:
        return cids, handles
    for m in re.finditer(r"\b(UC[0-9A-Za-z_\-]{20,24})\b", s):
        cids.add(m.group(1))
    for m in re.finditer(r"@([0-9A-Za-z_.\-]{2,60})", s):
        handles.add(m.group(1).lower())
    return cids, handles


class MasterArtistMatcher:
    """
    Indexes all existing artists in `artists_master.json` by:
    - Stable `aid`
    - Exact `name` & parenthetical parts (e.g. `わん子 (綰子 /Wanko)` -> `わん子`, `綰子 /Wanko`, `綰子`, `Wanko`)
    - Confirmed aliases (`al`)
    - Readings (`reading`)
    - YouTube channel IDs (`UC...`) and `@handles`
    Handles homonym detection so multiple artists sharing an alias or reading are never blindly guessed.
    """

    def __init__(self, artists: list[dict]):
        self.artists = artists
        self.by_aid: dict[str, dict] = {}
        self.by_exact_name: dict[str, dict] = {}
        self.by_norm_name: dict[str, list[dict]] = {}
        self.by_norm_alias: dict[str, list[dict]] = {}
        self.by_norm_reading: dict[str, list[dict]] = {}
        self.by_channel_id: dict[str, list[dict]] = {}
        self.by_handle: dict[str, list[dict]] = {}

        for a in artists:
            if not isinstance(a, dict) or not a.get("name"):
                continue
            aid = ensure_artist_stable_aid(a)
            self.by_aid[aid] = a
            name = a["name"].strip()
            self.by_exact_name[name] = a

            # Index full name and base/parenthetical parts
            name_variants = {name}
            m_paren = re.match(r"^([^\(（]+?)\s*[\(（]([^\)）]+)[\)）]$", name)
            if m_paren:
                base_p = m_paren.group(1).strip()
                inner_p = m_paren.group(2).strip()
                if base_p:
                    name_variants.add(base_p)
                if inner_p and not any(k in inner_p for k in ("シリーズ", "スタジオ", "オンライン", "プリティー", "ステージ", "レヴュー")):
                    for sub_p in re.split(r"[/／]", inner_p):
                        if sub_p.strip():
                            name_variants.add(sub_p.strip())

            for nv in name_variants:
                for k_fn in (normalize_text_key, normalize_artist_lookup_key):
                    nk = k_fn(nv)
                    if nk:
                        lst = self.by_norm_name.setdefault(nk, [])
                        if a not in lst:
                            lst.append(a)

            # Index aliases
            for al in a.get("al") or []:
                if not al or not isinstance(al, str):
                    continue
                cids, hnds = extract_channel_identifiers(al)
                for cid in cids:
                    lst = self.by_channel_id.setdefault(cid, [])
                    if a not in lst:
                        lst.append(a)
                for h in hnds:
                    lst = self.by_handle.setdefault(h, [])
                    if a not in lst:
                        lst.append(a)
                for k_fn in (normalize_text_key, normalize_artist_lookup_key):
                    ak = k_fn(al)
                    if ak:
                        lst = self.by_norm_alias.setdefault(ak, [])
                        if a not in lst:
                            lst.append(a)

            # Index reading
            rd = (a.get("reading") or "").strip()
            if rd:
                rk = normalize_artist_lookup_key(rd)
                if rk:
                    lst = self.by_norm_reading.setdefault(rk, [])
                    if a not in lst:
                        lst.append(a)

            # Index ytChannelUrl
            cids, hnds = extract_channel_identifiers(a.get("ytChannelUrl") or "")
            for cid in cids:
                lst = self.by_channel_id.setdefault(cid, [])
                if a not in lst:
                    lst.append(a)
            for h in hnds:
                lst = self.by_handle.setdefault(h, [])
                if a not in lst:
                    lst.append(a)

    def get_all_known_tokens_for_artist(self, artist: dict) -> set[str]:
        tokens = set()
        name = (artist.get("name") or "").strip()
        if name:
            tokens.add(normalize_text_key(name))
            tokens.add(normalize_artist_lookup_key(name))
            m_paren = re.match(r"^([^\(（]+?)\s*[\(（]([^\)）]+)[\)）]$", name)
            if m_paren:
                tokens.add(normalize_text_key(m_paren.group(1)))
                tokens.add(normalize_artist_lookup_key(m_paren.group(1)))
        for al in artist.get("al") or []:
            if al and isinstance(al, str) and not al.startswith("UC"):
                tokens.add(normalize_text_key(al))
                tokens.add(normalize_artist_lookup_key(al))
        # Include reading & romaji variants (including reversed Given-Family order like "Miku Ito" for "いとうみく")
        rd = (artist.get("reading") or "").strip()
        if rd:
            tokens.add(normalize_artist_lookup_key(rd))
            for rv in _hira_to_romaji_variants(rd):
                tokens.add(rv)
        # Also include handle name if present in ytChannelUrl (e.g. @itomiku-official -> itomiku, @NELKE_RIRIKO_Official -> nelke, ririko)
        _, hnds = extract_channel_identifiers(artist.get("ytChannelUrl") or "")
        for h in hnds:
            tokens.add(h)
            tokens.add(re.sub(r"[_.\-]+", "", h))
            for part in re.split(r"[_.\-]+", h):
                if len(part) >= 3 and part not in ("official", "channel", "music", "ch", "youtube"):
                    tokens.add(part)
        return {t for t in tokens if t}

    def is_artist_grounded_in_video(self, artist: dict, vmeta: dict) -> tuple[bool, str]:
        """
        Verifies whether `artist` has concrete grounding in `vmeta` (channelId match, Topic channel match,
        channelTitle match, or explicit name/alias in video title or description).
        Protects against short-name homonym false positives (e.g. 2-char name 'るる' matching unrelated words).
        """
        raw_title = vmeta.get("title") or ""
        raw_channel = vmeta.get("channelTitle") or ""
        raw_desc = vmeta.get("description") or ""
        channel_id = (vmeta.get("channelId") or "").strip()

        # 1. Direct YouTube Channel ID match
        if channel_id and channel_id in self.by_channel_id:
            if artist in self.by_channel_id[channel_id]:
                return True, "channel_id_exact"

        # 2. YouTube Channel Title match (including "<Name> - Topic" or official channel title)
        clean_ch = re.sub(r"\s*-\s*Topic\s*$", "", raw_channel, flags=re.IGNORECASE).strip()
        clean_ch_norm = normalize_artist_lookup_key(clean_ch)
        known_tokens = self.get_all_known_tokens_for_artist(artist)

        if clean_ch_norm and clean_ch_norm in known_tokens:
            return True, "channel_title_exact"
        # Check if channel title starts with or contains artist name (for >=2 char non-ambiguous names or with Official/Ch suffix)
        for kt in known_tokens:
            if len(kt) >= 2 and clean_ch_norm:
                if clean_ch_norm == kt or re.sub(r"(?:official|channel|ch|music|公式|チャンネル)+$", "", clean_ch_norm) == kt:
                    return True, "channel_title_official"
                if len(kt) >= 3 and kt in clean_ch_norm:
                    return True, "channel_title_contains"

        # 3. Video Title & Description match (with boundary protection for short 2-char names)
        norm_title = normalize_text_key(raw_title)
        norm_desc = normalize_text_key(raw_desc)
        nospace_title = normalize_artist_lookup_key(raw_title)

        for kt in known_tokens:
            if not kt:
                continue
            if is_short_or_ambiguous_name(kt):
                # For short names like "るる", require explicit delimiter boundaries in title/channel/desc
                # e.g. "徒、花吹雪 / るる", "【るる】", "歌：るる", "Vocal: るる", "るる - "
                pat = rf"(?:^|[\s/／・×✕✖&＆、,「」『』【】\(\)（）\[\]：:—\-]){re.escape(kt)}(?:$|[\s/／・×✕✖&＆、,「」『』【】\(\)（）\[\]：:—\-])"
                if re.search(pat, norm_title) or re.search(pat, normalize_text_key(raw_channel)) or re.search(pat, norm_desc):
                    return True, "delimited_short_name_in_meta"
            else:
                if kt in norm_title or kt in nospace_title:
                    return True, "name_in_video_title"
                if kt in norm_desc:
                    return True, "name_in_video_description"

        return False, ""

    def match_single_artist_query(self, raw_query: str, vmeta: dict | None = None) -> tuple[dict | None, str]:
        """
        Attempts to match a single artist name/alias query against master data.
        Returns (matched_artist_or_None, ambiguity_or_match_note).
        """
        q = (raw_query or "").strip()
        if not q:
            return None, "アーティスト名が空です"

        # Direct aid lookup
        if q in self.by_aid:
            return self.by_aid[q], "matched_by_aid"

        # 1. Exact name match
        if q in self.by_exact_name:
            cand = self.by_exact_name[q]
            if vmeta is not None:
                grounded, g_src = self.is_artist_grounded_in_video(cand, vmeta)
                if not grounded and is_short_or_ambiguous_name(normalize_artist_lookup_key(q)):
                    return None, f"同名異人防止：「{q}」は短い一般的な名前のためチャンネルIDまたは明示的な名義表記による根拠が必要です"
            return cand, "matched_by_exact_name"

        # 2. Normalized name or alias match
        candidates = []
        for k_fn in (normalize_text_key, normalize_artist_lookup_key):
            nk = k_fn(q)
            if not nk:
                continue
            for a in self.by_norm_name.get(nk, []):
                if a not in candidates:
                    candidates.append(a)
            for a in self.by_norm_alias.get(nk, []):
                if a not in candidates:
                    candidates.append(a)

        # 3. If no name/alias match, check channel ID from vmeta if query matches channel title
        if not candidates and vmeta is not None:
            cid = (vmeta.get("channelId") or "").strip()
            if cid and cid in self.by_channel_id and len(self.by_channel_id[cid]) == 1:
                ch_artist = self.by_channel_id[cid][0]
                clean_ch = re.sub(r"\s*-\s*Topic\s*$", "", vmeta.get("channelTitle") or "", flags=re.IGNORECASE).strip()
                if normalize_artist_lookup_key(q) == normalize_artist_lookup_key(clean_ch):
                    return ch_artist, "matched_by_channel_id"

        if not candidates:
            return None, ""

        if len(candidates) == 1:
            cand = candidates[0]
            if vmeta is not None:
                grounded, _ = self.is_artist_grounded_in_video(cand, vmeta)
                if not grounded and is_short_or_ambiguous_name(normalize_artist_lookup_key(q)):
                    return None, f"同名異人防止：「{q}」は同名異人の可能性があるため動画メタデータ上の根拠が必要です"
            return cand, "matched_by_normalized_name_or_alias"

        # Multiple candidates (homonyms): disambiguate using vmeta grounding
        if vmeta is not None:
            grounded_cands = []
            for c in candidates:
                ok, g_src = self.is_artist_grounded_in_video(c, vmeta)
                if ok:
                    score = 3 if g_src == "channel_id_exact" else (2 if "channel" in g_src else 1)
                    grounded_cands.append((score, c))
            grounded_cands.sort(key=lambda x: -x[0])
            if len(grounded_cands) == 1:
                return grounded_cands[0][1], "disambiguated_by_video_grounding"
            if len(grounded_cands) >= 2 and grounded_cands[0][0] > grounded_cands[1][0]:
                return grounded_cands[0][1], "disambiguated_by_channel_priority"

        cand_names = "、".join(c["name"] for c in candidates[:5])
        return None, f"複数の既存名義候補（{cand_names}）があり特定できないため要確認"

    def find_candidate_hints_for_video(self, vmeta: dict) -> list[dict]:
        """
        Lightweight Python pre-matcher that finds existing master artist candidates appearing in a video's
        channelId, channelTitle, title, or description so Gemini can be given exact master artist names.
        """
        hints = []
        seen_aids = set()
        cid = (vmeta.get("channelId") or "").strip()
        if cid and cid in self.by_channel_id:
            for a in self.by_channel_id[cid]:
                if a["aid"] not in seen_aids:
                    seen_aids.add(a["aid"])
                    hints.append({
                        "name": a["name"],
                        "aid": a["aid"],
                        "role": a.get("role", ""),
                        "matchSource": "channelId",
                    })

        raw_ch = vmeta.get("channelTitle") or ""
        clean_ch = re.sub(r"\s*-\s*Topic\s*$", "", raw_ch, flags=re.IGNORECASE).strip()
        if clean_ch:
            ch_match, _ = self.match_single_artist_query(clean_ch, vmeta)
            if ch_match and ch_match["aid"] not in seen_aids:
                seen_aids.add(ch_match["aid"])
                hints.append({
                    "name": ch_match["name"],
                    "aid": ch_match["aid"],
                    "role": ch_match.get("role", ""),
                    "matchSource": "channelTitle",
                })

        # Also scan title & description for existing artist names
        for a in self.artists:
            if len(hints) >= 8:
                break
            if a["aid"] in seen_aids:
                continue
            ok, src = self.is_artist_grounded_in_video(a, vmeta)
            if ok and src in ("channel_id_exact", "channel_title_exact", "channel_title_official", "name_in_video_title", "delimited_short_name_in_meta"):
                seen_aids.add(a["aid"])
                hints.append({
                    "name": a["name"],
                    "aid": a["aid"],
                    "role": a.get("role", ""),
                    "matchSource": src,
                })
        return hints


COLLAB_SPLIT_REGEX = re.compile(
    r"\s*(?:×|✕|✖|＆|&|、|,|／|/|\bfeat\.?\b|\bft\.?\b|\bwith\b|\band\b)\s*",
    flags=re.IGNORECASE,
)


def extract_and_resolve_vocalists(
    item: dict,
    vmeta: dict,
    matcher: MasterArtistMatcher,
) -> tuple[list[dict], list[str], bool, str]:
    """
    Resolves one or more singing artists for a video:
    1. Checks if `artistName` as a whole is an existing unit/solo artist in `artists_master.json`.
    2. Otherwise, splits collaboration expressions (from `item['vocalists']`, `item['artistName']`, or video title)
       into individual vocalist names, excludes composer/originalArtist names, and matches each against `matcher`.
    Returns:
      (matched_artists_list, unmatched_names_list, is_collaboration, resolution_note)
    """
    raw_artist_str = (item.get("artistName") or "").strip()
    raw_vocalists = item.get("vocalists")
    composer_norm = normalize_artist_lookup_key(item.get("composer") or "")
    orig_artist_norm = normalize_artist_lookup_key(item.get("originalArtist") or "")
    song_type = "cover" if str(item.get("songType") or "").strip().lower() == "cover" else "orig"

    # Step 1: If `raw_artist_str` directly matches a single existing artist/unit in master data, check if the video
    # is actually a collaboration with another existing artist not included in `raw_artist_str`
    whole_match, whole_note = matcher.match_single_artist_query(raw_artist_str, vmeta)
    if whole_match and (not isinstance(raw_vocalists, list) or len(raw_vocalists) <= 1):
        # Check if video title explicitly has `A × B` or `A & B` with another known artist when `whole_match` is a solo artist
        role_str = whole_match.get("role") or ""
        raw_title = vmeta.get("title") or ""
        if not role_str.startswith("音楽グループ") and any(sep in raw_title for sep in ("×", "✕", "✖", "＆", "&")):
            # Check if multiple candidate hints are grounded in the video title
            title_hints = [
                h for h in matcher.find_candidate_hints_for_video(vmeta)
                if h["matchSource"] in ("name_in_video_title", "delimited_short_name_in_meta", "channel_id_exact", "channel_title_exact")
            ]
            if len(title_hints) >= 2:
                collab_artists = []
                for h in title_hints:
                    a_obj = matcher.by_aid.get(h["aid"])
                    if a_obj and a_obj not in collab_artists:
                        # Exclude original artist on covers
                        if song_type == "cover" and orig_artist_norm and normalize_artist_lookup_key(a_obj["name"]) == orig_artist_norm:
                            continue
                        if composer_norm and normalize_artist_lookup_key(a_obj["name"]) == composer_norm:
                            continue
                        collab_artists.append(a_obj)
                if len(collab_artists) >= 2:
                    return collab_artists, [], True, "動画タイトル・チャンネル情報からコラボ参加者の既存名義を特定"
        return [whole_match], [], False, whole_note

    # Step 2: Build list of candidate participant names from `vocalists` and/or splitting `raw_artist_str`
    participant_strings = []
    if isinstance(raw_vocalists, list) and len(raw_vocalists) > 0:
        for v in raw_vocalists:
            vs = str(v or "").strip()
            if vs:
                # If an element in vocalists still has collaboration separators and isn't an existing unit, split it
                m_unit, _ = matcher.match_single_artist_query(vs, vmeta)
                if m_unit:
                    participant_strings.append(vs)
                else:
                    for part in COLLAB_SPLIT_REGEX.split(vs):
                        if part.strip():
                            participant_strings.append(part.strip())
    elif raw_artist_str:
        for part in COLLAB_SPLIT_REGEX.split(raw_artist_str):
            if part.strip():
                participant_strings.append(part.strip())

    # Deduplicate participant strings while preserving order
    seen_p = set()
    clean_participants = []
    for p in participant_strings:
        pk = normalize_artist_lookup_key(p)
        if not pk or pk in seen_p:
            continue
        # Filter out composer or original artist if accidentally listed as a vocalist on a cover
        if composer_norm and pk == composer_norm and len(participant_strings) > 1:
            continue
        if song_type == "cover" and orig_artist_norm and pk == orig_artist_norm and len(participant_strings) > 1:
            continue
        seen_p.add(pk)
        clean_participants.append(p)

    # Step 3: If still empty, check channelId / channelTitle match directly
    if not clean_participants and vmeta is not None:
        cid = (vmeta.get("channelId") or "").strip()
        if cid and cid in matcher.by_channel_id and len(matcher.by_channel_id[cid]) == 1:
            return [matcher.by_channel_id[cid][0]], [], False, "チャンネルIDから既存名義を特定"
        clean_ch = re.sub(r"\s*-\s*Topic\s*$", "", vmeta.get("channelTitle") or "", flags=re.IGNORECASE).strip()
        if clean_ch:
            ch_match, ch_note = matcher.match_single_artist_query(clean_ch, vmeta)
            if ch_match:
                return [ch_match], [], False, ch_note

    matched_artists = []
    unmatched_names = []
    notes = []
    for p in clean_participants:
        m_art, m_note = matcher.match_single_artist_query(p, vmeta)
        if m_art:
            if m_art not in matched_artists:
                matched_artists.append(m_art)
            if m_note:
                notes.append(m_note)
        else:
            unmatched_names.append(p)
            if m_note:
                notes.append(m_note)

    is_collab = (len(clean_participants) >= 2) or (len(matched_artists) >= 2) or bool(item.get("isCollaboration"))
    return matched_artists, unmatched_names, is_collab, " / ".join(dict.fromkeys(n for n in notes if n))


def evaluate_auto_registration_decision(
    item: dict,
    matched_artists: list[dict],
    unmatched_names: list[str],
    is_collab: bool,
    resolution_note: str,
    vmeta: dict,
    matcher: MasterArtistMatcher,
    confidence: float,
    threshold: float = AUTO_APPROVE_CONFIDENCE,
) -> tuple[bool, str]:
    """
    Evaluates whether a video can be auto-registered to `matched_artists` (1 or more existing artists).
    Enforces all rules in Sections 3, 4, 5, 6:
    - Never creates a combined 'A＆B' or 'A×B' artist for collaborations.
    - If any collaboration participant is unmatched, holds for review with specific reason.
    - Allows official Topic channels and videos without artist name in title when channel/metadata grounding is solid.
    - Never rejects solely because Gemini wrote a vague reason or mislabeled an existing artist as new.
    - Protects against composer / original-artist / homonym mix-ups.
    """
    song_title = (item.get("songTitle") or "").strip()
    if not song_title:
        return False, "曲名が抽出できないため要確認"

    if unmatched_names and not matched_artists:
        return False, f"サイト未登録の新規名義候補（{'、'.join(unmatched_names)}）のため要確認"

    if unmatched_names and matched_artists:
        return False, (
            f"コラボ参加者の一部（{'、'.join(unmatched_names)}）が既存名義と照合できないため要確認"
            f"（一致済み：{ '、'.join(a['name'] for a in matched_artists) }）"
        )

    if not matched_artists:
        return False, resolution_note or "歌唱名義を特定できないため要確認"

    # Verify grounding of each matched existing artist in the video metadata
    ungrounded = []
    for a in matched_artists:
        ok, _ = matcher.is_artist_grounded_in_video(a, vmeta)
        if not ok:
            ungrounded.append(a["name"])

    if ungrounded:
        return False, (
            f"動画タイトル・概要欄・チャンネル情報に名義（{'、'.join(ungrounded)}）の明示的な根拠が確認できないため要確認"
            "（作曲者・原曲者・同名異人の取り違え防止）"
        )

    # Check if composer or originalArtist was mistaken for the sole vocalist
    composer_str = (item.get("composer") or "").strip()
    orig_artist_str = (item.get("originalArtist") or "").strip()
    song_type = "cover" if str(item.get("songType") or "").strip().lower() == "cover" else "orig"
    if len(matched_artists) == 1:
        sole_norm = normalize_artist_lookup_key(matched_artists[0]["name"])
        if song_type == "cover" and orig_artist_str and normalize_artist_lookup_key(orig_artist_str) == sole_norm:
            # Only allow if it is explicitly a self-cover on the artist's own channel
            cid = (vmeta.get("channelId") or "").strip()
            if not (cid and matched_artists[0] in matcher.by_channel_id.get(cid, [])):
                return False, f"カバー曲において原曲アーティスト（{orig_artist_str}）と歌唱者の区別が曖昧なため要確認"

    # Confidence check: if all matched artists are grounded in video metadata (e.g. channelId/Topic/title),
    # allow >= 0.75 when Gemini only lowered confidence due to collaboration or Topic channel; otherwise require threshold.
    effective_threshold = 0.75 if (is_collab or "- topic" in (vmeta.get("channelTitle") or "").lower()) else threshold
    if confidence < effective_threshold:
        return False, f"確信度が基準値未満 ({confidence:.2f} < {effective_threshold:.2f}) のため要確認"

    matched_names_str = "、".join(a["name"] for a in matched_artists)
    clean_reason = (
        f"既存名義（{matched_names_str}）へのコラボ曲追加として自動確定"
        if len(matched_artists) >= 2
        else f"既存名義「{matched_names_str}」と照合一致（チャンネル・動画メタデータで根拠確認済み）"
    )
    return True, clean_reason




CURATED_SONG_RENAME_MAP = {
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
    "I’m here": "運命の華"
}

CURATED_V56_ARTISTS = [
  {
    "aid": "a_f14dff12",
    "name": "鈴木愛理",
    "cat": 2,
    "count": 1,
    "reading": "すずきあいり",
    "kana": "す",
    "row": "さ",
    "alpha": "",
    "img": "https://yt3.googleusercontent.com/yCgi8G0wytpJvWlC9hOtxrGxuafnWRwL0lJs_ocp4kUHB-MBnqidC_bKSPcIc6kARjld6plFqA=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "空は二度燃える"
    ],
    "topSongs": [
      "空は二度燃える",
      "初恋サイダー",
      "最強の推し！",
      "恋におちたら feat. 空音 & Taku Takahashi",
      "Distance"
    ],
    "topLinks": [
      "pKuhQACie_k",
      "rhfZq9b9h6I",
      "",
      "xU07Dte4JhE",
      ""
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル"
    ],
    "role": "歌手",
    "roles": [
      "歌手"
    ],
    "groupSubRole": "",
    "sub": 444000,
    "subBucket": "100kTo1m",
    "subDate": "2026-11-01",
    "al": [
      "Airi Suzuki",
      "Suzuki Airi",
      "suzukiairi",
      "スズキアイリ",
      "Buono!",
      "℃-ute",
      "UCRkCifCbAw0qwu7XzOa9d7w"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "圧倒的な歌唱力と表現力で知られるソロヴォーカリスト。℃-uteやBuono!での活動を経て2018年にソロデビューし、アニメ主題歌や『空は二度燃える』など幅広い楽曲で輝きを放っている。",
    "ytChannelUrl": "https://www.youtube.com/channel/UCRkCifCbAw0qwu7XzOa9d7w",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_453a93b8",
    "name": "平葵",
    "cat": 2,
    "count": 1,
    "reading": "たいらあおい",
    "kana": "た",
    "row": "た",
    "alpha": "",
    "img": "https://yt3.googleusercontent.com/tHF4W2ea5vj9y-r4copsa5jbbo6QHzdONdb-K4kcHyky2V2YSc997u8PXmhjnOewdZhjWjO6=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "案山子"
    ],
    "topSongs": [
      "案山子",
      "canfull",
      "×",
      "progress",
      "燐光って"
    ],
    "topLinks": [
      "cAlhOMda-Xs",
      "",
      "t8LT72qrRjo",
      "sPqQHgqk_Uk",
      "si5-RddQoxg"
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル"
    ],
    "role": "歌手",
    "roles": [
      "歌手"
    ],
    "groupSubRole": "",
    "sub": None,
    "subBucket": "unknown",
    "subDate": "2026-11-01",
    "al": [
      "Aoi Taira",
      "Taira Aoi",
      "tairaaoi",
      "タイラアオイ",
      "UC0JetkYdglzF70e8GffPhMg"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "透明感と芯の強さを併せ持つ歌声で注目を集めるシンガー。『案山子』や『canfull』など、繊細な感情の揺れを描く楽曲を独自の表現力で歌い上げている。",
    "ytChannelUrl": "https://www.youtube.com/channel/UC0JetkYdglzF70e8GffPhMg",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_3408025f",
    "name": "わん子 (綰子 /Wanko)",
    "cat": 1,
    "count": 2,
    "reading": "わんこ",
    "kana": "わ",
    "row": "わ",
    "alpha": "",
    "img": "https://yt3.googleusercontent.com/seAUw4pKG3PB4Wsg5sslqFqFdD24vqvJk57jZMo8hdnRrwbebPdc9JnFX1MulRhgD-NS3tdH=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "みにまむ",
      "もでらーと"
    ],
    "topSongs": [
      "みにまむ",
      "もでらーと"
    ],
    "topLinks": [
      "S2AhFrGXa8I",
      "wKusc39aDLA"
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル"
    ],
    "role": "歌い手",
    "roles": [
      "歌い手"
    ],
    "groupSubRole": "",
    "sub": None,
    "subBucket": "unknown",
    "subDate": "2026-11-01",
    "al": [
      "わん子",
      "綰子",
      "綰子 /Wanko",
      "綰子/wanko",
      "Wanko",
      "wanko",
      "わんこ",
      "ワンコ",
      "UClDId0k74ZpDwRXJzrb-jIQ"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "",
    "ytChannelUrl": "https://www.youtube.com/channel/UClDId0k74ZpDwRXJzrb-jIQ",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_aba2a431",
    "name": "TORi (torry)",
    "cat": 1,
    "count": 1,
    "reading": "とり",
    "kana": "と",
    "row": "た",
    "alpha": "T",
    "img": "https://yt3.googleusercontent.com/gc-pVzesz1KF8zE5IAN_lfhlr0HLD-a_Im-KpEyeTkntdUZDi47s5JHRvCEWpfnDCnTILMbJCMU=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "菜の花のように"
    ],
    "topSongs": [
      "菜の花のように",
      "だきしめること。"
    ],
    "topLinks": [
      "SIW7cNyQPak",
      "5RSzx4zMF2U"
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル"
    ],
    "role": "歌い手",
    "roles": [
      "歌い手"
    ],
    "groupSubRole": "",
    "sub": 10600,
    "subBucket": "10kTo100k",
    "subDate": "2026-11-01",
    "al": [
      "TORi",
      "torry",
      "tori",
      "とり",
      "トリ",
      "鳥",
      "UCHeUUDWr8oXbdublNQtJbNQ"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "",
    "ytChannelUrl": "https://www.youtube.com/channel/UCHeUUDWr8oXbdublNQtJbNQ",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_62c07790",
    "name": "瀧川ありさ",
    "cat": 2,
    "count": 1,
    "reading": "たきがわありさ",
    "kana": "た",
    "row": "た",
    "alpha": "",
    "img": "https://yt3.googleusercontent.com/ytc/AIdro_kjdHAsXZLiPrVm666_V9VT5_azux5GVlz4O71207G0OQ=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "さよならのゆくえ"
    ],
    "topSongs": [
      "さよならのゆくえ",
      "Season",
      "色褪せない瞳",
      "わがまま",
      "夏の花"
    ],
    "topLinks": [
      "pe8_2tiHwfQ",
      "8a1PBi2ROD0",
      "TBmevKostw4",
      "GBMuovsHDi8",
      ""
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル"
    ],
    "role": "歌手",
    "roles": [
      "歌手"
    ],
    "groupSubRole": "",
    "sub": 35800,
    "subBucket": "10kTo100k",
    "subDate": "2026-11-01",
    "al": [
      "Alisa Takigawa",
      "Takigawa Alisa",
      "takigawaarisa",
      "タキガワアリサ",
      "UCfeGaWl3hge2_4BXrXSqEyw"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "伸びやかで情感豊かな歌声を持つシンガーソングライター。TVアニメ『七つの大罪』EDテーマ『Season』でメジャーデビューし、『終物語』EDテーマ『さよならのゆくえ』など数々のアニメ主題歌を手掛けている。",
    "ytChannelUrl": "https://www.youtube.com/channel/UCfeGaWl3hge2_4BXrXSqEyw",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_407a13ad",
    "name": "rei sirose",
    "cat": 1,
    "count": 1,
    "reading": "れいしろせ",
    "kana": "れ",
    "row": "ら",
    "alpha": "R",
    "img": "https://i.ytimg.com/vi/j1ArobXFdyQ/hqdefault.jpg",
    "songs": [
      "贖罪"
    ],
    "topSongs": [
      "贖罪"
    ],
    "topLinks": [
      "j1ArobXFdyQ"
    ],
    "topTypes": [
      "cover"
    ],
    "role": "歌い手",
    "roles": [
      "歌い手"
    ],
    "groupSubRole": "",
    "sub": None,
    "subBucket": "unknown",
    "subDate": "2026-11-01",
    "al": [
      "reisirose",
      "白瀬怜",
      "れいしろせ",
      "レイシロセ",
      "UCyqaJxeEZLd7AfebCpxu06g"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "",
    "ytChannelUrl": "https://www.youtube.com/channel/UCyqaJxeEZLd7AfebCpxu06g",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_003d0cad",
    "name": "花降る日々",
    "cat": 2,
    "count": 1,
    "reading": "はなふるひび",
    "kana": "は",
    "row": "は",
    "alpha": "",
    "img": "https://i.ytimg.com/vi/c0TtCowqHC0/hqdefault.jpg",
    "songs": [
      "ひとりじゃないじゃん"
    ],
    "topSongs": [
      "ひとりじゃないじゃん",
      "muguet",
      "花降る日々",
      "紫陽花、まばたき、梅雨の日。"
    ],
    "topLinks": [
      "",
      "c0TtCowqHC0",
      "jm1ZozgaGQw",
      "ET92gzWWYbU"
    ],
    "topTypes": [
      "オリジナル",
      "オリジナル",
      "オリジナル",
      "オリジナル"
    ],
    "role": "音楽グループ(その他)",
    "roles": [
      "音楽グループ(その他)"
    ],
    "groupSubRole": "音楽グループ(その他)",
    "sub": None,
    "subBucket": "unknown",
    "subDate": "2026-11-01",
    "al": [
      "、花降る日々",
      "花降る日々、",
      "hanafuruhibi",
      "hanahuruhibi",
      "ハナフルヒビ",
      "鎖那・000・めありー",
      "UCVd0lHzInoR_wocMXR74fTA"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "鎖那・000・めありー",
    "vocalParts": [
      {
        "text": "鎖那",
        "target": "鎖那"
      },
      {
        "text": "・000・",
        "target": None
      },
      {
        "text": "めありー",
        "target": "めありー"
      }
    ],
    "memberOf": [],
    "profileBio": "鎖那・000・めありーの3人による音楽ユニット。繊細で透明感のあるボーカルアンサンブルとアコースティックな温かみのあるサウンドで、『ひとりじゃないじゃん』や『muguet』などの楽曲を発表している。",
    "ytChannelUrl": "https://www.youtube.com/channel/UCVd0lHzInoR_wocMXR74fTA",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  },
  {
    "aid": "a_10842e73",
    "name": "miri (璃Miri)",
    "cat": 1,
    "count": 1,
    "reading": "みり",
    "kana": "み",
    "row": "ま",
    "alpha": "M",
    "img": "https://yt3.googleusercontent.com/erJlmpAFYLgcsBlRl4nSKFV3B0lD1sk6ZlXp6JEWe_n9fWynvli9aAhiL-oFqIfXFkdcba7S3Q=s240-c-k-c0x00ffffff-no-rj",
    "songs": [
      "レイラ"
    ],
    "topSongs": [
      "レイラ"
    ],
    "topLinks": [
      "gqWAui-okAM"
    ],
    "topTypes": [
      "オリジナル"
    ],
    "role": "Vtuber",
    "roles": [
      "Vtuber"
    ],
    "groupSubRole": "",
    "sub": 34700,
    "subBucket": "10kTo100k",
    "subDate": "2026-11-01",
    "al": [
      "miri",
      "璃Miri",
      "みり",
      "ミリ",
      "UCHCnxECJBxKrMByroUWSgcw"
    ],
    "agency": "",
    "agencyGroup": "",
    "vocal": "",
    "vocalParts": [],
    "memberOf": [],
    "profileBio": "",
    "ytChannelUrl": "https://www.youtube.com/channel/UCHCnxECJBxKrMByroUWSgcw",
    "ytChannelLabel": "YouTubeチャンネル →",
    "ytChannelType": "official"
  }
]


def apply_curated_renames_and_additions(
    artists: list[dict],
    pending_list: list[dict],
    processed_ids: set[str],
    mugen2_state: dict | None = None,
    now_iso: str = "",
    today_str: str = "",
) -> tuple[bool, list[dict]]:
    changed = False
    # 1. Song renames + deduplication
    for a in artists:
        if isinstance(a.get("songs"), list):
            new_songs = []
            seen = set()
            for s in a["songs"]:
                sc = str(s or "").strip()
                mapped = CURATED_SONG_RENAME_MAP.get(sc, sc)
                if mapped != sc:
                    changed = True
                if mapped and mapped not in seen:
                    seen.add(mapped)
                    new_songs.append(mapped)
                elif mapped in seen:
                    changed = True
            if new_songs != a["songs"]:
                a["songs"] = new_songs
                a["count"] = len(new_songs)
                changed = True
        if isinstance(a.get("topSongs"), list):
            new_top = [CURATED_SONG_RENAME_MAP.get(str(s or "").strip(), str(s or "").strip()) for s in a["topSongs"]]
            if new_top != a["topSongs"]:
                a["topSongs"] = new_top
                changed = True

    # 2. Rename Kimidori / きみどり -> ≡君彩≡ (a_31d1b2a3)
    kimidori_target = None
    extra_kimidori = []
    for a in artists:
        if a.get("aid") == "a_31d1b2a3" or a.get("name") in ("きみどり", "≡君彩≡"):
            if kimidori_target is None:
                kimidori_target = a
            else:
                extra_kimidori.append(a)
        elif str(a.get("name") or "").strip().lower() == "kimidori":
            if kimidori_target is None:
                kimidori_target = a
            else:
                extra_kimidori.append(a)

    if kimidori_target is not None:
        if kimidori_target.get("name") != "≡君彩≡":
            kimidori_target["name"] = "≡君彩≡"
            changed = True
        kimidori_target["aid"] = "a_31d1b2a3"
        kimidori_target["reading"] = "きみどり"
        kimidori_target["kana"] = "き"
        kimidori_target["row"] = "か"
        als = list(kimidori_target.get("al") or [])
        for alias in ("Kimidori", "kimidori", "きみどり", "君彩", "≡君彩≡"):
            if alias not in als:
                als.append(alias)
                changed = True
        kimidori_target["al"] = als
        for ex in extra_kimidori:
            for s in ex.get("songs") or []:
                if s not in kimidori_target["songs"]:
                    kimidori_target["songs"].append(s)
            artists.remove(ex)
            changed = True
        kimidori_target["count"] = len(kimidori_target.get("songs") or [])

    # 3. Ensure the 8 curated artists & songs exist
    curated_cids = set()
    curated_names_norm = set()
    for cur in CURATED_V56_ARTISTS:
        cid = cur["ytChannelUrl"].split("/channel/")[-1]
        curated_cids.add(cid)
        curated_names_norm.add(normalize_text_key(cur["name"]))
        for al in cur.get("al") or []:
            curated_names_norm.add(normalize_text_key(al))
        matched_artist = None
        for a in artists:
            if (
                a.get("aid") == cur["aid"]
                or a.get("name") == cur["name"]
                or (cid and cid in str(a.get("ytChannelUrl") or ""))
            ):
                matched_artist = a
                break
        if matched_artist is None:
            artists.append(json.loads(json.dumps(cur)))
            changed = True
        else:
            if matched_artist.get("name") != cur["name"]:
                matched_artist["name"] = cur["name"]
                changed = True
            existing_songs = matched_artist.setdefault("songs", [])
            for s in cur["songs"]:
                if s not in existing_songs:
                    existing_songs.append(s)
                    changed = True
            matched_artist["count"] = len(existing_songs)
            als = matched_artist.setdefault("al", [])
            for alias in cur.get("al") or []:
                if alias not in als:
                    als.append(alias)
                    changed = True

    # 4. Clean up any matching pending items from pending_list
    if pending_list:
        kept = []
        for p in pending_list:
            if not isinstance(p, dict):
                continue
            p_artist = normalize_text_key(p.get("artistName") or p.get("artist") or "")
            p_ch = str(p.get("ytChannelUrl") or "")
            if p_artist in curated_names_norm or any(cid and cid in p_ch for cid in curated_cids):
                vid = (p.get("videoId") or "").strip()
                if vid:
                    processed_ids.add(vid)
                changed = True
            else:
                kept.append(p)
        if len(kept) != len(pending_list):
            pending_list[:] = kept
            changed = True

    # 5. Apply the 5 confirmed v67 pending resolutions (existing artists only; never create new artists or alter existing metadata)
    curated_logs = []
    aid_map = {a.get("aid"): a for a in artists if isinstance(a, dict) and a.get("aid")}
    name_map = {a.get("name"): a for a in artists if isinstance(a, dict) and a.get("name")}
    confirmed_vids = set()

    for res in CONFIRMED_V67_PENDING_RESOLUTIONS:
        vid = res["videoId"]
        confirmed_vids.add(vid)
        s_title = res["songTitle"]
        s_type = res["songType"]
        for tgt in res["targets"]:
            target_a = aid_map.get(tgt["aid"]) or name_map.get(tgt["name"])
            if not target_a:
                continue
            added = add_song_to_existing_artist(target_a, s_title, s_type, vid)
            if added:
                changed = True
            if mugen2_state is not None:
                vmap = mugen2_state.get("videoMap") or {}
                existing_targets = _extract_video_targets(vmap.get(vid) or {})
                already_mapped = any(
                    t["aid"] == target_a["aid"] and normalize_text_key(t["songTitle"]) == normalize_text_key(s_title)
                    for t in existing_targets
                )
                if not already_mapped:
                    register_mugen2_video_mapping(
                        mugen2_state=mugen2_state,
                        vid=vid,
                        artist=target_a,
                        song_title=s_title,
                        song_type=s_type,
                        source="confirmed_pending_resolution",
                        confidence=1.0,
                        now_iso=now_iso or "2026-11-03T06:00:00Z",
                    )
                    changed = True
            if added or vid not in processed_ids:
                curated_logs.append({
                    "date": today_str or "2026-11-03",
                    "timestamp": now_iso or "2026-11-03T06:00:00Z",
                    "action": "confirmed_pending_song_added" if added else "confirmed_pending_song_linked",
                    "registrationType": "newly_added_song" if added else "linked_existing_song",
                    "aid": target_a["aid"],
                    "artist": target_a["name"],
                    "song": s_title,
                    "type": s_type,
                    "videoId": vid,
                    "status": "success",
                    "result": "既存名義へ楽曲を新規追加完了" if added else "既存曲に動画IDを紐付け完了（重複追加なし）",
                })
        if vid not in processed_ids:
            processed_ids.add(vid)
            changed = True

    if pending_list:
        before_len = len(pending_list)
        pending_list[:] = [
            p for p in pending_list
            if isinstance(p, dict) and (p.get("videoId") or "").strip() not in confirmed_vids
        ]
        if len(pending_list) != before_len:
            changed = True

    return changed, curated_logs


def apply_approved_pending_items(
    artists: list[dict],
    pending_list: list[dict],
    processed_ids: set[str],
    today_str: str,
    mugen2_state: dict | None = None,
    now_iso: str = "",
) -> tuple[list[dict], list[dict]]:
    """
    Processes items in `pending_review.json`:
    - `"skip": true` or `"rejected": true`: excluded without registration; `videoId` is recorded in `processed_ids`.
    - `"approved": true`: applies user's manual edits and registers into `artists` (`artists_master.json` & `data.js`);
      `videoId` is recorded in `processed_ids`.
    - If an error or missing field occurs on an approved item, keeps the item in `remaining_pending` with an error note
      so data is never silently lost.
    """
    by_name = {a["name"]: a for a in artists}
    alias_map = {}
    for a in artists:
        alias_map[normalize_text_key(a["name"])] = a
        for al in a.get("al") or []:
            if al:
                alias_map[normalize_text_key(al)] = a

    remaining_pending = []
    applied_logs = []

    for item in pending_list:
        if not isinstance(item, dict):
            continue
        vid = (item.get("videoId") or "").strip()

        if item.get("skip") is True or item.get("rejected") is True:
            if vid:
                processed_ids.add(vid)
            applied_logs.append({
                "date": today_str,
                "action": "skipped_pending_item",
                "artist": (item.get("artistName") or item.get("artist") or "").strip(),
                "song": (item.get("songTitle") or item.get("title") or "").strip(),
                "videoId": vid,
            })
            continue

        if item.get("approved") is not True:
            remaining_pending.append(item)
            continue

        # Item is marked approved=True; validate and apply safely
        try:
            artist_name = (item.get("artistName") or item.get("artist") or "").strip()
            song_title = (item.get("songTitle") or item.get("title") or "").strip()
            raw_song_type = (item.get("songType") or item.get("type") or "orig").strip().lower()
            song_type = "cover" if raw_song_type == "cover" else "orig"

            if not artist_name or not song_title:
                item_copy = dict(item)
                item_copy["lastError"] = "artistName または songTitle が空のため承認処理を保留しました"
                remaining_pending.append(item_copy)
                continue

            matcher = MasterArtistMatcher(artists)
            matched_targets, unmatched_parts, _, _ = extract_and_resolve_vocalists(
                item={"artistName": artist_name, "vocalists": item.get("vocalists"), "songType": song_type},
                vmeta={"title": item.get("rawVideoTitle", ""), "channelTitle": item.get("rawChannelTitle", "")},
                matcher=matcher,
            )
            if matched_targets and not unmatched_parts:
                for target_artist in matched_targets:
                    added = add_song_to_existing_artist(target_artist, song_title, song_type, vid)
                    if mugen2_state is not None and vid:
                        register_mugen2_video_mapping(
                            mugen2_state=mugen2_state,
                            vid=vid,
                            artist=target_artist,
                            song_title=song_title,
                            song_type=song_type,
                            source="approved_pending",
                            confidence=1.0,
                            now_iso=now_iso or f"{today_str}T00:00:00Z",
                        )
                    applied_logs.append({
                        "date": today_str,
                        "timestamp": now_iso or f"{today_str}T00:00:00Z",
                        "action": "approved_song_added" if added else "approved_song_already_exists",
                        "registrationType": "newly_added_song" if added else "linked_existing_song",
                        "aid": target_artist.get("aid", ""),
                        "artist": target_artist["name"],
                        "song": song_title,
                        "type": song_type,
                        "videoId": vid,
                        "status": "success",
                    })
                if vid:
                    processed_ids.add(vid)
            else:
                raw_role = (item.get("role") or ("歌い手" if song_type == "cover" else "歌手")).strip()
                explicit_cat = item.get("cat")
                if explicit_cat in (1, 2):
                    cat_val = int(explicit_cat)
                else:
                    cat_val = 1 if (song_type == "cover" and raw_role in ("歌い手", "Vtuber", "Vsinger")) else 2

                group_sub_role = (item.get("groupSubRole") or "").strip()
                if raw_role in ("音楽グループ(アニゲー関連)", "音楽グループ(その他)"):
                    group_sub_role = raw_role
                    if cat_val == 1:
                        raw_role = "音楽グループ"

                reading_val = (item.get("reading") or artist_name).strip()
                kana_char = (item.get("kana") or (reading_val[:1] if reading_val else ""))[:1]
                ch_url = (item.get("ytChannelUrl") or "").strip()
                sub_val = item.get("sub")
                ag = (item.get("agency") or item.get("group") or "").strip()
                agg = (item.get("agencyGroup") or ag).strip()
                bio_val = (item.get("profileBio") or item.get("bio") or "").strip()

                new_entry = {
                    "name": artist_name,
                    "cat": cat_val,
                    "count": 1,
                    "reading": reading_val,
                    "kana": kana_char,
                    "row": kana_to_row(kana_char),
                    "alpha": (item.get("alpha") or "")[:1].upper(),
                    "img": item.get("img") or "",
                    "songs": [song_title],
                    "topSongs": [song_title],
                    "topLinks": [vid] if vid else [],
                    "topTypes": [song_type],
                    "role": raw_role,
                    "roles": [raw_role],
                    "groupSubRole": group_sub_role,
                    "sub": sub_val,
                    "subBucket": sub_to_bucket(sub_val),
                    "subDate": today_str,
                    "al": item.get("al") or [],
                    "agency": ag,
                    "agencyGroup": agg,
                    "vocal": item.get("vocal") or "",
                    "vocalParts": [],
                    "memberOf": item.get("memberOf") or [],
                    "profileBio": bio_val,
                    "ytChannelUrl": ch_url,
                    "ytChannelLabel": "YouTubeチャンネル →" if ch_url else "",
                    "ytChannelType": "official" if ch_url else "",
                }
                artists.append(new_entry)
                by_name[artist_name] = new_entry
                alias_map[normalize_text_key(artist_name)] = new_entry
                if vid:
                    processed_ids.add(vid)
                applied_logs.append({
                    "date": today_str,
                    "action": "approved_new_artist",
                    "artist": artist_name,
                    "song": song_title,
                    "type": song_type,
                    "role": raw_role,
                    "videoId": vid,
                })
        except Exception as e:
            safe_print(f"[ERROR] Failed to apply approved pending item ({vid}): {e}")
            item_copy = dict(item)
            item_copy["lastError"] = str(e)
            remaining_pending.append(item_copy)

    return remaining_pending, applied_logs


def render_pending_markdown(pending_list: list[dict]) -> str:
    lines = [
        "# 要確認・仮設定リスト（新規名義 / 低確信度の曲）",
        "",
        "この一覧は、初期化完了後にプレイリストへ追加された動画のうち **「サイト未登録の新規名義」** または **「AIが判別に迷った曲（確信度 0.85 未満・複数人歌唱・作曲者チャンネル投稿など）」** をAIが仮設定したものです（まだサイト本番データには登録されていません）。",
        "",
        "### 手動調整・承認のやり方",
        "1. `data/pending_review.json` をGitHub上で開いて編集（鉛筆アイコン）します。",
        "2. 仮設定されている `artistName`（名義）、`songTitle`（曲名）、`role`（活動形態）、`agency`（所属）、`profileBio`（プロフィール文）を確認し、必要なら修正します。",
        "3. サイトに登録してよければ `\"approved\": false` を **`\"approved\": true`** に書き換えて Commit します（登録せず除外したい場合は **`\"skip\": true`** にします）。",
        "4. 次回の自動実行（または Actions タブからの「Run workflow」手動実行）で自動的に本番サイトへ反映され、このリストから消えます（新しく追加された曲が0件の日でも承認分は反映されます）。",
        "",
    ]
    if not pending_list:
        lines.append("現在、確認待ちの項目はありません（0件）。")
        return "\n".join(lines) + "\n"

    lines.append(f"現在 **{len(pending_list)}件** の確認待ち項目があります：")
    lines.append("")
    lines.append("| 追加日 | 区分 | 確信度 | 仮アーティスト名 | 仮曲名 | 種別 | 仮活動形態 | 仮所属 | 動画リンク | 理由・AIメモ |")
    lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    for p in pending_list:
        vid = p.get("videoId", "")
        vurl = f"[動画](https://www.youtube.com/watch?v={vid})" if vid else "-"
        kind = "新規名義" if p.get("isNewArtist") else "要確認(既存候補)"
        conf_val = parse_confidence(p.get("confidence"))
        lines.append(
            f"| {p.get('date', '')} | {kind} | `{conf_val:.2f}` | **{p.get('artistName', '')}** | {p.get('songTitle', '')} | "
            f"`{p.get('songType', '')}` | {p.get('role', '')} | {p.get('agency', '') or '-'} | {vurl} | {p.get('reason', '')} |"
        )
    return "\n".join(lines) + "\n"


def classify_videos_with_gemini(
    videos: list[dict],
    existing_names: list[str],
    api_key: str,
    candidate_models: list[str],
    working_model_cache: dict,
    matcher: MasterArtistMatcher | None = None,
) -> list[dict]:
    enriched_videos = []
    for v in videos:
        vc = dict(v)
        if matcher is not None:
            vc["matchedExistingCandidates"] = matcher.find_candidate_hints_for_video(v)
        enriched_videos.append(vc)

    prompt = f"""あなたは女性ボーカル楽曲アーカイブ「かるが聴いている歌い手・アーティスト」のデータ管理AIです。
以下のYouTube動画リストについて、それぞれの動画から「曲名(songTitle)」「実際に歌唱しているボーカル名義リスト(vocalists)」「代表表記(artistName)」「オリジナル曲(orig)かカバー曲(cover)か(songType)」「確信度(confidence: 0.0〜1.0の数値)」を判別し、JSON配列で返してください。

【サイト登録ルール・最重要注意事項】
1. 対象は「女性ボーカル」または「女性ボーカルを含む音楽ユニット」のみです。男性ソロボーカル曲やインスト曲の場合は `"skip": true` にしてください。
2. 【既存名義の優先照合（最重要）】
   - 各動画データの `"matchedExistingCandidates"` に、Python側でチャンネルID・タイトル・概要欄から照合した既存アーティスト候補が含まれています。
   - 歌唱者が既存の登録アーティストである場合は、必ず既存アーティストの正式名義を `"vocalists"` および `"artistName"` に使用してください。既存アーティストを新規名義と誤認しないでください。
   - `"xxx - Topic"` のようなYouTube自動生成トピックチャンネルや、動画タイトルにアーティスト名が含まれない公式チャンネル投稿動画であっても、チャンネル名や `"matchedExistingCandidates"` から歌唱者が特定できる場合は `"ambiguous": false`、高い `"confidence"` (`0.90`以上) を設定してください。
3. 【コラボ曲・複数人歌唱の分解ルール】
   - 「羊羊＆あかつきるき」「明透×琶舞」のような複数人の一時的なコラボ曲（`&`, `＆`, `×`, `feat.`, `with`, `covered by` 等）では、`"A＆B"` や `"A×B"` という連名の新規名義を作らず、必ず `"vocalists": ["参加者1", "参加者2"]` のように個別の歌唱参加者リストとして抽出してください（正式な既存ユニット名義で活動しているグループ曲のみ `"isCollaboration": false` でユニット名義1つにします）。
   - コラボ曲であっても、参加している歌唱者が明確に特定できる場合は `"ambiguous": false`、`"confidence": 0.90` 以上にしてください（「コラボ曲だから」という理由だけで `"ambiguous": true` にしないでください）。
4. 【作曲者・原曲者・投稿チャンネルの取り違え防止】
   - ボカロP・作曲者・公式アニメ/ゲームチャンネルに投稿されている動画で、ボーカル（feat. 〇〇 / Vocal: 〇〇 / 歌：〇〇 / CV: 〇〇）が歌っている場合は、作曲者ではなく必ず「実際に歌っている女性ボーカリストまたはユニット名義」を `"vocalists"` / `"artistName"` にしてください。作曲者名は `"composer"` に、カバー曲の原曲歌手名は `"originalArtist"` に分離して記載してください。
5. `"songTitle"` には「【歌ってみた】」「MV」「Official Music Video」「/ アーティスト名」「cover」「Covered by ...」などの装飾を除いた純粋な曲名のみを入れてください。
6. `"songType"` は `"orig"`（オリジナル曲）または `"cover"`（歌ってみた・カバー曲）のいずれかにしてください。
7. 主な既存名義の例（一部）: {", ".join(existing_names[:350])}

【入力動画データ】
{json.dumps(enriched_videos, ensure_ascii=False, indent=2)}

【出力JSONスキーマ（配列のみ出力）】
[
  {{
    "videoId": "動画ID",
    "skip": false,
    "confidence": 0.95,
    "ambiguous": false,
    "isCollaboration": false,
    "vocalists": ["歌唱アーティスト名義1"],
    "artistName": "歌唱アーティスト名義1",
    "songTitle": "純粋な曲名",
    "songType": "orig または cover",
    "originalArtist": "カバー曲の場合の原曲アーティスト名（不明またはオリジナル曲なら空文字）",
    "composer": "作曲者・ボカロP名（不明なら空文字）",
    "isOwnChannel": true,
    "reading": "ひらがなよみ",
    "kana": "頭文字ひらがな1文字",
    "alpha": "英字頭文字(A-Z)または空文字",
    "role": "歌い手 / Vsinger / Vtuber / 歌手 / 声優 / 音楽グループ(アニゲー関連) / 音楽グループ(その他)",
    "agency": "所属事務所・作品名（なければ空文字）",
    "profileBio": "新規名義で歌手・声優・音楽グループの場合のみ2〜3文のプロフィール紹介文（既存名義は空文字）",
    "reason": "判定根拠（どの情報から歌唱者と曲名を特定したか）"
  }}
]"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }
    resp, used_model = call_gemini_generate_content(
        payload=payload,
        api_key=api_key,
        candidate_models=candidate_models,
        working_model_cache=working_model_cache,
    )
    try:
        text = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        parsed = json.loads(text)
        if not isinstance(parsed, list):
            raise ValueError("Gemini response JSON is not a list")
        return parsed
    except Exception as e:
        raise ValueError(f"Invalid JSON structure from Gemini model '{used_model}': {e}")


def ensure_artist_stable_aid(artist: dict, used_aids: set[str] | None = None) -> str:
    """Preserves existing `aid` permanently (even across artist renames or sort changes).
    Only generates a deterministic `aid` when a brand-new artist record has none."""
    existing = artist.get("aid")
    if isinstance(existing, str) and re.match(r"^a_[0-9a-f]{8}(?:_\d+)?$", existing):
        if used_aids is not None:
            used_aids.add(existing)
        return existing
    name_str = str(artist.get("name") or "").strip()
    base = "a_" + hashlib.sha1(name_str.encode("utf-8")).hexdigest()[:8]
    cand = base
    if used_aids is not None:
        suffix = 2
        while cand in used_aids:
            cand = f"{base}_{suffix}"
            suffix += 1
        used_aids.add(cand)
    artist["aid"] = cand
    return cand


def update_api_artists_index_if_present(artists: list[dict]) -> None:
    """Keeps api/_artists_index.js synchronized when new artists are added via YouTube auto-sync."""
    api_index_path = os.path.join(BASE_DIR, "api", "_artists_index.js")
    if not os.path.isdir(os.path.dirname(api_index_path)):
        return
    try:
        valid_aids = []
        name_to_aid = {}
        alias_to_aid = {}
        for a in artists:
            aid = a.get("aid")
            if not aid:
                continue
            valid_aids.append(aid)
            if a.get("name"):
                name_to_aid[a["name"]] = aid
            for al in a.get("al") or []:
                if isinstance(al, str) and al.strip() and al.strip() not in name_to_aid:
                    alias_to_aid[al.strip()] = aid
        payload = {
            "validAids": sorted(set(valid_aids)),
            "nameToAid": name_to_aid,
            "aliasToAid": alias_to_aid,
        }
        content = (
            "// Auto-generated artist identifier index for Calpis Music Archive (/api/favorites)\n"
            "// Maps stable artist IDs (aid) and artist names/aliases for strict server-side validation.\n"
            "module.exports = "
            + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
            + ";\n"
        )
        atomic_write_text(api_index_path, content)
    except Exception as e:
        safe_print(f"[WARN] Could not update api/_artists_index.js: {e}")


def build_compact_data_js(artists: list[dict]) -> str:
    compact_artists = []
    for a in artists:
        ca = {}
        visible_songs = get_visible_songs_for_artist(a)
        for k, v in a.items():
            if k in ("id", "topStatus", "imgType", "youtubeChannelUrl", "rawSongCount"):
                continue
            if k == "songs":
                continue
            if v == "" or v == [] or v is None or v is False:
                continue
            if k == "subDate" and v in ("2026-10-27", "2026-10-28"):
                continue
            if k == "ytChannelLabel" and v == "YouTubeチャンネル →":
                continue
            if k == "ytChannelType" and v == "official":
                continue
            ca[k] = v
        # Output visible songs (after applying Mugen2 hidden filter) and always keep songs as a list []
        ca["songs"] = visible_songs if isinstance(visible_songs, list) else []
        ca["count"] = len(ca["songs"])
        compact_artists.append(ca)
    return "window.ARCHIVE_DATA = " + json.dumps(compact_artists, ensure_ascii=False, separators=(",", ":")) + ";"


def update_standalone_html_if_present(standalone_path: str, compact_data_js_line: str) -> bool:
    """Updates embedded `window.ARCHIVE_DATA = ...;` in calpis-music-archive.html if present."""
    if not os.path.exists(standalone_path):
        return False
    try:
        with open(standalone_path, "r", encoding="utf-8") as f:
            html_text = f.read()
        lines = html_text.splitlines()
        replaced = False
        for idx, line in enumerate(lines):
            if line.strip().startswith("window.ARCHIVE_DATA = "):
                lines[idx] = compact_data_js_line
                replaced = True
                break
        if replaced:
            atomic_write_text(standalone_path, "\n".join(lines) + "\n")
            return True
    except Exception as e:
        safe_print(f"[WARN] Could not update standalone HTML snapshot: {e}")
    return False


def recompute_and_save_production_data(artists: list[dict]) -> None:
    """Validates artist count, recomputes agency counts, sorts, and atomically writes master JSON, data.js, and standalone HTML."""
    if not isinstance(artists, list) or len(artists) < MIN_EXPECTED_ARTISTS:
        raise RuntimeError(
            f"Safety check triggered: refusing to overwrite artists_master.json because artist count ({len(artists) if isinstance(artists, list) else 'invalid'}) "
            f"is below minimum expected ({MIN_EXPECTED_ARTISTS})."
        )

    used_aids: set[str] = {
        a["aid"] for a in artists
        if isinstance(a.get("aid"), str) and re.match(r"^a_[0-9a-f]{8}(?:_\d+)?$", a["aid"])
    }
    agency_counts = {}
    for a in artists:
        ensure_artist_stable_aid(a, used_aids)
        ag = a.get("agencyGroup") or a.get("agency") or ""
        if ag:
            agency_counts[ag] = agency_counts.get(ag, 0) + 1
    for a in artists:
        if not isinstance(a.get("songs"), list):
            a["songs"] = []
        a["count"] = len(get_visible_songs_for_artist(a))
        ag = a.get("agencyGroup") or a.get("agency") or ""
        cnt = agency_counts.get(ag, 0) if ag else 0
        a["agencyGroupCount"] = cnt
        a["agencyClickable"] = cnt >= 2

    artists.sort(key=lambda a: (a["cat"], -a["count"], a.get("reading") or a["name"]))

    compact_js = build_compact_data_js(artists)
    atomic_write_json(MASTER_JSON_PATH, artists)
    atomic_write_text(DATA_JS_PATH, compact_js + "\n")
    assets_data_js = os.path.join(BASE_DIR, "assets", "data.js")
    if os.path.isdir(os.path.dirname(assets_data_js)):
        atomic_write_text(assets_data_js, compact_js + "\n")
    update_standalone_html_if_present(STANDALONE_HTML_PATH, compact_js)
    update_api_artists_index_if_present(artists)




# =========================================================================
# MUGEN2 PLAYLIST DELETION, HIDING, & RESTORATION ENGINE (v53)
# =========================================================================
MISSING_STREAK_TO_HIDE = 2


def load_mugen2_state(path: str, artists: list[dict] | None = None) -> dict:
    default_state = {
        "schemaVersion": 1,
        "mugen2PlaylistId": None,
        "mugen1PlaylistIds": [],
        "lastSuccessfulMugen2SyncAt": None,
        "lastMugen2VideoCount": 0,
        "knownVideoCatalog": {},
        "videoMap": {},
        "unmappedMugen2Videos": {},
        "songHistory": {},
        "deletionHistory": [],
    }
    if os.path.exists(path):
        try:
            loaded = load_json_strict(path)
            if isinstance(loaded, dict):
                merged = dict(default_state)
                merged.update(loaded)
                for dict_key in ("knownVideoCatalog", "videoMap", "unmappedMugen2Videos", "songHistory"):
                    if not isinstance(merged.get(dict_key), dict):
                        merged[dict_key] = {}
                if not isinstance(merged.get("deletionHistory"), list):
                    merged["deletionHistory"] = []
                return merged
        except Exception as e:
            safe_print(f"[WARN] Could not parse mugen2_state.json, initializing fresh state: {e}")

    # Seed knownVideoCatalog from artists_master.json topLinks/topSongs if available
    if artists:
        catalog = default_state["knownVideoCatalog"]
        for a in artists:
            aid = a.get("aid") or ""
            name = a.get("name") or ""
            songs = a.get("songs") or []
            norm_to_song = {normalize_text_key(re.sub(r"\s*\(cover\)\s*$", "", s, flags=re.I)): s for s in songs if s}
            for idx, (ts, lk) in enumerate(zip(a.get("topSongs") or [], a.get("topLinks") or [])):
                if lk and isinstance(lk, str) and len(lk.strip()) == 11:
                    vid = lk.strip()
                    ns = normalize_text_key(re.sub(r"\s*\(cover\)\s*$", "", str(ts), flags=re.I))
                    if ns in norm_to_song:
                        catalog[vid] = {
                            "aid": aid,
                            "artistName": name,
                            "songTitle": norm_to_song[ns],
                            "songType": "orig",
                            "source": "initial_top_links",
                            "confidence": 1.0,
                        }
    return default_state


def identify_mugen2_playlist_id(playlist_ids: list[str], api_key: str) -> tuple[str | None, list[str]]:
    """
    Identifies which playlist is "無限2" (the sole monitored playlist for additions, deletions, and restorations)
    and which playlist(s) are "無限" (fixed baseline data, never monitored for additions or deletions).
    1. Checks `YOUTUBE_MUGEN2_PLAYLIST_ID` env var first.
    2. If 1 playlist ID is provided, treats it as "無限2".
    3. If >=2 playlist IDs are provided, queries YouTube `playlists.list` snippet.title to find "無限2" (or falls back to the 2nd playlist ID).
    """
    explicit_m2 = os.environ.get("YOUTUBE_MUGEN2_PLAYLIST_ID", "").strip()
    if explicit_m2:
        others = [p for p in playlist_ids if p != explicit_m2]
        return explicit_m2, others

    if not playlist_ids:
        return None, []
    if len(playlist_ids) == 1:
        return playlist_ids[0], []

    if api_key:
        try:
            params = {
                "part": "snippet",
                "id": ",".join(playlist_ids[:50]),
                "key": api_key,
            }
            url = "https://www.googleapis.com/youtube/v3/playlists?" + urllib.parse.urlencode(params)
            data = http_get_json(url)
            for item in data.get("items", []):
                pid = (item.get("id") or "").strip()
                title = unicodedata.normalize("NFKC", ((item.get("snippet") or {}).get("title") or "")).lower()
                if pid in playlist_ids and ("無限2" in title or "無限 2" in title or "mugen2" in title or "mugen 2" in title):
                    others = [p for p in playlist_ids if p != pid]
                    return pid, others
        except Exception as e:
            safe_print(f"[INFO] Could not query playlist titles ({e}); using 2nd playlist ID as 無限2.", [api_key])

    # Default convention: 1st is "無限" (fixed), 2nd (last) is "無限2" (monitored)
    return playlist_ids[-1], playlist_ids[:-1]


def _extract_video_targets(entry: dict) -> list[dict]:
    if not isinstance(entry, dict):
        return []
    targets = []
    seen = set()
    raw_targets = entry.get("targets")
    if isinstance(raw_targets, list):
        for t in raw_targets:
            if isinstance(t, dict) and t.get("aid") and t.get("songTitle"):
                key = (str(t["aid"]), normalize_text_key(t["songTitle"]))
                if key not in seen:
                    seen.add(key)
                    targets.append({
                        "aid": str(t["aid"]),
                        "artistName": str(t.get("artistName") or ""),
                        "songTitle": str(t["songTitle"]),
                        "songType": "cover" if t.get("songType") == "cover" else "orig",
                    })
    if entry.get("aid") and entry.get("songTitle"):
        key = (str(entry["aid"]), normalize_text_key(entry["songTitle"]))
        if key not in seen:
            seen.add(key)
            targets.append({
                "aid": str(entry["aid"]),
                "artistName": str(entry.get("artistName") or ""),
                "songTitle": str(entry["songTitle"]),
                "songType": "cover" if entry.get("songType") == "cover" else "orig",
            })
    return targets


def register_mugen2_video_mapping(
    mugen2_state: dict,
    vid: str,
    artist: dict,
    song_title: str,
    song_type: str = "orig",
    source: str = "auto_sync",
    confidence: float = 1.0,
    now_iso: str = "",
) -> None:
    if not vid or not artist or not song_title:
        return
    aid = artist.get("aid") or ensure_artist_stable_aid(artist)
    canonical_song = find_canonical_song_in_artist(artist, song_title) or song_title.strip()
    if not canonical_song:
        return
    norm_type = "cover" if song_type == "cover" else "orig"

    vmap = mugen2_state.setdefault("videoMap", {})
    existing_entry = vmap.get(vid) if isinstance(vmap.get(vid), dict) else {}
    targets = _extract_video_targets(existing_entry)
    t_key = (aid, normalize_text_key(canonical_song))
    updated_targets = []
    found_target = False
    for t in targets:
        if (t["aid"], normalize_text_key(t["songTitle"])) == t_key:
            updated_targets.append({
                "aid": aid,
                "artistName": artist["name"],
                "songTitle": canonical_song,
                "songType": norm_type,
            })
            found_target = True
        else:
            updated_targets.append(t)
    if not found_target:
        updated_targets.append({
            "aid": aid,
            "artistName": artist["name"],
            "songTitle": canonical_song,
            "songType": norm_type,
        })

    primary = updated_targets[0]
    vmap[vid] = {
        "aid": primary["aid"],
        "artistName": primary["artistName"],
        "songTitle": primary["songTitle"],
        "songType": primary["songType"],
        "targets": updated_targets,
        "source": existing_entry.get("source") or source,
        "confidence": confidence,
        "inMugen2": True,
        "everInMugen2": True,
        "missingStreak": 0,
        "firstSeenInMugen2At": existing_entry.get("firstSeenInMugen2At") or now_iso,
        "lastSeenInMugen2At": now_iso,
    }

    catalog = mugen2_state.setdefault("knownVideoCatalog", {})
    existing_cat = catalog.get(vid) if isinstance(catalog.get(vid), dict) else {}
    cat_targets = _extract_video_targets(existing_cat)
    if not any((t["aid"], normalize_text_key(t["songTitle"])) == t_key for t in cat_targets):
        cat_targets.append({
            "aid": aid,
            "artistName": artist["name"],
            "songTitle": canonical_song,
            "songType": norm_type,
        })
    cat_primary = cat_targets[0]
    catalog[vid] = {
        "aid": cat_primary["aid"],
        "artistName": cat_primary["artistName"],
        "songTitle": cat_primary["songTitle"],
        "songType": cat_primary["songType"],
        "targets": cat_targets,
        "source": source,
        "confidence": confidence,
    }
    mugen2_state.setdefault("unmappedMugen2Videos", {}).pop(vid, None)

    song_key = f"{aid}\t{canonical_song}"
    shist = mugen2_state.setdefault("songHistory", {})
    s_entry = shist.get(song_key) or {
        "aid": aid,
        "artistName": artist["name"],
        "songTitle": canonical_song,
        "everInMugen2": True,
        "activeVideoIds": [],
        "missingVideoIds": [],
        "isHidden": False,
        "hiddenAt": None,
        "restoredAt": None,
    }
    s_entry["everInMugen2"] = True
    s_entry["artistName"] = artist["name"]
    s_entry["songTitle"] = canonical_song
    if vid not in s_entry["activeVideoIds"]:
        s_entry["activeVideoIds"].append(vid)
    if vid in s_entry.get("missingVideoIds", []):
        s_entry["missingVideoIds"].remove(vid)
    shist[song_key] = s_entry


def match_initial_video_to_registered_song(vmeta: dict, artists: list[dict]) -> tuple[dict | None, str | None]:
    """
    Strictly and deterministically matches an initial YouTube video's metadata (title, channelId, channelTitle, description)
    to a unique (artist, songTitle) already registered in `artists_master.json`.
    Returns (matched_artist, canonical_song_title) ONLY when both the artist and the song are unambiguously identified.
    Never guesses by song title alone (prevents false matches on same-title songs or covers by other artists).
    """
    raw_title = vmeta.get("title") or ""
    raw_channel = vmeta.get("channelTitle") or ""
    raw_desc = vmeta.get("description") or ""
    channel_id = (vmeta.get("channelId") or "").strip()
    if not raw_title:
        return None, None

    norm_title = normalize_text_key(raw_title)
    norm_channel = normalize_text_key(raw_channel)
    norm_combined = normalize_text_key(f"{raw_title} {raw_channel} {raw_desc[:300]}")

    # Strip common decorations from video title for exact song title comparison
    cleaned_title = re.sub(
        r"【[^】]*】|\[[^\]]*\]|\([^\)]*(?:cover|歌ってみた|mv|official|video|ver|feat)[^\)]*\)|"
        r"（[^）]*(?:cover|歌ってみた|mv|official|video|ver|feat)[^）]*）",
        " ",
        raw_title,
        flags=re.IGNORECASE,
    )
    cleaned_title_norm = normalize_text_key(cleaned_title)

    candidates = []

    for a in artists:
        songs = a.get("songs")
        if not isinstance(songs, list) or not songs:
            continue

        # 1. Verify artist identity in video metadata (channelId match OR explicit artist name/alias in title/channel)
        yt_url = a.get("ytChannelUrl") or ""
        channel_matched = bool(channel_id and len(channel_id) > 5 and channel_id in yt_url)

        known_names = [a.get("name") or ""] + list(a.get("al") or [])
        known_norms = [normalize_text_key(n) for n in known_names if n and len(normalize_text_key(n)) >= 2]
        if not known_norms and a.get("name"):
            known_norms = [normalize_text_key(a["name"])]

        name_in_title_or_ch = any(kn and (kn in norm_title or kn in norm_channel) for kn in known_norms)
        name_in_desc = any(kn and len(kn) >= 3 and kn in norm_combined for kn in known_norms)

        if not (channel_matched or name_in_title_or_ch or name_in_desc):
            continue

        artist_score = 3 if (channel_matched and name_in_title_or_ch) else (2 if (channel_matched or name_in_title_or_ch) else 1)

        # 2. Check which registered song(s) of this artist appear in the video title
        matched_songs_for_artist = []
        for s in songs:
            s_clean = re.sub(r"\s*\(cover\)\s*$", "", str(s), flags=re.IGNORECASE).strip()
            s_norm = normalize_text_key(s_clean)
            if not s_norm:
                continue
            if s_norm == cleaned_title_norm or s_norm == norm_title:
                matched_songs_for_artist.append((s, len(s_norm) + 100))
            elif len(s_norm) >= 2 and s_norm in norm_title:
                matched_songs_for_artist.append((s, len(s_norm)))

        if not matched_songs_for_artist:
            continue

        # Pick the longest (most specific) song match for this artist; if tied between 2 distinct songs, skip as ambiguous
        matched_songs_for_artist.sort(key=lambda x: -x[1])
        if len(matched_songs_for_artist) >= 2 and matched_songs_for_artist[0][1] == matched_songs_for_artist[1][1]:
            if normalize_text_key(matched_songs_for_artist[0][0]) != normalize_text_key(matched_songs_for_artist[1][0]):
                continue

        best_song, song_specificity = matched_songs_for_artist[0]
        candidates.append((artist_score, song_specificity, a, best_song))

    if not candidates:
        return None, None

    candidates.sort(key=lambda x: (-x[0], -x[1]))
    if len(candidates) >= 2:
        top_c = candidates[0]
        second_c = candidates[1]
        # If two different artists tie on artist_score and song_specificity, treat as ambiguous (e.g. duet/collab) and do not guess
        if top_c[0] == second_c[0] and top_c[1] == second_c[1] and top_c[2].get("aid") != second_c[2].get("aid"):
            return None, None

    best_artist = candidates[0][2]
    best_song_title = candidates[0][3]
    return best_artist, best_song_title


def reconcile_mugen2_deletions_and_restorations(
    current_mugen2_vids: list[str],
    artists: list[dict],
    mugen2_state: dict,
    processed_ids: set[str],
    yt_key: str,
    now_iso: str,
    today_str: str,
) -> tuple[bool, list[dict]]:
    """
    Executes the complete Mugen2 synchronization rules:
    - Automatically builds video->(artist, song) correspondences for initial videos in "無限2"
    - Restores (un-hides) any previously hidden song whose video is present/re-added in "無限2"
    - Increments `missingStreak` for videos missing from "無限2"
    - Marks a video as `inMugen2 = False` only after 2 consecutive normal syncs (`missingStreak >= 2`)
    - Hides a song (`mugen2HiddenSongs`) only when `everInMugen2 == True` AND all mapped videos for that song in "無限2" have `inMugen2 == False`
    - Protects against abnormal playlist count drops or API errors
    Returns (data_changed, event_logs).
    """
    event_logs = []
    data_changed = False

    prev_count = int(mugen2_state.get("lastMugen2VideoCount") or 0)
    cur_count = len(current_mugen2_vids)

    # Safety circuit breaker: if "無限2" previously had videos and suddenly drops by >50 videos (and >25%) in a single run,
    # skip missing-streak / deletion processing to guard against partial YouTube API responses.
    abnormal_drop = False
    if prev_count >= 20 and cur_count == 0:
        abnormal_drop = True
    elif prev_count >= 50 and (prev_count - cur_count) > max(50, int(prev_count * 0.25)):
        abnormal_drop = True

    if abnormal_drop:
        safe_print(
            f"[MUGEN2 SAFEGUARD] Abnormal drop in 無限2 video count detected (previous={prev_count}, current={cur_count}). "
            "Skipping deletion/missing-streak evaluation for safety."
        )

    aid_to_artist = {}
    name_to_artist = {}
    for a in artists:
        aid = ensure_artist_stable_aid(a)
        aid_to_artist[aid] = a
        if a.get("name"):
            name_to_artist[a["name"]] = a

    vmap = mugen2_state.setdefault("videoMap", {})
    catalog = mugen2_state.setdefault("knownVideoCatalog", {})
    unmapped = mugen2_state.setdefault("unmappedMugen2Videos", {})
    shist = mugen2_state.setdefault("songHistory", {})
    del_hist = mugen2_state.setdefault("deletionHistory", [])

    current_mugen2_set = set(current_mugen2_vids)

    # Step 1: Promote any current Mugen2 video that is already in knownVideoCatalog into videoMap,
    # and identify existing/initial Mugen2 videos that need one-time metadata matching.
    unmapped_initial_vids = []
    for vid in current_mugen2_vids:
        if vid in vmap:
            continue
        if vid in catalog:
            cat_info = catalog[vid]
            cat_targets = _extract_video_targets(cat_info)
            registered_any = False
            for ct in cat_targets:
                target_a = aid_to_artist.get(ct.get("aid")) or name_to_artist.get(ct.get("artistName"))
                if target_a:
                    register_mugen2_video_mapping(
                        mugen2_state=mugen2_state,
                        vid=vid,
                        artist=target_a,
                        song_title=ct["songTitle"],
                        song_type=ct.get("songType", cat_info.get("songType", "orig")),
                        source=cat_info.get("source", "catalog"),
                        confidence=1.0,
                        now_iso=now_iso,
                    )
                    registered_any = True
            if registered_any:
                processed_ids.add(vid)
                continue
        if vid in processed_ids and vid not in unmapped:
            unmapped_initial_vids.append(vid)

    # Step 2: For initial registered videos in Mugen2 not yet in videoMap, fetch metadata and run strict deterministic matching
    if unmapped_initial_vids and yt_key:
        max_map_batch = int(os.environ.get("MAX_BASELINE_MAP_PER_RUN", "1000"))
        to_fetch = unmapped_initial_vids[:max_map_batch]
        try:
            meta_list = fetch_videos_metadata(to_fetch, yt_key)
            fetched_by_id = {m["videoId"]: m for m in meta_list if m.get("videoId")}
            mapped_now = 0
            for vid in to_fetch:
                vmeta = fetched_by_id.get(vid)
                if not vmeta:
                    unmapped[vid] = {"reason": "metadata_unavailable", "checkedAt": now_iso}
                    continue
                matched_a, matched_song = match_initial_video_to_registered_song(vmeta, artists)
                if matched_a and matched_song:
                    register_mugen2_video_mapping(
                        mugen2_state=mugen2_state,
                        vid=vid,
                        artist=matched_a,
                        song_title=matched_song,
                        song_type="orig",
                        source="baseline_exact_match",
                        confidence=1.0,
                        now_iso=now_iso,
                    )
                    mapped_now += 1
                else:
                    unmapped[vid] = {
                        "title": vmeta.get("title", ""),
                        "channelTitle": vmeta.get("channelTitle", ""),
                        "reason": "ambiguous_or_unmatched",
                        "checkedAt": now_iso,
                    }
            if mapped_now > 0:
                safe_print(f"[MUGEN2 MAP] Automatically linked {mapped_now} initial video(s) in 無限2 to registered songs.")
        except Exception as e:
            safe_print(f"[WARN] Could not fetch metadata for baseline Mugen2 mapping: {e}", [yt_key])

    # Step 3: Update presence & missingStreak for all tracked Mugen2 videos
    for vid, info in list(vmap.items()):
        if not isinstance(info, dict):
            continue
        if vid in current_mugen2_set:
            info["inMugen2"] = True
            info["everInMugen2"] = True
            info["missingStreak"] = 0
            info["lastSeenInMugen2At"] = now_iso
            processed_ids.add(vid)
        else:
            if abnormal_drop:
                continue
            if info.get("everInMugen2") is not False:
                streak = int(info.get("missingStreak") or 0) + 1
                info["missingStreak"] = streak
                if streak >= MISSING_STREAK_TO_HIDE:
                    info["inMugen2"] = False
                else:
                    # 1st missing sync: keep inMugen2=True until confirmed on 2nd consecutive sync!
                    info["inMugen2"] = True

    # Step 4: Group tracked Mugen2 videos by (aid, normalized_song_title) across all targets of each video
    songs_by_norm_key = {}
    for vid, info in vmap.items():
        if not isinstance(info, dict) or info.get("everInMugen2") is False:
            continue
        targets = _extract_video_targets(info)
        for tgt in targets:
            aid = tgt.get("aid") or ""
            s_title = tgt.get("songTitle") or ""
            if not aid or not s_title:
                continue
            target_a = aid_to_artist.get(aid) or name_to_artist.get(tgt.get("artistName") or "")
            if not target_a:
                continue
            canonical_song = find_canonical_song_in_artist(target_a, s_title) or s_title
            nkey = f"{target_a['aid']}\t{normalize_text_key(canonical_song)}"
            bucket = songs_by_norm_key.setdefault(nkey, {
                "artist": target_a,
                "songTitle": canonical_song,
                "activeVids": [],
                "missingVids": [],
            })
            if info.get("inMugen2") is True:
                if vid not in bucket["activeVids"]:
                    bucket["activeVids"].append(vid)
            else:
                if vid not in bucket["missingVids"]:
                    bucket["missingVids"].append(vid)

    for nkey, bucket in songs_by_norm_key.items():
        target_a = bucket["artist"]
        aid = target_a["aid"]
        song_title = bucket["songTitle"]
        active_vids = bucket["activeVids"]
        missing_vids = bucket["missingVids"]
        song_key = f"{aid}\t{song_title}"

        s_entry = shist.get(song_key) or {
            "aid": aid,
            "artistName": target_a["name"],
            "songTitle": song_title,
            "everInMugen2": True,
            "activeVideoIds": [],
            "missingVideoIds": [],
            "isHidden": False,
            "hiddenAt": None,
            "restoredAt": None,
        }
        s_entry["everInMugen2"] = True
        s_entry["activeVideoIds"] = active_vids
        s_entry["missingVideoIds"] = missing_vids

        if len(active_vids) >= 1:
            # At least 1 video for this song is active in 無限2 -> ensure song is visible (restore if it was hidden!)
            was_unhidden = unhide_song_on_artist(target_a, song_title)
            if was_unhidden or s_entry.get("isHidden") is True:
                s_entry["isHidden"] = False
                s_entry["restoredAt"] = now_iso
                data_changed = True
                log_item = {
                    "date": today_str,
                    "timestamp": now_iso,
                    "action": "restored_by_mugen2_readd",
                    "aid": aid,
                    "artist": target_a["name"],
                    "song": song_title,
                    "videoIds": active_vids,
                }
                del_hist.insert(0, log_item)
                event_logs.append(log_item)
                safe_print(f"[MUGEN2 RESTORE] Restored '{song_title}' ({target_a['name']}) via video(s) {active_vids}.")
        else:
            # 0 active videos remain in 無限2 (all mapped videos missing for >= 2 consecutive normal syncs) -> hide song!
            if not abnormal_drop and len(missing_vids) >= 1:
                was_hidden = hide_song_on_artist(target_a, song_title)
                if was_hidden or s_entry.get("isHidden") is not True:
                    s_entry["isHidden"] = True
                    s_entry["hiddenAt"] = now_iso
                    data_changed = True
                    log_item = {
                        "date": today_str,
                        "timestamp": now_iso,
                        "action": "hidden_by_mugen2_deletion",
                        "aid": aid,
                        "artist": target_a["name"],
                        "song": song_title,
                        "videoIds": missing_vids,
                    }
                    del_hist.insert(0, log_item)
                    event_logs.append(log_item)
                    safe_print(f"[MUGEN2 HIDE] Hidden '{song_title}' ({target_a['name']}) after 2 consecutive syncs missing video(s) {missing_vids}.")

        shist[song_key] = s_entry

    mugen2_state["deletionHistory"] = del_hist[:500]
    if not abnormal_drop:
        mugen2_state["lastSuccessfulMugen2SyncAt"] = now_iso
        mugen2_state["lastMugen2VideoCount"] = cur_count

    return data_changed, event_logs


def run_sync(
    mode: str = "sync",
    force_reinit: bool = False,
    youtube_api_key: str | None = None,
    gemini_api_key: str | None = None,
    playlist_ids_raw: str | None = None,
    preferred_gemini_model: str | None = None,
) -> int:
    yt_key = (youtube_api_key if youtube_api_key is not None else os.environ.get("YOUTUBE_API_KEY", "")).strip()
    gm_key = (gemini_api_key if gemini_api_key is not None else os.environ.get("GEMINI_API_KEY", "")).strip()
    pl_raw = (playlist_ids_raw if playlist_ids_raw is not None else os.environ.get("YOUTUBE_PLAYLIST_IDS", "")).strip()
    pref_model = normalize_model_name(
        preferred_gemini_model if preferred_gemini_model is not None else os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)
    )
    playlist_ids = parse_playlist_ids(pl_raw)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Mode: verify_gemini (lightweight 1-request generateContent check)
    if mode == "verify_gemini":
        ok, active_model = verify_gemini_connection(gm_key, pref_model)
        return 0 if ok else 1

    # Load production artists strictly
    try:
        artists = load_json_strict(MASTER_JSON_PATH)
        if not isinstance(artists, list) or len(artists) < MIN_EXPECTED_ARTISTS:
            safe_print(f"[ERROR] artists_master.json is invalid or has too few entries ({len(artists) if isinstance(artists, list) else 'N/A'}). Aborting.")
            return 1
    except Exception as e:
        safe_print(f"[ERROR] Could not load artists_master.json: {e}")
        return 1

    # Load pending_review.json strictly if present
    if os.path.exists(PENDING_JSON_PATH):
        try:
            pending_list = load_json_strict(PENDING_JSON_PATH)
            if not isinstance(pending_list, list):
                raise ValueError("pending_review.json is not a JSON array")
        except Exception as e:
            safe_print(f"[ERROR] pending_review.json is corrupted ({e}). Aborting to prevent data loss.")
            return 1
    else:
        pending_list = []

    sync_state, state_corrupted = load_sync_state(SYNC_STATE_JSON_PATH)
    processed_list, processed_corrupted = load_processed_videos(PROCESSED_JSON_PATH)
    processed_ids = set(processed_list)

    # =========================================================================
    # MODE 1: EXPLICIT BASELINE INITIALIZATION (`--init` or `SYNC_MODE=init`)
    # =========================================================================
    if mode == "init":
        if state_corrupted:
            safe_print("[ERROR] sync_state.json is corrupted. Please inspect data/sync_state.json before running init.")
            return 1

        if sync_state.get("initialized") is True and not force_reinit:
            safe_print(
                f"[INIT BLOCKED] Baseline initialization was already completed at {sync_state.get('initializedAt')} "
                f"(recorded baselineVideoCount={sync_state.get('baselineVideoCount')}). "
                "To prevent accidental re-initialization, this operation was skipped. "
                "Use regular 'sync' mode for daily updates."
            )
            return 0

        if not yt_key or not playlist_ids:
            safe_print("[ERROR] YOUTUBE_API_KEY and YOUTUBE_PLAYLIST_IDS are required for baseline initialization.")
            return 1

        safe_print(f"[INIT] Starting baseline initialization across {len(playlist_ids)} playlist(s)...")
        fetched_playlist_vids = []
        fetched_seen = set()
        try:
            for pid in playlist_ids:
                vids = fetch_playlist_video_ids(pid, yt_key)
                safe_print(f"[INIT] Fetched {len(vids)} video ID(s) from playlist '{pid}'.")
                for v in vids:
                    if v not in fetched_seen:
                        fetched_seen.add(v)
                        fetched_playlist_vids.append(v)
        except Exception as e:
            safe_print(f"[ERROR] Failed to fetch playlist video IDs during initialization: {e}", [yt_key])
            return 1

        # Record all playlist video IDs + existing topLinks + pending videoIds
        all_recorded_ids = set(processed_ids) | set(fetched_playlist_vids)
        for a in artists:
            for lk in a.get("topLinks") or []:
                if lk and len(str(lk).strip()) == 11:
                    all_recorded_ids.add(str(lk).strip())
        for p in pending_list:
            if isinstance(p, dict) and p.get("videoId"):
                all_recorded_ids.add(str(p["videoId"]).strip())

        atomic_write_json(PROCESSED_JSON_PATH, sorted(all_recorded_ids))
        new_state = {
            "schemaVersion": 2,
            "initialized": True,
            "initializedAt": now_iso,
            "baselineVideoCount": len(fetched_playlist_vids),
            "totalTrackedCount": len(all_recorded_ids),
            "playlistIds": playlist_ids,
            "lastSyncAt": now_iso,
        }
        atomic_write_json(SYNC_STATE_JSON_PATH, new_state)

        # Log initialization event in auto_sync_log.json without touching artists_master.json, data.js, or pending_review.json
        init_log_entry = {
            "date": today_str,
            "timestamp": now_iso,
            "action": "baseline_initialized",
            "playlistVideoCount": len(fetched_playlist_vids),
            "totalTrackedIds": len(all_recorded_ids),
            "aiAnalyzedCount": 0,
            "productionRegisteredCount": 0,
        }
        existing_logs = []
        if os.path.exists(SYNC_LOG_JSON_PATH):
            try:
                loaded_logs = load_json_strict(SYNC_LOG_JSON_PATH)
                if isinstance(loaded_logs, list):
                    existing_logs = loaded_logs
            except Exception:
                existing_logs = []
        atomic_write_json(SYNC_LOG_JSON_PATH, [init_log_entry] + existing_logs[:499])

        safe_print("==================================================================")
        safe_print("[INIT] Baseline initialization completed successfully!")
        safe_print(f"[INIT] Recorded playlist video IDs: {len(fetched_playlist_vids)} (total tracked IDs: {len(all_recorded_ids)})")
        safe_print("[INIT] AI analyzed: 0 | Production registered: 0 | Pending review added: 0")
        safe_print("==================================================================")
        return 0

    # =========================================================================
    # MODE 2: NORMAL INCREMENTAL SYNC (`mode == "sync"`)
    # =========================================================================
    # Step 1: Perform strict integrity check on `sync_state.json` and `processed_videos.json`
    # FIRST — BEFORE applying any approved pending items or touching any production data!
    if state_corrupted:
        safe_print(
            "[ERROR] State integrity check failed: data/sync_state.json is corrupted! "
            "Aborting immediately without modifying any production data."
        )
        return 1

    if sync_state.get("initialized") is not True:
        if processed_corrupted:
            safe_print(
                "[ERROR] State integrity check failed: data/processed_videos.json is missing or corrupted while uninitialized! "
                "Aborting immediately without modifying any production data."
            )
            return 1
        safe_print(
            "[SAFEGUARD] Baseline initialization has not been executed yet (sync_state.json: initialized=false). "
            "Aborting sync without modifying any production data so existing playlist videos are NOT analyzed as new. "
            "Please run initialization once (--init or GitHub Actions workflow mode 'init')."
        )
        return 0

    baseline_count = int(sync_state.get("baselineVideoCount") or 0)
    if processed_corrupted or len(processed_ids) == 0:
        safe_print(
            f"[ERROR] State integrity check failed: sync_state is initialized (baselineVideoCount={baseline_count}), "
            "but data/processed_videos.json is missing, empty, or corrupted! "
            "Aborting immediately without modifying any production data to prevent mass re-registration."
        )
        return 1

    if baseline_count >= 100 and len(processed_ids) < int(baseline_count * 0.5):
        safe_print(
            f"[ERROR] State integrity check failed: processed_videos.json has only {len(processed_ids)} ID(s), "
            f"which is abnormally smaller than baselineVideoCount ({baseline_count}). "
            "Aborting immediately without modifying any production data."
        )
        return 1

    # Sync optional `data/recommended_artists.json` flags into artists if present
    rec_json_path = os.path.join(BASE_DIR, "data", "recommended_artists.json")
    if os.path.exists(rec_json_path):
        try:
            rec_names = load_json_strict(rec_json_path)
            if isinstance(rec_names, list):
                rec_set = {str(x).strip() for x in rec_names if isinstance(x, str) and str(x).strip()}
                for a in artists:
                    if a["name"] in rec_set:
                        a["rec"] = True
                    elif "rec" in a and rec_set:
                        a.pop("rec", None)
        except Exception as e:
            safe_print(f"[WARN] Could not parse data/recommended_artists.json: {e}")

    # Step 2: Load mugen2_state and apply curated resolutions and user-approved items in `data/pending_review.json`,
    # even if there are 0 new playlist videos today!
    mugen2_state = load_mugen2_state(MUGEN2_STATE_JSON_PATH, artists)
    curated_changed, curated_logs = apply_curated_renames_and_additions(
        artists=artists,
        pending_list=pending_list,
        processed_ids=processed_ids,
        mugen2_state=mugen2_state,
        now_iso=now_iso,
        today_str=today_str,
    )
    pending_before_count = len(pending_list)
    pending_list, approved_logs = apply_approved_pending_items(
        artists=artists,
        pending_list=pending_list,
        processed_ids=processed_ids,
        today_str=today_str,
        mugen2_state=mugen2_state,
        now_iso=now_iso,
    )
    added_logs = list(curated_logs) + list(approved_logs)

    if curated_changed or approved_logs or len(pending_list) != pending_before_count:
        recompute_and_save_production_data(artists)
        atomic_write_json(MUGEN2_STATE_JSON_PATH, mugen2_state)
        atomic_write_json(PENDING_JSON_PATH, pending_list)
        atomic_write_text(PENDING_MD_PATH, render_pending_markdown(pending_list))
        atomic_write_json(PROCESSED_JSON_PATH, sorted(processed_ids))
        if added_logs:
            existing_logs = []
            if os.path.exists(SYNC_LOG_JSON_PATH):
                try:
                    loaded_logs = load_json_strict(SYNC_LOG_JSON_PATH)
                    if isinstance(loaded_logs, list):
                        existing_logs = loaded_logs
                except Exception:
                    existing_logs = []
            existing_vids_in_log = {
                (lg.get("videoId"), lg.get("aid")) for lg in existing_logs if isinstance(lg, dict)
            }
            dedup_new_logs = [
                lg for lg in added_logs
                if (lg.get("videoId"), lg.get("aid")) not in existing_vids_in_log
            ]
            if dedup_new_logs:
                atomic_write_json(SYNC_LOG_JSON_PATH, dedup_new_logs + existing_logs[:499])
        safe_print(f"[PENDING] Processed {len(added_logs)} curated/approved item(s).")

    # Also ensure currently pending videoIds are not re-analyzed while awaiting user review
    pending_vids = {str(p.get("videoId")).strip() for p in pending_list if isinstance(p, dict) and p.get("videoId")}

    if not yt_key or not playlist_ids:
        safe_print("[INFO] YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_IDS not set. Skipping playlist fetch.")
        return 0

    # Step 3: Identify "無限2" (sole monitored playlist for add/delete/restore; "無限" is fixed data)
    mugen2_pid, mugen1_pids = identify_mugen2_playlist_id(playlist_ids, yt_key)
    mugen2_state["mugen2PlaylistId"] = mugen2_pid
    mugen2_state["mugen1PlaylistIds"] = mugen1_pids

    if not mugen2_pid:
        safe_print("[INFO] No 無限2 playlist ID configured. Skipping playlist fetch.")
        return 0

    try:
        mugen2_vids = fetch_playlist_video_ids(mugen2_pid, yt_key)
        safe_print(f"[SYNC] Fetched {len(mugen2_vids)} video(s) from 無限2 playlist '{mugen2_pid}'.")
    except Exception as e:
        safe_print(f"[ERROR] Failed to fetch 無限2 playlist from YouTube API: {e}", [yt_key])
        return 1

    # Reconcile 無限2 deletions (2-consecutive-sync rule), multi-video reference counts, and re-additions/restorations
    mugen2_changed, mugen2_logs = reconcile_mugen2_deletions_and_restorations(
        current_mugen2_vids=mugen2_vids,
        artists=artists,
        mugen2_state=mugen2_state,
        processed_ids=processed_ids,
        yt_key=yt_key,
        now_iso=now_iso,
        today_str=today_str,
    )
    if mugen2_logs:
        added_logs.extend(mugen2_logs)

    # Filter to strictly NEW video IDs in 無限2 not yet in processed_ids
    new_vids = []
    new_seen = set()
    for v in mugen2_vids:
        if v not in processed_ids and v not in pending_vids and v not in new_seen:
            new_seen.add(v)
            new_vids.append(v)

    if not new_vids:
        if mugen2_changed:
            recompute_and_save_production_data(artists)
            atomic_write_json(PROCESSED_JSON_PATH, sorted(processed_ids))
        atomic_write_json(MUGEN2_STATE_JSON_PATH, mugen2_state)
        sync_state["lastSyncAt"] = now_iso
        atomic_write_json(SYNC_STATE_JSON_PATH, sync_state)
        if added_logs:
            existing_logs = []
            if os.path.exists(SYNC_LOG_JSON_PATH):
                try:
                    loaded = load_json_strict(SYNC_LOG_JSON_PATH)
                    if isinstance(loaded, list):
                        existing_logs = loaded
                except Exception:
                    existing_logs = []
            atomic_write_json(SYNC_LOG_JSON_PATH, added_logs + existing_logs[:499])
        safe_print(
            f"[SYNC] No new unknown videos in 無限2. Gemini API called: 0 times. "
            f"Mugen2 state changes: {len(mugen2_logs)}. Total events logged: {len(added_logs)}."
        )
        return 0

    max_per_run = int(os.environ.get("MAX_NEW_VIDEOS_PER_RUN", "100"))
    if len(new_vids) > max_per_run:
        safe_print(
            f"[ERROR] Safety circuit breaker triggered: Found {len(new_vids)} unrecorded videos, "
            f"which exceeds MAX_NEW_VIDEOS_PER_RUN ({max_per_run}). "
            "Aborting automatic Gemini analysis to protect quota and prevent unintended bulk registration."
        )
        return 1

    if not gm_key:
        safe_print(f"[ERROR] Found {len(new_vids)} new video(s), but GEMINI_API_KEY is not set. Leaving videos unprocessed for next retry.")
        return 1

    safe_print(f"[SYNC] Found {len(new_vids)} new video(s) to analyze.")
    try:
        vid_meta_list = fetch_videos_metadata(new_vids, yt_key)
    except Exception as e:
        safe_print(f"[ERROR] Failed to fetch video metadata from YouTube API: {e}", [yt_key])
        return 1

    meta_by_vid = {m["videoId"]: m for m in vid_meta_list if m.get("videoId")}
    ordered_meta_list = [meta_by_vid[v] for v in new_vids if v in meta_by_vid]

    matcher = MasterArtistMatcher(artists)
    existing_names = [a["name"] for a in artists]

    candidate_models = get_candidate_models(pref_model)
    working_model_cache = {}
    auto_registered_count = 0
    pending_added_count = 0
    had_batch_failure = False

    for i in range(0, len(ordered_meta_list), 15):
        batch = ordered_meta_list[i : i + 15]
        try:
            parsed_list = classify_videos_with_gemini(
                videos=batch,
                existing_names=existing_names,
                api_key=gm_key,
                candidate_models=candidate_models,
                working_model_cache=working_model_cache,
                matcher=matcher,
            )
        except Exception as e:
            safe_print(
                f"[ERROR] Gemini analysis failed on batch starting at index {i}: {e}. "
                "Unprocessed videos will NOT be marked as processed and will be retried on the next run.",
                [gm_key],
            )
            had_batch_failure = True
            break

        parsed_by_vid = {}
        for item in parsed_list:
            if isinstance(item, dict) and item.get("videoId"):
                parsed_by_vid[str(item["videoId"]).strip()] = item

        for vmeta in batch:
            vid = vmeta["videoId"]
            item = parsed_by_vid.get(vid)
            if not item:
                safe_print(f"[WARN] Video '{vid}' was omitted from Gemini response; leaving unprocessed for next retry.")
                had_batch_failure = True
                continue

            if item.get("skip") is True:
                processed_ids.add(vid)
                added_logs.append({
                    "date": today_str,
                    "timestamp": now_iso,
                    "action": "auto_skipped_non_target",
                    "videoId": vid,
                    "rawVideoTitle": vmeta.get("title", ""),
                    "reason": item.get("reason") or "対象外（男性ソロ・インスト等）",
                })
                continue

            artist_name = (item.get("artistName") or "").strip()
            song_title = (item.get("songTitle") or "").strip()
            if song_title in CURATED_SONG_RENAME_MAP:
                song_title = CURATED_SONG_RENAME_MAP[song_title]
            song_type = "cover" if str(item.get("songType") or "").strip().lower() == "cover" else "orig"
            confidence = parse_confidence(item.get("confidence"))

            matched_artists, unmatched_names, is_collab, res_note = extract_and_resolve_vocalists(
                item=item,
                vmeta=vmeta,
                matcher=matcher,
            )
            is_safe, final_reason = evaluate_auto_registration_decision(
                item=item,
                matched_artists=matched_artists,
                unmatched_names=unmatched_names,
                is_collab=is_collab,
                resolution_note=res_note,
                vmeta=vmeta,
                matcher=matcher,
                confidence=confidence,
                threshold=AUTO_APPROVE_CONFIDENCE,
            )

            if is_safe and len(matched_artists) >= 1:
                for target_artist in matched_artists:
                    added = add_song_to_existing_artist(target_artist, song_title, song_type, vid)
                    register_mugen2_video_mapping(
                        mugen2_state=mugen2_state,
                        vid=vid,
                        artist=target_artist,
                        song_title=song_title,
                        song_type=song_type,
                        source="auto_sync",
                        confidence=round(confidence, 3),
                        now_iso=now_iso,
                    )
                    if added:
                        auto_registered_count += 1
                        added_logs.append({
                            "date": today_str,
                            "timestamp": now_iso,
                            "action": "auto_added_song",
                            "registrationType": "newly_added_song",
                            "aid": target_artist.get("aid", ""),
                            "artist": target_artist["name"],
                            "song": song_title,
                            "type": song_type,
                            "confidence": round(confidence, 3),
                            "videoId": vid,
                            "reason": final_reason,
                            "status": "success",
                        })
                    else:
                        added_logs.append({
                            "date": today_str,
                            "timestamp": now_iso,
                            "action": "linked_existing_song_to_mugen2",
                            "registrationType": "linked_existing_song",
                            "aid": target_artist.get("aid", ""),
                            "artist": target_artist["name"],
                            "song": song_title,
                            "type": song_type,
                            "videoId": vid,
                            "reason": final_reason,
                            "status": "success",
                        })
                processed_ids.add(vid)
            else:
                # Add to pending_review.json (never overwrite existing artist metadata if matched_artists is non-empty!)
                if vid not in pending_vids:
                    is_existing_candidate = len(matched_artists) >= 1 and len(unmatched_names) == 0
                    primary_existing = matched_artists[0] if is_existing_candidate else None
                    is_own_ch = bool(item.get("isOwnChannel", True))
                    ch_info = fetch_channel_info(vmeta.get("channelId", ""), yt_key) if (is_own_ch and not primary_existing) else {}
                    ch_url = (
                        primary_existing.get("ytChannelUrl", "")
                        if primary_existing
                        else (f"https://www.youtube.com/channel/{ch_info['channelId']}" if ch_info.get("channelId") else "")
                    )
                    raw_role = (
                        primary_existing.get("role", "歌い手")
                        if primary_existing
                        else (item.get("role") or ("歌い手" if song_type == "cover" else "歌手")).strip()
                    )
                    # Ensure reason is consistent with isNewArtist
                    ai_reason = (item.get("reason") or "").strip()
                    if is_existing_candidate:
                        # Strip contradictory "新規名義" wording from AI reason when Python matched an existing artist
                        ai_reason = re.sub(r"新規名義[^。、]*[。、]?", "", ai_reason).strip()
                    reason_text = final_reason or ai_reason or "要確認"
                    if ai_reason and ai_reason not in reason_text:
                        reason_text = f"{reason_text} ({ai_reason})"

                    disp_artist_name = (
                        "、".join(a["name"] for a in matched_artists)
                        if is_existing_candidate
                        else (artist_name or "要確認名義")
                    )

                    pending_list.append({
                        "approved": False,
                        "skip": False,
                        "date": today_str,
                        "isNewArtist": not is_existing_candidate,
                        "confidence": round(confidence, 3),
                        "videoId": vid,
                        "videoUrl": f"https://www.youtube.com/watch?v={vid}",
                        "rawVideoTitle": vmeta.get("title", ""),
                        "rawChannelTitle": vmeta.get("channelTitle", ""),
                        "artistName": disp_artist_name,
                        "vocalists": [a["name"] for a in matched_artists] if is_existing_candidate else (item.get("vocalists") or ([artist_name] if artist_name else [])),
                        "songTitle": song_title or vmeta.get("title", "要確認曲名"),
                        "songType": song_type,
                        "role": raw_role,
                        "groupSubRole": primary_existing.get("groupSubRole", "") if primary_existing else (raw_role if raw_role.startswith("音楽グループ(") else ""),
                        "agency": primary_existing.get("agency", "") if primary_existing else (item.get("agency") or ""),
                        "agencyGroup": primary_existing.get("agencyGroup", "") if primary_existing else (item.get("agency") or ""),
                        "reading": primary_existing.get("reading", "") if primary_existing else (item.get("reading") or artist_name),
                        "kana": primary_existing.get("kana", "") if primary_existing else (item.get("kana") or "")[:1],
                        "alpha": primary_existing.get("alpha", "") if primary_existing else (item.get("alpha") or "")[:1].upper(),
                        "ytChannelUrl": ch_url,
                        "sub": primary_existing.get("sub") if primary_existing else ch_info.get("sub"),
                        "img": primary_existing.get("img", "") if primary_existing else (ch_info.get("avatar") or vmeta.get("thumbnail") or ""),
                        "profileBio": primary_existing.get("profileBio", "") if primary_existing else (item.get("profileBio") or ""),
                        "reason": reason_text,
                    })
                    pending_vids.add(vid)
                    pending_added_count += 1
                processed_ids.add(vid)

        if i + 15 < len(ordered_meta_list):
            time.sleep(1)

    # Save all updated states atomically
    recompute_and_save_production_data(artists)
    atomic_write_json(MUGEN2_STATE_JSON_PATH, mugen2_state)
    atomic_write_json(PROCESSED_JSON_PATH, sorted(processed_ids))
    atomic_write_json(PENDING_JSON_PATH, pending_list)
    atomic_write_text(PENDING_MD_PATH, render_pending_markdown(pending_list))

    sync_state["lastSyncAt"] = now_iso
    if working_model_cache.get("model"):
        sync_state["lastActiveGeminiModel"] = working_model_cache["model"]
    atomic_write_json(SYNC_STATE_JSON_PATH, sync_state)

    if added_logs:
        existing_logs = []
        if os.path.exists(SYNC_LOG_JSON_PATH):
            try:
                loaded_logs = load_json_strict(SYNC_LOG_JSON_PATH)
                if isinstance(loaded_logs, list):
                    existing_logs = loaded_logs
            except Exception:
                existing_logs = []
        atomic_write_json(SYNC_LOG_JSON_PATH, added_logs + existing_logs[:499])

    safe_print(
        f"[SYNC] Complete. Auto-registered: {auto_registered_count} | "
        f"Added to pending review: {pending_added_count} | "
        f"Total pending items: {len(pending_list)} | "
        f"Active Gemini model: {working_model_cache.get('model', 'none')}"
    )
    return 1 if had_batch_failure else 0


def main() -> None:
    parser = argparse.ArgumentParser(description="YouTube Playlist -> Gemini API Archive Auto-Sync")
    parser.add_argument(
        "--init",
        action="store_true",
        help="Run one-time baseline initialization: record all current playlist video IDs as processed without calling Gemini API.",
    )
    parser.add_argument(
        "--force-reinit",
        action="store_true",
        help="Force re-initialization even if data/sync_state.json is already marked initialized.",
    )
    parser.add_argument(
        "--verify-gemini",
        action="store_true",
        help="Send a single lightweight test request to Gemini API generateContent to verify model availability.",
    )
    parser.add_argument(
        "--mode",
        choices=["sync", "init", "verify_gemini"],
        default="",
        help="Execution mode (can also be set via SYNC_MODE env var).",
    )
    args = parser.parse_args()

    env_mode = os.environ.get("SYNC_MODE", "").strip().lower()
    force_reinit = args.force_reinit or (os.environ.get("FORCE_REINIT", "").strip().lower() == "true")

    if args.init or args.mode == "init" or env_mode == "init":
        mode = "init"
    elif args.verify_gemini or args.mode == "verify_gemini" or env_mode == "verify_gemini":
        mode = "verify_gemini"
    else:
        mode = "sync"

    exit_code = run_sync(mode=mode, force_reinit=force_reinit)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
