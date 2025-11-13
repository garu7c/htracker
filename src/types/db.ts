/*// Define la estructura de una entrada individual de ejercicio de Supabase
export interface ExerciseEntry {
  id: number;
  user_id: string; // uuid
  created_at: string; // timestamp con zona horaria
  entry_date: string; // date
  exercise_type: string;
  duration_minutes: number;
  intensity: 'baja' | 'moderada' | 'alta' | string;
}

// Define la estructura para las metas de ejercicio del usuario
export interface UserExerciseGoals {
  user_id: string; // uuid
  exercise_goal_sessions: number; // Sesiones de ejercicio por día (Ej: 3)
  exercise_goal_duration: number; // Duración mínima por sesión en minutos (Ej: 30)
  current_streak_exercise: number;
}
// Define la estructura para el progreso diario del usuario
export interface DailyProgress {
  current: number; // Sesiones completadas hoy
  goal: number;    // Meta de sesiones diarias (Ej: 3)
  streak: number;  // Racha actual de días consecutivos
}

// Define la estructura de datos que recibe el componente ExerciseSection (Actualizado)
export interface ExerciseSectionData {
  progress: DailyProgress;
  history: ExerciseEntry[];
}
  */
// Define la estructura de una entrada individual de ejercicio de Supabase
export interface ExerciseEntry {
  id: number;
  user_id: string; // uuid
  created_at: string; // timestamp con zona horaria
  entry_date: string; // date
  exercise_type: string;
  duration_minutes: number;
  intensity: 'baja' | 'moderada' | 'alta' | string;
}

// Define la estructura para las metas de ejercicio del usuario
export interface UserExerciseGoals {
  user_id: string; // uuid
  exercise_goal_sessions: number; // Sesiones de ejercicio por día (Ej: 3)
  exercise_goal_duration: number; // Duración mínima por sesión en minutos (Ej: 30)
  current_streak_exercise: number;
}
// Define la estructura para el progreso diario del usuario
export interface DailyProgress {
  current: number; // Sesiones completadas hoy
  goal: number;    // Meta de sesiones diarias (Ej: 3)
  streak: number;  // Racha actual de días consecutivos
}

// Define la estructura de datos que recibe el componente ExerciseSection (Actualizado)
export interface ExerciseSectionData {
  progress: DailyProgress;
  history: ExerciseEntry[];
}

// Nutrition types
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
}

// Hydration types
export interface HydrationEntry {
  id: number;
  user_id: string;
  created_at: string;
  entry_date: string;
  volume_ml: number;
}

export interface HydrationGoals {
  user_id: string;
  ml_per_day: number;
}

export interface HydrationSectionData {
  progress: DailyProgress;
  history: HydrationEntry[];
}