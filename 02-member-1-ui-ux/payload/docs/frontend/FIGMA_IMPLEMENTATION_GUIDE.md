# Hướng dẫn triển khai frontend từ Figma — VocabMaster

Tài liệu bàn giao cho các agent làm giao diện tiếp theo. Đọc trước khi sửa `apps/web/`. Mục tiêu là tái hiện thiết kế được người dùng duyệt, đồng thời giữ chức năng và dữ liệu thật hoạt động.

## 1. Nguyên tắc cốt lõi

Chất lượng đến từ vòng lặp **đọc thiết kế → lấy asset thật → đo kích thước → triển khai → xem trình duyệt → sửa sai lệch**. Không dựa riêng vào cảm giác “trông gần giống”.

- Figma là nguồn tham chiếu về hình thức; các quyết định đã chốt của người dùng là nguồn tham chiếu về hành vi và dữ liệu.
- Làm từng trang. Trang chủ và trang Từ điển & Dịch đã được người dùng khen/duyệt về hướng giao diện; dùng làm mốc hồi quy.
- Không tự thiết kế lại bố cục, thêm hero lớn, phóng chữ, đổi màu hoặc đổi icon khi đã có mẫu.
- So sánh cùng viewport và cùng trạng thái dữ liệu. Screenshot thu nhỏ trong chat không phải kích thước CSS thật.
- Không tuyên bố “giống 100% từng pixel” chỉ vì build thành công hoặc không có lỗi console. Cần bằng chứng hình ảnh và số đo; nêu rõ phần chưa kiểm chứng.

## 2. Bản đồ project và nguồn thiết kế

| Nguồn | Vai trò |
| --- | --- |
| `apps/web/index.html` | Shell, sidebar, topbar và thứ tự tải stylesheet |
| `apps/web/scripts/core.js` | State dùng chung, API client, điều hướng và helper |
| `apps/web/scripts/features/*.js` | Render và xử lý nghiệp vụ của từng feature |
| `apps/web/styles/base.css` | CSS nền dùng chung; thay đổi ở đây có thể ảnh hưởng nhiều trang |
| `apps/web/styles/overrides.css` | Các ghi đè bổ sung đang có |
| `apps/web/styles/dashboard.css` | Trang chủ, trạng thái body `.dashboard-view` |
| `apps/web/styles/dictionary.css` | Từ điển & Dịch, trạng thái body `.dictionary-view` |
| `apps/web/styles/vocabulary.css` | Shell bộ từ vựng `.leitner-view`, danh mục/bảng `.vocabulary-view`, màn học `.leitner-page` |
| `apps/web/assets/figma/` | Ảnh, SVG, font Inter và giấy phép font lưu local |

Figma file key hiện hành: `q23yWUXBoWa8GIzD0tvLcj`.

