/**
 * script.js
 * Bootstrap: keyboard, resize, fullscreen, init
 */

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  keys[e.code] = true;

  // Pause
  if (e.code === 'Escape' && gameRunning) {
    e.preventDefault();
    if (gamePaused) resumeGame(); else pauseGame();
  }

  // Fullscreen
  if (e.code === 'KeyF') {
    toggleFullscreen();
  }

  // Prevent scrolling on arrow keys / space during game
  if (gameRunning && !gamePaused) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// ── Fullscreen ────────────────────────────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (canvas && gameRunning) {
    // Keep the canvas logical size fixed to map; CSS scales via style
  }
});

// ── Init on load ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  AudioSystem.init();
  loadSettingsUI();
  updateMenuStats();
  renderMapGrid();

  // Show correct map grid on mode-select screen
  renderMapGrid();

  // Daily reward check (delay so menu renders first)
  setTimeout(checkAndShowDailyReward, 800);

  // Activate main menu
  showScreen('main-menu');
});