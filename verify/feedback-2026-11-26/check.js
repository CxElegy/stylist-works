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
  n: d.querySelectorAll('li').length, stage: getComputedStyle(q('stage')).visibility, hash: location.hash, focus: document.activeElement && (document.activeElement.id || document.activeElement.tagName + '.' + document.activeElement.className) }; });
const grid = p => p.evaluate(() => { const lis = [...document.querySelectorAll('#detail li')]; const R = lis.map(li => { const r = li.getBoundingClientRect(), im = li.querySelector('img'), ir = im.getBoundingClientRect(); return { wide: li.classList.contains('wide'), l: Math.round(r.left), t: Math.round(r.top), w: r.width, ratioErr: Math.abs(ir.width / ir.height - im.naturalWidth / im.naturalHeight) / (im.naturalWidth / im.naturalHeight), fit: getComputedStyle(im).objectFit, loaded: im.complete && im.naturalWidth > 0, src: im.getAttribute('src') }; });
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
    let s = await st(p); const g = await grid(p);
    ok('PC BEAUTY を押すと一覧が開く（集まる動きのあと）', s.detail && tOpen > 1500 && tOpen < 2300, '押してから ' + tOpen + 'ms');
    ok('PC 見出しが「— Beauty —」', s.h2 === '— Beauty —', s.h2);
    ok('PC 一覧は13点・3列', s.n === 13 && g.cols === 3, s.n + '点 / ' + g.cols + '列（見開き ' + g.wide + '点は2列ぶん）');
    ok('PC 一覧の写真は切れていない・歪んでいない', g.maxRatioErr < 0.01 && g.fits.join() === 'fill', '縦横比の差 最大 ' + (g.maxRatioErr * 100).toFixed(2) + '%');
    ok('PC 一覧の写真がすべて読み込める', g.loaded === 13, g.loaded + '/13');
    ok('PC 横にはみ出さない', g.overflowX <= 0 && g.dOverflowX <= 0, g.overflowX + ' / ' + g.dOverflowX);
    /* lightbox */
    await p.click('#detail li:nth-child(1) button'); await sleep(600); s = await st(p);
    ok('PC 一覧の写真を押すと拡大表示が開く', s.lb && s.ct === '01 / 13' && s.src === g.order[0], s.ct + ' ' + s.src);
    const fit = await p.evaluate(() => { const im = document.querySelector('#lb img'), r = im.getBoundingClientRect(); return { in: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, err: Math.abs(r.width / r.height - im.naturalWidth / im.naturalHeight) / (im.naturalWidth / im.naturalHeight), w: Math.round(r.width), h: Math.round(r.height) }; });
    ok('PC 拡大した写真が画面に収まり、切れていない', fit.in && fit.err < 0.01, fit.w + '×' + fit.h);
    await p.click('#lb .nx'); await sleep(700); s = await st(p); ok('PC 「次へ」で次の写真', s.ct === '02 / 13' && s.src === g.order[1], s.ct);
    await p.keyboard.press('ArrowRight'); await sleep(700); s = await st(p); ok('PC →キーで次の写真', s.ct === '03 / 13' && s.src === g.order[2], s.ct);
    await p.keyboard.press('ArrowLeft'); await sleep(700); s = await st(p); ok('PC ←キーで前の写真', s.ct === '02 / 13' && s.src === g.order[1], s.ct);
    await p.click('#lb .pv'); await sleep(700); await p.click('#lb .pv'); await sleep(700); s = await st(p); ok('PC 「前へ」で最初から最後へ回る', s.ct === '13 / 13' && s.src === g.order[12], s.ct);
    await p.keyboard.press('Escape'); await sleep(500); s = await st(p); ok('PC Esc で閉じて一覧に戻る', !s.lb && s.detail, 'フォーカス: ' + s.focus);
    await p.click('#detail li:nth-child(2) button'); await sleep(600); await p.mouse.click(720, 12); await sleep(500); s = await st(p); ok('PC 写真の外（背景）を押すと閉じて一覧に戻る', !s.lb && s.detail);
    await p.click('#detail li:nth-child(3) button'); await sleep(600); await p.click('#lb .x'); await sleep(500); s = await st(p); ok('PC 閉じるボタンで一覧に戻る', !s.lb && s.detail);
    await p.click('#detail li:nth-child(3) button'); await sleep(600); await p.goBack(); await sleep(600); s = await st(p); ok('PC ブラウザの「戻る」で拡大表示だけ閉じる', !s.lb && s.detail && s.hash === '#beauty', s.hash);
    await p.mouse.move(720, 450); /* 写真はマウスと逆に動くので、比べる前にマウスを最初と同じ中央へ */
    await p.goBack(); await sleep(3000); s = await st(p); const back = await rects(p);
    const dd = Math.max(...rest.flatMap((r, i) => r.map((v, k) => Math.abs(v - back[i][k]))));
    ok('PC もう一度「戻る」でトップに戻り、写真が元の位置に開く', !s.detail && s.stage === 'visible' && dd <= 0.5, '位置の差 最大 ' + dd + 'px');
    await p.evaluate(() => document.querySelector('.tile').click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(900);
    await p.click('#closeDetail'); await sleep(600); s = await st(p); ok('PC 一覧の × でトップに戻る', !s.detail && s.stage === 'visible' && s.hash === '');
    /* ほかのジャンルも同じ形 */
    await sleep(1500); await p.evaluate(() => document.querySelectorAll('.tile')[1].click()); await p.waitForFunction(() => !document.getElementById('detail').hidden); await sleep(1200);
    s = await st(p); ok('PC ほかのジャンル（Kids）も同じ形で開く', s.detail && s.h2 === '— Kids —' && s.n >= 4, s.h2 + ' ' + s.n + '点'); await p.click('#closeDetail'); await sleep(1800);
    /* tones */
    const want = { sand: ['rgb(198, 181, 152)', 'rgb(120, 104, 80)'], dusk: ['rgb(163, 179, 191)', 'rgb(88, 106, 120)'], clay: ['rgb(214, 167, 151)', 'rgb(148, 88, 74)'], red: ['rgb(220, 47, 30)', 'rgb(220, 47, 30)'] }; let tonesOk = true; const seen = [];
    for (const t of Object.keys(want)) { await p.click(`#tones [data-tone="${t}"]`); await sleep(120); const got = await p.evaluate(() => [getComputedStyle(document.querySelector('#nav .wm')).color, getComputedStyle(document.body).color]); seen.push(t + ':' + got.join('/')); if (got[0] !== want[t][0] || got[1] !== want[t][1]) tonesOk = false; }
    ok('PC 文字色の4つのボタンで、大きな文字と小さな文字の色が切り替わる', tonesOk, seen.join(' ; '));
    await p.click('#tones [data-tone="dusk"]'); await p.goto(BASE + 'r4-snog.html'); await sleep(300); const kept = await p.evaluate(() => document.documentElement.getAttribute('data-tone')); ok('PC 選んだ文字色は開き直しても残る', kept === 'dusk', kept);
    ok('PC エラーなし', errs.length === 0, errs.slice(0, 3).join(' ; ')); await c.close();
  }
  /* ================= スマホ 390x844 ================= */
  {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
    await p.goto(BASE + 'r4-snog.html?tone=sand'); await sleep(1500);
    const home = await p.evaluate(() => ({ n: document.querySelectorAll('.tile').length, h: Math.round(document.querySelector('.tile').getBoundingClientRect().height), ov: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    ok('スマホ トップは今までどおり縦の一覧（8点、1点が画面の高さの80%）', home.n === 8 && Math.abs(home.h - 675) <= 2 && home.ov <= 0, home.n + '点 / 高さ ' + home.h + 'px');
    await p.tap('.tile'); await sleep(1200); let s = await st(p); const g = await grid(p);
    ok('スマホ BEAUTY を押すと一覧が開く', s.detail && s.h2 === '— Beauty —', s.h2);
    ok('スマホ 一覧は13点・2列', s.n === 13 && g.cols === 2, s.n + '点 / ' + g.cols + '列');
    ok('スマホ 一覧の写真は切れていない・横にはみ出さない', g.maxRatioErr < 0.01 && g.overflowX <= 0 && g.dOverflowX <= 0, '縦横比の差 最大 ' + (g.maxRatioErr * 100).toFixed(2) + '%');
    await p.tap('#detail li:nth-child(1) button'); await sleep(700); s = await st(p); ok('スマホ 写真を押すと拡大表示', s.lb && s.ct === '01 / 13' && s.src === g.order[0], s.ct);
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
    await p.tap('#detail li:nth-child(2) button'); await sleep(700); await p.touchscreen.tap(120, 24); await sleep(500); s = await st(p); ok('スマホ 写真の外（背景）を押すと一覧に戻る', !s.lb && s.detail);
    await p.tap('#closeDetail'); await sleep(600); s = await st(p); ok('スマホ 一覧の × でトップに戻る', !s.detail && s.stage === 'visible');
    ok('スマホ エラーなし', errs.length === 0, errs.slice(0, 3).join(' ; ')); await c.close();
  }
  /* ================= 動きを減らす設定 ================= */
  {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await c.newPage(); await p.goto(BASE + 'r4-snog.html'); await sleep(800);
    await p.evaluate(() => document.querySelector('.tile').click()); await sleep(400); await p.click('#detail li:nth-child(1) button'); await sleep(200); await p.keyboard.press('ArrowRight'); await sleep(200); const s = await st(p);
    ok('「動きを減らす」設定でも一覧・拡大・送りが使える', s.detail && s.lb && s.ct === '02 / 13', s.ct); await c.close();
  }
  await b.close();
  const md = '| 確かめたこと | 測った値 | 結果 |\n|---|---|---|\n' + out.join('\n') + '\n';
  require('fs').writeFileSync(process.env.OUT || 'verify/feedback-2026-11-26/check-latest.md', md); console.log(md); console.log(fails ? 'FAILS ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
