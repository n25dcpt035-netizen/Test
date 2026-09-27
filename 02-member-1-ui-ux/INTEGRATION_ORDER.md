# Thứ tự tích hợp bắt buộc

1. Thành viên 2 tạo `main` bằng package `01-member-2-platform-base`.
2. Thành viên 1 tạo PR UI/UX.
3. Thành viên 4 tạo PR Vocabulary.
4. Thành viên 3 tạo PR Dictionary.
5. Thành viên 5 tạo PR Study.
6. Thành viên 6 tạo PR Quiz & Analytics.

Không mở hoặc merge lệch thứ tự. Mỗi package kiểm tra tree hash của checkpoint trước,
tự chép/xóa file, tự stage và xác nhận tree hash đích. Thành viên không sửa tay file tích hợp.

Lead (thành viên 2) chỉ làm bốn việc ở mỗi PR: xác nhận GitHub báo không conflict,
build, mở web kiểm checklist của đúng feature, rồi merge. Không thêm commit vào branch thành viên.

Sau PR cuối, tree hash bắt buộc là `dec676e0375fa54d3b264939d5cff25cb15a1e69`,
trùng tuyệt đối project gốc.
