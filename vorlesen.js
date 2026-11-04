// Vorlesen fuer die Hintergrund-Artikel. Nutzt die Sprachausgabe des Geraets (Web Speech API):
// keine Kosten, kein externer Dienst, nichts verlaesst das Geraet. Ohne Unterstuetzung erscheint kein Knopf.
(function () {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.querySelector('.vorlesen');
    var text = document.querySelector('.artikeltext');
    var titel = document.querySelector('h1');
    if (!box || !text) return;
    var synth = window.speechSynthesis, teile = [], i = 0, zustand = 'aus', stimme = null;
    // Ohne passende Stimme auf dem Geraet keinen Knopf zeigen (wird nach dem Laden der Stimmen geprueft)

    var sprache = box.getAttribute('data-sprache') || 'de-DE', kurz = sprache.slice(0, 2).toLowerCase();
    var L = ['Vorlesen', 'Pause', 'Weiter vorlesen', 'Beenden'];
    try { L = JSON.parse(box.getAttribute('data-labels')) || L; } catch (e) {}
    function waehleStimme() {
      var alle = synth.getVoices().filter(function (v) { return v.lang.replace('_', '-').toLowerCase().slice(0, 2) === kurz; });
      var genau = alle.filter(function (v) { return v.lang.replace('_', '-').toLowerCase() === sprache.toLowerCase(); });
      if (genau.length) alle = genau;
      // Bessere Stimmen bevorzugen, falls installiert
      alle.sort(function (a, b) { return rang(b) - rang(a); });
      stimme = alle[0] || null;
    }
    function rang(v) { var n = v.name.toLowerCase(); return (/premium|enhanced|erweitert|natural/.test(n) ? 4 : 0) + (/anna|petra|helena|markus|yannick|samantha|ava|zoe|monica|paulina|thomas|amelie|alice|federica|kyoko|otoya|dora/.test(n) ? 2 : 0) + (v.localService ? 1 : 0); }
    waehleStimme();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = waehleStimme;

    function sammle() {
      var els = [titel].concat([].slice.call(text.querySelectorAll('p, h2, li')));
      return els.filter(function (el) { return el && el.offsetParent !== null && el.textContent.trim(); }).map(function (el) {
        var c = el.cloneNode(true);
        [].forEach.call(c.querySelectorAll('sup'), function (s) { s.remove(); });   // Quellennummern nicht vorlesen
        return { el: el, text: c.textContent.replace(/\s+/g, ' ').trim() };
      });
    }
    function markiere(el) {
      [].forEach.call(document.querySelectorAll('.liest'), function (e) { e.classList.remove('liest'); });
      if (el) el.classList.add('liest');
    }
    // Alle Absaetze werden auf einmal in die Warteschlange gelegt, direkt beim Tippen.
    // Safari vergisst sonst die gewaehlte Stimme, wenn jeder Absatz erst nach dem vorigen startet.
    var lauf = 0;
    function starteAb(n) {
      synth.cancel();
      waehleStimme();
      var meinLauf = ++lauf;
      i = n;
      if (n >= teile.length) { stopp(); return; }
      teile.slice(n).forEach(function (t, k) {
        var u = new SpeechSynthesisUtterance(t.text);
        u.lang = sprache; if (stimme) u.voice = stimme; u.rate = 0.95;
        u.onstart = function () {
          if (meinLauf !== lauf) return;
          i = n + k; markiere(t.el);
          var r = t.el.getBoundingClientRect();
          if (r.top > window.innerHeight * 0.75 || r.bottom < 0) t.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        u.onend = function () { if (meinLauf === lauf && zustand === 'laeuft' && n + k === teile.length - 1) stopp(); };
        synth.speak(u);
      });
    }
    function start() { teile = sammle(); zustand = 'laeuft'; zeige(); starteAb(0); }
    function pause() { zustand = 'pause'; lauf++; synth.cancel(); zeige(); }        // cancel statt pause: zuverlaessiger auf allen Geraeten
    function weiter() { zustand = 'laeuft'; zeige(); starteAb(i); }
    function stopp() { zustand = 'aus'; lauf++; synth.cancel(); markiere(null); zeige(); }

    var haupt = document.createElement('button'), aus = document.createElement('button');
    haupt.type = aus.type = 'button';
    haupt.className = 'vorlesen-knopf'; aus.className = 'vorlesen-knopf nebenknopf';
    aus.textContent = L[3];
    haupt.addEventListener('click', function () { zustand === 'aus' ? start() : zustand === 'laeuft' ? pause() : weiter(); });
    aus.addEventListener('click', stopp);
    function zeige() {
      haupt.textContent = zustand === 'aus' ? L[0] : zustand === 'laeuft' ? L[1] : L[2];
      haupt.setAttribute('aria-pressed', zustand === 'laeuft' ? 'true' : 'false');
      aus.hidden = zustand === 'aus';
    }
    zeige();
    box.appendChild(haupt); box.appendChild(aus);
    window.addEventListener('pagehide', function () { synth.cancel(); });
  });
})();
