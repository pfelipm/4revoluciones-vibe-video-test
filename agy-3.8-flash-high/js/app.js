/**
 * INICIALIZADOR DE LA APLICACIÓN (app.js)
 * Orquestación de módulos, eventos globales y primer render
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar motor de gráficos en Canvas
  const motionEngine = new MotionGraphicsEngine('canvasVisuals');

  // 2. Inicializar controlador del reproductor cinematográfico
  const player = new VideoPlayerController(REVOLUTIONS_DATA, window.soundEngine, motionEngine);

  // 3. Vincular botones de retroceso y avance rápido
  const btnRewind = document.getElementById('btnRewind');
  const btnForward = document.getElementById('btnForward');

  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      player.seekTo(player.currentTime - 5);
      window.soundEngine.playClickSFX();
    });
  }

  if (btnForward) {
    btnForward.addEventListener('click', () => {
      player.seekTo(player.currentTime + 5);
      window.soundEngine.playClickSFX();
    });
  }

  // 4. Desbloqueo proactivo del AudioContext en la primera interacción del usuario
  const unlockAudio = () => {
    window.soundEngine.ensureContext();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });

  // 5. Render inicial de la primera escena en reposo
  motionEngine.render();

  // Exponer reproductor globalmente para depuración o automatizaciones
  window.appPlayer = player;
  window.appMotion = motionEngine;
  
  console.log("🎬 Reproductor Educativo 4 Revoluciones Industriales iniciado con éxito.");
});
