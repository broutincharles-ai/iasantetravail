# Assess / Évaluer — restauration web + PDF v3

Téléverser tout le contenu de ce dossier à la racine de la branche `main`.

## Ce qui est corrigé

### Page web
- `site.js` revient à sa version propre, sans moteur PDF ni capture HTML.
- Le rapport affiché à l’écran retrouve ses cartes, colonnes, espacements et barres.
- Le correctif CSS est strictement limité à `.generated-report`.
- Le questionnaire, le radar interactif et les autres composants ne sont pas modifiés.

### PDF
- génération directe avec jsPDF ;
- correction du chevauchement entre le score et `/100` ;
- radar plus sobre avec quatre niveaux de référence ;
- chiffres numérotés dans le graphique ;
- libellés et scores déplacés dans une légende structurée sous le radar ;
- aucune modification du rendu de la page web.

## Fichiers principaux
- `assets/js/site.js`
- `assets/js/assessment-pdf-v3.js`
- `assets/css/assessment-report-web-fix.css`
- les quatre pages HTML déjà raccordées aux nouveaux fichiers

Après publication, ouvrir une fenêtre privée ou effectuer `Cmd + Shift + R`.
