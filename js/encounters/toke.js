// Toke — nyrig, never shuts up about fancy French wine.
// Teams lecture as if the tasting notes were obvious (because he already told everyone).

ENCOUNTERS.push({
  id: 'toke',
  name: 'TOKE',
  level: 99,
  maxAppearances: 1,
  image: 'js/encounters/Toke.png',
  appear: 'A wild TOKE appeared!',
  text: 'Nyrig alert. He is already talking about the Bordeaux like it is obvious.',

  run: function (state, done) {
    UI.showModal({
      title: 'Château Margaux — obviously',
      body:
        'A bottle of <b>Château Margaux</b> is on the table. Toke has explained it.<br><br>' +
        'Each team lectures: nose, legs, terroir, “notes of…” — as if everyone already knew.<br>' +
        'Toke judges the most nyrig tasting.<br><br>' +
        'Lecture over? Weiter!',
      confirmText: 'Weiter! [Enter]',
      colors: ['#6b1c3a', '#d4af37'],
      onConfirm: done,
    });
  },
});
