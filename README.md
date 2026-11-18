# More Mob Heads – checklist des têtes

Tableau des têtes de mobs obtenables avec le datapack [More Mob Heads](https://vanillatweaks.net/) (Vanilla Tweaks) : taux de drop sans Looting et avec Looting III, lieu, objet d'accouplement, et une case « obtenue » pour suivre sa collection (mémorisée dans le navigateur).

- Filtre multi-termes (`wolf, cat, panda`), « nom exact », vues « obtenues » / « manquantes ».
- Tri par colonne.
- Thème Auto / Clair / Sombre, texte plus grand, contraste élevé, animations réduites. Cible : WCAG 2.2 AA, vérifiée par axe-core en CI.

Publié sur GitHub Pages : https://douzeensemble.github.io/MoreMobsHeadsChecklist/

## Développer

```sh
npm ci
npm run lint
npm test                 # unitaires + couverture 100 %
npm run test:mutation    # mutation 100 %
npm run build && npx playwright install chromium && npm run test:e2e
python3 -m http.server   # voir la page sur http://localhost:8000
```

Les données sont dans [`data/heads.json`](data/heads.json). Le guide de contribution (architecture, règles, pièges) est dans [`CLAUDE.md`](CLAUDE.md) ; les pratiques suivies sont celles de [dev-good-practices](https://github.com/douzeEnsemble/dev-good-practices).
