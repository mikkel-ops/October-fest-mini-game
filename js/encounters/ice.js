// The ICE — the classic party icing game: find one, drop to one knee, chug.
// One character of `art` = one pixel; '.' = transparent. See README.md here.

ENCOUNTERS.push({
  id: 'ice',
  name: 'ICE',
  level: 21,
  appear: 'A wild ICE appeared!',
  text: 'You know the rules: down on one knee and chug. You got iced! 🧊',

  palette: {
    C: '#c0c8d0', // silver cap
    G: '#bfe3f0', // frosty glass
    L: '#ffffff', // label
    R: '#c41e3a', // the diagonal red band
    i: '#e9f8ff', // ice cubes
    I: '#9cc7d8', // ice cube edges
  },

  art: [
    '.......CC.......',
    '.......CC.......',
    '......GGGG......',
    '......GGGG......',
    '......GGGG......',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '....GGGGGGGG....',
    '....LLLLLLLL....',
    '....LLLLLRRL....',
    '....LLLRRLLL....',
    '....LRRLLLLL....',
    '....LLLLLLLL....',
    '....GGGGGGGG....',
    '....GGGGGGGG....',
    '.II.GGGGGGGG.II.',
    '.Ii.GGGGGGGG.Ii.',
    '.II.GGGGGGGG.II.',
    '....GGGGGGGG....',
  ],
});
