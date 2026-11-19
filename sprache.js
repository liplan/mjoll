// Sprache: Umschalter oben rechts und Begruessung in der Sprache des Geraets.
// Die Sprachfassungen einer Seite stehen in <link rel="alternate" hreflang="...">.
// Eine eigene Wahl merkt sich nur der Browser (localStorage) und hat immer Vorrang.
(function () {
  var KEY = 'mjoll-sprache', root = document.documentElement, hier = root.lang || 'en', kurz = hier.slice(0, 2);
  var NAMEN = { en: 'English', de: 'Deutsch', es: 'Español', 'es-MX': 'Español (Latinoamérica)', fr: 'Français', it: 'Italiano', ja: '日本語', is: 'Íslenska' };
  var WORT = { en: 'Language', de: 'Sprache', es: 'Idioma', fr: 'Langue', it: 'Lingua', ja: '言語', is: 'Tungumál' };
  function fassungen() {
    var m = {};
    [].forEach.call(document.querySelectorAll('link[rel="alternate"][hreflang]'), function (l) {
      var h = l.getAttribute('hreflang'); if (h !== 'x-default') m[h] = l.getAttribute('href');
    });
    return m;
  }
  // Passende Fassung zu einem Wunsch des Browsers: erst genau (es-MX), dann Spanisch ausserhalb Spaniens
  // auf die Fassung fuer Lateinamerika, sonst die Grundsprache (es), sonst irgendeine Fassung dieser Sprache.
  function passend(f, wunsch) {
    var klein = {}, k, w = String(wunsch).toLowerCase(), g = w.slice(0, 2);
    for (k in f) klein[k.toLowerCase()] = f[k];
    if (klein[w]) return klein[w];
    if (g === 'es' && w.length > 2 && w !== 'es-es' && klein['es-mx']) return klein['es-mx'];
    if (klein[g]) return klein[g];
    for (k in klein) if (k.slice(0, 3) === g + '-') return klein[k];
    return null;
  }
  function merke(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  var gewaehlt = null; try { gewaehlt = localStorage.getItem(KEY); } catch (e) {}
  var f = fassungen();

  // Begruessung: nur auf englischen Seiten, nur ohne eigene Wahl, nur beim Kommen von aussen.
  var vonAussen = !document.referrer || document.referrer.indexOf(location.host) === -1;
  if (kurz === 'en' && !gewaehlt && vonAussen) {
    var wunsch = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < wunsch.length; i++) {
      if (String(wunsch[i]).slice(0, 2).toLowerCase() === 'en') break;   // Englisch gewuenscht: bleiben
      var ziel = passend(f, wunsch[i]);
      if (ziel) { location.replace(ziel + location.hash); return; }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Eigene Wahl auch ueber die Sprachleiste unten merken
    [].forEach.call(document.querySelectorAll('.langs a[hreflang]'), function (a) {
      a.addEventListener('click', function () { merke(a.getAttribute('hreflang')); });
    });
    var codes = Object.keys(NAMEN).filter(function (l) { return f[l]; });
    // Namen wie in der Sprachleiste unten (dort steht z. B. das Land dabei, wenn es zwei spanische Fassungen gibt)
    [].forEach.call(document.querySelectorAll('.langs a[hreflang]'), function (a) {
      if (NAMEN[a.getAttribute('hreflang')]) NAMEN[a.getAttribute('hreflang')] = a.textContent;
    });
    if (codes.length < 2) return;
    var platz = document.querySelector('.leiste .sprachplatz');
    var wrap = document.createElement(platz ? 'span' : 'div'); wrap.className = 'sprachwahl';
    // In der Leiste: Globus und Name sichtbar, darueber unsichtbar das echte Auswahlfeld (natives Menue des Geraets).
    if (platz) {
      wrap.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z"/></svg>'
        + '<span class="sprachname">' + (NAMEN[hier] || '') + '</span>';
    }
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', WORT[kurz] || WORT.en);
    codes.forEach(function (l) {
      var o = document.createElement('option'); o.value = l; o.textContent = NAMEN[l]; o.lang = l;
      if (l === hier) o.selected = true; sel.appendChild(o);
    });
    sel.addEventListener('change', function () { merke(sel.value); location.href = f[sel.value] + location.hash; });
    wrap.appendChild(sel);
    if (platz) platz.appendChild(wrap);
    else document.body.insertBefore(wrap, document.body.firstChild);
  });
})();
