# IA & Santé au Travail

**Comprendre, évaluer et prévenir les effets de l’intelligence artificielle sur le travail et la santé.**

→ [iasantetravail.com](https://www.iasantetravail.com/)

IA & Santé au Travail est une initiative éditoriale indépendante consacrée aux relations entre **intelligence artificielle, organisation du travail et santé au travail**.

Son objectif est de rendre les transformations liées à l’IA compréhensibles et discutables par les professionnels qui les conçoivent, les encadrent, les accompagnent ou les vivent.

## La question éditoriale

Le projet part d’une question simple : **que devient le travail lorsqu’un système d’IA entre dans une organisation ?**

Une IA ne peut pas être évaluée uniquement à partir des performances du modèle. Ses effets dépendent aussi de la tâche, des personnes concernées, des objectifs fixés, des modalités de supervision, de l’organisation et des conditions réelles de déploiement.

L’analyse porte donc sur l’ensemble du système :

> **Modèle → Usage → Organisation → Activité réelle → Santé**

Cette approche vise à rendre visibles les transformations qui peuvent affecter la charge et l’intensité du travail, l’autonomie, les compétences, la reconnaissance, les collectifs, le sens du métier, la surveillance, la responsabilité et la sécurité professionnelle.

## Une double lecture de l’IA au travail

IA & Santé au Travail examine l’intelligence artificielle sous deux angles indissociables :

- comme une **transformation du travail**, dont les effets organisationnels, psychosociaux, économiques et sociaux doivent être anticipés, observés et prévenus ;
- comme un **outil professionnel**, dont certains usages peuvent être utiles en santé au travail lorsqu’ils sont adaptés au besoin réel, vérifiés, encadrés et placés sous responsabilité humaine.

L’objectif n’est donc ni de promouvoir ni de rejeter l’IA par principe, mais d’aider à déterminer **dans quelles conditions un usage peut être utile, soutenable et compatible avec un travail de qualité**.

## Organisation du site

L’accueil présente le lien entre **AI Safety, transformations du travail, pouvoir économique et social, et santé publique**. Les pages existantes conservent leurs adresses ; des parcours bilingues les regroupent dans un ordre de lecture.

Le menu principal suit la même structure en français et en anglais :

- **Comprendre** : systèmes d’IA, transformations des tâches, métiers et supervision humaine.
- **Risques collectifs** : perte de pouvoir économique et social, risques psychosociaux et santé.
- **Prévenir** : recommandations, évaluation, dialogue social et gouvernance.
- **IA en santé au travail** : usages professionnels, étude INRS, outils et conditions d’utilisation.
- **Recherche** : quatre travaux du Dr Charles Broutin — Archives des Maladies Professionnelles et de l’Environnement, INRS, JOEM et preprint sur les chercheurs en IA.
- **Lectures** : la collection des analyses et lectures commentées.
- **À propos** : l’auteur et son parcours.

Les outils, interventions et informations légales restent accessibles dans le pied de page. Les outils disponibles uniquement en français sont signalés dans les parcours anglais.

## À qui s’adresse le projet ?

IA & Santé au Travail s’adresse notamment aux médecins et infirmiers en santé au travail, IPRP, ergonomes, psychologues du travail, préventeurs, équipes de SPSTI, employeurs, directions, équipes RH, CSE, représentants du personnel, responsables de transformation et chercheurs.

Aucun prérequis technique n’est nécessaire pour les contenus introductifs.

## Principes éditoriaux

Les contenus cherchent à :

- privilégier les sources scientifiques, institutionnelles, réglementaires et les travaux originaux ;
- distinguer les résultats établis des hypothèses, limites et signaux émergents ;
- partir des usages et du travail réel plutôt que des seules capacités techniques ;
- relier systématiquement les dimensions techniques, humaines et organisationnelles ;
- rendre visibles les incertitudes, les conditions de validité et les évolutions des connaissances ;
- conserver une approche indépendante des fournisseurs de technologies.

Les analyses sont datées, sourcées et mises à jour lorsque les connaissances, les usages ou le cadre réglementaire évoluent.

## Le projet

IA & Santé au Travail est une initiative éditoriale du **Dr Charles Broutin**, médecin du travail et référent intelligence artificielle de la Société Française de Santé au Travail.

Le site est une ressource d’information, de formation et de prévention. Son contenu ne constitue ni un avis médical individuel, ni un conseil juridique, ni une recommandation applicable indépendamment du contexte de travail concerné.

## Maintenance du site

Le site est publié par GitHub Pages à partir de la branche `main`. `_config.yml` laisse hors du site les fichiers de travail (`docs/`, `content/`, `scripts/`, `newsletter-backend/`, ce README).

Après une modification, depuis la racine du dépôt :

1. `node scripts/render-static-navigation.mjs` : réécrit l’en-tête, le pied de page et les ressources communes du `<head>` de chaque page à partir de `assets/js/unified-navigation.js` (menu, libellés, liens) ;
2. `node scripts/build-home-latest.mjs` : conservé pour les anciens gabarits ; il laisse inchangé le nouvel accueil AI Safety, où les lectures sont accessibles par le menu. `node scripts/build-chapter-toc.mjs` : après l’ajout ou la réécriture d’un chapitre de Comprendre, met à jour son sommaire (titres et temps de lecture) ; `node scripts/build-network-figure.mjs` : après une modification du script de la figure « réseau de neurones » de Comprendre, régénère l’image statique affichée sans JavaScript ;
3. `node scripts/create-redirects.mjs` : après le retrait ou le déplacement d’une page, écrit une page de redirection à l’ancienne adresse ;
4. `node scripts/enforce-indexing-scope.mjs` puis `node scripts/build-search-index.mjs` : indexation, sitemap et index de recherche, à partir de `scripts/indexing-scope.mjs` ;
5. `node scripts/validate-site.mjs` : contrôle des liens, métadonnées, hreflang et règles du site. Il doit se terminer sans erreur avant publication.

Une nouvelle page doit être ajoutée à `scripts/indexing-scope.mjs` (avec sa traduction s’il y en a une) pour recevoir l’en-tête commun et figurer dans le sitemap.

Tailles de texte : `assets/css/readability.css`, chargé après les styles de chaque page, fixe un minimum de lisibilité (introductions 17 px, texte courant 16 px, cartes et tableaux 15 px, notes 14 px, étiquettes 11 px). Pour agrandir ou réduire le texte de tout le site, modifier les variables en tête de ce fichier ; l’outil Préconisations a son équivalent dans `assets/css/preconisations-shell.css`.

