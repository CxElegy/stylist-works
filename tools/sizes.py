"""data/sizes.js を作り直す（写真の縦横サイズ。表示後にレイアウトが動かないようにするため）
使い方: python3 tools/sizes.py   ← 写真を追加・差し替えしたら実行"""
import glob, json
from PIL import Image
out = {}
for p in sorted(glob.glob("images/**/*.*", recursive=True)):
    try:
        with Image.open(p) as im: out[p] = list(im.size)
    except Exception: pass
open("data/sizes.js", "w", encoding="utf-8").write("/* tools/sizes.py が自動で作るファイル。手で編集しない */\nwindow.SIZES = " + json.dumps(out, ensure_ascii=False, indent=0) + ";\n")
print(len(out), "images")
