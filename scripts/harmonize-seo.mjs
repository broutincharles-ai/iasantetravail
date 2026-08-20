import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

function metaContent(head, attribute, value) {
  const tag = (head.match(/<meta\b[^>]*>/gi) || [])
    .find(candidate => new RegExp(`${attribute}=["']${value}["']`, "i").test(candidate));
  return tag?.match(/content=["']([^"']*)/i)?.[1] || "";
}

function insertBefore(head, pattern, markup) {
  const match = head.match(pattern);
  if (!match) return head.replace(/<\/head>/i, `${markup}\n</head>`);
  return head.replace(match[0], `${markup}\n${match[0]}`);
}

let changed = 0;

for (const file of await htmlFiles()) {
  const html = await readFile(file, "utf8");
  if (/\bnoindex\b/i.test(html) || /http-equiv=["']refresh["']/i.test(html)) continue;

  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  if (!headMatch) continue;
  let head = headMatch[0];

  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() || "";
  const description = metaContent(head, "name", "description");
  const ogTitle = metaContent(head, "property", "og:title") || title;
  const ogDescription = metaContent(head, "property", "og:description") || description;

  const siteNameTag = '<meta property="og:site_name" content="IA Santé Travail">';
  if (/property=["']og:site_name["']/i.test(head)) {
    head = head.replace(/<meta\b(?=[^>]*property=["']og:site_name["'])[^>]*>/i, siteNameTag);
  } else {
    head = insertBefore(head, /<meta\b(?=[^>]*property=["']og:title["'])[^>]*>/i, siteNameTag);
  }

  if (!/name=["']twitter:title["']/i.test(head)) {
    head = insertBefore(head, /<script\b[^>]*type=["']application\/ld\+json["']/i, `  <meta name="twitter:title" content="${ogTitle}">`);
  }
  if (!/name=["']twitter:description["']/i.test(head)) {
    head = insertBefore(head, /<script\b[^>]*type=["']application\/ld\+json["']/i, `  <meta name="twitter:description" content="${ogDescription}">`);
  }

  const next = html.replace(headMatch[0], head);
  if (next !== html) {
    await writeFile(file, next, "utf8");
    changed += 1;
  }
}

console.log(`SEO metadata harmonized in ${changed} HTML file(s).`);
