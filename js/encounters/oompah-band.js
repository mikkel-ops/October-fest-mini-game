// The Oompah band — well, its front man and his enormous tuba.
// One character of `art` = one pixel; '.' = transparent. See README.md here.

ENCOUNTERS.push({
  id: 'oompah-band',
  name: 'OOMPAH BAND',
  level: 15,
  appear: 'A wild OOMPAH BAND marches in!',
  text: 'Tubas everywhere. You have no choice but to clap along until they pass. 🎺',

  palette: {
    c: '#c41e3a', // band cap
    b: '#1a1a1a', // cap peak
    N: '#e8b98a', // skin
    o: '#3a2a1a', // eyes
    u: '#c41e3a', // band uniform
    g: '#ffd166', // gold buttons
    T: '#d4a017', // tuba brass
    d: '#a87b12', // inside of the tuba bell
    L: '#2a2a2a', // trousers
    E: '#1a1a1a', // shoes
  },

  art: [
    '..........TTTTT..',
    '.........TTdddTT.',
    '..cccc..TTdddddTT',
    '..cccc..TTdddddTT',
    '..bbbb...TTdddTT.',
    '..NNNN....TTTTT..',
    '..NoNo.....TT....',
    '..NNNN.....TT....',
    '.uuuuuu...TTT....',
    '.uuuuuuNNTTT.....',
    '.uguugu..TTT.....',
    '.uuuuuu.TTTT.....',
    '.uuuuuu..TT......',
    '..LLLL...........',
    '..LL.LL..........',
    '..EE.EE..........',
  ],
});
