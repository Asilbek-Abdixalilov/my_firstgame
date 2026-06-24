/**
 * maps.js
 * Map definitions with platforms, obstacles, decorations
 */
const MAPS = {
  training: {
    id: 'training', name: 'Training Camp', emoji: '🏕️',
    cost: 0, unlocked: true,
    bg: '#1a1a2e', groundColor: '#2d5a1b', wallColor: '#4a3728',
    theme: 'green',
    platforms: [
      { x: 0, y: 500, w: 900, h: 20, color: '#2d5a1b' },      // ground
      { x: 100, y: 380, w: 150, h: 18, color: '#4a3728' },     // left platform
      { x: 650, y: 380, w: 150, h: 18, color: '#4a3728' },     // right platform
      { x: 350, y: 300, w: 200, h: 18, color: '#4a3728' },     // center platform
      { x: 200, y: 220, w: 120, h: 16, color: '#4a3728' },     // upper left
      { x: 580, y: 220, w: 120, h: 16, color: '#4a3728' },     // upper right
    ],
    obstacles: [
      { x: 280, y: 430, w: 60, h: 70, color: '#5c4a3a', type: 'crate' },
      { x: 560, y: 430, w: 60, h: 70, color: '#5c4a3a', type: 'crate' },
      { x: 440, y: 430, w: 20, h: 70, color: '#7a6050', type: 'wall' },
    ],
    spawnP1: { x: 80, y: 440 },
    spawnP2: { x: 800, y: 440 },
    spawnBots: [{ x: 420, y: 240 }, { x: 320, y: 360 }, { x: 620, y: 360 }],
    width: 900, height: 540,
    decorations: [
      { type: 'tree', x: 30, y: 480 },
      { type: 'tree', x: 850, y: 480 },
      { type: 'barrel', x: 350, y: 475 },
      { type: 'barrel', x: 530, y: 475 },
    ]
  },
  desert: {
    id: 'desert', name: 'Desert Arena', emoji: '🏜️',
    cost: 500, unlocked: false,
    bg: '#1a1208', groundColor: '#c8a030', wallColor: '#8b6914',
    theme: 'sand',
    platforms: [
      { x: 0, y: 500, w: 900, h: 20, color: '#c8a030' },
      { x: 80, y: 400, w: 100, h: 18, color: '#8b6914' },
      { x: 720, y: 400, w: 100, h: 18, color: '#8b6914' },
      { x: 380, y: 320, w: 140, h: 18, color: '#8b6914' },
      { x: 200, y: 250, w: 100, h: 16, color: '#8b6914' },
      { x: 600, y: 250, w: 100, h: 16, color: '#8b6914' },
      { x: 390, y: 170, w: 120, h: 16, color: '#8b6914' },
    ],
    obstacles: [
      { x: 300, y: 440, w: 80, h: 60, color: '#8b6914', type: 'rock' },
      { x: 520, y: 440, w: 80, h: 60, color: '#8b6914', type: 'rock' },
      { x: 420, y: 450, w: 60, h: 50, color: '#6b4a04', type: 'crate' },
    ],
    spawnP1: { x: 60, y: 440 },
    spawnP2: { x: 820, y: 440 },
    spawnBots: [{ x: 450, y: 290 }, { x: 250, y: 220 }, { x: 650, y: 220 }],
    width: 900, height: 540,
    decorations: [
      { type: 'cactus', x: 20, y: 490 },
      { type: 'cactus', x: 870, y: 490 },
    ]
  },
  jungle: {
    id: 'jungle', name: 'Jungle Warzone', emoji: '🌴',
    cost: 1500, unlocked: false,
    bg: '#0a1a0a', groundColor: '#1a4a1a', wallColor: '#0d3d0d',
    theme: 'jungle',
    platforms: [
      { x: 0, y: 500, w: 900, h: 20, color: '#1a4a1a' },
      { x: 60, y: 420, w: 130, h: 18, color: '#0d3d0d' },
      { x: 710, y: 420, w: 130, h: 18, color: '#0d3d0d' },
      { x: 340, y: 340, w: 220, h: 18, color: '#0d3d0d' },
      { x: 150, y: 260, w: 140, h: 16, color: '#0d3d0d' },
      { x: 610, y: 260, w: 140, h: 16, color: '#0d3d0d' },
      { x: 350, y: 180, w: 200, h: 16, color: '#0d3d0d' },
      { x: 0, y: 300, w: 80, h: 16, color: '#0d3d0d' },
      { x: 820, y: 300, w: 80, h: 16, color: '#0d3d0d' },
    ],
    obstacles: [
      { x: 250, y: 440, w: 50, h: 60, color: '#1a5a1a', type: 'vine' },
      { x: 600, y: 440, w: 50, h: 60, color: '#1a5a1a', type: 'vine' },
      { x: 430, y: 460, w: 40, h: 40, color: '#0a3a0a', type: 'rock' },
    ],
    spawnP1: { x: 50, y: 460 },
    spawnP2: { x: 840, y: 460 },
    spawnBots: [{ x: 450, y: 310 }, { x: 200, y: 230 }, { x: 700, y: 230 }],
    width: 900, height: 540,
    decorations: []
  },
  snow: {
    id: 'snow', name: 'Snow Fortress', emoji: '❄️',
    cost: 5000, unlocked: false,
    bg: '#0a1530', groundColor: '#c8d8f0', wallColor: '#a0b8d8',
    theme: 'snow',
    platforms: [
      { x: 0, y: 500, w: 900, h: 20, color: '#c8d8f0' },
      { x: 100, y: 400, w: 120, h: 18, color: '#a0b8d8' },
      { x: 680, y: 400, w: 120, h: 18, color: '#a0b8d8' },
      { x: 370, y: 320, w: 160, h: 18, color: '#a0b8d8' },
      { x: 220, y: 240, w: 110, h: 16, color: '#a0b8d8' },
      { x: 570, y: 240, w: 110, h: 16, color: '#a0b8d8' },
    ],
    obstacles: [
      { x: 300, y: 440, w: 70, h: 60, color: '#a0b8d8', type: 'ice' },
      { x: 530, y: 440, w: 70, h: 60, color: '#a0b8d8', type: 'ice' },
    ],
    spawnP1: { x: 60, y: 450 },
    spawnP2: { x: 830, y: 450 },
    spawnBots: [{ x: 450, y: 290 }, { x: 270, y: 210 }, { x: 630, y: 210 }],
    width: 900, height: 540,
    decorations: []
  },
  cyber: {
    id: 'cyber', name: 'Cyber City', emoji: '🌆',
    cost: 10000, unlocked: false,
    bg: '#050515', groundColor: '#0a0a30', wallColor: '#1a1a60',
    theme: 'cyber',
    platforms: [
      { x: 0, y: 500, w: 900, h: 20, color: '#0a0a30' },
      { x: 80, y: 410, w: 110, h: 18, color: '#1a1a60' },
      { x: 710, y: 410, w: 110, h: 18, color: '#1a1a60' },
      { x: 370, y: 330, w: 160, h: 18, color: '#1a1a60' },
      { x: 190, y: 250, w: 130, h: 16, color: '#1a1a60' },
      { x: 580, y: 250, w: 130, h: 16, color: '#1a1a60' },
      { x: 370, y: 170, w: 160, h: 16, color: '#1a1a60' },
    ],
    obstacles: [
      { x: 290, y: 450, w: 40, h: 50, color: '#0a0a50', type: 'pillar' },
      { x: 570, y: 450, w: 40, h: 50, color: '#0a0a50', type: 'pillar' },
      { x: 430, y: 460, w: 40, h: 40, color: '#0a0a50', type: 'pillar' },
    ],
    spawnP1: { x: 50, y: 455 },
    spawnP2: { x: 840, y: 455 },
    spawnBots: [{ x: 450, y: 300 }, { x: 250, y: 220 }, { x: 650, y: 220 }],
    width: 900, height: 540,
    decorations: []
  }
};

