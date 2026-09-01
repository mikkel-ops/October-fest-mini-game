// draw.js — everything painted on the <canvas>: the world tiles and the player.
// The canvas has a FIXED internal resolution (map size × TILE) and is scaled up
// by whole numbers to fit the screen, so pixels stay square and crisp on a TV.
// If the game LOOKS wrong, the fix is in this file (or a color in config.js).

const Draw = {

  canvas: null,
  ctx: null,

  init: function () {
    Draw.canvas = document.getElementById('world');
    Draw.canvas.width = MAP_W * CONFIG.TILE;   // internal resolution, e.g. 44*16 = 704
    Draw.canvas.height = MAP_H * CONFIG.TILE;  // e.g. 26*16 = 416
    Draw.ctx = Draw.canvas.getContext('2d');
    window.addEventListener('resize', Draw.fit);
    Draw.fit();
  },

  // Scale the canvas up by a whole number (2x, 3x...) to fill the play area,
  // centered with letterboxing. Whole numbers keep the pixel art crisp.
  fit: function () {
    const area = document.getElementById('playarea');
    const availW = area.clientWidth;
    const availH = area.clientHeight;
    let scale = Math.min(availW / Draw.canvas.width, availH / Draw.canvas.height);
    if (scale > 1) scale = Math.floor(scale); // integer upscale; tiny screens may downscale fractionally
    const stage = document.getElementById('stage');
    stage.style.width = (Draw.canvas.width * scale) + 'px';
    stage.style.height = (Draw.canvas.height * scale) + 'px';
  },

  // ---- the world ---------------------------------------------------------------

  drawWorld: function () {
    const ctx = Draw.ctx;
    const TILE = CONFIG.TILE;
    const C = CONFIG.COLORS;

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const ch = tileAt(x, y);
        const px = x * TILE, py = y * TILE;

        // grass is the base layer under everything that isn't street/fence
        ctx.fillStyle = ((x + y) % 2 === 0) ? C.grass : C.grassAlt;
        ctx.fillRect(px, py, TILE, TILE);

        if (ch === '=') {
          ctx.fillStyle = C.street;
          ctx.fillRect(px, py, TILE, TILE);

        } else if (ch === '#') {
          ctx.fillStyle = C.fence;
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = 'rgba(0,0,0,0.15)'; // darker bottom edge = a hint of depth
          ctx.fillRect(px, py + TILE - 3, TILE, 3);

        } else if (ch === 'T') {
          ctx.fillStyle = C.treeTrunk;
          ctx.fillRect(px + 6, py + 10, 4, 6);
          ctx.fillStyle = C.treeLeaf;
          ctx.fillRect(px + 2, py + 2, 12, 9);
          ctx.fillRect(px + 4, py, 8, 2);

        } else if (ch === 'o') {
          ctx.fillStyle = C.ride;
          ctx.beginPath();
          ctx.arc(px + TILE / 2, py + TILE / 2, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = C.rideAccent;
          ctx.beginPath();
          ctx.arc(px + TILE / 2, py + TILE / 2, 3, 0, 2 * Math.PI);
          ctx.fill();

        } else if (ch === 't') {
          // tent roof: canvas-white with stripes in the tent's brand color
          const tent = TENT_TILES[x + ',' + y];
          ctx.fillStyle = C.tentWall;
          ctx.fillRect(px, py, TILE, TILE);
          if (tent && x % 2 === 0) {
            ctx.fillStyle = tent.colors[0];
            ctx.fillRect(px, py, TILE, TILE);
          }

        } else if (LEGEND[ch] && LEGEND[ch].tent) {
          // tent entrance: dark doorway with an awning in the tent's color
          const tent = LEGEND[ch].tent;
          ctx.fillStyle = C.door;
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = tent.colors[0];
          ctx.fillRect(px, py, TILE, 4);
          ctx.fillStyle = C.tentWall;
          ctx.fillRect(px + 1, py + 4, 2, 3); // two tiny awning tassels
          ctx.fillRect(px + TILE - 3, py + 4, 2, 3);
        }
      }
    }
  },

  // ---- the player -----------------------------------------------------------------
  // A chunky little lad in Lederhosen, built from rectangles. Two walk frames
  // (legs swap), four facings (eye placement + hat brim shift).

  drawPlayer: function (now) {
    const ctx = Draw.ctx;
    const P = CONFIG.PLAYER;
    const p = state.player;
    const x = Math.round(p.px) + 2;              // sprite is 12px wide inside the 16px tile
    const y = Math.round(p.py) + (p.moving && p.animFrame ? 0 : 1);

    // soft shadow + pulsing outline so the player is easy to spot from the couch
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 1, y + 13, 10, 2);
    const pulse = 0.35 + 0.25 * Math.sin(now / 300);
    ctx.fillStyle = 'rgba(255,255,255,' + pulse.toFixed(2) + ')';
    ctx.fillRect(x - 1, y - 1, 14, 16);

    // hat
    ctx.fillStyle = P.hat;
    ctx.fillRect(x + 2, y, 8, 3);
    if (p.facing === 'left') ctx.fillRect(x, y + 2, 4, 1);        // brim
    else if (p.facing === 'right') ctx.fillRect(x + 8, y + 2, 4, 1);
    else ctx.fillRect(x + 1, y + 2, 10, 1);

    // face
    ctx.fillStyle = P.skin;
    ctx.fillRect(x + 3, y + 3, 6, 4);
    ctx.fillStyle = '#3a2a1a';
    if (p.facing === 'down') { ctx.fillRect(x + 4, y + 5, 1, 1); ctx.fillRect(x + 7, y + 5, 1, 1); }
    if (p.facing === 'left') { ctx.fillRect(x + 3, y + 5, 1, 1); }
    if (p.facing === 'right') { ctx.fillRect(x + 8, y + 5, 1, 1); }
    // (facing 'up' = back of the head, no eyes)

    // shirt + Lederhosen vest straps
    ctx.fillStyle = P.shirt;
    ctx.fillRect(x + 2, y + 7, 8, 4);
    ctx.fillStyle = P.vest;
    ctx.fillRect(x + 3, y + 7, 2, 4);
    ctx.fillRect(x + 7, y + 7, 2, 4);

    // legs (swap on each step for a walk cycle)
    ctx.fillStyle = P.legs;
    const stride = (p.moving && p.animFrame) ? 1 : 0;
    ctx.fillRect(x + 3, y + 11, 2, 3 + stride);
    ctx.fillRect(x + 7, y + 11 + stride, 2, 3);
  },

  // called every frame from the game loop in game.js
  render: function (now) {
    Draw.drawWorld();
    Draw.drawPlayer(now);
    if (state.debug) Debug.drawOverlay(Draw.ctx);
  },
};
