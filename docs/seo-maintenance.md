# Référencement et navigation statique

Les pages indexables sont déclarées par paires FR/EN dans `scripts/indexing-scope.mjs`. Chaque page conserve son URL canonique, ses trois liens de langue, un titre et une description propres.

Après une modification de page ou l’ajout d’une paire, suivre l’ordre décrit dans le README (« Maintenance du site ») :

```sh
node scripts/render-static-navigation.mjs
node scripts/build-home-latest.mjs        # après une nouvelle lecture
node scripts/build-chapter-toc.mjs        # après la réécriture d’un chapitre de Comprendre
node scripts/create-redirects.mjs         # après le retrait ou le déplacement d’une page
node scripts/enforce-indexing-scope.mjs
node scripts/build-search-index.mjs
node scripts/validate-site.mjs
```

`update-social-metadata.mjs` et `sync-bilingual-indexing.mjs` ne servent qu’après un changement des images de partage ou des correspondances de langue.

La navigation et le pied de page utilisent une source unique, `assets/js/unified-navigation.js`, partagée entre la génération HTML et l’amélioration JavaScript. Ne pas modifier à la main les blocs générés. Ajouter les nouvelles correspondances de langue dans ce fichier et dans `docs/fr-en-route-map.json`. Préserver les sommaires propres à chaque page. Les pages indexables doivent être parcourables sans JavaScript, y compris sur mobile.

Les aperçus de partage sont réservés aux métadonnées et ne changent pas le visuel des pages. Pour les régénérer : `python3 scripts/build-social-cards.py` (Pillow nécessaire). Leurs polices sont celles déjà présentes dans `assets/fonts/`.

Les deux publications ont chacune une page détaillée et une traduction anglaise. Leur JSON-LD distingue le résumé publié sur ce site (`Article`) de l’article scientifique cité (`ScholarlyArticle`) : conserver les dates et les sources propres à chacun. Le preprint « La santé au travail, condition de la sécurité des modèles d’IA frontières » est publié en texte intégral, en français et en anglais ; son JSON-LD est un `ScholarlyArticle` dont `creativeWorkStatus` vaut `Preprint`, et ses figures conservent leur propre feuille de style, isolée sous `.viz`. La page Publications reste un aperçu, dans l’ordre preprint, étude INRS, puis revue sur les LLM et les risques psychosociaux. Les anciens liens vers ses sections restent valides.

Mettre à jour les dates de contenu uniquement après une révision réelle. Conserver les limitations et les niveaux de preuve dans les résumés. La ressource `/agents/` reste en `noindex`, hors du sitemap et de la recherche interne. Les anciennes notes `/research/` ont été fusionnées dans les Lectures en octobre 2026 : leurs adresses redirigent vers la lecture correspondante (`scripts/create-redirects.mjs`). Les demandes de liens externes et l’accès aux outils Search Console/Bing sont des démarches distinctes ; ces modifications techniques ne garantissent ni un classement ni une citation par un moteur génératif.

Avant publication, vérifier les interactions dans les deux langues et les mises en page mobiles. La validation doit porter sur les fichiers de la version à publier, sans y inclure les brouillons locaux non suivis par Git.
