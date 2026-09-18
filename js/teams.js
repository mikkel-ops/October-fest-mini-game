// teams.js — the two-team party mode: the intro screen, whose turn it is,
// the turn banners, and the scoreboard in the top-left corner.
//
// The RULES live here; the DATA lives on the shared `state` object in
// js/game.js (`state.teams`, `state.activeTeam`) like everything else, so you
// can inspect it in the console via `game.state`.
//
// What a "turn" is:
//   - Conquering a tent ends your turn (the badge fanfare hands over).
//   - Losing a street encounter ends it early — see js/encounters.js.
//   - Winning a FIGHT (or a real-world duel) lets the same team walk on.
// Only `Teams.handoff` ever flips the turn — if turns behave wrong, look there.
//
// POINTS ARE STILL AN OPEN QUESTION. Mikkel hasn't fixed the scoring rules
// yet, and some games are played away from the screen (rugbrød duels...), so
// today points are awarded BY THE HOST at the laptop: `,` = team 1, `.` =
// team 2, Shift subtracts (wired in js/game.js), clicking a team's chip in
// the scoreboard (left = add, right or Ctrl = subtract, wired at the bottom
// of this file), or game.points(0, 3) in the console. When the rules are
// decided, wire them into `Teams.addPoints` — e.g. call it from a tent's
// wrap line with the quiz score. That's the seam.

const Teams = {

  // ---- who's who -------------------------------------------------------------

  active: function () { return state.teams[state.activeTeam]; },
  other: function () { return state.teams[1 - state.activeTeam]; },

  setActive: function (i) {
    state.activeTeam = i;
    Teams.refreshScoreboard();
  },

  // ---- points (the open seam — see the header comment) -----------------------

  addPoints: function (i, n) {
    const team = state.teams[i];
    team.score = Math.max(0, team.score + n); // no negative scores at a party
    Teams.refreshScoreboard();
    UI.toast((n >= 0 ? '+' + n : n) + ' → ' + team.name + ': ' + team.score);
  },

  // ---- turn flow -------------------------------------------------------------

  // Big banner announcing the CURRENT team's turn. Enter dismisses it; then
  // `onDone` runs (default: back to walking). The 250 ms Enter-mash guard
  // comes free with UI.showModal.
  announceTurn: function (onDone) {
    state.mode = 'modal';
    const team = Teams.active();
    UI.showModal({
      title: team.name + ' — Weiter!',
      body: 'Grab the keyboard — <b>' + team.name + '</b> steers the Wiesnheld now.',
      confirmText: "Auf geht's! [Enter]",
      colors: [CONFIG.TEAMS.COLORS[state.activeTeam], '#ffffff'],
      onConfirm: onDone || function () { state.mode = 'walk'; },
    });
  },

  // Flip to the other team and announce it. THE only place the turn changes
  // hands (Kruse's duel picks a winner with setActive + announceTurn instead).
  handoff: function (onDone) {
    Teams.setActive(1 - state.activeTeam);
    Teams.announceTurn(onDone);
  },

  // ---- intro screen ----------------------------------------------------------

  // Shown at boot and after every game.reset(). Typing goes straight into the
  // two inputs — js/game.js routes only Enter while mode is 'intro'.
  showIntro: function () {
    state.mode = 'intro';
    document.getElementById('teambar').hidden = true;
    // prefill with the current names so "play again" keeps what was typed
    document.getElementById('intro-name-1').value = state.teams[0].name;
    document.getElementById('intro-name-2').value = state.teams[1].name;
    document.getElementById('intro').hidden = false;
    document.getElementById('intro-name-1').focus();
  },

  // Enter on the intro: store the names and hand the keyboard to team 1.
  confirmIntro: function () {
    const in1 = document.getElementById('intro-name-1');
    const in2 = document.getElementById('intro-name-2');
    // an emptied field falls back to the previous name — never a nameless team
    if (in1.value.trim()) state.teams[0].name = in1.value.trim().toUpperCase();
    if (in2.value.trim()) state.teams[1].name = in2.value.trim().toUpperCase();
    in1.blur();
    in2.blur();
    document.getElementById('intro').hidden = true;
    document.getElementById('teambar').hidden = false;
    Teams.refreshScoreboard();
    // This Enter press is the first key press of the session — the moment the
    // browser starts allowing sound — so the walking tune starts here.
    Music.play('overworld');
    Teams.announceTurn(); // team 1 (or whoever is active) starts
  },

  // ---- scoreboard ------------------------------------------------------------

  refreshScoreboard: function () {
    state.teams.forEach(function (team, i) {
      const chip = document.getElementById('team-chip-' + i);
      const isActive = i === state.activeTeam;
      chip.textContent = (isActive ? '▶ ' : '') + team.name + ' · ' + team.score;
      chip.classList.toggle('active', isActive);
      chip.style.background = CONFIG.TEAMS.COLORS[i];
    });
  },
};

// ---- click-to-score ----------------------------------------------------------
// The host can also score with the mouse: LEFT-click a team's chip = +1 point,
// RIGHT-click (or Ctrl-click, for one-button trackpads) = -1. Same step as the
// , / . keys in js/game.js. Wired once here at load — the chips are static HTML,
// but `state` only exists once js/game.js has run, so the handlers must touch
// it only when actually clicked (addPoints does; nothing here reads it now).
[0, 1].forEach(function (i) {
  const chip = document.getElementById('team-chip-' + i);
  chip.addEventListener('click', function (e) {
    // On Windows/Linux a Ctrl-click arrives as a normal click with ctrlKey set;
    // on a Mac the browser turns it into the 'contextmenu' event handled below.
    const step = CONFIG.TEAMS.HOST_POINT_STEP;
    Teams.addPoints(i, e.ctrlKey ? -step : step);
  });
  chip.addEventListener('contextmenu', function (e) {
    e.preventDefault(); // no browser right-click menu over the game
    Teams.addPoints(i, -CONFIG.TEAMS.HOST_POINT_STEP);
  });
});
