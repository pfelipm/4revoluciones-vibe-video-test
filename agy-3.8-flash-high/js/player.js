/**
 * CONTROLADOR CINEMATOGRÁFICO & MÁQUINA DE ESTADOS DEL VIDEO
 * Línea de tiempo, sincronización de escenas, subtítulos, teleprompter y visuales
 */

class VideoPlayerController {
  constructor(data, soundEngine, motionEngine) {
    this.data = data;
    this.soundEngine = soundEngine;
    this.motionEngine = motionEngine;

    this.currentTime = 0;
    this.duration = data.meta.totalDuration;
    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.lastFrameTimestamp = null;
    this.animationFrameId = null;

    this.currentAct = null;
    this.currentScene = null;
    this.allScenes = [];

    // Flatten escenas con sus tiempos absolutos
    this.initScenes();

    // Referencias al DOM
    this.dom = {
      playerFrame: document.getElementById('videoPlayerFrame'),
      canvasVisuals: document.getElementById('canvasVisuals'),
      canvasVisualizer: document.getElementById('canvasVisualizer'),
      // Textos y etiquetas de escena
      actBadge: document.getElementById('actBadge'),
      actTitle: document.getElementById('actTitle'),
      actEpoch: document.getElementById('actEpoch'),
      sceneHeadline: document.getElementById('sceneHeadline'),
      sceneSubheadline: document.getElementById('sceneSubheadline'),
      keyPointsList: document.getElementById('keyPointsList'),
      statValue: document.getElementById('statValue'),
      statLabel: document.getElementById('statLabel'),
      statContainer: document.getElementById('statContainer'),
      subtitlesText: document.getElementById('subtitlesText'),
      activeTagBadge: document.getElementById('activeTagBadge'),
      // Controles de barra
      btnPlayPause: document.getElementById('btnPlayPause'),
      iconPlay: document.getElementById('iconPlay'),
      iconPause: document.getElementById('iconPause'),
      progressTrack: document.getElementById('progressTrack'),
      progressFill: document.getElementById('progressFill'),
      scrubHandle: document.getElementById('scrubHandle'),
      timeDisplay: document.getElementById('timeDisplay'),
      // Audio y botones
      btnMute: document.getElementById('btnMute'),
      volumeSlider: document.getElementById('volumeSlider'),
      btnTTS: document.getElementById('btnTTS'),
      btnFullscreen: document.getElementById('btnFullscreen'),
      speedSelector: document.getElementById('speedSelector'),
      chapterMarksContainer: document.getElementById('chapterMarksContainer'),
      actNavButtons: document.querySelectorAll('.act-nav-btn'),
      // Modal matriz comparativa
      btnMatrixToggle: document.getElementById('btnMatrixToggle'),
      matrixModal: document.getElementById('matrixModal'),
      btnCloseMatrix: document.getElementById('btnCloseMatrix'),
      matrixTableBody: document.getElementById('matrixTableBody')
    };

    this.visualizerCtx = this.dom.canvasVisualizer ? this.dom.canvasVisualizer.getContext('2d') : null;
    this.initChapterMarks();
    this.initMatrixTable();
    this.bindEvents();
    this.seekTo(0);
  }

  initScenes() {
    this.allScenes = [];
    this.data.acts.forEach(act => {
      act.scenes.forEach(scene => {
        this.allScenes.push({
          ...scene,
          actId: act.id,
          actNumber: act.number,
          actTitle: act.title,
          actSubtitle: act.subtitle,
          actEpoch: act.epoch,
          actColor: act.themeColor,
          musicMode: act.musicMode
        });
      });
    });
  }

  initChapterMarks() {
    if (!this.dom.chapterMarksContainer) return;
    this.dom.chapterMarksContainer.innerHTML = '';
    
    this.data.acts.forEach(act => {
      const firstScene = act.scenes[0];
      const percent = (firstScene.start / this.duration) * 100;
      
      const mark = document.createElement('div');
      mark.className = 'chapter-mark';
      mark.style.left = `${percent}%`;
      mark.title = `${act.title} (${act.epoch})`;
      mark.innerHTML = `<span class="chapter-tooltip">${act.title}</span>`;
      mark.addEventListener('click', (e) => {
        e.stopPropagation();
        this.seekTo(firstScene.start);
      });
      this.dom.chapterMarksContainer.appendChild(mark);
    });
  }

