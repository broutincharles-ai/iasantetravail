(() => {
  "use strict";

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
    "/a-propos/": "/en/about/",
    "/ressources/modeles/": "/en/resources/models/",
    "/mises-a-jour/": "/en/updates/",
    "/mentions-legales/": "/en/legal-notice/",
    "/confidentialite/": "/en/privacy/"
  };
  const reversePairs = Object.fromEntries(Object.entries(pairs).map(([fr, en]) => [en, fr]));
  const currentFr = isEnglish ? (reversePairs[path] || "/") : path;
  const currentEn = isEnglish ? path : (pairs[path] || "/en/");

  const navItems = isEnglish ? [
    ["Understand", "/en/understand/", "understand"],
    ["Deploy", "/en/uses-and-field/", "deploy"],
    ["Risks", "/en/risks-prevention/", "risks"],
    ["Evaluate", "/en/evaluate/", "evaluate"],
    ["Governance", "/en/legal-governance/", "governance"],
    ["About", "/en/about/", "about"]
  ] : [
    ["Comprendre", "/comprendre/", "understand"],
    ["Déployer", "/usages-terrain/", "deploy"],
    ["Risques", "/risques-prevention/", "risks"],
    ["Évaluer", "/evaluer/", "evaluate"],
    ["Gouvernance", "/droit-gouvernance/", "governance"],
    ["À propos", "/a-propos/", "about"]
  ];

  const activeKey = (() => {
    if (/^\/en\/understand|^\/comprendre/.test(path)) return "understand";
    if (/^\/en\/uses-and-field|^\/usages-terrain/.test(path)) return "deploy";
    if (/^\/en\/risks-prevention|^\/risques-prevention/.test(path)) return "risks";
    if (/^\/en\/evaluate|^\/evaluer/.test(path)) return "evaluate";
    if (/^\/en\/legal-governance|^\/droit-gouvernance/.test(path)) return "governance";
    if (/^\/en\/about|^\/a-propos/.test(path)) return "about";
    return "";
  })();

  const resources = isEnglish ? [
    ["Model landscape", "/en/resources/models/"],
    ["Publications", "/en/about/#publications"],
    ["Sources & updates", "/en/updates/"],
    ["Newsletter", "/en/#newsletter"],
    ["Legal notice", "/en/legal-notice/"]
  ] : [
    ["Panorama des modèles", "/ressources/modeles/"],
    ["Publications", "/a-propos/#publications"],
    ["Sources et mises à jour", "/mises-a-jour/"],
    ["Newsletter", "/#newsletter"],
    ["Mentions légales", "/mentions-legales/"]
  ];

  const header = document.createElement("header");
  header.className = "site-system-header";
  header.innerHTML = `
    <nav class="system-nav wrap" aria-label="${isEnglish ? "Main navigation" : "Navigation principale"}">
      <a class="system-brand" href="${isEnglish ? "/en/" : "/"}" aria-label="${isEnglish ? "AI & Occupational Health, home" : "IA et Santé au Travail, accueil"}">
        <span class="system-brand-mark" aria-hidden="true"></span><span>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</span>
      </a>
      <div class="system-nav-links" id="systemNavLinks">
        ${navItems.map(([label, href, key]) => `<a href="${href}"${key === activeKey ? ' aria-current="page"' : ""} class="${key === "evaluate" ? "system-evaluate-link" : ""}">${label}</a>`).join("")}
        <details class="system-resources">
          <summary>${isEnglish ? "Resources" : "Ressources"}</summary>
          <div class="system-resources-menu">${resources.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div>
        </details>
      </div>
      <div class="system-nav-tools">
        <button class="system-search-button" type="button" aria-label="${isEnglish ? "Search the site" : "Rechercher sur le site"}">⌕</button>
        <div class="system-lang" aria-label="${isEnglish ? "Language" : "Choix de la langue"}">
          <a href="${currentFr}" lang="fr" hreflang="fr"${isEnglish ? "" : ' aria-current="page"'}>FR</a>
          <a href="${currentEn}" lang="en" hreflang="en"${isEnglish ? ' aria-current="page"' : ""}>EN</a>
        </div>
        <button class="system-menu-button" type="button" aria-controls="systemNavLinks" aria-expanded="false">${isEnglish ? "Menu" : "Menu"}</button>
      </div>
    </nav>`;

  const existingHeader = document.querySelector("body > header.site-header") || document.querySelector("body > nav.nav");
  if (existingHeader) existingHeader.replaceWith(header);
  else document.body.insertBefore(header, document.body.firstChild?.nextSibling || document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-system-footer";
  const pathways = navItems.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("");
  footer.innerHTML = `
    <div class="wrap system-footer-grid">
      <div>
        <a class="system-brand" href="${isEnglish ? "/en/" : "/"}"><span class="system-brand-mark" aria-hidden="true"></span><span>${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"}</span></a>
        <p>${isEnglish ? "Independent, sourced and dated guidance for understanding, assessing and governing AI through real work." : "Des repères indépendants, sourcés et datés pour comprendre, évaluer et encadrer l’IA à partir du travail réel."}</p>
      </div>
      <div><h2>${isEnglish ? "Pathways" : "Parcours"}</h2><ul>${pathways}</ul></div>
      <div><h2>${isEnglish ? "Resources" : "Ressources"}</h2><ul>${resources.slice(0, 4).map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>
      <div><h2>${isEnglish ? "Contact" : "Contact"}</h2><ul>
        <li><a href="https://www.linkedin.com/in/charles-broutin-a03932201" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
        <li><a href="https://substack.com/@charlesbroutin" target="_blank" rel="noopener noreferrer">Newsletter ↗</a></li>
        <li><a href="${isEnglish ? "/en/privacy/" : "/confidentialite/"}">${isEnglish ? "Privacy" : "Confidentialité"}</a></li>
      </ul></div>
    </div>
    <div class="wrap system-footer-bottom"><span>© 2026 ${isEnglish ? "AI & Occupational Health" : "IA & Santé au Travail"} — ${isEnglish ? "Independent editorial initiative." : "Initiative éditoriale indépendante."}</span><span>${isEnglish ? "Thomas Cole paintings · public domain" : "Œuvres de Thomas Cole · domaine public"}</span></div>`;

  const existingFooter = document.querySelector("body > footer");
  if (existingFooter) existingFooter.replaceWith(footer);
  else document.body.appendChild(footer);

  const deploymentSubpage = /^\/(?:usages-terrain\/(?:exemple-sante-travail|avant-deploiement|retours-terrain)|en\/uses-and-field\/(?:occupational-health-example|before-deployment|after-deployment))\/$/.test(path);
  if (deploymentSubpage) {
    const authorBlock = document.querySelector("main .author-byline, main .about-author-note");
    const decision = document.createElement("section");
    decision.className = "wrap source-list-visible";
    decision.setAttribute("aria-labelledby", "deployment-decision-title");
    decision.innerHTML = `<p class="freshness-line">${isEnglish ? "Decision gate" : "Porte de décision"}</p><h2 id="deployment-decision-title">${isEnglish ? "End with an explicit, revisable decision." : "Terminer par une décision explicite et révisable."}</h2><p>${isEnglish ? "Use the evidence gathered to test, frame, suspend, revise or abandon the use." : "Utiliser les éléments recueillis pour tester, encadrer, suspendre, réviser ou renoncer à l’usage."}</p><div class="decision-strip" aria-label="${isEnglish ? "Possible decisions" : "Décisions possibles"}"><span>${isEnglish ? "Test" : "Tester"}</span><span>${isEnglish ? "Frame" : "Encadrer"}</span><span>${isEnglish ? "Suspend" : "Suspendre"}</span><span>${isEnglish ? "Revise" : "Réviser"}</span><span>${isEnglish ? "Abandon" : "Renoncer"}</span></div>`;
    if (authorBlock) authorBlock.before(decision);
  }

  const assessmentPage = /^\/(?:evaluer\/impact\/(?:|suivi\.html)|en\/evaluate\/impact\/(?:|follow-up\.html))$/.test(path);
  if (assessmentPage) {
    const onboardingPoints = document.querySelector(".onboarding-points");
    if (onboardingPoints) {
      const method = document.createElement("details");
      method.className = "score-method-details";
      method.innerHTML = isEnglish
        ? `<summary>How are the score and vigilance levels calculated?</summary><div class="score-method-body"><p>Each answer is coded from 0 to 4. Scores are converted to 0–100 for each of nine equally weighted dimensions, then averaged. A higher value means more reported risk factors, observed deterioration or missing safeguards; it is not a probability, diagnosis or scientific precision measure. A critical answer can raise the effective level to High, and three critical signals raise it to Critical, even if the average is lower.</p><div class="score-explainer-grid"><div class="score-explainer-card"><strong>0–24</strong><span>Favourable / controlled</span></div><div class="score-explainer-card"><strong>25–44</strong><span>Vigilance</span></div><div class="score-explainer-card"><strong>45–64</strong><span>Significant</span></div><div class="score-explainer-card"><strong>65–79</strong><span>High</span></div><div class="score-explainer-card"><strong>80–100</strong><span>Critical</span></div></div></div>`
        : `<summary>Comment le score et les niveaux de vigilance sont-ils calculés&nbsp;?</summary><div class="score-method-body"><p>Chaque réponse est cotée de 0 à 4. Les réponses sont converties sur 100 pour chacune des neuf dimensions, pondérées à parts égales, puis moyennées. Une valeur élevée signale davantage de facteurs de risque, de dégradations observées ou de garde-fous absents ; ce n’est ni une probabilité, ni un diagnostic, ni une mesure d’une précision scientifique. Une réponse critique peut relever le niveau effectif à « élevé » et trois signaux critiques au niveau « critique », même si la moyenne est plus basse.</p><div class="score-explainer-grid"><div class="score-explainer-card"><strong>0–24</strong><span>Favorable / maîtrisé</span></div><div class="score-explainer-card"><strong>25–44</strong><span>Vigilance</span></div><div class="score-explainer-card"><strong>45–64</strong><span>Significatif</span></div><div class="score-explainer-card"><strong>65–79</strong><span>Élevé</span></div><div class="score-explainer-card"><strong>80–100</strong><span>Critique</span></div></div></div>`;
      onboardingPoints.after(method);
    }
    document.getElementById("printSimple")?.addEventListener("click", () => window.print());
  }

  const menuButton = header.querySelector(".system-menu-button");
  menuButton.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  header.querySelectorAll(".system-nav-links a").forEach(link => link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  header.querySelector(".system-search-button").addEventListener("click", () => {
    const dialog = document.getElementById("siteSearch");
    const modal = document.getElementById("searchModal");
    if (dialog && !dialog.open) {
      dialog.showModal();
      window.setTimeout(() => dialog.querySelector("input")?.focus(), 30);
    } else if (modal) {
      modal.hidden = false;
      document.body.classList.add("search-open");
      window.setTimeout(() => modal.querySelector("input")?.focus(), 30);
    } else {
      window.location.href = isEnglish ? "/en/#search" : "/#recherche";
    }
  });

  document.addEventListener("click", event => {
    if (!header.contains(event.target)) {
      header.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      header.querySelector(".system-resources")?.removeAttribute("open");
    }
  });

  // Legacy page styles hide `.reveal` elements until the former page script
  // adds the `in` class. The shared shell now owns that progressive enhancement;
  // content must remain visible even when no animation controller is loaded.
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("in"));

  document.documentElement.classList.add("site-system-ready");
})();
