export const INDEXABLE_PAIRS = [
  { fr: "index.html", en: "en/index.html", lastmod: "2026-08-20" },
  { fr: "comprendre/index.html", en: "en/understand/index.html", lastmod: "2026-08-20" },
  { fr: "risques-prevention/index.html", en: "en/risks-prevention/index.html", lastmod: "2026-08-20" },
  { fr: "evaluer/index.html", en: "en/evaluate/index.html", lastmod: "2026-08-20" },
  { fr: "droit-gouvernance/index.html", en: "en/legal-governance/index.html", lastmod: "2026-08-20" },
  { fr: "usages-terrain/exemple-sante-travail/index.html", en: "en/uses-and-field/occupational-health-example/index.html", lastmod: "2026-08-20" },
  { fr: "lecture/index.html", en: "en/reading/index.html", lastmod: "2026-08-20" },
  { fr: "a-propos/index.html", en: "en/about/index.html", lastmod: "2026-08-20" }
];

export const INDEXABLE_FILES = new Set(INDEXABLE_PAIRS.flatMap(({ fr, en }) => [fr, en]));

export function publicUrl(relative) {
  return `https://www.iasantetravail.com/${relative.replace(/index\.html$/, "")}`;
}
