/* ============================================================
   ここほか｜横に流れる写真スライダーの読み込み
   ------------------------------------------------------------
   【なぜ必要か】
   ブラウザ標準の遅延読み込み（loading="lazy"）は「画面に入ったら読む」
   しくみだが、このスライダーは CSS の transform で動いているため、
   〈見た目は流れてきているのに、ブラウザ内部の位置は右端のまま〉になる。
   その結果、額縁（6種類しかないのでキャッシュ済み）だけ先に出て、
   写真が遅れて出る＝カーソルを乗せた瞬間に表示される、という状態になっていた。

   【対処】
   スライダーが画面に近づいた時点で、その中の写真をまとめて読み込む。
   ・先頭の数枚は通常の src のまま（JSが動かない環境でも表示される）
   ・残りは data-src にしておき、ここで src に入れ替える
   ============================================================ */
(function () {
  'use strict';

  function load(marquee) {
    marquee.querySelectorAll('img[data-src]').forEach(function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }

  function run() {
    var list = document.querySelectorAll('.marquee');
    if (!list.length) return;

    /* 未対応ブラウザでは素直に全部読み込む */
    if (!('IntersectionObserver' in window)) {
      list.forEach(load);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { load(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '600px 0px' });   /* 少し手前から読みはじめる */

    list.forEach(function (m) { io.observe(m); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
