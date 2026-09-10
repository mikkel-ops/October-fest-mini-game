// Tejs — sort-games man: billard, pool, krokket, always with a drink.
// The board is in the basement; this is a quick IRL four-ball round.

ENCOUNTERS.push({
  id: 'tejs',
  name: 'TEJS',
  level: 8,
  maxAppearances: 1,
  image: 'js/encounters/Tejs.png',
  appear: 'A wild TEJS appeared!',
  text: 'Sort-games man. Billard, pool, krokket — always with a Maß in the other hand.',

  run: function (state, done) {
    UI.showModal({
      title: 'Four-ball basement pool',
      body:
        'Downstairs to Tejs’s board. Cue ball plus <b>four</b> object balls.<br><br>' +
        'One quick round — sink them. Miss a shot, drink.<br><br>' +
        'Back from the basement? Weiter!',
      confirmText: 'Weiter! [Enter]',
      colors: ['#2e7d32', '#f8f8f0'],
      onConfirm: done,
    });
  },
});
