import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const notes = JSON.parse(await readFile(path.join(root, "content/research-notes.json"), "utf8"));
const site = "https://www.iasantetravail.com";
const modified = "2026-08-16";

const languages = {
  fr: {
    code: "fr-FR",
    locale: "fr_FR",
    prefix: "",
    home: "/",
    listing: "/research/",
    alternateListing: "/en/research/",
    skip: "Aller au contenu principal",
    nav: "Navigation principale",
    brandLabel: "Accueil — IA et Santé au Travail",
    brand: "IA & Santé au Travail",
    brandSub: "Prévention · Travail réel",
    pageNav: "Sommaire de la page",
    onPage: "Sur cette page",
    featured: "Featured Research",
    all: "All Research",
    heroLabel: "RESEARCH",
    heroTitle: "How does AI change work?",
    heroSubtitle: "Notes, recherches et observations sur l’intelligence artificielle, l’organisation du travail et la santé au travail.",
    heroQuestion: "Comment rendre le travail transformé par l’IA sûr pour les humains ?",
    featuredIntro: "Une sélection de travaux qui relient capacités techniques, organisation du travail et prévention.",
    archiveTitle: "Research",
    archiveIntro: "Un index évolutif de publications scientifiques, notes, analyses de terrain et repères de gouvernance.",
    filterLabel: "Filtrer les publications",
    filterCount: "publications visibles",
    allFilter: "Tout",
    read: "LIRE LA NOTE",
    readShort: "LIRE",
    author: "Auteur",
    back: "Toutes les recherches",
    abstract: "Résumé",
    why: "Pourquoi c’est important",
    source: "Source",
    related: "Notes liées",
    originally: "Initialement publié sur LinkedIn",
    sourceOpen: "Consulter la source",
    published: "Publié le",
    contents: "Dans cette note",
    navLinks: [
      ["Comprendre l’IA", "/comprendre/"], ["Usages terrain", "/usages-terrain/"],
      ["Évaluer", "/evaluer/"], ["Droit & gouvernance", "/droit-gouvernance/"],
      ["Research", "/research/"], ["À propos", "/a-propos/"]
    ]
  },
  en: {
    code: "en-GB",
    locale: "en_GB",
    prefix: "/en",
    home: "/en/",
    listing: "/en/research/",
    alternateListing: "/research/",
    skip: "Skip to main content",
    nav: "Main navigation",
    brandLabel: "AI and Occupational Health, home",
    brand: "AI & Occupational Health",
    brandSub: "Prevention · Real work",
    pageNav: "Page contents",
    onPage: "On this page",
    featured: "Featured Research",
    all: "All Research",
    heroLabel: "RESEARCH",
    heroTitle: "How does AI change work?",
    heroSubtitle: "Notes, research and observations on artificial intelligence, work organisation and occupational health.",
    heroQuestion: "How should we make AI-driven work safe for humans?",
    featuredIntro: "Selected work connecting technical capability, work organisation and prevention.",
    archiveTitle: "Research",
    archiveIntro: "An evolving index of scientific publications, notes, field analysis and governance perspectives.",
    filterLabel: "Filter publications",
    filterCount: "publications shown",
    allFilter: "All",
    read: "READ NOTE",
    readShort: "READ",
    author: "Author",
    back: "All research",
    abstract: "Abstract",
    why: "Why it matters",
    source: "Source",
    related: "Related notes",
    originally: "Originally published on LinkedIn",
    sourceOpen: "Open the source",
    published: "Published",
    contents: "In this note",
    navLinks: [
      ["Understand", "/en/understand/"], ["Uses & field", "/en/uses-and-field/"],
      ["Assess", "/en/evaluate/"], ["Law & governance", "/en/legal-governance/"],
      ["Research", "/en/research/"], ["About", "/en/about/"]
    ]
  }
};

const topicLabels = {
  "ai-work": { fr: "IA & travail", en: "AI & Work" },
  "worker-health": { fr: "Santé des travailleurs", en: "Worker Health" },
  "ai-safety": { fr: "AI safety", en: "AI Safety" },
  "algorithmic-management": { fr: "Management algorithmique", en: "Algorithmic Management" },
  "governance-prevention": { fr: "Gouvernance & prévention", en: "Governance & Prevention" }
};

