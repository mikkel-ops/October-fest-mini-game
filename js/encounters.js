// encounters.js — random "situations" while walking around (the Pokémon
// wild-encounter system). This file only rolls the dice and kicks things off.
//
// WHO you can meet lives in js/encounters/ — one small file per encounter
// (sprite or photo, name, text, optional IRL mini-game). To add one: copy a
// file there, edit it, and add its <script> tag to index.html.
// See js/encounters/README.md.
//
// The battle screen itself (flash, slide-in, text box) is js/battle.js.
// Chance and cooldown live in config.js (ENCOUNTER_CHANCE, ENCOUNTER_COOLDOWN).
// How often each one may appear is enc.maxAppearances (counted on state).

const ENCOUNTERS = []; // each file in js/encounters/ pushes one entry into this

// Friends are once-only; ICE may show a few times. Missing maxAppearances
// means "no cap" so a future encounter does not get silently limited.
function availableEncounters() {
  return ENCOUNTERS.filter(function (enc) {
    if (enc.maxAppearances == null) return true;
    return (state.encounterCounts[enc.id] || 0) < enc.maxAppearances;
  });
}

// Rolled exactly once per completed step (from onStepComplete in game.js),
// but only when the player did not just enter a tent.
function maybeEncounter() {
  const pool = availableEncounters();
  if (pool.length === 0) return; // everyone already met (and ICE iced out)
  if (state.stepsSinceEncounter < CONFIG.ENCOUNTER_COOLDOWN) return;
  state.lastRoll = Math.random();
  if (state.lastRoll < CONFIG.ENCOUNTER_CHANCE) {
    startEncounter(pool[Math.floor(Math.random() * pool.length)]);
  }
}

function startEncounter(enc) {
  if (state.mode !== 'walk') return; // never stack an encounter on top of a popup or the win screen
  state.stepsSinceEncounter = 0;
  state.encounterCounts[enc.id] = (state.encounterCounts[enc.id] || 0) + 1;
  logEvent('Random encounter: ' + enc.id);

  const finish = function () {
    state.mode = 'walk';
    logEvent('Encounter over — back to walking.');
  };

  // Battle intro first (photo or pixel art), then the optional IRL mini-game.
  // enc.run used to skip the battle screen; now it runs after the last line.
  const afterBattle = function () {
    if (enc.run) {
      state.mode = 'modal';
      enc.run(state, finish);
    } else {
      finish();
    }
  };

  if (enc.art || enc.image) {
    state.mode = 'battle';
    Battle.start(enc, afterBattle);
  } else if (enc.run) {
    state.mode = 'modal';
    enc.run(state, finish);
  } else {
    finish();
  }
}
