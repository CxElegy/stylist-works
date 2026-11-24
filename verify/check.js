/* 3案を 1400 / 390 / 320px で数字チェックする。使い方: python3 -m http.server 8765 & node verify/check.js
   必須項目: 横はみ出しなし / 要素の重なりなし / 写真を切らない・歪めない / 表示後に動かない / 全画像が読める / 本文13px以上 */
const { chromium } = require('playwright');
const fs = require('fs');
const PAGES = (process.env.PAGES || 'v2.html,index.html,a-bold.html,b-cool.html,c-simple.html').split(','), WIDTHS = [1400, 390, 320];
(async () => {
  const b = await chromium.launch(); const rows = []; let fail = 0;
  for (const f of PAGES) for (const w of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 900 : 780 }, reducedMotion: 'reduce' });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => { if (!/fonts\.g/.test(r.url())) errs.push('FAIL ' + r.url()); });
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto((process.env.BASE || 'http://localhost:8765/') + f); // 先に python3 -m http.server 8765 を起動しておく await p.waitForTimeout(600);
    // 全部スクロールして遅延読み込みの画像も読む
    for (let i = 0; i < 400; i++) { const done = await p.evaluate(() => { scrollBy(0, innerHeight * 0.9); return scrollY + innerHeight >= document.documentElement.scrollHeight - 2; }); await p.waitForTimeout(40); if (done) break; }
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const out = {}; const de = document.documentElement;
      out.overflowX = de.scrollWidth - de.clientWidth;
      const imgs = [...document.images].filter(i => !i.closest('dialog'));
      out.imgs = imgs.length; out.loaded = imgs.filter(i => i.complete && i.naturalWidth > 0).length;
      out.cropped = imgs.filter(i => { const cs = getComputedStyle(i), r = i.getBoundingClientRect(); if (!i.naturalWidth || !r.width) return false;
        const d = Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) / (i.naturalWidth / i.naturalHeight);
        let clip = false; for (let e = i.parentElement; e && e !== document.body; e = e.parentElement) { const er = e.getBoundingClientRect(), o = getComputedStyle(e).overflow; if (o !== 'visible' && (r.left < er.left - 1 || r.right > er.right + 1 || r.top < er.top - 1 || r.bottom > er.bottom + 1)) clip = true; }
        return d > 0.01 || clip || r.right > innerWidth + 1 || r.left < -1; }).map(i => i.getAttribute('src'));
      // 重なり: 文字・写真・ボタンなど「葉」の要素どうし（親子関係・非表示・ダイアログは除く）
      const leaf = [...document.querySelectorAll('img, a, button, h1, h2, p, span, dt, dd, li')].filter(e => { if (e.closest('dialog') || e.closest('[aria-hidden="true"]')) return false; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && (e.tagName === 'IMG' || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())); });
      const rect = e => { if (e.tagName === 'IMG' || parseFloat(getComputedStyle(e).fontSize) >= 48) return e.getBoundingClientRect(); /* 大きな見出しは行の箱で測る（文字の上下の余白は重なりに数えない） */ const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); };
      const R = leaf.map(e => ({ e, r: rect(e) })); const ov = [];
      R.sort((a, b) => a.r.top - b.r.top);
      for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], c = R[j]; if (c.r.top >= a.r.bottom - 1) break; if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
        const x = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left), y = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
        if (x > 1 && y > 1) ov.push((a.e.className || a.e.tagName) + ' × ' + (c.e.className || c.e.tagName)); }
      out.overlaps = [...new Set(ov)];
      out.small = [...new Set(leaf.filter(e => e.tagName !== 'IMG' && parseFloat(getComputedStyle(e).fontSize) < 13).map(e => (e.className || e.tagName) + ' ' + getComputedStyle(e).fontSize))];
      out.cls = Math.round(window.__cls * 1000) / 1000;
      const txt = leaf.filter(e => e.tagName !== 'IMG').map(e => e.textContent.trim()).filter(t => t.length > 3); out.dupText = [...new Set(txt.filter((t, i) => txt.indexOf(t) !== i))].filter(t => !/^(UNIQLO|美的|glow|オレンジページ|BAILA|Elura|mi-mollet|GLOBAL WORK|Personal Work|作品撮り)/.test(t)).slice(0, 5);
      return out; });
    const ok = r.overflowX <= 0 && r.imgs === r.loaded && !r.cropped.length && !r.overlaps.length && !r.small.length && r.cls <= 0.01 && !errs.length;
    if (!ok) fail++;
    rows.push({ page: f, width: w, ok, ...r, errs }); await p.close();
  }
  await b.close();
  let md = '| ページ | 幅 | 合否 | 横はみ出し | 画像 読めた/全部 | 切れ・歪み | 重なり | 13px未満 | 表示後のズレ(CLS) | エラー |\n|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of rows) md += `| ${r.page} | ${r.width} | ${r.ok ? '合格' : '**不合格**'} | ${r.overflowX} | ${r.loaded}/${r.imgs} | ${r.cropped.length ? r.cropped.slice(0, 3).join(', ') : 0} | ${r.overlaps.length ? r.overlaps.slice(0, 4).join(' ; ') : 0} | ${r.small.length ? r.small.join(' ; ') : 0} | ${r.cls} | ${r.errs.length} |\n`;
  const dup = rows.filter(r => r.dupText.length).map(r => `- ${r.page} ${r.width}: ${r.dupText.join(' / ')}`).join('\n');
  fs.writeFileSync(process.argv[2] || 'verify/check-latest.md', md + (dup ? '\n同じ文字が2回出ている箇所（参考）:\n' + dup + '\n' : ''));
  console.log(md + dup); process.exit(fail ? 1 : 0);
})();
