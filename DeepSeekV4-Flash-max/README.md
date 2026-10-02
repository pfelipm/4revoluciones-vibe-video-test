# 4REVOLUCIONES — El documental neobrutalista 100% código

Película animada sobre la cronología de las **4 revoluciones industriales**
(1765 → hoy), realizada **únicamente con HTML, CSS y JavaScript**:
0 imágenes, 0 vídeos, 0 audios externos. Todo se genera en tiempo real.

## Cómo verlo

1. Abre `index.html` en un navegador moderno (Chrome/Edge/Firefox).
2. Pulsa **“PULSA PARA REPRODUCIR”** (el audio necesita ese gesto del navegador).
3. Disfruta: ~2:55 min · 22 escenas · banda sonora sintetizada en vivo.

> Sin conexión a internet también funciona (las fuentes web caen a
> alternativas del sistema; el audio es 100% local).

## Controles

| Tecla     | Acción                          |
|-----------|---------------------------------|
| `Espacio` | Reproducir / pausar             |
| `← / →`   | Retroceder / avanzar 5 s        |
| `↑ / ↓`   | ±1 s                            |
| `1–4`     | Saltar al capítulo 1–4          |
| `M`       | Silenciar                       |
| `R`       | Reiniciar                       |
| `F`       | Pantalla completa               |

En la barra inferior: botones de transporte, barra de progreso con las
4 eras coloreadas (clic para saltar) y chips de capítulo.

## Trucos útiles

- **Modo foto / capturas**: `index.html?shot=30` abre el “vídeo” en el
  segundo 30 sin audio ni portada (también `?shot=118`, `?shot=168`…).
- **Grabar un vídeo real**: abre el archivo, pon pantalla completa (`F`) y
  graba la pestaña con OBS / Screencast / “Grabar pestaña” de Chrome.
- Desde la consola: `__4rev.play()`, `__4rev.pause()`, `__4rev.seek(t)`.

## Arquitectura

```
index.html   → 22 escenas (cold open, título, 4 capítulos, línea del tiempo, fin)
styles.css   → estética neobrutalista + todas las animaciones/keyframes
script.js    → transporte de vídeo, motor de escenas, partículas y música
```

- **Banda sonora**: Web Audio API. Cada era tiene un estilo propio:
  vapor (industrial 90 BPM), electricidad (funk eléctrico 124 BPM),
  digital (chiptune 140 BPM), IA (ambiente evolutivo 72 BPM), más pads
  y resolución final. Efectos (whips, zaps, silbidos, scratch, risers…)
  sincronizados con las escenas vía “cue list”.
- **Efectos visuales**: wipes de corte, glitch, confeti, humo/brasa,
  arcos de voltaje, lluvia digital, redes neuronales, contadores
  animados, máquina de escribir, timecode SMPTE, grano de película,
  scanlines y viñeta CRT.

Duración total programática: 174,7 s (ajustable en `SCENES` de `script.js`).