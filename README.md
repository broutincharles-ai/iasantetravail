# IA & Santé au Travail

Site éditorial statique bilingue de [iasantetravail.com](https://www.iasantetravail.com), sans compilation ni dépendance de production.

## Architecture

- `index.html` et `en/index.html` : accueils français et anglais ;
- `comprendre/`, `ai-safety-agi/`, `usages-terrain/`, `evaluer/`, `droit-gouvernance/`, `a-propos/` : parcours français principaux ;
- `assets/css/tokens.css` : couleurs, espaces, largeurs, typographie et accessibilité ;
- `assets/css/layout.css` : grilles et rythmes communs ;
- `assets/css/components.css` : navigation, footer et composants partagés ;
- `assets/js/site-shell.js` : navigation et footer des pages historiques et anglophones ; les pages françaises refondues embarquent leur propre mise en page ;
- `_redirects` et pages historiques : conservation des anciennes adresses.

La navigation reste fonctionnelle sans framework. Le contenu des pages est présent dans le HTML ; JavaScript ne sert qu’aux interactions, à l’enveloppe commune et aux outils d’évaluation.

## Maintenance

Utiliser le runtime Node.js disponible, puis exécuter depuis la racine :

```sh
node scripts/build-search-index.mjs
node scripts/create-redirects.mjs
node scripts/validate-site.mjs
```

Le validateur contrôle notamment les liens locaux, les identifiants, les métadonnées SEO, le balisage JSON-LD, les variantes linguistiques et l’unicité du tag Google. Après une modification éditoriale, mettre à jour la date visible, `dateModified` et le sitemap quand le changement est substantiel.

## Publication

Le dépôt est publié comme site statique avec le domaine configuré dans `CNAME`. Les URL sont absolues depuis la racine du domaine afin de fonctionner sur GitHub Pages.
