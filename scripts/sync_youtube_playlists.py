#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automatic YouTube Playlist -> Gemini API -> Archive Updater (with Safe Pending Review Queue)
1. Applies any user-approved entries from `data/pending_review.json` ("approved": true).
2. Fetches new videos from specified YouTube / YouTube Music playlists.
3. Uses Gemini API (free tier) to extract song title, artist name, orig/cover, role,agency, and confidence.
4. High-confidence matches to EXISTING artists are registered immediately into `data/artists_master.json` & `data.js`.
5. Unregistered NEW artists or low/medium-confidence songs are NOT registered immediately;
   instead, they are saved with AI provisional settings into `data/pending_review.json` and `PENDING_REVIEW.md`
   so the user can review/tweak role, agency, or profileBio and flip `"approved": true` to register.
"""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_JSON_PATH = os.path.join(BASE_DIR, "data", "artists_master.json")
PROCESSED_JSON_PATH = os.path.join(BASE_DIR, "data", "processed_videos.json")
PENDING_JSON_PATH = os.path.join(BASE_DIR, "data", "pending_review.json")
PENDING_MD_PATH = os.path.join(BASE_DIR, "PENDING_REVIEW.md")
SYNC_LOG_JSON_PATH = os.path.join(BASE_DIR, "data", "auto_sync_log.json")
DATA_JS_PATH = os.path.join(BASE_DIR, "data.js")

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
PLAYLIST_IDS_RAW = os.environ.get("YOUTUBE_PLAYLIST_IDS", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()


def http_get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "CalpisMusicArchiveSync/1.1"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_json(url: str, payload: dict) -> dict:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "CalpisMusicArchiveSync/1.1"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_playlist_video_ids(playlist_id: str, api_key: str) -> list[str]:
    video_ids = []
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
        data = http_get_json(url)
        for item in data.get("items", []):
            vid = (item.get("contentDetails") or {}).get("videoId")
            if vid:
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
        data = http_get_json(url)
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
    if not channel_id:
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


def add_song_to_existing_artist(target_artist: dict, song_title: str, song_type: str, vid: str) -> bool:
    existing_songs_norm = {s.lower().strip() for s in (target_artist.get("songs") or [])}
    if song_title.lower().strip() in existing_songs_norm:
        return False
    target_artist.setdefault("songs", []).append(song_title)
    target_artist["count"] = len(target_artist["songs"])
    if song_type == "cover":
        target_artist["cat"] = 1
        if target_artist.get("role") in ("音楽グループ(アニゲー関連)", "音楽グループ(その他)"):
            target_artist["groupSubRole"] = target_artist["role"]
            target_artist["role"] = "音楽グループ"
            target_artist["roles"] = ["音楽グループ"]
    if len(target_artist.get("topSongs") or []) < 5 and song_title not in (target_artist.get("topSongs") or []):
        target_artist.setdefault("topSongs", []).append(song_title)
        target_artist.setdefault("topLinks", []).append(vid)
        target_artist.setdefault("topTypes", []).append(song_type)
    return True


def apply_approved_pending_items(artists: list[dict], pending_list: list[dict], today_str: str) -> tuple[list[dict], list[dict]]:
    """Processes items in pending_review.json where user set approved=True or skip=True."""
    by_name = {a["name"]: a for a in artists}
    alias_map = {}
    for a in artists:
        alias_map[a["name"].lower()] = a
        for al in a.get("al") or []:
            if al:
                alias_map[al.lower()] = a

    remaining_pending = []
    applied_logs = []

    for item in pending_list:
        if item.get("skip"):
            # User marked skip=True -> drop from pending list permanently
            continue
        if not item.get("approved"):
            remaining_pending.append(item)
            continue

        artist_name = (item.get("artistName") or "").strip()
        song_title = (item.get("songTitle") or "").strip()
        song_type = "cover" if item.get("songType") == "cover" else "orig"
        vid = item.get("videoId") or ""
        if not artist_name or not song_title:
            continue

        target_artist = by_name.get(artist_name) or alias_map.get(artist_name.lower())
        if target_artist:
            if add_song_to_existing_artist(target_artist, song_title, song_type, vid):
                applied_logs.append({
                    "date": today_str,
                    "action": "approved_song_added",
                    "artist": target_artist["name"],
                    "song": song_title,
                    "type": song_type,
                    "videoId": vid,
                })
        else:
            cat_val = 1 if song_type == "cover" else 2
            raw_role = item.get("role") or ("歌い手" if cat_val == 1 else "歌手")
            group_sub_role = item.get("groupSubRole") or ""
            if raw_role in ("音楽グループ(アニゲー関連)", "音楽グループ(その他)"):
                group_sub_role = raw_role
                if cat_val == 1:
                    raw_role = "音楽グループ"

            kana_char = (item.get("kana") or "")[:1]
            ch_url = (item.get("ytChannelUrl") or "").strip()
            sub_val = item.get("sub")
            ag = (item.get("agency") or "").strip()
            agg = (item.get("agencyGroup") or ag).strip()

            new_entry = {
                "name": artist_name,
                "cat": cat_val,
                "count": 1,
                "reading": item.get("reading") or artist_name,
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
                "profileBio": item.get("profileBio") or "",
                "ytChannelUrl": ch_url,
                "ytChannelLabel": "YouTubeチャンネル →" if ch_url else "",
                "ytChannelType": "official" if ch_url else "",
            }
            artists.append(new_entry)
            by_name[artist_name] = new_entry
            alias_map[artist_name.lower()] = new_entry
            applied_logs.append({
                "date": today_str,
                "action": "approved_new_artist",
                "artist": artist_name,
                "song": song_title,
                "type": song_type,
                "role": raw_role,
                "videoId": vid,
            })

    return remaining_pending, applied_logs


def render_pending_markdown(pending_list: list[dict]) -> str:
    lines = [
        "# 要確認・仮設定リスト（新規名義 / 低確信度の曲）",
        "",
        "この一覧は、プレイリストに追加された動画のうち **「サイト未登録の新規名義」** または **「AIが判別に迷った曲（低〜中確信度）」** をAIが仮設定したものです（まだサイト本番データには登録されていません）。",
        "",
        "### 手動調整・承認のやり方",
        "1. `data/pending_review.json` をGitHub上で開いて編集（鉛筆アイコン）します。",
        "2. 仮設定されている `artistName`（名義）、`songTitle`（曲名）、`role`（活動形態）、`agency`（所属）、`profileBio`（プロフィール文）を確認し、必要なら修正します。",
        "3. サイトに登録してよければ `\"approved\": false` を **`\"approved\": true`** に書き換えて Commit します（登録せず無視したい場合は `\"skip\": true` にします）。",
        "4. 次回の自動実行（または Actions タブからの「Run workflow」手動実行）で自動的に本番サイトへ登録され、このリストから消えます。",
        "",
    ]
    if not pending_list:
        lines.append("現在、確認待ちの項目はありません（0件）。")
        return "\n".join(lines) + "\n"

    lines.append(f"現在 **{len(pending_list)}件** の確認待ち項目があります：")
    lines.append("")
    lines.append("| 追加日 | 区分 | 仮アーティスト名 | 仮曲名 | 種別 | 仮活動形態 | 仮所属 | 動画リンク | 理由・AIメモ |")
    lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    for p in pending_list:
        vid = p.get("videoId", "")
        vurl = f"[動画](https://www.youtube.com/watch?v={vid})" if vid else "-"
        kind = "新規名義" if p.get("isNewArtist") else "要確認(既存候補)"
        lines.append(
            f"| {p.get('date', '')} | {kind} | **{p.get('artistName', '')}** | {p.get('songTitle', '')} | "
            f"`{p.get('songType', '')}` | {p.get('role', '')} | {p.get('agency', '') or '-'} | {vurl} | {p.get('reason', '')} |"
        )
    return "\n".join(lines) + "\n"


def classify_videos_with_gemini(videos: list[dict], existing_names: list[str], api_key: str) -> list[dict]:
    prompt = f"""あなたは女性ボーカル楽曲アーカイブ「かるが聴いている歌い手・アーティスト」のデータ管理AIです。
