'use strict';
/* =========================================================
   Banda sonora generada por código (Web Audio API).
   Se compone a 120 BPM (1 compás = 2 s) para que los cortes
   de escena caigan en tiempos fuertes, y se renderiza de una
   vez con OfflineAudioContext: así la reproducción y la
   búsqueda quedan perfectamente sincronizadas con el vídeo.
   Los efectos (golpes, pops, barridos…) llegan como "cues"
   desde la línea de tiempo visual.
   ========================================================= */
const Soundtrack = (() => {
  const SR = 44100;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function xorshift(seed) {
    let s = seed | 0 || 1;
    return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; };
  }
  function makeNoise(ac) {
    const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), r = xorshift(1234567);
    for (let i = 0; i < len; i++) d[i] = r();
    return b;
  }
  function makeIR(ac, sec = 2.6, decay = 3) {
    const len = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c), r = xorshift(99 + c * 17);
      for (let i = 0; i < len; i++) d[i] = r() * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function Synth(ac) {
    const master = ac.createGain();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = .004; comp.release.value = .18;
    master.connect(comp); comp.connect(ac.destination);
    const music = ac.createGain(); music.gain.value = .72; music.connect(master);
    const sfx = ac.createGain(); sfx.gain.value = .75; sfx.connect(master);
    const pads = ac.createGain(); pads.connect(music);           // bus con "sidechain"
    const rev = ac.createConvolver(); rev.buffer = makeIR(ac);
    const revOut = ac.createGain(); revOut.gain.value = .3; rev.connect(revOut); revOut.connect(master);
    const noise = makeNoise(ac);

    // Envolvente: ataque lineal + caída exponencial (decay) o sostenido + liberación
    function env(g, t, { a = .005, peak = .3, decay = null, hold = 0, r = .1 }) {
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      if (decay != null) { g.gain.setTargetAtTime(0, t + a, decay / 4); return t + a + decay * 1.25; }
      g.gain.setValueAtTime(peak, t + a + hold);
      g.gain.setTargetAtTime(0, t + a + hold, r / 4);
      return t + a + hold + r * 1.25;
    }
    function filt(src, t, f) {
      if (!f) return src;
      const b = ac.createBiquadFilter();
      b.type = f.type || 'lowpass';
      b.frequency.setValueAtTime(f.f, t);
      if (f.f2) b.frequency.exponentialRampToValueAtTime(f.f2, t + (f.d || .2));
      if (f.f3) b.frequency.exponentialRampToValueAtTime(f.f3, t + (f.d || .2) + (f.d2 || .2));
      b.Q.value = f.q ?? .7;
      src.connect(b);
      return b;
    }
    function route(node, o) {
      let out = node;
      if (o.pan) { const p = ac.createStereoPanner(); p.pan.value = o.pan; out.connect(p); out = p; }
      out.connect(o.dest || music);
      if (o.send) { const s = ac.createGain(); s.gain.value = o.send; out.connect(s); s.connect(rev); }
    }
    // Los nodos no se crean al componer: se encolan y se instancian justo
    // antes de sonar (ver render), para que el grafo sea siempre pequeño.
    const queue = [];
    const osc = (t, o) => queue.push([t, () => oscNow(t, o)]);
    const nz = (t, o) => queue.push([t, () => nzNow(t, o)]);
    function oscNow(t, o) {
      const n = ac.createOscillator();
      n.type = o.type || 'sine';
      n.frequency.setValueAtTime(o.f, t);
      if (o.f2) n.frequency.exponentialRampToValueAtTime(o.f2, t + (o.fd || .1));
      if (o.det) n.detune.value = o.det;
      const g = ac.createGain();
      filt(n, t, o.filter).connect(g);
      const end = env(g, t, o);
      route(g, o);
      n.start(t); n.stop(end + .05);
    }
    function nzNow(t, o) {
      const n = ac.createBufferSource();
      n.buffer = noise; n.loop = true;
      const g = ac.createGain();
      filt(n, t, o.filter).connect(g);
      const end = env(g, t, o);
      route(g, o);
      n.start(t, (t * .37) % 1.5); n.stop(end + .05);
    }

    const I = {
      // --- batería ---
      kick(t, v = 1) { osc(t, { f: 150, f2: 42, fd: .13, a: .002, peak: .95 * v, decay: .42 }); nz(t, { a: .001, peak: .1 * v, decay: .02, filter: { type: 'highpass', f: 2500 } }); },
      snare(t, v = 1) { nz(t, { a: .001, peak: .3 * v, decay: .18, filter: { type: 'bandpass', f: 1900, q: .8 }, send: .12 }); osc(t, { type: 'triangle', f: 220, f2: 150, fd: .08, peak: .2 * v, decay: .1 }); },
      clap(t, v = 1) {
        for (const dt of [0, .011, .023]) nz(t + dt, { a: .001, peak: .2 * v, decay: .03, filter: { type: 'bandpass', f: 1300, q: 1.2 } });
        nz(t + .03, { a: .002, peak: .17 * v, decay: .18, filter: { type: 'bandpass', f: 1300, q: 1 }, send: .2 });
      },
      hat(t, v = 1, open = false) { nz(t, { a: .001, peak: .085 * v, decay: open ? .26 : .045, filter: { type: 'highpass', f: 7500 }, pan: .2 }); },
      chuff(t, v = 1) { nz(t, { a: .008, peak: .17 * v, decay: .13, filter: { type: 'bandpass', f: 1400, f2: 480, d: .12, q: 1.2 }, pan: -.15 }); },
      wood(t, hi = true, v = 1) { osc(t, { f: hi ? 1650 : 1240, a: .001, peak: .09 * v, decay: .05, send: .15, pan: hi ? .3 : -.3 }); },
      // --- tonales ---
      bass(t, m, d, v = 1, type = 'sawtooth') { osc(t, { type, f: mtof(m), a: .005, peak: .19 * v, hold: Math.max(0, d - .05), r: .08, filter: { f: 1400, f2: 260, d: Math.min(.3, d), q: 3 } }); },
      sub(t, m, d, v = 1) { osc(t, { f: mtof(m), a: .01, peak: .3 * v, hold: Math.max(0, d - .06), r: .06 }); },
      pluck(t, m, v = 1) { osc(t, { type: 'triangle', f: mtof(m), a: .002, peak: .13 * v, decay: .38, send: .22 }); osc(t, { f: mtof(m + 12), a: .002, peak: .035 * v, decay: .15 }); },
      pad(t, notes, d, v = 1, att = .5, rel = .9) {
        for (const m of notes) for (const det of [-9, 9])
          osc(t, { type: 'sawtooth', f: mtof(m), det, a: att, peak: .028 * v, hold: Math.max(0, d - att), r: rel, filter: { f: 1500, q: .5 }, dest: pads, send: .3 });
      },
      stab(t, notes, v = 1) {
        for (const m of notes) for (const det of [-7, 7])
          osc(t, { type: 'sawtooth', f: mtof(m), det, a: .004, peak: .05 * v, decay: .26, filter: { f: 600, f2: 3200, d: .04, f3: 700, d2: .2, q: 2 }, send: .18 });
      },
      arp(t, m, v = 1) { osc(t, { type: 'square', f: mtof(m), a: .002, peak: .05 * v, decay: .11, filter: { f: 3500 }, send: .12, pan: m % 2 ? .25 : -.25 }); },
      lead(t, m, d, v = 1) {
        for (const det of [-6, 6]) osc(t, { type: 'sawtooth', f: mtof(m), det, a: .01, peak: .055 * v, hold: Math.max(0, d - .06), r: .18, filter: { f: 2800, q: 1 }, send: .28 });
        osc(t, { type: 'square', f: mtof(m - 12), a: .01, peak: .022 * v, hold: Math.max(0, d - .06), r: .15, filter: { f: 1500 } });
      },
      bell(t, m, v = 1) {
        osc(t, { f: mtof(m), a: .002, peak: .11 * v, decay: 1.4, send: .45 });
        osc(t, { f: mtof(m) * 2.76, a: .002, peak: .035 * v, decay: .5, send: .4 });
        osc(t, { f: mtof(m) * 5.4, a: .001, peak: .012 * v, decay: .2 });
      },
      // --- efectos ---
      impact(t, v = 1) {
        osc(t, { f: 120, f2: 30, fd: .6, a: .002, peak: .85 * v, decay: 1.6, dest: sfx });
        osc(t, { f: 180, f2: 45, fd: .15, peak: .6 * v, decay: .4, dest: sfx });
        nz(t, { a: .002, peak: .3 * v, decay: 1.8, filter: { type: 'highpass', f: 2500 }, send: .6, dest: sfx });
        nz(t, { a: .002, peak: .35 * v, decay: .25, filter: { type: 'lowpass', f: 900 }, dest: sfx });
      },
      riser(t, d = 2, v = 1) {
        nz(t, { a: d * .95, peak: .2 * v, hold: 0, r: .08, filter: { type: 'bandpass', f: 300, f2: 7000, d, q: 1.6 }, send: .35, dest: sfx });
        osc(t, { type: 'sawtooth', f: 110, f2: 880, fd: d, a: d * .9, peak: .035 * v, r: .05, filter: { f: 1800 }, dest: sfx, send: .2 });
      },
      whoosh(t, d = .5, v = 1) { nz(t, { a: d * .55, peak: .2 * v, hold: 0, r: d * .45, filter: { type: 'bandpass', f: 400, f2: 3500, d: d * .55, f3: 600, d2: d * .45, q: 1.4 }, send: .25, dest: sfx }); },
      pop(t, n = 0, v = 1) {
        const m = [76, 79, 81, 84, 88, 91][n % 6];
        osc(t, { f: mtof(m - 12), f2: mtof(m), fd: .04, a: .002, peak: .15 * v, decay: .12, dest: sfx, send: .15 });
        osc(t, { type: 'triangle', f: mtof(m), a: .002, peak: .05 * v, decay: .08, dest: sfx });
      },
      slam(t, v = 1) { osc(t, { f: 140, f2: 38, fd: .2, a: .002, peak: .85 * v, decay: .6, dest: sfx }); nz(t, { a: .002, peak: .28 * v, decay: .3, filter: { type: 'lowpass', f: 1200 }, send: .3, dest: sfx }); },
      thud(t, v = 1) { osc(t, { f: 110, f2: 50, fd: .1, a: .002, peak: .5 * v, decay: .25, dest: sfx }); nz(t, { a: .002, peak: .12 * v, decay: .08, filter: { type: 'bandpass', f: 500 }, dest: sfx }); },
      tick(t, v = 1) { nz(t, { a: .001, peak: .045 * v, decay: .018, filter: { type: 'highpass', f: 4000 }, dest: sfx, pan: Math.sin(t * 91) * .3 }); },
      hit(t, v = 1) { nz(t, { a: .001, peak: .3 * v, decay: .22, filter: { type: 'bandpass', f: 1800, q: .8 }, send: .3, dest: sfx }); osc(t, { f: 90, f2: 45, fd: .2, peak: .45 * v, decay: .4, dest: sfx }); },
    };
    return { ac, I, master, pads, queue };
  }

  /* ---------------- Composición ---------------- */
  // Progresión Am – F – C – G (raíz del bajo + acorde)
  const PROG = [{ r: 45, c: [57, 60, 64] }, { r: 41, c: [57, 60, 65] }, { r: 48, c: [55, 60, 64] }, { r: 43, c: [55, 59, 62] }];
  // Motivo de la melodía (capítulo IV): [tiempo, nota, duración] en negras
  const LEAD = [
    [[0, 76, 1], [1, 74, .5], [1.5, 72, .5], [2, 69, 1.5], [3.5, 72, .5]],
    [[0, 74, 1], [1, 72, .5], [1.5, 69, .5], [2, 67, 1], [3, 64, 1]],
  ];

  function compose(S, cues, D) {
    const { I, master, pads } = S;
    master.gain.setValueAtTime(0, 0);
    master.gain.linearRampToValueAtTime(.85, .4);
    master.gain.setValueAtTime(.85, D - 2.4);
    master.gain.linearRampToValueAtTime(0, D);

    const bars = Math.floor(D / 2);
    for (let bar = 0; bar < bars; bar++) {
      const t = bar * 2, { r, c } = PROG[bar % 4];
      const q = k => t + k * .5, e = k => t + k * .25, s16 = k => t + k * .125;
      const sec = t < 10 ? 0 : t < 98 ? 1 + Math.floor((t - 10) / 22) : 5;
      const local = sec >= 1 && sec <= 4 ? t - (10 + 22 * (sec - 1)) : 0;

      if (sec === 0) {                                   // INTRO: reloj + pad
        I.pad(t, c, 2, bar === 0 ? .6 : .8, bar === 0 ? 1.6 : .4);
        for (let k = 0; k < 4; k++) I.wood(q(k), k % 2 === 0, .9);
        if (bar >= 2) for (let k = 0; k < 8; k++) I.bass(e(k), r, .2, .5 + .12 * (bar - 2));
        if (bar >= 3) { I.kick(q(0), .8); I.kick(q(2), .8); }
        if (bar === 4) for (let k = 0; k < 16; k++) I.hat(s16(k), .3 + k * .04);
        continue;
      }
      if (sec === 5) {                                   // CIERRE
        if (t < 106) {
          I.pad(t, c, 2, .9, .3); I.bass(t, r, 1.9, .55); I.kick(q(0), .7);
          for (let k = 0; k < 4; k++) { I.bell(q(k), c[k % 3] + 12, .55); I.wood(q(k), k % 2 === 0, .35); }
        } else if (t === 106) {
          I.pad(t, c, 2, .6, .2);
        } else if (t === 108) {
          I.pad(t, [57, 60, 64, 69], 3.2, 1.3, .05, 2.2);
          I.sub(t, 33, 2.6, .8); I.bell(t, 69, 1); I.bell(t + .5, 76, .6); I.bell(t + 1, 81, .45);
        }
        continue;
      }

      if (local < 4) {                                   // PORTADILLA: más espacio
        I.pad(t, c, 2, 1, .3); I.bass(t, r, 1.9, .8); I.kick(q(0), .9);
        for (let k = 0; k < 4; k++) I.wood(q(k), k % 2 === 0, .4);
        if (sec === 1) for (let k = 0; k < 8; k++) I.chuff(e(k), k % 2 ? .25 : .45);
        if (sec === 2) for (let k = 0; k < 8; k++) I.hat(e(k), .45);
        if (sec === 3) for (let k = 0; k < 8; k++) I.arp(e(k), c[k % 3] + 12, .6);
        if (sec === 4) for (let k = 1; k < 8; k += 2) I.hat(e(k), .6, true);
      } else if (sec === 1) {                            // I · vapor: chuf-chuf mecánico
        const acc = [1, .45, .7, .45, 1, .45, .7, .6];
        for (let k = 0; k < 8; k++) I.chuff(e(k), acc[k]);
        I.kick(q(0)); I.kick(q(2)); I.kick(e(7), .55);
        [r, r + 12, r + 7, r + 12].forEach((m, k) => I.bass(q(k), m, .45, .9));
        [0, 1, 2, 1, 0, 1, 2, 1].forEach((ix, k) => I.pluck(e(k), c[ix] + 12, .9));
        I.pad(t, c, 2, .5, .3);
        for (let k = 0; k < 4; k++) I.wood(q(k), k % 2 === 0, .35);
      } else if (sec === 2) {                            // II · electricidad: marcha con metales
        I.kick(q(0)); I.kick(q(2)); I.kick(e(5), .7);
        I.snare(q(1)); I.snare(q(3));
        for (let k = 0; k < 8; k++) I.hat(e(k), k % 2 ? .5 : .8, k === 7);
        for (let k = 0; k < 8; k++) I.bass(e(k), k % 2 ? r + 12 : r, .2, .85);
        I.stab(e(3), c); I.stab(e(6), c, .8);
        I.pad(t, c, 2, .55, .3);
        I.bell(q(0), c[2] + 12, .5);
      } else if (sec === 3) {                            // III · electrónica: chiptune
        I.kick(s16(0)); I.kick(s16(6), .8); I.kick(s16(10), .9);
        I.snare(q(1)); I.snare(q(3));
        for (let k = 0; k < 16; k++) I.hat(s16(k), k % 2 ? .25 : .5);
        for (let k = 0; k < 8; k++) I.bass(e(k), k % 2 ? r + 12 : r, .2, .75, 'square');
        const ar = [c[0], c[1], c[2], c[0] + 12];
        for (let k = 0; k < 16; k++) I.arp(s16(k), ar[k % 4] + 12, k % 4 === 0 ? 1 : .7);
        I.pad(t, c, 2, .4, .3);
      } else if (sec === 4) {                            // IV · IA: four-on-the-floor + sidechain
        for (let k = 0; k < 4; k++) {
          I.kick(q(k));
          pads.gain.setValueAtTime(.22, q(k));
          pads.gain.linearRampToValueAtTime(1, q(k) + .38);
        }
        I.clap(q(1)); I.clap(q(3));
        for (let k = 1; k < 8; k += 2) I.hat(e(k), .8, true);
        for (let k = 0; k < 16; k++) I.hat(s16(k), .28);
        for (let k = 1; k < 8; k += 2) { I.sub(e(k), r, .2, .7); I.bass(e(k), r + 12, .2, .6); }
        I.pad(t, [...c, c[0] + 12], 2, 1.15, .05, .3);
        for (const [b, m, d] of LEAD[bar % 2]) I.lead(t + b * .5, m, d * .5);
      }

      if (local === 20) for (let k = 12; k < 16; k++) I.snare(s16(k), .45 + (k - 12) * .18);   // redoble antes del corte
    }

    for (const q of cues) {
      switch (q.type) {
        case 'impact': I.impact(q.t, q.v || 1); break;
        case 'final': I.impact(q.t, 1.2); break;
        case 'riser': I.riser(q.t, q.dur || 2, q.v || 1); break;
        case 'whoosh': I.whoosh(q.t, q.dur || .5, q.v || 1); break;
        case 'pop': I.pop(q.t, q.n || 0, q.v || 1); break;
        case 'slam': I.slam(q.t, q.v || 1); break;
        case 'thud': I.thud(q.t, q.v || 1); break;
        case 'tick': I.tick(q.t, q.v || 1); break;
        case 'hit': I.hit(q.t, q.v || 1); break;
      }
    }
  }

  async function render(duration, cues) {
    const ac = new OfflineAudioContext(2, Math.ceil(SR * duration), SR);
    const S = Synth(ac);
    compose(S, cues, duration);
    // Instanciar los eventos por ventanas de 1 s, pausando el render justo antes
    const q = S.queue.sort((a, b) => a[0] - b[0]);
    let i = 0;
    const spawn = until => { while (i < q.length && q[i][0] < until) q[i++][1](); };
    spawn(1);
    for (let k = 1; k < duration; k++) {
      ac.suspend(k - .05).then(() => { spawn(k + 1); ac.resume(); });
    }
    return ac.startRendering();
  }

  return { render };
})();
