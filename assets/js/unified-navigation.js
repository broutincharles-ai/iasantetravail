(() => {
  "use strict";

  // One source of truth for the site shell (header, menus, footer).
  // Node uses it to write the static markup into every page (scripts/render-static-navigation.mjs);
  // the browser only re-renders a page whose static markup is older than this version.
  const NAVIGATION_VERSION = "7.0";

  // French page -> English equivalent. Used by the language switch and the footer link.
  const PAIRS = {
    "/": "/en/",
    "/comprendre/": "/en/understand/",
    "/risques-prevention/": "/en/risks/",
    "/risques-prevention/psychosociaux/": "/en/risks-prevention/",
    "/risques-prevention/economique-social/": "/en/risks/economic-social/",
    "/ia-en-spst/": "/en/uses-and-field/occupational-health-example/",
    "/evaluer/": "/en/evaluate/",
    "/outils/fiches-prevention/": "/en/tools/prevention-fact-sheets/",
    "/droit-gouvernance/": "/en/legal-governance/",
    "/cse/": "/en/cse/",
    "/lecture/": "/en/reading/",
    "/lecture/sante-travail-securite-ia/": "/en/reading/occupational-health-ai-safety/",
    "/lecture/humain-dans-la-boucle/": "/en/reading/human-in-the-loop/",
    "/lecture/ingenierie-code-ia/": "/en/reading/engineering-ai-code/",
    "/lecture/agents-ia-workaholisme/": "/en/reading/ai-agents-workaholism/",
    "/lecture/frontieres-metiers-ia/": "/en/reading/ai-occupational-boundaries/",
    "/lecture/ia-deploiement-travail-reel/": "/en/reading/ai-deployment-real-work/",
    "/lecture/ia-sens-metier-mathematiques/": "/en/reading/ai-meaning-work-mathematics/",
    "/lecture/management-agentique/": "/en/reading/agentic-management/",
    "/lecture/travailleurs-ia-risques-psychosociaux/": "/en/reading/ai-workers-psychosocial-risks/",
    "/a-propos/": "/en/about/",
    "/publications/": "/en/publications/",
    "/publications/ia-preconisations-medicales/": "/en/publications/ai-medical-recommendations/",
    "/publications/llm-risques-psychosociaux/": "/en/publications/llm-psychosocial-risks/",
    "/publications/sante-travail-securite-modeles-frontieres/": "/en/publications/occupational-health-frontier-ai-safety/",
    "/actions/": "/en/actions/",
    "/mentions-legales/": "/en/legal-notice/",
    "/confidentialite/": "/en/privacy/"
  };

  const SITE = {
    fr: {
      home: "/",
      brand: { name: "IA & Santé au Travail", tagline: "Publication indépendante", label: "IA et Santé au Travail, accueil" },
      mainLabel: "Navigation principale",
      searchShort: "Rechercher",
      searchLong: "Rechercher dans le site",
      menu: "Menu",
      language: { code: "EN", lang: "en", label: "View this page in English", footer: "English version", homeLabel: "English homepage (this page is in French only)", homeFooter: "English homepage" },
      items: [
        { key: "understand", label: "Comprendre", href: "/comprendre/" },
        { key: "risks", label: "Risques", href: "/risques-prevention/" },
        { key: "guides", label: "Guides", children: [
          { key: "spst", label: "IA en SPST", href: "/ia-en-spst/", desc: "Usages et méthode pour les services de prévention et de santé au travail" },
          { key: "cse", label: "CSE", href: "/cse/", desc: "Préparer la consultation et l’avis sur un projet d’IA" },
          { key: "governance", label: "Droit & gouvernance", href: "/droit-gouvernance/", desc: "Obligations de l’employeur : AI Act, RGPD, DUERP" }
        ] },
        { key: "toolbox", label: "Outils", wide: true, children: [
          { key: "evaluate", label: "Évaluer un projet d’IA", href: "/evaluer/", desc: "18 questions, avant puis après le déploiement" },
          { key: "preconisations", label: "Relire une préconisation", href: "/outils/preconisations/", desc: "Cinq critères de qualité, analysés par Jev" },
          { key: "cse-checklist", label: "Checklist CSE", href: "/cse/#questions", desc: "Les 10 questions à poser avant l’avis" },
          { key: "pilot-file", label: "Dossier d’un pilote", href: "/droit-gouvernance/#dossier", desc: "Les 8 pièces à réunir avant de tester une IA" },
          { key: "matrix", label: "Matrice valeur / risque", href: "/ia-en-spst/#prioriser", desc: "Situer un usage en SPST avant de le tester" },
          { key: "fiches-prevention", label: "Fiches de prévention", href: "/outils/fiches-prevention/", desc: "7 fiches RPS et IA à télécharger" },
          { key: "claude-skills", label: "Skills pour Claude", href: "/outils/claude-skills/", desc: "Maladies professionnelles, maintien en emploi" }
        ], all: { key: "tools", label: "Tous les outils", href: "/outils/" } },
        { key: "reading", label: "Lectures", href: "/lecture/" },
        { key: "about-group", label: "À propos", children: [
          { key: "about", label: "Charles Broutin", href: "/a-propos/", desc: "Médecin du travail, auteur du site" },
          { key: "publications", label: "Publications", href: "/publications/", desc: "Articles publiés et preprint" },
          { key: "actions", label: "Interventions", href: "/actions/", desc: "Séminaires, journées et colloques" }
        ] }
      ],
      footer: {
        tagline: "Des repères indépendants, sourcés et datés pour comprendre comment l’IA transforme le travail réel et la santé.",
        groups: [
          { id: "systemFooterUnderstand", title: "Comprendre", links: [
            ["Comprendre l’IA", "/comprendre/"], ["Risques", "/risques-prevention/"], ["IA en SPST", "/ia-en-spst/"],
            ["CSE", "/cse/"], ["Droit & gouvernance", "/droit-gouvernance/"], ["Lectures", "/lecture/"]
          ] },
          { id: "systemFooterTools", title: "Outils", links: [
            ["Évaluer un projet d’IA", "/evaluer/"], ["Relire une préconisation", "/outils/preconisations/"],
            ["Fiches de prévention", "/outils/fiches-prevention/"], ["Skills pour Claude", "/outils/claude-skills/"], ["Tous les outils", "/outils/"]
          ] },
          { id: "systemFooterSite", title: "Le site", links: [
            ["À propos", "/a-propos/"], ["Publications", "/publications/"], ["Interventions", "/actions/"],
            ["Newsletter", "https://substack.com/@charlesbroutin", true], ["LinkedIn", "https://www.linkedin.com/in/charles-broutin-a03932201", true]
          ] }
        ],
        privacy: ["Confidentialité", "/confidentialite/"],
        legal: ["Mentions légales", "/mentions-legales/"],
        cookies: "Gérer les cookies",
        external: "ouvre dans un nouvel onglet",
        copyright: "© 2026 IA & Santé au Travail — Initiative éditoriale indépendante."
      }
    },
    en: {
      home: "/en/",
      brand: { name: "AI & Occupational Health", tagline: "Independent publication", label: "AI & Occupational Health, home" },
      mainLabel: "Main navigation",
      searchShort: "Search",
      searchLong: "Search the site",
      menu: "Menu",
      language: { code: "FR", lang: "fr", label: "Voir cette page en français", footer: "Version française", homeLabel: "Accueil en français (cette page n’existe qu’en anglais)", homeFooter: "Accueil en français" },
      items: [
        { key: "understand", label: "Understand", href: "/en/understand/" },
        { key: "risks", label: "Risks", href: "/en/risks/" },
        { key: "guides", label: "Guides", children: [
          { key: "spst", label: "AI in OHS services", href: "/en/uses-and-field/occupational-health-example/", desc: "Uses and method for occupational health services" },
          { key: "cse", label: "Works council (CSE)", href: "/en/cse/", desc: "Prepare the consultation and the opinion on an AI project" },
          { key: "governance", label: "Law & governance", href: "/en/legal-governance/", desc: "Employer duties: AI Act, GDPR, risk assessment" }
        ] },
        { key: "toolbox", label: "Tools", wide: true, children: [
          { key: "evaluate", label: "Assess an AI project", href: "/en/evaluate/", desc: "18 questions, before and after deployment" },
          { key: "cse-checklist", label: "Works council checklist", href: "/en/cse/#questions", desc: "Ten questions to ask before the opinion" },
          { key: "pilot-file", label: "Pilot file", href: "/en/legal-governance/#dossier", desc: "Eight documents to prepare before testing an AI" },
          { key: "matrix", label: "Value / risk matrix", href: "/en/uses-and-field/occupational-health-example/#prioriser", desc: "Place an AI use before testing it" },
          { key: "fiches-prevention", label: "Prevention fact sheets", href: "/en/tools/prevention-fact-sheets/", desc: "Seven downloadable sheets on psychosocial risks and AI" }
        ] },
        { key: "reading", label: "Reading", href: "/en/reading/" },
        { key: "about-group", label: "About", children: [
          { key: "about", label: "Charles Broutin", href: "/en/about/", desc: "Occupational physician, author of the site" },
          { key: "publications", label: "Publications", href: "/en/publications/", desc: "Published articles and preprint" },
          { key: "actions", label: "Talks", href: "/en/actions/", desc: "Seminars, study days and conferences" }
        ] }
      ],
      footer: {
        tagline: "Independent, sourced and dated perspectives for understanding how AI transforms real work and worker health.",
        groups: [
          { id: "systemFooterUnderstand", title: "Understand", links: [
            ["Understand AI", "/en/understand/"], ["Risks", "/en/risks/"], ["AI in OHS services", "/en/uses-and-field/occupational-health-example/"],
            ["Works council (CSE)", "/en/cse/"], ["Law & governance", "/en/legal-governance/"], ["Reading", "/en/reading/"]
          ] },
          { id: "systemFooterTools", title: "Tools", links: [
            ["Assess an AI project", "/en/evaluate/"], ["Works council checklist", "/en/cse/#questions"],
            ["Pilot file", "/en/legal-governance/#dossier"], ["Prevention fact sheets", "/en/tools/prevention-fact-sheets/"]
          ] },
          { id: "systemFooterSite", title: "The site", links: [
            ["About", "/en/about/"], ["Publications", "/en/publications/"], ["Talks", "/en/actions/"],
            ["Newsletter", "https://substack.com/@charlesbroutin", true], ["LinkedIn", "https://www.linkedin.com/in/charles-broutin-a03932201", true]
          ] }
        ],
        privacy: ["Privacy", "/en/privacy/"],
        legal: ["Legal notice", "/en/legal-notice/"],
        cookies: "Cookie settings",
        external: "opens in a new tab",
        copyright: "© 2026 AI & Occupational Health — Independent editorial initiative."
      }
    }
  };

  const ICONS = {
    search: '<svg class="system-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 15.5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    chevron: '<svg class="system-nav-chevron" aria-hidden="true" focusable="false" viewBox="0 0 12 12" width="10" height="10"><path d="m2.5 4.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg class="system-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    external: '<svg class="system-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="12" height="12"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const escapeHtml = value => String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function activeKeyFor(path) {
    const rules = [
      [/^\/outils\/preconisations\//, "preconisations"],
      [/^\/outils\/claude-skills\//, "claude-skills"],
      [/^\/(?:outils\/fiches-prevention|en\/tools\/prevention-fact-sheets)\//, "fiches-prevention"],
      [/^\/outils\//, "tools"],
      [/^\/(?:en\/)?publications\//, "publications"],
      [/^\/(?:en\/)?actions\//, "actions"],
      [/^\/(?:en\/understand|comprendre)\//, "understand"],
      [/^\/(?:en\/risks(?:-prevention)?|risques-prevention)\//, "risks"],
      [/^\/(?:en\/evaluate|evaluer)\//, "evaluate"],
      [/^\/(?:en\/legal-governance|droit-gouvernance)\//, "governance"],
      [/^\/(?:en\/)?cse\//, "cse"],
      [/^\/(?:en\/uses-and-field\/occupational-health-example|ia-en-spst)\//, "spst"],
      [/^\/(?:en\/reading|lecture)\//, "reading"],
      [/^\/(?:en\/about|a-propos)\//, "about"]
    ];
    const match = rules.find(([pattern]) => pattern.test(path));
    return match ? match[1] : "";
  }

  // The equivalent page in the other language, or that language's homepage when there is none.
  function translationFor(path, isEnglish) {
    if (!isEnglish) return PAIRS[path] ? { url: PAIRS[path], exact: true } : { url: "/en/", exact: false };
    const reverse = Object.fromEntries(Object.entries(PAIRS).map(([fr, en]) => [en, fr]));
    return reverse[path] ? { url: reverse[path], exact: true } : { url: "/", exact: false };
  }

  function renderNavigationShell(pathname, isEnglish, pageNavMarkup = "") {
    const path = pathname.replace(/\/index\.html$/, "/");
    const site = isEnglish ? SITE.en : SITE.fr;
    const activeKey = activeKeyFor(path);
    const translation = translationFor(path, isEnglish);
    const translationUrl = translation.url;
    const languageLabel = translation.exact ? site.language.label : site.language.homeLabel;
    const languageFooter = translation.exact ? site.language.footer : site.language.homeFooter;
    const isHome = path === site.home;
    // A link to a section of another page (#…) is never the current page.
    const current = (key, href) => key === activeKey && !href.includes("#") ? ' aria-current="page"' : "";

    const describedLink = item => `<a href="${item.href}"${current(item.key, item.href)}><span class="system-nav-title">${escapeHtml(item.label)}</span><span class="system-nav-desc">${escapeHtml(item.desc)}</span></a>`;

    const desktopItems = site.items.map(item => {
      if (!item.children) return `<a class="system-nav-link" href="${item.href}"${current(item.key, item.href)}>${escapeHtml(item.label)}</a>`;
      const isCurrent = item.children.some(child => child.key === activeKey && !child.href.includes("#")) || (item.all && item.all.key === activeKey);
      const all = item.all ? `<a class="system-nav-all" href="${item.all.href}"${current(item.all.key, item.all.href)}>${escapeHtml(item.all.label)} ${ICONS.arrow}</a>` : "";
      return `<details class="system-nav-group${isCurrent ? " is-current" : ""}"><summary>${escapeHtml(item.label)}${ICONS.chevron}</summary><div class="system-nav-dropdown${item.wide ? " is-wide" : ""}"><ul class="system-nav-list">${item.children.map(child => `<li>${describedLink(child)}</li>`).join("")}</ul>${all}</div></details>`;
    }).join("");

    const mobileItems = site.items.map(item => {
      if (!item.children) return `<a class="system-mobile-link" href="${item.href}"${current(item.key, item.href)}>${escapeHtml(item.label)}</a>`;
      const headingId = `systemMobile-${item.key}`;
      const all = item.all ? `<a class="system-mobile-all" href="${item.all.href}"${current(item.all.key, item.all.href)}>${escapeHtml(item.all.label)} ${ICONS.arrow}</a>` : "";
      return `<section class="system-mobile-group" aria-labelledby="${headingId}"><h2 id="${headingId}">${escapeHtml(item.label)}</h2><ul class="system-nav-list">${item.children.map(child => `<li>${describedLink(child)}</li>`).join("")}</ul>${all}</section>`;
    }).join("");

    const searchButton = `<button type="button" class="system-search-button" data-site-search aria-label="${escapeHtml(site.searchLong)}" title="${escapeHtml(site.searchLong)} (Ctrl K)">${ICONS.search}<span class="system-search-text">${escapeHtml(site.searchShort)}</span></button>`;

    const headerMarkup = `
    <nav class="system-nav" aria-label="${escapeHtml(site.mainLabel)}">
      <a class="system-brand" href="${site.home}"${isHome ? ' aria-current="page"' : ""} aria-label="${escapeHtml(site.brand.label)}">
        <span class="system-brand-mark" aria-hidden="true"></span>
        <span class="system-brand-copy"><strong>${escapeHtml(site.brand.name)}</strong><small>${escapeHtml(site.brand.tagline)}</small></span>
      </a>
      <div class="system-desktop-navigation"><div class="system-primary-links">${desktopItems}</div></div>
      <div class="system-nav-actions">
        ${searchButton}
        <a class="system-language-switch" href="${translationUrl}" lang="${site.language.lang}" hreflang="${site.language.lang}" aria-label="${escapeHtml(languageLabel)}" title="${escapeHtml(languageLabel)}">${site.language.code}</a>
        <button class="system-menu-button" type="button" aria-controls="systemMobilePanel" aria-expanded="false">${escapeHtml(site.menu)}</button>
      </div>
      <div class="system-mobile-panel" id="systemMobilePanel" aria-hidden="true">
        <div class="system-mobile-inner">
          <button type="button" class="system-mobile-search" data-site-search>${escapeHtml(site.searchLong)} ${ICONS.search}</button>
          ${mobileItems}
        </div>
      </div>
    </nav>${pageNavMarkup}`;

    const footerLink = ([label, href, external]) => external
      ? `<li><a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)} (${escapeHtml(site.footer.external)})">${escapeHtml(label)} ${ICONS.external}</a></li>`
      : `<li><a href="${href}"${current(activeKeyFor(href), href)}>${escapeHtml(label)}</a></li>`;

    const footerMarkup = `
    <div class="system-footer-grid">
      <div class="system-footer-intro"><a class="system-brand" href="${site.home}" aria-label="${escapeHtml(site.brand.label)}"><span class="system-brand-mark" aria-hidden="true"></span><span class="system-brand-copy"><strong>${escapeHtml(site.brand.name)}</strong></span></a><p>${escapeHtml(site.footer.tagline)}</p></div>
      ${site.footer.groups.map(group => `<nav class="system-footer-group" aria-labelledby="${group.id}"><h2 id="${group.id}">${escapeHtml(group.title)}</h2><ul>${group.links.map(footerLink).join("")}</ul></nav>`).join("\n      ")}
    </div>
    <div class="system-footer-bottom">
      <span>${escapeHtml(site.footer.copyright)}</span>
      <span class="system-footer-legal"><a href="${translationUrl}" lang="${site.language.lang}" hreflang="${site.language.lang}">${escapeHtml(languageFooter)}</a><a href="${site.footer.privacy[1]}">${escapeHtml(site.footer.privacy[0])}</a><a href="${site.footer.legal[1]}">${escapeHtml(site.footer.legal[0])}</a><button type="button" data-consent-open>${escapeHtml(site.footer.cookies)}</button></span>
    </div>`;

    return {
      headerMarkup,
      footerMarkup,
      headerOpen: `<header class="site-system-header" id="site-header" data-navigation-version="${NAVIGATION_VERSION}">`,
      footerOpen: `<footer class="site-system-footer" id="site-footer" data-navigation-version="${NAVIGATION_VERSION}">`
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { renderNavigationShell, NAVIGATION_VERSION, PAIRS, SITE };
    return;
  }

  if (window.__IASTShellReady) return;
  window.__IASTShellReady = true;

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  // Old addresses that pointed to sections now published as their own pages.
  if (path === "/evaluer/" && window.location.hash === "#preconisations") {
    window.location.replace("/outils/preconisations/");
    return;
  }
  if (path === "/a-propos/" && ["#publications", "#actions-menees"].includes(window.location.hash)) {
    window.location.replace(window.location.hash === "#publications" ? "/publications/" : "/actions/");
    return;
  }
  if (path === "/en/about/" && ["#publications", "#actions-menees", "#activities"].includes(window.location.hash)) {
    window.location.replace(window.location.hash === "#publications" ? "/en/publications/" : "/en/actions/");
    return;
  }
  // Sections of the former homepage (/#comprendre, /#legislation…) now have their own pages.
  if (path === "/" && window.location.hash) {
    const formerSections = {
      comprendre: "/comprendre/", pratique: "/evaluer/", terrain: "/evaluer/", evaluer: "/evaluer/",
      modeles: "/comprendre/#benchmarks", risques: "/risques-prevention/", legislation: "/droit-gouvernance/",
      apropos: "/a-propos/", mentions: "/mentions-legales/", confidentialite: "/confidentialite/"
    };
    let fragment = "";
    try { fragment = decodeURIComponent(window.location.hash.slice(1)); } catch { /* malformed */ }
    const owner = Object.keys(formerSections).find(key => fragment === key || fragment.startsWith(`${key}-`));
    if (owner && !document.getElementById(fragment)) {
      window.location.replace(formerSections[owner]);
      return;
    }
  }
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en") || path.startsWith("/en/");

  if (["/confidentialite/", "/mentions-legales/", "/en/privacy/", "/en/legal-notice/"].includes(path)) {
    document.body.classList.add("page-shell-v2", "legal-refresh");
  }

  // Pages whose static shell is older than this version are rebuilt here, keeping their page contents bar.
  const existingHeader = document.querySelector("body > header.site-header, body > header.site-system-header") || document.querySelector("body > nav.nav");
  const hasStaticHeader = existingHeader?.dataset.navigationVersion === NAVIGATION_VERSION;
  let header = existingHeader;
  if (!hasStaticHeader) {
    const existingPageNav = existingHeader?.querySelector(".page-nav");
    const legacyPageToc = document.querySelector("main .page-toc");
    const legacyPageLinks = [...(legacyPageToc?.querySelectorAll('a[href^="#"]') || [])]
      .map(link => `<a href="${link.getAttribute("href")}">${escapeHtml(link.textContent.trim())}</a>`)
      .join("");
    const pageNavMarkup = existingPageNav
      ? existingPageNav.outerHTML
      : legacyPageLinks
        ? `<nav class="page-nav" aria-label="${isEnglish ? "Page contents" : "Sommaire de la page"}"><div class="page-nav-inner"><span class="page-nav-label">${isEnglish ? "On this page" : "Sur cette page"}</span><div class="page-nav-links">${legacyPageLinks}</div><span class="page-progress" aria-hidden="true"><i></i></span></div></nav>`
        : "";
    if (legacyPageToc && !existingPageNav) legacyPageToc.remove();
    const { headerMarkup } = renderNavigationShell(path, isEnglish, pageNavMarkup);
    header = document.createElement("header");
    header.className = "site-system-header";
    header.id = "site-header";
    header.dataset.navigationVersion = NAVIGATION_VERSION;
    header.innerHTML = headerMarkup;
    if (existingHeader) existingHeader.replaceWith(header);
    else document.body.insertBefore(header, document.body.firstChild?.nextSibling || document.body.firstChild);
  }
  header.querySelectorAll("[data-site-search]").forEach(button => { button.hidden = false; });

  const dropdowns = [...header.querySelectorAll(".system-nav-group")];
  const closeDropdowns = () => dropdowns.forEach(group => { group.open = false; });
  dropdowns.forEach(group => {
    group.addEventListener("toggle", () => {
      if (group.open) dropdowns.forEach(other => { if (other !== group) other.open = false; });
    });
    group.addEventListener("focusout", event => {
      const next = event.relatedTarget;
      if (next && group.contains(next)) return;
      // Focus going nowhere while the pointer is over the panel: a click on its padding.
      if (!next && group.matches(":hover")) return;
      requestAnimationFrame(() => {
        if (!group.contains(document.activeElement)) group.open = false;
      });
    });
    group.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { group.open = false; }));
  });
  header.addEventListener("keydown", event => {
    const group = event.target.closest(".system-nav-group");
    if (event.key === "Escape" && group?.open) {
      event.stopPropagation();
      group.open = false;
      group.querySelector("summary").focus();
    }
  });

  const menuButton = header.querySelector(".system-menu-button");
  const mobilePanel = header.querySelector(".system-mobile-panel");
  const inertedByMenu = new Set();
  const closeMenu = (restoreFocus = false) => {
    closeDropdowns();
    if (!menuButton || !mobilePanel) return;
    inertedByMenu.forEach(element => { element.inert = false; });
    inertedByMenu.clear();
    menuButton.textContent = isEnglish ? "Menu" : "Menu";
    header.classList.remove("is-open");
    document.body.classList.remove("system-menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobilePanel.setAttribute("aria-hidden", "true");
    if (restoreFocus) menuButton.focus();
  };
  const openMenu = () => {
    // Everything outside the header (page, skip link, banners, dialogs) is out of reach while the menu is open.
    [...document.body.children].forEach(element => {
      if (element === header || element.matches("script, style, link, template, noscript") || element.inert) return;
      element.inert = true;
      inertedByMenu.add(element);
    });
    menuButton.textContent = isEnglish ? "Close" : "Fermer";
    header.classList.add("is-open");
    document.body.classList.add("system-menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    mobilePanel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => mobilePanel.querySelector("a, button")?.focus());
  };

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => header.classList.contains("is-open") ? closeMenu() : openMenu());
    mobilePanel.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
    window.matchMedia("(min-width: 1121px)").addEventListener?.("change", () => closeMenu());
  }
  document.addEventListener("click", event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && header.classList.contains("is-open")) closeMenu(true); });

  header.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !header.classList.contains("is-open")) return;
    const focusable = [...header.querySelectorAll("a[href], button")].filter(element => element.getClientRects().length && !element.disabled);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener("iast:close-menu", () => closeMenu());

  const pageNav = header.querySelector(".page-nav");
  const pageNavLabel = pageNav?.querySelector(".page-nav-label");
  const pageNavLinks = [...(pageNav?.querySelectorAll('.page-nav-links a[href^="#"]') || [])];
  const pageProgress = pageNav?.querySelector(".page-progress i");

  if (pageNav && pageNavLabel) {
    const linksId = pageNav.querySelector(".page-nav-links")?.id || "pageNavLinks";
    pageNav.querySelector(".page-nav-links")?.setAttribute("id", linksId);
    const tocMedia = window.matchMedia("(max-width: 760px)");
    const updateTocControl = () => {
      if (tocMedia.matches) { pageNavLabel.setAttribute("role", "button"); pageNavLabel.tabIndex = 0; pageNavLabel.setAttribute("aria-expanded", String(pageNav.classList.contains("is-open"))); }
      else { pageNavLabel.removeAttribute("role"); pageNavLabel.removeAttribute("tabindex"); pageNavLabel.removeAttribute("aria-expanded"); pageNav.classList.remove("is-open"); }
    };
    tocMedia.addEventListener("change", updateTocControl);
    pageNavLabel.setAttribute("aria-controls", linksId);
    updateTocControl();
    const togglePageNav = () => {
      if (!tocMedia.matches) return;
      const open = pageNav.classList.toggle("is-open");
      pageNavLabel.setAttribute("aria-expanded", String(open));
    };
    pageNavLabel.addEventListener("click", togglePageNav);
    pageNav.addEventListener("keydown", event => {
      if (event.key === "Escape" && pageNav.classList.contains("is-open")) {
        event.stopPropagation(); pageNav.classList.remove("is-open"); pageNavLabel.setAttribute("aria-expanded", "false"); pageNavLabel.focus();
      }
    });
    pageNavLabel.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePageNav();
      }
    });
    pageNavLinks.forEach(link => link.addEventListener("click", () => {
      pageNav.classList.remove("is-open");
      if (tocMedia.matches) pageNavLabel.setAttribute("aria-expanded", "false");
    }));
  }

  // Where am I? Phones show the current section next to the collapsed "On this page" label;
  // wider screens keep the current link in view when the bar scrolls sideways.
  const pageNavLinksBox = pageNav?.querySelector(".page-nav-links");
  const pageNavCurrent = pageNavLabel && pageNavLinks.length ? document.createElement("span") : null;
  if (pageNavCurrent) {
    pageNavCurrent.className = "page-nav-current";
    pageNavLabel.append(pageNavCurrent);
  }
  const updateLinksOverflow = () => {
    if (!pageNavLinksBox) return;
    const { scrollLeft, scrollWidth, clientWidth } = pageNavLinksBox;
    pageNavLinksBox.classList.toggle("has-more-before", scrollLeft > 2);
    pageNavLinksBox.classList.toggle("has-more-after", scrollLeft + clientWidth < scrollWidth - 2);
  };
  if (pageNavLinksBox) {
    pageNavLinksBox.addEventListener("scroll", updateLinksOverflow, { passive: true });
    window.addEventListener("resize", updateLinksOverflow);
    updateLinksOverflow();
    // A mouse wheel over the bar scrolls its links sideways, then the page once an end is reached.
    pageNavLinksBox.addEventListener("wheel", event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = pageNavLinksBox.scrollWidth - pageNavLinksBox.clientWidth;
      if (max <= 0 || getComputedStyle(pageNavLinksBox).overflowX === "visible") return;
      const next = Math.max(0, Math.min(max, pageNavLinksBox.scrollLeft + event.deltaY));
      if (Math.abs(next - pageNavLinksBox.scrollLeft) < 1) return;
      event.preventDefault();
      pageNavLinksBox.scrollLeft = next;
    }, { passive: false });
  }
  const FADE = 56; // width of the faded edges (unified-navigation.css)
  let activeSectionId = null;
  const setActiveSection = id => {
    if (id === activeSectionId) return;
    activeSectionId = id;
    let activeLink = null;
    pageNavLinks.forEach(link => {
      if (link.getAttribute("href") === `#${id}`) { link.setAttribute("aria-current", "location"); activeLink = link; }
      else link.removeAttribute("aria-current");
    });
    if (pageNavCurrent) pageNavCurrent.textContent = activeLink ? activeLink.textContent.trim() : "";
    if (activeLink && pageNavLinksBox && pageNavLinksBox.scrollWidth > pageNavLinksBox.clientWidth) {
      const box = pageNavLinksBox.getBoundingClientRect();
      const link = activeLink.getBoundingClientRect();
      // Keep the current link clear of the faded edges.
      if (link.left < box.left + FADE || link.right > box.right - FADE) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        pageNavLinksBox.scrollTo({ left: pageNavLinksBox.scrollLeft + link.left - box.left - FADE - 16, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  };
  const sections = pageNavLinks.map(link => {
    try { return document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return null; }
  }).filter(Boolean);
  let framePending = false;
  const updateReadingPosition = () => {
    framePending = false;
    // A little more than the anchor offset, so a section reached from a link counts as current.
    const threshold = header.getBoundingClientRect().height + 40;
    // The section that started last above the threshold (sections can be nested, as on /evaluer/).
    let currentSection = "";
    let currentTop = -Infinity;
    for (const section of sections) {
      if (!section.getClientRects().length) continue; // hidden, e.g. inside a closed <details>
      const top = section.getBoundingClientRect().top;
      if (top <= threshold && top >= currentTop) { currentSection = section.id; currentTop = top; }
    }
    // At the very end of the page, the last sections can no longer reach the top: the last one in view is current.
    if (sections.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      const inView = sections.filter(section => section.getClientRects().length && section.getBoundingClientRect().top < window.innerHeight);
      if (inView.length) currentSection = inView[inView.length - 1].id;
    }
    setActiveSection(currentSection);
    if (pageProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      pageProgress.style.width = `${scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0}%`;
    }
  };
  const scheduleReadingPosition = () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateReadingPosition); }
  };
  if (sections.length || pageProgress) {
    window.addEventListener("scroll", scheduleReadingPosition, { passive: true });
    window.addEventListener("resize", scheduleReadingPosition);
    window.addEventListener("load", scheduleReadingPosition);
    scheduleReadingPosition();
  }

  // Links to a section hidden in a closed <details> open it first.
  const targetOf = hash => {
    if (!hash || hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return null; }
  };
  const openDetailsAround = target => {
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === "DETAILS" && !node.open) node.open = true;
    }
  };
  document.addEventListener("click", event => {
    const link = event.target?.closest?.('a[href^="#"]');
    if (link) openDetailsAround(targetOf(link.getAttribute("href")));
  }, true);
  window.addEventListener("hashchange", () => openDetailsAround(targetOf(window.location.hash)));

  // Opened at an address ending in #section: fonts and figures can still change the layout after the
  // browser has jumped there. Jump again once they are in place, unless the reader has already moved.
  const initialTarget = targetOf(window.location.hash);
  if (initialTarget) {
    openDetailsAround(initialTarget);
    let readerMoved = false;
    const markMoved = () => { readerMoved = true; };
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(type => window.addEventListener(type, markMoved, { once: true, passive: true }));
    const settle = () => {
      if (readerMoved || !initialTarget.isConnected) return;
      const offset = parseFloat(getComputedStyle(initialTarget).scrollMarginTop) || 0;
      if (Math.abs(initialTarget.getBoundingClientRect().top - offset) > 4) initialTarget.scrollIntoView({ block: "start", behavior: "instant" });
    };
    document.fonts?.ready?.then(() => requestAnimationFrame(settle));
    window.addEventListener("load", () => requestAnimationFrame(settle), { once: true });
  }

  const existingFooter = document.querySelector("body > footer.site-system-footer, body > footer.site-footer, body > footer:last-of-type");
  if (existingFooter?.dataset.navigationVersion !== NAVIGATION_VERSION) {
    const { footerMarkup } = renderNavigationShell(path, isEnglish);
    const footer = document.createElement("footer");
    footer.className = "site-system-footer";
    footer.id = "site-footer";
    footer.dataset.navigationVersion = NAVIGATION_VERSION;
    footer.innerHTML = footerMarkup;
    if (existingFooter && existingFooter.parentElement === document.body) existingFooter.replaceWith(footer);
    else document.body.appendChild(footer);
  }

  document.querySelectorAll(".reveal").forEach(element => element.classList.add("in"));
  document.documentElement.classList.add("site-system-ready");
})();