  initMatrixTable() {
    if (!this.dom.matrixTableBody || !this.data.comparisonMatrix) return;
    this.dom.matrixTableBody.innerHTML = '';

    this.data.comparisonMatrix.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:${row.color}; background:#000; padding:2px 6px; border:2px solid #000;">${row.revolution}</strong><br><small>${row.period}</small></td>
        <td><strong>${row.keyEnergy}</strong></td>
        <td>${row.flagshipInvention}</td>
        <td>${row.transport}</td>
        <td>${row.communication}</td>
        <td>${row.socialShift}</td>
      `;
      this.dom.matrixTableBody.appendChild(tr);
    });
  }

  bindEvents() {
    // Play / Pause
    if (this.dom.btnPlayPause) {
      this.dom.btnPlayPause.addEventListener('click', () => this.togglePlay());
    }

    // Scrubbing en la barra de progreso
    if (this.dom.progressTrack) {
      let isDragging = false;

      const handleScrub = (e) => {
        const rect = this.dom.progressTrack.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.seekTo(ratio * this.duration);
      };

      this.dom.progressTrack.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleScrub(e);
        this.soundEngine.playClickSFX();
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) handleScrub(e);
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Táctil
      this.dom.progressTrack.addEventListener('touchstart', (e) => {
        isDragging = true;
        handleScrub(e);
      });
      window.addEventListener('touchmove', (e) => {
        if (isDragging) handleScrub(e);
      });
      window.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // Botones de salto por Actos
    if (this.dom.actNavButtons) {
      this.dom.actNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const actIndex = parseInt(btn.dataset.act, 10);
          this.jumpToAct(actIndex);
          this.soundEngine.playClickSFX();
        });
      });
    }

    // Volumen y Mute
    if (this.dom.btnMute) {
      this.dom.btnMute.addEventListener('click', () => {
        const isMuted = this.soundEngine.toggleMute();
        this.dom.btnMute.classList.toggle('is-muted', isMuted);
        this.dom.btnMute.innerText = isMuted ? '🔇 MUDO' : '🔊 AUDIO ON';
      });
    }

    if (this.dom.volumeSlider) {
      this.dom.volumeSlider.addEventListener('input', (e) => {
        this.soundEngine.setVolume(parseFloat(e.target.value));
      });
    }

    // Narrador TTS voz en off
    if (this.dom.btnTTS) {
      this.dom.btnTTS.addEventListener('click', () => {
        this.soundEngine.ttsEnabled = !this.soundEngine.ttsEnabled;
        this.dom.btnTTS.classList.toggle('btn-active', this.soundEngine.ttsEnabled);
        this.dom.btnTTS.innerText = this.soundEngine.ttsEnabled ? '🎙️ VOZ ON' : '🎙️ VOZ OFF';
        if (!this.soundEngine.ttsEnabled) {
          this.soundEngine.stopNarration();
        } else if (this.currentScene) {
          this.soundEngine.speakNarration(this.currentScene.narration);
        }
      });
    }

    // Velocidad de reproducción
    if (this.dom.speedSelector) {
      this.dom.speedSelector.addEventListener('change', (e) => {
        this.playbackRate = parseFloat(e.target.value);
        this.soundEngine.playClickSFX();
      });
    }

    // Pantalla completa
    if (this.dom.btnFullscreen) {
      this.dom.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    // Modal matriz comparativa
    if (this.dom.btnMatrixToggle) {
      this.dom.btnMatrixToggle.addEventListener('click', () => {
        this.dom.matrixModal.classList.add('is-open');
        this.soundEngine.playClickSFX();
      });
    }
    if (this.dom.btnCloseMatrix) {
      this.dom.btnCloseMatrix.addEventListener('click', () => {
        this.dom.matrixModal.classList.remove('is-open');
        this.soundEngine.playClickSFX();
      });
    }

    // Atajos de teclado para comodidad de estudio
    window.addEventListener('keydown', (e) => {
      // Ignorar si el usuario está escribiendo en un input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.seekTo(Math.min(this.duration, this.currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekTo(Math.max(0, this.currentTime - 5));
      } else if (e.code === 'KeyM') {
        this.dom.btnMute.click();
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.key >= '0' && e.key <= '5') {
        this.jumpToAct(parseInt(e.key, 10));
      }
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
    }
    this.isPlaying = true;
    this.lastFrameTimestamp = performance.now();
    this.dom.btnPlayPause.classList.add('is-playing');
    this.dom.iconPlay.style.display = 'none';
    this.dom.iconPause.style.display = 'inline-block';

    this.soundEngine.startPlayback();
    this.motionEngine.start();

    if (this.currentScene && this.soundEngine.ttsEnabled) {
      this.soundEngine.speakNarration(this.currentScene.narration);
    }

    this.tick();
  }

  pause() {
    this.isPlaying = false;
    this.lastFrameTimestamp = null;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.dom.btnPlayPause.classList.remove('is-playing');
    this.dom.iconPlay.style.display = 'inline-block';
    this.dom.iconPause.style.display = 'none';

    this.soundEngine.stopPlayback();
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    this.updateSceneState(true);
    this.updateTimelineUI();
    this.renderVisualizer();
  }

  jumpToAct(actIndex) {
    const targetAct = this.data.acts.find(a => a.number === actIndex) || this.data.acts[0];
    if (targetAct && targetAct.scenes.length > 0) {
      this.seekTo(targetAct.scenes[0].start);
      this.soundEngine.playTransitionSFX();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.dom.playerFrame.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  tick() {
    if (!this.isPlaying) return;

    const now = performance.now();
    if (this.lastFrameTimestamp) {
      const deltaSec = ((now - this.lastFrameTimestamp) / 1000) * this.playbackRate;
      this.currentTime += deltaSec;

      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
        this.updateTimelineUI();
        return;
      }
    }
    this.lastFrameTimestamp = now;

    this.updateSceneState(false);
    this.updateTimelineUI();
    this.renderVisualizer();

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  updateSceneState(forceUpdate = false) {
    const t = this.currentTime;
    // Buscar la escena correspondiente al segundo actual
    const scene = this.allScenes.find(s => t >= s.start && t < s.end) || this.allScenes[this.allScenes.length - 1];

    if (!scene) return;

    const sceneChanged = !this.currentScene || this.currentScene.id !== scene.id;
    const actChanged = !this.currentAct || this.currentAct.number !== scene.actNumber;

    if (sceneChanged || forceUpdate) {
      this.currentScene = scene;
      this.currentAct = this.data.acts.find(a => a.number === scene.actNumber);

      // Actualizar visuales del Canvas Motion Engine
      this.motionEngine.setVisualType(scene.visualType);

      // Sincronizar banda sonora según el acto
      this.soundEngine.setActMusic(scene.musicMode);

      // Si ha cambiado de acto o escena, disparar narración si está en play
      if (this.isPlaying && this.soundEngine.ttsEnabled) {
        this.soundEngine.speakNarration(scene.narration);
      }

      if (sceneChanged && !forceUpdate) {
        this.soundEngine.playTransitionSFX();
      }

      this.renderSceneDOM(scene);
    }
  }

  renderSceneDOM(scene) {
    // Act badges & titles
    if (this.dom.actBadge) {
      this.dom.actBadge.innerText = `ACTO 0${scene.actNumber}`;
      this.dom.actBadge.style.backgroundColor = scene.actColor;
    }
    if (this.dom.actTitle) this.dom.actTitle.innerText = scene.actTitle;
    if (this.dom.actEpoch) this.dom.actEpoch.innerText = scene.actEpoch;
    if (this.dom.activeTagBadge) this.dom.activeTagBadge.innerText = `// ${scene.tag}`;

    // Headings de la escena
    if (this.dom.sceneHeadline) this.dom.sceneHeadline.innerText = scene.headline;
    if (this.dom.sceneSubheadline) this.dom.sceneSubheadline.innerText = scene.subheadline;

    // Subtítulos tipo teleprompter cinematográfico
    if (this.dom.subtitlesText) {
      this.dom.subtitlesText.innerText = `"${scene.narration}"`;
    }

    // Puntos clave educativos (Key points)
    if (this.dom.keyPointsList) {
      this.dom.keyPointsList.innerHTML = '';
      scene.keyPoints.forEach(pt => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bullet-box">■</span> ${pt}`;
        this.dom.keyPointsList.appendChild(li);
      });
    }

