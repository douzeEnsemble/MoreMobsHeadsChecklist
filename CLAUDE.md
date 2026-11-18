# CLAUDE.md

Checklist des têtes obtenables avec le datapack Minecraft « More Mob Heads » (Vanilla Tweaks) : un tableau triable et filtrable (mob, tête, condition, taux sans Looting / Looting III, lieu, accouplement, case « obtenue »). Site statique servi par GitHub Pages : `index.html`, `style.css`, modules ES dans `js/`, données dans `data/heads.json`, aperçus dans `img/`. Le datapack lui-même **n'est pas dans ce dépôt** (il vit à côté, hors Git) : seules ses données utiles à la checklist le sont.

## Commandes

- `npm run lint` : ESLint (`lint:js`), Stylelint (`lint:css`), html-validate (`lint:html`), dependency-cruiser (`lint:arch`).
- `npm test` : Vitest sous jsdom avec couverture (seuil 100 % sur `js/` et `scripts/`).
- `npm run test:mutation` : Stryker, seuil 100 %.
- `npm run build` : `scripts/build.js` génère `_site/` (fichiers publiés + version injectée).
- `npm run test:e2e` : Playwright (axe, clavier, reflow…) sur `_site/` : lancer `npm run build` avant ; `npx playwright install chromium` la première fois.
- Voir la page en local : `python3 -m http.server` à la racine du dépôt, puis http://localhost:8000 (les chemins sont relatifs, le site marche aussi sous `/<dépôt>/`).
- Lancer un seul test : `npx vitest run tests/filter.test.js -t "<nom du test>"` ; un seul e2e : `npx playwright test -g "<nom>"`.
- Sans Node sur le poste : `docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app node:24 npm test` (idem pour les autres scripts) ; les e2e : image `mcr.microsoft.com/playwright:v<version de @playwright/test>-noble`.

## Architecture

