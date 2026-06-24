/**
 * player.js
 * Player characters and physics
 */
const CHARACTERS = {
  soldier: {
    id: 'soldier', name: 'Soldier', icon: '🪖',
    maxHp: 100, speed: 4.5, jumpPower: 11,
    price: 0,
    color: '#00d4ff',
    desc: 'Balanced fighter. Good all-round stats.',
    ability: 'Adrenaline', abilityDesc: 'Temporary speed boost',
    stats: { hp: 5, speed: 5, jump: 5, special: 5 }
  },
  sniper: {
    id: 'sniper', name: 'Sniper', icon: '🎯',
    maxHp: 80, speed: 3.8, jumpPower: 10,
    price: 400,
    color: '#00ff88',
    desc: 'Long range specialist. Low HP.',
    ability: 'Eagle Eye', abilityDesc: 'Bullets pierce through targets',
    stats: { hp: 3, speed: 4, jump: 4, special: 8 }
  },
  commando: {
    id: 'commando', name: 'Commando', icon: '💪',
    maxHp: 110, speed: 4.0, jumpPower: 9,
    price: 600,
    color: '#ff6b35',
    desc: 'Tough as nails. Extra ammo.',
    ability: 'Grenade Spam', abilityDesc: 'Throw 3 bombs at once',
    stats: { hp: 7, speed: 4, jump: 4, special: 6 }
  },
  heavy: {
    id: 'heavy', name: 'Heavy Gunner', icon: '🦾',
    maxHp: 150, speed: 2.8, jumpPower: 8,
    price: 900,
    color: '#a855f7',
    desc: 'Maximum firepower. Slow but unstoppable.',
    ability: 'Minigun Mode', abilityDesc: 'No reload for 5 seconds',
    stats: { hp: 10, speed: 2, jump: 2, special: 7 }
  },
  assassin: {
    id: 'assassin', name: 'Assassin', icon: '🗡️',
    maxHp: 70, speed: 6.0, jumpPower: 13,
    price: 1100,
    color: '#ffd700',
    desc: 'Lightning fast. Double jump.',
    ability: 'Shadow Dash', abilityDesc: 'Dash through obstacles',
    stats: { hp: 2, speed: 9, jump: 9, special: 9 }
  }
};

class Player {
  constructor(id, charId, weaponId, spawnX, spawnY, controls, color) {
    this.id = id; // 'p1', 'p2', 'bot1', etc
    this.charDef = CHARACTERS[charId] || CHARACTERS.soldier;
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.w = 28;
    this.h = 36;
    this.maxHp = this.charDef.maxHp;
    this.hp = this.maxHp;
    this.speed = this.charDef.speed;
    this.jumpPower = this.charDef.jumpPower;
    this.grounded = false;
    this.facing = 1; // 1=right, -1=left
    this.controls = controls;
    this.color = color || this.charDef.color;

    this.weapon = new WeaponInstance(weaponId || 'pistol');
    this.bombs = 3;
    this.maxBombs = 5;
    this.kills = 0;
    this.dead = false;
    this.respawnTimer = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.INVINCIBLE_TIME = 1500; // ms after respawn

    this.alive = true;
    this.animFrame = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.isJumping = false;
    this.flashTimer = 0;
    this.burnTimer = 0;
    this.slowTimer = 0;
    this.poisonTimer = 0;
    this.poisonInterval = 0;

    // Jump doubles
    this.jumpsLeft = this.charDef.id === 'assassin' ? 2 : 1;

    this.abilityTimer = 0;
    this.abilityCooldown = 8000;
    this.abilityActive = false;
    this.abilityDuration = 3000;
  }

  get cx() { return this.x + this.w/2; }
  get cy() { return this.y + this.h/2; }
  get bottom() { return this.y + this.h; }
  get right() { return this.x + this.w; }

  takeDamage(dmg, attackerId) {
    if (this.invincible || this.dead) return false;
    const reduced = Math.min(dmg, this.hp);
    this.hp -= dmg;
    this.flashTimer = 200;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return 'killed';
    }
    return 'hit';
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  die() {
    this.dead = true;
    this.alive = false;
    this.vx = 0; this.vy = 0;
  }

  respawn(spawnX, spawnY) {
    this.x = spawnX; this.y = spawnY;
    this.vx = 0; this.vy = 0;
    this.hp = this.maxHp;
    this.dead = false;
    this.alive = true;
    this.invincible = true;
    this.invincibleTimer = performance.now() + this.INVINCIBLE_TIME;
    this.weapon = new WeaponInstance(this.weapon.def.id);
    this.bombs = 3;
    this.jumpsLeft = this.charDef.id === 'assassin' ? 2 : 1;
  }

