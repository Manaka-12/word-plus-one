# Word+One

英単語を検索して単語帳に貯めるWebアプリ。日本語・ドイツ語訳付き。無料版は単語帳3冊まで、プレミアムで無制限・広告なし。

## GitHub に置く手順

1. **GitHub でリポジトリを作る**
   - https://github.com/new を開く
   - Repository name を入力（例: `wordplusone`）
   - Public を選んで Create repository

2. **PC で Git を用意する**  
   - まだなら https://git-scm.com/ からインストール

3. **プロジェクトを Git で管理してプッシュする**

   **パターンA: いまのフォルダ全体（wordplusone）を GitHub に上げる場合**
   ```bash
   cd c:\dev\wordplusone
   git init
   git add .
   git commit -m "Initial commit: Word+One web app"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
   git push -u origin main
   ```

   **パターンB: web-app だけを別リポジトリで上げる場合**
   ```bash
   cd c:\dev\wordplusone\web-app
   git init
   git add .
   git commit -m "Initial commit: Word+One"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/wordplusone.git
   git push -u origin main
   ```

4. **プッシュ時に GitHub の認証を聞かれたら**
   - パスワードの代わりに **Personal Access Token** を使う（GitHub → Settings → Developer settings → Personal access tokens で発行）
   - または GitHub Desktop / Git Credential Manager でログイン

注意: 秘密は GitHub に上げないこと（下記「公開しちゃいけないもの」参照）。

---

## GitHub で公開しちゃいけないもの

| 入れちゃダメなもの | 理由 | 対策 |
|--------------------|------|------|
| **`.env` ファイル** | AdSense の ID（ca-pub-…）やスロットID が書いてある | すでに `.gitignore` に入れてある。絶対に `git add .env` しない |
| **`.env.local`** | 同上・ローカル用の秘密 | 同上で無視される |
| **パスワード・APIキー・トークン** | コードに直書きすると誰でも見える | 環境変数（GitHub Secrets や .env）で渡す |
| **node_modules** | パッケージは `npm install` で入る | すでに .gitignore 済み |
| **dist** | ビルド成果物は CI で作る | すでに .gitignore 済み |

**確認のしかた:**  
`git status` で `.env` や `.env.local` が出てこなければOK。出てきたら `git add` しないこと。  
過去に誤って push してしまった場合は、GitHub の Settings → Secrets を入れ直し、.env を削除してから履歴から消す（またはリポジトリを作り直す）必要がある。

**OK なもの:**  
ソースコード、`package.json`、README、`.gitignore`、ワークフロー（Secrets の**名前**だけ。値は GitHub Secrets に登録して参照する）。

## GitHub Pages にデプロイして広告で収益化

### 1. リポジトリを GitHub に push する
上記「GitHub に置く手順」で `main` に push まで完了していること。

### 2. GitHub Pages を有効にする
1. リポジトリの **Settings** → 左の **Pages**
2. **Build and deployment** で **Source** を **GitHub Actions** に変更して保存

### 3. デプロイを走らせる
- `main` に push すると自動でワークフローが動き、数分で公開される
- 初回は **Actions** タブで「Deploy to GitHub Pages」が緑になればOK
- 公開URL: **https://&lt;あなたのユーザー名&gt;.github.io/&lt;リポジトリ名&gt;/**  
  例: `https://tanaka.github.io/wordplusone/`

### 4. 広告（AdSense）で収益化する
1. **Google AdSense に申し込む**  
   https://www.google.com/adsense/
2. **サイトを追加** で、上記の GitHub Pages の URL を登録（例: `https://tanaka.github.io/wordplusone/`）
3. 審査通過後、AdSense の **広告** → **広告ユニット** で「表示」用のユニットを作成し、**発行者ID（ca-pub-…）** と **スロットID** を控える
4. **広告を本番表示する（審査通過後）**
   - リポジトリの **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret** で次を2つ追加:
     - 名前: `VITE_ADSENSE_CLIENT`、値: `ca-pub-xxxxxxxxxxxxxxxx`
     - 名前: `VITE_ADSENSE_SLOT`、値: `xxxxxxxxxx`
   - 保存後、**Actions** から「Deploy to GitHub Pages」を手動で再実行するか、何か push すると、次回のビルドから本番広告が表示される
   - 審査中やテスト時は Secrets を設定しなければデモ枠だけ表示される

**注意:** AdSense の審査は「中身が少ない」「アクセスがほぼない」だと通らないことがある。単語帳としてある程度ページを充実させてから申し込むとよい。

## 開発

```bash
npm install
npm run dev
```

- 本番ビルド: `npm run build` → `dist/` をデプロイ

## リリース方針（ロードマップ）

1. **まずスマホ向けサイトでリリース**
   - Vercel / Netlify / GitHub Pages などにデプロイ
   - 広告（AdSense）で収益化
   - スマホで「ホームに追加」するとアプリのように使える（PWA対応済み）

2. **安定したらアプリ化**
   - 同じコードを [Capacitor](https://capacitorjs.com/) や [TWA](https://developer.chrome.com/docs/android/trusted-web-activity/) でラップして App Store / Google Play に出す
   - ストア課金（プレミアム）と連携する場合は Stripe / RevenueCat 等を検討

## PWA

- `public/manifest.json` で「スタンドアロン」表示・テーマ色を設定済み
- スマホのブラウザで「ホーム画面に追加」するとフルスクリーンで利用可能

## 環境変数（任意）

- `VITE_ADSENSE_CLIENT` / `VITE_ADSENSE_SLOT` … 広告表示用（未設定時はデモ枠を表示）
