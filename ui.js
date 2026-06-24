/**
 * ui.js
 * Screen management, notifications, settings, map grid, daily reward
 */

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  AudioSystem.playMenuClick();

  // Refresh content when entering certain screens
  if (screenId === 'shop-screen') renderShop();
  if (screenId === 'inventory-screen') renderInventory();
  if (screenId === 'leaderboard-screen') renderLeaderboard();
  if (screenId === 'main-menu') updateMenuStats();
  if (screenId === 'mode-select') renderMapGrid();
  if (screenId === 'settings-screen') loadSettingsUI();
}

function updateMenuStats() {
  const el = id => document.getElementById(id);
  if (el('menu-coins')) el('menu-coins').textContent = saveData.coins.toLocaleString();
  if (el('menu-level')) el('menu-level').textContent = saveData.level;
  if (el('menu-kills')) el('menu-kills').textContent = saveData.totalKills.toLocaleString();
}

function renderMapGrid() {
  const grid = document.getElementById('map-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const [id, map] of Object.entries(MAPS)) {
    const owned = saveData.ownedMaps.includes(id);
    const selected = saveData.equippedMap === id;
    const card = document.createElement('div');
    card.className = `map-card ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`;
    card.innerHTML = `
      <div class="map-emoji">${map.emoji}</div>
      <div class="map-name">${map.name}</div>
      ${!owned ? `<div class="map-lock">🔒 ${map.cost} coins</div>` : ''}
      ${selected ? '<div class="map-selected-badge">✓ SELECTED</div>' : ''}
    `;
    if (owned) {
      card.onclick = () => {
        saveData.equippedMap = id;
        SaveSystem.save(saveData);
        renderMapGrid();
        AudioSystem.playMenuClick();
      };
    } else {
      card.onclick = () => showScreen('shop-screen');
    }
    grid.appendChild(card);
  }
}

// ── Notifications ────────────────────────────────────────────────────────────
let _notifTimeout = null;
function showNotification(msg, type = 'info') {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.className = `notification show ${type}`;
  if (_notifTimeout) clearTimeout(_notifTimeout);
  _notifTimeout = setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('hidden');
  }, 2800);
}

// ── Settings ─────────────────────────────────────────────────────────────────
function loadSettingsUI() {
  const s = saveData.settings;
  const setRange = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setRange('vol-master', s.masterVolume);
  setRange('vol-music', s.musicVolume);
  setRange('vol-sfx', s.sfxVolume);

  const setLabel = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val + '%';
  };
  setLabel('vol-master-val', s.masterVolume);
  setLabel('vol-music-val', s.musicVolume);
  setLabel('vol-sfx-val', s.sfxVolume);

  const setToggle = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.on = val;
    el.textContent = val ? 'ON' : 'OFF';
    el.style.background = val ? 'var(--neon-blue)' : 'rgba(255,255,255,0.1)';
  };
  setToggle('shake-toggle', s.screenShake);
  setToggle('particles-toggle', s.particles);

  const diff = document.getElementById('bot-difficulty');
  if (diff) diff.value = s.botDifficulty;
}

function updateVolume(type, value) {
  const v = parseInt(value);
  if (type === 'master') {
    saveData.settings.masterVolume = v;
    document.getElementById('vol-master-val').textContent = v + '%';
  } else if (type === 'music') {
    saveData.settings.musicVolume = v;
    document.getElementById('vol-music-val').textContent = v + '%';
  } else if (type === 'sfx') {
    saveData.settings.sfxVolume = v;
    document.getElementById('vol-sfx-val').textContent = v + '%';
  }
  AudioSystem.setVolumes();
  SaveSystem.save(saveData);
}

function toggleSetting(key) {
  saveData.settings[key] = !saveData.settings[key];
  const idMap = { screenShake: 'shake-toggle', particles: 'particles-toggle' };
  const el = document.getElementById(idMap[key]);
  if (el) {
    const val = saveData.settings[key];
    el.dataset.on = val;
    el.textContent = val ? 'ON' : 'OFF';
    el.style.background = val ? 'var(--neon-blue)' : 'rgba(255,255,255,0.1)';
  }
  SaveSystem.save(saveData);
  AudioSystem.playMenuClick();
}

function updateSetting(key, value) {
  saveData.settings[key] = value;
  SaveSystem.save(saveData);
  AudioSystem.playMenuClick();
}

function resetProgress() {
  if (!confirm('Reset ALL progress? This cannot be undone!')) return;
  saveData = SaveSystem.reset();
  AudioSystem.playMenuClick();
  showNotification('Progress reset.', 'info');
  updateMenuStats();
}

// ── Daily Reward ──────────────────────────────────────────────────────────────
function checkAndShowDailyReward() {
  if (SaveSystem.checkDailyReward(saveData)) {
    const popup = document.getElementById('daily-reward-popup');
    if (popup) {
      const streak = (saveData.dailyReward.streak || 0) + 1;
      const reward = Math.min(200 + streak * 50, 1000);
      const amtEl = document.getElementById('daily-reward-amount');
      if (amtEl) amtEl.textContent = `+${reward} Coins`;
      popup.classList.remove('hidden');
    }
  }
}

function claimDailyReward() {
  const reward = SaveSystem.claimDailyReward(saveData);
  const popup = document.getElementById('daily-reward-popup');
  if (popup) popup.classList.add('hidden');
  updateMenuStats();
  AudioSystem.playPickup();
  showNotification(`🎁 Daily reward: +${reward} coins!`, 'success');
}

// ── Equip helpers (called from shop/inventory) ────────────────────────────────
function equipWeapon(id) {
  saveData.equippedWeapon = id;
  SaveSystem.save(saveData);
}
function equipChar(id) {
  saveData.equippedChar = id;
  SaveSystem.save(saveData);
}
function equipMap(id) {
  saveData.equippedMap = id;
  SaveSystem.save(saveData);
}