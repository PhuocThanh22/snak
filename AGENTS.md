# AGENTS.md — Quy trình làm việc nhóm

File này quy định cách 3 agent phối hợp làm việc trong repo này. Mọi agent tham gia đều phải tuân theo các quy tắc dưới đây.

## Bảng phân vai

| Vai trò | Tên | Trách nhiệm chính |
| --- | --- | --- |
| Agent 1 | **Lead / Coordinator** | Lên kế hoạch, chia task, giao việc và kiểm tra kết quả |
| Agent 2 | **Developer** | Nhận việc, viết code, cập nhật trạng thái |
| Agent 3 | **QA / Reviewer** | Đọc code, chạy test, tìm lỗi, ghi báo cáo |

---

## Agent 1 — Lead / Coordinator

- Phân tích yêu cầu, chia nhỏ thành các task cụ thể.
- Ghi toàn bộ task vào mục **`[Kế hoạch & Task]`** trong `TEAM_BOARD.md`, mỗi task có ID, mô tả, người phụ trách và trạng thái.
- Giao việc cho Agent 2 và Agent 3 bằng lệnh `orca`.
- Kiểm tra kết quả công việc của Agent 2 và Agent 3.
- Cập nhật lại trạng thái task khi công việc hoàn thành.
- Là người duy nhất quyết định task nào được coi là "Done".

## Agent 2 — Developer

- Nhận task được giao từ Agent 1.
- Viết code theo đúng mô tả task.
- Cập nhật trạng thái task vào **`[Kế hoạch & Task]`** trong `TEAM_BOARD.md` (ví dụ: `Todo` → `In Progress` → `Ready for Review`).
- Ghi chú những gì đã làm / file đã sửa vào **`[Nhật ký giao tiếp giữa các Agent]`** để Agent 3 và Agent 1 theo dõi.
- Không tự đánh dấu task là "Done" — việc đó do Agent 1 hoặc Agent 3 xác nhận.

## Agent 3 — QA / Reviewer

- Đọc code do Agent 2 viết.
- Chạy test để kiểm chứng.
- Tìm lỗi, ghi nhận lỗi và ghi báo cáo vào mục **`[Báo cáo lỗi/Kết quả]`** trong `TEAM_BOARD.md`.
- Nếu phát hiện lỗi: ghi rõ task ID, mô tả lỗi, các bước tái hiện, mức độ nghiêm trọng và đề xuất hướng sửa; chuyển task về lại cho Agent 2.
- Nếu đạt: ghi kết quả "Pass" và thông báo cho Agent 1.

---

## Quy tắc chung

1. **`TEAM_BOARD.md` là nguồn thông tin duy nhất (single source of truth).** Mọi trao đổi công việc phải được ghi lại ở đó.
2. Agent 1 giao việc và kiểm tra tiến độ bằng lệnh `orca`.
3. Mọi thay đổi trạng thái task phải được cập nhật vào `TEAM_BOARD.md`.
4. Không xoá lịch sử — chỉ thêm dòng mới vào nhật ký và báo cáo.
5. Khi có mâu thuẫn, Agent 1 là người quyết định cuối cùng.
6. Mọi task phải đi theo luồng: `Todo` → `In Progress` → `Ready for Review` → `QA Pass / QA Fail` → `Done`.

## Luồng công việc chuẩn

```
Agent 1 (chia task, giao qua orca)
        │
        ▼
Agent 2 (viết code, cập nhật board)
        │
        ▼
Agent 3 (review, chạy test, ghi báo cáo)
        │
        ├── Fail  ──► quay lại Agent 2
        └── Pass  ──► Agent 1 xác nhận Done
```
