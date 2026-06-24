/**
 * bombs.js
 * Bomb types and explosion system
 */
const BOMB_TYPES = {
  normal: {
    id: 'normal', name: 'Normal Bomb', icon: '💣',
    damage: 80, radius: 100, fuseTime: 2000,
    color: '#ff6600', knockback: 8
  },
  fire: {
    id: 'fire', name: 'Fire Bomb', icon: '🔥',
    damage: 60, radius: 120, fuseTime: 1500,
    color: '#ff2200', knockback: 5, burn: true
  },
  ice: {
    id: 'ice', name: 'Ice Bomb', icon: '❄️',
    damage: 40, radius: 90, fuseTime: 2500,
    color: '#00ccff', knockback: 3, slow: true
  },
  toxic: {
    id: 'toxic', name: 'Toxic Bomb', icon: '☠️',
    damage: 30, radius: 110, fuseTime: 2000,
    color: '#44ff00', knockback: 4, poison: true
  }
};

class Bomb {
  constructor(x, y, vx, vy, ownerId, type = 'normal') {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.ownerId = ownerId;
    this.type = BOMB_TYPES[type] || BOMB_TYPES.normal;
    this.spawnTime = performance.now();
    this.exploded = false;
    this.radius = 12;
    this.bounces = 0;
    this.maxBounces = 2;
  }

  update(dt, mapBounds) {
    if (this.exploded) return;
    this.vy += 0.3; // gravity
    this.x += this.vx;
    this.y += this.vy;
    // Bounce off bounds
    if (this.x < mapBounds.left + this.radius) {
      this.x = mapBounds.left + this.radius;
      this.vx *= -0.6; this.bounces++;
    }
    if (this.x > mapBounds.right - this.radius) {
      this.x = mapBounds.right - this.radius;
      this.vx *= -0.6; this.bounces++;
    }
    if (this.y > mapBounds.bottom - this.radius) {
      this.y = mapBounds.bottom - this.radius;
      this.vy *= -0.5; this.vx *= 0.8; this.bounces++;
    }
    // Auto-explode
    const age = performance.now() - this.spawnTime;
    if (age >= this.type.fuseTime || this.bounces > this.maxBounces) {
      this.explode();
    }
  }

  explode() {
    this.exploded = true;
  }

  draw(ctx) {
    if (this.exploded) return;
    const age = performance.now() - this.spawnTime;
    const frac = age / this.type.fuseTime;
    // Pulse when about to explode
    const pulse = frac > 0.6 ? 1 + Math.sin(Date.now() * 0.02) * 0.2 : 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(pulse, pulse);
    // Shadow
    ctx.beginPath();
    ctx.arc(0, 2, this.radius, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    // Body
    const grad = ctx.createRadialGradient(-3,-3,1,0,0,this.radius);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, this.type.color);
    grad.addColorStop(1, '#000');
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Fuse timer ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 3, -Math.PI/2, -Math.PI/2 + (1-frac)*Math.PI*2);
    ctx.strokeStyle = this.type.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

class Explosion {
  constructor(x, y, radius, damage, ownerId, bombType) {
    this.x = x; this.y = y;
    this.maxRadius = radius;
    this.currentRadius = 5;
    this.damage = damage;
    this.ownerId = ownerId;
    this.type = bombType;
    this.spawnTime = performance.now();
    this.duration = 500;
    this.done = false;
    this.particles = this._createParticles();
    this.damageDone = false;
  }

  _createParticles() {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      pts.push({
        x: this.x, y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, size: 3 + Math.random() * 8
      });
    }
    return pts;
  }

  update() {
    const age = performance.now() - this.spawnTime;
    const t = age / this.duration;
    this.currentRadius = this.maxRadius * Math.min(1, t * 3);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.92; p.vy *= 0.92;
      p.vy += 0.1;
      p.life = Math.max(0, 1 - t);
    }
    if (t >= 1) this.done = true;
    return t;
  }

  draw(ctx) {
    const age = performance.now() - this.spawnTime;
    const t = Math.min(1, age / this.duration);
    const alpha = 1 - t;

    // Core glow
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentRadius);
    grad.addColorStop(0, `rgba(255,255,200,${alpha})`);
    grad.addColorStop(0.3, `${this.type.color}${Math.floor(alpha*200).toString(16).padStart(2,'0')}`);
    grad.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Particles
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
      ctx.fillStyle = `${this.type.color}${Math.floor(p.life*255).toString(16).padStart(2,'0')}`;
      ctx.fill();
    }
  }
}