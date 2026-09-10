// challenges.js — what happens inside each tent.
//
// THE SEAM FOR REAL CHALLENGES: register one entry per tent id, e.g.
//
//   CHALLENGES.hofbraeu = {
//     run: function (tent, done) {
//       // ... your mini-game, any UI you like ...
//       done(true);   // true = badge earned, false = try again later
//     }
//   };
//
// A tent is OPEN only if it has its own key here. DEFAULT does not count —
// closed tents stay grey on the map and toast instead of awarding a badge.
// When you add a new CHALLENGES.<id>, that tent lights up automatically.

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

function tentIsOpen(tent) {
  return !!(tent && CHALLENGES[tent.id]);
}

function openTents() {
  return TENTS.filter(tentIsOpen);
}

function openBadgeCount() {
  let n = 0;
  TENTS.forEach(function (t) {
    if (tentIsOpen(t) && state.badges.has(t.id)) n++;
  });
  return n;
}

// Shared 3-question flow. Always finishes with done(true) — the quiz is a
// show for the TV, not a gate. Badge + fanfare still come from startChallenge.
function runQuiz(tent, spec, done) {
  const questions = spec.questions;
  let i = 0;
  let score = 0;

  function showIntro() {
    UI.showModal({
      title: tent.num + '. ' + tent.name,
      body: tent.greeting + '<br><br>' + spec.hook,
      confirmText: 'Weiter! [Enter]',
      colors: tent.colors,
      onConfirm: showQuestion,
    });
  }

  function showQuestion() {
    const q = questions[i];
    UI.showQuizQuestion({
      title: tent.num + '. ' + tent.name + '  ·  ' + (i + 1) + '/' + questions.length,
      body: '<p>' + q.q + '</p>',
      colors: tent.colors,
      choices: q.choices,
      onPick: function (choice) {
        const correct = choice === q.answer;
        if (correct) score++;
        UI.showModal({
          title: correct ? 'Richtig!' : 'Knapp daneben!',
          body: correct ? q.right : q.wrong,
          confirmText: 'Weiter! [Enter]',
          colors: tent.colors,
          onConfirm: function () {
            i++;
            if (i < questions.length) showQuestion();
            else showWrap();
          },
        });
      },
    });
  }

  function showWrap() {
    UI.showModal({
      title: tent.num + '. ' + tent.name,
      body: spec.wrap(score, questions.length),
      confirmText: 'Prost! [Enter]',
      colors: tent.colors,
      onConfirm: function () { done(true); },
    });
  }

  showIntro();
}

// Hofbräu stays Hofbräu — Mr. Worldwide just crashed the rowdiest tent.
CHALLENGES.hofbraeu = {
  run: function (tent, done) {
    runQuiz(tent, {
      hook: 'A shout cuts through the 10,000 seats — <b>Mr. Worldwide</b> just sat down. Three questions, then a Maß.',
      wrap: function (score, total) {
        if (score === total) return 'Dale! ' + score + '/' + total + ' — Mr. Worldwide buys the next Maß.';
        if (score === 0) return '0/' + total + ' — Hofbräu still pours you a Maß. The badge is yours anyway.';
        return score + '/' + total + ' — close enough for the benches. Prost, the badge is yours!';
      },
      questions: [
        {
          q: 'Where is Pitbull from?',
          choices: ['Miami', 'Atlanta', 'Havana'],
          answer: 0,
          right: 'Dale! Mr. 305 — Miami, Florida.',
          wrong: 'It\'s Miami — the 305. Mr. Worldwide started local.',
        },
        {
          q: 'What does he shout in almost every song?',
          choices: ['Dale!', 'O\'zapft is!', 'Timber!'],
          answer: 0,
          right: 'DALE! Even the Hofbräu benches know that one.',
          wrong: 'Dale! — the Wiesn already has O\'zapft is! covered.',
        },
        {
          q: 'His other nickname?',
          choices: ['Mr. Worldwide', 'Mr. Wiesn', 'Mr. Maß'],
          answer: 0,
          right: 'Mr. Worldwide! Tonight he\'s just another guest in Hofbräu.',
          wrong: 'Mr. Worldwide — not Mr. Wiesn, though he\'d look good in Lederhosen.',
        },
      ],
    }, done);
  },
};

// Weinzelt stays Weinzelt — wine, Champagne, and Danish listing talk.
CHALLENGES.weinzelt = {
  run: function (tent, done) {
    runQuiz(tent, {
      hook: 'No Maß in here — just Champagne and two Danes arguing over square metres. Three questions about the Danish housing market.',
      wrap: function (score, total) {
        if (score === total) return score + '/' + total + ' — the Schickeria wants your Bolignummer.';
        if (score === 0) return '0/' + total + ' — still no Maß in here, but the Weinzelt badge is yours.';
        return score + '/' + total + ' — not a licensed mægler yet. The badge is yours anyway.';
      },
      questions: [
        {
          q: 'What does <i>kontantpris</i> mean on a Danish listing?',
          choices: ['The cash asking price', 'The mortgage rate', 'A property tax'],
          answer: 0,
          right: 'Kontantpris is the cash asking price — before the bank gets involved.',
          wrong: 'Kontantpris is the cash asking price, not a rate or a tax.',
        },
        {
          q: 'An <i>andelsbolig</i> is…?',
          choices: ['A co-op apartment', 'A castle', 'A beer-garden plot'],
          answer: 0,
          right: 'An andelsbolig is a co-op: you buy a share, not the bricks.',
          wrong: 'An andelsbolig is a co-op apartment — no Schloss, no Maßgarten.',
        },
        {
          q: 'Who usually pays the <i>ejendomsmægler</i>?',
          choices: ['The seller', 'The buyer', 'The kommune'],
          answer: 0,
          right: 'The seller pays the estate agent — the buyer just brings cake to the visning.',
          wrong: 'The seller usually pays the mægler. The kommune has better things to do.',
        },
      ],
    }, done);
  },
};

// Called by game.js when the player steps onto an unvisited OPEN tent entrance.
function startChallenge(tent) {
  if (!tentIsOpen(tent)) {
    UI.toast('Noch zu! This tent\'s challenge isn\'t tapped yet.');
    return;
  }
  state.mode = 'modal';
  logEvent('Entered ' + tent.name + ' — starting challenge.');
  CHALLENGES[tent.id].run(tent, function (success) {
    if (success) {
      awardBadge(tent); // game.js: adds the badge, fanfare, win check
    } else {
      state.mode = 'walk';
      logEvent('Challenge failed at ' + tent.name + ' — try again.');
    }
  });
}
