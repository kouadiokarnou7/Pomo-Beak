# Documentation : Statistiques Dynamiques (Dashboard)

## Objectif
Remplacer le graphique statique du temps de concentration hebdomadaire par un graphique dynamique reflétant l'effort réel (ou une simulation basée sur l'effort du jour), et améliorer la visualisation du "Streak" (série).

## Fichiers impactés
- `src/app/(app)/page.tsx`

## Implémentation
Le graphique en barres CSS a été retravaillé pour s'appuyer sur un tableau de données, permettant un rendu dynamique. 
La hauteur de la barre (`height`) et la surbrillance (état `active`) dépendent des données calculées.

```tsx
{[
  { day: "L", percentage: 40, active: false },
  { day: "M", percentage: 70, active: false },
  { day: "M", percentage: 90, active: false },
  { day: "J", percentage: Math.min(100, Math.max(15, (totalFocusTimeToday / 7200) * 100)), active: true },
  { day: "V", percentage: 0, active: false }
].map((data, idx) => (
  <div key={idx} className="flex flex-col items-center gap-2 w-full group">
    <div 
      className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 cursor-pointer ${
        data.active 
          ? 'bg-primary shadow-glow-general-md' 
          : 'bg-primary/30 group-hover:bg-primary/50'
      }`} 
      style={{ height: `${data.percentage}%` }}
      title={`${Math.round(data.percentage)}% de l'objectif`}
    ></div>
    <span className={`text-[10px] font-bold ${data.active ? 'text-primary' : 'text-on-surface-variant/50'}`}>
      {data.day}
    </span>
  </div>
))}
```

## Évolutions futures
Lorsque la base de données enregistrera les sessions passées, le tableau des données pourra être peuplé depuis le backend (Supabase), remplaçant les valeurs mockées des jours précédents.
