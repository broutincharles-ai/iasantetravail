// Writes a small redirect page at every retired address, so old links and bookmarks keep working
// on GitHub Pages (which has no server-side redirects).  node scripts/create-redirects.mjs
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const researchNotes = [
  "ai-changes-work-before-employment", "ai-expands-the-job", "ai-managers-work",
  "compliance-does-not-make-deployment-safe", "france-ai-occupational-health", "hidden-work-created-by-ai",
  "managers-misread-ai-productivity", "occupational-health-ai-prevention", "occupational-health-ai-safety",
  "responsibility-for-safe-ai-deployment"
];
// Research notes whose subject now has its own reading.
const researchToReading = {
  "ai-managers-work": ["/lecture/management-agentique/", "/en/reading/agentic-management/"],
  "ai-expands-the-job": ["/lecture/frontieres-metiers-ia/", "/en/reading/ai-occupational-boundaries/"]
};

const redirects = {
  "apropos/index.html": "/a-propos/",
  "modeles/index.html": "/comprendre/",
  "risques/index.html": "/risques-prevention/",
  "impact/index.html": "/evaluer/",
  "impact/suivi.html": "/evaluer/",
  "evaluer/benchmark/index.html": "/comprendre/#benchmarks",
  "en/evaluate/benchmark/index.html": "/en/understand/#benchmarks",
  "legislation/index.html": "/droit-gouvernance/",
  "usages-terrain/index.html": "/evaluer/",
  "usages-terrain/avant-deploiement/index.html": "/evaluer/",
  "usages-terrain/retours-terrain/index.html": "/evaluer/",
  "usages-terrain/exemple-sante-travail/index.html": "/ia-en-spst/",
  "pratique/index.html": "/ia-en-spst/",
  "terrain/index.html": "/ia-en-spst/",
  "macroeconomie/index.html": "/risques-prevention/economique-social/",
  "accompagner-en-amont/index.html": "/ia-en-spst/",
  "en-pratique/index.html": "/ia-en-spst/",
  "ia-préconisations/index.html": "/ia-en-spst/",
  "ia-rps/index.html": "/risques-prevention/psychosociaux/",
  "les-llms/index.html": "/comprendre/",
  "intelligence-artificielle/index.html": "/comprendre/",
  "le-prompting/index.html": "/comprendre/",
  "recommandations-has-2025/index.html": "/ia-en-spst/",
  "l-ia-facteur-de-bien-etre/index.html": "/risques-prevention/",
  "ia-santé-au-travail/index.html": "/",
  "ai-safety-agi/index.html": "/comprendre/",
  "en/ai-safety-agi/index.html": "/en/understand/",
  // October 2026: one assessment tool instead of two (same 18 questions).
  "evaluer/impact/index.html": "/evaluer/",
  "evaluer/impact/suivi.html": "/evaluer/",
  "en/evaluate/impact/index.html": "/en/evaluate/",
  "en/evaluate/impact/follow-up.html": "/en/evaluate/",
  // October 2026: pages outside the navigation, merged into existing sections.
  "ressources/modeles/index.html": "/comprendre/#benchmarks",
  "en/resources/models/index.html": "/en/understand/#benchmarks",
  "en/uses-and-field/index.html": "/en/evaluate/",
  "en/uses-and-field/before-deployment/index.html": "/en/evaluate/",
  "en/uses-and-field/after-deployment/index.html": "/en/evaluate/",
  "research/index.html": "/lecture/",
  "en/research/index.html": "/en/reading/",
  ...Object.fromEntries(researchNotes.flatMap(note => [
    [`research/${note}/index.html`, researchToReading[note]?.[0] || "/lecture/"],
    [`en/research/${note}/index.html`, researchToReading[note]?.[1] || "/en/reading/"]
  ]))
};

// Assets that only served the retired pages.
const retiredAssetDirectories = ["evaluer/impact/assets", "en/evaluate/impact/assets"];

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
for (const directory of retiredAssetDirectories) await rm(path.join(root, directory), { recursive: true, force: true });
console.log(`Wrote ${Object.keys(redirects).length} redirect pages.`);
