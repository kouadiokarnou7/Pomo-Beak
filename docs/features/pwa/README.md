# Fonctionnalité : Progressive Web App (PWA)

## Description
Afin de rendre l'expérience utilisateur aussi native que possible, l'application Web a été configurée pour être installable (Progressive Web App). Cela permet à pomoBEAK de s'afficher comme une application autonome sur Desktop (via Chrome/Edge) ou Mobile (iOS/Android) avec son propre lanceur et un mode plein écran sans barre d'URL.

## Ce qui a été apporté
- **Configuration Next.js PWA :** Utilisation du package npm `@ducanh2912/next-pwa` pour générer automatiquement le Service Worker et intercepter les requêtes pour le fonctionnement (partiellement) hors-ligne.
- **Support des Assets :** Liaison avec le `manifest.json` présent dans `/public` pour gérer le nom (`pomobeak`), les couleurs de thème, et les icônes de l'application sur l'écran d'accueil de l'utilisateur.

## Fichiers modifiés
- `next.config.ts` : Encapsulation de la configuration de base de Next.js (`nextConfig`) avec le wrapper `withPWAInit`. Configuration pour générer les fichiers workers dans le dossier `public` et désactivation automatique en mode développement pour éviter les conflits de cache (`disable: process.env.NODE_ENV === "development"`).
