# Site de la checklist des têtes

> Spec puis plan, datés (DOC-05). Un plan réussi sert de modèle au suivant.

## Contexte et objectif

La checklist vivait dans un artifact publié (un seul fichier HTML de 400 Ko, données et aperçus en base64, tableau pré-rendu). On la sort dans son propre dépôt, sur GitHub Pages, au standard des autres projets (`dev-good-practices`) et accessible comme eux (tiroir d'accessibilité, thème, WCAG 2.2 AA contrôlé en CI).

## Décisions

- **Famille « site statique »** du guide : JS sans build (modules ES), ESLint + Stylelint + html-validate, couverture et mutation à 100 %, un seul job de mutation de nuit, déploiement Pages gaté sur la CI. Raison : c'est la famille du site de l'organisation, mêmes outils et mêmes noms de checks.
- **Données en JSON, tableau rendu par le navigateur** (`data/heads.json`) au lieu d'un HTML pré-rendu. Raison : la donnée devient la source, les décomptes s'en déduisent, la logique est testable. Compromis : sans JavaScript la page affiche seulement un message (`<noscript>`).
- **Aperçus en fichiers PNG** (`img/heads/`) et non en base64. Raison : diffs lisibles, cache du navigateur, page 10 fois plus légère.
- **Icônes en masques CSS** sur des SVG. Raison : aucun SVG en chaîne dans le JS (rien à muter), couleur héritée du texte, thèmes gratuits.
- **E2E Playwright ajouté** bien que la famille « site statique » n'en prévoie pas. Raison : les règles A11Y-02, 03, 05 et 06 se vérifient dans un vrai navigateur (axe, focus, reflow) ; le check « Tests fonctionnels (Playwright) » est donc requis (CI-04) et ajouté au ruleset.
- **`<dialog>` natif** pour le tiroir d'accessibilité. Raison : focus piégé, Échap et retour du focus sans code à écrire ni à tester.
- **Les lignes ne se masquent pas quand on coche.** Raison : en vue « Manquantes », cocher faisait disparaître la ligne focalisée et perdre la position au clavier.

## Plan

- [x] Extraire les 216 lignes et 211 aperçus de l'artifact vers `data/heads.json` et `img/heads/`
- [x] Modules purs et coque — `js/`
- [x] Page et styles (jetons clair/sombre/contraste élevé, texte plus grand, animations réduites) — `index.html`, `style.css`
- [x] Tests unitaires 100 %, mutation 100 % — `tests/`
- [x] E2E d'accessibilité — `e2e/accessibility.spec.js`
- [x] CI, Pages, Dependabot, ruleset, versionnement — `.github/`
- [ ] Activer Pages (source « GitHub Actions »), appliquer le ruleset et les réglages du dépôt (GIT-08), créer `UPDATE_TOKEN`
- [ ] Revue manuelle au lecteur d'écran (A11Y-10)

## Vérification

```sh
npm run lint && npm test && npm run test:mutation
npm run build && npm run test:e2e
```

Attendu : zéro avertissement, couverture et mutation à 100 %, 32 e2e verts (16 par thème).
