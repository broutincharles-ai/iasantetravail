(() => {
  'use strict';
  const timeline = document.querySelector('.ai-safety-home .timeline');
  if (!timeline) return;
  const tabs = [...timeline.querySelectorAll('.phase-control')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panels.some(panel => !panel)) return;
  timeline.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].tabIndex = 0;
  });
  const select = index => {
    tabs.forEach((tab, i) => {
      const selected = index === i;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
  };
  const followFragment = () => {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index !== -1) select(index);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => { event.preventDefault(); select(index); });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next); tabs[next].focus(); }
    });
  });
  select(0);
  followFragment();
  addEventListener('hashchange', followFragment);
})();
