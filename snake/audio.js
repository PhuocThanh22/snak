/*
 * snake/audio.js — Âm thanh tổng hợp hoàn toàn bằng code (Web Audio API).
 *
 * KHÔNG dùng file mp3/wav ngoài. Mọi âm thanh tạo từ OscillatorNode +
 * GainNode + envelope (attack/decay).
 *
 * Export UMD:
 *   - Trình duyệt: biến toàn cục `SnakeAudio`
 *   - Node:        module.exports (API vẫn tồn tại, không phát tiếng vì
 *                  không có AudioContext)
 *
 * QUAN TRỌNG: AudioContext chỉ được TẠO/RESUME trong `initAudio()` —
 * hàm này phải được gọi sau tương tác đầu tiên của người dùng (click/phím)
 * để tránh cảnh báo autoplay của Chrome.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module && module.exports) {
    module.exports = factory(root);
  } else {
    root.SnakeAudio = factory(root);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var MUTE_KEY = 'snake:muted';

  var ctx = null;
  var master = null;
  var muted = readMuted();

  function readMuted() {
    try {
      return !!(root && root.localStorage && root.localStorage.getItem(MUTE_KEY) === '1');
    } catch (e) {
      return false;
    }
  }

  function saveMuted(value) {
    try {
      if (root && root.localStorage) {
        root.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
      }
    } catch (e) {
      /* chế độ riêng tư có thể chặn */
    }
  }

  function AudioCtor() {
    if (!root) return null;
    return root.AudioContext || root.webkitAudioContext || null;
  }

  /** Tạo AudioContext + master gain (chỉ gọi khi đã có tương tác người dùng). */
  function ensureContext() {
    if (ctx) return ctx;
    var AC = AudioCtor();
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    return ctx;
  }

  /**
   * Khởi tạo/resume AudioContext. Gọi sau tương tác đầu tiên của người dùng.
   * Idempotent (gọi nhiều lần vô hại).
   */
  function initAudio() {
    var c = ensureContext();
    if (c && c.state === 'suspended' && typeof c.resume === 'function') {
      try {
        c.resume();
      } catch (e) {
        /* bỏ qua */
      }
    }
    return c;
  }

  /** Phát một nốt đơn với envelope. */
  function tone(opts) {
    if (muted) return;
    var c = ensureContext();
    if (!c) return;
    if (c.state === 'suspended' && typeof c.resume === 'function') {
      try {
        c.resume();
      } catch (e) {
        /* bỏ qua */
      }
    }

    var dur = opts.dur || 0.15;
    var t0 = c.currentTime + (opts.delay || 0);

    var osc = c.createOscillator();
    var gain = c.createGain();

    osc.type = opts.type || 'square';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freqEnd && opts.freqEnd !== opts.freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), t0 + dur);
    }

    var vol = opts.vol == null ? 0.25 : opts.vol;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  // ---- Các hiệu ứng cụ thể --------------------------------------------------

  /** Ăn mồi: blip ngắn đi lên. */
  function playEat() {
    tone({ type: 'square', freq: 520, freqEnd: 960, dur: 0.12, vol: 0.28 });
  }

  /** Qua màn: hợp âm rải đi lên (arpeggio). */
  function playLevelUp() {
    tone({ type: 'triangle', freq: 523.25, dur: 0.13, vol: 0.22, delay: 0.0 });
    tone({ type: 'triangle', freq: 659.25, dur: 0.13, vol: 0.22, delay: 0.1 });
    tone({ type: 'triangle', freq: 880.0, dur: 0.2, vol: 0.24, delay: 0.2 });
  }

  /** Di chuyển: tick rất nhẹ (tuỳ chọn). */
  function playMove() {
    tone({ type: 'sine', freq: 220, dur: 0.035, vol: 0.05 });
  }

  /** Game Over: trượt xuống. */
  function playGameOver() {
    tone({ type: 'sawtooth', freq: 340, freqEnd: 90, dur: 0.55, vol: 0.3 });
  }

  // ---- Mute -----------------------------------------------------------------

  function setMuted(value) {
    muted = !!value;
    saveMuted(muted);
    if (master) master.gain.value = muted ? 0 : 0.5;
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  function isMuted() {
    return muted;
  }

  return {
    initAudio: initAudio,
    playEat: playEat,
    playLevelUp: playLevelUp,
    playMove: playMove,
    playGameOver: playGameOver,
    toggleMute: toggleMute,
    setMuted: setMuted,
    isMuted: isMuted
  };
});
