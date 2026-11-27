@echo off
setlocal
title 启动项目 - 区级人工智能项目评估平台
rem 用独立的浏览器配置目录全屏打开 index.html，「关闭项目」只会关掉这个窗口，不影响你平时开着的浏览器。
set "ROOT=%~dp0"
set "PAGE=%ROOT%index.html"
set "PROFILE=%TEMP%\ai-eval-portal-show"
if not exist "%PAGE%" (
    echo 找不到 index.html，请把本文件和 index.html 放在同一个文件夹里。
  pause
    goto :eof
)
rem 路径含中文时必须做 URL 百分号编码，否则 Chrome 会把 --app 参数解析失败并回退到默认新标签页。
set "URL="
for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "[System.Uri]::new('%PAGE%').AbsoluteUri"`) do set "URL=%%U"
if not defined URL (
  echo 生成演示地址失败，请改用本地服务器方式启动。
  pause
  goto :eof
)
set "BROWSER="
for %%P in ("%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") do (
  if not defined BROWSER if exist %%P set "BROWSER=%%~P"
)
if not defined BROWSER (
  echo 没有找到 Chrome 或 Edge，改用系统默认浏览器打开。打开后按 F 进入全屏。
  start "" "%URL%"
  timeout /t 3 >nul
  goto :eof
)
start "" "%BROWSER%" --user-data-dir="%PROFILE%" --no-first-run --no-default-browser-check --start-fullscreen --app="%URL%"
echo 演示窗口已打开。按 ? 查看快捷键，按 Q 两次或双击「关闭项目」关闭。
timeout /t 3 >nul
