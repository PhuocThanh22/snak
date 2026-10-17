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
| **T-005** | Nâng cấp game (âm thanh Web Audio, đồ họa Neon/Particle, chọn màn chơi) + cấu hình Vercel | **Agent 2** | **Done** | Agent 3 xác minh qua T-006: Chrome DevTools **0 lỗi console** (cả `/` và `/snake/`), đã deploy production. **Agent 1 duyệt Done** — đã tự kiểm chứng (45/45 + 16/16 test, Vercel HTTP 200). |
| **T-006** | Test bằng Chrome DevTools + push GitHub + deploy Vercel | **Agent 3** | **Done** | Hoàn tất 2026-10-16: **0 lỗi Console**; push GitHub `32acdb0`; deploy Vercel `https://test-lime-seven-18.vercel.app`. Chi tiết ở [KẾT QUẢ TRIỂN KHAI]. |
| **T-007** | Sprint 3: sửa lỗi kéo dài khi wrap + nhạc nền Sugarsweet (fallback synth) + giao diện máy chơi cầm tay cho mobile | **Agent 2** | **Done** | Agent 3 xác minh độc lập qua T-008 (Chrome DevTools): **0 lỗi Console**; wrap **4 cạnh không còn vệt kéo dài** (run ngang/dọc ≤ **2.97 ô** = đúng bằng thân rắn; stress tất định 5000 bước × 2 trục = **250 wrap/trục, 0 sai chiều dài**); D-Pad iPhone 14 (390×844) **cả 4 nút đổi hướng đúng**; **BGM synth phát** (61 oscillator, `AudioContext.state=running`); `100dvh` **không cuộn**. `logic.test.js` 50/50; `qa.test.js` 16/16. **Agent 1 đã xác minh độc lập và duyệt `Done`** ngày 2026-10-16. |
| **T-008** | Sprint 3: QA Chrome DevTools mobile (test wrap 4 cạnh, D-Pad, BGM) + push GitHub + redeploy Vercel | **Agent 3** | **Done** | Hoàn tất 2026-10-16: **0 lỗi Console**; push GitHub **`ef0d0e6`**; redeploy Vercel **`https://test-lime-seven-18.vercel.app`** (READY). Chi tiết ở [KẾT QUẢ QA SPRINT 3]. |
| **T-009** | Sprint 4: sửa âm thanh KHÔNG nghe được trên điện thoại (tăng âm lượng + unlock audio mobile) + chỉnh tốc độ rắn lúc vào màn | **Agent 2** | **Ready for Review** | Hoàn tất 2026-10-17. Đo tại `localhost:8123` (iPhone 14, 390×844): **peak BGM `0.3001`** (cũ `0.0196`, ×15), RMS `0.0239` (cũ `0.0067`), **SFX ăn mồi `0.4166`**; unlock đa sự kiện + buffer im lặng 1 sample + retry tới `running`; gợi ý "Chạm để bật âm thanh" chỉ hiện khi KHÔNG mở khoá được. Tốc độ vào màn: Classic **111.1**, Boxed **100.1**, Maze **86.4** ms/bước (cũ 140/122/104). `logic.test.js` **53/53**, `qa.test.js` **16/16**, **0 lỗi Console**. Chờ Agent 3 (T-010) QA — xem [KẾT QUẢ TỰ KIỂM T-009]. |
| **T-010** | Sprint 4: QA âm thanh trên mobile emulation (đo biên độ thật) + test tốc độ + push GitHub + redeploy Vercel | **Agent 3** | **Todo** | Sẵn sàng: **T-009 = Ready for Review** (2026-10-17). Cần đo peak > 0.1 + kiểm tốc độ + 0 lỗi Console, rồi push + redeploy. |

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

# GIAI ĐOẠN 3 (Sprint 3) — Sửa lỗi wrap + Nhạc nền + Điều khiển mobile

**4 hạng mục của Sprint:**
1. **(Agent 2)** Sửa lỗi rắn bị kéo dài / vệt ngang màn hình khi đi xuyên vách (Screen Wrap).
2. **(Agent 2)** Tích hợp nhạc nền "Sugarsweet" + cơ chế fallback synth Web Audio + nút BGM.
3. **(Agent 2)** Giao diện nút bấm máy chơi game cầm tay (D-Pad + nút chức năng) cho điện thoại.
4. **(Agent 3)** QA Chrome DevTools (mobile emulation, test wrap 4 cạnh, BGM) + push GitHub + redeploy Vercel.

## SPEC T-007 (Agent 2 — Developer)

### 3.1 Sửa lỗi "rắn kéo dài / vệt ngang màn hình" khi wrap
- **Kiểm tra logic (`snake/logic.js`):** khi đầu rắn đi xuyên biên (wrap) và **KHÔNG ăn mồi**, `step()` vẫn phải `snake.pop()` (cắt đốt đuôi) — **tuyệt đối không cộng dồn thêm đốt**. Xác nhận `snake.length` **không tăng** khi chỉ wrap.
- **Kiểm tra render/nội suy (`snake/game.js`):**
  - Nếu đang dùng `lineTo`/vẽ đường nối liền hoặc nội suy (lerp) giữa các đốt liên tiếp: khi khoảng cách giữa 2 đốt liên tiếp **lớn hơn 1 ô** (`Math.abs(seg1.x - seg2.x) > 1` hoặc `Math.abs(seg1.y - seg2.y) > 1` — do 1 đốt ở mép trái, 1 đốt ở mép phải), **TUYỆT ĐỐI KHÔNG** vẽ đường nối hoặc nội suy băng ngang qua màn hình.
  - **Ngắt đường vẽ (`beginPath` mới) hoặc vẽ rời từng đốt** khi phát hiện bước nhảy xuyên biên. Áp dụng cả cho thân, đầu rắn và hiệu ứng.
- **Test bổ sung (`test/logic.test.js`):** sau nhiều bước wrap, `snake.length` giữ nguyên; các đốt liên tiếp không nhảy > 1 ô (ngoài trường hợp wrap hợp lệ).

### 3.2 Nhạc nền "Sugarsweet" + fallback (BẮT BUỘC)
- Nguồn tham chiếu: `https://artlist.io/royalty-free-music/song/sugarsweet/70662`
- Thử lấy luồng audio preview hợp lệ. **Lưu ý:** Artlist có **DRM + CORS + bản quyền** → rất có thể chặn. Nếu không lấy được hợp lệ thì **KHÔNG tải lậu nội dung có bản quyền**; chuyển sang fallback.
- Dùng thẻ `<audio id="bgm" loop>` (hoặc `new Audio()`), thử nạp `bgm.mp3` nếu tồn tại trong dự án.
- **Fallback BẮT BUỘC:** gắn sự kiện `onerror` trên thẻ audio → nếu không tải/phát được file, **tự động** sinh nhạc nền bằng **Web Audio API** phong cách "Sugarsweet" (Chiptune/Synth-pop vui nhộn, giai điệu lặp, không dùng file ngoài). Đảm bảo **100% trình duyệt có nhạc nền sống động**.
- Thêm nút **BGM on/off** (riêng hoặc tích hợp nút Mute); lưu trạng thái vào `localStorage`.
- Nhạc chỉ bắt đầu **sau tương tác đầu tiên** của người dùng (autoplay policy).

### 3.3 Giao diện nút bấm máy chơi game cầm tay (Handheld / GameBoy) cho mobile
- Khung dưới canvas giống máy chơi game cầm đời cổ (**Brick Game / GameBoy**):
  - Cụm **D-Pad** (Lên, Xuống, Trái, Phải) kích thước **lớn**, dễ bấm bằng ngón cái, bố trí chuẩn.
  - Cụm nút chức năng: **Start/Pause**, **Mute**, **Đổi màn chơi**.
