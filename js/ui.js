// ui.js — everything that is HTML on top of the canvas: the badge tray,
// modals, toasts, the badge fanfare, the win screen and the tent number labels.
// All text lives in HTML (not on the canvas) so it stays razor-sharp on a TV.

const UI = {

  onConfirm: null,  // callback armed by showModal, fired by confirmModal (Enter key)
  onQuizPick: null, // callback armed by showQuizQuestion, fired by pickQuizChoice
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
      slot.classList.toggle('closed', !tentIsOpen(tent));
      if (owned !== wasOwned) {
        slot.innerHTML = '';
        slot.appendChild(UI.makeDisc(tent, !owned));
        slot.classList.toggle('pop', owned); // pop animation on newly won badges (and not on reset)
      }
    });
    document.getElementById('counter').textContent = openBadgeCount() + ' / ' + openTents().length;
    // a won tent turns grey on the map too, so redraw the chips from here —
    // this is called on every badge and on reset, which is exactly when they change
    UI.buildLabels();
  },

  // ---- tent number labels over the map ---------------------------------------
  // Positioned in % of the canvas, so they scale with it automatically.

  buildLabels: function () {
    const layer = document.getElementById('labels');
    layer.innerHTML = '';
    TENTS.forEach(function (tent) {
      const b = TENT_BOUNDS[tent.id];
      const chip = document.createElement('div');
      const done = tentIsDone(tent);
      // three states: available (brand colors), already won (grey + a tick),
      // and not open yet (grey). Only the first is worth walking to.
      chip.className = 'tent-chip'
        + (tentIsAvailable(tent) ? '' : ' closed')
        + (done ? ' done' : '');
      chip.textContent = done ? '✓' : tent.num;
      chip.title = tent.num + '. ' + tent.name;
      if (tentIsAvailable(tent)) {
        chip.style.background = tent.colors[0];
        chip.style.color = tent.colors[1];
      } else {
        chip.style.background = CONFIG.COLORS.tentClosed;
        chip.style.color = '#e8e4dc';
      }
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
    const confirm = document.getElementById('modal-confirm');
    confirm.hidden = false;
    confirm.textContent = opts.confirmText || 'OK [Enter]';
    box.style.setProperty('--accent', (opts.colors && opts.colors[0]) || '#5b3a1e');
    box.style.setProperty('--accent-text', (opts.colors && opts.colors[1]) || '#ffffff');
    const holder = document.getElementById('modal-disc');
    holder.innerHTML = '';
    if (opts.disc) holder.appendChild(opts.disc);
    UI.setShow(opts.show);
    modal.hidden = false;
    UI.onConfirm = opts.onConfirm || null;
    UI.onQuizPick = null;
    UI.modalShownAt = performance.now();
  },

  // Optional per-tent dressing for the modal, passed as `show:` — Hofbräu turns
  // its quiz into a Mr. Worldwide game show with show: 'worldwide'. The name
  // becomes the class `show-worldwide` on #modal and switches on the backdrop
  // layer, so the map no longer shines through behind the questions.
  //
  // The looks themselves live in that tent's OWN css file, loaded by a <link>
  // in index.html next to its <script> — see js/tents/hofbraeu/hofbraeu.css.
  // Pass nothing (or null) for the plain beige popup every other tent uses.
  //
  // Called "show", not "stage", because #stage is already the canvas wrapper.
  setShow: function (name) {
    const modal = document.getElementById('modal');
    // assigning className (instead of adding) drops the previous tent's theme,
    // so two tents can never end up dressed as each other
    modal.className = name ? 'show-' + name : '';
    document.getElementById('modal-backdrop').hidden = !name;
    // hand the animation speeds to CSS — the numbers stay in config.js
    modal.style.setProperty('--show-chase', CONFIG.SHOW.CHASE_MS + 'ms');
    modal.style.setProperty('--show-sweep', CONFIG.SHOW.SWEEP_MS + 'ms');
  },

  // Fired by game.js when Enter/Space is pressed while a modal is open.
  confirmModal: function () {
    if (UI.onQuizPick) return; // a quiz question is waiting for 1/2/3, not Enter
    if (performance.now() - UI.modalShownAt < 250) return; // ignore Enter-mashing carried over from the previous popup
    document.getElementById('modal').hidden = true;
    const cb = UI.onConfirm;
    UI.onConfirm = null;
    if (cb) cb();
  },

  // Multiple-choice question: big TV buttons + keys 1/2/3 (wired in game.js).
  showQuizQuestion: function (opts) {
    UI.showModal({
      title: opts.title,
      body: opts.body || '',
      colors: opts.colors,
      show: opts.show, // carry the tent's theme onto the question, if it has one
      confirmText: '',
      onConfirm: null,
    });
    document.getElementById('modal-confirm').hidden = true;
    const body = document.getElementById('modal-body');
    const list = document.createElement('div');
    list.className = 'quiz-choices';
    (opts.choices || []).forEach(function (label, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-choice';
      btn.textContent = (i + 1) + '. ' + label;
      btn.addEventListener('click', function () { UI.pickQuizChoice(i); });
      list.appendChild(btn);
    });
    body.appendChild(list);
    UI.onQuizPick = opts.onPick || null;
  },

  pickQuizChoice: function (index) {
    if (!UI.onQuizPick) return;
    if (performance.now() - UI.modalShownAt < 250) return;
    const cb = UI.onQuizPick;
    UI.onQuizPick = null;
    document.getElementById('modal').hidden = true;
    document.getElementById('modal-confirm').hidden = false;
    cb(index);
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
    const open = openTents();
    const ring = document.getElementById('win-badges');
    ring.innerHTML = '';
    open.forEach(function (tent, i) {
      const disc = UI.makeDisc(tent, false);
      const angle = (i / open.length) * 2 * Math.PI - Math.PI / 2;
      disc.style.position = 'absolute';
      disc.style.left = (50 + 44 * Math.cos(angle)) + '%';
      disc.style.top = (50 + 40 * Math.sin(angle)) + '%';
      disc.style.animationDelay = (i * 0.08) + 's';
      disc.classList.add('win-disc');
      ring.appendChild(disc);
    });
    const blurb = document.getElementById('win-blurb');
    if (blurb) {
      blurb.textContent = 'You conquered the ' + open.length + ' open tents of the Wiesn!';
    }
    document.getElementById('win').hidden = false;
    state.winShownAt = performance.now(); // Enter is ignored for a moment so mashing can't skip the payoff
    UI.playJingle(true);
  },

  hideOverlays: function () {
    document.getElementById('modal').hidden = true;
    document.getElementById('win').hidden = true;
    document.getElementById('modal-confirm').hidden = false;
    UI.onConfirm = null;
    UI.onQuizPick = null;
    UI.setShow(null); // a game.reset() mid-quiz must not leave the stage dressed
    Battle.cancel();  // a battle screen mid-animation counts as an overlay too
  },

  // ---- tiny WebAudio jingle (no audio files) -----------------------------------

  audioCtx: null,

  // Play a few notes in a row. Everything audible in the game goes through here,
  // so there are no sound files to break the double-click launch.
  //   freqs   — the notes, in Hz, played in order
  //   spacing — seconds between two notes
  //   type    — waveform: 'triangle' is soft and chiptune-y, 'sawtooth' is harsh
  beep: function (freqs, spacing, type) {
    try {
      if (!UI.audioCtx) UI.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = UI.audioCtx;
      freqs.forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * spacing);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * spacing + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * spacing);
        osc.stop(ctx.currentTime + i * spacing + 0.3);
      });
    } catch (e) { /* no sound? no problem — the game plays on silently */ }
  },

  // badge-get (short) and the win screen (long)
  playJingle: function (long) {
    UI.beep(long ? [523, 659, 784, 1047, 784, 1047] : [659, 784, 1047], 0.12);
  },

  // Quiz-show stings: a bright rise when you nail it, a game-show buzzer when
  // you don't. Used by runQuiz on every answer.
  playSting: function (correct) {
    if (correct) UI.beep([784, 1047, 1319], 0.07);
    else UI.beep([233, 175], 0.13, 'sawtooth');
  },
};
