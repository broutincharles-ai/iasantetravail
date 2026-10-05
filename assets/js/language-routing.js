(() => {
  "use strict";

  // Automatic language detection.
  // Loaded synchronously at the end of <head>, after the hreflang links, so the homepage
  // switches language before anything is painted.
  //
  // - Homepage (www.iasantetravail.com/): a visitor whose browser does not list French
  //   is sent to /en/, unless they chose a language before. This is the only redirect.
  // - Every other page keeps its address (a link shared in one language stays in that language).
  //   When the other version suits the visitor better, a discreet bar under the menu offers it.
  // - A choice made with the FR/EN links (or ?lang=fr|en) is remembered and always wins.
  // - Never for crawlers. Nothing is sent anywhere: choices stay in this browser.

  const preferenceKey = "iast-language-preference";
  const dismissedKey = "iast-language-suggestion-dismissed";
  const supported = new Set(["fr", "en"]);
  const normalise = value => {
    const language = String(value || "").trim().toLowerCase().split("-")[0];
    return supported.has(language) ? language : "";
  };
  const read = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
  const write = (storage, key, value) => { try { window[storage].setItem(key, value); } catch { /* storage unavailable */ } };

  const currentUrl = new URL(window.location.href);
  const explicit = normalise(currentUrl.searchParams.get("lang"));
  if (explicit) {
    write("localStorage", preferenceKey, explicit);
    currentUrl.searchParams.delete("lang");
    window.history?.replaceState?.(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }

  // Remember a manual choice made with any FR/EN link (header switch, footer, suggestion bar).
  document.addEventListener("click", event => {
    const link = event.target?.closest?.('a[hreflang="fr"], a[hreflang="en"]');
    const language = link && normalise(link.getAttribute("hreflang"));
    if (language) write("localStorage", preferenceKey, language);
  }, true);

  const userAgent = navigator.userAgent || "";
  if (navigator.webdriver || /bot|crawl|spider|slurp|archiver|preview|lighthouse|headless|inspectiontool|google-|mediapartners|facebookexternalhit|embedly|whatsapp|telegram|pinterest|vkshare|w3c_validator/i.test(userAgent)) return;

  const pageLanguage = normalise(document.documentElement.lang) || "fr";
  const saved = normalise(read("localStorage", preferenceKey));
  const browserLanguages = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).map(normalise);
  const french = browserLanguages.indexOf("fr");
  const english = browserLanguages.indexOf("en");
  // English only for browsers that do not list French; French when it comes before English.
  const browserChoice = french === -1 ? "en" : (english === -1 || french < english) ? "fr" : "";
  const preferred = saved || browserChoice;
  if (!preferred || preferred === pageLanguage) return;

  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${preferred}"]`);
  if (!alternate) return;
  // hreflang links carry the production address; only their path matters here.
  const destination = new URL(new URL(alternate.getAttribute("href"), window.location.href).pathname, window.location.origin);
  if (destination.pathname === window.location.pathname) return;

  let arrivedFromThisSite = false;
  try { arrivedFromThisSite = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin; } catch { /* ignore */ }

  // The language-neutral homepage is the only address that switches by itself.
  if (window.location.pathname === "/" && preferred === "en" && !arrivedFromThisSite) {
    destination.search = currentUrl.search;
    window.location.replace(destination.href);
    return;
  }

  if (read("localStorage", dismissedKey)) return;
  const text = preferred === "en"
    ? { message: "This page is also available in English.", action: "Read in English", close: "Keep the French version" }
    : { message: "Cette page existe aussi en français.", action: "Lire en français", close: "Garder la version anglaise" };

  const showSuggestion = () => {
    const header = document.querySelector("#site-header, body > header");
    if (!header || header.querySelector(".system-language-suggestion")) return;
    const bar = document.createElement("div");
    bar.className = "system-language-suggestion";
    bar.lang = preferred;
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", text.message);
    const inner = document.createElement("div");
    inner.className = "system-language-suggestion-inner";
    const message = document.createElement("p");
    message.textContent = text.message;
    const link = document.createElement("a");
    link.href = destination.pathname + destination.search;
    link.hreflang = preferred;
    link.lang = preferred;
    link.textContent = text.action;
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", text.close);
    close.textContent = "×";
    close.addEventListener("click", () => {
      write("localStorage", dismissedKey, "1");
      bar.remove();
    });
    inner.append(message, link, close);
    bar.append(inner);
    const pageNav = header.querySelector(".page-nav");
    if (pageNav) header.insertBefore(bar, pageNav);
    else header.append(bar);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showSuggestion, { once: true });
  else showSuggestion();
})();
