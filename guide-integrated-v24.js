/* Integrate selected Dr Gorman guide refinements and images into existing injection techniques. */
(() => {
  if (window.__gormanIntegratedV24) return;
  window.__gormanIntegratedV24 = true;
  const VERSION='v24';
  const route=()=>location.hash.split('/')[1]||'';
  const isInjection=()=>location.hash.split('/')[2]==='injection';
  const asset=p=>new URL(p,document.baseURI).href;

  const general=[
    'Identify and mark the intended bony and soft-tissue landmarks before skin antisepsis.',
    'Position the patient comfortably; use a recumbent position when fainting or vasovagal symptoms are a concern.',
    'Use careful antiseptic preparation and a sterile no-touch technique.',
    'If infection, crystal synovitis or bleeding is suspected, aspiration and fluid analysis may be diagnostically important. Do not inject corticosteroid when infection is suspected.',
    'Do not inject against unexpected resistance. For tendon-sheath procedures, avoid intratendinous placement and reposition if the needle moves with tendon excursion.',
    'Relative rest of the treated site for about 24–48 hours after a therapeutic injection is commonly advised, adjusted to the patient and procedure.'
  ];

  const data={
    hand:[
      {re:/^5\.2\s+MCP joint/i,text:['Use a dorsolateral approach with the digit in semiflexion to expose the joint line.','Avoid overdistending small joints; maintain firm sterile-gauze pressure afterwards because fluid may track back along the needle path.'],imgs:['images/hand-mcp-joint-injection-diagram.jpg','MCP landmark/needle approach diagram','images/hand-mcp-joint-injection-clinical.jpg','Clinical MCP injection positioning']},
      {re:/^5\.3\s+PIP/i,text:['A dorsolateral approach with the digit in semiflexion can help expose the PIP joint line.','Inject gently because the joint capacity is small; unexpected resistance should prompt reassessment.'],imgs:['images/hand-pip-joint-injection-diagram.jpg','PIP landmark/needle approach diagram','images/hand-pip-joint-injection-clinical.jpg','Clinical PIP injection positioning']},
      {re:/^5\.6\s+Carpal tunnel/i,text:['A landmark approach is described approximately 5 mm proximal to the distal wrist crease, just medial to palmaris longus; if palmaris longus is absent, the guide uses the midline.','Paresthesia during advancement suggests median-nerve contact and requires immediate repositioning. If the needle moves with gentle finger motion, tendon engagement is likely and the needle should be repositioned.'],imgs:['images/hand-carpal-tunnel-injection-diagram.jpg','Carpal tunnel landmark approach diagram','images/hand-carpal-tunnel-injection-clinical.jpg','Clinical carpal tunnel needle positioning']},
      {re:/^5\.7\s+Radiocarpal|^5\.7\s+.*wrist/i,text:['For the radiocarpal joint, use a dorsal entry just distal to Lister’s tubercle and just ulnar to extensor pollicis longus.','Slight palmar flexion can make the dorsal wrist joint line easier to access.'],imgs:['images/hand-wrist-joint-injection-diagram.jpg','Wrist joint landmark approach diagram','images/hand-wrist-joint-injection-clinical.jpg','Clinical wrist joint needle positioning']},
      {re:/^5\.5\s+De Quervain/i,text:['Aim toward the radial styloid along the first dorsal compartment, then withdraw slightly before injecting.','Keep injectate within the tendon-sheath region; superficial corticosteroid placement increases the risk of skin atrophy or hypopigmentation.']},
      {re:/^5\.1\s+First carpometacarpal/i,text:['Flexing the thumb across the palm can help expose the first CMC joint line in the anatomic snuffbox.','Avoid the radial artery because its course around the joint can vary.']}
    ],
    elbow:[
      {re:/(?:6\.\s*Intra-articular elbow injection|Elbow joint.*Injection)/i,text:['Keep the elbow flexed to about 90° for landmark approaches.','Posterior entry uses the midline depression between the two halves of the triceps tendon, directed perpendicular to the skin into the olecranon fossa.','A lateral radiocapitellar entry is just proximal to the radial head, with the needle passed perpendicular to the skin between radial head and capitellum.'],imgs:['images/elbow-joint-posterior-injection-diagram.jpg','Posterior elbow joint landmark approach','images/elbow-joint-posterior-injection-clinical.jpg','Clinical posterior elbow joint positioning','images/elbow-joint-lateral-injection-diagram.jpg','Lateral radiocapitellar landmark approach','images/elbow-joint-lateral-injection-clinical.jpg','Clinical lateral elbow joint positioning']},
      {re:/(?:9\.\s*Olecranon bursa|Olecranon bursa.*Aspiration and Injection)/i,text:['Use a lateral entry through normal skin and aim toward the centre of the bursa.','Avoid the bursal apex/tip because a persistent leaking puncture may provide a route for infection; avoid medial entry because of the ulnar nerve.']}
    ],
    shoulder:[
      {re:/Injection Technique into the Glenohumeral Joint/i,text:['Posterior approach: seat the patient, identify the posterior corner of the acromion, enter about 1 cm inferior and 1 cm medial, and aim toward the coracoid.','The guide favours the posterior approach because it tends to cause less apprehension and keeps the needle farther from anterior neurovascular structures.','Anterior approach: with the patient seated and arm relaxed, enter about 1 cm distal and 1 cm lateral to the coracoid.'],imgs:['images/shoulder-glenohumeral-posterior-injection-diagram.jpg','Posterior glenohumeral landmark approach','images/shoulder-glenohumeral-posterior-injection-clinical.jpg','Clinical posterior glenohumeral positioning','images/shoulder-glenohumeral-anterior-injection-diagram.jpg','Anterior glenohumeral landmark approach','images/shoulder-glenohumeral-anterior-injection-clinical.jpg','Clinical anterior glenohumeral positioning']},
      {re:/Injection Technique into the Subacromial Space/i,text:['For a posterolateral approach, aim anteromedially beneath the anterior half of the acromion.','Adequate muscle relaxation improves palpation of the gap between the acromion and humeral head.'],imgs:['images/shoulder-subacromial-posterolateral-injection-diagram.jpg','Posterolateral subacromial landmark approach','images/shoulder-subacromial-posterolateral-injection-clinical.jpg','Clinical posterolateral subacromial positioning']}
    ],
    hip:[
      {re:/(?:Injection Technique for GTPS|Greater trochanteric pain syndrome.*Injection)/i,text:['Position the patient on the opposite side and identify the greater trochanter by palpating proximally along the femur.','The point of maximal tenderness is often around the posterior aspect of the greater trochanter; advance to bony contact before withdrawing slightly for peri-trochanteric infiltration.','Ensure the selected needle is long enough to reach the target when soft-tissue depth is greater.'],imgs:['images/hip-trochanteric-bursa-injection-diagram.jpg','Greater trochanteric landmark injection diagram','images/hip-trochanteric-bursa-injection-clinical.jpg','Clinical greater trochanteric injection positioning'],skipIfExisting:true}
    ],
    knee:[
      {re:/Injection Technique for Knee Osteoarthritis/i,text:['A lateral approach may be directed toward the undersurface of the patella at roughly the midpoint between its superior and inferior poles.','When a significant effusion is present, aspiration before therapeutic injection is useful; if septic arthritis is a concern, defer corticosteroid until infection has been excluded.']},
      {re:/Injection Technique for Pes Anserine/i,text:['With the knee semiflexed, follow the medial hamstring/semitendinosus region to its tibial insertion, mark the tender site, then extend the knee for injection.','Medial-leg paresthesia suggests contact with the saphenous nerve and requires repositioning.']}
    ],
    foot:[
      {re:/(?:^\d+(?:\.\d+)?\s+)?Tibiotalar/i,text:['With the patient supine, gently flex and extend the ankle to identify the tibia–talus joint cleft.','Use a vertical entry medial to tibialis anterior and avoid the dorsalis pedis artery.'],imgs:['images/ankle-joint-injection-diagram.jpg','Ankle joint landmark injection diagram','images/ankle-joint-injection-clinical.jpg','Clinical ankle joint injection positioning']},
      {re:/(?:^\d+(?:\.\d+)?\s+)?Subtalar/i,text:['Use inversion and eversion to identify the sinus tarsi anterior to the lateral malleolus.','Advance toward the subtalar target under low pressure; unexpected resistance should prompt reassessment.'],imgs:['images/foot-subtalar-joint-injection-diagram.jpg','Subtalar joint landmark injection diagram','images/foot-subtalar-joint-injection-clinical.jpg','Clinical subtalar joint injection positioning']},
      {re:/(?:^\d+(?:\.\d+)?\s+)?(?:Metatarsophalangeal|MTP)/i,text:['For MTP joints, a dorsal entry just medial or lateral to the extensor tendon is facilitated by slight passive plantarflexion.','Inject gently because MTP joint capacity is small.'],imgs:['images/foot-mtp-joint-injection-diagram.jpg','MTP joint landmark injection diagram','images/foot-mtp-joint-injection-clinical.jpg','Clinical MTP joint injection positioning']}
    ]
  };

  function sectionTitle(s){return (s.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent||s.querySelector(':scope > h2')?.textContent||'').trim();}
  function allTargets(){
    const out=[];
    document.querySelectorAll('#view .section').forEach(s=>{const title=sectionTitle(s);if(title)out.push({title,body:s.querySelector(':scope > .inj-collapse-body')||s,section:s});});
    document.querySelectorAll('#view .hand-inj-sub').forEach(card=>{const title=card.querySelector('.hand-inj-sub-title')?.textContent?.trim()||'';const body=card.querySelector('.hand-inj-sub-body');if(title&&body)out.push({title,body,section:card});});
    document.querySelectorAll('#view h3.sub').forEach(h=>{if(h.closest('[data-guide-integrated]'))return;out.push({title:h.textContent?.trim()||'',anchor:h,section:h.closest('.section')});});
    return out;
  }
  function siblingsUntilNext(h){const a=[];let n=h.nextElementSibling;while(n&&!n.matches('h3.sub')){a.push(n);n=n.nextElementSibling;}return a;}
  function targetHasImages(info){if(info.body)return !!info.body.querySelector('.figs img,figure img');return siblingsUntilNext(info.anchor).some(n=>n.matches?.('.figs,figure')||n.querySelector?.('.figs img,figure img'));}
  function makeText(items,key){const box=document.createElement('div');box.dataset.guideIntegrated=VERSION;box.dataset.guideKey=key;box.className='callout';const b=document.createElement('b');b.textContent='Additional guide refinement';box.appendChild(b);const ul=document.createElement('ul');items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li);});box.appendChild(ul);return box;}
  function makeFigure(src,cap){const f=document.createElement('figure');const img=document.createElement('img');img.src=asset(src)+'?v=24';img.alt=cap;img.loading='eager';img.decoding='async';const c=document.createElement('figcaption');c.textContent=cap;f.append(img,c);return f;}
  function makeImages(arr,key){const grid=document.createElement('div');grid.dataset.guideIntegrated=VERSION;grid.dataset.guideKey=key+'-images';grid.className='figs '+(arr.length===4?'n2':'n4');for(let i=0;i<arr.length;i+=2)grid.appendChild(makeFigure(arr[i],arr[i+1]));return grid;}
  function insert(info,node){if(info.body){info.body.appendChild(node);return;}let last=info.anchor;const sib=siblingsUntilNext(info.anchor);if(sib.length)last=sib[sib.length-1];last.after(node);}

  function addGeneral(){const view=document.querySelector('#view');if(!view||view.querySelector('[data-guide-general="v24"]'))return;const target=allTargets().find(x=>/before any injection|injection framework|pre-injection/i.test(x.title));if(!target?.body)return;const box=makeText(general,'general');box.dataset.guideGeneral='v24';target.body.appendChild(box);}

  function addHipJointSection(){
    if(route()!=='hip'||document.querySelector('[data-guide-hip-joint="v24"]')||allTargets().some(x=>/Hip joint injection/i.test(x.title)))return;
    const gtps=allTargets().find(x=>/Injection Technique for GTPS/i.test(x.title));if(!gtps?.section)return;
    const sec=document.createElement('section');sec.className='section';sec.dataset.guideHipJoint='v24';
    const h=document.createElement('h2');h.textContent='Hip joint injection — supplementary guide technique';sec.appendChild(h);
    const p=document.createElement('p');p.textContent='The supplied guide includes a landmark hip-joint injection technique. The existing app notes that intra-articular hip injections are commonly performed with image guidance; this subsection is retained as supplementary source teaching rather than replacing that caution.';sec.appendChild(p);
    sec.appendChild(makeText(['Position the patient supine and identify the femoral pulse and anterior superior iliac spine before marking the intended anterior approach.','The guide places the entry lateral to the femoral artery and distal to the inguinal ligament, with the needle directed toward the femoral neck until bone is contacted.','Because the joint is deep and the femoral neurovascular bundle is nearby, careful landmark identification and appropriate needle length are essential.'],'hip-joint'));
    sec.appendChild(makeImages(['images/hip-joint-injection-diagram.jpg','Hip joint landmark injection diagram','images/hip-joint-injection-clinical.jpg','Clinical hip joint injection positioning'],'hip-joint'));
    gtps.section.after(sec);
  }

  function ensure(){
    if(!isInjection())return;
    document.querySelectorAll('#view [data-gorman-guide],#view [data-guide-images]').forEach(n=>n.remove());
    addGeneral();
    const targets=allTargets();
    (data[route()]||[]).forEach((entry,i)=>{
      const info=targets.find(x=>entry.re.test(x.title));if(!info)return;
      const key=`${route()}-${i}`;
      const scope=info.body||info.section||info.anchor?.parentElement;
      if(scope?.querySelector(`[data-guide-key="${key}"]`))return;
      insert(info,makeText(entry.text,key));
      if(entry.imgs&&!(entry.skipIfExisting&&targetHasImages(info)))insert(info,makeImages(entry.imgs,key));
    });
    addHipJointSection();
  }
  let q=false;const schedule=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;ensure();});};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('hashchange',schedule);addEventListener('DOMContentLoaded',schedule);schedule();
})();
