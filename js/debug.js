// debug.js — every debugging aid, all behind the debug flag.
// Turn on with ?debug=1 in the URL, or press ` (backtick) while playing.
//
// Hotkeys while debug is ON:
//   1-9, 0        teleport in front of tents 1-10
//   -  =  [  ]    teleport in front of tents 11, 12, 13, 14
//   B             grant the next missing badge
//   N             grant all badges (jump straight to the win screen)
//   E             force a random encounter now
//   R             reset the game
//
// Console helpers (always available, no debug flag needed) — see window.game
// at the bottom of game.js: game.give('hofbraeu'), game.teleport(x,y), ...

const Debug = {

  panel: null,

  init: function () {
    Debug.panel = document.getElementById('debug-panel');
    Debug.refreshVisibility();
  },

  toggle: function () {
    state.debug = !state.debug;
    Debug.refreshVisibility();
    logEvent('Debug mode ' + (state.debug ? 'ON' : 'OFF'));
  },

  refreshVisibility: function () {
    Debug.panel.hidden = !state.debug;
  },

  // keys handled only while debug is on (called from the keydown handler in game.js)
  handleKey: function (code) {
    const teleportKeys = {
      Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Digit5: 5, Digit6: 6, Digit7: 7,
      Digit8: 8, Digit9: 9, Digit0: 10, Minus: 11, Equal: 12, BracketLeft: 13, BracketRight: 14,
    };
    if (teleportKeys[code]) { Debug.teleportToTent(teleportKeys[code]); return true; }
    if (code === 'KeyB') { Debug.giveNextBadge(); return true; }
    if (code === 'KeyN') { game.winNow(); return true; }
    if (code === 'KeyE') { startEncounter(ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]); return true; }
    if (code === 'KeyR') { game.reset(); return true; }
    return false;
  },

  // put the player on the walkable tile next to a tent's entrance
  teleportToTent: function (num) {
    const tent = TENTS.find(function (t) { return t.num === num; });
    if (!tent) return;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (tileAt(x, y) !== tent.mapChar) continue;
        const neighbors = [[x, y + 1], [x, y - 1], [x + 1, y], [x - 1, y]];
        for (let i = 0; i < neighbors.length; i++) {
          const n = neighbors[i];
          if (!isSolid(n[0], n[1]) && !tentEntranceAt(n[0], n[1])) {
            game.teleport(n[0], n[1]);
            logEvent('Teleported in front of ' + tent.name);
            return;
          }
        }
      }
    }
  },

  giveNextBadge: function () {
    const missing = TENTS.find(function (t) { return !state.badges.has(t.id); });
    if (missing) game.give(missing.id);
  },

  // the live stats panel, updated every frame from the game loop
  updatePanel: function () {
    if (!state.debug) return;
    const p = state.player;
    const ch = tileAt(p.tx, p.ty);
    Debug.panel.textContent = [
      'mode: ' + state.mode,
      'player tile: (' + p.tx + ',' + p.ty + ')  char: "' + ch + '" (' + (LEGEND[ch] ? LEGEND[ch].name : '?') + ')',
      'badges: ' + state.badges.size + ' / ' + TENTS.length,
      'steps since encounter: ' + state.stepsSinceEncounter + ' (cooldown ' + CONFIG.ENCOUNTER_COOLDOWN + ')',
      'last encounter roll: ' + (state.lastRoll === null ? '—' : state.lastRoll.toFixed(3)) + ' vs ' + CONFIG.ENCOUNTER_CHANCE,
      '',
      'teleport: 1-9 0 - = [ ]   B badge   N all',
      'E encounter   R reset   ` close',
    ].join('\n');
  },

  // drawn on the canvas after the world (called from Draw.render)
  drawOverlay: function (ctx) {
    const TILE = CONFIG.TILE;

    // red tint on everything solid — collision made visible
    ctx.fillStyle = 'rgba(255,0,0,0.25)';
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (isSolid(x, y)) ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    // tile grid + coordinates every 4 tiles
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_W; x++) {
      ctx.beginPath(); ctx.moveTo(x * TILE + 0.5, 0); ctx.lineTo(x * TILE + 0.5, MAP_H * TILE); ctx.stroke();
    }
    for (let y = 0; y <= MAP_H; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * TILE + 0.5); ctx.lineTo(MAP_W * TILE, y * TILE + 0.5); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.font = '6px monospace';
    for (let x = 0; x < MAP_W; x += 4) ctx.fillText(String(x), x * TILE + 2, 7);
    for (let y = 4; y < MAP_H; y += 4) ctx.fillText(String(y), 2, y * TILE + 7);

    // highlight each tent entrance with its map character
    ctx.font = 'bold 8px monospace';
    TENTS.forEach(function (tent) {
      for (let y = 0; y < MAP_H; y++) {
        const x = MAP[y].indexOf(tent.mapChar);
        if (x !== -1) {
          ctx.fillStyle = 'rgba(255,255,0,0.9)';
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          ctx.fillStyle = '#000';
          ctx.fillText(tent.mapChar, x * TILE + 5, y * TILE + 11);
        }
      }
    });
  },
};
