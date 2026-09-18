// music.js — the background music: the strolling tune while you walk the
// Wiesn, and the battle clips from the moment a wild friend (or a tent host)
// appears until the player is back on the field — the tent quiz included.
// If the music is wrong, too loud, or won't shut up, the fix is in this file.
//
// The short beeps and jingles are NOT here — those are generated notes in
// js/ui.js (UI.beep). This file only plays the mp3 files in assets/music/.
//
// HOW IT WORKS: one plain <audio> element per mp3, created in JavaScript.
// That is deliberate — an <audio> element plays a local file fine when the game
// is opened by double-click (file://), whereas loading sound data with fetch()
// would silently break that. So: no fetch, no WebAudio decoding, just <audio>.
//
// TWO KINDS OF MUSIC:
//   'overworld' — ONE tune that loops forever, and picks up where it left off
//                 after a fight, so you don't hear its first bar all night.
//   'battle'    — a PLAYLIST (CONFIG.MUSIC.FILES.battle). It plays in order:
//                 the first fight gets clip 1, the next fight clip 2, and so
//                 on, back to clip 1 after the last. If a fight outlasts its
//                 clip, the next clip in the list takes over — same order.
//
// THE RULE: the walking tune belongs to the field. It only plays while the
// player can walk around (and on the win screen). Once a fight starts, the
// battle music keeps going through everything that follows it — the tent quiz,
// Kruse's duel, the badge fanfare, the "next team" banner — and the walking
// tune only returns when the player is back on the field.
//
// WHO CALLS THIS — only a few places, so the music can never get out of step:
//   Teams.confirmIntro (js/teams.js)      → Music.play('overworld')
//   Teams.showIntro    (js/teams.js)      → Music.stop()  (the intro is silent)
//   Battle.start       (js/battle.js)     → Music.stop(), then Music.play('battle')
//   startChallenge     (js/challenges.js) → Music.play('battle')  (a tent with no host)
//   loop               (js/game.js)       → Music.followMode(state.mode), every frame
// plus the M key (js/game.js) → Music.toggleMute().
//
// Browsers refuse to play any sound before the first key press or click. The
// Enter press on the intro screen is that key press, which is why the music
// starts from Teams.confirmIntro and not at boot.
//
// ADDING OR SWAPPING A TUNE: drop the mp3 into assets/music/ and add its file
// name to CONFIG.MUSIC (js/config.js) — the battle list can be any length.
// Volume lives there too. Credits for every track: assets/music/CREDITS.md.

const Music = {

  tracks: {},      // mp3 file path → its <audio> element (made on first use)
  current: null,   // 'overworld' | 'battle' | null (silence)
  audio: null,     // the <audio> element playing right now, or null
  battleIndex: 0,  // position in the battle playlist of the NEXT clip to play
  muted: false,    // toggled with the M key

  // Make (once) and return the <audio> element for an mp3 file.
  // Created on first use, so a missing mp3 costs nothing until it is asked for.
  getTrack: function (file) {
    if (!Music.tracks[file]) {
      const audio = new Audio(file);
      audio.volume = CONFIG.MUSIC.VOLUME;
      audio.muted = Music.muted;
      // A battle clip that runs out hands over to the next one in the list.
      // (The walking tune never "ends" — it has loop switched on in play().)
      audio.addEventListener('ended', function () {
        if (Music.current === 'battle' && Music.audio === audio) Music.startNextBattleClip();
      });
      Music.tracks[file] = audio;
    }
    return Music.tracks[file];
  },

  // Switch to 'overworld' or 'battle'. Asking for the one already playing does
  // nothing, so callers don't have to check first. It is a hard cut, like the
  // Game Boy.
  play: function (name) {
    if (Music.current === name) return;
    Music.stop();
    Music.current = name;
    if (name === 'battle') {
      Music.startNextBattleClip();
    } else {
      const audio = Music.getTrack(CONFIG.MUSIC.FILES.overworld);
      audio.loop = true; // goes round and round; currentTime is left alone so it resumes
      Music.start(audio);
    }
  },

  // Called every frame by the game loop with state.mode. This is THE place that
  // brings the walking tune back: whenever the player is on the field ('walk')
  // or the win screen, the walking tune plays. Every other mode is left alone,
  // so a quiz or a turn banner keeps whatever was playing when it opened —
  // battle music after a fight, the walking tune on the very first banner.
  // Checking every frame (instead of at each "fight is over" spot) means a new
  // mini-game can never forget to switch the music back. It costs nothing:
  // play() returns straight away when that music is already on.
  // ('intro' must stay out of this: before the first key press the browser
  // blocks sound, and play() would then wrongly remember the tune as "on".)
  followMode: function (mode) {
    if (mode === 'walk' || mode === 'win') Music.play('overworld');
  },

  // Play the next clip of the battle playlist from its beginning, and move the
  // bookmark on by one (wrapping around), so whatever comes next — the next
  // fight, or the end of this clip — gets the following one.
  startNextBattleClip: function () {
    const files = CONFIG.MUSIC.FILES.battle;
    const audio = Music.getTrack(files[Music.battleIndex % files.length]);
    Music.battleIndex = (Music.battleIndex + 1) % files.length;
    try { audio.currentTime = 0; } catch (e) { /* not loaded yet — it starts at 0 anyway */ }
    Music.start(audio);
  },

  // Actually press play on an <audio> element.
  start: function (audio) {
    Music.audio = audio;
    try {
      // play() returns a promise that REJECTS when the browser blocks the sound
      // (no key pressed yet) or the mp3 is missing. Swallow it — the game must
      // play on silently, same house rule as UI.beep.
      const started = audio.play();
      if (started && started.catch) started.catch(function () {});
    } catch (e) { /* no music? no problem */ }
  },

  // Silence (used for the tall-grass flash, so the encounter alarm rings alone).
  stop: function () {
    if (Music.audio) Music.audio.pause();
    Music.audio = null;
    Music.current = null;
  },

  // M key. Muting keeps the music running underneath, so un-muting mid-battle
  // brings back the battle clip, not whatever was playing when you muted.
  toggleMute: function () {
    Music.muted = !Music.muted;
    Object.keys(Music.tracks).forEach(function (file) {
      Music.tracks[file].muted = Music.muted;
    });
    UI.toast(Music.muted ? 'Music off 🔇 (M turns it back on)' : 'Music on 🎺');
  },

  // One line for the debug panel, e.g. "battle — battle-3.mp3 (muted)".
  describe: function () {
    if (!Music.audio) return 'silent';
    const file = Music.audio.src.split('/').pop();
    return Music.current + ' — ' + file + (Music.muted ? ' (muted)' : '');
  },
};
