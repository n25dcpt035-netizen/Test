# Hướng dẫn chạy VocabMaster

## 1. Chuẩn bị

Cài công cụ trong [REQUIREMENTS.md](REQUIREMENTS.md). Các lệnh dưới đây chạy bằng
**PowerShell tại thư mục gốc repo**, nơi có `build.bat`, `run.bat`, `apps/`, `data/`.
Không mở trực tiếp `apps/web/index.html` bằng file:// hoặc Live Server: frontend cần API C++ cùng origin.

```powershell
git clone https://github.com/Thiendeptrai169/Learning-English-Web.git
cd Learning-English-Web
.\build.bat
```

Build thành công tạo `VocabularySystem.exe` ở thư mục gốc. Nếu đã chạy backend,
dừng nó trước khi build lại để tránh lỗi executable đang bị khóa.

## 2. Cài tính năng dịch (lần đầu)

Bỏ qua phần này nếu chỉ dùng từ điển, Flashcards, kiểm tra và quản lý từ.
Chạy các lệnh chuẩn dưới đây để tạo môi trường riêng, tải dependency và model:

```powershell
python -m venv .venv-translate
.\.venv-translate\Scripts\python.exe -m pip install -r translation\requirements.txt
.\.venv-translate\Scripts\python.exe translation\install_models.py
.\.venv-translate\Scripts\python.exe -m pip check
```

Không cần activate venv vì các lệnh đã dùng đúng executable. Script `setup-translation.bat`
cũng thực hiện cài đặt, nhưng hiện có tùy chọn `--trusted-host`; nên dùng các lệnh trên
để giữ kiểm tra chứng chỉ TLS mặc định. Nếu gặp lỗi chứng chỉ, sửa CA/proxy của máy,
không tắt kiểm tra TLS để xử lý tạm.

Đọc output cài model: cần có cả en→vi và vi→en. Nếu nguồn model không có một chiều,
script có thể in cảnh báo rồi kết thúc; không nên coi đó là đã cài đủ.

## 3. Chạy hằng ngày

```powershell
.\run.bat
```

Mở [http://localhost:8080](http://localhost:8080). Script chạy backend và, nếu đã cài,
khởi động LibreTranslate tại `127.0.0.1:5000`. Giữ terminal đang chạy backend.
Chỉ chạy một instance; không gọi `run.bat` lần nữa khi cổng 8080/5000 đã được sử dụng.

Nếu dịch vụ dịch đã chạy, chỉ cần khởi động backend:

```powershell
.\VocabularySystem.exe
```

Để dễ theo dõi và dừng từng dịch vụ, có thể dùng hai terminal riêng:

```powershell
# Terminal 1 — tại thư mục repo
.\.venv-translate\Scripts\libretranslate.exe --host 127.0.0.1 --port 5000 --load-only en,vi --disable-files-translation --disable-web-ui
```

```powershell
# Terminal 2 — tại thư mục repo
.\VocabularySystem.exe
```

Đợi model tải xong trước khi thử Dịch nhanh. Nhấn Ctrl+C trong mỗi terminal để dừng.
Khi dùng `run.bat`, dịch vụ dịch được chạy nền bằng `start /B` và có thể còn chạy sau
khi backend dừng; kiểm tra PID trước khi khởi động lại hoặc kết thúc tiến trình.

## 4. Kiểm tra sau khi khởi động

```powershell
Invoke-RestMethod http://localhost:8080/api/topics
Invoke-RestMethod http://localhost:8080/api/analytics/dashboard
Invoke-RestMethod http://127.0.0.1:5000/languages
```

Trên giao diện: mở Bộ từ vựng → Flashcards; tra một từ trong Từ điển; nhập câu
vào Dịch nhanh và chờ kết quả tự động. Thao tác đánh giá/nộp bài sẽ ghi tiến độ thật.
Không dùng dữ liệu cá nhân đang học để chạy thử hàng loạt.

## 5. Build bằng CMake (tùy chọn)

```powershell
$env:PATH = "C:\msys64\ucrt64\bin;$env:PATH"
cmake -S . -B build -G "MinGW Makefiles"
cmake --build build -j 4
.\build\VocabularySystem.exe
```

Vẫn đứng ở **thư mục gốc** khi chạy executable: đường dẫn apps/web và data là tương đối với
working directory. `run.bat` chỉ chạy executable ở gốc, không chạy bản trong build/.
Nếu dùng CMake, chạy trực tiếp như trên để không vô tình dùng binary cũ.

## 6. Dữ liệu và cập nhật

- Tự lưu trong `data/`: từ, chủ đề, hồ sơ, tiến độ, bookmark, lịch sử và hoạt động học.
- Lịch ôn và thống kê ngày dùng giờ/múi giờ local của máy.
- Vào Cài đặt → Xuất dữ liệu trước khi cập nhật/nhập backup. Nhập dữ liệu có thể thay thế dữ liệu đang có.
- Sao lưu thêm toàn bộ thư mục `data/` khi backend đã dừng. File xuất JSON không chứa kho từ điển nhị phân.
- Không chạy lại script tạo seed trên dữ liệu đang học; các script này dành cho tái tạo dữ liệu.
- Các file dữ liệu đang được Git theo dõi: kiểm tra diff trước khi pull/commit để tránh ghi đè hoặc chia sẻ dữ liệu học ngoài ý muốn.
- Sau khi cập nhật C++: build lại. Sau khi sửa HTML/CSS/JS: refresh trình duyệt, không cần build frontend.

## 7. Xử lý lỗi thường gặp

| Lỗi | Kiểm tra / cách xử lý |
| --- | --- |
| Không tìm thấy g++ | Kiểm tra MSYS2 UCRT64 và PATH; dùng đường dẫn trong REQUIREMENTS.md |
| Không tìm thấy python | Kiểm tra Python đã cài và alias/PATH; tạo lại venv bằng đúng Python |
| Không tìm thấy cmake | Thêm UCRT64 bin vào PATH; hoặc dùng build.bat không cần CMake |
| Permission denied khi build exe | Dừng đúng backend của dự án rồi build lại |
| localhost:8080 từ chối kết nối | Xem terminal backend, vị trí executable và lỗi khởi động |
| Trang trống/404 hoặc không có dữ liệu | Chạy từ thư mục gốc repo; kiểm tra apps/web/ và data/ còn đủ |
| Dịch báo không kết nối | Kiểm tra cổng 5000, chờ load model; chạy dịch vụ trong terminal riêng để đọc lỗi |
| Tra từ không có kết quả | Kiểm tra data/dictionary.bin và terminal backend |
| UI vẫn là bản cũ | Ctrl+F5 để tải lại CSS/JS |
| Không nghe phát âm | Kiểm tra cài đặt âm thanh, giọng đọc hệ điều hành và hỗ trợ trình duyệt |

Tìm đúng tiến trình chiếm cổng, không dừng mọi tiến trình Python trên máy:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 8080,5000 -ErrorAction SilentlyContinue |
    Select-Object LocalAddress,LocalPort,OwningProcess
# Thay 12345 bằng PID vừa xác minh:
Get-CimInstance Win32_Process -Filter "ProcessId=12345" |
    Select-Object ProcessId,ExecutablePath,CommandLine
```

## Phạm vi chạy

Ứng dụng một người dùng, không có đăng nhập. Backend hiện listen `0.0.0.0:8080`,
do đó có thể truy cập từ mạng LAN nếu firewall cho phép. Không port-forward, mở
public Internet hoặc triển khai lên máy chủ công khai với cấu hình này. Dịch vụ
dịch được script bind vào loopback `127.0.0.1`.
