# Erreur Technique : Hydration Mismatch (SSR)

## 1. Fiche d'identité de l'Erreur

| Élément | Description |
| :--- | :--- |
| **Type d'erreur** | React Hydration Error (SSR) |
| **Message d'erreur** | `Hydration failed because the server rendered text didn't match the client.` |
| **Composant(s) impacté(s)** | `src/utils/stats.ts` (Appelé dans le dashboard et les statistiques) |
| **Sévérité** | Moyenne (Cassait le rendu initial de la page sur le client) |

## 2. Analyse de la Cause (Root Cause)

Le framework Next.js utilise le rendu côté serveur (SSR). Le serveur génère le HTML initial de la page et l'envoie au navigateur. Le navigateur "hydrate" ensuite cette page avec React.
Pour que l'hydratation réussisse, **l'arbre React généré sur le serveur doit être strictement identique à l'arbre généré au premier rendu sur le client**.

Dans notre cas, la fonction `calculateHeatmapData` et `calculateDashboardChartData` utilisaient `Math.random()` pour générer de fausses données visuelles lorsque l'utilisateur n'a pas encore de tâches.
- **Sur le serveur :** `Math.random()` générait par exemple `0.45` 
- **Sur le client :** `Math.random()` générait par exemple `0.89`

Cela provoquait un décalage entre les valeurs affichées par le serveur et celles calculées par le client, déclenchant l'erreur d'hydratation.

## 3. Solution Apportée

Il faut s'assurer que les valeurs générées dynamiquement soient **déterministes** (c'est-à-dire qu'elles donnent toujours le même résultat pour une même entrée, que ce soit sur le serveur ou le client).

- **Action :** Remplacement de `Math.random()` par une formule pseudo-aléatoire basée sur des données constantes à l'instant T (la date du jour en cours de calcul).
- **Code (Avant) :**
  ```typescript
  if (Math.random() > 0.6) { ... }
  ```
- **Code (Après) :**
  ```typescript
  const pseudoRandom = (d.getDate() * 11 + d.getMonth() * 7) % 10 / 10;
  if (pseudoRandom > 0.6) { ... }
  ```

Cette formule garantit que pour le "15 Juin", le serveur et le client obtiendront exactement le même nombre "aléatoire", assurant ainsi une hydratation React parfaite.
