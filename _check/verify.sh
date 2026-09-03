#!/bin/zsh
# ここほかサイト 静的チェック（依存なし・数秒で終わる）
#   使い方:  ./_check/verify.sh
# 直したら push の前に必ず通すこと。落ちた項目は必ず直す。

cd "$(dirname "$0")/.." || exit 1
NG=0

echo "━━━ ① 内部リンクが全部つながっているか ━━━"
grep -ohE 'href="[^"#][^":]*\.html[^"]*"' *.html | sed 's/href="//;s/"$//' | sed 's/[?#].*//' | sort -u \
| while read f; do [ -f "$f" ] || { echo "❌ リンク切れ: $f"; NG=1; }; done
echo "  完了"

echo "━━━ ② 参照している画像・CSS・JS・フォントが全部あるか ━━━"
{ grep -ohE '(src|href)="(images|css|js|fonts)/[^"]+"' *.html | sed 's/.*="//;s/"$//'
  grep -ohE 'srcset="[^"]+"' *.html | sed 's/srcset="//;s/"$//' | tr ',' '\n' | awk '{print $1}'
  grep -ohE "images/[^'\"]+" js/*.js css/*.css 2>/dev/null
} | sed 's/[?#].*//' | grep -E '^(images|css|js|fonts)/' | sort -u \
| while read a; do [ -f "$a" ] || { echo "❌ 見つからない: $a"; NG=1; }; done
echo "  完了"

echo "━━━ ③ 全ページに title / description / OGP / favicon / canonical があるか ━━━"
for f in *.html; do
  t=$(grep -c '<title>' "$f"); d=$(grep -c 'name="description"' "$f")
  o=$(grep -c 'property="og:' "$f"); i=$(grep -c 'rel="icon"' "$f"); c=$(grep -c 'canonical' "$f")
  [[ $t -ge 1 && $d -ge 1 && $o -ge 8 && $i -ge 1 && $c -ge 1 ]] \
    || { echo "❌ $f  title:$t desc:$d og:$o icon:$i canonical:$c"; NG=1; }
done
echo "  完了"

echo "━━━ ④ 機密情報が混ざっていないか（最重要）━━━"
grep -rn "天使園" *.html css js 2>/dev/null && { echo "❌❌ 施設の固有名称が入っている。絶対に消すこと"; NG=1; }
grep -rohE "0[0-9]{1,4}-[0-9]{1,4}-[0-9]{3,4}" *.html 2>/dev/null && { echo "❌ 電話番号らしき記述"; NG=1; }
grep -rohE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" *.html 2>/dev/null && { echo "❌ メールアドレス"; NG=1; }
grep -rniE "api[_-]?key|secret|passwd|password|bearer |AKIA" *.html css/*.css js/*.js 2>/dev/null && { echo "❌ 鍵らしき記述"; NG=1; }
echo "  完了"

echo "━━━ ⑤ デザインルール違反が混ざっていないか ━━━"
grep -rn "Yomogi\|Darumadrop\|serif;" css/*.css 2>/dev/null | grep -v "sans-serif" && { echo "⚠ 禁止フォント／明朝の疑い"; NG=1; }
grep -rn "motifs/motif\|motifs/band" *.html css/*.css 2>/dev/null && { echo "⚠ 使用禁止のモチーフを参照している"; NG=1; }
echo "  完了"

echo "━━━ ⑥ 使われていない画像（消してよい候補・警告のみ）━━━"
find images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.webp" \) \
| while read f; do grep -qF "$(basename "$f")" *.html css/*.css js/*.js 2>/dev/null || echo "  未使用: $f"; done
echo "  完了"

echo
if [ $NG -eq 0 ]; then echo "✅ 静的チェックは全部OK"; else echo "❌ 上の項目を直してから push すること"; fi
echo
echo "※ 見た目の崩れ（横スクロール等）はこれでは分かりません。"
echo "   必ずブラウザで PC と スマホ幅の両方を見てください。手順は _サイト更新の手引き.md を参照。"
