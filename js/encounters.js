// encounters.js — random "situations" while walking around (the Pokémon
// wild-encounter equivalent, minus the combat... for now).
//
// THE SEAM FOR REAL ENCOUNTERS LATER: add an entry to ENCOUNTERS with your own
// run(state, done) and it can do anything it wants (its own UI, a mini-game...).
// Just call done() when finished. Entries without run() get the default popup.
// Chance and cooldown live in config.js (ENCOUNTER_CHANCE, ENCOUNTER_COOLDOWN).

const ENCOUNTERS = [
  { id: 'masskrug-vendor',
    title: 'A wild Maßkrug vendor appears!',
    text:  'He will not let you pass without a toast. “Oans, zwoa, drei — g’suffa!” 🍺' },

  { id: 'lebkuchenherz',
    title: 'You found a Lebkuchenherz!',
    text:  'A gingerbread heart on a ribbon. It reads “I mog di”. You wear it proudly. 💝' },

  { id: 'lost-tourist',
    title: 'A lost tourist blocks the path!',
    text:  '“Excuse me... which way to the Hofbräu tent?” You point. He was standing in front of it. 🧭' },

  { id: 'oompah-band',
    title: 'An Oompah band marches past!',
    text:  'Tubas everywhere. You have no choice but to clap along until they pass. 🎺' },
];

// Rolled exactly once per completed step (from onStepComplete in game.js),
// but only when the player did not just enter a tent.
function maybeEncounter() {
  if (state.stepsSinceEncounter < CONFIG.ENCOUNTER_COOLDOWN) return;
  state.lastRoll = Math.random();
  if (state.lastRoll < CONFIG.ENCOUNTER_CHANCE) {
    startEncounter(ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]);
  }
}

function startEncounter(enc) {
  if (state.mode !== 'walk') return; // never stack an encounter on top of a popup or the win screen
  state.mode = 'modal';
  state.stepsSinceEncounter = 0;
  logEvent('Random encounter: ' + enc.id);
  const finish = function () {
    state.mode = 'walk';
    logEvent('Encounter over — back to walking.');
  };
  if (enc.run) {
    enc.run(state, finish); // custom encounters bring their own UI
  } else {
    UI.showModal({
      title: enc.title,
      body: enc.text,
      confirmText: 'Weiter! [Enter]',
      colors: ['#5b3a1e', '#f5e6c8'],
      onConfirm: finish,
    });
  }
}
