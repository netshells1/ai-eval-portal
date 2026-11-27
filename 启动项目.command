#!/bin/bash
# 启动项目（macOS）：用独立的浏览器配置目录全屏打开 index.html
cd "$(dirname "$0")" || exit 1
DIR="$(pwd)"
PROFILE="${TMPDIR:-/tmp}/ai-eval-portal-show"
URL="file://${DIR}/index.html"
# 路径含中文时必须做 URL 百分号编码，否则 Chrome 会解析 --app 参数失败并回退到默认新标签页。
if command -v python3 >/dev/null 2>&1; then
  ENC="$(python3 -c 'import pathlib,sys;print(pathlib.Path(sys.argv[1]).as_uri())' "$DIR/index.html" 2>/dev/null)"
  [ -n "$ENC" ] && URL="$ENC"
fi
for B in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
  if [ -x "$B" ]; then
    "$B" --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check --start-fullscreen --app="$URL" >/dev/null 2>&1 &
    disown
    echo "演示窗口已打开。按 ? 查看快捷键，按 Q 两次或双击「关闭项目」关闭。"
    exit 0
  fi
done
echo "没有找到 Chrome 或 Edge，改用默认浏览器打开。打开后按 F 进入全屏。"
open "$DIR/index.html"
