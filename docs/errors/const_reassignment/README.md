# Erreur Technique : Reassignment d'une variable `const`

## 1. Fiche d'identité de l'Erreur

| Élément | Description |
| :--- | :--- |
| **Type d'erreur** | Build Error (Turbopack / ECMAScript) |
| **Message d'erreur** | `cannot reassign to a variable declared with 'const'` |
| **Fichier impacté** | `src/utils/stats.ts`, ligne 72 |
| **Sévérité** | Critique (empêche la compilation) |

## 2. Analyse de la Cause

Dans la fonction `calculateHeatmapData`, la variable `count` était déclarée avec `const` :
```typescript
const count = activityMap[dateStr] || 0;
```

Plus loin dans le code, on tentait de réassigner cette variable pour injecter des fausses données (mockup) :
```typescript
count = level * 2; // ❌ Erreur: const ne peut pas être réassigné
```

## 3. Solution Apportée

Changement de `const` en `let` pour autoriser la réassignation :
```typescript
let count = activityMap[dateStr] || 0; // ✅ let autorise la réassignation
```

## 4. Règle Préventive

Lorsqu'une variable est susceptible d'être modifiée dans une branche conditionnelle, toujours utiliser `let` au lieu de `const`.
