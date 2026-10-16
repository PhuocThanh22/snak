/*
 * test/qa.test.js — Bộ test QA độc lập (Agent 3) cho snake/logic.js.
 *
 * Mục đích: kiểm tra các CASE BIÊN mà test/logic.test.js chưa phủ, và
 * tái hiện các nghi vấn lỗi logic. Không dùng thư viện ngoài.
 *
 * Chạy:  node test/qa.test.js
 *   - Nhóm "edge"  : hành vi ĐÚNG theo SPEC. Fail => lỗi thật.
 *   - Nhóm "defect": assert HÀNH VI ĐÚNG MONG ĐỢI. Nếu fail => tái hiện lỗi.
 *
 * Exit code 0 chỉ khi TẤT CẢ edge pass VÀ không còn defect nào.
 */
'use strict';

const assert = require('assert');
const path = require('path');

const Logic = require(path.join(__dirname, '..', 'snake', 'logic.js'));
const GRID = Logic.GRID;

let passed = 0;
let failed = 0;
let defectConfirmed = 0;
let defectFixed = 0;

const tests = [];

/**
 * Đăng ký test.
 * @param {string} name
 * @param {Function} fn
 * @param {boolean} [isDefect] true nếu test này assert hành vi đúng cho một lỗi đang nghi ngờ.
 */
function test(name, fn, isDefect) {
  tests.push({ name, fn, isDefect: !!isDefect });
}

function run() {
  for (const t of tests) {
    try {
      t.fn();
      if (t.isDefect) {
        defectFixed++;
        console.log('  \u2713 [BUG ĐÃ HẾT] ' + t.name);
      } else {
        passed++;
        console.log('  \u2713 ' + t.name);
      }
    } catch (err) {
      if (t.isDefect) {
        defectConfirmed++;
        console.log('  \u2717 [TÁI HIỆN LỖI] ' + t.name);
        console.log('      ' + (err && err.message ? err.message : err));
      } else {
        failed++;
        console.error('  \u2717 ' + t.name);
        console.error('      ' + (err && err.message ? err.message : err));
      }
    }
  }

  console.log('');
  console.log('Edge-case: ' + passed + ' pass, ' + failed + ' fail');
  console.log('Lỗi tái hiện: ' + defectConfirmed + ' (đã hết: ' + defectFixed + ')');

  if (failed > 0 || defectConfirmed > 0) {
    console.error('QA FAILED');
    process.exit(1);
  }
  console.log('ALL QA TESTS PASSED');
}

// ===========================================================================
// Helpers
// ===========================================================================

/** Rắn thẳng nằm ngang, đầu tại (hx,hy), hướng sang phải, không mồi. */
function straightSnake(hx, hy, len, dir) {
  const s = Logic.createGame();
  s.snake = [];
  for (let i = 0; i < len; i++) s.snake.push({ x: hx - i, y: hy });
  s.dir = dir || { x: 1, y: 0 };
  s.food = null;
  return s;
}

function foodOnSnake(s) {
  return s.snake.some((c) => s.food && c.x === s.food.x && c.y === s.food.y);
}

// ===========================================================================
// Nhóm EDGE — hành vi đúng theo SPEC
// ===========================================================================

// --- Ăn mồi sát tường -------------------------------------------------------

test('edge: ăn mồi ở sát tường phải (không bị coi là đâm tường)', () => {
  const s = straightSnake(GRID - 2, 5, 3, { x: 1, y: 0 });
  s.food = { x: GRID - 1, y: 5 };
  const len0 = s.snake.length;

  Logic.step(s);

  assert.strictEqual(s.gameOver, false, 'không được game over');
  assert.strictEqual(s.score, 1, 'score phải +1');
  assert.strictEqual(s.snake.length, len0 + 1, 'thân dài thêm 1');
  assert.strictEqual(s.snake[0].x, GRID - 1, 'đầu phải tới ô mồi sát tường');
  assert.strictEqual(foodOnSnake(s), false, 'mồi mới không được nằm trên thân');
});