以下のYouTube動画リストについて、それぞれの動画から「曲名」「ボーカル名義（アーティスト名）」「オリジナル曲(orig)かカバー曲(cover)か」「確信度(confidence)」を判別し、JSON配列で返してください。

【サイト登録ルール】
1. 対象は「女性ボーカル」または「女性ボーカルを含む音楽ユニット」のみです。男性ソロボーカル曲やインスト曲の場合は `"skip": true` にしてください。
2. ボカロP・作曲者のチャンネルに投稿されている動画で、ゲストボーカル（feat. 〇〇 / Vocal: 〇〇）が歌っている場合は、作曲者ではなく「女性ボーカリスト名義」を `"artistName"` にしてください。またその場合、動画の投稿チャンネルはボーカル本人のチャンネルではないため `"isOwnChannel": false` にしてください。
3. 既存の登録アーティスト名義（またはその表記ゆれ）に確実に一致する場合は、既存名義の表記に合わせ、`"confidence": "high"` にしてください。
   少しでも迷う場合（複数人コラボで名義が曖昧、同名異人の可能性、曲名とアーティスト名の区切りが曖昧など）は `"confidence": "low"` にしてください。
   主な既存名義の例（一部）: {", ".join(existing_names[:450])}
4. `"songTitle"` には「【歌ってみた】」「MV」「Official Music Video」「/ アーティスト名」「cover」などの装飾を除いた純粋な曲名のみを入れてください。
5. `"songType"` は `"orig"`（オリジナル曲）または `"cover"`（歌ってみた・カバー曲）のいずれかにしてください。
6. 新規名義または要確認の項目に備えて、ひらがな読み `"reading"`、頭文字ひらがな1文字 `"kana"`、英字頭文字 `"alpha"`（英字名義のみA-Z、それ以外は空文字）、活動形態 `"role"`（`"Vtuber"`, `"Vsinger"`, `"歌い手"`, `"歌手"`, `"声優"`, `"音楽グループ(アニゲー関連)"`, `"音楽グループ(その他)"` のいずれか）、所属事務所・作品 `"agency"`（不明なら空文字）、そして `"role"` が `"歌手"`, `"声優"`, `"音楽グループ(アニゲー関連)"`（キャラものを除く）, `"音楽グループ(その他)"` の場合は2〜3文の丁寧なプロフィール紹介文 `"profileBio"` を仮作成してください。また判定理由や注意点を `"reason"` に短く記載してください。

