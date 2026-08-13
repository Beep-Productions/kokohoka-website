/* ============================================================
   ここほか｜日本語の改行整え
   「。」「！」「？」で文を区切り、1文ずつ inline-block で包むことで
   〈文の途中で改行されて次の文が行頭に来る〉むず痒さを防ぐ。
   1文がまるごと入りきらないときだけ、その文の中で折り返す。

   ・文字は一切足さない（コピペ・読み上げ・検索に影響しない）
   ・<b> や <a> をまたいでも文のかたまりを崩さない
   ・除外したい要素には data-tw="off" を付ける
   ============================================================ */
(function () {
  'use strict';

  /* 適用する場所。ここに1行足せば対象が増える／消せば減る */
  var SELECTOR = [
    /* 共通 */
    '.lead', '.center p', '.sec-head p', '.page-hero p', '.step p', '.subcard p', '.note-c',
    /* 市民の一日 */
    '.tl-text p', '.day2 p', '.day2 li',
    /* ビジター */
    '.closing p', '.promise p', '.can-card p',
    /* ボランティア */
    '.role p', '.req-value',
    /* これまでのここほか */
    '.sub', '.year-text', '.topic', '.vol-cta p'
  ].join(',');

  var SENTENCE_END = /[。！？]/;
  var TRAILING = /[」』）】〉》”’\)]/; /* 文末記号のあとに続く閉じカッコは同じ文に含める */

  /* 文中のダッシュ「——」も改行位置にする。
     ダッシュは【次の行の先頭】に置く＝「タメ」を効かせるディレクター判断（2026-08-13）。
     日付の「8.18 – 20」で使う二分ダーシ – (U+2013) は対象外（行頭禁則・割ってはいけない）。 */
  var DASH = /—/;

  function typeset(el) {
    if (el.getAttribute('data-tw') === 'off') return;

    var groups = [];   /* 配列＝1文ぶんのノード群 / 要素＝<br> */
    var current = [];

    function flush() {
      if (current.length) { groups.push(current); current = []; }
    }

    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      /* <br> は文の区切りとして扱い、そのまま外に出す */
      if (node.nodeType === 1 && node.tagName === 'BR') {
        flush();
        groups.push(node);
        return;
      }

      if (node.nodeType === 3) {
        var text = node.nodeValue, buf = '';
        for (var i = 0; i < text.length; i++) {
          /* ダッシュは「次の行の先頭」に置きたいので、その手前で区切る。
             「——」のように連続する場合は2本まとめて次の行へ（分割禁止・JLReq 3.1.10）*/
          if (DASH.test(text[i])) {
            if (buf) { current.push(document.createTextNode(buf)); buf = ''; }
            flush();
            buf += text[i];
            while (i + 1 < text.length && DASH.test(text[i + 1])) { buf += text[++i]; }
            continue;
          }

          buf += text[i];
          if (SENTENCE_END.test(text[i])) {
            while (i + 1 < text.length && TRAILING.test(text[i + 1])) { buf += text[++i]; }
            current.push(document.createTextNode(buf));
            buf = '';
            flush();
          }
        }
        if (buf) current.push(document.createTextNode(buf));
        return;
      }

      current.push(node);
    });
    flush();

    /* 文がひとつしかないなら何もしない（包むだけ無駄） */
    if (groups.length < 2) return;

    el.textContent = '';
    groups.forEach(function (g) {
      if (g.nodeType) { el.appendChild(g); return; }  /* <br> */
      var span = document.createElement('span');
      span.className = 'tw';
      g.forEach(function (n) { span.appendChild(n); });
      el.appendChild(span);
    });
  }

  function run() {
    document.querySelectorAll(SELECTOR).forEach(typeset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
