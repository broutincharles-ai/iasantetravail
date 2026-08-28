export const INDEXABLE_PAIRS = [
  { fr: "index.html", en: "en/index.html", lastmod: "2026-08-28" },
  { fr: "comprendre/index.html", en: "en/understand/index.html", lastmod: "2026-08-20" },
  { fr: "risques-prevention/psychosociaux/index.html", en: "en/risks-prevention/index.html", lastmod: "2026-08-27" },
  { fr: "evaluer/index.html", en: "en/evaluate/index.html", lastmod: "2026-08-20" },
  { fr: "droit-gouvernance/index.html", en: "en/legal-governance/index.html", lastmod: "2026-08-20" },
  { fr: "usages-terrain/exemple-sante-travail/index.html", en: "en/uses-and-field/occupational-health-example/index.html", lastmod: "2026-08-28" },
  { fr: "lecture/index.html", en: "en/reading/index.html", lastmod: "2026-08-27" },
  { fr: "a-propos/index.html", en: "en/about/index.html", lastmod: "2026-08-20" }
];

export const INDEXABLE_SINGLETONS = [
  { file: "risques-prevention/index.html", lang: "fr", lastmod: "2026-08-27" },
  { file: "risques-prevention/economique-social/index.html", lang: "fr", lastmod: "2026-08-16" },
  { file: "lecture/agents-ia-workaholisme/index.html", lang: "fr", lastmod: "2026-08-24" },
  { file: "lecture/frontieres-metiers-ia/index.html", lang: "fr", lastmod: "2026-07-27" },
  { file: "lecture/ia-deploiement-travail-reel/index.html", lang: "fr", lastmod: "2026-07-16" },
  { file: "lecture/ia-sens-metier-mathematiques/index.html", lang: "fr", lastmod: "2026-07-25" },
  { file: "lecture/management-agentique/index.html", lang: "fr", lastmod: "2026-08-04" },
  { file: "lecture/travailleurs-ia-risques-psychosociaux/index.html", lang: "fr", lastmod: "2026-08-27" },
  { file: "cse/index.html", lang: "fr", lastmod: "2026-08-28" }
];

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
