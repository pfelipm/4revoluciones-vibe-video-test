/* ============================================================
   4REVOLUCIONES — script.js
   Motor de "vídeo" 100% código:
   · transporte (play/pause/seek) con reloj sincronizado al AudioContext
   · motor de escenas con wipes, contadores, máquina de escribir
   · partículas en canvas (brasa, arcos eléctricos, lluvia digital, neuronas)
   · banda sonora procedural: 4 estilos por era + pads + SFX (Web Audio API)
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const TAU = Math.PI * 2;

  /* ================== CONFIGURACIÓN DE ESCENAS ==================
     El orden coincide con las <section class="scene"> del HTML.
     d    : duración en segundos
     music: 'ch1'|'ch2'|'ch3'|'ch4'|'pad'|'outro'|null
     era  : capítulo para la barra de progreso (1-4)
     sfx  : [tiempo relativo, nombre del efecto]                    */
  const SCENES = [
    { d: 0.9, music: null, sfx: [['tick', 0], ['tick', 0.45]] },
    { d: 0.9, music: null, sfx: [['tick', 0], ['tick', 0.45]] },
    { d: 0.9, music: null, sfx: [['tick', 0], ['hit', 0.55]] },
    { d: 10,  music: 'pad',  sfx: [['riser', 0], ['boom', 0.8], ['tick', 4], ['tick', 4.4], ['chime', 8.5]] },
    { d: 6,   music: 'ch1', era: 1, sfx: [['scratch', 0], ['hit', 0.5], ['steam', 1.1], ['whistle', 3.4]] },
    { d: 10,  music: 'ch1', era: 1, sfx: [['motor', 0.8], ['ding', 5.4]] },
    { d: 10,  music: 'ch1', era: 1, sfx: [['whistle', 1.4], ['thud', 4.6], ['ding', 6.2]] },
    { d: 8,   music: 'ch1', era: 1, sfx: [['train', 0.3], ['thud', 0.9], ['thud', 2], ['thud', 3]] },
    { d: 6,   music: 'ch2', era: 2, sfx: [['scratch', 0], ['zap', 0.5], ['hum', 1.2], ['spark', 3]] },
    { d: 10,  music: 'ch2', era: 2, sfx: [['hit', 1.1], ['spark', 4], ['ding', 6.5]] },
    { d: 10,  music: 'ch2', era: 2, sfx: [['zap', 0.7], ['chime', 3], ['tick', 5.5]] },
    { d: 8,   music: 'ch2', era: 2, sfx: [['boom', 0.4], ['ding', 4.5]] },
    { d: 6,   music: 'ch3', era: 3, sfx: [['scratch', 0], ['blip', 0.45], ['chime', 2.6], ['blip', 4.2]] },
    { d: 10,  music: 'ch3', era: 3, sfx: [['blip', 0.8], ['blip', 3.2], ['ding', 6]] },
    { d: 10,  music: 'ch3', era: 3, sfx: [['whoosh', 1], ['chime', 4.5]] },
    { d: 8,   music: 'ch3', era: 3, sfx: [['motor', 0.9], ['ding', 5]] },
    { d: 6,   music: 'ch4', era: 4, sfx: [['scratch', 0], ['dronePulse', 1.5], ['chime', 3.5]] },
    { d: 10,  music: 'ch4', era: 4, sfx: [['chime', 1], ['blip', 4.5], ['chime', 7]] },
    { d: 10,  music: 'ch4', era: 4, sfx: [['blip', 0.8], ['thud', 4.4]] },
    { d: 8,   music: 'ch4', era: 4, sfx: [['ding', 1], ['ding', 2.6], ['tick', 4.2], ['boom', 6.4]] },
    { d: 14,  music: 'pad', sfx: [['chime', 0.6], ['chime', 5], ['chime', 9.6]] },
    { d: 12,  music: 'outro', sfx: [['boom', 0.3], ['tick', 2], ['thud', 4.2], ['boom', 8.8]] },
  ];

  const scenes = $$('.scene');
  const starts = [];
  let TOTAL = 0;
  for (const s of SCENES) { starts.push(TOTAL); TOTAL += s.d; }

  /* ================== AUDIO CORE ================== */
  let ctx = null, master, comp, musicBus, sfxBus, verbIn, noiseBuf;
  let audioOn = false, muted = false;
  const now = () => ctx.currentTime;

  function makeImpulse(sr, sec, decay) {
    const len = Math.floor(sr * sec);
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function initAudio() {
    if (audioOn) return;
    audioOn = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 24; comp.ratio.value = 8;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    verbIn = ctx.createGain(); verbIn.gain.value = 0.55;
    const rev = ctx.createConvolver(); rev.buffer = makeImpulse(ctx.sampleRate, 2.4, 3.2);
    verbIn.connect(rev); rev.connect(master);
    const len = ctx.sampleRate * 0.5;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
    if (muted) master.gain.value = 0;
  }

  /* --- sintetizadores base --- */
  function osc(type, f, dur, g, dest, t, rv) {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(dest);
    if (rv) gn.connect(verbIn);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function oscSweep(type, f0, f1, dur, g, dest, t, rv) {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(f0, 1), t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(dest);
    if (rv) gn.connect(verbIn);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function vibOsc(type, f, vibF, vibAmt, dur, g, dest, t) {
    const o = ctx.createOscillator(), v = ctx.createOscillator(), vm = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    v.frequency.value = vibF; vm.gain.value = vibAmt;
    v.connect(vm); vm.connect(o.frequency);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t + 0.03);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(dest);
    o.start(t); v.start(t); o.stop(t + dur + 0.05); v.stop(t + dur + 0.05);
  }
  function noiseBurst(t, dur, g, dest, type, f, q, rv) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 1;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t + 0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(gn); gn.connect(dest);
    if (rv) gn.connect(verbIn);
    s.start(t); s.stop(t + dur + 0.05);
  }
  const hp = (t, d, g, dest) => noiseBurst(t, d, g, dest, 'highpass', 7000, 1);
  const lp = (t, d, g, dest, f) => noiseBurst(t, d, g, dest, 'lowpass', f || 600, 1);

  /* --- librería de efectos --- */
  const SFX = {
    tick(t) { osc('square', 1560, 0.035, 0.12, sfxBus, t); osc('square', 2350, 0.03, 0.09, sfxBus, t + 0.05); },
    hit(t) { oscSweep('sine', 150, 48, 0.28, 0.7, sfxBus, t); lp(t, 0.14, 0.35, sfxBus, 400); },
    thud(t) { oscSweep('sine', 110, 40, 0.16, 0.5, sfxBus, t); },
    boom(t) { oscSweep('sine', 92, 34, 0.9, 0.95, sfxBus, t); lp(t, 0.5, 0.5, sfxBus, 260); },
    whoosh(t) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.8;
      fl.frequency.setValueAtTime(350, t); fl.frequency.exponentialRampToValueAtTime(2600, t + 0.18);
      fl.frequency.exponentialRampToValueAtTime(300, t + 0.38);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.3, t + 0.14);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      s.connect(fl); fl.connect(gn); gn.connect(sfxBus); s.start(t); s.stop(t + 0.5);
    },
    ding(t) { osc('sine', 880, 0.55, 0.16, sfxBus, t, true); osc('sine', 1318.5, 0.5, 0.08, sfxBus, t + 0.012, true); },
    chime(t) { [660, 880, 990].forEach((f, i) => osc('sine', f, 0.7, 0.1, sfxBus, t + i * 0.09, true)); },
    zap(t) { oscSweep('sawtooth', 3200, 180, 0.14, 0.22, sfxBus, t); hp(t, 0.07, 0.14, sfxBus); },
    spark(t) { hp(t, 0.05, 0.12, sfxBus); hp(t + 0.08, 0.04, 0.09, sfxBus); osc('square', 4200, 0.03, 0.05, sfxBus, t + 0.03); },
    riser(t) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const fl = ctx.createBiquadFilter(); fl.type = 'highpass';
      fl.frequency.setValueAtTime(500, t); fl.frequency.exponentialRampToValueAtTime(6500, t + 0.85);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.28, t + 0.85);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
      s.connect(fl); fl.connect(gn); gn.connect(sfxBus); s.start(t); s.stop(t + 1);
      for (let i = 0; i < 4; i++) {
        const f = 300 + i * 450;
        oscSweep('sawtooth', f * 0.6, f * 1.6, 0.8, 0.02, sfxBus, t + 0.04);
      }
    },
    scratch(t) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 14; fl.frequency.value = 900;
      fl.frequency.setValueAtTime(900, t); fl.frequency.linearRampToValueAtTime(1600, t + 0.12);
      fl.frequency.linearRampToValueAtTime(700, t + 0.24);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.3, t + 0.03);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      s.connect(fl); fl.connect(gn); gn.connect(sfxBus); s.start(t); s.stop(t + 0.4);
    },
    steam(t) {
      for (let i = 0; i < 3; i++) lp(t + i * 0.18, 0.5, 0.1 + i * 0.02, sfxBus, 500 + i * 200);
      noiseBurst(t, 0.9, 0.05, sfxBus, 'bandpass', 900, 3, true);
    },
    whistle(t) { vibOsc('sine', 2480, 7, 18, 0.5, 0.07, sfxBus, t); vibOsc('sine', 2515, 7, 18, 0.5, 0.05, sfxBus, t + 0.02); },
    motor(t) { osc('sawtooth', 58, 0.55, 0.1, sfxBus, t); osc('sawtooth', 88, 0.55, 0.06, sfxBus, t); lp(t, 0.6, 0.16, sfxBus, 300); },
    train(t) {
      for (let i = 0; i < 5; i++) lp(t + i * 0.22, 0.16, 0.24 - i * 0.03, sfxBus, 420);
      oscSweep('sine', 70, 45, 1.1, 0.25, sfxBus, t);
      noiseBurst(t, 1.1, 0.12, sfxBus, 'lowpass', 500, 1, true);
    },
    hum(t) { osc('sine', 50, 1.4, 0.05, sfxBus, t); osc('sine', 100, 1.4, 0.025, sfxBus, t); },
    dronePulse(t) {
      const gn = ctx.createGain();
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 55;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.2, t + 0.5);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(gn); gn.connect(sfxBus); o.start(t); o.stop(t + 1.5);
    },
    blip(t) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880];
      const f = scale[(Math.random() * scale.length) | 0];
      osc('square', f, 0.065, 0.06, sfxBus, t);
    },
  };

  /* --- motor genérico de música (loops procedimentales) --- */
  function makeEngine(cfg) {
    let g = null;
    const gain = () => {
      if (!g) { g = ctx.createGain(); g.gain.value = 0.0001; g.connect(musicBus); }
      return g;
    };
    const eng = {
      playing: false, bar: 0, step: 0, stepDur: 60 / (cfg.bpm * 4), nextT: 0,
      start(t) {
        if (eng.playing) return;
        eng.playing = true; eng.bar = 0; eng.step = 0; eng.nextT = t + 0.03;
        const c = ctx.currentTime, gn = gain();
        gn.gain.cancelScheduledValues(c);
        gn.gain.setValueAtTime(0.0001, c);
        gn.gain.exponentialRampToValueAtTime(cfg.level || 0.4, c + 0.4);
        if (cfg.onStart) cfg.onStart(t + 0.05);
      },
      stop() {
        if (!eng.playing) return;
        eng.playing = false;
        const c = ctx.currentTime, gn = gain();
        gn.gain.cancelScheduledValues(c);
        gn.gain.setValueAtTime(Math.max(gn.gain.value, 0.0001), c);
        gn.gain.exponentialRampToValueAtTime(0.0001, c + 0.3);
      },
      tick(ct) {
        if (!eng.playing) return;
        while (eng.nextT < ct + 0.24) {
          cfg.step(eng.step, eng.bar, eng.nextT);
          eng.step++;
          if (eng.step >= 16) { eng.step = 0; eng.bar++; if (cfg.onBar) cfg.onBar(eng.bar - 1, eng.nextT); }
          eng.nextT += eng.stepDur;
        }
      },
    };
    return eng;
  }

  /* CAP 01 — VAPOR: 90 BPM, Am, máquina pesada + jadeos de vapor */
  const ch1 = makeEngine({
    bpm: 90, level: 0.5,
    step(s, b, t) {
      const even = s % 2 === 0;
      if (s === 0 || s === 8) { oscSweep('sine', 75, 38, 0.3, 0.4, musicBus, t); lp(t, 0.2, 0.25, musicBus, 250); }
      if (s === 4 || s === 12) oscSweep('sine', 120, 46, 0.19, 0.42, musicBus, t);
      if (s === 2 || s === 6 || s === 10 || s === 14) lp(t, 0.12, 0.16, musicBus, 520);
      if (even) {
        const bass = [55, 0, 55, 0, 65.4, 0, 49, 0, 55, 0, 55, 0, 82.4, 0, 73.4, 0][s];
        if (bass) osc('triangle', bass, 0.26, 0.22, musicBus, t);
      }
      if (s === 2 || s === 10) [220, 261.6, 329.6].forEach(f => {
        const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), gn = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 950;
        gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.09, t + 0.012);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        o.connect(fl); fl.connect(gn); gn.connect(musicBus); o.start(t); o.stop(t + 0.16);
      });
      if (s % 4 === 0) hp(t, 0.35, 0.014, musicBus);
    },
    onBar(b, t) { if (b % 2 === 0) SFX.whistle(t); },
  });

  /* CAP 02 — ELECTRICIDAD: 124 BPM, Fm, funk eléctrico */
  const ch2 = makeEngine({
    bpm: 124, level: 0.5,
    onStart(t) { osc('sine', 50, 3, 0.05, musicBus, t); osc('sine', 100, 3, 0.025, musicBus, t); },
    step(s, b, t) {
      if (s % 4 === 0) oscSweep('sine', 122, 46, 0.2, 0.5, musicBus, t);
      if (s === 2 || s === 6 || s === 10 || s === 14) hp(t, 0.045, 0.07, musicBus);
      const bassRoot = [43.65, 51.91, 43.65, 65.41][s % 4];
      osc('triangle', bassRoot, 0.2, 0.24, musicBus, t);
      const arp = [174.6, 207.65, 261.6, 207.65][s % 4];
      osc('square', arp, 0.058, 0.045, musicBus, t);
      if (s === 0) { oscSweep('sawtooth', 220, 660, 0.1, 0.05, musicBus, t); hp(t, 0.09, 0.05, musicBus); }
      if (s === 12 && Math.random() < 0.6) SFX.spark(t);
    },
  });

  /* CAP 03 — DIGITAL: 140 BPM, Am, chiptune */
  const ch3 = makeEngine({
    bpm: 140, level: 0.45,
    step(s, b, t) {
      if (s === 0 || s === 6 || s === 12) oscSweep('sine', 120, 44, 0.17, 0.4, musicBus, t);
      if (s === 4 || s === 12) noiseBurst(t, 0.09, 0.14, musicBus, 'bandpass', 1900, 0.8);
      if (s === 2 || s === 6 || s === 10 || s === 14) hp(t, 0.03, 0.045, musicBus);
      if (s % 2 === 0) {
        const bass = [55, 0, 55, 0, 82.41, 0, 49, 0, 55, 0, 55, 0, 110, 0, 73.4, 0][s];
        if (bass) osc('triangle', bass, 0.16, 0.2, musicBus, t);
        const arp = [220, 261.6, 329.6, 440][(s / 2 + b) % 4 | 0];
        osc('square', arp, 0.05, 0.035, musicBus, t);
      }
      if (Math.random() < 0.3) {
        const f = [440, 523.25, 587.33, 659.25, 880][(Math.random() * 5) | 0];
        osc('square', f, 0.06, 0.05, musicBus, t);
      }
      if (Math.random() < 0.08) hp(t, 0.03, 0.04, musicBus);
    },
  });

  /* CAP 04 — IA: 72 BPM, ambiente evolutivo */
  const ch4chords = [
    [220, 261.63, 329.63, 392],   // Am(add9)
    [174.61, 220, 261.63],        // F
    [130.81, 164.81, 261.63],     // C
    [98, 123.47, 196],            // G
  ];
  const ch4 = makeEngine({
    bpm: 72, level: 0.5,
    onStart(t) {
      const d = ctx.createOscillator(), gn = ctx.createGain();
      d.type = 'sine'; d.frequency.value = 55;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.12, t + 2);
      d.connect(gn); gn.connect(musicBus); d.start(t);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = 110; g2.gain.value = 0.03;
      o2.connect(g2); g2.connect(musicBus); o2.start(t);
    },
    onBar(b, t) {
      const chord = ch4chords[b % 4];
      chord.forEach((f, i) => {
        const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), gn = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f;
        fl.type = 'lowpass'; fl.frequency.value = 620;
        const st = t + 0.05 * i;
        gn.gain.setValueAtTime(0.0001, st);
        gn.gain.exponentialRampToValueAtTime(0.028 * (2.2 - i * 0.35), st + 0.8);
        gn.gain.exponentialRampToValueAtTime(0.0001, st + 2.2);
        o.connect(fl); fl.connect(gn); gn.connect(musicBus); gn.connect(verbIn);
        o.start(st); o.stop(st + 2.3);
      });
      oscSweep('sine', 92, 38, 0.4, 0.3, musicBus, t);
    },
    step(s, b, t) {
      if (s === 8) hp(t, 0.04, 0.035, musicBus);
      if (Math.random() < 0.16) {
        const f = [880, 987.77, 1174.66, 1318.51, 1567.98][(Math.random() * 5) | 0];
        osc('sine', f, 0.4, 0.045, musicBus, t, true);
      }
    },
  });

  /* PAD (título + recapitulación): cálido, con campanas */
  const padchords = [
    [130.81, 164.81, 196, 246.94], [110, 164.81, 196, 220],
    [174.61, 220, 261.63, 329.63], [98, 146.83, 196, 246.94],
  ];
  const padE = makeEngine({
    bpm: 55, level: 0.42,
    onBar(b, t) {
      const chord = padchords[b % 4];
      chord.forEach((f, i) => {
        const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), gn = ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        fl.type = 'lowpass'; fl.frequency.value = 800;
        const st = t + 0.06 * i;
        gn.gain.setValueAtTime(0.0001, st);
        gn.gain.exponentialRampToValueAtTime(0.05, st + 0.5);
        gn.gain.exponentialRampToValueAtTime(0.0001, st + 3.4);
        o.connect(fl); fl.connect(gn); gn.connect(musicBus); gn.connect(verbIn);
        o.start(st); o.stop(st + 3.5);
      });
    },
    step(s, b, t) {
      if (s % 4 === 0) {
        const chord = padchords[b % 4];
        const n = chord[(Math.random() * chord.length) | 0] * 2;
        osc('sine', n, 0.65, 0.06, musicBus, t, true);
      }
    },
  });

  /* OUTRO: resolución Am → F → C → G y cierre */
  const outChords = [[220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23],
                     [130.81, 196, 261.63, 329.63], [98, 146.83, 196, 293.66]];
  const outro = makeEngine({
    bpm: 72, level: 0.5,
    onBar(b, t) {
      const chord = outChords[b % 4];
      chord.forEach((f, i) => {
        const st = t + 0.03 * i;
        osc('sawtooth', f, 0.5, 0.035, musicBus, st, true);
        const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), gn = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f / 2;
        fl.type = 'lowpass'; fl.frequency.value = 500;
        gn.gain.setValueAtTime(0.0001, st);
        gn.gain.exponentialRampToValueAtTime(0.05, st + 0.4);
        gn.gain.exponentialRampToValueAtTime(0.0001, st + 1.6);
        o.connect(fl); fl.connect(gn); gn.connect(musicBus); o.start(st); o.stop(st + 1.7);
      });
    },
    step(s, b, t) {
      if (s % 4 === 0 && Math.random() < 0.5) {
        const chord = outChords[b % 4];
        osc('sine', chord[(Math.random() * chord.length) | 0] * 2, 0.5, 0.05, musicBus, t, true);
      }
    },
  });
  const MUSIC = { ch1, ch2, ch3, ch4, pad: padE, outro };

  /* ================== RELOJ / TRANSPORTE ================== */
  let playing = false, videoTime = 0, t0 = 0, currentMusic = null;
  let usePerfClock = false, perfBase = 0;
  const clock = () => {
    if (audioOn && ctx) return playing ? ctx.currentTime - t0 : videoTime;
    if (usePerfClock) return performance.now() / 1000 - perfBase;
    return videoTime;
  };

  /* ================== CUES (SFX sincronizados) ================== */
  const cues = [];
  SCENES.forEach((sc, i) => sc.sfx.forEach(([rel, name]) => cues.push({ t: starts[i] + rel, name })));
  cues.sort((a, b) => a.t - b.t);
  let ci = 0;
  function syncCues() { ci = 0; while (ci < cues.length && cues[ci].t < videoTime) ci++; }
  function tickCues(ct) {
    if (!audioOn) return;
    const ahead = ctx.currentTime - ct;
    while (ci < cues.length && cues[ci].t <= ct + 0.2) {
      if (cues[ci].t >= ct - 0.08) SFX[cues[ci].name](cues[ci].t + ahead);
      ci++;
    }
  }

  /* ================== MOTOR DE ESCENAS ================== */
  const wipe = $('#wipe');
  let lastIdx = -1, switchTimer = null;

  function render(t) {
    let idx = 0;
    for (let i = 0; i < SCENES.length; i++) if (t >= starts[i]) idx = i;
    if (idx !== lastIdx) switchScene(idx, t);
    const el = scenes[idx];
    if (el && t > starts[idx] + SCENES[idx].d - 0.55 && !el.classList.contains('exit')) el.classList.add('exit');
    hud(t);
  }

  function switchScene(idx, t) {
    lastIdx = idx;
    wipe.classList.add('cover');
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => {
      scenes.forEach(el => el.classList.remove('active', 'exit'));
      scenes[idx].classList.add('active');
      wipe.classList.remove('cover');
      runSceneFX(idx);
      if (audioOn) {
        const m = SCENES[idx].music;
        if (m !== currentMusic) {
          if (currentMusic && MUSIC[currentMusic]) MUSIC[currentMusic].stop();
          if (m && MUSIC[m]) MUSIC[m].start(ctx.currentTime);
          currentMusic = m;
        }
      }
    }, 130);
  }

  function runSceneFX(idx) {
    const el = scenes[idx];
    if (!el) return;
    animateCounters(el);
    typeWriters(el);
    if (idx === 3) spawnConfetti();
    setFxMode(el.dataset.fx || '');
  }

  /* contadores animados */
  function animateCounters(root) {
    root.querySelectorAll('.cnt').forEach(c => {
      const to = parseFloat(c.dataset.to) || 0, suf = c.dataset.suffix || '';
      const t0 = performance.now(), dur = 950;
      const step = (n) => {
        const p = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        c.textContent = Math.round(to * e).toLocaleString('es-ES') + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* máquina de escribir */
  function typeWriters(root) {
    root.querySelectorAll('[data-type]').forEach(el => {
      const txt = el.dataset.type; if (!txt) return;
      if (el.textContent === txt) return;
      el.dataset.type = ''; el.textContent = '';
      let i = 0;
      const iv = setInterval(() => {
        el.textContent = txt.slice(0, ++i);
        if (i >= txt.length) clearInterval(iv);
      }, 26);
    });
  }

  /* confeti neobrutalista (título) */
  function spawnConfetti() {
    const zone = $('#confettiZone');
    if (!zone) return;
    zone.innerHTML = '';
    const colors = ['var(--yellow)', 'var(--pink)', 'var(--cyan)', 'var(--lime)', 'var(--paper)'];
    for (let i = 0; i < 34; i++) {
      const s = document.createElement('span');
      s.className = 'conf';
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[(Math.random() * colors.length) | 0];
      s.style.animationDuration = (2.1 + Math.random() * 1.6) + 's';
      s.style.animationDelay = (Math.random() * 1.6) + 's';
      s.style.transform = `rotate(${Math.random() * 180}deg)`;
      zone.appendChild(s);
    }
  }

  /* ================== PARTÍCULAS (canvas) ================== */
  const canvas = $('#fx'), g2d = canvas.getContext('2d');
  let fxMode = '', parts = [], lastDraw = 0, arcTimer = 0;
  function setFxMode(m) { fxMode = m; parts = []; arcTimer = 0; fxCache = {}; }

  function fitCanvas() {
    const r = $('#stage').getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    g2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(fitCanvas).observe($('#stage'));

  /* lluvia digital preparada */
  const RAIN_GLYPHS = '01<>[]{}/\\#$*+';
  let rainCols = [];
  function initRain(w, h) {
    const n = Math.max(16, Math.floor(w / 26));
    rainCols = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, s: 90 + Math.random() * 210,
      g: RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0], size: 11 + Math.random() * 6,
    }));
  }
  let fxCache = {};
  function ensureFx(w, h) {
    if (fxMode === 'rain' && !rainCols.length) initRain(w, h);
    if ((fxMode === 'nodes' || fxMode === 'embers') && !fxCache.n) {
      const n = fxMode === 'nodes' ? 40 : 46;
      fxCache.n = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14,
        r: 1.2 + Math.random() * 2.6, life: 2.2 + Math.random() * 2.5, t: Math.random() * 4,
      }));
    }
  }

  function drawFx(ts) {
    const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2)), h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
    const dt = Math.min(0.05, lastDraw ? (ts - lastDraw) / 1000 : 0.016);
    lastDraw = ts;
    if (!(playing || usePerfClock)) return;
    g2d.clearRect(0, 0, w, h);
    if (!fxMode) return;
    ensureFx(w, h);

    if (fxMode === 'embers') {
      if (Math.random() < 0.5) parts.push({
        x: Math.random() * w, y: h + 8, vx: (Math.random() - 0.5) * 18,
        vy: -(20 + Math.random() * 40), t: 0,
        life: 2.2 + Math.random() * 2.6, r: 1.4 + Math.random() * 2.6,
        c: ['#ff6b1a', '#ffd100', '#3a3a3a'][(Math.random() * 3) | 0],
      });
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.t += dt;
        if (p.t > p.life) { parts.splice(i, 1); continue; }
        if (p.smoke) continue;
        p.x += p.vx * dt + Math.sin(p.t * 2.2 + p.x) * 14 * dt;
        p.y += p.vy * dt;
        const a = 1 - p.t / p.life;
        g2d.globalAlpha = a * 0.9;
        g2d.fillStyle = p.c;
        g2d.fillRect(p.x, p.y, p.r * 2.4, p.r * 2.4);
      }
      if (Math.random() < 0.06) parts.push({
        x: Math.random() * w, y: h * (0.55 + Math.random() * 0.4), vx: 0, vy: -(9 + Math.random() * 10),
        t: 0, life: 3.4, r: 5 + Math.random() * 5, c: 'rgba(242,238,228', smoke: true,
      });
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (!p.smoke) continue;
        p.t += dt;
        if (p.t > p.life) { parts.splice(i, 1); continue; }
        p.y += p.vy * dt; p.x += Math.sin(p.t + i) * 8 * dt;
        const a = 0.28 * (1 - p.t / p.life);
        g2d.fillStyle = p.c + ',' + a + ')';
        g2d.beginPath(); g2d.arc(p.x, p.y, p.r * (0.6 + p.t / p.life), 0, TAU); g2d.fill();
      }
      g2d.globalAlpha = 1;
    }

    if (fxMode === 'arcs') {
      arcTimer -= dt;
      if (arcTimer <= 0) {
        arcTimer = 0.16 + Math.random() * 0.3;
        const y0 = h * (0.15 + Math.random() * 0.7), x0 = Math.random() * w;
        const y1 = y0 + (Math.random() - 0.5) * 140, x1 = Math.random() * w;
        parts.push({ x0, y0, x1, y1, t: 0, life: 0.22, seeds: Math.random() * 10 });
        if (Math.random() < 0.5) parts.push({ x0: x1, y0: y1, x1: x0 + 30, y1: y1 - 20, t: 0, life: 0.15, seeds: Math.random() * 10 });
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.t += dt;
        if (p.t > p.life) { parts.splice(i, 1); continue; }
        const fade = 1 - p.t / p.life;
        g2d.strokeStyle = `rgba(120,240,255,${fade * 0.85})`;
        g2d.lineWidth = 2;
        g2d.beginPath(); g2d.moveTo(p.x0, p.y0);
        const seg = 6;
        for (let s = 1; s <= seg; s++) {
          const t = s / seg;
          const wob = (Math.random() - 0.5) * 26;
          g2d.lineTo(p.x0 + (p.x1 - p.x0) * t + wob, p.y0 + (p.y1 - p.y0) * t + wob * 0.7);
        }
        g2d.stroke();
      }
    }

    if (fxMode === 'rain') {
      g2d.font = `bold ${rainCols[0] ? rainCols[0].size : 14}px 'Space Mono', monospace`;
      for (const c of rainCols) {
        c.y += c.s * dt;
        if (c.y > h + 20) { c.y = -20; c.x = Math.random() * w; c.s = 90 + Math.random() * 210; }
        c.g = RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0];
        const a = Math.min(0.85, (h - c.y) / h + 0.1);
        g2d.fillStyle = `rgba(195,255,0,${Math.max(a, 0.12)})`;
        g2d.fillText(c.g, c.x, c.y);
      }
    }

    if (fxMode === 'nodes') {
      const ns = fxCache.n || [];
      for (const n of ns) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.t += dt;
      }
      const maxD = 95;
      for (let i = 0; i < ns.length; i++)
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i], b = ns[j], dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxD) {
            g2d.strokeStyle = `rgba(255,61,129,${(1 - d / maxD) * 0.4})`;
            g2d.lineWidth = 1.2;
            g2d.beginPath(); g2d.moveTo(a.x, a.y); g2d.lineTo(b.x, b.y); g2d.stroke();
          }
        }
      for (const n of ns) {
        const pulse = 0.6 + 0.4 * Math.sin(n.t * 2.4);
        g2d.fillStyle = `rgba(255,61,129,${0.75 * pulse})`;
        g2d.beginPath(); g2d.arc(n.x, n.y, n.r, 0, TAU); g2d.fill();
      }
    }
  }
  (function loop(ts) { requestAnimationFrame(loop); drawFx(ts); })(0);

  /* ================== HUD ================== */
  const tcEl = $('#tc'), knob = $('#knob'), progress = $('#progress');
  const btnPlay = $('#btnPlay'), btnRestart = $('#btnRestart'), btnMute = $('#btnMute'), btnFull = $('#btnFull');
  const eraChunks = [$('#eraChunk1'), $('#eraChunk2'), $('#eraChunk3'), $('#eraChunk4')];

  {
    const eraDur = [0, 0, 0, 0];
    SCENES.forEach(sc => { if (sc.era) eraDur[sc.era - 1] += sc.d; });
    eraChunks.forEach((el, i) => { el.style.flex = eraDur[i] + ' 0 0'; });
  }

  function fmtTC(t) {
    const f = Math.floor((t % 1) * 25);
    const s = Math.floor(t), m = Math.floor(s / 60), h = Math.floor(m / 60);
    const P = (n) => String(n).padStart(2, '0');
    return `${P(h)}:${P(m % 60)}:${P(s % 60)}:${P(f)}`;
  }
  function hud(t) {
    tcEl.textContent = fmtTC(t);
    knob.style.left = `calc(${(t / TOTAL) * 100}% - 4px)`;
  }

  /* ================== CONTROLES ================== */
  function setPlayBtn() {
    btnPlay.textContent = playing ? '❚❚ PAUSA' : '▶ REPRODUCIR';
    btnPlay.classList.toggle('playing', playing);
  }
  function play() {
    if (audioOn && ctx.state === 'suspended') ctx.resume();
    if (videoTime >= TOTAL - 0.02) videoTime = 0;
    if (!audioOn) {
      initAudio();
      t0 = ctx.currentTime - videoTime;
    } else t0 = ctx.currentTime - videoTime;
    syncCues();
    playing = true; setPlayBtn();
  }
  function pause() {
    videoTime = clock();
    playing = false; setPlayBtn();
    if (audioOn) ctx.suspend();
  }
  function seek(t) {
    videoTime = Math.min(Math.max(t, 0), TOTAL);
    if (audioOn && playing) t0 = ctx.currentTime - videoTime;
    syncCues();
    lastIdx = -1;
    scenes.forEach(el => el.classList.remove('active', 'exit'));
    render(videoTime);
    const idx = sceneAt(videoTime);
    runSceneFX(idx);
  }
  function sceneAt(t) { let i = 0; for (; i < SCENES.length; i++) if (t < starts[i]) break; return Math.max(0, i - 1); }
  function toggleMute() {
    muted = !muted;
    if (audioOn) master.gain.value = muted ? 0 : 0.9;
    btnMute.textContent = muted ? 'MUT' : 'SND';
  }

  btnPlay.onclick = () => (playing ? pause() : play());
  btnRestart.onclick = () => { seek(0); if (!playing) play(); };
  btnMute.onclick = toggleMute;
  btnFull.onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };
  progress.addEventListener('pointerdown', (e) => {
    const r = progress.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * TOTAL);
  });
  $$('.chip').forEach((ch, i) => {
    ch.onclick = () => { seek(starts[4 + i * 4]); if (!playing) play(); };
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const k = e.key;
    if (k === ' ') { e.preventDefault(); playing ? pause() : play(); }
    else if (k === 'ArrowRight') { e.preventDefault(); seek(videoTime + 5); }
    else if (k === 'ArrowLeft') { e.preventDefault(); seek(videoTime - 5); }
    else if (k === 'ArrowUp') { e.preventDefault(); seek(videoTime + 1); }
    else if (k === 'ArrowDown') { e.preventDefault(); seek(videoTime - 1); }
    else if (k === 'm' || k === 'M') toggleMute();
    else if (k === 'r' || k === 'R') { seek(0); if (!playing) play(); }
    else if (k === 'f' || k === 'F') btnFull.onclick();
    else if (k >= '1' && k <= '4') { seek(starts[4 + (parseInt(k) - 1) * 4]); if (!playing) play(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) pause();
  });

  /* ================== GATE / INICIO ================== */
  const gate = $('#gate');
  $('#btnStart').onclick = () => {
    initAudio();
    play();
    gate.classList.add('hidden');
    setTimeout(() => { gate.style.display = 'none'; }, 500);
  };

  /* textura de grano para el overlay */
  {
    const c = document.createElement('canvas'); c.width = c.height = 140;
    const g = c.getContext('2d');
    const img = g.createImageData(140, 140);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 40;
    }
    g.putImageData(img, 0, 0);
    $('#noise').style.backgroundImage = `url(${c.toDataURL()})`;
  }

  /* chips con valores calculados */
  $$('.chip').forEach((ch, i) => { ch.dataset.go = starts[4 + i * 4]; });

  /* ================== BUCLE PRINCIPAL ================== */
  setInterval(() => {
    const t = clock();
    if (t >= TOTAL) {
      if (playing) { pause(); btnPlay.textContent = '⟲ REPRODUCIR'; }
      return;
    }
    render(t);
    if (audioOn) {
      tickCues(t);
      const idx = sceneAt(t);
      const m = SCENES[idx].music;
      if (m && MUSIC[m] && MUSIC[m].playing) MUSIC[m].tick(ctx.currentTime);
    }
  }, 50);

  /* ================== MODO FOTO (?shot=X&auto) ================== */
  const q = new URLSearchParams(location.search);
  const shot = parseFloat(q.get('shot'));
  if (!isNaN(shot)) {
    gate.classList.add('hidden'); gate.style.display = 'none';
    usePerfClock = true;
    perfBase = performance.now() / 1000 - Math.min(Math.max(shot, 0), TOTAL - 0.05);
    videoTime = Math.min(Math.max(shot, 0), TOTAL - 0.05);
    playing = true;
    render(videoTime);
    runSceneFX(sceneAt(videoTime));
  }

  /* utilidades expuestas para control externo */
  window.__4rev = {
    play, pause, seek, clock, TOTAL,
    get playing() { return playing; },
    info() {
      return {
        playing, videoTime: clock(), TOTAL, audioOn,
        ctxState: ctx ? ctx.state : null,
        currentMusic,
        musicPlaying: Object.fromEntries(Object.entries(MUSIC).map(([k, m]) => [k, m.playing])),
        canvas: { w: canvas.width, h: canvas.height, mode: fxMode },
        activeScene: scenes.findIndex(el => el.classList.contains('active')),
        tc: tcEl.textContent,
      };
    },
  };
})();