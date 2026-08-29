# Fonctionnalité : Notifications In-App

## Description
L'application doit fournir un feedback visuel immédiat aux actions de l'utilisateur (comme la création de tâches ou la fin d'un cycle Pomodoro). Ce système repose sur des "Toasts" auto-réversibles.

## Ce qui a été apporté
- **Confirmation de création :** Intégration du système de toast à l'interface de création de tâches.
- Chaque nouvelle tâche ajoutée déclenche maintenant une bulle de notification de type "success" pour informer que la sauvegarde (locale ou cloud) a réussi.

## Fichiers modifiés
- `src/components/AddTaskModal.tsx` : Import de `showToast` depuis le contexte global `useApp()`, appelé à l'intérieur de `handleSubmit()` avec un message personnalisé "Tâche créée avec succès !".
