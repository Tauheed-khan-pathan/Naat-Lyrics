let all=[], lang='roman', cat='All', size=1.05;
const tabsEl=document.getElementById('tabs'), listEl=document.getElementById('list'), searchEl=document.getElementById('search'), countEl=document.getElementById('count');
fetch('lyrics.json').then(r=>r.json()).then(d=>{all=d; buildTabs(); render();});
function buildTabs(){
  const cats=['All',...new Set(all.map(x=>x.category))];
  tabsEl.innerHTML=cats.map(c=>{
    const n=c==='All'?all.length:all.filter(x=>x.category===c).length;
    return `<button class="tab ${c===cat?'active':''}" data-cat="${c}">${c==='All'?'Sab':c} (${n})</button>`;
  }).join('');
  tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cat=b.dataset.cat; buildTabs(); render();});
}
function matches(x,q){
  if(!q) return true;
  return x.title.toLowerCase().includes(q) || x.roman.join(' ').toLowerCase().includes(q) || x.hindi.join(' ').toLowerCase().includes(q);
}
function render(){
  const q=searchEl.value.trim().toLowerCase();
  const items=all.filter(x=>(cat==='All'||x.category===cat) && matches(x,q));
  countEl.textContent = q ? `${items.length} result mile` : `${all.length} lyrics • ${new Set(all.map(x=>x.category)).size} categories`;
  listEl.innerHTML = items.length ? items.map(x=>{
    const lines=x[lang], preview=lines.slice(0,2).join('\n');
    return `<article class="card"><h2><a href="lyric.html?id=${x.id}">${x.title}</a></h2><div class="meta">${x.category} • ${x.poet}</div><div class="lines preview" style="font-size:${size}rem">${preview}</div><button class="copy" data-id="${x.id}">Copy karo</button><a class="read" href="lyric.html?id=${x.id}">Poori lyric padho →</a></article>`;
  }).join('') : '<div class="empty"><p>Koi result nahi mila.</p><p>Doosra word, ya sirf ek line ka hissa try karo — search har line aur har word me chalta hai.</p></div>';
  listEl.querySelectorAll('.copy').forEach(b=>b.onclick=()=>{
    const x=all.find(i=>i.id===b.dataset.id);
    navigator.clipboard.writeText(x.title+'\n'+x[lang].join('\n'));
    b.textContent='Copy ho gaya ✓'; setTimeout(()=>b.textContent='Copy karo',1500);
  });
}
searchEl.oninput=render;
document.querySelectorAll('.lang button[data-lang]').forEach(b=>b.onclick=()=>{
  lang=b.dataset.lang;
  document.querySelectorAll('.lang button[data-lang]').forEach(x=>x.classList.toggle('active',x===b));
  render();
});
document.getElementById('fontUp').onclick=()=>{size=Math.min(1.4,size+0.1); render();};
document.getElementById('fontDown').onclick=()=>{size=Math.max(0.9,size-0.1); render();};
