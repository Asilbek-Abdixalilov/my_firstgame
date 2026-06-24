/**
 * weapons.js
 * All weapon definitions and weapon system
 */
const WEAPONS = {
  pistol: {
    id: 'pistol', name: 'Pistol', icon: '🔫',
    damage: 20, fireRate: 400, reloadTime: 1200,
    ammo: 12, maxAmmo: 12, spread: 0.05,
    bulletSpeed: 9, bulletSize: 4, bulletColor: '#ffdd00',
    price: 0, desc: 'Reliable sidearm. Fast reload.',
    type: 'semi', projectiles: 1,
    stats: { damage: 3, speed: 7, range: 6, reload: 8 }
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', icon: '🟤',
    damage: 45, fireRate: 800, reloadTime: 2000,
    ammo: 6, maxAmmo: 6, spread: 0.35,
    bulletSpeed: 8, bulletSize: 5, bulletColor: '#ff8800',
    price: 300, desc: 'Devastating at close range.',
    type: 'semi', projectiles: 6,
    stats: { damage: 8, speed: 4, range: 3, reload: 4 }
  },
  rifle: {
    id: 'rifle', name: 'Assault Rifle', icon: '🔶',
    damage: 25, fireRate: 150, reloadTime: 1800,
    ammo: 30, maxAmmo: 30, spread: 0.08,
    bulletSpeed: 11, bulletSize: 3, bulletColor: '#00ccff',
    price: 500, desc: 'Full auto with high accuracy.',
    type: 'auto', projectiles: 1,
    stats: { damage: 5, speed: 9, range: 8, reload: 5 }
  },
  smg: {
    id: 'smg', name: 'SMG', icon: '🔷',
    damage: 15, fireRate: 80, reloadTime: 1200,
    ammo: 40, maxAmmo: 40, spread: 0.15,
    bulletSpeed: 10, bulletSize: 3, bulletColor: '#00ff88',
    price: 400, desc: 'Ultra fast fire rate.',
    type: 'auto', projectiles: 1,
    stats: { damage: 3, speed: 10, range: 5, reload: 7 }
  },
  sniper: {
    id: 'sniper', name: 'Sniper Rifle', icon: '🎯',
    damage: 95, fireRate: 2000, reloadTime: 3000,
    ammo: 5, maxAmmo: 5, spread: 0.01,
    bulletSpeed: 20, bulletSize: 3, bulletColor: '#ff0044',
    price: 800, desc: 'One shot, one kill. Perfect accuracy.',
    type: 'semi', projectiles: 1,
    stats: { damage: 10, speed: 2, range: 10, reload: 2 }
  },
  rocket: {
    id: 'rocket', name: 'Rocket Launcher', icon: '🚀',
    damage: 120, fireRate: 2500, reloadTime: 3500,
    ammo: 3, maxAmmo: 3, spread: 0.02,
    bulletSpeed: 6, bulletSize: 8, bulletColor: '#ff4400',
    price: 1200, desc: 'Area damage. Lethal explosions.',
    type: 'semi', projectiles: 1, explosive: true, blastRadius: 80,
    stats: { damage: 10, speed: 1, range: 7, reload: 1 }
  },
  laser: {
    id: 'laser', name: 'Laser Gun', icon: '⚡',
    damage: 35, fireRate: 100, reloadTime: 2000,
    ammo: 60, maxAmmo: 60, spread: 0.0,
    bulletSpeed: 25, bulletSize: 3, bulletColor: '#ff00ff',
    price: 1500, desc: 'Instant hit. No bullet drop.',
    type: 'auto', projectiles: 1,
    stats: { damage: 7, speed: 10, range: 10, reload: 4 }
  },
  plasma: {
    id: 'plasma', name: 'Plasma Cannon', icon: '🌀',
    damage: 80, fireRate: 600, reloadTime: 2500,
    ammo: 8, maxAmmo: 8, spread: 0.04,
    bulletSpeed: 7, bulletSize: 10, bulletColor: '#00ffff',
    price: 2000, desc: 'Slow but enormous projectiles.',
    type: 'semi', projectiles: 1, explosive: true, blastRadius: 40,
    stats: { damage: 9, speed: 3, range: 6, reload: 3 }
  }
};

class WeaponInstance {
  constructor(weaponId) {
    this.def = WEAPONS[weaponId] || WEAPONS.pistol;
    this.currentAmmo = this.def.maxAmmo;
    this.lastFired = 0;
    this.reloading = false;
    this.reloadStart = 0;
  }

  canFire(now) {
    if (this.reloading) {
      if (now - this.reloadStart >= this.def.reloadTime) {
        this.reloading = false;
        this.currentAmmo = this.def.maxAmmo;
      } else return false;
    }
    return (now - this.lastFired >= this.def.fireRate) && this.currentAmmo > 0;
  }

  fire(now) {
    this.lastFired = now;
    this.currentAmmo--;
    if (this.currentAmmo <= 0) this.startReload(now);
    return true;
  }

  startReload(now) {
    if (!this.reloading && this.currentAmmo < this.def.maxAmmo) {
      this.reloading = true;
      this.reloadStart = now;
    }
  }

  getReloadProgress(now) {
    if (!this.reloading) return 1;
    return Math.min(1, (now - this.reloadStart) / this.def.reloadTime);
  }

  getAmmoDisplay() {
    if (this.reloading) return 'RELOADING...';
    return `${this.currentAmmo}/${this.def.maxAmmo}`;
  }
}