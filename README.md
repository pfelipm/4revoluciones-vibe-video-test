# 4 revoluciones, 7 IA y un viernes de lluvia

Prueba **rápida, informal y nada rigurosa**: el mismo prompt para generar un «vídeo» educativo sobre las cuatro revoluciones industriales usando solo HTML, CSS y JavaScript, en siete combinaciones de modelo y arnés.

👉 **Sitio con las grabaciones y las versiones ejecutables:** https://pfelipm.github.io/4revoluciones-vibe-video-test/

## El prompt

> Genera un video sobre la cronología de las 4 revoluciones industriales usando solo código (html, css, js). Estilo neobrutalista, incluye animaciones, transiciones, fundidos y todo tipo de efectos visuales propios de una producción educativa con una realización profesional. Añade una banda sonora de fondo sincronizada con las imágenes.

## Contenido del repositorio

| Carpeta | Modelo | Arnés |
|---|---|---|
| [`claude-5.5/`](claude-5.5/) | Claude Opus 5.5 | Claude Code |
| [`DeepSeekV4-Flash-max/`](DeepSeekV4-Flash-max/) | DeepSeek V4 Flash (max) | OpenCode 2 |
| [`agy-3.8-flash-high/`](agy-3.8-flash-high/) | Gemini 3.8 Flash (high) | Antigravity CLI |
| [`agy-3.1-pro-high/`](agy-3.1-pro-high/) | Gemini 3.1 Pro (high) | Antigravity CLI |
| [`geminiapp/`](geminiapp/) | Gemini 3.8 Flash (con y sin razonamiento ampliado) y Gemini 3.1 Pro (razonamiento ampliado, v1–v9) | App web de Gemini |
| [`videos/`](videos/) | Grabaciones de cada versión (MP4, 1280×720) | — |
| [`sitio/`](sitio/) e `index.html` | El sitio web de la prueba | — |

Las versiones se publican tal como las generó cada herramienta, sin modificar.

## Autor

[Pablo Felip Monferrer](https://pablofelip.online) · Castellón, octubre de 2026.
