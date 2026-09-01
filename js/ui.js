// ui.js — everything that is HTML on top of the canvas: the badge tray,
// modals, toasts, the badge fanfare, the win screen and the tent number labels.
// All text lives in HTML (not on the canvas) so it stays razor-sharp on a TV.

const UI = {

  onConfirm: null,  // callback armed by showModal, fired by confirmModal (Enter key)
  modalShownAt: 0,  // when the modal opened — briefly blocks Enter so popups can't be spam-skipped

  // ---- badge discs -----------------------------------------------------------
  // One badge = the tent's official mark on a disc, plus the tent number
  // (several tents share a brewery, so the number is what distinguishes them).

  makeDisc: function (tent, locked) {
    const disc = document.createElement('div');
    disc.className = 'disc' + (locked ? ' locked' : '');
    if (locked) {
      disc.textContent = '?';
    } else {
      disc.style.background = tent.logoBg || tent.colors[0];
      const face = document.createElement('span');
      face.className = 'disc-face';
      const img = document.createElement('img');
      img.className = 'disc-logo';
      img.src = tent.logo;
      img.alt = tent.name;
      img.draggable = false;
      if (tent.logoFilter) img.style.filter = tent.logoFilter;
      face.appendChild(img);
      disc.appendChild(face);
    }
    const num = document.createElement('span');
    num.className = 'disc-num';
    num.textContent = tent.num;
    disc.appendChild(num);
    return disc;
  },

  // ---- badge tray (bottom bar) ----------------------------------------------

  buildTray: function () {
    const tray = document.getElementById('tray');
    tray.innerHTML = '';
    TENTS.forEach(function (tent) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = 'slot-' + tent.id;
      slot.title = tent.num + '. ' + tent.name;
      slot.appendChild(UI.makeDisc(tent, true));
      tray.appendChild(slot);
    });
    UI.refreshTray();
  },

  refreshTray: function () {
    TENTS.forEach(function (tent) {
      const slot = document.getElementById('slot-' + tent.id);
      const owned = state.badges.has(tent.id);
      const wasOwned = slot.classList.contains('owned');
      slot.classList.toggle('owned', owned);
      if (owned !== wasOwned) {
        slot.innerHTML = '';
        slot.appendChild(UI.makeDisc(tent, !owned));
        slot.classList.toggle('pop', owned); // pop animation on newly won badges (and not on reset)
      }
    });
    document.getElementById('counter').textContent = state.badges.size + ' / ' + TENTS.length;
  },

  // ---- tent number labels over the map ---------------------------------------
  // Positioned in % of the canvas, so they scale with it automatically.

  buildLabels: function () {
    const layer = document.getElementById('labels');
    layer.innerHTML = '';
    TENTS.forEach(function (tent) {
      const b = TENT_BOUNDS[tent.id];
      const chip = document.createElement('div');
      chip.className = 'tent-chip';
      chip.textContent = tent.num;
      chip.style.background = tent.colors[0];
      chip.style.color = tent.colors[1];
      chip.style.left = ((b.minX + b.maxX + 1) / 2 / MAP_W * 100) + '%';
      chip.style.top = ((b.minY + b.maxY + 1) / 2 / MAP_H * 100) + '%';
      layer.appendChild(chip);
    });
  },

  // ---- generic modal (challenges, encounters, fanfare all use this) ----------

  showModal: function (opts) {
    const modal = document.getElementById('modal');
    const box = document.getElementById('modal-box');
    document.getElementById('modal-title').textContent = opts.title || '';
    document.getElementById('modal-body').innerHTML = opts.body || '';
    document.getElementById('modal-confirm').textContent = opts.confirmText || 'OK [Enter]';
    box.style.setProperty('--accent', (opts.colors && opts.colors[0]) || '#5b3a1e');
    box.style.setProperty('--accent-text', (opts.colors && opts.colors[1]) || '#ffffff');
    const holder = document.getElementById('modal-disc');
    holder.innerHTML = '';
    if (opts.disc) holder.appendChild(opts.disc);
    modal.hidden = false;
    UI.onConfirm = opts.onConfirm || null;
    UI.modalShownAt = performance.now();
  },

  // Fired by game.js when Enter/Space is pressed while a modal is open.
  confirmModal: function () {
    if (performance.now() - UI.modalShownAt < 250) return; // ignore Enter-mashing carried over from the previous popup
    document.getElementById('modal').hidden = true;
    const cb = UI.onConfirm;
    UI.onConfirm = null;
    if (cb) cb();
  },

  // ---- badge-get fanfare ------------------------------------------------------

  showFanfare: function (tent, onDismiss) {
    const disc = UI.makeDisc(tent, false);
    disc.classList.add('big');
    UI.showModal({
      title: 'BADGE GET! ✨',
      body: 'The <b>' + tent.brewery + '</b> badge from ' + tent.name + ' is yours!',
      confirmText: 'Weiter geht’s! [Enter]',
      colors: tent.colors,
      disc: disc,
      onConfirm: onDismiss,
    });
    UI.playJingle();
  },

  // ---- toast (small self-hiding message, does not pause the game) -------------

  toastTimer: null,
  toast: function (text) {
    const el = document.getElementById('toast');
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('show');
    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  },

  // ---- win screen --------------------------------------------------------------

  showWin: function () {
    const ring = document.getElementById('win-badges');
    ring.innerHTML = '';
    TENTS.forEach(function (tent, i) {
      const disc = UI.makeDisc(tent, false);
      const angle = (i / TENTS.length) * 2 * Math.PI - Math.PI / 2;
      disc.style.position = 'absolute';
      disc.style.left = (50 + 44 * Math.cos(angle)) + '%';
      disc.style.top = (50 + 40 * Math.sin(angle)) + '%';
      disc.style.animationDelay = (i * 0.08) + 's';
      disc.classList.add('win-disc');
      ring.appendChild(disc);
    });
    document.getElementById('win').hidden = false;
    state.winShownAt = performance.now(); // Enter is ignored for a moment so mashing can't skip the payoff
    UI.playJingle(true);
  },

  hideOverlays: function () {
    document.getElementById('modal').hidden = true;
    document.getElementById('win').hidden = true;
    UI.onConfirm = null;
  },

  // ---- tiny WebAudio jingle (no audio files) -----------------------------------

  audioCtx: null,
  playJingle: function (long) {
    try {
      if (!UI.audioCtx) UI.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = UI.audioCtx;
      const notes = long ? [523, 659, 784, 1047, 784, 1047] : [659, 784, 1047];
      notes.forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch (e) { /* no sound? no problem — the game plays on silently */ }
  },
};
