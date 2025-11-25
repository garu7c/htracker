'use server';

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';

import { 
    SleepEntry, 
    DailySleepProgress, 
    UserSleepGoals, 
    SleepSectionData 
} from '@/types/db'; 

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function calculateSleepDuration(start: string, end: string): number {
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    let startMinutes = timeToMinutes(start);
    let endMinutes = timeToMinutes(end);
    
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    return Math.round((durationMinutes / 60) * 10) / 10; 
}




// Obtener todos los datos del dashboard de sueño
export async function getSleepDashboardData(): Promise<SleepSectionData> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const todayString = getTodayDateString();

  // Obtener metas y racha de la tabla 'user_goals'
  const goalsPromise = supabase
    .from('user_goals') 
    .select('sleep_goal_hours, sleep_ideal_bed_time, sleep_ideal_wake_time, current_streak_sleep')
    .eq('user_id', user.id)
    .single();

  // Obtener el conteo de hoy de la tabla 'sleep_entries'
  const progressPromise = supabase
    .from('sleep_entries')
    .select('total_hours')
    .eq('user_id', user.id)
    .eq('sleep_date', todayString);

  // Historial reciente de la tabla 'sleep_entries'
  const historyPromise = supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('sleep_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  const [progressResult, historyResult, goalsResult] = await Promise.all([
    progressPromise,
    historyPromise,
    goalsPromise,
  ]);

  let sleepGoalHours = 8;
  let currentStreak = 0;
  let idealSleepTime = '22:30';
  let idealWakeTime = '06:30';

  if (goalsResult.data) {
    sleepGoalHours = goalsResult.data.sleep_goal_hours ?? 8;
    currentStreak = goalsResult.data.current_streak_sleep ?? 0;
    idealSleepTime = goalsResult.data.sleep_ideal_bed_time ?? '22:30';
    idealWakeTime = goalsResult.data.sleep_ideal_wake_time ?? '06:30';
  }

  const totalHoursToday = progressResult.data?.reduce((sum, entry) => sum + entry.total_hours, 0) ?? 0;

  const progress: DailySleepProgress = {
    current: Math.round(totalHoursToday * 10) / 10,
    goal: sleepGoalHours,
    streak: currentStreak,
  };

  const history: SleepEntry[] = (historyResult.data as SleepEntry[]) || [];
  
  const goals: UserSleepGoals = {
      target_hours: sleepGoalHours,
      bedtime_goal: idealSleepTime,
      wakeup_goal: idealWakeTime,
  };

  return { progress, history, goals };
}

//Registrar una nueva entrada de sueño
//Registrar una nueva entrada de sueño
export async function addSleepEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString();

  console.log('🖥️ [SERVIDOR] addSleepEntry llamado');
  console.log('📋 [SERVIDOR] FormData recibido:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value, '(tipo:', typeof value, ')');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ [SERVIDOR] Usuario no autenticado');
    return { success: false, message: 'Usuario no autenticado. Inicia sesión.' };
  }

  // CORREGIR: Usar los nombres correctos que vienen del formulario
  const timeSleep = formData.get('bedtime') as string;  // Cambiado de 'timeSleep' a 'bedtime'
  const timeWake = formData.get('wakeup') as string;    // Cambiado de 'timeWake' a 'wakeup'
  const quality = formData.get('quality') as SleepEntry['quality'];

  console.log('🔍 [SERVIDOR] Campos extraídos:', { 
    bedtime: timeSleep, 
    wakeup: timeWake, 
    quality 
  });

  if (!timeSleep || !timeWake || !quality) {
    console.error('❌ [SERVIDOR] Campos faltantes:', {
      bedtime: !!timeSleep,
      wakeup: !!timeWake, 
      quality: !!quality
    });
    return { success: false, message: 'Todos los campos (Hora de Dormir, Despertar, Calidad) son requeridos.' };
  }

  console.log('✅ [SERVIDOR] Validación pasada, calculando duración...');
  
  const totalHours = calculateSleepDuration(timeSleep, timeWake);
  
  console.log('⏱️ [SERVIDOR] Duración calculada:', totalHours, 'horas');
  
  if (totalHours <= 0) {
    console.error('❌ [SERVIDOR] Duración inválida:', totalHours);
    return { success: false, message: 'La hora de despertar debe ser posterior a la de dormir (considerando cruce de medianoche).' };
  }

  if (!['excelente', 'buena', 'regular', 'mala'].includes(quality.toLowerCase())) {
    console.error('❌ [SERVIDOR] Calidad inválida:', quality);
    return { success: false, message: 'Calidad de sueño no válida.' };
  }

  const newEntry: Omit<SleepEntry, 'id' | 'created_at'> = {
    user_id: user.id,
    sleep_date: todayString,
    time_sleep: timeSleep,
    time_wake: timeWake,
    total_hours: totalHours,
    quality: quality.toLowerCase(),
  };

  console.log('💾 [SERVIDOR] Insertando en BD:', newEntry);

  const { error } = await supabase
    .from('sleep_entries')
    .insert(newEntry);

  if (error) {
    console.error('❌ [SERVIDOR] Error de Supabase:', error);
    return { success: false, message: `Error en la base de datos: ${error.message}` };
  }

  console.log('✅ [SERVIDOR] Registro insertado exitosamente');
  return { success: true, message: 'Período de sueño registrado exitosamente.' };
}

//Guardar las metas de sueño del usuario
export async function saveUserSleepGoals({ sleepGoalHours, idealSleepTime, idealWakeTime }: {
  sleepGoalHours: number,
  idealSleepTime: string,
  idealWakeTime: string,
}): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuario no autenticado' };
  }

  const goalUpdate = {
    user_id: user.id, 
    sleep_goal_hours: sleepGoalHours, 
    sleep_ideal_bed_time: idealSleepTime, 
    sleep_ideal_wake_time: idealWakeTime,  
  };

  const { error } = await supabase
    .from('user_goals') 
    .upsert(goalUpdate, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Error al guardar metas de sueño:', error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Metas de sueño guardadas exitosamente.' };
}