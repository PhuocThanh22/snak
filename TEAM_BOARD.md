# TEAM_BOARD.md

Bảng điều phối chung cho 3 agent. Xem quy trình tại `AGENTS.md`.

- **Agent 1 (Lead/Coordinator)** = `term_9a5aa9b4-933a-4620-9c46-b080102896b0`
- **Agent 2 (Developer)** = `term_788d7447-7384-4c31-9208-27267081a3ef`
- **Agent 3 (QA & DevOps)** = `term_72585c3d-6f91-4104-85fb-84c9587ee69b`

> ⚠️ **2026-10-16:** Orca đã restart → các handle terminal cũ hết hiệu lực. Bảng trên là handle **mới** (ánh xạ theo `leafId`, giữ nguyên vai trò).

---

## [Kế hoạch & Task]

### Mục tiêu dự án

Xây dựng **game Rắn săn mồi (Snake)** chạy trên trình duyệt bằng **HTML + CSS + JavaScript thuần** (không framework), có logic tách riêng để kiểm thử được.

### Cấu trúc file dự kiến

```
D:\Code\test\
├── AGENTS.md
├── TEAM_BOARD.md
├── index.html          # (GIAI ĐOẠN 2) Bản ở GỐC — serve tĩnh/Vercel, trỏ snake/...
├── vercel.json         # (GIAI ĐOẠN 2) Cấu hình static site
├── snake\
│   ├── index.html      # Trang game
│   ├── style.css       # Giao diện Neon/Cyberpunk
│   ├── logic.js        # Logic thuần (không DOM) — export cho Node
│   ├── levels.js       # (GIAI ĐOẠN 2) Định nghĩa 3 màn
│   ├── audio.js        # (GIAI ĐOẠN 2) Web Audio synthesize
│   ├── particles.js    # (GIAI ĐOẠN 2) Hệ hạt
│   └── game.js         # Render canvas + input + hiệu ứng, dùng logic.js
└── test\
    ├── logic.test.js   # Test Node cho logic.js (Agent 2)
    └── qa.test.js      # Test edge-case độc lập (Agent 3)
```

### Danh sách task

| ID | Mô tả | Người phụ trách | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| T-001 | _(mẫu)_ | Agent 2 | Todo | Bỏ qua |
| T-002 | _(mẫu)_ | Agent 3 | Todo | Bỏ qua |
| **T-003** | Xây dựng game Rắn săn mồi theo spec bên dưới | **Agent 2** | **Done** | Agent 2 đã sửa B-001 + B-002. Agent 3 re-test vòng 2: **QA Pass** — `logic.test.js` 28/28 pass; `qa.test.js` 16/16 edge pass, 0 defect tái hiện, exit 0. Đã sửa 1 edge-test kỳ vọng sai (xem nhật ký). Duyệt **Done**. |
| **T-004** | Review + chạy test code của T-003 | **Agent 3** | **Done** | Vòng 1: QA Fail (2 lỗi). Vòng 2 (re-test sau fix): **QA Pass**. Xem [Báo cáo lỗi/Kết quả]. |
| **T-005** | Nâng cấp game (âm thanh Web Audio, đồ họa Neon/Particle, chọn màn chơi) + cấu hình Vercel | **Agent 2** | **Ready for Review** | Đã xong Giai đoạn 2. `logic.test.js` 45/45 pass; `qa.test.js` 16/16 pass (API tương thích). Chrome DevTools: 0 lỗi console. Chờ Agent 3 (T-006). |
| **T-006** | Test bằng Chrome DevTools + push GitHub + deploy Vercel | **Agent 3** | **Todo** | Giai đoạn 2 — chờ T-005 xong |

**Trạng thái hợp lệ:** `Todo` | `In Progress` | `Ready for Review` | `QA Pass` | `QA Fail` | `Done`

---

### SPEC T-003 (Agent 2 — Developer)

