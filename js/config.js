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
      overworld: 'assets/music/overworld.mp3', // walking the Wiesn, popups, quizzes
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

  // Tent 4, POEM WITH A GRAPHICS CARD (js/tents/hacker/hacker.js): both teams
  // write an AI poem on their phones while this clock runs on the TV.
  POEM: {
    SECONDS: 240,              // the clock: 4:00. Agreed range is 3–5 minutes (180–300)
    MIN_LINES: 6,              // the poem is 6–10 lines — only shown on the RULES screen
    MAX_LINES: 10,
    HOSTS: ['MIKKEL', 'JAKOB'], // [subject for the team whose turn it is, subject for the other team]
    EARLY_END_GUARD_MS: 5000,  // Enter can't end the round this soon after the clock starts (double-tap guard)
    TICK_LAST_S: 10,           // a beep per second for the last 10 seconds
    LOW_TIME_S: 30,            // the clock turns red for the last 30 seconds
    ALARM_VOLUME: 1.0,         // the time's-up alarm mp3, 0–1 — it is meant to be LOUD
  },

  // Tent 7, MASSKRUGSTEMMEN (js/tents/paulaner/paulaner.js): one champion per
  // team holds a full 1-litre Maß at arm's length while this clock counts UP.
  STEMMEN: {
    COUNTDOWN_S: 3,            // Enter on READY → "3… 2… 1…" → the clock starts at zero. 0 = start at once
    END_GUARD_MS: 5000,        // Enter can't end the round this soon after the clock starts (double-tap guard)
    WARM_S: 60,                // the clock turns orange after a minute…
    HOT_S: 120,                // …and red (and starts pulsing) after two
    WEAK_S: 30,                // PROST screen: a final time under this gets the "is that all?" line
    LEGEND_S: 180,             // PROST screen: a final time from here up gets the "legend" line
    // What Mama shouts while the arms shake: from `at` seconds on, that line is
    // on the screen, until the next one takes over. Keep them in rising order.
    HECKLES: [
      { at: 0,   line: 'Arms STRAIGHT. Mama is watching.' },
      { at: 20,  line: 'Niki did a lap of Monaco faster than this.' },
      { at: 45,  line: 'Is that elbow bending, Bub?' },
      { at: 60,  line: 'One minute. Mama is only warming up.' },
      { at: 90,  line: 'Shaking is fine. Spilling is NOT.' },
      { at: 120, line: 'Two minutes — Respekt!' },
      { at: 180, line: 'Three minutes. The beer is getting warm.' },
      { at: 240, line: 'Four minutes?! Somebody call the Wiesn-Wirt.' },
      { at: 300, line: 'FIVE. You may call her Mama.' },
    ],
  },

  // Tent 13, SNAKE II (js/tents/ochsenbraterei/): two snakes on one keyboard,
  // team 1 on W A S D, team 2 on the arrow keys. Run your head into anything —
  // the wall, a beer table, the ox, a Kellnerin, yourself, THE OTHER SNAKE — and
  // you lose a Lebkuchenherz. Out of hearts = out of the game.
  // (The floor plan itself is ASCII art in js/tents/ochsenbraterei/snake.js.)
  SNAKE: {
    LIVES: 3,                  // Lebkuchenherzen per team
    START_LENGTH: 4,           // cells, at the start of every round
    COUNTDOWN_S: 3,            // "3… 2… 1… LOS!" before every round
    CRASH_PAUSE_MS: 2200,      // after a crash the floor freezes this long, so the room can read who hit what

    // Speed. A round starts slow and gets faster every second, so no round can
    // last forever — sooner or later somebody misses a turn.
    STEP_MS: 150,              // time to move one cell when a round starts — smaller = faster
    STEP_MIN_MS: 85,           // …and it never gets faster than this
    SPEEDUP_MS_PER_S: 1.0,     // every second of a round shaves this much off a step
    // The floor has ONE shared clock that ticks 3× per step. A normal snake moves
    // every 3rd tick, a Bierturbo snake every 2nd — so turbo is 1.5× speed, and
    // because both snakes move on the same ticks, "who hit whom" is always fair.
    TICKS_PER_STEP: 3,
    TURBO_TICKS_PER_STEP: 2,
    KELLNERIN_TICKS_PER_STEP: 7, // the waitresses stroll: a bit under half a snake's speed
    INPUT_QUEUE: 2,            // quick "up, then left" key combos are remembered this many turns deep

    // What lies on the floor. BREZN are always there; the others are "specials":
    // one at a time, it shows up after a random gap and leaves again if nobody eats it.
    BREZN_ON_FLOOR: 2,
    SPECIAL_GAP_MS: [3500, 7000],   // [shortest, longest] wait before the next special appears
    SPECIAL_LIFETIME_MS: 8000,      // an uneaten special disappears after this long…
    SPECIAL_BLINK_MS: 2500,         // …and blinks for the last bit, as a warning
    SPAWN_CLEARANCE: 3,             // nothing appears closer than this many cells to a snake's head
    // How often each special is picked, relative to the others (3 = three times as likely as 1).
    SPECIAL_WEIGHTS: { semmel: 3, mass: 3, schnaps: 3, herz: 1 },
    HERZ_MAX_PER_MATCH: 1,          // a spare heart makes the match longer — so at most this many

    TURBO_MS: 5000,            // MASS: you are 1.5× as fast for this long
    MIRROR_MS: 4000,           // SCHNAPS: the OTHER team steers mirrored (left = right, up = down) for this long
    GROW: { brezn: 1, semmel: 2 },  // cells a snake grows per bite
    // Points are this mini-game's own score, shown on the PROST screen. They are
    // NOT the team scoreboard — see "Points are an open question" in CLAUDE.md.
    POINTS: { brezn: 1, semmel: 5, mass: 1, schnaps: 1, herz: 2, ko: 3 }, // ko = the other snake ran into YOU

    // The floor is the Nokia's LCD. Snakes are painted in CONFIG.TEAMS.COLORS.
    COLORS: {
      floor:    '#c7f0d8',     // LCD green
      floorDot: '#b3dcc4',     // one dot per cell, so you can count squares
      eye:      '#ffffff',
      pupil:    '#10140f',
      dizzy:    '#ff2fa0',     // pupils of a snake on Schnaps
      lozenge:  '#ffffff',     // the Bavarian diamond on every other body segment
      turbo:    '#ffd83a',     // foam-yellow edge on a Bierturbo snake
    },
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
