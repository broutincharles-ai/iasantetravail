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

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const markup = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${path.relative(root, file)}: duplicate id(s): ${duplicates.join(", ")}`);

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

const canonicalHtml = htmlFiles.filter(file => !/\bnoindex\b/i.test(String(file)));
for (const file of canonicalHtml) {
  const html = await readFile(file, "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) continue;
  if (!/site-shell\.js/.test(html)) errors.push(`${path.relative(root, file)}: shared site shell missing`);
  if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) errors.push(`${path.relative(root, file)}: title missing`);
  if (!/<meta[^>]+name=["']description["']/i.test(html)) errors.push(`${path.relative(root, file)}: meta description missing`);
  if (!/<link[^>]+rel=["']canonical["']/i.test(html) && !file.endsWith("404.html")) errors.push(`${path.relative(root, file)}: canonical missing`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${htmlFiles.length} HTML and ${cssFiles.length} CSS files, ${checkedLinks} local references, no duplicate IDs.`);
}
