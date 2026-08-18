(() => {
  "use strict";

  const preferenceKey = "iast-language-preference";
  const supportedLanguages = new Set(["fr", "en"]);
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const isHomepage = path === "/" || path === "/en/";

  const normaliseLanguage = value => {
    const language = String(value || "").trim().toLowerCase().split("-")[0];
    return supportedLanguages.has(language) ? language : "";
  };

  const readPreference = () => {
    try {
      return normaliseLanguage(window.localStorage.getItem(preferenceKey));
    } catch {
      return "";
    }
  };

  const savePreference = language => {
    const normalised = normaliseLanguage(language);
    if (!normalised) return;
    try {
      window.localStorage.setItem(preferenceKey, normalised);
    } catch {
      // The language link still works when local storage is unavailable.
    }
  };

  const currentUrl = new URL(window.location.href);
  const explicitPreference = normaliseLanguage(currentUrl.searchParams.get("lang"));
  if (explicitPreference) savePreference(explicitPreference);

  const userAgent = window.navigator.userAgent || "";
  const isAutomatedAgent = window.navigator.webdriver
    || /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|twitterbot|linkedinbot|whatsapp|headless/i.test(userAgent);

  if (isHomepage && !isAutomatedAgent) {
    const browserLanguages = Array.isArray(window.navigator.languages) && window.navigator.languages.length
      ? window.navigator.languages
      : [window.navigator.language];
    const detectedLanguage = browserLanguages.map(normaliseLanguage).find(Boolean) || "en";
    const preferredLanguage = explicitPreference || readPreference() || detectedLanguage;
    const preferredPath = preferredLanguage === "fr" ? "/" : "/en/";

    if (path !== preferredPath) {
      currentUrl.pathname = preferredPath;
      window.location.replace(`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      return;
    }
  }

  if (explicitPreference && window.history?.replaceState) {
    currentUrl.searchParams.delete("lang");
    window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }

  document.addEventListener("click", event => {
    const languageLink = event.target?.closest?.('a[hreflang="fr"], a[hreflang="en"]');
    if (!languageLink) return;

    const language = normaliseLanguage(languageLink.getAttribute("hreflang"));
    if (!language) return;
    savePreference(language);

    try {
      const targetUrl = new URL(languageLink.href, window.location.href);
      targetUrl.searchParams.set("lang", language);
      languageLink.href = targetUrl.href;
    } catch {
      // Keep the original language link when its URL cannot be parsed.
    }
  }, true);
})();