**Target:** Thư mục `D:\Code\test\snake\` và `D:\Code\test\test\`.

**Change — tạo các file sau:**

1. `snake/logic.js` — **logic thuần, KHÔNG đụng tới DOM/canvas**, dùng được cả trên trình duyệt và Node.
   - Hằng số: `GRID = 20` (số ô mỗi cạnh).
   - `createGame()` → trạng thái ban đầu: `snake` (mảng ô, đầu ở giữa), `dir`, `food`, `score: 0`, `gameOver: false`, `paused: false`.
   - `step(state)` → tiến 1 bước: di chuyển rắn theo `dir`, ăn mồi thì tăng `score` và độ dài, tự va tường hoặc tự cắn thân thì đặt `gameOver = true`.
   - `setDirection(state, dir)` → đổi hướng, **chặn quay đầu 180°**.
   - `spawnFood(state, rng)` → sinh mồi ở ô trống (nhận `rng` để test tất định).
   - Export theo kiểu UMD/CommonJS: hoạt động với cả `require()` (Node) và `<script>` (trình duyệt) — ví dụ gán vào `globalThis` và `module.exports` khi có.
2. `snake/game.js` — render lên `<canvas>` + xử lý input. Dùng `logic.js` cho toàn bộ luật chơi.
   - Điều khiển: phím mũi tên **và** WASD; phím `Space` = tạm dừng/tiếp tục; phím `R` = chơi lại.
   - Vẽ lưới, rắn, mồi; hiển thị điểm số; hiển thị "Game Over" + điểm cao nhất.
   - Tốc độ tăng dần theo điểm.
   - Lưu điểm cao nhất vào `localStorage`.
3. `snake/index.html` — khung trang, `<canvas id="game">`, nhúng `logic.js` rồi `game.js`, hiển thị điểm/level, nút Restart.
4. `snake/style.css` — style tối giản, dễ nhìn, responsive cơ bản.
5. `test/logic.test.js` — test Node bằng `assert` (không cần thư viện ngoài), tối thiểu kiểm tra:
   - `createGame()` có rắn khởi tạo với độ dài ≥ 3, `score = 0`, `gameOver = false`.
   - `step()` di chuyển đầu rắn đúng hướng.
   - Ăn mồi → `score` tăng và thân dài thêm.
   - Va tường → `gameOver = true`.
   - `setDirection()` chặn đổi hướng ngược 180°.
   - In ra `ALL TESTS PASSED` khi tất cả pass, `exit code 1` khi có test fail.

**Constraints:**
- Chỉ dùng HTML/CSS/JS thuần. **Không** thêm dependency ngoài (không npm package).
- `logic.js` tuyệt đối không được tham chiếu `document`, `window`, `canvas`, `localStorage`.
- Không sửa `AGENTS.md`. Chỉ cập nhật `TEAM_BOARD.md` phần trạng thái + nhật ký.
- Không xóa 2 task mẫu T-001/T-002.

**Ownership:** Agent 2 được tạo/sửa trong `snake/` và `test/`, và được cập nhật `TEAM_BOARD.md`.

**Observable acceptance (Agent 2 phải tự chạy trước khi báo xong):**
- `node --check snake/logic.js` → OK
- `node --check snake/game.js` → OK
- `node --check test/logic.test.js` → OK
- `node test/logic.test.js` → in `ALL TESTS PASSED`, exit code 0

---

### SPEC T-004 (Agent 3 — QA/Reviewer)

**Target:** Toàn bộ code của T-003.

**Change — kiểm tra và báo cáo:**
1. Đọc `snake/logic.js`, `snake/game.js`, `snake/index.html`, `snake/style.css`, `test/logic.test.js`.
2. Chạy `node --check` cho các file JS.
3. Chạy `node test/logic.test.js`.
4. Tự viết **thêm** một `test/qa.test.js` độc lập để kiểm tra các case biên (ví dụ: rắn ăn mồi sát tường, đổi hướng hợp lệ, mồi không sinh trùng thân rắn, không quay đầu 180°).
5. Tìm lỗi logic/edge case. Ghi **mọi** lỗi vào mục `[Báo cáo lỗi/Kết quả]` trong `TEAM_BOARD.md` (ID lỗi, task, mô tả, bước tái hiện, mức độ, đề xuất).
6. Ghi kết quả chung (`QA Pass` hoặc `QA Fail`) vào bảng kết quả kiểm thử.

**Acceptance:** Có báo cáo rõ ràng trong `TEAM_BOARD.md`, và nêu rõ Pass/Fail.

---

# GIAI ĐOẠN 2 — Nâng cấp toàn diện (Âm thanh + Đồ họa + Màn chơi + Deploy)

**Mục tiêu:** Nâng game Snake từ bản cơ bản thành bản "Neon/Cyberpunk" có âm thanh, hiệu ứng hạt, chọn màn chơi; cấu hình sẵn sàng deploy static lên Vercel; đẩy lên GitHub; kiểm thử bằng Chrome DevTools.

## SPEC T-005 (Agent 2 — Developer)

**Target:** `D:\Code\test\` (thư mục gốc), `D:\Code\test\snake\`, `D:\Code\test\test\`.

**Change — thực hiện 4 nhóm việc:**

### 1) Hiệu ứng âm thanh — Web Audio API (KHÔNG dùng file mp3 ngoài)
- Tạo `snake/audio.js`: module âm thanh tổng hợp bằng code (OscillatorNode + GainNode + envelope).
- Các API tối thiểu: `initAudio()` (tạo/resume `AudioContext`), `playEat()`, `playLevelUp()`, `playMove()` (âm nhẹ, tùy chọn), `playGameOver()`, `toggleMute()`, `setMuted(bool)`, `isMuted()`.
- Nút **Bật/Tắt âm thanh (Mute/Unmute)** trên giao diện; trạng thái mute lưu `localStorage`.
- **Bắt buộc:** `AudioContext` chỉ được tạo/resume **sau tương tác đầu tiên của người dùng** (click/phím) để tránh cảnh báo autoplay của Chrome.
- Gọi âm thanh đúng sự kiện: ăn mồi, qua màn, va chạm/Game Over.

### 2) Hiệu ứng hình ảnh (Visuals & Polish)
- Giao diện hiện đại phong cách **Neon/Cyberpunk** (hoặc Retro mượt mà): nền tối, màu phát sáng (glow), font gọn.
- **Particle explosion** khi rắn ăn mồi (tạo `snake/particles.js` — hệ hạt đơn giản, vẽ trên canvas, tự hủy sau khi tắt).
- **Screen shake** khi va chạm/Game Over.
- Rắn có **đầu rõ ràng** (mắt/hướng) và **đuôi thon**; chuyển động **mượt** (nội suy giữa các ô, không giật); **đổi màu theo màn chơi**.
- Giữ responsive cho nhiều kích thước màn hình.

### 3) Hệ thống Màn chơi (Level Selection)
- Tạo `snake/levels.js` định nghĩa ≥ 3 màn (có thể chỉnh trong `logic.js`):
  - **Màn 1 — Classic:** không tường cản, **đi xuyên biên** (wrap-around). Tốc độ cơ bản.
  - **Màn 2 — Boxed:** **tường bao 4 cạnh** (đâm tường = Game Over), tốc độ tăng nhẹ.
  - **Màn 3 — Maze/Obstacles:** có **chướng ngại vật tĩnh ở giữa**, tốc độ nhanh hơn.
- **Menu chọn màn** hiển thị trước khi vào game (3 nút: Classic / Boxed / Maze).
- Cập nhật `logic.js` hỗ trợ cấu hình theo màn: `wrap` (bool), `obstacles` (mảng ô), `speed`. **Giữ API cũ tương thích** (test cũ vẫn chạy).
- Lưu **High Score riêng từng màn** vào `localStorage` (ví dụ key `snake:highscores` = `{ "1": .., "2": .., "3": .. }`).

### 4) Cấu hình Deploy
- **Bắt buộc:** có file `index.html` ở **thư mục gốc** `D:\Code\test\index.html` — mở được toàn bộ game khi serve tĩnh (không cần build).
- Tạo `vercel.json` cấu hình static site chuẩn (ví dụ `{ "version": 2 }` hoặc cấu hình rewrites/headers nếu cần). Không dùng framework/build.
- Đảm bảo mọi đường dẫn tài nguyên là **tương đối** để chạy đúng khi deploy.

**Constraints:**
- HTML/CSS/JS thuần, **không** thêm npm dependency runtime. Âm thanh phải synthesize bằng code.
- Cập nhật `test/logic.test.js` cho tính năng mới (wrap-around, obstacles) — vẫn in `ALL TESTS PASSED`, exit 0.
- **Không sửa** `test/qa.test.js` (thuộc Agent 3). Nếu thay đổi API làm `qa.test.js` hỏng, **không tự sửa** — ghi chú vào `TEAM_BOARD.md` để Agent 3 xử lý.
- Không sửa `AGENTS.md`.

**Observable acceptance (Agent 2 tự chạy trước khi báo xong):**
- `node --check` cho tất cả file JS mới/sửa → OK.
- `node test/logic.test.js` → in `ALL TESTS PASSED`, exit 0.
- `D:\Code\test\index.html` và `D:\Code\test\vercel.json` tồn tại.
- Phục vụ tĩnh được: ví dụ `python -m http.server 8080` rồi mở `http://localhost:8080/` tải được game (kiểm tra thủ công nhanh).

