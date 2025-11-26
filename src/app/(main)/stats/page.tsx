'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { getTexts } from '@/lib/i18n';
import ExercisesCard from './components/ExercisesCard';
import HydrationCard from './components/HydrationCard';
import SleepCard from './components/SleepCard';
import NutritionCard from './components/NutritionCard';
import ExerciseAreaChart from './components/OverallAreaChart';
import OverallRadialChart from './components/OverallRadialChart';
import Calendar from './components/Calendar';
import DayActivities from './components/DayActivities';

export const dynamic = 'force-dynamic';

export default function StatsPage() {
  const t = getTexts();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error('Failed to get user:', error);
          setUserId(null);
        } else {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            Error: Could not load user. Please log in again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    // Main Grid Layout - Ahora incluye el HERO en la cuadrícula principal
    // Utiliza una cuadrícula de 4 columnas en XL: Contenido (3/4) y Sidebar (1/4)
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
      
      {/* ------------------------------------------------------------- */}
      {/* Left Column - Main Content (Ocupa 3/4) */}
      {/* ------------------------------------------------------------- */}
      <div className="xl:col-span-3 space-y-6">

        {/* 1. HERO Section (Header) */}
        <div className="bg-gradient-to-r from-fuchsia-700 to-indigo-500 rounded-xl shadow-sm border border-gray-200 p-6 min-h-[200px]">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">{t.pages.stats.title}</h1>
          <p className="mt-2 text-gray-100 text-base">{t.pages.stats.description}</p>
        </div>

        {/* 2. Gráfico de Áreas (ExerciseAreaChart) */}
        <div>
          <ExerciseAreaChart userId={userId} />
        </div>

        {/* 3. Gráficos Radiales Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radial Chart - Progreso General (Radal chart mostrando el progreso de todas las actividades el día de hoy) */}
          <div>
            <OverallRadialChart userId={userId} />
          </div>

          {/* Tarjetas de Estadísticas (Stacked Radials) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <ExercisesCard userId={userId} />
            </div>
            <div>
              <NutritionCard userId={userId} />
            </div>
            <div>
              <SleepCard userId={userId} />
            </div>
            <div>
              <HydrationCard userId={userId} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Right Column - Sidebar (Ocupa 1/4 - Se extiende a lo largo) */}
      {/* ------------------------------------------------------------- */}
      <div className="xl:col-span-1 space-y-6 flex flex-col">
        
        {/* Calendar */}
        <div>
          <Calendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
        </div>

        {/* Day Activities - Últimas 5 actividades registradas */}
        {/* 'flex-grow' hace que este contenedor ocupe el espacio restante, llegando hasta abajo */}
        <div>
          <DayActivities userId={userId} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}