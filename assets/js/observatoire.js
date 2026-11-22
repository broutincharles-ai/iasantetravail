/* Observatoire de l’IA au travail (/observatoire/ et /en/observatory/) : carte, classement et
   comparaison entre sources.
   - Les chiffres sont lus dans les trois tableaux de la page, écrits par scripts/build-observatoire.mjs.
   - Les contours viennent de /assets/data/observatoire-monde.json : Natural Earth 1:50m, projection
     Equal Earth, déjà projetés dans un cadre de 1000 × 459 unités ; « n » et « e » : nom français et anglais.
   - Le zoom utilise window.ObservatoireZoom (observatoire-zoom.js) ; sans lui, la carte reste lisible.
   - La langue suit l’attribut lang de la page ; les textes des deux langues sont dans TEXT. */
(() => {
  'use strict';
  const app = document.getElementById('obs-app');
  if (!app || !document.createElementNS || !window.fetch) return;

  const OUTLINES = '/assets/data/observatoire-monde.json?v=1.1';
  const W = 1000, H = 459, EUROPE = [429.8, 22.2, 569.4, 127.3];   // cadre de la carte et vue « Europe », en unités de carte
  const BREAKS = [10, 20, 30, 40, 50, 65];
  const RAMP = ['#e3c9bf', '#d8a796', '#d18168', '#c65939', '#a83e27', '#822e1e', '#5d2015'];   // terracotta du site, du clair au foncé
  const NODATA = '#faf7f0';   // papier vierge, plus clair que toutes les classes
  const DOT_BELOW = 16;       // unités de carte² : en dessous, le pays reçoit aussi un point
  const DOT_PX = 3.4, DOT_HIDE_PX = 9;
  const NBSP = ' ';
  const ENGLISH = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  const TEXT = ENGLISH ? {
    locale: 'en',
    percent: (v, digits) => v.toFixed(digits) + '%',
    layers: {
      employees: { title: 'Worker survey', noun: 'countries',
        def: 'Share of people in work who say they use AI tools at work at least every few months. Online survey by the University of Melbourne and KPMG, November 2024 to January 2025.',
        who: 'of workers use AI at work', cap: 'Workers, any AI tool, at least every few months',
        foot: '* Read from the report’s ranked chart: see the sources.' },
      workers: { title: 'Official statistics', noun: 'countries',
        def: 'Share of people in work, aged 16 to 74, who used generative AI for their job in the previous three months. Surveys by national statistical offices, published by Eurostat.',
        who: 'of people in work used generative AI for their job', cap: 'People in work, generative AI for the job, last three months', foot: '' },
      adults: { title: 'Usage estimates', noun: 'economies',
        def: 'Share of people aged 15 to 64 who used a generative AI product, for any purpose, at work or not. Estimated by Microsoft from its own usage data, June 2026.',
        who: 'of people aged 15 to 64 used generative AI', cap: 'Ages 15 to 64, generative AI, any purpose',
        foot: '† Same series as neighbouring economies in the source.' }
    },
    from: 'From ', to: ' to ',
    median: (count, noun, value) => 'Median of the ' + count + ' ' + noun + ': ' + value + '.',
    total: (label, value) => label + ': ' + value + '.',
    rank: (rank, count) => { const s = ['th', 'st', 'nd', 'rd'], v = rank % 100; return rank + (s[(v - 20) % 10] || s[v] || s[0]) + ' of ' + count; },
    early: value => 'First half of 2025: ' + value,
    noData: 'No data', noDataHere: 'No data in this source',
    noteChart: 'Read from the report’s ranked chart: see the sources.',
    notePooled: count => 'The source gives the same series to ' + count + ' economies in this region, which suggests a regional estimate.',
    empty: typed => 'No country in this source matches “' + typed + '”.',
    loadError: 'The map outlines could not be loaded. The ranking and the comparison still work.'
  } : {
    locale: 'fr',
    percent: (v, digits) => v.toFixed(digits).replace('.', ',') + NBSP + '%',
    layers: {
      employees: { title: 'Enquête auprès des travailleurs', noun: 'pays',
        def: 'Part des personnes en emploi qui déclarent utiliser des outils d’IA au travail au moins tous les quelques mois. Enquête en ligne de l’Université de Melbourne et de KPMG, de novembre 2024 à janvier 2025.',
        who: 'des travailleurs utilisent l’IA au travail', cap: 'Travailleurs, tout outil d’IA, au moins tous les quelques mois',
        foot: '* Valeur lue sur le graphique du rapport' + NBSP + ': voir les sources.' },
      workers: { title: 'Statistique publique', noun: 'pays',
        def: 'Part des personnes en emploi de 16 à 74 ans ayant utilisé une IA générative pour leur travail au cours des trois derniers mois. Enquêtes des instituts statistiques nationaux, publiées par Eurostat.',
        who: 'des personnes en emploi ont utilisé une IA générative pour leur travail', cap: 'Personnes en emploi, IA générative pour le travail, trois derniers mois', foot: '' },
      adults: { title: 'Estimations d’usage', noun: 'économies',
        def: 'Part des 15-64 ans ayant utilisé un produit d’IA générative, quel que soit l’usage, professionnel ou non. Estimation de Microsoft à partir de ses propres données d’utilisation, juin 2026.',
        who: 'des 15-64 ans ont utilisé une IA générative', cap: '15-64 ans, IA générative, tous usages',
        foot: '† Même série que des économies voisines dans la source.' }
    },
    from: 'De ', to: ' à ',
    median: (count, noun, value) => 'Médiane des ' + count + ' ' + noun + NBSP + ': ' + value + '.',
    total: (label, value) => label + NBSP + ': ' + value + '.',
    rank: (rank, count) => (rank === 1 ? '1er' : rank + 'e') + ' sur ' + count,
    early: value => '1er semestre 2025' + NBSP + ': ' + value,
    noData: 'Pas de donnée', noDataHere: 'Pas de donnée dans cette source',
    noteChart: 'Valeur lue sur le graphique classé du rapport' + NBSP + ': voir les sources.',
    notePooled: count => 'La source donne la même série à ' + count + ' économies de cette région, ce qui suggère une estimation régionale.',
    empty: typed => 'Aucun pays de cette source ne correspond à «' + NBSP + typed + NBSP + '».',
    loadError: 'Les contours de la carte n’ont pas pu être chargés. Le classement et la comparaison restent utilisables.'
  };

  const $ = id => document.getElementById('obs-' + id);
  const svgEl = (name, attrs) => { const e = document.createElementNS('http://www.w3.org/2000/svg', name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LAYERS = {
    employees: Object.assign({ digits: 0 }, TEXT.layers.employees),
    workers: Object.assign({ digits: 1 }, TEXT.layers.workers),
    adults: Object.assign({ digits: 1 }, TEXT.layers.adults)
  };
  const ORDER = ['employees', 'workers', 'adults'];
  const classOf = v => { let i = 0; while (i < BREAKS.length && v >= BREAKS[i]) i++; return i; };
  const colorOf = v => v == null ? NODATA : RAMP[classOf(v)];
  const fmt = TEXT.percent;
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  /* ---------- les chiffres, lus dans les tableaux de la page ---------- */
  const nameOf = new Map();
  for (const key of ORDER) {
    const L = LAYERS[key], table = $('table-' + key), rows = [];
    for (const tr of (table && table.tBodies[0] ? table.tBodies[0].rows : [])) {
      const v = parseFloat(tr.dataset.v), th = tr.querySelector('th');
      if (!tr.dataset.iso || !th || !isFinite(v)) continue;
      rows.push({ id: tr.dataset.iso, v, name: th.textContent.trim(), rank: 0,
        early: tr.dataset.early ? parseFloat(tr.dataset.early) : null,
        pooled: tr.dataset.pooled ? parseInt(tr.dataset.pooled, 10) : 0, chart: tr.dataset.flag === 'chart' });
    }
    if (!rows.length) return;   // tableaux absents : la page reste lisible sans la carte
    rows.sort((a, b) => b.v - a.v || a.name.localeCompare(b.name, TEXT.locale));
    rows.forEach((r, i) => { r.rank = i && rows[i - 1].v === r.v ? rows[i - 1].rank : i + 1; if (!nameOf.has(r.id)) nameOf.set(r.id, r.name); });
    const n = rows.length, sorted = rows.map(r => r.v).sort((a, b) => a - b);
    L.rows = rows; L.byId = new Map(rows.map(r => [r.id, r]));
    L.median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const total = table.tFoot && table.tFoot.rows[0], totalName = total && total.querySelector('th');
    L.total = total && totalName && isFinite(parseFloat(total.dataset.v)) ? { label: totalName.textContent.trim(), v: parseFloat(total.dataset.v) } : null;
  }
  const mark = r => r.chart ? '*' : r.pooled ? '†' : '';
  const noteOf = r => r.chart ? TEXT.noteChart : r.pooled ? TEXT.notePooled(r.pooled) : '';

  const state = { layer: 'employees', sel: 'FRA', hover: null, k: 1 };
  const feats = [], featById = new Map();
  let zoom = null, zoomSel = null;
  const Z = window.ObservatoireZoom;

  // une forme de la carte prend son propre chiffre ou, à défaut, celui du pays auquel elle est rattachée (Guyane française → France)
  const resolve = (fid, key) => { const L = LAYERS[key]; if (L.byId.has(fid)) return fid; const f = featById.get(fid); return f && f.p && L.byId.has(f.p) ? f.p : fid; };

  /* ---------- légende ---------- */
  RAMP.forEach(c => { const i = document.createElement('i'); i.style.background = c; $('scale-bar').appendChild(i); });
  [0].concat(BREAKS).forEach((t, i) => {       // les nombres sont posés sur les limites de classe ; la dernière classe va jusqu’à 100
    const s = el('span', i ? '' : 'is-first', String(t));
    s.style.left = 'calc(' + i + ' * (var(--sw) + 2px)' + (i ? ' - 1px' : '') + ')';
    $('scale-ticks').appendChild(s);
  });

  /* ---------- texte, comparaison, classement ---------- */
  function renderText() {
    const L = LAYERS[state.layer], top = L.rows[0], bottom = L.rows[L.rows.length - 1];
    $('def').textContent = L.def;
    const say = $('say'); say.textContent = '';
    const b = t => el('b', '', t);
    say.append(TEXT.from, b(fmt(bottom.v, L.digits)), ' (' + bottom.name + ')' + TEXT.to, b(fmt(top.v, L.digits)), ' (' + top.name + '). '
      + TEXT.median(L.rows.length, L.noun, fmt(L.median, L.digits)) + (L.total ? ' ' + TEXT.total(L.total.label, fmt(L.total.v, L.digits)) : ''));
    for (const key of ORDER) { const button = $('seg-' + key), on = key === state.layer; button.setAttribute('aria-checked', String(on)); button.tabIndex = on ? 0 : -1; }
    $('rank-count').textContent = L.rows.length + ' ' + L.noun;
    $('foot').textContent = L.foot; $('foot').hidden = !L.foot;
  }

  function renderCompare() {
    const id = state.sel, box = $('cmp-rows'); box.textContent = '';
    $('cmp-name').textContent = nameOf.get(id) || id;
    const notes = [];
    for (const key of ORDER) {
      const L = LAYERS[key], r = L.byId.get(id);
      const row = el('div', 'obs-cmp' + (key === state.layer ? ' is-active' : ''));
      const top = el('div', 'obs-cmp-top');
      top.append(el('span', 'obs-cmp-label', L.title), r ? el('span', 'obs-cmp-val', fmt(r.v, L.digits) + mark(r)) : el('span', 'obs-cmp-val is-none', TEXT.noData));
      const bar = el('div', 'obs-cmp-bar'), fill = document.createElement('i');
      fill.style.width = (r ? r.v : 0) + '%'; fill.style.background = r ? colorOf(r.v) : 'transparent'; bar.appendChild(fill);
      let cap = L.cap;
      if (r && r.early != null) cap += '. ' + TEXT.early(fmt(r.early, 1));
      row.append(top, bar, el('span', 'obs-cmp-cap', cap));
      box.appendChild(row);
      if (r && mark(r)) notes.push(mark(r) + ' ' + noteOf(r));
    }
    $('cmp-note').textContent = notes.join(' '); $('cmp-note').hidden = !notes.length;
  }

  function renderList() {
    const L = LAYERS[state.layer], typed = $('search').value.trim(), q = norm(typed), list = $('list');
    list.textContent = '';
    const rows = q ? L.rows.filter(r => norm(r.name).includes(q)) : L.rows;
    for (const r of rows) {
      const button = el('button', 'obs-row'); button.type = 'button'; button.dataset.id = r.id;
      if (r.id === state.sel) button.setAttribute('aria-current', 'true');
      const swatch = el('span', 'obs-row-sw'); swatch.style.background = colorOf(r.v);
      button.append(el('span', 'obs-row-rank', String(r.rank)), swatch, el('span', 'obs-row-name', r.name), el('span', 'obs-row-val', fmt(r.v, L.digits) + mark(r)));
      list.appendChild(button);
    }
    if (!rows.length) list.appendChild(el('p', 'obs-empty', TEXT.empty(typed)));
  }
  function markRow(scroll) {
    const list = $('list');
    for (const button of list.children) {
      if (!button.dataset || !button.dataset.id) continue;
      if (button.dataset.id === state.sel) {
        button.setAttribute('aria-current', 'true');
        if (scroll) { const t = button.offsetTop - list.offsetTop; if (t < list.scrollTop || t + button.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = t - list.clientHeight / 2 + button.offsetHeight / 2; }
      } else button.removeAttribute('aria-current');
    }
  }

  /* ---------- carte ---------- */
  const svg = $('svg'), landG = $('land'), dotsG = $('dots');
  const unit = () => (svg.clientWidth || W) / W;                      // pixels d’écran par unité de carte, au zoom 1
  function paint() {
    const L = LAYERS[state.layer];
    for (const f of feats) {
      const r = L.byId.get(resolve(f.id, state.layer));
      f.has = !!r; f.el.setAttribute('fill', colorOf(r ? r.v : null)); f.el.classList.toggle('has-data', f.has);
      if (f.dot) f.dot.setAttribute('fill', colorOf(r ? r.v : null));
    }
    sizeDots(); outline('sel', state.sel); outline('hover', null);
  }
  function sizeDots() {
    const s = unit() * state.k;
    for (const f of feats) if (f.dot) {
      f.dotOn = f.has && Math.sqrt(f.a) * s < DOT_HIDE_PX;
      f.dot.style.display = f.dotOn ? '' : 'none';
      if (f.dotOn) f.dot.setAttribute('r', (DOT_PX / s).toFixed(3));
    }
    for (const kind of ['sel', 'hover']) { const dot = $(kind + '-dot'); if (dot.__f) ring(dot, dot.__f); }
  }
  function ring(dot, f) {
    dot.__f = f;
    if (f && f.dotOn) { dot.setAttribute('cx', f.c[0]); dot.setAttribute('cy', f.c[1]); dot.setAttribute('r', ((DOT_PX + 2.5) / (unit() * state.k)).toFixed(3)); dot.style.display = ''; }
    else dot.style.display = 'none';
  }
  function outline(kind, id) {
    const path = $(kind + '-path'), dot = $(kind + '-dot');
    if (!id || !feats.length) { path.setAttribute('d', ''); ring(dot, null); return; }
    const shapes = feats.filter(f => resolve(f.id, state.layer) === id);
    path.setAttribute('d', shapes.map(f => f.edge).join(''));
    ring(dot, shapes.find(f => f.dot) || null);
  }

  function showTip(fid, cx, cy) {
    const L = LAYERS[state.layer], id = resolve(fid, state.layer), r = L.byId.get(id), tip = $('tip');
    $('tip-name').textContent = nameOf.get(id) || id;
    $('tip-val').textContent = r ? fmt(r.v, L.digits) : ''; $('tip-val').hidden = !r;
    $('tip-who').textContent = r ? L.who : TEXT.noDataHere;
    $('tip-rank').textContent = r ? TEXT.rank(r.rank, L.rows.length) : ''; $('tip-rank').hidden = !r;
    const n = r ? noteOf(r) : ''; $('tip-note').textContent = n; $('tip-note').hidden = !n;
    tip.hidden = false;
    const box = $('map').getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = cx - box.left + 14, y = cy - box.top + 14;
    if (x + tw > box.width - 6) x = cx - box.left - tw - 12;
    if (y + th > box.height - 6) y = cy - box.top - th - 12;
    tip.style.transform = 'translate(' + Math.max(6, x) + 'px,' + Math.max(6, y) + 'px)';
    if (state.hover !== id) { state.hover = id; outline('hover', id); }
  }
  function hideTip() { $('tip').hidden = true; if (state.hover) { state.hover = null; outline('hover', null); } }
  const fidOf = ev => ev.target && ev.target.dataset ? ev.target.dataset.id : null;
  svg.addEventListener('pointermove', ev => { if (ev.pointerType === 'touch') return; const fid = fidOf(ev); if (fid) showTip(fid, ev.clientX, ev.clientY); else hideTip(); });
  svg.addEventListener('pointerleave', hideTip);
  svg.addEventListener('click', ev => { const fid = fidOf(ev); if (!fid) { hideTip(); return; } select(resolve(fid, state.layer), { scroll: true }); showTip(fid, ev.clientX, ev.clientY); });

  /* ---------- zoom ---------- */
  function setupZoom() {
    if (!Z || !Z.zoom) return;
    zoomSel = Z.select(svg);
    zoom = Z.zoom().scaleExtent([1, 14]).extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]])
      // un pincement sur pavé tactile arrive en petits pas ctrl+molette, une molette de souris par crans d’environ 100
      .wheelDelta(ev => -ev.deltaY * (ev.deltaMode === 1 ? 0.05 : ev.deltaMode ? 1 : Math.abs(ev.deltaY) < 40 ? 0.02 : 0.004))
      .filter(ev => {
        if (ev.type === 'wheel') return ev.ctrlKey || ev.metaKey;                              // la molette seule fait défiler la page
        if (ev.type.startsWith('touch')) return ev.touches.length > 1 || state.k > 1.001;      // un doigt fait défiler la page tant que la carte n’est pas zoomée
        return !ev.button && !ev.ctrlKey;
      })
      .on('zoom', ev => {
        state.k = ev.transform.k;
        $('zoomg').setAttribute('transform', ev.transform.toString());
        svg.classList.toggle('is-zoomed', state.k > 1.001);
        sizeDots(); if (ev.sourceEvent) hideTip();
      });
    zoomSel.call(zoom);
    $('zoom').hidden = false; $('hint').hidden = false;
    $('zin').addEventListener('click', () => ease(zoomSel).call(zoom.scaleBy, 1.8));
    $('zout').addEventListener('click', () => ease(zoomSel).call(zoom.scaleBy, 1 / 1.8));
    $('zreset').addEventListener('click', () => home(true));
  }
  const ease = sel => reduceMotion || !sel.transition ? sel : sel.transition().duration(450);
  function fit(box, animate, pad) {
    if (!zoom) return;
    const k = Math.max(1, Math.min(14, pad / Math.max((box[2] - box[0]) / W, (box[3] - box[1]) / H)));
    const t = Z.zoomIdentity.translate(W / 2 - k * (box[0] + box[2]) / 2, H / 2 - k * (box[1] + box[3]) / 2).scale(k);
    (animate ? ease(zoomSel) : zoomSel).call(zoom.transform, t);
  }
  const home = animate => state.layer === 'workers' ? fit(EUROPE, animate, 1) : fit([0, 0, W, H], animate, 1);
  function bringIntoView(id) {
    if (!zoom) return;
    const f = featById.get(id); if (!f) return;
    const t = Z.zoomTransform(svg), s = unit();
    const size = Math.max(f.m[2] - f.m[0], f.m[3] - f.m[1]);
    const x = t.applyX(f.c[0]), y = t.applyY(f.c[1]);
    const inView = x > 20 && x < W - 20 && y > 12 && y < H - 12;
    if (inView && size * t.k * s >= 16) return;                                   // déjà bien visible
    const k = Math.max(1, Math.min(12, 0.2 * W / Math.max(size, 1)));
    if (k <= 1.05) { fit([0, 0, W, H], true, 1); return; }
    const halfX = W / (2 * k), halfY = H / (2 * k);
    fit([f.c[0] - halfX, f.c[1] - halfY, f.c[0] + halfX, f.c[1] + halfY], true, 1);
  }

  /* ---------- changements d’état ---------- */
  function select(id, opts) {
    state.sel = id;
    renderCompare(); markRow(opts && opts.scroll); outline('sel', id);
    if (opts && opts.zoom) bringIntoView(id);
  }
  function setLayer(key, opts) {
    if (!LAYERS[key]) return;
    const changed = key !== state.layer;
    state.layer = key; state.sel = resolve(state.sel, key);
    hideTip(); renderText(); renderCompare(); renderList(); $('list').scrollTop = 0; paint();
    if (changed || (opts && opts.initial)) home(!(opts && opts.initial));
  }

  $('seg').addEventListener('click', ev => { const button = ev.target.closest('.obs-seg-btn'); if (button) setLayer(button.dataset.layer); });
  $('seg').addEventListener('keydown', ev => {
    const step = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    ev.preventDefault();
    const next = ORDER[(ORDER.indexOf(state.layer) + step + ORDER.length) % ORDER.length];
    setLayer(next); $('seg-' + next).focus();
  });
  $('list').addEventListener('click', ev => { const button = ev.target.closest('.obs-row'); if (button) select(button.dataset.id, { zoom: true }); });
  $('search').addEventListener('input', renderList);
  window.addEventListener('resize', sizeDots);

  /* ---------- démarrage ---------- */
  app.hidden = false;
  renderText(); renderCompare(); renderList();
  fetch(OUTLINES).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(world => {
    const land = document.createDocumentFragment(), dots = document.createDocumentFragment();
    for (const g of world) {
      const f = { id: g.id, a: g.a, c: g.c, m: g.m, edge: g.o ? g.d.slice(0, g.o) : g.d, p: g.p || null, has: false, dot: null, dotOn: false };
      f.el = svgEl('path', { d: g.d, fill: NODATA }); f.el.dataset.id = g.id; land.appendChild(f.el);
      if (g.a < DOT_BELOW) { f.dot = svgEl('circle', { cx: g.c[0], cy: g.c[1], r: 0 }); f.dot.dataset.id = g.id; f.dot.style.display = 'none'; dots.appendChild(f.dot); }
      feats.push(f); featById.set(g.id, f);
      if (!nameOf.has(g.id)) nameOf.set(g.id, (ENGLISH && g.e) || g.n);
    }
    landG.appendChild(land); dotsG.appendChild(dots);
    $('map-msg').hidden = true;
    setupZoom();
    setLayer(state.layer, { initial: true });
  }).catch(() => { $('map-msg').textContent = TEXT.loadError; });
})();

