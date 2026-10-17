/*
 * test/logic.test.js — Test Node cho snake/logic.js (không dùng thư viện ngoài).
 *
 * Chạy:  node test/logic.test.js
 * Khi tất cả pass: in "ALL TESTS PASSED" và exit code 0.
 * Khi có test fail: in lỗi và exit code 1.
 */
'use strict';

const assert = require('assert');
const path = require('path');

const Logic = require(path.join(__dirname, '..', 'snake', 'logic.js'));
const Levels = require(path.join(__dirname, '..', 'snake', 'levels.js'));
const Audio = require(path.join(__dirname, '..', 'snake', 'audio.js'));
const Particles = require(path.join(__dirname, '..', 'snake', 'particles.js'));

const GRID = Logic.GRID;

let passed = 0;
let failed = 0;
const tests = [];

/** Đăng ký một test. */
function test(name, fn) {
  tests.push({ name, fn });
}

/** Chạy tất cả test đã đăng ký. */
function run() {
  for (const t of tests) {
    try {
      t.fn();
      passed++;
      console.log('  \u2713 ' + t.name);
    } catch (err) {
      failed++;
      console.error('  \u2717 ' + t.name);
      console.error('      ' + (err && err.message ? err.message : err));
    }
  }

  console.log('');
  console.log('Kết quả: ' + passed + ' pass, ' + failed + ' fail');

  if (failed > 0) {
    console.error('SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('ALL TESTS PASSED');
}

// ---------------------------------------------------------------------------
// 1) createGame()
// ---------------------------------------------------------------------------

test('createGame: rắn khởi tạo có độ dài >= 3', () => {
  const s = Logic.createGame();
  assert.ok(Array.isArray(s.snake), 'snake phải là mảng');
  assert.ok(s.snake.length >= 3, 'độ dài rắn phải >= 3, nhận ' + s.snake.length);
});

test('createGame: score = 0 và gameOver = false', () => {
  const s = Logic.createGame();
  assert.strictEqual(s.score, 0, 'score phải bằng 0');
  assert.strictEqual(s.gameOver, false, 'gameOver phải là false');
  assert.strictEqual(s.paused, false, 'paused phải là false');
});

test('createGame: có dir và food hợp lệ', () => {
  const s = Logic.createGame();
  assert.ok(s.dir && typeof s.dir.x === 'number' && typeof s.dir.y === 'number', 'dir hợp lệ');
  assert.ok(s.food && typeof s.food.x === 'number' && typeof s.food.y === 'number', 'phải có food');
});

test('createGame: đầu rắn nằm trong lưới', () => {
  const s = Logic.createGame();
  const head = s.snake[0];
  assert.ok(head.x >= 0 && head.x < GRID, 'head.x trong lưới');
  assert.ok(head.y >= 0 && head.y < GRID, 'head.y trong lưới');
});

test('createGame: food không nằm trên thân rắn', () => {
  for (let i = 0; i < 50; i++) {
    const s = Logic.createGame();
    const onSnake = s.snake.some((c) => c.x === s.food.x && c.y === s.food.y);
    assert.strictEqual(onSnake, false, 'food trùng thân rắn');
  }
});

// ---------------------------------------------------------------------------
// 2) step() — di chuyển
// ---------------------------------------------------------------------------

test('step: đầu rắn di chuyển đúng theo dir (sang phải)', () => {
  const s = Logic.createGame();
  s.food = { x: 0, y: 0 }; // để xa, tránh ăn nhầm
  const head = s.snake[0];
  const expected = { x: head.x + 1, y: head.y };

  Logic.step(s);

  assert.strictEqual(s.snake[0].x, expected.x, 'head.x phải +1');
  assert.strictEqual(s.snake[0].y, expected.y, 'head.y giữ nguyên');
});

test('step: không ăn mồi thì độ dài rắn không đổi', () => {
  const s = Logic.createGame();
  s.food = { x: 0, y: 0 };
  const len = s.snake.length;
  Logic.step(s);
  assert.strictEqual(s.snake.length, len, 'độ dài phải giữ nguyên');
});

test('step: di chuyển lên trên theo dir {0,-1}', () => {
  const s = Logic.createGame();
  s.food = { x: 0, y: 0 };
  const head = s.snake[0];
  Logic.setDirection(s, { x: 0, y: -1 });
  Logic.step(s);
  assert.strictEqual(s.snake[0].x, head.x);
  assert.strictEqual(s.snake[0].y, head.y - 1);
});

// ---------------------------------------------------------------------------
// 3) step() — ăn mồi
// ---------------------------------------------------------------------------

test('step: ăn mồi → score tăng và thân dài thêm', () => {
  const s = Logic.createGame();
  const head = s.snake[0];
  s.dir = { x: 1, y: 0 };
  s.food = { x: head.x + 1, y: head.y };

  const lenBefore = s.snake.length;
  const scoreBefore = s.score;

  Logic.step(s);

  assert.strictEqual(s.score, scoreBefore + 1, 'score phải tăng 1');
  assert.strictEqual(s.snake.length, lenBefore + 1, 'thân phải dài thêm 1');
  assert.strictEqual(s.snake[0].x, head.x + 1, 'đầu phải tới ô mồi');
});

test('step: ăn mồi thì sinh mồi mới không nằm trên thân', () => {
  const s = Logic.createGame();
  const head = s.snake[0];
  s.dir = { x: 1, y: 0 };
  s.food = { x: head.x + 1, y: head.y };

  Logic.step(s);

  assert.ok(s.food, 'phải có mồi mới');
  const onSnake = s.snake.some((c) => c.x === s.food.x && c.y === s.food.y);
  assert.strictEqual(onSnake, false, 'mồi mới không được trùng thân');
});

// ---------------------------------------------------------------------------
// 4) step() — va chạm
// ---------------------------------------------------------------------------

test('step: va tường phải → gameOver = true', () => {
  const s = Logic.createGame();
  s.snake = [{ x: GRID - 1, y: 5 }];
  s.dir = { x: 1, y: 0 };
  s.food = null;

  Logic.step(s);

  assert.strictEqual(s.gameOver, true, 'phải game over khi đâm tường');
});

test('step: va tường trái → gameOver = true', () => {
  const s = Logic.createGame();
  s.snake = [{ x: 0, y: 5 }];
  s.dir = { x: -1, y: 0 };
  s.food = null;

  Logic.step(s);
  assert.strictEqual(s.gameOver, true);
});

test('step: va tường trên → gameOver = true', () => {
  const s = Logic.createGame();
  s.snake = [{ x: 5, y: 0 }];
  s.dir = { x: 0, y: -1 };
  s.food = null;

  Logic.step(s);
  assert.strictEqual(s.gameOver, true);
});

test('step: va tường dưới → gameOver = true', () => {
  const s = Logic.createGame();
  s.snake = [{ x: 5, y: GRID - 1 }];
  s.dir = { x: 0, y: 1 };
  s.food = null;

  Logic.step(s);
  assert.strictEqual(s.gameOver, true);
});

test('step: tự cắn thân → gameOver = true', () => {
  const s = Logic.createGame();
  // Rắn hình vuông, đầu (1,1) sẽ quay xuống cắn vào (1,2).
  s.snake = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 }
  ];
  s.dir = { x: 0, y: 1 };
  s.food = null;

  Logic.step(s);
  assert.strictEqual(s.gameOver, true, 'phải game over khi tự cắn thân');
});

