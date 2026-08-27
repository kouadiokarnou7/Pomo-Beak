"use client";

import React from "react";
import Link from "next/link";
import { useApp, Task } from "@/context/AppContext";
import { calculateDashboardChartData } from "@/utils/stats";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { FeedbackModal } from "@/components/FeedbackModal";

export default function DashboardPage() {
  const {
    timeLeft,
    isRunning,
    mode,
    totalDuration,
    toggleTimer,
    resetTimer,
    skipTimer,
    tasks,
    activeTaskId,
    setActiveTaskId,
    streak,
    completedSessionsToday,
    totalFocusTimeToday,
    toggleTaskCompleted,
    setIsAddTaskOpen,
    setViewingTask,
    timerStyle,
    setTimerStyle,
    isTimerMaximized,
    setIsTimerMaximized,
  } = useApp();

  const [chartMode, setChartMode] = React.useState<"time" | "tasks">("time");
  const chartData = React.useMemo(() => calculateDashboardChartData(tasks, chartMode), [tasks, chartMode]);

  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  // Format timeLeft to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format total focus time
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Find active task name
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // SVG Progress Ring calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Determine timer ring stroke color
  const getRingColor = () => {
    if (mode === "focus") return "#ffb596";
    if (mode === "short_break") return "#c0c1ff";
    return "#8dcdff";
  };

  // Active status color
  const getModeTitle = () => {
    if (mode === "focus") return "Session Concentrée";
    if (mode === "short_break") return "Courte Pause";
    return "Longue Pause";
  };

  if (isTimerMaximized) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-lg w-full relative z-10">
        <h2 className="text-sm font-semibold tracking-wider text-on-surface-variant mb-8 uppercase">
          {getModeTitle()}
        </h2>
        
        {/* Render timer based on style preference */}
        {timerStyle === "circular" && (
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-8 select-none">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r={radius} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4.5" />
              <circle cx="50" cy="50" fill="transparent" r={radius} stroke={getRingColor()} strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${getRingColor()})` }} />
            </svg>
            <div className="font-mono text-6xl md:text-7xl font-semibold text-on-background drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {timerStyle === "horizontal" && (
          <div className="w-full flex flex-col items-center gap-6 mb-10">
            <div className="font-mono text-7xl md:text-8xl font-bold text-on-background drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 max-w-sm">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(timeLeft / totalDuration) * 100}%`, backgroundColor: getRingColor(), boxShadow: `0 0 8px ${getRingColor()}` }}></div>
            </div>
          </div>
        )}

        {timerStyle === "digital" && (
          <div className="font-mono text-8xl md:text-9xl font-extrabold text-on-background drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] mb-10">
            {formatTime(timeLeft)}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6 mb-8">
          <button onClick={resetTimer} className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90" title="Réinitialiser"><span className="material-symbols-outlined text-[22px]">restart_alt</span></button>
          <button onClick={toggleTimer} className="w-18 h-18 rounded-full bg-primary-container text-white flex items-center justify-center shadow-glow-action-xl transition-all duration-300 active:scale-95 hover:scale-105"><span className="material-symbols-outlined text-[34px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isRunning ? "pause" : "play_arrow"}</span></button>
          <button onClick={skipTimer} className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90" title="Passer"><span className="material-symbols-outlined text-[22px]">skip_next</span></button>
        </div>

        {/* Active Task Name */}
        {activeTask && (
          <div className="mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-primary ${isRunning ? "animate-pulse" : ""}`}></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
              Actif: {activeTask.name}
            </span>
          </div>
        )}

        {/* Minimize Button */}
        <button onClick={() => setIsTimerMaximized(false)} className="px-4 py-2 rounded-lg bg-surface-glass border border-border-glass text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/40 flex items-center gap-1.5 transition-all cursor-pointer"><span className="material-symbols-outlined text-[16px]">fullscreen_exit</span>Quitter le mode Zen</button>
      </div>
    );
  };

  // Upcoming non-completed tasks (exclude completed and limit to 3)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Column (Timer and tasks summary) */}
      <div className="lg:col-span-8 flex flex-col gap-6 w-full">
        {/* Timer Card */}
        <div className="glass-panel-active rounded-xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          {/* Ambient overlay glow behind active timer */}
          <div className="absolute inset-0 bg-primary opacity-5 mix-blend-screen blur-3xl pointer-events-none"></div>



          {/* Header & Controls Row */}
          <div className="w-full flex items-center justify-between mb-6 z-10">
            <h2 className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
              {getModeTitle()}
            </h2>

            {/* Selector & Maximize controls */}
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-glass border border-border-glass rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setTimerStyle("circular")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${timerStyle === "circular" ? "bg-primary text-background-obsidian font-extrabold" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Rond
                </button>
                <button
                  onClick={() => setTimerStyle("horizontal")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${timerStyle === "horizontal" ? "bg-primary text-background-obsidian font-extrabold" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Barre
                </button>
                <button
                  onClick={() => setTimerStyle("digital")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${timerStyle === "digital" ? "bg-primary text-background-obsidian font-extrabold" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Digital
                </button>
              </div>

              <button
                onClick={() => setIsTimerMaximized(true)}
                className="w-7 h-7 rounded-lg bg-surface-glass border border-border-glass flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer active:scale-90"
                title="Agrandir en mode Zen"
              >
                <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Conditional Style Renderings */}
          {timerStyle === "circular" && (
            <div className="relative w-56 h-56 md:w-60 md:h-60 flex items-center justify-center z-10 mb-8 select-none">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="5.5"
                />
                {/* Progress Count ring */}
                <circle
                  className="timer-circle"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r={radius}
                  stroke={getRingColor()}
                  strokeWidth="5.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 8px ${getRingColor()})`
                  }}
                />
              </svg>
              {/* Numeric display in mono-font */}
              <div className="font-mono text-5xl md:text-6xl font-semibold text-on-background drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          {timerStyle === "horizontal" && (
            <div className="w-full flex flex-col items-center gap-4 z-10 mb-10 select-none">
              <div className="font-mono text-6xl md:text-7xl font-bold text-on-background drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 max-w-xs">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${(timeLeft / totalDuration) * 100}%`,
                    backgroundColor: getRingColor(),
                    boxShadow: `0 0 8px ${getRingColor()}`
                  }}
                ></div>
              </div>
            </div>
          )}

          {timerStyle === "digital" && (
            <div className="font-mono text-7xl md:text-8xl font-extrabold text-on-background drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10 mb-10 select-none">
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center gap-6 z-10">
            {/* Reset */}
            <button
              onClick={resetTimer}
              className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90"
              title="Réinitialiser"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
            {/* Play/Pause */}
            <button
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center shadow-glow-action-lg hover:shadow-glow-action-xl transition-all duration-300 active:scale-95 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRunning ? "pause" : "play_arrow"}
              </span>
            </button>
            {/* Skip */}
            <button
              onClick={skipTimer}
              className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90"
              title="Passer à l'étape suivante"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>

          {/* Active Task Chip */}
          <div className="mt-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 z-10 max-w-full">
            <span className={`w-2 h-2 rounded-full bg-primary ${isRunning ? "animate-pulse" : ""}`}></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary truncate max-w-[250px]">
              {activeTask ? `Actif: ${activeTask.name} (${activeTask.estimatedPomodoros} min)` : "Aucune tâche sélectionnée"}
            </span>
          </div>
        </div>

        {/* Upcoming Tasks Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-semibold text-on-background">
              Prochaines priorités
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`glass-panel p-4 rounded-xl flex items-center gap-4 group transition-all duration-200 cursor-pointer ${
                    activeTaskId === task.id ? "border-primary/45 bg-surface-glass" : ""
                  }`}
                >
                  {/* Custom check marker click trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompleted(task.id);
                    }}
                    className="w-6 h-6 rounded-full border border-on-surface-variant/40 group-hover:border-primary flex items-center justify-center transition-all animate-none shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px] text-transparent group-hover:text-primary/50">
                      check
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${
                      activeTaskId === task.id ? "text-primary" : "text-on-background"
                    }`}>
                      {task.name}
                    </h4>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant opacity-75 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Priorité : {task.priority === "low" ? "Faible" : task.priority === "medium" ? "Moyenne" : task.priority === "high" ? "Élevée" : "Deep Work"}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span className={`flex items-center gap-0.5 ${new Date(task.dueDate) < new Date() ? 'text-error font-bold' : ''}`}>
                            <span className="material-symbols-outlined text-[11px]">{new Date(task.dueDate) < new Date() ? 'warning' : 'calendar_today'}</span>
                            <span>{new Date(task.dueDate).toLocaleDateString("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium bg-surface-container px-2.5 py-1 rounded-md border border-border-glass/40 shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    <span className="font-mono">{task.completedPomodoros}/{task.estimatedPomodoros} min</span>
                  </div>

                  {/* View Details Eye Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingTask(task);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer shrink-0"
                    title="Voir les détails"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="glass-panel p-6 rounded-xl text-center text-on-surface-variant">
                Toutes les tâches sont terminées !
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (Metrics and Daily stats graph) */}
      <div className="lg:col-span-4 flex flex-col gap-6 w-full">
        {/* Performance Metrics Panel */}
        <div className="glass-panel rounded-xl p-6 flex flex-col h-full min-h-[460px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-on-background">Progrès Quotidien</h3>
              <p className="text-[10px] text-on-surface-variant mt-1">Temps de focus & Tâches</p>
            </div>
            {/* Switcher */}
            <div className="flex bg-surface-container rounded-lg p-1">
              <button 
                onClick={() => setChartMode("time")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMode === 'time' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Temps
              </button>
              <button 
                onClick={() => setChartMode("tasks")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMode === 'tasks' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Tâches
              </button>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                Temps de focus
              </span>
              <span className="text-2xl font-bold text-primary font-mono leading-none mt-1">
                {formatFocusTime(totalFocusTimeToday)}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                Tâches faites
              </span>
              <span className="text-2xl font-bold text-on-background font-mono leading-none mt-1">
                {tasks.filter((t) => t.status === "completed").length}
              </span>
            </div>
          </div>

          {/* Bar Chart (Dynamique & Contrasté) */}
          <div className="flex-1 flex flex-col justify-end gap-3 relative pb-4 min-h-[160px] mt-4">
            {/* Lignes de repères */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 pb-8 px-2 z-0">
              <div className="border-b border-on-surface w-full h-0"></div>
              <div className="border-b border-on-surface w-full h-0"></div>
              <div className="border-b border-on-surface w-full h-0"></div>
            </div>
            
            <div className="flex items-end justify-between h-40 px-4 z-10">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center justify-end w-full group relative h-full">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-surface-glass backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {chartMode === 'time' ? `${data.value} min` : `${data.value} tâches`}
                  </div>
                  
                  {/* Bar Wrapper to ensure bottom alignment */}
                  <div className="w-full flex justify-center items-end flex-1 mb-2">
                    <div 
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 cursor-pointer min-h-[4px] ${
                        data.active 
                          ? 'bg-gradient-to-t from-primary to-primary-container shadow-glow-general-md border border-primary/50' 
                          : 'bg-on-surface/20 hover:bg-primary/40 border border-border-glass'
                      }`} 
                      style={{ height: `${Math.max(2, data.percentage)}%` }}
                    ></div>
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-bold ${data.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification Streak Footer */}
          <div className="mt-auto pt-6 border-t border-border-glass flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-sm font-semibold">{streak} Jours consécutifs</span>
            </div>
            <Link href="/stats" className="text-[10px] font-bold tracking-widest text-primary uppercase cursor-pointer hover:underline transition-all">
              Détails
            </Link>
          </div>
        </div>
      </div>

      <TaskDetailsModal />
      
      {/* Floating feedback review trigger */}
      {!isTimerMaximized && (
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-secondary-container text-white flex items-center justify-center shadow-glow-general-md hover:shadow-glow-general-lg transition-all duration-300 active:scale-95 hover:scale-105 z-40 cursor-pointer border border-white/10"
          title="Donner votre avis"
        >
          <span className="material-symbols-outlined text-[22px]">rate_review</span>
        </button>
      )}

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
