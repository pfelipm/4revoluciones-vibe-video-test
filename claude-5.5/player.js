'use strict';
/* =========================================================
   Reproductor: reloj maestro = AudioContext.currentTime.
   El vídeo se dibuja en cada fotograma con ese reloj, así
   que imagen y sonido no pueden desincronizarse.
   ========================================================= */
(() => {
  const $ = id => document.getElementById(id);
  const stage = $('stage'), ui = $('ui'), splash = $('splash'), bigplay = $('bigplay'), statusEl = $('status');
  const pp = $('pp'), timeEl = $('time'), scrub = $('scrub'), sfill = $('sfill'), shead = $('shead'), muteBtn = $('mute'), fsBtn = $('fs');
  const D = Video.DURATION;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  Video.build(stage);
  fit();
  addEventListener('resize', fit);

  // Marcas de capítulo en la barra de progreso
  const cols = ['#FFF3E0', '#FF6B1A', '#FFCF1A', '#2ED3F5', '#FF4FA0', '#FFF3E0'];
  const C = Video.CHAPTERS;
  scrub.style.background = `linear-gradient(90deg, ${C.map((c, k) => {
    const a = c.t / D * 100, b = (C[k + 1] ? C[k + 1].t : D) / D * 100;
    return `${cols[k]} ${a}% ${b}%`;
  }).join(', ')})`;
  $('marks').innerHTML = C.map(c => `<div class="mark" style="left:${c.t / D * 100}%">${c.l}</div>`).join('');

  /* ---------- estado ---------- */
  let buffer = null, ac = null, out = null, src = null;
  let playing = false, offset = 0, startAt = 0, muted = false, started = false;

  function now() {
    if (!playing) return offset;
    const lat = buffer ? (ac.outputLatency || 0) + (ac.baseLatency || 0) : 0;
    return Math.min(D, Math.max(0, ac.currentTime - startAt - lat));
  }
  function play() {
    if (!ac) { ac = new AudioContext(); out = ac.createGain(); out.connect(ac.destination); }
    ac.resume();
    if (offset >= D - .05) offset = 0;
    const when = ac.currentTime + .06;
    if (buffer) { src = ac.createBufferSource(); src.buffer = buffer; src.connect(out); src.start(when, offset); }
    startAt = when - offset;
    out.gain.value = muted ? 0 : 1;
    playing = true; started = true;
    splash.hidden = true;
    pp.textContent = '❚❚';
    poke();
  }
  function pause() {
    if (!playing) return;
    offset = now();
    if (src) { try { src.stop(); } catch (e) { /* ya parado */ } src.disconnect(); src = null; }
    playing = false;
    pp.textContent = '▶';
    poke();
  }
  const toggle = () => (playing ? pause() : play());
  function seek(t) {
    const was = playing;
    if (was) pause();
    offset = Math.max(0, Math.min(D, t));
    started = true;
    if (was) play();
  }

  /* ---------- bucle de dibujo ---------- */
  Video.render(5.4);   // fotograma de portada detrás del botón
  function frame() {
    let t = now();
    if (playing && t >= D) { pause(); offset = t = D; }
    if (started) Video.render(t);
    timeEl.textContent = `${fmt(t)} / ${fmt(D)}`;
    const pct = t / D * 100;
    sfill.style.width = pct + '%';
    shead.style.left = pct + '%';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- audio ---------- */
  const t0 = performance.now();
  Soundtrack.render(D, Video.cues).then(b => {
    buffer = b;
    statusEl.textContent = `Banda sonora lista (${((performance.now() - t0) / 1000).toFixed(1)} s)`;
  }).catch(err => {
    console.error(err);
    statusEl.textContent = 'No se pudo generar el audio: se reproducirá sin sonido.';
  }).finally(() => { bigplay.disabled = false; bigplay.focus(); });

  /* ---------- controles ---------- */
  bigplay.addEventListener('click', () => { offset = 0; play(); });
  pp.addEventListener('click', toggle);
  stage.addEventListener('click', () => { if (splash.hidden) toggle(); });
  muteBtn.addEventListener('click', toggleMute);
  fsBtn.addEventListener('click', toggleFS);
  function toggleMute() { muted = !muted; if (out) out.gain.value = muted ? 0 : 1; muteBtn.textContent = muted ? '🔇' : '🔊'; }
  function toggleFS() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }

  let dragging = false, wasPlaying = false;
  const posToT = e => { const r = scrub.getBoundingClientRect(); return clamp01((e.clientX - r.left) / r.width) * D; };
  const clamp01 = v => Math.min(1, Math.max(0, v));
  scrub.addEventListener('pointerdown', e => {
    dragging = true; wasPlaying = playing; pause();
    scrub.setPointerCapture(e.pointerId);
    offset = posToT(e); started = true;
  });
  scrub.addEventListener('pointermove', e => { if (dragging) offset = posToT(e); });
  scrub.addEventListener('pointerup', () => { dragging = false; splash.hidden = true; if (wasPlaying) play(); });

  addEventListener('keydown', e => {
    if (bigplay.disabled) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { e.preventDefault(); if (!splash.hidden) { offset = 0; play(); } else toggle(); }
    else if (k === 'arrowright') seek(now() + 5);
    else if (k === 'arrowleft') seek(now() - 5);
    else if (k === 'm') toggleMute();
    else if (k === 'f') toggleFS();
    else if (k === 'home') seek(0);
    else if (/^[0-5]$/.test(k)) { splash.hidden = true; seek(C[+k].t); }
    poke();
  });

  // Ocultar la barra si el ratón no se mueve
  let idleTimer;
  function poke() {
    ui.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (playing) ui.classList.add('idle'); }, 2200);
  }
  addEventListener('pointermove', poke);

  // Gancho para pruebas automatizadas
  window.__player = { play, pause, seek, now, get ready() { return !bigplay.disabled; }, get hasAudio() { return !!buffer; } };
})();
