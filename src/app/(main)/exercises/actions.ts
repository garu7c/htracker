'use server';

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import { ExerciseSectionData, DailyProgress, ExerciseEntry, UserExerciseGoals } from '@/types/db';
import { User } from '@supabase/supabase-js';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getStartOfWeek(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));
  return startOfWeek.toISOString().split('T')[0];
}

// Obtener todos los datos de ejercicio del usuario para el dashboard
export async function getExerciseDashboardData(): Promise<ExerciseSectionData> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const todayString = getTodayDateString();
  const startOfWeek = getStartOfWeek();

  // Obtener metas y racha
  const goalsPromise = supabase
    .from('user_exercise_goals')
    .select('exercise_goal_duration, current_streak_exercise')
    .eq('user_id', user.id)
    .single();

  // Obtener el conteo de HOY solamente
  const progressPromise = supabase
    .from('exercise_entries')
    .select('duration_minutes')
    .eq('user_id', user.id)
    .eq('entry_date', todayString); // Solo registros de hoy

  // Historial reciente - todos los registros ordenados por fecha
  const historyPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  // Obtener sesiones de CARDIO de esta semana
  const cardioPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startOfWeek)
    .lte('entry_date', todayString)
    .or('exercise_type.ilike.%cardio%,exercise_type.ilike.%correr%,exercise_type.ilike.%corriendo%,exercise_type.ilike.%carrera%,exercise_type.ilike.%trotar%');

  // Obtener sesiones de FUERZA de esta semana
  const strengthPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startOfWeek)
    .lte('entry_date', todayString)
    .or('exercise_type.ilike.%fuerza%,exercise_type.ilike.%pesas%,exercise_type.ilike.%musculación%,exercise_type.ilike.%gimnasio%,exercise_type.ilike.%levantamiento%');

  const [progressResult, historyResult, goalsResult, cardioResult, strengthResult] = await Promise.all([
    progressPromise,
    historyPromise,
    goalsPromise,
    cardioPromise,
    strengthPromise, // CORREGIDO: era strengthResult
  ]);

  let dailyGoalDuration = 0;
  let currentStreak = 0;

  if (goalsResult.data) {
    dailyGoalDuration = goalsResult.data.exercise_goal_duration ?? 0;
    currentStreak = goalsResult.data.current_streak_exercise ?? 0;
  }

  // Solo contar minutos de HOY
  const totalMinutesToday = progressResult.data?.reduce((sum, entry) => sum + entry.duration_minutes, 0) ?? 0;

  const progress: DailyProgress = {
    current: totalMinutesToday, // Solo minutos de hoy
    goal: dailyGoalDuration,
    streak: currentStreak,
  };

  const history: ExerciseEntry[] = (historyResult.data as ExerciseEntry[]) || [];

  // Calcular estadísticas de cardio y fuerza (de la semana completa)
  const cardioSessions = cardioResult.data?.length || 0;
  const strengthSessions = strengthResult.data?.length || 0;

  return { 
    progress, 
    history,
    stats: {
      cardioSessions,
      strengthSessions
    }
  };
}

// El resto de tus funciones permanecen igual...
export async function getUserExerciseGoals(): Promise<{ daily_sessions_goal: number; min_duration_goal: number }> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('user_exercise_goals')
    .select('daily_sessions_goal, min_duration_goal')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { daily_sessions_goal: 3, min_duration_goal: 30 };
  }

  return {
    daily_sessions_goal: data.daily_sessions_goal,
    min_duration_goal: data.min_duration_goal,
  };
}

export async function saveUserExerciseGoals({ durationGoal }: {
  durationGoal: number
}): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuario no autenticado' };
  }

  const goalUpdate = {
    user_id: user.id,
    exercise_goal_duration: durationGoal,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_exercise_goals')
    .upsert(goalUpdate, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error al guardar metas de ejercicio:', error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Metas guardadas exitosamente.' };
}

// Registrar una nueva entrada de ejercicio - siempre usa fecha actual
export async function addExerciseEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString(); // Siempre fecha actual para nuevos registros

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuario no autenticado. Inicia sesión.' };
  }

  const exerciseType = formData.get('exerciseType') as string;
  const duration = formData.get('duration') as string;
  const intensity = formData.get('intensity') as string;

  if (!exerciseType || !duration || !intensity) {
    return { success: false, message: 'Todos los campos (Tipo, Duración, Intensidad) son requeridos.' };
  }
  
  const durationMinutes = parseInt(duration, 10);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    return { success: false, message: 'La duración debe ser un número positivo.' };
  }
  if (!['Baja', 'Moderada', 'Alta', 'baja', 'moderada', 'alta'].includes(intensity)) {
    return { success: false, message: 'Intensidad no válida.' };
  }

  const newEntry: Omit<ExerciseEntry, 'id' | 'created_at'> = {
    user_id: user.id,
    entry_date: todayString, // Siempre fecha actual
    exercise_type: exerciseType,
    duration_minutes: durationMinutes,
    intensity: intensity,
  };

  const { error } = await supabase
    .from('exercise_entries')
    .insert(newEntry);

  if (error) {
    console.error('Error al insertar ejercicio:', error.message);
    return { success: false, message: `Error en la base de datos: ${error.message}` };
  }

  return { success: true, message: 'Ejercicio registrado exitosamente.' };
}