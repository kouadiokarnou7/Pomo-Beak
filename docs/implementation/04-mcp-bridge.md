# Documentation : API Pont (Serveur MCP) pour Gemini

## Objectif
Permettre à un agent IA (comme Gemini ou Claude) de se connecter à FocusFlow (PomoBeak) via le protocole MCP (Model Context Protocol) pour créer directement des tâches dans l'application au nom de l'utilisateur.

## État actuel (Plan)
Cette fonctionnalité est prévue pour la Phase 1 du nouveau plan d'architecture.

## Implémentation Prévue

### 1. Endpoint Serverless (Next.js)
Nous créerons une route d'API dans `src/app/api/mcp/route.ts` qui agira comme un serveur MCP léger.
Elle exposera un JSON Schema décrivant l'outil `createTask`.

### 2. Authentification et Sécurité
Le serveur MCP sera sécurisé. L'IA devra envoyer une requête signée ou inclure un Token d'accès (OAuth ou Clé API) généré par l'utilisateur dans FocusFlow.

### 3. Interaction avec la Base de Données
Le backend recevra la commande formattée de Gemini et utilisera `@supabase/supabase-js` (via le client serveur `utils/supabase/server.ts`) pour insérer directement les données dans la table `tasks`.

## Avantages
- Création vocale ou textuelle de tâches de manière fluide.
- Pas de saisie manuelle.
- L'Agent IA gère lui-même la décomposition d'un gros objectif en sous-tâches Pomodoros.
