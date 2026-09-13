// challenges.js — what happens inside each tent.
//
// THE SEAM FOR REAL CHALLENGES: register one entry per tent id, e.g.
//
//   CHALLENGES.hofbraeu = {
//     host: { name, level, appear, text, art, palette }, // optional battle intro
//     run: function (tent, done) {
//       // ... your mini-game, any UI you like ...
//       done(true);   // true = badge earned, false = try again later
//     }
//   };
//
// A tent is OPEN only if it has its own key here. DEFAULT does not count —
// closed tents stay grey on the map and toast instead of awarding a badge.
// When you add a new CHALLENGES.<id>, that tent lights up automatically.
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
// spec.skipIntro: the battle host already said the hook — jump to question 1.
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

  if (spec.skipIntro) showQuestion();
  else showIntro();
}

// Hofbräu stays Hofbräu — Mr. Worldwide is booked, every time you walk in.
CHALLENGES.hofbraeu = {
  host: {
    name: 'PITBULL',
    level: 305, // Miami
    appear: 'A wild MR. WORLDWIDE appeared!',
    text: 'Dale! He sat down on the Hofbräu benches. Three questions, then a Maß.',
    // Chunky pixel Pitbull in Tracht + a Maß. Sunglasses and the goatee do the
    // recognition; Lederhosen and the mug are the Wiesn joke.
    palette: {
      N: '#c68642', // skin
      n: '#8d5524', // ear / shadow
      k: '#1a120c', // goatee
      g: '#111111', // wraparound shades
      G: '#f4d03f', // gold chain
      w: '#f4efe4', // shirt
      r: '#c41e3a', // Hofbräu-red suspenders
      L: '#6b4423', // lederhosen
      D: '#3d2817', // leder dark
      E: '#1a1a1a', // shoes
      C: '#f3ead8', // Maß ceramic
      m: '#fff8e7', // foam
      B: '#e8a317', // beer
      H: '#d4c4a0', // mug handle
    },
    art: [
      '.....NNNNNNNN.....',
      '....NNNNNNNNNN....',
      '...nNNggggggNNn...',
      '...NNNggggggNNN...',
      '...NNNggggggNNN...',
      '....NNNNNNNNNN....',
      '.....NNkkkkNN.....',
      '......NNkkNN......',
      '.....GGGGGGGG.....',
      '....GwwwwwwwwG....',
      '...wwwwwwwwwwww.CC',
      '..NwwwwwwwwwwwNCCm',
      '..NwrrwwwwrrwwNCBB',
      '...wwrrrrrrrrwwCBB',
      '....LLLLLLLLLL.CCC',
      '....LLDDDDDDLL.H.C',
      '....LLL....LLL.H..',
      '....EEE....EEE....',
    ],
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // the battle lines already introduced him
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
          wrong: 'Mr. Worldwide — not Mr. Wiesn. The Lederhosen already look good on him.',
        },
      ],
    }, done);
  },
};