test('edge: ăn mồi ở góc dưới-phải (19,19)', () => {
  const s = straightSnake(GRID - 2, GRID - 1, 3, { x: 1, y: 0 });
  s.food = { x: GRID - 1, y: GRID - 1 };

  Logic.step(s);

  assert.strictEqual(s.gameOver, false);
  assert.strictEqual(s.score, 1);
  assert.strictEqual(s.snake[0].x, GRID - 1);
  assert.strictEqual(s.snake[0].y, GRID - 1);
});

test('edge: ăn mồi sát tường rồi bước tiếp ra ngoài -> game over', () => {
  const s = straightSnake(GRID - 2, 5, 3, { x: 1, y: 0 });
  s.food = { x: GRID - 1, y: 5 };
  Logic.step(s); // ăn mồi tại (19,5)
  s.food = null; // chắc chắn bước sau không ăn
  Logic.step(s); // bước tiếp -> đâm tường

  assert.strictEqual(s.gameOver, true, 'phải game over khi bước ra ngoài lưới');
});

// --- Đổi hướng hợp lệ -------------------------------------------------------

// SỬA (Agent 3, sau khi Agent 1 chốt fix B-001): bản cũ gọi 3 lần setDirection
// LIÊN TIẾP mà KHÔNG có step() ở giữa. Chuỗi "Phải -> Xuống -> Trái" khi rắn
// CHƯA thực sự di chuyển chính là cú quay đầu 180° so với hướng di chuyển thực
// tế {1,0} (vì chỉ đổi hướng suông, rắn chưa hề đi sang phải rồi xuống). Luật
// B-001 yêu cầu CHẶN cú quay đầu này, nên kỳ vọng cũ (cho rằng cả 3 lần đều
// hợp lệ) là SAI. Ở đây chèn step() giữa các lần đổi hướng để mỗi tick chỉ còn
// là một cú quay 90° hợp lệ.
test('edge: chuỗi quay 90° hợp lệ khi có step() giữa các tick (phải -> xuống -> trái -> lên)', () => {
  const s = Logic.createGame(); // dir {1,0}, lastMoveDir {1,0}
  s.food = null; // tránh ăn mồi làm nhiễu đường đi

  Logic.setDirection(s, { x: 0, y: 1 }); // phải -> xuống (90°)
  assert.deepStrictEqual(s.dir, { x: 0, y: 1 });
  Logic.step(s);

  Logic.setDirection(s, { x: -1, y: 0 }); // xuống -> trái (90°)
  assert.deepStrictEqual(s.dir, { x: -1, y: 0 });
  Logic.step(s);

  Logic.setDirection(s, { x: 0, y: -1 }); // trái -> lên (90°)
  assert.deepStrictEqual(s.dir, { x: 0, y: -1 });
  Logic.step(s);

  assert.strictEqual(s.gameOver, false, 'chuỗi quay 90° hợp lệ không được gây game over');
});

// Ghi nhận đúng hành vi mới: nhiều phím trong CÙNG 1 tick thì cú quay đầu 180°
// so với hướng di chuyển thực tế bị chặn (bổ trợ cho các test D-001/D-001b).
test('edge: không có step() giữa các tick thì cú quay đầu 180° bị chặn', () => {
  const s = Logic.createGame(); // dir {1,0}, lastMoveDir {1,0}
  Logic.setDirection(s, { x: 0, y: 1 }); // xuống — hợp lệ (vuông góc)
  Logic.setDirection(s, { x: -1, y: 0 }); // trái — NGƯỢC hướng thực tế {1,0} -> phải bị chặn
  assert.deepStrictEqual(s.dir, { x: 0, y: 1 }, 'phải giữ hướng xuống, không cho quay đầu');
});

