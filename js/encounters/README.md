# Encounters — who you can meet on the Wiesn

One file in this folder = one random encounter. Copy any of them, change the
fields, add a `<script>` tag for it in `index.html` (next to the other
encounter tags) — done. No other file needs to change.

## The fields

| Field | What it is |
|---|---|
| `id` | unique slug, only used in logs and `game.encounterNow('<id>')` |
| `name` | ALL CAPS name shown in the battle info box, Game Boy style |
| `level` | the fake `:L12` next to the name (pure flavor — pick something funny) |
| `appear` | first text-box line, e.g. `'A wild OOMPAH BAND marches in!'` |
| `text` | second text-box line — the punchline |
| `art` | the sprite as ASCII pixel art (see below) |
| `palette` | which color each art character paints |

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

## Want a real mini-game instead of the battle intro?

Give the entry a `run: function (state, done) { ... }` and it skips the battle
screen entirely — bring your own UI and call `done()` when finished
(that's the original plug-in seam from `js/encounters.js`).

## Testing

Open the browser console and run `game.encounterNow('lost-tourist')` — or press
`E` in debug mode (backtick) for a random one.