test('step: gameOver rồi thì step không làm gì thêm', () => {
  const s = Logic.createGame();
  s.gameOver = true;
  const snapshot = JSON.stringify(s.snake);
  Logic.step(s);
  assert.strictEqual(JSON.stringify(s.snake), snapshot, 'state không được đổi');
});

test('step: đang paused thì step không di chuyển', () => {
  const s = Logic.createGame();
  s.paused = true;
  s.food = { x: 0, y: 0 };
  const snapshot = JSON.stringify(s.snake);
  Logic.step(s);
  assert.strictEqual(JSON.stringify(s.snake), snapshot, 'paused thì không di chuyển');
});

// ---------------------------------------------------------------------------
// 5) setDirection()
// ---------------------------------------------------------------------------

test('setDirection: chặn quay đầu 180° (phải → trái)', () => {
  const s = Logic.createGame(); // dir mặc định {1,0}
  Logic.setDirection(s, { x: -1, y: 0 });
  assert.strictEqual(s.dir.x, 1, 'không được đổi sang trái');
  assert.strictEqual(s.dir.y, 0);
});

test('setDirection: chặn quay đầu 180° (lên → xuống)', () => {
  const s = Logic.createGame();
  Logic.setDirection(s, { x: 0, y: -1 });
  const before = { x: s.dir.x, y: s.dir.y };
  Logic.setDirection(s, { x: 0, y: 1 }); // ngược lại
  assert.deepStrictEqual(s.dir, before, 'không được quay đầu');
});

