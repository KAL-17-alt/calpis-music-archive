# YouTube Music / YouTube プレイリスト自動更新 セットアップ＆運用ガイド（v2.0 安全初期化対応版）

## 概要と仕組み
- **初回初期化（`mode: init`）**：現在プレイリストに入っている全曲（約2,692件など）の動画IDを `data/processed_videos.json` に「初期登録済み」として一括記録し、`data/sync_state.json` に `"initialized": true` を保存します。**初期化時は Gemini API を一切呼び出さず（AI分析0件）、既存の楽曲・アーティスト・保留リストも一切変更しません。**
- **通常同期（`mode: sync`）**：初期化が完了した時点より後にプレイリストへ新しく追加された動画だけを検出して Gemini API（第一候補：`gemini-3.5-flash-lite`）で分析します。
  - **高確信度（`confidence >= 0.85`）かつ既存名義と明確に一致し、動画タイトル・チャンネル名等の根拠が確認できる曲**：即座に `data/artists_master.json`、`data.js`、`calpis-music-archive.html` に自動追加されます（カバー曲が1曲追加されただけで既存の分類2が分類1へ変わることはありません）。
  - **サイト未登録の新規名義、または低確信度・複数人コラボ・作曲者チャンネル投稿などの要確認曲**：本番データには自動登録せず、`data/pending_review.json` および `PENDING_REVIEW.md` にAIの仮設定を出力します。
- **手動承認・除外**：`data/pending_review.json` で `"approved": true` にした項目は次回実行時に本番登録され、`"skip": true` にした項目は登録せず除外されます（新曲が0件の日でも承認・除外は反映されます）。

## 1. GitHub 上の既存ファイルへの反映手順
このZIPファイルを解凍し、以下のファイルをGitHubリポジトリへ上書きアップロードして Commit してください。
- `scripts/sync_youtube_playlists.py`（初期化モード・Gemini 404対策・状態保護・確信度0〜1対応済みスクリプト）
- `.github/workflows/sync-playlists.yml`（`Diagnose YouTube API` 維持・モード選択・`data/sync_state.json` コミット対応済みワークフロー）
- `data/sync_state.json`（初期状態管理ファイル）
- `data/processed_videos.json`
- `data/pending_review.json`
- `PENDING_REVIEW.md`
- `SETUP_AUTO_SYNC.md`

## 2. 初回初期化（現在のプレイリスト全曲を登録済みとして記録する手順）
1. GitHubリポジトリ上部の **「Actions」** タブを開きます。
2. 左側メニューの **「Auto Sync YouTube Playlists」** をクリックします。
3. 右側の **「Run workflow」** ボタンを押します。
4. **「実行モード」** のドロップダウンで **`init`** を選択し、緑色の **「Run workflow」** ボタンを押します。
5. 実行が完了すると、現在のプレイリスト内の全動画IDが `data/processed_videos.json` に保存され、`data/sync_state.json` が `"initialized": true` となって自動コミットされます。
   - ※誤って2回目に `init` を実行しても、自動的にブロックされるため既存の記録がリセットされる心配はありません。

## 3. Gemini API の動作確認方法（任意）
- **「Run workflow」** のドロップダウンで **`verify_gemini`** を選択して実行すると、プレイリストや本番データには一切触れずに Gemini API（`gemini-3.5-flash-lite` 等）へ最小1リクエストだけテスト送信し、推論が成功するかログで確認できます。

## 4. Vercel公開版と単体HTML版（`calpis-music-archive.html`）について
- **Vercel公開版**：`index.html` + `app.js` + `styles.css` + `data.js` を参照して動作します。
- **単体HTML版（`calpis-music-archive.html`）**：HTML内部に `window.ARCHIVE_DATA` を内蔵したオフライン・単体動作版スナップショットです。本スクリプト（v2.0）は同期時に `data.js` と同時にリポジトリ内の `calpis-music-archive.html` も自動更新します。
