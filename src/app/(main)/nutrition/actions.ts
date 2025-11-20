"use server";

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import type { NutritionEntry, NutritionGoals, NutritionSectionData } from '@/types/db';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getNutritionDashboardData(): Promise<NutritionSectionData> {
  const supabase = createServerSupabaseClient();

  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const todayString = getTodayDateString();

  // user_goals table holds consolidated goals (exercise, nutrition, hydration, etc.)
  const goalsPromise = supabase
    .from('user_goals')
    .select('nutrition_goal_meals')
    .eq('user_id', user.id)
    .single();

  const progressPromise = supabase
    .from('nutrition_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('entry_date', todayString);

  const historyPromise = supabase
    .from('nutrition_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const [progressResult, historyResult, goalsResult] = await Promise.all([
    progressPromise,
    historyPromise,
    goalsPromise,
  ]);

  const mealsGoal = (goalsResult.data && (goalsResult.data.nutrition_goal_meals ?? 3)) || 3;

  const progress = {
    current: progressResult.count ?? 0,
    goal: mealsGoal,
    streak: 0,
  };

  const history: NutritionEntry[] = (historyResult.data as NutritionEntry[]) || [];

  return { progress, history };
}

export async function getUserNutritionGoals(): Promise<NutritionGoals> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('user_id, nutrition_goal_meals')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return { user_id: user.id, meals_per_day: 3 };
    }

    return { user_id: data.user_id, meals_per_day: data.nutrition_goal_meals ?? 3 } as NutritionGoals;
  } catch (e) {
    return { user_id: user.id, meals_per_day: 3 };
  }
}

export async function saveUserNutritionGoals(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Usuario no autenticado' };

  const meals = Number(formData.get('meals_per_day') || 3);

  const payload = {
    user_id: user.id,
    nutrition_goal_meals: meals,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_goals').upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('Error guardando metas de nutrición:', error.message || error);
    return { success: false, message: error.message || 'Error al guardar metas' };
  }

  return { success: true, message: 'Metas guardadas exitosamente.' };
}

export async function addNutritionEntry(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString();

  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuario no autenticado' };
  }

  const meal_type = String(formData.get('meal_type') || 'desayuno').toLowerCase();
  const description = String(formData.get('description') || '');
  const is_healthy = formData.get('is_healthy') === 'on' || formData.get('is_healthy') === 'true' || formData.get('is_healthy') === '1';

  const validTypes = ['desayuno', 'almuerzo', 'cena', 'snack'];
  if (!validTypes.includes(meal_type)) {
    return { success: false, message: 'Tipo de comida no válido' };
  }

  const { error } = await supabase.from('nutrition_entries').insert({
    user_id: user.id,
    entry_date: todayString,
    meal_type,
    description,
    is_healthy,
  });

  if (error) {
    console.error('Error inserting nutrition entry', error);
    return { success: false, message: error.message };
  }

  return { success: true };
}
