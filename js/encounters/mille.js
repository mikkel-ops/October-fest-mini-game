// Mille — two hands become one, and that hand pours you a shot.
// She attacks you; there is no FIGHT menu.

ENCOUNTERS.push({
  id: 'mille',
  name: 'MILLE',
  level: 2,
  maxAppearances: 1,
  image: 'js/encounters/Mille.png',
  appear: 'A wild MILLE appeared!',
  foeAttack: {
    name: 'TWO HANDS TO ONE',
    result: 'Two Maß become one hand. That hand makes you take a shot. G’suffa!',
  },
});
