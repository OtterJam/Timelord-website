/* ------------------------------------------------------------------
   TimeLord — comportements du site. Vanille, sans build.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  var CONFIG = window.TL_CONFIG || {};
  var DICT = window.TL_I18N || {};
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- Langue ---------- */

  var LANGS = ['fr', 'en'];
  var lang = 'fr';

  function pickLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(fromUrl) !== -1) return fromUrl;
    var stored = null;
    try { stored = localStorage.getItem('tl-lang'); } catch (e) { /* mode privé */ }
    if (LANGS.indexOf(stored) !== -1) return stored;
    return (navigator.language || 'fr').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  }

  function t(key) {
    var pack = DICT[lang] || {};
    return Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : (DICT.fr || {})[key];
  }

  function applyLang(next) {
    lang = LANGS.indexOf(next) !== -1 ? next : 'fr';
    document.documentElement.lang = lang;
    try { localStorage.setItem('tl-lang', lang); } catch (e) { /* ignore */ }

    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    });

    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(/\s+/).forEach(function (pair) {
        var bits = pair.split(':');
        var v = t(bits[1]);
        if (bits[0] && typeof v === 'string') el.setAttribute(bits[0], v);
      });
    });

    $$('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });

  /* ---------- Parallaxe à la souris ---------- */

  // Chaque couche porte sa profondeur dans --d ; on ne pose ici que la position
  // du curseur, et le CSS fait le décalage. Souris seulement : au doigt, le
  // décor reste tranquille.
  var scene = $('#scene');
  var root = document.documentElement;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (scene && fine && !still) {
    // Une copie du décor, posée pile dessus, éclaircie et masquée par un
    // disque qui suit le curseur : la lumière ne révèle que les pixels des
    // sprites. Clonée ici plutôt qu'écrite deux fois dans le HTML, pour que
    // les deux décors ne puissent pas diverger.
    var lit = scene.cloneNode(true);
    lit.removeAttribute('id');
    lit.classList.add('scene--lit');
    scene.parentNode.insertBefore(lit, scene.nextSibling);

    var px = 0;
    var py = 0;
    var mx = 0;
    var my = 0;
    var queued = false;

    // Où sont les yeux à l'écran. Le calque est en position fixe : seule une
    // bascule de fenêtre peut déplacer le repère.
    var master = $('.l-master');
    var eyeX = 0;
    var eyeY = 0;

    function locateEyes() {
      var r = master.getBoundingClientRect();
      eyeX = r.left + r.width * 0.49;  // les deux orbites, centre à centre
      eyeY = r.top + r.height * 0.42;  // y = 90 sur les 216 du sprite
    }

    locateEyes();
    window.addEventListener('resize', locateEyes);

    // Un pixel du sprite, en proportion du calque : 1/144 et 1/216.
    var STEP_X = 100 / 144;
    var STEP_Y = 100 / 216;

    function gaze() {
      var dy = my - eyeY;
      // Au-dessus de la tête, il ne lève pas les yeux : regard neutre.
      if (dy <= 0) return [0, 0];
      var dx = mx - eyeX;
      var h = Math.max(-1, Math.min(1, dx / 420));
      var v = Math.min(1, dy / 520);
      return [h * STEP_X, v * STEP_Y];
    }

    function paint() {
      queued = false;
      // Posées sur la racine : les deux copies du décor les lisent.
      root.style.setProperty('--px', px.toFixed(3));
      root.style.setProperty('--py', py.toFixed(3));
      // Position de la lumière, lue par le masque de la copie éclairée.
      root.style.setProperty('--mx', mx + 'px');
      root.style.setProperty('--my', my + 'px');

      var look = gaze();
      root.style.setProperty('--ex', look[0].toFixed(3) + '%');
      root.style.setProperty('--ey', look[1].toFixed(3) + '%');
    }

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      px = (mx / window.innerWidth - 0.5) * 2;
      py = (my / window.innerHeight - 0.5) * 2;
      lit.classList.add('is-on');
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(paint);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      px = 0;
      py = 0;
      my = -1; // souris sortie : le regard revient au neutre
      lit.classList.remove('is-on');
      paint();
    });
  }

  /* ---------- Réseaux ---------- */

  var SOCIALS = [
    { key: 'tiktok', label: 'TikTok', path: 'M16.6 5.8a4.8 4.8 0 0 1-1-2.8h-3v12.1a2.7 2.7 0 1 1-2-2.6V9.4a5.8 5.8 0 1 0 5 5.7V9.6a7.8 7.8 0 0 0 4.5 1.4V8a4.8 4.8 0 0 1-3.5-2.2Z' },
    { key: 'instagram', label: 'Instagram', path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.3-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 3.8a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 9.9a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8Zm7.6-10.1a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z' },
    { key: 'youtube', label: 'YouTube', path: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z' },
    { key: 'x', label: 'X', path: 'M18.2 2.3h3.4l-7.4 8.4L23 21.7h-6.8l-5.3-6.9-6.1 6.9H1.4l7.9-9-8.5-10.4h7l4.8 6.3 5.6-6.3Zm-1.2 17.4h1.9L7.1 4.2H5L17 19.7Z' },
    { key: 'bluesky', label: 'Bluesky', path: 'M5.8 3.9C8.5 5.9 11.3 10 12 12.3c.7-2.3 3.5-6.4 6.2-8.4 1.9-1.5 5-2.6 5 1 0 .7-.4 5.8-.6 6.6-.8 2.9-3.7 3.6-6.3 3.2 4.5.8 5.7 3.4 3.2 6-4.7 4.8-6.8-1.2-7.3-2.8-.1-.3-.2-.4-.2-.3 0-.1-.1 0-.2.3-.5 1.6-2.6 7.6-7.3 2.8-2.5-2.6-1.3-5.2 3.2-6-2.6.4-5.5-.3-6.3-3.2-.2-.8-.6-5.9-.6-6.6 0-3.6 3.1-2.5 5-1Z' },
    { key: 'discord', label: 'Discord', path: 'M20.3 4.9A19 19 0 0 0 15.6 3.5l-.2.4a17 17 0 0 0-6.8 0l-.2-.4A19 19 0 0 0 3.7 5 20 20 0 0 0 .3 18.3a19 19 0 0 0 5.7 2.9l1.2-1.9a12 12 0 0 1-1.9-.9l.5-.4a13.6 13.6 0 0 0 12.4 0l.5.4a12 12 0 0 1-1.9.9l1.2 1.9a19 19 0 0 0 5.7-2.9A20 20 0 0 0 20.3 4.9ZM8.3 15.3c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Zm7.4 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Z' },
  ];

  var links = CONFIG.links || {};
  var socialsEl = $('#socials');
  var shown = 0;

  SOCIALS.forEach(function (s) {
    if (!links[s.key]) return;
    shown++;
    var li = document.createElement('li');
    li.innerHTML =
      '<a href="' + links[s.key] + '" target="_blank" rel="noopener noreferrer" data-net="' + s.key + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + s.path + '"/></svg>' +
      '<span>' + s.label + '</span></a>';
    socialsEl.appendChild(li);
  });

  // Aucun lien configuré : on masque le bloc plutôt que d'afficher une promesse vide.
  if (shown) $('#follow').hidden = false;

  var steam = $('#cta-steam');
  if (links.steam) {
    steam.href = links.steam;
    steam.target = '_blank';
    steam.rel = 'noopener noreferrer';
    var note = $('#steam-note');
    if (note) note.remove();
  } else {
    steam.setAttribute('aria-disabled', 'true');
    steam.addEventListener('click', function (e) { e.preventDefault(); });
  }

  /* ---------- Inscription ---------- */

  var form = $('#signup');
  var input = $('#signup-email');
  var submit = $('#signup-submit');
  var msg = $('#signup-msg');
  var fb = CONFIG.firebase || {};

  function setMsg(text, state) {
    msg.removeAttribute('data-i18n');
    msg.textContent = text;
    msg.className = 'signup__msg' + (state ? ' is-' + state : '');
  }

  if (!fb.projectId || !fb.apiKey) {
    // Pas de projet branché : on le dit, plutôt que d'avaler l'adresse dans le vide.
    input.disabled = true;
    submit.setAttribute('aria-disabled', 'true');
    submit.querySelector('span').setAttribute('data-i18n', 'hero.soon');
    msg.setAttribute('data-i18n', 'hero.soonNote');
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  } else {
    // Firestore, API REST : une requête, aucun SDK à charger.
    // Les règles de sécurité n'autorisent que la création dans cette
    // collection, jamais la lecture (voir le README).
    var endpoint =
      'https://firestore.googleapis.com/v1/projects/' + fb.projectId +
      '/databases/(default)/documents/' + (fb.collection || 'signups') +
      '?key=' + encodeURIComponent(fb.apiKey);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = input.value.trim();
      if (!email || !input.checkValidity()) {
        setMsg(t('hero.err'), 'err');
        input.focus();
        return;
      }

      submit.setAttribute('aria-disabled', 'true');
      input.disabled = true;
      setMsg('…');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            email: { stringValue: email },
            lang: { stringValue: lang },
            source: { stringValue: location.hostname || 'local' },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          setMsg(t('hero.ok'), 'ok');
          form.reset();
          // Inscrit : le formulaire ne sert plus à rien sur cette page.
          submit.querySelector('span').textContent = t('hero.done');
        })
        .catch(function () {
          setMsg(t('hero.err'), 'err');
          input.disabled = false;
          submit.removeAttribute('aria-disabled');
        });
    });
  }

  applyLang(pickLang());
})();
