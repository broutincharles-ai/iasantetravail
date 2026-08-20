import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "lecture/index.html");
const destination = path.join(root, "en/reading/index.html");
let html = await readFile(source, "utf8");

const replacements = [
  ['<html lang="fr">', '<html lang="en">'],
  ["Lecture — Suivre ce qui change", "Reading — Track what is changing"],
  ["Une chronologie évolutive des travaux, signaux et expériences qui permettent de suivre la transformation progressive du travail, des organisations et de l’économie.", "An evolving timeline of research, signals and experiments for tracking how work, organisations and the economy are changing."],
  ['<meta name="author" content="Dr Charles Broutin">', '<meta name="author" content="Dr Charles Broutin">'],
  ['<link rel="canonical" href="https://www.iasantetravail.com/lecture/">', '<link rel="canonical" href="https://www.iasantetravail.com/en/reading/">'],
  ['<link rel="alternate" hreflang="fr" href="https://www.iasantetravail.com/lecture/">\n  <link rel="alternate" hreflang="en" href="https://www.iasantetravail.com/en/reading/">\n  <link rel="alternate" hreflang="x-default" href="https://www.iasantetravail.com/lecture/">', '<link rel="alternate" hreflang="en" href="https://www.iasantetravail.com/en/reading/">\n  <link rel="alternate" hreflang="fr" href="https://www.iasantetravail.com/lecture/">\n  <link rel="alternate" hreflang="x-default" href="https://www.iasantetravail.com/lecture/">'],
  ['content="fr_FR"', 'content="en_GB"'],
  ['content="https://www.iasantetravail.com/lecture/"', 'content="https://www.iasantetravail.com/en/reading/"'],
  ['<body class="page-shell-v2 reading-demo">', '<body class="page-shell-v2 reading-demo">'],
  ['href="#contenu">Aller au contenu principal', 'href="#content">Skip to main content'],
  ['aria-label="Navigation principale"', 'aria-label="Main navigation"'],
  ['<a class="brand" href="/">', '<a class="brand" href="/en/">'],
  ['<strong>IA &amp; Santé au Travail</strong><small>Prévention · Travail réel</small>', '<strong>AI &amp; Occupational Health</strong><small>Prevention · Real work</small>'],
  ['<div class="nav-links"><a href="/comprendre/">Comprendre</a><a href="/risques-prevention/">Risques</a><a href="/evaluer/">Évaluer</a><a href="/droit-gouvernance/">Gouverner</a><a href="/usages-terrain/exemple-sante-travail/">IA en SPSTI</a><a href="/lecture/" aria-current="page">Lecture</a><a href="/a-propos/">À propos</a></div>', '<div class="nav-links"><a href="/en/understand/">Understand</a><a href="/en/risks-prevention/">Occupational risks</a><a href="/en/evaluate/">Assess</a><a href="/en/legal-governance/">Govern</a><a href="/en/uses-and-field/occupational-health-example/">AI in OHS services</a><a href="/en/reading/" aria-current="page">Reading</a><a href="/en/about/">About</a></div>'],
  ['<a class="language-switch" href="/en/reading/" lang="en" hreflang="en">EN</a>', '<a class="language-switch" href="/lecture/" lang="fr" hreflang="fr">FR</a>'],
  ['<main id="contenu">', '<main id="content">'],
  ["LECTURE · SÉLECTION", "READING · SELECTION"],
  ["Suivre ce qui change.", "Track what is changing."],
  ["COLLECTION ÉVOLUTIVE · 2025—", "EVOLVING COLLECTION · 2025—"],
  ['aria-labelledby="reading-explore-title">\n      <span id="reading-explore-title">Explorer</span>', 'aria-labelledby="reading-explore-title">\n      <span id="reading-explore-title">Explore</span>'],
  ["Ordre", "Order"],
  ["Plus récents d’abord", "Newest first"],
  ["Plus anciens d’abord", "Oldest first"],
  ["Thème", "Theme"],
  ["Tous les thèmes", "All themes"],
  ["Économie &amp; pouvoir", "Economy &amp; power"],
  ["Institutions &amp; gouvernance", "Institutions &amp; governance"],
  ["Management &amp; déploiement", "Management &amp; deployment"],
  ["Sens du travail", "Meaning of work"],
  ["Métiers &amp; organisation", "Jobs &amp; organisation"],
  ["Science &amp; découverte", "Science &amp; discovery"],
  ["7 textes affichés", "7 texts shown"],
  ["24 avril<br>2025", "24 April<br>2025"],
  ["10 juin<br>2026", "10 June<br>2026"],
  ["16 juillet<br>2026", "16 July<br>2026"],
  ["25 juillet<br>2026", "25 July<br>2026"],
  ["27 juillet<br>2026", "27 July<br>2026"],
  ["1er août<br>2026", "1 August<br>2026"],
  ["4 août<br>2026", "4 August<br>2026"],
  ["ESSAI · ÉCONOMIE POLITIQUE", "ESSAY · POLITICAL ECONOMY"],
  ["L’argument central : si l’IA finit par remplacer largement le travail humain, le problème dépasse le chômage. Les individus pourraient perdre progressivement leur valeur économique et donc leur pouvoir de négociation politique et social, tandis que capital et pouvoir se concentrent chez ceux qui contrôlent les systèmes d’IA.", "The central argument is that if AI eventually replaces human labour at scale, the issue goes beyond unemployment. People could gradually lose economic value and therefore political and social bargaining power, while capital and power concentrate among those who control AI systems."],
  ["TRAVAIL · POUVOIR · CAPITAL", "WORK · POWER · CAPITAL"],
  ["Lire la série originale", "Read the original series"],
  ["POLICY ESSAY · ANTICIPATION", "POLICY ESSAY · ANTICIPATION"],
  ["Amodei estime que les capacités de l’IA progressent beaucoup plus vite que les institutions politiques et appelle à anticiper les conséquences sur la sécurité, l’emploi, la fiscalité, les libertés publiques et la géopolitique plutôt que d’attendre que les problèmes deviennent manifestes.", "Amodei argues that AI capabilities are advancing much faster than political institutions. He calls for anticipating consequences for security, employment, taxation, civil liberties and geopolitics instead of waiting until problems become obvious."],
  ["INSTITUTIONS · POLITIQUE · VITESSE", "INSTITUTIONS · POLICY · SPEED"],
  ["Lire l’essai original", "Read the original essay"],
  ["MANUSCRIT DE RECHERCHE · MANAGEMENT", "RESEARCH PAPER · MANAGEMENT"],
  ["Le manuscrit, daté du 30 juin et mis en ligne le 16 juillet, montre que les managers surestiment souvent l’utilité de l’IA, y compris pour des tâches où elle n’améliore pas les performances. Rendre visibles ses limites améliore les décisions de déploiement.", "The paper, dated 30 June and posted on 16 July, finds that managers often overestimate AI usefulness, including for tasks where it does not improve performance. Making its limitations visible improves deployment decisions."],
  ["TÂCHES · CROYANCES · DÉPLOIEMENT", "TASKS · BELIEFS · DEPLOYMENT"],
  ["Consulter le manuscrit", "Read the paper"],
  ["TÉMOIGNAGE · SENS DU TRAVAIL", "PERSONAL ACCOUNT · MEANING OF WORK"],
  ["Une réaction très personnelle aux progrès récents de l’IA en mathématiques : au-delà de l’emploi, l’auteur s’interroge sur ce que devient le sens même d’un métier lorsque la machine peut réaliser les découvertes qui en constituaient la raison d’être.", "A deeply personal response to recent AI progress in mathematics. Beyond employment, the author asks what happens to the meaning of a profession when a machine can make the discoveries that gave the work its purpose."],
  ["MÉTIER · SENS · RECONNAISSANCE", "PROFESSION · MEANING · RECOGNITION"],
  ["Lire le témoignage", "Read the account"],
  ["RECHERCHE ÉCONOMIQUE · MÉTIERS", "ECONOMIC RESEARCH · JOBS"],
  ["L’IA commence déjà à brouiller les frontières entre métiers : 43,5 % des usages professionnels spécifiques analysés portent sur des tâches historiquement associées à une autre profession. Elle transforme donc non seulement la manière de travailler mais aussi qui fait quoi.", "AI is already blurring occupational boundaries: 43.5% of the specific workplace uses analysed involve tasks historically associated with another profession. It is changing not only how people work, but also who does what."],
  ["MÉTIERS · TÂCHES · FRONTIÈRES", "JOBS · TASKS · BOUNDARIES"],
  ["Lire l’étude", "Read the study"],
  ["PUBLICATION · RECHERCHE SCIENTIFIQUE", "PUBLICATION · SCIENTIFIC RESEARCH"],
  ["Dix avancées en mathématiques et en informatique théorique", "Ten advances in mathematics and theoretical computer science"],
  ["OpenAI annonce dix résultats produits par un modèle interne sur des problèmes de recherche ouverts, plusieurs correspondant à des problèmes anciens. C’est un exemple concret du passage de l’IA comme assistant du chercheur à producteur direct de nouvelles connaissances scientifiques.", "OpenAI reports ten results produced by an internal model on open research problems, several of them longstanding. This is a concrete example of AI moving from research assistant to direct producer of new scientific knowledge."],
  ["SCIENCE · DÉCOUVERTE · CAPACITÉS", "SCIENCE · DISCOVERY · CAPABILITIES"],
  ["Voir les dix résultats", "View the ten results"],
  ["EXPÉRIENCE DE TERRAIN · MANAGEMENT", "FIELD EXPERIMENT · MANAGEMENT"],
  ["Après plusieurs mois avec cinq salariés réellement managés par des agents IA, les résultats sont contrastés : managers souvent très conciliants et généreux, mais capables d’erreurs concrètes sur les plannings, la confidentialité, le droit du travail ou l’organisation. Cela montre que le management par IA n’est déjà plus uniquement théorique.", "After several months in which five employees were genuinely managed by AI agents, the results are mixed: the managers were often accommodating and generous, but made concrete mistakes involving schedules, confidentiality, labour law and organisation. AI management is already more than a theoretical prospect."],
  ["MANAGEMENT · DROIT · TRAVAIL RÉEL", "MANAGEMENT · LAW · REAL WORK"],
  ["Lire le retour d’expérience", "Read the field report"],
  ["Aucun texte ne correspond à ce thème.", "No text matches this theme."],
  ['aria-label="Fin de la sélection"', 'aria-label="End of selection"'],
  ["FIN DE LA SÉLECTION · À SUIVRE", "END OF SELECTION · TO BE CONTINUED"],
  ["© 2026 IA &amp; Santé au Travail", "© 2026 AI &amp; Occupational Health"],
  ['`${visible.length} ${visible.length === 1 ? "texte affiché" : "textes affichés"}`', '`${visible.length} ${visible.length === 1 ? "text shown" : "texts shown"}`']
];

for (const [from, to] of replacements) {
  if (!html.includes(from)) throw new Error(`Reading translation source not found: ${from.slice(0, 90)}`);
  html = html.replaceAll(from, to);
}

await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, html, "utf8");
console.log("Reading page: generated French and English pair.");
