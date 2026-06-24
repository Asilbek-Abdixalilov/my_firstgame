/**
 * game.js
 * Core game engine – loop, physics, HUD, game-over
 */

// ── State ─────────────────────────────────────────────────────────────────────
let gameMode = 'single';   // 'single' | 'two-player' | 'survival' | 'team'
let gameRunning = false;
let gamePaused = false;
let gameOver = false;

let players = [];
let bullets = [];
let bombs = [];
let explosions = [];
let healthKits = [];
let coinPickups = [];
let weaponPickups = [];
let particles = [];

let mapRenderer = null;
let mapData = null;
let colliders = [];
let bounds = {};

let roundNum = 1;
let gameTimer = 180; // seconds
let lastTimestamp = 0;
let animFrameId = null;

let screenShake = { x: 0, y: 0, t: 0 };

// Survival
let survivalWave = 0;
let survivalBotsAlive = 0;
let survivalSpawnTimer = 0;

// Canvas
let canvas, ctx;

// Keys
const keys = {};

// ── Controls ──────────────────────────────────────────────────────────────────
const P1_CONTROLS = { left: 'KeyA', right: 'KeyD', jump: 'KeyW', shoot: 'KeyT', bomb: 'KeyY' };
const P2_CONTROLS = { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', shoot: 'BracketLeft', bomb: 'BracketRight' };

// ── Start / Stop ──────────────────────────────────────────────────────────────
function startGame(mode) {
  gameMode = mode;
  showScreen('game-screen');
  initGame();
  AudioSystem.startBGMusic();
}

function initGame() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Size canvas
  const wrap = document.getElementById('game-screen');
  canvas.width = wrap.clientWidth || 900;
  canvas.height = (wrap.clientHeight || 600) - 70; // minus HUD

  // Map
  const mId = saveData.equippedMap || 'training';
  mapData = MAPS[mId] || MAPS.training;
  mapRenderer = new MapRenderer(mapData);

  bounds = {
    left: 0, right: mapData.width,
    top: 0, bottom: mapData.height
  };
  colliders = mapRenderer.getColliders();

  // Scale canvas to map
  canvas.width = mapData.width;
  canvas.height = mapData.height;

  // Reset state
  players = []; bullets = []; bombs = []; explosions = [];
  healthKits = []; coinPickups = []; weaponPickups = []; particles = [];
  gameTimer = 180; roundNum = 1;
  gameOver = false; gamePaused = false;

  // Spawn players
  const p1Char = saveData.equippedChar || 'soldier';
  const p1Weapon = saveData.equippedWeapon || 'pistol';

  const p1 = new Player('p1', p1Char, p1Weapon, mapData.spawnP1.x, mapData.spawnP1.y, P1_CONTROLS, CHARACTERS[p1Char].color);
  players.push(p1);

  if (gameMode === 'two-player' || gameMode === 'team') {
    const p2 = new Player('p2', 'sniper', 'pistol', mapData.spawnP2.x, mapData.spawnP2.y, P2_CONTROLS, '#ff6b35');
    players.push(p2);
  }

  // Bots
  if (gameMode === 'single') {
    spawnBot('bot1', mapData.spawnBots[0] || mapData.spawnP2, saveData.settings.botDifficulty);
  } else if (gameMode === 'survival') {
    survivalWave = 0;
    survivalBotsAlive = 0;
    survivalSpawnTimer = 0;
    spawnSurvivalWave();
  } else if (gameMode === 'team') {
    // enemies
    for (let i = 0; i < 3; i++) {
      const sp = mapData.spawnBots[i] || mapData.spawnP2;
      spawnBot('ebot' + i, sp, 'medium');
    }
  }

  // Pickups
  spawnHealthKit();
  setTimeout(spawnHealthKit, 10000);

  updateHUD();
  document.getElementById('game-over-overlay').classList.add('hidden');
  document.getElementById('pause-overlay').classList.add('hidden');

  // Start loop
  if (animFrameId) cancelAnimationFrame(animFrameId);
  gameRunning = true;
  lastTimestamp = performance.now();
  animFrameId = requestAnimationFrame(gameLoop);
}

