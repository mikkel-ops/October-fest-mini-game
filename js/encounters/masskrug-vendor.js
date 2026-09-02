// The Maßkrug vendor — arms full of beer, zero patience for non-toasters.
// One character of `art` = one pixel; '.' = transparent. See README.md here.

ENCOUNTERS.push({
  id: 'masskrug-vendor',
  name: 'MASSKRUG VENDOR',
  level: 12,
  appear: 'A wild MASSKRUG VENDOR appeared!',
  text: 'He will not let you pass without a toast. “Oans, zwoa, drei — g’suffa!” 🍺',

  palette: {
    h: '#3d2b1f', // hat
    N: '#e8b98a', // skin
    o: '#3a2a1a', // eyes
    m: '#8a8a8a', // the big grey moustache
    W: '#dfe9ef', // beer foam (a cold blue-white, so it shows on the cream battle screen)
    M: '#d4a017', // Maßkrug gold
    S: '#fff8e7', // shirt
    V: '#2e5a1e', // vest
    A: '#1a3a6b', // apron
    L: '#5b3a1e', // trousers
    E: '#3a2414', // shoes
  },

  art: [
    '......hhhhhh......',
    '.....hhhhhhhh.....',
    '......NNNNNN......',
    '..WW..NoNNoN..WW..',
    '..MM..mmmmmm..MM..',
    '..MM..NNNNNN..MM..',
    '..MM...NNNN...MM..',
    '..MMNNSSSSSSNNMM..',
    '...SSSSSSSSSSSS...',
    '....SSVSSSSVSS....',
    '....SSVSSSSVSS....',
    '....AAAAAAAAAA....',
    '....AAAAAAAAAA....',
    '....AAAAAAAAAA....',
    '....LLL....LLL....',
    '....LLL....LLL....',
    '...EEEE....EEEE...',
  ],
});
