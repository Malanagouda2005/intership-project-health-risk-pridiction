@echo off
echo Starting Health AI Frontend...
cd /d %~dp0
call ..\..\.venv\Scripts\activate.bat
npm start
pause