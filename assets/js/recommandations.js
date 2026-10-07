/* Recommandations : la barre « Vous êtes » affiche un seul logigramme à la fois.

   Sans JavaScript, les six logigrammes se suivent et la barre renvoie à chacun par une ancre.
   Avec JavaScript, le logigramme affiché suit l’ancre de l’adresse (#employeur, #elu-cse…) :
   la page d’accueil peut y renvoyer directement, l’adresse se partage telle quelle et le bouton
   Retour ramène au profil précédent. Avant que ce script ne s’exécute, recommandations.css affiche
   déjà le bon logigramme grâce à la classe rc-js posée dans l’en-tête de la page. */
(() => {
  "use strict";

  const root = document.querySelector(".rc");
  const bar = root && root.querySelector(".rc-audiences");
  const list = bar && bar.querySelector(".rc-tablist");
  if (!list) return;

  const tabs = [...list.querySelectorAll(".rc-tab")];
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  if (!tabs.length || panels.some(panel => !panel)) return;
  const picker = bar.querySelector("select");
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  list.setAttribute("role", "tablist");
  [...list.children].forEach(item => item.setAttribute("role", "presentation"));
  tabs.forEach((tab, i) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[i].id);
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", tab.id);
  });

  let current = -1;

  function show(index) {
    if (index === current) return;
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (picker) picker.value = panels[index].id;
  }

  // The panel an anchor belongs to: the panel itself, or the one that contains the element.
  function panelFor(id) {
    const target = id && document.getElementById(id);
    if (!target) return -1;
    return panels.findIndex(panel => panel === target || panel.contains(target));
  }

  function hashId() {
    try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ""; }
  }

  // Bring the chosen logigramme into view only when its title is hidden above the bar.
  function reveal(index) {
    const panel = panels[index];
    const offset = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
    if (panel.getBoundingClientRect().top < offset - 1) {
      panel.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
    }
  }

  function choose(index, { focus = false } = {}) {
    show(index);
    const hash = `#${panels[index].id}`;
    if (window.location.hash !== hash) {
      try { window.history.pushState(null, "", hash); } catch { /* history unavailable */ }
    }
    reveal(index);
    if (focus) tabs[index].focus();
  }

  const startId = hashId();
  const startIndex = panelFor(startId);
  show(startIndex >= 0 ? startIndex : 0);
  root.classList.add("is-enhanced");

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", event => {
      event.preventDefault();
      choose(i);
    });
    tab.addEventListener("keydown", event => {
      let to = null;
      if (event.key === "ArrowRight") to = (i + 1) % tabs.length;
      else if (event.key === "ArrowLeft") to = (i - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") to = 0;
      else if (event.key === "End") to = tabs.length - 1;
      if (to === null) return;
      event.preventDefault();
      choose(to, { focus: true });
    });
  });

  if (picker) {
    picker.addEventListener("change", () => {
      const index = panels.findIndex(panel => panel.id === picker.value);
      if (index >= 0) choose(index);
    });
  }

  // Back and forward buttons, and links to an anchor that sits in another logigramme.
  // No anchor at all brings back the first logigramme; an anchor outside the logigrammes
  // (the « Vous êtes » bar itself) keeps the current one.
  const follow = () => {
    const id = hashId();
    const index = id ? panelFor(id) : 0;
    if (index < 0 || index === current) return;
    show(index);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ block: "start" });
  };
  window.addEventListener("hashchange", follow);
  window.addEventListener("popstate", follow);
})();
