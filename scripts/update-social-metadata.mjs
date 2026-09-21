import { readFile, writeFile } from 'node:fs/promises';
import { INDEXABLE_FILES } from './indexing-scope.mjs';
const origin = 'https://www.iasantetravail.com';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
for (const file of INDEXABLE_FILES) {
  let html = await readFile(file, 'utf8');
  const en = file.startsWith('en/');
  const lang = en ? 'en' : 'fr';
  const card = /publications\/(?:ia-preconisations-medicales|ai-medical-recommendations)\//.test(file) ? 'inrs'
    : /publications\/(?:llm-risques-psychosociaux|llm-psychosocial-risks)\//.test(file) ? 'llm' : 'site';
  const image = `${origin}/assets/images/social/${card}-${lang}.png`;
  const alt = card === 'inrs' ? (en ? 'INRS study: AI and medical recommendations — Charles Broutin' : 'Étude INRS : IA et préconisations médicales — Charles Broutin')
    : card === 'llm' ? (en ? 'LLMs and psychosocial risks at work — Charles Broutin' : 'LLM et risques psychosociaux au travail — Charles Broutin')
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
