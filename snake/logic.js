/*
 * snake/logic.js — Toàn bộ luật chơi Rắn săn mồi.
 *
 * File này là LOGIC THUẦN: tuyệt đối KHÔNG phụ thuộc vào môi trường trình
 * duyệt hay bất kỳ API DOM nào. Nhờ vậy nó chạy được cả trên trình duyệt
 * (qua thẻ <script>) lẫn trên Node (qua `require()`).
 *
 * Export kiểu UMD/CommonJS:
 *   - Node:        const Logic = require('./logic.js');
 *   - Trình duyệt: biến toàn cục `SnakeLogic` (gắn vào globalThis)
 *
 * Hỗ trợ cấu hình theo màn (GIAI ĐOẠN 2):
 *   createGame({ cols, rows, wrap, obstacles, level, speed })
 *   - wrap:      true  → đi xuyên biên (Classic)
 *   - obstacles: mảng ô {x,y} là chướng ngại vật tĩnh (Maze)
 *   - cols/rows: kích thước lưới (mặc định 20x20)
 *   API cũ `createGame()` KHÔNG tham số vẫn giữ nguyên hành vi (không wrap).
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeLogic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /** Số ô mỗi cạnh của lưới vuông (mặc định). */
  var GRID = 20;

  /** Khoá duy nhất cho một ô, dùng để so trùng nhanh bằng Set/Map. */
  function cellKey(cell) {
    return cell.x + ',' + cell.y;
  }

  /** Hai ô có trùng nhau hay không. */
  function sameCell(a, b) {
    return !!a && !!b && a.x === b.x && a.y === b.y;
  }

  /** Chuẩn hoá danh sách chướng ngại vật (chỉ nhận ô có toạ độ số). */
  function normalizeObstacles(list) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c && typeof c.x === 'number' && typeof c.y === 'number') {
        out.push({ x: c.x, y: c.y });
      }
    }
    return out;
  }

  /**
   * Tạo trạng thái game mới.
   * @param {object} [config] cấu hình theo màn: {cols, rows, wrap, obstacles, level, speed}
   * @returns {object} state
   */
  function createGame(config) {
    config = config || {};

    var cols = config.cols || GRID;
    var rows = config.rows || GRID;
    var wrap = !!config.wrap;
    var obstacles = normalizeObstacles(config.obstacles);
    var level = config.level != null ? config.level : 1;
    var speed = typeof config.speed === 'number' ? config.speed : null;

    var midY = Math.floor(rows / 2);
    var midX = Math.floor(cols / 2);
    var snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];

    var state = {
      snake: snake,
      dir: { x: 1, y: 0 }, // hướng điều khiển hiện tại (có thể vừa được đổi trong tick)
      // Hướng DI CHUYỂN THỰC TẾ của bước trước. Đây mới là mốc để chặn quay đầu
      // 180°, vì `dir` có thể bị đổi nhiều lần giữa 2 lần `step()`.
      lastMoveDir: { x: 1, y: 0 },
      food: null,
      score: 0,
      gameOver: false,
      paused: false,
      // --- cấu hình theo màn (GIAI ĐOẠN 2) ---
      cols: cols,
      rows: rows,
      wrap: wrap,
      obstacles: obstacles,
      level: level,
      speed: speed
    };

    spawnFood(state);
    return state;
  }

  /** Bản đồ các ô đã bị chiếm (thân rắn + chướng ngại vật). */
  function blockedKeys(state) {
    var occ = Object.create(null);
    var i;
    for (i = 0; i < state.snake.length; i++) {
      occ[cellKey(state.snake[i])] = true;
    }
    var obs = state.obstacles || [];
    for (i = 0; i < obs.length; i++) {
      occ[cellKey(obs[i])] = true;
    }
    return occ;
  }

  /** Danh sách mọi ô chưa bị rắn hoặc chướng ngại vật chiếm. */
  function emptyCells(state) {
    var occ = blockedKeys(state);
    var cols = state.cols || GRID;
    var rows = state.rows || GRID;

    var cells = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (!occ[x + ',' + y]) cells.push({ x: x, y: y });
      }
    }
    return cells;
  }

  /** Ô có phải chướng ngại vật tĩnh không. */
  function isObstacle(state, cell) {
    var obs = state.obstacles;
    if (!obs) return false;
    for (var i = 0; i < obs.length; i++) {
      if (sameCell(cell, obs[i])) return true;
    }
    return false;
  }

  /**
   * Sinh mồi tại một ô trống ngẫu nhiên (không trùng rắn / chướng ngại vật).
   * @param {object} state
   * @param {function} [rng] Hàm sinh số ngẫu nhiên trong [0,1). Nhận vào để test tất định.
   * @returns {{x:number,y:number}|null} Vị trí mồi, hoặc null nếu hết ô trống (thắng).
   */
  function spawnFood(state, rng) {
    if (typeof rng !== 'function') rng = Math.random;

    var cells = emptyCells(state);
    if (cells.length === 0) {
      state.food = null;
      return null;
    }

    var i = Math.floor(rng() * cells.length);
    if (i < 0) i = 0;
    if (i >= cells.length) i = cells.length - 1;

    state.food = { x: cells[i].x, y: cells[i].y };
    return state.food;
  }

  /** Hai vector có ngược chiều (180°) nhau không. */
  function isOpposite(a, b) {
    return !!a && !!b && a.x === -b.x && a.y === -b.y;
  }

  /**
   * Đổi hướng di chuyển. Bỏ qua nếu không hợp lệ hoặc là cú quay đầu 180°.
   *
   * Quy tắc (sửa B-001 + B-002):
   *  - Chỉ nhận vector có TỪNG thành phần là SỐ NGUYÊN ∈ {-1,0,1} và
   *    |x| + |y| === 1 (loại bỏ {0.5,0.5}, {2,0}, ...).            [B-002]
   *  - Chặn quay đầu 180° so với CẢ `state.dir` lẫn `lastMoveDir`
   *    (hướng di chuyển THỰC TẾ của bước trước). Nhờ vậy nhiều phím bấm
   *    trong cùng một tick (chưa `step()`) không thể tạo cú quay đầu. [B-001]
   * @returns {object} chính state (đã cập nhật nếu hợp lệ)
   */
  function setDirection(state, dir) {
    if (!dir || typeof dir.x !== 'number' || typeof dir.y !== 'number') return state;

    // B-002: từng thành phần phải là số nguyên ∈ {-1, 0, 1}.
    if (!Number.isInteger(dir.x) || !Number.isInteger(dir.y)) return state;
    if (Math.abs(dir.x) + Math.abs(dir.y) !== 1) return state;

    // B-001: chặn quay đầu 180° so với hướng điều khiển hiện tại VÀ hướng
    // di chuyển thực tế của bước trước.
    if (isOpposite(dir, state.dir)) return state;
    if (isOpposite(dir, state.lastMoveDir)) return state;

    state.dir = { x: dir.x, y: dir.y };
    return state;
  }

  /** Bọc toạ độ vào trong lưới (dùng cho chế độ wrap-around). */
  function wrapCoord(value, size) {
    return ((value % size) + size) % size;
  }

  /**
   * Tiến 1 bước. Cập nhật TRỰC TIẾP trên state và trả về chính state đó.
   * - Di chuyển rắn theo `dir`.
   * - Chế độ `wrap`: đi xuyên biên; ngược lại đâm tường = Game Over.
   * - Đâm chướng ngại vật = Game Over.
   * - Ăn mồi → tăng `score`, dài thêm 1 ô, sinh mồi mới.
   * - Tự cắn thân → `gameOver = true`.
   * @param {object} state
   * @returns {object} state
   */
  function step(state) {
    if (state.gameOver || state.paused) return state;
    if (!state.dir) return state;

    var cols = state.cols || GRID;
    var rows = state.rows || GRID;
    var head = state.snake[0];
    var next = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    if (state.wrap) {
      next.x = wrapCoord(next.x, cols);
      next.y = wrapCoord(next.y, rows);
    } else if (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows) {
      state.gameOver = true;
      return state;
    }

    // Chướng ngại vật tĩnh.
    if (isObstacle(state, next)) {
      state.gameOver = true;
      return state;
    }

    var eating = sameCell(next, state.food);

    // Tự cắn thân. Khi KHÔNG ăn mồi, đuôi sẽ rời ô ngay sau bước này,
    // nên ô đuôi hiện tại không tính là va chạm.
    var body = eating ? state.snake : state.snake.slice(0, state.snake.length - 1);
    for (var i = 0; i < body.length; i++) {
      if (sameCell(next, body[i])) {
        state.gameOver = true;
        return state;
      }
    }

    // Di chuyển.
    state.snake.unshift(next);
    if (eating) {
      state.score += 1;
      spawnFood(state);
    } else {
      state.snake.pop();
    }

    // Ghi nhận hướng đã di chuyển thực tế — mốc chặn quay đầu cho tick sau.
    state.lastMoveDir = { x: state.dir.x, y: state.dir.y };

    return state;
  }

  return {
    GRID: GRID,
    createGame: createGame,
    step: step,
    setDirection: setDirection,
    spawnFood: spawnFood,
    isObstacle: isObstacle,
    // tiện ích phụ (không bắt buộc theo spec nhưng hữu ích cho QA)
    cellKey: cellKey,
    sameCell: sameCell
  };
});
