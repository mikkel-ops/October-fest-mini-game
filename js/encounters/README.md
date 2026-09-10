# Encounters — who you can meet on the Wiesn

One file in this folder = one random encounter. Copy any of them, change the
fields, add a `<script>` tag for it in `index.html` (next to the other
encounter tags) — done. No other file needs to change.

Friends (Søren, Kruse, Tejs, Toke) appear **once** per session. ICE may appear
up to **three** times. `game.reset()` clears the counts.

## The fields

| Field | What it is |
|---|---|
| `id` | unique slug, only used in logs and `game.encounterNow('<id>')` |
| `name` | ALL CAPS name shown in the battle info box, Game Boy style |
| `level` | the fake `:L12` next to the name (pure flavor — pick something funny) |
| `maxAppearances` | how many times this one may be rolled (omit = no cap) |
| `appear` | first text-box line, e.g. `'A wild SØREN appeared!'` |
| `text` | second text-box line — the punchline |
| `image` | photo path (friend cutouts, ICE bottle). Skips pixel art when set |
| `art` | the sprite as ASCII pixel art (see below) — used when there is no `image` |
| `palette` | which color each art character paints |
| `run` | optional IRL / mini-game: runs **after** the battle text, then call `done()` |

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

## Want a real mini-game after the battle intro?

Give the entry a `run: function (state, done) { ... }` — the Game Boy battle
still plays first (photo or pixel art + typewriter roast). When the last line
is dismissed, `run` opens (a modal, an IRL prompt…). Call `done()` when
finished.

Friends use this for party activities: CC callouts, leverpostejmad, basement
pool, a nyrig wine lecture. ICE has no `run` — icing is the punchline.

## Testing

Open the browser console and run `game.encounterNow('soeren')` — that bypasses
the once/three-times pool. Press `E` in debug mode (backtick) for a random one
that is still available. `R` resets the counts.
