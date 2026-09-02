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
| `js/challenges.js` | per-tent challenges (registry, mostly stubs) |
| `js/ui.js` | all HTML overlays: modals, tray, win screen, sounds |
| `js/draw.js` | everything painted on the canvas |
| `js/game.js` | state object, input, movement, game flow — boots everything, loads last |
| `js/debug.js` | debug panel + hotkeys (`?debug=1` or backtick) |

The whole game is one global `state` object with a mode string:
`'walk' | 'modal' | 'battle' | 'win'`. Extension points are registries, not
game-flow edits: `CHALLENGES` (object keyed by tent id) and `ENCOUNTERS`
(array; each file in `js/encounters/` pushes one entry).

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