【入力動画データ】
{json.dumps(videos, ensure_ascii=False, indent=2)}

【出力JSONスキーマ（配列のみ出力）】
[
  {{
    "videoId": "動画ID",
    "skip": false,
    "confidence": "high または low",
    "artistName": "アーティスト名義",
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

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }
    resp = http_post_json(url, payload)
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)


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
        compact_artists.append(ca)
    return "window.ARCHIVE_DATA = " + json.dumps(compact_artists, ensure_ascii=False, separators=(",", ":")) + ";"


def main():
    with open(MASTER_JSON_PATH, "r", encoding="utf-8") as f:
        artists = json.load(f)

    if os.path.exists(PROCESSED_JSON_PATH):
        with open(PROCESSED_JSON_PATH, "r", encoding="utf-8") as f:
            processed_ids = set(json.load(f))
    else:
        processed_ids = set()

    if os.path.exists(PENDING_JSON_PATH):
        with open(PENDING_JSON_PATH, "r", encoding="utf-8") as f:
            pending_list = json.load(f)
    else:
        pending_list = []

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    added_logs = []

    # Step 1: Apply any items in data/pending_review.json that the user approved ("approved": true)
    pending_list, approved_logs = apply_approved_pending_items(artists, pending_list, today_str)
    added_logs.extend(approved_logs)

    # Also treat all existing topLinks and currently pending videoIds as already known
    for a in artists:
        for lk in a.get("topLinks") or []:
            if lk and len(lk) == 11:
                processed_ids.add(lk)
    for p in pending_list:
        if p.get("videoId"):
            processed_ids.add(p["videoId"])

    # Step 2: Fetch new videos from YouTube playlists if API keys are configured
    all_vids = []
    if YOUTUBE_API_KEY and GEMINI_API_KEY and PLAYLIST_IDS_RAW:
        playlist_ids = [p.strip() for p in PLAYLIST_IDS_RAW.split(",") if p.strip()]
        for pid in playlist_ids:
            vids = fetch_playlist_video_ids(pid, YOUTUBE_API_KEY)
            for v in vids:
                if v not in processed_ids and v not in all_vids:
                    all_vids.append(v)

    if all_vids:
        print(f"Found {len(all_vids)} new video(s) to analyze.")
        vid_meta_list = fetch_videos_metadata(all_vids, YOUTUBE_API_KEY)
        meta_by_vid = {m["videoId"]: m for m in vid_meta_list}

        by_name = {a["name"]: a for a in artists}
        alias_map = {}
        for a in artists:
            alias_map[a["name"].lower()] = a
            for al in a.get("al") or []:
                if al:
                    alias_map[al.lower()] = a

        existing_names = [a["name"] for a in artists]

        for i in range(0, len(vid_meta_list), 15):
            batch = vid_meta_list[i : i + 15]
            parsed_list = classify_videos_with_gemini(batch, existing_names, GEMINI_API_KEY)
            for item in parsed_list:
                vid = item.get("videoId")
                if not vid:
                    continue
                processed_ids.add(vid)
                if item.get("skip"):
                    continue

                artist_name = (item.get("artistName") or "").strip()
                song_title = (item.get("songTitle") or "").strip()
                song_type = "cover" if item.get("songType") == "cover" else "orig"
                confidence = (item.get("confidence") or "low").strip().lower()
                if not artist_name or not song_title:
                    continue

                target_artist = by_name.get(artist_name) or alias_map.get(artist_name.lower())
                vmeta = meta_by_vid.get(vid, {})

                # Only auto-register if it matches an EXISTING artist AND confidence is high
                if target_artist and confidence == "high":
                    if add_song_to_existing_artist(target_artist, song_title, song_type, vid):
                        added_logs.append({
                            "date": today_str,
                            "action": "auto_added_song",
                            "artist": target_artist["name"],
                            "song": song_title,
                            "type": song_type,
                            "videoId": vid,
                        })
                else:
                    # Provisional draft -> save to data/pending_review.json for user confirmation/tweak
                    is_own_ch = bool(item.get("isOwnChannel", True))
                    ch_info = fetch_channel_info(vmeta.get("channelId", ""), YOUTUBE_API_KEY) if is_own_ch else {}
                    ch_url = f"https://www.youtube.com/channel/{ch_info['channelId']}" if ch_info.get("channelId") else ""
                    raw_role = item.get("role") or ("歌い手" if song_type == "cover" else "歌手")
                    pending_list.append({
                        "approved": False,
                        "skip": False,
                        "date": today_str,
                        "isNewArtist": target_artist is None,
                        "confidence": confidence,
                        "videoId": vid,
                        "videoUrl": f"https://www.youtube.com/watch?v={vid}",
                        "rawVideoTitle": vmeta.get("title", ""),
                        "rawChannelTitle": vmeta.get("channelTitle", ""),
                        "artistName": target_artist["name"] if target_artist else artist_name,
                        "songTitle": song_title,
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
                        "reason": item.get("reason") or ("未登録の新規名義のため仮設定" if target_artist is None else "低確信度のため要確認"),
                    })
            time.sleep(1)

    # Recompute agencyGroupCount and agencyClickable
    agency_counts = {}
    for a in artists:
        ag = a.get("agencyGroup") or a.get("agency") or ""
        if ag:
            agency_counts[ag] = agency_counts.get(ag, 0) + 1
    for a in artists:
        ag = a.get("agencyGroup") or a.get("agency") or ""
        cnt = agency_counts.get(ag, 0) if ag else 0
        a["agencyGroupCount"] = cnt
        a["agencyClickable"] = cnt >= 2

    artists.sort(key=lambda a: (a["cat"], -a["count"], a.get("reading") or a["name"]))

    with open(MASTER_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)

    with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(build_compact_data_js(artists) + "\n")

    with open(PROCESSED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted(processed_ids), f, ensure_ascii=False, indent=2)

    with open(PENDING_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(pending_list, f, ensure_ascii=False, indent=2)

    with open(PENDING_MD_PATH, "w", encoding="utf-8") as f:
        f.write(render_pending_markdown(pending_list))

    if added_logs:
        existing_logs = []
        if os.path.exists(SYNC_LOG_JSON_PATH):
            with open(SYNC_LOG_JSON_PATH, "r", encoding="utf-8") as f:
                existing_logs = json.load(f)
        existing_logs = added_logs + existing_logs
        with open(SYNC_LOG_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(existing_logs[:500], f, ensure_ascii=False, indent=2)

    print(f"Sync complete. Applied {len(added_logs)} update(s); {len(pending_list)} item(s) in pending_review.json.")


if __name__ == "__main__":
    main()
