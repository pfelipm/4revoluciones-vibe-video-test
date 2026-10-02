'use strict';
/* =========================================================
   Motor de vídeo determinista.
   Cada animación es una Web Animation pausada; en cada
   fotograma se fija su currentTime a partir del tiempo t
   del reloj de audio. Resultado: reproducción, pausa y
   búsqueda exactas y siempre sincronizadas con la música.
   Guion (120 BPM · 1 compás = 2 s):
     0–10  Intro · 10/32/54/76 Capítulos I–IV (22 s c/u)
     98–114 Resumen, Industria 5.0 y créditos
   ========================================================= */
const Video = (() => {
  const DURATION = 114, BEAT = .5;
  const NOW = new Date().getFullYear();
  const COL = { c1: '#FF6B1A', c2: '#FFCF1A', c3: '#2ED3F5', c4: '#FF4FA0', lime: '#B6FF3B', ink: '#121212', paper: '#FFF3E0' };
  const E = {
    out: 'cubic-bezier(.16,1,.3,1)', in: 'cubic-bezier(.7,0,.84,0)', inOut: 'cubic-bezier(.76,0,.24,1)',
    back: 'cubic-bezier(.34,1.56,.64,1)', lin: 'linear',
  };
  const TL = { anims: [], tickers: [], scenes: [], cues: [] };
  let SCOPE = null, stage, camera, flashEl, fadeEl, grainEl;

  /* ---------------- utilidades ---------------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const $$ = (s, r) => [...r.querySelectorAll(s)];
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function wordsHTML(str, chars = false) {
    return str.split('|').map(line => '<span class="ln">' + line.split(' ').map(w =>
      '<span class="w">' + (chars ? [...w].map(c => `<span class="ch">${c}</span>`).join('') : w) + '</span>').join(' ') + '</span>').join('');
  }

  /* ---------------- primitivas de la línea de tiempo ---------------- */
  function A(el, kf, start, dur, o = {}) {
    const a = el.animate(kf, {
      duration: dur * 1000, delay: start * 1000, fill: o.fill || 'both', easing: o.ease || E.out,
      iterations: o.iter || 1, direction: o.dir || 'normal',
    });
    a.pause();
    TL.anims.push({ a, scope: 'scope' in o ? o.scope : SCOPE });
    return a;
  }
  const loop = (el, kf, start, dur, o = {}) => A(el, kf, start, dur, { ease: E.lin, iter: Infinity, ...o });
  const tick = fn => TL.tickers.push({ fn, scope: SCOPE });
  const cue = (type, t, o = {}) => TL.cues.push({ type, t, ...o });
  function scene(el, s, e) { const sc = { el, s, e, vis: false }; TL.scenes.push(sc); SCOPE = sc; el.hidden = true; return sc; }

  function popIn(el, t, o = {}) {
    A(el, [{ scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }], t, o.dur || .5, { ease: E.back });
    if (o.sfx !== false) cue('pop', t, { n: o.n || 0 });
  }
  const rise = (el, t, o = {}) => A(el, [{ translate: `0 ${o.y ?? 70}px`, opacity: 0 }, { translate: '0 0', opacity: 1 }], t, o.dur || .6, { ease: o.ease || E.out });
  const slideFrom = (el, t, from, o = {}) => A(el, [{ translate: from }, { translate: '0 0' }], t, o.dur || .6, { ease: o.ease || E.out });
  function shake(t, amp = 16, dur = .4) {
    const kf = [];
    for (let i = 0; i <= 8; i++) {
      const k = 1 - i / 8;
      kf.push({ translate: i === 8 ? '0 0' : `${((hash(t * 10 + i) - .5) * 2 * amp * k).toFixed(1)}px ${((hash(t * 20 + i) - .5) * 2 * amp * k).toFixed(1)}px` });
    }
    A(camera, kf, t, dur, { fill: 'none', ease: E.lin, scope: null });
  }
  const flash = (t, peak = .7) => A(flashEl, [{ opacity: peak }, { opacity: 0 }], t, .4, { fill: 'none', scope: null });
  function counter(el, from, to, t0, dur) {
    let last = null;
    tick(t => { const v = Math.round(from + (to - from) * easeOut(clamp((t - t0) / dur))); if (v !== last) { el.textContent = v; last = v; } });
  }
  function typewriter(el, text, t0, cps = 28, o = {}) {
    el.textContent = '';
    let last = -1;
    tick(t => {
      const n = clamp(Math.floor((t - t0) * cps), 0, text.length);
      if (n !== last) { el.textContent = text.slice(0, n); last = n; }
      el.classList.toggle('typing', t >= t0 - .3 && n < text.length);
    });
    if (o.sfx !== false) for (let i = 0; i < text.length; i += o.every || 2) if (text[i] !== ' ') cue('tick', t0 + i / cps);
  }

  /* ---------------- contenido ---------------- */
  const CH = [
    {
      n: 'I', ord: '1ª', color: 'var(--c1)', years: 'c. 1760 – 1840', place: 'Gran Bretaña',
      title: 'VAPOR Y|MECANIZACIÓN', kicker: 'Energía · carbón + vapor',
      head: 'La máquina releva al músculo',
      body: 'El vapor mueve telares, hiladoras y locomotoras. Nace la fábrica y, con ella, la ciudad industrial y el trabajo asalariado.',
      tags: ['Carbón', 'Máquina de vapor', 'Industria textil', 'Ferrocarril'],
      ring: 'VAPOR • CARBÓN • HIERRO • TEXTIL • ',
      miles: [[1764, 'Spinning Jenny', 'James Hargreaves mecaniza el hilado del algodón.'],
        [1769, 'Máquina de Watt', 'James Watt patenta el condensador separado.'],
        [1785, 'Telar mecánico', 'Edmund Cartwright automatiza el tejido.'],
        [1825, 'Ferrocarril', 'Stockton–Darlington: primera línea pública con locomotora de vapor.']],
      fact: ['De taller a fábrica', 'Gran Bretaña se gana el apodo de «el taller del mundo».'],
    },
    {
      n: 'II', ord: '2ª', color: 'var(--c2)', years: 'c. 1870 – 1914', place: 'EE. UU. y Alemania',
      title: 'ELECTRICIDAD|Y PRODUCCIÓN|EN MASA', kicker: 'Energía · electricidad + petróleo',
      head: 'La fábrica se electrifica y produce en serie',
      body: 'Electricidad, acero, química y motor de combustión transforman la industria. La cadena de montaje abarata los productos: nace el consumo de masas.',
      tags: ['Electricidad', 'Acero', 'Petróleo', 'Cadena de montaje', 'Teléfono'],
      ring: 'ELECTRICIDAD • ACERO • PETRÓLEO • ',
      miles: [[1876, 'Teléfono', 'Alexander Graham Bell patenta el teléfono.'],
        [1879, 'Bombilla', 'Thomas Edison presenta su lámpara incandescente.'],
        [1886, 'Automóvil', 'Carl Benz patenta su vehículo a motor.'],
        [1913, 'Cadena de montaje', 'Ford instala la línea móvil para el Model T.']],
      fact: ['Ford Model T', 'Con la cadena móvil, montar un chasis pasa de 12,5 horas a 93 minutos.'],
    },
    {
      n: 'III', ord: '3ª', color: 'var(--c3)', years: 'c. 1969 – 2000', place: 'EE. UU., Japón y Europa',
      title: 'ELECTRÓNICA E|INFORMÁTICA', kicker: 'Motor · el transistor',
      head: 'Las máquinas aprenden a seguir programas',
      body: 'La electrónica y las tecnologías de la información automatizan la producción. Autómatas, robots industriales e Internet conectan el planeta.',
      tags: ['Microchip', 'Autómata (PLC)', 'Ordenador personal', 'Internet'],
      ring: 'CHIP • SOFTWARE • ROBOT • RED • ',
      miles: [[1969, 'Primer PLC', 'El Modicon 084 lleva la programación a la fábrica.'],
        [1971, 'Microprocesador', 'Intel 4004: una CPU completa en un solo chip.'],
        [1981, 'IBM PC', 'El ordenador personal llega a oficinas y hogares.'],
        [1991, 'World Wide Web', 'Tim Berners-Lee abre la web al mundo desde el CERN.']],
      fact: ['Ley de Moore', 'El Intel 4004 tenía 2.300 transistores; un chip actual supera las decenas de miles de millones.'],
    },
    {
      n: 'IV', ord: '4ª', color: 'var(--c4)', years: '2011 → hoy', place: 'un mundo en red',
      title: 'SISTEMAS|CIBERFÍSICOS', kicker: 'Motor · datos + inteligencia artificial',
      head: 'Lo físico, lo digital y lo biológico se fusionan',
      body: 'Sensores conectados, inteligencia artificial y robots colaborativos crean fábricas inteligentes que se ajustan solas en tiempo real.',
      tags: ['IA', 'Internet de las cosas', 'Robótica', 'Big Data', 'Impresión 3D'],
      ring: 'IA • DATOS • IoT • ROBOTS • NUBE • ',
      miles: [[2011, 'Industrie 4.0', 'El concepto se presenta en la Feria de Hannover.'],
        [2012, 'Deep learning', 'AlexNet dispara el aprendizaje profundo en visión artificial.'],
        [2016, 'Foro de Davos', 'Klaus Schwab populariza la «Cuarta Revolución Industrial».'],
        [2022, 'IA generativa', 'Los modelos de lenguaje llegan al gran público.']],
      fact: ['Cada vez más rápido', 'Entre revoluciones pasan unos 110 años, luego 100… y después solo 42.'],
    },
  ];
  const SEG = [[1760, 1870], [1870, 1969], [1969, 2011], [2011, NOW]];

  /* ---------------- ilustraciones SVG ---------------- */
  function gearPath(cx, cy, r, teeth, depth) {
    const n = teeth * 4, pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, rr = i % 4 < 2 ? r : r - depth;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return 'M' + pts.join('L') + 'Z';
  }
  const INK = COL.ink, PAPER = COL.paper;

  const ILLUS = [
    { // I · máquina de vapor
      svg() {
        let rivets = '', sleepers = '';
        for (let x = 110; x <= 446; x += 42) rivets += `<circle cx="${x}" cy="300" r="7" fill="${INK}"/><circle cx="${x}" cy="500" r="7" fill="${INK}"/>`;
        for (let x = -80; x <= 940; x += 80) sleepers += `<rect x="${x}" y="598" width="44" height="16" fill="${PAPER}"/>`;
        return `<svg viewBox="0 0 860 660">
          <g>${[0, 1, 2, 3, 4].map(() => `<circle class="puff sp" cx="255" cy="78" r="40" fill="#fff" stroke="${INK}" stroke-width="6"/>`).join('')}</g>
          <rect x="215" y="90" width="80" height="200" fill="${INK}"/>
          <rect x="198" y="74" width="114" height="34" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
          <rect x="70" y="270" width="420" height="260" rx="34" fill="#fff" stroke="${INK}" stroke-width="8"/>
          ${rivets}
          <rect x="100" y="385" width="300" height="96" fill="${COL.c2}" stroke="${INK}" stroke-width="6"/>
          <text x="250" y="447" text-anchor="middle" class="svgd" font-size="36" fill="${INK}">WATT · 1769</text>
          <circle cx="440" cy="345" r="30" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
          <line class="needle" x1="440" y1="345" x2="440" y2="322" stroke="#E0201B" stroke-width="6" stroke-linecap="round" style="transform-box:view-box;transform-origin:440px 345px"/>
          <g class="g1 sp"><path d="${gearPath(620, 250, 130, 16, 22)}" fill="${COL.c2}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
            <path d="M530 250H710M620 160V340" stroke="${INK}" stroke-width="16"/>
            <circle cx="620" cy="250" r="34" fill="#fff" stroke="${INK}" stroke-width="7"/></g>
          <g class="g2 sp"><path d="${gearPath(716, 417, 74, 9, 20)}" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
            <circle cx="716" cy="417" r="22" fill="${INK}"/><circle cx="716" cy="380" r="8" fill="${INK}"/></g>
          <rect x="0" y="560" width="860" height="100" fill="${INK}"/>
          <g class="rails">${sleepers}</g>
          <rect x="0" y="576" width="860" height="10" fill="${PAPER}"/>
        </svg>`;
      },
      anim(root, s) {
        loop(root.querySelector('.g1'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], s, 4);
        loop(root.querySelector('.g2'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }], s, 4 * 9 / 16);
        $$('.puff', root).forEach((p, i) => loop(p, [
          { transform: 'translate(0px,0px) scale(.3)', opacity: 0 }, { opacity: .95, offset: .15 },
          { transform: 'translate(-90px,-150px) scale(1.7)', opacity: 0 }], s - 2 + i * .4, 2, { ease: 'ease-out' }));
        loop(root.querySelector('.needle'), [{ transform: 'rotate(-50deg)' }, { transform: 'rotate(55deg)' }], s, .5, { dir: 'alternate', ease: E.inOut });
        loop(root.querySelector('.rails'), [{ transform: 'translateX(0px)' }, { transform: 'translateX(-80px)' }], s, .5);
      },
    },
    { // II · bombilla, fábrica y cadena de montaje
      svg() {
        const rays = [...Array(12)].map((_, k) => {
          const a = k / 12 * Math.PI * 2, f = v => v.toFixed(1);
          return `<line x1="${f(210 + Math.cos(a) * 150)}" y1="${f(205 + Math.sin(a) * 150)}" x2="${f(210 + Math.cos(a) * 192)}" y2="${f(205 + Math.sin(a) * 192)}"/>`;
        }).join('');
        let wins = '';
        for (const y of [318, 392]) for (const x of [485, 565, 645, 725]) wins += `<rect class="win" x="${x}" y="${y}" width="50" height="46" fill="#3a3a3a" stroke="${INK}" stroke-width="5"/>`;
        let rollers = '';
        for (let x = 70; x <= 790; x += 90) rollers += `<g class="roll sp"><circle cx="${x}" cy="573" r="17" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><path d="M${x - 12} 573H${x + 12}M${x} 561V585" stroke="${INK}" stroke-width="4"/></g>`;
        const boxes = ['#fff', COL.c3, COL.c4].map(c => `<g class="pk"><rect x="0" y="478" width="76" height="70" fill="${c}" stroke="${INK}" stroke-width="6"/><text x="38" y="527" text-anchor="middle" class="svgd" font-size="38" fill="${INK}">T</text></g>`).join('');
        return `<svg viewBox="0 0 860 660">
          <defs><clipPath id="beltclip"><rect x="30" y="380" width="800" height="175"/></clipPath></defs>
          <circle class="glow" cx="210" cy="205" r="205" fill="#FFF6B0"/>
          <g class="rays sp" stroke="${INK}" stroke-width="9" stroke-linecap="round">${rays}</g>
          <path d="M150 270 L168 330 H252 L270 270 Z" fill="#FFF8C4" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
          <circle cx="210" cy="200" r="110" fill="#FFF8C4" stroke="${INK}" stroke-width="8"/>
          <path d="M178 262 V214 L192 192 L202 216 L212 192 L222 216 L232 192 L244 214 V262" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
          <rect x="165" y="328" width="90" height="62" fill="#c9c9c9" stroke="${INK}" stroke-width="8"/>
          <path d="M165 349H255M165 369H255" stroke="${INK}" stroke-width="5"/>
          <path d="M184 390 H236 L222 412 H198 Z" fill="${INK}"/>
          <polygon class="bolt" points="402,40 360,132 396,132 372,214 452,104 414,104 442,40" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
          <rect x="745" y="125" width="40" height="110" fill="#fff" stroke="${INK}" stroke-width="7"/>
          <path d="M460 462 V275 L545 215 V275 L630 215 V275 L715 215 V275 L800 215 V462 Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
          ${wins}
          <g clip-path="url(#beltclip)">${boxes}</g>
          <rect x="30" y="548" width="800" height="50" rx="25" fill="${INK}"/>
          ${rollers}
        </svg>`;
      },
      anim(root, s) {
        loop(root.querySelector('.glow'), [{ opacity: .35 }, { opacity: .95 }, { opacity: .55 }, { opacity: 1 }, { opacity: .6 }], s, 1, { dir: 'alternate' });
        loop(root.querySelector('.rays'), [{ transform: 'rotate(0deg) scale(.96)' }, { transform: 'rotate(15deg) scale(1.08)' }], s, .5, { dir: 'alternate', ease: E.inOut });
        loop(root.querySelector('.bolt'), [{ opacity: 1 }, { opacity: .15, offset: .1 }, { opacity: 1, offset: .2 }, { opacity: 1 }], s, 1);
        $$('.win', root).forEach((w, i) => loop(w, [{ fill: '#3a3a3a' }, { fill: '#FFE14D', offset: .15 }, { fill: '#FFE14D', offset: .75 }, { fill: '#3a3a3a' }], s + (i % 4) * .25 + Math.floor(i / 4) * .5, 2));
        $$('.roll', root).forEach(r => loop(r, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], s, .6));
        $$('.pk', root).forEach((b, i) => loop(b, [{ transform: 'translateX(-140px)' }, { transform: 'translateX(960px)' }], s - i * 1.5, 4.5));
      },
    },
    { // III · microchip, pistas y terminal
      svg() {
        const P = [510, 542, 574, 606, 638, 670], Q = [205, 237, 269, 301, 333, 365];
        let pins = '', tr = [];
        P.forEach((p, i) => {
          pins += `<rect x="${p - 7}" y="150" width="14" height="26" fill="#d6d6d6" stroke="${INK}" stroke-width="3"/><rect x="${p - 7}" y="394" width="14" height="26" fill="#d6d6d6" stroke="${INK}" stroke-width="3"/>`;
          const o = (i - 2.5) * 36, k = (i % 3) * 18;
          tr.push(`M${p} 150 V${112 - k} L${p + o} ${72 - k} V-10`, `M${p} 420 V${458 + k} L${p + o} ${498 + k} V670`);
        });
        Q.forEach((q, i) => {
          pins += `<rect x="455" y="${q - 7}" width="26" height="14" fill="#d6d6d6" stroke="${INK}" stroke-width="3"/><rect x="699" y="${q - 7}" width="26" height="14" fill="#d6d6d6" stroke="${INK}" stroke-width="3"/>`;
          const k = (i % 3) * 14;
          tr.push(`M725 ${q} H${758 + k} L${798 + k} ${q + (i - 2.5) * 30} H870`, `M455 ${q} H${428 - (i % 2) * 10}`);
        });
        const ends = Q.map((q, i) => `<circle cx="${428 - (i % 2) * 10}" cy="${q}" r="9" fill="#fff" stroke="${INK}" stroke-width="4"/>`).join('');
        return `<svg viewBox="0 0 860 660">
          ${[0, 1, 2, 3, 4, 5, 6].map(i => `<text class="bin svgm" x="40" y="${78 + i * 50}" font-size="31" fill="${INK}" opacity=".72">0000000 00000000</text>`).join('')}
          <g fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round">${tr.map(d => `<path d="${d}"/>`).join('')}</g>
          <g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="18 400">${tr.map(d => `<path class="pulse" d="${d}"/>`).join('')}</g>
          ${ends}${pins}
          <rect x="480" y="175" width="220" height="220" rx="16" fill="${INK}"/>
          <rect class="chipglow" x="510" y="205" width="160" height="160" fill="${COL.lime}"/>
          <rect x="516" y="211" width="148" height="148" fill="#262626"/>
          <text x="590" y="298" text-anchor="middle" class="svgm" font-size="46" fill="${COL.lime}">4004</text>
          <text x="590" y="334" text-anchor="middle" class="svgm" font-size="18" fill="#fff">INTEL · 1971</text>
          <rect x="30" y="440" width="372" height="192" rx="12" fill="${INK}"/>
          <rect x="30" y="440" width="372" height="36" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
          <circle cx="56" cy="458" r="8" fill="${COL.c1}"/><circle cx="80" cy="458" r="8" fill="${COL.c2}"/><circle cx="104" cy="458" r="8" fill="${COL.c4}"/>
          ${[0, 1, 2].map(k => `<text class="term svgm" x="52" y="${522 + k * 38}" font-size="22" fill="${COL.lime}"></text>`).join('')}
        </svg>`;
      },
      anim(root, s) {
        $$('.pulse', root).forEach((p, i) => loop(p, [{ strokeDashoffset: 0 }, { strokeDashoffset: -418 }], s - 2 + hash(i) * 1.6, 1.6));
        loop(root.querySelector('.chipglow'), [{ opacity: .25 }, { opacity: 1 }], s, .5, { dir: 'alternate', ease: E.inOut });
        const rows = $$('.bin', root);
        let last = -1;
        tick(t => {
          const f = Math.floor(t * 4);
          if (f === last) return;
          last = f;
          rows.forEach((r, i) => { let str = ''; for (let j = 0; j < 16; j++) { if (j === 8) str += ' '; str += hash(f * 31 + i * 17 + j) > .5 ? '1' : '0'; } r.textContent = str; });
        });
        ['> CARGAR PROGRAMA', '> EJECUTAR', '✓ PRODUCCIÓN AUTOMÁTICA'].forEach((txt, k) =>
          typewriter($$('.term', root)[k], txt, s + 1.2 + k * 1.5, 20, { sfx: false }));
      },
    },
    { // IV · red neuronal
      svg() {
        const X = [120, 320, 520, 720], N = [3, 5, 5, 2];
        const pos = N.map((n, l) => [...Array(n)].map((_, k) => [X[l], 300 + (k - (n - 1) / 2) * 100]));
        let edges = '', pulses = '';
        for (let l = 0; l < 3; l++) for (const a of pos[l]) for (const b of pos[l + 1]) {
          edges += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
          pulses += `<line class="pulse" data-l="${l}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
        }
        const nodes = pos.map((ly, l) => ly.map(([x, y]) => `<circle class="node" data-l="${l}" cx="${x}" cy="${y}" r="30" fill="#fff" stroke="${INK}" stroke-width="7"/>`).join('')).join('');
        return `<svg viewBox="0 0 860 660">
          <g stroke="${INK}" stroke-width="4" opacity=".85">${edges}</g>
          <g stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="22 420">${pulses}</g>
          ${nodes}
          <text x="120" y="612" text-anchor="middle" class="svgd" font-size="30" fill="${INK}">DATOS</text>
          <text x="420" y="612" text-anchor="middle" class="svgd" font-size="30" fill="${INK}">→ IA →</text>
          <text x="720" y="612" text-anchor="middle" class="svgd" font-size="30" fill="${INK}">DECISIÓN</text>
        </svg>`;
      },
      anim(root, s) {
        $$('.pulse', root).forEach((p, i) => loop(p, [{ strokeDashoffset: 0 }, { strokeDashoffset: -442 }], s + (+p.dataset.l) * .25 + hash(i) * .2, 1));
        $$('.node', root).forEach(n => loop(n, [{ fill: '#fff' }, { fill: COL.lime, offset: .12 }, { fill: '#fff', offset: .45 }, { fill: '#fff' }], s + (+n.dataset.l) * .25, 1));
      },
    },
  ];

  /* ---------------- escenas ---------------- */
  function buildIntro() {
    const el = h(`<section class="scene intro"><div class="kb grid-bg">
      <div class="blk" style="left:70px;top:70px;width:640px;height:380px;background:var(--c1);rotate:-3deg"><b>I</b></div>
      <div class="blk" style="left:1220px;top:50px;width:640px;height:320px;background:var(--c2);rotate:2deg"><b>II</b></div>
      <div class="blk" style="left:90px;top:650px;width:600px;height:300px;background:var(--c3);rotate:2.5deg"><b>III</b></div>
      <div class="blk" style="left:1250px;top:620px;width:600px;height:330px;background:var(--c4);rotate:-2deg"><b>IV</b></div>
      <div class="ititle box"><span class="tag dark">Las 4</span><h1>${wordsHTML('REVOLUCIONES|INDUSTRIALES', true)}</h1></div>
      <div class="isub"><span class="tag dark"><span class="type"></span></span></div>
      <div class="istk sticker">Vídeo educativo</div>
      <div class="iyears">${['1760', '1870', '1969', '2011'].map((y, k) => `<span class="tag" style="background:var(--c${k + 1})">${y}</span>`).join('')}</div>
      <div class="marquee"><div class="mq">${'VAPOR ✦ ELECTRICIDAD ✦ ELECTRÓNICA ✦ INTELIGENCIA ARTIFICIAL ✦ '.repeat(4)}</div></div>
    </div></section>`);
    camera.append(el);
    scene(el, 0, 10);
    const kb = el.querySelector('.kb');
    A(kb, [{ scale: 1.12 }, { scale: 1 }], 0, 10);
    A(kb, [{ filter: 'blur(0px)' }, { filter: 'blur(5px)' }], 9.4, .6, { fill: 'forwards', ease: E.in });

    const from = ['-1100px 0', '0 -800px', '0 900px', '1100px 0'];
    $$('.blk', el).forEach((b, k) => { slideFrom(b, .5 + k * .25 - .3, from[k], { dur: .3, ease: E.in }); cue('thud', .5 + k * .25); });

    const tb = el.querySelector('.ititle');
    A(tb, [{ scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1 }], 1.65, .35, { ease: E.in });
    cue('impact', 2); shake(2, 22); flash(2, .55);
    $$('.ch', tb).forEach((c, k) => A(c, [{ translate: '0 -160px', opacity: 0, rotate: '-15deg' }, { translate: '0 0', opacity: 1, rotate: '0deg' }], 2 + k * .03, .5, { ease: E.back }));
    popIn(tb.querySelector('.tag'), 3, { n: 5 });

    rise(el.querySelector('.isub .tag'), 3.1, { y: 60 });
    typewriter(el.querySelector('.isub .type'), 'Una cronología de 1760 a hoy', 3.3, 28);

    const stk = el.querySelector('.istk');
    popIn(stk, 4.5, { n: 4 });
    loop(stk, [{ rotate: '5deg' }, { rotate: '11deg' }], 4.5, .5, { dir: 'alternate', ease: E.inOut });
    $$('.iyears .tag', el).forEach((y, k) => popIn(y, 6 + k * .5, { n: k }));
    slideFrom(el.querySelector('.marquee'), 5, '0 160px', { dur: .7 });
    loop(el.querySelector('.mq'), [{ translate: '0 0' }, { translate: '-50% 0' }], 0, 16);
  }

  function buildChapter(ch, i) {
    const b = 10 + 22 * i, sA = b + 4, sB = b + 13, end = b + 22, il = ILLUS[i];

    /* --- portadilla --- */
    const card = h(`<section class="scene card" style="--c:${ch.color}"><div class="kb">
      <div class="stripes"></div>
      <div class="numeral">${ch.n}</div>
      <div class="card-info">
        <div class="tag dark">${ch.ord} Revolución Industrial</div>
        <h2 class="ctitle">${wordsHTML(ch.title)}</h2>
        <div class="row"><span class="tag">${ch.years}</span><span class="tag" style="background:var(--paper)">Epicentro · ${ch.place}</span></div>
      </div></div></section>`);
    camera.append(card);
    scene(card, b, sA + .4);
    loop(card.querySelector('.stripes'), [{ translate: '0 0' }, { translate: '113.14px 0' }], b, 1);
    A(card.querySelector('.kb'), [{ scale: 1 }, { scale: 1.05 }], b, 4.4, { ease: E.lin });
    const num = card.querySelector('.numeral');
    A(num, [{ scale: 2.6, opacity: 0, rotate: '-10deg' }, { scale: 1, opacity: 1, rotate: '0deg' }], b + .1, .4, { ease: E.in });
    loop(num, [{ translate: '0 0' }, { translate: '0 -14px' }], b + .5, 1, { dir: 'alternate', ease: E.inOut });
    cue('slam', b + .5); shake(b + .5, 14);
    slideFrom(card.querySelector('.card-info > .tag'), b + .75, '1200px 0', { dur: .55 });
    $$('.ctitle .w', card).forEach((w, k) => A(w, [{ translate: '0 115%' }, { translate: '0 0' }], b + .95 + k * .1, .6));
    const rowTags = $$('.row .tag', card);
    popIn(rowTags[0], b + 1.5, { n: 2 });
    popIn(rowTags[1], b + 2, { n: 3 });

    /* --- plano A: concepto --- */
    const sa = h(`<section class="scene shotA" style="--c:${ch.color}"><div class="kb grid-bg">
      <div class="illus box">${il.svg()}
        <div class="badge"><svg viewBox="0 0 200 200"><defs><path id="ring${i}" d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0"/></defs>
          <g class="bspin" style="transform-box:view-box;transform-origin:100px 100px"><text><textPath href="#ring${i}" textLength="432" lengthAdjust="spacing">${ch.ring}</textPath></text></g>
          <text class="bnum" x="100" y="123" text-anchor="middle">${ch.n}</text></svg></div>
      </div>
      <div class="txt">
        <div class="tag dark">${ch.kicker}</div>
        <h3 class="head">${wordsHTML(ch.head)}</h3>
        <p class="body">${ch.body}</p>
        <div class="stickers">${ch.tags.map((t, k) => `<span class="sticker" style="--r:${[-4, 3, -2, 4, -3][k]}deg;background:${['#fff', ch.color, 'var(--lime)', '#fff', ch.color][k]}">${t}</span>`).join('')}</div>
      </div></div></section>`);
    camera.append(sa);
    scene(sa, sA - .35, sB + .15);
    A(sa, [{ clipPath: 'circle(0% at 30% 50%)' }, { clipPath: 'circle(150% at 30% 50%)' }], sA - .35, .75, { ease: E.inOut });
    cue('whoosh', sA - .4, { dur: .6 });
    const kbA = sa.querySelector('.kb');
    A(kbA, [{ scale: 1.08 }, { scale: 1 }], sA - .35, 9.5);
    A(sa, [{ translate: '0 0', filter: 'brightness(1)' }, { translate: '0 -220px', filter: 'brightness(.55)' }], sB - .45, .6, { fill: 'forwards', ease: E.inOut });
    const box = sa.querySelector('.illus');
    A(box, [{ translate: '-1100px 0', rotate: '-6deg' }, { translate: '0 0', rotate: '0deg' }], sA - .1, .8);
    popIn(sa.querySelector('.badge'), sA + .7, { sfx: false });
    loop(sa.querySelector('.bspin'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], sA, 10);
    il.anim(box.querySelector('svg'), sA);
    slideFrom(sa.querySelector('.txt > .tag'), sA + .4, '900px 0', { dur: .55 });
    $$('.head .w', sa).forEach((w, k) => rise(w, sA + .6 + k * .06, { y: 50, dur: .5 }));
    rise(sa.querySelector('.body'), sA + 1.5, { y: 40 });
    $$('.sticker', sa).forEach((s, k) => popIn(s, sA + 2.5 + k * .5, { n: k }));

    /* --- plano B: hitos --- */
    const sb = h(`<section class="scene shotB" style="--c:${ch.color}"><div class="kb dots-bg">
      <div class="sb-head"><span class="tag c">Hitos</span><h3>${ch.ord} Revolución · ${ch.years}</h3></div>
      <div class="tl-line"></div>
      ${ch.miles.map((m, k) => { const x = 110 + k * 437; return `<div class="conn" style="left:${x + 192}px"></div><div class="tdot" style="left:${x + 177}px"></div>
        <div class="mile box" style="left:${x}px"><div class="yr">${m[0]}</div><div class="mt">${m[1]}</div><div class="md">${m[2]}</div></div>`; }).join('')}
      <div class="fact box"><span class="tag c">Dato</span><div><div class="ft">${ch.fact[0]}</div><div class="fd"><span class="type"></span></div></div></div>
      </div></section>`);
    camera.append(sb);
    scene(sb, sB - .45, end);
    A(sb, [{ translate: '0 1080px' }, { translate: '0 0' }], sB - .45, .6, { ease: E.inOut });
    cue('whoosh', sB - .5, { dur: .6 });
    A(sb.querySelector('.kb'), [{ scale: 1 }, { scale: 1.04 }], sB, 9, { ease: E.lin });
    slideFrom(sb.querySelector('.sb-head .tag'), sB + .2, '-700px 0', { dur: .5 });
    rise(sb.querySelector('.sb-head h3'), sB + .35, { y: 40 });
    A(sb.querySelector('.tl-line'), [{ scale: '0 1' }, { scale: '1 1' }], sB + .6, 3.6, { ease: E.inOut });
    const miles = $$('.mile', sb), conns = $$('.conn', sb), dots = $$('.tdot', sb);
    miles.forEach((m, k) => {
      const t = sB + 1 + k;
      A(m, [{ translate: '0 -90px', opacity: 0, rotate: '-5deg' }, { translate: '0 0', opacity: 1, rotate: '0deg' }], t, .55, { ease: E.back });
      cue('pop', t, { n: k });
      A(conns[k], [{ scale: '1 0' }, { scale: '1 1' }], t + .2, .3);
      popIn(dots[k], t + .3, { sfx: false, dur: .4 });
      counter(m.querySelector('.yr'), ch.miles[k][0] - 30, ch.miles[k][0], t, .8);
    });
    const fact = sb.querySelector('.fact');
    A(fact, [{ translate: '0 260px' }, { translate: '0 0' }], sB + 5.5, .5, { ease: E.back });
    cue('hit', sB + 5.6);
    rise(fact.querySelector('.ft'), sB + 5.8, { y: 30, dur: .4 });
    typewriter(fact.querySelector('.type'), ch.fact[1], sB + 6.2, 46, { every: 3 });
  }

  function buildOutro() {
    const KW = [['I', '1760', 'VAPOR', 'Carbón, máquinas y fábricas'], ['II', '1870', 'ELECTRICIDAD', 'Acero, petróleo y producción en serie'],
      ['III', '1969', 'ELECTRÓNICA', 'Chips, ordenadores e Internet'], ['IV', '2011', 'IA + DATOS', 'IA, IoT y robots conectados']];
    const GAPS = ['+110 años', '+99 años', '+42 años'];

    /* --- resumen --- */
    const oa = h(`<section class="scene outroA"><div class="kb grid-bg">
      <div class="oa-head"><span class="tag dark">Resumen</span><h3>Cuatro saltos que transformaron el trabajo</h3></div>
      ${KW.map((k, j) => `<div class="ocol box" style="left:${110 + j * 437}px;background:var(--c${j + 1})"><div class="on">${k[0]}</div><div class="oy tag">${k[1]}</div><div class="ok">${k[2]}</div><div class="od">${k[3]}</div></div>`).join('')}
      ${GAPS.map((g, j) => `<div class="gap" style="left:${110 + j * 437 + 413}px"><span class="tag">${g}</span></div>`).join('')}
      <div class="ofoot"><span><i class="ul"></i>Cada salto llega antes que el anterior</span></div>
      </div></section>`);
    camera.append(oa);
    scene(oa, 98, 104.3);
    A(oa.querySelector('.kb'), [{ scale: 1.05 }, { scale: 1 }], 98, 6.3);
    slideFrom(oa.querySelector('.oa-head .tag'), 98.3, '-700px 0', { dur: .5 });
    rise(oa.querySelector('.oa-head h3'), 98.45, { y: 40 });
    $$('.ocol', oa).forEach((c, j) => {
      A(c, [{ translate: '0 800px', rotate: '7deg' }, { translate: '0 0', rotate: '0deg' }], 98.3 + j * .5, .5, { ease: E.back });
      cue('pop', 98.5 + j * .5, { n: j });
      A(c, [{ scale: 1 }, { scale: 1.06 }, { scale: 1 }], 103 + j * .25, .25, { fill: 'none', ease: E.inOut });
    });
    $$('.gap .tag', oa).forEach((g, j) => popIn(g, 101 + j * .5, { n: j + 2 }));
    rise(oa.querySelector('.ofoot span'), 102.5, { y: 50 });
    A(oa.querySelector('.ul'), [{ scale: '0 1' }, { scale: '1 1' }], 102.8, .6);

    /* --- ¿y después? --- */
    const ob = h(`<section class="scene outroB" style="--c:var(--c4)"><div class="kb"><div class="stripes"></div>
      <h2 class="ob-q">${wordsHTML('¿Y DESPUÉS?', true)}</h2>
      <div class="ob-tag"><span class="tag dark">Industria 5.0</span></div>
      <div class="ob-txt box"><span class="type"></span></div>
      </div></section>`);
    camera.append(ob);
    scene(ob, 103.6, 108.3);
    A(ob, [{ clipPath: 'polygon(0 0, 0 0, -30% 100%, 0 100%)' }, { clipPath: 'polygon(0 0, 130% 0, 100% 100%, 0 100%)' }], 103.6, .55, { ease: E.inOut });
    cue('whoosh', 103.55, { dur: .6 });
    loop(ob.querySelector('.stripes'), [{ translate: '0 0' }, { translate: '113.14px 0' }], 103.6, 1);
    A(ob.querySelector('.kb'), [{ scale: 1 }, { scale: 1.05 }], 103.6, 4.7, { ease: E.lin });
    $$('.ob-q .ch', ob).forEach((c, k) => A(c, [{ scale: 3, opacity: 0 }, { scale: 1, opacity: 1 }], 104 + k * .03, .25, { ease: E.in }));
    cue('slam', 104.3); shake(104.3, 18);
    popIn(ob.querySelector('.ob-tag .tag'), 105, { n: 3 });
    rise(ob.querySelector('.ob-txt'), 105.2, { y: 60 });
    typewriter(ob.querySelector('.ob-txt .type'), 'Tecnología centrada en las personas, sostenible y resiliente.', 105.4, 34);
    cue('riser', 106, { dur: 2, v: .8 });

    /* --- créditos --- */
    const en = h(`<section class="scene endc"><div class="kb">
      <h2 class="fin">FIN</h2>
      <div class="cred"><div>Guion · diseño · animación · música</div><div class="cred-b">100 % código: HTML · CSS · JS</div><div>Banda sonora sintetizada con Web Audio API</div></div>
      </div></section>`);
    camera.append(en);
    scene(en, 108, DURATION + 1);
    const fin = en.querySelector('.fin');
    A(fin, [{ scale: .2, opacity: 0 }, { scale: 1, opacity: 1 }], 107.95, .55, { ease: E.back });
    const sh = d => [COL.c1, COL.c2, COL.c3, COL.c4].map((c, k) => `${(k + 1) * d}px ${(k + 1) * d}px 0 ${c}`).join(', ');
    A(fin, [{ textShadow: sh(0) }, { textShadow: sh(12) }], 108.3, .7, { ease: E.back });
    cue('final', 108); flash(108, .8); shake(108, 26, .5);
    $$('.cred > div', en).forEach((d, k) => rise(d, 109 + k * .35, { y: 40 }));
    A(en.querySelector('.kb'), [{ scale: 1 }, { scale: 1.06 }], 108, 6, { ease: E.lin });
    A(fadeEl, [{ opacity: 0 }, { opacity: 1 }], DURATION - 1.8, 1.8, { fill: 'forwards', ease: E.lin, scope: null });
  }

  function buildHUD() {
    const labels = ['1760', '1870', '1969', '2011', 'HOY'];
    const el = h(`<div id="hud">
      <div class="brand tag"><i class="beat-dot"></i>Cronología · Revoluciones industriales</div>
      <div class="chips">${['I', 'II', 'III', 'IV'].map((n, k) => `<div class="chip" style="--c:var(--c${k + 1})">${n}</div>`).join('')}</div>
      <div class="tlhud"><div class="tlfill"></div>
        ${labels.map((y, k) => `<div class="tk${k === 4 ? ' end' : ''}" style="${k === 4 ? 'right:0' : `left:${k * 25}%`}"><span>${y}</span></div>`).join('')}
        <div class="pin"><span class="pyear">1760</span></div></div>
    </div>`);
    camera.append(el);
    scene(el, 10, 98);
    const chips = $$('.chip', el), fill = el.querySelector('.tlfill'), pin = el.querySelector('.pin'), py = el.querySelector('.pyear');
    slideFrom(el.querySelector('.brand'), 10.5, '0 -140px');
    chips.forEach((c, k) => popIn(c, 10.6 + k * .08, { sfx: false }));
    slideFrom(el.querySelector('.tlhud'), 10.8, '0 170px', { dur: .7 });
    const W = 1690;
    let lastI = -1, lastY = -1;
    tick(t => {
      const i = clamp(Math.floor((t - 10) / 22), 0, 3), p = clamp((t - 10 - 22 * i) / 22);
      const y = Math.round(SEG[i][0] + (SEG[i][1] - SEG[i][0]) * p), x = ((i + p) / 4 * W).toFixed(1);
      fill.style.width = x + 'px';
      pin.style.left = x + 'px';
      if (y !== lastY) { py.textContent = y; lastY = y; }
      if (i !== lastI) { chips.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('done', k < i); }); lastI = i; }
    });
  }

  // Cortinilla de cuatro franjas: cubre la pantalla justo en tc
  function wipe(tc, layer) {
    const w = h(`<div class="wipe">${[1, 2, 3, 4].map(k => `<i style="top:${(k - 1) * 25 - .25}%;background:var(--c${k})"></i>`).join('')}</div>`);
    layer.append(w);
    [...w.children].forEach((s, k) => {
      A(s, [{ translate: '105% 0' }, { translate: '0 0' }], tc - .5 + k * .05, .35, { ease: E.in, scope: null });
      A(s, [{ translate: '0 0' }, { translate: '-105% 0' }], tc + .05 + k * .05, .4, { ease: E.out, fill: 'forwards', scope: null });
    });
    cue('riser', tc - 2, { dur: 2 });
    cue('impact', tc);
    shake(tc + .05, 12);
  }

  function makeGrain() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d'), img = x.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  /* ---------------- API ---------------- */
  function build(root) {
    stage = root;
    stage.innerHTML = '<div id="camera"></div><div id="wipes"></div><div id="flash"></div><div id="fade"></div><div id="grain"></div><div id="vignette"></div>';
    camera = stage.querySelector('#camera');
    flashEl = stage.querySelector('#flash');
    fadeEl = stage.querySelector('#fade');
    grainEl = stage.querySelector('#grain');
    grainEl.style.backgroundImage = `url(${makeGrain()})`;

    buildIntro();
    CH.forEach(buildChapter);
    buildOutro();
    buildHUD();
    SCOPE = null;
    const wl = stage.querySelector('#wipes');
    [10, 32, 54, 76, 98].forEach(tc => wipe(tc, wl));

    tick(t => {   // grano de película y pulso al ritmo
      const f = Math.floor(t * 24);
      grainEl.style.backgroundPosition = `${(hash(f) * 256) | 0}px ${(hash(f + 7) * 256) | 0}px`;
      stage.style.setProperty('--beat', Math.pow(1 - ((t / BEAT) % 1), 4).toFixed(3));
    });
    TL.cues.sort((a, b) => a.t - b.t);
  }

  function render(t) {
    for (const sc of TL.scenes) { const v = t >= sc.s && t < sc.e; sc.vis = v; if (sc.el.hidden === v) sc.el.hidden = !v; }
    const ms = t * 1000;
    for (const { a, scope } of TL.anims) if (!scope || scope.vis) a.currentTime = ms;
    for (const { fn, scope } of TL.tickers) if (!scope || scope.vis) fn(t);
  }

  const CHAPTERS = [{ t: 0, l: 'Intro' }, { t: 10, l: 'I' }, { t: 32, l: 'II' }, { t: 54, l: 'III' }, { t: 76, l: 'IV' }, { t: 98, l: 'Fin' }];
  return { build, render, DURATION, CHAPTERS, get cues() { return TL.cues; }, get stats() { return { anims: TL.anims.length, tickers: TL.tickers.length, cues: TL.cues.length }; } };
})();