class MapRenderer {
  constructor(map) {
    this.map = map;
    this.time = 0;
  }

  drawBackground(ctx, w, h) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const theme = this.map.theme;
    if (theme === 'green') {
      grad.addColorStop(0, '#0d1b2a'); grad.addColorStop(1, '#1a2e1a');
    } else if (theme === 'sand') {
      grad.addColorStop(0, '#1a1208'); grad.addColorStop(1, '#3a2a08');
    } else if (theme === 'jungle') {
      grad.addColorStop(0, '#050a05'); grad.addColorStop(1, '#0d1a0d');
    } else if (theme === 'snow') {
      grad.addColorStop(0, '#0a1530'); grad.addColorStop(1, '#1a2850');
    } else if (theme === 'cyber') {
      grad.addColorStop(0, '#020208'); grad.addColorStop(1, '#05051a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars for dark themes
    if (theme === 'cyber' || theme === 'snow') {
      this.time++;
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137 + 50) % w;
        const sy = (i * 97 + 30) % (h * 0.6);
        const alpha = 0.3 + Math.sin(this.time * 0.02 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
    }

    // Cyber grid lines
    if (theme === 'cyber') {
      ctx.strokeStyle = 'rgba(0,100,255,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
      }
    }
  }

  drawPlatform(ctx, plat) {
    const theme = this.map.theme;
    // Platform shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(plat.x + 4, plat.y + 4, plat.w, plat.h);
    // Platform body
    ctx.fillStyle = plat.color;
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(plat.x, plat.y, plat.w, 3);
    // Cyber glow
    if (theme === 'cyber') {
      ctx.strokeStyle = 'rgba(0,200,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
    }
    if (theme === 'snow') {
      // Snow on top
      ctx.fillStyle = '#eef4ff';
      ctx.beginPath();
      for (let sx = plat.x; sx < plat.x + plat.w; sx += 8) {
        ctx.arc(sx + 4, plat.y, 5, Math.PI, 0);
      }
      ctx.fill();
    }
  }

