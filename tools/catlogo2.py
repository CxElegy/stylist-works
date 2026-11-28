# 「AKARI ITO」の猫つき文字ロゴ 第2案（logo.html を書き出す）。
# 参考（審美図鑑 CAT 字母 Logo）を見直した結果：耳だけ貼るのではなく「猫まるごと」を字に溶かす。
#   ・字の一画が猫の一部を兼ねる（しっぽ＝I）　・字と字のすき間に猫が座る　・太い字の中を猫の形に抜く
# 猫の形は描かない。公開されているアイコンの輪郭を使う（assets/logo/cats.json。出どころと許諾は logo.html の末尾）。
import json, re, sys
sys.path.insert(0, 'tools')
from catlogo import Face
CATS = json.load(open('assets/logo/cats.json'))

def cat(name, x, y, h, flip=False, black=False):
    c = CATS[name]; w = h * c['w'] / c['h']; body = c['body']
    if black: body = re.sub(r'fill="#[0-9a-fA-F]+"', 'fill="currentColor"', body); body = re.sub(r'opacity="[^"]+"', '', body)
    t = f'translate({x + (w if flip else 0):.1f},{y:.1f}) scale({(-1 if flip else 1) * h / c["h"]:.4f},{h / c["h"]:.4f})'
    return f'<g transform="{t}">{body}</g>', w

def text(face, s, x0=0, ls=0, space=300, skip=()):
    out = []; x = x0; pos = []
    for i, ch in enumerate(s):
        if ch == ' ': pos.append((x, None)); x += space; continue
        g = face.g(ch); pos.append((x, g))
        if i not in skip: out.append(f'<path transform="translate({x:.1f},0) scale(1,-1)" d="{g["d"]}"/>')
        x += g['adv'] + ls
    return ''.join(out), pos, x - ls

def svg(inner, x0, y0, w, h, defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}" role="img" aria-label="AKARI ITO"><defs>{defs}</defs><g fill="currentColor">{inner}</g></svg>'

def n1(uid):   # しっぽ＝AKARI の最後の I。体は語と語のすき間に座る
    f = Face('assets/fonts/archivo-var-latin.woff2', {'wght': 640, 'wdth': 100}); cap = f.g('I')['b'][3]
    a, pos, w1 = text(f, 'AKAR', ls=70)
    H = cap * 1.42; c, cw = cat('fa6-solid:cat', w1 + 20, -H, H)
    b, pos2, w2 = text(f, 'ITO', x0=w1 + 20 + cw + 70, ls=70)
    return svg(a + c + b, -40, -cap * 1.55, w2 + 80, cap * 1.7)

def n2(uid):   # 太い字の O の中を、座った猫の形に抜く
    f = Face('assets/fonts/anton-latin.woff2'); cap = f.g('I')['b'][3]
    a, pos, w = text(f, 'AKARI ITO', ls=36, space=210, skip=(8,))
    x, g = pos[8]; b = g['b']
    H = (b[2] - b[0]) * .62 * 512 / 576; c, cw = cat('fa6-solid:cat', 0, 0, H)
    cx = x + (b[0] + b[2]) / 2
    c, _ = cat('fa6-solid:cat', cx - cw / 2, -(b[1] + b[3]) / 2 - H / 2, H)
    defs = f'<mask id="{uid}"><rect x="-9999" y="-9999" width="29999" height="29999" fill="#fff"/><g fill="#000" color="#000">{c}</g></mask>'
    # O の外側の輪郭だけを塗る（中の穴は猫に置き換える）：最初の輪郭 = 外側
    outer = g['d'].split('Z')[0] + 'Z'
    o = f'<g mask="url(#{uid})"><path transform="translate({x:.1f},0) scale(1,-1)" d="{outer}"/></g>'
    return svg(a + o, -30, -cap * 1.12, w + 60, cap * 1.24, defs)

def n3(uid):   # 細い明朝。語と語のすき間を、歩く猫が通る
    f = Face('assets/fonts/frank-ruhl-libre-latin.woff2', {'wght': 300}); cap = f.g('I')['b'][3]
    a, pos, w1 = text(f, 'AKARI', ls=230)
    H = cap * .95; c, cw = cat('fxemoji:catside', w1 + 200, -H * .985, H, black=True)
    b, pos2, w2 = text(f, 'ITO', x0=w1 + 200 + cw + 200, ls=230)
    return svg(a + c + b, -40, -cap * 1.25, w2 + 80, cap * 1.42)

