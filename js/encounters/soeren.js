// Søren — Classic raid lead in a bucket hat.
// FIGHT menu: one real Classic CC, two abilities that do not belong. Pick right to win.

ENCOUNTERS.push({
  id: 'soeren',
  name: 'SØREN',
  level: 60,
  maxAppearances: 1,
  image: 'js/encounters/soeren.png',
  appear: 'A wild SØREN appeared!',
  text: 'Raid lead. He is assigning CC between the Maßkrüge.',
  fightPrompt: 'Which Classic CC do you call?',
  playerAttacks: [
    {
      name: 'SHEEP',
      effective: true,
      result: 'The mage is polymorphed. Søren nods. Ready check — you drink to the pull.',
    },
    {
      name: 'BLINK',
      effective: false,
      result: 'That’s not a CC, raid lead. Wipe. Drink.',
    },
    {
      name: 'HEROIC LEAP',
      effective: false,
      result: 'Warriors do that. This is a Classic sheep. Facepalm. Drink.',
    },
  ],
});
