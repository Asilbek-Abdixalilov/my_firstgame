/**
 * audio.js
 * Web Audio API sound effects system
 */
const AudioSystem = {
  ctx: null,
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  musicOsc: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.setVolumes();
    } catch (e) {
      console.warn('AudioContext unavailable');
    }
  },

  setVolumes() {
    if (!this.ctx) return;
    const s = saveData.settings;
    if (this.masterGain) this.masterGain.gain.value = s.masterVolume / 100;
    if (this.sfxGain) this.sfxGain.gain.value = s.sfxVolume / 100;
    if (this.musicGain) this.musicGain.gain.value = s.musicVolume / 100;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  // Synthesized sound effects
  playShoot(weaponType = 'pistol') {
    if (!this.ctx) return;
    this.resume();
    const freqs = { pistol: 440, shotgun: 220, rifle: 660, smg: 550, sniper: 880, rocket: 110, laser: 1200, plasma: 800 };
    const freq = freqs[weaponType] || 440;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    osc.type = weaponType === 'laser' ? 'sine' : 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = freq * 3;

    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, time + 0.15);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.start(time); osc.stop(time + 0.2);
  },

  playExplosion() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;

    // White noise burst
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    source.buffer = buffer;
    source.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    filter.type = 'lowpass'; filter.frequency.value = 400;
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    source.start(time);

    // Low boom
    const osc = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc.connect(g2); g2.connect(this.sfxGain);
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.3);
    g2.gain.setValueAtTime(0.5, time);
    g2.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.start(time); osc.stop(time + 0.4);
  },

  playHit() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.start(time); osc.stop(time + 0.1);
  },

  playPickup() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;
    [440, 550, 660].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.2, time + i*0.05);
      g.gain.exponentialRampToValueAtTime(0.001, time + i*0.05 + 0.1);
      osc.start(time + i*0.05); osc.stop(time + i*0.05 + 0.15);
    });
  },

  playDeath() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.4);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.start(time); osc.stop(time + 0.5);
  },

  playVictory() {
    if (!this.ctx) return;
    this.resume();
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.15;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.3);
    });
  },

  playMenuClick() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.sfxGain);
    osc.frequency.value = 800;
    g.gain.setValueAtTime(0.1, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.start(time); osc.stop(time + 0.08);
  },

  playCoinPickup() {
    if (!this.ctx) return;
    this.resume();
    const time = this.ctx.currentTime;
    [880, 1100].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.frequency.value = f;
      osc.type = 'triangle';
      g.gain.setValueAtTime(0.15, time + i*0.06);
      g.gain.exponentialRampToValueAtTime(0.001, time + i*0.06 + 0.12);
      osc.start(time + i*0.06); osc.stop(time + i*0.06 + 0.15);
    });
  },

  startBGMusic() {
    // Simple ambient loop
    if (!this.ctx) return;
    this.resume();
    this.stopBGMusic();
    // Will keep playing synth notes
    this._musicInterval = setInterval(() => this._playMusicNote(), 800);
  },

  _playMusicNote() {
    if (!this.ctx) return;
    const scale = [130, 146, 164, 174, 196, 220, 246];
    const f = scale[Math.floor(Math.random() * scale.length)];
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.musicGain);
    osc.type = 'triangle';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.08, time + 0.2);
    g.gain.linearRampToValueAtTime(0, time + 0.7);
    osc.start(time); osc.stop(time + 0.8);
  },

  stopBGMusic() {
    if (this._musicInterval) {
      clearInterval(this._musicInterval);
      this._musicInterval = null;
    }
  }
};