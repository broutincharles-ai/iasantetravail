(() => {
  "use strict";

  if (window.__IASTShellReady) return;
  window.__IASTShellReady = true;

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en") || path.startsWith("/en/");

  if (["/confidentialite/", "/mentions-legales/", "/en/privacy/", "/en/legal-notice/"].includes(path)) {
    document.body.classList.add("page-shell-v2", "legal-refresh");
  }

  const pairs = {
    "/": "/en/",
    "/comprendre/": "/en/understand/",
    "/usages-terrain/": "/en/uses-and-field/",
    "/usages-terrain/exemple-sante-travail/": "/en/uses-and-field/occupational-health-example/",
    "/usages-terrain/avant-deploiement/": "/en/uses-and-field/before-deployment/",
    "/usages-terrain/retours-terrain/": "/en/uses-and-field/after-deployment/",
    "/risques-prevention/": "/en/risks-prevention/",
    "/evaluer/": "/en/evaluate/",
    "/evaluer/benchmark/": "/en/evaluate/benchmark/",
    "/evaluer/impact/": "/en/evaluate/impact/",
    "/evaluer/impact/suivi.html": "/en/evaluate/impact/follow-up.html",
    "/droit-gouvernance/": "/en/legal-governance/",
    "/ai-safety-agi/": "/en/ai-safety-agi/",
    "/research/": "/en/research/",
    "/a-propos/": "/en/about/",
    "/ressources/modeles/": "/en/resources/models/",
    "/mentions-legales/": "/en/legal-notice/",
    "/confidentialite/": "/en/privacy/"
  };

  const reversePairs = Object.fromEntries(Object.entries(pairs).map(([fr, en]) => [en, fr]));
  const isResearchPath = /^\/(?:en\/)?research\//.test(path);
  const isFrenchRiskSubpage = /^\/risques-prevention\/.+/.test(path);
  const researchTranslationUrl = isEnglish ? path.replace(/^\/en/, "") : `/en${path}`;
  const translationUrl = isResearchPath
    ? researchTranslationUrl
    : isFrenchRiskSubpage ? "/en/risks-prevention/"
    : isEnglish ? (reversePairs[path] || "/") : (pairs[path] || "/en/");

  const primary = isEnglish ? [
    ["Understand", "/en/understand/", "understand"],
    ["Occupational risks", "/en/risks-prevention/", "risks"],
    ["Assess", "/en/evaluate/", "evaluate"],
    ["Govern", "/en/legal-governance/", "governance"],
    ["AI in OHS services", "/en/uses-and-field/occupational-health-example/", "spsti"],
    ["About", "/en/about/", "about"]
  ] : [
    ["Comprendre", "/comprendre/", "understand"],
    ["Risques", "/risques-prevention/", "risks"],
    ["Évaluer", "/evaluer/", "evaluate"],
    ["Gouverner", "/droit-gouvernance/", "governance"],
    ["IA en SPSTI", "/usages-terrain/exemple-sante-travail/", "spsti"],
    ["Lecture", "/lecture/", "reading"],
    ["À propos", "/a-propos/", "about"]
  ];

  const explore = isEnglish ? [
    ["Uses & field", "/en/uses-and-field/"],
    ["Model landscape", "/en/resources/models/"]
  ] : [
    ["Usages & terrain", "/usages-terrain/"],
    ["Panorama des modèles", "/ressources/modeles/"]
  ];

  const activeKey = (() => {
    if (/^\/(?:en\/)?(?:understand|comprendre)/.test(path)) return "understand";
    if (/^\/(?:en\/risks-prevention|risques-prevention)/.test(path)) return "risks";
    if (/^\/(?:en\/evaluate|evaluer)/.test(path)) return "evaluate";
    if (/^\/(?:en\/legal-governance|droit-gouvernance)/.test(path)) return "governance";
    if (/^\/(?:en\/uses-and-field\/occupational-health-example|usages-terrain\/exemple-sante-travail)/.test(path)) return "spsti";
    if (/^\/lecture\//.test(path)) return "reading";
    if (/^\/(?:en\/about|a-propos)/.test(path)) return "about";
    return "";
  })();

  const activeAttribute = key => key === activeKey ? ' aria-current="page"' : "";
  const primaryLinks = primary.map(([label, href, key]) => `<a href="${href}"${activeAttribute(key)}>${label}</a>`).join("");
  const existingHeader = document.querySelector("body > header.site-header, body > header.site-system-header") || document.querySelector("body > nav.nav");
  const existingPageNav = existingHeader?.querySelector(".page-nav");
  const legacyPageToc = document.querySelector("main .page-toc");
  const legacyPageLinks = [...(legacyPageToc?.querySelectorAll('a[href^="#"]') || [])]
    .map(link => `<a href="${link.getAttribute("href")}">${link.textContent.trim()}</a>`)
    .join("");
  const pageNavMarkup = existingPageNav
    ? existingPageNav.outerHTML
    : legacyPageLinks
      ? `<nav class="page-nav" aria-label="${isEnglish ? "Page contents" : "Sommaire de la page"}"><div class="page-nav-inner"><span class="page-nav-label">${isEnglish ? "On this page" : "Sur cette page"}</span><div class="page-nav-links">${legacyPageLinks}</div><span class="page-progress" aria-hidden="true"><i></i></span></div></nav>`
      : "";

  if (legacyPageToc && !existingPageNav) legacyPageToc.remove();

  const header = document.createElement("header");
  header.className = "site-system-header";
  header.innerHTML = `
    <nav class="system-nav" aria-label="${isEnglish ? "Main navigation" : "Navigation principale"}">
      <a class="system-brand" href="${isEnglish ? "/en/" : "/"}" aria-label="${isEnglish ? "AI & Occupational Health, home" : "IA et Santé au Travail, accueil"}">
        <span class="system-brand-mark" aria-hidden="true"></span>
        <span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong><small>${isEnglish ? "Independent publication" : "Publication indépendante"}</small></span>
      </a>
      <div class="system-desktop-navigation">
        <div class="system-primary-links">${primaryLinks}</div>
      </div>
      <a class="system-language-switch" href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}" aria-label="${isEnglish ? "View this page in French" : "View this page in English"}">${isEnglish ? "FR" : "EN"}</a>
      <button class="system-menu-button" type="button" aria-controls="systemMobilePanel" aria-expanded="false">Menu</button>
      <div class="system-mobile-panel" id="systemMobilePanel" aria-hidden="true">
        <div class="system-mobile-group"><span class="system-mobile-label">${isEnglish ? "Main" : "Principal"}</span>${primaryLinks}</div>
      </div>
    </nav>${pageNavMarkup}`;

  if (existingHeader) existingHeader.replaceWith(header);
  else document.body.insertBefore(header, document.body.firstChild?.nextSibling || document.body.firstChild);

  const menuButton = header.querySelector(".system-menu-button");
  const mobilePanel = header.querySelector(".system-mobile-panel");
  const closeMenu = (restoreFocus = false) => {
    header.classList.remove("is-open");
    document.body.classList.remove("system-menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobilePanel.setAttribute("aria-hidden", "true");
    if (restoreFocus) menuButton.focus();
  };
  const openMenu = () => {
    header.classList.add("is-open");
    document.body.classList.add("system-menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    mobilePanel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => mobilePanel.querySelector("a")?.focus());
  };

  menuButton.addEventListener("click", () => header.classList.contains("is-open") ? closeMenu() : openMenu());
  mobilePanel.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("click", event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && header.classList.contains("is-open")) closeMenu(true); });
  window.matchMedia("(min-width: 1121px)").addEventListener?.("change", event => { if (event.matches) closeMenu(); });

  const pageNav = header.querySelector(".page-nav");
  const pageNavLabel = pageNav?.querySelector(".page-nav-label");
  const pageNavLinks = [...(pageNav?.querySelectorAll('.page-nav-links a[href^="#"]') || [])];
  const pageProgress = pageNav?.querySelector(".page-progress i");

  if (pageNav && pageNavLabel) {
    const linksId = pageNav.querySelector(".page-nav-links")?.id || "pageNavLinks";
    pageNav.querySelector(".page-nav-links")?.setAttribute("id", linksId);
    pageNavLabel.setAttribute("role", "button");
    pageNavLabel.setAttribute("tabindex", "0");
    pageNavLabel.setAttribute("aria-controls", linksId);
    pageNavLabel.setAttribute("aria-expanded", "false");
    const togglePageNav = () => {
      const open = pageNav.classList.toggle("is-open");
      pageNavLabel.setAttribute("aria-expanded", String(open));
    };
    pageNavLabel.addEventListener("click", togglePageNav);
    pageNavLabel.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePageNav();
      }
    });
    pageNavLinks.forEach(link => link.addEventListener("click", () => {
      pageNav.classList.remove("is-open");
      pageNavLabel.setAttribute("aria-expanded", "false");
    }));
  }

  const setActiveSection = id => pageNavLinks.forEach(link => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const sections = pageNavLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-32% 0px -58% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach(section => observer.observe(section));
  }

  const updateProgress = () => {
    if (!pageProgress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    pageProgress.style.width = `${ratio * 100}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  const footer = document.createElement("footer");
  footer.className = "site-system-footer";
  footer.innerHTML = `
    <div class="system-footer-grid">
      <div><a class="system-brand" href="${isEnglish ? "/en/" : "/"}"><span class="system-brand-mark" aria-hidden="true"></span><span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong></span></a><p>${isEnglish ? "Independent, sourced and dated perspectives for understanding how AI transforms real work and worker health." : "Des repères indépendants, sourcés et datés pour comprendre comment l’IA transforme le travail réel et la santé."}</p></div>
      <div><h2>${isEnglish ? "Pathways" : "Parcours"}</h2><ul>${primary.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>
      <div><h2>${isEnglish ? "Explore" : "Explorer"}</h2><ul>${explore.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>
      <div><h2>${isEnglish ? "Follow" : "Suivre"}</h2><ul><li><a href="https://substack.com/@charlesbroutin" target="_blank" rel="noopener noreferrer">Newsletter ↗</a></li><li><a href="https://www.linkedin.com/in/charles-broutin-a03932201" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li><li><a href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}">${isEnglish ? "Version française" : "English version"}</a></li><li><a href="${isEnglish ? "/en/privacy/" : "/confidentialite/"}">${isEnglish ? "Privacy" : "Confidentialité"}</a></li><li><a href="${isEnglish ? "/en/legal-notice/" : "/mentions-legales/"}">${isEnglish ? "Legal notice" : "Mentions légales"}</a></li></ul></div>
    </div>
    <div class="system-footer-bottom"><span>© 2026 ${isEnglish ? "AI & Occupational Health — Independent editorial initiative." : "IA & Santé au Travail — Initiative éditoriale indépendante."}</span><span>${isEnglish ? "Thomas Cole paintings · public domain" : "Œuvres de Thomas Cole · domaine public"}</span></div>`;

  const existingFooter = document.querySelector("body > footer");
  if (existingFooter) existingFooter.replaceWith(footer);
  else document.body.appendChild(footer);

  document.querySelectorAll(".reveal").forEach(element => element.classList.add("in"));
  document.documentElement.classList.add("site-system-ready");
})();
