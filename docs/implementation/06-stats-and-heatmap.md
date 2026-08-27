# Implémentation des Statistiques & Heatmap (Graphique de Contribution)

Ce document décrit l'architecture et les choix de conception réalisés pour la nouvelle page de statistiques de FocusFlow.

## Objectif
L'objectif de cette refonte était double :
1. Séparer clairement les indicateurs de performance clés (KPIs) en deux catégories : **Le Temps** (minuteur, sessions) et **Les Tâches** (accomplissement, priorités).
2. Fournir une vue d'ensemble de la productivité dans le temps via un **Graphique de Contribution (Heatmap)**, similaire à ce que l'on retrouve sur le profil d'un développeur GitHub.
3. Rendre le **Dashboard principal** plus dynamique, en permettant de basculer l'affichage de l'activité hebdomadaire entre le temps passé et le nombre de tâches accomplies.

*Note : La précédente section "Analyses & Conseils" gérée par IA a été retirée pour laisser place à ce système plus visuel. L'IA sera potentiellement réintroduite ultérieurement sous forme de classement (leaderboard).*

## Modèle de Données

Le modèle `Task` (`src/context/AppContext.tsx`) a été enrichi pour supporter ces calculs :
- **`startedAt?: string`** : Horodatage du début réel de la tâche.
- **`completedAt?: string`** : Horodatage exact de la complétion. C'est ce champ qui est désormais utilisé en priorité pour comptabiliser l'activité dans les statistiques quotidiennes.

## Structure de la page (`src/app/(app)/stats/page.tsx`)

La page est désormais organisée en trois blocs principaux :

### 1. KPIs de Temps (Time & Sessions)
Ce bloc affiche :
- **Focus Cumulé :** Le temps total passé (calculé à partir des sessions terminées) formaté via la fonction `formatFocusTime(seconds)`.
- **Série (Streak) :** Le nombre de jours consécutifs d'utilisation.

### 2. KPIs de Tâches (Tasks)
Ce bloc affiche :
- **Taux de Complétion :** Le pourcentage de tâches terminées par rapport au total.

### 3. Graphique de Contribution et Répartition des Priorités
La partie basse de l'écran est divisée :
- **Heatmap (7 colonnes) :** Affiche l'activité sur les 3 derniers mois, avec les étiquettes des jours (Lun, Mer, Ven) et des Mois. Les données sont générées par la fonction utilitaire `calculateHeatmapData`. L'intensité de la couleur (Niveau 1 à 4) reflète l'activité réelle de l'utilisateur (nombre de tâches complétées ce jour-là, basé sur `completedAt`).
- **Répartition par Priorité (5 colonnes) :** Un graphique sous forme de barres horizontales calculant dynamiquement le ratio de chaque niveau de priorité (Faible, Moyenne, Élevée, Deep Work).

## Le Dashboard (`src/app/(app)/page.tsx`)
Le graphique en barres des 5 derniers jours a été rendu interactif et réaliste :
- **Switcher (Temps / Tâches) :** Permet de basculer la métrique visualisée. 
- **Données réelles :** Le graphique extrait les données de la fonction `calculateDashboardChartData` basée sur l'historique des tâches, générant ainsi les barres proportionnelles pour les 5 derniers jours glissants.

## Fonctions clés implémentées (`src/utils/stats.ts`)

- `calculateHeatmapData(tasks: Task[], days: number)`: Parcourt la liste des tâches et génère un tableau de jours avec un compteur (`count`) et un niveau d'intensité (`level`) en se basant sur le champ `completedAt` (ou `createdAt` en fallback).
- `calculateDashboardChartData(tasks: Task[], mode: "time" | "tasks")`: Calcule l'activité des 5 derniers jours ouvrés pour alimenter le graphique du Dashboard. Gère le calcul des pourcentages relatifs pour que la barre la plus haute remplisse l'espace de façon esthétique.

## Prochaines étapes (Future)
- S'assurer que le backend (Supabase) synchronise correctement les nouveaux champs `startedAt` et `completedAt` avec la table des tâches.
- Ajouter un système de Classement/Leaderboard avec des "conseils IA" dans un onglet ou composant dédié.
