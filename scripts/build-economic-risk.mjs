import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(root, "content/risque-economique-social.md"), "utf8");
const lines = source.replaceAll("\r\n", "\n").split("\n");

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[«»“”‘’'?.:,]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderBlocks(blockLines) {
  const output = [];
  let index = 0;
  while (index < blockLines.length) {
    const raw = blockLines[index].trim();
    if (!raw || raw === "---") { index += 1; continue; }

    if (raw.startsWith("### ")) {
      output.push(`<h3>${inline(raw.slice(4))}</h3>`);
      index += 1;
      continue;
    }

    if (/^\*\s+/.test(raw)) {
      const items = [];
      while (index < blockLines.length && /^\*\s+/.test(blockLines[index].trim())) {
        items.push(`<li>${inline(blockLines[index].trim().replace(/^\*\s+/, ""))}</li>`);
        index += 1;
      }
      output.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (raw.startsWith(">")) {
      const quote = [];
      while (index < blockLines.length && blockLines[index].trim().startsWith(">")) {
        quote.push(blockLines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      output.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    output.push(`<p>${inline(raw)}</p>`);
    index += 1;
  }
  return output.join("\n");
}

const title = lines.find(line => line.startsWith("# "))?.slice(2).trim() || "Risque économique et social";
const subtitleIndex = lines.findIndex(line => line.startsWith("## "));
const subtitle = subtitleIndex >= 0 ? lines[subtitleIndex].slice(3).trim() : "Quand le travail humain cesse progressivement d’être indispensable";
const contentLines = lines.slice(subtitleIndex + 1);
const opening = [];
const sections = [];
let current = null;

for (const line of contentLines) {
  const match = line.match(/^#{1,2}\s+(.+)$/);
  if (match) {
    current = { heading: match[1].trim(), lines: [] };
    sections.push(current);
    continue;
  }
  if (current) current.lines.push(line);
  else opening.push(line);
}

const sectionNotes = [
  "D’un outil local à une composante du fonctionnement économique.",
  "Pouvoir de négociation, transmission des compétences et concentration du capital.",
  "Une hypothèse de risque systémique inspirée de la littérature sur les États rentiers.",
  "Les premiers signaux apparaissent dans les effectifs, les tâches et les objectifs.",
  "Observer les transformations du travail avant qu’elles ne deviennent invisibles.",
  "Suivre ce qui demeure humainement nécessaire, contestable et transmissible.",
  "Faire remonter les situations individuelles au niveau de l’organisation collective.",
  "Réévaluer régulièrement la place prise par les systèmes dans l’organisation.",
  "Une accumulation de décisions rationnelles peut créer une dépendance difficile à inverser."
];

const sectionsMarkup = sections.map((section, index) => {
  const id = slugify(section.heading);
  return `<section class="economic-content-section" id="${id}">
      <p class="economic-section-number">${String(index + 1).padStart(2, "0")}</p>
      <div><h2>${inline(section.heading)}</h2>${renderBlocks(section.lines)}</div>
      <aside class="economic-aside"><span>POINT DE LECTURE</span><p>${sectionNotes[index] || "Relier les capacités des systèmes à leurs effets sur le travail humain."}</p></aside>
    </section>`;
}).join("\n\n    ");

const navigationSections = sections.map(section => ({ id: slugify(section.heading), heading: section.heading }));
const navLabels = ["Infrastructure économique", "Place du travail", "Avant le chômage", "Alerte précoce", "Prévenir la dépendance"];
const navIndices = [0, 1, 3, 4, 7];
const pageNav = navIndices.map((sectionIndex, index) => `<a href="#${navigationSections[sectionIndex].id}">${navLabels[index]}</a>`).join("");

const url = "https://www.iasantetravail.com/risques-prevention/economique-social/";
const description = "Comment l’IA pourrait réduire progressivement la place économique du travail humain, et quels signaux la santé au travail peut observer dès aujourd’hui.";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: subtitle,
  name: title,
  description,
  url,
  inLanguage: "fr-FR",
  datePublished: "2026-08-16",
  dateModified: "2026-08-16",
  author: { "@type": "Person", name: "Dr Charles Broutin", jobTitle: "Médecin du travail" },
  articleSection: "Risque économique et social",
  about: ["Intelligence artificielle", "Travail humain", "Risque économique", "Santé au travail", "Dépendance technologique"]
};

const html = `<!doctype html>
<html lang="fr">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RKEJVY4XVC"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-RKEJVY4XVC');
  </script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Risque économique et social lié à l’IA</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Dr Charles Broutin">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#F3EFE6">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="fr" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="IA &amp; Santé au Travail">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://www.iasantetravail.com/assets/images/og-risques.jpg">
  <meta property="article:published_time" content="2026-08-16">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&amp;family=Newsreader:opsz,wght@6..72,400;6..72,500&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/tokens.css?v=3.1">
  <link rel="stylesheet" href="/assets/css/layout.css?v=3.0">
  <link rel="stylesheet" href="/assets/css/components.css?v=3.1">
  <link rel="stylesheet" href="/assets/css/unified-navigation.css?v=3.3">
  <link rel="stylesheet" href="/assets/css/risk-pathways.css?v=1.1">
  <script defer src="/assets/js/unified-navigation.js?v=3.7"></script>
</head>
<body class="page-shell-v2 economic-risk-page">
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>
  <header class="site-header">
    <nav class="nav" aria-label="Navigation principale"><a class="brand" href="/"><span class="brand-mark"><img src="/assets/images/logo.png" alt=""></span><span class="brand-copy"><strong>IA &amp; Santé au Travail</strong><small>Prévention · Travail réel</small></span></a><div class="nav-links"><a href="/risques-prevention/" aria-current="page">Risques</a><a href="/evaluer/">Évaluer</a><a href="/droit-gouvernance/">Gouverner</a></div><a class="language-switch" href="/en/risks-prevention/" lang="en" hreflang="en">EN</a></nav>
    <nav class="page-nav" aria-label="Sommaire de la page"><div class="page-nav-inner"><span class="page-nav-label">Sur cette page</span><div class="page-nav-links">${pageNav}</div><span class="page-progress" aria-hidden="true"><i></i></span></div></nav>
  </header>

  <main id="contenu">
    <article>
      <header class="economic-hero">
        <a class="economic-back" href="/risques-prevention/">← Les deux parcours</a>
        <p class="economic-kicker">${title.toUpperCase()} · SCÉNARIO PROSPECTIF</p>
        <h1>${inline(subtitle)}</h1>
        <div class="economic-hero-bottom"><p>Le risque ne se résume pas au nombre d’emplois supprimés. Il concerne aussi la place que le travail humain conserve progressivement dans la création de valeur, l’apprentissage et le pouvoir économique.</p><div class="economic-scenario-note"><span>Précaution</span><p>Ce parcours examine un risque systémique possible. Il ne décrit pas une conséquence démontrée de l’IA actuelle.</p><a class="economic-source-link" href="https://lukedrago.substack.com/p/the-intelligence-curse" target="_blank" rel="noopener noreferrer">Lire l’article <em>The Intelligence Curse</em> ↗</a></div></div>
      </header>

      <div class="economic-progression" aria-label="Progression possible du rôle de l’intelligence artificielle"><span>01 · Assister</span><span>02 · Recommander</span><span>03 · Décider par défaut</span><span>04 · Agir de manière autonome</span></div>

      <section class="economic-opening"><p class="economic-section-number">POINT DE DÉPART</p><div>${renderBlocks(opening)}</div></section>

      ${sectionsMarkup}
    </article>
  </main>
  <footer class="site-footer"><p>© 2026 IA &amp; Santé au Travail</p></footer>
</body>
</html>`;

const outputDirectory = path.join(root, "risques-prevention/economique-social");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "index.html"), html, "utf8");

const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const sitemapBlock = `<!-- risk-pathways:start -->
<url><loc>https://www.iasantetravail.com/risques-prevention/psychosociaux/</loc><lastmod>2026-08-16</lastmod></url>
<url><loc>https://www.iasantetravail.com/risques-prevention/economique-social/</loc><lastmod>2026-08-16</lastmod></url>
<!-- risk-pathways:end -->`;
const withUpdatedHub = sitemap.replace(
  /<url><loc>https:\/\/www\.iasantetravail\.com\/risques-prevention\/<\/loc><lastmod>[^<]+<\/lastmod><\/url>/,
  "<url><loc>https://www.iasantetravail.com/risques-prevention/</loc><lastmod>2026-08-16</lastmod></url>"
);
const nextSitemap = withUpdatedHub.includes("<!-- risk-pathways:start -->")
  ? withUpdatedHub.replace(/<!-- risk-pathways:start -->[\s\S]*?<!-- risk-pathways:end -->/, sitemapBlock)
  : withUpdatedHub.replace("</urlset>", `${sitemapBlock}\n</urlset>`);
await writeFile(sitemapPath, nextSitemap, "utf8");
console.log(`Economic risk pathway generated with ${sections.length} sections.`);
