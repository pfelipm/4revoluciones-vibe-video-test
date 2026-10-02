/**
 * MOTOR DE GRÁFICOS Y ANIMACIONES PROCEDURALES (HTML5 Canvas)
 * Visuales de cada revolución: Máquina de vapor, Red eléctrica, Microchip, Red Neuronal 3D
 */

class MotionGraphicsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.currentVisualType = 'windmill_clockwork';
    this.animationId = null;
    this.time = 0;
    this.particles = [];
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.audioData = { frequencies: new Uint8Array(32), waveform: new Uint8Array(32) };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    // Iniciar loop continuo de animación procedural
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Soporte para pantallas Retina / alta densidad
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setVisualType(type) {
    if (this.currentVisualType !== type) {
      this.currentVisualType = type;
      this.triggerTransition();
    }
  }

  triggerTransition() {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    // Dispersar partículas temáticas
    this.spawnTransitionBurst();
  }

  updateAudioData(data) {
    if (data) this.audioData = data;
  }

  start() {
    if (this.animationId) return;
    const loop = (timestamp) => {
      this.time = timestamp * 0.001; // en segundos
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Limpieza con fondo base sutil o rejilla técnica
    ctx.clearRect(0, 0, w, h);

    // Dibujar cuadrícula técnica neobrutalista de fondo
    this.drawTechnicalGrid(ctx, w, h);

    // Nivel medio de audio para reactividad visual
    let audioEnergy = 0;
    if (this.audioData && this.audioData.frequencies) {
      const sum = this.audioData.frequencies.reduce((a, b) => a + b, 0);
      audioEnergy = (sum / (this.audioData.frequencies.length * 255));
    }

    // Dibujar la escena principal correspondiente
    ctx.save();
    switch (this.currentVisualType) {
      case 'windmill_clockwork':
      case 'mine_water':
        this.drawAct0Visuals(ctx, w, h, audioEnergy);
        break;

      case 'steam_engine':
      case 'textile_loom':
      case 'steam_locomotive':
      case 'urban_smoke':
        this.drawAct1SteamEngine(ctx, w, h, audioEnergy);
        break;

      case 'electric_grid':
      case 'bessemer_furnace':
      case 'assembly_line':
      case 'telecom_waves':
        this.drawAct2Electricity(ctx, w, h, audioEnergy);
        break;

      case 'microchip_bus':
      case 'robotic_arm':
      case 'network_nodes':
      case 'pc_terminal':
        this.drawAct3Microchip(ctx, w, h, audioEnergy);
        break;

      case 'cyber_physical_core':
      case 'neural_network_3d':
      case 'dna_cyber_mesh':
      case 'dilemma_balance':
        this.drawAct4NeuralNetwork(ctx, w, h, audioEnergy);
        break;

      case 'comparison_matrix':
      default:
        this.drawAct5Epilogue(ctx, w, h, audioEnergy);
        break;
    }
    ctx.restore();

    // Renderizar partículas dinámicas
    this.updateAndDrawParticles(ctx, w, h);

    // Efecto de transición / glitch neobrutalista
    if (this.isTransitioning) {
      this.drawGlitchWipe(ctx, w, h);
    }
  }

  // Cuadrícula arquitectónica neobrutalista
  drawTechnicalGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 1;
    const gridSize = 40;

    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Marcas de diana en esquinas
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    const crossSize = 10;
    const corners = [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx - crossSize, cy);
      ctx.lineTo(cx + crossSize, cy);
      ctx.moveTo(cx, cy - crossSize);
      ctx.lineTo(cx, cy + crossSize);
      ctx.stroke();
    });
    ctx.restore();
  }

  // --- ACTO 0: MOLINO DE VIENTO Y ENGRANAJES DE MADERA ---
  drawAct0Visuals(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.31;
    const angle = this.time * 0.8;

    // Torre de molino neobrutalista
    ctx.save();
    ctx.fillStyle = "#FFE600";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    // Cuerpo piramidal del molino
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 130);
    ctx.lineTo(cx - 35, cy - 60);
    ctx.lineTo(cx + 35, cy - 60);
    ctx.lineTo(cx + 70, cy + 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sombra proyectada dura
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 15, cy + 50, 30, 80); // Puerta negra sólida
    ctx.strokeRect(cx - 15, cy + 50, 30, 80);

    // Ventanas tipo cruz
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cx - 20, cy - 30, 40, 25);
    ctx.strokeRect(cx - 20, cy - 30, 40, 25);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 30);
    ctx.lineTo(cx, cy - 5);
    ctx.moveTo(cx - 20, cy - 17);
    ctx.lineTo(cx + 20, cy - 17);
    ctx.stroke();

    // Aspas giratorias del molino
    ctx.translate(cx, cy - 60);
    ctx.rotate(angle);

    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      // Brazo principal
      ctx.strokeRect(0, -6, 140, 12);
      ctx.fillRect(0, -6, 140, 12);
      // Tela del aspa
      ctx.fillStyle = "#000000";
      ctx.fillRect(30, 6, 100, 32);
      ctx.strokeRect(30, 6, 100, 32);
      // Rayas en la lona
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      for (let rx = 40; rx < 125; rx += 15) {
        ctx.beginPath();
        ctx.moveTo(rx, 6);
        ctx.lineTo(rx, 38);
        ctx.stroke();
      }
      ctx.strokeStyle = "#000000";
    }

    // Eje central
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#FFE600";
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Indicador neobrutalista flotante
    this.drawFloatingMetric(ctx, cx + 180, cy - 70, "RPM: 12", "ENERGÍA EÓLICA NATURAL");
  }

  // --- ACTO 1: MÁQUINA DE VAPOR DE WATT COMPLETA ---
  drawAct1SteamEngine(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.32;
    const speed = 2.8 + audio * 1.5;
    const rot = this.time * speed;

    // Emisión continua de partículas de vapor
    if (Math.random() < 0.45) {
      this.particles.push({
        x: cx - 120 + (Math.random() * 10 - 5),
        y: cy - 90,
        vx: (Math.random() - 0.5) * 1.5 - 2,
        vy: -2.5 - Math.random() * 2,
        radius: 8 + Math.random() * 8,
        color: "#FFFFFF",
        alpha: 0.8,
        life: 1.0,
        type: 'steam'
      });
    }

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";

    // 1. Base / Caldera de ladrillo industrial
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(cx - 240, cy + 40, 480, 80);
    ctx.strokeRect(cx - 240, cy + 40, 480, 80);

    // Patrón de ladrillos
    ctx.lineWidth = 2;
    for (let y = cy + 40; y < cy + 120; y += 20) {
      const shift = ((y - cy) / 20) % 2 === 0 ? 0 : 25;
      for (let x = cx - 240 + shift; x < cx + 240; x += 50) {
        ctx.strokeRect(x, y, 50, 20);
      }
    }
    ctx.lineWidth = 4;

    // 2. Cilindro y pistón de vapor (Lado izquierdo)
    const pistonY = Math.sin(rot) * 25;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cx - 150, cy - 50, 60, 90);
    ctx.strokeRect(cx - 150, cy - 50, 60, 90);

    // Vástago y cabeza del pistón
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 145, cy - 40 + pistonY, 50, 16);
    ctx.strokeRect(cx - 145, cy - 40 + pistonY, 50, 16);

    ctx.fillRect(cx - 122, cy - 100 + pistonY * 0.6, 6, 60);

    // Tubo de escape de vapor
    ctx.fillStyle = "#FFE600";
    ctx.fillRect(cx - 130, cy - 85, 20, 35);
    ctx.strokeRect(cx - 130, cy - 85, 20, 35);

    // 3. Columna de soporte central y Balancín oscilante (Walking Beam)
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 12, cy - 80, 24, 120);
    ctx.strokeRect(cx - 12, cy - 80, 24, 120);

    // Balancín articulado en la parte superior
    const beamAngle = Math.sin(rot) * 0.22;
    ctx.save();
    ctx.translate(cx, cy - 80);
    ctx.rotate(beamAngle);

    // Haz metálico del balancín
    ctx.fillStyle = "#FFE600";
    ctx.fillRect(-140, -12, 280, 24);
    ctx.strokeRect(-140, -12, 280, 24);

    // Puntos de pivote circulares
    ctx.fillStyle = "#FFFFFF";
    [-120, 0, 120].forEach(px => {
      ctx.beginPath();
      ctx.arc(px, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();

    // 4. Volante de inercia pesado (Flywheel gigante, Lado derecho)
    const flywheelX = cx + 120;
    const flywheelY = cy;
    const flywheelRadius = 65;

    // Sombra sólida del volante
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(flywheelX + 6, flywheelY + 6, flywheelRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo del volante
    ctx.fillStyle = "#FF5252";
    ctx.beginPath();
    ctx.arc(flywheelX, flywheelY, flywheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Radios giratorios
    ctx.save();
    ctx.translate(flywheelX, flywheelY);
    ctx.rotate(-rot);
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(flywheelRadius - 6, 0);
      ctx.stroke();
    }
    // Anillo interior
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Barra de conexión bielas (Connecting Rod)
    const crankX = flywheelX + Math.cos(-rot) * 35;
    const crankY = flywheelY + Math.sin(-rot) * 35;
    const beamRightX = cx + Math.cos(beamAngle) * 120;
    const beamRightY = (cy - 80) + Math.sin(beamAngle) * 120;

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(beamRightX, beamRightY);
    ctx.lineTo(crankX, crankY);
    ctx.stroke();
    ctx.lineWidth = 4;

    ctx.restore();

    // Manómetro de presión con aguja vibrante
    this.drawPressureGauge(ctx, cx - 180, cy + 10, audio);

    // Métricas en badges neobrutalistas
    this.drawFloatingMetric(ctx, cx + 190, cy - 70, "1769 PATENT", "JAMES WATT CONDENSER");
  }

  // --- ACTO 2: RED ELÉCTRICA, BOBINA TESLA Y CADENA DE MONTAJE ---
  drawAct2Electricity(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.32;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";

    // 1. Bobina de Tesla / Torre de Alto Voltaje (Centro-Izquierda)
    const teslaX = cx - 120;
    const teslaY = cy + 20;

    // Base piramidal
    ctx.fillStyle = "#00F0FF";
    ctx.fillRect(teslaX - 45, teslaY + 50, 90, 40);
    ctx.strokeRect(teslaX - 45, teslaY + 50, 90, 40);

    // Bobina secundaria estriada
    ctx.fillStyle = "#FFE600";
    ctx.fillRect(teslaX - 25, teslaY - 50, 50, 100);
    ctx.strokeRect(teslaX - 25, teslaY - 50, 50, 100);
    // Espiras de cobre
    ctx.lineWidth = 2;
    for (let ey = teslaY - 45; ey < teslaY + 45; ey += 8) {
      ctx.beginPath();
      ctx.moveTo(teslaX - 25, ey);
      ctx.lineTo(teslaX + 25, ey);
      ctx.stroke();
    }
    ctx.lineWidth = 4;

    // Toroide superior metálico
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(teslaX, teslaY - 65, 45, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Chispas y rayos de alta tensión (Electric Lightning Arcs)
    const numBolts = 3 + Math.floor(audio * 4);
    for (let b = 0; b < numBolts; b++) {
      this.drawLightningBolt(ctx, teslaX, teslaY - 65, teslaX + (Math.random() * 180 - 60), teslaY - 140 - Math.random() * 50);
    }

    // 3. Bombilla de Edison incandescente gigante (Centro-Derecha)
    const bulbX = cx + 120;
    const bulbY = cy - 40;
    const glowIntensity = 0.5 + audio * 0.5;

    // Resplandor neobrutalista circular
    ctx.fillStyle = `rgba(0, 240, 255, ${0.15 * glowIntensity})`;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 75, 0, Math.PI * 2);
    ctx.fill();

    // Cristal de la bombilla
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Casquillo roscado
    ctx.fillStyle = "#000000";
    ctx.fillRect(bulbX - 20, bulbY + 45, 40, 25);
    ctx.strokeRect(bulbX - 20, bulbY + 45, 40, 25);

    // Filamento de carbono encendido
    ctx.strokeStyle = "#FF5252";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bulbX - 12, bulbY + 30);
    ctx.lineTo(bulbX - 8, bulbY - 15);
    ctx.lineTo(bulbX, bulbY - 25);
    ctx.lineTo(bulbX + 8, bulbY - 15);
    ctx.lineTo(bulbX + 12, bulbY + 30);
    ctx.stroke();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    // 4. Cinta transportadora continua (Ford Assembly Line - Abajo)
    const beltY = cy + 70;
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 220, beltY, 440, 30);
    ctx.strokeRect(cx - 220, beltY, 440, 30);

    // Rodillos giratorios de la cinta
    const beltOffset = (this.time * 60) % 40;
    for (let rx = cx - 200 + beltOffset; rx < cx + 220; rx += 40) {
      ctx.fillStyle = "#00F0FF";
      ctx.beginPath();
      ctx.arc(rx, beltY + 15, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Cajas / Automóviles en producción que se desplazan
    const carOffset = (this.time * 50) % 140;
    for (let bx = cx - 180 + carOffset; bx < cx + 200; bx += 140) {
      ctx.fillStyle = "#FFE600";
      ctx.fillRect(bx, beltY - 24, 45, 24);
      ctx.strokeRect(bx, beltY - 24, 45, 24);
      ctx.fillStyle = "#000000";
      ctx.fillRect(bx + 8, beltY - 18, 12, 10);
      ctx.fillRect(bx + 25, beltY - 18, 12, 10);
    }

    ctx.restore();

    this.drawFloatingMetric(ctx, cx - 180, cy - 20, "110V AC / 60Hz", "CORRIENTE ALTERNA TESLA");
    this.drawFloatingMetric(ctx, cx + 190, cy - 70, "93 MIN / AUTO", "FORD MODEL T LINE");
  }

  // --- ACTO 3: MICROCHIP, BUSES DE DATOS Y TERMINAL CRT DIGITAL ---
  drawAct3Microchip(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.32;
    const pulse = Math.sin(this.time * 8) * 0.5 + 0.5;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";

    // 1. Placa de circuito impreso (PCB) base verde neobrutalista
    ctx.fillStyle = "#00E676";
    ctx.fillRect(cx - 200, cy - 120, 400, 240);
    ctx.strokeRect(cx - 200, cy - 120, 400, 240);

    // Sombra dura
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 195, cy + 124, 400, 8);

    // 2. Trazas de cobre y buses de datos
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    const traces = [
      [cx - 190, cy - 80, cx - 80, cy - 80, cx - 40, cy - 40],
      [cx - 190, cy, cx - 70, cy],
      [cx - 190, cy + 80, cx - 80, cy + 80, cx - 40, cy + 40],
      [cx + 190, cy - 80, cx + 80, cy - 80, cx + 40, cy - 40],
      [cx + 190, cy, cx + 70, cy],
      [cx + 190, cy + 80, cx + 80, cy + 80, cx + 40, cy + 40]
    ];

    traces.forEach(pts => {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(pts[i], pts[i + 1]);
      }
      ctx.stroke();

      // Puntos de soldadura dorados
      ctx.fillStyle = "#FFE600";
      ctx.beginPath();
      ctx.arc(pts[0], pts[1], 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Paquetes de bits viajando por los buses
    const packetT = (this.time * 2) % 1;
    ctx.fillStyle = "#FFFFFF";
    traces.forEach(pts => {
      const px = pts[0] + (pts[pts.length - 2] - pts[0]) * packetT;
      const py = pts[1] + (pts[pts.length - 1] - pts[1]) * packetT;
      ctx.fillRect(px - 4, py - 4, 8, 8);
      ctx.strokeRect(px - 4, py - 4, 8, 8);
    });

    // 3. Procesador central (Intel 4004 / Microchip Monolítico)
    const chipW = 110;
    const chipH = 110;
    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);
    ctx.strokeRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);

    // Pines dorados del chip
    ctx.fillStyle = "#FFE600";
    for (let py = -40; py <= 40; py += 16) {
      // Pines izquierda
      ctx.fillRect(cx - chipW / 2 - 12, cy + py - 4, 12, 8);
      ctx.strokeRect(cx - chipW / 2 - 12, cy + py - 4, 12, 8);
      // Pines derecha
      ctx.fillRect(cx + chipW / 2, cy + py - 4, 12, 8);
      ctx.strokeRect(cx + chipW / 2, cy + py - 4, 12, 8);
    }

    // Núcleo de silicio reactivo
    ctx.fillStyle = pulse > 0.5 ? "#00F0FF" : "#FFFFFF";
    ctx.fillRect(cx - 30, cy - 30, 60, 60);
    ctx.strokeRect(cx - 30, cy - 30, 60, 60);

    // Tipografía del chip
    ctx.fillStyle = "#000000";
    ctx.font = "900 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("i4004", cx, cy - 5);
    ctx.font = "bold 9px monospace";
    ctx.fillText("SILICON", cx, cy + 12);

    ctx.restore();

    this.drawFloatingMetric(ctx, cx - 180, cy - 20, "1971 // 2300 T", "MICROPROCESADOR INTEL");
    this.drawFloatingMetric(ctx, cx + 180, cy - 50, "TCP/IP // WWW", "RED DE CONMUTACIÓN");
  }

  // --- ACTO 4: RED NEURONAL 3D, CIBERFÍSICA & MODELOS IA ---
  drawAct4NeuralNetwork(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.32;
    const rotY = this.time * 0.6;
    const rotX = Math.sin(this.time * 0.4) * 0.3;

    ctx.save();

    // Nodos en un volumen 3D cúbico simulado
    const nodes = [
      { x: -100, y: -80, z: -60, tag: "LLM" },
      { x: 100, y: -80, z: -60, tag: "IoT" },
      { x: -100, y: 80, z: -60, tag: "CRISPR" },
      { x: 100, y: 80, z: -60, tag: "QUANTUM" },
      { x: -70, y: -60, z: 60, tag: "ROBOT" },
      { x: 70, y: -60, z: 60, tag: "CLOUD" },
      { x: -70, y: 60, z: 60, tag: "TWIN" },
      { x: 70, y: 60, z: 60, tag: "BCI" },
      { x: 0, y: 0, z: 0, tag: "AI CORE" }
    ];

    // Proyección 3D isométrica/perspectiva
    const projected = nodes.map(n => {
      // Rotar en Y
      let x1 = n.x * Math.cos(rotY) - n.z * Math.sin(rotY);
      let z1 = n.x * Math.sin(rotY) + n.z * Math.cos(rotY);
      // Rotar en X
      let y2 = n.y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = n.y * Math.sin(rotX) + z1 * Math.cos(rotX);

      const fov = 350;
      const scale = fov / (fov + z2);
      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        scale: scale,
        tag: n.tag,
        isCore: n.tag === "AI CORE"
      };
    });

    // Conexiones sinápticas entre nodos
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();

          // Impulsos sinápticos animados en las líneas
          if (Math.random() < 0.15) {
            const t = (this.time * 2 + i + j) % 1;
            const sx = projected[i].x + (projected[j].x - projected[i].x) * t;
            const sy = projected[i].y + (projected[j].y - projected[i].y) * t;
            ctx.fillStyle = "#9D4EDD";
            ctx.fillRect(sx - 3, sy - 3, 6, 6);
          }
        }
      }
    }

    // Dibujar nodos neobrutalistas en orden de profundidad
    projected.sort((a, b) => a.scale - b.scale);
    projected.forEach(n => {
      const radius = n.isCore ? 28 * n.scale : 16 * n.scale;
      
      // Sombra sólida
      ctx.fillStyle = "#000000";
      ctx.fillRect(n.x - radius + 4, n.y - radius + 4, radius * 2, radius * 2);

      // Cuerpo del nodo
      ctx.fillStyle = n.isCore ? "#9D4EDD" : (n.scale > 1.0 ? "#00F0FF" : "#FFE600");
      ctx.fillRect(n.x - radius, n.y - radius, radius * 2, radius * 2);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(n.x - radius, n.y - radius, radius * 2, radius * 2);

      // Etiqueta del nodo
      if (n.scale > 0.8) {
        ctx.fillStyle = "#000000";
        ctx.font = `bold ${Math.round(9 * n.scale)}px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.tag, n.x, n.y + 3);
      }
    });

    ctx.restore();

    this.drawFloatingMetric(ctx, cx - 180, cy - 40, "INDUSTRIA 4.0", "FUSIÓN CIBER-FÍSICA");
    this.drawFloatingMetric(ctx, cx + 180, cy - 40, ">10^15 FLOPS", "DEEP LEARNING SYNTHESIS");
  }

  // --- ACTO 5: COMPARATIVA Y SÍNTESIS GLOBAL ---
  drawAct5Epilogue(ctx, w, h, audio) {
    const cx = w * 0.5;
    const cy = h * 0.32;

    ctx.save();
    // 4 Columnas resumen neobrutalistas
    const cols = [
      { num: "1ª REV", year: "1760", tech: "VAPOR", color: "#FF5252", h: 70 },
      { num: "2ª REV", year: "1870", tech: "ELECTRICIDAD", color: "#00F0FF", h: 110 },
      { num: "3ª REV", year: "1969", tech: "SILICIO", color: "#00E676", h: 150 },
      { num: "4ª REV", year: "2016", tech: "I.A. & BIO", color: "#9D4EDD", h: 200 }
    ];

    const colW = 75;
    const spacing = 18;
    const startX = cx - ((cols.length * (colW + spacing)) - spacing) / 2;

    cols.forEach((col, idx) => {
      const x = startX + idx * (colW + spacing);
      const y = cy + 100 - col.h;

      // Sombra
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 5, y + 5, colW, col.h);

      // Barra de aceleración exponencial
      ctx.fillStyle = col.color;
      ctx.fillRect(x, y, colW, col.h);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, colW, col.h);

      // Textos de la columna
      ctx.fillStyle = "#000000";
      ctx.font = "900 13px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(col.num, x + colW / 2, y + 25);

      ctx.font = "bold 11px monospace";
      ctx.fillText(col.year, x + colW / 2, y + 42);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x + 5, y + col.h - 30, colW - 10, 20);
      ctx.strokeRect(x + 5, y + col.h - 30, colW - 10, 20);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 9px monospace";
      ctx.fillText(col.tech, x + colW / 2, y + col.h - 16);
    });

    // Curva exponencial conectando las cumbres
    ctx.strokeStyle = "#FF3366";
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    cols.forEach((c, idx) => {
      const px = startX + idx * (colW + spacing) + colW / 2;
      const py = cy + 100 - c.h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    this.drawFloatingMetric(ctx, cx, cy - 90, "CURVA EXPONENCIAL", "ACELERACIÓN TECNOLÓGICA");
  }

  // --- COMPONENTES GRÁFICOS SECUNDARIOS ---

  drawFloatingMetric(ctx, x, y, title, subtitle) {
    ctx.save();
    ctx.font = "900 12px 'Courier New', monospace";
    const textW = Math.max(ctx.measureText(title).width, ctx.measureText(subtitle).width) + 26;
    const boxH = 44;

    // Sombra dura neobrutalista
    ctx.fillStyle = "#000000";
    ctx.fillRect(x - textW / 2 + 5, y - boxH / 2 + 5, textW, boxH);

    // Caja blanca con borde grueso
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x - textW / 2, y - boxH / 2, textW, boxH);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - textW / 2, y - boxH / 2, textW, boxH);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(title, x, y - 4);
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#555555";
    ctx.fillText(subtitle, x, y + 12);
    ctx.restore();
  }

  drawPressureGauge(ctx, x, y, audio) {
    ctx.save();
    const radius = 32;

    // Sombra
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x + 4, y + 4, radius, 0, Math.PI * 2);
    ctx.fill();

    // Fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Marcas de escala
    for (let a = Math.PI * 0.75; a <= Math.PI * 2.25; a += Math.PI * 0.3) {
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (radius - 8), y + Math.sin(a) * (radius - 8));
      ctx.lineTo(x + Math.cos(a) * (radius - 2), y + Math.sin(a) * (radius - 2));
      ctx.stroke();
    }

    // Aguja vibrante según presión y audio
    const angle = Math.PI * 0.8 + (Math.sin(this.time * 6) * 0.3 + 0.6 + audio) * 1.2;
    ctx.strokeStyle = "#FF5252";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * (radius - 6), y + Math.sin(angle) * (radius - 6));
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PSI", x, y + 18);
    ctx.restore();
  }

  drawLightningBolt(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    const segments = 5;
    let curX = x1;
    let curY = y1;
    for (let i = 1; i <= segments; i++) {
      const targetX = x1 + (x2 - x1) * (i / segments);
      const targetY = y1 + (y2 - y1) * (i / segments);
      const jitterX = (Math.random() - 0.5) * 25;
      const jitterY = (Math.random() - 0.5) * 25;
      curX = targetX + jitterX;
      curY = targetY + jitterY;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();

    // Núcleo blanco
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  spawnTransitionBurst() {
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: this.width * 0.5,
        y: this.height * 0.5,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        radius: 4 + Math.random() * 8,
        color: ['#FFE600', '#FF5252', '#00F0FF', '#00E676', '#9D4EDD'][Math.floor(Math.random() * 5)],
        alpha: 1.0,
        life: 1.0,
        type: 'burst'
      });
    }
  }

  updateAndDrawParticles(ctx, w, h) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;

      if (p.type === 'steam') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (2 - p.life), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        ctx.strokeRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }
      ctx.restore();
    }
  }

  drawGlitchWipe(ctx, w, h) {
    this.transitionProgress += 0.05;
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      return;
    }

    ctx.save();
    // Bandas horizontales de corte neobrutalista
    const numBars = 6;
    const barH = h / numBars;
    ctx.fillStyle = "#000000";

    for (let i = 0; i < numBars; i++) {
      if ((i + Math.floor(this.time * 20)) % 2 === 0) {
        const wipeW = w * Math.sin(this.transitionProgress * Math.PI);
        const shiftX = (i % 2 === 0) ? 0 : w - wipeW;
        ctx.fillRect(shiftX, i * barH, wipeW, barH);
      }
    }
    ctx.restore();
  }
}

window.MotionGraphicsEngine = MotionGraphicsEngine;
