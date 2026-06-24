/**
 * inventory.js
 * Inventory and achievements display
 */
function renderInventory() {
  renderInvWeapons();
  renderInvChars();
  renderAchievements();
}

function renderInvWeapons() {
  const grid = document.getElementById('inv-weapons');
  grid.innerHTML = '';
  for (const id of saveData.ownedWeapons) {
    const w = WEAPONS[id];
    if (!w) continue;
    const div = document.createElement('div');
    div.className = 'inv-item';
    const equipped = saveData.equippedWeapon === id;
    div.style.border = equipped ? '2px solid var(--neon-blue)' : '1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
      <div class="item-icon">${w.icon}</div>
      <div>${w.name}</div>
      ${equipped ? '<div style="color:var(--neon-blue);font-size:11px;margin-top:4px">EQUIPPED</div>' : ''}
    `;
    div.onclick = () => { equipWeapon(id); renderInventory(); AudioSystem.playMenuClick(); };
    grid.appendChild(div);
  }
}

function renderInvChars() {
  const grid = document.getElementById('inv-chars');
  grid.innerHTML = '';
  for (const id of saveData.ownedChars) {
    const c = CHARACTERS[id];
    if (!c) continue;
    const div = document.createElement('div');
    div.className = 'inv-item';
    const equipped = saveData.equippedChar === id;
    div.style.border = equipped ? '2px solid var(--neon-orange)' : '1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
      <div class="item-icon">${c.icon}</div>
      <div>${c.name}</div>
      ${equipped ? '<div style="color:var(--neon-orange);font-size:11px;margin-top:4px">ACTIVE</div>' : ''}
    `;
    div.onclick = () => { equipChar(id); renderInventory(); AudioSystem.playMenuClick(); };
    grid.appendChild(div);
  }
}

function renderAchievements() {
  const list = document.getElementById('achievements-list');
  list.innerHTML = '';
  for (const ach of ACHIEVEMENTS) {
    const earned = saveData.achievements[ach.id];
    const div = document.createElement('div');
    div.className = `achievement ${earned ? 'earned' : 'locked'}`;
    div.innerHTML = `
      <div class="ach-icon">${ach.icon}</div>
      <div>
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>
      ${earned ? '<div style="color:var(--neon-yellow);margin-left:auto">✓</div>' : ''}
    `;
    list.appendChild(div);
  }
}