- [Trang chủ — node 8:66](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=8-66)
- [Từ điển & Dịch — node 27:137](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=27-137)
- [Bộ chủ đề từ vựng — node 69:4](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=69-4)
- [Từ đã lưu — node 70:654](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=70-654)
- [Kiểm tra — node 71:1313](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=71-1313)
- [Phân tích tiến độ — node 71:1851](https://www.figma.com/design/q23yWUXBoWa8GIzD0tvLcj/?node-id=71-1851)
- Các frame tham chiếu trên có kích thước **1440 × 1201**. Xác minh lại nếu Figma được cập nhật.

Khi làm qua plugin Figma, đọc skill `figma-design-to-code` trước khi gọi `get_design_context`. Lấy metadata để tìm đúng frame nếu link chỉ đến page; lấy design context và ảnh tham chiếu của frame đó. Tuân thủ hướng dẫn tool/skill hiện có trong phiên làm việc, không đoán schema từ tài liệu này.

## 3. Khảo sát trước khi chỉnh

1. Đọc hướng dẫn repository nếu có, kiểm tra `git status` và diff hiện tại. Giữ nguyên công việc đang có của người dùng.
2. Đọc hàm render của view, CSS nền, CSS ghi đè và thứ tự stylesheet trong HTML.
3. Mở trang đang chạy và chụp trạng thái trước khi sửa.
4. Xác định frame Figma, viewport chuẩn, các thành phần dùng chung và dữ liệu động.
5. Ghi bảng số đo trước khi code: x/y, width/height, padding, gap, radius, border, font, line-height, fill, opacity, shadow và blur.

Đọc cả cây cha: sai tọa độ của container cha sẽ kéo sai toàn bộ con. Đừng sửa từng margin nhỏ khi nguyên nhân là sidebar, topbar hoặc scale.

## 4. Asset: dùng đúng ảnh, đúng crop, đúng độ trong suốt

- Lấy ảnh và SVG từ Figma, tải về `apps/web/assets/figma/`, đặt tên có nghĩa và tham chiếu bằng đường dẫn local.
- URL asset từ công cụ có thể hết hạn. Tải ngay; không đưa URL tạm vào CSS production.
- Kiểm tra file có nội dung ảnh/SVG thật, kích thước đúng và được server trả về thành công. HTTP 200 vẫn có thể là trang HTML báo lỗi.
- Giữ nguyên tỉ lệ SVG/viewBox. Chỉ đổi màu khi thiết kế yêu cầu; không áp `filter` làm mất màu của icon nhiều màu.
- Font Inter đã có local: regular 400, medium 500, semibold 600, bold 700. Nếu Figma cần 800, cần font đúng weight; không coi chữ đậm giả lập là tương đương.

### Bài học từ background con thuyền

`home-background-rendered.png` là bản export nền đã có crop/texture/độ nhạt theo Figma. `background.png` là ảnh nền nhẹ dùng cho shell chung.

Nếu dùng bản đã render, không phủ thêm opacity/gradient trắng theo phỏng đoán. Nếu dùng ảnh gốc, cần tái hiện đúng các lớp fill của Figma. Áp độ trong suốt hai lần sẽ làm thuyền gần như biến mất.

Kiểm tra thêm `background-size`, `background-position`, chiều cao vùng nền, overflow và z-index. `cover` có thể cắt mất thuyền; kéo nền theo một container quá cao có thể đẩy thuyền xuống dưới màn hình. Đặt nền dưới header, trong vùng nội dung; không để nó phủ sidebar.

Chỉ export lớp ảnh/illustration cần dùng. Không biến cả màn hình thành một ảnh nền để giả giao diện.

## 5. Chuyển số đo sang HTML/CSS

Tọa độ Figma là tọa độ tương đối với frame. Khi DOM có container tại x=285, phần tử ở x=334 cần `left:49px` trong container đó, không phải `334px`.

Các số đo đang dùng cho Từ điển & Dịch ở viewport 1440 × 1201:

| Thành phần | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| Sidebar | 0 | 0 | 285 | Theo viewport |
| Topbar | 286 | 0 | Phần rộng còn lại | 80 |
| Tiêu đề Từ điển | 334 | 113 | Theo nội dung | 34 |
| Thanh tra từ | 334 | 163 | 1074 | 62 |
| Thẻ kết quả | 329 | 242 | 1074 | 399 |
| Khối Dịch nhanh, gồm tiêu đề | 335 | 654 | 1068 | 373 |

Đây là mốc kiểm tra frame hiện tại, không phải bộ kích thước chung áp cho mọi trang.

Các số đo chính của màn Học Leitner, node `71:2075`:

| Thành phần | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| Tiêu đề / phụ đề | 374 | 127 | 700 | 56 |
| Thẻ đang ôn | 374 | 208 | 966 | 461 |
| Nút chuyển thẻ trái | 331 | 395 | 75 | 73 |
| Nút chuyển thẻ phải | 1310 | 395 | 75 | 73 |
| Lưới ba hộp Leitner | 347 | 728 | 1029 | 221 |

Các số đo chính của màn Bộ chủ đề, node `69:4`:

| Thành phần | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| Tiêu đề / bộ lọc | 335 | 128 | 1051 | 57 |
| Khu duyệt chủ đề | 335 | 209 | 1055 | 523 |
| Lưới chủ đề | 335 | 249 | 1055 | 452 |
| Mỗi thẻ chủ đề | — | — | 339–340 | 218 |

Các số đo chính của tab Từ đã lưu, node `70:654`:

| Thành phần | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| Khối từ đã lưu | 374 | 208 | 978 | 507 |
| Thanh tìm kiếm / lọc | 374 | 268 | 978 | 40 |
| Bảng từ | 374 | 324 | 978 | 365 |
| Tiêu đề bảng / mỗi hàng | — | — | 978 | 44 / 59 |

Luồng đã chốt: sidebar **Bộ từ vựng & Leitner** luôn mở danh mục chủ đề; nút **Flashcards** mới chuyển sang màn Leitner và học toàn bộ từ của đúng chủ đề. Bấm lại sidebar hoặc hoàn tất bộ thẻ quay về danh mục. Tab **Từ đã lưu** là bảng riêng; bỏ lưu không xóa từ khỏi chủ đề.

Sửa fidelity ngày 16/09: nền dùng chung `home-background-rendered.png`, export đã chứa crop/texture/alpha, nên CSS để opacity 1. Không phủ thêm opacity .25. Không chia chiều cao 1201px cho scale lần nữa. Danh mục và bảng đã chuyển về normal flow để nội dung dài làm trang tăng chiều cao; header có lớp riêng để nút lọc không bị container toàn trang chặn click. Ở 1440×1201 đã đo: header (335,128), thẻ đầu (335,249,340,218). Kiểm tra cả click chuột, không chỉ Enter.

Màn này dùng `home-background-rendered.png`, `lightbulb.svg`, `leitner-arrow.svg` và ba chevron màu trong `apps/web/assets/figma/`. Hiển thị số hộp, từ, chủ đề và phiên âm từ dữ liệu thật; chữ mẫu “Serendipity” và các số 24/40/112 chỉ là dữ liệu minh họa của Figma.

- Ưu tiên flex/grid cho hàng, cột và nội dung động; `min-width:0` giúp nội dung dài không phá layout.
- Absolute positioning có ích khi khớp frame cố định, nhưng phải kiểm tra dữ liệu dài và responsive. Không dùng nó mặc định cho toàn ứng dụng.
- `box-sizing:border-box` giúp width/height bao gồm padding/border. Phân biệt border, outline và inset shadow vì chúng ảnh hưởng hình học khác nhau.
- Khớp font trước khi chỉnh khoảng cách: sai font/weight/line-height làm chiều dài chữ và xuống dòng khác hoàn toàn.
- Tái hiện đúng alpha của fill, hướng gradient, blur và radius. Màu trắng bán trong suốt khác nền trắng đặc.
- Đừng dùng `overflow:hidden` hoặc ellipsis chỉ để che lỗi bố cục. Nội dung từ điển dài cần cách đọc đầy đủ, chẳng hạn vùng cuộn hoặc mở rộng.

## 6. Cách ly CSS để bảo vệ các trang đã duyệt

Mỗi view nên có class riêng trên body, do `syncShell()` cập nhật, và selector có phạm vi rõ ràng:

```css
.dictionary-view .dictionary-result { /* ... */ }
.dictionary-view .topbar { /* ... */ }
```

Tên component nên đặc trưng như `.dictionary-word-head`, tránh ghi đè toàn cục `h2`, `.card`, `.content`, `button`. Một số selector hiện tại chỉ có tên component mà không có body prefix; đừng sao chép cách đó sang các tên dễ trùng.

Thêm stylesheet của view sau stylesheet nền, kiểm tra selector nào thắng bằng computed styles. Nếu sửa shell chung, kiểm tra lại ít nhất trang chủ và từ điển. Không tiếp tục chồng nhiều lớp `!important` để chữa một cascade chưa hiểu rõ.

## 7. Responsive desktop/laptop

Người dùng đã chốt desktop/laptop/PC, chưa yêu cầu mobile. Kiểm tra frame gốc 1440 × 1201 và laptop 1366 × 768; kiểm tra thêm màn hình thực tế hoặc breakpoint bị ảnh hưởng.

Hai trang hiện có sử dụng CSS `zoom` và scale theo viewport với ngưỡng tối thiểu 0.75. Đây là cách triển khai hiện tại, không phải công thức chuẩn áp cho mọi trang. Chiều cao viewport ngắn có thể kích hoạt scale; kích thước fixed cộng với zoom có thể để thừa khoảng trống hoặc gây tràn khi viewport nhỏ hơn.

Bộ từ vựng/Leitner phải dùng cùng công thức scale với Trang chủ và Từ điển & Dịch: `clamp(.75,min(100vw / 1440px,100vh / 1201px),1)`, cùng sidebar 285px (250px khi viewport dưới 1180px). Không đổi riêng trang này sang scale theo chiều rộng: sẽ làm sidebar, topbar, chữ và nút lớn hơn hai trang đã duyệt ở cùng cửa sổ. Danh mục vẫn giãn cột theo vùng nội dung.

Phải đo kết quả thực tế: sidebar, vùng nội dung, cạnh phải, chiều cao cuộn, header fixed và vị trí con thuyền. Không dựa riêng vào media query. Ưu tiên layout co giãn cho trang mới nếu nội dung thay đổi; giữ mốc hình học chuẩn ở frame gốc.

## 8. Dữ liệu và hành vi phải hoạt động thật

- Tra từ điển tiếp tục dùng toàn bộ kho local 155.139 mục. Bộ học mẫu khoảng 180 từ là tập riêng.
- API hiện có: `GET /api/dictionary/search`, `POST /api/translate`, `POST /api/words/{id}/saved`. Đọc code/backend để xác nhận payload trước khi sửa.
- Dịch dùng dịch vụ local đã cấu hình. Không tự thêm API bên ngoài hoặc gửi nội dung ra ngoài.
- Một hồ sơ trên máy, tên sửa được; không đăng nhập. Dữ liệu lưu local.
- Một từ thuộc một chủ đề, đồng thời có thể được đánh dấu Đã lưu. Bỏ lưu không xóa từ khỏi chủ đề; xóa chủ đề mới xóa các từ trong đó.
- Tiến độ Leitner dùng giờ local của máy. Hộp 1/2/3 có deadline lần lượt sau 1/3/7 ngày;
  API trả cả Unix timestamp và chuỗi local để frontend hiển thị đúng.

Figma minh họa Resilient bằng một định nghĩa/ví dụ cụ thể; dữ liệu từ repo có thể khác. Giữ cấu trúc và style, hiển thị dữ liệu thật. Không gán văn bản demo cho mọi từ để screenshot giống mẫu.

### Các giới hạn hiện tại cần biết khi làm tiếp

- Kho từ điển không bảo đảm có ví dụ, đồng nghĩa và trái nghĩa cho mọi mục. Trang hiện lấy một phần dữ liệu bổ sung từ bộ học.
- Hàm render hiện có câu ví dụ fallback tự ghép và dòng “Nghĩa của từ trong ví dụ”. Đây không phải dữ liệu từ nguồn hay bản dịch của câu; không dùng làm mẫu chất lượng nội dung. Khi chỉnh chức năng này, hiển thị trạng thái thiếu dữ liệu hoặc dữ liệu bổ sung đã được xác minh.
- Không để mất các nghĩa/từ loại khác chỉ vì thiết kế minh họa một kết quả. Cần cách chọn nghĩa khi API trả nhiều mục.
- Nội dung dịch mẫu đang được điền sẵn. Khi nối các luồng khác, giữ văn bản người dùng đang nhập qua việc lưu từ hoặc render lại.
- Với dịch tự động, debounce chỉ giảm số request; cần xử lý kết quả đến sai thứ tự, xóa lúc request đang chạy, đổi chiều và rời trang. Không để request cũ ghi đè bản dịch mới.
- Icon phải có hành vi rõ ràng. Icon micro hiện nằm trong SVG ghép với nút xóa, chưa phải tính năng nhận giọng nói; không báo đã hỗ trợ micro.

## 9. Kiểm chứng trước khi bàn giao

1. Chạy `node --check` cho từng file JavaScript đã sửa và kiểm tra diff/whitespace.
2. Mở bản đang chạy, reload có chủ đích để nhận CSS/JS mới; xác nhận file đang phục vụ đúng workspace.
3. Đặt viewport bằng frame Figma, chờ font/ảnh và dữ liệu tải xong rồi chụp.
4. So sánh theo thứ tự: shell → nền → vị trí khối → kích thước → typography → fill/blur/border → icon.
5. Dùng `getBoundingClientRect()` và computed styles để kiểm tra tọa độ, không suy ra từ kích thước ảnh preview trong công cụ.
6. Thử dữ liệu thực tế: từ thông dụng, không tìm thấy, nội dung dài, nhiều nghĩa; dịch hai chiều, xóa, sao chép; kiểm tra lỗi tải asset và console.
7. Kiểm tra laptop và trang đã duyệt nếu sửa shell/CSS chung. Khôi phục viewport thử nghiệm khi xong.
8. Bàn giao ngắn gọn: thay đổi, kiểm chứng thực hiện, giới hạn còn lại. Chỉ nói một hành vi đã test khi thực sự test hành vi đó.

Ví dụ đo hình học qua công cụ kiểm tra trình duyệt được phép sử dụng:

```js
const selectors = ['.sidebar', '.dictionary-search', '.dictionary-result', '.quick-translate'];
selectors.map(selector => ({
  selector,
  rect: document.querySelector(selector)?.getBoundingClientRect().toJSON()
}));
```

## 10. Những lỗi cần tránh

- Dựng lại theo trí nhớ từ screenshot nhỏ; phóng sidebar/card/font vì cảm giác dễ đọc hơn.
- Thay illustration thật bằng gradient hoặc asset gần giống.
- Phủ lớp trắng quá dày hoặc đặt nền sai chiều cao làm mất con thuyền.
- Copy nguyên code sinh từ Figma mà bỏ qua cấu trúc project, API và responsive.
- Sửa CSS toàn cục để chữa một trang, làm hỏng trang đã được duyệt.
- Chỉ kiểm tra build/console rồi kết luận giao diện giống Figma.
- Làm các nút chỉ có hình thức; thay dữ liệu thật bằng nội dung cố định mà không nói rõ.
- Kết luận pixel-perfect dù còn font sai weight, nội dung bị cắt, trạng thái chưa test hoặc viewport khác nhau.

## Checklist bàn giao cho agent tiếp theo

- [ ] Đã xác định đúng frame và đọc design context/ảnh tham chiếu.
- [ ] Asset và font đúng đã lưu local, không dùng URL tạm.
- [ ] Đã ghi số đo shell và các khối chính.
- [ ] CSS có phạm vi, trang được duyệt không bị hồi quy.
- [ ] Dữ liệu thật và trạng thái thiếu dữ liệu được xử lý trung thực.
- [ ] Các nút và luồng được yêu cầu hoạt động đúng.
- [ ] Đã xem screenshot ở viewport chuẩn và laptop.
- [ ] Đã kiểm tra nội dung dài, overflow và lỗi tài nguyên.
- [ ] Bàn giao nêu đúng mức độ kiểm chứng, không hứa vượt bằng chứng.