function spawnBot(id, spawnPos, difficulty) {
  const bChars = ['soldier', 'sniper', 'commando', 'heavy', 'assassin'];
  const bWeapons = ['pistol', 'shotgun', 'rifle', 'smg'];
  const charId = bChars[Math.floor(Math.random() * bChars.length)];
  const weapId = bWeapons[Math.floor(Math.random() * bWeapons.length)];
  const bot = new Bot(id, charId, weapId, spawnPos.x, spawnPos.y, difficulty);
  players.push(bot);
}

function spawnSurvivalWave() {
  survivalWave++;
  document.getElementById('round-num').textContent = 'W' + survivalWave;
  const count = Math.min(2 + survivalWave, 8);
  const diff = survivalWave <= 2 ? 'easy' : survivalWave <= 4 ? 'medium' : survivalWave <= 7 ? 'hard' : 'expert';
  for (let i = 0; i < count; i++) {
    const sp = mapData.spawnBots[i % mapData.spawnBots.length] || { x: 450, y: 200 };
    spawnBot('wave' + survivalWave + '_' + i, sp, diff);
    survivalBotsAlive++;
  }
}

// ── Game Loop ─────────────────────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (!gameRunning) return;
  animFrameId = requestAnimationFrame(gameLoop);
  if (gamePaused) return;

  const dt = Math.min(timestamp - lastTimestamp, 50); // cap dt at 50ms
  lastTimestamp = timestamp;

  update(dt);
  render();
}