// Weinzelt stays Weinzelt — the Gräfin books the Schickeria table every time.
CHALLENGES.weinzelt = {
  host: {
    name: 'GRÄFIN',
    level: 13, // open till 1 am
    appear: 'A wild GRÄFIN appeared!',
    text: 'Champagne, not Maß. She saved you a seat with the Schickeria. Three questions, then a toast.',
    // Wine-tent aristocrat: blonde updo, wine Dirndl, champagne coupe.
    palette: {
      H: '#e6c35c', // blonde
      h: '#8a6a20', // hair shadow
      N: '#e8b98a', // skin
      n: '#c68642',
      e: '#2b2b2b', // eyes
      l: '#9b1b30', // lipstick
      w: '#fff8e7', // blouse
      D: '#722f37', // wine dirndl
      A: '#f5e6c8', // champagne apron
      G: '#c9a227', // gold
      C: '#d4c4a0', // glass
      B: '#f4e6a0', // champagne
      f: '#fffdf4', // fizz
      s: '#3a2414', // shoes
    },
    art: [
      '......HHHHHH......',
      '.....HHHHHHHH.....',
      '....hHHNNNNHHh....',
      '....HNNNNNNNNH....',
      '.....N.e..e.N.....',
      '......NNllNN......',
      '.....GGGGGGGG.....',
      '....GwwwwwwwwG....',
      '...DwwwwwwwwwwD.CC',
      '..DDwwAAAAAAwwDCCf',
      '..DDDDAAAAAADDD.BB',
      '....DDDAAAAADD..BB',
      '....DDDDDDDDDD..C.',
      '....DDD....DDD....',
      '....sss....sss....',
    ],
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // the Gräfin already said the hook
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

// Käfer stays Käfer — the celebrity lodge books Caesar, every time.
CHALLENGES.kaefer = {
  host: {
    name: 'CAESAR',
    level: 44, // 44 BC
    appear: 'A wild JULIUS CAESAR appeared!',
    text: 'Alea iacta est — he crossed the Wiesn like the Rubicon. Three questions about Romerriget, then a Maß.',
    // Laurel wreath + Lederhosen + imperial purple sash. Dictator in Tracht.
    palette: {
      L: '#2e7d32', // laurel
      l: '#1b5e20', // laurel dark
      N: '#e8b98a', // skin
      n: '#c68642',
      e: '#2b2b2b',
      w: '#fff8e7', // shirt
      P: '#5b2c6f', // imperial purple
      r: '#c41e3a', // sash stripe
      H: '#c9a227', // gold fibula
      B: '#6b4423', // lederhosen
      D: '#3d2817',
      E: '#1a1a1a', // shoes
      C: '#f3ead8', // Maß
      m: '#fff8e7', // foam
      b: '#e8a317', // beer
      G: '#d4c4a0', // handle
    },
    art: [
      '.....lLLLLLLl.....',
      '....LLNNNNNNLL....',
      '...lNNN....NNNl...',
      '...NNN.e..e.NNN...',
      '....NNNNNNNNNN....',
      '.....NNNNNNNN.....',
      '......nNNNNNn.....',
      '.....HHHHHHHH.....',
      '....PwwwwwwwwP....',
      '...PPwwrrrrwwPP.CC',
      '..NPwwwwwwwwwwPCCm',
      '..NPwwwwwwwwwwPCCb',
      '...wwBBBBBBBBwwCCb',
      '....BBDDDDDDBB.CCC',
      '....BBB....BBB.G.C',
      '....EEE....EEE.G..',
    ],
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // Caesar already threw the die
      wrap: function (score, total) {
        if (score === total) return 'Veni, vidi, vici! ' + score + '/' + total + ' — Caesar buys the next Maß.';
        if (score === 0) return '0/' + total + ' — Et tu? Käfer still pours you a Maß. The badge is yours anyway.';
        return score + '/' + total + ' — close enough for the Rubicon. Prost, the badge is yours!';
      },
      questions: [
        {
          q: 'Which river did Caesar cross, starting the civil war?',
          choices: ['The Rubicon', 'The Isar', 'The Danube'],
          answer: 0,
          right: 'The Rubicon — alea iacta est. The Isar is just outside this tent.',
          wrong: 'The Rubicon. The Isar is München; the Danube can wait.',
        },
        {
          q: 'What does <i>Veni, vidi, vici</i> mean?',
          choices: ['I came, I saw, I conquered', 'I drank, I sang, I slept', 'O\'zapft is!'],
          answer: 0,
          right: 'I came, I saw, I conquered — after a quick campaign in Pontus.',
          wrong: 'I came, I saw, I conquered. O\'zapft is! is the Wiesn\'s line.',
        },
        {
          q: 'On which day was Caesar murdered?',
          choices: ['The Ides of March', 'The first of April', 'Heiligabend'],
          answer: 0,
          right: 'The Ides of March — 15 March, 44 BC. Et tu, Brute?',
          wrong: 'The Ides of March, 15 March. Not a Wiesn joke and not Heiligabend.',
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
  const challenge = CHALLENGES[tent.id];
  logEvent('Entered ' + tent.name + ' — starting challenge.');

  const runIt = function () {
    state.mode = 'modal';
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
