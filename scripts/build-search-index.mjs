import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "newsletter-backend", "node_modules"]);

async function htmlFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(absolute));
    else if (entry.name.endsWith(".html")) files.push(absolute);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function text(value) {
  return decodeEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html, expression) {
  return text(html.match(expression)?.[1] || "");
}

function publicUrl(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (relative === "index.html") return "";
  return relative.endsWith("/index.html")
    ? relative.slice(0, -"index.html".length)
    : relative;
}

const records = [];
for (const file of await htmlFiles()) {
  const html = await readFile(file, "utf8");
  if (/name=["']robots["'][^>]+noindex/i.test(html) || /http-equiv=["']refresh["']/i.test(html)) continue;
  const url = publicUrl(file);
  if (url === "404.html") continue;

  const language = html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1]?.toLowerCase() || "fr";
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+[—|]\s+(?:IA & Santé au Travail|AI & Occupational Health).*$/i, "");
  const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
    || match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  const keywords = text(main).slice(0, 2600);
  if (title) records.push({ language, title, description, keywords, url });
}

records.sort((a, b) => a.url.localeCompare(b.url, "fr"));
const french = records.filter(item => !item.language.startsWith("en")).map(({ language, ...item }) => item);
const english = records.filter(item => item.language.startsWith("en")).map(({ language, ...item }) => item);

await writeFile(path.join(root, "assets/js/search-index.js"), `window.SEARCH_INDEX = ${JSON.stringify(french)};\n`, "utf8");
await writeFile(path.join(root, "assets/js/search-index-en.js"), `window.SEARCH_INDEX = ${JSON.stringify(english)};\n`, "utf8");
console.log(`Search index: ${french.length} French pages, ${english.length} English pages.`);
