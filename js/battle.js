// battle.js — the Pokémon-style battle screen for random encounters.
//
// The sequence, straight from the Game Boy: the screen flashes like you stepped
// into tall grass → the battle screen slides in → the text box types
// "A wild X appeared!" → then either the foe uses their signature move, or
// you pick from a FIGHT menu of three attacks → "NAME used MOVE!" → Enter
// returns to walking.
//
// Started by startEncounter() or a tent's booked host (CHALLENGES.<id>.host).
// While state.mode === 'battle', game.js routes keys here (Battle.advance /
// the FIGHT menu). Street encounters live in js/encounters/; tent hosts live
// in js/tents/<id>/<id>.js on CHALLENGES.<id>.host.

const Battle = {

  phase: 'idle',   // 'flash' | 'slide' | 'text' | 'menu'
  enc: null,       // the encounter currently on screen
  lines: [],       // text lines still to be shown
  chars: [],       // the current line, split into characters (emoji-safe)
  shown: 0,        // how many of those characters are on screen
  typeTimer: null, // the typewriter interval while a line is being typed
  lineShownAt: 0,  // when the current line started (swallows accidental double-Enter)
  onDone: null,    // hands control back to encounters.js
  timers: [],      // all pending timeouts, so cancel() can clear them mid-animation
  cursor: 0,       // selected row in the FIGHT menu
  fought: false,   // true once an attack has been used (so we don't reopen the menu)
  outcome: null,   // null | 'won' | 'lost' — read by encounters.js to decide the turn

  // ---- the hero, seen from behind --------------------------------------------
  // Same lad as draw.js, but big: ASCII pixel art, one character = one pixel,
  // '.' = transparent. Colors come from CONFIG.PLAYER so he always matches
  // the little walking sprite.

  PLAYER_ART: [
    '......HHHH......',
    '.....HHHHHH..F..',
    '.....HHHHHH.FF..',
    '.....BBBBBB.F...',
    '...HHHHHHHHHH...',
    '....hhhhhhhh....',
    '....hhhhhhhh....',
    '.....hhhhhh.....',
    '......NNNN......',
    '...SSSSSSSSSS...',
    '..SSRRSSSSRRSS..',
    '..SSRRSSSSRRSS..',
    '.NNSRRRRRRRRSNN.',
    '.NN.SSSSSSSS.NN.',
    '...LLLLLLLLLL...',
    '...LDDLLLLDDL...',
    '...LLL....LLL...',
    '...KKK....KKK...',
    '...KKK....KKK...',
    '..EEEE....EEEE..',
  ],

  PLAYER_PALETTE: {
    H: CONFIG.PLAYER.hat, B: CONFIG.PLAYER.hatBand, F: CONFIG.PLAYER.feather,
    h: CONFIG.PLAYER.hair, N: CONFIG.PLAYER.skin, S: CONFIG.PLAYER.shirt,
    R: CONFIG.PLAYER.strap, L: CONFIG.PLAYER.leder, D: CONFIG.PLAYER.lederDark,
    K: CONFIG.PLAYER.sock, E: CONFIG.PLAYER.shoe,
  },

  // ---- the sequence ------------------------------------------------------------

  // tent is optional: booked Festzelt hosts get a Wiesn banner with the tent logo.
  start: function (enc, done, tent) {
    Battle.cancel(); // clear any leftovers from an aborted battle
    Battle.onDone = done;
    Battle.enc = enc;
    Battle.fought = false;
    Battle.cursor = 0;
    // appear (+ optional roast). The attack / menu comes after the last line.
    Battle.lines = [enc.appear, enc.text].filter(Boolean);
    Battle.buildScene(enc);
    Battle.setBanner(tent);

    // 1) the tall-grass flash...
    const flash = document.getElementById('battle-flash');
    flash.hidden = false;
    flash.classList.remove('flashing');
    void flash.offsetWidth; // restart the CSS animation (same trick as the toast)
    flash.classList.add('flashing');
    Battle.phase = 'flash';
    Music.stop(); // the walking tune cuts out, so the alarm below rings alone
    Battle.playIntroSound();

    // 2) ...then the battle screen with both sprites sliding in...
    Battle.after(850, function () {
      Music.play('battle'); // the fight music kicks in as the screen appears
      flash.hidden = true;
      const battle = document.getElementById('battle');
      battle.classList.add('intro'); // hides text box + info boxes while sliding
      battle.hidden = false;         // un-hiding starts the slide-in CSS animations
      Battle.phase = 'slide';

      // 3) ...and finally the text box starts typing.
      Battle.after(800, function () {
        battle.classList.remove('intro');
        Battle.phase = 'text';
        Battle.nextLine();
      });
    });
  },

  // fill in sprites, names, levels and HP while the screen is still hidden
  buildScene: function (enc) {
    const enemy = document.getElementById('battle-enemy');
    enemy.innerHTML = '';
    // Photo encounters (friends, ICE) set enc.image; anyone else can still use ASCII art.
    if (enc.image) {
      const img = document.createElement('img');
      img.className = 'battle-photo';
      img.src = enc.image;
      img.alt = enc.name;
      img.draggable = false;
      enemy.appendChild(img);
    } else {
      enemy.appendChild(Battle.spriteCanvas(enc.art, enc.palette, 1.6));
    }

    const player = document.getElementById('battle-player');
    player.innerHTML = '';
    player.appendChild(Battle.spriteCanvas(Battle.PLAYER_ART, Battle.PLAYER_PALETTE, 2.1));

    // Gen-1 style ":L5" levels — you level up with every badge you win
    const playerLevel = 5 + 2 * state.badges.size;
    const hp = 10 + 2 * playerLevel;
    document.getElementById('battle-enemy-name').textContent = enc.name;
    document.getElementById('battle-enemy-level').textContent = ':L' + (enc.level || 5);
    document.getElementById('battle-player-name').textContent = 'WIESNHELD';
    document.getElementById('battle-player-level').textContent = ':L' + playerLevel;
    document.getElementById('battle-player-hpnum').textContent = hp + '/' + hp;
    Battle.setHp('enemy', 100);
    Battle.setHp('player', 100);

    document.getElementById('battle-text').textContent = '';
    document.getElementById('battle-arrow').hidden = true;
    Battle.hideMenu();
  },

  // Festzelt banner: official tent mark + name + greeting.
  // Street encounters pass no tent, so the banner stays hidden.
  setBanner: function (tent) {
    const banner = document.getElementById('battle-banner');
    const battle = document.getElementById('battle');
    if (!banner || !battle) return;
    if (!tent) {
      banner.hidden = true;
      battle.classList.remove('has-banner');
      battle.style.removeProperty('--banner');
      battle.style.removeProperty('--banner-ink');
      return;
    }
    banner.hidden = false;
    battle.classList.add('has-banner');
    battle.style.setProperty('--banner', tent.colors[0]);
    battle.style.setProperty('--banner-ink', tent.colors[1] || '#fff8e7');
    document.getElementById('battle-banner-num').textContent = tent.num;
    document.getElementById('battle-banner-brewery').textContent = tent.brewery;
    document.getElementById('battle-banner-name').textContent = tent.name;
    document.getElementById('battle-banner-tag').textContent = tent.greeting;
    const plate = document.getElementById('battle-banner-logo-plate');
    const logo = document.getElementById('battle-banner-logo');
    plate.style.background = tent.logoBg || '#111111';
    logo.src = tent.logo;
    logo.alt = tent.name;
    logo.style.filter = tent.logoFilter || '';
  },

  // Cosmetic HP bar — green / gold / red like the Game Boy. Pure flavor.
  setHp: function (who, pct) {
    const box = who === 'player' ? 'battle-player-box' : 'battle-enemy-box';
    const fill = document.querySelector('#' + box + ' .battle-hp-fill');
    if (!fill) return;
    fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    fill.style.background = pct <= 25 ? '#c41e3a' : pct <= 50 ? '#e6b800' : '#2e7d32';
  },

  // ASCII art -> tiny canvas (1 pixel per character), upscaled crisply by CSS.
  // `scale` is how many vmin one art pixel gets on screen.
  spriteCanvas: function (art, palette, scale) {
    let cols = 0;
    art.forEach(function (row) { cols = Math.max(cols, row.length); });
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = art.length;
    c.className = 'battle-sprite';
    c.style.width = (cols * scale) + 'vmin';
    const ctx = c.getContext('2d');
    for (let y = 0; y < art.length; y++) {
      for (let x = 0; x < art[y].length; x++) {
        const color = palette[art[y][x]];
        if (!color) continue; // '.' (or an unknown character) = transparent
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return c;
  },

  // ---- the typewriter text box ---------------------------------------------------

  nextLine: function () {
    const el = document.getElementById('battle-text');
    el.textContent = '';
    document.getElementById('battle-arrow').hidden = true;
    // Array.from splits into real characters — charAt would tear emoji in half
    Battle.chars = Array.from(Battle.lines.shift());
    Battle.shown = 0;
    Battle.lineShownAt = performance.now();
    Battle.typeTimer = setInterval(function () {
      el.textContent += Battle.chars[Battle.shown++];
      if (Battle.shown >= Battle.chars.length) {
        clearInterval(Battle.typeTimer);
        Battle.typeTimer = null;
        document.getElementById('battle-arrow').hidden = false;
      }
    }, 30);
  },

  // After the appear/roast lines: foe uses their move, or you get a FIGHT menu.
  afterIntro: function () {
    const enc = Battle.enc;
    if (!enc || Battle.fought) { Battle.finish(); return; }
    if (enc.playerAttacks && enc.playerAttacks.length) {
      Battle.showMenu();
      return;
    }
    if (enc.foeAttack) {
      Battle.useMove(enc.foeAttack, enc.name);
      return;
    }
    Battle.finish();
  },

  // Build "NAME used MOVE!" + optional effectiveness + the drink punchline.
  useMove: function (move, userName) {
    Battle.fought = true;
    // The fight's verdict, for the turn rule in encounters.js: a foe move means
    // you never got a say (ICE, Mille) — that counts as lost. Your own move wins
    // only when it was the super-effective pick.
    Battle.outcome = (userName !== 'WIESNHELD') ? 'lost'
      : (move.effective === true ? 'won' : 'lost');
    Battle.hideMenu();
    Battle.lines = [userName + ' used ' + move.name + '!'];
    if (move.effective === true) Battle.lines.push("It's super effective!");
    if (move.effective === false) Battle.lines.push("It's not very effective…");
    if (move.result) Battle.lines.push(move.result);

    // HP is fake — just sells the hit. Foe attacks chip you; a good pick chips them.
    if (userName !== 'WIESNHELD') {
      Battle.setHp('player', 20);
      if (move.anim === 'appear') Battle.playAppear(); // ICE: it appears. Again.
      else Battle.playDash(); // Mille (and other foe moves) lunge at you
    } else if (move.effective === true) {
      Battle.setHp('enemy', 15);
    } else {
      Battle.setHp('player', 45);
    }

    Battle.phase = 'text';
    Battle.nextLine();
  },

  // Restart the dash/hit CSS animations (same class-toggle trick as the toast).
  playDash: function () {
    const foe = document.getElementById('battle-enemy');
    const hero = document.getElementById('battle-player');
    foe.classList.remove('dashing');
    hero.classList.remove('hit');
    void foe.offsetWidth;
    foe.classList.add('dashing');
    Battle.after(180, function () {
      hero.classList.remove('hit');
      void hero.offsetWidth;
      hero.classList.add('hit');
    });
  },

  // ICE's joke move: vanish and pop back in as if it just appeared.
  playAppear: function () {
    const foe = document.getElementById('battle-enemy');
    const hero = document.getElementById('battle-player');
    const ms = CONFIG.APPEAR_MS;
    foe.classList.remove('appearing', 'dashing');
    hero.classList.remove('hit');
    void foe.offsetWidth;
    foe.style.animationDuration = (ms / 1000) + 's';
    foe.classList.add('appearing');
    // hit when the bottle pops back in (~55% of the 3-second appear)
    Battle.after(Math.round(ms * 0.55), function () {
      hero.classList.remove('hit');
      void hero.offsetWidth;
      hero.classList.add('hit');
    });
  },

  // ---- FIGHT menu (three named attacks, arrows or 1/2/3) ----------------------

  showMenu: function () {
    const enc = Battle.enc;
    const list = document.getElementById('battle-menu-list');
    list.innerHTML = '';
    enc.playerAttacks.forEach(function (move, i) {
      const row = document.createElement('div');
      row.className = 'battle-move';
      row.textContent = (i + 1) + '. ' + move.name;
      list.appendChild(row);
    });
    document.getElementById('battle-menu-prompt').textContent =
      enc.fightPrompt || 'What will WIESNHELD do?';
    document.getElementById('battle').classList.add('menu');
    document.getElementById('battle-menu').hidden = false;
    Battle.phase = 'menu';
    Battle.cursor = 0;
    Battle.refreshCursor();
  },

  hideMenu: function () {
    const battle = document.getElementById('battle');
    if (battle) battle.classList.remove('menu');
    const menu = document.getElementById('battle-menu');
    if (menu) menu.hidden = true;
  },

  refreshCursor: function () {
    const rows = document.querySelectorAll('#battle-menu-list .battle-move');
    rows.forEach(function (row, i) {
      row.classList.toggle('selected', i === Battle.cursor);
    });
  },

  moveCursor: function (dir) {
    const n = Battle.enc.playerAttacks.length;
    Battle.cursor = dir === 'up'
      ? (Battle.cursor - 1 + n) % n
      : (Battle.cursor + 1) % n;
    Battle.refreshCursor();
  },

  pickMove: function () {
    Battle.pickMoveAt(Battle.cursor);
  },

  pickMoveAt: function (index) {
    const moves = Battle.enc && Battle.enc.playerAttacks;
    if (!moves || !moves[index]) return;
    Battle.useMove(moves[index], 'WIESNHELD');
  },

  // Enter/Space during a battle (routed here by game.js):
  // typing → show the whole line at once; line done → next line, menu, or finish.
  advance: function () {
    if (Battle.phase !== 'text') return; // flash, slide-in and the menu can't be skipped this way
    if (performance.now() - Battle.lineShownAt < 200) return; // swallow double-taps
    if (Battle.typeTimer) {
      clearInterval(Battle.typeTimer);
      Battle.typeTimer = null;
      document.getElementById('battle-text').textContent = Battle.chars.join('');
      document.getElementById('battle-arrow').hidden = false;
      return;
    }
    if (Battle.lines.length > 0) { Battle.nextLine(); return; }
    Battle.afterIntro();
  },

  // The outcome rides along to the callback. Street encounters use it for the
  // turn rule; tent-host battles (runIt in challenges.js) simply ignore it.
  finish: function () {
    const outcome = Battle.outcome;
    const done = Battle.onDone;
    Battle.cancel();
    if (done) done(outcome);
  },

  // stop everything and hide the battle screen (also used by game.reset)
  cancel: function () {
    Battle.timers.forEach(clearTimeout);
    Battle.timers = [];
    if (Battle.typeTimer) { clearInterval(Battle.typeTimer); Battle.typeTimer = null; }
    Battle.phase = 'idle';
    Battle.onDone = null;
    Battle.enc = null;
    Battle.fought = false;
    Battle.outcome = null;
    Battle.hideMenu();
    const foe = document.getElementById('battle-enemy');
    const hero = document.getElementById('battle-player');
    if (foe) {
      foe.classList.remove('dashing', 'appearing');
      foe.style.animationDuration = '';
    }
    if (hero) hero.classList.remove('hit');
    Battle.setBanner(null);
    const battle = document.getElementById('battle');
    if (battle) battle.hidden = true;
    const flash = document.getElementById('battle-flash');
    if (flash) flash.hidden = true;
    // Every way out of a battle comes through here (finish, game.reset), so
    // this one line is what brings the walking tune back. Before the very
    // first key press the browser blocks it, which js/music.js shrugs off.
    Music.play('overworld');
  },

  after: function (ms, fn) { Battle.timers.push(setTimeout(fn, ms)); },

  // the Game Boy "wild encounter!" alarm: a fast falling run of square-wave notes
  playIntroSound: function () {
    try {
      if (!UI.audioCtx) UI.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = UI.audioCtx;
      const notes = [988, 932, 880, 831, 784, 740, 698, 659];
      notes.forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.09);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.1);
      });
    } catch (e) { /* no sound? the battle plays on silently */ }
  },
};
