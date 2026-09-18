# Wiesn Quest — notes for Claude

A Pokémon-style Oktoberfest party game, shown on a big screen from a laptop.
The player walks the Theresienwiese, enters 14 beer tents, collects badges.

## Hard constraints (these dominate every code decision)

- **No build step, no dependencies, no assets pipeline.** The game must run by
  double-clicking `index.html` (`file://`). That means: plain `<script>` tags
  sharing globals — **never ES modules, never `fetch()`**, no bundler.
- **Readable by a non-frontend developer.** Mikkel maintains this and is not
  sharp on frontend: prefer plain functions and comments explaining *why*,
  avoid clever abstractions. Match the existing comment-heavy style.
- Text is English with Bavarian flavor ("O'zapft is!", "Weiter!"). Badges are
  beer-brand emblems with tent-number chips; the 2026 tent lineup is final.

## Architecture (one file = one concern)

| File | Owns |
|---|---|
| `js/config.js` | every tunable number and color — constants live here, nowhere else |
| `js/tents.js` | tent data (names, brands, colors, logos) |
| `js/map.js` | the ASCII-art map + collision |
| `js/npcs.js` | wandering festival-goers |
| `js/encounters.js` | encounter dice roll + kickoff |
| `js/encounters/*.js` | one file per random encounter (sprite art, name, text) |
| `js/battle.js` | the Game Boy battle screen for encounters |
| `js/challenges.js` | the `CHALLENGES` registry + the shared 3-question quiz flow |
| `js/tents/<id>/` | one subfolder per OPEN tent — `<id>.js` registers its host + challenge |
| `js/ui.js` | all HTML overlays: modals, tray, win screen, beeps and jingles (generated, no files) |
| `js/music.js` | background music from `assets/music/` via plain `<audio>` (works on `file://`): one looping walking tune + a battle playlist that advances one clip per fight; the walking tune only plays on the field (`Music.followMode`, every frame) — battle music carries through the tent quiz; M mutes |
| `js/teams.js` | two-team mode: intro screen, whose turn it is, turn banners, scoreboard |
| `js/draw.js` | everything painted on the canvas |
| `js/game.js` | state object, input, movement, game flow — boots everything, loads last |
| `js/debug.js` | debug panel + hotkeys (`?debug=1` or backtick) |

The whole game is one global `state` object with a mode string:
`'intro' | 'walk' | 'modal' | 'battle' | 'win'`. Extension points are registries, not
game-flow edits: `CHALLENGES` (object keyed by tent id; each folder in
`js/tents/` sets one key — that key is also what makes the tent *open*) and
`ENCOUNTERS` (array; each file in `js/encounters/` pushes one entry). Both
kinds of file are loaded by a `<script>` tag in `index.html` — tent files must
come after `js/challenges.js`.

## Teams & turns

Two teams share the one player character and alternate turns (`js/teams.js`;
data on `state.teams` / `state.activeTeam`). The rules, all enforced in exactly
one place each:

- **A turn = one tent visit** — the badge fanfare calls `Teams.handoff()`
  (`awardBadge` in `js/game.js`).
- **Losing a street encounter costs the turn** — `Battle.useMove` records
  `Battle.outcome` ('won' iff the player picked the `effective: true` move;
  foe-only attacks are always 'lost'), `Battle.finish(outcome)` passes it out,
  and `afterBattle` in `js/encounters.js` is THE turn rule. Host battles ignore
  the outcome. An encounter with a `run` hook decides the turn itself (Kruse's
  real-world rugbrød duel picks a winner on screen).
- **Points are an open question** — Mikkel hasn't fixed scoring yet, and some
  games are physical. `Teams.addPoints` is the seam; today only the host's
  `,` / `.` keys (any mode, Shift subtracts) and `game.points()` call it. Do
  not wire tent scores into it without asking.
- The intro screen (mode `'intro'`) takes team names; its keydown branch runs
  **before** the game's `preventDefault`, so inputs get real typing. Only
  `Teams.handoff` / `Teams.setActive` may change whose turn it is.

## Tent mechanics

Full write-up in `js/tents/README.md` — read it before touching a tent. The short
version:

- Entrance tile → `startChallenge(tent)` → optional **host battle** (booked
  guest, same screen as encounters, gets a Wiesn banner) → `run(tent, done)` →
  `done(true)` → `awardBadge` → fanfare.
- **A tent is open iff `CHALLENGES[<id>]` exists** — i.e. iff its `<script>` tag
  is in `index.html`. Map chip, tray slot, `0 / N` counter and win screen all
  derive from that alone. Four tents are open; `js/tents/` holds exactly those
  four folders and nothing else.
- **One badge per tent.** `tentIsAvailable(tent)` = open and not yet won, and it
  is what the map paints from: coloured means "walk here", grey + ✓ means done,
  grey + number means not open yet. `startChallenge` refuses a won tent.
- **You always win.** Every tent calls `done(true)` regardless of performance;
  the score only picks the closing line. It's a party game on a TV — nobody gets
  locked out at 11 pm. (`done(false)` exists but is deliberately unused.)
- A host's `foeAttack` is the idiomatic hand-off into the challenge: Hofbräu's
  move is `MR. WORLDWIDE QUIZ`, which needed no engine code.
- `runQuiz(tent, spec, done)` is the shared 3-question flow. `spec.show` dresses
  its popups with a per-tent theme (`UI.setShow` → class `show-<name>` on
  `#modal` + the `#modal-backdrop` layer); those looks live in the tent's own
  CSS file with its own `<link>`, e.g. `js/tents/hofbraeu/hofbraeu.css`.
  **Every popup `runQuiz` opens must pass `show:` along** or the screen snaps
  back to beige mid-quiz.
- **Not every tent is a quiz.** Hacker (tent 4, Jensen Huang, `POEM WITH A
  GRAPHICS CARD`) is a real-world duel played on the teams' phones: five popups
  with one-word titles (`RULES` with DO / DON'T → `WHO` → `TIME` → `STOP` →
  `LISTEN`), a deadline-based countdown that Enter starts, `alarm.mp3` at zero,
  and Enter on `LISTEN` calls `done(true)`. Numbers in `CONFIG.POEM`. `STOP`
  calls `Music.stop()` so the alarm and the poems get a quiet room. It does
  NOT call `Teams.addPoints` — the two hosts score by hand.
- **The bar for opening a tent is a bespoke joke** — a booked guest with a name,
  a move and their own game (Pitbull, Valdemar, Caesar, Jensen Huang). Generic skill
  mini-games were tried and cut; don't propose a twelfth variation on a timing
  bar as a way to open a tent.

## How to verify changes

Serve the repo root (`python3 -m http.server <port>`) and drive headless
Chromium with the Playwright in Mikkel's poetry venv:
`/Users/mikkelgronning/Library/Caches/pypoetry/virtualenvs/mikkelgronning-tnDSdj2W-py3.12/bin/python`.
`window.game`, `state`, and globals like `held` are readable via
`page.evaluate`. Useful hooks: `game.encounterNow('<id>')`, `game.give('<tentId>')`,
`game.teleport(x, y)`, `game.reset()`.

Timing traps (learned the hard way):

- A keyboard tap only **turns** the player (tap-to-turn, 80 ms) — hold a key
  ~450 ms to actually step.
- Modals ignore Enter for 250 ms after opening (and the battle text box for
  200 ms per line); Playwright CDP round-trips can exceed that — test those
  guards with in-page synthetic `KeyboardEvent`s, not real key presses.
- Quick no-browser sanity check: the data files eval under `node` if top-level
  `const` is rewritten to `var`.
