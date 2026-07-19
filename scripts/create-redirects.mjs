import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const redirects = {
  "apropos/index.html": "/a-propos/",
  "modeles/index.html": "/ressources/modeles/",
  "risques/index.html": "/risques-prevention/",
  "impact/index.html": "/evaluer/impact/",
  "impact/suivi.html": "/evaluer/impact/suivi.html",
  "evaluer/benchmark/index.html": "/evaluer/#capacites",
  "en/evaluate/benchmark/index.html": "/en/evaluate/#capabilities",
  "legislation/index.html": "/droit-gouvernance/",
  "pratique/index.html": "/usages-terrain/",
  "terrain/index.html": "/usages-terrain/retours-terrain/",
  "macroeconomie/index.html": "/comprendre/",
  "labor-ia/index.html": "/usages-terrain/"
};

for (const [file, destination] of Object.entries(redirects)) {
  const absolute = path.join(root, file);
  await mkdir(path.dirname(absolute), { recursive: true });
  const canonical = `https://www.iasantetravail.com${destination.split("#")[0]}`;
  const isEnglish = destination.startsWith("/en/");
  const html = `<!doctype html>
<html lang="${isEnglish ? "en" : "fr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=${destination}">
  <link rel="canonical" href="${canonical}">
  <title>${isEnglish ? "Content moved — AI & Occupational Health" : "Contenu déplacé — IA & Santé au Travail"}</title>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
</head>
<body><p>${isEnglish ? `This content has moved. <a href="${destination}">Continue to the new address</a>.` : `Ce contenu a été déplacé. <a href="${destination}">Continuer vers la nouvelle adresse</a>.`}</p></body>
</html>
`;
  await writeFile(absolute, html, "utf8");
}
