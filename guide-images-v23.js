/* Selected teaching images from the supplied Dr Gorman injection guide. */
(() => {
  const sets = {
    hand: [
      ['MCP joint injection — guide figures','images/hand-mcp-joint-injection-diagram.jpg','MCP landmark/needle approach diagram','images/hand-mcp-joint-injection-clinical.jpg','Clinical MCP injection positioning'],
      ['PIP joint injection — guide figures','images/hand-pip-joint-injection-diagram.jpg','PIP landmark/needle approach diagram','images/hand-pip-joint-injection-clinical.jpg','Clinical PIP injection positioning'],
      ['Carpal tunnel injection — guide figures','images/hand-carpal-tunnel-injection-diagram.jpg','Carpal tunnel landmark approach diagram','images/hand-carpal-tunnel-injection-clinical.jpg','Clinical carpal tunnel needle positioning'],
      ['Wrist joint injection — guide figures','images/hand-wrist-joint-injection-diagram.jpg','Wrist joint landmark approach diagram','images/hand-wrist-joint-injection-clinical.jpg','Clinical wrist joint needle positioning']
    ],
    elbow: [
      ['Posterior elbow joint approach — guide figures','images/elbow-joint-posterior-injection-diagram.jpg','Posterior elbow joint landmark approach','images/elbow-joint-posterior-injection-clinical.jpg','Clinical posterior elbow joint positioning'],
      ['Lateral elbow joint approach — guide figures','images/elbow-joint-lateral-injection-diagram.jpg','Lateral radiocapitellar landmark approach','images/elbow-joint-lateral-injection-clinical.jpg','Clinical lateral elbow joint positioning']
    ],
    shoulder: [
      ['Posterior glenohumeral approach — guide figures','images/shoulder-glenohumeral-posterior-injection-diagram.jpg','Posterior glenohumeral landmark approach','images/shoulder-glenohumeral-posterior-injection-clinical.jpg','Clinical posterior glenohumeral positioning'],
      ['Anterior glenohumeral approach — guide figures','images/shoulder-glenohumeral-anterior-injection-diagram.jpg','Anterior glenohumeral landmark approach','images/shoulder-glenohumeral-anterior-injection-clinical.jpg','Clinical anterior glenohumeral positioning'],
      ['Posterolateral subacromial approach — guide figures','images/shoulder-subacromial-posterolateral-injection-diagram.jpg','Posterolateral subacromial landmark approach','images/shoulder-subacromial-posterolateral-injection-clinical.jpg','Clinical posterolateral subacromial positioning']
    ],
    hip: [
      ['Hip joint injection — guide figures','images/hip-joint-injection-diagram.jpg','Hip joint landmark injection diagram','images/hip-joint-injection-clinical.jpg','Clinical hip joint injection positioning'],
      ['Greater trochanteric injection — guide figures','images/hip-trochanteric-bursa-injection-diagram.jpg','Greater trochanteric landmark injection diagram','images/hip-trochanteric-bursa-injection-clinical.jpg','Clinical greater trochanteric injection positioning']
    ],
    ankle: [
      ['Ankle joint injection — guide figures','images/ankle-joint-injection-diagram.jpg','Ankle joint landmark injection diagram','images/ankle-joint-injection-clinical.jpg','Clinical ankle joint injection positioning'],
      ['Subtalar joint injection — guide figures','images/foot-subtalar-joint-injection-diagram.jpg','Subtalar joint landmark injection diagram','images/foot-subtalar-joint-injection-clinical.jpg','Clinical subtalar joint injection positioning'],
      ['MTP joint injection — guide figures','images/foot-mtp-joint-injection-diagram.jpg','MTP joint landmark injection diagram','images/foot-mtp-joint-injection-clinical.jpg','Clinical MTP joint injection positioning']
    ],
    foot: [
      ['Subtalar joint injection — guide figures','images/foot-subtalar-joint-injection-diagram.jpg','Subtalar joint landmark injection diagram','images/foot-subtalar-joint-injection-clinical.jpg','Clinical subtalar joint injection positioning'],
      ['MTP joint injection — guide figures','images/foot-mtp-joint-injection-diagram.jpg','MTP joint landmark injection diagram','images/foot-mtp-joint-injection-clinical.jpg','Clinical MTP joint injection positioning']
    ]
  };
  const route=()=>location.hash.split('/')[1]||'';
  const injection=()=>location.hash.split('/')[2]==='injection';
  function fig(src,caption){const f=document.createElement('figure');const img=document.createElement('img');img.src=new URL(src,document.baseURI).href;img.alt=caption;img.loading='eager';img.decoding='async';img.style.cssText='width:100%;height:auto;max-height:520px;object-fit:contain;background:#fff;border-radius:14px';const c=document.createElement('figcaption');c.textContent=caption;f.append(img,c);return f;}
  function ensure(){if(!injection())return;const view=document.querySelector('#view');if(!view||view.querySelector('[data-guide-images="v23"]'))return;const items=sets[route()];if(!items)return;const sec=document.createElement('section');sec.className='section';sec.dataset.guideImages='v23';const h=document.createElement('h2');h.textContent='Additional landmark injection images';sec.appendChild(h);const p=document.createElement('p');p.textContent='Selected diagrams and clinical photographs from the supplied injection guide, included where they add useful landmark or positioning information.';sec.appendChild(p);items.forEach(([title,a,ac,b,bc])=>{const hh=document.createElement('h3');hh.className='sub';hh.textContent=title;sec.appendChild(hh);const grid=document.createElement('div');grid.className='figs n2';grid.append(fig(a,ac),fig(b,bc));sec.appendChild(grid);});view.appendChild(sec);}
  let q=false;const schedule=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;ensure();});};new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('hashchange',schedule);addEventListener('DOMContentLoaded',schedule);schedule();
})();
