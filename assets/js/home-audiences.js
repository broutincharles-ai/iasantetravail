/* Homepage, "Vous êtes" / "You are": each profile opens a short text on why AI at work
   concerns that reader, typed out as it appears.

   The full text is in the HTML, so it reads without JavaScript, for screen readers and for
   search engines. The typing is drawn on an aria-hidden copy laid exactly over it (see
   home-v4.css): the panel opens at its final height and nothing on the page moves while it types.
   Reduced motion or forced colours: the text simply appears. A tap on the text shows it at once. */
(() => {
  "use strict";

  // Pace, in milliseconds. `char` is the mean delay per character (± jitter / 2); the others are
  // extra pauses after a space, a comma or colon, and the end of a sentence. About 8 s per text.
  const PACE = { start: 250, char: 13, jitter: 10, space: 8, clause: 80, sentence: 200 };
  const BLINKS_MS = 2400; // once complete, the caret blinks three times (0.8 s each, home-v4.css)

  const panels = [...document.querySelectorAll(".home-audience")];
  if (!panels.length) return;

  const motionOff = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(forced-colors: active)").matches;
  const runs = new Map();

  // When each character appears, counted from the first frame.
  function timeline(text) {
    const times = new Float64Array(text.length);
    let t = PACE.start;
    for (let i = 0; i < text.length; i += 1) {
      t += PACE.char - PACE.jitter / 2 + Math.random() * PACE.jitter;
      times[i] = t;
      const c = text[i];
      if (c === "." || c === "!" || c === "?") t += PACE.sentence;
      else if (c === "," || c === ";" || c === ":") t += PACE.clause;
      else if (c === " ") t += PACE.space;
    }
    return times;
  }

  function stop(panel) {
    const run = runs.get(panel);
    if (!run) return;
    cancelAnimationFrame(run.frame);
    clearTimeout(run.timer);
    run.layer.remove();
    run.body.classList.remove("is-typing", "is-typed");
    runs.delete(panel);
  }

  function complete(panel) {
    const run = runs.get(panel);
    if (!run || run.complete) return;
    run.complete = true;
    cancelAnimationFrame(run.frame);
    run.typed.textContent = run.text;
    run.rest.textContent = "";
    run.body.classList.add("is-typed");
    // The copy and the real paragraph are laid out identically: swapping them is invisible.
    run.timer = setTimeout(() => stop(panel), BLINKS_MS);
  }

  function type(panel) {
    stop(panel);
    const body = panel.querySelector(".home-audience-body");
    const source = body && body.querySelector(".home-audience-text");
    if (!source) return;
    const text = source.textContent.replace(/\s+/g, " ").trim();

    // Typed part (with the caret) + the rest, still transparent: lines break exactly where they
    // will in the finished paragraph, so a word never jumps to the next line while it is typed.
    const layer = document.createElement("p");
    const typed = document.createElement("span");
    const rest = document.createElement("span");
    layer.className = "home-audience-copy";
    layer.setAttribute("aria-hidden", "true");
    typed.className = "home-audience-typed";
    rest.className = "home-audience-rest";
    rest.textContent = text;
    layer.append(typed, rest);
    body.append(layer);
    body.classList.add("is-typing");

    const times = timeline(text);
    const run = { body, layer, typed, rest, text, shown: 0, frame: 0, timer: 0, complete: false };
    runs.set(panel, run);
    let start = 0;
    const tick = now => {
      if (!start) start = now;
      let shown = run.shown;
      while (shown < text.length && times[shown] <= now - start) shown += 1;
      if (shown !== run.shown) {
        run.shown = shown;
        typed.textContent = text.slice(0, shown);
        rest.textContent = text.slice(shown);
      }
      if (shown < text.length) run.frame = requestAnimationFrame(tick);
      else complete(panel);
    };
    run.frame = requestAnimationFrame(tick);
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
      // Prepared before the panel is first painted, so the finished text never flashes.
      if (!motionOff()) type(panel);
      settle(panel, summary, before);
    });

    // Closed by the reader, by another profile or by the browser: drop the animation.
    panel.addEventListener("toggle", () => { if (!panel.open) stop(panel); });

    // A tap on the text shows the rest at once.
    body.addEventListener("click", () => complete(panel));
  });
})();