---

## SPEC T-006 (Agent 3 — QA & DevOps)

**Target:** Bản build của T-005 + repo GitHub `https://github.com/PhuocThanh22/snak.git` + Vercel.

**Nhiệm vụ 1 — Kiểm thử bằng Chrome DevTools (ưu tiên, làm trước):**
1. Khởi chạy local server tạm: `python -m http.server 8080` (chạy nền trong `D:\Code\test`). Hoặc `npx --yes serve -l 8080`.
2. Dùng **Chrome DevTools (MCP/browser tool)** mở `http://localhost:8080/`.
3. Đọc **Console** tìm mọi lỗi: `ReferenceError`, `SyntaxError`, lỗi Web Audio API, lỗi 404 tài nguyên. Kiểm tra cả tab Network.
4. Tương tác: click chọn **Màn 1 / 2 / 3**, bấm nút **Mute/Unmute**, chơi thử vài nước, chụp/ghi nhận trạng thái DOM/Canvas (ví dụ `document.querySelector('#game')`, kích thước, screenshot).
5. **Nếu có lỗi Console:** ghi chi tiết (message, file/line, mức độ, bước tái hiện) vào mục `[Báo cáo lỗi/Kết quả]` để Agent 1 yêu cầu Agent 2 sửa. **Chỉ khi 0 lỗi Console** mới sang nhiệm vụ 2.

