// snake.js — SNAKE II, the little game inside tent 13 (Ochsenbraterei).
// Two snakes, one keyboard: team 1 steers with W A S D, team 2 with the arrows.
//
// This file is ONLY the game: the floor, the rules, the painting, the keys.
// The host, the popups and what Enter does live next door in ochsenbraterei.js,
// which also builds the HTML this file paints into. It looks these ids up
// again on EVERY frame (same trick as the clocks in Hacker and Paulaner):
//   #snake-canvas                         the floor
//   #snake-hearts-0/1  #snake-points-0/1  one scoreboard per team
//   #snake-status-0/1                     "BIERTURBO!" / "SCHNAPS!"
//   #snake-banner  #snake-sub             the big words over the floor (3… 2… 1…)
// Looking them up every frame is what makes two things safe:
//   - Enter closes a popup (UI.confirmModal) and the tent file puts a fresh one
//     straight back up — the game just finds the new canvas and keeps painting.
//   - game.reset() mid-match closes the popup for good — the game notices the
//     canvas is gone and stops ITSELF (no loop or key listener left behind).
//
// THE RULES, in one place:
//   - Your head moves into a cell that is not free → you crash → you lose a
//     heart. "Not free" is: the wall, a beer table, the ox, a Kellnerin, your
//     own body, or ANY part of the other snake. So you attack by cutting the
//     other snake off — and if they run into you, you also get the K.O. points.
//   - Both heads into the same cell → both crash. If that would knock BOTH
//     teams out at once, it does not count (there has to be one winner).
//   - After every crash both snakes start again, short, from their corners.
//     Hearts and points are kept. A team with no hearts left has lost.
//
// Every number is in CONFIG.SNAKE (js/config.js). Only the ART is in here: the
// floor plan and the little 8×8 sprites, drawn the same way as the battle
// sprites — one character = one pixel, '.' = see-through.

