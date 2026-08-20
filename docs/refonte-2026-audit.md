# Diagnostic préalable — refonte éditoriale et technique 2026

## État constaté avant modification

- Le dépôt publie 47 fichiers HTML : 24 pages de contenu en français ou en anglais, 11 anciennes routes de redirection, une page 404 et des variantes d’outils.
- Deux générations visuelles coexistent. Les pages récentes utilisent un bandeau éditorial carré avec les œuvres de Thomas Cole, mais 18 d’entre elles embarquent encore chacune entre 19 et 29 Ko de CSS dans leur HTML. Les pages plus anciennes s’appuient sur `site.css`, `components.css`, `layout.css` et des feuilles propres aux rubriques.
- Dix paires français/anglais contiennent un bloc CSS strictement identique dans chaque langue. La duplication est donc évitable sans modifier leur contenu.
- Deux shells concurrents sont actifs : `site-shell.js` sur l’ancienne génération et `unified-navigation.js` sur les démos intégrées. Les deux fabriquent navigation et pied de page, avec des structures et des points de rupture différents.
- La navigation récente expose huit liens de même niveau, dont le questionnaire, une ancienne rubrique sur les modèles de pointe, le cas SPSTI et À propos. Sur petit écran, elle devient une grille de huit cases au lieu d’un menu hiérarchisé. La page Risques n’est pas présente dans ce bandeau récent.
- Les pages principales récentes conservent la bonne identité visuelle, mais elles reprennent presque toutes le même grand hero texte + œuvre + trois repères. Le rôle de chaque page est donc moins net qu’il ne devrait l’être.
- La page d’accueil est riche mais trop proche d’une page de fond : elle répète des développements ensuite présents dans Comprendre, Risques et Évaluer.
- La page Évaluer explique surtout la méthode. Elle ne présente pas immédiatement les trois situations d’usage : avant déploiement, après déploiement, et approfondissement méthodologique.
- Le questionnaire court reste fonctionnel et local, mais son introduction retarde encore l’accès à l’action. Il doit devenir une vraie interface outil et non une page éditoriale supplémentaire.
- Plusieurs pages récentes françaises n’ont pas encore leurs liens `hreflang`, alors que leurs équivalents anglais existent.
- Le validateur local passe sur l’état initial : 47 HTML, 19 CSS, 539 références locales et aucun identifiant dupliqué. Ce contrôle ne détecte toutefois ni l’incohérence des deux shells, ni l’excès de CSS en ligne, ni la qualité responsive du menu.
- Les anciennes routes déjà préservées couvrent notamment `/apropos/`, `/pratique/`, `/risques/`, `/labor-ia/`, `/legislation/`, `/modeles/`, `/impact/` et `/terrain/`. Les anciennes URL citées dans le cahier des charges (`/accompagner-en-amont/`, `/en-pratique/`, `/ia-préconisations/`, `/l-ia-facteur-de-bien-etre/`) ne sont présentes ni dans l’arborescence actuelle ni dans l’historique Git accessible ; elles doivent donc être ajoutées explicitement comme routes de compatibilité.

## Architecture cible retenue

Navigation principale, limitée à cinq entrées :

1. Comprendre
2. Usages & terrain
3. Risques & prévention
4. Évaluer
5. Droit & gouvernance

Un menu secondaire « Ressources » regroupe les capacités et limites des modèles, le cas SPSTI, le panorama des modèles, les sources et mises à jour, et À propos. Le bouton distinct « Évaluer un projet » mène directement au questionnaire court.

Les pages sont réparties entre trois variantes de hero :

- **Manifeste** : accueil uniquement, œuvre et thèse fortes ;
- **Éditorial** : Comprendre, Risques, Droit et ressources techniques, avec œuvre recadrée et contenu visible plus tôt ;
- **Outil** : Évaluer et questionnaires, avec choix ou formulaire prioritaire.

## Stratégie technique

- `tokens.css` redevient l’unique source des couleurs, espacements, largeurs, typographies et états de focus.
- `layout.css` porte les trois variantes de hero et les gabarits de sections.
- `components.css` porte boutons, bandes typographiques, preuves, encadrés, figures, choix d’évaluation et composants de méthode.
- `unified-navigation.css` et `unified-navigation.js` deviennent l’unique shell pour toutes les pages migrées ; ils remplacent progressivement `site-shell.js` sans casser les pages non encore converties.
- Les blocs CSS identiques entre le français et l’anglais sont extraits dans une feuille propre à la rubrique. Les styles globaux et ceux du shell disparaissent de ces feuilles au profit du socle partagé.
- Les redirections statiques restent compatibles avec GitHub Pages.

Ce document constitue l’état zéro de la refonte. Les changements suivants doivent conserver le passage du validateur et être vérifiés à 320, 375, 768, 1024 et 1440 px.
