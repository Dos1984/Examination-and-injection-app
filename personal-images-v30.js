/* v30 — Personal learning images for injection procedures.
   Images are stored locally in IndexedDB on the user's device/browser only. */
(() => {
  const DB_NAME = 'msk-personal-learning';
  const DB_VERSION = 1;
  const STORE = 'images';
  const route = () => location.hash.split('/')[1] || '';
  const isInjection = () => location.hash.split('/')[2] === 'injection';
  const objectUrls = new Set();

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('procedure', 'procedure', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Unable to open local image storage'));
    });
  }

  async function addRecord(record) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).add(record);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error || new Error('Unable to save image')); };
    });
  }

  async function recordsFor(procedure) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).index('procedure').getAll(IDBKeyRange.only(procedure));
      req.onsuccess = () => resolve((req.result || []).sort((a,b) => (a.created || 0) - (b.created || 0)));
      req.onerror = () => reject(req.error || new Error('Unable to load images'));
      tx.oncomplete = () => db.close();
    });
  }

  async function deleteRecord(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error || new Error('Unable to delete image')); };
    });
  }

  function stripNumber(text) {
    return String(text || '').replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i, '').trim();
  }

  function slug(text) {
    return stripNumber(text).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'procedure';
  }

  function procedureKey(card) {
    const title = card.querySelector(':scope > .hand-inj-sub-toggle .hand-inj-sub-title')?.textContent || '';
    const stable = card.id || card.dataset.personalProcedureId || slug(title);
    card.dataset.personalProcedureId = stable;
    return `${route()}:${stable}`;
  }

  function ensureStyles() {
    if (document.querySelector('#personalImagesV30Styles')) return;
    const style = document.createElement('style');
    style.id = 'personalImagesV30Styles';
    style.textContent = `
      .personal-images{margin-top:24px;padding-top:18px;border-top:1px solid var(--line);scroll-margin-top:90px}
      .personal-images-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:10px}
      .personal-images-title{font-size:1.05rem;font-weight:750;line-height:1.3;margin:0}
      .personal-images-note{font-size:.82rem;color:var(--ink-2);line-height:1.4;margin:4px 0 0;max-width:54ch}
      .personal-images-actions{display:flex;gap:8px;flex-wrap:wrap}
      .personal-image-btn{min-height:42px;padding:9px 13px;border:1px solid var(--line);border-radius:10px;background:var(--surface,#fff);font:inherit;font-size:.9rem;font-weight:700;color:var(--ink);cursor:pointer}
      .personal-image-btn:hover{border-color:var(--accent)}
      .personal-image-input{display:none!important}
      .personal-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-top:14px}
      .personal-gallery-empty{font-size:.9rem;color:var(--ink-2);padding:12px 0}
      .personal-image-card{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--surface,#fff)}
      .personal-image-open{display:block;width:100%;padding:0;border:0;background:var(--canvas,#eef2f2);cursor:pointer}
      .personal-image-open img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
      .personal-image-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 8px}
      .personal-image-date{font-size:.72rem;color:var(--ink-3)}
      .personal-image-delete{border:0;background:transparent;color:var(--stop,#a11b2b);font:inherit;font-size:.78rem;font-weight:700;padding:6px;cursor:pointer}
      .personal-storage-status{font-size:.8rem;color:var(--ink-2);margin-top:8px;min-height:1.2em}
      .personal-lightbox{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:22px}
      .personal-lightbox.open{display:flex}
      .personal-lightbox img{max-width:100%;max-height:86vh;object-fit:contain;border-radius:8px;background:#fff}
      .personal-lightbox-close{position:absolute;top:max(16px,env(safe-area-inset-top));right:16px;width:46px;height:46px;border-radius:99px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.35);color:#fff;font-size:28px;line-height:1;cursor:pointer}
      @media(max-width:560px){.personal-images-actions{width:100%}.personal-image-btn{flex:1 1 140px}.personal-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function ensureLightbox() {
    let lb = document.querySelector('#personalImageLightbox');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.id = 'personalImageLightbox';
    lb.className = 'personal-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Personal learning image');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'personal-lightbox-close';
    close.setAttribute('aria-label', 'Close image');
    close.textContent = '×';
    const img = document.createElement('img');
    img.alt = 'Personal learning image';
    lb.append(close, img);
    const shut = () => {
      lb.classList.remove('open');
      img.removeAttribute('src');
    };
    close.addEventListener('click', shut);
    lb.addEventListener('click', e => { if (e.target === lb) shut(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) shut(); });
    document.body.appendChild(lb);
    return lb;
  }

  function showImage(blob) {
    const lb = ensureLightbox();
    const img = lb.querySelector('img');
    const url = URL.createObjectURL(blob);
    objectUrls.add(url);
    img.src = url;
    lb.classList.add('open');
  }

  async function normaliseImage(file) {
    if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > 30 * 1024 * 1024) throw new Error('This image is too large. Please choose an image under 30 MB.');
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      const loaded = new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      img.src = url;
      await loaded;
      const max = 1800;
      const scale = Math.min(1, max / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      if (scale >= .999 && file.size <= 4 * 1024 * 1024) { URL.revokeObjectURL(url); return file; }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise(resolve => canvas.toBlob(resolve, type, type === 'image/jpeg' ? .86 : undefined));
      return blob || file;
    } catch (_) {
      return file;
    }
  }

  async function renderGallery(box) {
    const gallery = box.querySelector('.personal-gallery');
    const status = box.querySelector('.personal-storage-status');
    const procedure = box.dataset.procedure;
    gallery.textContent = '';
    try {
      const rows = await recordsFor(procedure);
      if (!rows.length) {
        const empty = document.createElement('div');
        empty.className = 'personal-gallery-empty';
        empty.textContent = 'No personal images saved for this procedure yet.';
        gallery.appendChild(empty);
        status.textContent = '';
        return;
      }
      rows.forEach(row => {
        const card = document.createElement('div');
        card.className = 'personal-image-card';
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'personal-image-open';
        open.setAttribute('aria-label', 'Open personal image');
        const img = document.createElement('img');
        const url = URL.createObjectURL(row.blob);
        objectUrls.add(url);
        img.src = url;
        img.alt = 'Personal learning image';
        open.appendChild(img);
        open.addEventListener('click', () => showImage(row.blob));
        const meta = document.createElement('div');
        meta.className = 'personal-image-meta';
        const date = document.createElement('span');
        date.className = 'personal-image-date';
        date.textContent = row.created ? new Date(row.created).toLocaleDateString() : '';
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'personal-image-delete';
        del.textContent = 'Delete';
        del.addEventListener('click', async () => {
          if (!confirm('Delete this personal learning image from this device?')) return;
          try { await deleteRecord(row.id); await renderGallery(box); }
          catch (_) { status.textContent = 'Unable to delete this image.'; }
        });
        meta.append(date, del);
        card.append(open, meta);
        gallery.appendChild(card);
      });
      status.textContent = `${rows.length} personal image${rows.length === 1 ? '' : 's'} saved on this device.`;
    } catch (_) {
      const empty = document.createElement('div');
      empty.className = 'personal-gallery-empty';
      empty.textContent = 'Local image storage is not available in this browser.';
      gallery.appendChild(empty);
      status.textContent = '';
    }
  }

  async function saveSelectedFile(box, input) {
    const status = box.querySelector('.personal-storage-status');
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    status.textContent = 'Saving image on this device…';
    try {
      const blob = await normaliseImage(file);
      await addRecord({
        procedure: box.dataset.procedure,
        blob,
        originalName: file.name || '',
        mime: blob.type || file.type || 'image/jpeg',
        created: Date.now()
      });
      await renderGallery(box);
    } catch (err) {
      status.textContent = err?.message || 'Unable to save this image.';
    }
  }

  function createGallery(card) {
    const body = card.querySelector(':scope > .hand-inj-sub-body');
    if (!body || body.querySelector(':scope > .personal-images')) return;

    const box = document.createElement('section');
    box.className = 'personal-images';
    box.dataset.procedure = procedureKey(card);

    const head = document.createElement('div');
    head.className = 'personal-images-head';
    const intro = document.createElement('div');
    const title = document.createElement('h4');
    title.className = 'personal-images-title';
    title.textContent = 'Additional Images';
    const note = document.createElement('p');
    note.className = 'personal-images-note';
    note.textContent = 'Add your own learning images for this procedure. They stay on this device and are not uploaded to the shared app. Clearing browser/site data may remove them.';
    intro.append(title, note);

    const actions = document.createElement('div');
    actions.className = 'personal-images-actions';
    const cameraBtn = document.createElement('button');
    cameraBtn.type = 'button';
    cameraBtn.className = 'personal-image-btn';
    cameraBtn.textContent = 'Take Photo';
    const photoBtn = document.createElement('button');
    photoBtn.type = 'button';
    photoBtn.className = 'personal-image-btn';
    photoBtn.textContent = 'Choose Photo';

    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.setAttribute('capture', 'environment');
    cameraInput.className = 'personal-image-input';
    const photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.className = 'personal-image-input';

    cameraBtn.addEventListener('click', () => cameraInput.click());
    photoBtn.addEventListener('click', () => photoInput.click());
    cameraInput.addEventListener('change', () => saveSelectedFile(box, cameraInput));
    photoInput.addEventListener('change', () => saveSelectedFile(box, photoInput));
    actions.append(cameraBtn, photoBtn, cameraInput, photoInput);
    head.append(intro, actions);

    const gallery = document.createElement('div');
    gallery.className = 'personal-gallery';
    gallery.setAttribute('aria-live', 'polite');
    const status = document.createElement('div');
    status.className = 'personal-storage-status';
    status.setAttribute('aria-live', 'polite');

    box.append(head, gallery, status);
    body.appendChild(box);
    renderGallery(box);
  }

  function ensure() {
    if (!isInjection()) return;
    ensureStyles();
    document.querySelectorAll('#view .hand-inj-sub').forEach(createGallery);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ensure(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();

  addEventListener('pagehide', () => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls.clear();
  });
})();