const SnakeDuel = {

  // ---- the floor plan ------------------------------------------------------------
  // One character = one cell, like the big map in js/map.js:
  //   .  free floor          T  beer table (solid)
  //   O  the ox on its spit (solid — keep it a 6×4 block, that is the sprite's size)
  //   K  a Kellnerin: she walks left and right along her row, turning around
  //      whenever something is in her way
  //   1  where team 1's head starts (heading right)   2  team 2's (heading left)
  // The plan looks the same turned upside down (180°) — that is what makes the
  // two corners equally good. Keep it that way if you move the furniture.
  ARENA: [
    '..............................',
    '..............................',
    '..............................',
    '.....1........................',
    '..............................',
    '......TTTT..........TTTT......',
    '.K............................',
    '............OOOOOO............',
    '............OOOOOO............',
    '............OOOOOO............',
    '............OOOOOO............',
    '............................K.',
    '......TTTT..........TTTT......',
    '..............................',
    '........................2.....',
    '..............................',
    '..............................',
    '..............................',
  ],

  CELL: 8, // canvas pixels per cell. NOT a tunable: the sprites below are 8×8.

  // ---- the sprites -----------------------------------------------------------------

  PALETTE: {
    P: '#a8651e', p: '#7a4712', w: '#ffffff',   // Brezn: crust, shadow, salt
    B: '#e0a75a', b: '#b97a2e', m: '#6b3420',   // Ochsensemmel: bun, bun edge, ox meat
    o: '#f4efe2',                               // …and its onions
    y: '#f5b81f', f: '#fffbe8', g: '#9fb7c4',   // Maß: beer, foam, glass
    G: '#1f6b3a', L: '#124526', c: '#c9a227',   // Schnaps: bottle, shadow, cork + label
    H: '#8a4b1f', h: '#ff8fb1',                 // Lebkuchenherz: gingerbread, pink icing
    W: '#c48a4a', D: '#7a4e22', d: '#a06c34',   // beer table: wood, edge, grain
    N: '#e8b98a', Y: '#f2d16b', R: '#c41e3a',   // Kellnerin: skin, hair, dirndl
    A: '#f8f8ff',                               // …and her apron
    X: '#8a4a22', x: '#6b3518', T: '#b0622c',   // the ox: roast, shadow, the glazed top
    s: '#4a4a52',                               // …the posts that hold the spit
    I: '#9a9aa6', k: '#2b2b2b',                 // …the iron spit, hooves + eye (the horn is 'o')
    F: '#ff8a1f', E: '#ffd83a', e: '#e0440e',   // fire: orange, yellow, red
  },

  ART: {
    brezn: [
      '.PP..PP.',
      'PwwPPwwP',
      'P..PP..P',
      'Pp.PP.pP',
      '.PPwwPP.',
      '.pPPPPp.',
      '..pPPp..',
      '........',
    ],
    semmel: [
      '.bBBBBb.',
      'bBBwBBBb',
      'BBBBBwBB',
      'oooooooo',
      'mmmmmmmm',
      'mmmmmmmm',
      'bBBBBBBb',
      '.bbbbbb.',
    ],
    mass: [
      '.fffff..',
      'fffffff.',
      'gyyyyygg',
      'gyfyyg.g',
      'gyfyyg.g',
      'gyyyyygg',
      'gyyyyyg.',
      '.ggggg..',
    ],
    schnaps: [
      '...cc...',
      '...GG...',
      '..GGGG..',
      '.GGGGGL.',
      '.GccccL.',
      '.GccccL.',
      '.GGGGGL.',
      '.LLLLLL.',
    ],
    herz: [
      '.ww..ww.',
      'wHHwwHHw',
      'wHHHHHHw',
      'wHhhhhHw',
      '.wHhhHw.',
      '..wHHw..',
      '...ww...',
      '........',
    ],
    table: [
      'DDDDDDDD',
      'WWWWWWWW',
      'WWdWWWWW',
      'WWWWWdWW',
      'WdWWWWWW',
      'WWWWdWWW',
      'WWWWWWWW',
      'DDDDDDDD',
    ],
    kellnerin: [
      '..YYYY..',
      '..NNNN..',
      'y.ANNA.y',
      'yRRRRRRy',
      '..RAAR..',
      '.RRAARR.',
      '.RRAARR.',
      '..k..k..',
    ],
    boom: [
      'E..E..E.',
      '.E.F.E..',
      '..FeF...',
      'EFeweFE.',
      '..FeF...',
      '.E.F.E..',
      'E..E..E.',
      '........',
    ],
    // 6×4 cells: the ox fills the top three, the fire the bottom one. The fire is
    // two sprites, swapped a few times a second to make it flicker.
    ox: [
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '...................XXXXXXX.............oo.......',
      '.s..s.........XXXXTTTTTTTTTXXXX.......o....s..s.',
      '.s..s.......XXTTTTTTTTTTTTTTTTTXX....o.....s..s.',
      '..ss......XXTTTTTTTTTTTTTTTTTTTTTXX.ooXXXX..ss.I',
      '..ssx....XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.ssII',
      '..ss.xx.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXkXXXssI.',
      '.IIIIxIIXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxXII.',
      '.IIIIIIXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxxII.',
      '..ss....xXXXXXXXXXXXXXXXXXXXXXXXXXXXxxxxxxxxxs..',
      '..ss....xxXXXXXXXXXXXXXXXXXXXXXXXXXxxxxxxx..ss..',
      '..ss.....xxxxxxxxxxxxxxxxxxxxxxxxxxx........ss..',
      '..ss......xxxxxxxxxxxxxxxxxxxxxxxxx.........ss..',
      '..ss........xxxxxxxxxxxxxxxxxxxxx...........ss..',
      '..ss........xXxxxxxxxxxxxxxxxxxxX...........ss..',
      '..ss.......xX......xxxxxxx.....xX...........ss..',
      '..ss.......xX...................xX..........ss..',
      '..ss......xX....................xX..........ss..',
      '..ss......xX.....................xX.........ss..',
      '..ss......kk.....................kk.........ss..',
      '.ssss......................................ssss.',
    ],
    fireA: [
      '................................................',
      '..........................E.....E.E.............',
      '..........................F.....F.F.....E.......',
      '......................E...F.....F.F.....F.......',
      '.........EE.....EE...EF...F....EF.F.....FE......',
      '......FF.FFFF...FFF.FFFFF.e.F..FeFeFF.FFeF......',
      '......eeFeeeeFFFeeeFeeeeeFeFeFFeeeeeeFeeee......',
      '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
    ],
    fireB: [
      '................................................',
      '................................................',
      '...........................E.E..................',
      '.......E.......E.E...E.....F.F.......E..........',
      '.......F....E..F.F..EFE.EE.F.F.......FE.EE......',
      '......FFFF.FF.FFFF.FFFF.FF.eFeFF.F...FF.FF......',
      '......eeeeFeeFeeeeFeeeeFeeFeeeeeFeFFFeeFee......',
      '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
    ],
  },

  // What the banner says when a snake crashes. %s = that team's name.
  CRASH_LINES: {
    wall:      '%s ran into the tent wall.',
    table:     '%s crashed into a beer table.',
    ox:        '%s got roasted on the ox spit.',
    kellnerin: '%s ran into the Kellnerin. Ten Maß on the floor!',
    self:      '%s bit its own tail.',
    other:     '%s ran into the other snake.',
    headon:    '%s went head first.',
  },

  // ---- the match, as it stands ---------------------------------------------------------

  phase: 'off',      // 'off' | 'ready' (waiting for Enter) | 'count' (3-2-1) | 'play' | 'crash' | 'over'
  paused: false,
  clock: 0,          // game time in ms. It only runs while the match is not paused — every timer below is measured on it, so PAUSE freezes all of them at once
  roundClock: 0,     // ms played in THIS round — what makes the snakes speed up
  tickAcc: 0,        // ms saved up towards the next tick of the floor's clock
  phaseUntil: 0,     // clock time at which 'count' or 'crash' ends
  lastCount: -1,     // the last 3-2-1 number we beeped for, so each beeps once
  bannerText: '',    // the big words over the floor, and the line under them.
  subText: '',       //   Kept here (not only in the HTML) because the popup gets rebuilt.
  bannerUntil: 0,    // clock time at which the banner clears itself. 0 = it stays
  snakes: [],
  items: [],         // [{ kind, x, y, until }] — until 0 = stays until eaten
  kellnerinnen: [],  // [{ x, y, dx, wait }]
  solid: {},         // 'x,y' → 'table' | 'ox', read from ARENA
  starts: [],        // [{ x, y }] head start cell per team
  kellnerinStarts: [],
  oxAt: null,        // top-left cell of the ox, where its sprite is painted
  nextSpecialAt: 0,
  herzSpawned: 0,
  winner: -1,        // team index, once phase is 'over'
  sprites: null,     // ART turned into tiny canvases, made once
  onOver: null,      // told when the match is decided, so the tent file can change its button
  frameId: 0,
  lastFrame: 0,

  // ---- start / stop ------------------------------------------------------------------------

  // A fresh match. It waits in phase 'ready' until SnakeDuel.go().
  begin: function (onOver) {
    const S = CONFIG.SNAKE;
    SnakeDuel.stop();
    SnakeDuel.readArena();
    SnakeDuel.makeSprites();
    SnakeDuel.snakes = [0, 1].map(function (team) {
      return {
        team: team,
        lives: S.LIVES,
        points: 0,
        cells: [],       // [{x, y}], head first
        dir: 'right',
        queue: [],       // turns the player has asked for but the snake has not made yet
        grow: 0,         // cells still to grow: while > 0 the tail stays where it is
        wait: 0,         // ticks until this snake's next move
        turboUntil: 0,   // clock time the Bierturbo wears off
        mirrorUntil: 0,  // clock time the Schnaps wears off
        crashed: null,   // a key of CRASH_LINES, while it lies crashed on the floor
      };
    });
    SnakeDuel.onOver = onOver || null;
    SnakeDuel.clock = 0;
    SnakeDuel.herzSpawned = 0;
    SnakeDuel.winner = -1;
    SnakeDuel.paused = false;
    SnakeDuel.phase = 'ready';
    SnakeDuel.newRound();
    SnakeDuel.say('SNAKE II', 'Champions, hands on the keys. Fertig…?', 0);
    window.addEventListener('keydown', SnakeDuel.onKey);
    SnakeDuel.lastFrame = 0;
    SnakeDuel.frameId = requestAnimationFrame(SnakeDuel.frame);
  },

  // Enter on the waiting floor: 3… 2… 1…
  go: function () {
    if (SnakeDuel.phase === 'ready') SnakeDuel.startCountdown();
  },

  togglePause: function () {
    if (SnakeDuel.phase === 'off' || SnakeDuel.phase === 'over') return;
    SnakeDuel.paused = !SnakeDuel.paused;
    UI.beep(SnakeDuel.paused ? [523, 392] : [392, 523], 0.08);
  },

  // Safe to call any time, any number of times.
  stop: function () {
    if (SnakeDuel.frameId) cancelAnimationFrame(SnakeDuel.frameId);
    SnakeDuel.frameId = 0;
    window.removeEventListener('keydown', SnakeDuel.onKey);
    SnakeDuel.phase = 'off';
  },

  // ---- reading the floor plan ------------------------------------------------------------------

  key: function (x, y) { return x + ',' + y; },

  readArena: function () {
    SnakeDuel.solid = {};
    SnakeDuel.starts = [];
    SnakeDuel.kellnerinStarts = [];
    SnakeDuel.oxAt = null;
    SnakeDuel.ARENA.forEach(function (row, y) {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === 'T') SnakeDuel.solid[SnakeDuel.key(x, y)] = 'table';
        if (ch === 'O') {
          SnakeDuel.solid[SnakeDuel.key(x, y)] = 'ox';
          if (!SnakeDuel.oxAt) SnakeDuel.oxAt = { x: x, y: y }; // rows are read top-left first
        }
        if (ch === '1') SnakeDuel.starts[0] = { x: x, y: y };
        if (ch === '2') SnakeDuel.starts[1] = { x: x, y: y };
        if (ch === 'K') SnakeDuel.kellnerinStarts.push({ x: x, y: y });
      }
    });
  },

  width: function () { return SnakeDuel.ARENA[0].length; },
  height: function () { return SnakeDuel.ARENA.length; },

  // Both snakes back to their corners, short again. Hearts and points are kept.
  newRound: function () {
    const S = CONFIG.SNAKE;
    const half = SnakeDuel.width() / 2;
    SnakeDuel.snakes.forEach(function (snake) {
      const start = SnakeDuel.starts[snake.team];
      // Head towards the middle of the floor, body trailing out behind the head.
      snake.dir = start.x < half ? 'right' : 'left';
      const back = snake.dir === 'right' ? -1 : 1;
      snake.cells = [];
      for (let i = 0; i < S.START_LENGTH; i++) snake.cells.push({ x: start.x + back * i, y: start.y });
      snake.queue = [];
      snake.grow = 0;
      snake.wait = S.TICKS_PER_STEP;
      snake.turboUntil = 0;
      snake.mirrorUntil = 0;
      snake.crashed = null;
    });
    SnakeDuel.kellnerinnen = SnakeDuel.kellnerinStarts.map(function (k) {
      return { x: k.x, y: k.y, dx: k.x < half ? 1 : -1, wait: S.KELLNERIN_TICKS_PER_STEP };
    });
    SnakeDuel.items = [];
    SnakeDuel.roundClock = 0;
    SnakeDuel.tickAcc = 0;
    SnakeDuel.scheduleSpecial();
  },

  // ---- the keys ------------------------------------------------------------------------------------
  // js/game.js has its own keydown listener; in 'modal' mode it only cares about
  // Enter / Space (that is the PAUSE, see ochsenbraterei.js) and already stops
  // the arrow keys from scrolling the page. This second listener only steers.
  // e.code, like everywhere else: the same physical keys on any keyboard layout.

  KEYS: {
    KeyW: [0, 'up'], KeyS: [0, 'down'], KeyA: [0, 'left'], KeyD: [0, 'right'],
    ArrowUp: [1, 'up'], ArrowDown: [1, 'down'], ArrowLeft: [1, 'left'], ArrowRight: [1, 'right'],
  },
  OPPOSITE: { up: 'down', down: 'up', left: 'right', right: 'left' },

  onKey: function (e) {
    const hit = SnakeDuel.KEYS[e.code];
    if (!hit || SnakeDuel.paused) return;
    // steering during the 3-2-1 is allowed: you may pick your first turn early
    if (SnakeDuel.phase !== 'play' && SnakeDuel.phase !== 'count') return;
    SnakeDuel.steer(SnakeDuel.snakes[hit[0]], hit[1]);
  },

  // Turns are QUEUED, not applied at once. A snake only moves every ~150 ms, and
  // a quick "up, then left" is two key presses inside one step — without the
  // queue the second press would overwrite the first (or turn the snake back
  // into its own neck). Each queued turn is used up by one move.
  steer: function (snake, dir) {
    if (SnakeDuel.clock < snake.mirrorUntil) dir = SnakeDuel.OPPOSITE[dir]; // Schnaps!
    const last = snake.queue.length > 0 ? snake.queue[snake.queue.length - 1] : snake.dir;
    if (dir === last || dir === SnakeDuel.OPPOSITE[last]) return; // no U-turns into your own neck
    if (snake.queue.length < CONFIG.SNAKE.INPUT_QUEUE) snake.queue.push(dir);
  },

  // ---- the frame loop ----------------------------------------------------------------------------------
  // Hacker and Paulaner compute their clocks from a fixed moment, because a tab
  // in the background slows its timers and a tick-counting clock would run slow.
  // A GAME wants the opposite: if nobody can see the floor, nothing may move.
  // requestAnimationFrame stops by itself in a hidden tab, and the 100 ms cap
  // below means coming back never makes the snakes leap forward.

  frame: function (now) {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas || document.getElementById('modal').hidden) { SnakeDuel.stop(); return; }
    const dt = Math.min(100, now - (SnakeDuel.lastFrame || now));
    SnakeDuel.lastFrame = now;
    if (!SnakeDuel.paused) SnakeDuel.advance(dt);
    SnakeDuel.draw(canvas);
    SnakeDuel.writeHud();
    SnakeDuel.frameId = requestAnimationFrame(SnakeDuel.frame);
  },

  advance: function (dt) {
    const S = CONFIG.SNAKE;
    SnakeDuel.clock += dt;
    if (SnakeDuel.bannerUntil && SnakeDuel.clock >= SnakeDuel.bannerUntil) SnakeDuel.say('', '', 0);

    if (SnakeDuel.phase === 'count') {
      const left = SnakeDuel.phaseUntil - SnakeDuel.clock;
      if (left > 0) {
        const count = Math.ceil(left / 1000);
        if (count !== SnakeDuel.lastCount) {
          SnakeDuel.lastCount = count;
          SnakeDuel.say(String(count), SnakeDuel.subText, 0);
          UI.beep([523], 0.12);
        }
      } else {
        SnakeDuel.phase = 'play';
        SnakeDuel.say('LOS!', '', 700);
        UI.beep([523, 659, 784, 1047], 0.09);
      }
      return;
    }

    if (SnakeDuel.phase === 'crash') {
      if (SnakeDuel.clock >= SnakeDuel.phaseUntil) SnakeDuel.afterCrash();
      return;
    }

    if (SnakeDuel.phase !== 'play') return;
    SnakeDuel.roundClock += dt;
    SnakeDuel.keepFloorStocked();
    // The floor's clock: TICKS_PER_STEP ticks make one normal step (see config).
    const tickMs = SnakeDuel.stepMs() / S.TICKS_PER_STEP;
    SnakeDuel.tickAcc += dt;
    while (SnakeDuel.tickAcc >= tickMs && SnakeDuel.phase === 'play') {
      SnakeDuel.tickAcc -= tickMs;
      SnakeDuel.tick();
    }
  },

  // How long one step takes right now: slow at the start of a round, then faster.
  stepMs: function () {
    const S = CONFIG.SNAKE;
    return Math.max(S.STEP_MIN_MS, S.STEP_MS - (SnakeDuel.roundClock / 1000) * S.SPEEDUP_MS_PER_S);
  },

  startCountdown: function () {
    SnakeDuel.phase = 'count';
    SnakeDuel.phaseUntil = SnakeDuel.clock + CONFIG.SNAKE.COUNTDOWN_S * 1000;
    SnakeDuel.lastCount = -1;
    SnakeDuel.subText = ''; // the 3-2-1 stands alone
  },

  // ---- one tick of the floor's clock -----------------------------------------------------------------------

  tick: function () {
    const S = CONFIG.SNAKE;

    // 1) The Kellnerinnen stroll. Blocked by anything at all? She turns around
    //    and waits a step — she never walks INTO a snake, snakes walk into her.
    SnakeDuel.kellnerinnen.forEach(function (k) {
      k.wait--;
      if (k.wait > 0) return;
      k.wait = S.KELLNERIN_TICKS_PER_STEP;
      if (SnakeDuel.whatIsAt(k.x + k.dx, k.y, k)) k.dx = -k.dx;
      else k.x += k.dx;
    });

    // 2) Which snakes move on this tick?
    const movers = [];
    SnakeDuel.snakes.forEach(function (snake) {
      snake.wait--;
      if (snake.wait > 0) return;
      const turbo = SnakeDuel.clock < snake.turboUntil;
      snake.wait = turbo ? S.TURBO_TICKS_PER_STEP : S.TICKS_PER_STEP;
      movers.push(snake);
    });
    if (movers.length === 0) return;

    // 3) Where does each head want to go, and is that cell free? Everybody is
    //    judged against the floor as it is NOW, before anyone moves — so it
    //    never matters which snake the code happens to look at first.
    movers.forEach(function (snake) {
      if (snake.queue.length > 0) snake.dir = snake.queue.shift();
      const d = DIRS[snake.dir]; // the same up/down/left/right table the Wiesnheld walks by (js/game.js)
      snake.next = { x: snake.cells[0].x + d[0], y: snake.cells[0].y + d[1] };
      snake.crashed = SnakeDuel.whatIsAt(snake.next.x, snake.next.y, snake);
    });
    // Head-on: two heads into the same free cell. Nobody gets it.
    if (movers.length === 2 && movers[0].next.x === movers[1].next.x && movers[0].next.y === movers[1].next.y) {
      movers.forEach(function (snake) { if (!snake.crashed) snake.crashed = 'headon'; });
    }

    // 4) Whoever did not crash moves: new head on, then eat or pull the tail in.
    movers.forEach(function (snake) {
      if (snake.crashed) return;
      snake.cells.unshift(snake.next);
      const item = SnakeDuel.itemAt(snake.next.x, snake.next.y);
      if (item) SnakeDuel.eat(snake, item);
      if (snake.grow > 0) snake.grow--;
      else snake.cells.pop();
    });

    const crashed = movers.filter(function (snake) { return snake.crashed; });
    if (crashed.length > 0) SnakeDuel.crash(crashed);
  },

  // What is in the way at this cell? null = free floor. `asker` is the snake or
  // Kellnerin who wants to go there — the answer tells a snake WHAT it hit.
  whatIsAt: function (x, y, asker) {
    if (x < 0 || y < 0 || x >= SnakeDuel.width() || y >= SnakeDuel.height()) return 'wall';
    const fixed = SnakeDuel.solid[SnakeDuel.key(x, y)];
    if (fixed) return fixed;
    for (let i = 0; i < SnakeDuel.kellnerinnen.length; i++) {
      const k = SnakeDuel.kellnerinnen[i];
      if (k !== asker && k.x === x && k.y === y) return 'kellnerin';
    }
    for (let i = 0; i < SnakeDuel.snakes.length; i++) {
      const snake = SnakeDuel.snakes[i];
      for (let j = 0; j < snake.cells.length; j++) {
        if (snake.cells[j].x === x && snake.cells[j].y === y) return snake === asker ? 'self' : 'other';
      }
    }
    return null;
  },

  // ---- crashing ------------------------------------------------------------------------------------------------

  crash: function (crashed) {
    const S = CONFIG.SNAKE;
    const names = state.teams;
    let headline;
    let line;

    if (crashed.length === 2) {
      // Both at once. If that would finish BOTH teams, it does not count:
      // the match needs exactly one winner.
      const doubleKo = crashed[0].lives === 1 && crashed[1].lives === 1;
      if (doubleKo) {
        headline = 'DOPPEL-K.O.!';
        line = 'Both on their last heart — that one does not count. Again!';
      } else {
        crashed.forEach(function (snake) { snake.lives--; });
        headline = 'BOTH CRASHED!';
        line = 'One Lebkuchenherz each.';
      }
    } else {
      const loser = crashed[0];
      const other = SnakeDuel.snakes[1 - loser.team];
      loser.lives--;
      headline = 'CRASH!';
      line = SnakeDuel.CRASH_LINES[loser.crashed].replace('%s', names[loser.team].name);
      // Ran into the other snake: that was a successful cut-off, and it pays.
      if (loser.crashed === 'other') {
        other.points += S.POINTS.ko;
        line += ' +' + S.POINTS.ko + ' for ' + names[other.team].name + '!';
      }
    }

    SnakeDuel.phase = 'crash';
    SnakeDuel.phaseUntil = SnakeDuel.clock + S.CRASH_PAUSE_MS;
    SnakeDuel.say(headline, line, 0);
    UI.beep([233, 175, 117], 0.12, 'sawtooth');
  },

  // The freeze after a crash is over: next round, or is somebody out of hearts?
  afterCrash: function () {
    const a = SnakeDuel.snakes[0];
    const b = SnakeDuel.snakes[1];
    if (a.lives > 0 && b.lives > 0) {
      SnakeDuel.newRound();
      SnakeDuel.say('', '', 0);
      SnakeDuel.startCountdown();
      return;
    }
    SnakeDuel.winner = a.lives > 0 ? 0 : 1; // crash() makes sure they are never both at zero
    SnakeDuel.phase = 'over';
    SnakeDuel.say('K.O.!', state.teams[SnakeDuel.winner].name + ' wins SNAKE II!', 0);
    UI.beep([523, 659, 784, 1047, 784, 1047], 0.12);
    if (SnakeDuel.onOver) SnakeDuel.onOver();
  },

  // The numbers for the PROST screen.
  result: function () {
    return {
      winner: SnakeDuel.winner,
      lives: [SnakeDuel.snakes[0].lives, SnakeDuel.snakes[1].lives],
      points: [SnakeDuel.snakes[0].points, SnakeDuel.snakes[1].points],
    };
  },

  // ---- food, beer and Schnaps -------------------------------------------------------------------------------------

  itemAt: function (x, y) {
    for (let i = 0; i < SnakeDuel.items.length; i++) {
      if (SnakeDuel.items[i].x === x && SnakeDuel.items[i].y === y) return SnakeDuel.items[i];
    }
    return null;
  },

  eat: function (snake, item) {
    const S = CONFIG.SNAKE;
    const other = SnakeDuel.snakes[1 - snake.team];
    SnakeDuel.items.splice(SnakeDuel.items.indexOf(item), 1);
    snake.points += S.POINTS[item.kind];
    snake.grow += S.GROW[item.kind] || 0;

    if (item.kind === 'brezn') { UI.beep([880], 0.05); return; }

    // everything else was the special — the next one is a random wait away
    SnakeDuel.scheduleSpecial();
    if (item.kind === 'semmel') UI.beep([659, 880, 1175], 0.06);
    if (item.kind === 'mass') {
      snake.turboUntil = SnakeDuel.clock + S.TURBO_MS;
      UI.beep([523, 784, 1047, 1319], 0.05);
    }
    if (item.kind === 'schnaps') {
      // The drinker is fine. It is the OTHER team whose left and right swap.
      other.mirrorUntil = SnakeDuel.clock + S.MIRROR_MS;
      other.queue = []; // turns queued while sober would now come out backwards
      UI.beep([784, 622, 494, 392], 0.07, 'sawtooth');
    }
    if (item.kind === 'herz') {
      // A full set of hearts cannot grow — then it was only points (and one
      // heart fewer for the other team to find).
      if (snake.lives < S.LIVES) snake.lives++;
      UI.beep([784, 1047, 1319, 1568], 0.08);
    }
  },

  scheduleSpecial: function () {
    const gap = CONFIG.SNAKE.SPECIAL_GAP_MS;
    SnakeDuel.nextSpecialAt = SnakeDuel.clock + gap[0] + Math.random() * (gap[1] - gap[0]);
  },

  // Called every frame while playing: top up the Brezn, bring and clear specials.
  keepFloorStocked: function () {
    const S = CONFIG.SNAKE;
    let brezn = 0;
    let special = null;
    SnakeDuel.items.forEach(function (item) {
      if (item.kind === 'brezn') brezn++;
      else special = item;
    });
    for (; brezn < S.BREZN_ON_FLOOR; brezn++) SnakeDuel.spawn('brezn', 0);

    if (special && SnakeDuel.clock >= special.until) {
      SnakeDuel.items.splice(SnakeDuel.items.indexOf(special), 1); // nobody wanted it
      SnakeDuel.scheduleSpecial();
    } else if (!special && SnakeDuel.clock >= SnakeDuel.nextSpecialAt) {
      SnakeDuel.spawn(SnakeDuel.pickSpecial(), SnakeDuel.clock + S.SPECIAL_LIFETIME_MS);
    }
  },

  // A weighted draw: a kind with weight 3 comes up three times as often as one with 1.
  pickSpecial: function () {
    const S = CONFIG.SNAKE;
    const weights = {};
    let total = 0;
    Object.keys(S.SPECIAL_WEIGHTS).forEach(function (kind) {
      let w = S.SPECIAL_WEIGHTS[kind];
      if (kind === 'herz') {
        // a spare heart only shows up while somebody is missing one, and rarely
        const missing = SnakeDuel.snakes.some(function (snake) { return snake.lives < S.LIVES; });
        if (!missing || SnakeDuel.herzSpawned >= S.HERZ_MAX_PER_MATCH) w = 0;
      }
      weights[kind] = w;
      total += w;
    });
    let roll = Math.random() * total;
    let picked = 'semmel';
    Object.keys(weights).some(function (kind) {
      roll -= weights[kind];
      if (roll < 0 && weights[kind] > 0) { picked = kind; return true; }
      return false;
    });
    if (picked === 'herz') SnakeDuel.herzSpawned++;
    return picked;
  },

  // Put one item on a random free cell — never right under a snake's nose, so
  // nobody gets a Schnaps by pure luck. If the floor is too crowded to find a
  // spot in 200 tries, skip it; keepFloorStocked simply tries again next frame.
  spawn: function (kind, until) {
    const S = CONFIG.SNAKE;
    for (let tries = 0; tries < 200; tries++) {
      const x = Math.floor(Math.random() * SnakeDuel.width());
      const y = Math.floor(Math.random() * SnakeDuel.height());
      if (SnakeDuel.whatIsAt(x, y, null) || SnakeDuel.itemAt(x, y)) continue;
      const tooClose = SnakeDuel.snakes.some(function (snake) {
        const head = snake.cells[0];
        return Math.abs(head.x - x) + Math.abs(head.y - y) < S.SPAWN_CLEARANCE;
      });
      if (tooClose) continue;
      SnakeDuel.items.push({ kind: kind, x: x, y: y, until: until });
      return;
    }
  },

  // ---- painting ---------------------------------------------------------------------------------------------------------

  // ART → tiny canvases, once. Battle.spriteCanvas is the same helper that
  // turns a host's ASCII art into a battle sprite.
  makeSprites: function () {
    if (SnakeDuel.sprites) return;
    SnakeDuel.sprites = {};
    Object.keys(SnakeDuel.ART).forEach(function (name) {
      SnakeDuel.sprites[name] = Battle.spriteCanvas(SnakeDuel.ART[name], SnakeDuel.PALETTE, 1);
    });
  },

  draw: function (canvas) {
    const S = CONFIG.SNAKE;
    const C = SnakeDuel.CELL;
    const W = SnakeDuel.width();
    const H = SnakeDuel.height();
    // A freshly rebuilt popup has a blank default-size canvas — size it first.
    // The canvas is tiny (240×144); CSS blows it up with crisp pixels.
    if (canvas.width !== W * C) { canvas.width = W * C; canvas.height = H * C; }
    const ctx = canvas.getContext('2d');
    const sprites = SnakeDuel.sprites;
    const blinkOn = Math.floor(SnakeDuel.clock / 150) % 2 === 0;

    // the LCD floor, one dot per cell
    ctx.fillStyle = S.COLORS.floor;
    ctx.fillRect(0, 0, W * C, H * C);
    ctx.fillStyle = S.COLORS.floorDot;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) ctx.fillRect(x * C + 3, y * C + 3, 2, 2);
    }

    // the furniture
    Object.keys(SnakeDuel.solid).forEach(function (k) {
      if (SnakeDuel.solid[k] !== 'table') return;
      const xy = k.split(',');
      ctx.drawImage(sprites.table, xy[0] * C, xy[1] * C);
    });
    if (SnakeDuel.oxAt) {
      const ox = SnakeDuel.oxAt.x * C;
      const oy = SnakeDuel.oxAt.y * C;
      const flicker = Math.floor(SnakeDuel.clock / 180) % 2 === 0;
      ctx.drawImage(flicker ? sprites.fireA : sprites.fireB, ox, oy + 3 * C); // the fire burns in the bottom row of cells
      ctx.drawImage(sprites.ox, ox, oy);
    }

    // what lies on the floor — a special about to leave blinks
    SnakeDuel.items.forEach(function (item) {
      const leaving = item.until > 0 && item.until - SnakeDuel.clock < S.SPECIAL_BLINK_MS;
      if (leaving && !blinkOn) return;
      ctx.drawImage(sprites[item.kind], item.x * C, item.y * C);
    });

    SnakeDuel.kellnerinnen.forEach(function (k) {
      ctx.drawImage(sprites.kellnerin, k.x * C, k.y * C);
    });

    SnakeDuel.snakes.forEach(function (snake) {
      // a crashed snake blinks while the floor is frozen
      if (snake.crashed && SnakeDuel.phase === 'crash' && !blinkOn) return;
      SnakeDuel.drawSnake(ctx, snake);
      if (snake.crashed) ctx.drawImage(sprites.boom, snake.cells[0].x * C, snake.cells[0].y * C);
    });
  },

  drawSnake: function (ctx, snake) {
    const S = CONFIG.SNAKE;
    const C = SnakeDuel.CELL;
    const color = CONFIG.TEAMS.COLORS[snake.team];

    // body, tail first so the head is painted last and ends up on top
    for (let i = snake.cells.length - 1; i >= 1; i--) {
      const px = snake.cells[i].x * C;
      const py = snake.cells[i].y * C;
      ctx.fillStyle = color;
      ctx.fillRect(px, py, C, C);
      if (i % 2 === 1) { // every other segment wears a Bavarian lozenge
        ctx.fillStyle = S.COLORS.lozenge;
        ctx.fillRect(px + 3, py + 2, 2, 4);
        ctx.fillRect(px + 2, py + 3, 4, 2);
      }
    }

    const hx = snake.cells[0].x * C;
    const hy = snake.cells[0].y * C;
    // Bierturbo: a foam-yellow edge around the head
    ctx.fillStyle = SnakeDuel.clock < snake.turboUntil ? S.COLORS.turbo : color;
    ctx.fillRect(hx, hy, C, C);
    ctx.fillStyle = color;
    ctx.fillRect(hx + 1, hy + 1, C - 2, C - 2);

    // Two eyes on the side of the head that faces forward. Top-left pixel of
    // each 2×2 eye, per direction; the pupil sits in the eye's forward corner.
    const EYES = {
      right: [[4, 1], [4, 5]], left: [[2, 1], [2, 5]],
      up:    [[1, 2], [5, 2]], down: [[1, 4], [5, 4]],
    };
    const d = DIRS[snake.dir];
    const dizzy = SnakeDuel.clock < snake.mirrorUntil; // on Schnaps: pink pupils
    EYES[snake.dir].forEach(function (eye) {
      ctx.fillStyle = S.COLORS.eye;
      ctx.fillRect(hx + eye[0], hy + eye[1], 2, 2);
      ctx.fillStyle = dizzy ? S.COLORS.dizzy : S.COLORS.pupil;
      ctx.fillRect(hx + eye[0] + (d[0] > 0 ? 1 : 0), hy + eye[1] + (d[1] > 0 ? 1 : 0), 1, 1);
    });
  },

  // ---- the words: banner + the two scoreboards ------------------------------------------------------------------------------
  // All text is HTML, not canvas, so it stays razor-sharp on a TV (see js/ui.js).

  // ms = how long the banner stays, 0 = until the next say().
  say: function (big, small, ms) {
    SnakeDuel.bannerText = big;
    SnakeDuel.subText = small;
    SnakeDuel.bannerUntil = ms ? SnakeDuel.clock + ms : 0;
  },

  // Only touches the page when the text really changed — this runs every frame.
  setText: function (id, text) {
    const el = document.getElementById(id);
    if (el && el.textContent !== text) el.textContent = text;
  },

  writeHud: function () {
    const S = CONFIG.SNAKE;
    SnakeDuel.snakes.forEach(function (snake) {
      let hearts = '';
      for (let i = 0; i < S.LIVES; i++) hearts += i < snake.lives ? '♥' : '♡';
      let status = '';
      if (SnakeDuel.clock < snake.turboUntil) status = 'BIERTURBO!';
      if (SnakeDuel.clock < snake.mirrorUntil) status = 'SCHNAPS! ⇄ mirrored';
      SnakeDuel.setText('snake-hearts-' + snake.team, hearts);
      SnakeDuel.setText('snake-points-' + snake.team, String(snake.points));
      SnakeDuel.setText('snake-status-' + snake.team, status);
    });
    const paused = SnakeDuel.paused;
    SnakeDuel.setText('snake-banner', paused ? 'PAUSE' : SnakeDuel.bannerText);
    SnakeDuel.setText('snake-sub', paused ? 'Enter to play on.' : SnakeDuel.subText);
    const banner = document.getElementById('snake-banner');
    // the 3-2-1 digits get the huge size, words the normal one (ochsenbraterei.css)
    if (banner) banner.classList.toggle('count', !paused && SnakeDuel.phase === 'count');
  },
};
