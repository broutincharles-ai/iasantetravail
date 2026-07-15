# Export PDF professionnel — génération directe avec jsPDF

Remplacer dans la branche `main` :

- `assets/js/site.js`

## Ce qui change

Le PDF n'est plus créé à partir d'une capture HTML. Il est dessiné directement avec jsPDF, ce qui évite :

- les textes concaténés ;
- les cartes qui disparaissent ;
- les colonnes qui se replient ;
- les débordements et coupures à gauche ;
- les différences de rendu entre Chrome, Safari et l'impression système.

## Contenu du rapport

Le rapport comporte désormais :

1. une couverture et les métadonnées ;
2. une synthèse décisionnelle avec score, niveau, décision et signaux critiques ;
3. le contexte déclaré présenté en cartes ;
4. un graphique radar vectoriel des neuf dimensions ;
5. les neuf scores avec barres de progression ;
6. les actions de prévention prioritaires ;
7. les conditions minimales de prévention collective ;
8. les limites méthodologiques ;
9. une pagination et un pied de page.

## Pages corrigées

- `evaluer/impact/`
- `evaluer/impact/suivi.html`
- `en/evaluate/impact/`
- `en/evaluate/impact/follow-up.html`

## Après le téléversement

Effectuer un rechargement forcé :

- macOS : `Cmd + Shift + R`
- Windows : `Ctrl + F5`

La bibliothèque jsPDF est chargée uniquement lors du clic sur le bouton PDF.