function update(dt) {
  const now = performance.now();

  // Timer
  gameTimer -= dt / 1000;
  if (gameTimer <= 0 && !gameOver) { gameTimer = 0; endGame(); return; }
  updateTimerDisplay();

  // Screen shake decay
  if (screenShake.t > 0) {
    screenShake.t -= dt;
    screenShake.x = (Math.random() - 0.5) * screenShake.t * 0.3;
    screenShake.y = (Math.random() - 0.5) * screenShake.t * 0.3;
  } else { screenShake.x = 0; screenShake.y = 0; }

  // Players
  for (const p of players) {
    if (p.isBot) {
      p.updateAI(dt, players, colliders, bounds);
    } else {
      p.update(dt, keys, colliders, bounds);
    }

    if (!p.alive) continue;

    // Shooting
    const shouldShoot = p.isBot ? p.getShouldShoot() : keys[p.controls.shoot];
    if (shouldShoot && p.weapon.canFire(now)) {
      doShoot(p, now);
    }

    // Bomb
    const shouldBomb = p.isBot ? p.getShouldBomb() : (keys[p.controls.bomb] && !p.controls._bombHeld);
    if (shouldBomb && p.bombs > 0) {
      doThrowBomb(p);
      if (!p.isBot) p.controls._bombHeld = true;
    }
    if (!p.isBot && !keys[p.controls.bomb]) p.controls._bombHeld = false;

    // Pick up health
    for (const kit of healthKits) {
      if (!kit.alive) continue;
      if (overlaps(p, kit)) {
        p.heal(kit.healAmount);
        kit.alive = false;
        AudioSystem.playPickup();
        setTimeout(spawnHealthKit, 12000);
      }
    }
    // Pick up coins
    for (const coin of coinPickups) {
      if (!coin.alive) continue;
      if (Math.hypot(coin.x - p.cx, coin.y - p.cy) < 24) {
        coin.alive = false;
        SaveSystem.addCoins(saveData, coin.amount);
        updateCoinDisplay();
        AudioSystem.playCoinPickup();
      }
    }
    // Pick up weapon
    for (const wp of weaponPickups) {
      if (!wp.alive) continue;
      if (overlaps(p, { x: wp.x-16, y: wp.y-16, w: 32, h: 32 })) {
        p.weapon = new WeaponInstance(wp.weaponId);
        wp.alive = false;
        AudioSystem.playPickup();
        showNotification(`${wp.def.icon} ${wp.def.name} picked up!`, 'info');
      }
    }
  }

  // Bullets
  for (const b of bullets) {
    if (!b.alive) continue;
    b.update(bounds);
    if (b.hitWall(colliders)) {
      if (b.def.explosive) doExplosion(b.x, b.y, b.def.blastRadius, b.def.damage, b.ownerId, BOMB_TYPES.normal);
      continue;
    }
    // Hit players
    for (const p of players) {
      if (!p.alive || p.id === b.ownerId) continue;
      if (p.invincible) continue;
      if (b.x > p.x && b.x < p.right && b.y > p.y && b.y < p.bottom) {
        const result = p.takeDamage(b.def.damage, b.ownerId);
        b.alive = false;
        if (b.def.explosive) doExplosion(b.x, b.y, b.def.blastRadius, b.def.damage, b.ownerId, BOMB_TYPES.normal);
        if (saveData.settings.particles) {
          particles.push(...createHitParticles(b.x, b.y, b.def.bulletColor));
        }
        AudioSystem.playHit();
        if (result === 'killed') {
          handleKill(b.ownerId, p);
        }
        break;
      }
    }
  }

  // Bombs
  for (const bm of bombs) {
    if (bm.exploded) continue;
    bm.update(dt, { left: bounds.left, right: bounds.right, bottom: bounds.bottom });
    if (bm.exploded) {
      doExplosion(bm.x, bm.y, bm.type.radius, bm.type.damage, bm.ownerId, bm.type);
      AudioSystem.playExplosion();
      addScreenShake(12);
    }
  }

  // Explosions
  for (const ex of explosions) {
    ex.update();
    if (!ex.damageDone) {
      ex.damageDone = true;
      for (const p of players) {
        if (!p.alive || p.invincible) continue;
        if (p.id === ex.ownerId && Math.hypot(p.cx - ex.x, p.cy - ex.y) < ex.maxRadius * 0.5) continue;
        const dist = Math.hypot(p.cx - ex.x, p.cy - ex.y);
        if (dist < ex.maxRadius) {
          const dmg = ex.damage * (1 - dist / ex.maxRadius);
          const result = p.takeDamage(dmg, ex.ownerId);
          // Knockback
          const angle = Math.atan2(p.cy - ex.y, p.cx - ex.x);
          p.vx += Math.cos(angle) * ex.type.knockback;
          p.vy += Math.sin(angle) * ex.type.knockback - 4;
          // Status effects
          if (ex.type.burn) p.burnTimer = 3000;
          if (ex.type.slow) p.slowTimer = 3000;
          if (ex.type.poison) { p.poisonTimer = 4000; p.poisonInterval = 500; }
          if (result === 'killed') handleKill(ex.ownerId, p);
        }
      }
    }
  }

  // Pickups update
  for (const kit of healthKits) kit.update(dt);
  for (const coin of coinPickups) coin.update(dt);
  for (const wp of weaponPickups) wp.update(dt);

  // Particles
  for (const pt of particles) pt.update();

  // Cleanup dead
  bullets = bullets.filter(b => b.alive);
  bombs = bombs.filter(b => !b.exploded);
  explosions = explosions.filter(e => !e.done);
  healthKits = healthKits.filter(k => k.alive);
  coinPickups = coinPickups.filter(c => c.alive);
  weaponPickups = weaponPickups.filter(w => w.alive);
  particles = particles.filter(p => !p.dead);

  // Survival: next wave
  if (gameMode === 'survival') {
    const bots = players.filter(p => p.isBot && p.alive);
    if (bots.length === 0) {
      const xpGain = LevelSystem.getXPReward('survivalWave') * survivalWave;
      SaveSystem.addXP(saveData, xpGain);
      SaveSystem.addCoins(saveData, LevelSystem.getCoinReward('survivalWave') * survivalWave);
      updateCoinDisplay();
      setTimeout(spawnSurvivalWave, 2000);
    }
  }

  // Random weapon spawn
  if (Math.random() < 0.0002 && weaponPickups.length < 2) spawnWeaponPickup();

  updateHUD();
}

