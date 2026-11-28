# 「AKARI ITO」猫入り文字ロゴ 第3案（logo.html を書き出す）。Craft Anything の手順で作り直し。
# 方針（依頼主と確認済み）：猫をまるごと出さない。目・ひげ・体なし。字の一画だけで猫を思わせる（耳の先／しっぽ）。
# 形は描かない。同じ書体の別の字をそのまま使う：
#   耳 = 「V」を上下逆さにした Λ（横棒のない A。とがった先が耳）
#   しっぽ = 「J」（I の下が丸まった形）／「J」を上下逆さにしたもの（I の上が丸まった形）／「Q」の払い
import sys
sys.path.insert(0, 'tools')
from catlogo import Face
F = 'assets/fonts/'

def put(g, x, mode=''):
    b = g['b']
    if mode == 'rot':      # 180度回す。足が基線に乗るようにずらす
        return f'<path transform="translate({x:.1f},{b[1]:.1f}) scale(1,-1) translate({b[0] + b[2]:.1f},{b[1] + b[3]:.1f}) scale(-1,-1)" d="{g["d"]}"/>'
    return f'<path transform="translate({x:.1f},0) scale(1,-1)" d="{g["d"]}"/>'

def word(face, spec, ls=0, space=300, extra=None):
    """spec: [(字, 置き方)]。置き方 '' そのまま / 'rot' 逆さ / ('as', 別の字, 置き方)"""
    x = 0; out = []; pos = []
    for ch, mode in spec:
        if ch == ' ': x += space; pos.append(None); continue
        src = ch
        if isinstance(mode, tuple): src, mode = mode[1], mode[2]
        g = face.g(src); pos.append((x, g)); out.append(put(g, x, mode)); x += g['adv'] + ls
    w = x - ls; cap = face.g('I')['b'][3]
    ex, pad_b = (extra(pos, cap) if extra else ('', 0))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-cap * .12:.0f} {-cap * 1.3:.0f} {w + cap * .24:.0f} {cap * 1.48 + pad_b:.0f}" role="img" aria-label="AKARI ITO"><g fill="currentColor">{"".join(out)}{ex}</g></svg>')

def S(text, **swap):
    """'AKARI ITO' の i 番目の字を差し替える。swap = {番号: 置き方}"""
    return [(ch, swap.get(str(i), swap.get(i, ''))) for i, ch in enumerate(text)]

if __name__ == '__main__':
    frank = Face(F + 'frank-ruhl-libre-latin.woff2', {'wght': 300}); bod = Face(F + 'bodoni-moda-400-latin.woff2')
    ins = Face(F + 'instrument-serif-italic-latin.woff2')
    T = 'AKARI ITO'; LAM = ('as', 'V', 'rot'); JD = ('as', 'J', ''); JU = ('as', 'J', 'rot')
    def sw(d): return [(ch, d.get(i, '')) for i, ch in enumerate(T)]
    def qtail(at, dx=0, dy=0, k=1.0, uid='q'):
        def f(pos, cap):
            x, g = pos[at]; Q = ins.g('Q'); b = Q['b']
            cut = -14
            return (f'<clipPath id="{uid}"><rect x="-3000" y="{-cut}" width="9000" height="3000"/></clipPath>'
                    f'<g clip-path="url(#{uid})"><path transform="translate({x + g["b"][2] - b[2] * k + dx:.1f},{dy:.1f}) scale({k},{-k})" d="{Q["d"]}"/></g>', cap * .2)
        return f
    C = [
      ('P1', '耳：A を「Λ」に（細い明朝）', '2つの A の横棒をなくして、とがった先を猫の耳に見立てる。ファッションのロゴでよくある形で、いちばん静か。', lambda u: word(frank, sw({0: LAM, 2: LAM}), ls=250, space=520)),
      ('P2', '耳：A を「Λ」に（ディドン）', '同じ考えを、太い細いの差が大きい書体で。耳の先がより鋭い。', lambda u: word(bod, sw({0: LAM, 2: LAM}), ls=170, space=420)),
      ('P3', 'しっぽ：ITO の I の先が丸まる', 'ITO の I の上が、立てたしっぽの先のようにくるりと曲がる。', lambda u: word(frank, sw({6: JU}), ls=250, space=520)),
      ('P4', 'しっぽ：AKARI の I が下へ伸びる', 'AKARI の最後の I が基線の下へ伸びて丸まる。気になる点：J と読まれるおそれがある。', lambda u: word(frank, sw({4: JD}), ls=250, space=520)),
      ('P5', 'しっぽ：R の足から払い（斜体）', '全体を斜体の明朝に。R の足もとから、しっぽのような払いが伸びる。', lambda u: word(ins, sw({}), ls=60, space=330, extra=qtail(3, dx=150, dy=0, k=1.0, uid=u))),
      ('P6', '耳としっぽ：Λ と丸まる I', 'P1 と P3 を合わせた版。耳が2つ、しっぽが1本。', lambda u: word(frank, sw({0: LAM, 2: LAM, 6: JU}), ls=250, space=520)),
    ]
    cards = ''.join(f'<section class="card"><header><b>{i}</b><h2>{n}</h2><p>{d}</p></header><div class="big">{fn(i.lower())}</div><div class="row"><div class="small">{fn(i.lower() + "s")}</div><div class="dark">{fn(i.lower() + "d")}</div></div></section>' for i, n, d, fn in C)
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
</style></head><body><main>
<h1>AKARI ITO 文字ロゴ案（猫入り）第3案</h1>
<p class="lead">猫をまるごと出すのをやめました。目・ひげ・体はなく、字の一画だけで猫を思わせます（耳の先／しっぽ）。形は描いていません。耳は同じ書体の「V」を逆さにしたもの、しっぽは同じ書体の「J」や「Q」の一部です。各案の下は、小さく使ったときと黒地のときの見え方です。</p>
<div class="grid">{cards}</div>
</main></body></html>''')
