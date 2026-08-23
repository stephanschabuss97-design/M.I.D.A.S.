@echo off
setlocal

rem Canonical Windows bridge to the authenticated CodeRabbit CLI in WSL.
set "CODERABBIT_WSL_DISTRO=Ubuntu"
set "CODERABBIT_WSL_USER=root"
set "CODERABBIT_WSL_BIN=/root/.local/bin/coderabbit"

wsl.exe -d %CODERABBIT_WSL_DISTRO% -u %CODERABBIT_WSL_USER% --cd "%CD%" -- %CODERABBIT_WSL_BIN% %*
exit /b %ERRORLEVEL%
