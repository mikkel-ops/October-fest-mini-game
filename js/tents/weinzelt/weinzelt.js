// Tent 9 — Kufflers Weinzelt. No Maß in here: real estate agent VALDEMAR
// LACOUR FALKENBERG has booked the Schickeria table (of course he has) and is
// hosting HAMMERSLAG: real homes from boligsiden.dk — real photos, real maps —
// and both teams write down what they think each udbudspris is. Closest team
// takes the round; the hosts judge and score by hand, like at the Hacker and
// Paulaner tents. Then Valdemar swings the gavel.
//
// One visit = the WHOLE series (js/tents/weinzelt/boliger.js), one home after
// another — an episode of the TV show, four homes long. The progress dots
// count homes, not screens. The arrow keys browse back and forth through a
// home's photos and maps; Enter always moves the show forward. The knobs live
// in CONFIG.HAMMERSLAG.
//
// The files of this tent:
//   weinzelt.js          this — the host, his move, the screens
//   boliger.js           the homes + Valdemar's mægler lines (CONTENT — add here)
//   boliger/<slug>/      five photos + two OpenStreetMap maps per home
//   real_estate.png      Valdemar himself (battle sprite + waiting by the door)
//   weinzelt.css         the åbent hus set (show: 'visning')
//
// Registering this key is what makes tent 9 OPEN (see js/challenges.js).

