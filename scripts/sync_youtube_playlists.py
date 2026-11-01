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
        "contents": [{"parts": [{"text": 'Return JSON: {"ok": true}'}]}],
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


def add_song_to_existing_artist(target_artist: dict, song_title: str, song_type: str, vid: str) -> bool:
    """
    Adds a song to an existing artist WITHOUT overwriting `cat`, `role`, `profileBio`, or other existing attributes.
    Prevents duplicate song titles and duplicate video IDs.
    Returns True if the song was newly added, False if it was already registered.
    """
    song_title_clean = (song_title or "").strip()
    if not song_title_clean:
        return False

    existing_songs = target_artist.get("songs") or []
    existing_songs_norm = {normalize_text_key(s) for s in existing_songs}
    if normalize_text_key(song_title_clean) in existing_songs_norm:
        return False

    existing_top_links = {str(lk).strip() for lk in (target_artist.get("topLinks") or []) if lk}
    if vid and vid in existing_top_links:
        return False

    target_artist.setdefault("songs", []).append(song_title_clean)
    target_artist["count"] = len(target_artist["songs"])

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


def is_safe_for_auto_registration(
    item: dict,
    target_artist: dict | None,
    vmeta: dict,
    confidence: float,
    threshold: float = AUTO_APPROVE_CONFIDENCE,
) -> tuple[bool, str]:
    """
    Determines whether an AI-classified video is safe to auto-register directly to `target_artist`.
    Returns (is_safe, reason_if_not_safe).
    """
    if target_artist is None:
        return False, "サイト未登録の新規名義のため仮設定（要確認）"

    if confidence < threshold:
        return False, f"確信度が基準値未満 ({confidence:.2f} < {threshold:.2f}) のため要確認"

    if item.get("ambiguous") is True or item.get("needsReview") is True:
        return False, item.get("reason") or "AIが複数人歌唱・名義曖昧と判定したため要確認"

    raw_ai_artist = (item.get("artistName") or "").strip()
    song_title = (item.get("songTitle") or "").strip()
    if not raw_ai_artist or not song_title:
        return False, "曲名またはアーティスト名が空のため要確認"

    # Check if AI returned multiple artists / collaboration string that isn't the artist's actual name/alias
    known_names_norm = {normalize_text_key(target_artist["name"])}
    for al in target_artist.get("al") or []:
        if al:
            known_names_norm.add(normalize_text_key(al))

    collab_tokens = ["×", " feat", " ft.", " with ", " & ", "、", "／", "/"]
    if normalize_text_key(raw_ai_artist) not in known_names_norm:
        return False, f"AI抽出名義「{raw_ai_artist}」が登録名義と完全一致しないため要確認"

    raw_title = vmeta.get("title") or ""
    raw_channel = vmeta.get("channelTitle") or ""
    raw_desc = vmeta.get("description") or ""
    channel_id = vmeta.get("channelId") or ""
    combined_meta_norm = normalize_text_key(f"{raw_title} {raw_channel} {raw_desc}")

    # Grounding check: Is the target artist's name, alias, or channel ID actually present in the video metadata?
    artist_channel_url = target_artist.get("ytChannelUrl") or ""
    channel_matched = bool(channel_id and channel_id in artist_channel_url)
    name_matched = any(kn and kn in combined_meta_norm for kn in known_names_norm if len(kn) >= 2)
    if not name_matched and any(kn and kn in combined_meta_norm for kn in known_names_norm):
        name_matched = True

    if not channel_matched and not name_matched:
        return False, "動画タイトル・概要欄・チャンネル名にアーティスト名義の明示的な一致が確認できないため要確認（作曲者・原曲者取り違え防止）"

    # Check for multi-vocalist collaboration indicators in video title when artist is a solo singer
    role_str = target_artist.get("role") or ""
    if not role_str.startswith("音楽グループ"):
        # If title has `A × B` or `A & B` around the artist name, hold for review so user can check if both singers should be credited
        for sep in ("×", "✕", "✖"):
            if sep in raw_title and sep not in target_artist["name"]:
                return False, f"動画タイトルにコラボ表記（{sep}）が含まれるため複数人歌唱の確認が必要"

    # Prevent mistaking uploader/composer channel for vocalist on cover or vocaloid-feat videos
    is_own_ch = item.get("isOwnChannel")
    if is_own_ch is False and not name_matched:
        return False, "本人以外のチャンネル投稿動画であり名義一致が確認できないため要確認"

    return True, ""


