# Tents — what happens when you walk inside

One **subfolder** in here = one tent that has something going on.

```
js/tents/
  hacker/                   tent 4 — Jensen Huang, an AI poetry duel on the phones
    hacker.js                 the host, his move, the five screens (rules → clock → listen)
    hacker.css                the cloud set + the DO / DON'T and clock layout
    alarm.mp3                 the time's-up alarm
  hofbraeu/                 tent 3 — Pitbull, a Miami game-show quiz
    hofbraeu.js               the host, his move, the questions
    mr_world_wide.png         the man himself (battle sprite + stage host)
    hofbraeu.css              the game-show set
  kaefer/                   tent 8 — Julius Caesar, Romerriget quiz
    kaefer.js
  paulaner/                 tent 7 — Mama Lauda, a real-world Maß-holding duel
    paulaner.js               the host, her move, the five screens (rules → clock → prost)
    paulaner.css              the race-track set + the DO / DON'T and clock layout
    mama_lauda.jpg            the photo (battle sprite + stage host)
    mama-lauda.mp3            her song — NOT in the repo, see "Paulaner" below
  weinzelt/                 tent 9 — Valdemar the mægler, housing quiz
    weinzelt.js
    real_estate.png
    weinzelt.css
```

Five tents, five folders — that is the whole list. A tent is only worth opening
once it has a joke of its own as good as Pitbull's or Valdemar's; a generic
mini-game is not the bar, so the other nine stay closed until they earn one.

Same idea as `js/encounters/`, with one difference: a tent gets a **folder**,
not a single file, because a tent challenge grows — photos, its own CSS, a
second round, a little game in another file. Drop those next to the `<id>.js`
and they stay with their tent.

Tents with nothing in here are **closed**: grey on the map, and walking in
toasts "Noch zu!" instead of giving a badge. That is how the unfinished 9
tents stay out of the way.

> Tent **names, breweries, colors, logos and greetings** are not in here —
> they live in the table in `js/tents.js`. This folder is behaviour only.

---

## The mechanics: what actually happens, in order

```
you step onto the tent's entrance tile      (js/game.js)
        │
        ▼
startChallenge(tent)                        (js/challenges.js)
        │   closed tent? → UI.toast('Noch zu!') and nothing else happens
        │
        ├── has a host?  → state.mode = 'battle'
        │                  Battle.start(host, runIt, tent)   (js/battle.js)
        │                    1. tall-grass flash            850 ms
        │                    2. both sprites slide in       800 ms
        │                    3. types `appear`, then `text`  Enter per line
        │                    4. the fight:
        │                         foeAttack     → they hit you, one move
        │                         playerAttacks → a 3-move FIGHT menu
        │                         neither       → straight on
        │                    5. Enter → Battle.finish() → runIt
        │
        ▼
state.mode = 'modal';  challenge.run(tent, done)
        │   your challenge: a quiz, a dare, anything you like
        ▼
done(true)   → awardBadge(tent)    (js/game.js) → fanfare → win check
done(false)  → back to walking, tent stays unbadged (nothing uses this yet)
```

Two rules that fall out of this:

- **A tent is OPEN if and only if `CHALLENGES[<id>]` exists.** The map chip, the
  badge tray slot, the `0 / 5` counter and the win screen all derive from that
  one fact via `tentIsOpen` / `openTents` in `js/challenges.js`. Register a key,
  and the tent lights up everywhere by itself.
- **`done` must always be called**, or the game is stuck in `'modal'` mode with
  no way back to walking.

### House rule: you always win

Every tent so far ends in `done(true)` no matter how badly you played. The score
only picks the closing line. This is a party game on a TV — a guest who fails a
quiz at 11 pm must not be locked out of the win screen. Failing is flavor, not a
gate.

---

## Opening a new tent

Three steps, no other file needs to change:

1. `mkdir js/tents/<id>` — `<id>` is the tent's `id` from `js/tents.js`
   (`braeurosl`, `augustiner`, …).
2. Copy the closest existing tent to `js/tents/<id>/<id>.js` and edit it —
   `kaefer/` for a plain quiz, `hofbraeu/` or `weinzelt/` for a themed one with
   its own CSS and photo.
3. Add its `<script>` tag to `index.html`, next to the other tent tags
   (**after** `js/challenges.js` — that file creates the `CHALLENGES` object
   these files write into).

