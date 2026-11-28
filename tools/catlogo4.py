# 「AKARI ITO」猫入り文字ロゴ 第4案（logo.html）。猫の形は Wikimedia Commons のパブリックドメインの影絵をなぞったもの
# （File:Cat silhouette.svg / File:Sitting cat silhouette with eye.svg。目の白い点は埋めた）。描いていない。
# 参考（審美図鑑 CAT 字母 Logo の明朝の版）と同じ考え：字と字のすき間に、座った猫の影絵が入る。
# 使い方: pip install fonttools brotli potracer pillow numpy → python3 tools/catlogo4.py （なぞり直すときは trace() に PNG を渡す）
import json, sys
sys.path.insert(0, 'tools')
from catlogo import Face
F = 'assets/fonts/'

def trace(png, fill_holes=False):
    import potrace, numpy as np
    from PIL import Image, ImageDraw
    im = Image.open(png).convert('RGBA'); bg = Image.new('RGBA', im.size, 'white'); bg.alpha_composite(im)   # 透明な所は白として扱う
    a = np.array(bg.convert('L')) < 128
    ys, xs = np.where(a); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    a = np.pad(a, 2)                                  # 端に触れないように余白
    parts = []
    for c in potrace.Bitmap(~a).trace(turdsize=20, opttolerance=.4):   # potracer は False を「黒」として追う
        d = f'M{c.start_point.x:.1f},{c.start_point.y:.1f}'
        for s in c.segments:
            d += (f'L{s.c.x:.1f},{s.c.y:.1f}L{s.end_point.x:.1f},{s.end_point.y:.1f}' if s.is_corner else
                  f'C{s.c1.x:.1f},{s.c1.y:.1f} {s.c2.x:.1f},{s.c2.y:.1f} {s.end_point.x:.1f},{s.end_point.y:.1f}')
        parts.append(d + 'Z')
    parts = [p for p in parts if not p.startswith('M0.0,') or len(p) > 400]
    parts.sort(key=len, reverse=True)
    d = parts[0] if fill_holes else ''.join(parts)     # fill_holes: 外側の輪郭だけ残す（目の白い点を消す）
    return {'d': d, 'w': int(a.shape[1]), 'h': int(a.shape[0])}

def cat(c, x, h, flip=False, sink=0):
    k = h / c['h']; w = c['w'] * k
    t = f'translate({x + (w if flip else 0):.1f},{-h + sink:.1f}) scale({-k if flip else k:.4f},{k:.4f})'
    return f'<path transform="{t}" d="{c["d"]}"/>', w

def run(face, s, x=0, ls=0):
    out = ''
    for ch in s:
        g = face.g(ch); out += f'<path transform="translate({x:.1f},0) scale(1,-1)" d="{g["d"]}"/>'; x += g['adv'] + ls
    return out, x - ls

def svg(inner, w, cap, up=1.3, down=.18):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-cap * .1:.0f} {-cap * up:.0f} {w + cap * .2:.0f} {cap * (up + down):.0f}" role="img" aria-label="AKARI ITO"><g fill="currentColor">{inner}</g></svg>'

