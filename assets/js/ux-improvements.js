(() => {
  'use strict';
  const en = document.documentElement.lang.startsWith('en');
  const header = document.querySelector('.site-system-header');
  if (!header || window.__IASTUXReady) return;
  window.__IASTUXReady = true;
  const text = en ? {
    title: 'Search the site', label: 'A topic, a question or a publication', placeholder: 'E.g. psychosocial risks, INRS, governance…',
    close: 'Close search', initial: 'Quick access', loading: 'Loading the index…', none: 'No results. Try “risks”, “INRS” or “governance”.',
    error: 'Search is temporarily unavailable. Close this window and try again.', hint: 'Search stays in your browser. Shortcut: Ctrl / ⌘ K. Escape closes this window.'
  } : {
    title: 'Rechercher dans le site', label: 'Un sujet, une question ou une publication', placeholder: 'Ex. risques psychosociaux, INRS, gouvernance…',
    close: 'Fermer la recherche', initial: 'Accès rapides', loading: 'Chargement de l’index…', none: 'Aucun résultat. Essayez « risques », « INRS » ou « gouvernance ».',
    error: 'La recherche est momentanément indisponible. Fermez cette fenêtre et réessayez.', hint: 'La recherche reste dans votre navigateur. Raccourci : Ctrl / ⌘ K. Échap ferme cette fenêtre.'
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'ux-search-dialog';
  dialog.setAttribute('aria-labelledby', 'ux-search-title');
  dialog.innerHTML = `<div class="ux-search-heading"><h2 id="ux-search-title">${text.title}</h2><button class="ux-search-close" type="button" aria-label="${text.close}">×</button></div><form role="search"><label for="ux-search-input">${text.label}</label><input id="ux-search-input" type="search" placeholder="${text.placeholder}" autocomplete="off" autofocus aria-controls="ux-search-results" aria-describedby="ux-search-status"><p class="ux-search-status" id="ux-search-status" role="status" aria-live="polite"></p><ul class="ux-search-results" id="ux-search-results"></ul></form><p class="ux-search-hint">${text.hint}</p>`;
  document.body.append(dialog);
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('ul');
  const status = dialog.querySelector('[role="status"]');
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let indexPromise, index = [], ready = false, restoreFocus, inputTimer;
  const renderSearch = () => {
    if (!ready) return;
    const query = normalise(input.value).trim();
    const words = query.replace(/\brps\b/g, en ? 'psychosocial risks' : 'risques psychosociaux').split(/[^a-z0-9]+/).filter(word => word.length > 1 && !['de', 'des', 'du', 'la', 'le', 'les', 'un', 'une', 'et', 'of', 'the', 'and', 'in'].includes(word));
    const defaults = en ? ['en/evaluate/', 'en/risks-prevention/', 'en/publications/'] : ['evaluer/', 'risques-prevention/psychosociaux/', 'publications/'];
    const matches = words.length ? index.map(item => {
      const title = normalise(item.title), description = normalise(item.description), keywords = normalise(item.keywords || '');
      const scores = words.map(word => (title.includes(word) ? 9 : 0) + (description.includes(word) ? 4 : 0) + (keywords.includes(word) ? 1 : 0));
      return {item, score: scores.every(Boolean) ? scores.reduce((a, b) => a + b, 0) : 0};
    }).filter(result => result.score).sort((a, b) => b.score - a.score).slice(0, 8).map(result => result.item) : defaults.map(url => index.find(item => item.url.replace(/^\//, '') === url)).filter(Boolean);
    results.replaceChildren();
    for (const item of matches) {
      const li = document.createElement('li'), link = document.createElement('a'), title = document.createElement('strong'), description = document.createElement('span');
      link.href = '/' + item.url.replace(/^\//, ''); title.textContent = item.title; description.textContent = item.description;
      link.append(title, description); li.append(link); results.append(li);
    }
    status.textContent = !words.length ? text.initial : matches.length ? (en ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}` : `${matches.length} résultat${matches.length === 1 ? '' : 's'}`) : text.none;
  };
  const openSearch = async trigger => {
    const mobile = matchMedia('(max-width: 1120px)').matches;
    restoreFocus = mobile ? header.querySelector('.system-menu-button') : header.querySelector('.system-nav-group summary');
    if (trigger && trigger.getClientRects().length && !trigger.closest('.system-nav-dropdown')) restoreFocus = trigger;
    document.dispatchEvent(new Event('iast:close-menu'));
    header.querySelectorAll('details').forEach(detail => { detail.open = false; });
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('ux-search-active');
    input.focus(); status.textContent = ready ? text.initial : text.loading;
    try {
      indexPromise ||= fetch(`/assets/data/search-${en ? 'en' : 'fr'}.json?v=1.0`).then(response => {
        if (!response.ok) throw Error('Search index unavailable');
        return response.json();
      });
      index = await indexPromise; ready = true; renderSearch();
    } catch { indexPromise = undefined; ready = false; status.textContent = text.error; }
  };
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-site-search]');
    if (trigger) { event.preventDefault(); openSearch(trigger); }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey) { event.preventDefault(); openSearch(document.activeElement); }
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); }
  });
  dialog.querySelector('.ux-search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('ux-search-active'); if (restoreFocus?.getClientRects().length) restoreFocus.focus({preventScroll: true}); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  input.addEventListener('input', () => { clearTimeout(inputTimer); inputTimer = setTimeout(renderSearch, 90); });
  input.addEventListener('keydown', event => { if (event.key === 'ArrowDown' && results.querySelector('a')) { event.preventDefault(); results.querySelector('a').focus(); } });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); if (input.value.trim()) results.querySelector('a')?.click(); });

  // Account for the actual sticky header height, including the mobile contents control.
  const updateAnchorOffset = () => {
    if (header.classList.contains('is-open') || header.querySelector('.page-nav.is-open')) return;
    document.documentElement.style.setProperty('--ux-anchor-offset', `${Math.ceil(header.getBoundingClientRect().height) + 20}px`);
  };
  new ResizeObserver(updateAnchorOffset).observe(header); updateAnchorOffset();
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    for (let element = target.parentElement; element; element = element.parentElement) if (element.tagName === 'DETAILS') element.open = true;
    const nav = header.querySelector('.page-nav');
    nav?.classList.remove('is-open');
    if (matchMedia('(max-width: 760px)').matches) nav?.querySelector('.page-nav-label')?.setAttribute('aria-expanded', 'false');
    if (location.hash !== url.hash) history.pushState(history.state, '', url.hash);
    requestAnimationFrame(() => {
      updateAnchorOffset();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      target.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  });

  // Keep the reader's theme and order on the existing return-to-collection link.
  const collectionPath = en ? '/en/reading/' : '/lecture/';
  if (location.pathname.startsWith(collectionPath) && location.pathname !== collectionPath) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`iast-ux-reading-${en ? 'en' : 'fr'}`) || '{}');
      document.querySelectorAll('main a[href]').forEach(link => {
        if (new URL(link.href).pathname !== collectionPath) return;
        const url = new URL(link.href);
        if (saved.theme && saved.theme !== 'all') url.searchParams.set('theme', saved.theme);
        if (saved.sort && saved.sort !== 'newest') url.searchParams.set('sort', saved.sort);
        url.hash = 'collection'; link.href = url.pathname + url.search + url.hash;
      });
    } catch {}
  }

  // Reuse the tool's validation decisions; place its message beside the field it focuses.
  const form = document.getElementById('contextForm');
  const error = document.getElementById('contextError');
  if (form && error) {
    let invalidField, message;
    const clear = () => {
      if (invalidField) {
        invalidField.removeAttribute('aria-invalid');
        const ids = (invalidField.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== 'ux-field-error');
        if (ids.length) invalidField.setAttribute('aria-describedby', ids.join(' ')); else invalidField.removeAttribute('aria-describedby');
      }
      message?.remove(); invalidField = undefined; message = undefined;
    };
    form.addEventListener('submit', () => {
      clear();
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!error.textContent.trim() || !form.contains(active) || !active.matches('input, select, textarea') || active.type === 'checkbox') return;
        invalidField = active; active.setAttribute('aria-invalid', 'true');
        message = document.createElement('small'); message.id = 'ux-field-error'; message.className = 'ux-field-error'; message.textContent = error.textContent;
        active.insertAdjacentElement('afterend', message);
        const ids = new Set((active.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)); ids.add(message.id); active.setAttribute('aria-describedby', [...ids].join(' '));
      });
    });
    form.addEventListener('input', event => { if (event.target === invalidField) clear(); });
    form.addEventListener('change', event => { if (event.target === invalidField) clear(); });
  }
})();