test('edge: chặn quay đầu 180° cho cả 4 cặp hướng', () => {
  const pairs = [
    [{ x: 1, y: 0 }, { x: -1, y: 0 }],
    [{ x: -1, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: 1 }, { x: 0, y: -1 }],
    [{ x: 0, y: -1 }, { x: 0, y: 1 }]
  ];
  for (const [start, reverse] of pairs) {
    const s = Logic.createGame();
    s.dir = { x: start.x, y: start.y };
    Logic.setDirection(s, reverse);
    assert.deepStrictEqual(s.dir, start, 'phải giữ nguyên hướng, không quay đầu');
  }
});

test('edge: setDirection loại vector không hợp lệ', () => {
  const s = Logic.createGame();
  const before = { x: s.dir.x, y: s.dir.y };
  Logic.setDirection(s, { x: 0, y: 0 });
  Logic.setDirection(s, { x: 1, y: 1 });
  Logic.setDirection(s, { x: 2, y: 0 });
  Logic.setDirection(s, { x: 0, y: -2 });
  Logic.setDirection(s, null);
  Logic.setDirection(s, {});
  assert.deepStrictEqual(s.dir, before, 'dir phải giữ nguyên với các vector sai');
});

// --- Mồi không sinh trùng thân rắn -----------------------------------------

test('edge: spawnFood không bao giờ trùng thân với nhiều rng khác nhau', () => {
  const rngs = [() => 0, () => 0.1, () => 0.5, () => 0.9, () => 0.999999];
  for (const rng of rngs) {
    for (let i = 0; i < 25; i++) {
      const s = Logic.createGame();
      Logic.spawnFood(s, rng);
      assert.strictEqual(foodOnSnake(s), false, 'mồi trùng thân rắn');
    }
  }
});

test('edge: spawnFood trả null và food=null khi hết ô trống', () => {
  const s = Logic.createGame();
  s.snake = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) s.snake.push({ x: x, y: y });
  }
  const r = Logic.spawnFood(s, () => 0);
  assert.strictEqual(r, null, 'phải trả null');
  assert.strictEqual(s.food, null, 'state.food phải là null');
});

test('edge: spawnFood tất định — rng=0 luôn chọn ô trống đầu tiên (0,0)', () => {
  const s = Logic.createGame();
  const f = Logic.spawnFood(s, () => 0);
  assert.deepStrictEqual(f, { x: 0, y: 0 });
});

// --- Luật đuôi / tự cắn -----------------------------------------------------

test('edge: bước vào ô đuôi khi KHÔNG ăn thì được phép (đuôi rời đi)', () => {
  const s = Logic.createGame();
  s.snake = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 5 } // đuôi
  ];
  s.dir = { x: 1, y: 0 }; // next = (6,5) = đuôi
  s.food = null;

  Logic.step(s);

  assert.strictEqual(s.gameOver, false, 'không được chết khi đi vào ô đuôi đang rời đi');
  assert.strictEqual(s.snake.length, 4, 'độ dài giữ nguyên');
});

test('edge: khi ĂN, bước vào ô đuôi (đuôi đứng yên) vẫn là tự cắn', () => {
  const s = Logic.createGame();
  s.snake = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 5 } // đuôi
  ];
  s.dir = { x: 1, y: 0 };
  s.food = { x: 6, y: 5 }; // mồi trùng ô đuôi (giả lập cưỡng bức)

  Logic.step(s);

  assert.strictEqual(s.gameOver, true, 'ăn mà đâm vào đuôi đứng yên phải là tự cắn');
});

test('edge: bước vào ô thân giữa (không phải đuôi) -> tự cắn', () => {
  const s = Logic.createGame();
  s.snake = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 5 }
  ];
  s.dir = { x: 0, y: 1 }; // next = (5,6) = thân giữa
  s.food = null;

  Logic.step(s);
  assert.strictEqual(s.gameOver, true, 'đâm vào thân giữa phải game over');
});

// --- Trạng thái đóng băng ---------------------------------------------------

test('edge: gameOver=true thì step không đổi state', () => {
  const s = Logic.createGame();
  s.gameOver = true;
  const snap = JSON.stringify(s);
  Logic.step(s);
  assert.strictEqual(JSON.stringify(s), snap);
});

