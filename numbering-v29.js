/* v32 — single source of truth for page numbering and final dropdown normalisation. */
(() => {
  const tab=()=>location.hash.split('/')[2]||'';
  const route=()=>location.hash.split('/')[1]||'';
  const relevant=()=>/^(?:injection|examination|exam)$/.test(tab());
  const strip=t=>String(t||'').replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i,'').replace(/^\s*(?:section|procedure|approach)\s+\d+(?:\.\d+)*\s*[:.)-]?\s*/i,'').trim();
  const bodyOf=s=>s.querySelector(':scope > .inj-collapse-body')||s;
  const topLabel=s=>s.querySelector(':scope > .inj-collapse-toggle > span:first-child')||s.querySelector(':scope > h2');
  const setText=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};

  function makeProcedureCard(title,nodes,id){
    const c=document.createElement('section');c.className='hand-inj-sub region-inj-sub collapsed';c.dataset.regionProcedure='v32';if(id)c.id=id;
    const b=document.createElement('div');b.className='hand-inj-sub-body';nodes.forEach(n=>b.appendChild(n));
    const tog=document.createElement('button');tog.type='button';tog.className='hand-inj-sub-toggle';tog.setAttribute('aria-expanded','false');
    const tx=document.createElement('span');tx.className='hand-inj-sub-text';const lab=document.createElement('span');lab.className='hand-inj-sub-title';lab.textContent=strip(title);const hint=document.createElement('span');hint.className='hand-inj-sub-hint';hint.textContent='Tap to view landmarks, approach & safety';tx.append(lab,hint);
    const thumb=document.createElement('span');thumb.className='hand-inj-thumb';const im0=b.querySelector('.figs img,figure img');if(im0?.src){const im=document.createElement('img');im.src=im0.src;im.alt=im0.alt||strip(title);im.loading='lazy';thumb.appendChild(im);}else thumb.classList.add('no-image');
    const ch=document.createElement('span');ch.className='hand-inj-sub-chevron';ch.textContent='⌄';ch.setAttribute('aria-hidden','true');tog.append(tx,thumb,ch);c.append(tog,b);tog.addEventListener('click',()=>{const closed=c.classList.toggle('collapsed');tog.setAttribute('aria-expanded',String(!closed));});return c;
  }

  function normaliseHip(){
    if(tab()!=='injection'||route()!=='hip')return;
    const outer=[...document.querySelectorAll('#view > .section')].find(s=>/landmark[ -]guided injection/i.test(strip(topLabel(s)?.textContent)));
    if(!outer)return;const body=bodyOf(outer);
    let matches=[...body.children].filter(el=>{
      const t=el.matches('.hand-inj-sub')?el.querySelector('.hand-inj-sub-title')?.textContent:topLabel(el)?.textContent;
      return /hip joint injection.*supplementary guide technique/i.test(strip(t));
    });
    if(!matches.length)return;
    let keep=matches.find(x=>x.matches('.hand-inj-sub'))||matches[0];
    if(!keep.matches('.hand-inj-sub')){
      const replacement=makeProcedureCard(topLabel(keep)?.textContent,[...bodyOf(keep).children],keep.id);keep.replaceWith(replacement);keep=replacement;
    }
    matches=[...body.children].filter(el=>el!==keep&&/hip joint injection.*supplementary guide technique/i.test(strip(el.matches('.hand-inj-sub')?el.querySelector('.hand-inj-sub-title')?.textContent:topLabel(el)?.textContent)));
    matches.forEach(x=>x.remove());
  }

  function nested(section,mainNo){
    const body=bodyOf(section);let sub=0;
    [...body.children].forEach(el=>{
      let label=null;
      if(el.matches('.hand-inj-sub')) label=el.querySelector(':scope > .hand-inj-sub-toggle .hand-inj-sub-title');
      else if(el.matches('h3.sub')) label=el;
      if(!label)return;
      sub+=1;const base=strip(label.textContent);setText(label,`${mainNo}.${sub} ${base}`);el.dataset.pageNumber=`${mainNo}.${sub}`;
    });
  }

  function renumberNav(){
    document.querySelectorAll('.sidenav a[href^="#"]').forEach(a=>{
      const href=a.getAttribute('href');if(!href)return;let target=null;try{target=document.querySelector(href);}catch(_){return;}
      const numbered=target?.dataset?.pageNumber?target:target?.closest?.('[data-page-number]');const n=numbered?.dataset?.pageNumber;if(!n)return;
      setText(a,`${n} ${strip(a.textContent)}`);
    });
  }

  function ensure(){
    if(!relevant())return;const view=document.querySelector('#view');if(!view)return;
    document.querySelectorAll('.standard-region-number').forEach(x=>x.remove());
    normaliseHip();
    const sections=[...view.querySelectorAll(':scope > .section')].filter(s=>strip(topLabel(s)?.textContent));
    sections.forEach((s,i)=>{const n=i+1;const label=topLabel(s);const base=strip(label?.textContent);if(!base)return;setText(label,`${n}. ${base}`);s.dataset.pageNumber=String(n);nested(s,n);});
    renumberNav();
  }

  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(ensure,40);};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('hashchange',schedule);addEventListener('DOMContentLoaded',schedule);schedule();
})();
