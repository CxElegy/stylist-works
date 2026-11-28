# 「AKARI ITO」の猫つき文字ロゴの案を作る（logo.html を書き出す）。
# 形は自分で描かない：書体ファイルから文字の輪郭を取り出し、同じ書体の「A」の先端を切って耳にする。目は同じ書体の「.」。
# 使い方: pip install fonttools brotli → python3 tools/catlogo.py
import math
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen

def load(fn, loc=None):
    f = TTFont(fn)
    if 'fvar' in f and loc:
        ax = {a.axisTag: (a.minValue, a.maxValue) for a in f['fvar'].axes}
        f = instancer.instantiateVariableFont(f, {k: max(ax[k][0], min(ax[k][1], v)) for k, v in loc.items() if k in ax})
    return f

class Face:
    def __init__(self, fn, loc=None):
        self.f = load(fn, loc); self.gs = self.f.getGlyphSet(); self.cm = self.f.getBestCmap()
    def g(self, ch):
        n = self.cm[ord(ch)]; p = SVGPathPen(self.gs); self.gs[n].draw(p); b = BoundsPen(self.gs); self.gs[n].draw(b)
        return {'d': p.getCommands(), 'adv': self.gs[n].width, 'b': b.bounds}
    def counter_top(self, ch='A'):          # A の中の三角の頂点の高さ（ここより上は中身の詰まった先端）
        n = self.cm[ord(ch)]; r = DecomposingRecordingPen(self.gs); self.gs[n].draw(r)
        cons, cur = [], []
        for op, pts in r.value:
            if op == 'moveTo': cur = [pts[0]]
            elif op in ('closePath', 'endPath'): cons.append(cur); cur = []
            else: cur += list(pts)
        boxes = sorted(((max(x for x, y in c) - min(x for x, y in c)) * (max(y for x, y in c) - min(y for x, y in c)), max(y for x, y in c)) for c in cons if c)
        return boxes[0][1] if len(boxes) > 1 else self.g(ch)['b'][3] * .6

def logo(face, text, uid, ls=120, space=300, target='O', which=-1, eyes=False, earh=.24, spread=40, ang=18, sink=.05, lines=None, tbar=False, sx=1.0):
    A = face.g('A'); top = A['b'][3]; cut = face.counter_top() + (top - face.counter_top()) * .12
    ax = (A['b'][0] + A['b'][2]) / 2
    rows = lines or [text]; out = []; W = 0; y0 = 0; capH = top
    hits = [(ri, i) for ri, row in enumerate(rows) for i, ch in enumerate(row) if ch == target]
    hit = hits[which] if hits else None
    lead = capH * 1.42
    for ri, row in enumerate(rows):
        x = 0; yoff = -ri * lead
        for i, ch in enumerate(row):
            if ch == ' ': x += space; continue
            g = face.g(ch)
            out.append(f'<path transform="translate({x:.1f},{yoff:.1f})" d="{g["d"]}"/>')
            if hit == (ri, i):
                b = g['b']; cx = x + (b[0] + b[2]) / 2; cy = yoff + (b[1] + b[3]) / 2; rx = (b[2] - b[0]) / 2; ry = (b[3] - b[1]) / 2
                k = earh * (b[3] - b[1]) / (top - cut)
                for s in (-1, 1):
                    if tbar:   # T の横棒の両端に耳
                        ex = cx + s * (rx - (A['b'][2] - A['b'][0]) * k * .16); ey = yoff + b[3] - sink * (b[3] - b[1]); a = ang
                    else:
                        t = math.radians(90 - s * spread); ex = cx + rx * math.cos(t); ey = cy + ry * math.sin(t) - sink * (b[3] - b[1]); a = ang
                    out.append(f'<g transform="translate({ex:.1f},{ey:.1f}) rotate({-s * a}) scale({k*sx:.3f},{k:.3f}) translate({-ax:.1f},{-cut:.1f})"><path clip-path="url(#{uid})" d="{A["d"]}"/></g>')
                if eyes:
                    P = face.g('.'); pc = (P['b'][0] + P['b'][2]) / 2; pm = (P['b'][1] + P['b'][3]) / 2; ek = .1 * (b[3] - b[1]) / max(1, P['b'][3] - P['b'][1])
                    for s in (-1, 1):
                        out.append(f'<g transform="translate({cx + s * rx * .36:.1f},{cy - ry * .02:.1f}) scale({ek:.3f}) translate({-pc:.1f},{-pm:.1f})"><path d="{P["d"]}"/></g>')
            x += g['adv'] + ls
        W = max(W, x - ls)
    up = capH * 1.36; down = (len(rows) - 1) * lead + capH * .3
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-capH * .1:.0f} {-up:.0f} {W + capH * .32:.0f} {up + down:.0f}" role="img" aria-label="AKARI ITO">'
            f'<defs><clipPath id="{uid}"><rect x="-3000" y="{cut:.1f}" width="9000" height="4000"/></clipPath></defs>'
            f'<g transform="scale(1,-1)" fill="currentColor">{"".join(out)}</g></svg>')

