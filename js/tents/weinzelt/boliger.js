// boliger.js — the homes Valdemar shows in HAMMERSLAG (js/tents/weinzelt/weinzelt.js).
//
// This file is CONTENT, not code: one object per bolig. One tent visit plays
// the WHOLE array in order — an episode of the TV show, one round per home.
//
// To add bolig 5: copy an entry, drop five photos + two maps in
// js/tents/weinzelt/boliger/<slug>/ (foto-1.webp … foto-5.webp, danmark.png
// with the whole country, kort.png with the neighbourhood), and the flow, the
// progress lights and the photo counter all follow along.
//
// All prices and facts were scraped from boligsiden.dk on 2026-09-19 — the
// `source` link on each entry is the receipt. The listings will change or sell
// out in the real world; the game does not care, it is a snapshot.
// Maps are OpenStreetMap screenshots — © OpenStreetMap contributors (ODbL).

// ---- Valdemar's sales patter ---------------------------------------------------
// Real(istic) mægler lines, verbatim in Danish — the language is the joke.
// weinzelt.js deals them out one per screen: DRØM lines while the photos dream,
// PRES lines when the teams have to commit to a number, MARKED lines when the
// price is on the table and the market must be talked UP. The dealing is
// deterministic (a fixed index per screen), so browsing back to a photo shows
// the same line and no line ever repeats back-to-back.

const VALDEMAR_DROEM = [
  'Man mærker det med det samme – det her er ikke bare en bolig, det er et hjem',
  'Her bliver søndagene lange og telefonerne lagt væk',
  'Duften af nybagte boller i det lyse køkken-alrum … kan du se det for dig?',
  'Et hjem, der giver plads til både livet, latteren og de stille stunder',
  'Når du træder ind ad hoveddøren, falder skuldrene helt ned',
  'Denne bolig er ikke for alle. Den er for dem, der ved, hvad de vil',
  'Her har børnene plads til at være børn',
  'Et sted, hvor hverdagen føles som ferie',
  'Boligen omfavner dig fra første skridt',
  'Køkkenet er husets hjerte – og dette hjerte banker stærkt',
  'Livskvalitet er svær at sætte kvadratmeterpris på – men vi har prøvet',
  'Sådan en kommer altså kun på markedet én gang i et kvarter som det her',
];

const VALDEMAR_PRES = [
  'Der er allerede rigtig stor interesse på boligen',
  'Jeg skal lige sige, at der sidder et par stykker og kigger på den samme',
  'Vi har haft tre fremvisninger i dag – og én er gået hjem for at snakke med banken',
  'Den her bliver ikke liggende længe, det kan jeg godt love dig',
  'Jeg vil bare ærligt sige det: hvis I vil have den, så skal I handle nu',
  'Jeg har lige fået et bud ind, men jeg synes, I skulle have chancen først',
  'Mange kigger. Få tør. Er du en af dem?',
  'Der er venteliste på lige præcis denne vej',
];

// The MARKED lines land on the HAMMERSLAG reveal, right next to the number —
// whatever the price says, Valdemar says the market says it's cheap.
const VALDEMAR_MARKED = [
  'Det er ikke en pris, det er en investering',
  'Markedet kan kun gå én vej herfra – og det er op',
  'Det ville faktisk være dyrere IKKE at købe',
  'Om fem år griner I af det her tal',
  'Et sundt marked. Et RIGTIGT sundt marked',
  'Beliggenhed, beliggenhed, beliggenhed – og prisen afspejler alle tre',
  'Vi ser ind i et efterår med momentum',
  'Toget kører nu. Der kommer ikke et nyt tog',
];

// ---- the series ----------------------------------------------------------------
//
// Per entry:
//   slug         folder name under js/tents/weinzelt/boliger/
//   address/city/type/agent/headline — straight off the listing; headline is
//                the mægler's own words and is shown as their quote
//   facts        [label, value] rows for the PROSPEKT screen. NEVER put the
//                vurdering or a prisfald here — they give the answer away.
//   photos       file names inside the slug folder, shown one per screen
//   danmark/kort the two maps: where in Denmark, then the neighbourhood
//   hint         optional line shown on the guess screen BEFORE the reveal —
//                the "lykkerider" homes hand out the previous sale price on
//                purpose, because the markup IS the game
//   markup       optional lykkerider stamp on the reveal ('+89 % PÅ ÉT ÅR') —
//                setting it also dresses the hint box as a LYKKERIDER alarm
//   price        the udbudspris in kroner — THE answer (a number; weinzelt.js
//                puts in the dots)
//   priceContext lines shown under the big number on the reveal — here the
//                vurdering, prisfald and markup punchlines belong
//   bonuses      0..n follow-up rounds, each { q, a, context } — same game as
//                the main round: teams write a number, closest wins. `a` is
//                the answer in kroner (revealed big, with the gavel) and
//                `context` is the story under it

