// Sprache: Umschalter oben rechts und Begruessung in der Sprache des Geraets.
// Die Sprachfassungen einer Seite stehen in <link rel="alternate" hreflang="...">.
// Eine eigene Wahl merkt sich nur der Browser (localStorage) und hat immer Vorrang.
(function () {
  var KEY = 'mjoll-sprache', root = document.documentElement, hier = (root.lang || 'en').slice(0, 2);
  var NAMEN = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano', ja: '日本語', is: 'Íslenska' };
  var WORT = { en: 'Language', de: 'Sprache', es: 'Idioma', fr: 'Langue', it: 'Lingua', ja: '言語', is: 'Tungumál' };
  function fassungen() {
    var m = {};
    [].forEach.call(document.querySelectorAll('link[rel="alternate"][hreflang]'), function (l) {
      var h = l.getAttribute('hreflang'); if (h !== 'x-default') m[h] = l.getAttribute('href');
    });
    return m;
  }
  function merke(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  var gewaehlt = null; try { gewaehlt = localStorage.getItem(KEY); } catch (e) {}
  var f = fassungen();

  // Begruessung: nur auf englischen Seiten, nur ohne eigene Wahl, nur beim Kommen von aussen.
  var vonAussen = !document.referrer || document.referrer.indexOf(location.host) === -1;
  if (hier === 'en' && !gewaehlt && vonAussen) {
    var wunsch = (navigator.languages || [navigator.language || '']).map(function (x) { return String(x).slice(0, 2).toLowerCase(); });
    for (var i = 0; i < wunsch.length; i++) {
      if (wunsch[i] === 'en') break;                       // Englisch gewuenscht: bleiben
      if (f[wunsch[i]]) { location.replace(f[wunsch[i]] + location.hash); return; }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Eigene Wahl auch ueber die Sprachleiste unten merken
    [].forEach.call(document.querySelectorAll('.langs a[hreflang]'), function (a) {
      a.addEventListener('click', function () { merke(a.getAttribute('hreflang')); });
    });
    var codes = Object.keys(NAMEN).filter(function (l) { return f[l]; });
    if (codes.length < 2) return;
    var wrap = document.createElement('div'); wrap.className = 'sprachwahl';
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', WORT[hier] || WORT.en);
    codes.forEach(function (l) {
      var o = document.createElement('option'); o.value = l; o.textContent = NAMEN[l]; o.lang = l;
      if (l === hier) o.selected = true; sel.appendChild(o);
    });
    sel.addEventListener('change', function () { merke(sel.value); location.href = f[sel.value] + location.hash; });
    wrap.appendChild(sel);
    document.body.insertBefore(wrap, document.body.firstChild);
  });
})();
