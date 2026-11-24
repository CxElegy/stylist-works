/* =========================================================
   サイトに載せる作品（v2.html が使う）　※ 更新のしかたは README.md
   ---------------------------------------------------------
   ・写真を images/works/ に入れて、下にそのパスを1行足すだけで載ります
   ・順番 ＝ 表示順。外したいときは行を消す
   ・1つのまとまりは 4〜6点が見やすい
   ・媒体名や題名をつけたいときだけ data/works.js にも書く（書かなくても載ります）
   ========================================================= */
window.SELECTION = {
  // 最初に見せる代表作
  lead: [
    "images/works/personal-01.jpg",
    "images/works/biteki-portrait-03.jpg",
    "images/tumblr/08-test-shoot-02.jpg",
    "images/works/personal-04.jpg"
  ],
  groups: [
    { id: "beauty", title: "美容誌", en: "Beauty", note: "美的",
      items: [
        "images/works/biteki-neo-nude-eye.jpg",
        "images/works/biteki-portrait-01.jpg",
        "images/works/biteki-portrait-02.jpg",
        "images/works/biteki-glow-cream.jpg",
        "images/works/biteki-spring-cosme-2026.jpg"
      ] },
    { id: "magazine", title: "雑誌", en: "Magazine", note: "オレンジページ / glow / mi-mollet / BAILA",
      items: [
        "images/works/orangepage-04.jpg",
        "images/works/glow-lesson-1b.jpg",
        "images/works/orangepage-05.jpg",
        "images/works/glow-lesson-2.jpg",
        "images/tumblr/03-mi-mollet-01.jpg",
        "images/tumblr/02-baila-03.jpg"
      ] },
    { id: "catalog", title: "ブランドカタログ", en: "Brand Catalog", note: "UNIQLO",
      items: [
        "images/tumblr/01-uniqlo-01.jpg",
        "images/tumblr/01-uniqlo-04.jpg",
        "images/tumblr/01-uniqlo-10.jpg",
        "images/tumblr/05-uniqlo-2-02.jpg",
        "images/tumblr/05-uniqlo-2-01.jpg"
      ] },
    { id: "brand", title: "ブランドビジュアル", en: "Brand Visual", note: "GLOBAL WORK / Elura",
      items: [
        "images/tumblr/07-global-work-01.jpg",
        "images/tumblr/07-global-work-02.jpg",
        "images/tumblr/04-elura-03.jpg",
        "images/tumblr/04-elura-06.jpg",
        "images/tumblr/04-elura-07.jpg"
      ] },
    { id: "kids", title: "キッズ", en: "Kids", note: "GLOBAL WORK ほか",
      items: [
        "images/tumblr/06-kids-01.jpg",
        "images/tumblr/06-kids-04.jpg",
        "images/tumblr/06-kids-06.jpg",
        "images/tumblr/06-kids-08.jpg",
        "images/tumblr/06-kids-09.jpg"
      ] },
    { id: "personal", title: "作品撮り", en: "Personal Work", note: "",
      items: [
        "images/works/personal-02.jpg",
        "images/works/personal-09.jpg",
        "images/tumblr/08-test-shoot-10.jpg",
        "images/tumblr/08-test-shoot-07.jpg",
        "images/tumblr/08-test-shoot-04.jpg"
      ] }
  ]
};
