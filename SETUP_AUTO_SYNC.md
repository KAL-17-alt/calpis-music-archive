# YouTubeプレイリスト自動同期・AI自動登録 セットアップ＆運用ガイド

---

## ステップ3：GitHubリポジトリを作成し、Secrets（環境変数）を登録する

### 3-1. GitHubにリポジトリを作ってファイルをアップロードする
1. [GitHub (https://github.com/)](https://github.com/) にログインし、右上の **「＋」アイコン →「New repository」** をクリックします。
2. **Repository name** に任意の名前（例：`calpis-music-archive`）を入力し、**「Create repository」** を押します（Public / Private どちらでも構いません）。
3. `calpis-music-archive-vercel.zip` をパソコン上で解凍（展開）し、中に入っているすべてのファイル・フォルダ（`index.html`, `app.js`, `styles.css`, `data.js`, `vercel.json`, `assets/`, `data/`, `scripts/`, `.github/` など）をそのリポジトリにアップロード（Push）します。
   - ※ブラウザから直接アップロードする場合は、隠しフォルダの `.github/workflows/sync-playlists.yml` も忘れずにアップロードしてください。

### 3-2. 3つのSecret（APIキー・プレイリストID）を登録する
1. GitHubリポジトリのページ上部にある **「Settings」タブ**（歯車アイコン）をクリックします。
2. 左側メニューの下方にある **「Secrets and variables」** をクリックし、展開された **「Actions」** をクリックします。
3. 画面右上の緑色のボタン **「New repository secret」** をクリックし、以下の **3つ** を1つずつ登録します。

| 1つ目の登録 | 内容 |
| :--- | :--- |
| **Name** | `YOUTUBE_API_KEY` |
| **Secret** | 取得した YouTube Data API v3 のキー（`AIza...`）を貼り付けて **「Add secret」** |

| 2つ目の登録 | 内容 |
| :--- | :--- |
| **Name** | `GEMINI_API_KEY` |
| **Secret** | 取得した Google AI Studio (Gemini) のキー（`AIza...`）を貼り付けて **「Add secret」** |

| 3つ目の登録 | 内容 |
| :--- | :--- |
| **Name** | `YOUTUBE_PLAYLIST_IDS` |
| **Secret** | 「無限 プレイリスト」「無限2 プレイリスト」のIDをカンマ区切りで貼り付けて **「Add secret」**<br>（例：`PLxxxxxxxxxxxx1,PLxxxxxxxxxxxx2`） |

---

## ステップ4：GitHub Actions の有効化・テスト実行と Vercel 連携

### 4-1. GitHub Actions の手動テスト実行
1. GitHubリポジトリ上部の **「Actions」タブ** を開きます。
   - ※もし緑色の「I understand my workflows, go ahead and enable them」というボタンが表示されたらクリックして有効化します。
2. 左側のメニューから **「Auto Sync YouTube Playlists」** をクリックします。
3. 右側にある **「Run workflow」▼** ボタンを押して、緑色の **「Run workflow」** をクリックします。
4. 1分ほど待つと緑色のチェックマーク（成功）がつきます（以降は毎日午前4時に自動実行されます）。

### 4-2. Vercel と GitHub リポジトリを連携する
1. [Vercel (https://vercel.com/)](https://vercel.com/) にログインし、**「Add New...」→「Project」** を押します。
2. 先ほど作成した GitHub リポジトリ（`calpis-music-archive`）の **「Import」** を押し、そのまま **「Deploy」** を押します。
3. これで連携完了です！以後、GitHub Actions がデータを更新して自動コミットするたびに、Vercelも自動で再デプロイされ、本番サイトが最新化されます。

---

## ステップ5：実用開始後の「手動調整（新規名義・低確信度の確認）」のやり方

自動同期スクリプトは、以下のように **2段階の安全設計** になっています：
- **既存名義の曲（高確信度）**: そのまま自動で本番データ（`data.js`）に追加され、サイトに即時反映されます。
- **未登録の新規名義・またはAIが迷った曲（低確信度）**: 勝手には本番登録せず、AIが「活動形態」「所属」「プロフィール文」「曲名」を仮設定した状態で **`PENDING_REVIEW.md`（見やすい一覧表）** と **`data/pending_review.json`（編集用データ）** に出力します。

### あなたが手動調整として行う操作（スマホやPCのブラウザだけで完結します）
1. たまにGitHubリポジトリのトップ画面にある **`PENDING_REVIEW.md`** を見ます（確認待ちの曲があると表形式で並んでいます）。
2. 内容を確認・承認する場合は、GitHub上で **`data/pending_review.json`** を開き、右上の **鉛筆アイコン（Edit this file）** を押します。
3. 各項目にAIの仮設定が入っています：
   ```json
   {
     "approved": false,
     "skip": false,
     "artistName": "〇〇",
     "songTitle": "△△",
     "songType": "cover",
     "role": "Vsinger",
     "agency": "",
     "profileBio": "〇〇は、...",
     "reason": "未登録の新規名義のため仮設定"
   }
   ```
   - もし `role`（歌い手／Vsinger／音楽グループ(アニゲー関連)／音楽グループ(その他) など）や `agency`（所属）、`profileBio`（プロフィール文）を直したい箇所があれば書き換えます。
   - サイトに登録してよければ、1番上の `"approved": false` を **`"approved": true`** に書き換えます。
   - （※もし男性ボーカル曲などで登録したくない場合は、`"skip": true` に書き換えます。）
4. 右上の緑色の **「Commit changes...」** ボタンを押して保存します。
5. 次の自動実行時（または「Actions」タブで「Run workflow」を押すとすぐその場で）、承認された項目が本番の `data.js` / `artists_master.json` に本登録され、`pending_review.json` から自動で消去されます。