test('setDirection: đổi hướng hợp lệ được chấp nhận (có step() giữa các tick)', () => {
  const s = Logic.createGame(); // {1,0}
  Logic.setDirection(s, { x: 0, y: 1 }); // xuống — hợp lệ
  assert.strictEqual(s.dir.x, 0);
  assert.strictEqual(s.dir.y, 1);

  Logic.step(s); // hướng "xuống" trở thành hướng di chuyển thực tế

  Logic.setDirection(s, { x: -1, y: 0 }); // sang trái — hợp lệ sau 1 bước
  assert.strictEqual(s.dir.x, -1);
  assert.strictEqual(s.dir.y, 0);
});

test('setDirection: bỏ qua vector không hợp lệ', () => {
  const s = Logic.createGame();
  const before = { x: s.dir.x, y: s.dir.y };
  Logic.setDirection(s, { x: 0, y: 0 });
  Logic.setDirection(s, { x: 1, y: 1 });
  Logic.setDirection(s, null);
  assert.deepStrictEqual(s.dir, before, 'dir phải giữ nguyên');
});

// --- Hồi quy B-001 / B-002 ------------------------------------------------

test('B-001: 2 phím đổi hướng trong cùng 1 tick không tạo cú quay đầu 180°', () => {
  const s = Logic.createGame(); // dir {1,0}
  s.food = null;

  Logic.setDirection(s, { x: 0, y: -1 }); // Lên — hợp lệ
  Logic.setDirection(s, { x: -1, y: 0 }); // Trái — ngược hướng di chuyển thực tế {1,0}

  assert.notStrictEqual(s.dir.x, -1, 'phải chặn quay đầu 180°, dir không được thành Trái');
  Logic.step(s);
  assert.strictEqual(s.gameOver, false, 'rắn không được chết oan do quay đầu 2 phím/1 tick');
});

test('B-002: setDirection loại vector không nguyên {0.5,0.5}', () => {
  const s = Logic.createGame();
  const before = { x: s.dir.x, y: s.dir.y };

  Logic.setDirection(s, { x: 0.5, y: 0.5 }); // |x|+|y| === 1 nhưng không nguyên
  assert.deepStrictEqual(s.dir, before, '{0.5,0.5} phải bị loại');

  Logic.setDirection(s, { x: 0.3, y: 0.7 });
  assert.deepStrictEqual(s.dir, before, '{0.3,0.7} phải bị loại');
});

// ---------------------------------------------------------------------------
// 6) spawnFood()
// ---------------------------------------------------------------------------

test('spawnFood: tất định theo rng', () => {
  const s = Logic.createGame();
  const food = Logic.spawnFood(s, () => 0); // luôn chọn ô trống đầu tiên
  assert.ok(food, 'phải trả về vị trí mồi');
  assert.strictEqual(food.x, 0);
  assert.strictEqual(food.y, 0);
  assert.deepStrictEqual(s.food, food, 'state.food phải được cập nhật');
});

test('spawnFood: không bao giờ sinh trên thân rắn (nhiều rng)', () => {
  const rngs = [() => 0, () => 0.25, () => 0.5, () => 0.75, () => 0.999];
  for (const rng of rngs) {
    for (let i = 0; i < 20; i++) {
      const s = Logic.createGame();
      const food = Logic.spawnFood(s, rng);
      const onSnake = s.snake.some((c) => c.x === food.x && c.y === food.y);
      assert.strictEqual(onSnake, false, 'food trùng thân rắn');
    }
  }
});

