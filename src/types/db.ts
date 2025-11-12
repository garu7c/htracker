// Define la estructura de una entrada individual de ejercicio de Supabase
export interface ExerciseEntry {
  id: number;
  user_id: string; // uuid
  created_at: string; // timestamp con zona horaria
  entry_date: string; // date
  exercise_type: string;
  duration_minutes: number;
  intensity: 'baja' | 'moderada' | 'alta';
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