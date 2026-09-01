// game.js — the heart of the game: the state object, keyboard input,
// Pokémon-style grid movement, and what happens after each step.
// If the game BEHAVES wrong, the fix is in this file.
//
// The whole game is one `state` object (inspect it in the console via `game.state`)
// and one mode string:  'walk' → 'modal' (a popup is open) → 'walk' → ... → 'win'.

const state = {
  mode: 'walk',            // 'walk' | 'modal' | 'win'
  badges: new Set(),       // ids of collected tents, e.g. 'hofbraeu'
  stepsSinceEncounter: 0,  // steps walked since the last random encounter
  lastRoll: null,          // the most recent encounter dice roll (shown in debug panel)
  winShownAt: 0,           // when the win screen appeared (guards against accidental instant reset)
  debug: CONFIG.DEBUG,
  npcs: [],                // festival-goers; spawned by Npcs.spawn()
  player: {
    tx: CONFIG.START_TX, ty: CONFIG.START_TY,  // tile the player stands on
    px: CONFIG.START_TX * CONFIG.TILE,         // pixel position (interpolated while walking)
    py: CONFIG.START_TY * CONFIG.TILE,
    facing: 'down',
    moving: false,
    fromX: 0, fromY: 0, destX: 0, destY: 0, moveStart: 0,
    animFrame: 0,          // 0/1, swaps every step for the walk cycle
  },
};

function logEvent(msg) { console.log('[wiesn] ' + msg); }

// ---- keyboard input -----------------------------------------------------------
// Physical key state: keydown/keyup maintain a stack of held directions and the
// game loop reads it. (Relying on OS key-repeat would make walking speed depend
// on the computer's key-repeat settings — this way it doesn't.)
// e.code is used everywhere, so the keys are the same on any keyboard layout.

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const held = [];          // held direction keys, most recent last
let turnLockUntil = 0;    // until this timestamp, a held key only turns the player

window.addEventListener('keydown', function (e) {
  const dir = KEYMAP[e.code];
  const confirmKey = e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space';
  if (dir || confirmKey) e.preventDefault(); // no page scrolling

  if (dir && !held.includes(dir)) held.push(dir);
  if (e.repeat) return; // everything below reacts to the initial press only

  if (e.code === 'Backquote') { Debug.toggle(); return; }
  if (e.code === 'KeyF') { toggleFullscreen(); return; }

  if (state.mode === 'modal') {
    if (confirmKey) UI.confirmModal();
    return;
  }
  if (state.mode === 'win') {
    // ignore Enter for a moment — a guest mashing through the final fanfare
    // must not accidentally wipe the win screen the instant it appears
    if (confirmKey && performance.now() - state.winShownAt > 1500) game.reset();
    return;
  }
  // walk mode: debug hotkeys (teleports etc.) only when debug is on
  if (state.debug) Debug.handleKey(e.code);
});

window.addEventListener('keyup', function (e) {
  const dir = KEYMAP[e.code];
  const i = held.indexOf(dir);
  if (i !== -1) held.splice(i, 1);
});

function toggleFullscreen() {
  // fullscreen failures arrive as rejected promises, so .catch is the real guard;
  // the try/catch only covers browsers where the API is missing entirely
  try {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else document.documentElement.requestFullscreen().catch(function () {});
  } catch (e) { /* some browsers/TVs refuse — not fatal */ }
}

// ---- movement -------------------------------------------------------------------

function update(now) {
  if (state.mode !== 'walk') return;
  const p = state.player;
  const TILE = CONFIG.TILE;

  // finish or advance the current step
  if (p.moving) {
    const t = (now - p.moveStart) / CONFIG.STEP_MS;
    if (t >= 1) {
      p.tx = p.destX; p.ty = p.destY;
      p.px = p.tx * TILE; p.py = p.ty * TILE;
      p.moving = false;
      p.animFrame = p.animFrame ? 0 : 1;
      onStepComplete();
    } else {
      p.px = (p.fromX + (p.destX - p.fromX) * t) * TILE;
      p.py = (p.fromY + (p.destY - p.fromY) * t) * TILE;
    }
  }

  // start the next step if a direction key is held (most recently pressed wins).
  // Tap-to-turn: pressing a NEW direction first only turns the player; the step
  // begins after TURN_MS — so a quick tap turns on the spot, Pokémon-style.
  if (!p.moving && held.length > 0 && state.mode === 'walk') {
    const dir = held[held.length - 1];
    if (dir !== p.facing) {
      p.facing = dir;
      turnLockUntil = now + CONFIG.TURN_MS;
    } else if (now >= turnLockUntil) {
      const nx = p.tx + DIRS[dir][0];
      const ny = p.ty + DIRS[dir][1];
      if (!isSolid(nx, ny)) {
        p.moving = true;
        p.fromX = p.tx; p.fromY = p.ty;
        p.destX = nx; p.destY = ny;
        p.moveStart = now;
      }
    }
  }
}