/* Capacités des modèles : infobulle du point le plus proche, au survol ou au toucher du graphique. Les textes sont
   écrits par scripts/build-observatoire.mjs dans les attributs data- de chaque point ; sans script,
   le tableau replié sous le graphique donne les mêmes valeurs. */
(() => {
  'use strict';
  const plot = document.getElementById('obs-cap-plot');
  const tip = plot && plot.querySelector('.obs-cap-tip');
  if (!tip) return;
  let current = null;
  const hide = () => { if (current) current.classList.remove('is-on'); current = null; tip.hidden = true; };
  const show = point => {
    if (current === point) return;
    hide(); current = point; point.classList.add('is-on');
    tip.textContent = '';
    for (const [name, key] of [['name', 'n'], ['val', 'v'], ['more', 'd'], ['more', 'i']]) {
      const line = document.createElement('span');
      line.className = 'obs-cap-tip-' + name; line.textContent = point.dataset[key] || ''; tip.appendChild(line);
    }
    tip.hidden = false;
    const box = plot.getBoundingClientRect(), mark = point.getBoundingClientRect();
    const x = mark.left + mark.width / 2 - box.left, y = mark.top + mark.height / 2 - box.top;
    const width = tip.offsetWidth, height = tip.offsetHeight;
    let left = x + 14;
    if (left + width > box.width) left = x - 14 - width;
    if (left < 0) left = Math.max(0, Math.min(box.width - width, x - width / 2));
    let top = y - height - 12;
    if (top < 0) top = y + 14;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  };
  // Les points récents sont serrés : on retient le plus proche du pointeur plutôt que celui qui est survolé.
  const points = [...plot.querySelectorAll('.obs-cap-pt')];
  const nearest = (event, reach) => {
    let found = null, distance = reach;
    for (const point of points) {
      const mark = point.getBoundingClientRect();
      const d = Math.hypot(event.clientX - (mark.left + mark.width / 2), event.clientY - (mark.top + mark.height / 2));
      if (d < distance) { found = point; distance = d; }
    }
    return found;
  };
  plot.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const point = nearest(event, 24);
    if (point) show(point); else hide();
  });
  plot.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') hide(); });
  plot.addEventListener('click', event => { const point = nearest(event, 30); if (point) show(point); else hide(); });
  document.addEventListener('pointerdown', event => { if (!plot.contains(event.target)) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
})();
