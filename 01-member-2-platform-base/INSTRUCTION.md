# Thành viên 2 — Platform và Lead

## Học phần

Đọc cấu trúc CMake/C++ server, Service Locator, HTTP routing, static web root và quy trình kiểm thử tích hợp tuần tự. Đây là checkpoint nền có backend tối thiểu và frontend nguyên bản qua lớp fallback tạm.

## Làm một lần

```powershell
cd D:\Learning-web-test
git init -b main
..\Learning-web-test-packages\01-member-2-platform-base\APPLY.ps1 -RepoRoot D:\Learning-web-test
git commit -m "feat(platform): add runnable integration baseline"
git remote add origin https://github.com/Thiendeptrai169/Learning-web-test.git
git push -u origin main
```

## Checkpoint lead

- `build.bat` thành công và web mở ở `http://localhost:8080`.
- Trang, style và asset hiển thị y nguyên project gốc.
- Health/settings hoạt động; feature chưa merge trả dữ liệu rỗng an toàn.
- Sau đó yêu cầu PR theo đúng `INTEGRATION_ORDER.md`; chỉ test và merge, không commit nối.
