/* v29 — Page-local hierarchical numbering.
   Each tab starts at 1. Main sections are 1,2,3... and nested cards/headings are N.1,N.2...
   This deliberately replaces source/manual numbering in the UI to avoid mixed schemes. */
(() => {
  const tab = () => location.hash.split('/')[2] || '';
  const relevant = () => /^(?:injection|examination|exam)$/.test(tab());

  function stripNumber(text) {
    return String(text || '')
      .replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i, '')
      .replace(/^\s*(?:section|procedure|approach)\s+\d+(?:\.\d+)*\s*[:.)-]?\s*/i, '')
      .trim();
  }

  function sectionToggle(section) {
    return section.querySelector(':scope > .inj-collapse-toggle > span:first-child');
  }
  function sectionHeading(section) {
    return section.querySelector(':scope > h2');
  }
  function sectionBody(section) {
    return section.querySelector(':scope > .inj-collapse-body') || section;
  }
  function setTextPreserve(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function numberNested(section, mainNo) {
    const body = sectionBody(section);
    let subNo = 0;
    const children = [...body.children];
    children.forEach(el => {
      if (el.matches('.hand-inj-sub')) {
        const label = el.querySelector(':scope > .hand-inj-sub-toggle .hand-inj-sub-title');
        if (!label) return;
        subNo += 1;
        const base = stripNumber(label.textContent);
        label.textContent = `${mainNo}.${subNo} ${base}`;
        el.dataset.pageNumber = `${mainNo}.${subNo}`;
        return;
      }
      if (el.matches('h3.sub')) {
        subNo += 1;
        const base = stripNumber(el.textContent);
        el.textContent = `${mainNo}.${subNo} ${base}`;
        el.dataset.pageNumber = `${mainNo}.${subNo}`;
      }
    });
  }

  function renumberSideNav(map) {
    document.querySelectorAll('.sidenav a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      const n = target?.dataset?.pageNumber;
      if (!n) return;
      const base = stripNumber(a.textContent);
      a.textContent = `${n} ${base}`;
    });
  }

  function ensure() {
    if (!relevant()) return;
    const view = document.querySelector('#view');
    if (!view) return;

    /* Only top-level content sections: nested procedure/exam cards are numbered beneath their parent. */
    const sections = [...view.querySelectorAll(':scope > .section')];
    if (!sections.length) return;

    sections.forEach((section, i) => {
      const mainNo = i + 1;
      const label = sectionToggle(section);
      const h2 = sectionHeading(section);
      const current = label?.textContent || h2?.textContent || '';
      const base = stripNumber(current);
      if (!base) return;
      const title = `${mainNo}. ${base}`;
      if (label) setTextPreserve(label, title);
      else if (h2) setTextPreserve(h2, title);
      section.dataset.pageNumber = String(mainNo);
      numberNested(section, mainNo);
    });

    renumberSideNav();
    view.dataset.numberingV29 = `${location.hash}:${sections.length}`;
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
