// Kruse — sent an American girl home with a rugbrødmad. Now you make one too.
// The host brings real rugbrød and leverpostej; the race is IRL.

ENCOUNTERS.push({
  id: 'kruse',
  name: 'KRUSE',
  level: 14,
  maxAppearances: 1,
  image: 'js/encounters/Kruse.png',
  appear: 'A wild KRUSE appeared!',
  text: 'He hooked up with an American girl… and sent her off with a rugbrødmad.',

  run: function (state, done) {
    UI.showModal({
      title: 'Leverpostejmad — schnell!',
      body:
        'Rugbrød and leverpostej are on the table. Same story as Kruse:<br><br>' +
        'Make a proper <b>leverpostejmad</b> — fastest wins.<br>' +
        'Then send the lady out the door.<br><br>' +
        'She is gone? Weiter!',
      confirmText: 'Weiter! [Enter]',
      colors: ['#8b4513', '#f5e6c8'],
      onConfirm: done,
    });
  },
});
