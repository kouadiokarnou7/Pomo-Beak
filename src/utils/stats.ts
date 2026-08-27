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

  // Génère la liste continue des N derniers jours
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const count = activityMap[dateStr] || 0;
    
    // Détermine le niveau d'intensité (0 à 4)
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 5) level = 2;
    else if (count > 5 && count <= 8) level = 3;
    else if (count > 8) level = 4;
    
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
 * 
 * @param tasks Liste des tâches (pour le mode "tâches")
 * @param mode "time" | "tasks" - Le mode d'affichage
 * @returns {BarChartData[]} Données pour les 5 barres (L, M, M, J, V etc.)
 */
export function calculateDashboardChartData(tasks: Task[], mode: "time" | "tasks"): BarChartData[] {
  const result: BarChartData[] = [];
  const today = new Date();
  
  // Jours de la semaine en français
  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];

  // Dictionnaire d'activité par jour
  const activityMap: Record<string, number> = {};

  tasks.forEach(task => {
    // Si on a un startedAt et completedAt, on pourrait calculer la durée exacte.
    // Par simplicité et robustesse, si mode === 'time', on prend completedPomodoros (secondes/minutes).
    // Si mode === 'tasks', on incrémente de 1 pour chaque tâche complétée.
    
    if (task.status !== 'completed' && mode === 'tasks') return; // Ne compte que les tâches terminées

    // Utilise completedAt, ou fallback sur createdAt si c'est tout ce qu'on a.
    const dateStr = task.completedAt ? task.completedAt.split('T')[0] : (task.createdAt ? task.createdAt.split('T')[0] : null);
    
    if (dateStr) {
      if (!activityMap[dateStr]) activityMap[dateStr] = 0;
      
      if (mode === "tasks") {
        activityMap[dateStr] += 1; // 1 tâche
      } else {
        // Temps: completedPomodoros est en minutes ou secondes (selon l'implémentation), disons minutes.
        // On le convertit en secondes pour rester cohérent si besoin, ou on le garde brut.
        // Hypothèse: completedPomodoros est en secondes ou temps de focus total.
        activityMap[dateStr] += task.completedPomodoros || 0;
      }
    }
  });

  // On veut les 5 derniers jours se terminant aujourd'hui (ou les 5 derniers jours ouvrés si on voulait ignorer les week-ends, 
  // mais une timeline continue est généralement meilleure).
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const value = activityMap[dateStr] || 0;
    const isActive = i === 0; // Aujourd'hui = la dernière barre

    result.push({
      day: dayNames[d.getDay()],
      value,
      percentage: 0, // Sera calculé ensuite par rapport au max
      active: isActive,
      date: dateStr
    });
  }

  // Calcul du pourcentage relatif pour que la plus grande barre atteigne ~90-100%
  // On fixe un max minimum pour ne pas avoir une barre à 100% si on a fait 1 tâche.
  let maxVal = Math.max(...result.map(r => r.value));
  const minExpectedMax = mode === 'tasks' ? 5 : 3600; // 5 tâches max ou 1 heure minimum
  maxVal = Math.max(maxVal, minExpectedMax);

  result.forEach(r => {
    if (maxVal > 0) {
      r.percentage = Math.min(100, Math.max(5, (r.value / maxVal) * 100)); // Min 5% pour que la barre soit visible
    } else {
      r.percentage = 0; // Rien du tout
    }
  });

  return result;
}
