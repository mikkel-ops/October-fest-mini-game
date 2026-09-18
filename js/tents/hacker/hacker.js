// Tent 4 — Hacker-Festzelt, the "Heaven of the Bavarians". The ceiling is one
// big painted cloud, so the tent books the man who sells the cloud its
// hardware: Jensen Huang, leather jacket over Lederhosen. His move is POEM WITH
// A GRAPHICS CARD, and it starts a REAL-WORLD duel, like Kruse's rugbrød duel
// (js/encounters/kruse.js): the TV explains the rules and runs the clock, the
// actual game happens on the teams' phones.
//
// THE GAME: both teams, at the same time, get an AI (Claude or ChatGPT) to
// write a rhyming Danish Oktoberfest poem. One team's poem must name MIKKEL,
// the other's JAKOB — the two game hosts, who are also the jury. When the
// clock hits zero an alarm rings, phones go down, and each team lets the AI
// voice on their phone read the poem aloud.
//
// Three files make this tent:
//   hacker.js    this — the host, his move, and the five screens below
//   hacker.css   the look (show: 'cloud') + the rules / clock layout
//   alarm.mp3    the time's-up alarm (generated two-tone klaxon, 4 seconds)
//
// THE FIVE SCREENS, in order. Each has a ONE-WORD title on purpose — two groups
// of people who have had a few Maß must be able to read them from the sofa:
//   RULES   DO / DON'T                          Enter → next
//   WHO     which team writes about which host  Enter → next
//   TIME    the clock, waiting at 4:00          Enter STARTS it
//           ...running...                       Enter ends it early
//   STOP    alarm rings, phones down            Enter → next
//   LISTEN  the phones read the poems aloud     Enter → the game ends, badge
//
// POINTS are NOT wired in here (see "Points are an open question" in
// CLAUDE.md). The jury scores by hand with the , and . keys or by clicking the
// team chips — hacker.css lifts the chips above these popups so that works
// while the LISTEN screen is still up.
//
// Every number (seconds on the clock, line count, host names…) is in
// CONFIG.POEM in js/config.js. Want a 3-minute round? Change SECONDS there.
//
// Registering this key is what makes tent 4 OPEN (see js/challenges.js).

