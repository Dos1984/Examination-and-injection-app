/* v33 — standard regional injection layout; numbering handled elsewhere. */
(() => {
  const route=()=>location.hash.split('/')[1]||'';
  const isInjection=()=>location.hash.split('/')[2]==='injection';
  const patterns={
    elbow:[/elbow joint/i,/olecranon/i,/lateral epicondyl|tennis elbow/i,/medial epicondyl/i,/distal biceps|bicipitoradial/i],
    shoulder:[/glenohumeral/i,/subacromial/i,/acromioclavicular|\bAC joint/i,/bicipital|biceps.*groove/i],
    hip:[/hip joint|intra.?articular hip/i,/trochanter|GTPS|greater trochanteric/i],
    knee:[/knee joint|intra.?articular knee|patellofemoral|suprapatellar/i,/pes anser/i,/baker/i],
    ankle:[/ankle joint|tibiotalar/i,/subtalar|sinus tarsi/i,/posterior tibialis/i,/plantar fascia/i,/morton/i,/metatarsophalangeal|\bMTP\b/i],
    foot:[/ankle joint|tibiotalar/i,/subtalar|sinus tarsi/i,/posterior tibialis/i,/plantar fascia/i,/morton/i,/metatarsophalangeal|\bMTP\b/i]
  };
  const clean=t=>String(t||'').replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i,'').trim();
  const titleOf=s=>(s.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent||s.querySelector(':scope > h2')?.textContent||'').trim();
  const bodyOf=s=>s.querySelector(':scope > .inj-collapse-body')||s;
  const matches=(t,rs)=>rs.some(re=>re.test(clean(t)));

  function card(title,nodes,id){
    const c=document.createElement('section');c.className='hand-inj-sub region-inj-sub collapsed';c.dataset.regionProcedure='v33';if(id)c.id=id;
    const b=document.createElement('div');b.className='hand-inj-sub-body';nodes.forEach(n=>b.appendChild(n));
    const tog=document.createElement('button');tog.type='button';tog.className='hand-inj-sub-toggle';tog.setAttribute('aria-expanded','false');
    const tx=document.createElement('span');tx.className='hand-inj-sub-text';const lab=document.createElement('span');lab.className='hand-inj-sub-title';lab.textContent=clean(title);const hint=document.createElement('span');hint.className='hand-inj-sub-hint';hint.textContent='Tap to view landmarks, approach & safety';tx.append(lab,hint);
    const thumb=document.createElement('span');thumb.className='hand-inj-thumb';const img=b.querySelector('.figs img,figure img');if(img?.src){const im=document.createElement('img');im.src=img.src;im.alt=img.alt||clean(title);im.loading='lazy';thumb.appendChild(im);}else thumb.classList.add('no-image');
    const ch=document.createElement('span');ch.className='hand-inj-sub-chevron';ch.textContent='⌄';ch.setAttribute('aria-hidden','true');tog.append(tx,thumb,ch);c.append(tog,b);
    tog.addEventListener('click',()=>{const closed=c.classList.toggle('collapsed');tog.setAttribute('aria-expanded',String(!closed));});return c;
  }

  function addProcedureCards(outer,section){
    const source=bodyOf(section);const headings=[...source.querySelectorAll(':scope > h3.sub')];
    if(route()!=='elbow'||!headings.length){outer.appendChild(card(titleOf(section),[...source.children],section.id));section.remove();return;}
    const base=clean(titleOf(section)).replace(/:\s*landmark approaches?$/i,'');
    const intro=[];let n=source.firstElementChild;while(n&&n!==headings[0]){const next=n.nextElementSibling;intro.push(n);n=next;}
    headings.forEach((h,i)=>{const nodes=i===0?[...intro]:[];let item=h.nextElementSibling;while(item&&!item.matches('h3.sub')){const next=item.nextElementSibling;nodes.push(item);item=next;}outer.appendChild(card(`${base}: ${clean(h.textContent)}`,nodes,h.id||(i===0?section.id:'')));h.remove();});
    section.remove();
  }

  function ensure(){
    if(!isInjection())return;const rs=patterns[route()];if(!rs)return;const view=document.querySelector('#view');if(!view)return;
    let outer=[...view.querySelectorAll(':scope > .section')].find(s=>/landmark[ -]guided injection techniques|landmark injections?/i.test(clean(titleOf(s))));
    if(outer?.dataset.regionLandmark==='v33')return;
    if(!outer){
      const secs=[...view.querySelectorAll(':scope > .section')].filter(s=>matches(titleOf(s),rs));
      if(secs.length<2)return;
      outer=document.createElement('section');outer.className='section region-landmark-section';const h=document.createElement('h2');h.textContent='Landmark injections';outer.appendChild(h);secs[0].before(outer);
      secs.forEach(s=>addProcedureCards(outer,s));
    }
    const body=bodyOf(outer);
    [...body.querySelectorAll(':scope > h3.sub')].filter(h=>matches(h.textContent,rs)).forEach(h=>{const nodes=[];let n=h.nextElementSibling;while(n&&!n.matches('h3.sub')){const next=n.nextElementSibling;nodes.push(n);n=next;}h.replaceWith(card(h.textContent,nodes,h.id));});
    const outerLabel=outer.querySelector(':scope > h2, :scope > .inj-collapse-toggle > span:first-child');
    if(outerLabel) outerLabel.textContent='Landmark injections';
    outer.dataset.regionLandmark='v33';
  }
  let q=false;const schedule=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;ensure();});};new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('hashchange',schedule);addEventListener('DOMContentLoaded',schedule);schedule();
})();