def apply_approved_pending_items(
    artists: list[dict],
    pending_list: list[dict],
    processed_ids: set[str],
    today_str: str,
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

            target_artist = by_name.get(artist_name) or alias_map.get(normalize_text_key(artist_name))
            if target_artist:
                added = add_song_to_existing_artist(target_artist, song_title, song_type, vid)
                if vid:
                    processed_ids.add(vid)
                applied_logs.append({
                    "date": today_str,
                    "action": "approved_song_added" if added else "approved_song_already_exists",
                    "artist": target_artist["name"],
                    "song": song_title,
                    "type": song_type,
                    "videoId": vid,
                })
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
) -> list[dict]:
    prompt = f"""あなたは女性ボーカル楽曲アーカイブ「かるが聴いている歌い手・アーティスト」のデータ管理AIです。
以下のYouTube動画リストについて、それぞれの動画から「曲名」「歌唱しているボーカル名義（アーティスト名）」「オリジナル曲(orig)かカバー曲(cover)か」「確信度(confidence: 0.0〜1.0の数値)」を判別し、JSON配列で返してください。

【サイト登録ルール・最重要注意事項】
1. 対象は「女性ボーカル」または「女性ボーカルを含む音楽ユニット」のみです。男性ソロボーカル曲やインスト曲の場合は `"skip": true` にしてください。
2. 【作曲者・原曲者・投稿チャンネルの取り違え防止】
   - ボカロP・作曲者・公式アニメ/ゲームチャンネルに投稿されている動画で、ボーカル（feat. 〇〇 / Vocal: 〇〇 / 歌：〇〇 / CV: 〇〇）が歌っている場合は、作曲者やチャンネル名ではなく必ず「歌唱している女性ボーカリストまたはユニット名義」を `"artistName"` にしてください。また本人以外のチャンネルに投稿されている場合は `"isOwnChannel": false` にしてください。
   - カバー曲（歌ってみた）の場合、原曲の歌手や作曲者ではなく「カバーして歌っている本人」を `"artistName"` にしてください。
3. 【確信度 (confidence: 0.0〜1.0) と曖昧ケースの判定基準】
   - `0.85〜1.0`: 動画タイトル・チャンネル名・概要欄から歌唱名義と曲名が明確に特定でき、既存の登録アーティスト名義（またはその明確な別名義）と一意に一致する場合。
   - `0.0〜0.84`: 少しでも迷う場合（複数人コラボ・合唱で単一名義にするか迷う場合、歌唱者と作曲者の区別が曖昧な場合、同名異人の可能性がある場合、未登録の新規名義である場合など）は `0.80` 以下の数値にし、`"ambiguous": true` を設定してください。
   - 主な既存名義の例（一部）: {", ".join(existing_names[:450])}
4. `"songTitle"` には「【歌ってみた】」「MV」「Official Music Video」「/ アーティスト名」「cover」「Covered by ...」などの装飾を除いた純粋な曲名のみを入れてください。
5. `"songType"` は `"orig"`（オリジナル曲）または `"cover"`（歌ってみた・カバー曲）のいずれかにしてください。
6. 新規名義または要確認の項目に備えて、ひらがな読み `"reading"`、頭文字ひらがな1文字 `"kana"`、英字頭文字 `"alpha"`（英字名義のみA-Z、それ以外は空文字）、活動形態 `"role"`（`"Vtuber"`, `"Vsinger"`, `"歌い手"`, `"歌手"`, `"声優"`, `"音楽グループ(アニゲー関連)"`, `"音楽グループ(その他)"` のいずれか）、所属事務所・作品 `"agency"`（不明なら空文字）、そして `"role"` が `"歌手"`, `"声優"`, `"音楽グループ(アニゲー関連)"`（キャラものを除く）, `"音楽グループ(その他)"` の場合は2〜3文の丁寧なプロフィール紹介文 `"profileBio"` も仮作成してください。また判定理由や注意点を `"reason"` に短く記載してください。

【入力動画データ】
{json.dumps(videos, ensure_ascii=False, indent=2)}

【出力JSONスキーマ（配列のみ出力）】
[
  {{
    "videoId": "動画ID",
    "skip": false,
    "confidence": 0.92,
    "ambiguous": false,
    "artistName": "歌唱アーティスト名義",
    "songTitle": "純粋な曲名",
    "songType": "orig または cover",
    "isOwnChannel": true,
    "reading": "ひらがなよみ",
    "kana": "頭文字ひらがな1文字",
    "alpha": "英字頭文字(A-Z)または空文字",
    "role": "歌い手 / Vsinger / Vtuber / 歌手 / 声優 / 音楽グループ(アニゲー関連) / 音楽グループ(その他)",
    "agency": "所属事務所・作品名（なければ空文字）",
    "profileBio": "歌手・声優・音楽グループの場合の2〜3文のプロフィール紹介文（それ以外は空文字）",
    "reason": "AIの判定メモ・要確認理由"
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
        # Strip markdown fences if a model wraps JSON in ```json ... ```
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
        for k, v in a.items():
            if k in ("id", "topStatus", "imgType", "youtubeChannelUrl"):
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
        # Keep the songs field even for zero-song artists so the site never receives undefined.
        if not isinstance(ca.get("songs"), list):
            ca["songs"] = []
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
        ag = a.get("agencyGroup") or a.get("agency") or ""
        cnt = agency_counts.get(ag, 0) if ag else 0
        a["agencyGroupCount"] = cnt
        a["agencyClickable"] = cnt >= 2

    artists.sort(key=lambda a: (a["cat"], -a["count"], a.get("reading") or a["name"]))

    compact_js = build_compact_data_js(artists)
    atomic_write_json(MASTER_JSON_PATH, artists)
    atomic_write_text(DATA_JS_PATH, compact_js + "\n")
    update_standalone_html_if_present(STANDALONE_HTML_PATH, compact_js)
    update_api_artists_index_if_present(artists)


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

    # Step 2: Now that state files are verified intact, apply any user-approved or skipped items in `data/pending_review.json`,
    # even if there are 0 new playlist videos today!
    pending_before_count = len(pending_list)
    pending_list, approved_logs = apply_approved_pending_items(artists, pending_list, processed_ids, today_str)
    added_logs = list(approved_logs)

    if approved_logs or len(pending_list) != pending_before_count:
        recompute_and_save_production_data(artists)
        atomic_write_json(PENDING_JSON_PATH, pending_list)
        atomic_write_text(PENDING_MD_PATH, render_pending_markdown(pending_list))
        atomic_write_json(PROCESSED_JSON_PATH, sorted(processed_ids))
        safe_print(f"[PENDING] Processed {len(approved_logs)} approved/skipped item(s) from pending_review.json.")

    # Also ensure currently pending videoIds are not re-analyzed while awaiting user review
    pending_vids = {str(p.get("videoId")).strip() for p in pending_list if isinstance(p, dict) and p.get("videoId")}

    if not yt_key or not playlist_ids:
        safe_print("[INFO] YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_IDS not set. Skipping playlist fetch.")
        return 0

    # Step 3: Fetch playlist video IDs and filter to strictly NEW video IDs added after initialization
    new_vids = []
    new_seen = set()
    try:
        for pid in playlist_ids:
            vids = fetch_playlist_video_ids(pid, yt_key)
            for v in vids:
                if v not in processed_ids and v not in pending_vids and v not in new_seen:
                    new_seen.add(v)
                    new_vids.append(v)
    except Exception as e:
        safe_print(f"[ERROR] Failed to fetch playlists from YouTube API: {e}", [yt_key])
        return 1

    if not new_vids:
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
            f"[SYNC] No new videos found in playlist(s). Gemini API called: 0 times. "
            f"Approved/skipped applied: {len(added_logs)}. Pending queue: {len(pending_list)} item(s)."
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

    by_name = {a["name"]: a for a in artists}
    alias_map = {}
    for a in artists:
        alias_map[normalize_text_key(a["name"])] = a
        for al in a.get("al") or []:
            if al:
                alias_map[normalize_text_key(al)] = a
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
                    "action": "auto_skipped_non_target",
                    "videoId": vid,
                    "rawVideoTitle": vmeta.get("title", ""),
                    "reason": item.get("reason") or "対象外（男性ソロ・インスト等）",
                })
                continue

            artist_name = (item.get("artistName") or "").strip()
            song_title = (item.get("songTitle") or "").strip()
            song_type = "cover" if str(item.get("songType") or "").strip().lower() == "cover" else "orig"
            confidence = parse_confidence(item.get("confidence"))

            if not artist_name or not song_title:
                safe_print(f"[WARN] Video '{vid}' returned empty artistName or songTitle; routing to pending_review.json.")

            target_artist = by_name.get(artist_name) or alias_map.get(normalize_text_key(artist_name))
            is_safe, hold_reason = is_safe_for_auto_registration(
                item=item,
                target_artist=target_artist,
                vmeta=vmeta,
                confidence=confidence,
                threshold=AUTO_APPROVE_CONFIDENCE,
            )

            if is_safe and target_artist is not None:
                added = add_song_to_existing_artist(target_artist, song_title, song_type, vid)
                processed_ids.add(vid)
                if added:
                    auto_registered_count += 1
                    added_logs.append({
                        "date": today_str,
                        "action": "auto_added_song",
                        "artist": target_artist["name"],
                        "song": song_title,
                        "type": song_type,
                        "confidence": round(confidence, 3),
                        "videoId": vid,
                    })
                else:
                    added_logs.append({
                        "date": today_str,
                        "action": "skipped_duplicate_song",
                        "artist": target_artist["name"],
                        "song": song_title,
                        "videoId": vid,
                    })
            else:
                # Add to pending_review.json (avoid duplicate videoId in pending_list)
                if vid not in pending_vids:
                    is_own_ch = bool(item.get("isOwnChannel", True))
                    ch_info = fetch_channel_info(vmeta.get("channelId", ""), yt_key) if is_own_ch else {}
                    ch_url = f"https://www.youtube.com/channel/{ch_info['channelId']}" if ch_info.get("channelId") else ""
                    raw_role = (item.get("role") or ("歌い手" if song_type == "cover" else "歌手")).strip()
                    reason_text = item.get("reason") or hold_reason or "要確認"
                    if hold_reason and hold_reason not in reason_text:
                        reason_text = f"{hold_reason} ({reason_text})" if item.get("reason") else hold_reason

                    pending_list.append({
                        "approved": False,
                        "skip": False,
                        "date": today_str,
                        "isNewArtist": target_artist is None,
                        "confidence": round(confidence, 3),
                        "videoId": vid,
                        "videoUrl": f"https://www.youtube.com/watch?v={vid}",
                        "rawVideoTitle": vmeta.get("title", ""),
                        "rawChannelTitle": vmeta.get("channelTitle", ""),
                        "artistName": target_artist["name"] if target_artist else (artist_name or "要確認名義"),
                        "songTitle": song_title or vmeta.get("title", "要確認曲名"),
                        "songType": song_type,
                        "role": raw_role,
                        "groupSubRole": raw_role if raw_role.startswith("音楽グループ(") else "",
                        "agency": item.get("agency") or "",
                        "agencyGroup": item.get("agency") or "",
                        "reading": item.get("reading") or artist_name,
                        "kana": (item.get("kana") or "")[:1],
                        "alpha": (item.get("alpha") or "")[:1].upper(),
                        "ytChannelUrl": ch_url,
                        "sub": ch_info.get("sub"),
                        "img": ch_info.get("avatar") or vmeta.get("thumbnail") or "",
                        "profileBio": item.get("profileBio") or "",
                        "reason": reason_text,
                    })
                    pending_vids.add(vid)
                    pending_added_count += 1
                # Also mark vid as processed so we don't re-query Gemini while it sits in pending_review.json
                processed_ids.add(vid)

        if i + 15 < len(ordered_meta_list):
            time.sleep(1)

    # Save all updated states atomically
    recompute_and_save_production_data(artists)
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
