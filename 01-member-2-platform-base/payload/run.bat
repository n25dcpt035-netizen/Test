@echo off
chcp 65001 >nul
if not exist "VocabularySystem.exe" (
    echo Chưa có VocabularySystem.exe. Hãy chạy build.bat trước.
    exit /b 1
)
echo VocabMaster đang chạy tại http://localhost:8080
VocabularySystem.exe
