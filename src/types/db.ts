// types/db.ts
// Asegúrate de que este archivo está ubicado para ser importado como @/types/db

// ----------------------------------------------------------------
// Shared Types (Tipos Compartidos)
// ----------------------------------------------------------------

/**
 * Define la estructura para el progreso diario de cualquier sección.
 * Dependiendo del contexto, 'current' y 'goal' pueden ser sesiones, minutos, horas o mililitros.
 */
export interface DailyProgress {
  current: number; // Sesiones/Minutos/Volumen completados hoy
  goal: number;    // Meta diaria (sesiones/minutos/horas/ml)
  streak: number;  // Racha actual de días consecutivos
}


// ----------------------------------------------------------------
// EXERCISE types (Ejercicio)
// ----------------------------------------------------------------
export interface ExerciseEntry {
  id: number;
  user_id: string; // uuid
  created_at: string; // timestamp con zona horaria
  entry_date: string; // date
  exercise_type: string;
  duration_minutes: number;
  intensity: 'baja' | 'moderada' | 'alta' | string;
}

export interface UserExerciseGoals {
  user_id: string; // uuid
  exercise_goal_sessions: number; // Sesiones de ejercicio por día (Ej: 3)
  exercise_goal_duration: number; // Duración mínima por sesión en minutos (Ej: 30)
  current_streak_exercise: number;
}

export interface ExerciseSectionData {
  progress: DailyProgress;
  history: ExerciseEntry[];
  stats?: {
    cardioSessions: number;
    strengthSessions: number;
  };
}


// ----------------------------------------------------------------
// SLEEP types (Sueño)
// ----------------------------------------------------------------
export interface SleepEntry {
  id: number; // bigint
  user_id: string;
  sleep_date: string; 
  time_sleep: string; 
  time_wake: string; 
  quality: 'mala' | 'regular' | 'buena' | 'excelente' | string;
  total_hours: number; 
  created_at: string;
}

export interface DailySleepProgress {
  current: number; 
  goal: number;    
  streak: number;  
}

export interface UserSleepGoals {
    target_hours: number; 
    bedtime_goal: string; 
    wakeup_goal: string; 
    current_streak_sleep?: number;
}

export interface SleepSectionData {
  progress: DailySleepProgress;
  history: SleepEntry[];
  goals: UserSleepGoals;
  stats?: {
    totalHoursThisWeek: number;
  };
}



export interface NutritionEntry {
  id: number;
  user_id: string;
  created_at: string;
  entry_date: string;
  meal_type: 'desayuno' | 'almuerzo' | 'cena' | 'snack' | string;
  description: string;
  is_healthy: boolean;
}

export interface NutritionGoals {
  user_id: string;
  meals_per_day: number;
}

export interface NutritionSectionData {
  progress: DailyProgress;
  history: NutritionEntry[];
  stats?: {
    healthyMealsThisWeek: number;
    totalMealsToday: number;
  };
}


export interface HydrationEntry {
  id: number;
  user_id: string;
  created_at: string;
  entry_date: string;
  quantity: number; 
  beverage_type: string; 
}

export interface HydrationGoals {
  user_id: string;
  cups_per_day: number; 
}

export interface HydrationSectionData {
  progress: DailyProgress;
  history: HydrationEntry[];
}