// npcs.js — festival-goers who wander the Wiesn on their own.
// If NPCs BEHAVE wrong (stuck, walking through walls, clustering), the fix is here.
// Looks wrong (sprite colors, dirndl vs lederhosen) → draw.js + CONFIG / NPC_KINDS.
//
// They use the same Pokémon-style grid steps as the player, but pick their own
// directions, pause a lot, and never step onto a tent doorway (so they can't
// trigger a challenge). The player can walk through them — a party guest must
// never get boxed in by the crowd.

const NPC_DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const NPC_DIR_KEYS = ['up', 'down', 'left', 'right'];

// Wiesn Tracht — not generic villagers. Spawn cycles through these.
const NPC_KINDS = [
  { id: 'sepp',  name: 'Sepp',  style: 'lederhosen', hat: '#2e5a1e', feather: '#c41e3a', skin: '#e8b98a', shirt: '#c41e3a', check: '#fff8e7', vest: '#5b3a1e', legs: '#8a5a2b', prop: 'mug' },
  { id: 'resl',  name: 'Resl',  style: 'dirndl',     hair: '#3a2a1a', skin: '#e8b98a', dress: '#1a3a6b', apron: '#f8f8ff', shoes: '#3a2a1a', prop: 'herz' },
  { id: 'hansi', name: 'Hansi', style: 'lederhosen', hat: '#3d2b1f', feather: '#2e7d32', skin: '#d4a574', shirt: '#fff8e7', vest: '#2e7d32', legs: '#5b3a1e' },
  { id: 'mitzi', name: 'Mitzi', style: 'dirndl',     hair: '#c9a227', skin: '#e8b98a', dress: '#b4234a', apron: '#fff3c4', shoes: '#5b3a1e', flower: '#ffd166' },
  { id: 'toni',  name: 'Toni',  style: 'waiter',     hat: '#1a1a1a', skin: '#e8b98a', shirt: '#fdfdfd', vest: '#1a1a1a', legs: '#2a2a2a', prop: 'mug' },
  { id: 'ulli',  name: 'Ulli',  style: 'dirndl',     hair: '#6b3a1e', skin: '#d4a574', dress: '#c9a227', apron: '#1a3a6b', shoes: '#1a1a1a' },
  { id: 'franz', name: 'Franz', style: 'lederhosen', hat: '#6d4c2a', feather: '#ffd166', skin: '#c48a5a', shirt: '#fff8e7', vest: '#8a5a2b', legs: '#8a5a2b', prop: 'pretzel' },
  { id: 'maxl',  name: 'Maxl',  style: 'lederhosen', hat: '#2e5a1e', feather: '#f5c518', skin: '#e8b98a', shirt: '#c41e3a', vest: '#1a3a6b', legs: '#5b3a1e', prop: 'tuba' },
];

