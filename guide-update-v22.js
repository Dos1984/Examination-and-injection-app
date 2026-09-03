/* Technique refinements derived from the supplied Dr Gorman injection guide.
   Text only: no guide images are added by this script. */
(() => {
  const route = () => location.hash.split('/')[1] || '';
  const isInjection = () => location.hash.split('/')[2] === 'injection';

  const general = [
    ['Preparation & positioning', [
      'Identify and mark the intended bony and soft-tissue landmarks before skin antisepsis.',
      'Position the patient comfortably; use a recumbent position when fainting or vasovagal symptoms are a concern.',
      'Use careful antiseptic preparation and a sterile no-touch technique.'
    ]],
    ['Aspiration & injection safety', [
      'If infection, crystal synovitis or bleeding is suspected, aspiration and fluid analysis may be diagnostically important. Do not inject corticosteroid when infection is suspected.',
      'Do not inject against unexpected resistance. For tendon-sheath procedures, avoid intratendinous placement and reposition if the needle moves with tendon excursion.',
      'If aspiration flow suddenly stops, slight needle rotation or withdrawal may free the tip from synovium or debris.'
    ]],
    ['Aftercare', [
      'Withdraw the needle promptly, apply light pressure to the puncture site and use a simple dressing as required.',
      'Relative rest of the treated site for about 24–48 hours after a therapeutic injection is commonly advised, adjusted to the patient and procedure.',
      'Increasing pain or swelling that persists rather than settling should prompt reassessment, particularly for possible infection.'
    ]]
  ];

  const regional = {
    hand: [
      ['Finger / MCP / PIP joints', [
        'A dorsolateral approach with the digit in semiflexion can help expose the joint line.',
        'Avoid overdistending small joints; because fluid may track back along the needle path, maintain firm sterile-gauze pressure after the procedure.'
      ]],
      ['Trigger finger / flexor tendon sheath', [
        'A distal inclination of about 45° is described for the proximal-to-distal sheath approach.',
        'Reciprocal needle movement during gentle finger motion indicates tendon engagement: withdraw slightly until the needle is free before injecting.',
        'Accurate peritendinous placement is the goal; intratendinous injection should be avoided.'
      ]],
      ['De Quervain tenosynovitis', [
        'Aim toward the radial styloid along the first dorsal compartment, then withdraw slightly before injecting.',
        'Keep the injectate within the tendon-sheath region; superficial corticosteroid placement increases the risk of skin atrophy or hypopigmentation.'
      ]],
      ['Carpal tunnel', [
        'A landmark approach is described approximately 5 mm proximal to the distal wrist crease, just medial to palmaris longus; if palmaris longus is absent, the midline is used in the guide.',
        'Paresthesia during needle advancement suggests median-nerve contact and requires immediate repositioning.',
        'If the needle moves with gentle finger motion, tendon engagement is likely and the needle should be repositioned.'
      ]],
      ['Thumb CMC joint', [
        'Flexing the thumb across the palm can help expose the first CMC joint line in the anatomic snuffbox.',
        'The radial artery is the key structure to avoid because its course around the joint can vary.'
      ]],
      ['Wrist joint', [
        'For the radiocarpal joint, the guide describes a dorsal entry just distal to Lister’s tubercle and just ulnar to the extensor pollicis longus tendon.',
        'Slight palmar flexion can make the dorsal wrist joint line easier to access.'
      ]]
    ],
    elbow: [
      ['Elbow joint', [
        'Keep the elbow flexed to about 90° for the landmark approaches.',
        'Posterior entry uses the midline depression between the two halves of the triceps tendon, directed perpendicular to the skin into the olecranon fossa.',
        'A lateral radiocapitellar entry is just proximal to the radial head, with the needle passed perpendicular to the skin between the radial head and capitellum.'
      ]],
      ['Olecranon bursa', [
        'Use a lateral entry through normal skin and aim toward the centre of the bursa.',
        'Avoid entering through the bursal apex/tip because a persistent leaking puncture can provide a route for infection; avoid medial entry because of the ulnar nerve.'
      ]],
      ['Lateral epicondylitis', [
        'Target the point of maximal tenderness at the common extensor origin and keep the treatment deep rather than superficial.',
        'Repeated corticosteroid infiltrations are discouraged because they may contribute to persistent pain and tendon problems.'
      ]]
    ],
    shoulder: [
      ['Glenohumeral joint', [
        'For the posterior landmark approach, seat the patient and identify the posterior corner of the acromion; the guide describes entry about 1 cm inferior and 1 cm medial, aiming toward the coracoid.',
        'The posterior approach is favoured in the guide because it tends to cause less apprehension and keeps the needle farther from anterior neurovascular structures.',
        'For the anterior approach, the patient remains seated with the arm relaxed at the side; the entry is described about 1 cm distal and 1 cm lateral to the coracoid.'
      ]],
      ['Subacromial bursa', [
        'For a posterolateral approach, aim anteromedially beneath the anterior half of the acromion.',
        'For an anterior approach, the guide describes entry about 1 cm lateral to the AC joint, directing the needle posteriorly along the inferior surface of the acromion.',
        'Adequate muscle relaxation improves palpation of the gap between the acromion and humeral head.'
      ]],
      ['Acromioclavicular joint', [
        'Enter perpendicular to the skin into the palpable articular cleft. The narrow joint and partial meniscus can make accurate landmark placement difficult.'
      ]],
      ['Bicipital groove', [
        'Palpate and mark the long-head biceps tendon before needle placement.',
        'Direct the needle tangentially rather than into the tendon and inject under low pressure to reduce the risk of intratendinous placement.'
      ]]
    ],
    hip: [
      ['Greater trochanteric pain / trochanteric bursal region', [
        'Position the patient on the opposite side and identify the greater trochanter by palpating proximally along the femur.',
        'The point of maximal tenderness is often around the posterior aspect of the greater trochanter; advance to bony contact before withdrawing slightly for the peri-trochanteric infiltration.',
        'Ensure the selected needle is long enough to reach the target in patients with greater soft-tissue depth.'
      ]]
    ],
    knee: [
      ['Knee joint', [
        'A lateral approach may be directed toward the undersurface of the patella at roughly the midpoint between its superior and inferior poles.',
        'When a significant effusion is present, aspiration before therapeutic injection is useful; if septic arthritis is a concern, defer corticosteroid until infection has been excluded.'
      ]],
      ['Pes anserine region', [
        'With the knee semiflexed, follow the medial hamstring/semitendinosus region to its tibial insertion, mark the tender site, then extend the knee for injection.',
        'Medial-leg paresthesia suggests contact with the saphenous nerve and requires repositioning.'
      ]]
    ],
    ankle: [
      ['Ankle joint', [
        'With the patient supine, gently flex and extend the ankle to identify the tibia–talus joint cleft.',
        'The guide describes a vertical entry medial to the tibialis anterior tendon; avoid the dorsalis pedis artery.'
      ]],
      ['Subtalar joint', [
        'Use inversion and eversion to identify the sinus tarsi anterior to the lateral malleolus.',
        'Advance perpendicular to the skin toward the tip of the medial malleolus and inject under low pressure.'
      ]],
      ['Posterior tibialis tendon sheath', [
        'Ask the patient to invert the foot to make the posterior tibialis tendon more prominent, then use a tangential rather than intratendinous approach.',
        'Plantar paresthesia suggests posterior tibial nerve contact; reposition. Free flow is an important safeguard against intratendinous placement.'
      ]],
      ['Plantar fascia', [
        'A medial approach is described, directing the needle parallel to the plantar skin toward the medial calcaneal tubercle.',
        'Repeated corticosteroid infiltration should be avoided because plantar fat atrophy can produce chronic heel pressure pain.'
      ]],
      ['Morton neuroma / MTP joints', [
        'For Morton neuroma, the guide uses a dorsal intermetatarsal approach advanced plantarly through the intermetatarsal ligament and recommends low-pressure injection.',
        'For MTP joints, a dorsal entry just medial or lateral to the extensor tendon is facilitated by slight passive plantarflexion.'
      ]]
    ],
    foot: [
      ['Ankle & foot landmark refinements', [
        'For the ankle joint, identify the tibia–talus cleft with gentle flexion/extension and enter medial to tibialis anterior while avoiding the dorsalis pedis artery.',
        'For the subtalar joint, identify the sinus tarsi by inversion/eversion and direct the needle toward the medial malleolus.',
        'For MTP joints, slight passive plantarflexion can improve access to the dorsal joint line.'
      ]]
    ]
  };

  function addGroup(parent, title, items) {
    const h = document.createElement('h3');
    h.className = 'sub';
    h.textContent = title;
    parent.appendChild(h);
    const ul = document.createElement('ul');
    items.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });
    parent.appendChild(ul);
  }

  function ensure() {
    if (!isInjection()) return;
    const view = document.querySelector('#view');
    if (!view || view.querySelector('[data-gorman-guide="v22"]')) return;
    const notes = regional[route()];
    if (!notes?.length) return;

    const section = document.createElement('section');
    section.className = 'section';
    section.dataset.gormanGuide = 'v22';
    const h2 = document.createElement('h2');
    h2.textContent = 'Technique & safety refinements';
    section.appendChild(h2);
    const intro = document.createElement('p');
    intro.textContent = 'Additional landmark, positioning and safety points incorporated from the supplied Dr Gorman injection guide.';
    section.appendChild(intro);

    general.forEach(([title, items]) => addGroup(section, title, items));
    notes.forEach(([title, items]) => addGroup(section, title, items));
    view.appendChild(section);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ensure(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
