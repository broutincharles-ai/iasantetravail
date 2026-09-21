(() => {
  "use strict";

  for (const [name, version] of [["unified-navigation", "4.0"], ["ux-improvements", "1.0"]]) {
    if (document.querySelector(`link[href*="/assets/css/${name}.css"]`)) continue;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `/assets/css/${name}.css?v=${version}`;
    document.head.appendChild(stylesheet);
  }

  const loadInteractions = () => {
    if (window.__IASTUXReady || document.querySelector('script[src*="/assets/js/ux-improvements.js"]')) return;
    const script = document.createElement("script");
    script.src = "/assets/js/ux-improvements.js?v=1.0";
    document.head.appendChild(script);
  };
  if (window.__IASTShellReady) {
    loadInteractions();
    return;
  }
  const existing = document.querySelector('script[src*="/assets/js/unified-navigation.js"]');
  if (existing) {
    existing.addEventListener("load", loadInteractions, { once: true });
  } else {
    const script = document.createElement("script");
    script.src = "/assets/js/unified-navigation.js?v=5.6";
    script.addEventListener("load", loadInteractions, { once: true });
    document.head.appendChild(script);
  }
})();