const filterOrder = ["ai-work", "worker-health", "ai-safety", "algorithmic-management", "governance-prevention"];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function json(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function truncateMeta(value, maximum) {
  if (value.length <= maximum) return value;
  const candidate = value.slice(0, maximum - 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > maximum * 0.7 ? boundary : maximum - 1).trim()}…`;
}

function formatDate(value, lang) {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Paris"
  }).format(new Date(`${value}T12:00:00+02:00`)).replaceAll(".", "").toUpperCase();
}

function noteUrl(note, lang) {
  return `${languages[lang].prefix}/research/${note.slug}/`;
}

function topicName(topic, lang) {
  return topicLabels[topic]?.[lang] || topic;
}

function analytics() {
  return `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RKEJVY4XVC"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-RKEJVY4XVC');
  </script>`;
}

function stylesAndScripts(detail = false) {
  return `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&amp;family=Newsreader:opsz,wght@6..72,400;6..72,500&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/tokens.css?v=3.1">
  <link rel="stylesheet" href="/assets/css/layout.css?v=3.0">
  <link rel="stylesheet" href="/assets/css/components.css?v=3.1">
  <link rel="stylesheet" href="/assets/css/unified-navigation.css?v=3.2">
  <link rel="stylesheet" href="/assets/css/research.css?v=1.1">
  <script defer src="/assets/js/unified-navigation.js?v=3.6"></script>${detail ? "" : `\n  <script defer src="/assets/js/research-filters.js?v=1.0"></script>`}`;
}

function fallbackHeader(lang, pageNav = "") {
  const t = languages[lang];
  return `<header class="site-header">
    <nav class="nav" aria-label="${t.nav}">
      <a class="brand" href="${t.home}" aria-label="${t.brandLabel}"><span class="brand-mark"><img src="/assets/images/logo.png" alt=""></span><span class="brand-copy"><strong>${t.brand}</strong><small>${t.brandSub}</small></span></a>
      <div class="nav-links">${t.navLinks.map(([label, href]) => `<a href="${href}"${href === t.listing ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</div>
      <a class="language-switch" href="${lang === "fr" ? "/en/research/" : "/research/"}" lang="${lang === "fr" ? "en" : "fr"}" hreflang="${lang === "fr" ? "en" : "fr"}">${lang === "fr" ? "EN" : "FR"}</a>
    </nav>${pageNav}
  </header>`;
}

function fallbackFooter(lang) {
  const t = languages[lang];
  return `<footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><strong>${t.brand}</strong><p>${lang === "fr" ? "Des repères indépendants pour comprendre comment l’IA transforme le travail réel et la santé." : "Independent perspectives on how AI transforms real work and worker health."}</p></div></div></footer>`;
}

function listingHead(lang) {
  const t = languages[lang];
  const canonical = `${site}${t.listing}`;
  const alternate = `${site}${t.alternateListing}`;
  const title = lang === "fr" ? "Research — IA, travail et santé au travail" : "Research — AI, work and occupational health";
  const description = lang === "fr"
    ? "Recherche, notes et observations sur l’IA, l’organisation du travail, la santé des travailleurs et la sécurité des déploiements."
    : "Research, notes and observations on AI, work organisation, worker health and safe deployment.";
  const itemList = notes.map((note, index) => ({
    "@type": "ListItem", position: index + 1, url: `${site}${noteUrl(note, lang)}`, name: note.title[lang]
  }));
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${canonical}#page`, url: canonical, name: title, description, inLanguage: t.code, dateModified: modified, mainEntity: { "@id": `${canonical}#list` } },
      { "@type": "ItemList", "@id": `${canonical}#list`, numberOfItems: notes.length, itemListElement: itemList },
      { "@type": "Person", "@id": `${site}/a-propos/#person`, name: "Charles Broutin", honorificPrefix: "Dr", jobTitle: lang === "fr" ? "Médecin du travail" : "Occupational physician", url: `${site}${lang === "fr" ? "/a-propos/" : "/en/about/"}` }
    ]
  };
  return `${analytics()}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Dr Charles Broutin">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#F3EFE6">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="fr" href="${site}/research/">
  <link rel="alternate" hreflang="en" href="${site}/en/research/">
  <link rel="alternate" hreflang="x-default" href="${site}/research/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:site_name" content="${escapeHtml(t.brand)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site}/assets/images/og-risques.jpg">
  <meta property="og:image:alt" content="${lang === "fr" ? "Paysage de Thomas Cole dans l’univers pictural d’IA Santé Travail" : "Thomas Cole landscape in the visual world of AI & Occupational Health"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">${json(structured)}</script>
${stylesAndScripts(false)}`;
}

