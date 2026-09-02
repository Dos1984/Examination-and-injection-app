/* Trigger finger section 5.4: direct A1 pulley approach teaching content */
(() => {
  const isHandInjection = () => location.hash.split('/')[1] === 'hand' && location.hash.split('/')[2] === 'injection';

  function makeFigure(src, caption) {
    const fig = document.createElement('figure');
    const frame = document.createElement('div');
    frame.className = 'figbtn';
    frame.setAttribute('aria-label', caption);
    const img = document.createElement('img');
    img.src = src;
    img.alt = caption;
    img.loading = 'lazy';
    frame.appendChild(img);
    const cap = document.createElement('figcaption');
    cap.textContent = caption;
    fig.append(frame, cap);
    return fig;
  }

  function getBody() {
    const card = [...document.querySelectorAll('#view .hand-inj-sub')].find(c =>
      /^5\.4\b/.test(c.querySelector('.hand-inj-sub-title')?.textContent?.trim() || '')
    );
    if (card) return card.querySelector('.hand-inj-sub-body');

    const h = [...document.querySelectorAll('#view h3.sub')].find(h3 => /^5\.4\b/.test((h3.textContent || '').trim()));
    if (!h) return null;
    const holder = document.createElement('div');
    holder.dataset.trigger54Holder = '1';
    let n = h.nextElementSibling;
    while (n && !(n.matches('h3.sub') && /^5\.\d+\b/.test((n.textContent || '').trim()))) {
      const next = n.nextElementSibling;
      holder.appendChild(n);
      n = next;
    }
    h.after(holder);
    return holder;
  }

  function ensure() {
    if (!isHandInjection()) return;
    const body = getBody();
    if (!body) return;

    body.querySelectorAll('p,li').forEach(el => {
      if (/Alternative direct techniques are described in the source manuals/i.test(el.textContent || '')) {
        el.textContent = 'Alternative direct A1 pulley approach: palpate the A1 pulley at the volar MCP crease, usually at the point of maximal tenderness or palpable nodule. Insert in the midline directly over the flexor tendon, approximately perpendicular to the skin or with only a slight distal angle. Advance cautiously, then withdraw slightly before injecting to avoid intratendinous placement. Ask the patient to gently flex and extend the finger; if the needle or syringe moves with tendon excursion, withdraw slightly and reassess. The aim is to deposit injectate around the A1 pulley/flexor sheath, not within the tendon. The digital neurovascular bundles lie to either side, so remain midline.';
      }
    });

    let figs = body.querySelector('.figs');
    if (!figs) return;

    const directCaption = 'Needle path and target (direct A1 pulley approach)';
    const photoCaption = 'Needle entry directly over A1 pulley (short-axis approach)';

    let directFig = [...figs.querySelectorAll('figure')].find(f => (f.querySelector('figcaption')?.textContent || '').includes('Needle path and target'));
    if (directFig) {
      const img = directFig.querySelector('img');
      if (img) {
        img.src = 'images/direct-a1-pulley-schematic-final.png?v=16';
        img.alt = directCaption;
      }
      const cap = directFig.querySelector('figcaption');
      if (cap) cap.textContent = directCaption;
    } else {
      directFig = makeFigure('images/direct-a1-pulley-schematic-final.png?v=16', directCaption);
      figs.appendChild(directFig);
    }

    let photoFig = [...figs.querySelectorAll('figure')].find(f => (f.querySelector('figcaption')?.textContent || '').includes('Needle entry directly over A1 pulley'));
    if (photoFig) {
      const img = photoFig.querySelector('img');
      if (img && (!img.src || /Trigger_Finger_Direct|raw\.githubusercontent|direct-a1/i.test(img.src))) {
        img.src = 'images/direct-a1-pulley-photo-fixed.svg?v=16';
        img.alt = photoCaption;
      }
      const cap = photoFig.querySelector('figcaption');
      if (cap) cap.textContent = photoCaption;
    } else {
      photoFig = makeFigure('images/direct-a1-pulley-photo-fixed.svg?v=16', photoCaption);
      figs.appendChild(photoFig);
    }

    figs.classList.remove('n1','n2','n3','nmany');
    figs.classList.add('n4');
    body.dataset.trigger54Fixed = '16';
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
