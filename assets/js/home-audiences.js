/* Homepage, "Vous êtes" / "You are": each profile opens a short text on why AI at work
   concerns that reader. The text flows in at a steady pace, each character fading in behind
   a soft leading edge.

   The animation only changes how the paragraph is painted (CSS Custom Highlight API: ranges of
   its text get transparent or partly transparent colours, see home-v4.css). The text itself never
   changes: it reads the same without JavaScript, for screen readers and for search engines, the
   panel opens at its final height and no word moves. Browsers without the API, reduced motion and
   forced colours show the text at once. A tap on the text shows the rest at once. */
(() => {
  "use strict";

  // A steady flow, with no pauses. `charsPerSecond` is the speed; `edgeMs` is how long each
  // character takes to fade in, which sets the length of the soft edge. About 7 to 8 s per text.
  const PACE = { startMs: 120, charsPerSecond: 90, edgeMs: 300 };
  const SHADES = 10; // ::highlight(home-flow-0) … (home-flow-9) in home-v4.css; 0 is transparent

  const panels = [...document.querySelectorAll(".home-audience")];
  if (!panels.length) return;

  const supported = typeof Highlight === "function" && typeof CSS !== "undefined" && "highlights" in CSS;
  const motionOff = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(forced-colors: active)").matches;

  const shades = [];
  if (supported) {
    for (let level = 0; level < SHADES; level += 1) {
      shades.push(new Highlight());
      CSS.highlights.set(`home-flow-${level}`, shades[level]);
    }
  }
  let run = null; // the one text currently flowing in

  const clear = () => shades.forEach(shade => shade.clear());

  function stop() {
    if (!run) return;
    cancelAnimationFrame(run.frame);
    run.body.classList.remove("is-flowing");
    clear();
    run = null;
  }

  // The paragraph's text nodes and where each starts, so a character index maps to a DOM position.
  function textMap(paragraph) {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let length = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      nodes.push({ node, start: length });
      length += node.data.length;
    }
    return { nodes, length };
  }

  function point(map, index) {
    for (let k = map.nodes.length - 1; k >= 0; k -= 1) {
      const { node, start } = map.nodes[k];
      if (index >= start) return [node, Math.min(index - start, node.data.length)];
    }
    return [map.nodes[0].node, 0];
  }

  function rangeOf(map, from, to) {
    const range = new Range();
    range.setStart(...point(map, from));
    range.setEnd(...point(map, to));
    return range;
  }

  // `shown` characters have started to appear (fractional). Character i stands at
  // (shown - i) / edge of its fade, eased out; everything beyond `shown` is transparent.
  function paint(shown) {
    clear();
    const { map, edge } = run;
    const end = Math.min(map.length, Math.ceil(shown));
    if (end < map.length) shades[0].add(rangeOf(map, end, map.length));
    const shadeOf = i => {
      const t = Math.min(1, (shown - i) / edge);
      return Math.floor((1 - (1 - t) * (1 - t)) * SHADES); // SHADES means fully visible
    };
    let i = Math.max(0, Math.floor(shown - edge));
    while (i < end) {
      const level = shadeOf(i);
      let j = i + 1;
      while (j < end && shadeOf(j) === level) j += 1;
      if (level < SHADES) shades[level].add(rangeOf(map, i, j));
      i = j;
    }
  }

  function flow(panel) {
    stop();
    const body = panel.querySelector(".home-audience-body");
    const paragraph = body && body.querySelector(".home-audience-text");
    if (!paragraph) return;
    const map = textMap(paragraph);
    if (!map.length) return;
    run = { panel, body, map, edge: (PACE.edgeMs / 1000) * PACE.charsPerSecond, frame: 0, start: 0 };
    body.classList.add("is-flowing");
    paint(0); // all transparent before the panel is first painted, so the text never flashes
    const current = run;
    const tick = now => {
      if (run !== current) return;
      if (!current.start) current.start = now;
      const shown = Math.max(0, ((now - current.start - PACE.startMs) / 1000) * PACE.charsPerSecond);
      if (shown - current.edge >= map.length) { stop(); return; }
      paint(shown);
      current.frame = requestAnimationFrame(tick);
    };
    current.frame = requestAnimationFrame(tick);
  }

  function scrollInstantly(top) {
    // html has scroll-behavior: smooth; this correction must not glide.
    try { window.scrollBy({ top, behavior: "instant" }); } catch { window.scrollBy(0, top); }
  }

  // Keep the chosen profile where the reader tapped it when a panel above it closes, then bring
  // its text into view if it opens below the bottom of the screen, without hiding the title.
  function settle(panel, summary, before) {
    requestAnimationFrame(() => {
      const shift = summary.getBoundingClientRect().top - before;
      if (Math.abs(shift) > 1) scrollInstantly(shift);
      const box = panel.getBoundingClientRect();
      const overflow = box.bottom - (window.innerHeight - 16);
      if (overflow <= 0) return;
      const header = document.getElementById("site-header");
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      const by = Math.min(overflow, box.top - headerBottom - 16);
      if (by <= 0) return;
      if (motionOff()) scrollInstantly(by);
      else window.scrollBy({ top: by, behavior: "smooth" });
    });
  }

  panels.forEach(panel => {
    const summary = panel.querySelector("summary");
    const body = panel.querySelector(".home-audience-body");
    if (!summary || !body) return;

    summary.addEventListener("click", () => {
      if (panel.open) return; // this click closes it; the toggle handler cleans up
      const before = summary.getBoundingClientRect().top;
      // One profile at a time (the name attribute already does it in recent browsers).
      panels.forEach(other => { if (other !== panel && other.open) other.open = false; });
      if (supported && !motionOff()) flow(panel);
      settle(panel, summary, before);
    });

    // Closed by the reader, by another profile or by the browser: drop the animation.
    panel.addEventListener("toggle", () => { if (!panel.open && run && run.panel === panel) stop(); });

    // A tap on the text shows the rest at once.
    body.addEventListener("click", () => { if (run && run.panel === panel) stop(); });
  });
})();
