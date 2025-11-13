'use server';

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import { ExerciseSectionData, DailyProgress, ExerciseEntry, UserExerciseGoals } from '@/types/db';
import { User } from '@supabase/supabase-js';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

//Obtener todoos los datos de ejercicio del usuario para el dashboard
export async function getExerciseDashboardData(): Promise<ExerciseSectionData> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  //const GOAL = 3;
  const todayString = getTodayDateString();

  //Obtener metas y racha
  const goalsPromise = supabase
    .from('user_goals')
    .select('exercise_goal_duration, current_streak_exercise')
    .eq('user_id', user.id)
    .single();

  //Obtener el conteo de hoy  
  const progressPromise = supabase
    .from('exercise_entries')
    .select('duration_minutes', { count: 'exact'})
    .eq('user_id', user.id)
    .eq('entry_date', todayString);

  //Historial reciente  
  const historyPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  //Obtener entradas para calcular racha  
  const streakPromise = supabase
    .from('exercise_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .gte('entry_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  const [progressResult, historyResult, streakResult, goalsResult] = await Promise.all([
    progressPromise,
    historyPromise,
    streakPromise,
    goalsPromise,
  ]);

  let dailyGoalDuration = 0;
  let currentStreak = 0;

  if (goalsResult.data) {
    dailyGoalDuration = goalsResult.data.exercise_goal_duration ?? 0;
    currentStreak = goalsResult.data.current_streak_exercise ?? 0;
  }

  const totalMinutesToday = progressResult.data?.reduce((sum, entry) => sum + entry.duration_minutes, 0) ?? 0;

  const progress: DailyProgress = {
    current: totalMinutesToday,
    goal: dailyGoalDuration,
    streak: currentStreak,
  };

  const history: ExerciseEntry[] = (historyResult.data as ExerciseEntry[]) || [];
/*
  if (streakResult.data) {
    const uniqueDates = [...new Set(streakResult.data.map(e => e.entry_date))];
    
    let currentStreak = 0;
    let today = new Date(todayString + 'T00:00:00');

    if (uniqueDates.includes(todayString)) {
      currentStreak = 1;
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const yesterdayString = yesterday.toISOString().split('T')[0];
        if (uniqueDates.includes(yesterdayString)) {
          currentStreak++;
          yesterday.setDate(yesterday.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
    progress.streak = currentStreak;
  }
*/
  return { progress, history };
}

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
    user_id: user.id, // Asegúrate de incluir el user_id
    exercise_goal_duration: durationGoal,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_goals')
    .upsert(goalUpdate, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error al guardar metas de ejercicio:', error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Metas guardadas exitosamente.' };
}

//Registrar una nueva entrada de ejercicio
export async function addExerciseEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString();

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
  if (!['baja', 'moderada', 'alta'].includes(intensity)) {
    return { success: false, message: 'Intensidad no válida.' };
  }

  //Crear la nueva entrada
  const newEntry: Omit<ExerciseEntry, 'id' | 'created_at'> = {
    user_id: user.id,
    entry_date: todayString,
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