# Pistes d'amélioration

Backlog priorisé. Une ligne par piste ; la retirer quand elle est faite.

| Piste | Impact | Effort | Remarque |
|---|---|---|---|
| Revue manuelle au lecteur d'écran (A11Y-10) | élevé | faible | NVDA ou VoiceOver sur le parcours filtre → case → tri ; noter les écarts dans `doc/accessibilite.md`. |
| Générer `data/heads.json` depuis le datapack | moyen | élevé | Aujourd'hui les taux sont recopiés ; un script qui lit les tables `more_mob_heads` éviterait la dérive. Lieux et accouplement resteraient manuels. |
| Mise en page en cartes sous 40 rem | faible | moyen | Le tableau défile en horizontal dans sa région sur mobile (accepté, critère 1.4.10 : tableau de données). |
| Spritesheet des aperçus | faible | moyen | 211 petites images en chargement différé ; une planche réduirait les requêtes. |