test('spawnFood: rng trả về 1 vẫn không vượt mảng', () => {
  const s = Logic.createGame();
  const food = Logic.spawnFood(s, () => 1);
  assert.ok(food, 'vẫn phải trả về mồi hợp lệ');
  assert.ok(food.x >= 0 && food.x < GRID);
  assert.ok(food.y >= 0 && food.y < GRID);
});

// ---------------------------------------------------------------------------
// 7) Logic thuần — không được đụng tới DOM
// ---------------------------------------------------------------------------

test('logic.js: không tham chiếu DOM toàn cục', () => {
  const fs = require('fs');
  const src = fs.readFileSync(path.join(__dirname, '..', 'snake', 'logic.js'), 'utf8');
  assert.ok(!/\bdocument\b/.test(src), 'logic.js không được dùng document');
  assert.ok(!/\bwindow\b/.test(src), 'logic.js không được dùng window');
  assert.ok(!/\bcanvas\b/i.test(src), 'logic.js không được dùng canvas');
  assert.ok(!/\blocalStorage\b/.test(src), 'logic.js không được dùng localStorage');
});

test('logic.js: export được cả ở môi trường Node', () => {
  assert.strictEqual(typeof Logic.createGame, 'function');
  assert.strictEqual(typeof Logic.step, 'function');
  assert.strictEqual(typeof Logic.setDirection, 'function');
  assert.strictEqual(typeof Logic.spawnFood, 'function');
  assert.strictEqual(Logic.GRID, 20);
});

// ---------------------------------------------------------------------------
// 8) GIAI ĐOẠN 2 — cấu hình theo màn: wrap-around + chướng ngại vật
// ---------------------------------------------------------------------------

test('createGame: mặc định KHÔNG wrap, không chướng ngại vật, lưới 20x20', () => {
  const s = Logic.createGame();
  assert.strictEqual(s.wrap, false, 'mặc định không wrap');
  assert.deepStrictEqual(s.obstacles, [], 'mặc định không có chướng ngại vật');
  assert.strictEqual(s.cols, 20);
  assert.strictEqual(s.rows, 20);
  assert.strictEqual(s.level, 1);
});

test('createGame: nhận config cols/rows tuỳ chỉnh', () => {
  const s = Logic.createGame({ cols: 10, rows: 8 });
  assert.strictEqual(s.cols, 10);
  assert.strictEqual(s.rows, 8);
  assert.strictEqual(s.snake[0].x, 5, 'đầu rắn ở giữa theo cols');
  assert.strictEqual(s.snake[0].y, 4, 'đầu rắn ở giữa theo rows');
});

test('step (wrap): đi xuyên biên phải sang trái', () => {
  const s = Logic.createGame({ wrap: true });
  s.snake = [{ x: GRID - 1, y: 5 }, { x: GRID - 2, y: 5 }, { x: GRID - 3, y: 5 }];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };
  s.food = null;

  Logic.step(s);

  assert.strictEqual(s.gameOver, false, 'wrap thì không chết ở biên');
  assert.strictEqual(s.snake[0].x, 0, 'đầu phải xuất hiện ở bờ đối diện');
  assert.strictEqual(s.snake[0].y, 5);
});

test('step (wrap): đi xuyên biên trên', () => {
  const s = Logic.createGame({ wrap: true });
  s.snake = [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }];
  s.dir = { x: 0, y: -1 };
  s.lastMoveDir = { x: 0, y: -1 };
  s.food = null;

  Logic.step(s);

  assert.strictEqual(s.gameOver, false);
  assert.strictEqual(s.snake[0].y, GRID - 1, 'vòng xuống đáy');
  assert.strictEqual(s.snake[0].x, 5);
});

test('step (không wrap): đâm tường vẫn Game Over', () => {
  const s = Logic.createGame({ wrap: false });
  s.snake = [{ x: GRID - 1, y: 5 }];
  s.dir = { x: 1, y: 0 };
  s.food = null;
  Logic.step(s);
  assert.strictEqual(s.gameOver, true);
});

test('step (chướng ngại vật): đâm vật cản tĩnh thì Game Over', () => {
  const s = Logic.createGame({ obstacles: [{ x: 11, y: 10 }] });
  s.food = null;
  // đầu rắn (10,10) đi sang phải -> (11,10) là chướng ngại vật
  Logic.step(s);
  assert.strictEqual(s.gameOver, true, 'đâm chướng ngại vật phải game over');
});

