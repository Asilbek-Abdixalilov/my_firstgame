/**
 * shop.js
 * Shop UI and purchase logic
 */
function renderShop() {
  renderWeaponsTab();
  renderCharsTab();
  renderMapsTab();
  document.getElementById('shop-coins').textContent = saveData.coins.toLocaleString();
}

function renderWeaponsTab() {
  const tab = document.getElementById('weapons-tab');
  tab.innerHTML = '';
  for (const [id, w] of Object.entries(WEAPONS)) {
    const owned = saveData.ownedWeapons.includes(id);
    const div = document.createElement('div');
    div.className = `shop-item ${owned ? 'owned' : ''}`;
    const statBar = (val) => `<div class="item-stat-bar"><div class="item-stat-fill" style="width:${val*10}%"></div></div>`;
    div.innerHTML = `
      <div class="item-icon">${w.icon}</div>
      <div class="item-name">${w.name}</div>
      <div class="item-desc">${w.desc}</div>
      <div class="item-stats">
        <div>DMG ${statBar(w.stats.damage)}</div>
        <div>SPD ${statBar(w.stats.speed)}</div>
        <div>RNG ${statBar(w.stats.range)}</div>
        <div>RLD ${statBar(w.stats.reload)}</div>
      </div>
      <div class="item-price">${w.price === 0 ? 'FREE' : '💰 '+w.price}</div>
      ${owned 
        ? `<button class="btn" onclick="equipWeapon('${id}')">✓ ${saveData.equippedWeapon===id?'EQUIPPED':'EQUIP'}</button>`
        : `<button class="btn btn-primary" onclick="buyWeapon('${id}')">BUY</button>`
      }
    `;
    tab.appendChild(div);
  }
}

function renderCharsTab() {
  const tab = document.getElementById('chars-tab');
  tab.innerHTML = '';
  for (const [id, c] of Object.entries(CHARACTERS)) {
    const owned = saveData.ownedChars.includes(id);
    const div = document.createElement('div');
    div.className = `shop-item ${owned ? 'owned' : ''}`;
    const statBar = (val) => `<div class="item-stat-bar"><div class="item-stat-fill" style="width:${val*10}%"></div></div>`;
    div.innerHTML = `
      <div class="item-icon">${c.icon}</div>
      <div class="item-name">${c.name}</div>
      <div class="item-desc">${c.desc}</div>
      <div class="item-stats" style="font-size:12px;color:var(--neon-purple)">⚡ ${c.ability}: ${c.abilityDesc}</div>
      <div class="item-stats">
        <div>HP ${statBar(c.stats.hp)}</div>
        <div>SPD ${statBar(c.stats.speed)}</div>
        <div>JUMP ${statBar(c.stats.jump)}</div>
      </div>
      <div class="item-price">${c.price === 0 ? 'FREE' : '💰 '+c.price}</div>
      ${owned
        ? `<button class="btn" onclick="equipChar('${id}')">✓ ${saveData.equippedChar===id?'EQUIPPED':'EQUIP'}</button>`
        : `<button class="btn btn-primary" onclick="buyChar('${id}')">BUY</button>`
      }
    `;
    tab.appendChild(div);
  }
}

function renderMapsTab() {
  const tab = document.getElementById('maps-tab');
  tab.innerHTML = '';
  for (const [id, m] of Object.entries(MAPS)) {
    const owned = saveData.ownedMaps.includes(id);
    const div = document.createElement('div');
    div.className = `shop-item ${owned ? 'owned' : ''}`;
    div.innerHTML = `
      <div class="item-icon">${m.emoji}</div>
      <div class="item-name">${m.name}</div>
      <div class="item-price">${m.cost === 0 ? 'FREE' : '💰 '+m.cost}</div>
      ${owned
        ? `<button class="btn" onclick="equipMap('${id}')">✓ ${saveData.equippedMap===id?'SELECTED':'SELECT'}</button>`
        : `<button class="btn btn-primary" onclick="buyMap('${id}')">UNLOCK</button>`
      }
    `;
    tab.appendChild(div);
  }
}

function buyWeapon(id) {
  AudioSystem.playMenuClick();
  const w = WEAPONS[id];
  if (!w || saveData.ownedWeapons.includes(id)) return;
  if (!SaveSystem.spendCoins(saveData, w.price)) {
    showNotification('❌ Not enough coins!', 'error'); return;
  }
  saveData.ownedWeapons.push(id);
  SaveSystem.save(saveData);
  showNotification(`🔫 ${w.name} unlocked!`, 'success');
  renderShop();
}

function equipWeapon(id) {
  AudioSystem.playMenuClick();
  saveData.equippedWeapon = id;
  SaveSystem.save(saveData);
  renderShop();
}

function buyChar(id) {
  AudioSystem.playMenuClick();
  const c = CHARACTERS[id];
  if (!c || saveData.ownedChars.includes(id)) return;
  if (!SaveSystem.spendCoins(saveData, c.price)) {
    showNotification('❌ Not enough coins!', 'error'); return;
  }
  saveData.ownedChars.push(id);
  SaveSystem.save(saveData);
  showNotification(`${c.icon} ${c.name} unlocked!`, 'success');
  renderShop();
}

function equipChar(id) {
  AudioSystem.playMenuClick();
  saveData.equippedChar = id;
  SaveSystem.save(saveData);
  renderShop();
}

function buyMap(id) {
  AudioSystem.playMenuClick();
  const m = MAPS[id];
  if (!m || saveData.ownedMaps.includes(id)) return;
  if (!SaveSystem.spendCoins(saveData, m.cost)) {
    showNotification('❌ Not enough coins!', 'error'); return;
  }
  saveData.ownedMaps.push(id);
  SaveSystem.save(saveData);
  showNotification(`${m.emoji} ${m.name} unlocked!`, 'success');
  renderShop();
}

function equipMap(id) {
  AudioSystem.playMenuClick();
  saveData.equippedMap = id;
  SaveSystem.save(saveData);
  renderShop();
}

function switchTab(tabId) {
  AudioSystem.playMenuClick();
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}