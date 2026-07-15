# Correction de la génération PDF — Évaluer / Assess

Remplacer à la racine du dépôt :

- `assets/js/site.js`

## Pages corrigées

- `evaluer/impact/`
- `evaluer/impact/suivi.html`
- `en/evaluate/impact/`
- `en/evaluate/impact/follow-up.html`

## Nouveau comportement

Les boutons PDF :

- génèrent et téléchargent directement un fichier `.pdf` ;
- n’exigent plus de choisir manuellement « Enregistrer au format PDF » ;
- affichent un état « Génération du PDF… » ;
- conservent l’impression du navigateur comme solution de secours ;
- fonctionnent pour l’évaluation initiale et le suivi, en français et en anglais.

La bibliothèque `html2pdf.js` est chargée uniquement lorsque l’utilisateur clique sur un bouton PDF.
