/* =========================================================
   サイトに載せる作品（3A〜3C・v2 が使う）　※ 更新のしかたは README.md
   ---------------------------------------------------------
   ・写真を images/works/ に入れて、下にそのパスを1行足すだけで載ります
   ・順番 ＝ 表示順。外したいときは行を消す
   ・1つのまとまりは 4〜6点が見やすい
   ・雑誌名・ブランド名は出しません（すべて本人の作品として見せる）。
     まとまりは媒体ではなく、内容（ビューティー／カジュアル…）で分けています
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
    { id: "beauty", title: "ビューティー", en: "Beauty", note: "",
      items: [
        "images/works/biteki-neo-nude-eye.jpg",
        "images/works/biteki-portrait-01.jpg",
        "images/works/biteki-portrait-02.jpg",
        "images/works/biteki-glow-cream.jpg",
        "images/works/biteki-spring-cosme-2026.jpg"
      ] },
    { id: "casual", title: "カジュアル", en: "Casual", note: "",
      items: [
        "images/tumblr/01-uniqlo-01.jpg",
        "images/tumblr/01-uniqlo-04.jpg",
        "images/tumblr/01-uniqlo-10.jpg",
        "images/tumblr/05-uniqlo-2-02.jpg",
        "images/tumblr/05-uniqlo-2-01.jpg"
      ] },
    { id: "elegance", title: "エレガンス", en: "Elegance", note: "",
      items: [
        "images/tumblr/07-global-work-01.jpg",
        "images/tumblr/07-global-work-02.jpg",
        "images/tumblr/04-elura-06.jpg",
        "images/works/glow-lesson-1b.jpg",
        "images/tumblr/03-mi-mollet-01.jpg",
        "images/tumblr/04-elura-07.jpg"
      ] },
    { id: "portrait", title: "ポートレート", en: "Portrait", note: "",
      items: [
        "images/works/orangepage-04.jpg",
        "images/tumblr/04-elura-03.jpg",
        "images/works/orangepage-05.jpg",
        "images/tumblr/03-mi-mollet-04.jpg",
        "images/tumblr/03-mi-mollet-03.jpg"
      ] },
    { id: "kids", title: "キッズ", en: "Kids", note: "",
      items: [
        "images/tumblr/06-kids-04.jpg",
        "images/tumblr/06-kids-06.jpg",
        "images/tumblr/06-kids-08.jpg",
        "images/tumblr/06-kids-09.jpg",
        "images/tumblr/06-kids-10.jpg"
      ] },
    { id: "editorial", title: "エディトリアル", en: "Editorial", note: "",
      items: [
        "images/works/personal-02.jpg",
        "images/works/personal-09.jpg",
        "images/tumblr/08-test-shoot-10.jpg",
        "images/tumblr/08-test-shoot-07.jpg",
        "images/tumblr/08-test-shoot-04.jpg"
      ] }
  ]
};
