// Søren — Classic raid lead, bucket hat, ready to assign CC on the Wiesn.
// Photo sits on the battle screen; the mini-game is IRL (shout the callouts).

ENCOUNTERS.push({
  id: 'soeren',
  name: 'SØREN',
  level: 60,
  maxAppearances: 1,
  image: 'js/encounters/soeren.png',
  appear: 'A wild SØREN appeared!',
  text: 'Raid lead in a bucket hat. He is already assigning CC between the Maßkrüge.',

  run: function (state, done) {
    UI.showModal({
      title: 'Classic pull — CC assignments',
      body:
        'One Molten Core trash pull. Søren is raid lead.<br><br>' +
        '<b>Sheep</b> the mage. <b>Sap</b> the rogue. <b>Trap</b> the hunter.<br><br>' +
        'Host assigns the three jobs. Miss your callout — you drink.<br>' +
        'Pull is over? Weiter!',
      confirmText: 'Weiter! [Enter]',
      colors: ['#1a3a6b', '#f4d03f'],
      onConfirm: done,
    });
  },
});
