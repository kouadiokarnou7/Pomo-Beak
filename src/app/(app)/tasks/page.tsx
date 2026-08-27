"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useApp, Task } from "@/context/AppContext";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

export default function TasksPage() {
  const {
    tasks,
    activeTaskId,
    setActiveTaskId,
    toggleTaskCompleted,
    deleteTask,
    updateTaskStatus,
    setIsAddTaskOpen,
    setEditingTask,
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
  } = useApp();

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Column Title Inline Editing States
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Format priority levels
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full bg-error-container/20 text-error text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Élevée</span>
          </span>
        );
      case "deep_work":
        return (
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">bolt</span>
            <span>Deep Work</span>
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Moyenne</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-surface-glass text-on-surface-variant/70 text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Faible</span>
          </span>
        );
    }
  };

  // Reminder badge formatting with past-due styling
  const getReminderBadge = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const isPast = date < now;
    
    const formatted = date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 border shrink-0 ${
        isPast 
          ? "bg-error-container/15 text-error border-error/20" 
          : "bg-surface-glass text-on-surface-variant/80 border-border-glass"
      }`} title={isPast ? "Planifié (Date dépassée)" : "Rappel de démarrage"}>
        <span className="material-symbols-outlined text-[12px]">{isPast ? "notifications_active" : "notifications"}</span>
        <span>{formatted}</span>
      </span>
    );
  };

  // Render Kanban task card
  const renderKanbanCard = (task: Task, index: number) => {
    const isActive = activeTaskId === task.id;
    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setActiveTaskId(task.id)}
            className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col relative ${
              isActive
                ? "border-primary/40 shadow-glow-general-sm bg-surface-glass"
                : "hover:border-primary/30"
            } ${snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/50 rotate-2 z-50 bg-surface-container" : ""}`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
            )}

            <div className="flex justify-between items-start mb-2.5">
              {task.dueDate ? getReminderBadge(task.dueDate) : <div />}
              
              {/* Edit & Delete - visible on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask(task);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer"
                  title="Modifier"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-all cursor-pointer"
                  title="Supprimer"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>

            <h4 className={`text-sm font-semibold mb-4 leading-snug ${isActive ? "text-primary" : "text-on-surface"}`}>
              {task.name}
            </h4>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-grab">drag_indicator</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold bg-surface-container rounded-md px-2 py-0.5 border border-border-glass/40">
                <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
                <span className="font-mono text-on-surface">{task.completedPomodoros}/{task.estimatedPomodoros} min</span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    updateTaskStatus(draggableId, newStatus);
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Gestion des Tâches</h2>
          <p className="text-xs text-on-surface-variant mt-1">Organisez votre charge de travail et vos sessions de concentration.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-border-glass">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-[10px] tracking-widest transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-surface-glass text-primary shadow-glow-general-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              <span>LISTE</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-[10px] tracking-widest transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-surface-glass text-primary shadow-glow-general-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>KANBAN</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="ml-auto sm:ml-0 bg-primary-container text-white py-2 px-4 rounded-lg shadow-glow-action-md hover:bg-opacity-95 transition-all text-xs font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Primary Display panels */}
      {viewMode === "list" ? (
        <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_1fr_150px_120px_100px_80px] gap-4 items-center px-6 py-3 border-b border-border-glass bg-surface-container/30 font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
            <div className="text-center">Statut</div>
            <div>Nom de la tâche</div>
            <div className="text-center">Rappel</div>
            <div className="text-center">Priorité</div>
            <div className="text-right">Focus</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body rows */}
          <div className="divide-y divide-border-glass">
            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center text-on-surface-variant text-sm">
                Aucune tâche pour le moment. Cliquez sur "Nouvelle Tâche" pour commencer !
              </div>
            ) : (
            tasks.map((task) => {
              const isActive = activeTaskId === task.id;
              const isCompleted = task.status === "completed";
              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`group grid grid-cols-[50px_1fr_150px_120px_100px_80px] gap-4 items-center px-6 py-4 hover:bg-surface-glass transition-colors cursor-pointer relative ${
                    isActive ? "bg-surface-glass/40" : ""
                  }`}
                >
                  {/* High priority luminous marker */}
                  {task.priority === "high" && !isCompleted && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-glow-general-md"></div>
                  )}

                  {/* Complete check-off checkbox */}
                  <div className="flex justify-center items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompleted(task.id);
                      }}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-primary border-primary shadow-glow-general-sm"
                          : "border-border-glass hover:border-primary/50"
                      }`}
                    >
                      {isCompleted && (
                        <span className="material-symbols-outlined text-[13px] text-white">check</span>
                      )}
                    </button>
                  </div>

                  {/* Task details */}
                  <div className="min-w-0">
                    <span className={`text-sm font-semibold truncate block ${
                      isCompleted ? "line-through text-on-surface-variant/50" : isActive ? "text-primary font-bold" : "text-on-surface"
                    }`}>
                      {task.name}
                    </span>
                    {task.description && (
                      <span className="text-xs text-on-surface-variant opacity-75 mt-0.5 block truncate max-w-xl">
                        {task.description}
                      </span>
                    )}
                  </div>

                  {/* Start Reminder Date/Time tag */}
                  <div className="flex justify-center">
                    {task.dueDate ? getReminderBadge(task.dueDate) : <span className="text-xs text-on-surface-variant/40">-</span>}
                  </div>

                  {/* Priority level flag */}
                  <div className="flex justify-center">
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Focus Minutes counter */}
                  <div className="flex justify-end items-center gap-1 text-xs text-primary font-medium">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span className="font-mono text-on-surface">{task.completedPomodoros}/{task.estimatedPomodoros} min</span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer"
                      title="Modifier"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-all cursor-pointer"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board Columns */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 items-start overflow-x-auto pb-4 w-full">
            {columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className={`glass-panel p-4 rounded-xl flex flex-col gap-4 min-w-[320px] max-w-[320px] h-[75vh] transition-colors ${snapshot.isDraggingOver ? "bg-surface-glass border-primary/30" : ""}`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border-glass/40">
                      {editingColumnId === column.id ? (
                        <input
                          type="text"
                          value={editingColumnTitle}
                          onChange={(e) => setEditingColumnTitle(e.target.value)}
                          onBlur={() => {
                            if (editingColumnTitle.trim() && editingColumnTitle !== column.title) {
                              updateColumn(column.id, editingColumnTitle.trim());
                            }
                            setEditingColumnId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (editingColumnTitle.trim() && editingColumnTitle !== column.title) {
                                updateColumn(column.id, editingColumnTitle.trim());
                              }
                              setEditingColumnId(null);
                            } else if (e.key === "Escape") {
                              setEditingColumnId(null);
                            }
                          }}
                          className="bg-surface-container border border-border-glass rounded px-2 py-0.5 text-xs text-on-surface focus:outline-none focus:border-primary w-[70%]"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group/title flex-1 min-w-0"
                          onDoubleClick={() => {
                            setEditingColumnId(column.id);
                            setEditingColumnTitle(column.title);
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            column.id === 'in_progress' 
                              ? 'bg-primary shadow-glow-general-sm' 
                              : column.id === 'completed' 
                              ? 'bg-tertiary-container' 
                              : 'bg-on-surface-variant/40'
                          }`}></span>
                          <h3 className={`text-sm font-bold truncate ${column.id === 'in_progress' ? 'text-primary' : 'text-on-surface'}`}>
                            {column.title}
                          </h3>
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
                          <button
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditingColumnTitle(column.title);
                            }}
                            className="opacity-0 group-hover/title:opacity-100 p-0.5 rounded hover:bg-surface-glass text-on-surface-variant transition-all cursor-pointer"
                            title="Modifier le titre"
                          >
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                          </button>
                        </div>
                      )}

                      {/* Delete Column Button - visible only for custom columns (index >= 3) */}
                      {columns.indexOf(column) >= 3 && (
                        <button
                          onClick={() => deleteColumn(column.id)}
                          className="text-on-surface-variant hover:text-error p-1 rounded-md hover:bg-error/5 transition-all cursor-pointer shrink-0"
                          title="Supprimer la colonne"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                      {tasks.filter((t) => t.status === column.id).map((t, index) => renderKanbanCard(t, index))}
                      {provided.placeholder}
                      
                      {column.id === columns[0].id && (
                        <button
                          onClick={() => setIsAddTaskOpen(true)}
                          className="py-3 mt-2 border border-dashed border-border-glass rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-surface-glass transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span>Ajouter Tâche</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

             {/* Add Column Button */}
            <div className="min-w-[320px] h-full">
              {isAddingColumn ? (
                <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Nom de la colonne..."
                    className="bg-surface-container border border-border-glass rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newColumnTitle.trim()) {
                        addColumn(newColumnTitle.trim());
                        setNewColumnTitle("");
                        setIsAddingColumn(false);
                      }
                      if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newColumnTitle.trim()) {
                           addColumn(newColumnTitle.trim());
                           setNewColumnTitle("");
                           setIsAddingColumn(false);
                        }
                      }}
                      className="bg-primary text-white text-xs font-bold py-1.5 px-3 rounded-md flex-1 cursor-pointer"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="bg-surface-container text-on-surface-variant text-xs font-bold py-1.5 px-3 rounded-md flex-1 border border-border-glass cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-12 border-2 border-dashed border-border-glass rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-surface-glass transition-all flex items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Nouvelle Colonne</span>
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      )}

      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        taskName={taskToDelete?.name || ""}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