**Nhiệm vụ 2 — Push lên GitHub:**
- Tạo `.gitignore` (bỏ qua: `.orca/`, `node_modules/`, `.vercel/`, `*.log`, `.DS_Store`).
- `git init` (nếu chưa có), `git add .`, `git commit -m "feat: upgrade visuals, sound effects, levels and vercel config"`, `git branch -M main`.
- `git remote add origin https://github.com/PhuocThanh22/snak.git` (nếu đã có remote thì `git remote set-url origin ...`).
- `git push -u origin main --force`.
- Ghi lại commit hash đã push.

**Nhiệm vụ 3 — Deploy Vercel:**
- Chạy `npx --yes vercel --prod --yes` tại `D:\Code\test`, lấy **Production URL**.
- ⚠️ Đã biết trước: máy đang **Logged out** Vercel và không có `VERCEL_TOKEN`. Nếu bị chặn, ghi rõ thông báo + **link xác thực** (`vercel login`) vào `TEAM_BOARD.md` để Agent 1 báo cho người dùng.

**Acceptance:** Báo cáo rõ trong `TEAM_BOARD.md`: (a) kết quả Console DevTools (0 lỗi?); (b) commit hash + trạng thái push; (c) Vercel URL hoặc lý do chặn + link đăng nhập.

---

## [Nhật ký giao tiếp giữa các Agent]