test('edge: paused=true thì step không đổi state', () => {
  const s = Logic.createGame();
  s.paused = true;
  const snap = JSON.stringify(s);
  Logic.step(s);
  assert.strictEqual(JSON.stringify(s), snap);
});

// --- Bất biến lưới ----------------------------------------------------------

test('edge: sau nhiều bước ngẫu nhiên, đầu rắn luôn nằm trong lưới (khi chưa gameOver)', () => {
  for (let trial = 0; trial < 200; trial++) {
    const s = Logic.createGame();
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    for (let k = 0; k < 40 && !s.gameOver; k++) {
      if (Math.random() < 0.5) {
        Logic.setDirection(s, dirs[Math.floor(Math.random() * 4)]);
      }
      Logic.step(s);
      if (!s.gameOver) {
        const h = s.snake[0];
        assert.ok(h.x >= 0 && h.x < GRID && h.y >= 0 && h.y < GRID, 'đầu ra ngoài lưới');
        assert.ok(Number.isInteger(h.x) && Number.isInteger(h.y), 'toạ độ đầu phải là số nguyên');
      }
    }
  }
});

// ===========================================================================
// Nhóm DEFECT — tái hiện lỗi nghi ngờ (assert hành vi ĐÚNG MONG ĐỢI)
// ===========================================================================

// D-001: Hai lần đổi hướng trong cùng một tick tạo cú quay đầu 180°.
test(
  '[D-001] 2 lần đổi hướng trong 1 tick phải bị chặn quay đầu (đang đi phải, bấm Lên rồi Trái)',
  () => {
    const s = Logic.createGame(); // dir {1,0}, đầu (10,10), thân (9,10),(8,10)
    s.food = null;

    Logic.setDirection(s, { x: 0, y: -1 }); // Lên — hợp lệ
    Logic.setDirection(s, { x: -1, y: 0 }); // Trái — NGƯỢC hướng đang di chuyển thực tế {1,0}

    assert.notStrictEqual(
      s.dir.x,
      -1,
      'dir đã bị đảo thành Trái (ngược hướng di chuyển thực tế) — chặn 180° bị vô hiệu'
    );
  },
  true
);

// D-001b: hệ quả của D-001 — step() cho rắn đâm vào cổ chính nó.
test(
  '[D-001b] hệ quả D-001: step() ngay sau đó khiến rắn tự cắn cổ (game over oan)',
  () => {
    const s = Logic.createGame();
    s.food = null;
    Logic.setDirection(s, { x: 0, y: -1 });
    Logic.setDirection(s, { x: -1, y: 0 });
    Logic.step(s);
    assert.strictEqual(
      s.gameOver,
      false,
      'rắn chết oan vì cú quay đầu 2 phím trong cùng 1 tick không bị chặn'
    );
  },
  true
);

// D-002: setDirection chấp nhận vector không phải đơn vị theo trục (tổng |x|+|y| = 1 nhưng lệch trục).
test(
  '[D-002] setDirection phải loại vector chéo không hợp lệ {0.5, 0.5}',
  () => {
    const s = Logic.createGame();
    const before = { x: s.dir.x, y: s.dir.y };
    Logic.setDirection(s, { x: 0.5, y: 0.5 });
    assert.deepStrictEqual(
      s.dir,
      before,
      'đã chấp nhận {0.5,0.5} — vector không đơn vị, sẽ tạo toạ độ không nguyên'
    );
  },
  true
);

// D-002b: hệ quả của D-002 — toạ độ đầu rắn trở thành số không nguyên.
test(
  '[D-002b] hệ quả D-002: sau khi nạp dir chéo lệch trục, toạ độ đầu rắn không còn nguyên',
  () => {
    const s = Logic.createGame();
    s.food = null;
    Logic.setDirection(s, { x: 0.5, y: 0.5 });
    Logic.step(s);
    const h = s.snake[0];
    assert.ok(
      Number.isInteger(h.x) && Number.isInteger(h.y),
      'đầu rắn rời khỏi lưới ô vuông: toạ độ = ' + h.x + ',' + h.y
    );
  },
  true
);

run();
