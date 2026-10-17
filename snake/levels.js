/*
 * snake/levels.js — Định nghĩa 3 màn chơi (GIAI ĐOẠN 2).
 *
 * Là DỮ LIỆU thuần, không đụng DOM. Export UMD:
 *   - Node:        const Levels = require('./levels.js');
 *   - Trình duyệt: biến toàn cục `SnakeLevels`.
 *
 * Mỗi màn cung cấp:
 *   { id, key, name, description, wrap, obstacles, speed, minSpeed, accent, accent2, food }
 *   - wrap:      đi xuyên biên?
 *   - obstacles: mảng ô {x,y} chướng ngại vật tĩnh
 *   - speed:     số ms mỗi bước ở điểm 0 (nhỏ hơn = nhanh hơn)
 *   - minSpeed:  sàn ms/bước (nhanh nhất có thể khi điểm cao) — SPRINT 4
 *   - accent/accent2/food: bảng màu Neon để đổi màu theo màn
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeLevels = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var GRID = 20;

  /** Hình chữ nhật gồm các ô trong lưới. */
  function rect(x, y, w, h) {
    var out = [];
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        out.push({ x: x + i, y: y + j });
      }
    }
    return out;
  }

  /**
   * Bố cục Maze: 4 khối 2x2 ở bốn góc trong + 2 thanh ngang tạo lối đi.
   * Đã kiểm tra KHÔNG trùng thân rắn xuất phát (hàng y = 10).
   */
  function mazeObstacles() {
    var out = [];
    out = out.concat(rect(6, 6, 2, 2));
    out = out.concat(rect(12, 6, 2, 2));
    out = out.concat(rect(6, 12, 2, 2));
    out = out.concat(rect(12, 12, 2, 2));
    out = out.concat(rect(8, 8, 4, 1));
    out = out.concat(rect(8, 11, 4, 1));
    return out;
  }

  // Thứ tự trong mảng cũng là thứ tự hiển thị trên menu.
  var LEVELS = [
    {
      id: 1,
      key: 'classic',
      name: 'Classic',
      description: 'Không tường — đi xuyên biên',
      wrap: true,
      obstacles: [],
      // SPRINT 4: vào màn nhanh hơn (140 → 110), sàn 62ms.
      speed: 110,
      minSpeed: 62,
      accent: '#39ff14',
      accent2: '#0aff9d',
      food: '#ff2e88'
    },
    {
      id: 2,
      key: 'boxed',
      name: 'Boxed',
      description: 'Tường bao 4 cạnh',
      wrap: false,
      obstacles: [],
      // SPRINT 4: vào màn nhanh hơn (122 → 100), sàn 58ms.
      speed: 100,
      minSpeed: 58,
      accent: '#00e5ff',
      accent2: '#4d7cff',
      food: '#ffd166'
    },
    {
      id: 3,
      key: 'maze',
      name: 'Maze',
      description: 'Chướng ngại vật ở giữa — nhanh hơn',
      wrap: false,
      obstacles: mazeObstacles(),
      // SPRINT 4: vào màn nhanh hơn (104 → 90), sàn 55ms.
      speed: 90,
      minSpeed: 55,
      accent: '#ff2e88',
      accent2: '#b14bff',
      food: '#39ff14'
    }
  ];

  /** Lấy cấu hình màn theo id (mặc định về màn 1). */
  function getLevel(id) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === id) return LEVELS[i];
    }
    return LEVELS[0];
  }

  /** Tạo object config truyền thẳng vào `Logic.createGame(config)`. */
  function createGameConfig(id) {
    var lv = getLevel(id);
    return {
      cols: GRID,
      rows: GRID,
      wrap: lv.wrap,
      obstacles: lv.obstacles,
      level: lv.id,
      speed: lv.speed
    };
  }

  return {
    GRID: GRID,
    LEVELS: LEVELS,
    getLevel: getLevel,
    createGameConfig: createGameConfig
  };
});
