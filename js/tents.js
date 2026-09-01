// tents.js — pure data: the 14 big Oktoberfest tents.
// Numbering follows the classic festival map (two rows around the central streets).
// Wrong tent name / beer / badge color? Fix it HERE and nowhere else.
//
// Fields:
//   id       — internal name, used by code and console commands (game.give('hofbraeu'))
//   num      — the tent's number on the map and on its badge
//   mapChar  — the character marking this tent's entrance in map.js
//   colors   — [background, monogram] of the badge disc: the brewery's signature pair
//   monogram — the letter(s) on the badge (stylized homage, not the trademarked logo)
//   greeting — one-line flavor text shown when you enter

const TENTS = [
  { id: 'marstall',       num: 1,  mapChar: '1', name: 'Marstall',
    brewery: 'Spaten-Franziskaner', colors: ['#c8102e', '#ffffff'], monogram: 'S',
    greeting: 'Art-nouveau horses and Spaten beer — the youngest of the big tents (it replaced the Hippodrom in 2014).' },

  { id: 'armbrust',       num: 2,  mapChar: '2', name: 'Armbrustschützenzelt',
    brewery: 'Paulaner', colors: ['#003087', '#f5c518'], monogram: 'P',
    greeting: 'Home of the German crossbow championships since 1935. Steady hands only!' },

  { id: 'hofbraeu',       num: 3,  mapChar: '3', name: 'Hofbräu-Festzelt',
    brewery: 'Hofbräu', colors: ['#1e40af', '#ffffff'], monogram: 'HB',
    greeting: 'The biggest, rowdiest tent of them all — around 10,000 seats!' },

  { id: 'hacker',         num: 4,  mapChar: '4', name: 'Hacker-Festzelt',
    brewery: 'Hacker-Pschorr', colors: ['#2a9df4', '#ffffff'], monogram: 'HP',
    greeting: 'Under the painted clouds of the “Heaven of the Bavarians”.' },

  { id: 'schottenhamel',  num: 5,  mapChar: '5', name: 'Festhalle Schottenhamel',
    brewery: 'Spaten-Franziskaner', colors: ['#c8102e', '#ffffff'], monogram: 'S',
    greeting: 'The oldest tent (1867) — where the mayor taps the first keg. O’zapft is!' },

  { id: 'schuetzen',      num: 6,  mapChar: '6', name: 'Schützen-Festzelt',
    brewery: 'Löwenbräu', colors: ['#1d3557', '#f4a261'], monogram: 'L',
    greeting: 'The riflemen’s tent below the Bavaria statue — 110 shooting stands.' },

  { id: 'paulaner',       num: 7,  mapChar: '7', name: 'Paulaner Festzelt',
    brewery: 'Paulaner', colors: ['#003087', '#f5c518'], monogram: 'P',
    greeting: 'Under the giant rotating Paulaner mug (the old Winzerer Fähndl).' },

  { id: 'kaefer',         num: 8,  mapChar: '8', name: 'Käfer Wiesn-Schänke',
    brewery: 'Paulaner', colors: ['#003087', '#f5c518'], monogram: 'P',
    greeting: 'The celebrity hideout — a cosy wooden lodge, open till half past midnight.' },

  { id: 'weinzelt',       num: 9,  mapChar: '9', name: 'Kufflers Weinzelt',
    brewery: 'Weinzelt (wine!)', colors: ['#722f37', '#f5e6c8'], monogram: 'W',
    greeting: 'Wine, Champagne and Schickeria until 1 am. No Maß in sight.' },

  { id: 'loewenbraeu',    num: 10, mapChar: 'a', name: 'Löwenbräu-Festzelt',
    brewery: 'Löwenbräu', colors: ['#1d3557', '#f4a261'], monogram: 'L',
    greeting: 'A roaring lion guards the door. Löööwenbräääu!' },

  { id: 'braeurosl',      num: 11, mapChar: 'b', name: 'Pschorr-Festzelt Bräurosl',
    brewery: 'Hacker-Pschorr', colors: ['#2a9df4', '#ffffff'], monogram: 'HP',
    greeting: 'The Bräurosl — famous for its yodeler and for Gay Sunday.' },

  { id: 'augustiner',     num: 12, mapChar: 'c', name: 'Augustiner-Festhalle',
    brewery: 'Augustiner', colors: ['#2a7d2f', '#ffffff'], monogram: 'A',
    greeting: 'Beer poured from real wooden barrels — the connoisseur’s choice.' },

  { id: 'ochsenbraterei', num: 13, mapChar: 'd', name: 'Ochsenbraterei',
    brewery: 'Spaten', colors: ['#c8102e', '#ffffff'], monogram: 'S',
    greeting: 'A whole ox turns on the spit here — since 1881.' },

  { id: 'fischervroni',   num: 14, mapChar: 'e', name: 'Fischer-Vroni',
    brewery: 'Augustiner', colors: ['#2a7d2f', '#ffffff'], monogram: 'A',
    greeting: 'Steckerlfisch! Grilled fish on a stick since 1904.' },
];

// quick lookup by id, used by the console verbs in game.js (e.g. game.give('hofbraeu'))
const TENT_BY_ID = {};
TENTS.forEach(function (t) { TENT_BY_ID[t.id] = t; });
