# Référencement et navigation statique

Les pages indexables sont déclarées par paires FR/EN dans `scripts/indexing-scope.mjs`. Chaque page conserve son URL canonique, ses trois liens de langue, un titre et une description propres.

Après une modification de page ou l’ajout d’une paire, suivre l’ordre décrit dans le README (« Maintenance du site ») :

```sh
node scripts/render-static-navigation.mjs
node scripts/build-home-latest.mjs        # après une nouvelle lecture
node scripts/build-chapter-toc.mjs        # après la réécriture d’un chapitre de Comprendre
node scripts/build-network-figure.mjs     # après une modification du script de la figure « réseau de neurones »
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

Le dossier CSE regroupe `/cse/` (référentiel), `/cse/jurisprudence/` et sa traduction `/en/cse/case-law/` (chronologie des décisions), `/cse/courrier-medecin-du-travail/` et `/risques-prevention/duerp/` (en français uniquement). Leurs blocs communs (encadré « En bref », cartes, tableau des décisions, journal des mises à jour) sont stylés par `assets/css/cse-reference.css`. Une décision de justice figure à quatre endroits : la liste courte de `/cse/` et de `/en/cse/`, et le tableau des deux pages de chronologie. Pour en ajouter une, compléter les quatre, indiquer la source réellement consultée, dater le journal des mises à jour de chaque page et mettre à jour `dateModified` ainsi que `lastmod` dans `scripts/indexing-scope.mjs`. La FAQ balisée (`FAQPage`) doit reprendre toutes les questions visibles.

Avant publication, vérifier les interactions dans les deux langues et les mises en page mobiles. La validation doit porter sur les fichiers de la version à publier, sans y inclure les brouillons locaux non suivis par Git.

## IndexNow (Bing, Yandex and the engines that read it)

The verification file `bbb34a9b3771d2722ca1bef46bccf955.txt` at the site root holds the IndexNow key. The key is public by design: search engines read that file to check that a submission comes from this site. After a publication, once GitHub Pages has deployed, send the canonical addresses that changed:

```
INDEXNOW_KEY=bbb34a9b3771d2722ca1bef46bccf955 node scripts/submit-indexnow.mjs https://www.iasantetravail.com/evaluer/ https://www.iasantetravail.com/comprendre/
```

Google does not read IndexNow: for Google, use the URL inspection tool in Search Console, or wait for the sitemap to be read again.

## Short answers and FAQ blocks

`assets/css/page-answers.css` styles the short-answer panel (`.page-brief`), the FAQ (`.page-faq`), the table of axes (`.page-axes`) and the step lists of the audience pages (`.pa-steps`). It carries fallbacks for every colour and font, so it also works on guides that inline their tokens. When a visible FAQ changes, update the `FAQPage` node of the page's structured data so that both list the same questions.
