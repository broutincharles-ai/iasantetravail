import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "newsletter-backend", "node_modules"]);

async function files(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
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
const bilingualPages = new Map([
  ["index.html", "en/index.html"],
  ["comprendre/index.html", "en/understand/index.html"],
  ["usages-terrain/index.html", "en/uses-and-field/index.html"],
  ["risques-prevention/index.html", "en/risks-prevention/index.html"],
  ["evaluer/index.html", "en/evaluate/index.html"],
  ["evaluer/impact/index.html", "en/evaluate/impact/index.html"],
  ["droit-gouvernance/index.html", "en/legal-governance/index.html"],
  ["usages-terrain/exemple-sante-travail/index.html", "en/uses-and-field/occupational-health-example/index.html"],
  ["ai-safety-agi/index.html", "en/ai-safety-agi/index.html"],
  ["a-propos/index.html", "en/about/index.html"]
]);

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
  return tag?.match(/content=["']([^"']*)/i)?.[1] || "";
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const markup = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${path.relative(root, file)}: duplicate id(s): ${duplicates.join(", ")}`);

  const isRedirect = /\bnoindex\b/i.test(html) || /http-equiv=["']refresh["']/i.test(html);
  if (!isRedirect) {
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
  if (/\bnoindex\b/i.test(html) || /http-equiv=["']refresh["']/i.test(html)) continue;
  const hasSharedShell = /site-shell\.js/.test(html);
  const hasInlineShell = /<header\b[^>]*class=["'][^"']*\bsite-header\b/i.test(html)
    && /<footer\b[^>]*class=["'][^"']*\bsite-footer\b/i.test(html);
  if (!hasSharedShell && !hasInlineShell) errors.push(`${path.relative(root, file)}: navigation shell missing`);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1].replace(/&amp;/g, "&").trim() || "";
  const description = metaContent(html, "description").trim();
  const documentMarkup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const h1Count = [...documentMarkup.matchAll(/<h1\b/gi)].length;
  if (!title) errors.push(`${path.relative(root, file)}: title missing`);
  else if (title.length > 70) errors.push(`${path.relative(root, file)}: title is ${title.length} characters; keep it at 70 or fewer`);
  if (!description) errors.push(`${path.relative(root, file)}: meta description missing`);
  else if (description.length > 180) errors.push(`${path.relative(root, file)}: meta description is ${description.length} characters; keep it at 180 or fewer`);
  if (h1Count !== 1) errors.push(`${path.relative(root, file)}: expected exactly one h1, found ${h1Count}`);
  if (!/<link[^>]+rel=["']canonical["']/i.test(html) && !file.endsWith("404.html")) errors.push(`${path.relative(root, file)}: canonical missing`);
}

for (const [frPage, enPage] of bilingualPages) {
  for (const [relative, lang] of [[frPage, "fr"], [enPage, "en"]]) {
    const html = await cachedHtml(path.join(root, relative));
    const documentMarkup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const h1Count = [...documentMarkup.matchAll(/<h1\b/gi)].length;
    if (h1Count !== 1) errors.push(`${relative}: expected exactly one h1, found ${h1Count}`);
    if (!new RegExp(`<html[^>]+lang=["']${lang}["']`, "i").test(html)) errors.push(`${relative}: html lang must be ${lang}`);
    if (!/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']fr["']/i.test(html)) errors.push(`${relative}: French hreflang missing`);
    if (!/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']en["']/i.test(html)) errors.push(`${relative}: English hreflang missing`);
    const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0] || "";
    if (/<style\b/i.test(head)) errors.push(`${relative}: inline head style should be consolidated into shared CSS`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${htmlFiles.length} HTML and ${cssFiles.length} CSS files, ${checkedLinks} local references, no duplicate IDs.`);
}