| Thời gian | Từ | Đến | Nội dung |
| --- | --- | --- | --- |
| 2026-10-15 | Agent 1 | Toàn đội | Lập kế hoạch: xây game Rắn săn mồi. Giao T-003 cho Agent 2, T-004 cho Agent 3. Xác định terminal: A1=`term_d65b5483`, A2=`term_73206a72`, A3=`term_66334115`. |
| 2026-10-15 | Agent 1 | Agent 2 | Giao task T-003 qua `orca terminal send`. Yêu cầu đọc TEAM_BOARD.md và thực thi. |
| 2026-10-15 | Agent 2 | Agent 1 | Nhận T-003, chuyển trạng thái `Todo/In Progress` → làm việc. Đã nạp toàn bộ SPEC T-003. |
| 2026-10-15 | Agent 2 | Agent 3 | Xong T-003. Đã tạo 5 file: `snake/logic.js`, `snake/game.js`, `snake/index.html`, `snake/style.css`, `test/logic.test.js`. Tự chạy `node --check` cả 3 file JS → OK. Chạy `node test/logic.test.js` → 26/26 pass, in `ALL TESTS PASSED`, exit code 0. Trạng thái T-003 = `Ready for Review`. Nhờ Agent 3 review (T-004). KHÔNG tự đánh dấu Done. |
| 2026-10-15 | Agent 1 | Agent 3 | Giao task T-004 qua `orca terminal send`. Yêu cầu: đọc TEAM_BOARD.md, review code T-003, chạy `node --check` + `node test/logic.test.js`, tự viết thêm `test/qa.test.js` kiểm tra case biên, ghi mọi lỗi + kết quả Pass/Fail vào TEAM_BOARD.md. |
| 2026-10-15 | Agent 3 | Agent 2 | Đã review T-003. `node --check` 3 file JS gốc + `test/qa.test.js` → OK. `node test/logic.test.js` → 26/26 pass. Tự viết `test/qa.test.js`: 15/15 edge-case pass nhưng **tái hiện 2 lỗi logic**: (1) 2 phím đổi hướng trong cùng 1 tick tạo cú quay đầu 180° → rắn chết oan; (2) `setDirection` chấp nhận vector không đơn vị trục `{0.5,0.5}` → toạ độ đầu rắn không nguyên. Đề nghị sửa trước khi Done. |
| 2026-10-15 | Agent 3 | Agent 1 | T-004 hoàn tất. Kết luận: **QA Fail**. T-003 = `QA Fail` (chuyển lại Agent 2), T-004 = `Done`. Chi tiết lỗi + cách tái hiện trong mục [Báo cáo lỗi/Kết quả]. |
| 2026-10-15 | Agent 2 | Agent 1 | Nhận lại T-003. Đã sửa trong `snake/logic.js`: **(B-001)** thêm `lastMoveDir` = hướng di chuyển thực tế của bước trước; `setDirection` chặn quay đầu 180° so với **cả** `state.dir` **lẫn** `lastMoveDir`; `step` cập nhật `lastMoveDir`. **(B-002)** `setDirection` yêu cầu từng thành phần là số nguyên ∈ {-1,0,1} và `|x|+|y| === 1` (loại `{0.5,0.5}`, `{0.3,0.7}`). Cập nhật `test/logic.test.js` (nay 28 test) + thêm test hồi quy B-001/B-002. |
| 2026-10-15 | Agent 2 | Agent 1 & Agent 3 | Chạy lại: `node --check` cho `logic.js`/`game.js`/`logic.test.js`/`qa.test.js` → OK. `node test/logic.test.js` → **28/28 pass**, `ALL TESTS PASSED`, exit 0. `node test/qa.test.js` → 4/4 defect đã hết (`[BUG ĐÃ HẾT]` ×4, "Lỗi tái hiện: 0") **nhưng exit 1** vì 1 edge-test FAIL: `edge: đổi hướng hợp lệ 90° được chấp nhận (phải -> xuống -> trái)`. ⚠️ Test này **mâu thuẫn với chính B-001**: nó assert chuỗi `Phải→Xuống→Trái` (net 180°, bước sau sẽ tự cắn cổ) được chấp nhận trong khi KHÔNG có `step()` giữa các lần đổi hướng — đúng bằng hành vi lỗi B-001. Về mặt hình học `Phải→Xuống→Trái` và `Phải→Lên→Trái` là như nhau, nên KHÔNG thể vừa chặn B-001 vừa pass test này. Đề nghị Agent 3 (T-004) sửa edge-test: chèn `step()` giữa các lần đổi hướng, giữ nguyên ý định "các cú quay 90° hợp lệ được chấp nhận". Agent 2 **không** sửa test của Agent 3. T-003 = `Ready for Review`; B-001/B-002 = `Fixed`. KHÔNG tự đánh dấu Done. |
| 2026-10-15 | Agent 1 | Agent 3 | Chốt fix của Agent 2 là ĐÚNG (chặn 180° so với **cả** `state.dir` lẫn `lastMoveDir`; loại vector không nguyên/lệch trục). Yêu cầu Agent 3: sửa `test/qa.test.js` — test `edge: đổi hướng hợp lệ 90° (phải -> xuống -> trái)` có **KỲ VỌNG SAI** (gọi 3 lần `setDirection` liên tiếp không có `step()`). Giữ nguyên D-001/D-001b/D-002/D-002b, ghi rõ lý do sửa. Nếu tất cả pass → QA Pass, T-003 → Done, B-001/B-002 → Verified. |
| 2026-10-15 | Agent 3 | Agent 1 & Agent 2 | Đã sửa `test/qa.test.js`. **Lý do sửa:** test cũ gọi `setDirection` 3 lần LIÊN TIẾP mà không có `step()`; chuỗi `Phải→Xuống→Trái` khi rắn CHƯA di chuyển thực tế chính là cú quay đầu 180° so với hướng di chuyển thật `{1,0}` — đúng thứ B-001 yêu cầu CHẶN, nên kỳ vọng "cả 3 lần đều hợp lệ" là SAI. Đã sửa: (a) chèn `Logic.step()` giữa các lần đổi hướng để kiểm tra chuỗi quay 90° hợp lệ (phải→xuống→trái→lên, không game over); (b) thêm 1 test khẳng định khi KHÔNG có `step()` thì cú quay đầu 180° bị chặn. Giữ nguyên D-001/D-001b/D-002/D-002b. |
| 2026-10-15 | Agent 3 | Agent 1 | Re-test vòng 2 hoàn tất. `node --check` 4 file JS → OK (exit 0). `node test/logic.test.js` → **28/28 pass**, exit 0. `node test/qa.test.js` → **16/16 edge pass, 0 defect tái hiện** (`[BUG ĐÃ HẾT]` ×4), `ALL QA TESTS PASSED`, exit 0. **Kết luận: QA PASS.** T-003 = `Done`; B-001/B-002 = `Verified`. |
| 2026-10-16 | Agent 1 | Toàn đội | **GIAI ĐOẠN 2.** Lập kế hoạch nâng cấp toàn diện: T-005 (Agent 2: âm thanh Web Audio, đồ họa Neon + Particle + Screen shake, menu chọn 3 màn, `vercel.json`, `index.html` ở gốc) và T-006 (Agent 3: test Chrome DevTools → push GitHub → deploy Vercel). Ghi 2 SPEC chi tiết vào `TEAM_BOARD.md`. |
| 2026-10-16 | Agent 1 | Toàn đội | Cập nhật handle terminal mới sau khi Orca restart (A1=`term_9a5aa9b4`, A2=`term_788d7447`, A3=`term_72585c3d`). Khảo sát môi trường: GitHub reachable + repo rỗng, git identity OK; **Vercel đang Logged out, không có VERCEL_TOKEN** → có thể chặn bước deploy. |
| 2026-10-16 | Agent 1 | Agent 2 | Giao task **T-005** qua `orca terminal send`. Yêu cầu đọc `TEAM_BOARD.md` mục `SPEC T-005` và thực thi. |
| 2026-10-16 | Agent 2 | Agent 1 | Hoàn thành **T-005** → `Ready for Review`. Tạo `snake/audio.js`, `snake/particles.js`, `snake/levels.js`, cập nhật `snake/game.js`/`style.css`/`index.html`, thêm `index.html` ở gốc + `vercel.json`. Tự kiểm thử bằng **Chrome DevTools** (localhost:8123): **0 lỗi console**, chọn màn 1/3 OK, screenshot xác nhận giao diện Neon, rắn có mắt/đuôi, Maze có vật cản. `logic.test.js` 45/45 pass; `qa.test.js` 16/16 pass (giữ API tương thích). Không tự đánh dấu Done. |
| 2026-10-16 | Agent 1 | Agent 3 | **Xác minh độc lập T-005:** `node --check` 7 file JS → OK; `node test/logic.test.js` → 45/45 pass; `node test/qa.test.js` → 16/16 pass; `vercel.json` hợp lệ. **Giao task T-006** qua `orca terminal send`: test Chrome DevTools (0 lỗi console mới đi tiếp) → push GitHub → deploy Vercel. |
| 2026-10-16 | Agent 2 | Agent 1 | Nhận **T-005** (Giai đoạn 2). Đã tạo mới: `snake/audio.js` (Web Audio **synthesize hoàn toàn bằng code**, không dùng file âm thanh: `playEat`/`playLevelUp`/`playMove`/`playGameOver` + `toggleMute`/`setMuted`/`isMuted`; `AudioContext` chỉ được tạo/resume trong `initAudio()` gọi sau tương tác đầu tiên), `snake/particles.js` (hệ hạt particle explosion), `snake/levels.js` (3 màn: 1 Classic wrap-around, 2 Boxed tường 4 cạnh, 3 Maze có chướng ngại vật tĩnh ở giữa + nhanh hơn; kèm bảng màu Neon theo màn), `D:\Code\test\index.html` (bản ở GỐC, đường dẫn tương đối `snake/...`, serve tĩnh được), `vercel.json` (`version: 2` + headers). Nâng cấp: `snake/logic.js` (thêm `wrap`, `obstacles`, `cols/rows`, `level`, `speed` — **giữ nguyên API cũ** `createGame()`/`step()`/`setDirection()`), viết lại `snake/game.js` (menu chọn 3 màn trước khi vào game, nội suy chuyển động mượt giữa các ô, gradient Neon + glow, particle explosion khi ăn, screen shake khi va chạm, đầu rắn rõ có mắt + đuôi thon dần, đổi màu theo màn, high score **riêng từng màn** lưu `localStorage` key `snake:highscores`, nút Mute/Unmute + nút Đổi màn), restyle `snake/style.css` (Neon/Cyberpunk), cập nhật `snake/index.html` (menu + nút Mute). Thêm favicon inline (data-URI) để tránh 404 `favicon.ico`. |
| 2026-10-16 | Agent 2 | Agent 1 & Agent 3 | Tự kiểm chứng T-005. `node --check` cho `snake/logic.js`, `snake/game.js`, `snake/levels.js`, `snake/audio.js`, `snake/particles.js`, `test/logic.test.js`, `test/qa.test.js` → **OK (exit 0)**. `node test/logic.test.js` → **45/45 pass**, `ALL TESTS PASSED`, exit 0 (đã thêm test cho wrap-around, chướng ngại vật, `levels.js`, API `audio.js`, hệ hạt `particles.js`). `node test/qa.test.js` → **16/16 edge pass, 0 defect** (`[BUG ĐÃ HẾT]` ×4), `ALL QA TESTS PASSED`, exit 0 — **API tương thích ngược, KHÔNG phá `test/qa.test.js` của Agent 3** (không cần ghi chú hỏng API). Serve tĩnh bằng máy chủ Node tạm: `/`, `/snake/`, `/snake/*.js|css`, `/vercel.json` đều **200**. Kiểm thử nhanh bằng Chrome DevTools tại `http://localhost:8123/`: **0 console message/0 lỗi** (sau khi thêm favicon inline), chọn màn bằng phím `1`/`3` OK, ảnh chụp xác nhận rắn Neon (đầu có mắt, đuôi thon, mồi phát sáng), Maze hiện chướng ngại vật, đổi màu theo màn, overlay GAME OVER đúng, `AudioContext` khởi tạo sau tương tác người dùng. T-005 = `Ready for Review`. **KHÔNG tự đánh dấu Done** — chờ Agent 3 (T-006). |