function featuredCard(note, lang, index) {
  const t = languages[lang];
  const topics = note.topics.slice(0, 2).map(topic => topicName(topic, lang)).join(" · ");
  return `<article class="research-feature research-feature--${index + 1}">
    <a class="research-feature-link" href="${noteUrl(note, lang)}" aria-label="${t.read}: ${escapeHtml(note.title[lang])}">
      <div class="research-meta"><span>${escapeHtml(note.type)}</span><span>${escapeHtml(topics)}</span><time datetime="${note.date}">${formatDate(note.date, lang)}</time></div>
      <div class="research-feature-copy"><h3>${escapeHtml(note.title[lang])}</h3><p>${escapeHtml(note.abstract[lang])}</p></div>
      <span class="research-read">${t.read} <i aria-hidden="true">→</i></span>
    </a>
  </article>`;
}

function archiveRow(note, lang, index) {
  const t = languages[lang];
  const topics = note.topics.map(topic => `<span>${escapeHtml(topicName(topic, lang))}</span>`).join("");
  return `<article class="research-row" data-research-item data-topics="${note.topics.join(" ")}">
    <a href="${noteUrl(note, lang)}" aria-label="${t.read}: ${escapeHtml(note.title[lang])}">
      <span class="research-row-number">${String(index + 1).padStart(2, "0")}</span>
      <div class="research-row-taxonomy"><strong>${escapeHtml(note.type)}</strong>${topics}</div>
      <div class="research-row-copy"><h3>${escapeHtml(note.title[lang])}</h3><p>${escapeHtml(note.abstract[lang])}</p></div>
      <div class="research-row-action"><time datetime="${note.date}">${formatDate(note.date, lang)}</time><span>${t.readShort} <i aria-hidden="true">→</i></span></div>
    </a>
  </article>`;
}

function listingPage(lang) {
  const t = languages[lang];
  const featured = notes.filter(note => note.featured).slice(0, 4);
  return `<!doctype html>
<html lang="${lang}">
<head>
${listingHead(lang)}
</head>
<body class="research-page research-index">
  <a class="skip-link" href="#contenu">${t.skip}</a>
  ${fallbackHeader(lang)}
  <main id="contenu">
    <section class="research-hero" aria-labelledby="research-title">
      <div class="research-hero-inner">
        <p class="research-kicker">${t.heroLabel}</p>
        <h1 id="research-title">${t.heroTitle}</h1>
        <div class="research-hero-bottom"><p>${t.heroSubtitle}</p><p>${t.heroQuestion}</p></div>
      </div>
    </section>

    <nav class="research-local-nav" aria-label="${t.pageNav}"><a href="#featured">${t.featured}</a><a href="#research">${t.all}</a></nav>

    <section class="research-section research-featured" id="featured" aria-labelledby="featured-title">
      <header class="research-section-heading"><p>01</p><div><h2 id="featured-title">${t.featured}</h2><p>${t.featuredIntro}</p></div></header>
      <div class="research-feature-grid">
        ${featured.slice(0, 2).map((note, index) => featuredCard(note, lang, index)).join("\n        ")}
        <figure class="research-feature-visual">
          <img src="/assets/images/oxbow-1280.webp" alt="${lang === "fr" ? "Détail de The Oxbow de Thomas Cole, paysage partagé entre nature sauvage et territoire organisé" : "Detail from Thomas Cole’s The Oxbow, a landscape divided between wilderness and organised territory"}" loading="lazy" width="1280" height="830">
          <figcaption>Thomas Cole · The Oxbow · 1836</figcaption>
        </figure>
        ${featured.slice(2, 4).map((note, index) => featuredCard(note, lang, index + 2)).join("\n        ")}
      </div>
    </section>

    <section class="research-section research-archive" id="research" aria-labelledby="archive-title">
      <header class="research-archive-heading"><div><p>02 / ${t.all.toUpperCase()}</p><h2 id="archive-title">${t.archiveTitle}</h2></div><p>${t.archiveIntro}</p><span aria-hidden="true">(${String(notes.length).padStart(2, "0")})</span></header>
      <div class="research-filters" role="group" aria-label="${t.filterLabel}" data-research-filters>
        <button type="button" data-filter="all" aria-pressed="true">${t.allFilter}</button>
        ${filterOrder.map(topic => `<button type="button" data-filter="${topic}" aria-pressed="false">${escapeHtml(topicName(topic, lang))}</button>`).join("\n        ")}
      </div>
      <p class="research-filter-status" aria-live="polite"><span data-visible-count>${notes.length}</span> ${t.filterCount}</p>
      <div class="research-index-list">
        ${notes.map((note, index) => archiveRow(note, lang, index)).join("\n        ")}
      </div>
    </section>
  </main>
  ${fallbackFooter(lang)}
</body>
</html>`;
}

