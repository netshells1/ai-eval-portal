#!/bin/bash
# 关闭项目（macOS）：只关闭由「启动项目」打开的演示窗口
if pkill -f "ai-eval-portal-show"; then echo "演示窗口已关闭。"; else echo "没有正在运行的演示窗口。"; fi