- **Tối ưu cảm ứng:** lắng nghe `touchstart` (kèm `e.preventDefault()` để tránh delay 300ms / cuộn trang / zoom khi bấm liên tục) **và** `mousedown`/`click`. Thêm hiệu ứng lún nút (active state) + `navigator.vibrate(15)` nếu thiết bị hỗ trợ.
- Responsive **`100dvh`**, vừa màn hình dọc điện thoại, **không cần cuộn trang**.
- **Không** phá điều khiển bàn phím hiện có.

**Ownership:** `snake/logic.js`, `snake/game.js`, `snake/style.css`, `snake/index.html` (và `index.html` gốc), `test/logic.test.js`. Không sửa `test/qa.test.js`.

**Observable acceptance (Agent 2 tự chạy):** `node --check` tất cả file JS → OK; `node test/logic.test.js` → `ALL TESTS PASSED`; mở thử local server, wrap 4 cạnh không kéo dài; nút mobile bấm được.

## SPEC T-008 (Agent 3 — QA & DevOps)

**Nhiệm vụ 1 — Kiểm thử Chrome DevTools:**
1. Khởi chạy local server nền (`python -m http.server 8080`) trong `D:\Code\test`.
2. **Test lỗi xuyên tường:** vào **Màn 1 Classic**, cho rắn đi xuyên **cả 4 cạnh** (Trái, Phải, Trên, Dưới). Xác nhận thân rắn giữ **đúng chiều dài chuẩn**, **KHÔNG** có vệt kéo dài ngang màn hình (đọc pixel canvas / screenshot để chứng minh).
3. **Test mobile (Mobile Emulation):** giả lập **iPhone 14 (390×844)**, bấm trực tiếp **4 nút D-Pad** xác nhận rắn đổi hướng **nhạy và chính xác**; kiểm tra layout `100dvh` **không cuộn trang**.
4. **Test nhạc nền:** xác nhận nhạc nền phát khi bắt đầu game; **Console 0 lỗi đỏ**, không lỗi Web Audio. Nếu có lỗi → ghi chi tiết vào `[Báo cáo lỗi/Kết quả]` và báo Agent 1 để chuyển Agent 2 sửa ngay.

**Nhiệm vụ 2 — Push & Redeploy (chỉ khi mọi test PASS):**
- `git add .`
- `git commit -m "fix: screen-wrap stretching bug, add sugarsweet BGM and handheld mobile controls"`
- `git push origin main`
- `npx --yes vercel --prod --yes` → lấy **Production URL**.

**Acceptance:** Báo cáo trong `TEAM_BOARD.md`: kết quả 0 lỗi Console, bằng chứng test wrap 4 cạnh + D-Pad mobile + BGM, commit hash, Production URL mới.

---

# GIAI ĐOẠN 4 (Sprint 4) — Sửa âm thanh trên điện thoại + Tốc độ rắn

**2 hạng mục của Sprint:**
1. **(Agent 2)** Sửa lỗi **không nghe được âm thanh trên điện thoại** (âm lượng quá nhỏ + cơ chế unlock audio mobile chưa chắc).
2. **(Agent 2)** Chỉnh **tốc độ rắn lúc vào màn** (bớt ì, vẫn nhanh dần).
> **(Agent 3)** QA lại trên mobile emulation + push GitHub + redeploy Vercel = **T-010**.

## BẰNG CHỨNG ĐO ĐẠC (Agent 1, trên bản production `https://test-lime-seven-18.vercel.app/`)

Agent 1 đã mở bản deploy trong Chrome DevTools, chèn hook `AudioContext`/`AnalyserNode`, bấm nút **Classic** rồi đo tín hiệu tới `destination`:

| Chỉ số | Giá trị | Kết luận |
| --- | --- | --- |
| `AudioContext.state` | `running` | Context MỞ được (không phải lỗi autoplay) |
| Số `OscillatorNode` tạo trong 2.5s | `22` | Nhạc nền CÓ chạy |
| **RMS tín hiệu ra loa** | **0.0067** | Quá nhỏ |
| **Peak tín hiệu ra loa** | **0.0196** (≈ **−34 dBFS**) | **Gần như không nghe thấy trên loa điện thoại** |
| `muted` / `bgmEnabled` | `false` / `true` | Không bị tắt nhầm |

**Nguyên nhân gốc:** biên độ = `master(0.5) × bgmGain(0.16) × vol(0.11)` ≈ **0.009** → nhạc nền chỉ ~**1% biên độ tối đa**. SFX cũng nhỏ (`0.28 × 0.5 = 0.14`). Trên loa điện thoại ⇒ **im lặng thực tế**.

**Phụ:** trạng thái BGM/Mute lưu ở `localStorage` theo từng origin; domain `test-phuoc-thanh.vercel.app` đang ở **"BGM: TẮT"** ⇒ người dùng có thể vô tình tắt mà không nhận ra.

## SPEC T-009 (Agent 2 — Developer)

### 4.1 Sửa âm thanh KHÔNG nghe được trên điện thoại (`snake/audio.js`)
1. **Tăng âm lượng rõ rệt** (mục tiêu peak BGM ≈ **0.15–0.25**, tức ~**−12…−16 dBFS**):
   - `master.gain.value`: `0.5` → **~0.9**.
   - `bgmGain.gain.value`: `0.16` → **~0.5**.
   - `blip()` vols: melody `0.11` → **~0.32**, bass `0.16` → **~0.42**, hat `0.025` → **~0.10**.
   - SFX `tone()` vols: `playEat` `0.28` → **~0.40**; `playLevelUp` `0.22` → **~0.34**; `playMove` `0.05` → **~0.12**; `playGameOver` `0.3` → **~0.45**.
   - Cập nhật cả `setMuted()` (nhánh `master.gain.value = muted ? 0 : 0.5`) cho khớp mức mới.
2. **Unlock audio trên mobile (BẮT BUỘC, đây là điểm yếu trên điện thoại):**
   - Gắn unlock trên **nhiều sự kiện**: `pointerdown`, `touchstart`, `touchend`, `mousedown`, `click`, `keydown` (chỉ cần chạy 1 lần thành công).
   - **Kỹ thuật unlock iOS:** sau khi `resume()`, phát **1 buffer im lặng** (1 sample) qua `createBufferSource` trong chính handler gesture để "mở khoá" phần cứng audio.
   - **Retry:** nếu `ctx.state !== 'running'`, thử `resume()` lại ở **mỗi** gesture cho tới khi `running`; thêm `document.addEventListener('visibilitychange', ...)` để resume khi quay lại tab.
   - Đảm bảo dùng `window.AudioContext || window.webkitAudioContext` (iOS).
   - `tone()` và `blip()` cũng nên tự `resume()` nếu đang `suspended`.
3. **Không để trạng thái "kẹt im lặng" gây khó hiểu:**
   - Nếu sau gesture mà `ctx.state` vẫn `suspended` → hiện gợi ý ngắn (vd. nhãn/toast) **"Chạm để bật âm thanh"**.
   - Nút **BGM** và **Mute** phải thể hiện rõ BẬT/TẮT.
   - Vẫn giữ nguyên tắc: nhạc **chỉ bắt đầu sau tương tác** (không vi phạm autoplay).

### 4.2 Chỉnh tốc độ rắn lúc vào màn (`snake/levels.js` + `snake/game.js`)
- Hiện tại: `speedFor(score) = Math.max(55, base - score * 4)`; `speed` màn 1 = **140ms** ⇒ **vào màn rất chậm**.
- **Yêu cầu:** vào màn **nhanh hơn (bớt ì)** nhưng **vẫn nhanh dần đều** theo điểm:
  - Classic: `speed` **140 → ~110**, sàn **~62ms**
  - Boxed: `speed` **122 → ~100**, sàn **~58ms**
  - Maze: `speed` **104 → ~90**, sàn **~55ms**
  - Ramp mượt hơn: `base - score * 3` (thay vì `* 4`), vẫn kẹp sàn.
- Giữ đúng tinh thần "nhanh dần về sau", chỉ bỏ cảm giác **chậm chạm lúc mới vào**.
- Cập nhật `test/logic.test.js` nếu có test phụ thuộc giá trị speed mặc định; KHÔNG sửa `test/qa.test.js`.

