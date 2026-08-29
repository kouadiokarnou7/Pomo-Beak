"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";

export interface Task {
  id: string;
  name: string;
  description?: string;
  priority: "low" | "medium" | "high" | "deep_work";
  estimatedPomodoros: number; // Stored in minutes in database
  completedPomodoros: number; // Stored in minutes completed in database
  status: string;
  createdAt: string;
  dueDate?: string; // Date et heure de rappel de démarrage (Start Reminder)
  startedAt?: string; // Date de début réel de la tâche
  completedAt?: string; // Date de complétion de la tâche
}

export type TimerMode = "focus" | "short_break";

interface AppContextType {
  // Timer States
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  totalDuration: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setTimerSettings: (focusMin: number, shortMin: number) => void;
  timerSettings: { focus: number; shortBreak: number };

  // pomoBEAK Expanded States
  timerStyle: 'circular' | 'horizontal' | 'digital';
  setTimerStyle: (style: 'circular' | 'horizontal' | 'digital') => void;
  isTimerMaximized: boolean;
  setIsTimerMaximized: (maximized: boolean) => void;

  // Theme & Advanced Settings States
  themeSettings: {
    generalColor: string;
    actionColor: string;
    colorMode: "light" | "dark";
    soundTrack: string;
    bellFrequency: "once" | "repeat_3" | "continuous";
    ambientSound: "none" | "white_noise" | "rain" | "lofi" | "zen";
    ambientVolume: number;
    notifyInApp: boolean;
    notifyPush: boolean;
    notifyEmail: boolean;
  };
  setThemeSettings: (theme: {
    generalColor: string;
    actionColor: string;
    colorMode: "light" | "dark";
    soundTrack: string;
    bellFrequency: "once" | "repeat_3" | "continuous";
    ambientSound: "none" | "white_noise" | "rain" | "lofi" | "zen";
    ambientVolume: number;
    notifyInApp: boolean;
    notifyPush: boolean;
    notifyEmail: boolean;
  }) => void;

  // Task States
  tasks: Task[];
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  addTask: (task: Omit<Task, "id" | "completedPomodoros" | "createdAt">) => void;
  editTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: string) => void;

  // UI States
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (isOpen: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  viewingTask: Task | null;
  setViewingTask: (task: Task | null) => void;

  // Column States for Kanban
  columns: { id: string; title: string }[];
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

  // Stats
  streak: number;
  completedSessionsToday: number;
  totalFocusTimeToday: number;
  dailyHistory: Record<string, { focusTime: number; sessions: number; tasksCompleted: number }>;

  // Toast notifications
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;

  // User Role
  role: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

//audio mis en stand by 
let globalAudioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!globalAudioContext) {
    globalAudioContext = new AudioContextClass();
  }
  return globalAudioContext;
};

// Melodic chime using Web Audio API
const playChime = (soundTrack: string) => {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    if (soundTrack === "zen_chime") {
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    } else if (soundTrack === "digital_beep") {
      // Very aggressive rapid alternating beep (like an alarm)
      osc1.type = "square";
      osc1.frequency.setValueAtTime(1200, ctx.currentTime);
      osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      osc1.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.3);
      osc1.frequency.setValueAtTime(1200, ctx.currentTime + 0.4);
      osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.5);
      osc1.frequency.setValueAtTime(1200, ctx.currentTime + 0.6);
      osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.7);
    } else {
      // soft_bell -> turned into a louder phone-like ring
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); 
      osc1.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); 
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.2); 
    }

    // Volume extrême
    gain1.gain.setValueAtTime(2.0, ctx.currentTime); // 200% volume
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // 1.2s
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 1.25);
    
  } catch (e) {
    console.error("Failed to play chime sound:", e);
  }
};

