/* =========================================================
   書体を選ぶ小窓（見比べ用）
   - 画面に浮かぶ小さな窓。上の帯をつかんで動かせる。「−」でたためる。
   - 選んだ書体はこの端末に覚える。URL に ?font=maru のように付けても選べる
     （ima / maru / kiwi / pen / tegaki / pop）。
   - 書体が決まったら、このファイルの読み込み（各ページの最後の script 1行）を外し、
     決まった書体をそのページの CSS に書く。
   ========================================================= */
(function () {
  "use strict";
  var JP = '"Hiragino Maru Gothic ProN","Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",Meiryo,sans-serif';
  var FONTS = [
    { id: "ima",    label: "いまの書体", note: "きりっと",       family: "" },
    { id: "maru",   label: "まるゴシック", note: "やわらかい",     family: "Zen Maru Gothic", file: "zen-maru-gothic", bold: 700 },
    { id: "kiwi",   label: "まる明朝",   note: "やさしい",       family: "Kiwi Maru",       file: "kiwi-maru",       bold: 500 },
    { id: "pen",    label: "ペン字",     note: "ていねい",       family: "Klee One",        file: "klee-one",        bold: 600 },
    { id: "tegaki", label: "手書き",     note: "ゆるい",         family: "Yomogi",          file: "yomogi",          bold: 400 },
    { id: "pop",    label: "まるポップ", note: "いちばんかわいい", family: "Hachi Maru Pop",  file: "hachi-maru-pop",  bold: 400 }
  ];
  var BIG = 30;          // これ以上の大きさの文字は「大きな文字」として、元の横幅に合わせて大きさを直す
  var base = (function () { var s = document.currentScript && document.currentScript.src || ""; return s.replace(/js\/fontpick\.js.*$/, ""); })();
  var root = document.documentElement, cur = FONTS[0], touched = [], busy = false, queued = false;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function byId(id) { for (var i = 0; i < FONTS.length; i++) if (FONTS[i].id === id) return FONTS[i]; return null; }

  /* ---------- 書体の切り替え ---------- */
  var css = document.createElement("style");
  css.textContent = FONTS.filter(function (f) { return f.family; }).map(function (f) {
    return 'html[data-font="' + f.id + '"] body, html[data-font="' + f.id + '"] body *:not(.fp):not(.fp *) { font-family: "' + f.family + '",' + JP + ' !important; font-synthesis: none; }';
  }).join("\n") +
  '\n.fp, .fp * { box-sizing: border-box; font-family: ' + JP.replace(/"Hiragino Maru Gothic ProN",/, "") + ' !important; letter-spacing: 0 !important; text-transform: none !important; }' +
  '.fp { position: fixed; z-index: 2147483000; right: 8px; top: 66%; width: 208px; background: #fff; color: #222; border: 1px solid #222; font-size: 13px; line-height: 1.4; box-shadow: 0 4px 18px rgba(0,0,0,.18); -webkit-user-select: none; user-select: none; }' +
  '.fp__bar { display: flex; align-items: center; justify-content: space-between; height: 40px; padding: 0 4px 0 12px; background: #222; color: #fff; cursor: move; touch-action: none; }' +
  '.fp__bar span { font-size: 13px; font-weight: 700; }' +
  '.fp__fold { width: 40px; height: 40px; border: 0; background: none; color: #fff; font-size: 18px; line-height: 1; cursor: pointer; }' +
  '.fp__list { list-style: none; margin: 0; padding: 4px 0; }' +
  '.fp__list button { display: flex; align-items: baseline; gap: 8px; width: 100%; min-height: 40px; padding: 6px 12px; border: 0; background: none; color: #222; font-size: 14px; text-align: left; cursor: pointer; }' +
  '.fp__list button small { font-size: 11px; color: #666; }' +
  '.fp__list button:hover { background: #f1f1f1; }' +
  '.fp__list button[aria-pressed="true"] { background: #222; color: #fff; } .fp__list button[aria-pressed="true"] small { color: #ddd; }' +
  '.fp__fold:focus-visible, .fp__list button:focus-visible { outline: 2px solid #1a73e8; outline-offset: -2px; }' +
  '.fp__hint { margin: 0; padding: 6px 12px 10px; font-size: 11px; color: #666; }' +
  '.fp__bar b { font-weight: inherit; } .fp.is-folded .fp__bar b { display: none; } .fp.is-folded .fp__bar { padding-left: 10px; } .fp.is-folded { width: auto; box-shadow: 0 2px 8px rgba(0,0,0,.18); } .fp.is-folded .fp__list, .fp.is-folded .fp__hint { display: none; }';
  document.head.appendChild(css);

  var loaded = {};
  function loadCss(f) {
    if (!f.file || loaded[f.id]) return;
    loaded[f.id] = 1;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = base + "fonts/jp/" + f.file + ".css";
    l.onload = function () { if (cur === f && box) nudge(); };
    document.head.appendChild(l);
  }

  /* 大きな文字は、書体を替えても元の横幅とほぼ同じになるように文字の大きさを直す（はみ出し・折り返しを防ぐ） */
  var cv = document.createElement("canvas").getContext("2d");
  function width(text, weight, family) { cv.font = weight + " 100px " + family; return cv.measureText(text).width; }
  function ownText(el) { var t = ""; for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.nodeValue; return t.replace(/\s+/g, " ").trim(); }
  function boxOf(el) {                                         // 文字を並べている箱（inline でないいちばん近い要素）
    for (var e = el; e && e !== document.body; e = e.parentElement) if (getComputedStyle(e).display.indexOf("inline") !== 0) return e;
    return el;
  }
  function lineWidth(bx) {                                     // 箱の中身を折り返さずに1行に並べたときの幅
    var ws = bx.style.whiteSpace; bx.style.whiteSpace = "nowrap";
    var r = document.createRange(); r.selectNodeContents(bx); var w = r.getBoundingClientRect().width;
    bx.style.whiteSpace = ws; return w;
  }
  function clear() { touched.forEach(function (t) { t.el.style.fontSize = t.fs; t.el.style.fontWeight = t.fw; }); touched = []; }
  function fit() {
    busy = true;
    clear();
    if (cur.family) {
      root.removeAttribute("data-font");                       // 元の書体での大きさ・太さを調べる（同じ処理の中で戻すので画面には出ない）
      var found = [], all = document.body.getElementsByTagName("*");
      for (var i = 0; i < all.length; i++) {
        var el = all[i]; if (el.closest(".fp")) continue;
        var text = ownText(el); if (!text) continue;
        var cs = getComputedStyle(el), size = parseFloat(cs.fontSize);
        if (size < BIG) continue;
        if (el.style.fontSize) continue;                       // ページが自分で幅に合わせている文字（12G の下の一行など）は、ページに任せる
        if (cs.textTransform === "uppercase") text = text.toUpperCase();
        found.push({ el: el, text: text, size: size, weight: cs.fontWeight, family: cs.fontFamily, box: boxOf(el) });
      }
      // 文字の並ぶ箱ごとに、元の書体での「1行に並べたときの幅」を測っておく（名前が単語ごとに分かれていても箱で見る）
      var boxes = [];
      found.forEach(function (o) { if (boxes.indexOf(o.box) < 0) boxes.push(o.box); });
      var before = boxes.map(lineWidth);
      root.setAttribute("data-font", cur.id);
      var fam = '"' + cur.family + '",' + JP, need = [];
      found.forEach(function (o) {
        var heavy = /Anton|Archivo|Impact/i.test(o.family) || +o.weight >= 600;   // もともと太い見出しは、新しい書体でも太いほうを使う
        var w = heavy ? cur.bold : 400;
        var a = width(o.text, o.weight, o.family), b = width(o.text, w, fam);
        var k = b ? Math.max(0.45, Math.min(1.1, a / b)) : 1;
        touched.push({ el: o.el, fs: o.el.style.fontSize, fw: o.el.style.fontWeight });
        o.el.style.fontSize = (o.size * k).toFixed(2) + "px";
        o.el.style.fontWeight = w;
        need.push([w, o.text]);
      });
      // 実際に並べて測り、元より広がった箱は縮める（行が増えたり、画面からはみ出したりしないように）
      boxes.forEach(function (bx, i) {
        if (!before[i]) return;
        for (var t = 0; t < 3; t++) {
          var now = lineWidth(bx); if (!now || now <= before[i] * 1.005) break;
          var k = before[i] / now * 0.995;
          found.forEach(function (o) { if (o.box === bx) o.el.style.fontSize = (parseFloat(o.el.style.fontSize) * k).toFixed(2) + "px"; });
        }
      });
      // まだ届いていない文字の分が届いたら、もう一度合わせる
      if (document.fonts && document.fonts.load) need.forEach(function (n) {
        if (!document.fonts.check(n[0] + ' 40px "' + cur.family + '"', n[1])) document.fonts.load(n[0] + ' 40px "' + cur.family + '"', n[1]).then(refit, function () {});
      });
    }
    busy = false;
  }
  /* ページ側の「幅に合わせる」処理をやり直させる（書体が届いたあとにも） */
  function nudge() {
    window.dispatchEvent(new Event("resize"));
    if (cur.family && document.fonts && document.fonts.load) {
      var f = cur, t = document.body ? document.body.innerText.slice(0, 4000) : "";
      Promise.all([document.fonts.load('400 40px "' + f.family + '"', t), document.fonts.load(f.bold + ' 40px "' + f.family + '"', t)]).then(function () { if (cur === f) window.dispatchEvent(new Event("resize")); }, function () {});
    }
  }
  function refit() { if (queued) return; queued = true; Promise.resolve().then(function () { queued = false; fit(); if (mo) mo.takeRecords(); }); }

  function apply(f, save) {
    cur = f;
    if (f.family) { loadCss(f); root.setAttribute("data-font", f.id); } else root.removeAttribute("data-font");
    fit(); if (mo) mo.takeRecords();
    nudge();
    if (save) store("fontpick", f.id);
    if (list) [].forEach.call(list.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.dataset.id === f.id ? "true" : "false"); });
  }

  /* 文字が入れ替わったら（ジャンル名の切り替えなど）、同じコマのうちに合わせ直す */
  var mo = window.MutationObserver ? new MutationObserver(function (ms) {
    if (busy || !cur.family) return;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.target.nodeType === 1 && m.target.closest && m.target.closest(".fp")) continue;
      if (m.type === "characterData") return fit(), void mo.takeRecords();
      for (var j = 0; j < m.addedNodes.length; j++) {
        var n = m.addedNodes[j];
        if (n.nodeType === 3 ? n.nodeValue.trim() : (n.nodeType === 1 && n.textContent.trim())) return fit(), void mo.takeRecords();
      }
    }
  }) : null;

  /* ---------- 小窓 ---------- */
  var box, list;
  function build() {
    box = document.createElement("div"); box.className = "fp"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "書体を選ぶ");
    box.innerHTML = '<div class="fp__bar"><span>書体<b>を選ぶ</b></span><button class="fp__fold" type="button" aria-label="たたむ・ひらく">−</button></div>' +
      '<ul class="fp__list"></ul><p class="fp__hint">上の黒い帯をつかむと動かせます</p>';
    list = box.querySelector(".fp__list");
    FONTS.forEach(function (f) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.dataset.id = f.id; b.innerHTML = "<span></span><small></small>";
      b.firstChild.textContent = f.label; b.lastChild.textContent = f.note;
      b.addEventListener("click", function () { apply(f, true); });
      li.appendChild(b); list.appendChild(li);
    });
    var fold = box.querySelector(".fp__fold"), bar = box.querySelector(".fp__bar");
    function setFold(on) { box.classList.toggle("is-folded", on); fold.textContent = on ? "＋" : "−"; fold.setAttribute("aria-expanded", on ? "false" : "true"); keepIn(); }
    fold.addEventListener("click", function () { var on = !box.classList.contains("is-folded"); setFold(on); store("fontpick-fold", on ? "1" : "0"); });
    // 止めないと、下のページ（写真の拡大を閉じる・壁のスクロールなど）が反応してしまう
    ["click", "pointerdown", "mousedown", "touchstart", "wheel"].forEach(function (t) { box.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });

    var drag = null;
    function place(x, y) {
      var w = box.offsetWidth, h = box.offsetHeight;
      x = Math.max(4, Math.min(window.innerWidth - w - 4, x)); y = Math.max(4, Math.min(window.innerHeight - h - 4, y));
      box.style.left = x + "px"; box.style.top = y + "px"; box.style.right = "auto"; box.style.bottom = "auto";
    }
    function keepIn() { if (box.style.left) place(parseFloat(box.style.left), parseFloat(box.style.top)); }
    bar.addEventListener("pointerdown", function (e) {
      if (e.target === fold) return;
      var r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      bar.setPointerCapture(e.pointerId); e.preventDefault();
    });
    bar.addEventListener("pointermove", function (e) { if (drag) place(e.clientX - drag.dx, e.clientY - drag.dy); });
    function drop() { if (!drag) return; drag = null; store("fontpick-pos", box.style.left + "," + box.style.top); }
    bar.addEventListener("pointerup", drop); bar.addEventListener("pointercancel", drop);
    window.addEventListener("resize", function () { keepIn(); refit(); });

    document.body.appendChild(box);
    var folded = store("fontpick-fold");
    setFold(folded !== "0");   // 最初はたたんでおく（メニューや一覧に重ならないように、画面の右の中ほどに置く）
    var pos = (store("fontpick-pos") || "").split(",");
    if (pos.length === 2 && !isNaN(parseFloat(pos[0]))) place(parseFloat(pos[0]), parseFloat(pos[1]));
    if (mo) mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    apply(cur, false);
  }

  var q = /[?&]font=([a-z]+)/.exec(location.search);
  cur = byId(q && q[1]) || byId(store("fontpick")) || FONTS[0];
  if (cur.family) { loadCss(cur); root.setAttribute("data-font", cur.id); }   // 先に付けて、表示してから書体が替わる時間を短くする
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", function () { if (cur.family) refit(); });
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
