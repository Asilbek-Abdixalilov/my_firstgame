/**
 * saveSystem.js
 * Handles all localStorage save/load operations
 */
const SaveSystem = {
  KEY: 'battleArena_save',

  defaultSave() {
    return {
      version: 1,
      coins: 250,
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalKills: 0,
      totalWins: 0,
      totalDeaths: 0,
      totalGames: 0,
      playtime: 0,
      ownedWeapons: ['pistol'],
      ownedChars: ['soldier'],
      ownedMaps: ['training'],
      equippedWeapon: 'pistol',
      equippedChar: 'soldier',
      equippedMap: 'training',
      achievements: {},
      settings: {
        masterVolume: 70,
        musicVolume: 50,
        sfxVolume: 80,
        screenShake: true,
        particles: true,
        botDifficulty: 'medium',
        mapTheme: 'arena'
      },
      dailyReward: {
        lastClaim: null,
        streak: 0
      },
      leaderboard: [
        { name: 'ShadowKiller', kills: 2340, wins: 156, level: 45 },
        { name: 'BlazeRunner', kills: 1980, wins: 134, level: 38 },
        { name: 'NightHawk', kills: 1750, wins: 120, level: 34 },
        { name: 'CyberShot', kills: 1500, wins: 98, level: 29 },
        { name: 'IronFist', kills: 1200, wins: 87, level: 25 },
        { name: 'StormBolt', kills: 980, wins: 71, level: 20 },
        { name: 'PhoenixX', kills: 760, wins: 55, level: 17 },
        { name: 'VoidWalker', kills: 550, wins: 42, level: 14 },
      ]
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultSave();
      return { ...this.defaultSave(), ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Save load failed, using defaults');
      return this.defaultSave();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    return this.defaultSave();
  },

  addCoins(data, amount) {
    data.coins = Math.max(0, data.coins + amount);
    this.save(data);
    return data.coins;
  },

  spendCoins(data, amount) {
    if (data.coins < amount) return false;
    data.coins -= amount;
    this.save(data);
    return true;
  },

  addXP(data, amount) {
    data.xp += amount;
    let leveled = false;
    while (data.xp >= data.xpToNext) {
      data.xp -= data.xpToNext;
      data.level = Math.min(100, data.level + 1);
      data.xpToNext = Math.floor(100 * Math.pow(1.15, data.level));
      leveled = true;
    }
    this.save(data);
    return leveled;
  },

  checkDailyReward(data) {
    const now = Date.now();
    const last = data.dailyReward.lastClaim;
    if (!last) return true;
    const diff = (now - last) / (1000 * 60 * 60);
    return diff >= 20; // 20 hours
  },

  claimDailyReward(data) {
    const streak = (data.dailyReward.streak || 0) + 1;
    const reward = Math.min(200 + streak * 50, 1000);
    data.dailyReward.lastClaim = Date.now();
    data.dailyReward.streak = streak;
    this.addCoins(data, reward);
    return reward;
  }
};

// Global save data
let saveData = SaveSystem.load();