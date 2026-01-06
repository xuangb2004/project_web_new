@echo off
REM Batch file to start the server - works even if npm command has issues

echo Starting Web News Server...
echo.

cd /d "%~dp0"

REM Try npm.cmd first (more reliable in Windows)
npm.cmd start

REM If that fails, try with full path
if errorlevel 1 (
    echo Trying with full npm path...
    "C:\Program Files\nodejs\npm.cmd" start
)

REM If still fails, run node directly
if errorlevel 1 (
    echo Running with node directly...
    node index.js
)

pause