  update(dt, keys, colliders, bounds) {
    if (!this.alive) return;
    const now = performance.now();

    // Invincibility
    if (this.invincible && now > this.invincibleTimer) this.invincible = false;

    // Status effects
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      if (Math.random() < 0.05) this.takeDamage(2, 'burn');
    }
    if (this.slowTimer > 0) this.slowTimer -= dt;
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.poisonInterval -= dt;
      if (this.poisonInterval <= 0) {
        this.takeDamage(3, 'poison');
        this.poisonInterval = 500;
      }
    }
    if (this.flashTimer > 0) this.flashTimer -= dt;

    const speedMult = this.slowTimer > 0 ? 0.5 : (this.abilityActive && this.charDef.id === 'soldier' ? 1.6 : 1);
    const spd = this.speed * speedMult;

    // Horizontal movement
    this.isMoving = false;
    if (keys[this.controls.left]) {
      this.vx = -spd; this.facing = -1; this.isMoving = true;
    } else if (keys[this.controls.right]) {
      this.vx = spd; this.facing = 1; this.isMoving = true;
    } else {
      this.vx *= 0.8; // friction
    }

    // Jump
    if (keys[this.controls.jump] && !this.controls._jumpHeld) {
      if (this.jumpsLeft > 0) {
        this.vy = -this.jumpPower;
        this.jumpsLeft--;
        this.isJumping = true;
        this.grounded = false;
      }
      this.controls._jumpHeld = true;
    }
    if (!keys[this.controls.jump]) {
      this.controls._jumpHeld = false;
      if (this.vy < 0 && !this.grounded) this.vy += 0.4; // variable jump
    }

    // Gravity
    this.vy += 0.55;
    if (this.vy > 18) this.vy = 18;

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Bound clamp
    if (this.x < bounds.left) { this.x = bounds.left; this.vx = 0; }
    if (this.right > bounds.right) { this.x = bounds.right - this.w; this.vx = 0; }
    if (this.bottom > bounds.bottom + 100) {
      // Fell out - take damage
      this.hp -= 30;
      if (this.hp <= 0) { this.hp = 0; this.die(); }
      else {
        this.y = bounds.top;
        this.vy = 0;
      }
    }

    // Collisions
    this.grounded = false;
    for (const col of colliders) {
      this._resolveCollision(col);
    }
    if (this.grounded) {
      this.jumpsLeft = this.charDef.id === 'assassin' ? 2 : 1;
      this.isJumping = false;
    }

    // Animate
    this.animTimer += dt;
    if (this.animTimer > 120) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Ability cooldown
    if (this.abilityTimer > 0) this.abilityTimer -= dt;
    if (this.abilityActive) {
      this.abilityDuration -= dt;
      if (this.abilityDuration <= 0) {
        this.abilityActive = false;
        this.abilityDuration = 3000;
      }
    }
  }

  _resolveCollision(col) {
    // AABB with platform
    const pl = col.x, pr = col.x + col.w, pt = col.y, pb = col.y + col.h;
    const ol = Math.max(this.x, pl), or2 = Math.min(this.right, pr);
    const ot = Math.max(this.y, pt), ob = Math.min(this.bottom, pb);
    if (ol >= or2 || ot >= ob) return;
    const dx = or2 - ol, dy = ob - ot;

    // One-way platforms (only collide from top)
    if (col.h <= 20) {
      if (this.vy >= 0 && this.bottom - this.vy <= pt + 2) {
        this.y = pt - this.h;
        this.vy = 0; this.grounded = true;
      }
      return;
    }
    // Full collision
    if (dx < dy) {
      if (this.cx < col.x + col.w/2) { this.x -= dx; this.vx = 0; }
      else { this.x += dx; this.vx = 0; }
    } else {
      if (this.cy < col.y + col.h/2) {
        this.y -= dy; this.vy = 0; this.grounded = true;
      } else {
        this.y += dy; this.vy = 0;
      }
    }
  }

  draw(ctx, now) {
    if (!this.alive) return;

    // Flash on hit / invincible flicker
    if (this.flashTimer > 0 && Math.floor(this.flashTimer / 60) % 2 === 0) return;
    if (this.invincible && Math.floor(now / 100) % 2 === 0) return;

    const bob = this.grounded && this.isMoving ? Math.sin(this.animFrame * 1.5) * 3 : 0;
    const x = Math.round(this.x), y = Math.round(this.y) + bob;
    const w = this.w, h = this.h;
    ctx.save();
    ctx.translate(x + w/2, y + h/2);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, h/2 + 2, w*0.6, 5, 0, 0, Math.PI*2);
    ctx.fill();

    // Burn/poison effects
    if (this.burnTimer > 0) {
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 12;
    } else if (this.poisonTimer > 0) {
      ctx.shadowColor = '#44ff00'; ctx.shadowBlur = 10;
    } else if (this.slowTimer > 0) {
      ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 8;
    }

    // Body
    const grad = ctx.createRadialGradient(-4,-4,2,0,0,w*0.6);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, this._darken(this.color, 0.5));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 6);
    ctx.fill();

    // Character icon
    ctx.shadowBlur = 0;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.charDef.icon, 0, -2);

    // Legs (animated)
    if (this.isMoving && this.grounded) {
      const legAnim = Math.sin(this.animFrame * 1.5) * 5;
      ctx.fillStyle = this._darken(this.color, 0.6);
      ctx.fillRect(-8, h/2 - 8, 8, 10 + legAnim);
      ctx.fillRect(2, h/2 - 8, 8, 10 - legAnim);
    }

    // Weapon indicator
    ctx.scale(this.facing, 1);
    ctx.font = '12px sans-serif';
    ctx.fillText(this.weapon.def.icon, w*0.4, -h*0.3);

    ctx.restore();

    // Health bar
    if (this.hp < this.maxHp) {
      const bw = 40, bh = 5;
      const bx = this.cx - bw/2, by = this.y - 12;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bx, by, bw, bh);
      const pct = this.hp / this.maxHp;
      const hcol = pct > 0.5 ? '#00ff88' : pct > 0.25 ? '#ffaa00' : '#ff2244';
      ctx.fillStyle = hcol;
      ctx.fillRect(bx, by, bw * pct, bh);
    }

    // Reload bar
    if (this.weapon.reloading) {
      const rp = this.weapon.getReloadProgress(now);
      const bx = this.cx - 20, by = this.y - 20;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bx, by, 40, 4);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(bx, by, 40 * rp, 4);
    }
  }

  _darken(hex, factor) {
    const r = parseInt(hex.slice(1,3),16)*factor;
    const g = parseInt(hex.slice(3,5),16)*factor;
    const b = parseInt(hex.slice(5,7),16)*factor;
    return `rgb(${r|0},${g|0},${b|0})`;
  }
}

