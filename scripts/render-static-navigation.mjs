// Run after changing the shared navigation template or page contents lists.
// The browser enhances this exact markup; it is also usable without JavaScript.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { INDEXABLE_FILES } from './indexing-scope.mjs';
const require = createRequire(import.meta.url);
const { renderNavigationShell } = require('../assets/js/unified-navigation.js');

for (const file of INDEXABLE_FILES) {
  let html = await readFile(file, 'utf8');
  const english = file.startsWith('en/');
  const route = '/' + file.replace(/index\.html$/, '');
  const headerMatch = html.match(/<header\b[^>]*class="[^"]*\b(?:site-header|site-system-header)\b[^"]*"[^>]*>[\s\S]*?<\/header>/);
  if (!headerMatch) throw new Error(`${file}: expected an existing header`);
  const pageNav = headerMatch[0].match(/<nav\b[^>]*class="page-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0] || '';
  const { headerMarkup, footerMarkup } = renderNavigationShell(route, english, pageNav);
  html = html.replace(headerMatch[0], `<header class="site-system-header" data-navigation-version="6.1">${headerMarkup}</header>`);
  const footer = /<footer\b[^>]*class="[^"]*\b(?:site-footer|site-system-footer)\b[^"]*"[^>]*>[\s\S]*?<\/footer>/;
  if (!footer.test(html)) throw new Error(`${file}: expected an existing footer`);
  html = html.replace(footer, `<footer class="site-system-footer" data-navigation-version="6.1">${footerMarkup}</footer>`);
  if (!html.includes('/assets/css/navigation-nojs.css')) {
    html = html.replace('</head>', '<noscript><link rel="stylesheet" href="/assets/css/navigation-nojs.css?v=1.0"></noscript>\n</head>');
  }
  html = html.replace(/unified-navigation\.js\?v=[\d.]+/g, "unified-navigation.js?v=6.1");
  await writeFile(file, html);
}
console.log(`Rendered static navigation on ${INDEXABLE_FILES.size} indexable pages.`);
