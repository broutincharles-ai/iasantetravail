import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { INDEXABLE_FILES } from './indexing-scope.mjs';
const origin = 'https://www.iasantetravail.com';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
// ?v= follows the image content, so link previews cached by image URL pick up a rebuilt card.
const versions = {};
for (const file of INDEXABLE_FILES) {
  let html = await readFile(file, 'utf8');
  const en = file.startsWith('en/');
  const lang = en ? 'en' : 'fr';
  const card = /publications\/(?:ia-preconisations-medicales|ai-medical-recommendations)\//.test(file) ? 'inrs'
    : /publications\/(?:llm-risques-psychosociaux|llm-psychosocial-risks)\//.test(file) ? 'llm'
    : /publications\/(?:sante-travail-securite-modeles-frontieres|occupational-health-frontier-ai-safety)\//.test(file) ? 'preprint' : 'site';
  const png = `assets/images/social/${card}-${lang}.png`;
  versions[png] ??= createHash('sha256').update(await readFile(png)).digest('hex').slice(0, 8);
  const image = `${origin}/${png}?v=${versions[png]}`;
  const alt = card === 'inrs' ? (en ? 'INRS study: AI and medical recommendations — Charles Broutin' : 'Étude INRS : IA et préconisations médicales — Charles Broutin')
    : card === 'llm' ? (en ? 'LLMs and psychosocial risks at work — Charles Broutin' : 'LLM et risques psychosociaux au travail — Charles Broutin')
    : card === 'preprint' ? (en ? 'Preprint: occupational health and frontier AI safety — Charles Broutin' : 'Preprint : santé au travail et sécurité des modèles d’IA frontières — Charles Broutin')
    : (en ? 'AI & Occupational Health — Dr Charles Broutin' : 'IA & Santé au Travail — Dr Charles Broutin');
  const end = html.indexOf('</head>');
  let head = html.slice(0, end);
  head = head.replace(/\s*<meta\b(?=[^>]*(?:property|name)=["'](?:og:image(?::[^"']+)?|twitter:image(?::[^"']+)?)['"])[^>]*>/gi, '');
  head += `\n  <meta property="og:image" content="${image}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:type" content="image/png">\n  <meta property="og:image:alt" content="${escape(alt)}">\n  <meta name="twitter:image" content="${image}">\n  <meta name="twitter:image:alt" content="${escape(alt)}">\n`;
  // Remove references to artwork images removed from the actual pages.
  head = head.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (_, open, raw, close) => {
    const data = JSON.parse(raw);
    const nodes = Array.isArray(data) ? data : data['@graph'] || [data];
    for (const node of nodes) {
      if (String(node.primaryImageOfPage?.['@id']).endsWith('#primaryimage')) delete node.primaryImageOfPage;
      if (String(node.image?.['@id']).endsWith('#primaryimage')) delete node.image;
      const types = [].concat(node['@type'] || []);
      if (types.some(type => ['Article', 'TechArticle', 'MedicalWebPage'].includes(type))) node.image = image;
    }
    return open + JSON.stringify(data) + close;
  });
  await writeFile(file, head + html.slice(end));
}
console.log(`Updated social metadata on ${INDEXABLE_FILES.size} pages.`);
