// Tent 7 — Paulaner Festzelt, the one with the giant rotating Maß on its tower.
// So the tent with a beer mug for a roof books the woman from the après-ski
// anthem: MAMA LAUDA, mother of Niki. Her move is MASSKRUGSTEMMEN — a real
// Bavarian sport — and it starts a REAL-WORLD duel, like Jensen's poem duel
// next door (js/tents/hacker/hacker.js): the TV explains the rules and runs the
// clock, the actual game happens in the room, with two very full beer mugs.
//
// THE GAME: each team sends ONE champion. Both hold a full 1-litre Maß straight
// out in front of them, at the same time. Whoever's arm gives up last, wins.
// The clock on the TV counts UP: Enter starts it, and Enter stops it again once
// BOTH champions are out — so the time on the screen is the winner's time.
//
// Four files make this tent:
//   paulaner.js     this — the host, her move, and the five screens below
//   paulaner.css    the look (show: 'lauda') + the rules / clock layout
//   mama_lauda.jpg  the photo: battle sprite AND the figure next to the popups
//   mama-lauda.mp3  her song. NOT IN THE REPO (see .gitignore): it is a
//                   commercial recording and this repo is public. Copy it into
//                   this folder on the party laptop. Without it the tent plays
//                   the normal battle music — nothing breaks (js/music.js).
//
// THE FIVE SCREENS, in order. One-word titles, same reason as Hacker — they
// must be readable from the sofa after a few Maß:
//   RULES     DO / DON'T                          Enter → next
//   CHAMPION  each team sends one to the front    Enter → next
//   READY     the clock, waiting at 0:00.0        Enter → 3… 2… 1… and it runs
//   HOLD      the clock counts up, Mama heckles   Enter → stops it (both are out)
//   PROST     the final time                      Enter → the game ends, badge
//
// POINTS are NOT wired in here (see "Points are an open question" in
// CLAUDE.md). The room saw whose arm dropped last; the hosts give the points
// by hand with the , and . keys or by clicking the team chips — paulaner.css
// lifts the chips above these popups so that works while PROST is still up.
//
// Every number (countdown, heckle times, when the clock turns red…) is in
// CONFIG.STEMMEN in js/config.js. Mama's heckles are there too.
//
// Registering this key is what makes tent 7 OPEN (see js/challenges.js).

