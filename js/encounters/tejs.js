// Tejs — sort-games man. The basement board is pool, so that shot is the strong one.
// Billard and krokket are his other loves — just not the right attack tonight.

ENCOUNTERS.push({
  id: 'tejs',
  name: 'TEJS',
  level: 8,
  maxAppearances: 1,
  image: 'js/encounters/Tejs.png',
  appear: 'A wild TEJS appeared!',
  text: 'Sort-games man. Billard, pool, krokket — always with a Maß in the other hand.',
  fightPrompt: 'Which sort game do you play?',
  playerAttacks: [
    {
      name: 'POOL',
      effective: true,
      result: 'Downstairs, four balls. You sink them. Tejs toasts. Miss a shot next time — drink.',
    },
    {
      name: 'BILLARD',
      effective: false,
      result: 'Close — but the board in the basement is pool. Tejs shrugs. Drink.',
    },
    {
      name: 'KROKKET',
      effective: false,
      result: 'Wrong lawn. There is no wicket on the Wiesn tonight. Drink.',
    },
  ],
});
