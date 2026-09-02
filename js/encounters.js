// encounters.js — random "situations" while walking around (the Pokémon
// wild-encounter system). This file only rolls the dice and kicks things off.
//
// WHO you can meet lives in js/encounters/ — one small file per encounter
// (sprite, name, text). To add one: copy a file there, edit it, and add its
// <script> tag to index.html. See js/encounters/README.md.
//
// The battle screen itself (flash, slide-in, text box) is js/battle.js.
// Chance and cooldown live in config.js (ENCOUNTER_CHANCE, ENCOUNTER_COOLDOWN).

const ENCOUNTERS = []; // each file in js/encounters/ pushes one entry into this

// Rolled exactly once per completed step (from onStepComplete in game.js),
// but only when the player did not just enter a tent.
function maybeEncounter() {
  if (ENCOUNTERS.length === 0) return;
  if (state.stepsSinceEncounter < CONFIG.ENCOUNTER_COOLDOWN) return;
  state.lastRoll = Math.random();
  if (state.lastRoll < CONFIG.ENCOUNTER_CHANCE) {
    startEncounter(ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]);
  }
}

function startEncounter(enc) {
  if (state.mode !== 'walk') return; // never stack an encounter on top of a popup or the win screen
  state.stepsSinceEncounter = 0;
  logEvent('Random encounter: ' + enc.id);
  const finish = function () {
    state.mode = 'walk';
    logEvent('Encounter over — back to walking.');
  };
  if (enc.run) {
    // THE SEAM FOR REAL ENCOUNTER MINI-GAMES: an entry with its own run(state, done)
    // can do anything it wants (its own UI, a mini-game...). Call done() when finished.
    state.mode = 'modal';
    enc.run(state, finish);
  } else {
    // the default: the Game Boy battle screen (js/battle.js)
    state.mode = 'battle';
    Battle.start(enc, finish);
  }
}
