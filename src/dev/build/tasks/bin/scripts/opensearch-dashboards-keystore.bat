@echo off

SETLOCAL ENABLEDELAYEDEXPANSION

set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%..") do set DIR=%%~dpfI

set NODE=%DIR%\node\node.exe

If Not Exist "%NODE%" (
  Echo unable to find usable node.js executable.
  Exit /B 1
)

set CONFIG_DIR=%OSD_PATH_CONF%
If [%OSD_PATH_CONF%] == [] (
  set CONFIG_DIR=%DIR%\config
)

IF EXIST "%CONFIG_DIR%\node.options" (
  for /F "eol=# tokens=*" %%i in (%CONFIG_DIR%\node.options) do (
    If [!NODE_OPTIONS!] == [] (
      set "NODE_OPTIONS=%%i"
    )	Else (
      set "NODE_OPTIONS=!NODE_OPTIONS! %%i"
    )
  )
)

TITLE OpenSearch Dashboards Keystore
"%NODE%" "%DIR%\src\cli_keystore\dist" %*

:finally

ENDLOCAL
