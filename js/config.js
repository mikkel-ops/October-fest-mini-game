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

  FERRIS_SPIN_MS: 8000, // one full turn of the Riesenrad — slow, festive, not a blur
  APPEAR_MS: 3000,      // ICE used APPEAR! — vanish, then a slow 3-second pop-in

  // Two-team party mode (js/teams.js). Names are just the prefill on the intro
  // screen — the players type over them. Colors: [team 1, team 2], used by the
  // scoreboard chips and the turn banners.
  TEAMS: {
    DEFAULT_NAMES: ['TEAM GAMBRINUS', 'TEAM MASSKRUG'],
    COLORS: ['#1a3a6b', '#c41e3a'],   // Bavarian blue vs Wiesn red
    HOST_POINT_STEP: 1,               // points per Comma/Period press (Shift = subtract)
  },

  // Background music (js/music.js). To swap a tune, drop another mp3 into
  // assets/music/ and change its name here. Credits: assets/music/CREDITS.md.
  MUSIC: {
    VOLUME: 0.35,    // 0 = silent, 1 = full blast — kept low so people can still talk over it
    FILES: {
      // Walking the Wiesn, popups, quizzes: a chiptune medley of beer-tent songs
      // ("Ein Prosit", "Bier her", ...). How it was made: assets/music/CREDITS.md.
      overworld: 'assets/music/overworld.mp3',
      // Wild encounters and tent hosts. A playlist, played IN THIS ORDER: fight 1
      // gets the first clip, fight 2 the second, ... then back to the top.
      // Add, remove or reorder lines freely — any length works.
      battle: [
        'assets/music/battle-1.mp3',
        'assets/music/battle-2.mp3',
        'assets/music/battle-3.mp3',
        'assets/music/battle-4.mp3',
        'assets/music/battle-5.mp3',
        'assets/music/battle-6.mp3',
      ],
    },
  },

  // Themed tent popups (Hofbräu's Mr. Worldwide quiz show). Applied as CSS
  // variables by UI.setShow, so the tent's css file can read them.
  SHOW: {
    CHASE_MS: 1100,  // one loop of the marquee's chase lights
    SWEEP_MS: 6000,  // one drift of the spotlight beams across the stage
  },

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
    ferrisRim:     '#c41e3a', // Wiesn red hoop
    ferrisSpoke:   '#c9a227', // gold spokes + gondola roofs
    ferrisHub:     '#ffd166',
    ferrisGondolaA:'#1a3a6b', // Bavarian blue / white cars
    ferrisGondolaB:'#f8f8ff',
    ferrisLeg:     '#5b3a1e', // timber A-frame
    tentWall:   '#f3ead8',  // base canvas color of tent roofs (stripes use tent colors)
    tentClosed: '#8a8580',  // grey stripes/awnings for tents with no challenge yet
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
