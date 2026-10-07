/* Homepage, "Vous êtes" / "You are": each profile opens a short text on why AI at work concerns
   that reader, shown whole at once. Without JavaScript it is a plain disclosure; the script only
   keeps one profile open at a time and keeps the tapped profile in view. */
(() => {
  "use strict";

  const panels = [...document.querySelectorAll(".home-audience")];
  if (!panels.length) return;

  const motionOff = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(forced-colors: active)").matches;

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
    if (!summary) return;
    summary.addEventListener("click", () => {
      if (panel.open) return; // this click closes it
      const before = summary.getBoundingClientRect().top;
      // One profile at a time (the name attribute already does it in recent browsers).
      panels.forEach(other => { if (other !== panel && other.open) other.open = false; });
      settle(panel, summary, before);
    });
  });
})();