test('createGame: bỏ qua chướng ngại vật không hợp lệ', () => {
  const s = Logic.createGame({ obstacles: [{ x: 1, y: 1 }, null, { foo: 1 }, { x: 'a', y: 2 }] });
  assert.deepStrictEqual(s.obstacles, [{ x: 1, y: 1 }]);
});

test('spawnFood: không sinh trên chướng ngại vật', () => {
  const rngs = [() => 0, () => 0.3, () => 0.5, () => 0.9, () => 0.999];
  const obstacles = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 10, y: 5 }];
  for (const rng of rngs) {
    for (let i = 0; i < 20; i++) {
      const s = Logic.createGame({ obstacles });
      const f = Logic.spawnFood(s, rng);
      const onObs = s.obstacles.some((o) => o.x === f.x && o.y === f.y);
      assert.strictEqual(onObs, false, 'mồi không được nằm trên chướng ngại vật');
    }
  }
});

// ---------------------------------------------------------------------------
// 9) levels.js
// ---------------------------------------------------------------------------

test('levels.js: có đúng 3 màn với id 1, 2, 3', () => {
  assert.strictEqual(Levels.LEVELS.length, 3);
  assert.deepStrictEqual(Levels.LEVELS.map((l) => l.id), [1, 2, 3]);
});

test('levels.js: Classic wrap; Boxed không wrap; Maze có chướng ngại vật', () => {
  const classic = Levels.getLevel(1);
  const boxed = Levels.getLevel(2);
  const maze = Levels.getLevel(3);

  assert.strictEqual(classic.wrap, true);
  assert.strictEqual(classic.obstacles.length, 0);

  assert.strictEqual(boxed.wrap, false);
  assert.strictEqual(boxed.obstacles.length, 0);

  assert.strictEqual(maze.wrap, false);
  assert.ok(maze.obstacles.length > 0, 'Maze phải có chướng ngại vật');
  assert.ok(maze.speed < boxed.speed, 'Maze phải nhanh hơn Boxed');
});

test('levels.js (Sprint 4): tốc độ vào màn nhanh hơn, có sàn riêng từng màn', () => {
  const classic = Levels.getLevel(1);
  const boxed = Levels.getLevel(2);
  const maze = Levels.getLevel(3);

  // Giá trị mới theo SPEC T-009.
  assert.strictEqual(classic.speed, 110);
  assert.strictEqual(boxed.speed, 100);
  assert.strictEqual(maze.speed, 90);

  // Sàn ms/bước riêng từng màn.
  assert.strictEqual(classic.minSpeed, 62);
  assert.strictEqual(boxed.minSpeed, 58);
  assert.strictEqual(maze.minSpeed, 55);

  // Vẫn giữ đúng tinh thần "càng về sau càng nhanh".
  assert.ok(classic.speed > boxed.speed, 'Classic chậm hơn Boxed');
  assert.ok(boxed.speed > maze.speed, 'Boxed chậm hơn Maze');
  assert.ok(boxed.minSpeed < classic.minSpeed, 'Sàn Boxed nhanh hơn Classic');
  assert.ok(maze.minSpeed < boxed.minSpeed, 'Sàn Maze nhanh hơn Boxed');

  // Vào màn phải NHANH HƠN bản cũ (140 / 122 / 104).
  assert.ok(classic.speed < 140, 'Classic phải nhanh hơn bản cũ');
  assert.ok(boxed.speed < 122, 'Boxed phải nhanh hơn bản cũ');
  assert.ok(maze.speed < 104, 'Maze phải nhanh hơn bản cũ');
});

