import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "agents/index.html");
const pageDirectory = path.dirname(pagePath);
const fontsDirectory = path.join(root, "assets/fonts");

await mkdir(pageDirectory, { recursive: true });
await mkdir(fontsDirectory, { recursive: true });

let html = await readFile(pagePath, "utf8");

function decodeDataUri(uri) {
  const match = uri.match(/^data:([^;,]+)(;base64)?,([\s\S]*)$/);
  if (!match) throw new Error("Unsupported data URI");
  return match[2]
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");
}

const fontFaces = [...html.matchAll(/@font-face\s*\{[\s\S]*?\}/g)];
for (const match of fontFaces) {
  const block = match[0];
  const uri = block.match(/url\((data:font\/ttf;base64,[^)]+)\)/)?.[1];
  if (!uri) continue;
  const family = block.match(/font-family:\s*['"]?([^;'"\n]+)/)?.[1]?.trim();
  const weight = block.match(/font-weight:\s*([^;\n]+)/)?.[1]?.trim();
  if (!family || !weight) throw new Error("Font metadata is incomplete");
  const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `${slug}-${weight}.ttf`;
  await writeFile(path.join(fontsDirectory, filename), decodeDataUri(uri));
  html = html.replace(uri, `/assets/fonts/${filename}`);
}

const embeddedLogo = html.match(/data:image\/png;base64,[^"')\s]+/)?.[0];
if (embeddedLogo) {
  const existingLogo = await readFile(path.join(root, "assets/images/logo.png"));
  const decodedLogo = decodeDataUri(embeddedLogo);
  if (!decodedLogo.equals(existingLogo)) {
    throw new Error("The embedded logo does not match assets/images/logo.png");
  }
  html = html.replace(embeddedLogo, "/assets/images/logo.png");
}

for (const match of [...html.matchAll(/<a\b[^>]*>/gi)]) {
  const tag = match[0];
  const filename = tag.match(/\bdownload=["']([^"']+)["']/i)?.[1];
  const uri = tag.match(/\bhref=["'](data:[^"']+)["']/i)?.[1];
  if (!filename || !uri) continue;
  const publicPath = filename === "llms.txt" ? "/llms.txt" : `/agents/${filename}`;
  if (filename !== "llms.txt") {
    await writeFile(path.join(pageDirectory, filename), decodeDataUri(uri));
  }
  html = html.replace(tag, tag.replace(uri, publicPath));
}

const describedBy = '<link rel="describedby" type="text/plain" href="/llms.txt">';
const alternates = [
  '<link rel="alternate" type="application/json" href="/agents/ai-manager-resources.json">',
  '<link rel="alternate" type="text/markdown" href="/agents/ai-manager-questions-en.md" title="English Markdown">',
  '<link rel="alternate" type="text/markdown" href="/agents/ai-manager-questions-fr.md" title="Markdown français">'
].join("");
if (!html.includes('/agents/ai-manager-resources.json">')) {
  html = html.replace(describedBy, describedBy + alternates);
}

html = html
  .replace(
    "The page and its downloads work offline. Search and copy are optional conveniences. The downloadable site index includes the intended /agents/ address; add that entry to the live index after publishing the page.",
    "The page and its downloads are available without JavaScript. Search and copy are optional conveniences. The live agent index is available at /llms.txt."
  )
  .replace(
    "La page et ses téléchargements fonctionnent hors ligne. La recherche et la copie sont des fonctions complémentaires. L’index téléchargeable contient l’adresse prévue /agents/ ; ajoutez cette entrée à l’index en ligne après publication de la page.",
    "La page et ses téléchargements sont disponibles sans JavaScript. La recherche et la copie sont des fonctions complémentaires. L’index agents en ligne est disponible à l’adresse /llms.txt."
  );

await writeFile(pagePath, html);
