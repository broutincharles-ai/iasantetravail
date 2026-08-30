import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { INDEXABLE_PAIRS, INDEXABLE_SINGLETONS, publicUrl } from "./indexing-scope.mjs";

const root = process.cwd();
const origin = "https://www.iasantetravail.com/";

for (const { fr, en } of INDEXABLE_PAIRS) {
  const enUrl = publicUrl(en);
  const file = path.join(root, fr);
  let html = await readFile(file, "utf8");
  const tag = `<link rel="alternate" hreflang="en" href="${enUrl}">`;
  const existing = /<link\b(?=[^>]*rel=["']alternate["'])(?=[^>]*hreflang=["']en["'])[^>]*>/i;
  if (existing.test(html)) html = html.replace(existing, tag);
  else html = html.replace(/(<link\b(?=[^>]*rel=["']alternate["'])(?=[^>]*hreflang=["']fr["'])[^>]*>)/i, `$1\n  ${tag}`);
  await writeFile(file, html);
}

const blocks = [];
for (const { fr, en, lastmod } of INDEXABLE_PAIRS) {
  const frUrl = publicUrl(fr);
  const enUrl = publicUrl(en);
  for (const [loc, lang] of [[frUrl, "fr"], [enUrl, "en"]]) blocks.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>
  </url>`);
}
for (const { file, lang, lastmod } of INDEXABLE_SINGLETONS) {
  const url = publicUrl(file);
  blocks.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocks.join("\n")}
</urlset>
`;
await writeFile(path.join(root, "sitemap.xml"), sitemap);
console.log(`Synced ${INDEXABLE_PAIRS.length} bilingual pairs and ${blocks.length} sitemap URLs.`);
