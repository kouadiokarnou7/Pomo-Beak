"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export const AddTaskModal: React.FC = () => {
  const { isAddTaskOpen, setIsAddTaskOpen, addTask } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "deep_work">("medium");
  const [sessionDuration, setSessionDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  // Wizard state for mobile
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  if (!isAddTaskOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTask({
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedPomodoros: sessionDuration, // Stored in estimated_pomodoros as minutes
      status: "todo",
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    // Reset Form
    setName("");
    setDescription("");
    setPriority("medium");
    setSessionDuration(25);
    setCustomDuration("");
    setDueDate("");
    setCurrentStep(1);
    setIsAddTaskOpen(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      {/* Heavy glass blur backdrop overlay */}
      <div 
        onClick={() => setIsAddTaskOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-[35px] transition-all"
      ></div>

      {/* Modal Container Card */}
      <div className="relative w-full max-w-md bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100 z-10 flex flex-col max-h-[90vh]">
        
        {/* Subtle orange ambient glow in the top corner */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-border-glass flex flex-col bg-surface-container/20 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-surface-glass border border-border-glass flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">add_task</span>
              </div>
              <h2 className="text-base font-bold text-on-surface tracking-tight">Nouvelle Tâche</h2>
            </div>
            <button 
              onClick={() => setIsAddTaskOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-glass cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="md:hidden mt-3 w-full bg-surface-glass rounded-full h-1 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 md:space-y-4 overflow-y-auto flex-1">
            
            {/* Step 1: Task Name */}
            <div className={`${currentStep === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'}`}>
              <div className="group">
                <label 
                  htmlFor="taskName" 
                  className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary"
                >
                  Nom de la Tâche <span className="text-error">*</span>
                </label>
                <input
                  id="taskName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rédiger le rapport PM"
                  className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-glow-general-sm transition-all duration-300"
                />
              </div>
            </div>

            {/* Step 2: Duration & Description */}
            <div className={`${currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'} space-y-4`}>
              {/* Session Duration Selection */}
              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                  Durée de Session (minutes)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {([15, 30, 45, 60] as const).map((mins) => {
                    const isSelected = sessionDuration === mins && !customDuration;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setSessionDuration(mins);
                          setCustomDuration("");
                        }}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex-1 md:flex-none ${
                          isSelected
                            ? "border-primary/50 bg-primary/10 text-primary shadow-glow-general-sm"
                            : "border-border-glass bg-surface-glass text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {mins} min
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom Duration Input */}
                <div className="flex items-center gap-2 mt-2 bg-surface-glass p-2 rounded-lg border border-border-glass">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase shrink-0">Personnalisé :</span>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={customDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomDuration(val);
                      if (val) {
                        const parsed = parseInt(val);
                        if (!isNaN(parsed)) {
                          setSessionDuration(Math.max(5, Math.min(180, parsed)));
                        }
                      } else {
                        setSessionDuration(25);
                      }
                    }}
                    placeholder="25"
                    className="w-16 bg-surface-container border border-border-glass rounded-md px-2 py-1 text-xs text-on-surface text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-xs text-on-surface-variant">min</span>
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label 
                  htmlFor="taskDesc" 
                  className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary"
                >
                  Description (Optionnel)
                </label>
                <textarea
                  id="taskDesc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajouter des notes ou consignes..."
                  className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Step 3: Priority & Reminder */}
            <div className={`${currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'} space-y-4`}>
              {/* Priority Selection chips */}
              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                  Niveau de Priorité
                </label>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  {(["low", "medium", "high", "deep_work"] as const).map((p) => {
                    const isSelected = priority === p;
                    const getLabel = () => {
                      if (p === "low") return "Faible";
                      if (p === "medium") return "Moyenne";
                      if (p === "high") return "Élevée";
                      return "Deep Work";
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
                          isSelected
                            ? "border-primary/50 bg-primary/10 text-primary shadow-glow-general-sm"
                            : "border-border-glass bg-surface-glass text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-general-sm"></span>}
                        <span>{getLabel()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reminder Date & Time */}
              <div className="group">
                <label 
                  htmlFor="dueDate" 
                  className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary"
                >
                  Planifier un Rappel de Démarrage (Optionnel)
                </label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Form Actions - Desktop (Always fully visible) */}
          <div className="hidden md:flex p-5 pt-3.5 justify-end gap-3 border-t border-border-glass bg-surface-container/20 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(false)}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-glass transition-all cursor-pointer"
            >
              Annuler
            </button>
             <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary-container text-white shadow-glow-action-md hover:brightness-105 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Créer la Tâche</span>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          </div>

          {/* Form Actions - Mobile (Wizard Steps) */}
          <div className="flex md:hidden p-4 justify-between items-center border-t border-border-glass bg-surface-container/20 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-glass transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Précédent
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-glass transition-all cursor-pointer"
              >
                Annuler
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !name.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary/20 text-primary hover:bg-primary/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary-container text-white shadow-glow-action-md hover:brightness-105 transition-all flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Créer
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
