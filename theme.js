// Heller und dunkler Modus. Ohne Wahl gilt die Einstellung des Geraets.
// Die Wahl liegt nur im Browser des Besuchers (localStorage), keine Cookies, kein Tracking.
(function () {
  var KEY = 'mjoll-theme', root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

  var LABELS = {
    en: ['Light mode', 'Dark mode'], de: ['Helle Ansicht', 'Dunkle Ansicht'],
    es: ['Modo claro', 'Modo oscuro'], fr: ['Mode clair', 'Mode sombre'],
    it: ['Modo chiaro', 'Modo scuro'], ja: ['ライトモード', 'ダークモード'],
    is: ['Ljóst útlit', 'Dökkt útlit']
  };
  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.addEventListener('DOMContentLoaded', function () {
    var footer = document.querySelector('footer');
    if (!footer) return;
    var lang = (root.lang || 'en').slice(0, 2), l = LABELS[lang] || LABELS.en;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-toggle';
    function render() { b.textContent = current() === 'dark' ? l[0] : l[1]; }
    b.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      render();
    });
    render();
    footer.appendChild(b);
  });
})();