## What goes in `<id>.js`

One assignment: `CHALLENGES.<id> = { host, run }`.

| Field | What it is |
|---|---|
| `run(tent, done)` | **required.** Your challenge. `tent` is the row from `js/tents.js` (`tent.num`, `tent.name`, `tent.colors`, `tent.greeting`). Call `done(true)` to award the badge. |
| `host` | optional booked guest — a Game Boy battle before the challenge. |

### Host fields

Identical to an encounter in `js/encounters/`, because it is the same battle
screen:

| Field | What it is |
|---|---|
| `name` | ALL CAPS name in the info box |
| `level` | the fake `:L305` — pure flavor, pick something funny |
| `appear` | first typed line, e.g. `'A wild MR. WORLDWIDE appeared!'` |
| `text` | optional second line before the fight |
| `image` | a photo (cutout PNG) — skips pixel art when set |
| `art` + `palette` | ASCII pixel art, one character = one pixel, `.` transparent |
| `foeAttack` | `{ name, result }` — they move on you, no menu |
| `playerAttacks` | `[{ name, effective, result }]` — a 3-move FIGHT menu |
| `fightPrompt` | menu heading (default `What will WIESNHELD do?`) |
| `music` | optional mp3 of the host's OWN song. It plays instead of the battle playlist, looping, until the player is back on the field. If the file is missing the playlist plays as usual (`Music.startHostSong` in `js/music.js`). Only Mama Lauda has one. |

A host is **booked**, not random: this tent summons this guest every single
time. Never push a host into `ENCOUNTERS` — hosts must not roll on the grass.
Host battles get a Wiesn banner with the tent's official logo at the top of the
battle screen, for free.

**A `foeAttack` is a good way to hand over to the challenge.** Hofbräu's move is
literally called `MR. WORLDWIDE QUIZ` — the box types *"PITBULL used MR.
WORLDWIDE QUIZ!"*, he lunges, your fake HP drops, and the next Enter drops you
onto the quiz-show stage. No engine code was needed for that.

## The shared quiz

`runQuiz` in `js/challenges.js` — a 3-question multiple-choice flow, used by the
three quiz tents (Hofbräu, Käfer, Weinzelt):

```js
run: function (tent, done) {
  runQuiz(tent, {
    skipIntro: true,   // the host battle already said the hook — go to Q1
    hook: '...',       // intro line, only used when skipIntro is falsy
    wrap: function (score, total) { return '...'; },   // the closing line
    questions: [
      { q: 'Question?', choices: ['a', 'b', 'c'], answer: 0,
        right: 'shown when correct', wrong: 'shown when wrong' },
      // ... three is the house style
    ],
    // optional dressing, see below
    show: 'worldwide', showTitle: '★ MR. WORLDWIDE QUIZ ★',
    rightTitle: 'DALE! ✅', wrongTitle: 'ay caramba… ❌',
  }, done);
},
```

Answers are picked with `1` / `2` / `3` or by clicking. Each answer plays a
sting (`UI.playSting`). The quiz always ends in `done(true)`.

You do **not** have to use `runQuiz`. `run` can do anything: `UI.showModal`, a
drinking dare, your own overlay and animation. Just call `done(true)` when
you're finished, or the game is stuck in `'modal'` mode with no way back to
walking.

## Themed popups (`show`)

By default a challenge's popups are the beige modal over the live map. A tent can
dress them instead — Hofbräu turns its into a Miami game show:

- `show: 'worldwide'` in the quiz spec → `UI.setShow('worldwide')` puts the class
  `show-worldwide` on `#modal` and un-hides `#modal-backdrop`, the layer the
  scenery is painted on.
- The looks live in the **tent's own CSS file**, `js/tents/hofbraeu/hofbraeu.css`,
  loaded by a `<link>` in `index.html` next to its `<script>`. Everything in
  there is scoped under `.show-worldwide`, so no other tent is affected. Image
  URLs inside it are relative to the CSS file, so the folder stays portable.
- Animation speeds come from `CONFIG.SHOW` in `js/config.js` and are handed to
  CSS as `--show-chase` / `--show-sweep`.
- A themed quiz also gets a row of round progress lights (`quizLights`) instead
  of `1/3` in the title.

