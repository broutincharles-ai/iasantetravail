/* Tooltips for the figures of /comprendre/ (elements carrying data-tip).
   Figures stay fully readable without this script: every value is also in a label or a data table. */
(function () {
  "use strict";
  var targets = document.querySelectorAll(".fig [data-tip]");
  if (!targets.length) return;

  var tip = document.createElement("div");
  tip.className = "fig-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.appendChild(tip);

  function place(x, y) {
    var pad = 12;
    var w = tip.offsetWidth;
    var h = tip.offsetHeight;
    var left = Math.min(Math.max(pad, x + 14), window.innerWidth - w - pad);
    var top = y - h - 14;
    if (top < pad) top = y + 18;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function show(el, x, y) {
    tip.textContent = el.getAttribute("data-tip");
    tip.hidden = false;
    if (x === undefined) {
      var r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    place(x, y);
  }

  function hide() { tip.hidden = true; }

  Array.prototype.forEach.call(targets, function (el) {
    el.addEventListener("pointerenter", function (e) { show(el, e.clientX, e.clientY); });
    el.addEventListener("pointermove", function (e) { if (!tip.hidden) place(e.clientX, e.clientY); });
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focus", function () { show(el); });
    el.addEventListener("blur", hide);
  });
  window.addEventListener("scroll", hide, { passive: true });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
})();
