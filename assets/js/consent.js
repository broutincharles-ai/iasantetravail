(() => {
  "use strict";

  // Audience measurement only with consent (CNIL rules for Google Analytics).
  // Nothing from Google is loaded until the visitor accepts. The choice is kept six months
  // in this browser and can be changed at any time with "Gérer les cookies" in the footer.

  const MEASUREMENT_ID = "G-RKEJVY4XVC";
  const STORAGE_KEY = "iast-consent";
  const MAX_AGE = 1000 * 60 * 60 * 24 * 180;
  const english = document.documentElement.lang.toLowerCase().startsWith("en");
  const text = english ? {
    label: "Audience measurement",
    message: "With your agreement, this site uses Google Analytics to count visits and see which pages are useful. Google Analytics sets cookies and sends browsing data to Google.",
    more: "Learn more",
    policy: "/en/privacy/#audience-measurement",
    refuse: "Decline",
    accept: "Accept"
  } : {
    label: "Mesure d’audience",
    message: "Avec votre accord, ce site utilise Google Analytics pour compter les visites et savoir quelles pages sont utiles. Ce service dépose des cookies et transmet des données de navigation à Google.",
    more: "En savoir plus",
    policy: "/confidentialite/#mesure-audience",
    refuse: "Refuser",
    accept: "Accepter"
  };

  const readChoice = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && typeof stored.analytics === "boolean" && Date.now() - stored.at < MAX_AGE) return stored;
    } catch { /* unreadable or unavailable storage: ask again */ }
    return null;
  };
  const saveChoice = analytics => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, analytics, at: Date.now() })); } catch { /* not stored */ }
  };

  let analyticsLoaded = false;
  const loadAnalytics = () => {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };
  const deleteAnalyticsCookies = () => {
    const host = window.location.hostname;
    const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
    document.cookie.split(";").map(cookie => cookie.trim().split("=")[0]).filter(name => /^_ga/.test(name)).forEach(name => {
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
      });
    });
  };

  let banner = null;
  let returnFocus = null;
  const closeBanner = () => {
    banner?.remove();
    banner = null;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  };
  const decide = analytics => {
    const wasLoaded = analyticsLoaded;
    saveChoice(analytics);
    closeBanner();
    if (analytics) loadAnalytics();
    else {
      deleteAnalyticsCookies();
      if (wasLoaded) window.location.reload();
    }
  };
  const showBanner = focus => {
    if (banner) { banner.querySelector("button")?.focus(); return; }
    banner = document.createElement("section");
    banner.id = "consent-banner";
    banner.setAttribute("aria-label", text.label);
    banner.innerHTML = `<p><strong>${text.label}.</strong> ${text.message} <a href="${text.policy}">${text.more}</a></p><div class="consent-actions"><button type="button" data-consent-choice="refuse">${text.refuse}</button><button type="button" data-consent-choice="accept">${text.accept}</button></div>`;
    banner.addEventListener("click", event => {
      const button = event.target.closest("[data-consent-choice]");
      if (button) decide(button.dataset.consentChoice === "accept");
    });
    banner.addEventListener("keydown", event => { if (event.key === "Escape" && readChoice()) closeBanner(); });
    document.body.appendChild(banner);
    if (focus) banner.querySelector("button")?.focus();
  };

  document.addEventListener("click", event => {
    const trigger = event.target.closest?.("[data-consent-open]");
    if (!trigger) return;
    event.preventDefault();
    returnFocus = trigger;
    showBanner(true);
  });

  const isCrawler = navigator.webdriver || /bot|crawl|spider|slurp|archiver|preview|lighthouse|headless|inspectiontool|google-|mediapartners/i.test(navigator.userAgent || "");
  const choice = readChoice();
  if (choice?.analytics) loadAnalytics();
  else if (!choice && !isCrawler) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => showBanner(false), { once: true });
    else showBanner(false);
  }
})();
