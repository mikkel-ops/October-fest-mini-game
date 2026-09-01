// config.js — EVERY tunable number and color in the game lives here.
// Change a value, refresh the browser, done. No other file hides constants.

const CONFIG = {
  TILE: 16,        // pixel size of one map tile (internal resolution, before upscaling)
  STEP_MS: 130,    // time to walk one tile — smaller = faster walking
  TURN_MS: 80,     // a key tap shorter than this only turns the player (Pokémon-style)

  ENCOUNTER_CHANCE: 0.03,   // chance per step of a random encounter (0.03 = 3%)
  ENCOUNTER_COOLDOWN: 10,   // minimum number of steps between two encounters

  START_TX: 21,    // player start tile, x (column)
  START_TY: 12,    // player start tile, y (row)

  NPC_COUNT: 8,        // festival-goers wandering the grounds
  NPC_STEP_MS: 220,    // slower than the player — they're strolling, not speed-running
  NPC_TURN_MS: 140,    // pause after a turn before the next step
  NPC_PAUSE_MIN: 400,  // idle time after a step / blocked path (ms)
  NPC_PAUSE_MAX: 2400,

  // world colors
  COLORS: {
    grass:      '#79b74a',
    grassAlt:   '#71ad44',  // every other tile, so the grass has a subtle checker
    street:     '#e6d3a3',
    fence:      '#8a6d3b',
    treeTrunk:  '#6d4c2a',
    treeLeaf:   '#2e7d32',
    ride:       '#e76f51',
    rideAccent: '#ffd166',
    tentWall:   '#f3ead8',  // base canvas color of tent roofs (stripes use tent colors)
    door:       '#4a3223',  // the dark tent doorway opening
  },

  // the player sprite: a lad in Lederhosen
  PLAYER: {
    hat:      '#2e7d32',
    hatBand:  '#c9a227',
    feather:  '#f4efe2',
    skin:     '#e8b98a',
    shirt:    '#fff8e7',
    leder:    '#6b3e1f',
    lederDark:'#4a2a12',
    strap:    '#8a5a2b',
    sock:     '#f4efe2',
    shoe:     '#3a2414',
    hair:     '#3a2a1a',
  },
};

// Debug mode: add ?debug=1 to the URL, or press ` (backtick) while playing.
// (guarded with typeof so this file also loads outside a browser, e.g. node checks)
CONFIG.DEBUG = (typeof location !== 'undefined') && /[?&]debug=1/.test(location.search);