CHALLENGES.hacker = {
  host: {
    name: 'JENSEN',
    level: 5090, // his flagship graphics card
    appear: 'A wild JENSEN HUANG appeared!',
    text: 'Leather jacket over Lederhosen. He climbed down from the painted clouds — "THE cloud", he insists — holding something green.',
    // His attack IS the game: battle.js types "JENSEN used POEM WITH A GRAPHICS
    // CARD!", he lunges, your fake HP drops, and Enter opens the RULES screen.
    foeAttack: {
      name: 'POEM WITH A GRAPHICS CARD',
      result: 'The fans spin up. Both teams, phones out — tonight the AI writes the poetry. The more you buy, the more you rhyme!',
    },
    // PLACEHOLDER sprite, to be swapped for a real cutout photo later (then set
    // `image:` like Hofbräu does and delete art + palette). What makes him read
    // as Jensen: silver hair, square black glasses, the black leather jacket,
    // and a green graphics card with a fan held out in his hand.
    palette: {
      S: '#d8d8de', // silver hair
      s: '#a9a9b4', // hair shadow
      N: '#e8b98a', // skin
      n: '#c68642', // skin shadow
      g: '#1a1a1a', // glasses frame
      o: '#cfe3f0', // lens glint
      e: '#2b2b2b', // eyes
      M: '#8a6a4a', // mouth line
      J: '#1c1c1f', // leather jacket
      j: '#4a4a52', // leather sheen + lapel edge
      w: '#3a3a3f', // black T-shirt (a shade off the jacket so the collar reads)
      B: '#6b4423', // lederhosen
      D: '#3d2817', // leder dark
      K: '#f4efe2', // socks
      E: '#1a1a1a', // shoes
      G: '#76b900', // graphics card — THAT green
      F: '#222222', // fan
      f: '#9a9a9a', // fan hub
      X: '#c9a227', // gold connector pins
    },
    // 22 wide instead of Caesar's 18: the card sticks out past his right hand.
    art: [
      '......SSSSSS..........',
      '....SSSSSSSSSS........',
      '...SSSsSSSSsSSS.......',
      '...SSNNNNNNNNSS.......',
      '...SNNNNNNNNNNS.......',
      '...NggggggggggN.......',
      '...NgeogNNgoegN.......',
      '...NggggNNggggN.......',
      '....NNNNNNNNNN........',
      '....NNNNMMNNNN........',
      '.....nNNNNNNn.........',
      '.......NNNN...........',
      '....JJJjwwjJJJ........',
      '...JJJJjwwjJJJJ.......',
      '..JJJJJJjjJJJJJJGGGGGG',
      '..JJjJJJwwJJJjJJGFFFFG',
      '..JJjJJJwwJJJjJNGFffFG',
      '..NN.JJJwwJJJ..NGFFFFG',
      '.....BBBBBBBB...GGGGGG',
      '.....BBDDDDBB....XXXX.',
      '.....BBB..BBB.........',
      '.....KKK..KKK.........',
      '.....EEE..EEE.........',
    ],
  },

  run: function (tent, done) {
    const P = CONFIG.POEM;
    const SHOW = 'cloud';                       // dress every popup — see hacker.css
    const ALARM_FILE = 'js/tents/hacker/alarm.mp3';
    const STEPS = 5;                            // RULES, WHO, TIME, STOP, LISTEN

    // Who writes about whom is fixed at the door: the team whose turn it is
    // gets the first host (MIKKEL), the other team the second (JAKOB).
    const first = state.activeTeam;
    const second = 1 - first;

    // Team names are typed by the guests on the intro screen and end up inside
    // HTML below, so a name like "A<B" must not be read as a tag.
    function safe(text) {
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // A team's name as a chip in its own team color (same colors as the scoreboard).
    function teamChip(i) {
      return '<span class="poem-team" style="background:' + CONFIG.TEAMS.COLORS[i] + '">'
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
        '<p class="poem-lead">Both teams play <b>at the same time</b>, each on their own phone.</p>'
        + '<div class="poem-rules">'
        +   '<div class="poem-col poem-do"><h3>DO</h3><ul>'
        +     '<li>Make an AI write a poem about <b>OKTOBERFEST</b></li>'
        +     '<li>In <b>DANISH</b> — på dansk!</li>'
        +     '<li><b>' + P.MIN_LINES + '–' + P.MAX_LINES + ' lines</b>, and it must <b>RHYME</b></li>'
        +     '<li>Use <b>CLAUDE</b> or <b>CHATGPT</b></li>'
        +   '</ul></div>'
        +   '<div class="poem-col poem-dont"><h3>DON’T</h3><ul>'
        +     '<li>Use any other AI</li>'
        +     '<li>Keep writing after the <b>ALARM</b></li>'
        +     '<li>Read it aloud yourself — the <b>AI voice</b> reads</li>'
        +     '<li>Forget your <b>HOST</b> (next screen)</li>'
        +   '</ul></div>'
        + '</div>',
        'Weiter! [Enter]', showWho);
    }

    // ---- 2. WHO -----------------------------------------------------------------

    function showWho() {
      screen(1, 'WHO',
        '<p class="poem-lead">Your poem must be about your game host:</p>'
        + '<div class="poem-who">'
        +   '<div class="poem-who-row">' + teamChip(first) + '<span class="poem-arrow">➜</span><b class="poem-host">' + P.HOSTS[0] + '</b></div>'
        +   '<div class="poem-who-row">' + teamChip(second) + '<span class="poem-arrow">➜</span><b class="poem-host">' + P.HOSTS[1] + '</b></div>'
        + '</div>'
        + '<p class="poem-tip">TIP: feed the AI <b>real facts</b> about him. That is where the jokes are.</p>',
        'Weiter! [Enter]', showReady);
    }

    // ---- 3. TIME ----------------------------------------------------------------
    // The clock is computed from a fixed DEADLINE, never by counting ticks — a
    // browser tab in the background slows its timers down, and a clock that
    // counts ticks would then run slow. This one just jumps to the right time.

    let timer = null;     // the setInterval id while the clock runs
    let startedAt = 0;    // performance.now() when Enter started the clock
    let deadline = 0;     // performance.now() at which time is up
    let lastBeep = -1;    // the last second we ticked for, so each second beeps once
    let alarm = null;     // the <audio> element for alarm.mp3

    function clockText(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function secondsLeft() {
      return Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // The clock, waiting. Nothing runs until the host presses Enter.
    function showReady() {
      screen(2, 'TIME',
        '<div id="poem-clock" class="poem-clock">' + clockText(P.SECONDS) + '</div>'
        + '<p class="poem-lead">Phones out! Open <b>Claude</b> or <b>ChatGPT</b>.<br>Fertig…?</p>',
        'START the clock [Enter]', startClock);
    }

    function startClock() {
      startedAt = performance.now();
      deadline = startedAt + P.SECONDS * 1000;
      lastBeep = -1;
      // Make the alarm NOW so the mp3 is loaded long before zero. A plain
      // <audio> element plays a local file fine on file:// — no fetch().
      try {
        alarm = new Audio(ALARM_FILE);
        alarm.preload = 'auto';
        alarm.volume = P.ALARM_VOLUME;
      } catch (e) { alarm = null; }
      UI.beep([523, 659, 784, 1047], 0.09); // los!
      showRunning();
    }

    // The clock, running. Enter ends the round early (both teams done).
    function showRunning() {
      screen(2, 'TIME',
        '<div id="poem-clock" class="poem-clock">' + clockText(secondsLeft()) + '</div>'
        + '<p class="poem-lead">' + teamChip(first) + ' ➜ <b>' + P.HOSTS[0] + '</b> &nbsp;·&nbsp; '
        +   teamChip(second) + ' ➜ <b>' + P.HOSTS[1] + '</b></p>'
        + '<p class="poem-tip">Oktoberfest · på dansk · ' + P.MIN_LINES + '–' + P.MAX_LINES + ' lines · it must rhyme</p>',
        'Both done? End early [Enter]',
        function () {
          stopTimer();
          // Stray Enter: popups only ignore Enter for 250 ms, so a double-tap on
          // START would end the round at 3:59. For the first few seconds Enter
          // just puts the clock back up instead.
          if (performance.now() - startedAt < P.EARLY_END_GUARD_MS) { showRunning(); return; }
          showStop(false);
        });
      stopTimer();
      timer = setInterval(tick, 200); // 5× a second, so the digits never visibly lag
      tick();
    }

    function tick() {
      const clock = document.getElementById('poem-clock');
      // game.reset() mid-round closes the popup (UI.hideOverlays). The clock
      // then stops ITSELF here, so no timer is left running and no "STOP"
      // screen can pop up over the intro.
      if (!clock || document.getElementById('modal').hidden) { stopTimer(); return; }
      const left = secondsLeft();
      clock.textContent = clockText(left);
      clock.classList.toggle('low', left <= P.LOW_TIME_S);
      if (left > 0 && left <= P.TICK_LAST_S && left !== lastBeep) {
        lastBeep = left;
        UI.beep([880], 0.1); // one tick per second for the final stretch
      }
      if (left === 0) { stopTimer(); showStop(true); }
    }

    // ---- 4. STOP ----------------------------------------------------------------

    function ringAlarm() {
      // Same house rule as UI.beep: no sound is never a reason to stop the party.
      // If the mp3 is missing or blocked, fall back to a generated buzzer.
      const buzzer = function () { UI.beep([233, 175, 233, 175, 233, 175], 0.22, 'sawtooth'); };
      try {
        alarm.currentTime = 0;
        const started = alarm.play();
        if (started && started.catch) started.catch(buzzer);
      } catch (e) { buzzer(); }
    }

    function silenceAlarm() {
      try { if (alarm) alarm.pause(); } catch (e) { /* it was not playing */ }
    }

    // byClock: true = the clock ran out (ring the alarm), false = ended early.
    function showStop(byClock) {
      // The battle music has been playing since Jensen appeared (fine while
      // people type). From here on the room must be QUIET: the alarm rings
      // alone, and then the phones read the poems. Nothing restarts the music
      // until the player is back on the field (Music.followMode, js/music.js).
      Music.stop();
      if (byClock) ringAlarm();
      else UI.beep([784, 523], 0.15);
      screen(3, 'STOP',
        '<div class="poem-stop">PHONES DOWN!</div>'
        + '<p class="poem-lead">' + (byClock ? 'Time is up. ' : 'Both teams are done. ')
        +   'Whatever is on the screen <b>is</b> your poem.</p>',
        'Weiter! [Enter]',
        function () {
          silenceAlarm(); // it must not ring over the first poem
          showListen();
        });
    }

    // ---- 5. LISTEN --------------------------------------------------------------
    // A waiting screen: the game does nothing while the phones do the reading.
    // Enter here ends the mini-game — done(true), badge, fanfare, next team.

    function showListen() {
      screen(4, 'LISTEN',
        '<p class="poem-lead">The <b>AI voice</b> on your phone reads the poem. No humans!</p>'
        + '<div class="poem-who">'
        +   '<div class="poem-who-row"><span class="poem-num">1</span>' + teamChip(first) + 'plays the<b class="poem-host">' + P.HOSTS[0] + '</b> poem</div>'
        +   '<div class="poem-who-row"><span class="poem-num">2</span>' + teamChip(second) + 'plays the<b class="poem-host">' + P.HOSTS[1] + '</b> poem</div>'
        + '</div>'
        + '<p class="poem-tip">JURY: ' + P.HOSTS[0] + ' + ' + P.HOSTS[1] + ' &nbsp;·&nbsp; '
        +   '<b>Creativity · Fun · Rhyme</b> — one point each.<br>'
        +   'Hosts: click a team (top left) to give it a point.</p>',
        'Both poems heard — Prost! [Enter]',
        function () { done(true); }); // house rule: you always win the badge
    }

    showRules();
  },
};
