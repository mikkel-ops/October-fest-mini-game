# Music credits

Every track here is **CC0** (public domain — free to use, no credit required).
We credit anyway, because it's good music. All from OpenGameArt:

| File here | Original track | By | Used for |
|---|---|---|---|
| `overworld.mp3` | `rpgchip03_town` | Aureolus_Omicron ¹ | walking the Wiesn, popups, quizzes |
| `battle-1.mp3` | `rpgchip13_battle_1` | Aureolus_Omicron ¹ | battle playlist, clip 1 |
| `battle-2.mp3` | `Level 1` | Juhani Junkala ² | battle playlist, clip 2 |
| `battle-3.mp3` | `rpgchip14_battle_2` | Aureolus_Omicron ¹ | battle playlist, clip 3 |
| `battle-4.mp3` | `Level 2` | Juhani Junkala ² | battle playlist, clip 4 |
| `battle-5.mp3` | `newbattle` (8 bit battle theme) | celestialghost8 ³ | battle playlist, clip 5 |
| `battle-6.mp3` | `Level 3` | Juhani Junkala ² | battle playlist, clip 6 |

1. "15 Melodic RPG Chiptunes" — <https://opengameart.org/content/15-melodic-rpg-chiptunes>
2. "5 Chiptunes (Action)" — <https://opengameart.org/content/5-chiptunes-action>
3. "8 bit battle theme (famitracker)" — <https://opengameart.org/content/8-bit-battle-theme-famitracker>

The battle clips play in the order listed in `CONFIG.MUSIC.FILES.battle`
(`js/config.js`): one clip per fight, clip 1 → 2 → … → 6 → 1. The two composers'
styles alternate on purpose, so two fights in a row never sound the same.

## How they were made

The originals are `.ogg` / `.wav`. Each was converted with

    ffmpeg -i <original> -af "volume=<N>dB" -codec:a libmp3lame -q:a 4 <name>.mp3

The only change is that volume nudge: the packs were mastered at very different
levels (Junkala's tracks are about 7 dB louder), so each clip was turned up or
down to sit at the same average loudness as `battle-1.mp3` (about -15.5 dB).
Without it the music would jump in volume from one fight to the next.
Gains used: battle-2 −7, battle-3 +0.8, battle-4 −7, battle-5 +1.5, battle-6 −6.6.

These are original chiptunes in the Game Boy RPG style — deliberately NOT the
real Pokémon soundtrack, which is Nintendo's and can't live in a public repo.

## Want a different tune?

Drop the mp3 in this folder and add (or swap) its line in `CONFIG.MUSIC.FILES`
in `js/config.js`. The battle list can be any length. Add a row to the table
above so the next person knows where it came from and that it's free to use.
