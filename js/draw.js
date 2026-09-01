// draw.js — everything painted on the <canvas>: the world tiles and the player.
// The canvas has a FIXED internal resolution (map size × TILE) and is stretched
// to fill the browser window. CSS `image-rendering: pixelated` keeps tiles crisp.
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
    document.addEventListener('fullscreenchange', Draw.fit);
    Draw.fit();
  },

  // Scale the stage to COVER the viewport (no letterbox, square pixels).
  // A little of the outer fence may clip on odd aspect ratios.
  fit: function () {
    const area = document.getElementById('playarea');
    const scale = Math.max(area.clientWidth / Draw.canvas.width, area.clientHeight / Draw.canvas.height);
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
  // A chunky little lad in Lederhosen: green hat + feather, white shirt,
  // leather shorts with H-suspenders, white socks, brown shoes.
  // Two walk frames (legs swap), four facings (eyes / brim / feather).

  drawPlayer: function (now) {
    const ctx = Draw.ctx;
    const P = CONFIG.PLAYER;
    const p = state.player;
    const x = Math.round(p.px) + 1;              // 14px-wide sprite inside the 16px tile
    const y = Math.round(p.py) + (p.moving && p.animFrame ? 0 : 1);
    const stride = (p.moving && p.animFrame) ? 1 : 0;
    const faceLeft = p.facing === 'left';
    const faceRight = p.facing === 'right';
    const faceDown = p.facing === 'down';
    const faceUp = p.facing === 'up';

    // soft shadow + pulsing outline so the player is easy to spot from the couch
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 1, y + 14, 12, 2);
    const pulse = 0.35 + 0.25 * Math.sin(now / 300);
    ctx.fillStyle = 'rgba(255,255,255,' + pulse.toFixed(2) + ')';
    ctx.fillRect(x - 1, y - 2, 16, 18);

    // tyrolean hat (green crown, gold band, brim that leans with facing)
    ctx.fillStyle = P.hat;
    ctx.fillRect(x + 3, y, 8, 3);
    if (faceLeft) ctx.fillRect(x, y + 2, 6, 2);
    else if (faceRight) ctx.fillRect(x + 8, y + 2, 6, 2);
    else ctx.fillRect(x + 1, y + 2, 12, 2);
    ctx.fillStyle = P.hatBand;
    ctx.fillRect(x + 3, y + 2, 8, 1);

    // white feather on the hat
    ctx.fillStyle = P.feather;
    if (faceLeft) {
      ctx.fillRect(x + 1, y - 1, 2, 3);
      ctx.fillRect(x, y - 2, 2, 2);
    } else {
      ctx.fillRect(x + 11, y - 1, 2, 3);
      ctx.fillRect(x + 12, y - 2, 2, 2);
    }

    // head: hair from behind, face from the front/sides
    if (faceUp) {
      ctx.fillStyle = P.hair;
      ctx.fillRect(x + 4, y + 4, 6, 3);
    } else {
      ctx.fillStyle = P.skin;
      ctx.fillRect(x + 4, y + 4, 6, 3);
      ctx.fillStyle = P.hair;
      if (faceDown) { ctx.fillRect(x + 5, y + 5, 1, 1); ctx.fillRect(x + 8, y + 5, 1, 1); }
      if (faceLeft) ctx.fillRect(x + 4, y + 5, 1, 1);
      if (faceRight) ctx.fillRect(x + 9, y + 5, 1, 1);
      if (faceDown) ctx.fillRect(x + 6, y + 6, 2, 1); // little Wiesn moustache
    }

    // white shirt
    ctx.fillStyle = P.shirt;
    ctx.fillRect(x + 2, y + 7, 10, 3);

    // leather shorts + front flap
    ctx.fillStyle = P.leder;
    ctx.fillRect(x + 2, y + 9, 10, 3);
    ctx.fillStyle = P.lederDark;
    ctx.fillRect(x + 6, y + 9, 2, 2);
    ctx.fillStyle = P.hatBand; // tiny gold stitch on the flap
    ctx.fillRect(x + 6, y + 10, 2, 1);

    // H-suspenders: two thick straps + a cross-bar, gold buttons
    ctx.fillStyle = P.strap;
    ctx.fillRect(x + 3, y + 7, 2, 4);
    ctx.fillRect(x + 9, y + 7, 2, 4);
    ctx.fillRect(x + 3, y + 8, 8, 1);
    ctx.fillStyle = P.hatBand;
    ctx.fillRect(x + 3, y + 8, 1, 1);
    ctx.fillRect(x + 10, y + 8, 1, 1);

    // white knee-socks + brown shoes (swap on each step)
    ctx.fillStyle = P.sock;
    ctx.fillRect(x + 3, y + 12, 3, 2);
    ctx.fillRect(x + 8, y + 12 + stride, 3, 2);
    ctx.fillStyle = P.shoe;
    ctx.fillRect(x + 2, y + 14, 4, 1);
    ctx.fillRect(x + 8, y + 14 + stride, 4, 1);
  },

  // called every frame from the game loop in game.js
  render: function (now) {
    Draw.drawWorld();
    Draw.drawPlayer(now);
    if (state.debug) Debug.drawOverlay(Draw.ctx);
  },
};
