# Refonte — 11 juillet 2026

## Changements livrés

- Conversion de l’application monopage en site statique multipage avec URL propres.
- Conservation des anciennes adresses par redirections et redirection des anciens fragments `#...`.
- Navigation simplifiée en cinq entrées principales et un menu Ressources.
- Accueil réorganisé autour du besoin du lecteur, du périmètre du site et des dernières mises à jour.
- Version anglaise éditoriale dédiée, sans recours à Google Translate.
- Métadonnées uniques par page : title, description, canonical, Open Graph, Twitter, hreflang et Schema.org.
- Sitemap bilingue et fichier robots.txt.
- Contenu visible sans JavaScript.
- Résumé « En 30 secondes », public, temps de lecture, date de vérification et sommaire sur les pages longues.
- Sommaire mobile compact et fixe au défilement.
- Recherche locale sans transmission des requêtes à un tiers.
- Contrastes renforcés et cibles tactiles du carrousel agrandies.
- Heroes intérieurs raccourcis ; hero immersif conservé sur l’accueil.
- Effet « liquid glass » réservé aux éléments structurants.
- Images de Thomas Cole hébergées localement et servies en tailles responsives WebP/JPEG.
- Bandeau de crédibilité reformulé pour éviter toute apparence de soutien institutionnel.
- Newsletter remplacée par un formulaire avec consentement ; backend de double confirmation fourni.
- Mentions légales et confidentialité adaptées à la nouvelle architecture.

## Élément volontairement non ajouté

Les outils opérationnels annoncés dans l’audit — diagnostic, checklist SPST, matrice, trame CSE, protocole de validation et fiche de données sensibles — n’ont pas été créés, conformément à la demande.

## Configuration restant à effectuer

Le formulaire newsletter fonctionne par repli vers la messagerie tant que l’URL du backend n’est pas renseignée dans `assets/js/config.js`. Le dossier `newsletter-backend/` contient un backend Google Apps Script prêt à déployer avec double confirmation.
