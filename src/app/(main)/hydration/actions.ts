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
  
  console.log('📊 [SERVER] Obteniendo datos del dashboard para usuario:', user.id);
  
  const entriesPromise = supabase
    .from('hydration_entries')
    .select('id, quantity, created_at, entry_date, beverage_type')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .order('created_at', { ascending: false });

  const historyPromise = supabase
    .from('hydration_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const goalsPromise = supabase
    .from('user_goals')
    .select('hydration_goal_cups')
    .eq('user_id', user.id)
    .single();

  const [entriesResult, historyResult, goalsResult] = await Promise.all([
    entriesPromise,
    historyPromise,
    goalsPromise,
  ]);

  // Log para debug
  console.log('📊 [SERVER] Resultados - Entries:', entriesResult.data?.length, 'History:', historyResult.data?.length, 'Goals:', goalsResult.data);

  const cupsGoal = (goalsResult.data && (goalsResult.data.hydration_goal_cups ?? 8)) || 8;

  const entries = (entriesResult.data ?? []) as Array<{ quantity?: number }>;
  const totalCupsToday = entries.reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);

  console.log('📊 [SERVER] Total vasos hoy:', totalCupsToday, 'Meta:', cupsGoal);

  const progress = {
    current: totalCupsToday,
    goal: cupsGoal,
    streak: 0,
  };

  const history = (historyResult.data ?? []) as any[];

  return { progress, history };
}

export async function getUserHydrationGoals(): Promise<HydrationGoals> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('user_id, hydration_goal_cups')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.log('🎯 [SERVER] No se encontraron metas, usando valor por defecto: 8');
      return { user_id: user.id, cups_per_day: 8 };
    }

    console.log('🎯 [SERVER] Metas encontradas:', data.hydration_goal_cups);
    return { user_id: data.user_id, cups_per_day: data.hydration_goal_cups ?? 8 } as HydrationGoals;
  } catch (e) {
    console.error('🎯 [SERVER] Error obteniendo metas:', e);
    return { user_id: user.id, cups_per_day: 8 };
  }
}

export async function saveUserHydrationGoals(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const supabase = createServerSupabaseClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Usuario no autenticado' };

  const cups = Number(formData.get('cups_per_day') || 8);
  console.log('💾 [SERVER] Guardando meta de vasos:', cups, 'para usuario:', user.id);

  const payload = {
    user_id: user.id,
    hydration_goal_cups: cups,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_goals').upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ [SERVER] Error guardando metas de hidratación:', error);
    return { success: false, message: error.message || 'Error al guardar metas' };
  }

  console.log('✅ [SERVER] Metas guardadas exitosamente');
  return { success: true, message: 'Metas guardadas exitosamente.' };
}

export async function addHydrationEntry(formData: FormData): Promise<{ success: boolean; message?: string }> {
  console.log('🚀 [SERVER] addHydrationEntry iniciada');
  
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ [SERVER] Error de autenticación:', authError);
      return { success: false, message: 'Error de autenticación' };
    }
    
    if (!user) {
      console.error('❌ [SERVER] Usuario no autenticado');
      return { success: false, message: 'Usuario no autenticado' };
    }

    console.log('👤 [SERVER] Usuario autenticado:', user.id);

    const cupsValue = formData.get('cups');
    const cups = Number(cupsValue || 1);
    
    console.log('🥤 [SERVER] Vasos recibidos:', cups, 'valor original:', cupsValue);

    if (isNaN(cups) || cups <= 0) {
      console.error('❌ [SERVER] Número de vasos inválido:', cups);
      return { success: false, message: 'Número de vasos inválido' };
    }

    // PAYLOAD SIMPLIFICADO - SOLO VASOS
    const payload = {
      user_id: user.id,
      entry_date: todayString,
      beverage_type: 'water',
      quantity: cups,
    };

    console.log('📝 [SERVER] Insertando en BD:', payload);

    const { data, error } = await supabase
      .from('hydration_entries')
      .insert(payload)
      .select();

    console.log('📡 [SERVER] Respuesta de Supabase - error:', error, 'data:', data);

    if (error) {
      console.error('❌ [SERVER] Error insertando en hydration_entries:', error);
      
      // Mensajes de error más específicos
      if (error.code === '23505') {
        return { success: false, message: 'Entrada duplicada' };
      } else if (error.code === '42501') {
        return { success: false, message: 'Sin permisos para escribir en la tabla' };
      } else {
        return { 
          success: false, 
          message: `Error de base de datos: ${error.message}` 
        };
      }
    }

    console.log('✅ [SERVER] Inserción exitosa, ID:', data?.[0]?.id);
    return { 
      success: true, 
      message: `${cups} vaso(s) registrado(s) correctamente.` 
    };

  } catch (e: any) {
    console.error('💥 [SERVER] Error inesperado en addHydrationEntry:', e);
    return { 
      success: false, 
      message: `Error interno: ${e?.message || 'Error inesperado al registrar'}` 
    };
  }
}