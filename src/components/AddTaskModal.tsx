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
      estimatedPomodoros: sessionDuration,
      status: "todo",
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    setName("");
    setDescription("");
    setPriority("medium");
    setSessionDuration(25);
    setCustomDuration("");
    setDueDate("");
    setCurrentStep(1);
    setIsAddTaskOpen(false);
  };

  const handleNext = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // Semantic Colors for Priority
  const getPriorityStyle = (p: string, isSelected: boolean) => {
    if (!isSelected) return "border-border-glass text-on-surface-variant hover:border-on-surface-variant";
    switch (p) {
      case "low": return "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400";
      case "medium": return "bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400";
      case "high": return "bg-orange-500/10 border-orange-500/50 text-orange-600 dark:text-orange-400";
      case "deep_work": return "bg-purple-500/10 border-purple-500/50 text-purple-600 dark:text-purple-400";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      <div 
        onClick={() => setIsAddTaskOpen(false)}
        className="absolute inset-0 bg-background/40 backdrop-blur-sm transition-all"
      ></div>

      <div className="relative w-full max-w-lg bg-surface-glass border border-border-glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-glass/50 flex flex-col bg-surface-glass shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight text-on-background">Nouvelle Tâche</h2>
            <button 
              onClick={() => setIsAddTaskOpen(false)}
              className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="md:hidden mt-4 w-full bg-surface-container rounded-full h-1 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-8 md:space-y-6 overflow-y-auto flex-1">
            
            {/* Step 1: Name */}
            <div className={`${currentStep === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'}`}>
              <div className="group relative">
                <input
                  id="taskName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Qu'allez-vous accomplir ?"
                  className="w-full bg-transparent border-b-2 border-border-glass py-3 text-lg font-medium text-on-background placeholder-on-surface-variant/40 focus:outline-none focus:border-primary transition-all duration-300 peer"
                />
                <label 
                  htmlFor="taskName" 
                  className="absolute -top-3 left-0 text-[10px] font-bold tracking-widest uppercase text-primary opacity-0 peer-focus:opacity-100 peer-valid:opacity-100 transition-all"
                >
                  Nom de la Tâche
                </label>
              </div>
            </div>

            {/* Step 2: Duration & Description */}
            <div className={`${currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'} space-y-6`}>
              <div>
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant block mb-3">
                  DURÉE ESTIMÉE
                </label>
                <div className="flex flex-wrap gap-3">
                  {([15, 25, 45, 60] as const).map((mins) => {
                    const isSelected = sessionDuration === mins && !customDuration;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => { setSessionDuration(mins); setCustomDuration(""); }}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                          isSelected ? "border-primary bg-primary text-background shadow-md shadow-primary/20" : "border-border-glass text-on-surface hover:border-on-surface-variant"
                        }`}
                      >
                        {mins} min
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border-glass focus-within:border-primary transition-colors">
                    <input
                      type="number"
                      min="5" max="180"
                      value={customDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomDuration(val);
                        if (val && !isNaN(parseInt(val))) setSessionDuration(Math.max(5, Math.min(180, parseInt(val))));
                      }}
                      placeholder="..."
                      className="w-10 bg-transparent text-sm text-center font-medium focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">min</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant block mb-3">
                  DESCRIPTION (OPTIONNELLE)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs, ressources..."
                  className="w-full bg-surface-glass border border-border-glass/50 rounded-xl px-4 py-3 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* Step 3: Priority & Reminder */}
            <div className={`${currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden md:block'} space-y-6`}>
              <div>
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant block mb-3">
                  NIVEAU DE PRIORITÉ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["low", "medium", "high", "deep_work"] as const).map((p) => {
                    const isSelected = priority === p;
                    const labels = { low: "Faible", medium: "Moyenne", high: "Élevée", deep_work: "Deep Work" };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${getPriorityStyle(p, isSelected)}`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-current shadow-sm"></span>}
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant block mb-3">
                  RAPPEL PLANIFIÉ
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-surface-glass border border-border-glass/50 rounded-xl px-4 py-3 text-sm text-on-background focus:outline-none focus:border-primary transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex p-6 border-t border-border-glass/50 bg-surface-glass shrink-0 justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(false)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
            >
              Annuler
            </button>
             <button
              type="submit"
              className="px-8 py-2.5 rounded-full text-sm font-bold bg-primary text-background shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Créer la Tâche
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden p-4 justify-between items-center border-t border-border-glass/50 bg-surface-glass shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Retour
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                Annuler
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !name.trim()}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-surface-container text-primary hover:bg-primary hover:text-background transition-colors cursor-pointer disabled:opacity-50"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-background shadow-lg shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
              >
                Terminer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
