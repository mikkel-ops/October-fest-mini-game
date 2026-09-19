// challenges.js — the machinery for "what happens inside a tent". This file
// owns the registry and the shared flows; it does NOT own any single tent.
//
// WHAT HAPPENS IN EACH TENT lives in js/tents/<id>/ — one subfolder per tent
// that has something going on (js/tents/hofbraeu/, js/tents/weinzelt/, …),
// exactly like js/encounters/ holds one file per street encounter. Each tent
// folder has a <id>.js that registers itself:
//
//   CHALLENGES.hofbraeu = {
//     host: { name, level, appear, text, art, palette }, // optional battle intro
//     run: function (tent, done) {
//       // ... your mini-game, any UI you like ...
//       done(true);   // true = badge earned, false = try again later
//     }
//   };
//
// To open a new tent: make js/tents/<id>/, put <id>.js in it, add its <script>
// tag to index.html. See js/tents/README.md. (Tent NAMES, colors and logos
// stay in js/tents.js — that table is the map data, this is the behaviour.)
//
// A tent is OPEN only if it has its own key in CHALLENGES. DEFAULT does not
// count — closed tents stay grey on the map and toast instead of awarding a
// badge. Register CHALLENGES.<id> and that tent lights up automatically.
//
// host (optional) uses the same battle screen as street encounters, but it is
// booked: this tent always summons this guest. Do NOT push hosts into
// ENCOUNTERS — they must not roll on the grass.

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

// Already conquered — its badge is in the tray. A done tent is painted like a
// closed one (grey stripes, grey chip) so a glance at the map answers the only
// question a guest actually has: which tents are left?
function tentIsDone(tent) {
  return !!(tent && state.badges.has(tent.id));
}

// The tents still worth walking into: open, and not yet won.
function tentIsAvailable(tent) {
  return tentIsOpen(tent) && !tentIsDone(tent);
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

// A themed quiz gets a row of round game-show lights instead of a plain "1/3":
// filled = already answered, lit = the question on screen right now.
// Styling is in the tent's own css file; plain quizzes never call this.
function quizLights(i, total) {
  let html = '<div class="quiz-lights">';
  for (let n = 0; n < total; n++) {
    html += '<span class="quiz-light' + (n < i ? ' done' : (n === i ? ' live' : '')) + '"></span>';
  }
  return html + '</div>';
}

// Shared multiple-choice quiz flow. Takes any number of questions (Hofbräu and
// Weinzelt run three, Käfer five) and always finishes with done(true) — the
// quiz is a show for the TV, not a gate. Badge + fanfare come from startChallenge.
//
// spec fields:
//   questions   — [{ q, choices, answer, right, wrong }]
//   wrap(score, total) — the closing line
//   hook        — intro text (skipped when skipIntro is set)
//   skipIntro   — the battle host already said the hook — jump to question 1
//   show        — optional theme name, e.g. 'worldwide' (see UI.setShow).
//                 Every popup below has to pass it, or the screen snaps back to
//                 the plain beige box halfway through the quiz.
//   showTitle   — title bar text for a themed quiz (default: the tent name)
//   rightTitle / wrongTitle — override 'Richtig!' / 'Knapp daneben!'
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
      show: spec.show,
      onConfirm: showQuestion,
    });
  }

  function showQuestion() {
    const q = questions[i];
    // A themed quiz shows its progress as the round lights, so the title stays
    // clean; a plain one has no lights and needs the "1/3" spelled out.
    const title = spec.show
      ? (spec.showTitle || (tent.num + '. ' + tent.name))
      : (tent.num + '. ' + tent.name + '  ·  ' + (i + 1) + '/' + questions.length);
    UI.showQuizQuestion({
      title: title,
      body: (spec.show ? quizLights(i, questions.length) : '') + '<p>' + q.q + '</p>',
      colors: tent.colors,
      show: spec.show,
      choices: q.choices,
      onPick: function (choice) {
        const correct = choice === q.answer;
        if (correct) score++;
        UI.playSting(correct);
        UI.showModal({
          title: correct ? (spec.rightTitle || 'Richtig!') : (spec.wrongTitle || 'Knapp daneben!'),
          body: correct ? q.right : q.wrong,
          confirmText: 'Weiter! [Enter]',
          colors: tent.colors,
          show: spec.show,
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
      title: spec.showTitle || (tent.num + '. ' + tent.name),
      body: spec.wrap(score, questions.length),
      confirmText: 'Prost! [Enter]',
      colors: tent.colors,
      show: spec.show,
      onConfirm: function () { done(true); },
    });
  }

  if (spec.skipIntro) showQuestion();
  else showIntro();
}

// Called by game.js when the player steps onto an unvisited OPEN tent entrance.
function startChallenge(tent) {
  if (!tentIsOpen(tent)) {
    UI.toast('Noch zu! This tent\'s challenge isn\'t tapped yet.');
    return;
  }
  // Backstop: one badge per tent. onStepComplete already turns you away at the
  // door with a nicer line, but this keeps the rule true for every caller —
  // the console, the debug hotkeys, anything added later.
  if (tentIsDone(tent)) {
    UI.toast('Schon erobert! You already have the ' + tent.brewery + ' badge.');
    return;
  }
  const challenge = CHALLENGES[tent.id];
  logEvent('Entered ' + tent.name + ' — starting challenge.');

  const runIt = function () {
    state.mode = 'modal';
    // The challenge is action, not strolling. After a host battle the fight
    // music is already on and this does nothing; a tent without a host gets it here.
    Music.play('battle');
    challenge.run(tent, function (success) {
      if (success) {
        awardBadge(tent); // game.js: adds the badge, fanfare, win check
      } else {
        state.mode = 'walk';
        logEvent('Challenge failed at ' + tent.name + ' — try again.');
      }
    });
  };

  // Booked host: same flash + slide-in as a wild encounter, then the quiz.
  // Never rolled from the ENCOUNTERS pool — each open tent keeps its guest.
  if (challenge.host) {
    state.mode = 'battle';
    Battle.start(challenge.host, runIt, tent); // tent paints the Wiesn banner + logo
  } else {
    runIt();
  }
}
