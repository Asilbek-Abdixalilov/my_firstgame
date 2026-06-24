/**
 * bot.js
 * Intelligent AI bot behavior system
 */
const BOT_DIFFICULTY = {
  easy:   { reactionTime: 800, accuracy: 0.4, aggression: 0.3, dodgeChance: 0.1, bombChance: 0.02 },
  medium: { reactionTime: 500, accuracy: 0.6, aggression: 0.5, dodgeChance: 0.25, bombChance: 0.04 },
  hard:   { reactionTime: 250, accuracy: 0.78, aggression: 0.7, dodgeChance: 0.45, bombChance: 0.06 },
  expert: { reactionTime: 100, accuracy: 0.92, aggression: 0.9, dodgeChance: 0.7, bombChance: 0.1 }
};

class Bot extends Player {
  constructor(id, charId, weaponId, spawnX, spawnY, difficulty = 'medium') {
    const dummyControls = { left: null, right: null, jump: null, shoot: null, bomb: null };
    super(id, charId, weaponId, spawnX, spawnY, dummyControls, '#ff4400');
    this.isBot = true;
    this.diff = BOT_DIFFICULTY[difficulty] || BOT_DIFFICULTY.medium;
    this.color = '#ff4400';
    this.charDef = CHARACTERS[charId] || CHARACTERS.soldier;

    // AI state
    this.state = 'patrol';   // patrol | chase | attack | flee | cover | jump
    this.target = null;
    this.targetX = spawnX;
    this.targetY = spawnY;
    this.stateTimer = 0;
    this.decisionTimer = 0;
    this.decisionInterval = this.diff.reactionTime;
    this.stuck = 0;
    this.lastX = spawnX;
    this.jumpCooldown = 0;
    this.patrolDir = 1;
    this.patrolTimer = 0;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.wantShoot = false;
    this.wantBomb = false;
    this.wantJump = false;
    this.wantLeft = false;
    this.wantRight = false;
    this.sightRange = 500;
    this.attackRange = 350;
    this.fleeHpThreshold = 0.2;
    this.coverTimer = 0;
    this.jumpedThisSession = false;
  }

  updateAI(dt, players, colliders, bounds) {
    if (!this.alive) return;
    const now = performance.now();

    // Reset intents
    this.wantShoot = false; this.wantBomb = false;
    this.wantLeft = false; this.wantRight = false; this.wantJump = false;

    this.decisionTimer -= dt;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = this.decisionInterval + (Math.random() * 200 - 100);
      this._decide(players, bounds);
    }

