/* Homepage, "Vous êtes" / "You are": each profile opens a short text on why AI at work
   concerns that reader, typed out behind a caret at a steady pace.

   The paragraph in the page is never changed: it reads the same without JavaScript, for screen
   readers and for search engines. While it types, it is only made transparent, and the typing is
   drawn on an aria-hidden copy laid over it (see home-v4.css). The copy is cut into the exact lines
   the browser gave the paragraph, so no word ever jumps from one line to the next, the panel opens
   at its final height and the hand-over at the end is invisible. Characters come one after another
   at a constant rate, each fading in over a few frames, so the typing flows instead of stuttering.
   Reduced motion, forced colours, a resize or late web fonts: the text simply shows.
   A tap on the text shows the rest at once. */
(() => {
  "use strict";

  // `charsPerSecond` is the typing speed, constant: no pauses, no randomness. `fadeMs` is how long
  // each new character takes to appear. About 8 to 9 seconds for a 650-character text.
  const PACE = { startMs: 150, charsPerSecond: 80, fadeMs: 110 };
  const BLINKS_MS = 2100; // then the caret blinks three times (0.7 s each, home-v4.css) and goes

  const panels = [...document.querySelectorAll(".home-audience")];
  if (!panels.length) return;

  const motionOff = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(forced-colors: active)").matches;
  let run = null; // the one text being typed

  function stop() {
    if (!run) return;
    cancelAnimationFrame(run.frame);
    clearTimeout(run.timer);
    run.copy.remove();
    run.body.classList.remove("is-typing", "is-typed");
    run = null;
  }

  // The paragraph's lines as laid out, as [start, end) character offsets. Characters only move
  // down the page as the text goes on, so each line end is found by bisection. A space is placed
  // with the character before it: lines break after spaces, and a space at the end of a line may
  // have no box of its own.
  function linesOf(node) {
    const text = node.data;
    const length = text.length;
    const range = document.createRange();
    const topAt = index => {
      let i = index;
      while (i > 0 && /\s/.test(text[i])) i -= 1;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      return range.getBoundingClientRect().top;
    };
    const lines = [];
    let start = 0;
    while (start < length) {
      const top = topAt(start);
      let low = start;
      let high = length - 1;
      while (low < high) {
        const mid = (low + high + 1) >> 1;
        if (topAt(mid) < top + 2) low = mid;
        else high = mid - 1;
      }
      lines.push([start, low + 1]);
      start = low + 1;
    }
    return lines;
  }

  // Draw the copy at `elapsed` ms of typing: lines already settled stay as they are; the line or
  // two where characters are still fading in are rebuilt; the caret follows the last character.
  function draw(elapsed) {
    const { text, lines, rows, caret } = run;
    const perChar = 1000 / PACE.charsPerSecond;
    const shown = Math.min(text.length, Math.max(0, Math.floor(elapsed / perChar) + 1));
    const settled = Math.min(shown, Math.max(0, Math.floor((elapsed - PACE.fadeMs) / perChar) + 1));
    const caretLine = shown >= text.length ? lines.length - 1 : lines.findIndex(([, end]) => shown < end);
    for (let k = run.done; k <= caretLine; k += 1) {
      const [start, end] = lines[k];
      const row = rows[k];
      if (!row.isConnected) run.copy.append(row);
      if (end <= settled && k !== caretLine) {
        row.replaceChildren(text.slice(start, end));
        run.done = k + 1;
        continue;
      }
      const parts = [text.slice(start, Math.max(start, Math.min(end, settled)))];
      for (let i = Math.max(start, settled); i < Math.min(end, shown); i += 1) {
        const char = document.createElement("span");
        const t = (elapsed - i * perChar) / PACE.fadeMs;
        char.textContent = text[i];
        char.style.opacity = String(1 - (1 - t) * (1 - t));
        parts.push(char);
      }
      if (k === caretLine) parts.push(caret);
      row.replaceChildren(...parts);
    }
    return settled >= text.length;
  }

  function finish() {
    if (!run) return;
    cancelAnimationFrame(run.frame);
    run.body.classList.add("is-typed"); // the caret blinks, then the real paragraph takes over
    run.timer = setTimeout(stop, BLINKS_MS);
  }

  // Called from the click that opens the panel, before it is painted: the paragraph turns
  // transparent at once, so the finished text never flashes. Measuring waits for the next frame,
  // when the opened panel has been laid out.
  function type(panel) {
    stop();
    const body = panel.querySelector(".home-audience-body");
    const paragraph = body && body.querySelector(".home-audience-text");
    const node = paragraph && paragraph.firstChild;
    // A single run of text, with the web fonts in place; otherwise the text simply shows.
    if (!node || node.nodeType !== Node.TEXT_NODE || paragraph.childNodes.length !== 1) return;
    if (document.fonts && document.fonts.status !== "loaded") return;
    const copy = document.createElement("div");
    copy.className = "home-audience-copy";
    copy.setAttribute("aria-hidden", "true");
    body.append(copy);
    body.classList.add("is-typing");
    const current = { panel, body, copy, frame: 0, timer: 0, done: 0, start: 0 };
    run = current;

    current.frame = requestAnimationFrame(() => {
      if (run !== current) return;
      if (!panel.open) { stop(); return; }
      current.text = node.data;
      current.lines = linesOf(node);
      current.rows = current.lines.map(() => {
        const row = document.createElement("span");
        row.className = "home-audience-line";
        return row;
      });
      current.caret = document.createElement("span");
      current.caret.className = "home-audience-caret";
      current.width = window.innerWidth;
      const tick = now => {
        if (run !== current) return;
        if (!current.start) current.start = now;
        if (draw(now - current.start - PACE.startMs)) finish();
        else current.frame = requestAnimationFrame(tick);
      };
      current.frame = requestAnimationFrame(tick);
    });
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
      if (!motionOff()) type(panel);
      settle(panel, summary, before);
    });

    // Closed by the reader, by another profile or by the browser: drop the animation.
    panel.addEventListener("toggle", () => { if (!panel.open && run && run.panel === panel) stop(); });

    // A tap on the text shows the rest at once.
    body.addEventListener("click", () => { if (run && run.panel === panel) stop(); });
  });

  // New line breaks would no longer match the copy: show the text as it is.
  window.addEventListener("resize", () => { if (run && run.width !== undefined && run.width !== window.innerWidth) stop(); });
  if (document.fonts) document.fonts.addEventListener("loadingdone", () => stop());
})();
