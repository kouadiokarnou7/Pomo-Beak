# Documentation : Charge de Travail (Workload) dans le Kanban

## Objectif
Afficher de manière dynamique la somme des Pomodoros estimés (en minutes ou unités) pour chaque colonne du tableau Kanban afin de visualiser la charge de travail.

## Fichiers impactés
- `src/app/(app)/tasks/page.tsx`

## Implémentation
Dans le rendu de la colonne (`column.title`), nous filtrons d'abord les tâches associées au statut de la colonne. Ensuite, nous utilisons `reduce` pour calculer la somme de `estimatedPomodoros`.

```tsx
{(() => {
  const columnTasks = tasks.filter((t) => t.status === column.id);
  const count = columnTasks.length;
  const workload = columnTasks.reduce((acc, t) => acc + (t.estimatedPomodoros || 0), 0);
  return (
    <div className="flex items-center gap-1">
      <span className="bg-surface-glass px-2 py-0.5 rounded-full text-[9px] font-bold text-on-surface-variant font-mono" title={`${count} tâches`}>
        {count}
      </span>
      {workload > 0 && (
        <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold font-mono flex items-center gap-0.5" title={`Charge estimée: ${workload} min`}>
          <span className="material-symbols-outlined text-[10px]">schedule</span>
          {workload}
        </span>
      )}
    </div>
  );
})()}
```

## Règles UI respectées (UI UX Pro Max)
- Utilisation de `text-primary` avec un fond de faible opacité (`bg-primary/10`) pour un contraste doux ("Soft UI").
- L'indicateur ne s'affiche que si la charge est supérieure à 0 pour éviter d'encombrer l'UI visuellement.
