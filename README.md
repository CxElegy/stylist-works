# 伊藤あかり ポートフォリオ

スタイリスト 伊藤あかり の仕事を紹介するサイトです。URL を送るだけで「何をしている人か・どんな仕事をしてきたか・どこに連絡すればいいか」が伝わることを目的にしています。

- 公開先: https://cxelegy.github.io/stylist-works/v2.html
- このブランチに保存（push）すると、1〜2分で自動的に公開されます

## 自分で更新する方法（GitHub の画面だけでできます）

### 作品を追加する
1. `images/works/` を開き、「Add file → Upload files」で写真を入れる（ファイル名は半角の英数字と `-` だけ。例: `biteki-2027-01.jpg`）
2. `data/selection.js` を開き、鉛筆マークで編集。載せたいまとまりの `items` に1行足す
   ```
   "images/works/biteki-2027-01.jpg",
   ```
3. 「Commit changes」を押す。1〜2分でサイトに出ます

### 作品を外す・並べ替える
`data/selection.js` の行を消す、または行の順番を入れ替える（上から順に表示されます）。

### 媒体名・題名・クレジットをつける（任意）
`data/works.js` に同じ写真のパスで1件足すと、写真の下や拡大表示に出ます。書かなくても写真は載ります。

### ジャンルの一覧（r4-snog.html で写真を押すと開く、横並びの一覧）に写真を足す
`data/selection.js` の、そのジャンルの `gallery: [ ... ]` に画像のパスを1行足します（誌面でも写真でも同じ）。
```
gallery: [
  "images/pages/biteki-neo-nude-eye.jpg",
  "images/works/biteki-2027-01.jpg",   ← 足した行
],
```
- `gallery` が無いジャンルは、`items` の写真がそのまま並びます。`gallery: [ ... ]` を書けば、ほかのジャンルも Beauty と同じ形になります
- 並び順 ＝ 表示順。横長の画像（見開きの誌面）は自動で2列ぶんの幅になります
- 一覧の写真を押すと大きく表示され、左右で前後に送れます（スマホはスワイプ）
- 一覧用の小さい画像（`images/thumbs/`）と `data/thumbs.js` `data/sizes.js` は、公開のたびに自動で作り直されます。手で作る必要はありません
- リンクを送ったときに出るプレビュー画像は `images/og.jpg`。公開先の住所が変わったら、`r4-snog.html` の先頭にある `og:image` と `og:url` の住所を直してください

### プロフィール・連絡先を直す
`data/profile.js` を編集します。最初の画面の一文（`lead`）、経歴（`bio`）、メールアドレス（`email`）、Instagram はここです。

### 気をつけること
- 各行の最後のカンマ `,` と、前後の `"` を消さない
- 写真は横幅 1200px 以上あるときれいに見えます（小さい写真はぼやけます）

## ファイルの場所
| 場所 | 中身 |
|---|---|
| `v2.html` | サイト本体（作品を選んで、仕事の種類ごとに見せる版） |
| `data/selection.js` | サイトに載せる作品の一覧 |
| `data/works.js` | 素材の全部（102点）。媒体名・題名・クレジット |
| `data/profile.js` | プロフィール・連絡先 |
| `images/works/` `images/tumblr/` | 写真。`images/pages/` は雑誌の誌面全体 |
| `index.html`, `a-bold.html`, `b-cool.html`, `c-simple.html` | 公開前の比較用（前の3案） |
| `verify/` | 表示チェックの記録と道具 |

## 書体を選ぶ小窓（12番台の見比べ用）

12A〜 のページには、書体を見比べるための小さな窓が浮かんでいます（`assets/js/fontpick.js`、書体のファイルは `assets/fonts/jp/`）。
上の黒い帯をつかむと動かせます。URL の最後に `?font=maru`（`ima` / `maru` / `kiwi` / `pen` / `tegaki` / `pop`）を付けると、その書体で開きます。
書体が決まったら、各ページの最後にある `fontpick.js` の1行を外し、決まった書体をそのページの CSS に書きます。