if __name__ == '__main__':
    F = 'assets/fonts/'
    arch = Face(F + 'archivo-var-latin.woff2', {'wght': 500, 'wdth': 118})
    archb = Face(F + 'archivo-var-latin.woff2', {'wght': 800, 'wdth': 100})
    frank = Face(F + 'frank-ruhl-libre-latin.woff2', {'wght': 300})
    bod = Face(F + 'bodoni-moda-400-latin.woff2'); bodb = Face(F + 'bodoni-moda-700-latin.woff2')
    anton = Face(F + 'anton-latin.woff2'); ins = Face(F + 'instrument-serif-italic-latin.woff2')
    T = 'AKARI ITO'
    C = [
      ('L1', '細いゴシック・O に耳', 'いちばん静か。字はそのまま読めて、最後の O だけ猫。', logo(arch, T, 'l1', ls=200)),
      ('L2', '細い明朝・O に耳', 'やわらかく上品。耳は小さめ。', logo(frank, T, 'l2', ls=300, earh=.2)),
      ('L3', 'ディドン（太い細いの差が大きい明朝）・O に耳', 'ファッション誌の題字のような書体。耳がとがって猫らしい。', logo(bod, T, 'l3', ls=170, earh=.26, ang=14)),
      ('L4', 'ディドン・O に耳と目', 'L3 に目を足した版。猫だと一目で分かるが、少し具体的。', logo(bod, T, 'l4', ls=170, earh=.26, ang=14, eyes=True)),
      ('L5', '太いディドン・2行', '名前を2行に重ねた版。正方形に近く、アイコンにも使いやすい。', logo(bodb, T, 'l5', ls=110, earh=.26, ang=14, lines=['AKARI', 'ITO'])),
      ('L6', '細長い太字・O に耳', 'いまの 11D・12番台の名前と同じ書体（Anton）。力強い。', logo(anton, T, 'l6', ls=40, space=220, earh=.15, spread=50, ang=16, sx=.34, sink=.03)),
      ('L7', '太いゴシック・T の横棒に耳', 'T の横棒を猫の頭の上に見立てて、両端に耳。O ではなく T が猫。', logo(archb, T, 'l7', ls=90, target='T', tbar=True, earh=.16, ang=14, sink=.02, sx=.7)),
      ('L8', '斜体の明朝・小文字まじり', '「Akari Ito」。やさしい手紙のような雰囲気。最後の o に耳。', logo(ins, 'Akari Ito', 'l8', ls=10, space=230, target='o', earh=.26, spread=30, ang=6, sink=.1, sx=.8)),
    ]
    cards = ''.join(f'''<section class="card"><header><b>{i}</b><h2>{n}</h2><p>{d}</p></header>
<div class="big">{s}</div><div class="row"><div class="small">{s.replace('id="l', 'id="s').replace('url(#l', 'url(#s')}</div><div class="dark">{s.replace('id="l', 'id="d').replace('url(#l', 'url(#d')}</div></div></section>''' for i, n, d, s in C)
    open('logo.html', 'w').write(f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>AKARI ITO ロゴ案</title>
<style>
:root{{--bg:#f3eee3;--ink:#111;--mute:#5b5750;--line:#d8d0c2}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 "Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",Meiryo,sans-serif}}
main{{max-width:1080px;margin:0 auto;padding:32px 16px 80px}}h1{{font-size:26px;line-height:1.3;margin:0 0 8px}}.lead{{color:var(--mute);margin:0 0 24px;max-width:46em}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:16px}}
.card{{background:#fff;border:1px solid var(--line);padding:16px;display:grid;gap:12px}}
.card header{{display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:baseline}}.card b{{font-size:20px}}.card h2{{font-size:16px;margin:0}}.card p{{grid-column:1/-1;margin:4px 0 0;font-size:13px;color:var(--mute)}}
.big{{padding:8px 4px}}.big svg{{display:block;width:100%;height:auto;max-height:190px}}
.row{{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:stretch}}
.small,.dark{{display:flex;align-items:center;justify-content:center;padding:12px;min-height:56px;border:1px solid var(--line)}}
.small svg,.dark svg{{display:block;height:22px;width:auto;max-width:100%}}.dark{{background:#111;color:#f3eee3;border-color:#111}}
</style></head><body><main>
<h1>AKARI ITO 文字ロゴ案（猫入り）</h1>
<p class="lead">審美図鑑の「CAT 字母 Logo」の決まり（字が先に読める／いまある線を猫の一部に借りる／猫は耳など一つ二つの特徴だけ／単色）で作った8案です。形は描いていません。耳はそれぞれ同じ書体の「A」の先端を切り出したもの、目は同じ書体の「.」です。各案の下は、小さく使ったとき（ページの上のロゴの大きさ）と、黒地のときの見え方です。</p>
<div class="grid">{cards}</div>
</main></body></html>''')