// THE one gameplay hook: runs exactly once per completed step.
function onStepComplete() {
  const p = state.player;
  const tent = tentEntranceAt(p.tx, p.ty);
  if (tent) {
    if (state.badges.has(tent.id)) {
      UI.toast('Schon erobert! You already have the ' + tent.brewery + ' badge.');
    } else {
      startChallenge(tent); // challenges.js — calls awardBadge(tent) on success
    }
  } else {
    state.stepsSinceEncounter++;
    maybeEncounter(); // encounters.js
  }
}

// ---- badges & winning --------------------------------------------------------------

function awardBadge(tent) {
  state.badges.add(tent.id);
  UI.refreshTray();
  logEvent('Badge ' + state.badges.size + '/' + TENTS.length + ': ' + tent.brewery + ' (' + tent.name + ')');
  UI.showFanfare(tent, function () {
    if (!checkWin()) state.mode = 'walk';
  });
}

function checkWin() {
  if (state.badges.size < TENTS.length) return false;
  state.mode = 'win';
  logEvent("O'zapft is! All " + TENTS.length + ' badges collected — you conquered the Wiesn!');
  UI.showWin();
  return true;
}

// ---- console helpers -----------------------------------------------------------------
// Open the browser console and type e.g.:  game.give('hofbraeu')  game.winNow()

const game = {
  state: state,
  config: CONFIG,

  give: function (tentId) {
    const tent = TENT_BY_ID[tentId];
    if (!tent) { logEvent('No tent with id "' + tentId + '". Ids: ' + TENTS.map(function (t) { return t.id; }).join(', ')); return; }
    state.badges.add(tent.id);
    UI.refreshTray();
    checkWin();
  },

  giveAllBadges: function () { TENTS.forEach(function (t) { state.badges.add(t.id); }); UI.refreshTray(); },

  winNow: function () { game.giveAllBadges(); checkWin(); },

  teleport: function (tx, ty) {
    const p = state.player;
    p.tx = tx; p.ty = ty;
    p.px = tx * CONFIG.TILE; p.py = ty * CONFIG.TILE;
    p.moving = false;
  },

  encounterNow: function () { startEncounter(ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]); },

  reset: function () {
    state.badges.clear();
    state.stepsSinceEncounter = 0;
    state.lastRoll = null;
    state.mode = 'walk';
    game.teleport(CONFIG.START_TX, CONFIG.START_TY);
    state.player.facing = 'down';
    Npcs.spawn();
    UI.hideOverlays();
    UI.refreshTray();
    logEvent('Game reset. Auf geht’s!');
  },
};
window.game = game;

// ---- boot ------------------------------------------------------------------------------

function init() {
  const problems = validateMap();
  if (problems.length > 0) {
    const banner = document.getElementById('boot-errors');
    banner.hidden = false;
    banner.innerHTML = '<b>Map problems found:</b><br>' + problems.join('<br>');
    problems.forEach(function (p) { console.error('[wiesn] ' + p); });
  }

  computeTentTiles();
  Npcs.spawn();
  UI.buildTray();
  UI.buildLabels();
  Draw.init();
  Debug.init();

  // fade the controls hint after a few seconds; bring it back if the page loses focus
  const hint = document.getElementById('hint');
  setTimeout(function () { hint.classList.add('faded'); }, 6000);
  window.addEventListener('blur', function () {
    held.length = 0; // keyups released in another window never reach us — drop stale keys or the player walks on their own
    turnLockUntil = 0;
    hint.textContent = 'Click the game, then walk with arrow keys / WASD';
    hint.classList.remove('faded');
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) held.length = 0; });
  window.addEventListener('focus', function () { setTimeout(function () { hint.classList.add('faded'); }, 2500); });

  logEvent("O'zapft is! Visit all " + TENTS.length + ' tents. Walk with arrows/WASD, F = fullscreen' + (state.debug ? ', debug ON' : ', ?debug=1 for debug mode') + '.');
  requestAnimationFrame(loop);
}

function loop(now) {
  update(now);
  Npcs.update(now); // keep strolling during popups; freeze on the win screen
  Draw.render(now);
  Debug.updatePanel();
  requestAnimationFrame(loop);
}

init();