  drawObstacle(ctx, obs) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(obs.x+3, obs.y+4, obs.w, obs.h);
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    // Details
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    if (obs.type === 'crate') {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y); ctx.lineTo(obs.x+obs.w, obs.y+obs.h);
      ctx.moveTo(obs.x+obs.w, obs.y); ctx.lineTo(obs.x, obs.y+obs.h);
      ctx.stroke();
    }
    if (obs.type === 'pillar') {
      ctx.fillStyle = 'rgba(0,200,255,0.2)';
      ctx.fillRect(obs.x, obs.y, obs.w, 3);
      ctx.fillRect(obs.x, obs.y+obs.h-3, obs.w, 3);
    }
  }

  drawDecoration(ctx, dec) {
    if (dec.type === 'tree') {
      ctx.fillStyle = '#2d5a10';
      ctx.beginPath();
      ctx.moveTo(dec.x, dec.y - 30);
      ctx.lineTo(dec.x - 15, dec.y);
      ctx.lineTo(dec.x + 15, dec.y);
      ctx.fill();
      ctx.fillStyle = '#1a3a08';
      ctx.beginPath();
      ctx.moveTo(dec.x, dec.y - 45);
      ctx.lineTo(dec.x - 12, dec.y - 20);
      ctx.lineTo(dec.x + 12, dec.y - 20);
      ctx.fill();
      ctx.fillStyle = '#5c3d1a';
      ctx.fillRect(dec.x - 4, dec.y, 8, 12);
    }
    if (dec.type === 'barrel') {
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(dec.x, dec.y - 12, 12, 0, Math.PI*2);
      ctx.fill();
      ctx.fillRect(dec.x-12, dec.y-12, 24, 12);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(dec.x, dec.y - 12, 12, 0, Math.PI, false);
        ctx.stroke();
      }
    }
    if (dec.type === 'cactus') {
      ctx.fillStyle = '#2d8b2d';
      ctx.fillRect(dec.x - 4, dec.y - 35, 8, 35);
      ctx.fillRect(dec.x - 14, dec.y - 25, 10, 6);
      ctx.fillRect(dec.x + 4, dec.y - 20, 10, 6);
      ctx.fillRect(dec.x - 14, dec.y - 35, 4, 15);
      ctx.fillRect(dec.x + 14, dec.y - 30, 4, 15);
    }
  }

  draw(ctx, w, h) {
    this.drawBackground(ctx, w, h);
    for (const dec of (this.map.decorations || [])) this.drawDecoration(ctx, dec);
    for (const plat of this.map.platforms) this.drawPlatform(ctx, plat);
    for (const obs of this.map.obstacles) this.drawObstacle(ctx, obs);
  }

  getColliders() {
    return [...this.map.platforms, ...this.map.obstacles];
  }
}