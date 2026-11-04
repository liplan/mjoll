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

    function waehleStimme() {
      var alle = synth.getVoices().filter(function (v) { return /^de(-|_|$)/i.test(v.lang); });
      // Bessere Stimmen bevorzugen, falls installiert
      alle.sort(function (a, b) { return rang(b) - rang(a); });
      stimme = alle[0] || null;
    }
    function rang(v) { var n = v.name.toLowerCase(); return (/premium|enhanced|erweitert|natural/.test(n) ? 4 : 0) + (/anna|petra|helena|markus|yannick/.test(n) ? 2 : 0) + (v.localService ? 1 : 0); }
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
    function sprich() {
      if (i >= teile.length) { stopp(); return; }
      var t = teile[i], u = new SpeechSynthesisUtterance(t.text);
      u.lang = 'de-DE'; if (stimme) u.voice = stimme; u.rate = 0.95;
      u.onend = function () { if (zustand === 'laeuft') { i++; sprich(); } };
      markiere(t.el);
      if (t.el.getBoundingClientRect().top > window.innerHeight * 0.75 || t.el.getBoundingClientRect().bottom < 0)
        t.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      synth.speak(u);
    }
    function start() { synth.cancel(); teile = sammle(); i = 0; zustand = 'laeuft'; sprich(); zeige(); }
    function pause() { zustand = 'pause'; synth.cancel(); zeige(); }          // cancel statt pause: zuverlaessiger auf allen Geraeten
    function weiter() { zustand = 'laeuft'; sprich(); zeige(); }
    function stopp() { zustand = 'aus'; synth.cancel(); markiere(null); zeige(); }

    var haupt = document.createElement('button'), aus = document.createElement('button');
    haupt.type = aus.type = 'button';
    haupt.className = 'vorlesen-knopf'; aus.className = 'vorlesen-knopf nebenknopf';
    aus.textContent = 'Beenden';
    haupt.addEventListener('click', function () { zustand === 'aus' ? start() : zustand === 'laeuft' ? pause() : weiter(); });
    aus.addEventListener('click', stopp);
    function zeige() {
      haupt.textContent = zustand === 'aus' ? 'Vorlesen' : zustand === 'laeuft' ? 'Pause' : 'Weiter vorlesen';
      haupt.setAttribute('aria-pressed', zustand === 'laeuft' ? 'true' : 'false');
      aus.hidden = zustand === 'aus';
    }
    zeige();
    box.appendChild(haupt); box.appendChild(aus);
    window.addEventListener('pagehide', function () { synth.cancel(); });
  });
})();
