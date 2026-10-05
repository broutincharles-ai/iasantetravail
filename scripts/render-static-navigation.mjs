// Renders the shared site shell (assets/js/unified-navigation.js) into every page and
// normalises the shared part of each <head>. Idempotent: run it after changing the
// navigation, adding a page or editing a page head.
//
//   node scripts/render-static-navigation.mjs
//
// The browser script only rebuilds a header whose static markup is older than NAVIGATION_VERSION,
// so pages stay complete (and readable by crawlers) without JavaScript.
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { INDEXABLE_FILES } from "./indexing-scope.mjs";

const require = createRequire(import.meta.url);
const { renderNavigationShell, NAVIGATION_VERSION } = require("../assets/js/unified-navigation.js");

// Pages that carry the shell besides the indexable ones.
export const SHELL_EXTRA_FILES = [
  "confidentialite/index.html",
  "mentions-legales/index.html",
  "en/privacy/index.html",
  "en/legal-notice/index.html",
  "404.html"
];
// Legal pages share one layout; their body classes used to be added by script after the first paint.
const LEGAL_FILES = new Set(["confidentialite/index.html", "mentions-legales/index.html", "en/privacy/index.html", "en/legal-notice/index.html"]);
const LEGAL_BODY_CLASSES = ["page-shell-v2", "legal-refresh"];
// Built by the Préconisations app (React): the site shell goes around its root, never inside it.
const APP_FILE = "outils/preconisations/index.html";

const ASSETS = {
  fontsCss: "/assets/css/fonts.css?v=1.0",
  uxCss: "/assets/css/ux-improvements.css?v=1.1",
  readabilityCss: "/assets/css/readability.css?v=1.0",
  shellCss: "/assets/css/unified-navigation.css?v=7.1",
  nojsCss: "/assets/css/navigation-nojs.css?v=2.0",
  appShellCss: "/assets/css/preconisations-shell.css?v=1.1",
  navJs: "/assets/js/unified-navigation.js?v=7.1",
  uxJs: "/assets/js/ux-improvements.js?v=1.2",
  consentJs: "/assets/js/consent.js?v=1.0",
  languageJs: "/assets/js/language-routing.js?v=2.0"
};

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const assetTag = (name, file) => new RegExp(`[ \\t]*<(?:link|script)\\b[^>]*(?:href|src)=["'][^"']*/${escapeRegExp(file)}(?:\\?[^"']*)?["'][^>]*>(?:</script>)?[ \\t]*\\n?`, "gi");

