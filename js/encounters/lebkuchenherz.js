// A giant Lebkuchenherz — the gingerbread heart on a ribbon. It reads “I mog di”.
// One character of `art` = one pixel; '.' = transparent. See README.md here.

ENCOUNTERS.push({
  id: 'lebkuchenherz',
  name: 'LEBKUCHENHERZ',
  level: 5,
  appear: 'You found a LEBKUCHENHERZ!',
  text: 'A gingerbread heart on a ribbon. It reads “I mog di”. You wear it proudly. 💝',

  palette: {
    R: '#c41e3a', // the ribbon
    G: '#96522a', // gingerbread
    I: '#5a3018', // dark chocolate edge (white would vanish on the cream battle screen)
    W: '#ffffff', // the “I mog di” icing squiggle
  },

  art: [
    '....RR.....RR....',
    '....RR.....RR....',
    '..IIIII...IIIII..',
    '.IGGGGGI.IGGGGGI.',
    'IGGGGGGGIGGGGGGGI',
    'IGGGGGGGGGGGGGGGI',
    'IGWWGWGWGWGWGWWGI',
    'IGGGGGGGGGGGGGGGI',
    '.IGGGGGGGGGGGGGI.',
    '..IGGGGGGGGGGGI..',
    '...IGGGGGGGGGI...',
    '....IGGGGGGGI....',
    '.....IGGGGGI.....',
    '......IGGGI......',
    '.......IGI.......',
    '........I........',
  ],
});
