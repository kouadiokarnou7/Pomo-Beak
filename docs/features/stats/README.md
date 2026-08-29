# Fonctionnalité : Statistiques, Activité et Productivité

## Description
L'application fournit un tableau de bord (dashboard) de statistiques de productivité pour encourager l'utilisateur.
Il inclut le calcul du temps cumulé de concentration, de la série de jours (streak), et une vue Heatmap (type GitHub) de la productivité.

## Ce qui a été apporté

### Heatmap (Activité & Productivité)
- **Sélecteur de période dynamique :** Boutons permettant de choisir entre 30 derniers jours, 90 derniers jours, ou l'année entière (365 jours).
- **Taille des cellules harmonisée :** Les cellules conservent un ratio élégant (20x20px pour 30j/90j et 14x14px pour 365j) pour éviter la déformation verticale tout en gardant une excellente lisibilité.
- **Retrait de l'axe des jours :** Suppression des labels de jours de la semaine (Lun, Mer, Ven) sur l'axe Y pour épurer le design.
- **Simulation de données (Mockup) :** Génération de fausses données visuelles *déterministes* (pas `Math.random()` pour éviter l'erreur d'hydratation SSR) lorsque l'utilisateur n'a encore aucune activité réelle.
- **Design Glassmorphism Premium :** Transparence et effet verre alignés sur les normes UI/UX de l'application.

### Bar Chart (Progrès Quotidien)
- **Historique quotidien (`dailyHistory`) :** Nouveau système de stockage par jour dans `localStorage` (`focusflow_daily_history`). Chaque session focus terminée incrémente l'historique du jour.
- **Mode Temps :** Le graphique en barres affiche le temps de focus réel par jour (en minutes) basé sur `dailyHistory`, avec fallback sur `totalFocusTimeToday` pour la journée en cours.
- **Mode Tâches :** Le graphique compte le nombre de tâches complétées par jour en se basant sur `completedAt`.
- **Migration automatique :** Si l'utilisateur avait déjà un `totalFocusTimeToday` mais pas d'historique, les données existantes sont automatiquement migrées dans `dailyHistory`.

## Fichiers modifiés
- `src/app/(app)/stats/page.tsx` : 
  - Ajout du state `heatmapPeriod` pour stocker la période sélectionnée.
  - Taille dynamique des cellules selon la période (`cellSize`, `gapSize`, `colWidth`).
  - Suppression des labels de l'axe Y de la Heatmap.
- `src/app/(app)/page.tsx` :
  - Import de `dailyHistory` depuis `useApp()`.
  - Passage de `dailyHistory` à `calculateDashboardChartData`.
- `src/utils/stats.ts` :
  - `calculateHeatmapData` : Mockup déterministe basé sur la date (pas `Math.random()`).
  - `calculateDashboardChartData` : Refonte complète pour utiliser `dailyHistory` en mode Temps et `completedAt` en mode Tâches.
- `src/context/AppContext.tsx` :
  - Ajout du state `dailyHistory` et de son type dans l'interface `AppContextType`.
  - Sauvegarde dans `localStorage` à chaque fin de session focus.
  - Chargement et migration automatique au démarrage.

## Erreurs corrigées
- **Hydration Mismatch (SSR)** : Remplacement de `Math.random()` par un pseudo-aléatoire déterministe. Voir `docs/errors/hydration_mismatch/README.md`.
- **Reassignment de `const`** : Changement de `const count` en `let count` dans `calculateHeatmapData`.
