# Architecture

La description des couches (rôle de chaque dossier, ce qui est pur et ce qui est coque) est dans `CLAUDE.md`, section *Architecture*. Ce fichier garde ce qui s'**exécute** : les règles d'architecture vérifiées à chaque `npm run lint`.

## Règles vérifiées (`.dependency-cruiser.cjs`)

Dossiers analysés : `js/`, `scripts/`.

| Règle | Raison |
|---|---|
| `no-circular` | Un cycle empêche de raisonner sur un module isolé et fausse la mutation ciblée (MUT-04). |
| `no-orphans` | Un fichier que rien n'importe est du code mort : le supprimer (COV-05). |

Une exception se documente à côté de la règle (`pathNot` + raison), jamais par un assouplissement global.

## Sens des dépendances (par convention, relu en revue)

`main.js` → `app.js` → modules purs (`data`, `filter`, `format`, `preferences`, `sort`, `store`, `table`). Les modules purs ne dépendent pas de `app.js` ; seuls `preferences.js` (→ `store.js`) et `table.js` (→ `format.js`) s'importent entre eux. Le navigateur (document, `fetch`, `localStorage`) n'est jamais lu en global hors de `main.js` : il arrive en paramètre.

## Pièges

- `js/main.js` est chargé par la balise `<script type="module">` de la page : il est déclaré comme exception de `no-orphans`, jamais supprimé par erreur. `scripts/build.js` l'est pour la même raison (lancé par `npm run build`).
