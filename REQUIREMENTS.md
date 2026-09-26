# Công nghệ và yêu cầu cài đặt

Tài liệu dành cho Windows 64-bit, theo cấu hình dự án đã chạy thực tế. Không cần Docker.

## Stack của dự án

| Thành phần | Công nghệ / thư viện | Cần cài riêng? |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript thuần, font Inter và ảnh Figma local | Không có bước npm install/build |
| Backend | C++17, GCC/MinGW-w64 UCRT64 | Có, để biên dịch |
| HTTP server | cpp-httplib 0.18.0 | Không, có trong apps/server/include/third_party/httplib.h |
| JSON | nlohmann/json 3.11.3 | Không, có trong apps/server/include/third_party/json.hpp |
| Windows networking | ws2_32 / Winsock | Toolchain liên kết khi build |
| Build tùy chọn | CMake >= 3.15 và MinGW Make | Chỉ cần nếu không dùng build.bat |
| Dịch offline | Python, LibreTranslate 1.9.6 và các model Argos en→vi, vi→en | Có, nếu sử dụng Dịch nhanh |
| Lưu trữ | CSV, JSON, dictionary.bin trong data/ | Không cần database server |
| Quản lý mã nguồn | Git | Cần để clone/pull/push |

Không cần React, Node.js, npm, MySQL, PostgreSQL, tài khoản dịch vụ dịch hay API key.
Node.js chỉ là công cụ tùy chọn để kiểm tra cú pháp JavaScript khi phát triển.

## 1. Compiler C++

Cài [MSYS2](https://www.msys2.org/) vào `C:\msys64` theo hướng dẫn chính thức.
Trong terminal **MSYS2 UCRT64**, cập nhật hệ thống (nếu được yêu cầu đóng terminal,
mở lại UCRT64 rồi chạy tiếp):

```bash
pacman -Syu
pacman -S --needed mingw-w64-ucrt-x86_64-gcc
```

Nếu dùng CMake, cài thêm:

```bash
pacman -S --needed mingw-w64-ucrt-x86_64-cmake mingw-w64-ucrt-x86_64-make
```

Dùng bản CMake MinGW/UCRT64 theo [hướng dẫn MSYS2](https://www.msys2.org/docs/cmake/).
`build.bat` dùng trực tiếp g++, không phụ thuộc CMake. Hai script build/run hiện đặt
PATH theo `C:\msys64\ucrt64\bin`; nếu cài MSYS2 nơi khác, sửa đường dẫn trong script.

Kiểm tra trong PowerShell:

```powershell
$env:PATH = "C:\msys64\ucrt64\bin;$env:PATH"
g++ --version
# Chỉ cần khi dùng CMake:
cmake --version
mingw32-make --version
```

Máy phát triển đã dùng GCC 16.1.0; đây là phiên bản đã kiểm tra, không phải phiên bản tối thiểu bắt buộc.

## 2. Python và dịch offline

Môi trường dịch đã kiểm tra: Python **3.13.14** 64-bit, LibreTranslate **1.9.6**,
`argos-translate-lt` **1.12.1**. Nên dùng Python 3.13 để gần môi trường này.
Cài Python từ nguồn chính thức, bảo đảm lệnh `python` trỏ đến Python đã cài,
không phải alias mở Microsoft Store.

```powershell
python --version
python -m pip --version
```

Dependency trực tiếp được pin trong `translation/requirements.txt`:

```text
libretranslate==1.9.6
```

pip sẽ cài các dependency chuyển tiếp; không cần cài Flask, Argos, NumPy hoặc Redis server riêng.
Danh sách này chưa khóa toàn bộ dependency chuyển tiếp, nên một máy mới có thể resolve
phiên bản khác môi trường phát triển. Sau khi cài, dùng `pip check` để kiểm tra.
Lần đầu cần Internet để tải package và model; khi đã có đủ hai model, dịch chạy local.
Không cần GPU. Dung lượng và RAM phụ thuộc các package/model được tải; nên chừa vài GB trống.

## 3. Trình duyệt và dữ liệu

- Dùng trình duyệt desktop có hỗ trợ CSS zoom, backdrop-filter và JavaScript hiện đại.
- Phát âm dùng giọng đọc có sẵn qua Web Speech API; phụ thuộc trình duyệt/hệ điều hành.
- Ảnh, font và kho từ điển nằm sẵn trong repo. Không cần kết nối Figma để chạy.
- Giữ nguyên `data/dictionary.bin` cho tra cứu đầy đủ 155.139 mục.
- Nguồn/giấy phép dữ liệu: [THIRD_PARTY_DATA.md](THIRD_PARTY_DATA.md).
- Cổng ứng dụng: 8080. Cổng dịch local: 5000.

Xem [RUNNING.md](RUNNING.md) để chạy lần đầu, chạy hằng ngày và xử lý lỗi.
