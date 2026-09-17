// Tent 8 — Käfer Wiesn-Schänke. The celebrity lodge books the biggest celebrity
// available: Julius Caesar, in Lederhosen. He casts the die, the benches turn
// into the Curia, and the Senate puts three questions to you.
//
// Two files make this tent:
//   kaefer.js    this — the host, his move, the questions
//   kaefer.css   the Senate set (show: 'senate')
//
// The questions are deliberately NOT the pub-quiz three (Rubicon, veni vidi
// vici, the Ides of March). Everybody knows those, so nothing lands. These three
// are all true and all catch people out.
//
// Registering this key is what makes tent 8 OPEN (see js/challenges.js).

CHALLENGES.kaefer = {
  host: {
    name: 'CAESAR',
    level: 44, // 44 BC
    appear: 'A wild JULIUS CAESAR appeared!',
    text: 'He crossed the Wiesn like the Rubicon — laurel on his head, Lederhosen on his legs, Maß in his fist.',
    // His attack calls the house to order: battle.js types "CAESAR used ALEA
    // IACTA EST!", he lunges, your fake HP drops, and Enter opens the Curia.
    foeAttack: {
      name: 'ALEA IACTA EST',
      result: 'The die is cast. The benches rise into marble, the Senate takes its seats, and you are left standing on the floor. Three questions.',
    },
    // Laurel wreath, toga with the imperial purple stripe, Lederhosen, Maß.
    // The toga is TINTED cream (#e8e0c8) on purpose — a pure white disappears
    // against the battle screen's cream background. See js/encounters/README.md.
    palette: {
      L: '#3f9142', // laurel leaves
      l: '#256b28', // laurel shadow
      h: '#3a2a1a', // hair — the wreath must sit ON something, or a solid green
                    // cap on a bald head just reads as another Trachten hat
      N: '#e8b98a', // skin
      n: '#c68642', // skin shadow
      e: '#2b2b2b', // eyes
      M: '#8a6a4a', // brow and mouth line
      T: '#e8e0c8', // toga
      t: '#cfc3a8', // toga fold
      P: '#5b2c6f', // imperial purple stripe
      H: '#c9a227', // gold fibula at the collar
      B: '#6b4423', // lederhosen
      D: '#3d2817', // leder dark
      K: '#f4efe2', // socks
      E: '#1a1a1a', // shoes
      C: '#d4c4a0', // Maß ceramic (darker than the toga so it still reads)
      m: '#fff8e7', // foam
      b: '#e8a317', // beer
      G: '#8a7a5a', // mug handle
    },
    // Two things make him read as Caesar rather than another lad in Tracht:
    // the wreath is a LEAFY CIRCLET across the brow with sprigs at the temples
    // (with dark hair above it), and the toga carries a bold purple clavus
    // straight down the front — Rome's actual "I outrank you" marker.
    art: [
      '......hhhhhh......',
      '....hhhhhhhhhh....',
      '...hhhhhhhhhhhh...',
      '.lLl.LlLlLlLl.lLl.',
      '....NNNNNNNNNN....',
      '...NNNeNNNNeNNN...',
      '...NNNNNNNNNNNN...',
      '....NNNNMMNNNN....',
      '....NNNMMMMNNN....',
      '.....nNNNNNNn.....',
      '......nNNNNn......',
      '.......NNNN.......',
      '.....HHHHHHHH.....',
      '...TTTTTPPTTTTT...',
      '..NTTTTTPPTTTTTN.m',
      '..NTTtTTPPTTtTTNCm',
      '...TTTTTPPTTTTT.Cb',
      '....BBBBBBBBBB.CCb',
      '....BBDDDDDDBB.CCC',
      '....BBB....BBB.G.C',
      '....KKK....KKK.G..',
      '....EEE....EEE....',
    ],
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // Caesar already cast the die in the battle
      show: 'senate',  // dress the popups as the Curia — see kaefer.css
      showTitle: 'CVRIA · SENATVS ROMANVS',
      rightTitle: 'RECTE!',
      wrongTitle: 'ERRAS…',
      wrap: function (score, total) {
        if (score === total) return 'RECTE OMNIA! ' + score + '/' + total
          + ' — the Senate rises. Caesar buys the next Maß himself.';
        if (score === 0) return '0/' + total
          + ' — the Senate coughs politely and studies its sandals. Käfer pours you a Maß anyway; the badge is yours.';
        return score + '/' + total + ' — good enough for the Curia. Prost, the badge is yours!';
      },
      questions: [
        {
          q: 'Pirates kidnapped a young Caesar and demanded 20 talents. What did he do?',
          choices: ['Told them to demand 50 — he was worth more', 'Paid up and went quietly home', 'Escaped overboard in the night'],
          answer: 0,
          right: 'He was insulted by the price and made them raise it to 50. He also promised to crucify them all — everyone laughed. Once the ransom was paid he raised a fleet and did exactly that.',
          wrong: 'He made them raise it to 50, being insulted by the price, and promised to crucify the lot. They took it as a joke. It was not a joke.',
        },
        {
          q: 'What did Romans rinse their mouths with to whiten their teeth?',
          choices: ['Urine', 'Crushed pearls in vinegar', 'Sea salt and charcoal'],
          answer: 0,
          right: 'Urine — the ammonia genuinely whitens. Catullus mocks a man for grinning with it, and Vespasian later taxed the urine trade: <i>pecunia non olet</i>, money does not smell.',
          wrong: 'Urine. The ammonia works, Catullus mocked a man for it, and Vespasian taxed the trade — <i>pecunia non olet</i>. Enjoy your Maß.',
        },
        {
          q: 'A Roman <i>vomitorium</i> was…?',
          choices: ['The exit passage of an arena', 'A room for emptying your stomach mid-feast', 'The wine cellar under a villa'],
          answer: 0,
          right: 'An exit passage — it <i>spews</i> the crowd out of the arena after the games. The room-for-throwing-up is a Victorian invention.',
          wrong: 'An exit passage that spews the crowd out of the arena. Nobody ever built a room for the other thing — that one is a Victorian myth.',
        },
      ],
    }, done);
  },
};
