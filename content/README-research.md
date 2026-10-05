# Archive : Research Notes

> Octobre 2026 : la section Research a été retirée du site. Ses adresses redirigent vers les Lectures
> (`scripts/create-redirects.mjs`) et son générateur, `scripts/build-research.mjs`, a été supprimé.
> `research-notes.json` est conservé comme archive des textes. Pour publier une analyse, ajouter une
> lecture dans `lecture/` (et `en/reading/`), puis lancer `node scripts/build-home-latest.mjs`.

Procédure d’origine, pour mémoire :

La source unique de la section Research est `content/research-notes.json`.

1. Dupliquer un objet existant dans le tableau JSON.
2. Renseigner un `slug` unique, le `type`, la date ISO, les sujets, les textes français et anglais, les sources et l’état `featured`.
3. Utiliser uniquement les sujets suivants pour conserver les filtres :
   - `ai-work`
   - `worker-health`
   - `risk-prevention`
   - `algorithmic-management`
   - `governance-prevention`
4. Régénérer les pages et le sitemap :

   ```sh
   node scripts/build-research.mjs
   ```

5. Régénérer la recherche locale puis valider le site :

   ```sh
   node scripts/build-search-index.mjs
   node scripts/validate-site.mjs
   ```

Le générateur crée automatiquement l’index français, l’index anglais, les deux pages individuelles et les entrées correspondantes du sitemap.
