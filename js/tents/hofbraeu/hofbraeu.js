// Tent 3 — Hofbräu-Festzelt. Hofbräu stays Hofbräu: Mr. Worldwide is booked,
// every single time you walk in. He appears, uses MR. WORLDWIDE QUIZ on you,
// and the benches turn into a game-show stage for three questions.
//
// Three files make this tent:
//   hofbraeu.js              this — the host, his move, the questions
//   mr_world_wide.png        the man himself (battle sprite + stage host)
//   hofbraeu.css             the Miami game-show set (show: 'worldwide')
//
// Registering this key is what makes tent 3 OPEN (see js/challenges.js).

CHALLENGES.hofbraeu = {
  host: {
    name: 'PITBULL',
    level: 305, // Miami
    // A photo, not pixel art — battle.js renders enc.image as a cutout, same as
    // the friends in js/encounters/. He faces left, straight at the player.
    image: 'js/tents/hofbraeu/mr_world_wide.png',
    appear: 'A wild MR. WORLDWIDE appeared!',
    text: 'Dale! He sat down on the Hofbräu benches and grabbed a microphone.',
    // His attack IS the quiz: battle.js types "PITBULL used MR. WORLDWIDE QUIZ!",
    // lunges, chips your fake HP — then Enter drops you onto the stage below.
    foeAttack: {
      name: 'MR. WORLDWIDE QUIZ',
      result: 'The benches go dark. Spotlights, three podiums, 10,000 people watching. Dale!',
    },
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // the battle lines already introduced him
      show: 'worldwide', // dress the popups as a game show — see hofbraeu.css
      showTitle: '★ MR. WORLDWIDE QUIZ ★',
      rightTitle: 'DALE! ✅',
      wrongTitle: 'ay caramba… ❌',
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