const BOLIGER = [
  {
    slug: 'bogtrykkervej',
    address: 'Bogtrykkervej 12, 2. tv.',
    city: '2400 København NV',
    type: 'Ejerlejlighed',
    agent: 'danbolig Nordvest-Emdrup',
    headline: 'Lys og indbydende lejlighed med hele to altaner',
    source: 'https://www.boligsiden.dk/adresse/bogtrykkervej-12-2-tv-2400-koebenhavn-nv',
    facts: [
      ['Bolig', '58 m² · 2 rooms · 1 toilet'],
      ['Built', '1938 · rebuilt 2000'],
      ['Altaner', 'TWO — Valdemar mentions this twice'],
      ['Elevator', 'nej ("good for the legs")'],
      ['Hjemfaldspligt', 'until 2061 — "a detail", says Valdemar'],
    ],
    photos: ['foto-1.webp', 'foto-2.webp', 'foto-3.webp', 'foto-4.webp', 'foto-5.webp'],
    kort: 'kort.png',
    danmark: 'danmark.png',
    hint: null,
    price: 2495000,
    priceContext: [
      'Listed August 2026 at 2.595.000 kr — a prisfald of 100.000 kr (−4%) in September.',
      'Ejerudgift 3.688 kr/md · 43.017 kr/m² · offentlig vurdering 2024: 1.842.000 kr.',
    ],
    bonuses: [
      {
        q: 'The flat last changed hands in April 2024, alm. frit salg. For how much?',
        a: 1700000,
        context: 'And here it is again two years later, asking +47%. '
          + '"Et sundt marked," says Valdemar.',
      },
    ],
  },

  {
    slug: 'hindborgvej',
    address: 'Hindborgvej 141, Hem',
    city: '7800 Skive',
    type: 'Villa',
    agent: 'EDC Poulsen & Vester',
    headline: 'Hyggelig og velindrettet',
    source: 'https://www.boligsiden.dk/adresse/hindborgvej-141-7800-skive',
    facts: [
      ['Bolig', '80 m² + 80 m² kælder · 3 rooms · 2 toilets'],
      ['Grund', '632 m² · garage'],
      ['Built', '1958'],
      ['Where', 'the village of Hem — "kun ca. 6 km til Skive by"'],
    ],
    photos: ['foto-1.webp', 'foto-2.webp', 'foto-3.webp', 'foto-4.webp', 'foto-5.webp'],
    kort: 'kort.png',
    danmark: 'danmark.png',
    hint: null,
    price: 495000,
    priceContext: [
      'Ejerudgift 952 kr/md · 3.890 kr/m² · offentlig vurdering 2024: 555.000 kr.',
      'Yes: ONE Bogtrykkervej altan costs more than this entire house.',
    ],
    bonuses: [
      {
        q: 'The house last sold in September 2003, alm. frit salg. For how much?',
        a: 727447,
        context: 'It has LOST a third of its price in 23 years.',
      },
      {
        // 727.447 kr × (102,58 / 67,61) = 1.103.686 kr — Danmarks Statistiks
        // forbrugerprisindeks (PRIS01), sep 2003 → aug 2026, checked 2026-09-19.
        q: 'Bonus-bonus: what is 727.447 kr from 2003 worth in TODAY\'s money?',
        a: 1104000,
        context: 'Says Danmarks Statistiks forbrugerprisindeks. Inflation-adjusted, '
          + 'the house is down ~55%. Skål for Skive.',
      },
    ],
  },

  {
    slug: 'kildevaenget',
    address: 'Kildevænget 18, Svogerslev',
    city: '4000 Roskilde',
    type: 'Villa',
    agent: 'the listing agent', // boligsiden shows EDC — the joke works without naming them
    headline: 'Overskuelig villa med god kælder',
    source: 'https://www.boligsiden.dk/adresse/kildevaenget-18-4000-roskilde',
    facts: [
      ['Bolig', '60 m² + fuld kælder · 3 rooms · 1 toilet'],
      ['Grund', '764 m² — "god plæne til leg og boldspil"'],
      ['Built', '1960'],
      ['Stand', '"stort potentiale" · "sæt jeres eget præg" (you have seen the photos)'],
    ],
    photos: ['foto-1.webp', 'foto-2.webp', 'foto-3.webp', 'foto-4.webp', 'foto-5.webp'],
    kort: 'kort.png',
    danmark: 'danmark.png',
    // The lykkerider special: the teams GET the previous sale price. The game
    // is guessing how much profit the seller thinks one year is worth.
    hint: 'This exact house sold ONE YEAR AGO — september 2025, alm. frit salg: '
      + '<b>1.800.000 kr</b>. Now the buyer is the seller. What do they ask today?',
    price: 3395000,
    markup: '+89 % PÅ ÉT ÅR',
    priceContext: [
      'Bought for 1.800.000 kr — relisted SIX MONTHS later at 3.575.000 kr (+99%).',
      'A −5% prisfald in June brings it to a modest +89%. Offentlig vurdering 2024: 2.353.000 kr.',
    ],
    bonuses: [],
  },

  {
    slug: 'bryggervangen',
    address: 'Bryggervangen 36, st. 4.',
    city: '2100 København Ø',
    type: 'Ejerlejlighed',
    agent: 'the listing agent',
    headline: 'Indflytningsklar med udgang til fantastisk havestykke',
    source: 'https://www.boligsiden.dk/adresse/bryggervangen-36-0-4-2100-koebenhavn-oe',
    facts: [
      ['Bolig', '53 m² · 2 rooms · 1 toilet'],
      ['Built', '1932 · altan, ingen elevator'],
      ['Kvarter', '"Klimakvartet" — with a sanseområde med krydderurter'],
      ['Uderum', 'a garden piece "næsten som en lille villalejlighed"'],
    ],
    photos: ['foto-1.webp', 'foto-2.webp', 'foto-3.webp', 'foto-4.webp', 'foto-5.webp'],
    kort: 'kort.png',
    danmark: 'danmark.png',
    hint: 'This exact flat sold in april 2025, alm. frit salg: <b>3.195.000 kr</b> — '
      + 'at full asking price. FIVE MONTHS later it was back on the market. '
      + 'What does the buyer-turned-seller ask today?',
    price: 4450000,
    markup: '+39 % PÅ ÉT ÅR',
    priceContext: [
      'Bought April 2025 — relisted FIVE MONTHS later at 4.895.000 kr (+53%).',
      'A −420.000 kr prisfald and one relisting later: 4.450.000 kr, still +39%. '
        + 'Offentlig vurdering 2024: 2.905.000 kr.',
    ],
    bonuses: [],
  },
];
