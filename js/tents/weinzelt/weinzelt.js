// Tent 9 — Kufflers Weinzelt. No Maß in here: real estate agent VALDEMAR
// LACOUR-VALENTIN has booked the Schickeria table (of course he has) and is
// holding an åbent hus. His attack is the oldest mægler line in the book,
// and the quiz is three real facts about the Danish housing market — the one
// argument two Danes will have anywhere, Champagne included.
//
// Three files make this tent:
//   weinzelt.js          this — the host, his move, the questions
//   real_estate.png      Valdemar himself (battle sprite + waiting by the door)
//   weinzelt.css         the åbent hus set (show: 'visning')
//
// Registering this key is what makes tent 9 OPEN (see js/challenges.js).

CHALLENGES.weinzelt = {
  host: {
    name: 'VALDEMAR',
    level: 89, // the m² of the flat he's showing (66 of them are "usable")
    // A photo cutout, not pixel art — battle.js renders enc.image the same
    // way as the friends in js/encounters/ and Pitbull in js/tents/hofbraeu/.
    image: 'js/tents/weinzelt/real_estate.png',
    appear: 'A wild VALDEMAR LACOUR-VALENTIN appeared!',
    text: 'He slides a prospectus across the Schickeria table. "Liebhaverdrøm. Priced to sell."',
    // His attack IS the sales pitch: battle.js types the line, he lunges,
    // your fake HP drops — then Enter opens the åbent hus quiz below.
    foeAttack: {
      name: 'DER ER RIGTIG MEGET INTERESSE',
      effective: true, // "It's super effective!" — the line always works
      result: 'The Weinzelt becomes an åbent hus. Three questions decide if you make the buyer list.',
    },
  },

  run: function (tent, done) {
    runQuiz(tent, {
      skipIntro: true, // Valdemar already did the pitch in the battle
      show: 'visning', // dress the popups as an åbent hus — see weinzelt.css
      showTitle: '⌂ VALDEMARS ÅBNE HUS ⌂',
      rightTitle: 'SOLGT! ✅',
      wrongTitle: 'Solgt til anden side… ❌',
      hook: 'Valdemar\'s åbent hus: three real facts about the Danish housing market. Shoes off, please.',
      wrap: function (score, total) {
        if (score === total) return score + '/' + total + ' — Valdemar says there is RIGTIG meget interesse in you.';
        if (score === 0) return '0/' + total + ' — you\'re "still on the buyer list". The Weinzelt badge is yours anyway.';
        return score + '/' + total + ' — not bad. Valdemar will "circle back after the weekend". Badge is yours.';
      },
      // Real numbers, researched September 2026. Yes, they hurt.
      questions: [
        {
          q: 'What does one m² of ejerlejlighed in København cost on average?',
          choices: ['About 45,000 kr.', 'About 73,000 kr.', 'About 110,000 kr.'],
          answer: 1,
          right: 'About 73,000 kr./m² — a record. Valdemar calls it "et sundt marked".',
          wrong: 'About 73,000 kr./m² — an all-time record in 2026. Valdemar calls that "et sundt marked".',
        },
        {
          q: 'How many ejerlejligheder in København and Aarhus are forældrekøb?',
          choices: ['Almost 1 in 3', 'Almost 1 in 50', 'Almost 1 in 10'],
          answer: 2,
          right: 'Almost 1 in 10 (9%) — mor og far are Valdemar\'s favorite buyers.',
          wrong: 'Almost 1 in 10 (9%), says Danmarks Statistik. Mor og far are Valdemar\'s favorite buyers.',
        },
        {
          q: 'One m² of København lejlighed buys how much HOUSE on Lolland?',
          choices: ['About 1 m² — same price', 'About 3 m²', 'About 14 m²'],
          answer: 2,
          right: 'About 14 m²! Lolland is Denmark\'s cheapest kommune — "tæt på det hele", says Valdemar.',
          wrong: 'About 14 m² — Lolland is Denmark\'s cheapest kommune at ~5,200 kr./m². "Tæt på det hele!"',
        },
      ],
    }, done);
  },
};
