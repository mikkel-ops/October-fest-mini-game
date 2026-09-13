// Toke — nyrig, never shuts up about fancy French wine.
// FIGHT menu: pick the fanciest bottle. The other two are not very effective.

ENCOUNTERS.push({
  id: 'toke',
  name: 'TOKE',
  level: 99,
  maxAppearances: 1,
  image: 'js/encounters/Toke.png',
  appear: 'A wild TOKE appeared!',
  text: 'Nyrig alert. He wants you to pick a wine. Obviously.',
  fightPrompt: 'Which bottle do you pour?',
  playerAttacks: [
    {
      name: 'CHÂTEAU MARGAUX',
      effective: true,
      result: 'Toke nods like it was obvious. Prost to the terroir!',
    },
    {
      name: 'BEAUJOLAIS NOUVEAU',
      effective: false,
      result: 'Toke winces. “That’s supermarket, liebling.” You drink anyway.',
    },
    {
      name: 'MASS IN A WINE GLASS',
      effective: false,
      result: 'That’s just Wiesn leftover. Toke is personally offended. Drink.',
    },
  ],
});
