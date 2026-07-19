# IA & Santé au Travail

Site éditorial statique bilingue de [iasantetravail.com](https://www.iasantetravail.com), sans compilation ni dépendance de production.

## Architecture

- `index.html` et `en/index.html` : accueils français et anglais ;
- `comprendre/`, `usages-terrain/`, `risques-prevention/`, `evaluer/`, `droit-gouvernance/`, `a-propos/` : parcours canoniques ;
- `assets/css/tokens.css` : couleurs, espaces, largeurs, typographie et accessibilité ;
- `assets/css/layout.css` : grilles et rythmes communs ;
- `assets/css/components.css` : navigation, footer et composants partagés ;
- `assets/js/site-shell.js` : source unique de la navigation et du footer bilingues ;
- `mises-a-jour/` : méthode éditoriale et historique des changements ;
- `_redirects` et pages historiques : conservation des anciennes adresses.

La navigation reste fonctionnelle sans framework. Le contenu des pages est présent dans le HTML ; JavaScript ne sert qu’aux interactions, à l’enveloppe commune et aux outils d’évaluation.

## Maintenance

Utiliser le runtime Node.js disponible, puis exécuter depuis la racine :

```sh
node scripts/build-search-index.mjs
node scripts/create-redirects.mjs
node scripts/validate-site.mjs
```

Après une modification éditoriale, mettre à jour la date visible, `dateModified`, le sitemap et la page `mises-a-jour/` quand le changement est substantiel. Les règles de fréquence sont décrites sur cette dernière page.

## Publication

Le dépôt est publié comme site statique avec le domaine configuré dans `CNAME`. Les URL sont absolues depuis la racine du domaine afin de fonctionner sur GitHub Pages.
