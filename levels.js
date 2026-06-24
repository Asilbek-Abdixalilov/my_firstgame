/**
 * levels.js
 * XP, Level, and Progression system
 */
const LevelSystem = {
  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.15, level));
  },

  getLevelRewards(level) {
    const rewards = [];
    if (level % 5 === 0) rewards.push({ type: 'coins', amount: level * 50 });
    if (level === 5) rewards.push({ type: 'weapon', id: 'shotgun' });
    if (level === 10) rewards.push({ type: 'weapon', id: 'smg' });
    if (level === 15) rewards.push({ type: 'char', id: 'sniper' });
    if (level === 20) rewards.push({ type: 'weapon', id: 'rifle' });
    if (level === 25) rewards.push({ type: 'char', id: 'commando' });
    if (level === 30) rewards.push({ type: 'weapon', id: 'sniper' });
    if (level === 40) rewards.push({ type: 'char', id: 'heavy' });
    if (level === 50) rewards.push({ type: 'weapon', id: 'rocket' });
    if (level === 60) rewards.push({ type: 'char', id: 'assassin' });
    if (level === 70) rewards.push({ type: 'weapon', id: 'laser' });
    if (level === 80) rewards.push({ type: 'weapon', id: 'plasma' });
    return rewards;
  },

  getXPReward(action) {
    const rewards = {
      kill: 25,
      win: 100,
      survivalWave: 15,
      headshot: 10,
      firstBlood: 20,
      multikill: 50
    };
    return rewards[action] || 0;
  },

  getCoinReward(action) {
    const rewards = {
      kill: 15,
      win: 80,
      loss: 20,
      survivalWave: 10
    };
    return rewards[action] || 0;
  }
};

const ACHIEVEMENTS = [
  { id: 'first_kill', name: 'First Blood', desc: 'Get your first kill', icon: '🩸', condition: s => s.totalKills >= 1 },
  { id: 'ten_kills', name: 'Killing Spree', desc: 'Get 10 total kills', icon: '💀', condition: s => s.totalKills >= 10 },
  { id: 'hundred_kills', name: 'Centurion', desc: 'Get 100 total kills', icon: '⚔️', condition: s => s.totalKills >= 100 },
  { id: 'thousand_kills', name: 'Legend', desc: 'Get 1000 kills', icon: '🏆', condition: s => s.totalKills >= 1000 },
  { id: 'first_win', name: 'Winner', desc: 'Win your first match', icon: '🥇', condition: s => s.totalWins >= 1 },
  { id: 'ten_wins', name: 'Champion', desc: 'Win 10 matches', icon: '🏅', condition: s => s.totalWins >= 10 },
  { id: 'level_10', name: 'Rising Star', desc: 'Reach level 10', icon: '⭐', condition: s => s.level >= 10 },
  { id: 'level_25', name: 'Veteran', desc: 'Reach level 25', icon: '🌟', condition: s => s.level >= 25 },
  { id: 'level_50', name: 'Master', desc: 'Reach level 50', icon: '💫', condition: s => s.level >= 50 },
  { id: 'rich', name: 'Millionaire', desc: 'Have 5000 coins', icon: '💰', condition: s => s.coins >= 5000 },
  { id: 'collector', name: 'Collector', desc: 'Own 5 weapons', icon: '🎯', condition: s => s.ownedWeapons.length >= 5 },
  { id: 'all_weapons', name: 'Arsenal', desc: 'Own all weapons', icon: '🔫', condition: s => s.ownedWeapons.length >= 8 },
  { id: 'survivor', name: 'Survival King', desc: 'Survive 10 waves', icon: '🛡️', condition: s => s.totalKills >= 50 },
  { id: 'bomb_expert', name: 'Bomb Expert', desc: 'Win with 3 bombs', icon: '💣', condition: s => s.totalWins >= 5 },
  { id: 'all_chars', name: 'Master of All', desc: 'Unlock all characters', icon: '👥', condition: s => s.ownedChars.length >= 5 },
];

function checkAchievements(data) {
  const newUnlocks = [];
  for (const ach of ACHIEVEMENTS) {
    if (!data.achievements[ach.id] && ach.condition(data)) {
      data.achievements[ach.id] = true;
      newUnlocks.push(ach);
      SaveSystem.addCoins(data, 100); // Achievement reward
    }
  }
  return newUnlocks;
}