const Npcs = {

  spawn: function () {
    const streets = [];
    const lawns = [];
    Npcs.walkableSpots().forEach(function (tile) {
      if (tileAt(tile[0], tile[1]) === '=') streets.push(tile);
      else lawns.push(tile);
    });
    Npcs.shuffle(streets);
    Npcs.shuffle(lawns);
    // most of the crowd walks the Wiesn avenues; a couple linger on the grass
    const spots = streets.concat(lawns);
    const count = Math.min(CONFIG.NPC_COUNT, spots.length);
    state.npcs = [];
    for (let i = 0; i < count; i++) {
      const tile = spots[i];
      const kind = NPC_KINDS[i % NPC_KINDS.length];
      state.npcs.push({
        kind: kind,
        tx: tile[0], ty: tile[1],
        px: tile[0] * CONFIG.TILE,
        py: tile[1] * CONFIG.TILE,
        facing: NPC_DIR_KEYS[Math.floor(Math.random() * 4)],
        moving: false,
        fromX: tile[0], fromY: tile[1],
        destX: tile[0], destY: tile[1],
        moveStart: 0,
        animFrame: 0,
        waitUntil: Math.random() * 1200, // stagger so they don't all step together
      });
    }
  },

  walkableSpots: function () {
    const spots = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (!Npcs.tileOk(x, y)) continue;
        if (x === CONFIG.START_TX && y === CONFIG.START_TY) continue;
        spots.push([x, y]);
      }
    }
    return spots;
  },

  tileOk: function (tx, ty) {
    return !isSolid(tx, ty) && !tentEntranceAt(tx, ty);
  },

  // true if any NPC (except `self`) is standing on or stepping onto (tx, ty)
  reserved: function (tx, ty, self) {
    const list = state.npcs;
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (n === self) continue;
      if (n.tx === tx && n.ty === ty) return true;
      if (n.moving && n.destX === tx && n.destY === ty) return true;
    }
    const p = state.player;
    if (p.tx === tx && p.ty === ty) return true;
    if (p.moving && p.destX === tx && p.destY === ty) return true;
    return false;
  },

  canStep: function (npc, tx, ty) {
    return Npcs.tileOk(tx, ty) && !Npcs.reserved(tx, ty, npc);
  },

  pauseUntil: function (now) {
    return now + CONFIG.NPC_PAUSE_MIN + Math.random() * (CONFIG.NPC_PAUSE_MAX - CONFIG.NPC_PAUSE_MIN);
  },

  update: function (now) {
    if (state.mode === 'win') return; // freeze the crowd for the fanfare
    const list = state.npcs;
    const TILE = CONFIG.TILE;
    for (let i = 0; i < list.length; i++) {
      Npcs.stepOne(list[i], now, TILE);
    }
  },

  stepOne: function (npc, now, TILE) {
    if (npc.moving) {
      const t = (now - npc.moveStart) / CONFIG.NPC_STEP_MS;
      if (t >= 1) {
        npc.tx = npc.destX; npc.ty = npc.destY;
        npc.px = npc.tx * TILE; npc.py = npc.ty * TILE;
        npc.moving = false;
        npc.animFrame = npc.animFrame ? 0 : 1;
        // often pause after a step so the grounds feel like a stroll, not a race
        if (Math.random() < 0.45) npc.waitUntil = Npcs.pauseUntil(now);
      } else {
        npc.px = (npc.fromX + (npc.destX - npc.fromX) * t) * TILE;
        npc.py = (npc.fromY + (npc.destY - npc.fromY) * t) * TILE;
      }
      return;
    }

    if (now < npc.waitUntil) return;

    // prefer the streets (the real Wiesn walk) over wandering the lawns
    const dir = Npcs.pickDir(npc);
    if (dir !== npc.facing) {
      npc.facing = dir;
      npc.waitUntil = now + CONFIG.NPC_TURN_MS;
      return;
    }

    const nx = npc.tx + NPC_DIRS[dir][0];
    const ny = npc.ty + NPC_DIRS[dir][1];
    if (Npcs.canStep(npc, nx, ny)) {
      npc.moving = true;
      npc.fromX = npc.tx; npc.fromY = npc.ty;
      npc.destX = nx; npc.destY = ny;
      npc.moveStart = now;
    } else {
      npc.facing = NPC_DIR_KEYS[Math.floor(Math.random() * 4)];
      npc.waitUntil = Npcs.pauseUntil(now);
    }
  },

  pickDir: function (npc) {
    const street = [];
    const open = [];
    for (let i = 0; i < NPC_DIR_KEYS.length; i++) {
      const d = NPC_DIR_KEYS[i];
      const nx = npc.tx + NPC_DIRS[d][0];
      const ny = npc.ty + NPC_DIRS[d][1];
      if (!Npcs.canStep(npc, nx, ny)) continue;
      open.push(d);
      if (tileAt(nx, ny) === '=') street.push(d);
    }
    if (street.length > 0 && Math.random() < 0.8) {
      if (street.indexOf(npc.facing) !== -1 && Math.random() < 0.65) return npc.facing;
      return street[Math.floor(Math.random() * street.length)];
    }
    if (open.length === 0) return NPC_DIR_KEYS[Math.floor(Math.random() * 4)];
    if (open.indexOf(npc.facing) !== -1 && Math.random() < 0.55) return npc.facing;
    return open[Math.floor(Math.random() * open.length)];
  },

  shuffle: function (arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  },
};
