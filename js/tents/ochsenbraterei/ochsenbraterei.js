// Tent 13 — Ochsenbraterei, where a whole ox has been turning on the spit since
// 1881. Something else in here is just as old-fashioned and just as impossible
// to kill: a NOKIA 3310 that fell out of a Lederhosen pocket in 2001 and has
// been lying under the spit ever since. Its move is SNAKE II — and unlike the
// duels in Hacker and Paulaner, this one is played ON THE TV: both teams at
// the laptop at the same time, one keyboard, two snakes.
//
// THE GAME: each team sends ONE champion to the keyboard. Team 1 steers with
// W A S D, team 2 with the arrow keys. Run your head into anything — the wall,
// a beer table, the ox, a Kellnerin, yourself, or THE OTHER SNAKE — and you
// lose a Lebkuchenherz. Three hearts each; out of hearts = out of the game. So
// you win by cutting the other snake off. Brezn and Ochsensemmeln are points,
// a Maß makes you fast, a Schnaps makes the OTHER team steer mirrored.
//
// Three files make this tent:
//   ochsenbraterei.js   this — the host, its move, and the five screens below
//   snake.js            the game itself: floor plan, rules, sprites, painting
//   ochsenbraterei.css  the look (show: 'nokia') + the floor and scoreboard layout
//
// THE FIVE SCREENS, in order. One-word titles, same reason as Hacker — they
// must be readable from the sofa after a few Maß:
//   RULES   DO / DON'T                            Enter → next
//   KEYS    which team gets which keys            Enter → next
//   MENU    what lies on the floor, and what it does   Enter → next
//   SNAKE   the floor. Enter starts the 3… 2… 1…; while playing, Enter is PAUSE
//           ...somebody runs out of hearts...     Enter → next
//   PROST   the winner, hearts and points         Enter → the game ends, badge
//
// POINTS are NOT wired into the team scoreboard (see "Points are an open
// question" in CLAUDE.md). The snake points are this mini-game's own score;
// the hosts give the winner a real point by hand with the , and . keys or by
// clicking the team chips — ochsenbraterei.css lifts the chips above these
// popups so that works while PROST is still up.
//
// Every number (hearts, speeds, how long a Schnaps lasts…) is in CONFIG.SNAKE
// in js/config.js. Want a longer match? Change LIVES there.
//
// Registering this key is what makes tent 13 OPEN (see js/challenges.js).

