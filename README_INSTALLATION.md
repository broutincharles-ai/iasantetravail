# Correctif complet Assess / Évaluer v3.2

Téléverser tout le contenu du ZIP à la racine de la branche `main`.

## Page web

Le grand espace entre « Decision summary » et « Declared context » venait
des styles génériques du site appliqués aux éléments `<section>` du rapport.

Le correctif :
- annule le `padding` et les hauteurs minimales des sections du rapport ;
- conserve un espacement régulier de 24 px entre les rubriques ;
- ne modifie pas le questionnaire ni les autres pages.

## PDF

Le moteur PDF v3.2 :
- conserve les espacements PDF de la version précédente ;
- affiche le titre complet et le score de chaque dimension autour du radar ;
- conserve un tableau synthétique sous le graphique ;
- supprime la répétition « Status and limitations / Statut et limites ».

## Fichiers inclus

- `assets/js/site.js`
- `assets/js/assessment-pdf-v3.js`
- `assets/css/assessment-report-web-fix.css`
- `evaluer/impact/index.html`
- `evaluer/impact/suivi.html`
- `en/evaluate/impact/index.html`
- `en/evaluate/impact/follow-up.html`

Après publication, effectuer un rechargement forcé :
- Mac : `Cmd + Shift + R`
- Windows : `Ctrl + F5`
