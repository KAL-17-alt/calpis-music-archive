# 「かるのオススメ」サーバー共有機能 セットアップ手順書

このドキュメントでは、Calpis Music Archive の「かるのオススメ（ハート設定）」をサーバーに保存し、PC・スマホ・PWA・全閲覧者間で月額0円（Vercel Hobby無料枠内）で共有するための設定手順を説明します。

---

## 方式の選定結果（どちらもコード変更なしで自動対応）

`/api/favorites` は以下の2つの無料保存方式に両対応しており、設定された環境変数を自動判別して動作します。

1. **方式A（第一推奨）：Vercel Global Config（旧 Edge Config）**
   - **特徴**：外部サービスのアカウント登録が一切不要で、Vercelの画面内だけで3分で完結します。
   - **無料枠（Vercel Hobby）**：読み込み 月100,000回まで無料、書き込み 月100回まで無料、最大1MB（1,463名義すべてにハートを付けても約18KB＝上限の約1.8%）。「完了して閉じる」を押したときだけ1回書き込む仕様のため、無料枠内で余裕をもって運用できます。Hobbyプランのため意図しない従量課金も一切発生しません。
2. **方式B（書き込みが月100回を超える場合）：Upstash Redis（Vercel Marketplace公式連携）**
   - **特徴**：VercelのStorageメニューから連携できる無料サーバーレスRedisです。
   - **無料枠**：月500,000コマンドまで無料、256MBまで無料（クレジットカード登録不要）。

---

## 方式A（推奨）：Vercel Global Config / Edge Config の設定手順（所要時間：約3分）

### 手順1：GitHubへ更新ファイルをアップロード（Push）する
今回のZIPに含まれる以下のファイル（またはZIP全体）をGitHubリポジトリへアップロードしてください。
- `api/favorites.js`（新規）
- `api/_artists_index.js`（新規）
- `index.html`
- `app.js`（および `assets/app.js`）
- `styles.css`（および `assets/styles.css`）
- `data.js`（および `assets/data.js`, `data/artists_master.json`, `calpis-music-archive.html`）
- `scripts/sync_youtube_playlists.py`
- `vercel.json` / `sw.js`

### 手順2：Vercelで Global Config（Edge Config）ストアを作成する
1. [Vercel Dashboard](https://vercel.com/dashboard) を開き、対象のプロジェクト（`calpis-music-archive`）をクリックします。
2. 上部タブの **「Storage」** をクリックします。
3. **「Create Database」**（または **「Create」**）から **「Edge Config（または Global Config）」** を選択します。
4. Store Name に `calpis-favorites` と入力し、**「Create」** を押します。
5. 作成後、**「Connect to Project」**（プロジェクトに接続）で `calpis-music-archive` を選択して **「Connect」** を押します。
   - これにより、プロジェクトの環境変数に **`EDGE_CONFIG`**（読み込み用接続文字列）が自動的に追加されます。

### 手順3：書き込み用の Vercel API Token を1つ作成して環境変数に追加する
Global Config への書き込み（`完了して閉じる` を押したときの保存）を行うため、VercelのAPIトークンを1つ設定します。
1. Vercel画面右上の自分のアイコンをクリックし、**「Account Settings」** を開きます。
2. 左メニューの **「Tokens」** をクリックし、**「Create」** を押します。
   - **Token Name**：`calpis-favorites-write`
   - **Scope**：自分のアカウント（Personal Account / Hobby）を選択
   - **Expiration**：`No Expiration`（無期限）を選択
3. **「Create Token」** を押し、表示されたトークン文字列をコピーします。
4. `calpis-music-archive` プロジェクト画面に戻り、上部タブの **「Settings」** ➔ 左メニュー **「Environment Variables」** を開きます。
5. 以下の環境変数を1つ追加して **「Save」** を押します。
   - **Key**：`VERCEL_API_TOKEN`
   - **Value**：先ほどコピーしたトークン文字列
   - **Environments**：Production / Preview / Development すべてにチェック

### 手順4：Vercelで1回だけ Redeploy（再デプロイ）して環境変数を反映する
1. プロジェクト上部タブの **「Deployments」** を開きます。
2. 一番上の最新のデプロイの右端にある **「⋯」** メニューを押し、**「Redeploy」** をクリックします。

---

## 方式B（代替）：Upstash Redis を使う場合の手順

もし月100回以上のペースで頻繁にハート編集・保存を行いたい場合は、手順2・3の代わりに以下を行うだけで自動的に Upstash Redis が使われます。
1. Vercelのプロジェクト画面 ➔ **「Storage」** タブ ➔ **「Create Database」** ➔ **「Upstash（Upstash for Redis）」** を選択します。
2. Freeプラン（無料枠：$0/月）を選択してデータベースを作成し、`calpis-music-archive` プロジェクトに **Connect** します。
3. 環境変数 `KV_REST_API_URL` / `KV_REST_API_TOKEN`（または `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`）が自動追加されるため、**Deployments** から1回 **Redeploy** すれば完了です。

---

## 初回の既存ハート設定（localStorage）のサーバー移行手順

1. **これまでメインでハートを設定していた端末（PCまたはスマホ）**でサイトを開きます。
2. 既存のハート設定がブラウザの `localStorage` に残っている場合、自動的に **「既存の『かるのオススメ』サーバー初回移行」** の確認ポップアップが表示されます（または5回タップで高速ハート編集モードを開き、上部バーの **「端末の既存ハート(N件)を移行」** ボタンを押しても開けます）。
3. 表示された名義数・一覧を確認し、**「確認してこの端末からサーバーへ移行する」** を押します。
4. これ以降、PC・スマホ・インストールしたPWA・他の閲覧者のすべてで同じハート状態が表示されるようになります。
   - 他の端末に古い `localStorage` が残っていても、サーバー側の共有データが自動的に上書きされることはありません。
