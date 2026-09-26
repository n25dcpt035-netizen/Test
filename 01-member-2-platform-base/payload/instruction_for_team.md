# Hướng dẫn làm việc cho nhóm VocabMaster

## 1. Mục tiêu chung

Nhóm phát triển VocabMaster dưới dạng ứng dụng web chạy local. Frontend sử dụng HTML, CSS và JavaScript thuần; backend sử dụng C++17, cpp-httplib và dữ liệu CSV/JSON local. Phiên bản web đã được giảng viên đồng ý thay cho giao diện console.

Mỗi thành viên phải có phạm vi sở hữu rõ ràng, commit bằng tài khoản cá nhân và tạo Pull Request vào `main`. Không thành viên nào được push trực tiếp lên `main`. Leader là người kiểm tra và merge Pull Request.

Dự án không duy trì thư mục `tests/`. Mỗi Pull Request vẫn phải ghi rõ các bước kiểm tra thủ công đã thực hiện, kết quả build và các trường hợp biên đã kiểm tra.

## 2. Cấu trúc repository

```text
apps/
├── server/
│   ├── include/
│   │   ├── core/
│   │   ├── domain/
│   │   ├── locator/
│   │   ├── server/
│   │   ├── services/
│   │   ├── storage/
│   │   ├── third_party/
│   │   └── utils/
│   └── src/
│       ├── core/
│       ├── domain/
│       ├── server/
│       ├── services/
│       ├── storage/
│       ├── utils/
│       └── main.cpp
└── web/
    ├── assets/figma/
    ├── scripts/
    │   ├── core.js
    │   ├── bootstrap.js
    │   ├── ui-enhancements.js
    │   └── features/
    │       ├── dashboard.js
    │       ├── dictionary.js
    │       ├── vocabulary.js
    │       ├── study.js
    │       ├── quiz.js
    │       ├── analytics.js
    │       └── settings.js
    ├── styles/
    └── index.html
data/
docs/
scripts/
translation/
```

`apps/server` và `apps/web` là hai application riêng nhưng được chạy cùng origin bởi HTTP server. Backend không được chứa HTML/CSS và frontend không được đọc hoặc ghi trực tiếp file trong `data/`.

## 3. Nguyên tắc kiến trúc

Luồng phụ thuộc chính:

```text
Browser UI -> HTTP API -> Services -> Domain
                         -> Storage -> data/
```

- `domain/` chỉ chứa model và hành vi nghiệp vụ cốt lõi; không biết HTTP, DOM hoặc đường dẫn giao diện.
- `services/` điều phối nghiệp vụ; không render HTML và không xử lý chi tiết giao diện.
- `storage/` chịu trách nhiệm đọc ghi CSV hoặc dictionary binary.
- `server/HttpServer.cpp` ánh xạ HTTP request sang service. Không đặt thuật toán nghiệp vụ mới tại đây.
- `apps/web/scripts/features/` chia JavaScript theo màn hình và nghiệp vụ để giảm conflict.
- `core.js` chứa state, API client và helper dùng chung. Chỉ sửa khi nhiều feature thật sự cần thay đổi contract chung.
- `ui-enhancements.js` là lớp tương thích với giao diện Figma hiện tại. Thay đổi file này phải thông báo cho các thành viên bị ảnh hưởng.
- Không dùng `struct` cho model nghiệp vụ. Data member C++ phải là `private` hoặc `protected` và được truy cập qua API của class.
- `main.cpp` chỉ khởi tạo dependency và chạy server.
- Không commit file build, executable, môi trường Python hoặc dữ liệu tạm.

## 4. Phân công sáu thành viên

### Thành viên 1 UI UX và Figma

Phạm vi:

- Thiết kế và duy trì Figma, component, variant, responsive state và prototype.
- Chốt design token: màu sắc, font, spacing, radius, shadow và trạng thái tương tác.
- Chuẩn bị đầy đủ loading, empty, error, success, disabled và confirmation state.
- Export asset vào `apps/web/assets/figma/` với tên có nghĩa; không lưu URL Figma tạm trong code.
- Review hình ảnh Pull Request của các thành viên khác và xác nhận độ khớp thiết kế.
- Duy trì `docs/frontend/FIGMA_IMPLEMENTATION_GUIDE.md` khi design system thay đổi.

File sở hữu chính:

- `apps/web/assets/figma/`
- `docs/frontend/`
- File Figma của dự án

Kiến thức cần học:

