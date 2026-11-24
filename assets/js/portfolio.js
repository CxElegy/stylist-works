/* =========================================================
   3つのデザイン案で共通の仕組み
   - data/works.js から作品一覧を作る
   - data/profile.js からプロフィール・連絡先を入れる
   - 写真をクリックで拡大（ライトボックス）。誌面がある作品は「誌面を見る」で切り替え
   このファイルは通常触らなくてOK
   ========================================================= */
(function () {
  "use strict";

  var works = window.WORKS || [];
  var P = window.PROFILE || {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function label(w) { return [w.media, w.title].filter(Boolean).join(" ") || "作品"; }
  function pad(n) { return String(n).padStart(2, "0"); }

  /* ---------- プロフィール・連絡先 ---------- */
  function fillProfile() {
    document.querySelectorAll("[data-p]").forEach(function (node) {
      var key = node.getAttribute("data-p");
      var v = P[key];
      if (key === "bio") {
        node.innerHTML = "";
        (v || []).forEach(function (line) { node.appendChild(el("p", "", line)); });
      } else if (key === "clients") {
        node.textContent = (v || []).join(" / ");
      } else if (key === "email") {
        if (!v) { node.remove(); return; }
        node.textContent = v; node.href = "mailto:" + v;
      } else if (key === "instagram" || key === "tumblr") {
        if (!v) { node.closest("li") ? node.closest("li").remove() : node.remove(); return; }
        node.href = v;
      } else if (v !== undefined) {
        node.textContent = v;
      }
    });
    document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  /* ---------- ライトボックス ---------- */
  var lb, lbImg, lbCap, lbCount, lbToggle, list = [], cur = 0, showPage = false;

  function buildLightbox() {
    lb = el("dialog", "lb");
    lb.setAttribute("aria-label", "作品の拡大表示");
    lb.innerHTML =
      '<p class="lb__count"></p>' +
      '<button class="lb__close" type="button" aria-label="閉じる">Close</button>' +
      '<button class="lb__nav lb__prev" type="button" aria-label="前の作品">&larr;</button>' +
      '<figure class="lb__fig"><img class="lb__img" alt=""><figcaption class="lb__cap"></figcaption></figure>' +
      '<button class="lb__nav lb__next" type="button" aria-label="次の作品">&rarr;</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector(".lb__img");
    lbCap = lb.querySelector(".lb__cap");
    lbCount = lb.querySelector(".lb__count");
    lb.querySelector(".lb__close").addEventListener("click", close);
    lb.querySelector(".lb__prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb__next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb__fig")) close(); });
    lb.addEventListener("close", function () { document.body.style.overflow = ""; });
    document.addEventListener("keydown", function (e) {
      if (!lb.open) return;
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  function show(i) {
    var next = (i + list.length) % list.length;
    if (next !== cur) showPage = false; // 別の作品に移ったら「写真」表示に戻す
    cur = next;
    var w = list[cur];
    lbImg.src = showPage && w.page ? w.page : w.image;
    lbImg.alt = label(w) || "作品";
    lbCap.innerHTML = "";
    if (w.media) lbCap.appendChild(el("span", "lb__media", w.media));
    if (w.title) lbCap.appendChild(el("span", "lb__title", w.title));
    if (w.credit) lbCap.appendChild(el("span", "lb__credit", w.credit));
    var row = el("span", "lb__links");
    if (w.page) {
      var b = el("button", "lb__toggle", showPage ? "写真を見る" : "誌面を見る");
      b.type = "button";
      b.addEventListener("click", function () { showPage = !showPage; show(cur); });
      row.appendChild(b);
    }
    if (w.link) {
      var a = el("a", "lb__toggle", "元記事 →");
      a.href = w.link; a.target = "_blank"; a.rel = "noopener";
      row.appendChild(a);
    }
    if (row.childNodes.length) lbCap.appendChild(row);
    lbCount.textContent = pad(cur + 1) + " / " + pad(list.length);
  }
  function open(i) {
    showPage = false;
    show(i);
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (typeof lb.close === "function") lb.close(); else lb.removeAttribute("open");
    document.body.style.overflow = "";
  }

  /* ---------- 作品一覧 ----------
     opts.grid    : 一覧を入れる要素のセレクタ
     opts.render  : function(work, index, total) → 要素（.js-open を付けた要素がクリック対象）
     opts.exclude : 一覧に出さない画像パス（トップ写真と同じものなど）
     opts.columns : function(画面の幅) → 列の数。指定すると、番号順に「いちばん短い列」へ入れていく
                    （横に読んでも順番どおりになり、列の長さもそろう）
  */
  function renderWorks(opts) {
    var grid = document.querySelector(opts.grid);
    if (!grid) return;
    var ex = opts.exclude || [];
    list = works.filter(function (w) { return ex.indexOf(w.image) === -1; });
    var nodes = [];
    list.forEach(function (w, i) {
      var node = opts.render(w, i, list.length);
      nodes.push(node);
      node._ratio = 1.4;
      var img = node.querySelector("img");
      if (img) {
        var sz = (window.SIZES || {})[w.image];
        if (sz) { img.width = sz[0]; img.height = sz[1]; node._ratio = sz[1] / sz[0]; }
        img.src = w.image;
        img.alt = label(w) || "作品";
        img.loading = i < 4 ? "eager" : "lazy";
        img.decoding = "async";
        // 画像が届く前に高さを確保（表示後にレイアウトが動かないように）
        img.addEventListener("load", function () { node.classList.add("is-loaded"); });
      }
      var t = node.querySelector(".js-open") || node;
      t.addEventListener("click", function () { open(i); });
      if (!opts.columns) grid.appendChild(node);
    });

    if (opts.columns) {
      var curN = 0;
      var layout = function () {
        var n = opts.columns(window.innerWidth);
        if (n === curN) return;
        curN = n;
        grid.innerHTML = "";
        var cols = [], hs = [];
        for (var k = 0; k < n; k++) { cols.push(grid.appendChild(el("div", "col"))); hs.push(0); }
        nodes.forEach(function (node) {
          var m = 0;
          for (var k = 1; k < n; k++) if (hs[k] < hs[m] - 0.001) m = k;
          cols[m].appendChild(node);
          hs[m] += node._ratio + (opts.extra || 0.12); // 写真の高さ＋文字と余白のぶん（列の幅を1として）
        });
      };
      layout();
      window.addEventListener("resize", layout);
    }

    // スクロールでふわっと表示
    var items = nodes;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -6% 0px" });
      Array.prototype.forEach.call(items, function (it) { io.observe(it); });
    } else {
      Array.prototype.forEach.call(items, function (it) { it.classList.add("is-in"); });
    }
  }

  window.Portfolio = {
    init: function (opts) {
      fillProfile();
      buildLightbox();
      renderWorks(opts);
    },
    el: el, label: label, pad: pad,
    // 一覧を自分で組むページ用（v2.html）：works の配列を渡すと、open(番号) で拡大表示できる
    lightbox: function (worksList) { fillProfile(); buildLightbox(); list = worksList; return open; },
    // data/selection.js を読んで、まとまりごとの作品と「写真の部品」を用意する（3A〜3C のページ用）
    // 返り値: { sets: [{id,title,en,note,lead,works,nodes}], flat }。nodes の各要素は .ph（中に button > img）。
    // node._r = 横÷縦。並べ方（列・大きさ）は各ページが決める。
    sets: function () {
      var SEL = window.SELECTION, SZ = window.SIZES || {}, byImg = {}, flat = [];
      works.forEach(function (w) { byImg[w.image] = w; });
      var sets = [{ id: "selected", title: "代表作", en: "Selected", note: "", items: SEL.lead, lead: true }].concat(SEL.groups);
      sets.forEach(function (s) {
        s.works = s.items.map(function (p) { return byImg[p] || { image: p, page: "", media: "", title: "", credit: "", link: "" }; });
        s.start = flat.length; flat = flat.concat(s.works);
      });
      fillProfile(); buildLightbox(); list = flat;
      sets.forEach(function (s, si) {
        s.nodes = s.works.map(function (w, i) {
          var d = el("div", "ph"), b = el("button", "ph__btn"), img = el("img"), sz = SZ[w.image];
          b.type = "button"; b.setAttribute("aria-label", label(w) + " を拡大表示");
          d._r = 0.7; d._w = w;
          if (sz) { img.width = sz[0]; img.height = sz[1]; d._r = sz[0] / sz[1]; }
          img.src = w.image; img.alt = label(w); img.decoding = "async"; img.loading = si < 2 ? "eager" : "lazy";
          b.appendChild(img); d.appendChild(b);
          b.addEventListener("click", function () { open(s.start + i); });
          return d;
        });
      });
      return { sets: sets, flat: flat };
    }
  };
})();