---

## [Báo cáo lỗi/Kết quả]

### Báo cáo lỗi

| ID lỗi | Task liên quan | Mô tả lỗi | Bước tái hiện | Mức độ | Đề xuất | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| **B-001** (D-001) | T-003 | `setDirection()` chỉ chặn quay đầu 180° so với `state.dir` — tức hướng đã ghi nhận sau lần bấm **trước đó**. Nếu trong CÙNG một tick người chơi bấm 2 phím (ví dụ đang đi **Phải** rồi bấm **Lên → Trái**), thì `state.dir` bị đổi thành **Trái** — ngược hướng di chuyển thực tế `{1,0}`. Bước kế tiếp đầu rắn lao vào cổ của chính nó → `gameOver = true`. Chốt chặn 180° bị vô hiệu, rắn "chết oan". | 1. `const s = createGame()` (dir `{1,0}`, đầu `(10,10)`, thân `(9,10)`,`(8,10)`). 2. Gọi `setDirection(s,{x:0,y:-1})` rồi `setDirection(s,{x:-1,y:0})` **trước khi** `step()`. 3. Gọi `step(s)`. → Quan sát `s.dir.x === -1` và `s.gameOver === true`. (Trong game thật: bấm ↑ rồi ← nhanh trong 150ms.) | **Trung bình** | Lưu "hướng di chuyển thực tế của bước trước" (`lastMoveDir`) và so 180° với nó thay vì với `state.dir`; hoặc chỉ cho phép đổi hướng **1 lần mỗi tick** (đệm input). | **Fixed** (Agent 2, 2026-10-15: dùng `lastMoveDir`) → **Verified** (Agent 3, 2026-10-15: re-test vòng 2 — D-001/D-001b hết lỗi) |
| **B-002** (D-002) | T-003 | `setDirection()` xác thực vector bằng `Math.abs(dir.x) + Math.abs(dir.y) !== 1`. Điều kiện này **chấp nhận cả vector lệch trục** như `{0.5,0.5}`, `{0.3,0.7}` (tổng `|x|+|y| = 1` nhưng KHÔNG phải đơn vị theo 4 hướng). Hệ quả: toạ độ đầu rắn thành số **không nguyên** (`10.5,10.5`) → phá vỡ bất biến lưới ô vuông, vẽ lệch, và kiểm tra va chạm/mồi sai. | 1. `const s = createGame()`. 2. `setDirection(s,{x:0.5,y:0.5})` → `s.dir` bị đổi thành `{0.5,0.5}`. 3. `step(s)` → `s.snake[0]` = `{x:10.5,y:10.5}`. | **Thấp** — không lộ ra từ UI hiện tại (`game.js` chỉ gửi vector nguyên), nhưng sai so với chú thích "chỉ chấp nhận vector đơn vị theo 4 hướng" và sai hợp đồng API. | Kiểm tra từng thành phần là **số nguyên** thuộc `{-1,0,1}` và tổng `|x|+|y| === 1`. Ví dụ: `Number.isInteger(dir.x) && Number.isInteger(dir.y) && Math.abs(dir.x)+Math.abs(dir.y) === 1`. | **Fixed** (Agent 2, 2026-10-15: kiểm tra số nguyên) → **Verified** (Agent 3, 2026-10-15: re-test vòng 2 — D-002/D-002b hết lỗi) |

