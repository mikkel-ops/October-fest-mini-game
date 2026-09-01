// challenges.js — what happens inside each tent.
//
// THE SEAM FOR REAL CHALLENGES LATER: register one entry per tent id, e.g.
//
//   CHALLENGES.hofbraeu = {
//     run: function (tent, done) {
//       // ... your mini-game, any UI you like ...
//       done(true);   // true = badge earned, false = try again later
//     }
//   };
//
// Tents without their own entry get DEFAULT below (a modal that awards
// the badge instantly — the v1 placeholder). Nothing else needs changing.

const CHALLENGES = {
  DEFAULT: {
    run: function (tent, done) {
      UI.showModal({
        title: tent.num + '. ' + tent.name,
        body: tent.greeting + '<br><br>You raise your Maß with the locals...',
        confirmText: 'Prost! 🍻 [Enter]',
        colors: tent.colors,
        onConfirm: function () { done(true); },
      });
    },
  },
};

// Called by game.js when the player steps onto an unvisited tent entrance.
function startChallenge(tent) {
  state.mode = 'modal';
  logEvent('Entered ' + tent.name + ' — starting challenge.');
  const challenge = CHALLENGES[tent.id] || CHALLENGES.DEFAULT;
  challenge.run(tent, function (success) {
    if (success) {
      awardBadge(tent); // game.js: adds the badge, fanfare, win check
    } else {
      state.mode = 'walk';
      logEvent('Challenge failed at ' + tent.name + ' — try again.');
    }
  });
}
