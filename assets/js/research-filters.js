(() => {
  "use strict";

  const controls = document.querySelector("[data-research-filters]");
  const items = [...document.querySelectorAll("[data-research-item]")];
  const count = document.querySelector("[data-visible-count]");

  if (!controls || !items.length) return;

  const buttons = [...controls.querySelectorAll("button[data-filter]")];
  let transitionTimer;

  function applyFilter(filter) {
    window.clearTimeout(transitionTimer);
    items.forEach(item => item.classList.add("is-filtering"));

    transitionTimer = window.setTimeout(() => {
      let visible = 0;
      items.forEach(item => {
        const matches = filter === "all" || item.dataset.topics.split(" ").includes(filter);
        item.hidden = !matches;
        item.classList.remove("is-filtering");
        if (matches) visible += 1;
      });
      if (count) count.textContent = String(visible);
    }, 120);
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
      applyFilter(button.dataset.filter);
    });
  });
})();