**Mức độ:** `Thấp` | `Trung bình` | `Cao` | `Nghiêm trọng`

### Kết quả kiểm thử

| Task | Người kiểm thử | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| **T-004** (review T-003) | **Agent 3** | **Fail** | `node --check` cho `logic.js`, `game.js`, `logic.test.js`, `qa.test.js` → **OK (exit 0)**. `node test/logic.test.js` → **26/26 pass**, `ALL TESTS PASSED`, exit 0. `node test/qa.test.js` (Agent 3 tự viết) → **15/15 edge-case pass**, nhưng **tái hiện 4 defect** (2 lỗi gốc B-001/B-002 + 2 hệ quả), exit 1. |
| **T-004 vòng 2** (re-test sau fix) | **Agent 3** | **Pass** | `node --check` `logic.js`/`game.js`/`logic.test.js`/`qa.test.js` → **OK (exit 0)**. `node test/logic.test.js` → **28/28 pass** (Agent 2 thêm 2 test hồi quy B-001/B-002), exit 0. `node test/qa.test.js` (đã sửa 1 edge-test kỳ vọng sai) → **16/16 edge pass**, **0 defect tái hiện**, `ALL QA TESTS PASSED`, exit 0. |

### Kết luận QA

- **Kết quả chung: `QA FAIL`.** Code chạy được, export UMD đúng, không đụng DOM, 26 test gốc pass — nhưng còn **2 lỗi logic/edge-case thật**:
  - **B-001 (Trung bình):** đổi hướng 2 phím trong cùng 1 tick → phá vỡ chốt chặn quay đầu 180°, rắn tự cắn cổ và chết oan. **Có thể gặp trong game thật.**
  - **B-002 (Thấp):** `setDirection` nhận vector không đơn vị trục (`{0.5,0.5}`) → toạ độ rắn không còn nguyên.
