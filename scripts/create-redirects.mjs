import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const redirects = {
  "apropos/index.html": "/a-propos/",
  "modeles/index.html": "/comprendre/",
  "risques/index.html": "/risques-prevention/",
  "impact/index.html": "/evaluer/",
  "impact/suivi.html": "/evaluer/",
  "evaluer/benchmark/index.html": "/comprendre/#benchmarks",
  "en/evaluate/benchmark/index.html": "/en/understand/#benchmarks",
  "legislation/index.html": "/droit-gouvernance/",
  "pratique/index.html": "/usages-terrain/exemple-sante-travail/",
  "terrain/index.html": "/usages-terrain/exemple-sante-travail/",
  "macroeconomie/index.html": "/risques-prevention/economique-social/",
  "accompagner-en-amont/index.html": "/usages-terrain/exemple-sante-travail/",
  "en-pratique/index.html": "/usages-terrain/exemple-sante-travail/",
  "ia-préconisations/index.html": "/usages-terrain/exemple-sante-travail/",
  "ia-rps/index.html": "/risques-prevention/psychosociaux/",
  "les-llms/index.html": "/comprendre/",
  "labor-ia/index.html": "/risques-prevention/",
  "intelligence-artificielle/index.html": "/comprendre/",
  "le-prompting/index.html": "/comprendre/",
  "recommandations-has-2025/index.html": "/usages-terrain/exemple-sante-travail/",
  "l-ia-facteur-de-bien-etre/index.html": "/risques-prevention/",
  "ia-santé-au-travail/index.html": "/",
  "ai-safety-agi/index.html": "/comprendre/",
  "en/ai-safety-agi/index.html": "/en/understand/",
  "research/occupational-health-ai-safety/index.html": "/lecture/",
  "en/research/occupational-health-ai-safety/index.html": "/en/reading/"
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