function articleStructuredData(note, lang) {
  const t = languages[lang];
  const url = `${site}${noteUrl(note, lang)}`;
  const description = note.abstract[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": note.type === "RESEARCH" ? "ScholarlyArticle" : "Article",
        "@id": `${url}#article`, headline: note.title[lang], description, inLanguage: t.code,
        datePublished: note.date, dateModified: modified, articleSection: note.type,
        keywords: note.topics.map(topic => topicName(topic, lang)).join(", "),
        author: { "@id": `${site}/a-propos/#person` },
        mainEntityOfPage: { "@id": `${url}#page` },
        isPartOf: { "@id": `${site}${t.listing}#page` }
      },
      { "@type": "WebPage", "@id": `${url}#page`, url, name: note.title[lang], description, inLanguage: t.code },
      { "@type": "Person", "@id": `${site}/a-propos/#person`, name: "Charles Broutin", honorificPrefix: "Dr", jobTitle: lang === "fr" ? "Médecin du travail" : "Occupational physician", url: `${site}${lang === "fr" ? "/a-propos/" : "/en/about/"}` },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: lang === "fr" ? "Accueil" : "Home", item: `${site}${t.home}` },
        { "@type": "ListItem", position: 2, name: "Research", item: `${site}${t.listing}` },
        { "@type": "ListItem", position: 3, name: note.title[lang], item: url }
      ] }
    ]
  };
}

function detailHead(note, lang) {
  const t = languages[lang];
  const url = `${site}${noteUrl(note, lang)}`;
  const alternateUrl = `${site}${noteUrl(note, lang === "fr" ? "en" : "fr")}`;
  const title = truncateMeta(`${note.title[lang]} — Research`, 70);
  const description = truncateMeta(note.abstract[lang], 180);
  return `${analytics()}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${escapeHtml(note.author)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#F3EFE6">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="${lang}" href="${url}">
  <link rel="alternate" hreflang="${lang === "fr" ? "en" : "fr"}" href="${alternateUrl}">
  <link rel="alternate" hreflang="x-default" href="${site}${noteUrl(note, "fr")}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:site_name" content="${escapeHtml(t.brand)}">
  <meta property="og:title" content="${escapeHtml(note.title[lang])}">
  <meta property="og:description" content="${escapeHtml(note.abstract[lang])}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}/assets/images/og-risques.jpg">
  <meta property="article:published_time" content="${note.date}">
  <meta property="article:modified_time" content="${modified}">
  <meta property="article:section" content="${escapeHtml(note.type)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(note.title[lang])}">
  <meta name="twitter:description" content="${escapeHtml(note.abstract[lang])}">
  <script type="application/ld+json">${json(articleStructuredData(note, lang))}</script>
${stylesAndScripts(true)}`;
}