### 4.3 Không phá tính năng Sprint 3
Wrap (không vệt kéo dài), D-Pad mobile (touch + vibrate), menu 3 màn, `localStorage` high score — giữ nguyên.

**Ownership:** `snake/audio.js`, `snake/levels.js`, `snake/game.js` (nếu cần), `test/logic.test.js`. **KHÔNG** sửa `test/qa.test.js`.

**Observable acceptance (Agent 2 tự chạy):** `node --check` tất cả JS OK; `node test/logic.test.js` → `ALL TESTS PASSED`; `node test/qa.test.js` → `ALL QA TESTS PASSED`; mở devtools mobile (390×844), bấm Classic → **đo peak tín hiệu ra loa > 0.1**; tốc độ vào màn Classic ≈ 110ms/bước.

## SPEC T-010 (Agent 3 — QA & DevOps)
1. Tải bản mới, mở bằng Chrome DevTools **mobile emulation (iPhone 14, 390×844)**.
2. **Đo biên độ thật** (chèn `AnalyserNode` giữa `master` và `destination`): bấm Classic → xác nhận **peak > 0.1** (so với 0.02 trước đây). Kiểm tra cả SFX khi ăn mồi.
3. Kiểm tra **BGM bật mặc định**, **Mute hoạt động**, nhạc bắt đầu sau tương tác, **0 lỗi Console**.
4. Kiểm tra **tốc độ**: đo số bước/giây ở màn Classic lúc điểm 0 (kỳ vọng ≈ 110ms/bước) và khi điểm cao (nhanh hơn rõ rệt).
5. Nếu PASS: `git add .` → commit `fix: audible mobile audio (louder + iOS unlock) and faster start speed` → `git push origin main` → `npx --yes vercel --prod --yes`.
6. Ghi kết quả + commit hash + Production URL vào `TEAM_BOARD.md`.

---

## KẾT QUẢ TỰ KIỂM T-009 (Agent 2 — Giai đoạn 4, 2026-10-17)

### 1) 4.1 Âm thanh trên điện thoại (`snake/audio.js`)

| Hạng mục | Trước (Agent 1 đo production) | Sau (Agent 2 đo `localhost:8123`) |
| --- | --- | --- |
| **Peak tín hiệu ra loa (BGM)** | `0.0196` (~ −34 dBFS) | **`0.3001`** (×15) |
| **RMS (BGM)** | `0.0067` | **`0.0239`** (×3.6) |
| **Peak SFX (ăn mồi)** | ~`0.14` (`0.28 × 0.5`) | **`0.4166`** |
| `AudioContext.state` | `running` | `running` |
| Biên độ | `master 0.5 × bgmGain 0.16 × vol 0.11 ≈ 0.009` | `master 0.9 × bgmGain 0.5 × vol 0.32 ≈ 0.144` (melody), bass `0.42` |

Kỹ thuật đo: chèn `AnalyserNode` **giữa `master` và `destination`** (bắt `master` bằng cách hook `GainNode.prototype.connect` khi nối thẳng vào `destination`), đọc `getFloatTimeDomainData` 25 mẫu × 100 ms.

**Âm lượng đã tăng:** `master 0.5 → 0.9` (**cả** `ensureContext()` **và** `setMuted()`); `bgmGain 0.16 → 0.5`; `blip()` melody `0.11 → 0.32`, bass `0.16 → 0.42`, hat `0.025 → 0.10`; SFX `playEat 0.28 → 0.40`, `playLevelUp 0.22/0.22/0.24 → 0.34/0.34/0.37`, `playMove 0.05 → 0.12`, `playGameOver 0.3 → 0.45`.

**Unlock audio mobile:** gắn **6 sự kiện** (`pointerdown`, `touchstart`, `touchend`, `mousedown`, `click`, `keydown`) + `visibilitychange`; mỗi gesture: `ensureContext()` → phát **buffer IM LẶNG 1 sample** qua `createBufferSource` (khoá iOS) → `resume()`; **retry ở MỖI gesture** tới khi `state === 'running'`; dùng `window.AudioContext || window.webkitAudioContext`; `tone()` **và** `blip()` tự `resume()` nếu `suspended`. Callback `onStateChange(cb)` báo trạng thái.

**Không "kẹt im lặng":** nếu sau gesture `ctx.state` vẫn `suspended` → hiện gợi ý **"🔇 Chạm để bật âm thanh"** (`#audioHint`, tự ẩn khi audio chạy). Nút **BGM** và **Mute** hiển thị rõ `BẬT`/`TẮT`.

| Kiểm chứng unlock | Kết quả |
| --- | --- |
| Gesture bình thường | `state = running`, callback `onStateChange(true)`, gợi ý **ẩn** (`display:none`) |
| Giả lập `resume()` **thất bại** (suspend + no-op resume) | `state = suspended`, callback `onStateChange(false)` → gợi ý hiện **`display:block`** ở cả 4 mốc 0 / 50 / 150 / 300 ms |
| Khôi phục resume | `state = running`, gợi ý tự **ẩn** |
| Console | **0 lỗi** |

### 2) 4.2 Tốc độ vào màn (`snake/levels.js` + `snake/game.js`)

| Màn | `speed` cũ | `speed` mới | Sàn `minSpeed` (mới) | **Đo thực tế** (ms/bước, điểm 0) |
| --- | --- | --- | --- | --- |
| Classic | 140 | **110** | **62** | **111.1** |
| Boxed | 122 | **100** | **58** | **100.1** |
| Maze | 104 | **90** | **55** | **86.4** |

- Ramp mới: `speedFor(score) = Math.max(minSpeed, speed - score * 3)` (cũ `Math.max(55, base - score * 4)`).
- Đo bằng cách bọc `SnakeLogic.step` để ghi mốc thời gian rồi lấy **median** delta. Chọn màn bằng **nút menu thật** (phím số chỉ có tác dụng khi đang ở **menu**).

### 3) 4.3 Không phá tính năng Sprint 3

| Hạng mục | Kết quả |
| --- | --- |
| Wrap (không vệt kéo dài) | Run ngang/dọc liên tiếp lớn nhất **2.88 ô** ≈ đúng chiều dài thân rắn |
| D-Pad mobile | **4/4** nút hướng + **4/4** nút chức năng (START/Pause, Mute, BGM, Đổi màn) hiện diện |
| Menu / high score | 3 nút chọn màn, menu ẩn khi vào game — nguyên vẹn |
| Console (`/`) | **0 message** |

### 4) Test tự động

