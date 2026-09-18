# Music credits

Both tracks come from **"15 Melodic RPG Chiptunes"** by **Aureolus_Omicron**,
published on OpenGameArt under **CC0** (public domain — free to use, no credit
required; we credit anyway because it's good music):

<https://opengameart.org/content/15-melodic-rpg-chiptunes>

| File here | Original track | Used for |
|---|---|---|
| `overworld.mp3` | `rpgchip03_town.ogg` | walking the Wiesn, popups, quizzes |
| `battle.mp3` | `rpgchip13_battle_1.ogg` | wild encounters and tent-host battles |

The originals are `.ogg`; they were converted to mp3 with
`ffmpeg -i <track>.ogg -codec:a libmp3lame -q:a 4 <name>.mp3` and are otherwise
untouched.

These are original chiptunes in the Game Boy RPG style — deliberately NOT the
real Pokémon soundtrack, which is Nintendo's and can't live in a public repo.

Want a different tune? The same pack has 13 more (`rpgchip14_battle_2` is a
good alternative fight theme). Drop the mp3 in this folder and point
`CONFIG.MUSIC.FILES` in `js/config.js` at it.
