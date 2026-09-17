# Tents — what happens when you walk inside

One **subfolder** in here = one tent that has something going on.

```
js/tents/
  hofbraeu/                 tent 3 — Pitbull, a Miami game-show quiz
    hofbraeu.js               the host, his move, the questions
    mr_world_wide.png         the man himself (battle sprite + stage host)
    hofbraeu.css              the game-show set
  kaefer/                   tent 8 — Julius Caesar, Romerriget quiz
    kaefer.js
  weinzelt/                 tent 9 — Valdemar the mægler, housing quiz
    weinzelt.js
    real_estate.png
    weinzelt.css
```

Three tents, three folders — that is the whole list. A tent is only worth opening
once it has a joke of its own as good as Pitbull's or Valdemar's; a generic
mini-game is not the bar, so the other eleven stay closed until they earn one.

Same idea as `js/encounters/`, with one difference: a tent gets a **folder**,
not a single file, because a tent challenge grows — photos, its own CSS, a
second round, a little game in another file. Drop those next to the `<id>.js`
and they stay with their tent.

Tents with nothing in here are **closed**: grey on the map, and walking in
toasts "Noch zu!" instead of giving a badge. That is how the unfinished 11
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
  badge tray slot, the `0 / 3` counter and the win screen all derive from that
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

A host is **booked**, not random: this tent summons this guest every single
time. Never push a host into `ENCOUNTERS` — hosts must not roll on the grass.
Host battles get a Wiesn banner with the tent's official logo at the top of the
battle screen, for free.

**A `foeAttack` is a good way to hand over to the challenge.** Hofbräu's move is
literally called `MR. WORLDWIDE QUIZ` — the box types *"PITBULL used MR.
WORLDWIDE QUIZ!"*, he lunges, your fake HP drops, and the next Enter drops you
onto the quiz-show stage. No engine code was needed for that.

## The shared quiz

`runQuiz` in `js/challenges.js` — a 3-question multiple-choice flow, used by all
three open tents:

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

Three open. The counter (`0 / 3`), the map colors and the win screen all follow
from that by themselves.

| Tent | Host | His move | Then |
|---|---|---|---|
| 3. Hofbräu | PITBULL (photo) `:L305` | `MR. WORLDWIDE QUIZ` | quiz on a Miami game-show stage (`show: 'worldwide'`) |
| 8. Käfer | CAESAR (pixel art) `:L44` | — | quiz, Romerriget |
| 9. Weinzelt | VALDEMAR (photo) `:L89` | `DER ER RIGTIG MEGET INTERESSE` | quiz, the Danish housing market |

The other eleven are closed, and stay that way until someone writes a guest for
them worth walking in for.

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
