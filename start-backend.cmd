@echo off
chcp 65001 >nul
setlocal
rem litemall backend (Spring Boot 2.1.5, compiled for Java 8, run with JDK 11)
set "JAVA_HOME=E:\java\jdk-11.0.20"
cd /d "%~dp0backend"
echo Starting litemall backend: http://localhost:8080
"%JAVA_HOME%\bin\java.exe" -Dfile.encoding=UTF-8 -jar "litemall-all\target\litemall-all-0.1.0-exec.jar"
pause
