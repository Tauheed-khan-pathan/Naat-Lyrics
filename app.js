let all=[], poets=[], cat='All', size=1.05, full=null, fullLoading=false;
fetch('poets.json?v=3').then(r=>r.json()).then(d=>{poets=d; if(all.length) render(false);}).catch(()=>{});
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
function matchesIndex(x,q){
  if(!q) return true;
  return x.title.toLowerCase().includes(q) || x.poet.toLowerCase().includes(q) || x.category.toLowerCase().includes(q) || (x.khawan||'').toLowerCase().includes(q) || x.preview.join(' ').toLowerCase().includes(q);
}
function matchesFull(x,q){
  if(!q) return true;
  return x.title.toLowerCase().includes(q) || x.roman.join(' ').toLowerCase().includes(q) || x.hindi.join(' ').toLowerCase().includes(q) || (x.urdu||[]).join(' ').toLowerCase().includes(q);
}
function card(x){
  const preview=x.preview || (x.roman||[]).slice(0,2);
  const poetObj=poets.find(p=>p.name===x.poet);
  const poetHtml=poetObj?`<a href="poet.html?id=${poetObj.id}">${x.poet}</a>`:x.poet;
  return `<article class="card"><h2><a href="lyric/${x.id}.html">${x.title}</a></h2><div class="meta">${x.category} • Shayar: ${poetHtml} • Naat Khawan: ${x.khawan || 'Unknown'}</div><div class="lines preview" style="font-size:${size}rem">${preview.join('\n')}</div><a class="read" href="lyric/${x.id}.html">Read full ${x.category||'lyric'}</a></article>`;
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
      return `<button class="catbox" data-cat="${c}"><strong>${c}</strong><span>${n} lyrics</span></button>`;
    }).join('') + `<a class="catbox" href="a-z.html" style="text-decoration:none"><strong>All A-Z Index</strong></a>`;
    listEl.innerHTML =
      `<section><h2 class="section-title">Categories</h2><div class="catgrid">${boxes}</div></section>` +
      `<section><h2 class="section-title">Most Read</h2><div class="hscroll">${popular.map(miniCard).join('')}</div></section>` +
      `<section><h2 class="section-title">Recently Added</h2><div class="hscroll">${recent.map(miniCard).join('')}</div></section>` +
      (poets.length?`<section><h2 class="section-title">Shuara (Poets)</h2><div class="hscroll">${poets.map(pp=>{const n=all.filter(x=>x.poet===pp.name).length; return `<a class="poet-card" href="poet.html?id=${pp.id}"><strong>${pp.name}</strong><span>${pp.honorific||''}</span><span>${n} lyrics</span></a>`;}).join('')}</div></section>`:'') +
      `<section><h2 class="section-title">All Lyrics</h2>${items.slice(0,shown).map(card).join('')}${items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:''}</section>`;
    listEl.querySelectorAll('.catbox').forEach(b=>b.onclick=()=>{cat=b.dataset.cat; buildTabs(); render(); window.scrollTo({top:0,behavior:'smooth'});});
  } else {
    listEl.innerHTML = items.length ? items.slice(0,shown).map(card).join('') + (items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:'') : '<div class="empty"><p>No results found.</p><p>Try another word, or just part of a line — search works across every line and word.</p></div>';
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
