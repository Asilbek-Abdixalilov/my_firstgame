/**
 * leaderboard.js
 * Leaderboard display and ranking
 */
let currentLbTab = 'kills';

function renderLeaderboard() {
  renderLbTable(currentLbTab);
  renderYourStats();
}

function renderLbTable(tab) {
  const container = document.getElementById('lb-table');
  container.innerHTML = '';

  const entries = [
    ...saveData.leaderboard,
    { name: 'YOU', kills: saveData.totalKills, wins: saveData.totalWins, level: saveData.level, isYou: true }
  ];

  entries.sort((a, b) => {
    if (tab === 'kills') return b.kills - a.kills;
    if (tab === 'wins') return b.wins - a.wins;
    if (tab === 'level') return b.level - a.level;
    return 0;
  });

  const medals = ['🥇','🥈','🥉'];
  const rankClass = (i) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = `lb-row ${e.isYou ? 'you' : ''}`;
    const val = tab === 'kills' ? e.kills : tab === 'wins' ? e.wins : e.level;
    const valLabel = tab === 'level' ? `LV ${val}` : val.toLocaleString();
    row.innerHTML = `
      <div class="lb-rank ${rankClass(i)}">${i < 3 ? medals[i] : '#'+(i+1)}</div>
      <div class="lb-name">${e.isYou ? '<span style="color:var(--neon-blue)">► '+e.name+' ◄</span>' : e.name}</div>
      <div style="font-size:13px;color:var(--text-dim)">LV ${e.level}</div>
      <div class="lb-value">${valLabel}</div>
    `;
    container.appendChild(row);
  });
}

function renderYourStats() {
  const grid = document.getElementById('your-stats-grid');
  const stats = [
    { val: saveData.level, lbl: 'LEVEL' },
    { val: saveData.totalKills, lbl: 'KILLS' },
    { val: saveData.totalWins, lbl: 'WINS' },
    { val: saveData.totalGames, lbl: 'GAMES' },
    { val: saveData.coins.toLocaleString(), lbl: 'COINS' },
    { val: saveData.totalDeaths, lbl: 'DEATHS' },
    { val: saveData.totalKills > 0 ? (saveData.totalKills / Math.max(1,saveData.totalDeaths)).toFixed(2) : '0.00', lbl: 'K/D' },
    { val: Object.keys(saveData.achievements).length, lbl: 'ACHIEVEMENTS' },
  ];
  grid.innerHTML = stats.map(s => `
    <div class="stat-box">
      <div class="s-val">${s.val}</div>
      <div class="s-lbl">${s.lbl}</div>
    </div>
  `).join('');
}

function switchLbTab(tab) {
  AudioSystem.playMenuClick();
  currentLbTab = tab;
  document.querySelectorAll('.lb-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderLbTable(tab);
}