function normaliseHead(html, { app }) {
  let head = html.slice(0, html.search(/<\/head>/i));
  const rest = html.slice(head.length);

  // Third-party requests made before any consent: Google Fonts and the inline Google tag.
  head = head
    .replace(/[ \t]*<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>[ \t]*\n?/gi, "")
    .replace(/[ \t]*<!--\s*Google tag \(gtag\.js\)\s*-->[ \t]*\n?/gi, "")
    .replace(/[ \t]*<script\b[^>]*googletagmanager\.com\/gtag\/js[^>]*><\/script>[ \t]*\n?/gi, "")
    .replace(/[ \t]*<script>(?:(?!<\/script>)[\s\S])*?gtag\(\s*['"]config['"][\s\S]*?<\/script>[ \t]*\n?/gi, "")
    .replace(/[ \t]*<noscript>\s*<link\b[^>]*navigation-nojs\.css[^>]*>\s*<\/noscript>[ \t]*\n?/gi, "");

  for (const file of [
    "assets/css/fonts.css", "assets/css/ux-improvements.css", "assets/css/readability.css",
    "assets/css/unified-navigation.css", "assets/css/navigation-nojs.css", "assets/css/preconisations-shell.css",
    "assets/js/unified-navigation.js", "assets/js/ux-improvements.js", "assets/js/consent.js",
    "assets/js/language-routing.js", "assets/js/site-shell.js"
  ]) head = head.replace(assetTag(file, file), "");

  // Fonts first, so text is laid out with the right metrics.
  const fonts = `<link rel="stylesheet" href="${ASSETS.fontsCss}">`;
  head = /<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(head)
    ? head.replace(/(<meta\b[^>]*name=["']viewport["'][^>]*>)/i, `$1\n  ${fonts}`)
    : head.replace(/(<head\b[^>]*>)/i, `$1\n  ${fonts}`);

  // After the page styles: the minimum text sizes (readability.css), then the shell styles
  // (ID-scoped anyway), then the scripts. The language script stays synchronous and comes after
  // the hreflang links so it can read them before the first paint.
  const tail = [
    `<link rel="stylesheet" href="${ASSETS.uxCss}">`,
    ...(app ? [] : [`<link rel="stylesheet" href="${ASSETS.readabilityCss}">`]),
    `<link rel="stylesheet" href="${ASSETS.shellCss}">`,
    ...(app ? [`<link rel="stylesheet" href="${ASSETS.appShellCss}">`] : []),
    `<noscript><link rel="stylesheet" href="${ASSETS.nojsCss}"></noscript>`,
    `<script defer src="${ASSETS.navJs}"></script>`,
    `<script defer src="${ASSETS.uxJs}"></script>`,
    `<script defer src="${ASSETS.consentJs}"></script>`,
    `<script src="${ASSETS.languageJs}"></script>`
  ];
  head = `${head.replace(/\s*$/, "")}\n  ${tail.join("\n  ")}\n`;
  // Older copies of the shared scripts left at the end of <body> would load them a second time.
  let body = rest;
  for (const file of ["assets/js/unified-navigation.js", "assets/js/ux-improvements.js", "assets/js/consent.js", "assets/js/language-routing.js", "assets/js/site-shell.js"]) {
    body = body.replace(assetTag(file, file), "");
  }
  return head + body;
}

function renderShell(html, file) {
  const english = file.startsWith("en/");
  const route = "/" + file.replace(/index\.html$/, "");
  const app = file === APP_FILE;
  html = normaliseHead(html, { app });
  if (LEGAL_FILES.has(file)) {
    html = html.replace(/<body\b([^>]*)\bclass="([^"]*)"/i, (match, before, classes) => {
      const list = classes.split(/\s+/).filter(Boolean);
      for (const name of LEGAL_BODY_CLASSES) if (!list.includes(name)) list.push(name);
      return `<body${before}class="${list.join(" ")}"`;
    });
  }

  if (app) {
    const { headerMarkup, footerMarkup, headerOpen, footerOpen } = renderNavigationShell(route, english, "");
    const header = `${headerOpen}${headerMarkup}</header>`;
    const footer = `${footerOpen}${footerMarkup}</footer>`;
    const existingShell = /<header\b[^>]*\bid=["']site-header["'][^>]*>[\s\S]*?<\/header>\s*/i;
    html = existingShell.test(html) ? html.replace(existingShell, `${header}\n`) : html.replace(/(<body\b[^>]*>)/i, `$1\n${header}\n`);
    const existingFooter = /<footer\b[^>]*\bid=["']site-footer["'][^>]*>[\s\S]*?<\/footer>\s*/i;
    html = existingFooter.test(html)
      ? html.replace(existingFooter, `${footer}\n`)
      : html.replace(/(\s*<script>window\.__PRECONISATIONS_API_ORIGIN__)/, `\n${footer}$1`);
    return html;
  }

  const headerPattern = /<header\b[^>]*class="[^"]*\b(?:site-header|site-system-header)\b[^"]*"[^>]*>[\s\S]*?<\/header>|<nav\b[^>]*class="[^"]*\bnav glass\b[^"]*"[^>]*>[\s\S]*?<\/nav>/;
  const headerMatch = html.match(headerPattern);
  const pageNav = headerMatch?.[0].match(/<nav\b[^>]*class="page-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0] || "";
  const { headerMarkup, footerMarkup, headerOpen, footerOpen } = renderNavigationShell(route, english, pageNav);
  const header = `${headerOpen}${headerMarkup}</header>`;
  if (headerMatch) html = html.replace(headerMatch[0], header);
  else if (/<a\b[^>]*class="skip-link"[^>]*>[\s\S]*?<\/a>/.test(html)) html = html.replace(/(<a\b[^>]*class="skip-link"[^>]*>[\s\S]*?<\/a>)/, `$1\n  ${header}`);
  else html = html.replace(/(<body\b[^>]*>)/i, `$1\n  ${header}`);

  const footer = `${footerOpen}${footerMarkup}</footer>`;
  const footerPattern = /<footer\b[^>]*class="[^"]*\b(?:site-footer|site-system-footer)\b[^"]*"[^>]*>[\s\S]*?<\/footer>/;
  if (footerPattern.test(html)) html = html.replace(footerPattern, footer);
  else {
    // Legal pages and the 404 page end with a bare <footer> after <main>, or none at all.
    const bareFooter = /(<\/main>\s*)<footer>[\s\S]*?<\/footer>/i;
    html = bareFooter.test(html) ? html.replace(bareFooter, `$1${footer}`) : html.replace(/(<\/main>)/i, `$1\n  ${footer}`);
  }
  return html;
}

const files = [...INDEXABLE_FILES, ...SHELL_EXTRA_FILES];
for (const file of files) {
  const html = await readFile(file, "utf8");
  const next = renderShell(html, file);
  if (next !== html) await writeFile(file, next);
}
console.log(`Rendered site shell ${NAVIGATION_VERSION} on ${files.length} pages.`);
