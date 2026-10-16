/*
 * snake/audio.js — SFX + nhạc nền (BGM), tổng hợp/điều phối bằng code.
 *
 * SFX: KHÔNG dùng file mp3/wav ngoài. Mọi hiệu ứng tạo từ OscillatorNode +
 * GainNode + envelope (attack/decay).
 *
 * BGM (SPRINT 3):
 *   - Nếu thẻ <audio id="bgm"> ĐƯỢC KHAI BÁO `src` (tức file có thật trong dự
 *     án, ví dụ `bgm.mp3`) → phát file đó (loop).
 *   - FALLBACK BẮT BUỘC: nếu KHÔNG có file, hoặc file lỗi (`error` event) →
 *     tự SINH nhạc nền chiptune/synth-pop "Sugarsweet" bằng Web Audio
 *     (giai điệu + bass + hat lặp). Nhờ vậy mọi trình duyệt luôn có nhạc.
 *   - KHÔNG chủ động request file không tồn tại (tránh lỗi 404 trên Console).
 *   - Trạng thái bật/tắt lưu ở localStorage (`snake:bgm`).
 *   - Nhạc chỉ bắt đầu SAU tương tác đầu tiên (autoplay policy).
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

  // ---- Nhạc nền (BGM) — file nếu có, fallback synth chiptune ----------------

  var BGM_KEY = 'snake:bgm';
  var BGM_BPM = 112;
  var BGM_STEP_DUR = 60 / BGM_BPM / 2; // nốt móc đơn

  var NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5
  };

  // Giai điệu "Sugarsweet" (C major, vui nhộn) — 32 bước móc đơn.
  var BGM_MELODY = [
    'C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'E5', 'C5',
    'F4', 'A4', 'C5', 'A4', 'G4', 'B4', 'D5', 'G5',
    'C5', 'E5', 'G5', 'C6', 'A4', 'C5', 'E5', 'A5',
    'F4', 'A4', 'C5', 'F5', 'G4', 'B4', 'D5', 'B4'
  ];

  // Bass chạy — 16 bước (mỗi 2 bước móc đơn).
  var BGM_BASS = [
    'C3', 'G3', 'A3', 'E3', 'F3', 'C3', 'G3', 'D3',
    'C3', 'G3', 'A3', 'E3', 'F3', 'C3', 'G3', 'G3'
  ];

  var bgmEnabled = readBgmEnabled();
  var bgmEl = null;
  var bgmMode = 'unknown'; // 'unknown' | 'file' | 'synth'
  var bgmGain = null;
  var bgmTimer = null;
  var bgmStep = 0;
  var bgmNextTime = 0;

  function readBgmEnabled() {
    try {
      var raw = root && root.localStorage ? root.localStorage.getItem(BGM_KEY) : null;
      return raw === null ? true : raw === '1';
    } catch (e) {
      return true;
    }
  }

  function saveBgmEnabled(value) {
    try {
      if (root && root.localStorage) root.localStorage.setItem(BGM_KEY, value ? '1' : '0');
    } catch (e) {
      /* bỏ qua */
    }
  }

  function ensureBgmGain() {
    var c = ensureContext();
    if (!c) return null;
    if (!bgmGain) {
      bgmGain = c.createGain();
      bgmGain.gain.value = 0.16;
      bgmGain.connect(master);
    }
    return bgmGain;
  }

  /** Phát 1 nốt vào đích `dest` (dùng chung cho synth BGM). */
  function blip(freq, time, dur, type, vol, dest) {
    var c = ctx;
    if (!c) return;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleBgmStep(step, time) {
    var g = ensureBgmGain();
    if (!g) return;

    var mel = BGM_MELODY[step % BGM_MELODY.length];
    if (mel && NOTE[mel]) blip(NOTE[mel], time, BGM_STEP_DUR * 0.9, 'square', 0.11, g);

    if (step % 2 === 0) {
      var bass = BGM_BASS[(step / 2) % BGM_BASS.length];
      if (bass && NOTE[bass]) blip(NOTE[bass], time, BGM_STEP_DUR * 1.7, 'triangle', 0.16, g);
    } else {
      blip(3200, time, 0.03, 'square', 0.025, g); // hat nhẹ
    }
  }

  function bgmTick() {
    if (!ctx || !bgmEnabled || bgmMode !== 'synth') return;
    var now = ctx.currentTime;
    var guard = 0;
    while (bgmNextTime < now + 0.15 && guard < 32) {
      scheduleBgmStep(bgmStep, bgmNextTime);
      bgmNextTime += BGM_STEP_DUR;
      bgmStep++;
      guard++;
    }
  }

  function startSynthBgm() {
    if (!ensureContext()) return;
    ensureBgmGain();
    if (bgmTimer) return;
    bgmStep = 0;
    bgmNextTime = ctx.currentTime + 0.06;
    bgmTimer = setInterval(bgmTick, 40);
  }

  function stopSynthBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function playFileBgm() {
    if (!bgmEl) {
      synthFallback();
      return;
    }
    try {
      var p = bgmEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          synthFallback();
        });
      }
    } catch (e) {
      synthFallback();
    }
  }

  /** Chuyển vĩnh viễn sang nhạc synth (khi file lỗi/không có). */
  function synthFallback() {
    bgmMode = 'synth';
    if (bgmEl) {
      try {
        bgmEl.pause();
      } catch (e) {
        /* bỏ qua */
      }
    }
    if (bgmEnabled) startSynthBgm();
  }

  /** Có file BGM được khai báo sẵn trên thẻ <audio> không. */
  function hasBgmFile() {
    if (!bgmEl || typeof bgmEl.getAttribute !== 'function') return false;
    return !!bgmEl.getAttribute('src');
  }

  /**
   * Bắt đầu BGM: ưu tiên file khai báo trên thẻ <audio>, nếu không có thì
   * synth. Chỉ nên gọi sau tương tác đầu tiên của người dùng.
   */
  function startBgm() {
    if (!bgmEnabled) return;
    if (!ensureContext()) return;

    if (bgmMode === 'synth' || !hasBgmFile()) {
      bgmMode = 'synth';
      startSynthBgm();
      return;
    }

    bgmMode = 'file';
    playFileBgm(); // lỗi tải → onerror / promise catch → synthFallback()
  }

  function stopBgm() {
    stopSynthBgm();
    if (bgmEl) {
      try {
        bgmEl.pause();
      } catch (e) {
        /* bỏ qua */
      }
    }
  }

  function setBgmEnabled(value) {
    bgmEnabled = !!value;
    saveBgmEnabled(bgmEnabled);
    if (bgmEnabled) startBgm();
    else stopBgm();
    return bgmEnabled;
  }

  function toggleBgm() {
    return setBgmEnabled(!bgmEnabled);
  }

  function isBgmEnabled() {
    return bgmEnabled;
  }

  /** Gắn thẻ <audio> làm nguồn file BGM; lỗi tải → fallback synth. */
  function attachBgmElement(el) {
    bgmEl = el || null;
    if (bgmEl && typeof bgmEl.addEventListener === 'function') {
      bgmEl.addEventListener('error', function () {
        synthFallback();
      });
    }
    return bgmEl;
  }

  return {
    initAudio: initAudio,
    playEat: playEat,
    playLevelUp: playLevelUp,
    playMove: playMove,
    playGameOver: playGameOver,
    toggleMute: toggleMute,
    setMuted: setMuted,
    isMuted: isMuted,
    // BGM
    attachBgmElement: attachBgmElement,
    startBgm: startBgm,
    stopBgm: stopBgm,
    toggleBgm: toggleBgm,
    setBgmEnabled: setBgmEnabled,
    isBgmEnabled: isBgmEnabled
  };
});
