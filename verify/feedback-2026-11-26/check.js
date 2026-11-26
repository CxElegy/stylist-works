/* 2026-11-26 のフィードバック対応（r4-snog.html）を数字で確かめる。
   使い方: python3 -m http.server 8765 を起動してから  node verify/feedback-2026-11-26/check.js [前の版のファイル名]
   前の版（git の1つ前の r4-snog.html を別名で置いたもの）を渡すと、トップの写真の位置が変わっていないかも比べる */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
const BEFORE = process.argv[2] || '';
const out = []; let fails = 0;
function ok(name, pass, detail) { out.push(`| ${name} | ${detail === undefined ? '' : String(detail).replace(/\|/g, '/')} | ${pass ? '合格' : '**不合格**'} |`); if (!pass) fails++; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rects = p => p.evaluate(() => [...document.querySelectorAll('.tile')].map(a => { const r = a.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10); }));
const st = p => p.evaluate(() => { const q = id => document.getElementById(id), lb = q('lb'), d = q('detail'); return {
  detail: !d.hidden && getComputedStyle(d).opacity === '1', lb: !lb.hidden && getComputedStyle(lb).opacity === '1',
  ct: lb.querySelector('.ct').textContent, src: (lb.querySelector('img').getAttribute('src') || ''), h2: d.querySelector('h2').textContent,
  n: d.querySelectorAll('ol li').length, stage: getComputedStyle(q('stage')).visibility, hash: location.hash, focus: document.activeElement && (document.activeElement.id || document.activeElement.tagName + '.' + document.activeElement.className) }; });
const settle = async p => { await p.evaluate(async () => { const d = document.getElementById('detail'); for (let y = 0; y < d.scrollHeight; y += 500) { d.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } d.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); }); };
const grid = p => p.evaluate(() => { const lis = [...document.querySelectorAll('#detail ol li')]; const R = lis.map(li => { const r = li.getBoundingClientRect(), im = li.querySelector('img'), ir = im.getBoundingClientRect(); return { wide: li.classList.contains('wide'), l: Math.round(r.left), t: Math.round(r.top), w: r.width, ratioErr: Math.abs(ir.width / ir.height - im.naturalWidth / im.naturalHeight) / (im.naturalWidth / im.naturalHeight), fit: getComputedStyle(im).objectFit, loaded: im.complete && im.naturalWidth > 0, src: im.getAttribute('src') }; });
  const cols = [...new Set(R.filter(x => !x.wide).map(x => x.l))].length; const order = R.map((x, i) => ({ i, t: x.t, l: x.l })).sort((a, b) => (a.t - b.t) || (a.l - b.l)).map(o => R[o.i].src);
  return { cols, wide: R.filter(x => x.wide).length, maxRatioErr: Math.max(...R.map(x => x.ratioErr)), fits: [...new Set(R.map(x => x.fit))], loaded: R.filter(x => x.loaded).length, order, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, dOverflowX: document.getElementById('detail').scrollWidth - document.getElementById('detail').clientWidth }; });

