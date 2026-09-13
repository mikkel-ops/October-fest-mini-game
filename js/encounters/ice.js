// The ICE — the classic party icing game: find one, drop to one knee, chug.
// ICE attacks you; there is no FIGHT menu.

ENCOUNTERS.push({
  id: 'ice',
  name: 'ICE',
  level: 21,
  maxAppearances: 3, // the one encounter that may come back — three icings is plenty
  image: 'js/encounters/ice.png',
  appear: 'A wild ICE appeared!',
  foeAttack: {
    name: 'APPEAR', // already on screen — that's the joke
    anim: 'appear',
    result: 'It appeared. Again. Down on one knee and chug. You got iced!',
  },
});