function render() {
  ctx.save();
  if (saveData.settings.screenShake && (screenShake.x || screenShake.y)) {
    ctx.translate(screenShake.x, screenShake.y);
  }

  mapRenderer.draw(ctx, canvas.width, canvas.height);

  for (const kit of healthKits) kit.draw(ctx);
  for (const coin of coinPickups) coin.draw(ctx);
  for (const wp of weaponPickups) wp.draw(ctx);
  for (const bm of bombs) bm.draw(ctx);
  for (const ex of explosions) ex.draw(ctx);
  for (const b of bullets) b.draw(ctx);
  for (const pt of particles) pt.draw(ctx);
  for (const p of players) p.draw(ctx, performance.now());

  ctx.restore();
}

// ── Shoot ─────────────────────────────────────────────────────────────────────
function doShoot(player, now) {
  player.weapon.fire(now);
  const def = player.weapon.def;
  AudioSystem.playShoot(def.id);

  if (player.isBot) {
    const dir = player.getShootDirection();
    if (!dir) return;
    const { angle } = dir;
    bullets.push(new Bullet(
      player.cx + Math.cos(angle) * 18,
      player.cy + Math.sin(angle) * 18,
      Math.cos(angle) * def.bulletSpeed,
      Math.sin(angle) * def.bulletSpeed,
      player.id, def
    ));
    return;
  }

  for (let i = 0; i < (def.projectiles || 1); i++) {
    const spread = (Math.random() - 0.5) * def.spread * 2;
    const angle = player.facing > 0 ? spread : Math.PI + spread;
    bullets.push(new Bullet(
      player.cx + Math.cos(angle) * 18,
      player.cy,
      Math.cos(angle) * def.bulletSpeed,
      Math.sin(angle) * def.bulletSpeed + (Math.random()-0.5)*0.5,
      player.id, def
    ));
  }
}

function doThrowBomb(player) {
  player.bombs--;
  const typeKeys = Object.keys(BOMB_TYPES);
  const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
  const vx = player.facing * (4 + Math.random() * 3);
  const vy = -8 - Math.random() * 3;
  bombs.push(new Bomb(player.cx, player.y, vx, vy, player.id, type));
  AudioSystem.playMenuClick();
}

function doExplosion(x, y, radius, damage, ownerId, bombType) {
  explosions.push(new Explosion(x, y, radius, damage, ownerId, bombType));
  if (saveData.settings.particles) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      particles.push(new Particle(x, y, bombType.color, 4 + Math.random()*4, Math.cos(a)*spd, Math.sin(a)*spd));
    }
  }
  addScreenShake(8);
}

// ── Pickups ───────────────────────────────────────────────────────────────────
function spawnHealthKit() {
  const platforms = mapData.platforms;
  const plat = platforms[Math.floor(Math.random() * platforms.length)];
  healthKits.push(new HealthKit(plat.x + plat.w * 0.5, plat.y - 20));
}

function spawnWeaponPickup() {
  const ownedWeapons = saveData.ownedWeapons;
  if (ownedWeapons.length === 0) return;
  const wId = ownedWeapons[Math.floor(Math.random() * ownedWeapons.length)];
  const plat = mapData.platforms[Math.floor(Math.random() * mapData.platforms.length)];
  weaponPickups.push(new WeaponPickup(plat.x + plat.w * 0.3, plat.y - 20, wId));
}

