# Fonctionnalité : Accès Administrateur

## Description
L'application propose un rôle d'administration permettant de superviser les métriques globales et d'accéder au panneau de modération.
Étant donné que l'application est ouverte et que les utilisateurs n'ont pas accès directement à la base de données Supabase, un système de surpassement (override) a été implémenté via les variables d'environnement.

## Ce qui a été apporté
- **Contournement par email :** Ajout de la possibilité de définir un email administrateur via la variable d'environnement `NEXT_PUBLIC_ADMIN_EMAIL` dans le fichier `.env`.
- Si l'email de l'utilisateur connecté correspond à cet email, il obtient automatiquement le rôle `admin` côté interface et côté proxy.
- **Accès sécurisé :** Le middleware / proxy a été mis à jour pour lire cet email et autoriser l'accès à la route `/admin`.

## Fichiers modifiés
- `src/proxy.ts` : Mise à jour de la vérification de l'URL `/admin` pour inclure la variable `.env`.
- `src/context/AppContext.tsx` : Injection du rôle `admin` dans le contexte global de l'application si l'email correspond.

## Règles de Gestion (RG) liées
- **RG-ADMIN-01 :** Seul l'utilisateur dont l'email correspond à `NEXT_PUBLIC_ADMIN_EMAIL` (ou ayant `role: 'admin'` en BDD) peut accéder à la vue `/admin`.
- **RG-ADMIN-02 :** Le bouton d'administration n'apparaît dans le menu de navigation (LayoutShell) que si le rôle est `admin`.
