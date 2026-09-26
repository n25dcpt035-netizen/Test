@echo off
setlocal
chcp 65001 > nul

set "TRANSLATE_PYTHON="
set "TRANSLATE_PYTHON_ARGS="

where py.exe > nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%P in ('where py.exe') do if not defined TRANSLATE_PYTHON set "TRANSLATE_PYTHON=%%P"
    set "TRANSLATE_PYTHON_ARGS=-3"
)

if not defined TRANSLATE_PYTHON if exist "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" (
    set "TRANSLATE_PYTHON=%LOCALAPPDATA%\Programs\Python\Launcher\py.exe"
    set "TRANSLATE_PYTHON_ARGS=-3"
)

if not defined TRANSLATE_PYTHON (
    where python.exe > nul 2>&1
    if not errorlevel 1 for /f "delims=" %%P in ('where python.exe') do if not defined TRANSLATE_PYTHON set "TRANSLATE_PYTHON=%%P"
)

if not defined TRANSLATE_PYTHON (
    for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do if exist "%%~fD\python.exe" set "TRANSLATE_PYTHON=%%~fD\python.exe"
)

if not defined TRANSLATE_PYTHON (
    echo [Loi] Khong tim thay Python 3 tren may.
    echo Hay cai Python tu https://www.python.org/downloads/windows/ roi chay lai script.
    exit /b 1
)

if not exist ".venv-translate\Scripts\python.exe" (
    echo [0/2] Tao moi truong Python rieng...
    "%TRANSLATE_PYTHON%" %TRANSLATE_PYTHON_ARGS% -m venv .venv-translate
    if errorlevel 1 (
        echo [Loi] Khong the tao .venv-translate bang "%TRANSLATE_PYTHON%".
        exit /b 1
    )
)
echo [1/2] Cài LibreTranslate vào môi trường riêng...
.venv-translate\Scripts\python.exe -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r translation\requirements.txt
if errorlevel 1 exit /b 1
echo [2/2] Cài/cập nhật mô hình dịch English - Vietnamese...
.venv-translate\Scripts\python.exe translation\install_models.py
if errorlevel 1 exit /b 1
echo Hoàn tất. Chạy run.bat để bật ứng dụng và dịch vụ dịch.