CHALLENGES.ochsenbraterei = {
  host: {
    name: 'NOKIA 3310',
    level: 3310,
    appear: 'A wild NOKIA 3310 appeared!',
    text: 'It fell out of a Lederhosen pocket in 2001 and has been lying under the ox spit ever since. Not a scratch. Battery: still three bars.',
    // Its attack IS the game: battle.js types "NOKIA 3310 used SNAKE II!", it
    // lunges, your fake HP drops, and Enter opens the RULES screen.
    foeAttack: {
      name: 'SNAKE II',
      result: 'It does not even vibrate. The benches are pushed aside and the tent floor lights up LCD green. One champion per team — to the keyboard!',
    },
    // A 3310 in a Tirolerhut. What makes it read as THE Nokia: the navy shell,
    // the silver frame around a pale green screen (with a snake on it, heading
    // for a Brezn), the one big silver key, and the 3×4 keypad.
    palette: {
      H: '#2e7d32', // hat
      c: '#c9a227', // gold hat cord
      F: '#c41e3a', // feather — Wiesn red, so it shows against the pale battle screen
      B: '#2f3e6e', // the navy shell
      b: '#1f2a4d', // shell shadow
      S: '#c9ced8', // silver frame + the big key
      s: '#8e95a3', // silver shadow
      L: '#c7f0d8', // LCD green
      l: '#43523d', // LCD pixels: the snake
      P: '#a8651e', // the Brezn it is after
      K: '#e9ecf2', // keypad keys
      k: '#a8afbd', // key shadow
    },
    // 23 rows, like Jensen — any taller and the phone's keypad disappears behind
    // the WIESNHELD box on the battle screen.
    art: [
      '...........F......',
      '.....HHHHHFF......',
      '....HHHHHHHF......',
      '....cccccccc......',
      '..HHHHHHHHHHHH....',
      '....BBBBBBBBBB....',
      '...BBBBBBBBBBBB...',
      '...BSSSSSSSSSSB...',
      '...BSLLLLLLLLSB...',
      '...BSLlllLLLLSB...',
      '...BSLLLlLLPLSB...',
      '...BSLLLlllLLSB...',
      '...BSLLLLLLLLSB...',
      '...BSSSSSSSSSSB...',
      '...BBBBSSSSBBBB...',
      '...BKKBssssBKKB...',
      '...BBBBBBBBBBBB...',
      '...BKKkBKKkBKKB...',
      '...BBBBBBBBBBBB...',
      '...BKKkBKKkBKKB...',
      '...BBBBBBBBBBBB...',
      '...bKKkBKKkBKKb...',
      '....bbbbbbbbbb....',
    ],
  },

  run: function (tent, done) {
    const S = CONFIG.SNAKE;
    const SHOW = 'nokia';   // dress every popup — see ochsenbraterei.css
    const STEPS = 5;        // RULES, KEYS, MENU, SNAKE, PROST

    // Team names are typed by the guests on the intro screen and end up inside
    // HTML below, so a name like "A<B" must not be read as a tag.
    function safe(text) {
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // A team's name as a chip in its own team color (same colors as the
    // scoreboard — and the same color as that team's snake).
    function teamChip(i) {
      return '<span class="snake-team" style="background:' + CONFIG.TEAMS.COLORS[i] + '">'
        + safe(state.teams[i].name) + '</span>';
    }

    // Four keyboard keys drawn as keycaps, e.g. keycaps(['W', 'A', 'S', 'D']).
    function keycaps(labels) {
      return '<span class="snake-keys">' + labels.map(function (label) {
        return '<kbd>' + label + '</kbd>';
      }).join('') + '</span>';
    }

    // One popup of the flow. EVERY screen goes through here, so none of them
    // can forget `show:` and snap back to the beige box halfway through.
    // `step` lights up the row of progress dots (quizLights, js/challenges.js).
    function screen(step, title, body, confirmText, onConfirm) {
      UI.showModal({
        title: title,
        body: quizLights(step, STEPS) + body,
        confirmText: confirmText,
        colors: tent.colors,
        show: SHOW,
        onConfirm: onConfirm,
      });
    }

    // ---- 1. RULES ---------------------------------------------------------------

    function showRules() {
      screen(0, 'RULES',
        '<p class="snake-lead"><b>One champion</b> per team, both on the <b>same keyboard</b>. '
        + 'Crash and you lose a heart. <b>' + S.LIVES + ' hearts</b> each — last snake standing wins.</p>'
        + '<div class="snake-rules">'
        +   '<div class="snake-col snake-do"><h3>DO</h3><ul>'
        +     '<li><b>CUT OFF</b> the other snake — if its head hits you, it loses a heart</li>'
        +     '<li>Eat <b>BREZN</b> for points (you grow!)</li>'
        +     '<li>Grab the <b>MASS</b> and the <b>SCHNAPS</b></li>'
        +   '</ul></div>'
        +   '<div class="snake-col snake-dont"><h3>DON’T</h3><ul>'
        +     '<li>Hit the <b>WALL</b>, a <b>TABLE</b> or the <b>OX</b></li>'
        +     '<li>Run into a <b>KELLNERIN</b>. She carries ten Maß.</li>'
        +     '<li>Bite <b>YOURSELF</b>. It gets faster every second.</li>'
        +   '</ul></div>'
        + '</div>',
        'Weiter! [Enter]', showKeys);
    }

    // ---- 2. KEYS ----------------------------------------------------------------
    // Team 1 sits on the left of the scoreboard and gets the left of the
    // keyboard; team 2 gets the right. The pairing itself is in snake.js (KEYS).

    function showKeys() {
      screen(1, 'KEYS',
        '<p class="snake-lead">Champions to the laptop — shoulder to shoulder:</p>'
        + '<div class="snake-who">'
        +   '<div class="snake-who-row">' + teamChip(0) + '<span class="snake-arrow">➜</span>' + keycaps(['W', 'A', 'S', 'D']) + '<span>left hand side</span></div>'
        +   '<div class="snake-who-row">' + teamChip(1) + '<span class="snake-arrow">➜</span>' + keycaps(['↑', '←', '↓', '→']) + '<span>right hand side</span></div>'
        + '</div>'
        + '<p class="snake-tip">Your snake is your <b>team color</b>. Everyone else: shout directions. Wrong ones are allowed.</p>',
        'Weiter! [Enter]', showMenu);
    }

    // ---- 3. MENU ----------------------------------------------------------------
    // The Speisekarte: every thing that can lie on the floor. The little pictures
    // are the real game sprites, put in after the popup is up (see below).

    function menuRow(kind, name, what) {
      return '<div class="snake-menu-row"><span class="snake-menu-pic" data-sprite="' + kind + '"></span>'
        + '<b>' + name + '</b><span>' + what + '</span></div>';
    }

    function showMenu() {
      screen(2, 'MENU',
        '<div class="snake-menu">'
        + menuRow('brezn', 'BREZN', '+' + S.POINTS.brezn + ' point, you grow')
        + menuRow('semmel', 'OCHSENSEMMEL', '+' + S.POINTS.semmel + ' points, you grow more')
        + menuRow('mass', 'MASS', 'BIERTURBO: faster for ' + (S.TURBO_MS / 1000) + ' s')
        + menuRow('schnaps', 'SCHNAPS', 'the OTHER team steers <b>mirrored</b>, ' + (S.MIRROR_MS / 1000) + ' s')
        + menuRow('herz', 'LEBKUCHENHERZ', 'one heart back. Rare!')
        + menuRow('kellnerin', 'KELLNERIN', 'not on the menu. Do NOT touch.')
        + '</div>'
        + '<p class="snake-tip">Specials blink before they are cleared away. The ox is decoration. Hot decoration.</p>',
        'To the floor! [Enter]', startMatch);
      // showModal has put the rows on the page — now hang the sprites in them.
      SnakeDuel.makeSprites();
      document.querySelectorAll('#modal-body [data-sprite]').forEach(function (slot) {
        const kind = slot.getAttribute('data-sprite');
        slot.appendChild(Battle.spriteCanvas(SnakeDuel.ART[kind], SnakeDuel.PALETTE, 0.6));
      });
    }

    // ---- 4. SNAKE ---------------------------------------------------------------
    // The floor is ONE popup that stays up for the whole match. But Enter always
    // closes a popup (UI.confirmModal), so every Enter lands in onFloorEnter,
    // which decides what it meant and puts the floor straight back up. That
    // rebuilds the HTML — harmless, because snake.js keeps the whole match in
    // its own variables and looks the canvas up again on every frame.

    function startMatch() {
      // onOver: the match was just decided — show the floor again so the button
      // reads "Weiter!" (and Enter is ignored for 250 ms, so a stray key press
      // in the heat of the last crash cannot skip the K.O. banner).
      SnakeDuel.begin(showFloor);
      showFloor();
    }

    // One team's corner of the scoreboard above the floor.
    function hudSide(i, keys) {
      return '<div class="snake-side snake-side-' + i + '">'
        + '<div class="snake-side-row">' + teamChip(i)
        +   '<span class="snake-hearts" id="snake-hearts-' + i + '"></span>'
        +   '<span class="snake-points"><span id="snake-points-' + i + '">0</span> pts</span></div>'
        // second row: which keys, and what the snake is on right now (BIERTURBO! / SCHNAPS!)
        + '<div class="snake-side-row snake-side-small"><span class="snake-hint">' + keys + '</span>'
        +   '<span class="snake-status" id="snake-status-' + i + '"></span></div>'
        + '</div>';
    }

    function showFloor() {
      let button = 'Pause [Enter]';
      if (SnakeDuel.phase === 'ready') button = 'START [Enter]';
      if (SnakeDuel.paused) button = 'Play on! [Enter]';
      if (SnakeDuel.phase === 'over') button = 'Weiter! [Enter]';
      screen(3, 'SNAKE',
        '<div class="snake-hud">' + hudSide(0, 'W A S D') + hudSide(1, '↑ ← ↓ →') + '</div>'
        + '<div class="snake-floor">'
        +   '<canvas id="snake-canvas"></canvas>'
        +   '<div class="snake-words"><div id="snake-banner"></div><div id="snake-sub"></div></div>'
        + '</div>',
        button, onFloorEnter);
      // Paint and fill in the scoreboard NOW rather than on the next frame, so a
      // rebuilt popup never shows an empty floor for a blink.
      SnakeDuel.draw(document.getElementById('snake-canvas'));
      SnakeDuel.writeHud();
    }

    function onFloorEnter() {
      if (SnakeDuel.phase === 'over') {
        const result = SnakeDuel.result();
        SnakeDuel.stop();
        showProst(result);
        return;
      }
      if (SnakeDuel.phase === 'ready') SnakeDuel.go();
      else SnakeDuel.togglePause(); // somebody needs a refill
      showFloor();
    }

    // ---- 5. PROST ---------------------------------------------------------------
    // Enter here ends the mini-game — done(true), badge, fanfare, next team.

    function showProst(result) {
      const winner = result.winner;
      const loser = 1 - winner;
      // House rule: you always win the badge. The result only picks the Nokia's closing line.
      let verdict = 'A clean win. The Nokia saves it as the new high score. It will still be there in 2050.';
      if (result.lives[winner] === S.LIVES) verdict = 'FLAWLESS — not one heart lost. The Nokia vibrates once, respectfully.';
      if (result.lives[winner] === 1) verdict = 'Down to the very last Lebkuchenherz. The ox stopped turning to watch.';
      if (result.points[loser] > result.points[winner]) {
        verdict += ' (But ' + safe(state.teams[loser].name) + ' ate better: ' + result.points[loser] + ' points.)';
      }

      function row(i) {
        let hearts = '';
        for (let n = 0; n < S.LIVES; n++) hearts += n < result.lives[i] ? '♥' : '♡';
        return '<div class="snake-who-row' + (i === winner ? ' snake-won' : '') + '">' + teamChip(i)
          + '<span class="snake-hearts">' + hearts + '</span>'
          + '<span><b>' + result.points[i] + '</b> pts</span>'
          + (i === winner ? '<b class="snake-hot">WINNER</b>' : '') + '</div>';
      }

      screen(4, 'PROST',
        '<div class="snake-who">' + row(0) + row(1) + '</div>'
        + '<p class="snake-lead">' + verdict + '</p>'
        + '<p class="snake-tip">Loser’s champion fetches the next round.<br>'
        +   'Hosts: click the winning team (top left) to give it a point.</p>',
        'Prost! [Enter]',
        function () { done(true); }); // house rule: you always win the badge
    }

    showRules();
  },
};
