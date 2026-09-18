// music.js — the background music: the strolling tune while you walk the
// Wiesn, and the battle theme while a wild friend (or a tent host) is on screen.
// If the music is wrong, too loud, or won't shut up, the fix is in this file.
//
// The short beeps and jingles are NOT here — those are generated notes in
// js/ui.js (UI.beep). This file only plays the two mp3 files in assets/music/.
//
// HOW IT WORKS: one plain <audio> element per track, created in JavaScript.
// That is deliberate — an <audio> element plays a local file fine when the game
// is opened by double-click (file://), whereas loading sound data with fetch()
// would silently break that. So: no fetch, no WebAudio decoding, just <audio>.
//
// WHO CALLS THIS — only three places, so the music can never get out of step:
//   Teams.confirmIntro (js/teams.js)  → Music.play('overworld')
//   Battle.start       (js/battle.js) → Music.stop(), then Music.play('battle')
//   Battle.cancel      (js/battle.js) → Music.play('overworld')
// plus the M key (js/game.js) → Music.toggleMute().
//
// Browsers refuse to play any sound before the first key press or click. The
// Enter press on the intro screen is that key press, which is why the music
// starts from Teams.confirmIntro and not at boot.
//
// SWAPPING A TUNE: drop another mp3 into assets/music/ and change the file name
// in CONFIG.MUSIC (js/config.js). Volume lives there too. Credits for the
// current tracks are in assets/music/CREDITS.md.

const Music = {

  tracks: {},     // track name ('overworld' | 'battle') → its <audio> element
  current: null,  // name of the track playing right now, or null for silence
  muted: false,   // toggled with the M key

  // Make (once) and return the <audio> element for a track name.
  // Created on first use, so a missing mp3 costs nothing until it is asked for.
  getTrack: function (name) {
    if (!Music.tracks[name]) {
      const audio = new Audio(CONFIG.MUSIC.FILES[name]);
      audio.loop = true; // background music goes round and round
      audio.volume = CONFIG.MUSIC.VOLUME;
      audio.muted = Music.muted;
      Music.tracks[name] = audio;
    }
    return Music.tracks[name];
  },

  // Switch to a track. Asking for the one already playing does nothing, so
  // callers don't have to check first. It is a hard cut, like the Game Boy.
  play: function (name) {
    if (Music.current === name) return;
    Music.stop();
    Music.current = name;
    try {
      const audio = Music.getTrack(name);
      // The battle theme starts from the top every fight; the walking tune
      // picks up where it left off, so you don't hear its first bar all night.
      if (name === 'battle') audio.currentTime = 0;
      // play() returns a promise that REJECTS when the browser blocks the sound
      // (no key pressed yet) or the mp3 is missing. Swallow it — the game must
      // play on silently, same house rule as UI.beep.
      const started = audio.play();
      if (started && started.catch) started.catch(function () {});
    } catch (e) { /* no music? no problem */ }
  },

  // Silence (used for the tall-grass flash, so the encounter alarm rings alone).
  stop: function () {
    if (Music.current && Music.tracks[Music.current]) Music.tracks[Music.current].pause();
    Music.current = null;
  },

  // M key. Muting keeps the track running underneath, so un-muting mid-battle
  // brings back the battle theme, not whatever was playing when you muted.
  toggleMute: function () {
    Music.muted = !Music.muted;
    Object.keys(Music.tracks).forEach(function (name) {
      Music.tracks[name].muted = Music.muted;
    });
    UI.toast(Music.muted ? 'Music off 🔇 (M turns it back on)' : 'Music on 🎺');
  },
};
