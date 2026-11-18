# Accessibilité

Cible : WCAG 2.2 niveau AA (guide qualité, § 3.15). Ce fichier note ce qui est vérifié, les écarts connus et l'état de la revue manuelle.

## Vérifié automatiquement (CI, `e2e/accessibility.spec.js`)

- axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) : page, thèmes clair et sombre du système, thème forcé, contraste élevé + texte plus grand, boîte de dialogue ouverte, 320 px (A11Y-02, A11Y-05).
- Clavier : lien d'évitement, filtre et bouton d'effacement, boîte de dialogue (focus gardé, Échap, focus rendu au déclencheur) (A11Y-03).
- Noms accessibles : les cases se retrouvent par rôle et nom (A11Y-04).
- Statut annoncé : compteur `role="status"` présent au chargement (A11Y-08).
- Reflow : aucun défilement horizontal de la page à 320 px, aussi avec « texte plus grand » (A11Y-06).
- Cibles : boutons d'icône ≥ 44 px, cases ≥ 24 px (A11Y-06).
- Mouvement : « réduire les animations » coupe les transitions (A11Y-07).
- Structure : `lang`, `<title>`, un seul `<h1>`, repères banner / main / contentinfo (A11Y-01) ; `html-validate` dans `npm run lint`.

## Écarts connus

| Écart | Raison | Date |
|---|---|---|
| Le tableau défile en horizontal dans sa région sur écran étroit | Tableau de données à deux dimensions : exception du critère 1.4.10 ; la région est focalisable et nommée | 2026-11-18 |
| Les lieux et objets d'accouplement sont du texte libre, parfois long | Contenu d'origine conservé tel quel ; chaque ligne reste lisible à 200 % | 2026-11-18 |

## Revue manuelle (A11Y-10)

À cocher dans la description de la PR qui change l'interface :

- [ ] Parcours complet au clavier seul
- [ ] Zoom navigateur à 200 %
- [ ] Lecteur d'écran (NVDA ou VoiceOver) sur filtre → case → tri
- [ ] Mode sombre et contraste élevé du système
- [ ] `prefers-reduced-motion`

État au 2026-11-18 : **non faite** (aucun lecteur d'écran disponible lors de la livraison initiale) ; seule la partie automatique est couverte.