| Lệnh | Kết quả |
| --- | --- |
| `node --check` (6 file JS) | **OK** (exit 0) |
| `node test/logic.test.js` | **53/53 pass**, `ALL TESTS PASSED` (thêm 2 test `levels.js` Sprint 4 + 1 test API unlock audio) |
| `node test/qa.test.js` | **16/16 edge pass, 0 defect**, `ALL QA TESTS PASSED` (**KHÔNG** sửa file của Agent 3) |

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
| 2026-10-16 | Agent 1 | Agent 3 | Giao task **T-006** (Giai đoạn 2) qua `orca terminal send`: (1) test Chrome DevTools tại `http://localhost:8080/` — **chỉ đi tiếp khi 0 lỗi Console**; (2) push GitHub `PhuocThanh22/snak`; (3) deploy Vercel `--prod`. Ghi báo cáo + cập nhật trạng thái T-006 vào `TEAM_BOARD.md`. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 1 (Chrome DevTools) — ĐẠT.** Server `python -m http.server 8080` (chạy nền) tại `D:\Code\test`. Mở `http://localhost:8080/`: **0 console message** (không `ReferenceError`/`SyntaxError`, không cảnh báo autoplay Web Audio, không 404). Network: `/`, `snake/style.css`, `snake/levels.js`, `snake/logic.js`, `snake/particles.js`, `snake/audio.js`, `snake/game.js` đều **200**. Tương tác: chọn **Màn 1 Classic / 2 Boxed / 3 Maze** (menu ẩn sau khi chọn), **Mute↔Unmute** (nhãn + `aria-pressed` đổi đúng), phím điều hướng + `Space` (overlay TẠM DỪNG / GAME OVER hiện đúng), Boxed đâm tường → GAME OVER. Canvas backing `600×600` (dpr 1.25), CSS `518×518`; pixel ô chướng ngại Maze `(6,6)` = rgb(83,38,124) khác ô trống `(2,2)` = rgb(6,8,15) → Maze vẽ được vật cản. Trang lồng `/snake/` cũng **0 lỗi console**. Đã tắt server tạm (PID 27276). Ảnh: `t006_classic_clean.png`, `t006_boxed_gameover.png`, `t006_maze.png`. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 2 (GitHub) — ĐẠT.** Tạo `.gitignore` (`.orca/`, `node_modules/`, `.vercel/`, `*.log`, `.DS_Store`). `git init` → `git add .` → commit `feat: upgrade visuals, sound effects, levels and vercel config` → `git branch -M main` → remote `https://github.com/PhuocThanh22/snak.git` → `git push -u origin main --force`. **Commit hash `32acdb0806c4e074a33baa8de962748398088344`** (short `32acdb0`), 14 file / 3012 dòng. `git ls-remote origin` xác nhận `refs/heads/main` = `32acdb0…`. Cây làm việc sạch. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 3 (Vercel) — ĐẠT (ngoài dự kiến).** Lần đầu `vercel --prod --yes` báo `Error: No existing credentials found` (exit 1). Chạy `vercel login`: máy đã có phiên Vercel sẵn → **đăng nhập thành công** (`https://vercel.com/oauth/device?user_code=KRND-GMKJ`). Deploy lại: **Production URL `https://test-lime-seven-18.vercel.app`**, deployment `dpl_By4DYWDsZhxkyVTMJ9vzt58HFmn4`, `readyState = READY`. Kiểm chứng production bằng DevTools: **0 lỗi console**, tài nguyên 200/304. ⚠️ Deployment đang bật **Vercel Authentication (Deployment Protection)** → cần đăng nhập Vercel mới truy cập công khai được. |
| 2026-10-16 | Agent 3 | Agent 1 | T-006 hoàn tất, cả 3 nhiệm vụ **ĐẠT**. T-006 = `Done`. Đề xuất Agent 1 duyệt **T-005 = Done** (QA qua T-006 đã Pass) — Agent 1 giữ quyền quyết định cuối cùng. |
| 2026-10-16 | Agent 1 | Toàn đội | **Xác minh & duyệt cuối.** Agent 1 tự kiểm chứng: `node test/logic.test.js` 45/45 pass, `node test/qa.test.js` 16/16 pass; `vercel.json` hợp lệ; `Invoke-WebRequest https://test-lime-seven-18.vercel.app/` → **HTTP 200, nội dung có "NEON SNAKE"** (công khai); GitHub repo → **HTTP 200**. Duyệt **T-005 = Done**, **T-006 = Done**. Commit `32acdb0` đã push; `TEAM_BOARD.md` cập nhật cuối sẽ được commit tiếp. |
| 2026-10-16 | Agent 1 | Toàn đội | **GIAI ĐOẠN 3 (Sprint 3).** 4 hạng mục: (1) sửa lỗi rắn kéo dài khi wrap, (2) nhạc nền Sugarsweet + fallback synth, (3) giao diện máy chơi cầm tay mobile, (4) QA Chrome DevTools mobile + redeploy. Giao **T-007** cho Agent 2, **T-008** cho Agent 3. |
| 2026-10-16 | Agent 1 | Agent 2 | Giao task **T-007** qua `orca terminal send`. Yêu cầu đọc `SPEC T-007` trong `TEAM_BOARD.md` và thực thi đủ 3 hạng mục dev. |
| 2026-10-16 | Agent 2 | Agent 1 | Hoàn thành **T-007** → `Ready for Review` (20m26s). Sửa render wrap bằng hàm `wrapDelta` + "trải phẳng" (unwrap) toạ độ và `beginPath` từng đoạn → không vẽ vệt xuyên màn hình; logic `step()` giữ nguyên `pop()`. Thêm BGM: thử nạp `bgm.mp3` (fetch HEAD, không gây 404), **fallback synth Web Audio** "Sugarsweet" (17 oscillator/1.8s, AudioContext running) + nút BGM lưu `localStorage`. Thêm giao diện máy chơi cầm tay (D-Pad + Start/Pause + Mute + BGM + Đổi màn), `touchstart` preventDefault + `vibrate`, `100dvh` không cuộn. `logic.test.js` **50/50 pass**; `qa.test.js` 16/16 pass. */
| 2026-10-16 | Agent 1 | Agent 3 | **Xác minh độc lập T-007:** `node --check` 6 file JS OK; `logic.test.js` 50/50 pass; `qa.test.js` 16/16 pass; `snake/game.js` dùng `wrapDelta` + trải phẳng + `beginPath` từng đoạn (đúng cách chống vệt xuyên màn hình). **Giao task T-008** qua `orca terminal send`: test Chrome DevTools mobile (wrap 4 cạnh, D-Pad iPhone 14, BGM, 0 lỗi console) → push GitHub → redeploy Vercel. |
| 2026-10-16 | Agent 2 | Agent 1 | Nhận **T-007** (Sprint 3): `Todo` → `In Progress`. Đã nạp đủ `SPEC T-007` + `task_t007_prompt.md`. |
| 2026-10-16 | Agent 2 | Agent 1 & Agent 3 | **Hạng mục 1 (sửa lỗi wrap) — XONG.** *Logic (`snake/logic.js`):* xác nhận `step()` đã `snake.pop()` khi **KHÔNG** ăn mồi (kể cả khi wrap) ⇒ `snake.length` **không tăng**; bổ sung 4 test hồi quy (wrap **4 cạnh**, **60 bước** liên tiếp, **đốt liền kề trên hình xuyến**, ăn mồi ở bờ đối diện). *Render (`snake/game.js`) — nguyên nhân vệt ngang:* hàm `strokePath()` vẽ **một polyline nối liền** điểm đầu (đang ở mép trái) với đốt kế (còn ở mép phải) khi wrap ⇒ kéo một đường băng ngang màn hình. **Đã thay** bằng thuật toán **"trải phẳng qua biên" (unwrap)**: `buildSnakePath()` dùng `wrapDelta()` = độ lệch nhỏ nhất trên hình xuyến để dựng chuỗi toạ độ **LIỀN MẠCH** (hai đốt liên tiếp **luôn** cách đúng 1 ô, kể cả khi wrap), kèm **tiling ±LOGICAL** chỉ khi path tràn ra ngoài mép (để phần tràn hiện ở mép đối diện, nối liền 2 bờ); `splitPath()` vẫn **ngắt đường vẽ** (`beginPath` mới) nếu phát hiện khe > 1.5 ô như một lưới an toàn. Nhờ vậy **tuyệt đối không** còn đường nối/nội suy băng ngang; áp dụng cho cả thân lẫn đầu (particle là một điểm nên không thể có vệt). |
| 2026-10-16 | Agent 2 | Agent 1 & Agent 3 | **Hạng mục 2 (nhạc nền "Sugarsweet") — XONG.** Thêm vào `snake/audio.js`: `attachBgmElement()`/`startBgm()`/`stopBgm()`/`toggleBgm()`/`setBgmEnabled()`/`isBgmEnabled()`. Nhạc nền **ưu tiên file** trên thẻ `<audio id="bgm" loop>` (khi HTML khai báo `src`); **fallback bắt buộc tự SINH chiptune** (giai điệu 32 bước + bass + hat, scheduler lookahead 0.15s, BPM 112) khi không có file **hoặc** khi thẻ audio bắn sự kiện `error`; trạng thái bật/tắt lưu `localStorage` key `snake:bgm`; nhạc **chỉ phát sau tương tác đầu tiên** (autoplay policy). Thêm nút **BGM: BẬT/TẮT** ở topbar + nút BGM trên máy chơi. ⚠️ **Phát hiện quan trọng:** cách dò file bằng `fetch('bgm.mp3', {method:'HEAD'})` **vẫn bị Chrome ghi lỗi 404 lên Console** → đã **bỏ** cách dò này; chỉ dùng file khi HTML khai báo `src` (dự án hiện **không có** file ⇒ chạy synth ⇒ **0 lỗi console**, **không** phát sinh request 404). |
| 2026-10-16 | Agent 2 | Agent 1 & Agent 3 | **Hạng mục 3 (giao diện máy chơi cầm tay) — XONG + tự kiểm chứng.** Thêm cụm `.pad` trong cả `index.html` (gốc) và `snake/index.html`: **D-Pad 4 hướng** + 4 nút chức năng **START/Pause, Mute, BGM, Đổi màn**. `bindPadButton()` (trong `snake/game.js`) dùng **`touchstart` + `preventDefault`** (chặn delay 300ms / cuộn trang / zoom), kèm `mousedown` (desktop) & `click` (bàn phím), hiệu ứng lún `.is-active` + **`navigator.vibrate(15)`**. CSS responsive `100dvh`: `overflow:hidden`, board co theo `min(100%, 50dvh)`, ẩn `.controls` trên mobile. *Tự kiểm chứng:* `node --check` **6 file JS** → **OK**; `node test/logic.test.js` → **50/50 pass**, in `ALL TESTS PASSED`, **exit 0**; `node test/qa.test.js` → **16/16 edge pass, 0 defect**, `ALL QA TESTS PASSED`, exit 0 (**KHÔNG** sửa `test/qa.test.js` của Agent 3). Chrome DevTools (`emulate` 390×844, touch): **0 console message** trên cả `/` và `/snake/`; **đo trực tiếp pixel canvas** — vệt ngang/dọc lớn nhất chỉ **≈2.9 ô** (đúng bằng thân rắn) khi wrap ngang/dọc, trong khi bài **tự-test bộ dò bắt đúng vệt 19 ô** ⇒ khẳng định **hết lỗi**; BGM synth tạo **17 oscillator** trong 1.8s với `AudioContext.state = running`; D-Pad **đổi hướng thật** (centroid trục `y` chạy 461→88 rồi vòng xuống đáy); `touchstart` cho `defaultPrevented = true`, nút PAUSE mở overlay "TẠM DỪNG"; `scrollHeight === innerHeight` ⇒ **không cuộn trang**. T-007 = **Ready for Review**. **KHÔNG tự đánh dấu Done** — chờ Agent 3 (T-008) review/QA. |
| 2026-10-16 | Agent 1 | Agent 3 | Giao task **T-008** qua `orca terminal send`: (1) test Chrome DevTools (wrap 4 cạnh Màn 1 Classic, D-Pad iPhone 14 390×844, BGM, 0 lỗi Console — **nếu có lỗi thì DỪNG, không push**); (2) chỉ khi mọi test PASS mới `git add .` → commit `fix: screen-wrap stretching bug, add sugarsweet BGM and handheld mobile controls` → `git push origin main` → `npx --yes vercel --prod --yes`; (3) ghi báo cáo vào `TEAM_BOARD.md`. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 1a — Test wrap 4 cạnh (Màn 1 Classic) — ĐẠT.** Server nền `python -m http.server 8080`; mở `http://localhost:8080/`, chọn **Màn 1 (wrap)**. **Phương pháp đo khách quan:** chụp canvas sang một canvas phụ (`willReadFrequently`, tránh cảnh báo console) rồi lọc pixel "rắn" theo ngưỡng màu (kênh G≥120, G>R+40, G>B+20) → tính **run ngang/dọc liên tiếp lớn nhất** (đơn vị = ô). Cho rắn đi xuyên **lần lượt 4 cạnh**, reset bộ đo mỗi cạnh: **Phải**: run ngang **2.97 ô** / dọc 1.13; **Trên**: dọc **2.97 ô** / ngang 1.83; **Trái**: ngang **2.50** / dọc 2.03; **Dưới**: ngang **2.83** / dọc 1.93. ⇒ Mọi run ≤ **2.97 ô ≈ đúng chiều dài thân rắn (3 ô)** — **KHÔNG** có vệt kéo dài băng ngang/dọc (lỗi cũ sẽ cho run ~19–20 ô ≈ cả màn hình). Bộ dò "chạm cả 2 bờ" tự đóng băng khung hình đúng lúc rắn nằm vắt qua đường nối và chụp ảnh bằng chứng: `t008_wrap_right.png` (hàng y=74/150), `t008_wrap_top.png` (cột x=335), `t008_wrap_bottom.png` (cột x=275) — ảnh cho thấy thân rắn nằm ở **cả hai mép** mà **không có vệt ngang/dọc** giữa bàn. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 1b — Bất biến chiều dài — ĐẠT.** *Trực tiếp trong game (hook `SnakeLogic.step`):* ghi lại `len` và `score` mỗi bước — bất biến **`len === 3 + score`** luôn đúng, **0 vi phạm** (rắn chỉ dài thêm khi ăn mồi, KHÔNG cộng dồn đốt khi chỉ wrap). *Stress tất định (chạy chính `snake/logic.js` trong trình duyệt):* 2 lượt × **5000 bước** đi thẳng (ngang & dọc) → mỗi lượt **250 lần wrap**, **0 vi phạm** chiều dài, `maxLen = 3`. Ghi chú: khi tab ở chế độ nền, Chrome bóp `requestAnimationFrame` (số bước tạm thời thấp); sau `select_page bringToFront` game chạy đúng tốc độ **~7,1 bước/giây** (= 140 ms/bước của Màn 1) — đây là hành vi của môi trường automation, không phải lỗi game. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 1c — Mobile emulation iPhone 14 (390×844) — ĐẠT.** `emulate` viewport `390x844x3,mobile,touch` + UA iPhone, nạp lại trang. **Layout `100dvh`:** `innerWidth=390`, `innerHeight=844`, `dpr=3`; `documentElement.scrollHeight = body.scrollHeight = 844 = innerHeight` ⇒ **`scrollable=false` (không cuộn trang)**; `body overflow-y: hidden`; cụm `.pad` **display:flex** (hiện), `.controls` **display:none** (ẩn trên mobile); canvas backing `960×960`, CSS `377×377`; **4/4 nút `.dbtn`**. **Bấm trực tiếp 4 nút D-Pad** (đọc `state.dir` + toạ độ đầu rắn trước/sau): **Lên** `(1,0)→(0,-1)`, đầu `(18,10)→(19,4)` ✔; **Trái** `(0,-1)→(-1,0)`, đầu `(19,2)→(13,1)` ✔; **Xuống** `(-1,0)→(0,1)`, đầu `(12,1)→(11,8)` ✔; **Phải** `(0,1)→(1,0)`, đầu `(11,9)→(18,10)` ✔ ⇒ **đổi hướng nhạy và chính xác 4/4**. Kiểm tra thêm **đường cảm ứng thật**: phát `TouchEvent('touchstart')` lên nút "Lên" → `defaultPrevented = true`, nút có class lún `is-active`, `state.dir` đổi thành `(0,-1)` ✔ (đúng cơ chế chặn delay 300ms/cuộn/zoom). Ảnh: `t008_mobile_play.png`. |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 1d — Nhạc nền (BGM) — ĐẠT.** Hook `AudioContext.prototype.createOscillator` để đếm số nốt thực sự được tổng hợp. Sau tương tác đầu tiên (bấm chọn màn), nhạc nền **phát**: **61 oscillator** trong thời gian chơi, `AudioContext.state = running`, `sampleRate = 48000`, `SnakeAudio.isBgmEnabled() = true`, `isMuted() = false`. Dự án **không có** file `bgm.mp3` và thẻ `<audio id="bgm">` **không khai báo `src`** ⇒ tự động dùng **fallback synth "Sugarsweet"**, **không phát sinh request file** nào (Network chỉ có 7 tài nguyên app, **không 404**). **Console: 0 lỗi đỏ** (không `ReferenceError`/`SyntaxError`/lỗi Web Audio/autoplay). |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 2 — Push GitHub — ĐẠT.** (Chỉ thực hiện sau khi MỌI test PASS.) `git add .` → commit **`ef0d0e66e5740207c615154239d5845969588d9a`** (short `ef0d0e6`) message đúng theo SPEC `fix: screen-wrap stretching bug, add sugarsweet BGM and handheld mobile controls` (7 file, +969 / −46) → `git push origin main` (`728af5b..ef0d0e6 main -> main`). `git ls-remote origin refs/heads/main` = `ef0d0e6…` (**khớp local**). |
| 2026-10-16 | Agent 3 | Toàn đội | **Nhiệm vụ 2 — Redeploy Vercel — ĐẠT.** `npx --yes vercel --prod --yes` → **Production URL `https://test-lime-seven-18.vercel.app`**, deployment `dpl_DdLnBkE1G7fcXzpJDFcMdeqTj7wk`, `readyState = READY`. Kiểm chứng bản production (qua `vercel curl`): `/` HTTP **200** (4795 B, có `id="bgmBtn"`, `id="bgm"`, `class="pad"`, `dbtn--up/down`, `data-action="pause"`); `/snake/game.js` 200 (23388 B, có `wrapDelta` + `buildSnakePath`); `/snake/audio.js` 200 (11282 B, có `BGM_MELODY` + `startBgm`) ⇒ **bản mới đã lên production**. ⚠️ Deployment vẫn bật **Vercel Authentication (Deployment Protection)** → cần đăng nhập Vercel để mở công khai. |
| 2026-10-16 | Agent 3 | Agent 1 | **Kết luận T-008: 3/3 nhiệm vụ ĐẠT** (Chrome DevTools 0 lỗi · push `ef0d0e6` · Vercel READY). **T-008 = `Done`.** Đề xuất **T-007 = `QA Pass` → Agent 1 duyệt `Done`**. Regression: `node --check` 7 file JS OK; `logic.test.js` **50/50**; `qa.test.js` **16/16**. |
| 2026-10-16 | Agent 1 | Toàn đội | **XÁC MINH ĐỘC LẬP & DUYỆT CUỐI (Sprint 3).** Agent 1 tự kiểm chứng, KHÔNG chỉ tin báo cáo: (1) `git show --stat ef0d0e6` → 7 file (+969/−46) đúng phạm vi; (2) `git ls-remote origin refs/heads/main` = `ef0d0e6…` (khớp local); (3) chạy lại `node test/logic.test.js` → **50/50 pass**, `node test/qa.test.js` → **16/16 pass**; (4) `Invoke-WebRequest` **production** `https://test-lime-seven-18.vercel.app/` → **HTTP 200** và chứa `bgmBtn`, `bgm`, `dbtn--up/down`, `data-action="pause"`, `pad`; `/snake/game.js` **200** chứa `wrapDelta` + `buildSnakePath`; `/snake/audio.js` **200** chứa `startBgm` + `BGM_MELODY`. ⇒ Bản production thực sự phục vụ bản đã sửa. **Duyệt `T-007 = Done`** (QA Pass qua T-008) và **`T-008 = Done`**. Sprint 3 hoàn tất. |
| 2026-10-16 | Khách hàng | Agent 1 | **Phản hồi lỗi thực tế:** (1) **chơi trên Vercel bằng ĐIỆN THOẠI thì KHÔNG có âm thanh gì cả**; (2) chỉnh tốc độ rắn: lúc mới vào cứ chậm chạm, nhanh dần về sau. |
| 2026-10-16 | Agent 1 | Toàn đội | **ĐIỀU TRA GỐC LỖI ÂM THANH (Sprint 4).** Agent 1 mở bản production trong Chrome DevTools, chèn hook `AudioContext` + `AnalyserNode` (giữa `master` và `destination`), bấm nút Classic, đo trực tiếp: `ctxState=running`, `22` oscillator/2.5s, **RMS=0.0067**, **peak=0.0196 (~ −34 dBFS)**. ⇒ Code audio CHẠY nhưng **biên độ quá nhỏ (≈1% biên độ tối đa)** → trên loa điện thoại là **im lặng**. Nguyên nhân: `master 0.5 × bgmGain 0.16 × vol 0.11 ≈ 0.009`. Phát hiện phụ: trạng thái BGM/Mute lưu `localStorage` theo origin — domain `test-phuoc-thanh.vercel.app` đang `BGM: TẮT`. |
| 2026-10-16 | Agent 1 | Agent 2 | **Giao task T-009** (Sprint 4): (4.1) tăng âm lượng (master ~0.9, bgmGain ~0.5, blip/SFX vols tăng; mục tiêu peak BGM 0.15–0.25) + **unlock audio mobile** (nhiều sự kiện, buffer im lặng 1 sample, retry `resume()`, `visibilitychange`, `webkitAudioContext`); (4.2) tốc độ vào màn nhanh hơn (Classic 140→110ms, ramp `*3`, sàn ~62ms) nhưng vẫn nhanh dần. Không sửa `test/qa.test.js`. |
| 2026-10-17 | Agent 2 | Agent 1 | **Hoàn thành T-009 → `Ready for Review`.** *Âm thanh:* `master` 0.5→**0.9**, `bgmGain` 0.16→**0.5**, blip melody 0.11→**0.32**, bass 0.16→**0.42**, hat 0.025→0.10; SFX eat **0.4**, levelup 0.34, move 0.12, gameover 0.45. *Unlock mobile:* `UNLOCK_EVENTS = [pointerdown, touchstart, touchend, mousedown, click, keydown]` + `visibilitychange`; phát **buffer im lặng 1 sample** (`createBufferSource`) trong chính gesture (khoá iOS) rồi `resume()`, retry mỗi gesture tới khi `running`; `tone()`/`blip()` tự resume; thêm `getState()/isAudioRunning()/onStateChange()`; gợi ý `#audioHint` "🔇 Chạm để bật âm thanh" chỉ hiện khi vẫn suspended (đã kiểm chứng bằng cách giả lập resume hỏng). *Tốc độ:* Classic 140→**110** (sàn 62, đo **111.1 ms/bước**), Boxed 122→**100** (58, đo 100.1), Maze 104→**90** (55, đo 86.4); ramp `max(minSpeed, speed - score*3)`. *Không phá Sprint 3:* vệt wrap max **2.88 ô**, D-Pad 4 hướng + 4 nút chức năng, 3 nút menu, **0 console message**. `logic.test.js` **53/53**; `qa.test.js` 16/16. **Số đo peak mới = 0.3001** (trước 0.02) — cao hơn nhẹ dải 0.15–0.25 nhưng an toàn (< 1.0, không clip). KHÔNG tự đánh dấu Done. |
| 2026-10-17 | Agent 1 | Agent 3 | **Xác minh độc lập T-009:** `git diff --stat` 8 file (+481/−44); `node --check` 6 file JS OK; `logic.test.js` **53/53**, `qa.test.js` **16/16**; xác nhận trong `snake/audio.js`: `master.gain.value = 0.9`, `bgmGain.gain.value = 0.5`, blip vols 0.32/0.42, `UNLOCK_EVENTS` 6 sự kiện + `visibilitychange` + `createBufferSource`, `webkitAudioContext`; `snake/levels.js`: `speed`/`minSpeed` = 110/62, 100/58, 90/55. **Giao task T-010** cho Agent 3: đo biên độ thật trên mobile emulation (`AnalyserNode`, peak > 0.1, không clip), test BGM/Mute/tốc độ, 0 lỗi Console → push GitHub → redeploy Vercel. |
| 2026-10-17 | Agent 2 | Agent 1 & Agent 3 | Nhận **T-009** (Sprint 4): `Todo` → `In Progress`. **Hạng mục 4.1 (âm thanh điện thoại) — XONG** trong `snake/audio.js`. *Tăng âm lượng:* `master.gain 0.5 → 0.9` (**cả** trong `ensureContext()` **và** `setMuted()`), `bgmGain 0.16 → 0.5`, `blip()` melody `0.11 → 0.32` / bass `0.16 → 0.42` / hat `0.025 → 0.10`, SFX `playEat 0.28 → 0.40`, `playLevelUp 0.22/0.22/0.24 → 0.34/0.34/0.37`, `playMove 0.05 → 0.12`, `playGameOver 0.3 → 0.45`. *Unlock mobile:* thêm `unlockAudio()` gắn **6 sự kiện** (`pointerdown`/`touchstart`/`touchend`/`mousedown`/`click`/`keydown`) + `visibilitychange`; trong mỗi gesture gọi `ensureContext()` → **phát buffer IM LẶNG 1 sample** qua `createBufferSource` (khoá phần cứng iOS) → `resume()`, **retry ở mỗi gesture** tới khi `running`; giữ `window.AudioContext || window.webkitAudioContext`; `tone()` **và** `blip()` tự `resume()` nếu `suspended`; API mới `getState()`/`isAudioRunning()`/`onStateChange(cb)`. *Chống "kẹt im lặng":* thêm gợi ý `#audioHint` **"🔇 Chạm để bật âm thanh"** (chỉ hiện khi sau gesture vẫn `suspended`, tự ẩn khi `running`) trong `index.html` gốc + `snake/index.html` + `.audio-hint` ở `style.css`; đổi nhãn nút **Mute** thành `🔊 Âm thanh: BẬT` / `🔇 Âm thanh: TẮT` (BGM đã có `BẬT/TẮT`). |
| 2026-10-17 | Agent 2 | Agent 1 & Agent 3 | **Hạng mục 4.2 (tốc độ vào màn) — XONG.** `snake/levels.js`: Classic `speed 140 → 110` + `minSpeed 62`, Boxed `122 → 100` + `minSpeed 58`, Maze `104 → 90` + `minSpeed 55` (thêm trường `minSpeed`). `snake/game.js`: `speedFor(score) = Math.max(minLevel.minSpeed, speed - score * 3)` (cũ `Math.max(55, base - score * 4)`), cập nhật cả `FALLBACK_LEVEL` + `toConfig` mặc định `110`. **Hạng mục 4.3 (không phá Sprint 3):** wrap/D-Pad/menu/high score giữ nguyên. |
| 2026-10-17 | Agent 2 | Agent 1 & Agent 3 | **TỰ KIỂM CHỨNG T-009 (Chrome DevTools mobile iPhone 14, 390×844, `http://localhost:8123/`).** Hook `GainNode.prototype.connect` để bắt `master` rồi chèn `AnalyserNode` **giữa `master` và `destination`**, bấm **Classic**: `state = running`, **peak `0.3001`** (cũ `0.0196` → **×15**), **RMS `0.0239`** (cũ `0.0067`); **peak SFX ăn mồi `0.4166`** (gọi `SnakeAudio.playEat()`). *Unlock:* gesture thường → `onStateChange(true)` + gợi ý **ẩn**; giả lập `resume()` hỏng (suspend + no-op) → `onStateChange(false)` + gợi ý **hiện** (`display:block` bền qua 0/50/150/300 ms); khôi phục → tự ẩn. *Tốc độ* (bọc `SnakeLogic.step` ghi mốc, chọn màn bằng nút menu thật): Classic **111.1**, Boxed **100.1**, Maze **86.4** ms/bước (cũ 140/122/104). *Sprint 3 nguyên vẹn:* vệt wrap lớn nhất **2.88 ô**; D-Pad **4 nút hướng + 4 nút chức năng**; 3 nút menu; **0 console message**. *Test:* `node --check` 6 file JS **OK**; `node test/logic.test.js` → **53/53 pass** `ALL TESTS PASSED`; `node test/qa.test.js` → **16/16 edge pass, 0 defect** `ALL QA TESTS PASSED` (**KHÔNG** sửa `test/qa.test.js`). **T-009 = `Ready for Review`** — chờ Agent 3 (T-010). **KHÔNG tự đánh dấu Done.** |

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

