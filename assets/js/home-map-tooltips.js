(() => {
  'use strict';

  const triggers = [...document.querySelectorAll('.home-simulation .map-zone[aria-describedby]')];
  if (!triggers.length) return;

  let active = null;
  let pinned = false;
  let closeTimer;
  let frame;

  function close() {
    clearTimeout(closeTimer);
    if (active) {
      active.tooltip.hidden = true;
      active.trigger.removeAttribute('data-tooltip-open');
    }
    active = null;
    pinned = false;
  }

  function position() {
    if (!active) return;
    const { trigger, tooltip } = active;
    const anchor = trigger.getBoundingClientRect();
    const headerBottom = document.getElementById('site-header')?.getBoundingClientRect().bottom || 0;
    const topEdge = Math.max(12, headerBottom + 10);
    const bottomEdge = innerHeight - 12;
    if (anchor.bottom < topEdge || anchor.top > bottomEdge) {
      close();
      return;
    }
    tooltip.style.maxHeight = Math.max(80, bottomEdge - topEdge) + 'px';
    const box = tooltip.getBoundingClientRect();
    const left = Math.max(12, Math.min(anchor.left + (anchor.width - box.width) / 2, innerWidth - box.width - 12));
    let top = anchor.bottom + 10;
    if (top + box.height > bottomEdge) top = anchor.top - box.height - 10;
    top = Math.max(topEdge, Math.min(top, bottomEdge - box.height));
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function open(entry) {
    clearTimeout(closeTimer);
    if (active !== entry) {
      close();
      active = entry;
      entry.tooltip.hidden = false;
      entry.trigger.setAttribute('data-tooltip-open', '');
    }
    position();
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!active || pinned) return;
      if (active.trigger === document.activeElement || active.tooltip.matches(':hover')) return;
      close();
    }, 250);
  }

  triggers.forEach(trigger => {
    const tooltip = document.getElementById(trigger.getAttribute('aria-describedby'));
    if (!tooltip) return;
    // Keep fixed positioning independent of the homepage's CSS container.
    document.body.append(tooltip);
    const entry = { trigger, tooltip };

    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') open(entry);
    });
    trigger.addEventListener('pointerleave', scheduleClose);
    trigger.addEventListener('focus', () => open(entry));
    trigger.addEventListener('blur', scheduleClose);
    trigger.addEventListener('click', () => {
      if (active === entry && pinned) close();
      else {
        open(entry);
        pinned = true;
      }
    });
    tooltip.addEventListener('pointerenter', () => clearTimeout(closeTimer));
    tooltip.addEventListener('pointerleave', scheduleClose);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) {
      event.preventDefault();
      close();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (active && !active.trigger.contains(event.target) && !active.tooltip.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (active && !active.trigger.contains(event.target) && !active.tooltip.contains(event.target)) close();
  });
  const reposition = () => {
    if (!active || frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      position();
    });
  };
  addEventListener('scroll', reposition, { capture: true, passive: true });
  addEventListener('resize', reposition);
})();
