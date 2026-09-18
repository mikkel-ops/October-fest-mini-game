# Wiesn Quest 🍺

A tiny Pokémon-style Oktoberfest game for the browser: walk the Theresienwiese,
step into all **14 big beer tents**, and collect each tent's beer-brand badge.
Collect all 14 and... *O'zapft is!*

Built for a party big screen: no build step, no dependencies, no assets pipeline.

![Wiesn Quest — the Theresienwiese map with 3 of 14 badges collected](assets/screenshot.png)

## Run it

Double-click `index.html`. That's it.

If your browser is picky about `file://` pages, run one command instead:

```sh
python3 -m http.server
```

and open <http://localhost:8000>. For the party: laptop + HDMI + Chrome, press **F** for fullscreen.

## Play it

| Key | Action |
|-----|--------|
| Enter | on the intro screen: lock in the team names, O'zapft is! |
| Arrows / WASD | walk (tap to turn, hold to walk) |
| Enter / Space | confirm popups and battle text |
| ↑ ↓ or 1 / 2 / 3 | pick a FIGHT move on the battle screen |
| , and . | host only: point for team 1 / team 2 (Shift subtracts) |
| F | fullscreen |
| M | music on / off |
| ` (backtick) | debug mode |

Step onto a tent's doorway to take its challenge and win its badge. The tray at
the bottom shows your 14 badge slots.

## Two teams, one Wiesnheld

The game opens on an intro screen where two teams type their names, then take
turns steering the same character (the scoreboard top-left shows whose turn it
is):

- **Conquering a tent ends your turn** — badge first, then the keyboard changes
  hands.
- **Losing a wild encounter ends it early.** Getting ICEd or Mille'd always
  costs the turn; against Søren, Toke or Tejs you keep it only by picking the
  super-effective FIGHT move.
- **Kruse starts a real-world rugbrød duel** — first team to smøre three
  rugbrødsmadder (actual bread, at the table) takes the turn; the host picks
  the winner on screen.

Points are scored **by the host** for now: `,` and `.` at the laptop (or
`game.points(0, 3)` in the console) — how points are earned is still being
decided, and some games happen away from the screen. The win screen reads out
both scores and names the winner.

## Debug it

Open with `?debug=1` (or press backtick). You get: tile grid + coordinates, red
tint on solid tiles, highlighted entrances, and a live stats panel. Debug
hotkeys: `1-9 0 - = [ ]` teleport to tents 1–14, `B` grant next badge, `N` grant
all, `E` force an encounter, `R` reset.

The console always has helpers, e.g. `game.give('hofbraeu')`, `game.teleport(21,12)`,
`game.winNow()`, `game.reset()` — and `game.state` is the entire game state.

## Which file owns what

| Symptom / task | File |
|---|---|
| Wrong tent name, beer, badge color, greeting | `js/tents.js` |
| Change the map (it's ASCII art!), walked through a wall | `js/map.js` |
| Tune speed, encounter odds, NPC count, colors, start position | `js/config.js` |
| Looks wrong (canvas drawing, scaling) | `js/draw.js` |
| Crowd walking wrong, stuck NPCs | `js/npcs.js` |
| Behaves wrong (movement, input, badges, win) | `js/game.js` |
| Teams, turns, the intro screen, the scoreboard | `js/teams.js` |
| Popups, badge tray, win screen, beeps and jingles | `js/ui.js` |
| Background music (walking tune, battle playlist, volume, mute) | `js/music.js` + `CONFIG.MUSIC` in `js/config.js` |
| **Open a tent / edit what happens inside one** | `js/tents/<id>/` (one folder each — see the README there) |
| **Add / edit a random encounter** | `js/encounters/` (one file each — see the README there) |
| Tent registry + the shared quiz flow | `js/challenges.js` |
| Encounter dice roll & kickoff | `js/encounters.js` |
| The battle screen (flash, sprites, text box) | `js/battle.js` + the battle section of `style.css` |
| Debug overlay & hotkeys | `js/debug.js` |

Everything is plain `<script>` tags sharing globals — deliberately no ES modules
and no `fetch()`, so the double-click `file://` launch keeps working.

## Random encounters

While walking, there's a small chance per step of a wild encounter — Game Boy
grass-flash, then a battle screen (you in Lederhosen lower-left, the encounter
upper-right). Friends appear **once** per session; ICE can show **three** times.

After `A wild X appeared!` they either attack you or you pick from a FIGHT menu:

| Who | What happens |
|---|---|
| Mille | `TWO HANDS TO ONE` — she dashes in; that hand makes you take a shot |
| ICE | `APPEAR` (yes, again) — the bottle pops back in; kneel and chug |
| Kruse | `RUGBRØDMAD` — the American girl is sent out the door |
| Toke | pick a wine — Château Margaux is super effective |
| Søren | pick a Classic CC — SHEEP is the real one |
| Tejs | pick a sort game — POOL is the basement-board hit |

Try one from the console: `game.encounterNow('mille')`. Everything that can
appear lives in `js/encounters/`, one file per encounter — see the README there.

## Inside the tents

Four tents are open. Each books a guest for a Game Boy battle, whose move hands
you over to that tent's own challenge:

| Tent | Guest | Then |
|---|---|---|
| 3. Hofbräu | Pitbull (Mr. Worldwide) | `MR. WORLDWIDE QUIZ` — the benches become a Miami game-show stage |
| 4. Hacker | Jensen Huang, leather jacket over Lederhosen | `POEM WITH A GRAPHICS CARD` — a real-world duel: both teams get Claude or ChatGPT to write a rhyming Danish Oktoberfest poem on their phones (one about MIKKEL, one about JAKOB) while a 4:00 clock runs on the TV. An alarm rings at zero, the phones read the poems aloud, the two hosts judge |
| 8. Käfer | Julius Caesar in Lederhosen | quiz: Romerriget |
| 9. Weinzelt | Valdemar LaCour-Valentin, mægler | `DER ER RIGTIG MEGET INTERESSE` — then real facts about the Danish housing market |

You always win: the badge is never withheld, the score just picks the closing
line. Nobody gets locked out of the win screen at 11 pm.

The map tells you where to go at a glance — a tent is coloured only while it is
worth walking into. Win its badge and it greys out with a ✓; the ten tents
with no challenge yet are grey from the start ("Noch zu!" if you walk in).

Each open tent is one folder in `js/tents/`; making a new folder there (plus its
`<script>` tag) opens that tent. See the README there.

## Still to come

- The other ten tents — each needs a guest of its own, as good as Pitbull or
  Valdemar, before it is worth opening.
