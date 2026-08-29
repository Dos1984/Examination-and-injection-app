/* Landmark-focused injection UI enhancements */
(() => {
  const isInjectionTab = () => location.hash.split('/')[2] === 'injection';

  function stripUltrasoundContent() {
    if (!isInjectionTab()) return;
    document.querySelectorAll('#view .section').forEach(section => {
      const title = section.querySelector(':scope > h2')?.textContent || '';
      if (/ultrasound/i.test(title)) {
        section.remove();
        return;
      }
      section.querySelectorAll('h3.sub').forEach(h => {
        if (!/ultrasound|image-guided/i.test(h.textContent)) return;
        let n = h.nextElementSibling;
        h.remove();
        while (n && !n.matches('h3.sub')) {
          const next = n.nextElementSibling;
          n.remove();
          n = next;
        }
      });
      section.querySelectorAll('p,li,.callout,.landmark-row').forEach(el => {
        if (/ultrasound|sonograph|image-guided/i.test(el.textContent || '')) el.remove();
      });
    });
  }

  function makeCollapsible() {
    if (!isInjectionTab()) return;
    document.querySelectorAll('#view .section').forEach((section, i) => {
      if (section.dataset.collapsible === '1') return;
      const h2 = section.querySelector(':scope > h2');
      if (!h2) return;
      section.dataset.collapsible = '1';
      section.classList.add('inj-collapse');
      const content = document.createElement('div');
      content.className = 'inj-collapse-body';
      [...section.children].filter(el => el !== h2).forEach(el => content.appendChild(el));
      section.appendChild(content);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inj-collapse-toggle';
      btn.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      btn.innerHTML = `<span>${h2.innerHTML}</span><span class="inj-chevron" aria-hidden="true">⌄</span>`;
      h2.replaceWith(btn);
      if (i !== 0) section.classList.add('collapsed');
      btn.onclick = () => {
        const closed = section.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', String(!closed));
      };
    });
  }

  function enhance() {
    if (!isInjectionTab()) return;
    stripUltrasoundContent();
    makeCollapsible();
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', () => requestAnimationFrame(enhance));
  addEventListener('DOMContentLoaded', enhance);
})();