(async () => {
  const b = await chromium.launch();
  /* ================= パソコン 1440x900 ================= */
  {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
    await p.goto(BASE + 'r4-snog.html?tone=sand'); await p.mouse.move(720, 450); await sleep(4500);
    const rest = await rects(p);
    if (BEFORE) { const p0 = await c.newPage(); await p0.goto(BASE + BEFORE); await p0.mouse.move(720, 450); await sleep(4500); const r0 = await rects(p0); await p0.close();
      const d = Math.max(...rest.flatMap((r, i) => r.map((v, k) => Math.abs(v - r0[i][k])))); ok('PC トップの写真8点の位置と大きさが前の版と同じ', d <= 0.5, '最大の差 ' + d + 'px'); }
    /* hover */
    const r0 = rest[2]; await p.mouse.move(r0[0] + r0[2] / 2, r0[1] + r0[3] / 2); await sleep(700);
    const hov = await p.evaluate(() => { const h = document.querySelector('.tile.hot'); const t = document.getElementById('title'); return { hot: !!h, scale: h ? new DOMMatrix(getComputedStyle(h.querySelector('img')).transform).a : 0, title: t.hidden ? '' : t.textContent, ring: document.getElementById('ring').classList.contains('on') }; });
    ok('PC 写真に触れると 1.4倍・大きな文字・丸いカーソルが出る（今までどおり）', hov.hot && Math.abs(hov.scale - 1.4) < 0.02 && !!hov.title && hov.ring, JSON.stringify(hov));
    await p.mouse.move(720, 450); await sleep(900);
    /* open Beauty */
    const t0 = Date.now(); await p.evaluate(() => document.querySelector('.tile').click());
    await p.waitForFunction(() => !document.getElementById('detail').hidden, null, { timeout: 5000 }); const tOpen = Date.now() - t0; await sleep(1500);
    await settle(p); let s = await st(p); const g = await grid(p);
    ok('PC BEAUTY を押すと一覧が開く（集まる動きのあと）', s.detail && tOpen > 1500 && tOpen < 2300, '押してから ' + tOpen + 'ms');
    ok('PC 見出しが「— Beauty —」', s.h2 === '— Beauty —', s.h2);
    ok('PC 一覧は13点・3列', s.n === 13 && g.cols === 3, s.n + '点 / ' + g.cols + '列（見開き ' + g.wide + '点は2列ぶん）');
    ok('PC 一覧の写真は切れていない・歪んでいない', g.maxRatioErr < 0.01 && g.fits.join() === 'fill', '縦横比の差 最大 ' + (g.maxRatioErr * 100).toFixed(2) + '%');
    ok('PC 一覧の写真がすべて読み込める', g.loaded === 13, g.loaded + '/13');
    ok('PC 横にはみ出さない', g.overflowX <= 0 && g.dOverflowX <= 0, g.overflowX + ' / ' + g.dOverflowX);
    /* lightbox */
    await p.click('#detail ol li:nth-child(1) button'); await sleep(600); s = await st(p);
    ok('PC 一覧の写真を押すと拡大表示が開く', s.lb && s.ct === '01 / 13' && s.src === g.order[0], s.ct + ' ' + s.src);
    const fit = await p.evaluate(() => { const im = document.querySelector('#lb img'), r = im.getBoundingClientRect(); return { in: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, err: Math.abs(r.width / r.height - im.naturalWidth / im.naturalHeight) / (im.naturalWidth / im.naturalHeight), w: Math.round(r.width), h: Math.round(r.height) }; });
    ok('PC 拡大した写真が画面に収まり、切れていない', fit.in && fit.err < 0.01, fit.w + '×' + fit.h);
    await p.click('#lb .nx'); await sleep(700); s = await st(p); ok('PC 「次へ」で次の写真', s.ct === '02 / 13' && s.src === g.order[1], s.ct);
    await p.keyboard.press('ArrowRight'); await sleep(700); s = await st(p); ok('PC →キーで次の写真', s.ct === '03 / 13' && s.src === g.order[2], s.ct);
    await p.keyboard.press('ArrowLeft'); await sleep(700); s = await st(p); ok('PC ←キーで前の写真', s.ct === '02 / 13' && s.src === g.order[1], s.ct);
    await p.click('#lb .pv'); await sleep(700); await p.click('#lb .pv'); await sleep(700); s = await st(p); ok('PC 「前へ」で最初から最後へ回る', s.ct === '13 / 13' && s.src === g.order[12], s.ct);
    await p.keyboard.press('Escape'); await sleep(500); s = await st(p); ok('PC Esc で閉じて一覧に戻る', !s.lb && s.detail, 'フォーカス: ' + s.focus);
    await p.click('#detail ol li:nth-child(2) button'); await sleep(600); await p.mouse.click(720, 12); await sleep(500); s = await st(p); ok('PC 写真の外（背景）を押すと閉じて一覧に戻る', !s.lb && s.detail);
    await p.click('#detail ol li:nth-child(3) button'); await sleep(600); await p.click('#lb .x'); await sleep(500); s = await st(p); ok('PC 閉じるボタンで一覧に戻る', !s.lb && s.detail);
    await p.click('#detail ol li:nth-child(3) button'); await sleep(600); await p.goBack(); await sleep(600); s = await st(p); ok('PC ブラウザの「戻る」で拡大表示だけ閉じる', !s.lb && s.detail && s.hash === '#beauty', s.hash);
    await p.mouse.move(720, 450); /* 写真はマウスと逆に動くので、比べる前にマウスを最初と同じ中央へ */
    await p.goBack(); await sleep(3000); s = await st(p); const back = await rects(p);
    const dd = Math.max(...rest.flatMap((r, i) => r.map((v, k) => Math.abs(v - back[i][k]))));
    ok('PC もう一度「戻る」でトップに戻り、写真が元の位置に開く', !s.detail && s.stage === 'visible' && dd <= 0.5, '位置の差 最大 ' + dd + 'px');
    await p.evaluate(() => document.querySelector('.tile').click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(900);
    await p.click('#closeDetail'); await sleep(600); s = await st(p); ok('PC 一覧の × でトップに戻る', !s.detail && s.stage === 'visible' && s.hash === '');
    /* ほかのジャンルも同じ形 */
    await sleep(1500); await p.evaluate(() => document.querySelectorAll('.tile')[1].click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(1200);
    s = await st(p); ok('PC ほかのジャンル（Kids）も同じ形で開く', s.detail && s.h2 === '— Kids —' && s.n >= 4, s.h2 + ' ' + s.n + '点'); await p.click('#closeDetail'); await sleep(1800);
    /* 一覧の最後：ほかのジャンルと相談 */
    await p.evaluate(() => document.querySelector('.tile').click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(1200);
    const more = await p.evaluate(() => { const m = document.querySelector('#detail .more'); return { n: m.querySelectorAll('li button').length, names: [...m.querySelectorAll('li button')].map(b => b.textContent).join(','), mail: (m.querySelector('.c a') || {}).href || '' }; });
    ok('PC 一覧の最後に、ほかのジャンル6つと相談のリンクがある', more.n === 6 && /^mailto:/.test(more.mail) && !/Beauty/.test(more.names), more.names + ' / ' + more.mail);
    await p.evaluate(() => { const b = [...document.querySelectorAll('#detail .more li button')].find(x => x.textContent === 'Portrait'); b.scrollIntoView(); b.click(); }); await sleep(900); s = await st(p);
    ok('PC 一覧の最後から別のジャンルへ直接移れる', s.detail && s.h2 === '\u2014 Portrait \u2014' && s.hash === '#portrait', s.h2 + ' ' + s.hash);
    await p.click('#closeDetail'); await sleep(2200); s = await st(p); ok('PC 移ったあとの × でもトップに戻る', !s.detail && s.hash === '', s.hash);
    await p.goForward(); await sleep(900); s = await st(p); ok('PC ブラウザの「進む」でジャンルの一覧に入り直せる', s.detail && s.h2 === '\u2014 Portrait \u2014', s.h2);
    await p.goBack(); await sleep(2200); s = await st(p); ok('PC そこから「戻る」でトップ', !s.detail);
    /* 誌面を読める大きさに */
    await p.evaluate(() => document.querySelector('.tile').click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(1200);
    await p.click('#detail ol li:nth-child(1) button'); await sleep(900);
    const z0 = await p.evaluate(() => Math.round(document.querySelector('#lb img').getBoundingClientRect().width)); await p.click('#lb img'); await sleep(400);
    const z1 = await p.evaluate(() => { const im = document.querySelector('#lb img'); return { w: Math.round(im.getBoundingClientRect().width), nat: im.naturalWidth, zoom: document.getElementById('lb').classList.contains('zoom'), scroll: document.getElementById('lb').scrollHeight > innerHeight }; });
    ok('PC 拡大中の写真を押すと元の大きさになり、縦に送って読める', z1.zoom && z1.w === z1.nat && z1.w > z0 && z1.scroll, z0 + 'px → ' + z1.w + 'px');
    await p.click('#lb img'); await sleep(300); const z2 = await p.evaluate(() => Math.round(document.querySelector('#lb img').getBoundingClientRect().width)); ok('PC もう一度押すと元の収まる大きさに戻る', z2 === z0, z2 + 'px');
    await p.click('#lb img'); await sleep(300); await p.keyboard.press('Escape'); await sleep(300); s = await st(p); const zz = await p.evaluate(() => document.getElementById('lb').classList.contains('zoom')); ok('PC 大きくした状態の Esc は、まず元の大きさに戻すだけ', s.lb && !zz);
    await p.keyboard.press('Escape'); await sleep(500); await p.click('#closeDetail'); await sleep(2200);
    /* tones */
    const want = { sand: ['rgb(163, 145, 102)', 'rgb(120, 104, 80)'], dusk: ['rgb(128, 150, 166)', 'rgb(88, 106, 120)'], clay: ['rgb(196, 130, 108)', 'rgb(148, 88, 74)'], red: ['rgb(220, 47, 30)', 'rgb(220, 47, 30)'] }; let tonesOk = true; const seen = [];
    for (const t of Object.keys(want)) { await p.click(`#tones [data-tone="${t}"]`); await sleep(120); const got = await p.evaluate(() => [getComputedStyle(document.querySelector('#nav .wm')).color, getComputedStyle(document.body).color]); seen.push(t + ':' + got.join('/')); if (got[0] !== want[t][0] || got[1] !== want[t][1]) tonesOk = false; }
    ok('PC 文字色の4つのボタンで、大きな文字と小さな文字の色が切り替わる', tonesOk, seen.join(' ; '));
    const cr = c => { const m = c.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 1.05 / (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] + 0.05); };
    const ratios = Object.keys(want).map(t => t + ' 大' + cr(want[t][0]).toFixed(2) + ' 小' + cr(want[t][1]).toFixed(2));
    ok('PC 文字のコントラスト：大きな文字 3:1 以上、小さな文字 4.5:1 以上', Object.keys(want).every(t => cr(want[t][0]) >= 3 && cr(want[t][1]) >= 4.5), ratios.join(' ; '));
    await p.click('#tones [data-tone="sand"]'); await p.click('#tones [data-pale="1"]'); await sleep(120); const pale = await p.evaluate(() => getComputedStyle(document.querySelector('#nav .wm')).color); await p.click('#tones [data-pale="0"]');
    ok('PC 「うすい」を押すと大きな文字だけさらに淡くなる', pale === 'rgb(198, 181, 152)', pale + '（比 ' + cr(pale).toFixed(2) + '）');
    await p.click('#tones [data-tone="dusk"]'); await p.goto(BASE + 'r4-snog.html'); await sleep(300); const kept = await p.evaluate(() => document.documentElement.getAttribute('data-tone')); ok('PC 選んだ文字色は開き直しても残る', kept === 'dusk', kept);
    /* 住所にジャンル名があるとき */
    await p.goto(BASE + 'index.html'); await p.goto(BASE + 'r4-snog.html?tone=sand#kids'); await sleep(1200); s = await st(p);
    ok('PC 住所に #kids を付けて開くと、Kids の一覧が直接開く', s.detail && s.h2 === '\u2014 Kids \u2014', s.h2);
    await p.click('#closeDetail'); await sleep(2200); s = await st(p); const url = await p.evaluate(() => location.pathname.split('/').pop() + location.hash);
    ok('PC 直接開いたあとの × は、サイトの外へ出ずにトップを開く', !s.detail && s.stage === 'visible' && url === 'r4-snog.html', url);
    const og = await p.evaluate(() => ({ img: (document.querySelector('meta[property="og:image"]') || {}).content || '', title: (document.querySelector('meta[property="og:title"]') || {}).content || '' })); const ogOk = await p.evaluate(async () => (await fetch('images/og.jpg')).ok);
    ok('リンクを送ったときのプレビュー（題名・画像）が設定されている', /og\.jpg$/.test(og.img) && !!og.title && ogOk, og.title + ' / ' + og.img);
    ok('PC エラーなし', errs.length === 0, errs.slice(0, 3).join(' ; ')); await c.close();
  }
  /* ================= スマホ 390x844 ================= */
  {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
    await p.goto(BASE + 'r4-snog.html?tone=sand'); await sleep(1500);
    const home = await p.evaluate(() => ({ n: document.querySelectorAll('.tile').length, h: Math.round(document.querySelector('.tile').getBoundingClientRect().height), ov: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    ok('スマホ トップは今までどおり縦の一覧（8点、1点が画面の高さの80%）', home.n === 8 && Math.abs(home.h - 675) <= 2 && home.ov <= 0, home.n + '点 / 高さ ' + home.h + 'px');
    const caps = await p.evaluate(() => { const c = [...document.querySelectorAll('.cap')]; const t = [...document.querySelectorAll('.tile')]; return { n: c.length, first: c[0].innerText.replace(/\s+/g, ' '), under: Math.round(c[0].getBoundingClientRect().top - t[0].getBoundingClientRect().bottom), pitch: Math.round(t[1].getBoundingClientRect().top - t[0].getBoundingClientRect().top), lazy: t.filter(a => a.querySelector('img').loading === 'lazy').length }; });
    ok('スマホ 写真の下にジャンル名と点数が出る（写真の間隔は今までどおり）', caps.n === 8 && /BEAUTY/i.test(caps.first) && /13点/.test(caps.first) && caps.under === 10 && Math.abs(caps.pitch - (675 + 169 + 10)) <= 2, caps.first + ' / 写真から次の写真まで ' + caps.pitch + 'px');
    ok('スマホ 最初に読み込む写真は2点だけ（残り6点は近づいたら読む）', caps.lazy === 6, '後読み ' + caps.lazy + '点');
    await p.evaluate(() => scrollTo(0, 0)); await p.mouse.wheel(0, 900); await sleep(700); const away1 = await p.evaluate(() => getComputedStyle(document.getElementById('nav')).opacity); await p.mouse.wheel(0, -300); await sleep(700); const away2 = await p.evaluate(() => getComputedStyle(document.getElementById('nav')).opacity);
    ok('スマホ 下へ読み進めると名前とメニューが消え、上へ戻すと出る', away1 === '0' && away2 === '1', '下へ: ' + away1 + ' / 上へ: ' + away2);
    await p.evaluate(() => scrollTo(0, 0)); await sleep(500);
    await p.tap('.cap'); await sleep(1200); let s0 = await st(p); ok('スマホ ジャンル名を押しても一覧が開く', s0.detail && s0.h2 === '\u2014 Beauty \u2014', s0.h2); await p.tap('#closeDetail'); await sleep(700);
    await p.tap('.tile'); await sleep(1200); await settle(p); let s = await st(p); const g = await grid(p);
    ok('スマホ BEAUTY を押すと一覧が開く', s.detail && s.h2 === '— Beauty —', s.h2);
    ok('スマホ 一覧は13点・2列', s.n === 13 && g.cols === 2, s.n + '点 / ' + g.cols + '列');
    ok('スマホ 一覧の写真は切れていない・横にはみ出さない', g.maxRatioErr < 0.01 && g.overflowX <= 0 && g.dOverflowX <= 0, '縦横比の差 最大 ' + (g.maxRatioErr * 100).toFixed(2) + '%');
    await p.tap('#detail ol li:nth-child(1) button'); await sleep(700); s = await st(p); ok('スマホ 写真を押すと拡大表示', s.lb && s.ct === '01 / 13' && s.src === g.order[0], s.ct);
    const cdp = await c.newCDPSession(p);
    async function swipe(x0, x1, y) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] }); for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 8, y }] }); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    await swipe(300, 90, 420); await sleep(800); s = await st(p); ok('スマホ 左へスワイプで次の写真', s.lb && s.ct === '02 / 13' && s.src === g.order[1], s.ct);
    await swipe(90, 300, 420); await sleep(800); s = await st(p); ok('スマホ 右へスワイプで前の写真', s.lb && s.ct === '01 / 13' && s.src === g.order[0], s.ct);
    await swipe(200, 225, 420); await sleep(500); s = await st(p); ok('スマホ 少しだけ動かしたときは写真が変わらない', s.lb && s.ct === '01 / 13', s.ct);
    const fit = await p.evaluate(() => { const im = document.querySelector('#lb img'), r = im.getBoundingClientRect(); const hit = sel => { const q = document.querySelector(sel).getBoundingClientRect(); return Math.round(Math.min(q.width, q.height)); }; return { in: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, w: Math.round(r.width), h: Math.round(r.height), x: hit('#lb .x'), nv: hit('#lb .nx'), tr: getComputedStyle(document.querySelector('#lb figure')).transform }; });
    ok('スマホ 拡大した写真が画面に収まる', fit.in, fit.w + '×' + fit.h);
    ok('スマホ 閉じる・前へ・次へのボタンは指で押せる大きさ（40px以上）', fit.x >= 40 && fit.nv >= 40, '閉じる ' + fit.x + 'px / 前後 ' + fit.nv + 'px');
    await p.tap('#lb .nx'); await sleep(800); s = await st(p); ok('スマホ 「次へ」ボタンでも進める', s.ct === '02 / 13', s.ct);
    await p.tap('#lb .x'); await sleep(500); s = await st(p); ok('スマホ 閉じるボタンで一覧に戻る', !s.lb && s.detail);
    await p.tap('#detail ol li:nth-child(2) button'); await sleep(700); await p.touchscreen.tap(120, 24); await sleep(500); s = await st(p); ok('スマホ 写真の外（背景）を押すと一覧に戻る', !s.lb && s.detail);
    await p.evaluate(() => document.getElementById('detail').scrollTo(0, 600)); await sleep(600); const deep = await p.evaluate(() => ({ mark: getComputedStyle(document.querySelector('#nav .mark')).opacity, x: Math.round(document.getElementById('closeDetail').getBoundingClientRect().right) }));
    ok('スマホ 一覧を送ると名前が消え、× は右上に残る', deep.mark === '0' && deep.x > 340, '名前の濃さ ' + deep.mark + ' / × の右端 ' + deep.x + 'px');
    const mm = await p.evaluate(() => { const m = document.querySelector('#detail .more'); m.scrollIntoView(); const r = [...m.querySelectorAll('li button')].map(b => b.getBoundingClientRect()); return { n: r.length, minH: Math.round(Math.min(...r.map(q => q.height))), over: document.getElementById('detail').scrollWidth - document.getElementById('detail').clientWidth }; });
    ok('スマホ 一覧の最後のジャンル名は指で押せる高さ（40px以上）で、はみ出さない', mm.n === 6 && mm.minH >= 40 && mm.over <= 0, mm.minH + 'px');
    await p.tap('#closeDetail'); await sleep(600); s = await st(p); ok('スマホ 一覧の × でトップに戻る', !s.detail && s.stage === 'visible');
    ok('スマホ エラーなし', errs.length === 0, errs.slice(0, 3).join(' ; ')); await c.close();
  }
  /* ================= 動きを減らす設定 ================= */
  {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await c.newPage(); await p.goto(BASE + 'r4-snog.html'); await sleep(800);
    await p.evaluate(() => document.querySelector('.tile').click()); await sleep(400); await p.click('#detail ol li:nth-child(1) button'); await sleep(200); await p.keyboard.press('ArrowRight'); await sleep(200); const s = await st(p);
    ok('「動きを減らす」設定でも一覧・拡大・送りが使える', s.detail && s.lb && s.ct === '02 / 13', s.ct); await c.close();
  }
  await b.close();
  const md = '| 確かめたこと | 測った値 | 結果 |\n|---|---|---|\n' + out.join('\n') + '\n';
  require('fs').writeFileSync(process.env.OUT || 'verify/feedback-2026-11-26/check-latest.md', md); console.log(md); console.log(fails ? 'FAILS ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
