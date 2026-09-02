// battle.js — the Pokémon-style battle screen for random encounters.
//
// The sequence, straight from the Game Boy: the screen flashes like you stepped
// into tall grass → the battle screen slides in (you in Lederhosen lower-left,
// the encounter upper-right, both with info boxes and HP bars) → the text box
// types the story letter by letter → Enter advances → back to walking.
// No combat — it's an Oktoberfest, not a gym.
//
// Started by startEncounter() in encounters.js. While state.mode === 'battle',
// game.js routes Enter/Space here (Battle.advance). WHO can appear lives in
// js/encounters/ — one file per encounter, see the README there.

const Battle = {

  phase: 'idle',   // 'flash' | 'slide' | 'text' — decides what Enter does
  lines: [],       // text lines still to be shown
  chars: [],       // the current line, split into characters (emoji-safe)
  shown: 0,        // how many of those characters are on screen
  typeTimer: null, // the typewriter interval while a line is being typed
  lineShownAt: 0,  // when the current line started (swallows accidental double-Enter)
  onDone: null,    // hands control back to encounters.js
  timers: [],      // all pending timeouts, so cancel() can clear them mid-animation

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

  start: function (enc, done) {
    Battle.cancel(); // clear any leftovers from an aborted battle
    Battle.onDone = done;
    Battle.lines = [enc.appear, enc.text].filter(Boolean);
    Battle.buildScene(enc);

    // 1) the tall-grass flash...
    const flash = document.getElementById('battle-flash');
    flash.hidden = false;
    flash.classList.remove('flashing');
    void flash.offsetWidth; // restart the CSS animation (same trick as the toast)
    flash.classList.add('flashing');
    Battle.phase = 'flash';
    Battle.playIntroSound();

    // 2) ...then the battle screen with both sprites sliding in...
    Battle.after(850, function () {
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
    enemy.appendChild(Battle.spriteCanvas(enc.art, enc.palette, 1.6));

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

    document.getElementById('battle-text').textContent = '';
    document.getElementById('battle-arrow').hidden = true;
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

  // Enter/Space during a battle (routed here by game.js):
  // typing → show the whole line at once; line done → next line or finish.
  advance: function () {
    if (Battle.phase !== 'text') return; // the flash and slide-in can't be skipped
    if (performance.now() - Battle.lineShownAt < 200) return; // swallow double-taps
    if (Battle.typeTimer) {
      clearInterval(Battle.typeTimer);
      Battle.typeTimer = null;
      document.getElementById('battle-text').textContent = Battle.chars.join('');
      document.getElementById('battle-arrow').hidden = false;
      return;
    }
    if (Battle.lines.length > 0) { Battle.nextLine(); return; }
    const done = Battle.onDone;
    Battle.cancel();
    if (done) done(); // encounters.js sets state.mode back to 'walk'
  },

  // stop everything and hide the battle screen (also used by game.reset)
  cancel: function () {
    Battle.timers.forEach(clearTimeout);
    Battle.timers = [];
    if (Battle.typeTimer) { clearInterval(Battle.typeTimer); Battle.typeTimer = null; }
    Battle.phase = 'idle';
    Battle.onDone = null;
    document.getElementById('battle').hidden = true;
    document.getElementById('battle-flash').hidden = true;
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
