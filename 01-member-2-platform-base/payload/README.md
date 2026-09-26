# VocabMaster — English Learning Web

Ứng dụng học từ vựng chạy local với front-end HTML/CSS/JavaScript và backend C++17.
Giao diện được triển khai theo bộ thiết kế Figma của dự án, tối ưu cho laptop và desktop.

## Tính năng

- Từ điển Anh–Việt đầy đủ 155.139 mục, có IPA, từ loại, định nghĩa và biến thể khi nguồn có dữ liệu.
- Kho học mặc định 180 từ, chia đều vào 6 chủ đề: Travel, Business, Daily Conversations,
  Academic, Food & Dining và Technology.
- Quản lý chủ đề và từ vựng; tạo chủ đề ngay trong form thêm từ; xóa chủ đề sẽ xóa cascade các từ,
  bookmark và tiến độ liên quan.
- Danh sách Đã lưu độc lập với chủ đề.
- Leitner 3 hộp theo thời gian local của máy: từ chưa học đứng ngoài các hộp cho đến lần tự đánh giá
  đầu tiên; Ôn lại vào Hộp 1, Khó vào Hộp 2 và Dễ vào Hộp 3, với lịch 1/3/7 ngày.
- Kiểm tra nhập đáp án Anh → Việt hoặc Việt → Anh, chọn 5/10/20 câu và lọc theo chủ đề,
  mục Đã lưu hoặc hộp Leitner.
- Phân tích độ chính xác, phân bố hộp, timeline 7 ngày, hoạt động gần đây, tiến độ chủ đề,
  từ yếu và lịch sử kiểm tra chi tiết để xem lại câu sai.
- Một hồ sơ không cần đăng nhập, đổi được tên; dữ liệu tự lưu local, có xuất/nhập JSON.
- Dịch offline Anh ↔ Việt bằng LibreTranslate/Argos Translate, không cần Docker.

## Chạy ứng dụng

- [Công nghệ, thư viện và công cụ cần cài](REQUIREMENTS.md)
- [Hướng dẫn chạy chi tiết và xử lý lỗi](RUNNING.md)
- [Checklist kiểm tra giao diện](docs/frontend/UI_QA_CHECKLIST.md)

1. Chạy `build.bat` để biên dịch backend.
2. Chạy `setup-translation.bat` một lần để cài LibreTranslate và hai model `en↔vi`.
3. Chạy `run.bat`, sau đó mở [http://localhost:8080](http://localhost:8080).

## Cấu trúc dự án

```text
apps/
├── server/              # Backend C++17, HTTP API và lưu trữ
│   ├── include/
│   └── src/
└── web/                 # Frontend HTML, CSS và JavaScript thuần
    ├── assets/
    ├── scripts/
    │   └── features/    # Mã giao diện chia theo nghiệp vụ
    └── styles/
data/                    # Từ vựng, tiến độ và lịch sử local
docs/                    # Tài liệu môn học và hướng dẫn frontend
scripts/                 # Công cụ tạo dữ liệu
translation/             # Cài đặt dịch offline
```

Quyền sở hữu module, kiến thức cần chuẩn bị và quy trình Git của nhóm được mô tả
trong [instruction_for_team.md](instruction_for_team.md).

MSYS2 UCRT64, GCC và CMake được dùng cho bản build Windows. Có thể build bằng CMake:

```powershell
$env:PATH = "C:\msys64\ucrt64\bin;$env:PATH"
cmake -S . -B build -G "MinGW Makefiles"
cmake --build build -j 4
```

## Dữ liệu

- `data/words.csv`: 180 từ trong kho học.
- `data/dictionary.bin`: 155.139 mục từ ở định dạng nhị phân tối ưu cho tra cứu local.
- `data/topics.json`: các chủ đề.
- `data/progress.csv`: tiến độ và deadline ôn tập theo Unix timestamp/local time.
- `data/settings.json`, `data/quiz_history.json`: hồ sơ/cài đặt và lịch sử kiểm tra chi tiết.
- `data/activity_history.json`: hoạt động học, thời lượng và dữ liệu timeline, hoàn toàn lưu local.

Backend tự chuyển dữ liệu `nextReviewSession` cũ sang `nextReviewAt` ở lần ghi tiếp theo. Các API
`/api/analytics/activity`, `/api/analytics/timeline` và `/api/quiz/history/{id}` cung cấp dữ liệu cho
các màn Phân tích tiến độ và Xem lại bài làm trong Figma mới.

Xem [THIRD_PARTY_DATA.md](THIRD_PARTY_DATA.md) để biết nguồn và giấy phép dữ liệu.