    this._executeState(dt, colliders, bounds, now);
    this._applyIntent(dt, colliders, bounds);
  }

  _decide(players, bounds) {
    // Find closest enemy
    let closest = null, closestDist = Infinity;
    for (const p of players) {
      if (!p.alive || p.id === this.id || p.isBot) continue;
      const dx = p.cx - this.cx, dy = p.cy - this.cy;
      const dist = Math.hypot(dx, dy);
      if (dist < closestDist) { closest = p; closestDist = dist; }
    }
    // Also target bots if mode is bot-vs-bot
    if (!closest) {
      for (const p of players) {
        if (!p.alive || p.id === this.id) continue;
        const dx = p.cx - this.cx, dy = p.cy - this.cy;
        const dist = Math.hypot(dx, dy);
        if (dist < closestDist) { closest = p; closestDist = dist; }
      }
    }
    this.target = closest;

    if (this.hp / this.maxHp < this.fleeHpThreshold && closest) {
      this.state = 'flee';
    } else if (closest && closestDist < this.sightRange) {
      if (closestDist < this.attackRange) {
        this.state = Math.random() < this.diff.aggression ? 'attack' : 'cover';
      } else {
        this.state = 'chase';
      }
    } else {
      this.state = 'patrol';
    }
  }

  _executeState(dt, colliders, bounds, now) {
    const target = this.target;

    if (this.state === 'patrol') {
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 1500 + Math.random() * 2000;
      }
      if (this.patrolDir > 0) this.wantRight = true;
      else this.wantLeft = true;

      // Random jump on platforms
      if (this.grounded && Math.random() < 0.005) this.wantJump = true;

      // Jump if hitting a wall
      if (Math.abs(this.vx) < 0.3 && this.grounded) {
        this.wantJump = true;
        this.patrolDir *= -1;
      }
    }

    if (this.state === 'chase' && target) {
      const dx = target.cx - this.cx;
      if (dx > 20) this.wantRight = true;
      else if (dx < -20) this.wantLeft = true;

      // Jump to reach target
      if (target.y < this.y - 30 && this.grounded) this.wantJump = true;
      if (Math.abs(this.vx) < 0.3 && this.grounded) { this.wantJump = true; }

      // Shoot if in range
      const dist = Math.hypot(target.cx - this.cx, target.cy - this.cy);
      if (dist < this.attackRange && Math.random() < this.diff.accuracy * 0.3) {
        this.wantShoot = true;
      }
    }

    if (this.state === 'attack' && target) {
      const dx = target.cx - this.cx;
      const dist = Math.hypot(dx, target.cy - this.cy);

      // Position: keep medium distance, not too close / far
      if (dist > 220) {
        if (dx > 0) this.wantRight = true; else this.wantLeft = true;
      } else if (dist < 80) {
        if (dx > 0) this.wantLeft = true; else this.wantRight = true;
      } else {
        // Strafe
        if (Math.sin(performance.now() * 0.002) > 0) this.wantRight = true;
        else this.wantLeft = true;
      }

      // Shoot with accuracy
      if (Math.random() < this.diff.accuracy * 0.5) this.wantShoot = true;

      // Jump to dodge
      if (Math.random() < this.diff.dodgeChance * 0.01 && this.grounded) this.wantJump = true;

      // Bomb
      if (dist < 150 && this.bombs > 0 && Math.random() < this.diff.bombChance) {
        this.wantBomb = true;
      }

      // Jump to platform
      if (target.y < this.y - 50 && this.grounded) this.wantJump = true;
    }

    if (this.state === 'flee' && target) {
      const dx = target.cx - this.cx;
      // Run away
      if (dx > 0) this.wantLeft = true; else this.wantRight = true;
      if (Math.random() < 0.02 && this.grounded) this.wantJump = true;
    }

    if (this.state === 'cover') {
      // Move perpendicular to target, behind obstacles
      if (this.coverTimer <= 0) {
        this.coverTimer = 800 + Math.random() * 500;
        if (Math.random() > 0.5) this.wantRight = true; else this.wantLeft = true;
      }
      this.coverTimer -= dt;
      if (target) {
        const dist = Math.hypot(target.cx-this.cx, target.cy-this.cy);
        if (dist < 300 && Math.random() < this.diff.accuracy * 0.2) this.wantShoot = true;
      }
    }
  }

  _applyIntent(dt, colliders, bounds) {
    const spd = this.speed * (this.slowTimer > 0 ? 0.5 : 1);
    if (this.wantLeft)  { this.vx = -spd; this.facing = -1; }
    if (this.wantRight) { this.vx = spd; this.facing = 1; }
    if (!this.wantLeft && !this.wantRight) this.vx *= 0.8;

    if (this.wantJump && this.grounded && this.jumpsLeft > 0) {
      this.vy = -this.jumpPower; this.grounded = false;
      this.jumpsLeft--;
    }

    // Gravity + movement
    this.vy += 0.55;
    if (this.vy > 18) this.vy = 18;
    this.x += this.vx; this.y += this.vy;

    // Bounds
    if (this.x < bounds.left) { this.x = bounds.left; this.vx *= -1; }
    if (this.right > bounds.right) { this.x = bounds.right - this.w; this.vx *= -1; }
    if (this.bottom > bounds.bottom + 100) {
      this.hp -= 25; this.y = bounds.top; this.vy = 0;
      if (this.hp <= 0) { this.hp = 0; this.die(); }
    }

    // Collisions
    this.grounded = false;
    for (const col of colliders) this._resolveCollision(col);
    if (this.grounded) { this.jumpsLeft = this.charDef.id === 'assassin' ? 2 : 1; }

    // Animate
    this.animTimer += dt;
    if (this.animTimer > 120) { this.animTimer = 0; this.animFrame = (this.animFrame+1)%4; }
  }

  getShootDirection() {
    if (!this.target || !this.target.alive) return null;
    const dx = this.target.cx - this.cx;
    const dy = this.target.cy - this.cy;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return null;

    // Add spread based on difficulty
    const accuracy = this.diff.accuracy;
    const spread = (1 - accuracy) * 0.4;
    const angleErr = (Math.random() * spread * 2 - spread);

    // Lead prediction for moving targets
    const bulletSpeed = this.weapon.def.bulletSpeed;
    const travelTime = dist / bulletSpeed;
    const predX = this.target.cx + this.target.vx * travelTime * accuracy;
    const predY = this.target.cy + this.target.vy * travelTime * accuracy;
    const pdx = predX - this.cx, pdy = predY - this.cy;
    const angle = Math.atan2(pdy, pdx) + angleErr;

    return { angle, dist };
  }

  getShouldBomb() { return this.wantBomb && this.bombs > 0; }
  getShouldShoot() { return this.wantShoot; }
}