test('levels.js (Sprint 4): ramp tốc độ = base - score*3, kẹp sàn (mô phỏng game.js)', () => {
  const ramp = (lv, score) => Math.max(lv.minSpeed, lv.speed - score * 3);
  const classic = Levels.getLevel(1);
  const boxed = Levels.getLevel(2);
  const maze = Levels.getLevel(3);

  assert.strictEqual(ramp(classic, 0), 110);
  assert.strictEqual(ramp(classic, 16), 62); // 110 - 48 = 62 → chạm sàn
  assert.strictEqual(ramp(classic, 100), 62); // kẹp sàn

  assert.strictEqual(ramp(boxed, 0), 100);
  assert.strictEqual(ramp(boxed, 14), 58); // 100 - 42 = 58 → chạm sàn
  assert.strictEqual(ramp(boxed, 999), 58);

  assert.strictEqual(ramp(maze, 0), 90);
  assert.strictEqual(ramp(maze, 11), 57); // 90 - 33
  assert.strictEqual(ramp(maze, 12), 55); // 90 - 36 = 54 < sàn 55 → kẹp
  assert.strictEqual(ramp(maze, 999), 55);

  // Đơn điệu (ms không tăng) và luôn >= sàn.
  for (const lv of [classic, boxed, maze]) {
    let prev = Infinity;
    for (let s = 0; s <= 200; s++) {
      const v = ramp(lv, s);
      assert.ok(v >= lv.minSpeed, 'tốc độ không được nhỏ hơn sàn');
      assert.ok(v <= prev, 'tốc độ phải nhanh dần đều (ms không tăng)');
      prev = v;
    }
  }
});

test('levels.js: chướng ngại vật Maze nằm trong lưới, không trùng thân rắn xuất phát', () => {
  const maze = Levels.getLevel(3);
  const startSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  for (const o of maze.obstacles) {
    assert.ok(o.x >= 0 && o.x < Levels.GRID, 'obstacle.x trong lưới');
    assert.ok(o.y >= 0 && o.y < Levels.GRID, 'obstacle.y trong lưới');
    const onSnake = startSnake.some((c) => c.x === o.x && c.y === o.y);
    assert.strictEqual(onSnake, false, 'chướng ngại vật không được trùng thân rắn');
  }
});

test('levels.js: createGameConfig trả cấu hình dùng được với Logic.createGame', () => {
  const cfgClassic = Levels.createGameConfig(1);
  assert.strictEqual(cfgClassic.wrap, true);
  assert.strictEqual(cfgClassic.level, 1);

  const cfgMaze = Levels.createGameConfig(3);
  assert.strictEqual(cfgMaze.wrap, false);
  assert.strictEqual(cfgMaze.level, 3);
  assert.ok(cfgMaze.obstacles.length > 0);

  const s = Logic.createGame(cfgMaze);
  assert.strictEqual(s.wrap, false);
  assert.ok(s.obstacles.length > 0);
});

test('tích hợp: Classic wrap-around chạy được qua Logic', () => {
  const s = Logic.createGame(Levels.createGameConfig(1));
  s.snake = [{ x: GRID - 1, y: 8 }, { x: GRID - 2, y: 8 }, { x: GRID - 3, y: 8 }];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };
  s.food = null;
  Logic.step(s);
  assert.strictEqual(s.gameOver, false);
  assert.strictEqual(s.snake[0].x, 0);
});

test('tích hợp: Maze — đâm chướng ngại vật thì Game Over', () => {
  const cfg = Levels.createGameConfig(3);
  const o = cfg.obstacles[0];
  const s = Logic.createGame(cfg);
  s.snake = [
    { x: o.x - 1, y: o.y },
    { x: o.x - 2, y: o.y },
    { x: o.x - 3, y: o.y }
  ];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };
  s.food = null;
  Logic.step(s);
  assert.strictEqual(s.gameOver, true, 'đâm chướng ngại vật Maze phải game over');
});

// ---------------------------------------------------------------------------
// 10) audio.js — API tồn tại & an toàn khi không có AudioContext (Node)
// ---------------------------------------------------------------------------

test('audio.js: đủ API và không ném lỗi ở Node', () => {
  const fns = [
    'initAudio', 'playEat', 'playLevelUp', 'playMove',
    'playGameOver', 'toggleMute', 'setMuted', 'isMuted'
  ];
  for (const name of fns) {
    assert.strictEqual(typeof Audio[name], 'function', 'thiếu hàm ' + name);
  }

  assert.strictEqual(typeof Audio.isMuted(), 'boolean');

  Audio.setMuted(true);
  assert.strictEqual(Audio.isMuted(), true, 'setMuted(true) phải có hiệu lực');

  const toggled = Audio.toggleMute();
  assert.strictEqual(toggled, false, 'toggleMute đảo trạng thái mute');
  assert.strictEqual(Audio.isMuted(), false);

  // Không có AudioContext trong Node -> các lệnh phát tiếng phải là no-op an toàn.
  assert.doesNotThrow(() => {
    Audio.initAudio();
    Audio.playEat();
    Audio.playLevelUp();
    Audio.playMove();
    Audio.playGameOver();
  });
});

