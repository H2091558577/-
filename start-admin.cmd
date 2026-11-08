@echo off
chcp 65001 >nul
setlocal
rem 管理后台前端开发服务器（vue-cli 3 + webpack 4，Node 22 需要 openssl-legacy-provider）
set "PATH=E:\New Folder;%PATH%"
set "NODE_OPTIONS=--openssl-legacy-provider"
cd /d "%~dp0frontend\litemall-admin"
echo [可选] 热更新调试地址：http://localhost:9527
echo 正式站点由后端提供：  http://localhost:8081  （后台） / http://localhost:8081/web/ （网页版商城）
echo 接口代理： /admin -> http://localhost:8081
call npm run dev
pause