- **Hành động:** chuyển **T-003 về Agent 2** để sửa B-001, B-002; sau khi sửa, chạy lại `node test/logic.test.js` và `node test/qa.test.js` (kỳ vọng `qa.test.js` không còn dòng `[TÁI HIỆN LỖI]`, exit 0) rồi báo Agent 3 re-test.
- **File QA đã tạo:** `test/qa.test.js` (chỉ dùng `assert`, không thêm dependency).

### Kết luận QA (vòng 2 — sau fix)

- **Kết quả chung: `QA PASS`.** Agent 2 đã sửa đúng B-001 (chặn 180° so với cả `state.dir` lẫn `lastMoveDir` — đúng hành vi Snake chuẩn) và B-002 (loại vector không nguyên/lệch trục).
- Bằng chứng: `node --check` 4 file JS → OK; `node test/logic.test.js` → **28/28 pass**; `node test/qa.test.js` → **16/16 edge pass, 0 defect tái hiện** (`[BUG ĐÃ HẾT]` ×4), `ALL QA TESTS PASSED`, exit 0.
- **Sửa test của QA:** test `edge: đổi hướng hợp lệ 90° (phải -> xuống -> trái)` (vòng 1) có **kỳ vọng sai** — gọi 3 lần `setDirection` liên tiếp không có `step()`, tức đang đòi chấp nhận đúng một cú quay đầu 180° mà B-001 phải chặn. Đã sửa: chèn `Logic.step()` giữa các lần đổi hướng (kiểm tra chuỗi quay 90° hợp lệ) + thêm 1 test khẳng định cú quay đầu 180° không có `step()` bị chặn. Giữ nguyên D-001/D-001b/D-002/D-002b.
- **Hành động:** T-003 = `Done`; B-001/B-002 = `Verified`. Không còn hạng mục mở.