- Figma components, variants, auto layout và constraints.
- Design token, responsive layout và accessibility cơ bản.
- Cách export SVG/PNG/font tối ưu cho web.
- Git cơ bản để commit asset và tài liệu bằng tài khoản cá nhân.

Definition of Done:

- Màn hình có đủ desktop state và trạng thái lỗi/rỗng.
- Asset được đặt tên rõ ràng và không bị trùng nội dung.
- Có ghi chú handoff về kích thước, spacing và hành vi tương tác.

### Thành viên 2 Platform và tích hợp hệ thống

Phạm vi:

- Quản lý bootstrap backend, Service Locator, HTTP server và static web root.
- Quản lý CMake, `build.bat`, `run.bat`, setup translation và hướng dẫn chạy.
- Quản lý shell frontend, router, global state, API client, modal, toast và settings.
- Quản lý persistence dùng chung, import/export và tính tương thích schema dữ liệu.
- Hỗ trợ các thành viên thêm endpoint vào `HttpServer.cpp` mà không đưa business logic vào route.
- Điều phối thay đổi ở file dùng chung và xử lý conflict tích hợp.

File sở hữu chính:

- `CMakeLists.txt`, `build.bat`, `run.bat`, `setup-translation.bat`
- `apps/server/src/main.cpp`
- `apps/server/include/server/`, `apps/server/src/server/`
- `apps/server/include/locator/`
- `apps/server/include/storage/CsvStorage.h`, `apps/server/src/storage/CsvStorage.cpp`
- `apps/web/index.html`
- `apps/web/scripts/core.js`, `bootstrap.js`, `ui-enhancements.js`
- `apps/web/scripts/features/settings.js`
- `apps/web/styles/base.css`, `overrides.css`, `features.css`

Kiến thức cần học:

- CMake, GCC/MinGW và cấu trúc build C++17.
- HTTP method, status code, JSON request/response và REST API cơ bản.
- Dependency injection thủ công và Service Locator hiện tại.
- File I/O an toàn, ghi file tạm rồi thay thế file chính.
- JavaScript event lifecycle, Fetch API và quản lý state không dùng framework.
- Git conflict resolution và cách review Pull Request.

Definition of Done:

- Project build sạch từ root và chạy được bằng `run.bat`.
- Static file, API và translation service hoạt động đúng đường dẫn.
- Thay đổi schema dữ liệu có hướng dẫn migration hoặc tương thích ngược.

### Thành viên 3 Từ điển và dịch thuật

Phạm vi:

- Tra cứu English to Vietnamese và Vietnamese to English.
- Đọc `dictionary.bin`, tìm kiếm, giới hạn kết quả và trả metadata.
- Hiển thị IPA, từ loại, định nghĩa, ví dụ và quan hệ từ.
- Dịch nhanh English và Vietnamese thông qua LibreTranslate local.
- Phát âm, copy kết quả và thêm kết quả tra cứu vào kho học.
- Xử lý trường hợp không tìm thấy từ, dịch vụ dịch chưa chạy hoặc response trễ.

File sở hữu chính:

- `apps/server/include/storage/DictionaryStorage.h`
- `apps/server/src/storage/DictionaryStorage.cpp`
- Phần endpoint `/api/dictionary/*` và `/api/translate` trong `HttpServer.cpp`
- `apps/web/scripts/features/dictionary.js`
- `apps/web/styles/dictionary.css`
- `translation/`

Kiến thức cần học:

- `std::map`, indexing, normalize chuỗi và tìm kiếm hai chiều.
- Binary file format và quản lý bộ nhớ khi đọc dictionary lớn.
- HTTP API, JSON và xử lý exception trong C++.
- Async JavaScript, debounce, race condition và Fetch API.
- LibreTranslate/Argos Translate và nguyên tắc fallback khi service offline.

Definition of Done:

- Tra từ hai chiều không phân biệt hoa thường và không crash với input rỗng.
- Request cũ không ghi đè kết quả của request mới.
- Giao diện hiển thị rõ lỗi kết nối và trạng thái không có kết quả.

### Thành viên 4 Quản lý từ vựng và chủ đề

Phạm vi:

- Domain `Word`, `GeneralWord`, `TechnicalTerm`, `Idiom` và index từ vựng.
- CRUD từ vựng và chủ đề, bookmark, tìm kiếm, lọc và từ đã lưu.
- Đồng bộ `words.csv`, `topics.json` và dữ liệu liên quan khi xóa cascade.
- Form thêm/sửa từ, tạo nhanh chủ đề và danh sách quản lý trên frontend.
- Bảo đảm polymorphism của các loại Word được sử dụng thật qua base class.

