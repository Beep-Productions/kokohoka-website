/* ============================================================
   ここほか｜ページ移動したときの表示位置
   フッターなどからページを移ったのに、前の位置のまま
   〈途中から〉表示されてしまうのを防ぐ。

   ・「戻る／進む」で戻ったときは、読んでいた位置をそのまま残す
   ・「#リンク」（例：index.html#about）は本来の飛び先を尊重する
   ・いま開いているページ自身へのリンクは、読み込み直さず先頭へ戻す
   ============================================================ */
(function () {
  'use strict';

  /* ▼1. 別ページへ移ったときは、かならず先頭から表示する
        戻る／進む・再読み込みのときは、読んでいた位置を尊重して何もしない */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) return;                       // 戻る／進む（bfcache から復帰）
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type !== 'navigate') return;    // back_forward・reload
    if (location.hash) return;                     // #リンクでの着地
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });

  /* ▼2. いま開いているページ自身へのリンク（フッターに必ず1つある）を押したとき。
        読み込み直すとブラウザが位置を保ってしまうので、
        ページ遷移はやめて、その場で先頭までスクロールする */
  function samePage(a) {
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return false; }
    if (u.origin !== location.origin) return false;
    if (u.hash) return false;
    var norm = function (p) { return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, ''); };
    return norm(u.pathname) === norm(location.pathname);
  }

  document.addEventListener('click', function (e) {
    /* Command・Ctrl・Shift 併用＝別タブ／別窓で開きたいとき、中クリックも同様。じゃまをしない */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    if (!samePage(a)) return;
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
})();
