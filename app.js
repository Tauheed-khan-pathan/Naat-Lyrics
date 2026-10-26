let all=[], lang='roman', cat='All', size=1.05, full=null, fullLoading=false;
const PAGE=20; let shown=PAGE;
const tabsEl=document.getElementById('tabs'), listEl=document.getElementById('list'), searchEl=document.getElementById('search'), countEl=document.getElementById('count');
fetch('lyrics-index.json').then(r=>r.json()).then(d=>{all=d; const q=new URLSearchParams(location.search).get('q'); if(q){searchEl.value=q; syncClear();} buildTabs(); render();});
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
  return `<article class="card"><h2><a href="lyric.html?id=${x.id}">${x.title}</a></h2><div class="meta">${x.category} • Shayar: ${x.poet} • Naat Khawan: ${x.khawan || 'Unknown'}</div><div class="lines preview" style="font-size:${size}rem">${preview.join('\n')}</div><a class="read" href="lyric.html?id=${x.id}">Read full lyric →</a></article>`;
}
function miniCard(x){
  return `<a class="mini-card" href="lyric.html?id=${x.id}"><strong>${x.title}</strong><span>${x.category} • Shayar: ${x.poet}</span></a>`;
}
function render(reset=true){
  if(reset) shown=PAGE;
  const q=searchEl.value.trim().toLowerCase();
  let items=all.filter(x=>(cat==='All'||x.category===cat) && matchesIndex(x,q));
  if(q && items.length===0 && !full && !fullLoading){
    fullLoading=true;
    fetch('lyrics.json').then(r=>r.json()).then(d=>{full=d; fullLoading=false; render();});
    if(countEl) countEl.textContent='Searching full lyrics…';
    listEl.innerHTML='<div class="empty"><p>Searching full lyrics, please wait…</p></div>';
    return;
  }
  if(q && full){
    items=full.filter(x=>(cat==='All'||x.category===cat) && matchesFull(x,q));
  }
  if(countEl) countEl.textContent = q ? `${items.length} results found` : '';
  if(!q && cat==='All'){
    const cats=[...new Set(all.map(x=>x.category))];
    const popular=[...all].slice(0,4);
    const recent=[...all].slice(-4).reverse();
    const boxes=cats.map(c=>{
      const n=all.filter(x=>x.category===c).length;
      return `<button class="catbox" data-cat="${c}"><strong>${c}</strong><span>${n} lyrics</span></button>`;
    }).join('');
    listEl.innerHTML =
      `<section><h2 class="section-title">Categories</h2><div class="catgrid">${boxes}</div></section>` +
      `<section><h2 class="section-title">Most Read</h2><div class="hscroll">${popular.map(miniCard).join('')}</div></section>` +
      `<section><h2 class="section-title">Recently Added</h2><div class="hscroll">${recent.map(miniCard).join('')}</div></section>` +
      `<section><h2 class="section-title">All Lyrics</h2>${items.slice(0,shown).map(card).join('')}${items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:''}</section>`;
    listEl.querySelectorAll('.catbox').forEach(b=>b.onclick=()=>{cat=b.dataset.cat; buildTabs(); render(); window.scrollTo({top:0,behavior:'smooth'});});
  } else {
    listEl.innerHTML = items.length ? items.slice(0,shown).map(card).join('') + (items.length>shown?`<button id="seeMore" class="see-more">See more (${items.length-shown} more)</button>`:'') : '<div class="empty"><p>No results found.</p><p>Try another word, or just part of a line — search works across every line and word.</p></div>';
  }
  _wireSeeMore();
}
const _wireSeeMore=()=>{const b=document.getElementById('seeMore'); if(b) b.onclick=()=>{shown+=PAGE; render(false);};};
const clearBtn=document.getElementById('clearSearch');
function syncClear(){ if(clearBtn) clearBtn.classList.toggle('show', !!searchEl.value); }
syncClear();
searchEl.oninput=()=>{syncClear(); render();};
if(clearBtn) clearBtn.onclick=()=>{searchEl.value=''; syncClear(); render(); searchEl.focus();};
document.querySelectorAll('.lang button[data-lang]').forEach(b=>b.onclick=()=>{
  lang=b.dataset.lang;
  document.querySelectorAll('.lang button[data-lang]').forEach(x=>x.classList.toggle('active',x===b));
  render(false);
});
const fontUpBtn=document.getElementById('fontUp'); if(fontUpBtn) fontUpBtn.onclick=()=>{size=Math.min(1.4,size+0.1); render(false);};
const fontDownBtn=document.getElementById('fontDown'); if(fontDownBtn) fontDownBtn.onclick=()=>{size=Math.max(0.9,size-0.1); render(false);};

const darkBtn=document.getElementById('darkToggle');
function applyDark(){const d=localStorage.getItem('naat-dark')==='1';document.body.classList.toggle('dark',d);}
applyDark();
if(darkBtn)darkBtn.onclick=()=>{localStorage.setItem('naat-dark',document.body.classList.contains('dark')?'0':'1');applyDark();};
