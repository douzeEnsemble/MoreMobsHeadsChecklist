# Conventions de code

Le détail de la philosophie de test et de la CI est dans `CLAUDE.md` ; ce fichier fixe les conventions du quotidien.

## À faire

- Commits au format conventionnel `type(portée): sujet`, à l'impératif, qui disent le pourquoi (hook : `git config core.hooksPath .githooks`). La version se déduit des commits : ne jamais l'écrire à la main.
- Ajouter un test à côté du fichier modifié ; couverture et mutation restent à 100 %.
- Garder la logique dans des fonctions pures, la coque (DOM, réseau, stockage) la plus fine possible ; le navigateur arrive en paramètre.
- Construire le DOM avec `createElement` et `textContent` (jamais `innerHTML` avec une donnée, SEC-05).
- Tout texte qui porte un sens a un équivalent textuel : une icône est `aria-hidden` et accompagnée de texte (A11Y-04) ; la couleur n'est jamais seule (A11Y-05).
- Tailles en `rem`/`em`, chemins **relatifs**, `:focus-visible` toujours visible.
- Un nouveau module s'ajoute sans toucher à `stryker.config.json` (`mutate` couvre `js/**` et `scripts/**`).
- Une nouvelle ligne de tableau : `data/heads.json` + `img/heads/<id>.png` ; `npm test` contrôle l'intégrité.

## À éviter

- Baisser un seuil (couverture, mutation) ou ajouter un `Stryker disable` sans raison écrite.
- Introduire un cycle d'imports ou un fichier que rien n'importe (voir `doc/architecture.md`) : `npm run lint` échoue.
- Référencer une action GitHub par un tag : toujours par SHA.
- Écrire un décompte (« 211 têtes ») à la main : il se déduit des données.
- Masquer une ligne au moment où on la coche (le focus serait perdu).
