// All scores and figures are included in the HTML. Enhance the comparison controls and labels.
(() => {
  const report = document.querySelector('.bmt-results');
  if (!report) return;

  const switcher = report.querySelector('.bmt-switch');
  const buttons = [...switcher.querySelectorAll('[data-mesure]')];
  const plots = [...report.querySelectorAll('[data-bmt-plot]')];
  let activeTip = null;

  function closeTip() {
    if (activeTip) activeTip.hidden = true;
    activeTip = null;
  }

  switcher.hidden = false;
  for (const button of buttons) {
    button.addEventListener('click', () => {
      closeTip();
      for (const candidate of buttons) {
        candidate.setAttribute('aria-pressed', String(candidate === button));
      }
      for (const plot of plots) {
        plot.hidden = plot.dataset.bmtPlot !== button.dataset.mesure;
      }
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