File sở hữu chính:

- `apps/server/include/domain/Word.h`, `GeneralWord.h`, `TechnicalTerm.h`, `Idiom.h`
- Các implementation tương ứng trong `apps/server/src/domain/`
- `apps/server/include/core/WordIndexManager.h`
- `apps/server/src/core/WordIndexManager.cpp`
- `apps/server/include/services/IVocabularyService.h`
- `apps/server/include/services/VocabularyService.h`
- `apps/server/src/services/VocabularyService.cpp`
- Phần endpoint `/api/words`, `/api/topics` và `/api/search` trong `HttpServer.cpp`
- `apps/web/scripts/features/vocabulary.js`
- `apps/web/styles/vocabulary.css`

Kiến thức cần học:

- Encapsulation, inheritance, abstract class và runtime polymorphism trong C++.
- `std::unique_ptr`, ownership và tránh dangling pointer.
- `std::vector`, `std::map`, index rebuild và CRUD consistency.
- Form validation, DOM rendering và escaping dữ liệu trên frontend.
- Cascade delete và bảo toàn tính nhất quán giữa vocabulary và progress.

Definition of Done:

- Add, view, update, delete và search hoạt động với cả ba loại Word.
- Không tạo duplicate ID hoặc index lỗi sau update/delete.
- Xóa chủ đề xử lý đúng các từ, bookmark và progress liên quan.

### Thành viên 5 Học tập và Leitner

Phạm vi:

- `StudyProgress`, quy tắc hộp Leitner và lịch ôn tập.
- Danh sách từ đến hạn, chọn theo chủ đề, bookmark hoặc hộp.
- Xử lý Again, Hard, Easy; cập nhật level, deadline và số lần đúng/sai.
- Flashcard, flip/hint, điều hướng thẻ và hoàn thành phiên học.
- Ghi activity phục vụ analytics nhưng không tự tính dashboard.

File sở hữu chính:

- `apps/server/include/domain/StudyProgress.h`
- `apps/server/src/domain/StudyProgress.cpp`
- `apps/server/include/core/LeitnerBoxCalculator.h`
- `apps/server/src/core/LeitnerBoxCalculator.cpp`
- `apps/server/include/services/IStudyService.h`
- `apps/server/include/services/StudyService.h`
- `apps/server/src/services/StudyService.cpp`
- Phần endpoint `/api/study/*` trong `HttpServer.cpp`
- `apps/web/scripts/features/study.js`

Kiến thức cần học:

- Leitner spaced repetition và cách tính lịch ôn.
- Unix timestamp, thời gian local và boundary của level.
- State machine cho phiên học và flashcard.
- Async UI, optimistic/pessimistic update và chống double submit.
- Quan hệ giữa StudyProgress và Word ID.

Definition of Done:

- Level luôn nằm trong phạm vi hợp lệ và deadline được cập nhật nhất quán.
- Không gửi hai review đồng thời cho cùng một thẻ.
- Hoàn thành phiên học không làm mất hoặc nhân đôi progress.

### Thành viên 6 Quiz và Analytics

Phạm vi:

- Sinh câu hỏi English to Vietnamese và Vietnamese to English.
- Chấm điểm, normalize đáp án, lưu lịch sử và xem lại câu sai.
- Tính accuracy, weak words, phân bố Leitner, timeline và activity log.
- Render màn thiết lập quiz, làm bài, kết quả, dashboard và lịch sử.
- Xử lý dữ liệu rỗng, zero attempt và bộ lọc không đủ số câu.

File sở hữu chính:

- `apps/server/include/core/QuizEngine.h`, `MetricsCalculator.h`
- `apps/server/src/core/QuizEngine.cpp`, `MetricsCalculator.cpp`
- `apps/server/include/domain/QuizQuestion.h`, `QuizResult.h`, `WeakWordInfo.h`
- Các implementation tương ứng trong `apps/server/src/domain/`
- `apps/server/include/services/IQuizService.h`, `IAnalyticsService.h`
- `apps/server/include/services/QuizService.h`, `AnalyticsService.h`
- `apps/server/src/services/QuizService.cpp`, `AnalyticsService.cpp`
- Phần endpoint `/api/quiz/*` và `/api/analytics/*` trong `HttpServer.cpp`
- `apps/web/scripts/features/quiz.js`, `analytics.js`, `dashboard.js`
- `apps/web/styles/dashboard.css`