// ── Kill handling ─────────────────────────────────────────────────────────────
function handleKill(killerId, victim) {
  AudioSystem.playDeath();
  if (saveData.settings.particles) {
    particles.push(...createDeathParticles(victim.cx, victim.cy, victim.color));
  }

  // Coin drop
  coinPickups.push(new CoinPickup(victim.cx, victim.cy, 10 + Math.floor(Math.random() * 15)));

  // Killer stats
  const killer = players.find(p => p.id === killerId);
  if (killer) {
    killer.kills = (killer.kills || 0) + 1;
    if (!killer.isBot) {
      saveData.totalKills++;
      const xp = LevelSystem.getXPReward('kill');
      const leveled = SaveSystem.addXP(saveData, xp);
      SaveSystem.addCoins(saveData, LevelSystem.getCoinReward('kill'));
      updateCoinDisplay();
      if (leveled) showNotification(`⬆️ Level Up! You're now level ${saveData.level}!`, 'success');
      checkAchievements(saveData);
    }
  }

  // Survival mode: respawn enemies
  if (gameMode === 'survival' && !victim.isBot) {
    // Player died in survival
    showNotification(`💀 Survived ${survivalWave} waves!`, 'info');
    setTimeout(() => endGame(), 2000);
    return;
  }

  // Respawn dead players (non-survival)
  if (!victim.isBot && gameMode !== 'survival') {
    setTimeout(() => {
      if (!gameOver) {
        victim.respawn(mapData.spawnP1.x, mapData.spawnP1.y);
        AudioSystem.playPickup();
      }
    }, 2500);
  }

  // Check win condition
  checkWin();
}

function checkWin() {
  if (gameOver) return;

  if (gameMode === 'single') {
    const bots = players.filter(p => p.isBot && p.alive);
    if (bots.length === 0) { setTimeout(endGame, 500); }
  }

  if (gameMode === 'two-player') {
    const humans = players.filter(p => !p.isBot && p.alive);
    if (humans.length <= 1 && players.filter(p => !p.isBot).length > 1) {
      setTimeout(endGame, 500);
    }
  }

  if (gameMode === 'team') {
    const enemies = players.filter(p => p.isBot && p.alive);
    const humans = players.filter(p => !p.isBot && p.alive);
    if (enemies.length === 0 || humans.length === 0) setTimeout(endGame, 500);
  }
}

function endGame() {
  if (gameOver) return;
  gameOver = true;
  gameRunning = false;
  AudioSystem.stopBGMusic();
  AudioSystem.playVictory();

  // Determine winner
  let winnerText = 'DRAW!';
  const humanPlayers = players.filter(p => !p.isBot);
  const botPlayers = players.filter(p => p.isBot);

  if (gameMode === 'single' || gameMode === 'team') {
    const aliveHumans = humanPlayers.filter(p => p.alive);
    if (aliveHumans.length > 0) {
      winnerText = '🏆 YOU WIN!';
      saveData.totalWins++;
      SaveSystem.addXP(saveData, LevelSystem.getXPReward('win'));
      SaveSystem.addCoins(saveData, LevelSystem.getCoinReward('win'));
    } else {
      winnerText = '💀 BOTS WIN!';
      SaveSystem.addCoins(saveData, LevelSystem.getCoinReward('loss'));
    }
  } else if (gameMode === 'two-player') {
    const p1 = players.find(p => p.id === 'p1');
    const p2 = players.find(p => p.id === 'p2');
    if (p1 && !p1.alive && p2 && p2.alive) winnerText = '🏆 PLAYER 2 WINS!';
    else if (p2 && !p2.alive && p1 && p1.alive) winnerText = '🏆 PLAYER 1 WINS!';
    else if (p1 && p2) winnerText = (p1.kills >= p2.kills) ? '🏆 PLAYER 1 WINS!' : '🏆 PLAYER 2 WINS!';
  } else if (gameMode === 'survival') {
    winnerText = `🌊 Wave ${survivalWave} Survived!`;
    saveData.totalWins++;
  }

  saveData.totalGames++;
  saveData.totalDeaths += players.filter(p => !p.isBot && !p.alive).length;
  checkAchievements(saveData);
  SaveSystem.save(saveData);

  // Show overlay
  document.getElementById('winner-text').textContent = winnerText;

  const p1 = players.find(p => p.id === 'p1');
  const statsEl = document.getElementById('result-stats');
  statsEl.innerHTML = `
    <div class="result-row"><span>Kills</span><span>${p1 ? p1.kills : 0}</span></div>
    <div class="result-row"><span>Level</span><span>${saveData.level}</span></div>
    <div class="result-row"><span>Round</span><span>${roundNum}</span></div>
    ${gameMode === 'survival' ? `<div class="result-row"><span>Waves</span><span>${survivalWave}</span></div>` : ''}
  `;
  document.getElementById('result-rewards').innerHTML = `
    <div class="reward-line">💰 +${LevelSystem.getCoinReward('win')} coins</div>
    <div class="reward-line">⭐ +${LevelSystem.getXPReward('win')} XP</div>
  `;
  document.getElementById('game-over-overlay').classList.remove('hidden');
}

