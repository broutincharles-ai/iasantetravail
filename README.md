# Page « Comprendre » — version bilingue

Ce paquet contient les deux versions prêtes à intégrer au dépôt statique de `iasantetravail.com` :

- `comprendre/index.html` : version française ;
- `en/understand/index.html` : version anglaise ;
- `assets/images/favicon-192.png` : logo actuel du site, conservé à l’identique ;
- `assets/images/savage-state-1280.webp` : image de fond du hero.

## Installation sur GitHub

Copier le contenu du dossier à la racine du dépôt en conservant exactement cette arborescence. Les chemins des images commencent par `/assets/` et fonctionneront donc sur le domaine principal.

Le paquet remplace uniquement les pages `comprendre/` et `en/understand/` ainsi que les deux images listées ci-dessus. Il ne nécessite ni dépendance JavaScript ni étape de compilation.

## Changements intégrés

- remplacement de la formule « ouvrir une carte » par une introduction explicite ;
- remplacement du CTA par « Commencer la lecture » / « Start reading » ;
- suppression complète du bouton et de l’animation « Relancer le tracé » ;
- conservation du schéma LLM sous une forme statique et lisible ;
- suppression de la photographie documentaire ;
- remplacement de celle-ci par un repère éditorial directement lié au travail réel ;
- version anglaise complète, avec métadonnées, navigation, recherche et contenus traduits ;
- liens `canonical` et `hreflang` français/anglais.
- simplification du début de page et suppression du bloc introductif décoratif.
- navigation interne conservée dans l’onglet courant ; seuls LinkedIn et Substack s’ouvrent dans un nouvel onglet.