// AmbientSynth was removed as requested (no background focus sounds).

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & Task API Hooks
  const { user } = useAuth();
  const {
    fetchTasks,
    fetchColumns,
    createTask: apiCreateTask,
    updateTask: apiUpdateTask,
    deleteTask: apiDeleteTask,
    createColumn: apiCreateColumn,
    updateColumn: apiUpdateColumn,
    deleteColumn: apiDeleteColumn,
    fetchProfile,
    updateProfile,
  } = useTasks();

  const [hasHydrated, setHasHydrated] = useState(false);

  // Navigation & UI state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Load configuration from settings
  const [timerSettings, setSettingsState] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
  });

  const [themeSettings, setThemeSettingsState] = useState<{
    generalColor: string;
    actionColor: string;
    colorMode: "light" | "dark";
    soundTrack: string;
    bellFrequency: "once" | "repeat_3" | "continuous";
    ambientSound: "none" | "white_noise" | "rain" | "lofi" | "zen";
    ambientVolume: number;
    notifyInApp: boolean;
    notifyPush: boolean;
    notifyEmail: boolean;
  }>({
    generalColor: "#3b82f6", // Default Blue
    actionColor: "#2563eb",  // Default Darker Blue
    colorMode: "light",
    soundTrack: "zen_chime", // default sound
    bellFrequency: "once",
    ambientSound: "none",
    ambientVolume: 0.5,
    notifyInApp: true,
    notifyPush: true,
    notifyEmail: true,
  });

  // pomoBEAK states
  const [timerStyle, setTimerStyle] = useState<'circular' | 'horizontal' | 'digital'>('circular');
  const [isTimerMaximized, setIsTimerMaximized] = useState(false);

  // Timer states
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(timerSettings.focus);
  const [totalDuration, setTotalDuration] = useState(timerSettings.focus);
  const [isRunning, setIsRunning] = useState(false);

  // Tasks states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const [columns, setColumnsState] = useState<{id: string; title: string}[]>([
    { id: "todo", title: "À Faire" },
    { id: "in_progress", title: "En Cours" },
    { id: "completed", title: "Terminées" }
  ]);

  // Stats states (start at 0, loaded from storage)
  const [streak, setStreak] = useState(0);
  const [completedSessionsToday, setCompletedSessionsToday] = useState(0);
  const [totalFocusTimeToday, setTotalFocusTimeToday] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  // Historique quotidien : clé = "YYYY-MM-DD", valeur = { focusTime (sec), sessions, tasksCompleted }
  const [dailyHistory, setDailyHistory] = useState<Record<string, { focusTime: number; sessions: number; tasksCompleted: number }>>({});

  // User role state
  const [role, setRole] = useState<string>("user");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Refs declarations
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const endTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef<number>(timeLeft);
  
  const isTimerLoadedRef = useRef(false);
  const isInitialMount = useRef(true);

  const prevActiveTaskIdRef = useRef<string | null>(null);
  const prevEstimatedPomodorosRef = useRef<number | null>(null);

  const clearAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Sync timeLeftRef with timeLeft
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Set timer duration dynamically based on selected active task
  useEffect(() => {
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    const estimatedPomodoros = activeTask?.estimatedPomodoros || null;

    const taskIdChanged = activeTaskId !== prevActiveTaskIdRef.current;
    const durationChanged = estimatedPomodoros !== prevEstimatedPomodorosRef.current;

    if (taskIdChanged || durationChanged) {
      prevActiveTaskIdRef.current = activeTaskId;
      prevEstimatedPomodorosRef.current = estimatedPomodoros;

      if (isRunning) return;

      if (activeTaskId && activeTask) {
        if (activeTask.estimatedPomodoros) {
          const taskMinutes = activeTask.estimatedPomodoros;
          setTimeLeft(taskMinutes * 60);
          setTotalDuration(taskMinutes * 60);
        }
      } else {
        // Revert to default focus settings
        setTimeLeft(timerSettings.focus);
        setTotalDuration(timerSettings.focus);
      }
    }
  }, [activeTaskId, tasks, isRunning, timerSettings.focus]);

  // Load tasks and columns from Supabase or localStorage
  useEffect(() => {
    setHasHydrated(true);
    
    const loadInitialData = async () => {
      if (isTimerLoadedRef.current) return;
      if (user) {
        // Logged in: Fetch from Supabase
        const dbTasks = await fetchTasks();
        const dbColumns = await fetchColumns();
        
        setTasks(dbTasks);
        if (dbColumns && dbColumns.length > 0) {
          setColumnsState(dbColumns.map((col: any) => ({
            id: col.id || col.title.toLowerCase().replace(/\s+/g, '_'),
            title: col.title
          })));
        }

        // Fetch profile stats from Supabase
        const { data: profile, error: profileError } = await fetchProfile(user.id);
        if (profile) {
          setStreak(profile.streak || 0);
          setCompletedSessionsToday(profile.completed_sessions_today || 0);
          setTotalFocusTimeToday(profile.total_focus_time_today || 0);
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          if (adminEmail && user.email === adminEmail) {
            setRole("admin");
          } else if (profile.role) {
            setRole(profile.role);
          }
        }
      } else {
        setRole("user");
        // Guest mode: Fallback to localStorage
        if (typeof window !== "undefined") {
          const storedTasks = localStorage.getItem("focusflow_tasks");
          if (storedTasks) {
            try {
              setTasks(JSON.parse(storedTasks));
            } catch (e) {}
          }
          const storedColumns = localStorage.getItem("focusflow_columns");
          if (storedColumns) {
            try {
              setColumnsState(JSON.parse(storedColumns));
            } catch (e) {}
          }
        }
      }
      
      // Load settings, theme, and stats from localStorage (same for both modes)
      if (typeof window !== "undefined") {
        const storedStats = localStorage.getItem("focusflow_stats");
        if (storedStats) {
          try {
            const parsed = JSON.parse(storedStats);
            if (parsed.streak !== undefined) setStreak(parsed.streak);
            if (parsed.completedSessionsToday !== undefined) setCompletedSessionsToday(parsed.completedSessionsToday);
            if (parsed.totalFocusTimeToday !== undefined) setTotalFocusTimeToday(parsed.totalFocusTimeToday);
            if (parsed.lastActiveDate !== undefined) setLastActiveDate(parsed.lastActiveDate);
          } catch (e) {}
        }
        // Charger l'historique quotidien
        const storedHistory = localStorage.getItem("focusflow_daily_history");
        if (storedHistory) {
          try {
            setDailyHistory(JSON.parse(storedHistory));
          } catch (e) {}
        } else {
          // Migration : si on a déjà un totalFocusTimeToday mais pas d'historique,
          // on crée l'entrée du jour avec les données existantes
          const statsData = localStorage.getItem("focusflow_stats");
          if (statsData) {
            try {
              const sp = JSON.parse(statsData);
              if (sp.totalFocusTimeToday && sp.lastActiveDate) {
                const migrated: Record<string, { focusTime: number; sessions: number; tasksCompleted: number }> = {
                  [sp.lastActiveDate]: {
                    focusTime: sp.totalFocusTimeToday,
                    sessions: sp.completedSessionsToday || 1,
                    tasksCompleted: 0,
                  }
                };
                setDailyHistory(migrated);
                localStorage.setItem("focusflow_daily_history", JSON.stringify(migrated));
              }
            } catch (e) {}
          }
        }

        const storedSettings = localStorage.getItem("focusflow_timer_settings");
        if (storedSettings) {
          try {
            const parsed = JSON.parse(storedSettings);
            setSettingsState(parsed);
          } catch (e) {}
        }

        const storedTheme = localStorage.getItem("focusflow_theme");
        if (storedTheme) {
          try {
            const parsed = JSON.parse(storedTheme);
            setThemeSettingsState((prev) => ({
              ...prev,
              ...parsed
            }));
          } catch (e) {}
        }

        const storedStyle = localStorage.getItem("pomobeak_timer_style");
        if (storedStyle) {
          setTimerStyle(storedStyle as any);
        }

        // Load timer state from localStorage
        const storedTimer = localStorage.getItem("focusflow_timer_state");
        if (storedTimer) {
          try {
            const parsed = JSON.parse(storedTimer);
            if (parsed.mode) {
              setMode(parsed.mode);
            }
            if (parsed.totalDuration) setTotalDuration(parsed.totalDuration);
            
            let time = parsed.timeLeft;
            if (parsed.isRunning && parsed.lastUpdated) {
              const elapsed = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
              time = Math.max(0, parsed.timeLeft - elapsed);
            }
            setTimeLeft(time);
            setIsRunning(parsed.isRunning && time > 0);
          } catch (e) {}
        }
        isTimerLoadedRef.current = true;
      }
    };

    loadInitialData();
  }, [user, fetchTasks, fetchColumns, fetchProfile]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (isTimerLoadedRef.current) {
      const stateToSave = {
        timeLeft,
        mode,
        totalDuration,
        isRunning,
        lastUpdated: Date.now()
      };
      localStorage.setItem("focusflow_timer_state", JSON.stringify(stateToSave));
    }
  }, [timeLeft, mode, totalDuration, isRunning]);

  // Apply theme dynamically to CSS variables and dark mode class
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      
      // Toggle dark mode class
      if (themeSettings.colorMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      root.style.setProperty('--app-general-color', themeSettings.generalColor);
      root.style.setProperty('--app-action-color', themeSettings.actionColor);
      
      const hexToRgb = (hex: string) => {
        try {
          const bigint = parseInt(hex.replace('#', ''), 16);
          const r = (bigint >> 16) & 255;
          const g = (bigint >> 8) & 255;
          const b = bigint & 255;
          return `${r}, ${g}, ${b}`;
        } catch (e) {
          return "59, 130, 246"; // default blue
        }
      };

      root.style.setProperty('--app-general-color-rgb', hexToRgb(themeSettings.generalColor));
      root.style.setProperty('--app-action-color-rgb', hexToRgb(themeSettings.actionColor));
      
      root.style.setProperty('--color-primary', themeSettings.generalColor);
      root.style.setProperty('--color-primary-container', themeSettings.actionColor);
    }
  }, [themeSettings]);

  // Persist columns
  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem("focusflow_columns", JSON.stringify(columns));
    }
  }, [columns, hasHydrated]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Play Audio
    const play = () => {
      try {
        let src = '/alarm.mp3';
        if (typeof window !== 'undefined') {
          const custom = localStorage.getItem('focusflow_custom_alarm');
          if (custom) src = custom;
        }
        const audio = new Audio(src);
        audio.play().catch(() => playChime(themeSettings.soundTrack));
      } catch (e) {
        playChime(themeSettings.soundTrack);
      }
    };
    play();

    if (themeSettings.bellFrequency === "repeat_3") {
      let count = 1;
      const interval = setInterval(() => {
        play();
        count++;
        if (count >= 3) clearInterval(interval);
      }, 1500);
    } else if (themeSettings.bellFrequency === "continuous") {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = setInterval(play, 2000);
    }

    if (mode === "focus") {
      if (activeTaskId) {
        setTasks((prevTasks) => {
          const activeTask = prevTasks.find((t) => t.id === activeTaskId);
          if (activeTask) {
            const sessionMinutes = Math.round(totalDuration / 60);
            const updatedCompleted = activeTask.completedPomodoros + sessionMinutes;
            const autoCompleted = updatedCompleted >= activeTask.estimatedPomodoros;
            const newStatus = autoCompleted ? "completed" : activeTask.status;

            if (user) {
              apiUpdateTask(activeTaskId, {
                completedPomodoros: updatedCompleted,
                status: newStatus,
              });
            }

            const updated = prevTasks.map((t) => {
              if (t.id === activeTaskId) {
                return {
                  ...t,
                  completedPomodoros: updatedCompleted,
                  status: newStatus,
                };
              }
              return t;
            });
            if (typeof window !== "undefined") {
              localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
            }
            return updated;
          }
          return prevTasks;
        });
      }

      // Update daily stats
      const focusSec = totalDuration;
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const newFocusTime = totalFocusTimeToday + focusSec;
      setTotalFocusTimeToday(newFocusTime);
      
      const newCompleted = completedSessionsToday + 1;
      setCompletedSessionsToday(newCompleted);
      
      // Calculate new streak
      let newStreak = streak;
      if (!lastActiveDate) {
        newStreak = 1;
      } else if (lastActiveDate !== todayStr) {
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(todayStr);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1; // reset to 1
        }
      }
      setStreak(newStreak);
      setLastActiveDate(todayStr);
      
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "focusflow_stats",
          JSON.stringify({
            streak: newStreak,
            completedSessionsToday: newCompleted,
            totalFocusTimeToday: newFocusTime,
            lastActiveDate: todayStr,
          })
        );
        // Sauvegarder l'historique quotidien
        setDailyHistory(prev => {
          const existing = prev[todayStr] || { focusTime: 0, sessions: 0, tasksCompleted: 0 };
          const updated = {
            ...prev,
            [todayStr]: {
              focusTime: existing.focusTime + focusSec,
              sessions: existing.sessions + 1,
              tasksCompleted: existing.tasksCompleted,
            }
          };
          localStorage.setItem("focusflow_daily_history", JSON.stringify(updated));
          return updated;
        });
      }

      if (user) {
        updateProfile(user.id, {
          streak: newStreak,
          completed_sessions_today: newCompleted,
          total_focus_time_today: newFocusTime,
        });
      }

      setMode("short_break");
      setTimeLeft(timerSettings.shortBreak);
      setTotalDuration(timerSettings.shortBreak);
    } else {
      setMode("focus");
      
      let target = timerSettings.focus;
      if (activeTaskId) {
        const activeTask = tasks.find((t) => t.id === activeTaskId);
        if (activeTask && activeTask.estimatedPomodoros) {
          target = activeTask.estimatedPomodoros * 60;
        }
      }
      setTimeLeft(target);
      setTotalDuration(target);
    }
  }, [mode, activeTaskId, tasks, totalDuration, streak, lastActiveDate, themeSettings.soundTrack, user, apiUpdateTask, updateProfile, timerSettings, completedSessionsToday, totalFocusTimeToday]);

  const handleTimerCompleteRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // Timer Tick implementation
  useEffect(() => {
    if (isRunning) {
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;

      const tick = () => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleTimerCompleteRef.current();
        }
      };

      timerIntervalRef.current = setInterval(tick, 1000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          tick();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleVisibilityChange);
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  }, [isRunning]);

  const toggleTimer = useCallback(() => {
    clearAlarm();
    setIsRunning((prev) => !prev);
    
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }, [clearAlarm]);

  const resetTimer = useCallback(() => {
    clearAlarm();
    setIsRunning(false);
    let target = timerSettings.focus;
    if (mode === "short_break") target = timerSettings.shortBreak;
    
    if (activeTaskId && mode === "focus") {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.estimatedPomodoros) {
        target = activeTask.estimatedPomodoros * 60;
      }
    }
    
    setTimeLeft(target);
  }, [timerSettings, mode, activeTaskId, tasks, clearAlarm]);

  const skipTimer = useCallback(() => {
    clearAlarm();
    setIsRunning(false);
    
    const nextMode = mode === "focus" ? "short_break" : "focus";
    setMode(nextMode);
    
    let target = nextMode === "focus" ? timerSettings.focus : timerSettings.shortBreak;
    
    if (activeTaskId && nextMode === "focus") {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.estimatedPomodoros) {
        target = activeTask.estimatedPomodoros * 60;
      }
    }
    
    setTimeLeft(target);
    setTotalDuration(target);
  }, [clearAlarm, mode, timerSettings, activeTaskId, tasks]);

  const setTimerSettings = useCallback((focusMin: number, shortMin: number) => {
    const updated = {
      focus: focusMin * 60,
      shortBreak: shortMin * 60,
    };
    setSettingsState(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focusflow_timer_settings", JSON.stringify(updated));
    }
    
    let target = updated.focus;
    if (mode === "short_break") target = updated.shortBreak;
    
    if (activeTaskId && mode === "focus") {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.estimatedPomodoros) {
        target = activeTask.estimatedPomodoros * 60;
      }
    }
    
    setTimeLeft(target);
    setTotalDuration(target);
    setIsRunning(false);
  }, [mode, activeTaskId, tasks]);

  // Save timer style preference
  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem("pomobeak_timer_style", timerStyle);
    }
  }, [timerStyle, hasHydrated]);

  const setThemeSettings = useCallback((theme: {
    generalColor: string;
    actionColor: string;
    colorMode: "light" | "dark";
    soundTrack: string;
    bellFrequency: "once" | "repeat_3" | "continuous";
    ambientSound: "none" | "white_noise" | "rain" | "lofi" | "zen";
    ambientVolume: number;
    notifyInApp: boolean;
    notifyPush: boolean;
    notifyEmail: boolean;
  }) => {
    setThemeSettingsState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("focusflow_theme", JSON.stringify(theme));
    }
  }, []);

  // Task operators
  const addTask = useCallback(async (taskInput: Omit<Task, "id" | "completedPomodoros" | "createdAt">) => {
    let newTask: Task;
    if (user) {
      const { data, error } = await apiCreateTask(taskInput, user.id);
      if (data && !error) {
        newTask = {
          ...taskInput,
          id: data.id,
          completedPomodoros: 0,
          createdAt: data.created_at || new Date().toISOString(),
          dueDate: data.due_date
        };
      } else {
        return;
      }
    } else {
      newTask = {
        ...taskInput,
        id: "task-" + Date.now(),
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
      };
    }
    setTasks((prevTasks) => {
      const updated = [...prevTasks, newTask];
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, apiCreateTask]);

  const toggleTaskCompleted = useCallback(async (id: string) => {
    setTasks((prevTasks) => {
      const task = prevTasks.find((t) => t.id === id);
      if (!task) return prevTasks;

      const completedColId = columns[columns.length - 1]?.id || "completed";
      const defaultColId = columns[0]?.id || "todo";

      const isCompletedNow = task.status !== completedColId;
      const newStatus = isCompletedNow ? completedColId : defaultColId;

      if (user) {
        apiUpdateTask(id, { status: newStatus });
      }
      const updated = prevTasks.map((t) => {
        if (t.id === id) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, columns, apiUpdateTask]);

  const deleteTask = useCallback(async (id: string) => {
    if (user) {
      await apiDeleteTask(id);
    }
    setTasks((prevTasks) => {
      const updated = prevTasks.filter((t) => t.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
      }
      return updated;
    });
    setActiveTaskId((prevId) => (prevId === id ? null : prevId));
  }, [user, apiDeleteTask]);

  const updateTaskStatus = useCallback(async (id: string, status: string) => {
    if (user) {
      await apiUpdateTask(id, { status });
    }
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === id) {
          return { ...t, status };
        }
        return t;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, apiUpdateTask]);

  const addColumn = useCallback(async (title: string) => {
    if (user) {
      const { data, error } = await apiCreateColumn(title, columns.length, user.id);
      if (data && !error) {
        setColumnsState((prev) => [...prev, { id: data.id, title: data.title }]);
      }
    } else {
      const newId = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      setColumnsState((prev) => [...prev, { id: newId, title }]);
    }
  }, [user, columns.length, apiCreateColumn]);

  const updateColumn = useCallback(async (id: string, title: string) => {
    if (user) {
      await apiUpdateColumn(id, title);
    }
    setColumnsState((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title } : col))
    );
  }, [user, apiUpdateColumn]);

  const deleteColumn = useCallback(async (id: string) => {
    const colIndex = columns.findIndex((col) => col.id === id);
    if (colIndex < 3) return; // Prevent deleting defaults

    if (user) {
      await apiDeleteColumn(id);
    }

    // Move tasks in deleted column back to the first column
    const defaultColId = columns[0].id;
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) => {
        if (t.status === id) {
          if (user) {
            apiUpdateTask(t.id, { status: defaultColId });
          }
          return { ...t, status: defaultColId };
        }
        return t;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updatedTasks));
      }
      return updatedTasks;
    });

    setColumnsState((prev) => prev.filter((col) => col.id !== id));
  }, [user, columns, apiDeleteColumn, apiUpdateTask]);

  const editTask = useCallback(async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    if (user) {
      await apiUpdateTask(id, updates);
    }
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("focusflow_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, apiUpdateTask]);

  // Task Start Reminder Notifications Scheduler
  useEffect(() => {
    if (!hasHydrated) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkDueDates = () => {
      const now = new Date();
      tasks.forEach(async (task) => {
        if (task.status === "completed" || !task.dueDate) return;
        
        const reminderTime = new Date(task.dueDate);
        
        // Notify if current time has reached or passed the reminder time
        if (now >= reminderTime) {
          const notifiedKey = `notified_${task.id}`;
          if (sessionStorage.getItem(notifiedKey)) return;
          sessionStorage.setItem(notifiedKey, "true");

          // 1. In-App Notification (Toast)
          if (themeSettings.notifyInApp) {
            showToast(`Il est temps de démarrer la tâche "${task.name}" !`, "info");
          }

          // 2. Browser Push Notification
          if (themeSettings.notifyPush && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`pomoBEAK - Rappel de Démarrage`, {
              body: `Il est temps de commencer la tâche : "${task.name}"`,
              icon: "/favicon.ico"
            });
          }

          // 3. Email Notification API Call
          if (themeSettings.notifyEmail && user?.email) {
            try {
              await fetch("/api/send-reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  taskName: task.name,
                  dueDate: task.dueDate
                })
              });
            } catch (err) {
              console.error("Failed to send email reminder:", err);
            }
          }
        }
      });
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 30000);
    return () => clearInterval(interval);
  }, [tasks, hasHydrated, user, themeSettings.notifyInApp, themeSettings.notifyPush, themeSettings.notifyEmail]);

  const contextValue = useMemo(() => ({
    timeLeft,
    isRunning,
    mode,
    totalDuration,
    toggleTimer,
    resetTimer,
    skipTimer,
    setTimerSettings,
    timerSettings,
    
    // pomoBEAK states
    timerStyle,
    setTimerStyle,
    isTimerMaximized,
    setIsTimerMaximized,

    tasks,
    activeTaskId,
    setActiveTaskId,
    addTask,
    editTask,
    toggleTaskCompleted,
    deleteTask,
    updateTaskStatus,

    columns,
    addColumn,
    updateColumn,
    deleteColumn,

    themeSettings,
    setThemeSettings,

    isAddTaskOpen,
    setIsAddTaskOpen,
    editingTask,
    setEditingTask,
    viewingTask,
    setViewingTask,

    streak,
    completedSessionsToday,
    totalFocusTimeToday,
    dailyHistory,

    toast,
    showToast,
    role,
  }), [
    timeLeft,
    isRunning,
    mode,
    totalDuration,
    toggleTimer,
    resetTimer,
    skipTimer,
    setTimerSettings,
    timerSettings,
    timerStyle,
    isTimerMaximized,
    tasks,
    activeTaskId,
    addTask,
    editTask,
    toggleTaskCompleted,
    deleteTask,
    updateTaskStatus,
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
    themeSettings,
    setThemeSettings,
    isAddTaskOpen,
    editingTask,
    viewingTask,
    streak,
    completedSessionsToday,
    totalFocusTimeToday,
    dailyHistory,
    toast,
    showToast,
    role,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
