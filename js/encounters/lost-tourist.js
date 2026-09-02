// The lost tourist — cap, camera, a map held upside down, socks in sandals.
// One character of `art` = one pixel; '.' = transparent. See README.md here.

ENCOUNTERS.push({
  id: 'lost-tourist',
  name: 'LOST TOURIST',
  level: 3,
  appear: 'A wild LOST TOURIST blocks the path!',
  text: '“Excuse me... which way to the Hofbräu tent?” You point. He was standing in front of it. 🧭',

  palette: {
    c: '#c41e3a', // baseball cap
    h: '#3a2a1a', // hair
    N: '#e8b98a', // skin
    o: '#3a2a1a', // eyes
    S: '#5aa9d6', // holiday shirt
    f: '#fff3c4', // ...with flowers
    C: '#2a2a2a', // camera around the neck
    P: '#f8f4e6', // the map
    p: '#c41e3a', // red route on the map
    q: '#1a3a6b', // blue river on the map
    L: '#d9c79a', // khaki shorts
    K: '#f4efe2', // socks...
    E: '#8a5a2b', // ...in sandals
  },

  art: [
    '.....cccccc.....',
    '....cccccccc....',
    '....hNNNNNNh....',
    '....NoNNNNoN....',
    '....NNNNNNNN....',
    '.....NNNNNN.....',
    '...SSSSSSSSSS...',
    '..SSfSSSSSSfSS..',
    '..SSSSCCCSSSSS..',
    '..SSSSCCCSSSSS..',
    '..NNSSSSSSSSNN..',
    '..NNPPPPPPPPNN..',
    '....PPqPPpPP....',
    '....PPPPPPPP....',
    '....LLLLLLLL....',
    '....LLL..LLL....',
    '....NNN..NNN....',
    '....KKK..KKK....',
    '...EEEE..EEEE...',
  ],
});
