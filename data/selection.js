/* =========================================================
   サイトに載せる作品の選び方（v2.html が使う）
   ---------------------------------------------------------
   data/works.js は「全部の素材」（102点）。ここでは、その中から
   見せる作品だけを、仕事の種類ごとに並べます。
   ・写真のパスは data/works.js の image と同じものを書く
   ・順番 ＝ 表示順。入れ替え・差し替えはこのファイルだけ直せばOK
   ・1つのまとまりは 4〜5点（パソコンで1列に収まる数）
   ========================================================= */
window.SELECTION = {
  // 最初の画面：いちばん強い4点
  lead: [
    "images/works/personal-01.jpg",
    "images/works/biteki-portrait-03.jpg",
    "images/tumblr/08-test-shoot-02.jpg",
    "images/works/personal-04.jpg"
  ],
  groups: [
    { id: "beauty", title: "Beauty", note: "美的",
      items: ["images/works/biteki-neo-nude-eye.jpg", "images/works/biteki-portrait-01.jpg", "images/works/biteki-portrait-02.jpg", "images/works/biteki-glow-cream.jpg", "images/works/biteki-spring-cosme-2026.jpg"] },
    { id: "catalog", title: "Brand Catalog", note: "UNIQLO",
      items: ["images/tumblr/01-uniqlo-01.jpg", "images/tumblr/01-uniqlo-04.jpg", "images/tumblr/01-uniqlo-10.jpg", "images/tumblr/05-uniqlo-2-02.jpg", "images/tumblr/05-uniqlo-2-01.jpg"] },
    { id: "brand", title: "Brand Visual", note: "GLOBAL WORK / Elura",
      items: ["images/tumblr/07-global-work-01.jpg", "images/tumblr/07-global-work-02.jpg", "images/tumblr/04-elura-03.jpg", "images/tumblr/04-elura-06.jpg", "images/tumblr/04-elura-07.jpg"] },
    { id: "magazine", title: "Magazine", note: "mi-mollet / BAILA / オレンジページ",
      items: ["images/tumblr/03-mi-mollet-01.jpg", "images/tumblr/03-mi-mollet-02.jpg", "images/tumblr/02-baila-03.jpg", "images/works/orangepage-04.jpg", "images/works/orangepage-05.jpg"] },
    { id: "kids", title: "Kids", note: "GLOBAL WORK ほか",
      items: ["images/tumblr/06-kids-01.jpg", "images/tumblr/06-kids-04.jpg", "images/tumblr/06-kids-06.jpg", "images/tumblr/06-kids-08.jpg", "images/tumblr/06-kids-09.jpg"] },
    { id: "personal", title: "Personal Work", note: "作品撮り",
      items: ["images/works/personal-02.jpg", "images/works/personal-09.jpg", "images/tumblr/08-test-shoot-10.jpg", "images/tumblr/08-test-shoot-07.jpg", "images/tumblr/08-test-shoot-04.jpg"] }
  ]
};