def n4(uid):   # 小文字。i の点が猫の顔
    f = Face('assets/fonts/archivo-var-latin.woff2', {'wght': 700, 'wdth': 100})
    a, pos, w = text(f, 'akarı ıto' if ord('ı') in f.cm else 'akari ito', ls=20, space=260)
    xh = f.g('x')['b'][3]; out = a
    for i in (4, 6):
        x, g = pos[i]; cx = x + (g['b'][0] + g['b'][2]) / 2
        if i == 6:
            H = xh * .62; c, cw = cat('ph:cat-fill', 0, 0, H); c, _ = cat('ph:cat-fill', cx - cw / 2, -xh - H - xh * .12, H); out += c
        else:
            d = f.g('.'); k = 1.0; dc = (d['b'][0] + d['b'][2]) / 2
            out += f'<path transform="translate({cx - dc:.1f},{-xh - xh * .2:.1f}) scale(1,-1)" d="{d["d"]}"/>'
    asc = f.g('k')['b'][3]
    return svg(out, -40, -asc * 1.28, w + 80, asc * 1.42)

def n5(uid):   # 太いゴシック。T の横棒の上で猫が寝そべる
    f = Face('assets/fonts/archivo-var-latin.woff2', {'wght': 800, 'wdth': 100}); cap = f.g('I')['b'][3]
    a, pos, w = text(f, 'AKARI ITO', ls=80, space=300)
    x, g = pos[7]; b = g['b']; W = (b[2] - b[0]) * 1.02; c0 = CATS['game-icons:cat']; H = W * c0['h'] / c0['w']
    c, cw = cat('game-icons:cat', x + b[0] - W * .0, -cap - H * .80, H)
    return svg(a + c, -40, -cap * 1.75, w + 80, cap * 1.9)

if __name__ == '__main__':
    C = [('N1', 'しっぽが「I」', 'AKARI の最後の I が、そのまま猫の立てたしっぽ。体は AKARI と ITO のすき間に座る。参考の「一画が猫を兼ねる」やり方。', n1),
         ('N2', 'O の中が猫', '太い字の O の穴を、座った猫の形に抜いた。参考の「猫は空いている所」のやり方。', n2),
         ('N3', 'すき間を猫が歩く', '細い明朝。名前の間を小さな猫が通る。いちばん静かで上品。', n3),
         ('N4', 'i の点が猫', '小文字にして、ito の i の点を猫の顔に。字はそのまま読める。', n4),
         ('N5', 'T の上で寝そべる', '太い字。T の横棒を棚にして、猫が乗っている。', n5)]
    cards = ''
    for i, n, d, fn in C:
        cards += f'<section class="card"><header><b>{i}</b><h2>{n}</h2><p>{d}</p></header><div class="big">{fn(i.lower())}</div><div class="row"><div class="small">{fn(i.lower() + "s")}</div><div class="dark">{fn(i.lower() + "d")}</div></div></section>'
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
.small svg,.dark svg{{display:block;height:26px;width:auto;max-width:100%}}.dark{{background:#111;color:#f3eee3;border-color:#111}}
.src{{margin-top:32px;font-size:12px;color:var(--mute)}}
</style></head><body><main>
<h1>AKARI ITO 文字ロゴ案（猫入り）第2案</h1>
<p class="lead">参考の「CAT 字母 Logo」を見直しました。前の案は O に耳を貼っただけでしたが、参考はどれも<strong>猫まるごと</strong>が字に溶けています（一画がしっぽを兼ねる／字のすき間に猫が座る／太い字の中を猫の形に抜く）。その3つのやり方で作り直した5案です。各案の下は、小さく使ったときと黒地のときの見え方です。</p>
<div class="grid">{cards}</div>
<p class="src">猫の形は描いていません。公開アイコンの輪郭を使った試作です：N1・N2 = Font Awesome Free「cat」（CC BY 4.0）／N3 = FxEmoji「catside」（Apache 2.0）／N4 = Phosphor「cat-fill」（MIT）／N5 = game-icons.net「cat」Lorc（CC BY 3.0）。文字は Archivo・Anton・Frank Ruhl Libre（SIL OFL）。案が決まったら、その猫を伊藤さん専用の形に作り直します。</p>
</main></body></html>''')