// ── Pause / Resume / Restart / Quit ──────────────────────────────────────────
function pauseGame() {
  if (gameOver) return;
  gamePaused = true;
  document.getElementById('pause-overlay').classList.remove('hidden');
}

function resumeGame() {
  gamePaused = false;
  lastTimestamp = performance.now();
  document.getElementById('pause-overlay').classList.add('hidden');
}

function restartGame() {
  document.getElementById('game-over-overlay').classList.add('hidden');
  document.getElementById('pause-overlay').classList.add('hidden');
  initGame();
}

function quitToMenu() {
  gameRunning = false;
  gamePaused = false;
  gameOver = false;
  AudioSystem.stopBGMusic();
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  document.getElementById('game-over-overlay').classList.add('hidden');
  document.getElementById('pause-overlay').classList.add('hidden');
  showScreen('main-menu');
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function updateHUD() {
  const p1 = players.find(p => p.id === 'p1');
  const p2 = players.find(p => p.id === 'p2') || players.find(p => p.isBot);

  if (p1) {
    const hpPct = (p1.hp / p1.maxHp * 100).toFixed(0);
    const hbar = document.getElementById('p1-health-bar');
    if (hbar) {
      hbar.style.width = hpPct + '%';
      hbar.style.background = hpPct > 50 ? '#00ff88' : hpPct > 25 ? '#ffaa00' : '#ff2244';
    }
    setHud('p1-char-name', p1.charDef.name);
    setHud('p1-weapon', p1.weapon.def.icon + ' ' + p1.weapon.def.name);
    setHud('p1-ammo', p1.weapon.getAmmoDisplay());
    setHud('p1-bombs', '💣x' + p1.bombs);
    setHud('p1-kills', p1.kills);
  }
  if (p2) {
    const hpPct = (p2.hp / p2.maxHp * 100).toFixed(0);
    const hbar = document.getElementById('p2-health-bar');
    if (hbar) {
      hbar.style.width = hpPct + '%';
      hbar.style.background = hpPct > 50 ? '#00ff88' : hpPct > 25 ? '#ffaa00' : '#ff2244';
    }
    setHud('p2-char-name', p2.charDef.name);
    setHud('p2-weapon', p2.weapon.def.icon + ' ' + p2.weapon.def.name);
    setHud('p2-ammo', p2.weapon.getAmmoDisplay());
    setHud('p2-bombs', '💣x' + p2.bombs);
    setHud('p2-kills', p2.kills);
  }
  if (gameMode === 'survival') {
    document.getElementById('round-num').textContent = 'W' + survivalWave;
  } else {
    document.getElementById('round-num').textContent = roundNum;
  }
}

function setHud(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateTimerDisplay() {
  const el = document.getElementById('game-timer');
  if (!el) return;
  const t = Math.max(0, gameTimer);
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  el.textContent = m + ':' + String(s).padStart(2, '0');
  el.style.color = t < 30 ? '#ff2244' : 'var(--text-bright)';
}

function updateCoinDisplay() {
  const el = document.getElementById('game-coins');
  if (el) el.textContent = saveData.coins.toLocaleString();
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function overlaps(a, b) {
  return a.x < b.x + b.w && a.right > b.x && a.y < b.y + b.h && a.bottom > b.y;
}

function addScreenShake(amount) {
  if (!saveData.settings.screenShake) return;
  screenShake.t = Math.max(screenShake.t, amount);
}