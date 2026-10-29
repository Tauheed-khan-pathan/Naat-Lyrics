// Shared behaviour for static lyric pages (lyric/<id>.html) — Audit D.
// The lyric text is already in the HTML (one div per language); this
// script only toggles languages, font size, font choice, dark mode,
// the header search pill and the font-pill lifter. No fetch, no loader:
// a static page renders instantly.
let lang = 'roman', size = 1.1;
const FONT_NAMES = {roman: ['Default', 'Ballmain', 'Merriweather', 'Lora'], hindi: ['Default', 'Noto Sans Devanagari', 'Baloo 2'], urdu: ['Noto Nastaliq', 'Scheherazade New', 'System Default']};
const FONT_DEFAULT = {roman: 0, hindi: 2, urdu: 0};
function fontKey(l) { return 'naat-font-' + l; }
function savedFont(l) {
  const names = FONT_NAMES[l] || FONT_NAMES.roman;
  const def = (FONT_DEFAULT[l] === undefined ? 0 : FONT_DEFAULT[l]);
  const raw = localStorage.getItem(fontKey(l));
  const v = raw === null ? def : parseInt(raw, 10);
  return (v >= 0 && v < names.length) ? v : def;
}
let fontIdx = savedFont(lang);
function updateDashes() {
  const b = document.getElementById('fontCycleBtn'); if (!b) return;
  const names = FONT_NAMES[lang] || FONT_NAMES.roman;
  const d = document.getElementById('fontDashes');
  if (d) {
    d.innerHTML = '';
    names.forEach((n, i) => {
      const s = document.createElement('span');
      s.className = 'fdash' + (i === fontIdx ? ' on' : '');
      d.appendChild(s);
    });
  }
  b.setAttribute('aria-label', 'Change font, current: ' + names[fontIdx]);
}
updateDashes();
function showLang() {
  document.querySelectorAll('.lines[data-lang]').forEach(d => {
    const l = d.dataset.lang;
    const active = l === lang;
    d.hidden = !active;
    if (active) {
      d.dataset.font = savedFont(l);
      d.style.fontSize = ((l === 'urdu' ? size + 0.4 : size)) + 'rem';
    }
  });
  document.querySelectorAll('.lang button[data-lang]').forEach(y => y.classList.toggle('active', y.dataset.lang === lang));
}
showLang();
document.querySelectorAll('.lang button[data-lang]').forEach(b => b.onclick = () => {
  lang = b.dataset.lang;
  fontIdx = savedFont(lang);
  updateDashes();
  showLang();
});
const fontCycleBtn = document.getElementById('fontCycleBtn');
if (fontCycleBtn) fontCycleBtn.onclick = () => {
  fontIdx = (fontIdx + 1) % ((FONT_NAMES[lang] || FONT_NAMES.roman).length);
  try { localStorage.setItem(fontKey(lang), String(fontIdx)); } catch (e) {}
  updateDashes();
  showLang();
};
document.getElementById('fontUp').onclick = () => { size = Math.min(1.4, size + 0.1); showLang(); };
document.getElementById('fontDown').onclick = () => { size = Math.max(0.9, size - 0.1); showLang(); };
// Header search pill: Enter opens homepage search.
(function () {
  var s = document.getElementById('lyricSearch'), c = document.getElementById('lyricClear');
  if (s) {
    var sync = function () { if (c) c.classList.toggle('show', !!s.value); };
    s.addEventListener('input', sync);
    s.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && s.value.trim()) { location.href = '../index.html?q=' + encodeURIComponent(s.value.trim()); }
    });
    if (c) c.onclick = function () { s.value = ''; sync(); s.focus(); };
    sync();
  }
})();
// Dark mode (shared key naat-dark, site-wide).
(function () {
  var b = document.getElementById('darkToggle');
  function apply() { var d = localStorage.getItem('naat-dark') === '1'; document.body.classList.toggle('dark', d); }
  apply();
  if (b) b.onclick = function () { localStorage.setItem('naat-dark', document.body.classList.contains('dark') ? '0' : '1'); apply(); };
  window.addEventListener('pageshow', apply);
  window.addEventListener('storage', function (e) { if (e.key === 'naat-dark') apply(); });
})();
// Font-pill lifter: keep the pill just above the footer.
(function () {
  var pill = document.querySelector('.font-float');
  var foot = document.querySelector('.site-footer');
  if (!pill || !foot) return;
  var footTop = 0, last = '', ticking = false;
  function measure() { footTop = foot.getBoundingClientRect().top + window.scrollY; }
  function update() {
    ticking = false;
    var lift = Math.round((window.scrollY + window.innerHeight) - footTop);
    var t = lift > 0 ? 'translateX(-50%) translateY(' + (-lift) + 'px)' : '';
    if (t !== last) { last = t; pill.style.transform = t; }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); });
  window.addEventListener('load', function () { measure(); update(); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { measure(); update(); }); }
  measure(); update();
})();
