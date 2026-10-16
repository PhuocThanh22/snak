/*
 * snake/particles.js — Hệ hạt đơn giản (particle explosion) cho hiệu ứng ăn mồi.
 *
 * Thuần tính toán, KHÔNG tự đụng DOM: người dùng truyền `ctx` khi vẽ.
 * Hạt tự huỷ khi hết vòng đời.
 *
 * Export UMD:
 *   - Trình duyệt: biến toàn cục `SnakeParticles`
 *   - Node:        module.exports
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeParticles = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Tạo một hệ hạt độc lập.
   * @returns {{burst: Function, update: Function, draw: Function, clear: Function, count: Function}}
   */
  function createSystem() {
    var parts = [];

    /**
     * Bắn ra một cụm hạt tại (x, y) tính bằng PIXEL canvas.
     * @param {number} x
     * @param {number} y
     * @param {string} color
     * @param {number} [count]
     * @param {number} [cell] kích thước 1 ô (để scale tốc độ/kích thước)
     */
    function burst(x, y, color, count, cell) {
      var n = count || 14;
      var unit = cell || 20;
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2;
        var spd = (0.4 + Math.random() * 1.2) * unit * 0.06;
        parts.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1,
          decay: 0.0016 + Math.random() * 0.0020,
          size: unit * (0.08 + Math.random() * 0.10),
          color: color || '#39ff14'
        });
      }
    }

    /** Cập nhật vị trí + vòng đời theo dt (ms). */
    function update(dt) {
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay * dt;
        if (p.life <= 0) parts.splice(i, 1);
      }
    }

    /** Vẽ toàn bộ hạt lên canvas context. */
    function draw(ctx) {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.size * p.life), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function clear() {
      parts.length = 0;
    }

    function count() {
      return parts.length;
    }

    return { burst: burst, update: update, draw: draw, clear: clear, count: count };
  }

  return { createSystem: createSystem };
});
