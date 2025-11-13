'use server';

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import { ExerciseSectionData, DailyProgress, ExerciseEntry } from '@/types/db';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getExerciseDashboardData(): Promise<ExerciseSectionData> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const GOAL = 3;
  const todayString = getTodayDateString();

  const progressPromise = supabase
    .from('exercise_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('entry_date', todayString);

  const historyPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  const streakPromise = supabase
    .from('exercise_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .gte('entry_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  const [progressResult, historyResult, streakResult] = await Promise.all([
    progressPromise,
    historyPromise,
    streakPromise
  ]);

  const progress: DailyProgress = {
    current: progressResult.count ?? 0,
    goal: GOAL,
    streak: 0,
  };

  const history: ExerciseEntry[] = historyResult.data || [];

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

export async function saveUserExerciseGoals(goals: {
  daily_sessions_goal: number;
  min_duration_goal: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from('user_exercise_goals')
    .upsert({
      user_id: user.id,
      daily_sessions_goal: goals.daily_sessions_goal,
      min_duration_goal: goals.min_duration_goal,
    }, { onConflict: 'user_id' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

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

  const newEntry = {
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