CHALLENGES.paulaner = {
  host: {
    name: 'MAMA LAUDA',
    level: 1, // the battle screen prints ":L1" — which is exactly what she is holding: 1 L
    appear: 'A wild MAMA LAUDA appeared!',
    text: 'The whole tent is on the benches, shouting one question: what IS the name of Niki Lauda’s mother? She answers with a full Maß in each hand.',
    // Her attack IS the game: battle.js types "MAMA LAUDA used MASSKRUGSTEMMEN!",
    // she lunges, your fake HP drops, and Enter opens the RULES screen.
    foeAttack: {
      name: 'MASSKRUGSTEMMEN',
      result: 'She slams two full Maß on the table. One champion per team, arm straight out. Nobody out-holds a mother who carried three world championships home!',
    },
    image: 'js/tents/paulaner/mama_lauda.jpg',
    // Her own song instead of the battle playlist (the `music` seam in
    // js/music.js). It loops until the player is back on the field.
    music: 'js/tents/paulaner/mama-lauda.mp3',
  },

  run: function (tent, done) {
    const S = CONFIG.STEMMEN;
    const SHOW = 'lauda';   // dress every popup — see paulaner.css
    const STEPS = 5;        // RULES, CHAMPION, READY, HOLD, PROST

    // Team names are typed by the guests on the intro screen and end up inside
    // HTML below, so a name like "A<B" must not be read as a tag.
    function safe(text) {
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // A team's name as a chip in its own team color (same colors as the scoreboard).
    function teamChip(i) {
      return '<span class="stemmen-team" style="background:' + CONFIG.TEAMS.COLORS[i] + '">'
        + safe(state.teams[i].name) + '</span>';
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
        '<p class="stemmen-lead"><b>One champion</b> per team. Both hold <b>at the same time</b>. Last arm standing wins.</p>'
        + '<div class="stemmen-rules">'
        +   '<div class="stemmen-col stemmen-do"><h3>DO</h3><ul>'
        +     '<li>Take a <b>FULL 1-litre Maß</b></li>'
        +     '<li>Hold it by the <b>HANDLE</b>, one hand</li>'
        +     '<li>Arm <b>STRAIGHT</b> out in front of you</li>'
        +     '<li>At <b>SHOULDER</b> height, all the way</li>'
        +   '</ul></div>'
        +   '<div class="stemmen-col stemmen-dont"><h3>DON’T</h3><ul>'
        +     '<li><b>Bend</b> the elbow</li>'
        +     '<li><b>Spill</b> — not one drop</li>'
        +     '<li>Prop the arm up, lean, or <b>switch hands</b></li>'
        +     '<li><b>Drink</b> from it. Yet.</li>'
        +   '</ul></div>'
        + '</div>',
        'Weiter! [Enter]', showChampion);
    }

    // ---- 2. CHAMPION ------------------------------------------------------------

    function showChampion() {
      screen(1, 'CHAMPION',
        '<p class="stemmen-lead">Every team picks its strongest arm:</p>'
        + '<div class="stemmen-who">'
        +   '<div class="stemmen-who-row">' + teamChip(0) + '<span class="stemmen-arrow">➜</span>send <b class="stemmen-hot">ONE champion</b> to the front</div>'
        +   '<div class="stemmen-who-row">' + teamChip(1) + '<span class="stemmen-arrow">➜</span>send <b class="stemmen-hot">ONE champion</b> to the front</div>'
        + '</div>'
        + '<p class="stemmen-tip">Hosts: fill both Maß to the line. Same beer, same glass, no excuses.</p>',
        'Weiter! [Enter]', showReady);
    }

    // ---- 3. READY + 4. HOLD -----------------------------------------------------
    // The clock is computed from the moment it STARTED (performance.now()), never
    // by counting ticks — a browser tab in the background slows its timers down,
    // and a clock that counts ticks would then run slow. This one just jumps to
    // the right time. Same idea as the deadline clock in the Hacker tent.
    //
    // The 3-2-1 is not a separate screen: Enter on READY sets the start moment
    // COUNTDOWN_S seconds into the FUTURE. While "now" is still before it, the
    // clock shows 3… 2… 1…; after it, it shows the time held. One tick function.

    let timer = null;     // the setInterval id while the clock runs
    let startedAt = 0;    // performance.now() at which the clock reads 0:00.0
    let lastCount = -1;   // the last countdown number we beeped for, so each beeps once
    let going = false;    // false during 3-2-1, true once the clock counts up

    // 83.4 seconds → "1:23.4". Tenths, because two tired arms can drop close together.
    function clockText(ms) {
      const tenths = Math.floor(Math.max(0, ms) / 100);
      const m = Math.floor(tenths / 600);
      const s = Math.floor(tenths / 10) % 60;
      return m + ':' + (s < 10 ? '0' : '') + s + '.' + (tenths % 10);
    }

    // Mama's line for this many seconds: the last heckle whose time has come.
    function heckleFor(seconds) {
      let line = '';
      S.HECKLES.forEach(function (h) { if (seconds >= h.at) line = h.line; });
      return line;
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // The clock, waiting. Nothing runs until the host presses Enter.
    function showReady() {
      screen(2, 'READY',
        '<div class="stemmen-clock">' + clockText(0) + '</div>'
        + '<p class="stemmen-lead">Champions: Maß in hand, arm <b>down</b>.<br>You lift on <b>LOS!</b> — Fertig…?</p>',
        'START [Enter]', startClock);
    }

    function startClock() {
      startedAt = performance.now() + S.COUNTDOWN_S * 1000;
      lastCount = -1;
      going = false;
      showHold();
    }

    // The clock, running (or still counting 3-2-1). Enter stops it.
    function showHold() {
      screen(3, 'HOLD',
        '<div id="stemmen-clock" class="stemmen-clock"></div>'
        + '<p id="stemmen-heckle" class="stemmen-heckle"></p>'
        + '<p class="stemmen-tip">' + teamChip(0) + ' vs ' + teamChip(1)
        +   ' &nbsp;·&nbsp; straight arm · shoulder height · no spilling</p>',
        'BOTH arms down? STOP [Enter]',
        function () {
          stopTimer();
          const held = performance.now() - startedAt;
          // Stray Enter: popups only ignore Enter for 250 ms, so a double-tap on
          // START would stop the clock during the 3-2-1. Until the clock has run
          // for a few seconds, Enter just puts the clock back up instead.
          if (held < S.END_GUARD_MS) { showHold(); return; }
          showProst(held);
        });
      stopTimer();
      timer = setInterval(tick, 50); // 20× a second, so the tenths roll smoothly
      tick();
    }

    function tick() {
      const clock = document.getElementById('stemmen-clock');
      // game.reset() mid-round closes the popup (UI.hideOverlays). The clock
      // then stops ITSELF here, so no timer is left running behind the intro.
      if (!clock || document.getElementById('modal').hidden) { stopTimer(); return; }
      const held = performance.now() - startedAt;
      const heckle = document.getElementById('stemmen-heckle');

      // Still before the start moment: show 3… 2… 1… with a beep per number.
      if (held < 0) {
        const count = Math.ceil(-held / 1000);
        clock.textContent = count;
        clock.className = 'stemmen-clock count';
        heckle.textContent = 'Arms down… wait for it…';
        if (count !== lastCount) { lastCount = count; UI.beep([523], 0.12); }
        return;
      }

      // The moment the clock starts: the LOS! jingle, once.
      if (!going) {
        going = true;
        UI.beep([523, 659, 784, 1047], 0.09);
      }
      const seconds = Math.floor(held / 1000);
      clock.textContent = clockText(held);
      // the longer they hold, the hotter the clock: yellow → orange → red
      clock.className = 'stemmen-clock'
        + (seconds >= S.HOT_S ? ' hot' : (seconds >= S.WARM_S ? ' warm' : ''));
      // Before "LOS!" has left the screen, say LOS!; after that Mama takes over.
      heckle.textContent = seconds < 2 ? 'LOS! STEMMEN!' : heckleFor(seconds);
    }

    // ---- 5. PROST ---------------------------------------------------------------
    // Enter here ends the mini-game — done(true), badge, fanfare, next team.
    // The song keeps playing on purpose (unlike Hacker's quiet room): it stops
    // by itself once the player is back on the field (Music.followMode).

    function showProst(heldMs) {
      const seconds = heldMs / 1000;
      // House rule: you always win. The time only picks Mama's closing line.
      let verdict = 'Mama nods. A solid arm. Niki would have held the door for you.';
      if (seconds < S.WEAK_S) verdict = 'That was it?! Mama has held a Maß longer while changing a tyre.';
      if (seconds >= S.LEGEND_S) verdict = 'LEGEND. Mama takes off her cap. From today you may call her Mama.';
      UI.beep([523, 659, 784, 1047, 784, 1047], 0.12);
      screen(4, 'PROST',
        '<p class="stemmen-lead">The last arm held for</p>'
        + '<div class="stemmen-clock final">' + clockText(heldMs) + '</div>'
        + '<p class="stemmen-lead">' + verdict + '</p>'
        + '<p class="stemmen-tip">Now you may drink it. <b>Both</b> of you.<br>'
        +   'Hosts: click the winning team (top left) to give it a point.</p>',
        'Prost! [Enter]',
        function () { done(true); }); // house rule: you always win the badge
    }

    showRules();
  },
};
