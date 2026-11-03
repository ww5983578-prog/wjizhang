@echo off
chcp 65001 >nul
cd /d "%~dp0"
title w Jizhang - Local Server
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
echo.
echo w记账 服务已停止。按任意键关闭窗口。
pause >nul
