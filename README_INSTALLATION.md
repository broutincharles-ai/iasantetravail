# Correction PDF A4 et graphique radar

Remplacer dans la branche `main` :

- `assets/js/site.js`

## Corrections

Le correctif s'applique aux quatre outils :

- `evaluer/impact/`
- `evaluer/impact/suivi.html`
- `en/evaluate/impact/`
- `en/evaluate/impact/follow-up.html`

Le PDF est désormais construit dans un document A4 dédié de 210 × 297 mm :

- aucun contenu ne doit dépasser ou être coupé sur le bord gauche ;
- le titre est redimensionné pour tenir dans la largeur ;
- les cartes et tableaux utilisent des largeurs compatibles A4 ;
- le graphique radar est ajouté au rapport ;
- le tableau des neuf scores est affiché sous le radar ;
- les principaux blocs évitent les coupures entre deux pages ;
- une solution d'impression reste disponible si le téléchargement direct échoue.

Après le téléversement, effectuer un rechargement forcé :

- macOS Chrome/Safari : `Cmd + Shift + R`
- Windows : `Ctrl + F5`