- `data/heads.json` : **source des lignes du tableau**. `{ datapack: { name, version, minecraft, overlay }, heads: [...] }` ; une entrée = `id` (slug unique), `mob`, `head` (null si pas de tête dans le pack), `image` (aperçu 32 px, absent si pas de tête), `condition` (`kind` : `variant` | `name` | `charged` | `other`, + `text`), `rate` (`{ base, looting? }` en fraction ; `null` = « n/a »), `places` (`dimensions` parmi `overworld`/`nether`/`end`, + `text`), `mating` (`{ possible, text }`, facultatif). Les décomptes affichés (têtes, mobs gérés, mobs non gérés) se **déduisent** de ce fichier (`summary` dans `js/format.js`), jamais écrits à la main. `tests/heads-data.test.js` contrôle son intégrité.
- `js/` (modules purs, testés à 100 % et mutés) : `format.js` (pourcentages, paliers, sous-titre), `filter.js` (termes, « nom exact », vue), `sort.js` (tri stable, sens), `store.js` (état persistant, stockage tolérant aux pannes), `preferences.js` (thème, réglages d'accessibilité), `data.js` (chargement), `table.js` (construction d'une ligne, `createElement` + `textContent`, jamais `innerHTML`).
- Coque : `js/app.js` (`init(doc, { fetchFn, storage })`, branche le DOM aux modules purs) et `js/main.js` (point d'entrée de la page, une ligne). Tout ce qui touche au navigateur arrive en paramètre : c'est ce qui rend `app.js` testable.
- `scripts/build-site.js` copie `SITE_FILES` dans `_site/` et injecte la version (VER-09) ; `scripts/build.js` le lance.
- Icônes : masques CSS sur `img/icons/*.svg` (couleur = `currentcolor`), jamais de SVG en ligne dans le JS. Elles sont **décoratives** (`aria-hidden`) : le sens est toujours dans un texte voisin.
- Détail des règles de dépendances : `doc/architecture.md`.

## Mettre à jour les données

Une modification du datapack (taux, condition, variante, mob) se répercute dans `data/heads.json` (et `img/heads/<id>.png` pour une tête nouvelle), dans le même commit que la modification du pack côté datapack si possible. Les valeurs viennent des tables de loot du datapack (`random_chance_with_enchanted_bonus` : `unenchanted_chance` → `base`, `enchanted_chance` pour Looting III → `looting`) ; les **lieux et les objets d'accouplement ne figurent pas dans le datapack** : ils sont écrits à la main (les « (?) » sont des incertitudes). Un nouveau mob : une ligne par tête, `id` = slug de `mob-tête`. Lancer `npm test` : le test d'intégrité attrape un identifiant doublon, une image absente, une dimension inconnue.

## Philosophie de test

- Unitaire (Vitest, jsdom) : toute la logique pure et la coque `app.js` sur le **vrai** `index.html`, de sorte que page et code ne puissent pas diverger. Les tests de ligne comparent le `outerHTML` exact (MUT-07).
- E2E (Playwright, Chromium, thèmes clair puis sombre) : ce que jsdom ne voit pas, c'est-à-dire axe-core (WCAG 2.2 AA), le clavier réel et le `<dialog>` natif, le reflow à 320 px, la taille des cibles, le contraste dans chaque thème et en contraste élevé.
- Couverture 100 % et mutation 100 % (Stryker, runner `vitest`). Un mutant équivalent se traite en **simplifiant le code** (ex. la valeur par défaut d'une liste n'est pas dans la liste testée), pas en baissant le seuil.

## Accessibilité

Cible WCAG 2.2 AA (A11Y-01 à 10). Choix à connaître, avec leur raison :
- Même tiroir « Accessibilité » que les autres projets de l'organisation : texte plus grand, contraste élevé, animations réduites (trois attributs booléens sur `<html>`, lus par `style.css`) + thème Auto / Clair / Sombre. Boîte de dialogue = `<dialog>` natif (focus piégé, Échap, retour du focus au déclencheur : gérés par le navigateur).
- Le tableau est un vrai `<table>` : en-têtes de tri = `<button>` dans un `<th aria-sort>`, nom du mob = `<th scope="row">` qui contient le `<label>` de la case (la case se retrouve par rôle et nom : « Allay Head »).
- La région du tableau défile en horizontal (tableau de données : exception du critère 1.4.10), jamais la page ; elle est focalisable (`tabindex="0"`) et nommée. Les `.sr-only` sont **contenus** par `.wrap { position: relative }` : sans cela, leur position absolue élargit la page (piège constaté).
- Les lignes ne se masquent qu'à un changement de filtre ou de vue, **pas** quand on coche une case : la ligne cochée garde le focus au lieu de disparaître sous les doigts en vue « Manquantes ».
- Le compteur (`role="status"`) existe dès le chargement et annonce les changements ; l'échec de chargement passe par `role="alert"`.
- Couleur jamais seule : le palier d'un taux colore le chiffre, qui reste toujours écrit.
- Écarts connus et revue manuelle (A11Y-10) : `doc/accessibilite.md`.

## CI/CD

- `ci.yml` : Linter, Tests unitaires + couverture, Tests fonctionnels (Playwright), Mutation testing, Audit des dépendances, Build de production ; `codeql.yml` (« Analyse »), `audit.yml` et `conventional_commits.yml` en complément. Les noms des checks sont ceux que le ruleset exige.
- La mutation (un seul job) ne tourne que la nuit (2 h UTC) et en `workflow_dispatch` ; elle est sautée sur PR et push, le check requis passe donc sans elle (MUT-10). Si elle échoue la nuit, corriger dans la PR suivante (GIT-04). `build` garde `if: !failure() && !cancelled()`, sans quoi il serait sauté avec elle.
- `pages.yml` déploie sur GitHub Pages quand la CI réussit sur `main` (jamais sur un simple push). Pages doit être configuré sur « GitHub Actions » dans les réglages du dépôt.
- Ruleset de `main` : `.github/rulesets/main.json` (appliqué avec `apply-rulesets.sh` du dépôt `dev-good-practices`, à la demande du propriétaire).

## Documentation, versionnement et architecture

- `doc/` : `architecture.md` (règles vérifiées), `codage.md` (conventions), `improvement.md` (backlog), `accessibilite.md` (écarts et revue manuelle). `docs/` : travail daté, un spec puis un plan par chantier.
- Commits au format conventionnel (`type(portée): sujet`), en français, atomiques ; hook : `git config core.hooksPath .githooks`. La version se déduit des commits (semantic-release, `release.yml`) : ne jamais éditer un numéro de version ni un changelog à la main.
- Audit (CI-13) : le niveau `high` complet passe par `.github/scripts/audit-check.mjs` (identique dans tous les dépôts, ne pas le modifier ici) ; un avis sans correctif se déclare dans `.github/audit-exceptions.json` (raison + expiration, 30 jours au plus), jamais en baissant le seuil.
- Version affichée (VER-09) : dernier tag `v*`, lu à la construction par `.github/scripts/app-version.mjs` (identique partout) ; `scripts/build-site.js` (`injectVersion`) remplace le marqueur du pied de page. `pages.yml` fait un checkout en `fetch-depth: 0` et attend la release du commit (`.github/scripts/wait-release.sh`), sans quoi la page affiche `dev`. Les tests figent la valeur.

## Pièges locaux

- **`.sr-only` qui élargit la page** : position absolue sans ancêtre positionné, le texte se place hors écran à droite dans le tableau et crée un défilement horizontal de la page (200 px mesurés à 320 px). Garder `position: relative` sur `.wrap`.
- **Chemins** : tout est relatif (`data/heads.json`, `img/…`, `url("img/icons/…")` dans le CSS), car Pages sert le site sous `/<dépôt>/`. Un `/` en tête casse le déploiement.
- **`loading="lazy"`** : jsdom ne reflète pas la propriété `loading` ; l'attribut s'écrit avec `setAttribute`.
- **Tab dans un `<dialog>` modal** : à la fin de la boîte, le focus sort vers le navigateur (`document.body`), pas vers la page, qui est inerte. Les e2e l'acceptent, ils refusent un focus sur la page.
- **Variantes `Stryker`** : aucune directive `Stryker disable` dans le projet ; en ajouter exige la raison écrite à côté.

## Écarts au guide

Aucun écart déclaré, hormis A11Y-10 : la revue manuelle au lecteur d'écran (NVDA ou VoiceOver) n'a pas été faite, voir `doc/accessibilite.md`.
