/* =========================================================
   Works の表示とライトボックス（拡大表示）
   作品の追加・変更は data/works.js で行います（このファイルは触らなくてOK）
   ========================================================= */
(function () {
  "use strict";

  var works = window.WORKS || [];
  var grid = document.getElementById("works-grid");
  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox.querySelector(".lightbox__img");
  var lbCaption = lightbox.querySelector(".lightbox__caption");
  var lbCount = lightbox.querySelector(".lightbox__count");
  var current = 0;

  document.getElementById("year").textContent = new Date().getFullYear();

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function label(w) {
    return [w.media, w.title].filter(Boolean).join(" ");
  }

  function meta(w, withLink) {
    var box = el("div", "work__meta");
    if (w.media) box.appendChild(el("span", "work__media", w.media));
    if (w.title) box.appendChild(el("span", "work__title", w.title));
    if (w.credit) box.appendChild(el("span", "work__credit", w.credit));
    if (withLink && w.link) {
      var a = el("a", "", "View Original →");
      a.href = w.link; a.target = "_blank"; a.rel = "noopener";
      var p = el("span", "work__credit"); p.style.marginTop = "10px";
      p.appendChild(a); box.appendChild(p);
    }
    return box;
  }

  /* ---- 一覧を作る ---- */
  works.forEach(function (w, i) {
    var li = el("li", "work");
    var btn = el("button", "work__btn");
    btn.type = "button";
    btn.setAttribute("aria-label", (label(w) || "作品") + " を拡大表示");
    var img = el("img");
    img.src = w.image;
    img.alt = label(w) || "作品";
    img.loading = i < 4 ? "eager" : "lazy";
    img.decoding = "async";
    btn.appendChild(img);
    btn.addEventListener("click", function () { open(i); });
    li.appendChild(btn);
    li.appendChild(meta(w, false));
    grid.appendChild(li);
  });

  /* ---- スクロールでふわっと表示 ---- */
  var items = grid.querySelectorAll(".work");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (it) { io.observe(it); });
  } else {
    items.forEach(function (it) { it.classList.add("is-visible"); });
  }

  /* ---- ライトボックス ---- */
  function show(i) {
    current = (i + works.length) % works.length;
    var w = works[current];
    lbImg.src = w.image;
    lbImg.alt = label(w) || "作品";
    lbCaption.innerHTML = "";
    lbCaption.appendChild(meta(w, true));
    lbCount.textContent = String(current + 1).padStart(2, "0") + " / " + String(works.length).padStart(2, "0");
  }
  function open(i) {
    show(i);
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }
  lightbox.addEventListener("close", function () { document.body.style.overflow = ""; });

  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
  lightbox.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
  // 画像の外側（暗い部分）をクリックで閉じる
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lightbox__figure")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.open) return;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  // スマホ：左右スワイプで切り替え
  var sx = null;
  lightbox.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();
