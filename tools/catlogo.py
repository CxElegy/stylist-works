# 13F の「猫の耳つきロゴ」を作るスクリプト（試作）。書体ファイルから A と O の輪郭を取り出し、A の先端を耳として O に載せる。
# 使い方の元データ wm.json は fontTools で assets/fonts の Archivo（wght500 wdth118）と Frank Ruhl Libre から作った。
import json,sys,math
S='/tmp/claude-0/-home-user/8e9b0926-5715-5300-8555-ac6cfd5ef825/scratchpad'
W=json.load(open(S+'/wm.json'))
def logo(mood,ls,cut,k,ang,spread,lift,eyes=0,eyek=.5,eyey=330,eyedx=150,fill='#111',idp='c',sx=1,sy=1):
  d=W[mood];x=0;parts=[];ox=None
  for ch in 'AKARI ITO':
    if ch==' ': x+=280+ls; continue
    g=d[ch]
    if ch=='O': ox=x
    parts.append(f'<path transform="translate({x},0)" d="{g["d"]}"/>'); x+=g['adv']+ls
  wid=x-ls
  A=d['A'];ax=(A['b'][0]+A['b'][2])/2;top=A['b'][3]
  O=d['O'];cx=ox+(O['b'][0]+O['b'][2])/2;r=(O['b'][2]-O['b'][0])/2;cy=(O['b'][1]+O['b'][3])/2;ry=(O['b'][3]-O['b'][1])/2
  ears=''
  for s in (-1,1):
    t=math.radians(90-s*spread);ex=cx+r*math.cos(t);ey=cy+ry*math.sin(t)-lift
    ears+=f'<g transform="translate({ex:.1f},{ey:.1f}) rotate({-s*ang}) scale({k*sx},{k*sy}) translate({-ax:.1f},{-cut})"><path clip-path="url(#{idp}{mood})" d="{A["d"]}"/></g>'
  ey_=''
  if eyes:
    P=d['.'];pc=(P['b'][0]+P['b'][2])/2
    for s in (-1,1): ey_+=f'<g transform="translate({cx+s*eyedx-pc*eyek:.1f},{eyey}) scale({eyek})"><path d="{P["d"]}"/></g>'
  h=1000
  return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -{top*1.5:.0f} {wid:.0f} {top*1.5+30:.0f}" role="img" aria-label="AKARI ITO"><defs><clipPath id="{idp}{mood}"><rect x="-2000" y="{cut}" width="6000" height="3000"/></clipPath></defs><g transform="scale(1,-1)" fill="{fill}">{"".join(parts)}{ears}{ey_}</g></svg>'
if __name__=='__main__':
  html='<body style="margin:0;background:#f7f7f7;font:13px sans-serif">'
  V=[('cold',200,380,.42,18,38,25,0),('cold',200,450,.5,22,42,20,0),('cold',200,380,.42,18,38,25,1),('warm',300,420,.45,18,40,20,0),('warm',300,420,.45,18,40,20,1),('cold',200,300,.35,25,45,30,0)]
  for i,v in enumerate(V):
    html+=f'<div style="padding:10px 20px;border-bottom:1px solid #ccc">v{i} {v}<div style="width:900px">{logo(*v,idp="c%d"%i)}</div><div style="width:200px;margin-top:8px">{logo(*v,idp="s%d"%i)}</div></div>'
  html+='<div style="padding:10px"><svg viewBox="0 -800 900 850" width="300"><g transform="scale(1,-1)"><path d="'+W['cold']['A']['d']+'"/></g><g stroke="red">'+''.join(f'<line x1="0" x2="900" y1="{-y}" y2="{-y}" stroke-width="3"/><text x="0" y="{-y-6}" font-size="40" fill="red">{y}</text>' for y in (300,380,450,520))+'</g></svg><svg viewBox="0 -800 700 850" width="240"><g transform="scale(1,-1)"><path d="'+W['warm']['A']['d']+'"/></g><g stroke="red">'+''.join(f'<line x1="0" x2="900" y1="{-y}" y2="{-y}" stroke-width="3"/><text x="0" y="{-y-6}" font-size="40" fill="red">{y}</text>' for y in (300,420,500))+'</g></svg></div>'
  open(S+'/wm.html','w').write(html)
