# Mise à jour de la rubrique Évaluer — version 0.4

Cette archive contient uniquement les fichiers à déposer dans le dossier `evaluer/` du site.

## Contenu

```text
evaluer/
├── index.html                         # nouvelle page d’entrée de la rubrique
├── assets/css/evaluer.css             # styles de la page d’entrée et de BenchMedTrav
├── benchmark/index.html               # contenu BenchMedTrav déplacé dans une sous-page
└── impact-ia/
    ├── index.html                     # évaluation initiale
    ├── suivi.html                     # suivi daté
    └── assets/                        # styles et moteurs des questionnaires
```

## Installation

1. Sauvegarder l’actuel dossier `evaluer/`.
2. Copier le dossier `evaluer/` de cette archive à la racine du dépôt.
3. Accepter le remplacement de `evaluer/index.html` et de `evaluer/impact-ia/`.
4. Vérifier les URL suivantes :

- `/evaluer/`
- `/evaluer/benchmark/`
- `/evaluer/impact-ia/`
- `/evaluer/impact-ia/suivi.html`

## Ce qui change

- `Évaluer` devient une page d’entrée regroupant deux familles d’outils.
- BenchMedTrav est placé dans `/evaluer/benchmark/`.
- Les questionnaires restent sous `/evaluer/impact-ia/`.
- La navigation locale permet de passer directement entre la vue d’ensemble, le benchmark, l’évaluation initiale et le suivi.
- Dans les pages livrées, `Évaluer` est placé à la fin du parcours principal : Comprendre → Usages → Risques → Droit → Évaluer.

## Point d’attention

Les autres pages du site ne sont pas incluses dans cette archive. Leur barre de navigation conservera son ordre actuel tant qu’elle n’aura pas été modifiée dans leurs fichiers respectifs.
