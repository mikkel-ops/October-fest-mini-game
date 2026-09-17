// Tent 8 — Käfer Wiesn-Schänke. The celebrity lodge books the biggest
// celebrity available: Julius Caesar, in Lederhosen. Three questions about
// Romerriget, then the badge.
//
// Registering this key is what makes tent 8 OPEN (see js/challenges.js).

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