**The trap:** `runQuiz` opens *four* different popups (intro, question,
right/wrong, wrap-up) and every one of them has to pass `show:` along. Miss one
and the screen snaps back to beige in the middle of the quiz. `UI.hideOverlays`
clears the theme, so a `game.reset()` mid-quiz can't leave the stage dressed.

It is called "show", not "stage", because `#stage` is already the canvas wrapper.

## What each open tent does today

Five open. The counter (`0 / 5`), the map colors and the win screen all follow
from that by themselves.

| Tent | Host | His move | Then |
|---|---|---|---|
| 4. Hacker | JENSEN (pixel art, placeholder) `:L5090` | `POEM WITH A GRAPHICS CARD` | a real-world AI poetry duel — see below (`show: 'cloud'`) |
| 3. Hofbräu | PITBULL (photo) `:L305` | `MR. WORLDWIDE QUIZ` | quiz on a Miami game-show stage (`show: 'worldwide'`) |
| 7. Paulaner | MAMA LAUDA (photo) `:L1` | `MASSKRUGSTEMMEN` | a real-world Maß-holding duel — see below (`show: 'lauda'`) |
| 8. Käfer | CAESAR (pixel art) `:L44` | — | quiz, Romerriget |
| 9. Weinzelt | VALDEMAR (photo) `:L89` | `DER ER RIGTIG MEGET INTERESSE` | quiz, the Danish housing market |

The other nine are closed, and stay that way until someone writes a guest for
them worth walking in for.

### Hacker: the one tent that is not a quiz