class Bullet {
  constructor(x, y, vx, vy, ownerId, weaponDef) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.ownerId = ownerId;
    this.def = weaponDef;
    this.alive = true;
    this.trail = [];
  }

  update(bounds) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    // Gravity for rockets
    if (this.def.id === 'rocket') this.vy += 0.05;
    if (this.x < bounds.left || this.x > bounds.right || this.y < bounds.top || this.y > bounds.bottom + 50) {
      this.alive = false;
    }
  }

  hitWall(colliders) {
    for (const col of colliders) {
      if (this.x > col.x && this.x < col.x + col.w && this.y > col.y && this.y < col.y + col.h) {
        this.alive = false;
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    if (!this.alive) return;
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 0.6;
      const size = this.def.bulletSize * (i / this.trail.length);
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI*2);
      ctx.fillStyle = this.def.bulletColor + Math.floor(alpha*255).toString(16).padStart(2,'0');
      ctx.fill();
    }
    // Bullet
    ctx.save();
    ctx.shadowColor = this.def.bulletColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.def.bulletSize, 0, Math.PI*2);
    ctx.fillStyle = this.def.bulletColor;
    ctx.fill();
    // Laser beam
    if (this.def.id === 'laser') {
      ctx.strokeStyle = this.def.bulletColor + '88';
      ctx.lineWidth = 2;
      const prev = this.trail[0] || { x: this.x, y: this.y };
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

class HealthKit {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 20;
    this.healAmount = 30;
    this.alive = true;
    this.bobTime = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.bobTime += dt * 0.002;
  }

  draw(ctx) {
    if (!this.alive) return;
    const by = Math.sin(this.bobTime) * 4;
    ctx.save();
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(this.x - 10, this.y - 10 + by, 20, 20);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - 2, this.y - 8 + by, 4, 16);
    ctx.fillRect(this.x - 8, this.y - 2 + by, 16, 4);
    ctx.restore();
  }
}

class CoinPickup {
  constructor(x, y, amount = 10) {
    this.x = x; this.y = y;
    this.amount = amount;
    this.alive = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -4 - Math.random() * 3;
  }

  update(dt) {
    this.bobTime += dt * 0.003;
    this.vy += 0.2;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    if (this.vy > 3) this.vy = 3;
  }

  draw(ctx) {
    if (!this.alive) return;
    const by = Math.sin(this.bobTime) * 3;
    ctx.save();
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(this.x, this.y + by, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', this.x, this.y + by);
    ctx.restore();
  }
}

class WeaponPickup {
  constructor(x, y, weaponId) {
    this.x = x; this.y = y;
    this.weaponId = weaponId;
    this.def = WEAPONS[weaponId];
    this.alive = true;
    this.bobTime = Math.random() * Math.PI * 2;
  }

  update(dt) { this.bobTime += dt * 0.002; }

  draw(ctx) {
    if (!this.alive) return;
    const by = Math.sin(this.bobTime) * 4;
    ctx.save();
    ctx.shadowColor = this.def.bulletColor; ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(this.x - 16, this.y - 16 + by, 32, 32, 6);
    ctx.fill();
    ctx.strokeStyle = this.def.bulletColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.def.icon, this.x, this.y + by);
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color, size, vx, vy) {
    this.x = x; this.y = y;
    this.color = color; this.size = size;
    this.vx = vx; this.vy = vy;
    this.life = 1.0;
    this.decay = 0.02 + Math.random() * 0.03;
  }

  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.1;
    this.vx *= 0.95; this.vy *= 0.95;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  get dead() { return this.life <= 0; }
}

function createHitParticles(x, y, color, count = 8) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    pts.push(new Particle(x, y, color, 3 + Math.random()*3, Math.cos(angle)*speed, Math.sin(angle)*speed));
  }
  return pts;
}

function createDeathParticles(x, y, color) {
  return createHitParticles(x, y, color, 16);
}