// ---------------------------------------------------------------------------
// 11) particles.js — hệ hạt
// ---------------------------------------------------------------------------

test('particles.js: burst tạo hạt, update làm hạt tàn dần, clear xoá hết', () => {
  const sys = Particles.createSystem();
  assert.strictEqual(sys.count(), 0);

  sys.burst(10, 10, '#39ff14', 20, 24);
  assert.strictEqual(sys.count(), 20, 'burst phải tạo đúng số hạt');

  // Giả lập nhiều frame để các hạt chết dần.
  for (let i = 0; i < 400; i++) sys.update(16);
  assert.strictEqual(sys.count(), 0, 'hạt phải tự huỷ sau vòng đời');

  sys.burst(5, 5, '#fff', 8, 24);
  sys.clear();
  assert.strictEqual(sys.count(), 0, 'clear phải xoá hết hạt');
});

test('particles.js: draw chạy được với canvas context giả', () => {
  const sys = Particles.createSystem();
  const calls = { arcs: 0 };
  const fakeCtx = {
    globalAlpha: 1,
    fillStyle: '#000',
    beginPath() {},
    arc() { calls.arcs++; },
    fill() {}
  };

  sys.burst(10, 10, '#f0f', 5, 24);
  assert.doesNotThrow(() => sys.draw(fakeCtx));
  assert.ok(calls.arcs >= 5, 'phải vẽ ít nhất 1 arc cho mỗi hạt');
});

// ---------------------------------------------------------------------------
// 12) SPRINT 3 — hồi quy lỗi "rắn kéo dài / vệt ngang" khi đi xuyên vách (wrap)
// ---------------------------------------------------------------------------

test('wrap: đi xuyên cả 4 cạnh giữ nguyên độ dài rắn (không cộng dồn đốt)', () => {
  const s = Logic.createGame({ wrap: true });
  s.food = null; // không ăn → độ dài phải giữ nguyên
  const len0 = s.snake.length;

  // Phải: 19 -> 0
  s.snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };
  Logic.step(s);
  assert.strictEqual(s.snake[0].x, 0, 'wrap phải sang trái');
  assert.strictEqual(s.snake.length, len0, 'wrap KHÔNG được thêm đốt');

  // Trái: 0 -> 19
  s.snake = [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }];
  s.dir = { x: -1, y: 0 };
  s.lastMoveDir = { x: -1, y: 0 };
  Logic.step(s);
  assert.strictEqual(s.snake[0].x, 19, 'wrap trái sang phải');
  assert.strictEqual(s.snake.length, len0);

  // Trên: 0 -> 19
  s.snake = [{ x: 10, y: 0 }, { x: 10, y: 1 }, { x: 10, y: 2 }];
  s.dir = { x: 0, y: -1 };
  s.lastMoveDir = { x: 0, y: -1 };
  Logic.step(s);
  assert.strictEqual(s.snake[0].y, 19, 'wrap trên xuống dưới');
  assert.strictEqual(s.snake.length, len0);

  // Dưới: 19 -> 0
  s.snake = [{ x: 10, y: 19 }, { x: 10, y: 18 }, { x: 10, y: 17 }];
  s.dir = { x: 0, y: 1 };
  s.lastMoveDir = { x: 0, y: 1 };
  Logic.step(s);
  assert.strictEqual(s.snake[0].y, 0, 'wrap dưới lên trên');
  assert.strictEqual(s.snake.length, len0);
});

test('wrap: nhiều bước liên tiếp giữ nguyên độ dài (không kéo dài rắn)', () => {
  const s = Logic.createGame({ wrap: true });
  s.food = null;
  s.snake = [
    { x: 15, y: 3 }, { x: 14, y: 3 }, { x: 13, y: 3 }, { x: 12, y: 3 }, { x: 11, y: 3 }
  ];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };

  const len0 = s.snake.length;
  for (let i = 0; i < 60; i++) {
    Logic.step(s);
    assert.strictEqual(s.gameOver, false, 'không được chết ở bước ' + i);
    assert.strictEqual(s.snake.length, len0, 'độ dài phải giữ nguyên ở bước ' + i);
  }
});