    // Estadística destacada
    if (this.dom.statValue && this.dom.statLabel) {
      this.dom.statValue.innerText = scene.stat.value;
      this.dom.statLabel.innerText = scene.stat.label;
      if (this.dom.statContainer) {
        this.dom.statContainer.style.borderColor = "#000000";
        this.dom.statContainer.style.backgroundColor = scene.actColor;
      }
    }

    // Actualizar botones de navegación por actos
    if (this.dom.actNavButtons) {
      this.dom.actNavButtons.forEach(btn => {
        const aNum = parseInt(btn.dataset.act, 10);
        btn.classList.toggle('active-act-btn', aNum === scene.actNumber);
      });
    }

    // Ajustar borde temático del marco de video
    if (this.dom.playerFrame) {
      this.dom.playerFrame.style.setProperty('--current-theme', scene.actColor);
    }
  }

  updateTimelineUI() {
    const percent = (this.currentTime / this.duration) * 100;

    if (this.dom.progressFill) {
      this.dom.progressFill.style.width = `${percent}%`;
    }
    if (this.dom.scrubHandle) {
      this.dom.scrubHandle.style.left = `${percent}%`;
    }
    if (this.dom.timeDisplay) {
      this.dom.timeDisplay.innerText = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
    }
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(mins)}:${pad(secs)}`;
  }

  // Visualizador de Audio Reactivo Neobrutalista
  renderVisualizer() {
    if (!this.visualizerCtx || !this.dom.canvasVisualizer) return;
    const ctx = this.visualizerCtx;
    const w = this.dom.canvasVisualizer.width;
    const h = this.dom.canvasVisualizer.height;

    ctx.clearRect(0, 0, w, h);

    const { frequencies } = this.soundEngine.getVisualizerData();
    this.motionEngine.updateAudioData({ frequencies });

    const numBars = 16;
    const barWidth = Math.floor(w / numBars) - 2;

    for (let i = 0; i < numBars; i++) {
      const val = frequencies[i * 2] || 0;
      const barHeight = Math.max(3, (val / 255) * (h - 4));
      const x = i * (barWidth + 2);
      const y = h - barHeight;

      // Estilo neobrutalista: barra sólida con contorno negro
      ctx.fillStyle = this.currentScene ? this.currentScene.actColor : "#FFE600";
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, barWidth, barHeight);
    }
  }
}

window.VideoPlayerController = VideoPlayerController;
