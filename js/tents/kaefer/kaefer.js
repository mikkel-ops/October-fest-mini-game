// Tent 8 — Käfer Wiesn-Schänke. The celebrity lodge books the biggest celebrity
// available: Julius Caesar, in Lederhosen. He casts the die, the benches turn
// into the Curia, and the Senate puts three questions to you.
//
// Two files make this tent:
//   kaefer.js    this — the host, his move, the questions
//   kaefer.css   the Senate set (show: 'senate')
//
// The questions are deliberately NOT the pub-quiz ones (Rubicon, veni vidi
// vici, the Ides of March). Everybody knows those, so nothing lands. These five
// all put Rome up against the Wiesn — beer, Maß sizes, Germania — true, on
// theme, and they catch people out. Four choices each, picked with 1–4 / A–D
// (quizChoiceFromKey in js/game.js grew the fourth key for this quiz).
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
          q: 'Romans drank wine and held that beer was what peasants and barbarians poured down. What did they call the barbarian drink in Latin?',
          choices: ['Posca', 'Cerevisia', 'Mulsum', 'Garum'],
          answer: 1,
          right: '<i>Cerevisia</i> — the root of the Spanish "cerveza". Garum was fermented fish sauce, and that would NOT go down well in a Hofbräu tent.',
          wrong: '<i>Cerevisia</i> — the root of the Spanish "cerveza". Posca was watered vinegar, mulsum honeyed wine, and garum fish sauce — none of them belongs in a Maß.',
        },
        {
          q: 'Which Roman historian delivered history\'s first sour beer review, describing the Germans\' drink as "a liquid of barley or wheat, fermented into a certain resemblance to wine"?',
          choices: ['Tacitus', 'Julius Caesar', 'Pliny the Younger', 'Suetonius'],
          answer: 0,
          right: 'Tacitus, in <i>Germania</i>, around AD 98. Two stars. Would not order again.',
          wrong: 'Tacitus, in <i>Germania</i>, around AD 98 — two stars, would not order again. And no, not Caesar; the man is standing right in front of you.',
        },
        {
          q: 'A Maß holds exactly one litre. Rome\'s standard cup, the <i>sextarius</i>, held 0.55 litres. What does that mean for the legionary in the beer tent?',
          choices: ['He is done after half a Maß', 'He needs almost two to keep up', 'He needs four', 'He needs eight'],
          answer: 1,
          right: 'Almost two. Rome conquered three continents but never coped with a Bavarian serving size.',
          wrong: 'Almost two sextarii to one Maß. Rome conquered three continents but never coped with a Bavarian serving size.',
        },
        {
          q: 'Rome\'s worst defeat against the Germanic tribes was the Teutoburg Forest, AD 9, where three whole legions vanished. Who was behind it?',
          choices: ['Vercingetorix', 'Attila', 'Arminius', 'Alaric'],
          answer: 2,
          right: 'Arminius — Cherusci chieftain and former Roman officer. Rome trained him itself. That is the kind of thing you call a bad onboarding.',
          wrong: 'Arminius — Cherusci chieftain and former Roman officer. Rome trained him itself, which is the kind of thing you call a bad onboarding.',
        },
        {
          q: 'Regensburg in Bavaria keeps some of the world\'s oldest taverns. What was the town called when Rome founded it as a legion camp in AD 179?',
          choices: ['Castra Regina', 'Vindobona', 'Aquincum', 'Augusta Treverorum'],
          answer: 0,
          right: '<i>Castra Regina</i> — the fort on the river Regen. The legion marched off; the taverns stayed open.',
          wrong: '<i>Castra Regina</i> — the fort on the river Regen. Vindobona became Vienna and Aquincum Budapest: good parties, wrong tent.',
        },
      ],
    }, done);
  },
};
