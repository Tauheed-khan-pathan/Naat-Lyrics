// Shared behaviour for static lyric pages (lyric/<id>.html) — Audit D.
// The lyric text is already in the HTML (one div per language); this
// script only toggles languages, font size, font choice, dark mode,
// the header search pill, the footer-aware button lift and the share button.
// No fetch, no loader: a static page renders instantly.
let lang = 'roman', size = 1.1;
const FONT_NAMES = {roman: ['Default', 'Merriweather', 'Lora'], hindi: ['Default', 'Noto Sans Devanagari', 'Baloo 2'], urdu: ['Noto Nastaliq', 'Scheherazade New', 'System Default']};
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
  if (window.__updateLift) window.__updateLift();
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
      if (e.key === 'Enter' && s.value.trim()) { var o = document.getElementById('navLoader'); if (o) o.classList.add('show'); location.href = '../index.html?q=' + encodeURIComponent(s.value.trim()); }
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
// Footer-aware lift: keep both floating buttons (Font pill + back-to-top)
// just above the footer — neither may overlap it. The lift is a CSS var
// (--lift) so both buttons move together and stop on the same line.
// It is re-measured on every update because font changes reflow the page
// and move the footer; showLang() calls __updateLift after every change.
(function () {
  var foot = document.querySelector('.site-footer');
  if (!foot) return;
  var last = -1, ticking = false;
  function update() {
    ticking = false;
    var footTop = foot.getBoundingClientRect().top + window.scrollY;
    var lift = Math.max(0, Math.round((window.scrollY + window.innerHeight) - footTop));
    if (lift !== last) { last = lift; document.documentElement.style.setProperty('--lift', lift + 'px'); }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(update); }
  window.__updateLift = update;
  update();
})();

// Clear a stale search pill value when the lyric page is restored from the
// Back/Forward cache: the pill is only a navigation input, so a query typed
// before leaving must not still sit in the box on return.
window.addEventListener('pageshow', function (e) {
  if (e.persisted) { var s = document.getElementById('lyricSearch'); if (s) s.value = ''; }
});

// Share button (placed at the bottom of the lyric article, centred below
// the last sher, so every static lyric page gets it from this one file —
// no page regeneration needed, no extra data per page). On phones it opens
// the native share sheet (WhatsApp etc.); elsewhere it opens a WhatsApp
// share link with the lyric title + page URL.
(function () {
  var card = document.querySelector('article.card');
  if (!card) return;
  var st = document.createElement('style');
  st.textContent = '.share-row{margin:14px 0 2px;display:flex;justify-content:center}';
  document.head.appendChild(st);
  var row = document.createElement('div');
  row.className = 'share-row';
  var b = document.createElement('button');
  b.className = 'share-btn';
  b.type = 'button';
  b.setAttribute('aria-label', 'Share this lyric');
  b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share';
  b.onclick = function () {
    var url = location.href;
    var text = document.title + ' — ' + url;
    if (navigator.share) {
      navigator.share({ title: document.title, text: document.title, url: url }).catch(function () {});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
  };
  row.appendChild(b);
  card.appendChild(row);
})();

// Back-to-top button (WhatsApp scroll button jaisa): sirf tab dikhta hai jab
// title + shuru ke 1-2 ashar upar nikal jaayein; click par smooth scroll se
// top par le jaata hai; top par pahunchte hi gayab ho jaata hai. Chhupa
// hone par us jagah click ka koi asar nahi hota (pointer-events none +
// visibility hidden), aur dikhna/gayab hona animation ke saath hota hai.
(function () {
  var b = document.createElement('button');
  b.className = 'to-top-btn';
  b.setAttribute('aria-label', 'Back to top');
  b.title = 'Back to top';
  b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  b.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  document.body.appendChild(b);
  function sync() { b.classList.toggle('show', window.scrollY > 300); }
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('pageshow', sync);
  sync();
})();

// Scroll-condense header (v11, flicker-free): scrolling DOWN past 120px shrinks
// the sticky header into a slim bar; scrolling back UP above 60px restores it.
// Direction-aware + hysteresis (60px gap), 5px dead zone, rAF throttle.
// Shared with app.js (home/list pages) as an identical IIFE — no single JS
// file is loaded by both page types, so the two entry files each carry it.
(function () {
  var DOWN_AT = 120, UP_AT = 60, DEAD = 5, lastY = 0, ticking = false;
  function apply() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var dy = y - lastY;
    if (dy > DEAD && y > DOWN_AT) { document.body.classList.add('condensed'); }
    else if (dy < -DEAD && y < UP_AT) { document.body.classList.remove('condensed'); }
    else if (y <= 0) { document.body.classList.remove('condensed'); }
    lastY = y;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
})();
