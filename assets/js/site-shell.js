(() => {
  "use strict";

  if (!document.querySelector('link[href*="/assets/css/unified-navigation.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/css/unified-navigation.css?v=2.2";
    document.head.appendChild(stylesheet);
  }

  if (!window.__IASTShellReady && !document.querySelector('script[src*="/assets/js/unified-navigation.js"]')) {
    const script = document.createElement("script");
    script.src = "/assets/js/unified-navigation.js?v=2.1";
    document.head.appendChild(script);
  }
})();
