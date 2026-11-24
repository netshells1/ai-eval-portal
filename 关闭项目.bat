@echo off
title 关闭项目 - 区级人工智能项目评估平台
rem 只关闭由「启动项目」打开的演示窗口。
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like '*ai-eval-portal-show*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo 演示窗口已关闭。
timeout /t 2 >nul