if __name__ == '__main__':
    import os
    P = 'assets/logo/cats-pd.json'
    if len(sys.argv) > 2:
        json.dump({'look': trace(sys.argv[1]), 'sit': trace(sys.argv[2], True)}, open(P, 'w'))
    C = json.load(open(P)); look, sit = C['look'], C['sit']
    bod = Face(F + 'bodoni-moda-400-latin.woff2'); bodb = Face(F + 'bodoni-moda-700-latin.woff2'); frank = Face(F + 'frank-ruhl-libre-latin.woff2', {'wght': 300})
    def q1():   # ディドン。すき間に座る猫（しっぽが巻く）
        f = bod; cap = f.g('I')['b'][3]; a, w = run(f, 'AKARI', ls=170); c, cw = cat(sit, w + cap * .34, cap * 1.12, sink=cap * .02); b, w2 = run(f, 'ITO', x=w + cap * .34 + cw + cap * .34, ls=170)
        return svg(a + c + b, w2, cap)
    def q2():   # 細い明朝。見上げる猫
        f = frank; cap = f.g('I')['b'][3]; a, w = run(f, 'AKARI', ls=250); c, cw = cat(look, w + 240, cap * 1.0, sink=cap * .03); b, w2 = run(f, 'ITO', x=w + 240 + cw + 300, ls=250)
        return svg(a + c + b, w2, cap)
    def q3():   # 猫が ITO の I の代わりに立つ
        f = bod; cap = f.g('I')['b'][3]; a, w = run(f, 'AKARI', ls=170); c, cw = cat(sit, w + cap * .55, cap * 1.12, sink=cap * .02); b, w2 = run(f, 'TO', x=w + cap * .55 + cw + cap * .2, ls=170)
        return svg(a + c + b, w2, cap)
    def q4():   # 名前のあとに猫（句点の位置）
        f = bodb; cap = f.g('I')['b'][3]; a, w = run(f, 'AKARI', ls=120); b, w2 = run(f, 'ITO', x=w + 380, ls=120); c, cw = cat(look, w2 + 150, cap * .78, flip=True, sink=cap * .03)
        return svg(a + b + c, w2 + 150 + cw, cap)
    def q5():   # 小さな猫。名前の真ん中で控えめに
        f = frank; cap = f.g('I')['b'][3]; a, w = run(f, 'AKARI', ls=250); c, cw = cat(sit, w + cap * .5, cap * .6, sink=cap * .01); b, w2 = run(f, 'ITO', x=w + cap * .5 + cw + cap * .5, ls=250)
        return svg(a + c + b, w2, cap)
    L = [('Q1', '座る猫（ディドン）', 'AKARI と ITO のすき間に、しっぽを巻いて座る猫の影絵。猫の高さは字とほぼ同じ。', q1),
         ('Q2', '見上げる猫（細い明朝）', 'すき間で、ITO のほうを見上げる猫。細い字に、やわらかい影。', q2),
         ('Q3', '猫が I になる', 'ITO の I の位置に猫が立つ（AKARI・猫・TO）。細長い座り姿が I の代わり。気になる点：「AKARI TO」と読まれるおそれ。', q3),
         ('Q4', '名前のあとに猫（太いディドン）', '名前の最後、句点の位置に猫。名前はそのまま読める。', q4),
         ('Q5', '小さな猫（細い明朝）', 'Q1 の猫を字の6割の高さに。いちばん控えめ。', q5)]
    cards = ''.join(f'<section class="card"><header><b>{i}</b><h2>{n}</h2><p>{d}</p></header><div class="big">{fn()}</div><div class="row"><div class="small">{fn()}</div><div class="dark">{fn()}</div></div></section>' for i, n, d, fn in L)
    open('logo.html', 'w').write(f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>AKARI ITO ロゴ案</title>
<style>
:root{{--bg:#f3eee3;--ink:#111;--mute:#5b5750;--line:#d8d0c2}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 "Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",Meiryo,sans-serif}}
main{{max-width:1080px;margin:0 auto;padding:32px 16px 80px}}h1{{font-size:26px;line-height:1.3;margin:0 0 8px}}.lead{{color:var(--mute);margin:0 0 24px;max-width:46em}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:16px}}
.card{{background:#fff;border:1px solid var(--line);padding:16px;display:grid;gap:12px;align-content:start}}
.card header{{display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:baseline}}.card b{{font-size:20px}}.card h2{{font-size:16px;margin:0}}.card p{{grid-column:1/-1;margin:4px 0 0;font-size:13px;color:var(--mute)}}
.big{{padding:8px 4px}}.big svg{{display:block;width:100%;height:auto;max-height:200px}}
.row{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.small,.dark{{display:flex;align-items:center;justify-content:center;padding:12px;min-height:60px;border:1px solid var(--line)}}
.small svg,.dark svg{{display:block;height:28px;width:auto;max-width:100%}}.dark{{background:#111;color:#f3eee3;border-color:#111}}
.src{{margin-top:32px;font-size:12px;color:var(--mute)}}
</style></head><body><main>
<h1>AKARI ITO 文字ロゴ案（猫入り）第4案</h1>
<p class="lead">参考の明朝の版と同じ考えで、字と字のすき間に<strong>座った猫の影絵</strong>を入れました。猫は目もひげもない、細身の影だけです。猫の形は描いていません。パブリックドメインの影絵（Wikimedia Commons）をなぞったものです。各案の下は、小さく使ったときと黒地のときの見え方です。</p>
<div class="grid">{cards}</div>
<p class="src">猫の影絵：Wikimedia Commons「Cat silhouette.svg」「Sitting cat silhouette with eye.svg」（どちらもパブリックドメイン。後者は目の白い点を埋めた）。文字：Bodoni Moda・Frank Ruhl Libre（SIL OFL）。前の案（P1〜P6、L1〜L8）は取り下げました。</p>
</main></body></html>''')