---

## KẾT QUẢ TRIỂN KHAI (T-006 — Giai đoạn 2, 2026-10-16)

### Số lỗi Console (Chrome DevTools)

| Hạng mục | Kết quả |
| --- | --- |
| **Số lỗi Console** | **0** — không `ReferenceError`, không `SyntaxError`, không lỗi Web Audio API, không cảnh báo autoplay, không 404 |
| Phạm vi kiểm tra | `http://localhost:8080/` và `http://localhost:8080/snake/` — đều 0 message |
| Tài nguyên Network | 7 tài nguyên app đều `200` (local) / `200–304` (Vercel). Favicon là data-URI → không có 404 |
| Tương tác đã test | Chọn Màn 1/2/3, Mute↔Unmute, phím điều hướng, `Space` (pause), đâm tường → GAME OVER |
| DOM/Canvas | `#game` tồn tại; canvas backing `600×600` (dpr 1.25), CSS `518×518`; Maze vẽ được vật cản (pixel ô `(6,6)`=rgb(83,38,124) ≠ ô trống `(2,2)`=rgb(6,8,15)) |
| Ghi chú | Một cảnh báo `Canvas2D: getImageData … willReadFrequently` xuất hiện **chỉ vì script QA tự gọi `getImageData`** để đọc pixel — **không phải lỗi của ứng dụng**; luồng sạch (không getImageData) 0 message |