test('wrap: các đốt liên tiếp luôn kề nhau trên hình xuyến (không nhảy > 1 ô)', () => {
  const s = Logic.createGame({ wrap: true });
  s.food = null;
  s.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }, { x: 16, y: 5 }];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };

  const cols = s.cols;
  const rows = s.rows;

  for (let i = 0; i < 80; i++) {
    Logic.step(s);
    assert.strictEqual(s.gameOver, false, 'không được chết ở bước ' + i);

    for (let k = 1; k < s.snake.length; k++) {
      const a = s.snake[k - 1];
      const b = s.snake[k];
      // Khoảng cách "vòng" nhỏ nhất (wrap là hợp lệ, không tính là nhảy).
      const dx = Math.min(Math.abs(a.x - b.x), cols - Math.abs(a.x - b.x));
      const dy = Math.min(Math.abs(a.y - b.y), rows - Math.abs(a.y - b.y));
      assert.strictEqual(
        dx + dy,
        1,
        'đốt ' + (k - 1) + '->' + k + ' phải kề nhau (bước ' + i + ')'
      );
    }
  }
});

test('wrap: ăn mồi ở bờ đối diện tăng đúng 1 đốt', () => {
  const s = Logic.createGame({ wrap: true });
  s.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
  s.dir = { x: 1, y: 0 };
  s.lastMoveDir = { x: 1, y: 0 };
  s.food = { x: 0, y: 5 }; // mồi ngay bờ đối diện
  const len0 = s.snake.length;

  Logic.step(s);

  assert.strictEqual(s.gameOver, false);
  assert.strictEqual(s.snake[0].x, 0);
  assert.strictEqual(s.snake.length, len0 + 1, 'ăn mồi phải dài thêm ĐÚNG 1 đốt');
  assert.strictEqual(s.score, 1);
});

// ---------------------------------------------------------------------------
// 13) SPRINT 3 — API nhạc nền (BGM) trong audio.js
// ---------------------------------------------------------------------------

test('audio.js (Sprint 3): API BGM đầy đủ và an toàn ở Node', () => {
  const fns = ['attachBgmElement', 'startBgm', 'stopBgm', 'toggleBgm', 'setBgmEnabled', 'isBgmEnabled'];
  for (const name of fns) {
    assert.strictEqual(typeof Audio[name], 'function', 'thiếu hàm ' + name);
  }

  assert.strictEqual(typeof Audio.isBgmEnabled(), 'boolean');

  // Không có AudioContext / localStorage trong Node → phải là no-op an toàn.
  assert.doesNotThrow(() => {
    Audio.attachBgmElement(null);
    Audio.startBgm();
    Audio.setBgmEnabled(true);
    Audio.toggleBgm();
    Audio.stopBgm();
  });
});

// ---------------------------------------------------------------------------
// 14) SPRINT 4 — API mở khoá audio mobile + âm lượng (audio.js)
// ---------------------------------------------------------------------------

test('audio.js (Sprint 4): API unlock + trạng thái đầy đủ và an toàn ở Node', () => {
  const fns = ['unlockAudio', 'getState', 'isAudioRunning', 'onStateChange'];
  for (const name of fns) {
    assert.strictEqual(typeof Audio[name], 'function', 'thiếu hàm ' + name);
  }

  // Node không có AudioContext / document → các hàm phải an toàn, không ném lỗi.
  assert.doesNotThrow(() => {
    Audio.unlockAudio();
    assert.strictEqual(Audio.getState(), 'none');
    assert.strictEqual(Audio.isAudioRunning(), false);
  });

  assert.strictEqual(typeof Audio.onStateChange, 'function');
  assert.strictEqual(Audio.onStateChange(function () {}), 1, 'đăng ký listener trả về số lượng');
  assert.strictEqual(Audio.onStateChange(null), 1, 'listener không hợp lệ bị bỏ qua');
});

run();
