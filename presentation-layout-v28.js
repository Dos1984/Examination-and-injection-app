/* v28 — Presentation-only layout refinements.
   1) Put injection figures before procedure text.
   2) Make Examination sections and their direct subheadings collapsible. */
(() => {
  const tab = () => location.hash.split('/')[2] || '';
  const isInjection = () => tab() === 'injection';
  const isExam = () => /^(?:examination|exam)$/.test(tab());

  function moveInjectionImagesFirst() {
    if (!isInjection()) return;
    document.querySelectorAll('#view .hand-inj-sub-body, #view .inj-collapse-body').forEach(body => {
      const visualBlocks = [...body.children].filter(el => el.matches('.figs, figure'));
      if (!visualBlocks.length) return;
      const frag = document.createDocumentFragment();
      visualBlocks.forEach(el => frag.appendChild(el));
      body.prepend(frag);
    });
  }

  function makeExamSubCard(h) {
    const title = (h.textContent || '').trim();
    const nodes = [];
    let n = h.nextElementSibling;
    while (n && !n.matches('h3.sub')) {
      const next = n.nextElementSibling;
      nodes.push(n);
      n = next;
    }

    const card = document.createElement('section');
    card.className = 'hand-inj-sub exam-sub collapsed';
    card.dataset.examSub = 'v28';
    if (h.id) card.id = h.id;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle exam-sub-toggle';
    toggle.setAttribute('aria-expanded', 'false');

    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to expand';
    text.append(label, hint);

    const chev = document.createElement('span');
    chev.className = 'hand-inj-sub-chevron';
    chev.setAttribute('aria-hidden', 'true');
    chev.textContent = '⌄';
    toggle.append(text, chev);

    const body = document.createElement('div');
    body.className = 'hand-inj-sub-body exam-sub-body';
    nodes.forEach(node => body.appendChild(node));
    card.append(toggle, body);

    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    h.replaceWith(card);
  }

  function makeExamSection(section) {
    if (section.dataset.examCollapsible === 'v28') return;
    if (section.classList.contains('inj-collapse')) {
      section.dataset.examCollapsible = 'v28';
      return;
    }
    const h2 = section.querySelector(':scope > h2');
    if (!h2) return;

    const body = document.createElement('div');
    body.className = 'inj-collapse-body exam-collapse-body';
    [...section.children].filter(el => el !== h2).forEach(el => body.appendChild(el));

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'inj-collapse-toggle exam-collapse-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.innerHTML = h2.innerHTML;
    const chev = document.createElement('span');
    chev.className = 'inj-chevron';
    chev.setAttribute('aria-hidden', 'true');
    chev.textContent = '⌄';
    toggle.append(label, chev);

    h2.replaceWith(toggle);
    section.appendChild(body);
    section.classList.add('inj-collapse', 'exam-collapse', 'collapsed');
    section.dataset.examCollapsible = 'v28';

    const subheads = [...body.querySelectorAll(':scope > h3.sub')];
    subheads.forEach(makeExamSubCard);

    toggle.addEventListener('click', () => {
      const closed = section.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
  }

  function enhanceExam() {
    if (!isExam()) return;
    document.querySelectorAll('#view .section').forEach(makeExamSection);
  }

  function ensure() {
    moveInjectionImagesFirst();
    enhanceExam();
  }

  document.addEventListener('click', e => {
    if (!isExam()) return;
    const link = e.target.closest?.('.sidenav a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const outer = target.matches('.exam-collapse') ? target : target.closest('.exam-collapse');
    if (outer?.classList.contains('collapsed')) {
      outer.classList.remove('collapsed');
      outer.querySelector(':scope > .exam-collapse-toggle')?.setAttribute('aria-expanded', 'true');
    }
    if (target.classList.contains('exam-sub') && target.classList.contains('collapsed')) {
      target.classList.remove('collapsed');
      target.querySelector(':scope > .exam-sub-toggle')?.setAttribute('aria-expanded', 'true');
    }
  }, true);

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
