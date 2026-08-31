export const INDEXABLE_PAIRS = [
  { fr: "index.html", en: "en/index.html", lastmod: "2026-08-22" },
  { fr: "comprendre/index.html", en: "en/understand/index.html", lastmod: "2026-08-20" },
  { fr: "risques-prevention/index.html", en: "en/risks/index.html", lastmod: "2026-08-30" },
  { fr: "risques-prevention/psychosociaux/index.html", en: "en/risks-prevention/index.html", lastmod: "2026-08-30" },
  { fr: "risques-prevention/economique-social/index.html", en: "en/risks/economic-social/index.html", lastmod: "2026-08-30" },
  { fr: "evaluer/index.html", en: "en/evaluate/index.html", lastmod: "2026-08-20" },
  { fr: "droit-gouvernance/index.html", en: "en/legal-governance/index.html", lastmod: "2026-08-30" },
  { fr: "usages-terrain/exemple-sante-travail/index.html", en: "en/uses-and-field/occupational-health-example/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/index.html", en: "en/reading/index.html", lastmod: "2026-08-31" },
  { fr: "lecture/ingenierie-code-ia/index.html", en: "en/reading/engineering-ai-code/index.html", lastmod: "2026-08-31" },
  { fr: "lecture/agents-ia-workaholisme/index.html", en: "en/reading/ai-agents-workaholism/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/frontieres-metiers-ia/index.html", en: "en/reading/ai-occupational-boundaries/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/ia-deploiement-travail-reel/index.html", en: "en/reading/ai-deployment-real-work/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/ia-sens-metier-mathematiques/index.html", en: "en/reading/ai-meaning-work-mathematics/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/management-agentique/index.html", en: "en/reading/agentic-management/index.html", lastmod: "2026-08-30" },
  { fr: "lecture/travailleurs-ia-risques-psychosociaux/index.html", en: "en/reading/ai-workers-psychosocial-risks/index.html", lastmod: "2026-08-30" },
  { fr: "cse/index.html", en: "en/cse/index.html", lastmod: "2026-08-30" },
  { fr: "a-propos/index.html", en: "en/about/index.html", lastmod: "2026-08-20" },
  { fr: "methode-editoriale/index.html", en: "en/editorial-method/index.html", lastmod: "2026-08-30" }
];

export const INDEXABLE_SINGLETONS = [];

export const INDEXABLE_FR_FILES = [
  ...INDEXABLE_PAIRS.map(({ fr }) => fr),
  ...INDEXABLE_SINGLETONS.filter(({ lang }) => lang === "fr").map(({ file }) => file)
];

export const INDEXABLE_EN_FILES = [
  ...INDEXABLE_PAIRS.map(({ en }) => en),
  ...INDEXABLE_SINGLETONS.filter(({ lang }) => lang === "en").map(({ file }) => file)
];

export const INDEXABLE_FILES = new Set([
  ...INDEXABLE_PAIRS.flatMap(({ fr, en }) => [fr, en]),
  ...INDEXABLE_SINGLETONS.map(({ file }) => file)
]);

export function publicUrl(relative) {
  return `https://www.iasantetravail.com/${relative.replace(/index\.html$/, "")}`;
}