`js/tents/hacker/hacker.js` is the example of a `run` that does **not** use
`runQuiz`. It is a real-world duel (like Kruse's rugbrød duel on the street):
both teams get Claude or ChatGPT to write a rhyming Danish Oktoberfest poem on
their phones — one about MIKKEL, one about JAKOB — and the TV only explains
the rules and runs the clock. Five popups, each with a **one-word title** so
two tipsy teams can follow it from the sofa:

| Screen | What it shows | Enter |
|---|---|---|
| `RULES` | a green **DO** column and a red **DON'T** column | next |
| `WHO` | which team writes about which host (team whose turn it is → MIKKEL) | next |
| `TIME` | the big clock, waiting at 4:00 | **starts** the clock; once running, Enter ends the round early |
| `STOP` | `PHONES DOWN!` — `alarm.mp3` rings when the clock hits zero | next (and silences the alarm) |
| `LISTEN` | a waiting screen: team 1's phone reads its poem aloud, then team 2's | ends the mini-game → `done(true)` |

Things worth knowing before you touch it:

- Every number is in `CONFIG.POEM` (`js/config.js`): `SECONDS` (240), the line
  count, the host names, the low-time and tick thresholds, the alarm volume.
- The clock counts from a fixed **deadline** (`performance.now()`), not ticks,
  and its interval **stops itself** when its clock element is gone or `#modal`
  is hidden — so `game.reset()` mid-round can't leave a timer running or throw
  a `STOP` popup over the intro screen.
- `EARLY_END_GUARD_MS`: for the first 5 seconds Enter just re-shows the clock,
  so a double-tap on "START" can't end the round at 3:59.
- The alarm is a plain `<audio>` element (works on `file://`, no `fetch()`),
  created when the clock starts so it is loaded by zero. If it can't play, a
  generated `UI.beep` buzzer sounds instead. An early end rings no alarm.
- The battle music plays while the teams type. The `STOP` screen calls
  `Music.stop()`, so the alarm rings alone and the room is quiet while the
  phones read; the walking tune comes back by itself once the player is on the
  field again (`Music.followMode`).
- Every popup goes through one `screen()` helper that passes `show: 'cloud'`,
  so none of them can forget it (the trap described above).
- **Points are not wired in.** The two hosts are the jury (Creativity, Fun,
  Rhyme — one point each) and score by hand with `,` / `.` or by clicking the
  team chips; `hacker.css` lifts `#teambar` above the popup so that works while
  `LISTEN` is still up.

### Paulaner: the other tent that is not a quiz

`js/tents/paulaner/paulaner.js` is built on the Hacker pattern — a real-world
duel where the TV only explains the rules and runs the clock — but the clock
counts **up**. Each team sends one champion; both hold a full 1-litre Maß at
arm's length; the last arm standing wins. The tent with a giant beer mug on its
tower books MAMA LAUDA, mother of Niki, from the après-ski anthem. Her level is
`:L1` because that is what the battle screen prints: **1 L**.

| Screen | What it shows | Enter |
|---|---|---|
| `RULES` | a green **DO** column and a red **DON'T** column | next |
| `CHAMPION` | both teams: send ONE champion to the front | next |
| `READY` | the big clock, waiting at `0:00.0` | **starts** it: `3… 2… 1…`, then the clock runs |
| `HOLD` | the clock counting up, and Mama heckling underneath | **stops** it — press when BOTH champions are out |
| `PROST` | the final time (= the winner's time) and Mama's verdict | ends the mini-game → `done(true)` |

Things worth knowing before you touch it:

- Every number is in `CONFIG.STEMMEN` (`js/config.js`): the countdown, the
  double-tap guard, when the clock turns orange and red, the verdict limits —
  and `HECKLES`, the list of what Mama shouts and from which second.
- **Enter starts it and Enter stops it — that is the whole control scheme**, on
  purpose. The game does not know who dropped first; the room does.
- The clock is computed from the moment it **started** (`performance.now()`),
  not by counting ticks, and its interval **stops itself** when its clock
  element is gone or `#modal` is hidden — same safety as Hacker's, so
  `game.reset()` mid-round leaves nothing running.
- The `3… 2… 1…` is not a separate screen: Enter on `READY` puts the start
  moment `COUNTDOWN_S` seconds into the future, and while "now" is before it the
  clock shows the countdown. Set `COUNTDOWN_S: 0` to start at once.
- `END_GUARD_MS`: until the clock has run for 5 seconds, Enter just re-shows it,
  so a double-tap on "START" can't end the round during the countdown.
- **Her song.** The host has `music: 'js/tents/paulaner/mama-lauda.mp3'`, so the
  fight and the whole duel play her song instead of the battle playlist (the
  only host who does — see `music` in the host fields above). Unlike Hacker,
  nothing here calls `Music.stop()`: a stamina duel wants a soundtrack.
  **The mp3 is a commercial recording and this repo is public, so the file is in
  `.gitignore` and must stay there.** Copy it into `js/tents/paulaner/` on the
  party laptop by hand. If it is missing, the normal battle music plays and
  nothing else changes.
- The photo is a phone screenshot with black bars. `paulaner.css` keeps the
  left side of the set black so the bars vanish next to the popups.
- **Points are not wired in.** The hosts give the winner a point by hand with
  `,` / `.` or by clicking the team chips; `paulaner.css` lifts `#teambar`
  above the popup so that works while `PROST` is still up.

## Three states, one glance at the map

A tent is painted from two facts, and the helpers in `js/challenges.js` are the
only place that decides:

| State | `tentIsOpen` | `tentIsDone` | On the map |
|---|---|---|---|
| available | yes | no | brand colors, numbered chip — **walk here** |
| already won | yes | yes | grey, chip becomes a ✓ |
| not open yet | no | — | grey, numbered chip |

`tentIsAvailable(tent)` is the one to use when drawing or deciding: open and not
yet won. One badge per tent — `startChallenge` refuses a tent you have already
conquered, so the console and the debug hotkeys obey the rule too. The chips are
rebuilt from `UI.refreshTray`, which runs on every badge and on `game.reset()`.

## Testing

Serve the repo (`python3 -m http.server 8000`) and, in the browser console:

- `startChallenge(TENT_BY_ID['hofbraeu'])` — run one tent without walking there.
- `game.teleport(x, y)` — drop next to a tent entrance and walk in.
- `game.give('<id>')` — hand yourself the badge without playing.
- `game.reset()` — clear badges and encounter counts and start over.

Press backtick for the debug panel (grid, collision tint, teleport hotkeys).

Driving it from Playwright? Two traps that cost real time:

- **`js/game.js` switches on `e.code`, not `e.key`** — synthetic events need
  `{code: 'Enter'}` / `{code: 'Digit1'}`, dispatched on `window`.
- Use in-page synthetic `KeyboardEvent`s, not real key presses: modals ignore
  Enter for 250 ms and the battle text box for 200 ms per line, and CDP
  round-trips blow straight past those guards. Every battle line needs one Enter
  to finish typing and one more to advance, so a host with `appear` + `text` +
  a `foeAttack` is six Enters before the challenge starts.
