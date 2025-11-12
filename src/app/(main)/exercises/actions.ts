/*'use server';

import { createServerSupabaseClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import { ExerciseSectionData, DailyProgress, ExerciseEntry } from '@/types/db';

function getTodayDateString(): string {
  // Obtenemos la fecha actual en Costa Rica (UTC-6)
  // Nota: El servidor (Vercel) puede estar en UTC. Ajustar la zona horaria es importante.
  // Por simplicidad, usaremos la fecha del servidor, pero en producción esto
  // debería ajustarse a la zona horaria del usuario.
  const today = new Date();
  return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}



export async function fetchExerciseData(): Promise<ExerciseSectionData> {
  const supabase = createServerSupabaseClient();

  // 1. Obtener el usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Definir la meta de hoy (eventualmente, esto vendrá de la DB)
  const GOAL = 3;
  const todayString = getTodayDateString();

  // 2. Crear las promesas para las consultas
  
  // Promesa para obtener el conteo de hoy
  const progressPromise = supabase
    .from('exercise_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('entry_date', todayString);

  // Promesa para el historial reciente
  const historyPromise = supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Promesa para calcular la racha (consulta compleja)
  // Obtenemos las fechas únicas de los últimos 90 días (por eficiencia)
  const streakPromise = supabase
    .from('exercise_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .gte('entry_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  // 3. Ejecutar todas las consultas en paralelo
  const [progressResult, historyResult, streakResult] = await Promise.all([
    progressPromise,
    historyPromise,
    streakResult
  ]);

  // 4. Procesar el progreso
  const progress: DailyProgress = {
    current: progressResult.count ?? 0,
    goal: GOAL,
    streak: 0, // Se calculará a continuación
  };

  // 5. Procesar el historial
  const history: ExerciseEntry[] = historyResult.data || [];

  // 6. Procesar la racha (streak)
  if (streakResult.data) {
    // Filtrar fechas duplicadas
    const uniqueDates = [...new Set(streakResult.data.map(e => e.entry_date))];
    
    let currentStreak = 0;
    let today = new Date(todayString + 'T00:00:00'); // Fecha de hoy (local)

    // Comprobar si 'hoy' está en las fechas
    if (uniqueDates.includes(todayString)) {
      currentStreak = 1;
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Iterar hacia atrás día por día
      for (let i = 1; i < uniqueDates.length; i++) {
        const yesterdayString = yesterday.toISOString().split('T')[0];
        if (uniqueDates.includes(yesterdayString)) {
          currentStreak++;
          yesterday.setDate(yesterday.getDate() - 1); // Moverse un día más atrás
        } else {
          break; // La racha se rompió
        }
      }
    } else {
      // Si no hizo ejercicio hoy, la racha es 0 (o podríamos comprobar si hizo ayer)
      // Para esta app, si no hizo hoy, la racha se reinicia.
      currentStreak = 0;
    }
    progress.streak = currentStreak;
  }

  // 7. Devolver los datos combinados
  return { progress, history };
}



export async function addExerciseEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createServerSupabaseClient();
  const todayString = getTodayDateString();

  // 1. Obtener el usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuario no autenticado. Inicia sesión.' };
  }

  // 2. Extraer datos del formulario
  // Usamos los 'name' de los inputs
  const exerciseType = formData.get('exerciseType') as string;
  const duration = formData.get('duration') as string;
  const intensity = formData.get('intensity') as string;

  // 3. Validar datos
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

  // 4. Crear el objeto para Supabase
  const newEntry = {
    user_id: user.id,
    entry_date: todayString, // La fecha de hoy
    exercise_type: exerciseType,
    duration_minutes: durationMinutes,
    intensity: intensity,
    // 'id' y 'created_at' son manejados por la DB
  };

  // 5. Insertar en la base de datos
  const { error } = await supabase
    .from('exercise_entries')
    .insert(newEntry);

  // 6. Manejar errores de inserción
  if (error) {
    console.error('Error al insertar ejercicio:', error.message);
    return { success: false, message: `Error en la base de datos: ${error.message}` };
  }

  // 7. Retornar éxito
  return { success: true, message: 'Ejercicio registrado exitosamente.' };
}*/