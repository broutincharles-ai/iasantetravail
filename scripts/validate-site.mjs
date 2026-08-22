import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  INDEXABLE_EN_FILES,
  INDEXABLE_FILES,
  INDEXABLE_FR_FILES,
  INDEXABLE_PAIRS,
  publicUrl
} from "./indexing-scope.mjs";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "newsletter-backend", "node_modules"]);

async function files(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name) || entry.name.startsWith("demo-")) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(absolute));
    else result.push(absolute);
  }
  return result;
}

const allFiles = await files();
const htmlFiles = allFiles.filter(file => file.endsWith(".html"));
const cssFiles = allFiles.filter(file => file.endsWith(".css"));
const errors = [];
let checkedLinks = 0;
const htmlCache = new Map();
const indexableTitles = new Map();
const indexableDescriptions = new Map();
const bilingualPages = new Map(INDEXABLE_PAIRS.map(({ fr, en }) => [fr, en]));

async function cachedHtml(file) {
  if (!htmlCache.has(file)) htmlCache.set(file, await readFile(file, "utf8"));
  return htmlCache.get(file);
}

function targetPath(source, raw) {
  const clean = raw.split("#")[0].split("?")[0];
  if (!clean) return null;
  const decoded = decodeURIComponent(clean);
  const absolute = decoded.startsWith("/")
    ? path.join(root, decoded)
    : path.resolve(path.dirname(source), decoded);
  return path.extname(absolute) ? absolute : path.join(absolute, "index.html");
}

