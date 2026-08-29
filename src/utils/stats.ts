import { Task } from "@/context/AppContext";

/**
 * Interface pour les données de contribution de la Heatmap.
 */
export interface ContributionData {
  date: string;
  count: number;
  level: number;
}

/**
 * Interface pour les données du bar chart (Dashboard).
 */
export interface BarChartData {
  day: string; // Ex: 'L', 'M', 'M'
  percentage: number;
  active: boolean; // True si c'est aujourd'hui
  value: number; // Valeur brute (temps ou nombre)
  date: string; // YYYY-MM-DD
}

/**
 * Calcule l'activité pour la Heatmap sur une période donnée en se basant sur les tâches.
 * 
 * @param tasks Liste complète des tâches
 * @param days Nombre de jours d'historique (défaut 90 = ~3 mois)
 * @returns {ContributionData[]} Un tableau des contributions quotidiennes
 */
export function calculateHeatmapData(tasks: Task[], days: number = 90): ContributionData[] {
  const data: ContributionData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset l'heure pour comparer que les dates
  
  // Prépare un dictionnaire pour compter l'activité par jour
  // On utilise YYYY-MM-DD comme clé
  const activityMap: Record<string, number> = {};

  tasks.forEach(task => {
    // Si la tâche a un completedAt, on l'utilise comme jour de l'activité majeure (complétion)
    // Sinon on peut utiliser createdAt si on veut montrer de l'activité, 
    // mais ici on s'intéresse à la productivité, donc on privilégie completedAt.
    const dateStr = task.completedAt ? task.completedAt.split('T')[0] : (task.createdAt ? task.createdAt.split('T')[0] : null);
    
    if (dateStr) {
      // On compte le nombre de tâches touchées/créées/complétées ce jour-là
      // Ou on ajoute les completedPomodoros (temps) si on préfère.
      // Pour la heatmap, le nombre de tâches est souvent plus simple (GitHub style = 1 commit = 1 tâche).
      if (!activityMap[dateStr]) activityMap[dateStr] = 0;
      activityMap[dateStr] += 1;
    }
  });

  const hasRealActivity = Object.keys(activityMap).length > 0;

  // Génère la liste continue des N derniers jours
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let count = activityMap[dateStr] || 0;
    
    // Détermine le niveau d'intensité (0 à 4)
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    
    // Si l'utilisateur n'a aucune activité réelle, on génère de fausses données pour l'effet Wahou
    if (!hasRealActivity) {
      // Génération pseudo-aléatoire déterministe basée sur la date pour éviter l'erreur d'hydratation SSR
      const pseudoRandom = (d.getDate() * 11 + d.getMonth() * 7) % 10 / 10;
      if (pseudoRandom > 0.6) {
        level = Math.floor(pseudoRandom * 4) + 1; // 1 à 4
        count = level * 2;
      }
    } else {
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 8) level = 3;
      else if (count > 8) level = 4;
    }
    
    data.push({
      date: dateStr,
      count,
      level
    });
  }
  
  return data;
}

/**
 * Calcule les données pour le Bar Chart du Dashboard (5 derniers jours).
 * Utilise l'historique quotidien réel (dailyHistory) pour afficher les vraies sessions de focus.
 * 
 * @param tasks Liste des tâches (pour le mode "tâches" uniquement)
 * @param mode "time" | "tasks" - Le mode d'affichage
 * @param totalFocusTimeToday Temps total de focus aujourd'hui en secondes
 * @param dailyHistory Historique quotidien { "YYYY-MM-DD": { focusTime, sessions, tasksCompleted } }
 * @returns {BarChartData[]} Données pour les 5 barres (L, M, M, J, V etc.)
 */
export function calculateDashboardChartData(
  tasks: Task[],
  mode: "time" | "tasks",
  totalFocusTimeToday: number = 0,
  dailyHistory: Record<string, { focusTime: number; sessions: number; tasksCompleted: number }> = {}
): BarChartData[] {
  const result: BarChartData[] = [];
  const today = new Date();
  
  // Jours de la semaine en français
  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];

  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isActive = i === 0; // Aujourd'hui = la dernière barre
    
    let val = 0;
    
    if (mode === "time") {
      // Mode Temps : on utilise l'historique quotidien réel
      const dayData = dailyHistory[dateStr];
      if (isActive && totalFocusTimeToday > 0) {
        // Aujourd'hui : on prend le max entre l'historique et le compteur live
        val = Math.floor(totalFocusTimeToday / 60); // secondes → minutes
      } else if (dayData) {
        val = Math.floor(dayData.focusTime / 60); // secondes → minutes
      }
    } else {
      // Mode Tâches : on compte les tâches complétées ce jour-là
      const completedOnDay = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completedAt) return false;
        return t.completedAt.split('T')[0] === dateStr;
      }).length;
      val = completedOnDay;
    }
    
    result.push({
      day: dayNames[d.getDay()],
      value: val,
      percentage: 0,
      active: isActive,
      date: dateStr
    });
  }

  // Calcul du pourcentage relatif
  let maxVal = Math.max(...result.map(r => r.value));
  // Minimum pour que l'échelle soit lisible
  const minExpectedMax = mode === 'tasks' ? 3 : 30; // 3 tâches ou 30 minutes minimum
  maxVal = Math.max(maxVal, minExpectedMax);

  result.forEach(r => {
    if (maxVal > 0 && r.value > 0) {
      r.percentage = Math.min(100, Math.max(8, (r.value / maxVal) * 100));
    } else {
      r.percentage = 0;
    }
  });

  return result;
}
