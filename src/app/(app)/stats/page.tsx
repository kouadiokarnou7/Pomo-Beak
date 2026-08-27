"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { calculateHeatmapData } from "@/utils/stats";

/**
 * StatsPage component.
 * Renders the analytics dashboard, separating Time KPIs and Task KPIs,
 * and includes a GitHub-style contribution graph (heatmap) for productivity tracking.
 * 
 * @returns {JSX.Element} The rendered Stats page.
 */
export default function StatsPage() {
  const { totalFocusTimeToday, completedSessionsToday, tasks, streak } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  /**
   * Formats seconds into a human-readable string (hours and minutes).
   * 
   * @param {number} seconds - The total number of seconds.
   * @returns {string} Formatted time string (e.g., "1h 30m" or "45m").
   */
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Calculate real priority distribution from actual tasks
  const priorityMap: Record<string, { name: string; count: number; color: string }> = {
    low: { name: "Faible", count: 0, color: "bg-surface-glass border border-border-glass" },
    medium: { name: "Moyenne", count: 0, color: "bg-on-surface-variant/40" },
    high: { name: "Élevée", count: 0, color: "bg-error" },
    deep_work: { name: "Deep Work", count: 0, color: "bg-primary" },
  };

  tasks.forEach((t) => {
    if (priorityMap[t.priority]) {
      priorityMap[t.priority].count++;
    }
  });

  const priorities = Object.values(priorityMap)
    .sort((a, b) => b.count - a.count)
    .map((p) => ({
      ...p,
      percentage: totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0,
    }));

  const contributionData = useMemo(() => calculateHeatmapData(tasks, 90), [tasks]);

  // Group data by weeks
  const weeks = [];
  for (let i = 0; i < contributionData.length; i += 7) {
    weeks.push(contributionData.slice(i, i + 7));
  }

  // Generate Month Labels
  const monthLabels: { index: number; label: string }[] = [];
  let currentMonth = "";
  weeks.forEach((week, i) => {
    if (week.length > 0) {
      const date = new Date(week[0].date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (month !== currentMonth) {
        monthLabels.push({ index: i, label: month });
        currentMonth = month;
      }
    }
  });

  return (
    <div className="flex flex-col gap-8 w-full font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Analyses de Performance</h2>
        <p className="text-xs text-on-surface-variant mt-1">Suivez votre progression et visualisez votre intensité de travail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TIME KPIs */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-base">timer</span>
            Temps & Sessions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Focus Cumulé</span>
              <div className="mt-3">
                <span className="text-2xl font-bold text-primary font-mono">{formatFocusTime(totalFocusTimeToday)}</span>
                <span className="text-xs text-on-surface-variant block mt-1">{completedSessionsToday} sessions</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Série (Streak)</span>
              <div className="mt-3">
                <span className="text-2xl font-bold text-secondary font-mono">{streak} jours</span>
                <span className="text-xs text-on-surface-variant block mt-1">Flamme active 🔥</span>
              </div>
            </div>
          </div>
        </section>

        {/* TASKS KPIs */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-base">task_alt</span>
            Tâches
          </h3>
          <div className="grid grid-cols-1 gap-4">
             <div className="glass-panel p-5 rounded-xl flex items-center justify-between min-h-[110px]">
                <div className="flex flex-col justify-between h-full">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Taux de Complétion</span>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-tertiary font-mono">{completionRate}%</span>
                    <span className="text-xs text-on-surface-variant block mt-1">{completedTasks} sur {totalTasks} terminées</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-4xl opacity-80">leaderboard</span>
             </div>
          </div>
        </section>
      </div>

      {/* Main Stats body - Heatmap & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Heatmap Contribution Graph */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase">Activité & Productivité</h3>
            <span className="text-xs text-on-surface-variant">3 derniers mois</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            <div className="flex items-end w-full overflow-x-auto pb-4">
              {/* Labels Jours (Y axis) */}
              <div className="flex flex-col gap-1 pr-2 mt-5 text-[10px] text-on-surface-variant shrink-0">
                <div className="h-4 flex items-center"></div>
                <div className="h-4 flex items-center">Lun</div>
                <div className="h-4 flex items-center"></div>
                <div className="h-4 flex items-center">Mer</div>
                <div className="h-4 flex items-center"></div>
                <div className="h-4 flex items-center">Ven</div>
                <div className="h-4 flex items-center"></div>
              </div>
              
              <div className="flex flex-col shrink-0 overflow-x-auto pb-2">
                {/* Labels Mois (X axis) */}
                <div className="flex text-[10px] text-on-surface-variant mb-1 relative h-4 min-w-full">
                  {monthLabels.map((ml) => (
                    <span 
                      key={ml.index} 
                      className="absolute" 
                      style={{ left: `${ml.index * 20}px` }} // 16px (w-4) + 4px (gap-1)
                    >
                      {ml.label}
                    </span>
                  ))}
                </div>
                
                {/* Grille */}
                <div className="flex gap-1 min-w-max">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 w-4">
                      {week.map((day, i) => {
                        // Level colors: 0=transparent, 1=light, ..., 4=intense
                        let bgColor = "bg-surface-container/30";
                        if (day.level === 1) bgColor = "bg-primary/30";
                        else if (day.level === 2) bgColor = "bg-primary/50";
                        else if (day.level === 3) bgColor = "bg-primary/80";
                        else if (day.level === 4) bgColor = "bg-primary";

                        return (
                          <div 
                            key={day.date}
                            className={`w-4 h-4 rounded-sm ${bgColor} hover:ring-1 hover:ring-on-surface transition-all cursor-pointer`}
                            title={`${day.count} activité(s) le ${day.date}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Légende */}
            <div className="flex items-center gap-2 mt-2 text-[10px] text-on-surface-variant w-full justify-end px-4">
               <span>Moins</span>
               <div className="w-3 h-3 rounded-sm bg-surface-container/30"></div>
               <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
               <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
               <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
               <div className="w-3 h-3 rounded-sm bg-primary"></div>
               <span>Plus</span>
            </div>
          </div>
        </div>

        {/* Priority distribution */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase mb-6">Répartition par Priorité</h3>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {totalTasks > 0 ? (
              priorities.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">{p.name}</span>
                    <span className="text-on-surface-variant font-mono">{p.count} tâches ({p.percentage}%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant text-sm py-8">
                Créez des tâches pour voir la répartition par priorité.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
