(() => {
  "use strict";
  // Shared by the static build and browser enhancement: one source of navigation links.
  function renderNavigationShell(pathname, isEnglish, pageNavMarkup = "") {
  const path = pathname.replace(/\/index\.html$/, "/");
  const pairs = {
    "/": "/en/",
    "/comprendre/": "/en/understand/",
    "/risques-prevention/": "/en/risks/",
    "/ia-en-spst/": "/en/uses-and-field/occupational-health-example/",
    "/risques-prevention/psychosociaux/": "/en/risks-prevention/",
    "/risques-prevention/economique-social/": "/en/risks/economic-social/",
    "/evaluer/": "/en/evaluate/",
    "/evaluer/impact/": "/en/evaluate/impact/",
    "/evaluer/impact/suivi.html": "/en/evaluate/impact/follow-up.html",
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
    "/actions/": "/en/actions/",
    "/ressources/modeles/": "/en/resources/models/",
    "/mentions-legales/": "/en/legal-notice/",
    "/confidentialite/": "/en/privacy/"
  };

  const reversePairs = Object.fromEntries(Object.entries(pairs).map(([fr, en]) => [en, fr]));
  const mergedFrenchDestinations = {
    "/en/uses-and-field/": "/evaluer/",
    "/en/uses-and-field/before-deployment/": "/evaluer/#avant",
    "/en/uses-and-field/after-deployment/": "/evaluer/#apres"
  };
  const isResearchPath = /^\/(?:en\/)?research\//.test(path);
  const researchTranslationUrl = isEnglish ? path.replace(/^\/en/, "") : `/en${path}`;
  const translationUrl = isResearchPath
    ? researchTranslationUrl
    : isEnglish ? (reversePairs[path] || mergedFrenchDestinations[path] || "/") : (pairs[path] || "/en/");

  const primary = isEnglish ? [
    ["Understand", "/en/understand/", "understand"],
    ["Occupational risks", "/en/risks/", "risks"],
    ["AI in OHS services", "/en/uses-and-field/occupational-health-example/", "spsti"],
    ["Governance", "/en/legal-governance/", "governance"],
    ["CSE", "/en/cse/", "cse"],
    ["Assess & deploy", "/en/evaluate/", "evaluate"],
    ["Publications", "/en/publications/", "publications"],
    ["Activities", "/en/actions/", "actions"],
    ["Reading", "/en/reading/", "reading"],
    ["About", "/en/about/", "about"]
  ] : [
    ["Comprendre", "/comprendre/", "understand"],
    ["Risques", "/risques-prevention/", "risks"],
    ["IA en SPST", "/ia-en-spst/", "spsti"],
    ["Gouvernance", "/droit-gouvernance/", "governance"],
    ["CSE", "/cse/", "cse"],
    ["Outils", "/outils/", "tools"],
    ["Préconisations", "/outils/preconisations/", "preconisations"],
    ["Évaluer le déploiement", "/evaluer/", "evaluate"],
    ["Publications", "/publications/", "publications"],
    ["Actions", "/actions/", "actions"],
    ["Lectures", "/lecture/", "reading"],
    ["À propos", "/a-propos/", "about"]
  ];

  const activeKey = (() => {
    if (path.startsWith("/outils/preconisations/")) return "preconisations";
    if (path.startsWith("/outils/")) return "tools";
    if (/^\/(?:en\/)?publications\//.test(path)) return "publications";
    if (/^\/(?:en\/)?actions\//.test(path)) return "actions";
    if (/^\/(?:en\/)?(?:understand|comprendre)/.test(path)) return "understand";
    if (/^\/(?:en\/risks(?:-prevention|\/)|risques-prevention)/.test(path)) return "risks";
    if (/^\/(?:en\/evaluate|evaluer)/.test(path)) return "evaluate";
    if (/^\/(?:en\/legal-governance|droit-gouvernance)/.test(path)) return "governance";
    if (/^\/(?:en\/)?cse\//.test(path)) return "cse";
    if (/^\/(?:en\/uses-and-field\/occupational-health-example|ia-en-spst)/.test(path)) return "spsti";
    if (/^\/(?:en\/reading|lecture)\//.test(path)) return "reading";
    if (/^\/(?:en\/about|a-propos)/.test(path)) return "about";
    return "";
  })();

  const activeAttribute = key => key === activeKey ? ' aria-current="page"' : "";
  const homeAttribute = path === (isEnglish ? "/en/" : "/") ? ' aria-current="page"' : "";
  const navigationGroups = [
    { label: isEnglish ? "Knowledge" : "Connaissances", key: "knowledge", links: primary.filter(([, , key]) => ["understand", "risks", "spsti", "governance", "cse"].includes(key)) },
    isEnglish
      ? { link: ["Tools", "/en/evaluate/", "evaluate"] }
      : { label: "Outils", key: "tools", links: [["Tous les outils", "/outils/", "tools"], ["Préconisations", "/outils/preconisations/", "preconisations"], ["Évaluer le déploiement", "/evaluer/", "evaluate"]] },
    ...primary.filter(([, , key]) => ["publications", "actions", "reading", "about"].includes(key)).map(link => ({ link }))
  ];
  const renderPrimary = surface => navigationGroups.map(group => {
      if (group.link) {
        const [label, href, key] = group.link;
        return `<a href="${href}"${activeAttribute(key)}>${label}</a>`;
      }
      const current = group.links.some(([, , key]) => key === activeKey);
      return `<details class="system-nav-group${current ? " is-current" : ""}"><summary aria-controls="${surface}-${group.key}">${group.label}</summary><div class="system-nav-dropdown" id="${surface}-${group.key}">${group.key === "knowledge" ? `<button type="button" class="ux-search-open" data-site-search hidden>${isEnglish ? "Search the site" : "Rechercher dans le site"}<span aria-hidden="true">⌕</span></button>` : ""}${group.links.map(([label, href, key]) => `<a href="${href}"${activeAttribute(key)}>${label}</a>`).join("")}</div></details>`;
    }).join("");
  const primaryLinks = renderPrimary("desktop");
  const headerMarkup = `
    <nav class="system-nav" aria-label="${isEnglish ? "Main navigation" : "Navigation principale"}">
      <a class="system-brand" href="${isEnglish ? "/en/" : "/"}"${homeAttribute} aria-label="${isEnglish ? "AI & Occupational Health, home" : "IA et Santé au Travail, accueil"}">
        <span class="system-brand-mark" aria-hidden="true"></span>
        <span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong><small>${isEnglish ? "Independent publication" : "Publication indépendante"}</small></span>
      </a>
      <div class="system-desktop-navigation">
        <div class="system-primary-links">${primaryLinks}</div>
      </div>
      <a class="system-language-switch" href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}" aria-label="${isEnglish ? "View this page in French" : "View this page in English"}">${isEnglish ? "FR" : "EN"}</a>
      <button class="system-menu-button" type="button" aria-controls="systemMobilePanel" aria-expanded="false">Menu</button>
      <div class="system-mobile-panel" id="systemMobilePanel" aria-hidden="true">
        <div class="system-mobile-group"><span class="system-mobile-label">${isEnglish ? "Main" : "Principal"}</span>${renderPrimary("mobile")}</div>
      </div>
    </nav>${pageNavMarkup}`;
  const footerMarkup = `
    <div class="system-footer-grid">
      <div class="system-footer-intro"><a class="system-brand" href="${isEnglish ? "/en/" : "/"}"${homeAttribute}><span class="system-brand-mark" aria-hidden="true"></span><span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong></span></a><p>${isEnglish ? "Independent, sourced and dated perspectives for understanding how AI transforms real work and worker health." : "Des repères indépendants, sourcés et datés pour comprendre comment l’IA transforme le travail réel et la santé."}</p></div>
      <nav class="system-footer-group system-footer-pathways" aria-labelledby="systemFooterPathways"><h2 id="systemFooterPathways">${isEnglish ? "Pathways" : "Parcours"}</h2><ul>${primary.filter(([, , key]) => !["publications", "actions", "reading", "about"].includes(key)).map(([label, href, key]) => `<li><a href="${href}"${activeAttribute(key)}>${label}</a></li>`).join("")}</ul></nav>
      <nav class="system-footer-group system-footer-publication" aria-labelledby="systemFooterPublication"><h2 id="systemFooterPublication">Publication</h2><ul>${primary.filter(([, , key]) => ["publications", "actions", "reading", "about"].includes(key)).map(([label, href, key]) => `<li><a href="${href}"${activeAttribute(key)}>${label}</a></li>`).join("")}<li><a href="https://substack.com/@charlesbroutin" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? "Newsletter (opens in a new tab)" : "Newsletter (ouvre dans un nouvel onglet)"}">Newsletter <span aria-hidden="true">↗</span></a></li><li><a href="https://www.linkedin.com/in/charles-broutin-a03932201" target="_blank" rel="noopener noreferrer" aria-label="${isEnglish ? "LinkedIn (opens in a new tab)" : "LinkedIn (ouvre dans un nouvel onglet)"}">LinkedIn <span aria-hidden="true">↗</span></a></li></ul></nav>
      <nav class="system-footer-group system-footer-information" aria-labelledby="systemFooterInformation"><h2 id="systemFooterInformation">${isEnglish ? "Information" : "Informations"}</h2><ul><li><a href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}">${isEnglish ? "Version française" : "English version"}</a></li><li><a href="${isEnglish ? "/en/privacy/" : "/confidentialite/"}">${isEnglish ? "Privacy" : "Confidentialité"}</a></li><li><a href="${isEnglish ? "/en/legal-notice/" : "/mentions-legales/"}">${isEnglish ? "Legal notice" : "Mentions légales"}</a></li></ul></nav>
    </div>
    <div class="system-footer-bottom"><span>© 2026 ${isEnglish ? "AI & Occupational Health — Independent editorial initiative." : "IA & Santé au Travail — Initiative éditoriale indépendante."}</span></div>`;
  return { headerMarkup, footerMarkup };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { renderNavigationShell };
    return;
  }
(() => {
  "use strict";

  if (window.__IASTShellReady) return;
  window.__IASTShellReady = true;

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  // Préconisations now has its own page in Tools.
  if (path === "/evaluer/" && window.location.hash === "#preconisations") {
    window.location.replace("/outils/preconisations/");
    return;
  }
  // Preserve incoming links to the sections moved out of the About page.
  if (path === "/a-propos/" && ["#publications", "#actions-menees"].includes(window.location.hash)) {
    window.location.replace(window.location.hash === "#publications" ? "/publications/" : "/actions/");
    return;
  }
  if (path === "/en/about/" && ["#publications", "#actions-menees", "#activities"].includes(window.location.hash)) {
    window.location.replace(window.location.hash === "#publications" ? "/en/publications/" : "/en/actions/");
    return;
  }
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en") || path.startsWith("/en/");

  if (["/confidentialite/", "/mentions-legales/", "/en/privacy/", "/en/legal-notice/"].includes(path)) {
    document.body.classList.add("page-shell-v2", "legal-refresh");
  }

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

  const { headerMarkup, footerMarkup } = renderNavigationShell(path, isEnglish, pageNavMarkup);
  const hasStaticHeader = existingHeader?.dataset.navigationVersion === "6.1";
  const header = hasStaticHeader ? existingHeader : document.createElement("header");
  if (!hasStaticHeader) {
    header.className = "site-system-header";
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
    group.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!group.contains(document.activeElement)) group.open = false;
      });
    });
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
    inertedByMenu.forEach(element => { element.inert = false; });
    inertedByMenu.clear();
    menuButton.textContent = "Menu";
    closeDropdowns();
    header.classList.remove("is-open");
    document.body.classList.remove("system-menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobilePanel.setAttribute("aria-hidden", "true");
    if (restoreFocus) menuButton.focus();
  };
  const openMenu = () => {
    document.querySelectorAll("body > main, body > footer").forEach(element => {
      if (!element.inert) { element.inert = true; inertedByMenu.add(element); }
    });
    menuButton.textContent = isEnglish ? "Close" : "Fermer";
    header.classList.add("is-open");
    document.body.classList.add("system-menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    mobilePanel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => mobilePanel.querySelector("summary, a, button")?.focus());
  };

  menuButton.addEventListener("click", () => header.classList.contains("is-open") ? closeMenu() : openMenu());
  mobilePanel.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("click", event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && header.classList.contains("is-open")) closeMenu(true); });
  window.matchMedia("(min-width: 1121px)").addEventListener?.("change", event => { closeMenu(); });

  header.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !header.classList.contains("is-open")) return;
    const focusable = [...header.querySelectorAll('a[href], button, summary')].filter(element => element.getClientRects().length && !element.disabled);
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
    pageNavLabel.setAttribute("aria-expanded", "false");
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

  const setActiveSection = id => pageNavLinks.forEach(link => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const sections = pageNavLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  let framePending = false;
  const updateReadingPosition = () => {
    framePending = false;
    const threshold = header.getBoundingClientRect().height + 24;
    let current = "";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section.id;
    }
    setActiveSection(current);
    if (pageProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      pageProgress.style.width = `${scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0}%`;
    }
  };
  const scheduleReadingPosition = () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateReadingPosition); }
  };
  window.addEventListener("scroll", scheduleReadingPosition, { passive: true });
  window.addEventListener("resize", scheduleReadingPosition);
  window.addEventListener("load", scheduleReadingPosition);
  scheduleReadingPosition();

  const existingFooter = document.querySelector("body > footer");
  if (existingFooter?.dataset.navigationVersion !== "6.1") {
    const footer = document.createElement("footer");
    footer.className = "site-system-footer";
    footer.innerHTML = footerMarkup;
    if (existingFooter) existingFooter.replaceWith(footer);
    else document.body.appendChild(footer);
  }

  document.querySelectorAll(".reveal").forEach(element => element.classList.add("in"));
  document.documentElement.classList.add("site-system-ready");
})();

})();