### GitHub

| Hạng mục | Giá trị |
| --- | --- |
| Commit message | `feat: upgrade visuals, sound effects, levels and vercel config` |
| **Commit hash** | **`32acdb0806c4e074a33baa8de962748398088344`** (short `32acdb0`) |
| Nhánh | `main` (14 file, 3012 dòng) |
| **GitHub URL** | **https://github.com/PhuocThanh22/snak** |
| Xác minh | `git ls-remote origin` → `refs/heads/main` = `32acdb0…` (khớp local). Cây làm việc sạch ngay sau khi push; sau đó `TEAM_BOARD.md` được sửa để ghi báo cáo T-006 (chưa commit lại — đúng theo SPEC chỉ commit 1 lần) |

### Vercel

| Hạng mục | Giá trị |
| --- | --- |
| **Production URL** | **https://test-lime-seven-18.vercel.app** |
| Deployment ID | `dpl_By4DYWDsZhxkyVTMJ9vzt58HFmn4` — `readyState = READY` |
| URL trực tiếp | https://test-a1e3e8o9r-phuoc-thanh.vercel.app |
| Inspector | https://vercel.com/phuoc-thanh/test/By4DYWDsZhxkyVTMJ9vzt58HFmn4 |
| Project | `phuoc-thanh/test` (No framework — static, không build) |
| Kiểm chứng production | Mở bằng DevTools: **0 lỗi console**, tài nguyên `200/304` |
| **Lần chạy đầu (bị chặn)** | `Error: No existing credentials found. Run \`vercel deploy --temporary\` to create a temporary deployment you can claim later, or \`vercel login\` to log in.` (exit 1) |
| **Cách khắc phục** | Chạy `vercel login` → máy đã có phiên Vercel nên **đăng nhập thành công**. Link xác thực: `https://vercel.com/oauth/device?user_code=KRND-GMKJ` |
| ⚠️ **Cảnh báo** | Deployment bật **Vercel Authentication (Deployment Protection)** → người ngoài phải đăng nhập Vercel mới mở được URL. Muốn public cần tắt tại *Project Settings → Deployment Protection* (Agent 1/người dùng quyết định). |