function metaContent(html, name) {
  const tag = (html.match(/<meta\b[^>]*>/gi) || [])
    .find(candidate => new RegExp(`name=["']${name}["']`, "i").test(candidate));
  return tag?.match(/content=(["'])([\s\S]*?)\1/i)?.[2] || "";
}

function metadataCount(head, attribute, value) {
  return (head.match(new RegExp(`<meta\\b(?=[^>]*${attribute}=["']${value}["'])[^>]*>`, "gi")) || []).length;
}

function linkCount(head, rel) {
  return (head.match(new RegExp(`<link\\b(?=[^>]*rel=["']${rel}["'])[^>]*>`, "gi")) || []).length;
}

function linkHref(head, rel) {
  const tag = (head.match(/<link\b[^>]*>/gi) || [])
    .find(candidate => new RegExp(`rel=["']${rel}["']`, "i").test(candidate));
  return tag?.match(/href=["']([^"']*)/i)?.[1] || "";
}

function alternateHref(head, lang) {
  const tag = (head.match(/<link\b[^>]*>/gi) || [])
    .find(candidate => /rel=["']alternate["']/i.test(candidate) && new RegExp(`hreflang=["']${lang}["']`, "i").test(candidate));
  return tag?.match(/href=["']([^"']*)/i)?.[1] || "";
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(root, file).split(path.sep).join("/");
  const markup = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${path.relative(root, file)}: duplicate id(s): ${duplicates.join(", ")}`);

  const hasNoindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const shouldIndex = INDEXABLE_FILES.has(relative);
  if (shouldIndex && hasNoindex) errors.push(`${relative}: allowlisted page must be indexable`);
  if (!shouldIndex && !hasNoindex) errors.push(`${relative}: page outside the indexable allowlist must be noindex`);
  if (shouldIndex) {
    const googleTagLoaders = [...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=G-RKEJVY4XVC/g)].length;
    const googleTagConfigs = [...html.matchAll(/gtag\(['"]config['"],\s*['"]G-RKEJVY4XVC['"]\)/g)].length;
    if (googleTagLoaders !== 1 || googleTagConfigs !== 1) {
      errors.push(`${path.relative(root, file)}: expected exactly one Google tag, found ${googleTagLoaders} loader(s) and ${googleTagConfigs} config(s)`);
    }
  }

  for (const match of markup.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const raw = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(raw)) continue;
    const target = targetPath(file, raw);
    if (!target) continue;
    checkedLinks += 1;
    try {
      await access(target);
    } catch {
      errors.push(`${path.relative(root, file)}: missing ${raw}`);
      continue;
    }
    const fragment = raw.includes("#") ? decodeURIComponent(raw.split("#")[1].split("?")[0]) : "";
    if (fragment && target.endsWith(".html")) {
      const targetHtml = await cachedHtml(target);
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\bid=["']${escaped}["']`, "i").test(targetHtml)) {
        errors.push(`${path.relative(root, file)}: missing fragment #${fragment} in ${path.relative(root, target)}`);
      }
    }
  }

  for (const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(block[1]);
    } catch {
      errors.push(`${path.relative(root, file)}: invalid JSON-LD`);
    }
  }
}

for (const file of cssFiles) {
  const css = await readFile(file, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const raw = match[1].trim();
    if (/^(?:https?:|data:|#|%23)/i.test(raw)) continue;
    const target = targetPath(file, raw);
    if (!target) continue;
    checkedLinks += 1;
    try {
      await access(target);
    } catch {
      errors.push(`${path.relative(root, file)}: missing ${raw}`);
    }
  }
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (!INDEXABLE_FILES.has(relative)) continue;
  const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0] || "";
  const hasSharedShell = /site-shell\.js/.test(html);
  const hasInlineShell = /<header\b[^>]*class=["'][^"']*\bsite-header\b/i.test(html)
    && /<footer\b[^>]*class=["'][^"']*\bsite-footer\b/i.test(html);
  if (!hasSharedShell && !hasInlineShell) errors.push(`${path.relative(root, file)}: navigation shell missing`);
  const titleCount = [...head.matchAll(/<title\b/gi)].length;
  const descriptionCount = metadataCount(head, "name", "description");
  const canonicalCount = linkCount(head, "canonical");
  const title = head.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1].replace(/&amp;/g, "&").trim() || "";
  const description = metaContent(head, "description").trim();
  const documentMarkup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const h1Count = [...documentMarkup.matchAll(/<h1\b/gi)].length;
  if (titleCount !== 1) errors.push(`${path.relative(root, file)}: expected exactly one title in head, found ${titleCount}`);
  if (descriptionCount !== 1) errors.push(`${path.relative(root, file)}: expected exactly one meta description, found ${descriptionCount}`);
  if (canonicalCount !== 1 && !file.endsWith("404.html")) errors.push(`${path.relative(root, file)}: expected exactly one canonical, found ${canonicalCount}`);
  if (!title) errors.push(`${path.relative(root, file)}: title missing`);
  else if (title.length > 70) errors.push(`${path.relative(root, file)}: title is ${title.length} characters; keep it at 70 or fewer`);
  if (!description) errors.push(`${path.relative(root, file)}: meta description missing`);
  else if (description.length > 180) errors.push(`${path.relative(root, file)}: meta description is ${description.length} characters; keep it at 180 or fewer`);
  if (title) {
    if (indexableTitles.has(title)) errors.push(`${relative}: duplicate title also used by ${indexableTitles.get(title)}`);
    else indexableTitles.set(title, relative);
  }
  if (description) {
    if (indexableDescriptions.has(description)) errors.push(`${relative}: duplicate meta description also used by ${indexableDescriptions.get(description)}`);
    else indexableDescriptions.set(description, relative);
  }
  if (h1Count !== 1) errors.push(`${path.relative(root, file)}: expected exactly one h1, found ${h1Count}`);
  const requiredSocialMetadata = [
    ["property", "og:title"], ["property", "og:description"], ["property", "og:url"],
    ["property", "og:type"], ["property", "og:site_name"], ["name", "twitter:card"],
    ["name", "twitter:title"], ["name", "twitter:description"]
  ];
  for (const [attribute, value] of requiredSocialMetadata) {
    const count = metadataCount(head, attribute, value);
    if (count !== 1) errors.push(`${path.relative(root, file)}: expected exactly one ${value}, found ${count}`);
  }
  const canonical = linkHref(head, "canonical");
  if (canonical && !canonical.startsWith("https://www.iasantetravail.com/")) {
    errors.push(`${path.relative(root, file)}: canonical must use the absolute www HTTPS domain`);
  }
  const ogUrl = metaContent(head.replaceAll("property=", "name="), "og:url");
  if (canonical && ogUrl && canonical !== ogUrl) errors.push(`${path.relative(root, file)}: og:url must match canonical`);
  if (/(?:ai[ -]?safety|sécurité (?:de l[’']ia|ia)|agi safety|frontier ai)/i.test(html)) {
    errors.push(`${path.relative(root, file)}: legacy AI-safety positioning remains in indexable content`);
  }
}

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
if (!/^Sitemap: https:\/\/www\.iasantetravail\.com\/sitemap\.xml$/m.test(robots)) {
  errors.push("robots.txt: canonical sitemap declaration missing");
}
if (/Disallow:\s*\/$/m.test(robots)) errors.push("robots.txt: site root must not be blocked");

const languageRouting = await readFile(path.join(root, "assets/js/language-routing.js"), "utf8");
if (/\blocation\.(?:replace|assign)\s*\(|\blocation\.href\s*=/.test(languageRouting)) {
  errors.push("assets/js/language-routing.js: explicit language URLs must not redirect automatically");
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const expectedSitemapUrls = new Set([...INDEXABLE_FILES].map(publicUrl));
const actualSitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));
for (const expected of expectedSitemapUrls) {
  if (!actualSitemapUrls.has(expected)) errors.push(`sitemap.xml: allowlisted URL missing: ${expected}`);
}
for (const actual of actualSitemapUrls) {
  if (!expectedSitemapUrls.has(actual)) errors.push(`sitemap.xml: URL outside the indexable allowlist: ${actual}`);
}
if (actualSitemapUrls.size !== expectedSitemapUrls.size) errors.push(`sitemap.xml: expected exactly ${expectedSitemapUrls.size} URLs, found ${actualSitemapUrls.size}`);

for (const [indexFile, languageFiles] of [
  ["assets/js/search-index.js", INDEXABLE_FR_FILES],
  ["assets/js/search-index-en.js", INDEXABLE_EN_FILES]
]) {
  const source = await readFile(path.join(root, indexFile), "utf8");
  const records = JSON.parse(source.replace(/^window\.SEARCH_INDEX\s*=\s*/, "").replace(/;\s*$/, ""));
  const expectedUrls = new Set(languageFiles.map(relative => relative === "index.html" ? "" : relative.replace(/index\.html$/, "")));
  const actualUrls = new Set(records.map(record => record.url));
  if (records.length !== languageFiles.length) errors.push(`${indexFile}: expected exactly ${languageFiles.length} pages, found ${records.length}`);
  for (const expected of expectedUrls) if (!actualUrls.has(expected)) errors.push(`${indexFile}: missing ${expected || "/"}`);
  for (const actual of actualUrls) if (!expectedUrls.has(actual)) errors.push(`${indexFile}: unexpected ${actual}`);
}

for (const [frPage, enPage] of bilingualPages) {
  const expected = { fr: publicUrl(frPage), en: publicUrl(enPage) };
  for (const [relative, lang] of [[frPage, "fr"], [enPage, "en"]]) {
    const html = await cachedHtml(path.join(root, relative));
    const documentMarkup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const h1Count = [...documentMarkup.matchAll(/<h1\b/gi)].length;
    if (h1Count !== 1) errors.push(`${relative}: expected exactly one h1, found ${h1Count}`);
    if (!new RegExp(`<html[^>]+lang=["']${lang}["']`, "i").test(html)) errors.push(`${relative}: html lang must be ${lang}`);
    const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0] || "";
    if (!alternateHref(head, "fr")) errors.push(`${relative}: French hreflang missing`);
    if (!alternateHref(head, "en")) errors.push(`${relative}: English hreflang missing`);
    if (alternateHref(head, "fr") !== expected.fr) errors.push(`${relative}: French hreflang must point to ${expected.fr}`);
    if (alternateHref(head, "en") !== expected.en) errors.push(`${relative}: English hreflang must point to ${expected.en}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${htmlFiles.length} HTML and ${cssFiles.length} CSS files, ${checkedLinks} local references, no duplicate IDs.`);
}
