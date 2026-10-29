let poet=null, all=[], tab='lyrics';
const el=document.getElementById('poet');
const id=new URLSearchParams(location.search).get('id');
Promise.all([fetch('poets.json?v=3').then(r=>r.json()).catch(()=>[]), fetch('lyrics-index.json').then(r=>r.json())]).then(([poets,idx])=>{
  all=idx; poet=poets.find(p=>p.id===id);
  if(!poet){el.innerHTML='<div class="empty"><p>Poet not found.</p><p><a class="read" href="index.html">Back to home</a></p></div>'; return;}
  render();
});
function card(x){
  const preview=x.preview || (x.roman||[]).slice(0,2);
  return `<article class="card"><h2><a href="lyric/${x.id}.html">${x.title}</a></h2><div class="meta">${x.category} • Naat Khawan: ${x.khawan || 'Unknown'}</div><div class="lines preview" style="font-size:1.05rem">${preview.join('\n')}</div><a class="read" href="lyric/${x.id}.html">Read full ${x.category||'lyric'}</a></article>`;
}
function render(){
  const items=all.filter(x=>x.poet===poet.name);
  const facts=Object.entries(poet.facts||{}).map(([k,v])=>`<p><strong>${k}:</strong> ${v}</p>`).join('');
  const lyricsHtml=items.length ? items.map(card).join('') : '<div class="empty"><p>Kalaam by this poet are being added and will appear here.</p></div>';
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