CHALLENGES.weinzelt = {
  host: {
    name: 'VALDEMAR',
    level: 89, // the m² of the flat he's showing (66 of them are "usable")
    // A photo cutout, not pixel art — battle.js renders enc.image the same
    // way as the friends in js/encounters/ and Pitbull in js/tents/hofbraeu/.
    image: 'js/tents/weinzelt/real_estate.png',
    appear: 'A wild VALDEMAR LACOUR FALKENBERG appeared!',
    text: 'He fans a stack of prospectuses across the Schickeria table. "Der er rigtig meget interesse."',
    // His attack IS the show: battle.js types the line, he lunges, your fake
    // HP drops — then Enter opens the HAMMERSLAG studio below.
    foeAttack: {
      name: 'HAMMERSLAG',
      effective: true, // "It's super effective!" — the line always works
      result: 'The Weinzelt becomes a TV studio. Real homes, real photos — write down your price. Closest team takes each round.',
    },
  },

  run: function (tent, done) {
    const H = CONFIG.HAMMERSLAG;
    const SHOW = 'visning';               // dress every popup — see weinzelt.css
    const ROUNDS = BOLIGER.length;        // one round per home, all in this visit

    // Warm the browser cache for every home up front, so flipping through the
    // photos never flashes a half-loaded image (on file:// this is
    // near-instant anyway).
    BOLIGER.forEach(function (bolig) {
      bolig.photos.concat([bolig.danmark, bolig.kort]).forEach(function (file) {
        new Image().src = 'js/tents/weinzelt/boliger/' + bolig.slug + '/' + file;
      });
    });

    // ---- Valdemar's patter -----------------------------------------------------
    // One line per screen, dealt from the pools in boliger.js by a FIXED index
    // per screen (not a running counter): browsing back to a photo shows the
    // same line again, and a test can assert the exact text. Each home uses 7
    // dream lines and 3 pressure lines, so the strides below make every screen
    // unique within a home and never repeat back-to-back across homes.
    function droemAt(n) {
      return VALDEMAR_DROEM[n % VALDEMAR_DROEM.length];
    }
    function presAt(n) {
      return VALDEMAR_PRES[n % VALDEMAR_PRES.length];
    }
    function markedAt(n) {
      return VALDEMAR_MARKED[n % VALDEMAR_MARKED.length];
    }
    function quote(line) {
      return '<div class="visning-quote">“' + line + '”<span>— Valdemar</span></div>';
    }

    // 2495000 → '2.495.000 kr.' — by hand, so it never depends on the
    // laptop's locale settings.
    function kr(n) {
      let s = String(n);
      let out = '';
      while (s.length > 3) {
        out = '.' + s.slice(-3) + out;
        s = s.slice(0, -3);
      }
      return s + out + ' kr.';
    }

    // One popup of the flow. EVERY screen goes through here, so none of them
    // can forget `show:` and snap back to the beige box halfway through.
    // `round` lights up one progress dot per HOME (quizLights, js/challenges.js).
    // Opening any screen also leaves the photo gallery (see `gallery` below) —
    // the gallery screens opt back in after calling this.
    function screen(round, title, body, confirmText, onConfirm) {
      gallery = null;
      UI.showModal({
        title: title,
        body: quizLights(round, ROUNDS) + body,
        confirmText: confirmText,
        colors: tent.colors,
        show: SHOW,
        onConfirm: onConfirm,
      });
    }

    // A photo (or a map) as the body of a screen. If the file is missing —
    // someone cloned the repo without the images, say — swap in a polite
    // placeholder instead of a broken-image icon, and Enter still works.
    // NOTE: these paths are relative to index.html (they go into <img src>),
    // NOT to this file — unlike the url() in weinzelt.css. Don't "fix" it.
    function photoHtml(dir, file, caption, extra) {
      return '<img class="visning-photo' + (extra ? ' ' + extra : '') + '" src="' + dir + file + '" alt="">'
        + '<div class="visning-caption">' + caption + ' · ⇦ ⇨ browse</div>';
    }
    function armPhotoFallback(dir) {
      const img = document.querySelector('#modal-body .visning-photo');
      if (!img) return;
      img.onerror = function () {
        const box = document.createElement('div');
        box.className = 'visning-photo-missing';
        box.textContent = 'FOTO MANGLER — ' + dir;
        img.replaceWith(box);
      };
    }

    // ---- arrow keys: browse the gallery ------------------------------------------
    // js/game.js owns Enter (it closes every popup) but ignores the arrows in
    // 'modal' mode, so — like snake.js's steering — the gallery gets its own
    // keydown listener. It only acts while a gallery screen is up (`gallery`
    // is set), and it removes itself as soon as the modal is gone: after the
    // tent is done, or after a game.reset() mid-visit.
    let gallery = null; // { pos, last, jump } while photos/maps are on screen

    function onArrow(e) {
      if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
      if (document.getElementById('modal').hidden) {
        window.removeEventListener('keydown', onArrow);
        return;
      }
      if (!gallery) return;
      const p = gallery.pos + (e.code === 'ArrowRight' ? 1 : -1);
      if (p >= 0 && p <= gallery.last) gallery.jump(p);
    }
    // one listener per visit — kick out a leftover from an interrupted visit
    if (CHALLENGES.weinzelt._onArrow) {
      window.removeEventListener('keydown', CHALLENGES.weinzelt._onArrow);
    }
    CHALLENGES.weinzelt._onArrow = onArrow;
    window.addEventListener('keydown', onArrow);

    // ---- one home, prospekt to gavel --------------------------------------------
    // The whole arc for BOLIGER[k]. When its rounds are over it hands the show
    // to the next home; the last home hands it to the SOLGT screen.

    function showBolig(k) {
      const b = BOLIGER[k];
      const DIR = 'js/tents/weinzelt/boliger/' + b.slug + '/';
      const after = (k + 1 < ROUNDS) ? function () { showBolig(k + 1); } : showWrap;

      // -- the salgsopstilling: what it is and where — but never the vurdering
      //    or a prisfald, those give the price away and belong on the reveal.
      function showProspekt() {
        let rows = '';
        b.facts.forEach(function (f) {
          rows += '<div class="visning-fact"><span>' + f[0] + '</span><b>' + f[1] + '</b></div>';
        });
        screen(k, 'BOLIG ' + (k + 1) + '/' + ROUNDS,
          '<div class="visning-address">' + b.address + '</div>'
          + '<div class="visning-city">' + b.city + ' · ' + b.type + '</div>'
          + '<div class="visning-headline">“' + b.headline + '”<span>— ' + b.agent + '</span></div>'
          + '<div class="visning-facts">' + rows + '</div>'
          + quote(droemAt(k * 7)),
          'Se boligen! [Enter]', function () { showGallery(0); });
      }

      // -- the gallery: five photos, then DANMARK, then the neighbourhood.
      //    One flat list of pages, so the arrow keys can walk it both ways;
      //    Enter walks forward too, and off the last page it starts the guess.
      function showGallery(p) {
        const last = b.photos.length + 1;
        let title, file, caption, patter, confirmText, extra;
        if (p < b.photos.length) {
          title = 'FOTO ' + (p + 1) + '/' + b.photos.length;
          file = b.photos[p];
          caption = 'Foto ' + (p + 1) + '/' + b.photos.length + ' · ' + b.address;
          patter = quote(droemAt(k * 7 + 1 + p));
          confirmText = 'Weiter! [Enter]';
          extra = '';
        } else if (p === b.photos.length) {
          title = 'DANMARK';
          file = b.danmark;
          caption = 'Where in Denmark? · © OpenStreetMap contributors';
          patter = quote(droemAt(k * 7 + 1 + p));
          confirmText = 'Zoom! [Enter]';
          extra = 'kort'; // maps get the roomier size — see weinzelt.css
        } else {
          title = 'BELIGGENHED';
          file = b.kort;
          caption = b.city + ' · © OpenStreetMap contributors';
          patter = quote(presAt(k * 3));
          confirmText = 'Weiter! [Enter]';
          extra = 'kort';
        }
        screen(k, title, photoHtml(DIR, file, caption, extra) + patter, confirmText,
          p < last ? function () { showGallery(p + 1); } : showGuess);
        armPhotoFallback(DIR);
        gallery = { pos: p, last: last, jump: showGallery };
      }

      // -- the guess. No typing, no buttons: the teams write a number on paper
      //    and the hosts judge — same hands-off pattern as the poem and Maß
      //    duels. Points are handed out by hand with , / . — nothing here
      //    calls Teams.addPoints.
      function showGuess() {
        screen(k, 'HVAD KOSTER DEN?',
          '<p>Each team writes down <b>ONE number</b>: the <b>udbudspris</b> — what this home '
          + 'is listed for on boligsiden.dk right now.</p>'
          // a lykkerider home (b.markup set) wears the flashing alarm frame
          + (b.hint ? '<div class="visning-hint' + (b.markup ? ' lykke' : '') + '">' + b.hint + '</div>' : '')
          + '<p>Pens down before Enter. Closest team takes the round — the hosts judge.</p>'
          + quote(presAt(k * 3 + 1))
          + quote(presAt(k * 3 + 2)),
          'HAMMERSLAG! [Enter]', showReveal);
      }

      function showReveal() {
        UI.beep(H.GAVEL_NOTES, H.GAVEL_SPACING, H.GAVEL_TYPE); // første, anden, TREDJE gang
        let context = '';
        b.priceContext.forEach(function (line) {
          context += '<p>' + line + '</p>';
        });
        screen(k, 'HAMMERSLAG!',
          '<div class="visning-price">' + kr(b.price) + '</div>'
          // the lykkerider stamp: the markup, big and red, over the paperwork
          + (b.markup ? '<div class="visning-markup">' + b.markup + '</div>' : '')
          + context
          // and whatever the number was, Valdemar talks the market UP
          + quote(markedAt(k)),
          'Weiter! [Enter]',
          b.bonuses.length ? function () { showBonusQ(0); } : after);
      }

      // -- bonus rounds (0..n per home, straight from the data). Same game as
      //    the main round: write a number, closest wins, gavel on the reveal.
      function showBonusQ(j) {
        screen(k, 'BONUS',
          '<p>' + b.bonuses[j].q + '</p>'
          + '<p>Each team writes down <b>ONE number</b>. Pens down before Enter — '
          + 'closest team takes this one too, the hosts judge.</p>',
          'HAMMERSLAG! [Enter]', function () { showBonusA(j); });
      }

      function showBonusA(j) {
        UI.beep(H.GAVEL_NOTES, H.GAVEL_SPACING, H.GAVEL_TYPE);
        screen(k, 'SVAR',
          '<div class="visning-price">' + kr(b.bonuses[j].a) + '</div>'
          + '<p>' + b.bonuses[j].context + '</p>',
          'Weiter! [Enter]',
          j + 1 < b.bonuses.length ? function () { showBonusQ(j + 1); } : after);
      }

      showProspekt();
    }

    // ---- SOLGT: after the last home ---------------------------------------------

    function showWrap() {
      screen(ROUNDS - 1, 'SOLGT! 🔨',
        quote('Velkommen til resten af jeres liv')
        + '<p>' + ROUNDS + ' homes, ' + ROUNDS + ' rounds — the hosts hand each round\'s point '
        + 'to the closest team, by hand, as always.</p>'
        + quote(markedAt(ROUNDS)),
        'Prost! [Enter]', function () {
          window.removeEventListener('keydown', onArrow);
          done(true);
        });
    }

    showBolig(0);
  },
};
