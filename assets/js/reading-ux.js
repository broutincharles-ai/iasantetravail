(() => {
  "use strict";
  const lead = document.querySelector('[data-featured]');
  const list = document.querySelector('[data-reading-list]');
  if (!lead || !list) return;
  const entries = [lead, ...list.querySelectorAll('[data-reading-entry]')];
  const sort = document.querySelector('[data-reading-sort]');
  const theme = document.querySelector('[data-reading-theme]');
  const result = document.querySelector('[data-reading-result]');
  const empty = document.querySelector('[data-reading-empty]');
  const en = document.documentElement.lang.startsWith('en');
  const storageKey = `iast-ux-reading-${en ? 'en' : 'fr'}`;
  const isOption = (select, value) => [...select.options].some(option => option.value === value);
  const restore = (useSaved = true) => {
    const url = new URL(location.href);
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch {}
    for (const [select, name, fallback] of [[theme, 'theme', 'all'], [sort, 'sort', 'newest']]) {
      const value = url.searchParams.get(name) || (useSaved ? saved[name] : fallback);
      select.value = isOption(select, value) ? value : fallback;
    }
  };
  const render = () => {
    const direction = sort.value === 'newest' ? -1 : 1;
    const ordered = [...entries].sort((a, b) => a.dataset.date.localeCompare(b.dataset.date) * direction);
    // Preserve the original featured layout at rest; include it in chronological sorting.
    if (ordered[0] === lead) {
      list.before(lead); list.style.removeProperty('display'); list.classList.remove('ux-reading-sorted');
      ordered.filter(entry => entry !== lead).forEach(entry => list.append(entry));
    } else {
      list.style.display = 'contents'; list.classList.add('ux-reading-sorted'); ordered.forEach(entry => list.append(entry));
    }
    const visible = ordered.filter(entry => theme.value === 'all' || entry.dataset.theme === theme.value);
    entries.forEach(entry => { entry.hidden = !visible.includes(entry); });
    visible.forEach((entry, index) => {
      entry.querySelector('[data-entry-number]').textContent = `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    });
    result.textContent = en ? `${visible.length} ${visible.length === 1 ? 'text shown' : 'texts shown'}` : `${visible.length} ${visible.length === 1 ? 'texte affiché' : 'textes affichés'}`;
    empty.hidden = visible.length !== 0;
    const url = new URL(location.href);
    if (theme.value === 'all') url.searchParams.delete('theme'); else url.searchParams.set('theme', theme.value);
    if (sort.value === 'newest') url.searchParams.delete('sort'); else url.searchParams.set('sort', sort.value);
    history.replaceState(history.state, '', url);
    try { sessionStorage.setItem(storageKey, JSON.stringify({theme: theme.value, sort: sort.value})); } catch {}
    document.querySelectorAll('.system-language-switch').forEach(link => {
      const alternate = new URL(link.href);
      for (const name of ['theme', 'sort']) {
        if (url.searchParams.has(name)) alternate.searchParams.set(name, url.searchParams.get(name)); else alternate.searchParams.delete(name);
      }
      if (url.hash) alternate.hash = url.hash;
      link.href = alternate.pathname + alternate.search + alternate.hash;
    });
  };
  // Titles lead to the same destination as each article's existing main link.
  entries.forEach(entry => {
    const heading = entry.querySelector('h3');
    const link = entry.querySelector('.lead-actions a, .entry-meta a');
    if (!heading || !link || heading.querySelector('a')) return;
    const titleLink = link.cloneNode(false);
    titleLink.className = 'ux-reading-title-link';
    titleLink.replaceChildren(...heading.childNodes);
    heading.append(titleLink);
  });
  document.querySelectorAll(`a[href="#${lead.id}"]`).forEach(link => link.addEventListener('click', () => {
    if (lead.hidden) { theme.value = 'all'; render(); }
  }));
  theme.addEventListener('change', render);
  sort.addEventListener('change', render);
  window.addEventListener('popstate', () => { restore(false); render(); });
  restore(); render();
})();
