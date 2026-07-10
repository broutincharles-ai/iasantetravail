# Activation du double opt-in

1. Créer une feuille Google Sheets dédiée.
2. Ouvrir **Extensions > Apps Script** et copier `Code.gs` et `appsscript.json`.
3. Déployer comme **Application Web**, exécutée par le propriétaire, accessible à tous.
4. Copier l’URL `/exec` dans `assets/js/config.js` à la place de la chaîne vide.
5. Ajouter le nom du prestataire et les informations de transfert éventuel dans la page Confidentialité.

Le site reste utilisable avant cette activation : le formulaire ouvre alors une demande structurée dans la messagerie de l’utilisateur.
