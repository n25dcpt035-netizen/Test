@echo off
setlocal
set "PATH=C:\msys64\ucrt64\bin;%PATH%"
echo [1/3] Chuan bi frontend nguyen ban...
if exist "runtime\web" rmdir /S /Q "runtime\web"
mkdir "runtime\web"
robocopy ".checkpoint\web-fallback" "runtime\web" /E /NFL /NDL /NJH /NJS /NC /NS >nul
if errorlevel 8 goto :error
robocopy "apps\web" "runtime\web" /E /NFL /NDL /NJH /NJS /NC /NS >nul
if errorlevel 8 goto :error
echo [2/3] Cau hinh CMake...
cmake -S . -B build -G "MinGW Makefiles"
if errorlevel 1 goto :error
echo [3/3] Bien dich backend C++17...
cmake --build build -j 4
if errorlevel 1 goto :error
copy /Y "build\VocabularySystem.exe" "VocabularySystem.exe" >nul
if errorlevel 1 goto :error
echo Build thanh cong: VocabularySystem.exe
exit /b 0

:error
echo Build that bai. Xem loi phia tren.
exit /b 1
