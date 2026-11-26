"""一覧用の小さい画像（サムネイル）を作る。スマホで一覧をすぐ出すためのもの。
使い方: python3 tools/thumbs.py   ← 写真を追加・差し替えしたら実行（公開時にも自動で実行されます）
- data/selection.js に書かれている画像だけが対象（lead / items / gallery）
- 出力: images/thumbs/…（横 720px、元より大きくはしない）と data/thumbs.js（元のパス → サムネイルのパス）
- 元の画像は変えない。拡大表示は元の画像を使う"""
import json, os, re, hashlib
from PIL import Image
W = 720
src = open("data/selection.js", encoding="utf-8").read()
paths = []
for p in re.findall(r'"(images/[^"]+\.(?:jpe?g|png|webp))"', src, re.I):
    if p not in paths and os.path.exists(p):
        paths.append(p)
os.makedirs("images/thumbs", exist_ok=True)
out, keep = {}, set()
for p in paths:
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", p[len("images/"):]).rsplit(".", 1)[0] + ".jpg"
    dst = "images/thumbs/" + name
    keep.add(name)
    with Image.open(p) as im:
        if im.width <= W * 1.15:      # もともと小さい画像は、そのまま使う
            continue
        if not (os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(p)):
            im = im.convert("RGB")
            im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
            im.save(dst, quality=80, optimize=True, progressive=True)
    out[p] = dst
for f in os.listdir("images/thumbs"):
    if f not in keep or ("images/thumbs/" + f) not in out.values():
        os.remove(os.path.join("images/thumbs", f))
open("data/thumbs.js", "w", encoding="utf-8").write("/* tools/thumbs.py が自動で作るファイル。手で編集しない */\nwindow.THUMBS = " + json.dumps(out, ensure_ascii=False, indent=0) + ";\n")
print(len(out), "thumbnails,", round(sum(os.path.getsize(v) for v in out.values()) / 1024), "KB")
