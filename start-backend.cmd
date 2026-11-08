@echo off
chcp 65001 >nul
setlocal
rem 鲜花订购与管理系统：后端 + 管理后台 + 网页版客户端（Spring Boot 2.1.5，使用 JDK 11 运行）
set "JAVA_HOME=E:\java\jdk-11.0.20"
cd /d "%~dp0backend"
echo ============================================================
echo   鲜花订购与管理系统 —— 启动服务
echo   管理后台： http://localhost:8081
echo   网页版商城：http://localhost:8081/web/
echo   接口前缀： /admin/**（管理端）  /wx/**（小程序 / 网页版）
echo ============================================================
"%JAVA_HOME%\bin\java.exe" -Dfile.encoding=UTF-8 -jar "litemall-all\target\litemall-all-0.1.0-exec.jar"
pause