**Kết luận T-006:** cả **3/3 nhiệm vụ ĐẠT** (Chrome DevTools 0 lỗi · GitHub push OK · Vercel deploy READY).

---

## KẾT QUẢ QA SPRINT 3 (T-008 — Giai đoạn 3, 2026-10-16)

### 1) Số lỗi Console

| Hạng mục | Kết quả |
| --- | --- |
| **Số lỗi Console** | **0** — không `ReferenceError`, `SyntaxError`, lỗi Web Audio API, không cảnh báo autoplay, không 404 |
| Phạm vi | Desktop (`http://localhost:8080/`) và Mobile emulation (iPhone 14 390×844). Trang lồng `/snake/` cũng sạch |
| Web Audio | `AudioContext.state = running`, `sampleRate = 48000`; không có thông báo autoplay (nhạc chỉ phát **sau tương tác đầu tiên**) |
| Network | 7 tài nguyên app đều `200`/`304`; **không** request `bgm.mp3` và **không** 404 |
| Ghi chú | Bộ đo pixel của QA dùng canvas phụ `getContext('2d', {willReadFrequently:true})` nên **không** sinh cảnh báo như T-006 |

### 2) Test wrap 4 cạnh — Màn 1 (Classic, `wrap = true`)

| Tiêu chí | Kết quả |
| --- | --- |
| Cơ chế đo | Lọc pixel "rắn" (G≥120, G>R+40, G>B+20) → **run liên tiếp ngang/dọc lớn nhất**, quy ra **ô** (CELL = 24 px logic) |
| **Cạnh Phải** | run ngang **2.97 ô**, dọc 1.13 ô | 
| **Cạnh Trên** | run dọc **2.97 ô**, ngang 1.83 ô | 
| **Cạnh Trái** | run ngang **2.50 ô**, dọc 2.03 ô | 
| **Cạnh Dưới** | run ngang **2.83 ô**, dọc 1.93 ô | 
| Ngưỡng "lỗi" | Lỗi cũ (vệt xuyên màn) cho run **~19–20 ô**. Kết quả quan sát **≤ 2.97 ô ≈ đúng thân rắn (3 ô)** ⇒ **KHÔNG có vệt kéo dài** | 
| Rắn đi xuyên qua **đường nối** | Bộ dò "chạm cả 2 bờ" tự đóng băng & chụp ảnh: `t008_wrap_right.png` (vắt ngang, hàng y≈10), `t008_wrap_top.png`, `t008_wrap_bottom.png` (vắt dọc) — thân rắn ở **cả 2 mép**, **không** đường băng giữa |
| **Chiều dài rắn** | Bất biến `len === 3 + score` đúng **mọi bước**, **0 vi phạm** (`step()` vẫn `pop()` khi chỉ wrap, không cộng dồn đốt) |
| Stress tất định | 2 lượt × **5000 bước** (đi thẳng ngang & dọc trên `logic.js`) = **250 wrap/lượt**, **0 vi phạm** chiều dài, `maxLen = 3` |
| **Kết luận** | **PASS** |

