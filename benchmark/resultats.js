// All scores and figures are included in the HTML. Enhance the comparison controls and labels.
(() => {
  const report = document.querySelector('.bmt-results');
  if (!report) return;

  const switcher = report.querySelector('.bmt-switch');
  const buttons = [...switcher.querySelectorAll('[data-mesure]')];
  const plots = [...report.querySelectorAll('[data-bmt-plot]')];
  let activeTip = null;

  // Garder titre, légende, axes et données dans la même vue, sous le sommaire fixe.
  const pricePanel = document.getElementById('capacite-prix');
  const comparisonPanel = document.getElementById('criteres');
  const rows = [...comparisonPanel.querySelectorAll('.score-modele')];
  const priceChart = document.getElementById('nuage');
  const comparisonChart = document.getElementById('intervalles');
  let resizeFrame = 0;

  function availableHeight(panel) {
    const top = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
    const viewport = window.visualViewport;
    const height = viewport && viewport.scale === 1 ? viewport.height : document.documentElement.clientHeight;
    return height - top - 6;
  }

  function remainingSpace(panel) {
    const note = panel.querySelector('.bmt-lecture');
    // Ouvrir le commentaire prolonge la page sans réduire le graphique.
    const expanded = note.open ? note.clientHeight - note.querySelector('summary').offsetHeight : 0;
    return availableHeight(panel) - panel.getBoundingClientRect().height + expanded;
  }

  function fitCharts() {
    resizeFrame = 0;
    const svg = priceChart.querySelector('[data-bmt-plot]:not([hidden]) svg');
    const priceHeight = Math.floor(remainingSpace(pricePanel) + svg.getBoundingClientRect().height);
    const rowHeight = Math.floor(rows[0].getBoundingClientRect().height + remainingSpace(comparisonPanel) / rows.length);
    priceChart.style.setProperty('--bmt-plot-height', Math.max(150, Math.min(580, priceHeight)) + 'px');
    comparisonChart.style.setProperty('--bmt-row-height', rowHeight + 'px');
  }

  function scheduleFit() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(fitCharts);
  }

  function closeTip() {
    if (activeTip) activeTip.hidden = true;
    activeTip = null;
  }

  switcher.hidden = false;
  fitCharts();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleFit);
    [pricePanel, comparisonPanel, document.querySelector('.site-system-header')].forEach(el => {
      if (el) observer.observe(el);
    });
  }
  window.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('resize', scheduleFit);
  document.fonts?.ready.then(scheduleFit);

  // Les polices, le menu fixe et les tracés peuvent se stabiliser après le saut natif au fragment.
  const initialHash = location.hash;
  const target = [pricePanel, comparisonPanel, ...report.querySelectorAll('#dossiers, #domaines')].find(panel => '#' + panel.id === initialHash);
  if (target && performance.getEntriesByType('navigation')[0]?.type === 'navigate') {
    const interaction = new AbortController();
    const stop = () => interaction.abort();
    for (const event of ['pointerdown', 'wheel', 'keydown', 'touchstart']) {
      window.addEventListener(event, stop, { passive: true, signal: interaction.signal });
    }
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    Promise.all([loaded, document.fonts?.ready]).then(() => requestAnimationFrame(() => {
      fitCharts();
      requestAnimationFrame(() => {
        if (!interaction.signal.aborted && location.hash === initialHash) target.scrollIntoView({ block: 'start', behavior: 'instant' });
        stop();
      });
    }));
  }
  for (const button of buttons) {
    button.addEventListener('click', () => {
      closeTip();
      for (const candidate of buttons) {
        candidate.setAttribute('aria-pressed', String(candidate === button));
      }
      for (const plot of plots) {
        plot.hidden = plot.dataset.bmtPlot !== button.dataset.mesure;
      }
      scheduleFit();
    });
  }

  function showTip(target, x, y) {
    closeTip();
    const details = target.dataset.bmtHeat ||
      document.getElementById(target.dataset.model)?.dataset.description;
    const tip = target.closest('.bmt-figure')?.querySelector('.bmt-inspect');
    if (!details || !tip) return;
    tip.textContent = details;
    tip.hidden = false;
    activeTip = tip;
    const box = tip.getBoundingClientRect();
    const left = Math.max(8, Math.min(innerWidth - box.width - 8, x - box.width / 2));
    const top = y > box.height + 18 ? y - box.height - 12 : Math.min(innerHeight - box.height - 8, y + 18);
    tip.style.left = left + 'px';
    tip.style.top = Math.max(8, top) + 'px';
  }

  const selector = '[data-model], [data-bmt-heat]';
  report.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const target = event.target.closest(selector);
    if (target) showTip(target, event.clientX, event.clientY);
    else closeTip();
  });
  report.addEventListener('pointerleave', closeTip);
  report.addEventListener('focusin', event => {
    const target = event.target.closest(selector);
    if (!target) return;
    const box = target.getBoundingClientRect();
    showTip(target, box.left + box.width / 2, box.top);
  });
  report.addEventListener('focusout', closeTip);
  document.addEventListener('click', event => {
    const target = event.target.closest(selector);
    if (target && report.contains(target)) {
      const box = target.getBoundingClientRect();
      showTip(target, box.left + box.width / 2, box.top);
    } else {
      closeTip();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeTip();
    if (!['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest('.bmt-results [data-model]');
    if (!target) return;
    event.preventDefault();
    const box = target.getBoundingClientRect();
    showTip(target, box.left + box.width / 2, box.top);
  });
  window.addEventListener('scroll', closeTip, { passive: true, capture: true });
  window.addEventListener('resize', closeTip);
})();
