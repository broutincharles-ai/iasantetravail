// Rebuilds the JSON-LD of the AI safety reference pages and glossaries from their visible content,
// so that the FAQ and the defined terms in the structured data always match what readers see.
//
//   node scripts/build-safety-structured-data.mjs
//
// Run it after editing /securite-ia/, /securite-ia/glossaire/ or their English pages, then follow
// the usual order of the README (navigation, indexing scope, search index, validation).
import { readFile, writeFile } from "node:fs/promises";

const ORIGIN = "https://www.iasantetravail.com";
const PERSON = { "@id": `${ORIGIN}/a-propos/#person` };
const ORGANIZATION = { "@id": `${ORIGIN}/#organization` };

const PAGES = [
  { file: "securite-ia/index.html", kind: "reference", crumbs: [["Accueil", "/"], ["Sécurité de l’IA", "/securite-ia/"]] },
  { file: "securite-ia/glossaire/index.html", kind: "glossary", crumbs: [["Accueil", "/"], ["Sécurité de l’IA", "/securite-ia/"], ["Glossaire", "/securite-ia/glossaire/"]] },
  { file: "en/ai-safety/index.html", kind: "reference", crumbs: [["Home", "/en/"], ["AI safety", "/en/ai-safety/"]] },
  { file: "en/ai-safety/glossary/index.html", kind: "glossary", crumbs: [["Home", "/en/"], ["AI safety", "/en/ai-safety/"], ["Glossary", "/en/ai-safety/glossary/"]] }
];

const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'" };
const decode = value => value.replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, entity => ENTITIES[entity]);
const text = fragment => decode(fragment
  .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, " ")
  .replace(/<[^>]+>/g, ""))
  .replace(/ /g, " ")
  .replace(/\s+/g, " ")
  .trim();
const meta = (html, attribute, name) => {
  const tag = (html.match(/<meta\b[^>]*>/gi) || []).find(candidate => candidate.includes(`${attribute}="${name}"`));
  return decode(tag?.match(/content="([^"]*)"/)?.[1] || "");
};

for (const { file, kind, crumbs } of PAGES) {
  const html = await readFile(file, "utf8");
  const english = file.startsWith("en/");
  const inLanguage = english ? "en-GB" : "fr-FR";
  const url = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  const title = decode(html.match(/<title>([^<]+)<\/title>/)[1]);
  const description = meta(html, "name", "description");
  const published = meta(html, "property", "article:published_time");
  const modified = meta(html, "property", "article:modified_time");
  const image = meta(html, "property", "og:image");
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const headline = text(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  const citations = [...new Set([...main.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(match => match[1]))]
    .filter(href => !href.startsWith(ORIGIN));

  const webpage = {
    "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage,
    isPartOf: { "@id": `${ORIGIN}/#website` },
    datePublished: published, dateModified: modified, author: PERSON, publisher: ORGANIZATION,
    breadcrumb: { "@id": `${url}#breadcrumb` },
    about: [
      { "@type": "Thing", name: english ? "AI safety" : "Sécurité de l’intelligence artificielle", sameAs: "https://en.wikipedia.org/wiki/AI_safety" },
      { "@type": "Thing", name: english ? "Occupational health" : "Santé au travail", sameAs: "https://en.wikipedia.org/wiki/Occupational_safety_and_health" }
    ]
  };
  const graph = [webpage];

  if (kind === "reference") {
    webpage.mainEntity = { "@id": `${url}#article` };
    graph.push({
      "@type": "Article", "@id": `${url}#article`, headline, description,
      mainEntityOfPage: { "@id": `${url}#webpage` }, datePublished: published, dateModified: modified,
      inLanguage, author: PERSON, publisher: ORGANIZATION, image, citation: citations
    });
    const faq = main.match(/<section[^>]*id="faq"[\s\S]*?<\/section>/)[0];
    const questions = [...faq.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><div>([\s\S]*?)<\/div><\/details>/g)]
      .map(([, question, answer]) => ({ "@type": "Question", name: text(question), acceptedAnswer: { "@type": "Answer", text: text(answer) } }));
    graph.push({ "@type": "FAQPage", "@id": `${url}#faq-schema`, mainEntity: questions });
  } else {
    const setId = `${url}${english ? "#terms" : "#termes"}`;
    webpage.mainEntity = { "@id": setId };
    const terms = [...main.matchAll(/<tr id="([^"]+)">([\s\S]*?)<\/tr>/g)].map(([, id, row]) => {
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(match => match[1]);
      const definition = cells[1].trim().replace(/<span class="term-src">[\s\S]*?<\/span>\s*$/, "");
      return {
        "@type": "DefinedTerm", "@id": `${url}#${id}`,
        name: text(cells[0].match(/<dfn[^>]*>([\s\S]*?)<\/dfn>/)[1]),
        alternateName: text(cells[0].match(/<span class="term-alt"[^>]*>([\s\S]*?)<\/span>/)[1]),
        description: text(definition), url: `${url}#${id}`, inDefinedTermSet: { "@id": setId }
      };
    });
    graph.push({
      "@type": "DefinedTermSet", "@id": setId, name: headline, description, inLanguage, url,
      author: PERSON, publisher: ORGANIZATION, hasDefinedTerm: terms
    });
  }
  graph.push({
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map(([name, path], index) => ({ "@type": "ListItem", position: index + 1, name, item: `${ORIGIN}${path}` }))
  });

  const block = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  const next = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">${block}</script>`);
  if (next === html && !html.includes(block)) throw new Error(`${file}: JSON-LD block missing`);
  await writeFile(file, next);
  const count = kind === "glossary" ? graph.find(node => node["@type"] === "DefinedTermSet").hasDefinedTerm.length : graph.find(node => node["@type"] === "FAQPage").mainEntity.length;
  console.log(`${file}: ${kind === "glossary" ? `${count} defined terms` : `${count} FAQ questions`}, ${citations.length} cited sources.`);
}
