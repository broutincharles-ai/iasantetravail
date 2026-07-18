# Nouvelle page d’accueil — IA & Santé au Travail

Ce dossier contient le nouveau `index.html` prêt à remplacer la page d’accueil actuelle du dépôt GitHub Pages, ainsi que des copies vérifiées des trois images déjà utilisées par le site.

## Installation sur GitHub

1. Ouvrir la branche `main` du dépôt du site.
2. À la racine du dépôt — au même niveau que `assets`, `fr`, `en`, `comprendre` et `evaluer` — renommer l’ancien `index.html` en `index-ancienne-version.html` ou en conserver une copie locale.
3. Importer le nouveau `index.html` fourni ici et confirmer son remplacement.
4. Ne pas créer de dossier nommé `main` : `main` est le nom de la branche.
5. Importer aussi le dossier `assets/images` fourni si GitHub le demande. Les fichiers qu’il contient sont des copies des actifs publics actuels du site ; le logo n’a pas été redessiné.
6. Ne supprimer aucun dossier existant. En particulier, conserver :
   - `assets/images/favicon-192.png` — c’est le logo actuel réutilisé par la nouvelle page ;
   - `assets/images/consummation-1280.webp` — peinture du hero ;
   - `assets/images/charles-broutin-linkedin-400.webp` — portrait de l’auteur ;
   - les dossiers `comprendre`, `usages-terrain`, `risques-prevention`, `evaluer`, `droit-gouvernance`, `ressources`, `a-propos`, `fr` et `en`.
7. Valider le commit. GitHub Pages republiera automatiquement le site.

## Contrôles après publication

- Le logo doit être exactement celui du site actuel.
- Tester le menu mobile, la recherche, les cinq choix de rôle et les trois cartes d’actions affichées.
- Vérifier les liens vers les questionnaires avant/après déploiement.
- Vérifier l’affichage de la peinture et du portrait.
- Contrôler le bouton Substack et les liens LinkedIn, mentions légales et confidentialité.

## Retour arrière

En cas de problème, restaurer simplement l’ancien `index.html`. Aucun questionnaire, calcul ni page intérieure n’est modifié par ce paquet.
