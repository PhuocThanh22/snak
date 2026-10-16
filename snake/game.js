/*
 * snake/game.js — Lớp hiển thị + nhập liệu cho game Rắn săn mồi (GIAI ĐOẠN 2).
 *
 * File này CHỈ lo phần DOM/canvas/input/hiệu ứng. Mọi luật chơi nằm ở logic.js.
 * Phải được nhúng SAU: levels.js, logic.js, particles.js, audio.js.
 *
 * Tính năng: menu chọn 3 màn, vẽ Neon có glow, nội suy chuyển động mượt,
 * particle explosion khi ăn, screen shake khi va chạm, đầu rõ + đuôi thon,
 * đổi màu theo màn, high score riêng từng màn, nút Mute/Unmute.
 */
(function () {
  'use strict';

  // ---- Nạp các module (global ở trình duyệt, require ở Node) ---------------

  function pick(globalName, relPath) {
    if (typeof globalThis !== 'undefined' && globalThis[globalName]) return globalThis[globalName];
    if (typeof require === 'function') {
      try {
        return require(relPath);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  var Logic = pick('SnakeLogic', './logic.js');
  var Levels = pick('SnakeLevels', './levels.js');
  var Particles = pick('SnakeParticles', './particles.js');
  var Audio = pick('SnakeAudio', './audio.js');

  if (!Logic) {
    throw new Error('SnakeLogic chưa được nạp. Hãy nhúng logic.js trước game.js.');
  }

  var GRID = Logic.GRID;

  // ---- Tham chiếu DOM -------------------------------------------------------

  var canvas = document.getElementById('game');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  var scoreEl = document.getElementById('score');
  var levelEl = document.getElementById('level');
  var bestEl = document.getElementById('best');
  var overlayEl = document.getElementById('overlay');
  var menuEl = document.getElementById('menu');
  var restartBtn = document.getElementById('restart');
  var menuBtn = document.getElementById('menuBtn');
  var muteBtn = document.getElementById('mute');

  // ---- Kích thước vẽ (hỗ trợ màn hình mật độ cao) ---------------------------

  var LOGICAL = 480; // kích thước logic của bàn chơi
  var dpr = 1;
  try {
    dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
  } catch (e) {
    dpr = 1;
  }
  canvas.width = Math.round(LOGICAL * dpr);
  canvas.height = Math.round(LOGICAL * dpr);
  var CELL = LOGICAL / GRID;

  // ---- Trạng thái -----------------------------------------------------------

  var HS_KEY = 'snake:highscores';
  var FALLBACK_LEVEL = {
    id: 1, key: 'classic', name: 'Classic',
    wrap: false, obstacles: [], speed: 140,
    accent: '#39ff14', accent2: '#0aff9d', food: '#ff2e88'
  };

  var highscores = readHighscores();
  var currentLevel = Levels ? Levels.getLevel(1) : FALLBACK_LEVEL;
  var state = Logic.createGame(toConfig(1));
  var prevSnake = state.snake.map(cloneCell);

  var inMenu = true;
  var particles = Particles ? Particles.createSystem() : null;

  var stepInterval = speedFor(0);
  var acc = 0;
  var lastTs = 0;
  var renderT = 1;
  var shakeMag = 0;
  var levelFlash = 0;

  // ---- Tiện ích -------------------------------------------------------------

  function cloneCell(c) {
    return { x: c.x, y: c.y };
  }

  function toConfig(id) {
    if (Levels) return Levels.createGameConfig(id);
    return { wrap: false, obstacles: [], level: id, speed: 140 };
  }

  function colors() {
    return currentLevel || FALLBACK_LEVEL;
  }

  function levelLabel(lv) {
    return lv ? lv.id + ' · ' + lv.name : '—';
  }

  function speedFor(score) {
    var base = currentLevel && currentLevel.speed ? currentLevel.speed : 140;
    return Math.max(55, base - score * 4);
  }

  function currentBest() {
    if (!currentLevel) return 0;
    return highscores[currentLevel.id] || 0;
  }

  function readHighscores() {
    try {
      var raw = localStorage.getItem(HS_KEY);
      var obj = raw ? JSON.parse(raw) : null;
      return obj && typeof obj === 'object' ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function writeHighscores(obj) {
    try {
      localStorage.setItem(HS_KEY, JSON.stringify(obj));
    } catch (e) {
      /* bỏ qua */
    }
  }

  // ---- HUD ------------------------------------------------------------------

  function updateHud() {
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (levelEl) levelEl.textContent = levelLabel(currentLevel);
    if (bestEl) bestEl.textContent = String(currentBest());
  }

  function syncMuteButton() {
    if (!muteBtn) return;
    var m = Audio ? Audio.isMuted() : false;
    muteBtn.textContent = m ? '🔇 Đang tắt tiếng' : '🔊 Âm thanh';
    muteBtn.setAttribute('aria-pressed', m ? 'true' : 'false');
  }

  // ---- Vòng đời game --------------------------------------------------------

  function startGame(id) {
    currentLevel = Levels ? Levels.getLevel(id) : FALLBACK_LEVEL;
    state = Logic.createGame(toConfig(id));
    prevSnake = state.snake.map(cloneCell);
    acc = 0;
    renderT = 1;
    shakeMag = 0;
    levelFlash = 0;
    stepInterval = speedFor(0);
    if (particles) particles.clear();
    inMenu = false;
    if (menuEl) menuEl.classList.add('menu--hidden');
    updateHud();
    syncMuteButton();
  }

  function showMenu() {
    inMenu = true;
    acc = 0;
    renderT = 1;
    if (particles) particles.clear();
    if (menuEl) menuEl.classList.remove('menu--hidden');
    updateHud();
  }

  function restart() {
    if (inMenu) return;
    startGame(currentLevel ? currentLevel.id : 1);
  }

  function togglePause() {
    if (inMenu || state.gameOver) return;
    state.paused = !state.paused;
    if (state.paused) acc = 0;
    updateOverlay();
  }

  function onGameOver() {
    if (Audio) Audio.playGameOver();
    shakeMag = 15;
    if (currentLevel && state.score > currentBest()) {
      highscores[currentLevel.id] = state.score;
      writeHighscores(highscores);
    }
    updateHud();
  }

  /** Tiến 1 bước logic + phát sự kiện âm thanh/hiệu ứng. */
  function advance() {
    var scoreBefore = state.score;
    var foodBefore = state.food;

    prevSnake = state.snake.map(cloneCell);
    Logic.step(state);

    if (state.gameOver) {
      onGameOver();
      return;
    }

    if (state.score > scoreBefore) {
      if (Audio) Audio.playEat();
      if (particles && foodBefore) {
        particles.burst(
          foodBefore.x * CELL + CELL / 2,
          foodBefore.y * CELL + CELL / 2,
          colors().food,
          16,
          CELL
        );
      }
      if (Math.floor(state.score / 5) > Math.floor(scoreBefore / 5)) {
        if (Audio) Audio.playLevelUp();
        levelFlash = 1;
      }
      updateHud();
    }

    stepInterval = speedFor(state.score);
  }

  // ---- Vòng lặp render ------------------------------------------------------

  function requestFrame(fn) {
    if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(fn);
    return setTimeout(function () { fn(Date.now()); }, 16);
  }

  function frame(ts) {
    requestFrame(frame);

    if (!lastTs) lastTs = ts;
    var dt = Math.min(64, ts - lastTs);
    lastTs = ts;

    if (!inMenu && !state.paused && !state.gameOver) {
      acc += dt;
      var guard = 0;
      while (acc >= stepInterval && guard < 5) {
        acc -= stepInterval;
        advance();
        guard++;
        if (state.gameOver || state.paused) break;
      }
      if (acc > stepInterval) acc = 0;
      renderT = stepInterval > 0 ? Math.min(1, acc / stepInterval) : 1;
    } else {
      renderT = 1;
    }

    if (particles) particles.update(dt);
    shakeMag = shakeMag > 0.2 ? shakeMag * 0.9 : 0;
    if (levelFlash > 0) levelFlash = Math.max(0, levelFlash - dt * 0.0022);

    draw();
    updateOverlay();
  }

  // ---- Vẽ -------------------------------------------------------------------

  function draw() {
    var c = colors();

    // Transform gốc (DPR) rồi tới screen shake.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, LOGICAL, LOGICAL);

    var sx = 0;
    var sy = 0;
    if (shakeMag > 0.2) {
      sx = (Math.random() - 0.5) * shakeMag;
      sy = (Math.random() - 0.5) * shakeMag;
    }
    ctx.translate(sx, sy);

    // Nền
    var bg = ctx.createLinearGradient(0, 0, LOGICAL, LOGICAL);
    bg.addColorStop(0, '#05070d');
    bg.addColorStop(1, '#0a0f1c');
    ctx.fillStyle = bg;
    ctx.fillRect(-32, -32, LOGICAL + 64, LOGICAL + 64);

    drawGrid(c);
    drawObstacles(c);
    drawFood(c);
    drawSnake(renderT, c);

    if (particles) particles.draw(ctx);

    // Viền flash khi lên level
    if (levelFlash > 0) {
      ctx.strokeStyle = c.accent;
      ctx.globalAlpha = levelFlash * 0.8;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, LOGICAL - 6, LOGICAL - 6);
      ctx.globalAlpha = 1;
    }
  }

  function drawGrid(c) {
    ctx.strokeStyle = 'rgba(120, 200, 255, 0.06)';
    ctx.lineWidth = 1;
    for (var i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, LOGICAL);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(LOGICAL, i * CELL);
      ctx.stroke();
    }

    // Viền bàn chơi: đổi màu theo màn; màn có tường thì vẽ viền đậm hơn.
    ctx.shadowBlur = 12;
    ctx.shadowColor = c.accent;
    ctx.strokeStyle = c.wrap ? 'rgba(120,200,255,0.25)' : c.accent;
    ctx.lineWidth = c.wrap ? 2 : 4;
    ctx.strokeRect(2, 2, LOGICAL - 4, LOGICAL - 4);
    ctx.shadowBlur = 0;
  }

  function drawObstacles(c) {
    var obs = state.obstacles || [];
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = c.accent2;
      ctx.fillStyle = 'rgba(177, 75, 255, 0.22)';
      ctx.fillRect(o.x * CELL + 1, o.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.strokeStyle = c.accent2;
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x * CELL + 1.5, o.y * CELL + 1.5, CELL - 3, CELL - 3);
      ctx.restore();
    }
  }

  function drawFood(c) {
    if (!state.food) return;
    var cx = state.food.x * CELL + CELL / 2;
    var cy = state.food.y * CELL + CELL / 2;
    var pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);

    ctx.save();
    ctx.shadowBlur = 20 + pulse * 8;
    ctx.shadowColor = c.food;
    ctx.fillStyle = c.food;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * (0.26 + pulse * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(cx - CELL * 0.06, cy - CELL * 0.06, CELL * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Vị trí hiển thị của từng đốt rắn, nội suy giữa prev và cur theo t. */
  function snakePoints(t) {
    var snake = state.snake;
    var n = snake.length;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var cur = snake[i];
      var prev = prevSnake[i];
      if (!prev) prev = prevSnake[prevSnake.length - 1] || cur;

      var px;
      var py;
      // Bỏ nội suy khi toạ độ nhảy > 1 ô (wrap-around) để tránh vệt dài.
      if (Math.abs(cur.x - prev.x) <= 1 && Math.abs(cur.y - prev.y) <= 1) {
        px = (prev.x + (cur.x - prev.x) * t) * CELL + CELL / 2;
        py = (prev.y + (cur.y - prev.y) * t) * CELL + CELL / 2;
      } else {
        px = cur.x * CELL + CELL / 2;
        py = cur.y * CELL + CELL / 2;
      }
      pts.push({ x: px, y: py });
    }
    return pts;
  }

  function strokePath(pts) {
    if (pts.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  function drawSnake(t, c) {
    var pts = snakePoints(t);
    var n = pts.length;
    if (n === 0) return;

    // Viền glow bao quanh thân (giúp lấp khe giữa các đốt thon).
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowBlur = 16;
    ctx.shadowColor = c.accent;
    ctx.strokeStyle = c.accent2;
    ctx.lineWidth = CELL * 0.82;
    strokePath(pts);
    ctx.restore();

    // Thân: các đốt thon dần về phía đuôi.
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (var i = n - 1; i >= 1; i--) {
      var ratio = n > 1 ? i / (n - 1) : 0;
      var r = CELL * (0.46 - 0.20 * ratio);
      ctx.fillStyle = i % 2 === 0 ? c.accent : c.accent2;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHead(pts[0], c);
  }

  function drawHead(pt, c) {
    var ang = Math.atan2(state.dir.y, state.dir.x);
    var fx = Math.cos(ang);
    var fy = Math.sin(ang);
    var px = -fy; // vuông góc
    var py = fx;

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = c.accent;
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, CELL * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mắt: 2 bên, hướng theo `dir`.
    for (var s = -1; s <= 1; s += 2) {
      var ex = pt.x + fx * CELL * 0.13 + px * s * CELL * 0.18;
      var ey = pt.y + fy * CELL * 0.13 + py * s * CELL * 0.18;

      ctx.fillStyle = '#04120a';
      ctx.beginPath();
      ctx.arc(ex, ey, CELL * 0.11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + fx * CELL * 0.03, ey + fy * CELL * 0.03, CELL * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateOverlay() {
    if (!overlayEl) return;
    if (inMenu) {
      overlayEl.style.display = 'none';
      return;
    }
    if (state.gameOver) {
      overlayEl.innerHTML =
        '<strong>GAME OVER</strong><br>Điểm: ' + state.score +
        ' • Cao nhất (' + (currentLevel ? currentLevel.name : '') + '): ' + currentBest() +
        '<br><span class="overlay__hint">Nhấn R hoặc nút Restart để chơi lại</span>';
      overlayEl.style.display = 'flex';
    } else if (state.paused) {
      overlayEl.innerHTML = '<strong>TẠM DỪNG</strong><br><span class="overlay__hint">Nhấn Space để tiếp tục</span>';
      overlayEl.style.display = 'flex';
    } else {
      overlayEl.style.display = 'none';
    }
  }

  // ---- Nhập liệu ------------------------------------------------------------

  var DIRS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    W: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    A: { x: -1, y: 0 },
    D: { x: 1, y: 0 }
  };

  function onKeyDown(event) {
    var key = event.key;

    if (inMenu) {
      if (key === '1' || key === '2' || key === '3') {
        event.preventDefault();
        startGame(parseInt(key, 10));
      }
      return;
    }

    if (key === ' ' || key === 'Spacebar' || event.code === 'Space') {
      event.preventDefault();
      togglePause();
      return;
    }
    if (key === 'r' || key === 'R') {
      event.preventDefault();
      restart();
      return;
    }

    var dir = DIRS[key];
    if (dir) {
      event.preventDefault();
      Logic.setDirection(state, dir);
      if (Audio) Audio.playMove();
    }
  }

  /** Khởi tạo AudioContext ở tương tác đầu tiên (tránh cảnh báo autoplay). */
  function firstInteraction() {
    if (Audio) Audio.initAudio();
    document.removeEventListener('pointerdown', firstInteraction);
    document.removeEventListener('keydown', firstInteraction);
  }

  document.addEventListener('keydown', function (event) {
    firstInteraction();
    onKeyDown(event);
  });
  document.addEventListener('pointerdown', firstInteraction);

  if (restartBtn) restartBtn.addEventListener('click', restart);
  if (menuBtn) menuBtn.addEventListener('click', showMenu);

  if (muteBtn) {
    muteBtn.addEventListener('click', function () {
      if (Audio) Audio.initAudio();
      if (Audio) Audio.toggleMute();
      syncMuteButton();
    });
  }

  if (menuEl) {
    var levelButtons = menuEl.querySelectorAll('[data-level]');
    for (var i = 0; i < levelButtons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (Audio) Audio.initAudio();
          startGame(parseInt(btn.getAttribute('data-level'), 10));
        });
      })(levelButtons[i]);
    }
  }

  // ---- Khởi động ------------------------------------------------------------

  syncMuteButton();
  showMenu();
  requestFrame(frame);
})();
