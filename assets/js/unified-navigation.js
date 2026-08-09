(() => {
  "use strict";

  if (window.__IASTShellReady) return;
  window.__IASTShellReady = true;

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en") || path.startsWith("/en/");

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
    "/a-propos/": "/en/about/",
    "/ressources/modeles/": "/en/resources/models/",
    "/mentions-legales/": "/en/legal-notice/",
    "/confidentialite/": "/en/privacy/"
  };

  const reversePairs = Object.fromEntries(Object.entries(pairs).map(([fr, en]) => [en, fr]));
  const translationUrl = isEnglish ? (reversePairs[path] || "/") : (pairs[path] || "/en/");

  const primary = isEnglish ? [
    ["Understand", "/en/understand/", "understand"],
    ["Uses & field", "/en/uses-and-field/", "uses"],
    ["Risks & prevention", "/en/risks-prevention/", "risks"],
    ["Assess", "/en/evaluate/", "evaluate"],
    ["Law & governance", "/en/legal-governance/", "governance"]
  ] : [
    ["Comprendre", "/comprendre/", "understand"],
    ["Usages & terrain", "/usages-terrain/", "uses"],
    ["Risques & prévention", "/risques-prevention/", "risks"],
    ["Évaluer", "/evaluer/", "evaluate"],
    ["Droit & gouvernance", "/droit-gouvernance/", "governance"]
  ];

  const resources = isEnglish ? [
    ["AI safety & AGI", "/en/ai-safety-agi/"],
    ["AI in OHS services", "/en/uses-and-field/occupational-health-example/"],
    ["Model landscape", "/en/resources/models/"],
    ["About", "/en/about/"]
  ] : [
    ["AI safety & AGI", "/ai-safety-agi/"],
    ["L’IA dans les SPSTI", "/usages-terrain/exemple-sante-travail/"],
    ["Panorama des modèles", "/ressources/modeles/"],
    ["À propos", "/a-propos/"]
  ];

  const activeKey = (() => {
    if (/^\/(?:en\/)?(?:understand|comprendre)/.test(path)) return "understand";
    if (/^\/(?:en\/uses-and-field|usages-terrain)/.test(path)) return "uses";
    if (/^\/(?:en\/risks-prevention|risques-prevention)/.test(path)) return "risks";
    if (/^\/(?:en\/evaluate|evaluer)/.test(path)) return "evaluate";
    if (/^\/(?:en\/legal-governance|droit-gouvernance)/.test(path)) return "governance";
    return "";
  })();

  const activeAttribute = (key) => key === activeKey ? ' aria-current="page"' : "";
  const primaryLinks = primary.map(([label, href, key]) => `<a href="${href}"${activeAttribute(key)}>${label}</a>`).join("");
  const resourceLinks = resources.map(([label, href]) => `<a href="${href}"${path === href ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const existingHeader = document.querySelector("body > header.site-header, body > header.site-system-header") || document.querySelector("body > nav.nav");
  const existingPageNav = existingHeader?.querySelector(".page-nav");
  const pageNavMarkup = existingPageNav ? existingPageNav.outerHTML : "";

  const header = document.createElement("header");
  header.className = "site-system-header";
  header.innerHTML = `
    <nav class="system-nav" aria-label="${isEnglish ? "Main navigation" : "Navigation principale"}">
      <a class="system-brand" href="${isEnglish ? "/en/" : "/"}" aria-label="${isEnglish ? "AI & Occupational Health, home" : "IA et Santé au Travail, accueil"}">
        <span class="system-brand-mark" aria-hidden="true"></span>
        <span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong><small>${isEnglish ? "Prevention · Real work" : "Prévention · Travail réel"}</small></span>
      </a>
      <div class="system-desktop-navigation">
        <div class="system-primary-links">${primaryLinks}</div>
        <details class="system-resources">
          <summary>${isEnglish ? "Resources" : "Ressources"}</summary>
          <div class="system-resources-menu">${resourceLinks}</div>
        </details>
        <a class="system-nav-cta" href="${isEnglish ? "/en/evaluate/impact/" : "/evaluer/impact/"}">${isEnglish ? "Assess a project" : "Évaluer un projet"}</a>
      </div>
      <a class="system-language-switch" href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}" aria-label="${isEnglish ? "View this page in French" : "View this page in English"}">${isEnglish ? "FR" : "EN"}</a>
      <button class="system-menu-button" type="button" aria-controls="systemMobilePanel" aria-expanded="false">Menu</button>
      <div class="system-mobile-panel" id="systemMobilePanel" aria-hidden="true">
        <div class="system-mobile-group"><span class="system-mobile-label">${isEnglish ? "Main" : "Principal"}</span>${primaryLinks}</div>
        <div class="system-mobile-group"><span class="system-mobile-label">${isEnglish ? "Resources" : "Ressources"}</span>${resourceLinks}</div>
        <a class="system-mobile-cta" href="${isEnglish ? "/en/evaluate/impact/" : "/evaluer/impact/"}">${isEnglish ? "Assess a project" : "Évaluer un projet"}</a>
      </div>
    </nav>${pageNavMarkup}`;

  if (existingHeader) existingHeader.replaceWith(header);
  else document.body.insertBefore(header, document.body.firstChild?.nextSibling || document.body.firstChild);

  const menuButton = header.querySelector(".system-menu-button");
  const mobilePanel = header.querySelector(".system-mobile-panel");
  const resourcesDetails = header.querySelector(".system-resources");

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

  document.addEventListener("click", event => {
    if (!header.contains(event.target)) {
      closeMenu();
      resourcesDetails.removeAttribute("open");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (header.classList.contains("is-open")) closeMenu(true);
    resourcesDetails.removeAttribute("open");
  });

  window.matchMedia("(min-width: 1181px)").addEventListener?.("change", event => {
    if (event.matches) closeMenu();
  });

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

  const setActiveSection = (id) => pageNavLinks.forEach(link => {
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
      <div>
        <a class="system-brand" href="${isEnglish ? "/en/" : "/"}"><span class="system-brand-mark" aria-hidden="true"></span><span class="system-brand-copy"><strong>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</strong></span></a>
        <p>${isEnglish ? "Independent, sourced and dated guidance for understanding, assessing and governing AI through real work." : "Des repères indépendants, sourcés et datés pour comprendre, évaluer et encadrer l’IA à partir du travail réel."}</p>
      </div>
      <div><h2>${isEnglish ? "Pathways" : "Parcours"}</h2><ul>${primary.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>
      <div><h2>${isEnglish ? "Resources" : "Ressources"}</h2><ul>${resources.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>
      <div><h2>Contact</h2><ul>
        <li><a href="https://www.linkedin.com/in/charles-broutin-a03932201" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
        <li><a href="https://substack.com/@charlesbroutin" target="_blank" rel="noopener noreferrer">${isEnglish ? "Newsletter" : "Newsletter"} ↗</a></li>
        <li><a href="${translationUrl}" lang="${isEnglish ? "fr" : "en"}" hreflang="${isEnglish ? "fr" : "en"}">${isEnglish ? "Version française" : "English version"}</a></li>
        <li><a href="${isEnglish ? "/en/privacy/" : "/confidentialite/"}">${isEnglish ? "Privacy" : "Confidentialité"}</a></li>
      </ul></div>
    </div>
    <div class="system-footer-bottom"><span>© 2026 ${isEnglish ? "AI & Occupational Health — Independent editorial initiative." : "IA & Santé au Travail — Initiative éditoriale indépendante."}</span><span>${isEnglish ? "Thomas Cole paintings · public domain" : "Œuvres de Thomas Cole · domaine public"}</span></div>`;

  const existingFooter = document.querySelector("body > footer");
  if (existingFooter) existingFooter.replaceWith(footer);
  else document.body.appendChild(footer);

  document.querySelectorAll(".reveal").forEach(element => element.classList.add("in"));
  document.documentElement.classList.add("site-system-ready");
})();
