// Kruse — sent an American girl home with a rugbrødmad.
// He attacks you with that same move; there is no FIGHT menu. Instead, his
// scene ends in a REAL duel at the table (see `run` below).

const kruse = {
  id: 'kruse',
  name: 'KRUSE',
  level: 14,
  maxAppearances: 1,
  image: 'js/encounters/Kruse.png',
  appear: 'A wild KRUSE appeared!',
  foeAttack: {
    name: 'RUGBRØDMAD',
    result: 'He sends the lady out the door with leverpostejmad. You eat. Then you drink.',
  },
};

// The rugbrød duel: both teams leave the keyboard and smøre rugbrødsmadder for
// real (the gear is at the party) — first team to finish 3 takes the turn.
// `run` fires after the battle scene; an encounter with `run` decides the turn
// itself (js/encounters.js), so the host picks the winner on screen here.
kruse.run = function (state, finish) {
  UI.showModal({
    title: 'RUGBRØD DUEL! 🥪',
    body: 'Kruse demands a smørre-off!<br>Both teams to the rugbrød station — '
        + '<b>first team to smøre 3 rugbrødsmadder</b> takes the turn. Fertig… los!',
    confirmText: 'The duel is decided [Enter]',
    onConfirm: function () {
      UI.showQuizQuestion({
        title: 'Who won the duel?',
        choices: [state.teams[0].name, state.teams[1].name],
        onPick: function (i) {
          Teams.setActive(i);          // the winner takes the turn…
          Teams.announceTurn(finish);  // …and the usual banner says so
        },
      });
    },
  });
};

ENCOUNTERS.push(kruse);
