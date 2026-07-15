# Correctif PDF définitif — Évaluer / Assess

Ce paquet n'utilise plus le fichier partagé `site.js` pour générer les PDF.
Il ajoute un moteur dédié avec un nouveau nom de fichier, ce qui évite que
GitHub Pages ou le navigateur réutilise l'ancien export HTML mis en cache.

## Fichiers à téléverser dans la branche `main`

- `assets/js/assessment-pdf-v2.js`
- `evaluer/impact/index.html`
- `evaluer/impact/suivi.html`
- `en/evaluate/impact/index.html`
- `en/evaluate/impact/follow-up.html`

Respecter exactement ces chemins à la racine du dépôt.

## Pourquoi les quatre fichiers HTML sont nécessaires

Les pages françaises chargeaient encore `site.js?v=0.7.4` et les pages
anglaises chargeaient `site.js` sans numéro de version. Le nouveau moteur est
maintenant chargé par un chemin inédit :

- FR : `../../assets/js/assessment-pdf-v2.js?v=2.2.0`
- EN : `../../../assets/js/assessment-pdf-v2.js?v=2.2.0`

Il est placé avant `site.js`, afin d'intercepter les boutons PDF avant les
anciens gestionnaires d'impression ou de capture HTML.

## Nouveau rendu

- PDF A4 construit directement avec jsPDF ;
- aucune capture de la page web ;
- aucune grande bordure ou partie de page coupée ;
- carte de score séparée de la décision ;
- contexte en cartes à deux colonnes ;
- radar vectoriel sur une page dédiée ;
- tableau des neuf dimensions ;
- actions prioritaires et conditions minimales ;
- numéros de page.

Après téléversement, attendre la fin du déploiement GitHub Pages puis ouvrir
une nouvelle fenêtre privée pour tester. Le nouveau bouton est libellé
`Télécharger le PDF` / `Download PDF`.
