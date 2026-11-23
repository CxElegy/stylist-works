# AKARI ITO — Portfolio

スタイリスト AKARI ITO のポートフォリオサイト（GitHub Pages で公開する静的サイト）。

## フォルダ構成

```
index.html          … ページ本体（プロフィール文・連絡先はここを編集）
data/works.js       … 作品一覧データ（★作品の追加・差し替えはここだけ）
images/works/       … 作品の画像を入れるフォルダ
images/hero/        … トップのメインビジュアル画像
assets/css/style.css… デザイン（色・フォント・余白）
assets/js/main.js   … 一覧表示と拡大表示の仕組み（通常は触らない）
```

## 作品を追加・差し替える

1. 画像を `images/works/` に入れる（ファイル名は半角英数字がおすすめ。例: `biteki-2025-01.jpg`）
2. `data/works.js` を開き、既存の `{ ... },` のかたまりを1つコピーして貼り付け、中身を書き換える

```js
  {
    image: "images/works/biteki-2025-01.jpg",
    media: "美的",
    title: "2025年1月号 ビューティー特集",
    credit: "Photo: 〇〇 / Hair&Make: 〇〇",
    link: ""
  },
```

- 並び順がそのまま表示順です（上ほど先に表示）
- 使わない項目は `""`（空）でOK
- 削除するときは `{` から `},` までを丸ごと消す
- 画像は横幅 1600px 程度・JPG に縮小しておくと表示が速くなります

## メインビジュアルを差し替える

`images/hero/` に画像を入れ、`index.html` の `src="images/hero/hero.svg"` をそのファイル名に書き換えます。
縦長・横長どちらでも画面いっぱいにトリミングされて表示されます。

## 手元で確認する

`index.html` をブラウザにドラッグ＆ドロップすれば表示できます。

## GitHub Pages で公開する

1. GitHub のリポジトリページ → **Settings** → 左メニュー **Pages**
2. **Build and deployment** の Source を **Deploy from a branch** にする
3. Branch を `main`、フォルダを `/ (root)` にして **Save**
4. 1〜2分待つと、同じ画面の上部に公開URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）が表示されます

以降は `main` に変更を反映（コミット）するたびに、自動でサイトも更新されます。

### ブラウザだけで画像を追加する方法

1. リポジトリの `images/works` フォルダを開き **Add file → Upload files** で画像をアップロード → **Commit changes**
2. `data/works.js` を開き、鉛筆アイコン（Edit）で作品を追記 → **Commit changes**
