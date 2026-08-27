# Implémentation : Refonte UI Premium & Notifications Push/Audio

Ce document explique les détails d'implémentation de la refonte visuelle de l'application et de l'intégration des notifications.

## 1. Refonte du Modal `AddTaskModal.tsx`

Le composant modal de création de tâche a été complètement revu pour respecter la charte "UI UX Pro Max".

### Changements Majeurs
- **Design Épuré :** Le fond du modal utilise désormais `bg-background` pour un rendu minimaliste, avec de fines bordures (`border-border-glass`) et une ombre portée douce (`shadow-2xl`).
- **Inputs Modernes :** Au lieu de gros rectangles gris, les champs de texte (comme le nom de la tâche) utilisent un style avec uniquement une bordure inférieure (`border-b-2`), qui s'illumine en couleur primaire au focus.
- **Couleurs Sémantiques des Priorités :** 
  - **Faible :** Vert (`bg-green-500/10 text-green-600`)
  - **Moyenne :** Jaune (`bg-yellow-500/10 text-yellow-600`)
  - **Élevée :** Orange (`bg-orange-500/10 text-orange-600`)
  - **Deep Work :** Violet (`bg-purple-500/10 text-purple-600`)
- **Responsive (Wizard) :** La logique de "Wizard" en 3 étapes pour les écrans mobiles a été conservée, et combinée élégamment au design complet sur Desktop.

## 2. Cohérence du Dashboard (`page.tsx`)

Le Dashboard a été ajusté pour une meilleure cohérence des couleurs :
- Le bouton de contrôle principal du minuteur (Play/Pause) qui était bleu (`bg-primary-container`) utilise maintenant la couleur primaire du thème (`bg-primary`), qui correspond au cercle orange du timer.
- L'infobulle (Tooltip) et le dégradé des graphiques de statistiques ont été rendus plus contrastés pour être parfaitement lisibles, même sur petit écran.

## 3. Système d'Alerte : Audio et Notifications HTML5

La logique d'alerte lors de la fin d'un Pomodoro a été enrichie dans `src/context/AppContext.tsx` (méthode `handleTimerComplete`).

### A. Notifications Audio
- Le système essaie de lire un fichier audio local `alarm.mp3` situé dans le dossier `public/`.
- **Mécanisme de secours (Fallback) :** Si le fichier `alarm.mp3` est introuvable ou si le navigateur bloque l'autoplay, le système retombe automatiquement sur l'API Web Audio native (`playChime()`) pour générer un bip numérique ou un son "zen".

### B. Notifications Push (HTML5)
- **Détection :** Le code vérifie si l'API `Notification` est supportée par le navigateur et si l'utilisateur a activé `notifyPush` dans ses paramètres.
- **Demande d'autorisation :** Si l'autorisation n'a pas encore été accordée, une popup native du navigateur demande la permission.
- **Déclenchement :** Lorsque le minuteur arrive à 0, une notification native "pomoBEAK" s'affiche au-dessus de toutes les fenêtres de l'OS avec un message contextuel ("Session de focus terminée !" ou "Fin de la pause !").

### Instructions d'utilisation pour le son
Pour activer la sonnerie personnalisée, il suffit de :
1. Trouver un fichier son (cloche, alarme douce) au format `.mp3`.
2. Le renommer en `alarm.mp3`.
3. Le placer dans le dossier `c:\Users\HP\Desktop\focus\public\`.
