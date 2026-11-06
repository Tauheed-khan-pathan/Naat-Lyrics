let poet=null, all=[], tab='lyrics';
const el=document.getElementById('poet');
const id=new URLSearchParams(location.search).get('id');
Promise.all([fetch('poets.json?v=6').then(r=>r.json()).catch(()=>[]), fetch('lyrics-index.json').then(r=>r.json())]).then(([poets,idx])=>{
  all=idx; poet=poets.find(p=>p.id===id);
  if(!poet){el.innerHTML='<div class="empty"><p>Poet not found.</p><p><a class="read" href="index.html">Back to home</a></p></div>'; return;}
  render();
});
function card(x){
  const preview=x.preview || (x.roman||[]).slice(0,2);
  return `<article class="card"><h2><a href="lyric/${x.id}.html">${x.title}</a></h2><div class="meta">${x.category}</div><div class="lines preview" style="font-size:1.05rem">${preview.join('\n')}</div><a class="read" href="lyric/${x.id}.html">Read full ${x.category||'lyric'}</a></article>`;
}
function render(){
  const items=all.filter(x=>x.poet===poet.name);
  const facts=Object.entries(poet.facts||{}).map(([k,v])=>`<p><strong>${k}:</strong> ${v}</p>`).join('');
  const lyricsHtml=items.length ? items.map(card).join('') : '<div class="empty"><p>Lyrics by this poet are being added and will appear here.</p></div>';
  const aboutHtml=`<div class="card about-block">${(poet.bio||[]).map(p=>`<p>${p}</p>`).join('')}${facts}</div>`;
  el.innerHTML=`<div class="poet-head"><h1>${poet.name}</h1><p>${poet.honorific||''} • ${poet.fullName||''}</p><p>${items.length} kalaam on this site</p></div>` +
    `<nav class="poet-tabs"><button class="poet-tab ${tab==='lyrics'?'active':''}" data-tab="lyrics">Kalaam (${items.length})</button><button class="poet-tab ${tab==='about'?'active':''}" data-tab="about">About this poet</button></nav>` +
    (tab==='lyrics'?lyricsHtml:aboutHtml);
  el.querySelectorAll('.poet-tab').forEach(b=>b.onclick=()=>{tab=b.dataset.tab; render();});
}
const darkBtn=document.getElementById('darkToggle');
function applyDark(){document.body.classList.toggle('dark',localStorage.getItem('naat-dark')==='1');}
applyDark();
if(darkBtn)darkBtn.onclick=()=>{localStorage.setItem('naat-dark',document.body.classList.contains('dark')?'0':'1');applyDark();};
window.addEventListener('pageshow',applyDark);
window.addEventListener('storage',e=>{if(e.key==='naat-dark')applyDark();});

// Back-to-top button (same as homepage/lyric/A-Z pages): sirf tab dikhta hai
// jab user thoda neeche scroll kar jaaye; click par smooth scroll se top par
// le jaata hai; top par pahunchte hi gayab ho jaata hai. Chhupa hone par us
// jagah click ka koi asar nahi hota (pointer-events none + visibility hidden).
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
