# IA & Santé au Travail

Site éditorial statique bilingue de [iasantetravail.com](https://www.iasantetravail.com), sans compilation ni dépendance de production.

## Architecture

- `index.html` et `en/index.html` : accueils français et anglais ;
- neuf pages françaises sont indexables : accueil, `formation/`, `comprendre/`, `risques-prevention/`, `evaluer/`, `droit-gouvernance/`, `usages-terrain/exemple-sante-travail/`, `lecture/` et `a-propos/` ;
- leurs huit équivalents anglais existants sont les seules autres pages indexables (la formation n’a pas encore de version anglaise) ; la liste blanche est centralisée dans `scripts/indexing-scope.mjs` ;
- `assets/css/tokens.css` : couleurs, espaces, largeurs, typographie et accessibilité ;
- `assets/css/layout.css` : grilles et rythmes communs ;
- `assets/css/components.css` : navigation, footer et composants partagés ;
- `assets/js/site-shell.js` : navigation et footer des pages historiques et anglophones ; les pages françaises refondues embarquent leur propre mise en page ;
- `_redirects` et pages historiques `noindex` : conservation des anciennes adresses. Les règles `_redirects` produisent des 301 uniquement sur un hébergeur compatible ; GitHub Pages sert les pages HTML de repli et nécessite une règle externe pour garantir un statut HTTP 301.

La navigation reste fonctionnelle sans framework. Le contenu des pages est présent dans le HTML ; JavaScript ne sert qu’aux interactions, à l’enveloppe commune et aux outils d’évaluation.

## Maintenance

Utiliser le runtime Node.js disponible, puis exécuter depuis la racine :

```sh
node scripts/build-reading.mjs
node scripts/create-redirects.mjs
node scripts/enforce-indexing-scope.mjs
node scripts/harmonize-seo.mjs
node scripts/build-search-index.mjs
node scripts/validate-site.mjs
```

Le validateur refuse toute dix-huitième URL indexable. Il contrôle aussi que le sitemap et les index de recherche contiennent exactement neuf pages FR et huit pages EN, puis vérifie les liens locaux, les identifiants, les métadonnées SEO, le JSON-LD, les variantes linguistiques et le tag Google.

## IndexNow

`scripts/submit-indexnow.mjs` peut notifier Bing et les autres moteurs compatibles après déploiement. Il ne force pas et ne concerne pas l’indexation Google.

1. Générer une clé IndexNow depuis le service officiel.
2. Publier à la racine le fichier de vérification `VOTRE_CLE.txt` contenant exactement cette clé.
3. Définir `INDEXNOW_KEY` dans l’environnement d’exécution.
4. Passer uniquement les URL canoniques modifiées au script, par exemple :

   ```sh
   INDEXNOW_KEY=VOTRE_CLE node scripts/submit-indexnow.mjs https://www.iasantetravail.com/ https://www.iasantetravail.com/risques-prevention/
   ```

Aucune clé n’est créée ni enregistrée dans le dépôt.

## Publication

Le dépôt est publié comme site statique avec le domaine configuré dans `CNAME`. Les URL sont absolues depuis la racine du domaine afin de fonctionner sur GitHub Pages.