Kiến thức cần học:

- Thuật toán random selection không lặp và normalize đáp án.
- Công thức accuracy, weak-word threshold và aggregation.
- JSON history schema, timeline theo ngày và dữ liệu thiếu.
- DOM rendering cho chart đơn giản và review history.
- Đồng bộ quiz result với StudyService và activity log.

Definition of Done:

- Quiz không lặp câu ngoài ý muốn và không vượt số từ của nguồn.
- Accuracy không chia cho zero; weak-word rule được áp dụng nhất quán.
- Lịch sử có thể mở lại và dữ liệu dashboard khớp với hoạt động đã lưu.

## 5. Quy tắc sửa file dùng chung

`HttpServer.cpp` và `ui-enhancements.js` là hai điểm tích hợp dùng chung. Khi cần sửa:

1. Feature owner thông báo trong nhóm endpoint hoặc renderer cần thay đổi.
2. Giữ thay đổi nhỏ và chỉ chạm vùng liên quan đến feature.
3. Không format lại toàn bộ file trong cùng Pull Request.
4. Thành viên 2 review dependency và contract chung.
5. Nếu hai branch cùng cần sửa một vùng, merge Pull Request nhỏ hơn trước; branch còn lại cập nhật từ `main` rồi mới tiếp tục.

Không tự ý đổi response JSON của feature khác. Nếu contract bắt buộc thay đổi, cập nhật cả backend, frontend và tài liệu trong cùng Pull Request.

## 6. Cách tạo branch

Mỗi task tạo một branch mới từ `main` mới nhất. Không dùng một branch cá nhân kéo dài cho cả học kỳ.

```bash
git switch main
git pull origin main
git switch -c feat/dictionary-vietnamese-search
```

Quy ước tên branch:

- `feat/<ten-ngan>` cho tính năng mới.
- `fix/<ten-loi>` cho sửa lỗi.
- `refactor/<pham-vi>` cho thay đổi cấu trúc không đổi hành vi.
- `docs/<noi-dung>` cho tài liệu.
- `design/<man-hinh>` cho Figma asset hoặc UI handoff.

Ví dụ theo thành viên:

```text
design/quiz-result-screen
feat/platform-import-export
feat/dictionary-search
feat/vocabulary-topic-crud
feat/study-leitner-review
feat/quiz-history
```

Không tạo branch từ một feature branch khác nếu hai task không phụ thuộc trực tiếp nhau.

## 7. Cách commit

Trước khi commit:

```bash
git status
git diff
```

Chỉ stage đúng file thuộc task:

```bash
git add apps/web/scripts/features/dictionary.js
git add apps/server/src/storage/DictionaryStorage.cpp
git commit -m "feat(dictionary): support Vietnamese lookup"
```

Format commit message:

```text
type(scope): mô tả ngắn ở dạng hành động
```

Các `type` được dùng:

- `feat`: thêm tính năng.
- `fix`: sửa lỗi.
- `refactor`: đổi cấu trúc nhưng giữ hành vi.
- `docs`: cập nhật tài liệu.
- `style`: thay đổi giao diện không ảnh hưởng logic.
- `build`: thay đổi CMake hoặc script build.
- `chore`: bảo trì nhỏ không thuộc các loại trên.

Ví dụ tốt:

```text
feat(study): add box filter for flashcards
fix(quiz): prevent duplicate answer submission
refactor(web): split feature scripts
style(dictionary): align empty search state with Figma
docs(team): clarify pull request workflow
```

Không dùng message như `update`, `fix code`, `final`, `done`, `code mới` hoặc gộp nhiều feature không liên quan vào một commit.

Một commit phải build được hoặc là một bước nhỏ có mục đích rõ ràng. Không commit `VocabularySystem.exe`, `build/`, `.venv-translate/`, file backup hoặc dữ liệu runtime vô tình thay đổi.

## 8. Push branch và tạo Pull Request vào main

Push lần đầu:

```bash
git push -u origin feat/dictionary-vietnamese-search
```

Tạo Pull Request với:

