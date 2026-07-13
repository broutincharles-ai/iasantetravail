# Rubrique Usages & terrain — architecture en sous-pages

## Fichiers à téléverser

- `usages-terrain/index.html` — remplace la page actuelle.
- `usages-terrain/exemple-sante-travail/index.html` — nouveau.
- `usages-terrain/avant-deploiement/index.html` — nouveau.
- `usages-terrain/retours-terrain/index.html` — nouveau.
- `assets/css/usages-terrain.css` — nouveau.
- `assets/js/search-index-usages.js` — nouveau complément de recherche chargé par ces quatre pages.
- `sitemap.xml` — remplace le sitemap actuel.

## Architecture

1. **Page carrefour** avec L’État arcadien ou pastoral.
2. **Exemple concret en santé au travail** consacré à l’article TF 335.
3. **Avant déploiement** consacré au choix de l’usage, aux niveaux de vigilance et au pilote.
4. **Retours de terrain** avec River in the Catskills, les enseignements post-déploiement et les indicateurs de suivi.

## Compatibilité

Les anciennes ancres principales sont conservées sur la page carrefour :
- `#pratique-tf335`
- `#pratique-usages`
- `#retours-terrain`

Les quatre pages utilisent les fichiers partagés existants `assets/css/site.css`, `assets/js/site.js` et `assets/js/search-index.js`.

Aucune autre page du site n’est modifiée.
