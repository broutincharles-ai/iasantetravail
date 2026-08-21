import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { INDEXABLE_FILES, INDEXABLE_PAIRS, INDEXABLE_SINGLETONS, publicUrl } from "./indexing-scope.mjs";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "newsletter-backend", "node_modules"]);

async function htmlFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name) || entry.name.startsWith("demo-")) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await htmlFiles(absolute));
    else if (entry.name.endsWith(".html")) result.push(absolute);
  }
  return result;
}

function setRobots(html, content) {
  const tag = `<meta name="robots" content="${content}">`;
  if (/<meta\b[^>]*name=["']robots["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/i, tag);
  }
  return html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1\n  ${tag}`);
}

let indexableCount = 0;
let excludedCount = 0;
for (const file of await htmlFiles()) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const html = await readFile(file, "utf8");
  const indexable = INDEXABLE_FILES.has(relative);
  const next = setRobots(html, indexable ? "index,follow,max-image-preview:large" : "noindex,follow");
  if (next !== html) await writeFile(file, next, "utf8");
  if (indexable) indexableCount += 1;
  else excludedCount += 1;
}

const entries = INDEXABLE_PAIRS.flatMap(({ fr, en, lastmod }) => {
  const frUrl = publicUrl(fr);
  const enUrl = publicUrl(en);
  return [
    `  <url>\n    <loc>${frUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>\n  </url>`,
    `  <url>\n    <loc>${enUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>\n  </url>`
  ];
});

for (const { file, lang, lastmod } of INDEXABLE_SINGLETONS) {
  const url = publicUrl(file);
  entries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>\n  </url>`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
await writeFile(path.join(root, "sitemap.xml"), sitemap, "utf8");

console.log(`Indexing scope: ${indexableCount} indexable pages, ${excludedCount} excluded HTML files.`);