- Base branch: `main`.
- Compare branch: branch của task.
- Tiêu đề theo format commit, ví dụ `feat(dictionary): support Vietnamese lookup`.
- Mô tả vấn đề và phạm vi giải quyết.
- Danh sách file/module chính đã sửa.
- API hoặc schema bị thay đổi.
- Các bước kiểm tra thủ công và kết quả.
- Screenshot hoặc video ngắn nếu thay đổi UI.
- Rủi ro hoặc phần cần reviewer chú ý.

Không tự merge Pull Request của mình. Không push trực tiếp vào `main`.

## 9. Cập nhật branch khi main thay đổi

Trước khi xin merge, đồng bộ `main`:

```bash
git fetch origin
git switch feat/dictionary-vietnamese-search
git merge origin/main
```

Nếu có conflict:

1. Đọc cả hai phiên bản, không chọn hàng loạt `ours` hoặc `theirs`.
2. Trao đổi với owner của file nếu conflict nằm ngoài phạm vi mình phụ trách.
3. Build và kiểm tra lại sau khi resolve.
4. Commit conflict resolution rõ ràng rồi push lại branch.

```bash
git add <cac-file-da-resolve>
git commit -m "chore(git): resolve main integration conflicts"
git push
```

## 10. Checklist trước khi yêu cầu review

- Build backend thành công bằng `build.bat` hoặc CMake.
- Chạy ứng dụng từ repository root.
- Console trình duyệt không có lỗi JavaScript mới.
- Endpoint liên quan trả đúng status và JSON.
- Kiểm tra input rỗng, dữ liệu không tồn tại và thao tác lặp nhanh.
- Không có asset hoặc đường dẫn bị 404.
- `git diff --check` không báo whitespace error.
- `git status` không có executable, build output hoặc dữ liệu ngoài phạm vi.
- Pull Request chỉ chứa một feature hoặc một mục tiêu rõ ràng.

## 11. Quy trình review và merge dành cho leader

Leader cấu hình bảo vệ `main`:

- Chặn direct push.
- Chỉ cho merge thông qua Pull Request.
- Yêu cầu branch cập nhật với `main` trước khi merge.
- Yêu cầu tối thiểu một reviewer; thay đổi file dùng chung nên có thành viên 2 review.

Leader review theo thứ tự:

1. Xác nhận Pull Request đúng scope và đúng owner.
2. Kiểm tra commit history có ý nghĩa và mang tài khoản của người thực hiện.
3. Kiểm tra kiến trúc: domain, service, HTTP và UI không bị trộn trách nhiệm.
4. Kiểm tra build và các bước manual verification trong mô tả PR.
5. Kiểm tra UI với thành viên 1 nếu có thay đổi giao diện.
6. Yêu cầu sửa bằng review comment; không tự sửa hộ trực tiếp trên `main`.
7. Chỉ merge khi conversation đã resolved và branch không conflict.

Để giữ lịch sử commit cá nhân phục vụ chấm điểm, leader chọn **Create a merge commit** trên GitHub. Không dùng **Squash and merge** cho các PR có nhiều commit đóng góp cần được giữ lại. Không dùng nút merge nếu branch chưa được review.

Sau khi merge:

```bash
git switch main
git pull origin main
git branch -d feat/dictionary-vietnamese-search
```

Leader có thể xóa remote branch sau khi xác nhận Pull Request đã merge thành công.

## 12. Thứ tự tích hợp khuyến nghị

1. Thành viên 2 chốt build, shared contracts và shell.
2. Thành viên 4 chốt Word model và VocabularyService contract.
3. Thành viên 3, 5 và 6 triển khai song song trên branch riêng.
4. Thành viên 1 bàn giao từng màn hình theo thứ tự feature đang được code.
5. Merge các PR nền tảng nhỏ trước, sau đó dictionary, vocabulary, study, quiz và analytics.
6. Trước buổi demo, mỗi thành viên phải tự giải thích được module, dependency, dữ liệu vào ra và một edge case của phần mình.

## 13. Các hành vi tuyệt đối tránh

- Push hoặc commit trực tiếp lên `main`.
- Một người commit thay cho nhiều thành viên.
- Dùng chung tài khoản Git.
- Copy toàn bộ code của người khác vào commit của mình để tăng số dòng.
- Đổi schema hoặc API âm thầm.
- Format toàn repository trong một feature PR.
- Commit secret, executable, môi trường ảo hoặc file dữ liệu tạm.
- Merge khi build lỗi hoặc chưa xử lý review comment.
- Đưa business logic vào JavaScript chỉ để né sửa service C++.
- Đưa HTML response hoặc thao tác file vào domain class.
