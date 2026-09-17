# Encounters — who you can meet on the Wiesn

One file in this folder = one random encounter. Copy any of them, change the
fields, add a `<script>` tag for it in `index.html` (next to the other
encounter tags) — done. No other file needs to change.

Friends (Søren, Kruse, Tejs, Toke, Mille) appear **once** per session. ICE may appear
up to **three** times. `game.reset()` clears the counts.

Tent hosts are a different joke. Hofbräu always summons Pitbull, Weinzelt
mægler Valdemar, Käfer Julius Caesar — they are **not** in this folder and
never roll on the grass. They live in `js/tents/<id>/<id>.js`, on that tent's
`host` field (same fields as below) — see `js/tents/README.md`. Booked hosts
get a Wiesn banner with the tent logo at the top of the battle screen.

## The fields

| Field | What it is |
|---|---|
| `id` | unique slug, only used in logs and `game.encounterNow('<id>')` |
| `name` | ALL CAPS name shown in the battle info box, Game Boy style |
| `level` | the fake `:L12` next to the name (pure flavor — pick something funny) |
| `maxAppearances` | how many times this one may be rolled (omit = no cap) |
| `appear` | first text-box line, e.g. `'A wild SØREN appeared!'` |
| `text` | optional second line (a roast) before the attack / menu |
| `image` | photo path (friend cutouts, ICE bottle). Skips pixel art when set |
| `art` | the sprite as ASCII pixel art (see below) — used when there is no `image` |
| `palette` | which color each art character paints |
| `foeAttack` | they attack you: `{ name, result }` — no menu |
| `playerAttacks` | you pick a move: array of `{ name, effective, result }` |
| `fightPrompt` | optional menu heading (default: `What will WIESNHELD do?`) |

## Attacks (the FIGHT box, not a modal)

After the appear text, the battle stays on screen:

- **`foeAttack`** — they move first. The box types `MILLE used TWO HANDS TO ONE!` then the drink punchline. Mille and Kruse dash; ICE uses APPEAR (it pops in again — that's the joke).
- **`playerAttacks`** — a three-move FIGHT menu. Arrows (or `1`/`2`/`3`) pick a row, Enter uses it. `effective: true` prints “It’s super effective!”; `false` prints “It’s not very effective…”. Toke (fanciest wine), Søren (the real Classic CC) and Tejs (pool) work this way.

## Winning, losing, and the turn

Since the two-team mode, an encounter's ending decides whether the active team
keeps the keyboard. The rule lives in ONE place — `afterBattle` in
`js/encounters.js` — and reads `Battle.outcome`:

- **`foeAttack` only** (Mille, ICE): you never got a move, so the scene always
  counts as lost → **the active team loses its turn** (handoff banner, other
  team walks).
- **`playerAttacks`** (Søren, Toke, Tejs): picking the `effective: true` move
  wins → same team keeps walking. Any other move loses → turn handed over.
- **`run(state, finish)`** (Kruse): the encounter decides the turn itself. The
  hook fires after the battle scene, in `'modal'` mode; call `finish()` when
  done to return to walking. Kruse uses it for his real-world rugbrød duel —
  an instruction popup, then a "Who won?" picker whose winner takes the turn
  via `Teams.setActive` + `Teams.announceTurn(finish)`.

No flags needed on the encounter files — the shape of the fight IS the rule.

## Photos vs pixel art

Friend encounters and ICE set `image: 'js/encounters/soeren.png'` (a PNG in
this folder). The battle screen picks one:

- `image` → an `<img class="battle-photo">` (sharp, not pixelated)
- otherwise → ASCII art, one character = one pixel (see below)

Rename files to ASCII (`soeren.png`, not `Søren.png`) so `file://` paths work.

## Drawing a sprite

`art` is a list of strings. **One character = one pixel.** `.` (or any
character missing from the palette) is transparent. Rows don't have to be the
same length. Around 16–18 characters wide and ~16–20 rows tall looks right on
the battle screen — the sprite is upscaled automatically with crisp pixels.

```js
art: [
  '..RRR..',
  '.RRRRR.',   // <- 7 pixels wide, 3 tall
  '..RRR..',
],
palette: { R: '#c41e3a' },
```

Tip: pick a letter per "material" (H = hat, N = skin...) and it stays readable.

## Testing

Open the browser console and run `game.encounterNow('mille')` — that bypasses
the once/three-times pool. Press `E` in debug mode (backtick) for a random one
that is still available. `R` resets the counts.
