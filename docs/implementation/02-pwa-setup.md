# Documentation : Intégration PWA (Progressive Web App)

## Objectif
Rendre FocusFlow installable en tant qu'application native sur Desktop et Mobile, et préparer le terrain pour le fonctionnement hors-ligne (Service Workers).

## Fichiers impactés
- `next.config.ts`
- `public/manifest.json`
- `src/app/layout.tsx`

## Implémentation

### 1. Fichier Manifest
Création du fichier `manifest.json` dans le dossier `public/`. Il définit le nom, les couleurs de thème (assorties à notre palette Dark/Primary) et l'icône principale de l'application.
```json
{
  "name": "FocusFlow",
  "short_name": "FocusFlow",
  "display": "standalone",
  "background_color": "#0f0f11",
  "theme_color": "#ffb596",
  "icons": [...]
}
```

### 2. Configuration Next.js
Utilisation du plugin `@ducanh2912/next-pwa` pour générer automatiquement le Service Worker. Ce plugin s'encapsule dans `next.config.ts`.
```typescript
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);
```

### 3. Layout Metadata
Ajout du lien vers le manifeste dans l'objet de métadonnées globales de l'application (dans `layout.tsx`).
```typescript
export const metadata: Metadata = {
  // ...
  manifest: "/manifest.json",
};
```

## Pré-requis Manuels
L'installation des paquets nécessitant une élévation locale :
`npm install @ducanh2912/next-pwa`
