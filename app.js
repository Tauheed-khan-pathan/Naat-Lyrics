let all=[], poets=[], cat='All', size=1.05, full=null, fullLoading=false;
fetch('poets.json?v=5').then(r=>r.json()).then(d=>{poets=d; if(all.length) render(false);}).catch(()=>{});
const PAGE=20; let shown=PAGE;
const tabsEl=document.getElementById('tabs'), listEl=document.getElementById('list'), searchEl=document.getElementById('search');
fetch('lyrics-index.json').then(r=>r.json()).then(d=>{all=d; const q=new URLSearchParams(location.search).get('q'); if(q){searchEl.value=q; syncClear();} buildTabs(); render();}).catch(()=>{document.body.classList.remove('loading');});
function buildTabs(){
  const cats=['All',...new Set(all.map(x=>x.category))];
  tabsEl.innerHTML=cats.map(c=>{
    const n=c==='All'?all.length:all.filter(x=>x.category===c).length;
    return `<button class="tab ${c===cat?'active':''}" data-cat="${c}">${c} (${n})</button>`;
  }).join('');
  tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cat=b.dataset.cat; buildTabs(); render();});
}
// ---- Typo-tolerant (fuzzy) search ----
// Words are split on anything that is not a letter or digit, so
// "tajdar-e-haram" becomes [tajdar, haram] and glue words (e, ke, ki)
// are ignored. A query matches when EVERY word (3+ letters) matches
// some word of the lyric, in any order, either as a substring or
// within 1-2 edits (Damerau-Levenshtein, transposition counts as 1).
// Exact-phrase matches keep working exactly as before (fast path).
function queryWords(q){
  return q.toLowerCase().split(/[^a-z0-9\u0900-\u097F\u0600-\u06FF]+/).filter(w=>w.length>=3);
}
function editDist(a,b){
  const m=a.length, n=b.length, d=[];
  for(let i=0;i<=m;i++) d[i]=[i];
  for(let j=0;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
    const cost=a[i-1]===b[j-1]?0:1;
    let v=Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) v=Math.min(v, d[i-2][j-2]+1);
    d[i][j]=v;
  }
  return d[m][n];
}
function wordMatch(qw, hay){
  const words=hay.split(/[^a-z0-9\u0900-\u097F\u0600-\u06FF]+/);
  for(const w of words){
    if(!w) continue;
    if(w.includes(qw)) return true;
    const lim=w.length<=5?1:2;
    if(Math.abs(w.length-qw.length)>lim) continue;
    if(editDist(qw,w)<=lim) return true;
  }
  return false;
}
function fuzzyMatch(text,q){
  if(!q) return true;
  const hay=text.toLowerCase();
  if(hay.includes(q)) return true;
  const qwords=queryWords(q);
  if(!qwords.length) return false;
  return qwords.every(qw=>wordMatch(qw,hay));
}
let vocabCache=null, vocabCacheFor=null;
function getVocab(){
  const src=full||all;
  if(vocabCache&&vocabCacheFor===src) return vocabCache;
  const s=new Set();
  const texts=full
    ? full.map(x=>[x.title,...(x.roman||[]),...(x.hindi||[]),...(x.urdu||[])].join(' '))
    : all.map(x=>[x.title,x.poet,x.category,x.khawan||'',(x.preview||[]).join(' ')].join(' '));
  for(const t of texts) for(const w of t.toLowerCase().split(/[^a-z0-9\u0900-\u097F\u0600-\u06FF]+/)) if(w.length>=3) s.add(w);
  vocabCache=s; vocabCacheFor=src; return s;
}
// "Did you mean" suggestion: corrects each query word to its nearest
// vocabulary word (1 edit for short words, 2 for longer ones).
// Returns the corrected query string, or null when nothing to correct.
function suggestCorrection(q){
  const vocab=getVocab();
  const qwords=queryWords(q);
  if(!qwords.length) return null;
  let changed=false;
  const corrected=qwords.map(qw=>{
    if(vocab.has(qw)) return qw;
    const lim=qw.length<=5?1:2;
    let best=null, bestD=lim+1;
    for(const w of vocab){
      if(Math.abs(w.length-qw.length)>lim) continue;
      const d=editDist(qw,w);
      if(d<bestD){bestD=d; best=w; if(d===1) break;}
    }
    if(best){changed=true; return best;}
    return qw;
  });
  return changed?corrected.join(' '):null;
}
function matchesIndex(x,q){
  if(!q) return true;
  return fuzzyMatch(x.title+' '+x.poet+' '+x.category+' '+(x.khawan||'')+' '+x.preview.join(' '), q);
}
function matchesFull(x,q){
  if(!q) return true;
  return fuzzyMatch(x.title+' '+x.roman.join(' ')+' '+x.hindi.join(' ')+' '+(x.urdu||[]).join(' '), q);
}
function card(x){
  const preview=x.preview || (x.roman||[]).slice(0,2);
  const poetObj=poets.find(p=>p.name===x.poet);
  const poetHtml=poetObj?`<a href="poet.html?id=${poetObj.id}">${x.poet}</a>`:x.poet;
  return `<article class="card"><h2><a href="lyric/${x.id}.html">${x.title}</a></h2><div class="meta">${x.category} • Shayar: ${poetHtml} • Naat Khawan: ${x.khawan || 'Unknown'}</div><div class="lines preview" style="font-size:${size}rem">${preview.join('\n')}</div><a class="read" href="lyric/${x.id}.html">Read full ${x.category||'lyrics'}</a></article>`;
}
function miniCard(x){
  return `<a class="mini-card" href="lyric/${x.id}.html"><strong>${x.title}</strong><span>${x.category} • Shayar: ${x.poet}</span></a>`;
}
function render(reset=true){
  if(reset) shown=PAGE;
  const q=searchEl.value.trim().toLowerCase();
  let items=all.filter(x=>(cat==='All'||x.category===cat) && matchesIndex(x,q));
  if(q && items.length===0 && !full && !fullLoading){
    fullLoading=true;
    fetch('lyrics.json').then(r=>r.json()).then(d=>{full=d; fullLoading=false; render();});
    listEl.innerHTML='<div class="empty"><p>Searching full lyrics, please wait…</p></div>';
    return;
  }
  if(q && full){
    items=full.filter(x=>(cat==='All'||x.category===cat) && matchesFull(x,q));
  }
  if(!q && cat==='All'){
    const cats=[...new Set(all.map(x=>x.category))];
    const popular=[...all].slice(0,4);
    const recent=[...all].slice(-4).reverse();
    const boxes=cats.map(c=>{
      const n=all.filter(x=>x.category===c).length;
      return `<button class="catbox" data-cat="${c}"><strong>${c}</strong><span>${n} kalaam</span></button>`;
    }).join('') + `<a class="catbox" href="a-z.html" style="text-decoration:none"><strong>All A-Z</strong></a>`;
    listEl.innerHTML =
      `<section><h2 class="section-title">Categories</h2><div class="catgrid">${boxes}</div></section>` +
      `<section><h2 class="section-title">Most Read</h2><div class="hscroll">${popular.map(miniCard).join('')}</div></section>` +
      `<section><h2 class="section-title">Recently Added</h2><div class="hscroll">${recent.map(miniCard).join('')}</div></section>` +
      (poets.length?`<section><h2 class="section-title">Shuara (Poets)</h2><div class="hscroll">${poets.map(pp=>{const n=all.filter(x=>x.poet===pp.name).length; return `<a class="poet-card" href="poet.html?id=${pp.id}"><strong>${pp.name}</strong><span>${pp.honorific||''}</span><span>${n} kalaam</span></a>`;}).join('')}</div></section>`:'') +
      `<section><h2 class="section-title">All Lyrics</h2>${items.slice(0,shown).map(card).join('')}${items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:''}</section>`;
    listEl.querySelectorAll('.catbox').forEach(b=>b.onclick=()=>{cat=b.dataset.cat; buildTabs(); render(); window.scrollTo({top:0,behavior:'smooth'});});
  } else {
    const sugg=q?suggestCorrection(q):null;
    const suggHtml=sugg?`<div class="empty"><p>Did you mean: <a href="#" id="didYouMean">${sugg}</a>?</p></div>`:'';
    listEl.innerHTML = suggHtml + (items.length ? items.slice(0,shown).map(card).join('') + (items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:'') : '<div class="empty"><p>No results found.</p><p>Try another word, or just part of a line — search works across every line and word.</p></div>');
    const suggLink=document.getElementById('didYouMean');
    if(suggLink) suggLink.onclick=(e)=>{e.preventDefault(); searchEl.value=sugg; syncClear(); render(); searchEl.focus();};
  }
  _wireSeeMore();
  document.body.classList.remove('loading');
}
const _wireSeeMore=()=>{const b=document.getElementById('seeMore'); if(b) b.onclick=()=>{shown+=PAGE; render(false);};};
const clearBtn=document.getElementById('clearSearch');
function syncClear(){ if(clearBtn) clearBtn.classList.toggle('show', !!searchEl.value); }
syncClear();
searchEl.oninput=()=>{syncClear(); render();};
if(clearBtn) clearBtn.onclick=()=>{searchEl.value=''; syncClear(); render(); searchEl.focus();};

