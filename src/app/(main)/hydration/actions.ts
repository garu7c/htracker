"use server";

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import type { HydrationSectionData, HydrationGoals } from '@/types/db';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getHydrationDashboardData(): Promise<HydrationSectionData> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getTodayDateString();

  const progressPromise = supabase
    .from('hydration_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('entry_date', today);

  const historyPromise = supabase
    .from('hydration_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const goalsPromise = supabase
    .from('user_hydration_goals')
    .select('ml_per_day')
    .eq('user_id', user.id)
    .single();

  const [progressResult, historyResult, goalsResult] = await Promise.all([
    progressPromise,
    historyPromise,
    goalsPromise,
  ]);

  const mlGoal = (goalsResult.data && (goalsResult.data.ml_per_day ?? 2000)) || 2000;

  const progress = {
    current: progressResult.count ?? 0,
    goal: Math.round(mlGoal / 250), // assuming entries are ~250ml cups
    streak: 0,
  };

  const history = (historyResult.data ?? []) as any[];

  return { progress, history };
}

export async function getUserHydrationGoals(): Promise<HydrationGoals> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('user_hydration_goals')
    .select('user_id, ml_per_day')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { user_id: user.id, ml_per_day: 2000 };
  }

  return data as HydrationGoals;
}

export async function saveUserHydrationGoals(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) return;

  const ml = Number(formData.get('ml_per_day') || 2000);

  const { error } = await supabase.from('user_hydration_goals').upsert({
    user_id: user.id,
    ml_per_day: ml,
  }, { onConflict: 'user_id' });

  if (error) throw error;
}