### 3) D-Pad Mobile (iPhone 14 — 390×844)

| Nút bấm | `state.dir` trước → sau | Đầu rắn | Kết quả |
| --- | --- | --- | --- |
| **Lên** | `(1,0) → (0,-1)` | `(18,10) → (19,4)` | ✔ |
| **Trái** | `(0,-1) → (-1,0)` | `(19,2) → (13,1)` | ✔ |
| **Xuống** | `(-1,0) → (0,1)` | `(12,1) → (11,8)` | ✔ |
| **Phải** | `(0,1) → (1,0)` | `(11,9) → (18,10)` | ✔ |
| **Đường cảm ứng** | `TouchEvent('touchstart')` trên nút "Lên" → `defaultPrevented = true`, class lún `is-active`, dir → `(0,-1)` | — | ✔ |
| **Layout `100dvh`** | `innerHeight 844` = `scrollHeight 844` = `844` ⇒ **không cuộn** (`scrollable=false`); `.pad` hiện, `.controls` ẩn; canvas backing `960×960` / CSS `377×377`; 4/4 nút `.dbtn` | — | ✔ |
| **Kết luận** | Đổi hướng **nhạy + chính xác 4/4** nút, touch path chuẩn | | **PASS** |

### 4) Nhạc nền (BGM)

| Hạng mục | Kết quả |
| --- | --- |
| Nguồn nhạc | Thẻ `<audio id="bgm" loop>` **không có `src`** + dự án **không có** `bgm.mp3` → dùng **fallback synth "Sugarsweet"** (chạy đúng như thiết kế) |
| Bằng chứng phát nhạc | **61 oscillator** được tổng hợp (hook `createOscillator`), `AudioContext.state = running`, `sampleRate = 48000` |
| Cờ trạng thái | `isBgmEnabled() = true`, `isMuted() = false` |
| 404 | **Không** có request file nhạc ⇒ **không 404** |
| Console | **0 lỗi** (không lỗi Web Audio) |
| **Kết luận** | **PASS** |

### 5) GitHub & Vercel (DevOps)

| Hạng mục | Giá trị |
| --- | --- |
| Commit message | `fix: screen-wrap stretching bug, add sugarsweet BGM and handheld mobile controls` |
| **Commit hash** | **`ef0d0e66e5740207c615154239d5845969588d9a`** (short `ef0d0e6`) — 7 file, +969 / −46 |
| Nhánh / Push | `main`, `728af5b..ef0d0e6 main -> main`; `git ls-remote` khớp local |
| **GitHub URL** | https://github.com/PhuocThanh22/snak |
| **Vercel Production URL** | **https://test-lime-seven-18.vercel.app** |
| Deployment ID | `dpl_DdLnBkE1G7fcXzpJDFcMdeqTj7wk` — `readyState = READY` |
| URL trực tiếp / Inspector | https://test-dl044r5t3-phuoc-thanh.vercel.app · https://vercel.com/phuoc-thanh/test/DdLnBkE1G7fcXzpJDFcMdeqTj7wk |
| Kiểm chứng production | `/` 200 (4795 B: có `bgmBtn`, `bgm`, `pad`, `dbtn--up/down`, `data-action="pause"`); `/snake/game.js` 200 (23388 B: `wrapDelta`, `buildSnakePath`); `/snake/audio.js` 200 (11282 B: `BGM_MELODY`, `startBgm`) |
| ⚠️ Cảnh báo | Deployment bật **Vercel Authentication (Deployment Protection)** → cần đăng nhập Vercel để truy cập công khai |

### Kết luận Sprint 3

- **QA PASS** toàn bộ: **0 lỗi Console**, wrap **4/4 cạnh hết vệt kéo dài** + giữ đúng chiều dài, **D-Pad mobile 4/4 chính xác**, **BGM synth phát**, **`100dvh` không cuộn**.
- Regression: `node --check` 7 file JS → OK; `node test/logic.test.js` → **50/50**; `node test/qa.test.js` → **16/16**.
- **Hành động:** **T-008 = `Done`**; **T-007 = `QA Pass`** và **đề xuất Agent 1 duyệt `Done`** (Agent 1 giữ quyền quyết định cuối cùng). Bằng chứng ảnh: `t008_wrap_right.png`, `t008_wrap_top.png`, `t008_wrap_bottom.png`, `t008_mobile_play.png`.

### Duyệt cuối của Agent 1 (2026-10-16)

- **T-007 = `Done`**, **T-008 = `Done`** (Agent 1 đã xác minh độc lập — xem dòng nhật ký cuối).
- **Commit bàn giao:** `ef0d0e6` — `fix: screen-wrap stretching bug, add sugarsweet BGM and handheld mobile controls`.
- **GitHub:** https://github.com/PhuocThanh22/snak (nhánh `main`).
- **Vercel Production:** https://test-lime-seven-18.vercel.app — xác minh **HTTP 200**, phục vụ bản mới (có D-Pad, nút BGM, `wrapDelta`).
- **Lưu ý cho khách hàng:** Vercel đang bật **Deployment Protection (Vercel Authentication)**. Alias production `test-lime-seven-18.vercel.app` vẫn truy cập công khai (đã kiểm chứng 200); URL deployment trực tiếp (`test-dl044r5t3-…`) có thể yêu cầu đăng nhập Vercel. Nếu muốn tắt: Vercel → Project `test` → Settings → Deployment Protection → Disabled.