function relatedNotes(note) {
  return notes
    .filter(candidate => candidate.slug !== note.slug)
    .map(candidate => ({ candidate, overlap: candidate.topics.filter(topic => note.topics.includes(topic)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, 3)
    .map(item => item.candidate);
}

function articlePage(note, lang, index) {
  const t = languages[lang];
  const related = relatedNotes(note);
  const topics = note.topics.map(topic => topicName(topic, lang));
  const sections = note.content[lang];
  const sourceExternal = /^https?:/.test(note.sourceUrl);
  return `<!doctype html>
<html lang="${lang}">
<head>
${detailHead(note, lang)}
</head>
<body class="research-page research-detail">
  <a class="skip-link" href="#contenu">${t.skip}</a>
  ${fallbackHeader(lang)}
  <main id="contenu">
    <article class="research-article">
      <header class="research-article-hero">
        <a class="research-back" href="${t.listing}">← ${t.back}</a>
        <div class="research-article-meta"><span>${escapeHtml(note.type)} · ${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(topics.join(" · "))}</span><time datetime="${note.date}">${formatDate(note.date, lang)}</time></div>
        <h1>${escapeHtml(note.title[lang])}</h1>
        <p class="research-article-abstract">${escapeHtml(note.abstract[lang])}</p>
        <div class="research-article-byline"><span>${t.author}</span><strong>${escapeHtml(note.author)}</strong><span>${t.published}</span><time datetime="${note.date}">${formatDate(note.date, lang)}</time></div>
      </header>

      <div class="research-article-layout">
        <aside class="research-article-aside" aria-label="${t.contents}"><span>${t.contents}</span>${sections.map((section, sectionIndex) => `<a href="#section-${sectionIndex + 1}">${String(sectionIndex + 1).padStart(2, "0")} · ${escapeHtml(section.heading)}</a>`).join("")}</aside>
        <div class="research-article-body">
          ${sections.map((section, sectionIndex) => `<section id="section-${sectionIndex + 1}"><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("\n          ")}
        </div>
      </div>

      <section class="research-why" aria-labelledby="why-title"><p>03</p><div><h2 id="why-title">${t.why}</h2><p>${escapeHtml(note.whyItMatters[lang])}</p></div></section>

      <section class="research-source" aria-labelledby="source-title"><p>04</p><div><h2 id="source-title">${t.source}</h2><p>${escapeHtml(note.source)}</p><a href="${escapeHtml(note.sourceUrl)}"${sourceExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${t.sourceOpen} <span aria-hidden="true">↗</span></a>${note.originUrl ? `<a class="research-origin" href="${escapeHtml(note.originUrl)}" target="_blank" rel="noopener noreferrer">${t.originally} <span aria-hidden="true">↗</span></a>` : ""}</div></section>

      <section class="research-related" aria-labelledby="related-title"><header><p>05</p><h2 id="related-title">${t.related}</h2></header><div>${related.map((item, relatedIndex) => `<a href="${noteUrl(item, lang)}"><span>${String(relatedIndex + 1).padStart(2, "0")} · ${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title[lang])}</strong><i aria-hidden="true">→</i></a>`).join("")}</div></section>
    </article>
  </main>
  ${fallbackFooter(lang)}
</body>
</html>`;
}

for (const lang of Object.keys(languages)) {
  const listingDirectory = path.join(root, languages[lang].prefix.slice(1), "research");
  await mkdir(listingDirectory, { recursive: true });
  await writeFile(path.join(listingDirectory, "index.html"), listingPage(lang), "utf8");

  for (const [index, note] of notes.entries()) {
    const directory = path.join(listingDirectory, note.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), articlePage(note, lang, index), "utf8");
  }
}

const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const researchSitemapUrls = Object.keys(languages).flatMap(lang => [
  languages[lang].listing,
  ...notes.map(note => noteUrl(note, lang))
]);
const sitemapBlock = `<!-- research:start -->\n${researchSitemapUrls.map(url => `<url><loc>${site}${url}</loc><lastmod>${modified}</lastmod></url>`).join("\n")}\n<!-- research:end -->`;
const nextSitemap = sitemap.includes("<!-- research:start -->")
  ? sitemap.replace(/<!-- research:start -->[\s\S]*?<!-- research:end -->/, sitemapBlock)
  : sitemap.replace("</urlset>", `${sitemapBlock}\n</urlset>`);
await writeFile(sitemapPath, nextSitemap, "utf8");

console.log(`Research: ${notes.length} notes × 2 languages, 2 indexes and ${notes.length * 2} article pages generated.`);
