/**
 * BANDA SONORA GENERATIVA & MOTOR DE AUDIO (Web Audio API)
 * Síntesis procedural en tiempo real, efectos de sonido y visualizador
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.currentMode = null;
    this.isPlaying = false;
    
    // Secuenciador interno
    this.tempo = 80;
    this.step = 0;
    this.timerId = null;
    this.nextNoteTime = 0;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // seg

    // Narration TTS
    this.ttsEnabled = true;
    this.currentUtterance = null;
    this.ttsVoice = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Dinámica maestra: Compresor para asegurar pegada sin saturación
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    // Analizador para el visualizador en pantalla
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64; // Barras de ecualizador limpias y de alto impacto
    this.analyser.smoothingTimeConstant = 0.8;

    // Ganancia maestra
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Conexiones de la cadena de audio
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Inicializar voces de síntesis de voz en español
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        this.ttsVoice = voices.find(v => v.lang.startsWith('es') || v.lang.startsWith('es-ES') || v.lang.startsWith('es-MX')) || voices[0];
      };
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // Sincronización de banda sonora según el acto actual
  setActMusic(musicMode) {
    if (this.currentMode === musicMode) return;
    this.currentMode = musicMode;

    switch (musicMode) {
      case 'preindustrial':
        this.tempo = 68;
        break;
      case 'steam':
        this.tempo = 78;
        break;
      case 'electricity':
        this.tempo = 106;
        break;
      case 'synthwave':
        this.tempo = 122;
        break;
      case 'cyberpunk':
        this.tempo = 130;
        break;
      case 'triumph':
        this.tempo = 110;
        break;
      default:
        this.tempo = 80;
    }
  }

  startPlayback() {
    this.ensureContext().then(() => {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.step = 0;
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.scheduler();
    });
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  scheduler() {
    if (!this.isPlaying) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextStep();
    }
    this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
  }

  nextStep() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // semicorcheas (1/16)
    this.step = (this.step + 1) % 16;
  }

  scheduleStep(stepIndex, time) {
    if (this.isMuted) return;

    switch (this.currentMode) {
      case 'preindustrial':
        this.playPreindustrialStep(stepIndex, time);
        break;
      case 'steam':
        this.playSteamStep(stepIndex, time);
        break;
      case 'electricity':
        this.playElectricityStep(stepIndex, time);
        break;
      case 'synthwave':
        this.playSynthwaveStep(stepIndex, time);
        break;
      case 'cyberpunk':
        this.playCyberpunkStep(stepIndex, time);
        break;
      case 'triumph':
        this.playTriumphStep(stepIndex, time);
        break;
    }
  }

  // --- MODELOS DE SÍNTESIS POR ACTO ---

  // ACTO 0: Sonidos orgánicos, maderas, vientos lentos y campanas lejanas
  playPreindustrialStep(step, time) {
    if (step % 8 === 0) {
      // Pulso orgánico profundo
      this.playTone(65, 'sine', 0.8, 0.4, time, 0.05, 0.7);
    }
    if (step === 4 || step === 12) {
      // Clack de madera de molino
      this.playNoise(0.04, time, 800, 0.15, 'bandpass');
    }
    if (step === 0) {
      // Campana lejana de bronce
      const bellFreqs = [220, 440, 660, 880];
      bellFreqs.forEach((f, i) => {
        this.playTone(f, 'sine', 1.8, 0.08 / (i + 1), time, 0.005, 1.5);
      });
    }
  }

  // ACTO 1: 1ª Rev. - Pistón de vapor, chugs metálicos pesados, bajo industrial
  playSteamStep(step, time) {
    // Pistón / Bombo pesado en 0 y 8
    if (step % 4 === 0) {
      this.playIndustrialKick(time, step % 8 === 0 ? 0.6 : 0.4);
    }

    // Escape de vapor (Pfff-chug) en semicorcheas sincopadas
    if (step % 2 === 1) {
      const isLoud = step === 7 || step === 15;
      this.playNoise(isLoud ? 0.12 : 0.06, time, 1200 + (step * 80), isLoud ? 0.25 : 0.15, 'bandpass');
    }

    // Yunque / Golpe metálico en tiempo 4 y 12
    if (step === 4 || step === 12) {
      this.playAnvil(time, 0.35);
    }

    // Línea de bajo de carbón en Re menor (D2 / F2 / G2 / A1)
    const steamNotes = [73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.00, 87.31];
    if (step % 2 === 0) {
      const note = steamNotes[(step / 2) % steamNotes.length];
      this.playTone(note, 'sawtooth', 0.18, 0.22, time, 0.01, 0.15, 350);
    }
  }

  // ACTO 2: 2ª Rev. - Electricidad, relés, bajo Moroder/Kraftwerk, ritmo constante de ensamblaje
  playElectricityStep(step, time) {
    // 4-on-the-floor beat de fábrica moderna
    if (step % 4 === 0) {
      this.playPunchyKick(time, 0.6);
    }
    if (step === 4 || step === 12) {
      this.playSnare(time, 0.4);
    }

    // Chispa eléctrica / Relé en contratiempos
    if (step % 2 === 1) {
      this.playElectricZap(time, 0.15);
    }

    // Secuencia de bajo electro en Do menor (C2 - G2 - Bb2 - C3)
    const electroBass = [65.41, 65.41, 98.00, 65.41, 116.54, 65.41, 130.81, 98.00];
    const note = electroBass[(step) % electroBass.length];
    this.playTone(note, 'sawtooth', 0.12, 0.28, time, 0.005, 0.1, 1200);

    // Acorde de dinamo en el compás 0 y 8
    if (step === 0 || step === 8) {
      [261.63, 311.13, 392.00].forEach(freq => {
        this.playTone(freq, 'triangle', 0.4, 0.15, time, 0.02, 0.3, 2000);
      });
    }
  }

  // ACTO 3: 3ª Rev. - Synthwave, microchips, arpegios digitales 8-bit y cajas con reverb
  playSynthwaveStep(step, time) {
    // Bombo y Caja ochenteros
    if (step === 0 || step === 6 || step === 10) {
      this.playPunchyKick(time, 0.55);
    }
    if (step === 4 || step === 12) {
      this.playSnare(time, 0.5);
    }

    // Hi-hats cerrados continuos
    this.playNoise(0.03, time, 8000, 0.12, 'highpass');

    // Arpegiador rápido de silicio (Am - F - C - G)
    const arpHex = [
      220, 261.63, 329.63, 440,
      174.61, 220, 261.63, 349.23,
      261.63, 329.63, 392, 523.25,
      196, 246.94, 293.66, 392
    ];
    const freq = arpHex[step % arpHex.length];
    this.playTone(freq, 'square', 0.1, 0.18, time, 0.005, 0.08, 2500);

    // Pitido de telemetría de datos
    if (step === 14) {
      this.playTone(880 * 2, 'sine', 0.05, 0.15, time, 0.002, 0.04);
    }
  }

  // ACTO 4: 4ª Rev. - Cyberpunk, IA, bajo reese deslizante, clicks neuronales de alta definición
  playCyberpunkStep(step, time) {
    // Sub-bombo moderno y potente
    if (step === 0 || step === 10) {
      this.playSubKick(time, 0.7);
    }
    if (step === 4 || step === 12) {
      this.playClap(time, 0.45);
    }

    // Micro-glitches neuronales
    if (step % 2 === 1 || step === 14) {
      this.playNoise(0.02, time, 4000 + Math.random() * 5000, 0.08, 'bandpass');
    }

    // Bajo Reese / Dark Neuro Bass
    if (step % 4 === 0) {
      const baseFreq = step < 8 ? 55.0 : 49.0; // A1 a G#1
      this.playReeseBass(baseFreq, time, 0.5, 0.35);
    }

    // Melodía etérea cuántica
    if (step === 2 || step === 8 || step === 15) {
      const quantumNotes = [587.33, 659.25, 783.99, 880];
      const qf = quantumNotes[Math.floor(Math.random() * quantumNotes.length)];
      this.playTone(qf, 'sine', 0.3, 0.12, time, 0.04, 0.25, 3000);
    }
  }

  // ACTO 5: Epílogo triunfal, acordes de victoria y resolución cinematográfica
  playTriumphStep(step, time) {
    if (step % 4 === 0) {
      this.playPunchyKick(time, 0.5);
    }
    if (step === 4 || step === 12) {
      this.playSnare(time, 0.35);
    }
    if (step === 0) {
      // Acorde triunfal expansivo (F mayor / C mayor / G mayor)
      const chord = [174.61, 220, 261.63, 329.63, 440];
      chord.forEach(f => {
        this.playTone(f, 'sawtooth', 1.2, 0.1, time, 0.08, 1.0, 1500);
      });
    }
  }

  // --- ELEMENTOS GENERATIVOS BÁSICOS ---

  playTone(freq, type, duration, gainVal, time, attack = 0.01, decay = 0.1, filterCutoff = null) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(gainVal, time + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      if (filterCutoff) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterCutoff, time);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.compressor);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {
      // Evitar errores de corte
    }
  }

  playNoise(duration, time, filterFreq = 1000, gainVal = 0.2, filterType = 'bandpass') {
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, time);
      filter.Q.setValueAtTime(3.0, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      whiteNoise.start(time);
      whiteNoise.stop(time + duration);
    } catch (e) {}
  }

  playIndustrialKick(time, gainVal = 0.5) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(110, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(time);
      osc.stop(time + 0.25);
    } catch (e) {}
  }

  playPunchyKick(time, gainVal = 0.6) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(time);
      osc.stop(time + 0.18);
    } catch (e) {}
  }

  playSubKick(time, gainVal = 0.7) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.35);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(time);
      osc.stop(time + 0.4);
    } catch (e) {}
  }

  playSnare(time, gainVal = 0.4) {
    try {
      // Componente tonal
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
      oscGain.gain.setValueAtTime(gainVal * 0.7, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(oscGain);
      oscGain.connect(this.compressor);
      osc.start(time);
      osc.stop(time + 0.1);

      // Componente ruido
      this.playNoise(0.14, time, 2500, gainVal, 'highpass');
    } catch (e) {}
  }

  playClap(time, gainVal = 0.4) {
    this.playNoise(0.12, time, 1800, gainVal, 'bandpass');
  }

  playAnvil(time, gainVal = 0.3) {
    [1200, 2400, 3800].forEach((f, idx) => {
      this.playTone(f, 'sine', 0.25, gainVal / (idx + 1), time, 0.002, 0.2);
    });
  }

  playElectricZap(time, gainVal = 0.15) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2000, time);
      osc.frequency.exponentialRampToValueAtTime(300, time + 0.04);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(time);
      osc.stop(time + 0.05);
    } catch (e) {}
  }

  playReeseBass(freq, time, duration, gainVal = 0.3) {
    try {
      // Dos osciladores ligeramente desafinados para efecto reese profundo
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 1.015, time); // Pequeño batimiento

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(650, time + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(200, time + duration);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(gainVal, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
    } catch (e) {}
  }

  // --- EFECTOS DE SONIDO UI (SFX) ---

  playClickSFX() {
    this.ensureContext().then(() => {
      this.playTone(850, 'square', 0.03, 0.25, this.ctx.currentTime, 0.002, 0.02);
    });
  }

  playTransitionSFX() {
    this.ensureContext().then(() => {
      const now = this.ctx.currentTime;
      // Laser / Sub-drop swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now);
      osc.stop(now + 0.35);
      this.playNoise(0.2, now, 2000, 0.15, 'bandpass');
    });
  }

  playAlertSFX() {
    this.ensureContext().then(() => {
      const now = this.ctx.currentTime;
      this.playTone(987.77, 'sine', 0.1, 0.3, now, 0.005, 0.08);
      this.playTone(1318.51, 'sine', 0.15, 0.3, now + 0.08, 0.005, 0.12);
    });
  }

  // --- SÍNTESIS VOCAL (TTS NARRADOR SINCRONIZADO) ---

  speakNarration(text) {
    if (!this.ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      if (this.ttsVoice) utterance.voice = this.ttsVoice;
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS unavailable or restricted:", e);
    }
  }

  stopNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // --- OBTENCIÓN DE DATOS PARA VISUALIZADOR ---

  getVisualizerData() {
    if (!this.analyser) {
      return { frequencies: new Uint8Array(16), waveform: new Uint8Array(16) };
    }
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    const waveData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(waveData);
    return { frequencies: freqData, waveform: waveData };
  }
}

window.soundEngine = new SoundEngine();
