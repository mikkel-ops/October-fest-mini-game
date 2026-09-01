// map.js — the festival grounds, drawn in ASCII. This IS the level editor:
// edit the strings below (monospace font recommended) and refresh the browser.
//
// Legend (also see LEGEND below):
//   #  fence (solid)          .  grass
//   T  tree (solid)           =  street
//   t  tent wall (solid)      o  fairground ride (solid, decoration)
//   1-9, a-e  tent ENTRANCES (walkable!) — step onto one to enter that tent.
//             The character matches `mapChar` in tents.js (a=10, b=11 ... e=14).
//
// Layout mirrors the real Theresienwiese map: tents 1-8 along the top street,
// tents 14..9 along the bottom street, cross streets in between, rides to the east.
// Every row must be exactly the same length — validateMap() checks this at boot
// and prints plain-English errors in the browser console if something is off.

const MAP = [
  '############################################',
  '#..........................................#',
  '#.tttt.tttt.tttt.tttt.tttt.tttt.tttt.tttt..#',
  '#.tttt.tttt.tttt.tttt.tttt.tttt.tttt.tttt..#',
  '#.tttt.tttt.tttt.tttt.tttt.tttt.tttt.tttt..#',
  '#.t1tt.t2tt.t3tt.t4tt.t5tt.t6tt.t7tt.t8tt..#',
  '#==========================================#',
  '#==========================================#',
  '#.....=..............=..............=......#',
  '#.TT..=...TT....TT...=..TT......oo..=..oo..#',
  '#.....=..............=..............=..oo..#',
  '#.....=..............=......TT......=......#',
  '#..TT.=....TT........=..............=..oo..#',
  '#.....=..............=..TT......TT..=......#',
  '#.....=..............=..............=......#',
  '#==========================================#',
  '#==========================================#',
  '#...ttett.ttdtt.ttctt.ttbtt.ttatt.tt9tt....#',
  '#...ttttt.ttttt.ttttt.ttttt.ttttt.ttttt....#',
  '#...ttttt.ttttt.ttttt.ttttt.ttttt.ttttt....#',
  '#...ttttt.ttttt.ttttt.ttttt.ttttt.ttttt....#',
  '#..TT.................TT.............TT....#',
  '#..........TT..................TT..........#',
  '#.TT..............TT..............TT.......#',
  '#..........................................#',
  '############################################',
];

const MAP_W = MAP[0].length;
const MAP_H = MAP.length;

// What each character means. Tent entrances are added from tents.js below.
const LEGEND = {
  '#': { solid: true,  name: 'fence' },
  '.': { solid: false, name: 'grass' },
  '=': { solid: false, name: 'street' },
  'T': { solid: true,  name: 'tree' },
  't': { solid: true,  name: 'tent wall' },
  'o': { solid: true,  name: 'ride' },
};
TENTS.forEach(function (t) {
  LEGEND[t.mapChar] = { solid: false, name: 'entrance: ' + t.name, tent: t };
});

// ---- tiny helpers used everywhere ------------------------------------------

function tileAt(tx, ty) {
  if (ty < 0 || ty >= MAP_H || tx < 0 || tx >= MAP_W) return '#'; // outside = wall
  return MAP[ty].charAt(tx);
}

function isSolid(tx, ty) {
  const info = LEGEND[tileAt(tx, ty)];
  return !info || info.solid; // unknown characters count as solid, so typos can't be walked on
}

// Returns the tent whose entrance is at (tx,ty), or null.
function tentEntranceAt(tx, ty) {
  const info = LEGEND[tileAt(tx, ty)];
  return (info && info.tent) || null;
}

// ---- which tent does each 't' wall belong to? -------------------------------
// Flood fill outward from each entrance over connected 't' tiles. Only used for
// coloring the roofs and positioning the number labels — gameplay never needs it.

const TENT_TILES = {};   // 'tx,ty' -> tent object, for every 't' tile
const TENT_BOUNDS = {};  // tent.id -> {minX, maxX, minY, maxY}, for label placement

function computeTentTiles() {
  TENTS.forEach(function (tent) {
    const queue = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (tileAt(x, y) === tent.mapChar) queue.push([x, y]);
      }
    }
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    while (queue.length > 0) {
      const pos = queue.pop();
      const x = pos[0], y = pos[1];
      bounds.minX = Math.min(bounds.minX, x); bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y); bounds.maxY = Math.max(bounds.maxY, y);
      [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(function (n) {
        const key = n[0] + ',' + n[1];
        if (tileAt(n[0], n[1]) === 't' && !TENT_TILES[key]) {
          TENT_TILES[key] = tent;
          queue.push(n);
        }
      });
    }
    TENT_BOUNDS[tent.id] = bounds;
  });
}

// ---- boot-time sanity checks ------------------------------------------------
// Returns an array of plain-English problem descriptions (empty = all good).

function validateMap() {
  const problems = [];

  MAP.forEach(function (row, y) {
    if (row.length !== MAP_W) {
      problems.push('map row ' + y + ' is ' + row.length + ' characters long, expected ' + MAP_W + '.');
    }
    for (let x = 0; x < row.length; x++) {
      if (!LEGEND[row.charAt(x)]) {
        problems.push('map row ' + y + ', column ' + x + ' has unknown character "' + row.charAt(x) + '".');
      }
    }
  });

  TENTS.forEach(function (tent) {
    let count = 0, ex = -1, ey = -1;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (tileAt(x, y) === tent.mapChar) { count++; ex = x; ey = y; }
      }
    }
    if (count === 0) {
      problems.push('tent ' + tent.num + ' (' + tent.name + '): entrance character "' + tent.mapChar + '" is missing from the map.');
    } else if (count > 1) {
      problems.push('tent ' + tent.num + ' (' + tent.name + '): entrance character "' + tent.mapChar + '" appears ' + count + ' times, expected once.');
    } else {
      const reachable = !isSolid(ex + 1, ey) || !isSolid(ex - 1, ey) || !isSolid(ex, ey + 1) || !isSolid(ex, ey - 1);
      if (!reachable) {
        problems.push('tent ' + tent.num + ' (' + tent.name + '): its entrance at (' + ex + ',' + ey + ') has no walkable tile next to it.');
      }
    }
  });

  if (isSolid(CONFIG.START_TX, CONFIG.START_TY)) {
    problems.push('the player start tile (' + CONFIG.START_TX + ',' + CONFIG.START_TY + ') is not walkable.');
  }

  return problems;
}
