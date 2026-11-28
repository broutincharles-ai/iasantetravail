/* Le SVG du document fournit les valeurs et un graphique lisible sans JavaScript.
   Replacer les points et leurs noms dans l’espace disponible, en pixels CSS. */
(() => {
  const nuage = document.getElementById('nuage');
  if (!nuage) return;

  const charts = Array.from(nuage.querySelectorAll('[data-bmt-plot]'), panel => {
    const svg = panel.querySelector('svg');
    const models = Array.from(svg.querySelectorAll('[data-model]'), group => {
      const d = group.dataset;
      return {
        id: d.model, name: d.name, shortName: d.short, open: group.classList.contains('bmt-open'),
        price: Number(d.price), score: Number(d.score), low: Number(d.low), high: Number(d.high),
        description: document.getElementById(d.model).dataset.description
      };
    });
    return { svg, models, title: svg.getAttribute('aria-label'), measure: panel.dataset.bmtPlot };
  });
  const radius = 6.5;
  const textContext = document.createElement('canvas').getContext('2d');
  const sans = getComputedStyle(nuage).getPropertyValue('--bmt-sans').trim() || 'Arial, sans-serif';
  const priceTicks = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 });
  const tickY = [0, 20, 40, 60, 80, 100];
  const places = [
    [13.5, 4, 'start'], [-13.5, 4, 'end'], [8.5, -11.5, 'start'], [8.5, 20.5, 'start'],
    [-8.5, -11.5, 'end'], [-8.5, 20.5, 'end'], [0, -13.5, 'middle'], [0, 22.5, 'middle'],
    [24.5, -20, 'start'], [24.5, 28, 'start'], [-24.5, -20, 'end'], [-24.5, 28, 'end'],
    [0, -30, 'middle'], [0, 40, 'middle'], [40.5, -36, 'start'], [-40.5, -36, 'end'],
    [40.5, 46, 'start'], [-40.5, 46, 'end'], [0, -48, 'middle'], [0, 58, 'middle']
  ];
  const cross = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  function element(parent, tag, attrs = {}, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function pixelWidth(text, font) {
    textContext.font = font + ' ' + sans;
    return textContext.measureText(text).width;
  }

  function spacePoints(points) {
    const touching = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 2 * radius + 2;
    const neighboring = (a, b) => touching(a, b) ||
      (Math.abs(a.x - b.x) < 8 && a.top < b.bottom + 6 && b.top < a.bottom + 6);
    const remaining = new Set(points);
    for (const first of remaining) {
      const group = [first];
      remaining.delete(first);
      for (const p of group) {
        for (const other of remaining) {
          if (neighboring(p, other)) { group.push(other); remaining.delete(other); }
        }
      }
      if (group.length < 2) continue;
      const tight = group.some(a => group.some(b => a !== b && touching(a, b)));
      const center = group.reduce((sum, p) => sum + p.x, 0) / group.length;
      group.sort((a, b) => Number(a.front) - Number(b.front) || a.x - b.x || b.score - a.score || a.name.localeCompare(b.name));
      group.forEach((p, index) => {
        p.x = center + (index - (group.length - 1) / 2) * (tight ? 2 * radius + 3 : 8);
        if (tight) p.side = index === 0 ? -1 : index === group.length - 1 ? 1 : 0;
      });
    }
  }

  // Placer d'abord le nom qui a le moins de places libres. Donner la priorité
  // au cadre et aux autres noms, puis aux points, aux intervalles et à la frontière.
  function placeNames(points, bounds, frontier) {
    const placed = [];
    const remaining = new Set(points);
    function candidate(p, place, i) {
      const [dx, dy, anchor] = place;
      const x = p.x + dx, y = p.y + dy;
      const left = x - (anchor === 'start' ? 0 : anchor === 'end' ? p.width : p.width / 2);
      const box = { left: left - 2, right: left + p.width + 2, top: y - 11, bottom: y + 4 };
      const gutter = { left: box.left - 8, right: box.right + 8, top: box.top - 8, bottom: box.bottom + 8 };
      let cost = i;
      if (box.left < bounds.left + 1 || box.right > bounds.right || box.top < 1 || box.bottom > bounds.bottom - 2) cost += 1e6;
      for (const previous of placed) {
        if (cross(box, previous)) cost += 1e5;
        if (cross(gutter, previous)) cost += 30;
      }
      for (const other of points) {
        if (other !== p) {
          const dot = { left: other.x - radius, right: other.x + radius, top: other.y - radius, bottom: other.y + radius };
          if (cross(box, { left: dot.left - 2, right: dot.right + 2, top: dot.top - 2, bottom: dot.bottom + 2 })) cost += 1e4;
          if (cross(gutter, dot)) cost += 30;
        }
        if (other.high > other.low && cross(box, { left: other.x - 4, right: other.x + 4, top: other.highY, bottom: other.lowY })) cost += 250;
      }
      const side = (box.left + box.right) / 2 - p.x;
      if (p.side === 0 || (p.side < 0 && side > -4) || (p.side > 0 && side < 4)) cost += 2000;
      for (const segment of frontier) if (cross(box, segment)) cost += 8;
      return { x, y, anchor, box, cost, leader: i >= 8 };
    }
    while (remaining.size) {
      let best;
      for (const point of remaining) {
        const options = places.map((place, i) => candidate(point, place, i)).sort((a, b) => a.cost - b.cost);
        const free = options.filter(option => option.cost < 250).length;
        if (!best || free < best.free) best = { point, free, position: options[0] };
      }
      best.point.position = best.position;
      placed.push(best.position.box);
      remaining.delete(best.point);
    }
  }

  function draw(chart, width, height) {
    const { svg, models } = chart;
    const narrow = width < 560;
    const top = 26, bottom = height - 30, left = Math.ceil(pixelWidth('100', '400 11.5px')) + 12, right = width - 16;
    const lower = Math.log(Math.min(...models.map(m => m.price)) / 1.8);
    const upper = Math.log(Math.max(...models.map(m => m.price)) * 1.7);
    const x = price => left + (right - left) * (Math.log(price) - lower) / (upper - lower);
    const y = score => bottom - (bottom - top) * score / 100;
    const points = models.map(m => {
      const label = narrow ? m.shortName : m.name;
      return { ...m, x: x(m.price), y: y(m.score), lowY: y(m.low), highY: y(m.high), front: false,
        top: Math.min(y(m.high), y(m.score) - radius), bottom: Math.max(y(m.low), y(m.score) + radius),
        label, width: pixelWidth(label, '500 12.5px') };
    });
    const front = [];
    for (const p of [...points].sort((a, b) => a.price - b.price || b.score - a.score)) {
      if (!front.length || p.score > front[front.length - 1].score) { p.front = true; front.push(p); }
    }
    spacePoints(points);

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const drawing = document.createDocumentFragment();
    element(drawing, 'title', {}, chart.title);
    const grid = element(drawing, 'g', { class: 'prix-grid' });
    const ticks = element(drawing, 'g', { class: 'prix-tick' });
    for (const value of tickY) {
      const position = Math.round(y(value)) + .5;
      element(grid, 'line', { x1: left, x2: right, y1: position, y2: position });
      element(ticks, 'text', { 'text-anchor': 'end', x: left - 8, y: y(value) + 4 }, value);
    }
    for (const value of priceTicks.filter(v => Math.log(v) >= lower && Math.log(v) <= upper)) {
      const position = Math.round(x(value)) + .5;
      element(grid, 'line', { x1: position, x2: position, y1: top, y2: bottom });
      element(ticks, 'text', { 'text-anchor': 'middle', x: x(value), y: bottom + 19 }, decimal.format(value) + ' $');
    }
    element(drawing, 'line', { class: 'prix-base', x1: left, x2: right, y1: bottom + .5, y2: bottom + .5 });
    if (chart.measure === 'qcm') {
      element(drawing, 'line', { class: 'prix-hasard', x1: left, x2: right, y1: y(20), y2: y(20) });
      element(ticks, 'text', { 'text-anchor': 'end', x: right - 4, y: y(20) - 6 }, 'hasard, 20 %');
    }

    let path = 'M' + front[0].x + ',' + front[0].y;
    const segments = [];
    front.forEach((point, i) => {
      const next = front[i + 1];
      const end = next ? next.x : right;
      path += 'H' + end;
      segments.push({ left: point.x, right: end, top: point.y - 3, bottom: point.y + 3 });
      if (next) {
        path += 'V' + next.y;
        segments.push({ left: end - 3, right: end + 3, top: next.y, bottom: point.y });
      }
    });
    element(drawing, 'path', { class: 'prix-area', d: path + 'V' + bottom + 'H' + front[0].x + 'Z' });
    element(drawing, 'path', { class: 'prix-front', d: path });
    placeNames(points, { left, right: width - 2, bottom }, segments);
    for (const p of points) {
      const color = p.open ? 'bmt-open' : 'bmt-closed';
      if (p.high > p.low) element(drawing, 'rect', { class: 'prix-band ' + color, x: p.x - 3, width: 6, rx: 3, y: p.highY, height: p.lowY - p.highY });
      const pos = p.position;
      if (!pos.leader) continue;
      const box = pos.box;
      const dx = Math.max(box.left + 2, Math.min(box.right - 2, p.x)) - p.x;
      const dy = Math.max(box.top + 2, Math.min(box.bottom - 2, p.y)) - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < radius + 9) continue;
      const ux = dx / dist, uy = dy / dist;
      element(drawing, 'line', { class: 'prix-leader', x1: p.x + ux * (radius + 2.5), y1: p.y + uy * (radius + 2.5),
        x2: p.x + dx - ux * 3, y2: p.y + dy - uy * 3 });
    }
    for (const p of points) {
      const attrs = { 'data-model': p.id, 'data-name': p.name, 'data-short': p.shortName,
        'data-score': p.score, 'data-low': p.low, 'data-high': p.high, 'data-price': p.price,
        class: 'prix-model ' + (p.open ? 'bmt-open' : 'bmt-closed'), tabindex: 0, role: 'button', 'aria-label': p.description };
      const group = element(drawing, 'g', attrs);
      element(group, 'circle', { class: 'prix-halo', cx: p.x, cy: p.y, r: 12 });
      element(group, 'circle', { class: 'prix-point', cx: p.x, cy: p.y, r: radius + 1 });
      element(group, 'text', { class: 'prix-name', 'text-anchor': p.position.anchor, x: p.position.x, y: p.position.y }, p.label);
    }
    const focusedModel = svg.contains(document.activeElement) && document.activeElement.closest('[data-model]')?.dataset.model;
    svg.replaceChildren(drawing);
    if (focusedModel) svg.querySelector('[data-model="' + CSS.escape(focusedModel) + '"]')?.focus({ preventScroll: true });
  }

  function resize(force = false) {
    const active = charts.find(chart => chart.svg.clientWidth > 0);
    if (!active) return;
    const { width, height } = active.svg.getBoundingClientRect();
    for (const chart of charts) {
      if (!chart.models.length) continue;
      const previous = chart.svg.viewBox.baseVal;
      if (force || previous.width !== width || previous.height !== height) draw(chart, width, height);
    }
  }
  resize(true);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => resize());
    for (const chart of charts) observer.observe(chart.svg);
  } else {
    window.addEventListener('resize', () => resize());
  }
  document.fonts?.ready.then(() => resize(true));
})();
