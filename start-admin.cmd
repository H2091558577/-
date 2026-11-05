@echo off
chcp 65001 >nul
setlocal
rem litemall admin frontend (vue-cli 4 + webpack 4, Node 22 needs openssl-legacy-provider)
set "PATH=E:\New Folder;%PATH%"
set "NODE_OPTIONS=--openssl-legacy-provider"
cd /d "%~dp0frontend\litemall-admin"
echo [optional] dev server with hot reload: http://localhost:9527
echo The full site is served by the backend at http://localhost:8080
echo API proxy: /admin -> http://localhost:8080
call npm run dev
pause