const darkBtn=document.getElementById('darkToggle');
function applyDark(){const d=localStorage.getItem('naat-dark')==='1';document.body.classList.toggle('dark',d);}
applyDark();
if(darkBtn)darkBtn.onclick=()=>{localStorage.setItem('naat-dark',document.body.classList.contains('dark')?'0':'1');applyDark();};
window.addEventListener('pageshow',applyDark);
window.addEventListener('storage',e=>{if(e.key==='naat-dark')applyDark();});

// Logo click from a search (?q=) page replaces the search entry instead of
// stacking a plain homepage on top of it, so browser Back never returns to
// a stale "No results found" search page.
const logoLink = document.querySelector('.logo');
if (logoLink) logoLink.addEventListener('click', e => {
  if (new URLSearchParams(location.search).get('q')) { e.preventDefault(); location.replace(logoLink.getAttribute('href')); }
});

// A-Z link click (Categories box or footer): clean the homepage entry
// BEFORE leaving for a-z.html, so browser Back from the Index page returns
// to a clean homepage — not to a search / "No results found" state.
// The click itself is left to navigate normally; clearing the input and
// the ?q= URL here is what the Back/Forward cache restores on return.
document.addEventListener('click', e => {
  const a = e.target && e.target.closest ? e.target.closest('a[href="a-z.html"]') : null;
  if (!a) return;
  searchEl.value = '';
  cat = 'All';
  syncClear();
  if (location.search) { try { history.replaceState(null, '', 'index.html'); } catch (err) {} }
});

// When the homepage is restored from the Back/Forward cache, re-render
// from the (now clean) search/category state instead of showing the frozen
// "No results found" list left behind by a search before the A-Z visit.
window.addEventListener('pageshow', e => {
  if (e.persisted && all.length) { buildTabs(); render(false); }
});

// Back-to-top button (WhatsApp scroll button jaisa): sirf tab dikhta hai jab
// user thoda neeche scroll kar jaaye; click par smooth scroll se top par le
// jaata hai; top par pahunchte hi gayab ho jaata hai. Chhupa hone par us
// jagah click ka koi asar nahi hota (pointer-events none + visibility
// hidden), aur dikhna/gayab hona animation ke saath hota hai.
(function () {
  const b = document.createElement('button');
  b.className = 'to-top-btn';
  b.setAttribute('aria-label', 'Back to top');
  b.title = 'Back to top';
  b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  b.onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  document.body.appendChild(b);
  const sync = () => { b.classList.toggle('show', window.scrollY > 300); };
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('pageshow', sync);
  sync();
})();
